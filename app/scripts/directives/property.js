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
                form: '=',
                requiredInputs: '=',
                transforms: '='
            },
            link: function(scope) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;

                /**
                 * Toggle property box visibility
                 */
                scope.toggleProperty = function() {
                    scope.prop.active = !scope.prop.active;
                };

            }
        };
    }]);