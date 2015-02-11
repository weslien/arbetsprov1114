'use strict';

/**
 * @ngdoc overview
 * @name arbetsprov1114App
 * @description
 * # arbetsprov1114App
 *
 * Main module of the application.
 */
angular
.module('arbetsprov1114App', [
	'ngAnimate',
	'ngCookies',
	'ngResource',
	'ngRoute',
	'ngSanitize',
	'ngTouch',
	'ui.bootstrap'
])
.config(function ($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/main.html',
		controller: 'MainCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});
