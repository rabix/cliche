'use strict';

angular.module('clicheApp')
    .directive('inputField', ['$templateCache', '$compile', function ($templateCache, $compile) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/input-field.html'),
            scope: {
                input: '=ngModel',
                prop: '=',
                key: '@',
                form: '='
            },
            link: function(scope, element) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;

                var template = $templateCache.get('views/inputs/input-' + scope.prop.type  + '.html');

                element.append(template);

                $compile(element.contents())(scope);

            }
        };
    }]);