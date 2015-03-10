/* globals angular, Firebase, L */

'use strict';

(function() {
    var app = angular.module('TravelMap', ['firebase', 'leaflet-directive']);

    app.controller("MapController", ['$scope', 'leafletData', '$firebaseArray', function ($scope, leafletData, $firebaseArray) {
        var ref = new Firebase('https://travelmap.firebaseio.com/');

        $scope.mapData = {
            center: {
                lat: -25.165,
                lng: 134.648,
                zoom: 3
            },
            events: {
                map: {
                    enable: ['click'],
                    logic: 'emit'
                }
            },
            users: [],
            selectedColour: 'none'
        };

        // users
        $scope.mapData.users = [
            {
                name: 'chris',
                colour: 'orange'
            },
            {
                name: 'kristin',
                colour: 'darkpurple'
            },
            {
                name: 'belle',
                colour: 'green'
            },
            {
                name: 'dan',
                colour: 'blue'
            },
            {
                name: 'warwick',
                colour: 'red'
            },
            {
                name: 'lisa',
                colour: 'purple'
            }
        ];

        $scope.updateUser = function() {
            document.querySelectorAll('.select-user')[0].style.display = 'none';
            // todo save to cookie
        };

        // markers
        var markers = $firebaseArray(ref);

        // display markers
        var displayMarkers = function (sync) {
            var m = sync;
            var isAdding = false;
            var marker;
            if (typeof sync.key === 'function') {
                m = markers[markers.$indexFor(sync.key())];
                isAdding = true;
            }

            leafletData.getMap().then(function (map) {
                if (isAdding) {
                    if ($scope.mapData.selectedColour === 'none') { return; }
                    var userMarker = L.AwesomeMarkers.icon({
                        markerColor: $scope.mapData.selectedColour
                    });
                    marker = L.marker([m.lat, m.lng], {icon: userMarker}).addTo(map);
                    return;
                }
                angular.forEach(m, function (marker, key) {
                    if (!marker.lng || !marker.lat) { return; }
                    var userMarker = L.AwesomeMarkers.icon({
                        markerColor: marker.colour
                    });
                    marker = L.marker([marker.lat, marker.lng], {icon: userMarker}).addTo(map);
                });
            });
        };

        // load markers
        markers.$loaded().then(displayMarkers).catch(function(error) { });

        // add markers
        $scope.addMarkers = function (latlng, id) {
            markers.$add({
                lat: parseFloat(latlng.lat),
                lng: parseFloat(latlng.lng),
                colour: $scope.mapData.selectedColour
            }).then(displayMarkers);
        };

        // marker event
        $scope.$on('leafletDirectiveMap.click', function (event, args) {
            $scope.addMarkers(args.leafletEvent.latlng, args.leafletEvent.originalEvent.timeStamp);
        });
    }]);

}());

