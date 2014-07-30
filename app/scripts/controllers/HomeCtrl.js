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

        /* job form obj */
        $scope.view.jobForm = {
            inputs: {},
            allocatedResources: {
                cpu: 4,
                mem: 3000,
                ports: [],
                diskSpace: 20000,
                network: 'No'
            }
        };

        /* add additional prop attributes */
        _.each($scope.view.toolForm.inputs.properties, function(prop, key) {
            prop.required = _.contains($scope.view.toolForm.inputs.required, key);
            prop.isEnum = prop.type === 'string' && prop.enum;
            if (_.isUndefined(prop.adapter.separator)) {
                prop.adapter.separator = '_';
            }
            if (_.isUndefined(prop.adapter.listSeparator)) {
                prop.adapter.listSeparator = 'repeat';
            }
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

            var props = [];
            _.each($scope.view.toolForm.inputs.properties, function(property, key) {
                props.push(_.merge({key: key, order: property.adapter.order}, property));
            });

            props = _.sortBy(props, 'order');


            $scope.view.command = [];
            _.each(props, function(property) {
                if (!_.isUndefined($scope.view.jobForm.inputs[property.key])) {

                    var value;

                    if (_.isUndefined(property.adapter.prefix)) {
                        property.adapter.prefix = '';
                    }

                    if (_.isUndefined(property.adapter.separator) || property.adapter.separator === '_') {
                        property.adapter.separator = ' ';
                    }

                    if (_.isUndefined(property.adapter.listSeparator) || property.adapter.listSeparator === '_') {
                        property.adapter.listSeparator = ' ';
                    }

                    if (property.type === 'array') {

                        var joiner = property.adapter.listSeparator === 'repeat' ? ' ' + property.adapter.prefix + property.adapter.separator : property.adapter.listSeparator;
                        var tmp = [];

                        _.each($scope.view.jobForm.inputs[property.key], function(val) {
                            tmp.push($scope.applyTransform(property.adapter.transform, val));
                        });

                        value = tmp.join(joiner);

                    } else if (property.type === 'file') {

                        value = $scope.applyTransform(property.adapter.transform, $scope.view.jobForm.inputs[property.key].path);

                    } else {

                        value = $scope.applyTransform(property.adapter.transform, $scope.view.jobForm.inputs[property.key]);

                    }

                    $scope.view.command.push(property.adapter.prefix + property.adapter.separator + value);

                }
            });

            $scope.view.command = $scope.view.command.join(' ');

            $scope.setStep('generate-command');

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

        $scope.view.propsExpanded = {
            inputs: false,
            outputs: false
        };
        /**
         * Toggle properties visibility (expand/collapse)
         * @param {string} tab
         */
        $scope.toggleProperties = function(tab) {
            $scope.view.propsExpanded[tab] = !$scope.view.propsExpanded[tab];
            _.each($scope.view.toolForm[tab].properties, function(prop) {
                prop.active = $scope.view.propsExpanded[tab];
            });
        };

        $scope.view.tab = 'inputs';
        $scope.switchTab = function(tab) {
            $scope.view.tab = tab;
        };


        /**
         * Apply the transformation function (this is just the mock)
         * @param transform
         * @param value
         * @returns {*}
         */
        $scope.applyTransform = function(transform, value) {

            var output;

            switch(transform) {
                case 'transforms/strip_ext':
                    var tmp = value.split('.');
                    if (tmp[0]) { output = tmp[0]; }
                    break;
                case 'transforms/m-nesto':
                    output = value;
                    break;
                case 'feature/directories':
                    output = value;
                    break;
                default:
                    output = value;
            }

            return output;
        };

    }]);
