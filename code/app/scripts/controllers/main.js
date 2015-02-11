/*global angular */
/*jslint plusplus:true */

'use strict';

/**
 * @ngdoc function
 * @name arbetsprov1114App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the arbetsprov1114App
 */

angular.module('arbetsprov1114App').controller('MainCtrl', function ($scope, $http) {

	$scope.getTrack = function (val) {
		return $http.get('http://ws.spotify.com/search/1/track.json?', {
			params: {
				q: val
			}
		}).then(function (response) {

			// Create vars
			var tracks = [],
				i;

			// Loop through each track in response
			for (i = 0; i < 10; i++) {
				// Weird spotify api returning undefined at
				// seemingly random, not sure why at this point
				if (response.data.tracks[i] === undefined) {
					return false;
				} else {
					// Push track into tracks array
					tracks.push(response.data.tracks[i]);
				}
			}
			return tracks;
		});
	};

	// Create playlist array
	$scope.playlist = [];

	// When selecting a search reasult
	$scope.onSelect = function ($label) {

		// Push selected result to playlist array
		$scope.playlist.push({
			track: $label,
			date: new Date()
		});

		// Clear input value on select
		$scope.asyncSelected = '';

	};

});