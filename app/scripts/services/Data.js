"use strict";

angular.module('clicheApp')
    .factory('Data', ['$localForage', '$http', '$q', function ($localForage, $http, $q) {

        var self = {};

        /**
         * Tool json object
         * @type {object}
         */
        self.tool = {};

        /**
         * Job json object
         * @type {object}
         */
        self.job = null;

        /**
         * Fetch tool object from storage
         * @returns {*}
         */
        self.fetchTool = function() {

            var deferred = $q.defer();

            $localForage.getItem('tool').then(function(tool) {
                if (_.isNull(tool) || _.isEmpty(tool)) {
                    $http({method: 'GET', url: 'data/tool.json'})
                        .success(function(data) {
                            self.tool = data.tool;
                            deferred.resolve(data.tool);
                            $localForage.setItem('tool', data.tool);
                        })
                        .error(function() {
                            deferred.reject('JSON file could not be fetched')
                        });
                } else {
                    self.tool = tool;
                    deferred.resolve(tool);
                }
            });

            return deferred.promise;

        };

        /**
         * Fetch job object from storage
         * @returns {*}
         */
        self.fetchJob = function() {

            var deferred = $q.defer();

            $localForage.getItem('job').then(function(job) {
                if (_.isNull(job) || _.isEmpty(job)) {
                    $http({method: 'GET', url: 'data/job.json'})
                        .success(function(data) {
                            self.job = data.job;
                            deferred.resolve(data.job);
                            $localForage.setItem('job', data.job);
                        })
                        .error(function() {
                            deferred.reject('JSON file could not be fetched')
                        });
                } else {
                    self.job = job;
                    deferred.resolve(job);
                }
            });

            return deferred.promise;

        };

        /**
         * Save tool and job json
         *
         * @returns {*}
         */
        self.save = function() {

            var deferred = $q.defer();

            $q.all([
                $localForage.setItem('tool', self.tool),
                $localForage.setItem('job', self.job)
            ]).then(function() {
                deferred.resolve();
            });

            return deferred.promise;
        };

        /**
         * Add new property
         *
         * @param type
         * @param name
         * @param prop
         */
        self.addProperty = function(type, name, prop) {

            switch (type) {
                case 'input':
                    self.tool.inputs.properties[name] = prop;
                    break;
                case 'output':
                    self.tool.outputs.properties[name] = prop;
                    break;
                case 'arg':
                    self.tool.adapter.args.push(prop);
                    break;
            }

        };

        /**
         * Delete property from the object
         *
         * @param type
         * @param index
         */
        self.deleteProperty = function(type, index) {

            switch (type) {
                case 'input':
                    delete self.tool.inputs.properties[index];
                    break;
                case 'output':
                    delete self.tool.outputs.properties[index];
                    break;
                case 'arg':
                    self.tool.adapter.args.splice(index, 1);
                    break;
            }

        };

        /**
         * Apply the transformation function (this is just the mock)
         *
         * @param transform
         * @param value
         * @returns {*}
         */
        self.applyTransform = function(transform, value) {

            var output;

            switch(transform) {
                case 'transforms/strip_ext':
                    var tmp = value.split('.');
                    if (tmp[0]) { output = tmp[0]; }
                    break;
                case 'transforms/m-suffix':
                    output = value + 'M';
                    break;
                default:
                    output = value;
            }

            return output;
        };

        /**
         * Generate the command
         */
        self.generateCommand = function() {

            var props = [];
            var args = [];
            var command = [];

            _.each(self.tool.inputs.properties, function(property, key) {
                if (!_.isUndefined(self.job.inputs[key])) {

                    var value;
                    var prefix = (_.isUndefined(property.adapter.prefix)) ? '' : property.adapter.prefix;
                    var separator = (_.isUndefined(property.adapter.separator) || property.adapter.separator === '_') ? ' ' : property.adapter.separator;

                    if (_.isUndefined(property.adapter.listSeparator) || property.adapter.listSeparator === '_') {
                        property.adapter.listSeparator = ' ';
                    }

                    if (property.type === 'array') {

                        var joiner = property.adapter.listSeparator === 'repeat' ? ' ' + prefix + separator : property.adapter.listSeparator;
                        var tmp = [];

                        _.each(self.job.inputs[key], function(val) {
                            var value = _.isObject(val) ? val.path : val;
                            tmp.push(self.applyTransform(property.adapter.listTransform, value));
                        });

                        value = tmp.join(joiner);

                    } else if (property.type === 'file') {

                        value = self.applyTransform(property.adapter.transform, self.job.inputs[key].path);

                    } else {

                        value = self.applyTransform(property.adapter.transform, self.job.inputs[key]);

                    }

                    props.push(_.merge({key: key, order: property.adapter.order, value: value, prefix: prefix, separator: property.adapter.separator}, property));
                }
            });

            _.each(self.tool.adapter.args, function(arg, key) {

                var prefix = (_.isUndefined(arg.prefix)) ? '' : arg.prefix;

                args.push(_.merge({key: 'arg' + key, order: arg.order, prefix: prefix}, arg));
            });

            var joined = _.sortBy(props.concat(args), 'order');

            _.each(joined, function(arg) {

                var separator = (_.isUndefined(arg.separator) || arg.separator === '_') ? ((arg.prefix === '') ? '' : ' ') : ((arg.prefix === '') ? '' : arg.separator);
                var value = _.isUndefined(arg.value) ? '' : arg.value;

                command.push(arg.prefix + separator + value);
            });

            var output = self.tool.adapter.baseCmd.join(' ') + ' ' +
                command.join(' ') +
                ' > ' + self.tool.adapter.stdout;


            return output;
        };

        return self;


    }]);