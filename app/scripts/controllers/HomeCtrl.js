'use strict';

angular.module('clicheApp')
    .controller('HomeCtrl', ['$scope', '$timeout', '$document', '$modal', '$templateCache', 'Data', function ($scope, $timeout, $document, $modal, $templateCache, Data) {

        $scope.view = {};
        $scope.forms = {};

        $scope.view.tab = 'general';
        $scope.view.trace = 'tool';
        $scope.view.showTrace = true;

        $scope.view.tabViewPath = 'views/tabs/general.html';

        $scope.view.propsExpanded = {
            inputs: false,
            outputs: false,
            args: false
        };

        $scope.view.active = {
            inputs: {},
            outputs: {},
            args: {}
        };

        /* tool form obj */
        $scope.view.toolForm = Data.tool;

        /* job form obj */
        $scope.view.jobForm = Data.job;

        /* generate valuesFrom array */
        $scope.view.valuesFrom = {};
        _.each($scope.view.jobForm.allocatedResources, function(value, key) {

            $scope.view.valuesFrom['#allocatedResources/' + key] = value;

            $scope.$watch('view.toolForm.requirements.resources.'+key, function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.view.jobForm.allocatedResources[key] = newVal;
                    $scope.view.valuesFrom['#allocatedResources/' + key] = newVal;
                }
            });

        });

        /* add additional prop attributes */
        _.each($scope.view.toolForm.inputs.properties, function(prop, key) {

            if (_.isUndefined(prop.adapter.separator)) {
                prop.adapter.separator = '_';
            }
            if (_.isUndefined(prop.adapter.listSeparator)) {
                prop.adapter.listSeparator = 'repeat';
            }
        });

        /* add additional args attributes */
        _.each($scope.view.toolForm.adapter.args, function(arg) {
            if (_.isUndefined(arg.separator)) {
                arg.separator = '_';
            }
            if (!_.isUndefined(arg.valueFrom)) {
                arg.value = $scope.view.valuesFrom[arg.valueFrom];
            }
        });

        /* prepare transforms */
        $scope.view.transforms = {
            'transforms/strip_ext': false,
            'transforms/m-suffix': false
        };
        _.each($scope.view.toolForm.requirements.platformFeatures, function(transform) {
            $scope.view.transforms[transform] = true;
        });

        /**
         * Toggle transforms list
         * @param transform
         */
        $scope.toggleTransformsList = function(transform) {

            if (_.contains($scope.view.toolForm.requirements.platformFeatures, transform)) {
                _.remove($scope.view.toolForm.requirements.platformFeatures, function(transformStr) {
                    return transform === transformStr;
                });
            } else {
                $scope.view.toolForm.requirements.platformFeatures.push(transform);
            }
        };


        /**
         * Toggle properties visibility (expand/collapse)
         * @param {string} tab
         */
        $scope.toggleProperties = function(tab) {

            $scope.view.propsExpanded[tab] = !$scope.view.propsExpanded[tab];

            var props = (tab !== 'args') ? $scope.view.toolForm[tab].properties : $scope.view.toolForm.adapter.args;

            _.each(props, function(value, key) {
                $scope.view.active[tab][key] = $scope.view.propsExpanded[tab];
            });
        };

        /**
         * Switch the tab
         * @param tab
         */
        $scope.switchTab = function(tab) {
            $scope.view.tab = tab;
            $scope.view.tabViewPath = 'views/tabs/' + tab + '.html';
        };

        var watchers = [];

        /**
         * Turn on deep watch when console tab is visible
         */
        var turnOnDeepWatch = function() {

            console.log('turnOnDeepWatch');

            $scope.view.command = Data.generateCommand();

            var watch = ['view.jobForm.inputs', 'view.toolForm.inputs.properties', 'view.toolForm.adapter'];

            _.each(watch, function(arg) {
                var watcher = $scope.$watch(arg, function(n, o) {
                    if (n !== o) {
                        console.log('watcher:'+ arg);
                        $scope.view.command = Data.generateCommand();
                    }
                }, true);
                watchers.push(watcher);
            });

        };

        /**
         * Turn off deep watch when console tab is hidden
         */
        var turnOffDeepWatch = function() {

            console.log('turnOffDeepWatch');

            _.each(watchers, function(watcher) {
                if (_.isFunction(watcher)) {
                    watcher.call();
                }
            });

            watchers = [];
        };

        /**
         * Switch the trace tab
         * @param tab
         */
        $scope.switchTrace = function(tab) {
            $scope.view.trace = tab;

            if (tab === 'console') {
                turnOnDeepWatch();
            } else {
                turnOffDeepWatch();
            }

        };

        /**
         * Toggle trace visibility
         */
        $scope.toggleTrace = function() {
            $scope.view.showTrace = !$scope.view.showTrace;

            if ($scope.view.showTrace) {
                if ($scope.view.trace === 'console') turnOnDeepWatch();
            } else {
                if ($scope.view.trace === 'console') turnOffDeepWatch();
            }
        };

        /**
         * Show the modal for adding property items
         * @param type
         * @param e
         */
        $scope.addItem = function(type, e) {

            e.stopPropagation();

            $modal.open({
                template: $templateCache.get('views/partials/add-property-' + type + '.html'),
                controller: 'AddPropertyCtrl',
                windowClass: 'modal-prop',
                resolve: {
                    options: function () {
                        return {
                            type: type,
                            platformFeatures: $scope.view.toolForm.requirements.platformFeatures,
                            valuesFrom: $scope.view.valuesFrom
                        };
                    }
                }
            });

        };

    }]);
