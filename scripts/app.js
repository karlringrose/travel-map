/* globals angular, Firebase, L, document */

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
                        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            noWrap: true
                        }
                    }
                }
            },
            center: {
                lat: 2,
                lng: 12,
                zoom: 3
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
            selectedColour: 'none',
            selectedName: 'none'
        };

        // users
        $scope.mapData.users = [
            {
                name: 'user1',
                colour: 'darkblue'
            },
            {
                name: 'user2',
                colour: 'green'
            }
        ];

        $scope.updateUser = function(user) {
            // add a clear user variable
            if(user == 'clear') user = { colour: 'none', name : 'none' };

            $scope.mapData.selectedColour = user.colour;
            $scope.mapData.selectedName = user.name;
        };

        // markers
        var markers = $firebaseArray(ref);

        // Delete Marker
        var deleteMarker = function (e) {
            // Check to make sure the shift key is pressed and that you are before deleting
            if(e.originalEvent.shiftKey == false) {
                console.log('Delete: Shift key not pressed');
                return;
            }
            if($scope.mapData.selectedColour != e.target.options.icon.options.markerColor){
                console.log('Delete: You need to be the same user to delete');
                return;
            }

            var id = e.target.options.icon.options.id;
            var record = markers.$getRecord(id);

            markers.$remove(record).then(function (ref) { });
            this.setOpacity(0); // hide marker
        };

        var addMarker = function (marker, map, colour) {
            var userMarker = L.AwesomeMarkers.icon({
                markerColor: colour,
                id: marker.$id
            });
            var user = findUser(marker.colour);
            return L.marker([marker.lat, marker.lng], {
                    icon: userMarker,
                    clickable: true,
                    title: user,
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
                if ($scope.mapData.selectedColour == 'none'){
                    console.log('Add: User profile not selected');
                    return;
                }
                if (args.leafletEvent.originalEvent.shiftKey == false) {
                    console.log('Add: Shift key not pressed');
                    return;
                }

                $scope.addMarkers(args.leafletEvent.latlng, args.leafletEvent.originalEvent.timeStamp);

            });


        } else {
            $scope.updateUser();
        }


        function findUser(userColour){

            var users = $scope.mapData.users,
            usersLength = users.length,
            userName = '',
            i = 0;

            for (i; i < usersLength; i++) {

                if (userColour == users[i].colour)
                    userName = users[i].name;
            }
            return userName;
        }

    }]);
}());
