'use strict';

angular.module('clicheApp')
    .controller('HomeCtrl', ['$scope', '$timeout', '$document', 'Header', function ($scope, $timeout, $document, Header) {

        Header.setActive('home');

        $scope.view = {};
        $scope.forms = {};

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

        /* tool form obj */
        $scope.view.toolForm = {
            softwareDescription: 'Software Description',
            documentAuthor: 'Document Author',
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
                    mem: 0,
                    ports: 0,
                    diskSpace: 0,
                    network: 'no'
                },
                platformFeatures: {
                    'transforms/strip_ext': true,
                    'transforms/m-nesto': false,
                    'feature/directories': true
                }
            },
            inputs: {
                type: 'object',
                required: ['reference', 'reads'],
                properties: {
                    reference: {
                        type: 'file',
                        adapter: {
                            order: 2,
                            transform: 'transforms/strip_ext'
                        }
                    },
                    reads: {
                        type: 'array',
                        minItems: 1,
                        maxItems: 2,
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
                            separator: 'space'
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
                            separator: 'comma'
                        }
                    }
                }
            }
        };

        /* add additional prop attributes */
        _.each($scope.view.toolForm.inputs.properties, function(prop, key) {
            prop.required = _.contains($scope.view.toolForm.inputs.required, key);
            prop.isEnum = prop.type === 'string' && prop.enum;
        });

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

            $scope.setStep('define-job');

        };

        /* job form obj */
        $scope.view.jobForm = {
            inputs: {}
        };

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
        };

        $scope.view.transforms = [];

        _.each($scope.view.toolForm.requirements.platformFeatures, function(value, key) {
            if (value) {
                $scope.view.transforms.push(key)
            }
        });

        /**
         * Toggle transforms list
         * @param transform
         */
        $scope.toggleTransformsList = function(transform) {

            if ($scope.view.toolForm.requirements.platformFeatures[transform]) {
                $scope.view.transforms.push(transform);
            } else {
                _.remove($scope.view.transforms, function(transformStr) {
                    return transform === transformStr;
                });
            }
        };

        /**
         * Toggle properties visibility (expand/collapse)
         */
        $scope.toggleProperties = function() {
            $scope.view.propsExpanded = !$scope.view.propsExpanded;
            _.each($scope.view.toolForm.inputs.properties, function(prop) {
                prop.active = $scope.view.propsExpanded;
            });
        };


    }]);
