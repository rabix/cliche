'use strict';

angular
    .module('clicheApp', [
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ui.bootstrap',
        'ngPrettyJson'
    ])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push('HTTPInterceptor');
    }]);
