'use strict';

/**
 * @ngdoc overview
 * @name yapp
 * @description
 * # yapp
 *
 * Main module of the application.
 */
var states = [
        { name: 'base', text: "Base", state: { visible: false, abstract: true, url: '', templateUrl: 'views/base.html' } },
        { name: 'login', text: "Login", state: { visible: false, url: '/login', parent: 'base', templateUrl: 'views/login.html', controller: 'LoginCtrl' } },
        { name: 'dashboard', text: "Dashboard", state: { visible: false, url: '/dashboard', parent: 'base', templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl' } },
        { name: 'overview', text: "Overview", state: { visible: true, url: '/overview', parent: 'dashboard', templateUrl: 'views/dashboard/overview.html' } },
        { name: 'reports', text: "Reports", state: { visible: true, url: '/reports', parent: 'dashboard', templateUrl: 'views/dashboard/reports.html' } },
        { name: 'logout', text: "Logout", state: { visible: true, url: '/login'} }
    ];
   
var yapp = angular.module('yapp', [
                                'ui.router',
                                'snap',
                                'ngAnimate'
                            ]);

yapp.value('states', states);

yapp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/dashboard', '/dashboard/overview');
    $urlRouterProvider.otherwise('/login');
    
    angular.forEach(states, function (state) {
        $stateProvider.state(state.name, state.state);
    });
});
