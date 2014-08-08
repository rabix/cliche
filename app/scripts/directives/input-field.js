'use strict';

angular.module('clicheApp')
    .directive('inputField', ['$templateCache', '$compile', 'RecursionHelper', function ($templateCache, $compile, RecursionHelper) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/input-field.html'),
            scope: {
                model: '=ngModel',
                prop: '=',
                key: '@',
                form: '='
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement) {
                    scope.view = {};

                    uniqueId++;
                    scope.view.uniqueId = uniqueId;
                    console.log(scope.prop);

                    var inputScheme;

                    if (scope.prop.type === 'file') {
                        inputScheme = {path: (scope.model && scope.model.path ? scope.model.path : scope.model)};
                    } else if(scope.prop.type === 'object') {
                        inputScheme = _.isObject(scope.model) ? scope.model : {};
                    } else {
                        inputScheme = scope.model;
                    }

                    scope.view.input = inputScheme;

                    var template = $templateCache.get('views/inputs/input-' + scope.prop.type  + '.html');

                    iElement.append(template);

                    $compile(iElement.contents())(scope);

                    scope.$watch('view.input', function(n, o) {
                        if (n !== o) {
                            scope.model = n;
                        }
                    }, true);

                });
            }
        };
    }]);