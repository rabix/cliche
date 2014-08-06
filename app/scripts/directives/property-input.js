'use strict';

angular.module('clicheApp')
    .directive('propertyInput', ['$templateCache', '$modal', 'Data', 'RecursionHelper', function ($templateCache, $modal, Data, RecursionHelper) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/property-input.html'),
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                transforms: '=',
                properties: '=',
                platformFeatures: '=',
                valuesFrom: '=',
                form: '='
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope) {

                    scope.view = {};

                    uniqueId++;
                    scope.view.uniqueId = uniqueId;
                    scope.view.isEnum = _.isArray(scope.prop.enum);

                    scope.view.propsExpanded = [];
                    scope.view.active = {};

                    /**
                     * Toggle properties visibility (expand/collapse)
                     */
                    scope.toggleProperties = function() {

                        scope.view.propsExpanded = !scope.view.propsExpanded;

                        _.each(scope.prop.properties, function(value, key) {
                            scope.view.active[key] = scope.view.propsExpanded;
                        });
                    };

                    /**
                     * Toggle property box visibility
                     */
                    scope.toggleProperty = function() {
                        scope.active = !scope.active;
                    };


                    /**
                     * Toggle enum flag
                     */
                    scope.toggleEnum = function() {
                        if (scope.view.isEnum) {
                            scope.prop.enum = [''];
                        } else {
                            scope.prop.enum = null;
                        }
                    };

                    /**
                     * Remove particular property
                     * @param e
                     */
                    scope.removeItem = function(e) {

                        e.stopPropagation();

                        var modalInstance = $modal.open({
                            template: $templateCache.get('views/partials/confirm-delete.html'),
                            controller: 'ModalCtrl',
                            windowClass: 'modal-confirm',
                            resolve: {data: function () { return {}; }}
                        });

                        modalInstance.result.then(function () {
                            Data.deleteProperty('input', scope.name, scope.properties);
                        });
                    };

                    scope.$watch('prop.type', function(n, o) {
                        if (n !== o && n === 'object') {
                            if (_.isEmpty(scope.prop.properties)) {
                                scope.prop.properties = {};
                            }
                        }
                    });
                });
            }
        };
    }]);