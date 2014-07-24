"use strict";

angular.module('clicheApp')
    .factory('Api', ['$resource', '$http', '$q', '$cacheFactory', function ($resource, $http, $q, $cacheFactory) {

        var cache = $cacheFactory('user');
        cache.put('user', {});

        var apiUrl = '';

        var api = {};

        // TODO uncomment later when api ready
        //api.user = $resource(apiUrl + '/user');

        api.user = {
            get: function() {

                var deferred = $q.defer();
                var user = cache.get('user');

                deferred.resolve(user);

                return {$promise: deferred.promise};
            },
            login: function(email, password) {

                var deferred = $q.defer();
                var error = _.random(0, 1);

                if (error) {
                    deferred.reject('Email or password is wrong, please try again.');
                } else {
                    var user = {email: email, name: 'Test User'};

                    cache.put('user', user);

                    deferred.resolve(user);
                }

                return {$promise: deferred.promise};
            },
            logout: function() {

                var deferred = $q.defer();

                cache.put('user', {});

                deferred.resolve();

                return {$promise: deferred.promise};
            },
            restart: function() {

                var deferred = $q.defer();
                var error = _.random(0, 1);

                if (error) {
                    deferred.reject('There was a problem while restarting Cliche, please try again.');
                } else {
                    deferred.resolve();
                }

                return {$promise: deferred.promise};

            }
        };

        api.token = $resource(apiUrl + '/token', {}, {
            generate: {method: 'POST'},
            revoke: {method: 'DELETE'}
        });


        return api;


    }]);