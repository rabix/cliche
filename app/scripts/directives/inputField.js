'use strict';

angular.module('clicheApp')
    .directive('inputField', ['$templateCache', '$compile', function ($templateCache, $compile) {

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
            link: function(scope, element) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;

                var value = scope.model && scope.model.path ? scope.model.path : scope.model;
                var inputScheme = scope.prop.type === 'file' ? {path: value} : value;
                scope.view.input = inputScheme;

                var template = $templateCache.get('views/inputs/input-' + scope.prop.type  + '.html');

                element.append(template);

                $compile(element.contents())(scope);

                scope.$watch('view.input', function(n, o) {
                    if (n !== o) {
                        scope.model = n;
                    }
                }, true);

            }
        };
    }]);