'use strict';

angular.module('clicheApp')
    .controller('MasterCtrl', ['$scope', '$interval', 'Data', function ($scope, $interval, Data) {

        $scope.view = {};
        $scope.view.classes = ['page'];
        $scope.view.saving = false;
        $scope.view.fetch = false;

        $scope.$on('classChange', function(event, classes) {
            $scope.view.classes = classes;
        });

        var saveIntervalId = $interval(function() {

            $scope.view.saving = true;

            Data.save().then(function() {
                $scope.view.saving = false;
            });

        }, 5000);

        $scope.$on('$destroy', function() {
            if (angular.isDefined(saveIntervalId)) {
                $interval.cancel(saveIntervalId);
                saveIntervalId = undefined;
            }
        });

        Data.checkStructure().then(function() {
            $scope.view.fetch = true;
        });

    }]);
