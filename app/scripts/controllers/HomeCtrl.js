'use strict';

angular.module('clicheApp')
    .controller('HomeCtrl', ['$scope', '$timeout', 'Header', 'User', function ($scope, $timeout, Header, User) {

        $scope.$parent.view.classes.push('home');

        Header.setActive('home');

        $scope.view = {};
        $scope.view.loading = true;

        User.getUser().then(function(user) {
            // TODO timeout will be removed later
            $timeout(function() {
                $scope.view.user = user;
                $scope.view.loading = false;
            }, 1000);
        });


    }]);
