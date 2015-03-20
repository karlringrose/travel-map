/* globals angular, Firebase, L */

'use strict';

(function() {
    var db = 'YOUR-DB.firebaseio.com';
    var READONLY = false;

    var app = angular.module('TravelMap', ['firebase', 'leaflet-directive']);

    app.controller("MapController", ['$scope', 'leafletData', '$firebaseArray', '$firebaseObject', function ($scope, leafletData, $firebaseArray, $firebaseObject) {
        var ref = new Firebase('https://' + db + '/');

        $scope.mapData = {
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            noWrap: true
                        }
                    }
                }
            },
            center: {
                lat: 0,
                lng: 0,
                zoom: 2
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
                name: 'user1',
                colour: 'orange'
            },
            {
                name: 'user2',
                colour: 'blue'
            }
        ];

        $scope.updateUser = function() {
            document.querySelectorAll('.select-user')[0].style.display = 'none';
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

        if (!READONLY) {
            $scope.addMarkers = function (latlng, id) {
                markers.$add({
                    lat: parseFloat(latlng.lat),
                    lng: parseFloat(latlng.lng),
                    colour: $scope.mapData.selectedColour
                }).then(displayMarkers);
            };

            $scope.$on('leafletDirectiveMap.click', function (event, args) {
                $scope.addMarkers(args.leafletEvent.latlng, args.leafletEvent.originalEvent.timeStamp);
            });
        } else {
            $scope.updateUser();
        }
    }]);

}());

