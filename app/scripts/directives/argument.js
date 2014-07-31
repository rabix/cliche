'use strict';

angular.module('clicheApp')
    .directive('argument', ['$templateCache', function ($templateCache) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/argument.html'),
            scope: {
                name: '@',
                arg: '=ngModel',
                active: '=',
                form: '=',
                valuesFrom: '='
            },
            link: function(scope) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;

                if (!_.isUndefined(scope.arg.valueFrom)) {
                    scope.arg.value = scope.valuesFrom[scope.arg.valueFrom];
                }

                /**
                 * Toggle argument box visibility
                 */
                scope.toggleArgument = function() {
                    scope.active = !scope.active;
                };

                /**
                 * Update the value if value from is changed
                 */
                scope.changeValueFrom = function() {
                    scope.arg.value = scope.valuesFrom[scope.arg.valueFrom];
                };

            }
        };
    }]);