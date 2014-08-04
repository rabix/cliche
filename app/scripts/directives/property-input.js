'use strict';

angular.module('clicheApp')
    .directive('propertyInput', ['$templateCache', '$modal', 'Data', function ($templateCache, $modal, Data) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/property-input.html'),
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                requiredInputs: '=',
                transforms: '=',
                form: '='
            },
            link: function(scope) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;
                scope.view.isEnum = _.isArray(scope.prop.enum);

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
                        Data.deleteProperty('input', scope.name);
                    });
                };

            }
        };
    }]);