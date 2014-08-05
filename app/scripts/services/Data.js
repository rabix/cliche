"use strict";

angular.module('clicheApp')
    .factory('Data', [function () {

        var self = {};

        self.tool = {
            softwareDescription: '',
            documentAuthor: 'author@gmail.com',
            requirements: {
                environment: {
                    container: {
                        type: 'docker',
                        uri: 'uri',
                        imageId: 'imageId'
                    }
                },
                resources: {
                    cpu: 0,
                    mem: 5000,
                    ports: [],
                    diskSpace: 0,
                    network: 'no'
                },
                platformFeatures: [
                    'transforms/strip_ext',
                    'transforms/m-suffix'
                ]
            },
            inputs: {
                type: 'object',
                properties: {
                    reference: {
                        type: 'file',
                        required: true,
                        adapter: {
                            order: 2,
                            transform: 'transforms/strip_ext'
                        }
                    },
                    reads: {
                        type: 'array',
                        minItems: 1,
                        maxItems: 2,
                        required: true,
                        items: {
                            type: 'file'
                        },
                        adapter: {
                            order: 3,
                            streamable: true
                        }
                    },
                    minimum_seed_length: {
                        type: 'integer',
                        adapter: {
                            order: 1,
                            prefix: '-m',
                            separator: '_'
                        }
                    },
                    min_std_max_min: {
                        type: 'array',
                        minItems: 1,
                        maxItems: 4,
                        items: {
                            type: 'number'
                        },
                        adapter: {
                            order: 1,
                            prefix: '-I',
                            listSeparator: ','
                        }
                    }
                }
            },
            outputs: {
                type: 'object',
                required: ['sam'],
                properties: {
                    sam: {
                        type: 'file',
                        adapter: {
                            streamable: true,
                            glob: 'output.sam'
                        }
                    }
                }
            },
            adapter: {
                baseCmd: ['bwa'],
                stdout: 'output.sam',
                args: [
                    {
                        order: 0,
                        value: 'mem'
                    },
                    {
                        order: 1,
                        prefix: '-t',
                        valueFrom: '#allocatedResources/cpu'
                    }
                ]
            }
        };

        self.job = {
            inputs: {},
            allocatedResources: {
                cpu: 4,
                mem: 3000,
                ports: [],
                diskSpace: 20000,
                network: 'No'
            }
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
                    output = 'M' + value;
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
                            tmp.push(self.applyTransform(property.adapter.listTransform, val));
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