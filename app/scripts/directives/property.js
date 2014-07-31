'use strict';

angular.module('clicheApp')
    .directive('property', ['$templateCache', function ($templateCache) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/property.html'),
            scope: {
                name: '@',
                type: '@',
                prop: '=ngModel',
                active: '=',
                form: '=',
                requiredInputs: '=',
                transforms: '='
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

            }
        };
    }]);