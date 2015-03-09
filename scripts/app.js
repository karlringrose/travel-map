/* globals angular, Firebase */

'use strict';

(function() {
    var app = angular.module('TravelMap', ['firebase', 'leaflet-directive']);

    app.controller("MapController", ['$scope', '$firebaseArray', function ($scope, $firebaseArray) {
        var ref = new Firebase('https://travelmap.firebaseio.com/');

        $scope.mapData = {
            center: {
                lat: -25.165,
                lng: 134.648,
                zoom: 4
            },
            events: {
                map: {
                    enable: ['click'],
                    logic: 'emit'
                }
            },
            users: [],
            markers: {}
        };

        $scope.mapData.markers = $firebaseArray(ref);

        $scope.mapData.users = [
            {
                name: 'chris',
                colour: '#000000'
            }
        ];

        $scope.addMarkers = function (latlng, id) {
            $scope.mapData.markers.$add({
                lat: parseFloat(latlng.lat),
                lng: parseFloat(latlng.lng),
                user: 'chris'
            });
        };

        $scope.$on('leafletDirectiveMap.click', function (event, args) {
            $scope.addMarkers(args.leafletEvent.latlng, args.leafletEvent.originalEvent.timeStamp);
        });
    }]);

}());

