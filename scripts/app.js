/* globals angular, Firebase, L, document */

'use strict';

(function() {
    var db = 'blazing-inferno-6519.firebaseio.com';
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
                },
                marker: {
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
                name: 'Karl',
                colour: 'darkblue'
            },
            {
                name: 'James',
                colour: 'blue'
            },
            {
                name: 'Amanda',
                colour: 'green'
            },
            {
                name: 'Jason',
                colour: 'orange'
            },
            {
                name: 'Marcos',
                colour: 'pink'
            },
            {
                name: 'Emma',
                colour: 'purple'
            },
            {
                name: 'Ali',
                colour: 'lightred'
            }
        ];

        $scope.updateUser = function() {
            document.querySelectorAll('.select-user')[0].style.display = 'none';
        };

        // markers
        var markers = $firebaseArray(ref);

        // Delete Marker
        var deleteMarker = function (e) {
            // Check to make sure the shift key is pressed before deleting
            if(e.originalEvent.shiftKey == false) return;

            var id = e.target.options.title;
            var record = markers.$getRecord(id);
            markers.$remove(record).then(function (ref) { });
            this.setOpacity(0); // hide marker
        };

        var addMarker = function (marker, map, colour) {
            var userMarker = L.AwesomeMarkers.icon({
                markerColor: colour
            });
            return L.marker([marker.lat, marker.lng], {
                    icon: userMarker,
                    clickable: true,
                    title: marker.$id
                })
                .on('click', deleteMarker)
                .addTo(map);

        };

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
                    marker = addMarker(m, map, $scope.mapData.selectedColour);
                    return;
                }
                angular.forEach(m, function (marker, key) {
                    if (!marker.lng || !marker.lat) { return; }
                    marker = addMarker(marker, map, marker.colour);
                });
            });
        };

        // load markers
        markers.$loaded().then(displayMarkers).catch(function (error) { console.log(error); });

        // Add markers (edit mode)
        if (!READONLY) {
            $scope.addMarkers = function (latlng, id) {
                markers.$add({
                    lat: parseFloat(latlng.lat),
                    lng: parseFloat(latlng.lng),
                    colour: $scope.mapData.selectedColour
                }).then(displayMarkers);
            };


                $scope.$on('leafletDirectiveMap.click', function (event, args) {
                    // Check for user selected and shift key is pressed
                    if ($scope.mapData.selectedColour == 'none' || args.leafletEvent.originalEvent.shiftKey == false) return;

                    $scope.addMarkers(args.leafletEvent.latlng, args.leafletEvent.originalEvent.timeStamp);

                });


        } else {
            $scope.updateUser();
        }

    }]);
}());
