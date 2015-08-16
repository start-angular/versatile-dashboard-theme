'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('DashboardCtrl', function($scope, $state, states) {
    $scope.$state = $state;

    $scope.menuItems = [];
    angular.forEach(states, function (item) {
        if (item.state.visible) {
            $scope.menuItems.push({name: item.name, text: item.text});
        }
    });
  });
