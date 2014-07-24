'use strict';

angular.module('clicheApp')
    .controller('LoginCtrl', ['$scope', '$timeout', '$location', 'Header', 'User', function ($scope, $timeout, $location, Header, User) {

        $scope.$parent.view.classes.push('login');

        Header.setActive('home');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.user = {};
        $scope.view.error = '';

        User.getUser().then(function(user) {
            // TODO timeout will be removed later
            $timeout(function() {
                if (!_.isEmpty(user)) {
                    $location.path('/');
                }
                $scope.view.loading = false;
            }, 1000);
        });

        $scope.logIn = function() {

            $scope.form.$setDirty();

            if ($scope.form.$invalid) {
                return false;
            }

            User.logIn($scope.view.user.email, $scope.view.user.password)
                .then(function(user) {
                    User.setUser(user);
                    $location.path('/');
                }, function(error) {
                    $scope.view.error = error;
                });

        };


    }]);
