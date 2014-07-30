'use strict';

angular.module('clicheApp')
    .directive('enum', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/enum.html'),
            scope: {
                model: '=ngModel',
                type: '=',
                min: '=',
                max: '=',
                isRequired: '='
            },
            link: function(scope) {

                scope.list = [];

                if (!_.isArray(scope.model) && !isNaN(scope.min)) {
                    _.times(scope.min, function() {
                        scope.list.push({value: ''});
                    });
                } else {
                    _.each(scope.model, function(item) {
                        scope.list.push({value: item});
                    });
                }

                /**
                 * Add item to the list
                 */
                scope.addItem = function() {
                    if (scope.max && scope.list.length >= scope.max) {
                        return false;
                    } else {
                        scope.list.push({value: ''});
                    }
                };

                /**
                 * Remove item from the list
                 * @param index
                 */
                scope.removeItem = function(index) {
                    if (scope.min && scope.list.length <= scope.min) {
                        return false;
                    } else {
                        scope.list.splice(index, 1);
                    }
                };

                // TODO not really cool...
                scope.$watch('list', function(n, o) {
                    if (n !== o) {
                        scope.model = _.pluck(n, 'value');
                    }
                }, true);

            }
        };
    }]);