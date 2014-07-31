'use strict';

angular.module('clicheApp')
    .controller('HomeCtrl', ['$scope', '$timeout', '$document', 'Header', 'Data', function ($scope, $timeout, $document, Header, Data) {

        Header.setActive('home');

        $scope.view = {};
        $scope.forms = {};

        $scope.view.tab = 'general';
        $scope.view.trace = 'tool';

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
            prop.required = _.contains($scope.view.toolForm.inputs.required, key);

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
         * Set the appropriate step
         * @param step
         */
        $scope.setStep = function(step) {
            $scope.view.step = step;
            $scope.view.stepViewPath = 'views/steps/' + $scope.view.step + '.html';
        };

        /* init the step */
        $scope.setStep('define-tool');

        /**
         * Submit first step (define tool)
         * @returns {boolean}
         */
        $scope.toolFormSubmit = function() {

            $scope.forms.toolForm.$setDirty();

            if ($scope.forms.toolForm.$invalid) {
                var bodyContainer = angular.element($document[0].body)[0];
                bodyContainer.scrollTop = 0;
                return false;
            }

            $scope.view.command = Data.generateCommand();

            $scope.setStep('define-job');

        };

        //var toolFormWatcher;
        var jobFormWatcher;
        $scope.view.deepWatch = false;

        /**
         * Toggle deep watch
         */
        $scope.toggleDeepWatch = function() {
            $scope.view.deepWatch = !$scope.view.deepWatch;

            if ($scope.view.deepWatch) {

                $scope.view.command = Data.generateCommand();

//                toolFormWatcher = $scope.$watch('view.toolForm.adapter', function(n, o) {
//                    if (n !== o) {
//                        $scope.view.command = Data.generateCommand();
//                    }
//                }, true);

                jobFormWatcher = $scope.$watch('view.jobForm.inputs', function(n, o) {
                    if (n !== o) {
                        $scope.view.command = Data.generateCommand();
                    }
                }, true);

            } else {
                //toolFormWatcher();
                jobFormWatcher();
            }
        };

        /* init deep watch by default */
        $scope.toggleDeepWatch();

        /**
         * Submit second step (define job)
         * @returns {boolean}
         */
        $scope.jobFormSubmit = function() {

            $scope.forms.jobForm.$setDirty();

            if ($scope.forms.jobForm.$invalid) {
                var bodyContainer = angular.element($document[0].body)[0];
                bodyContainer.scrollTop = 0;
                return false;
            }

            $scope.view.command = Data.generateCommand();

        };

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
        };

        /**
         * Switch the trace tab
         * @param tab
         */
        $scope.switchTrace = function(tab) {
            $scope.view.trace = tab;
        };

    }]);
