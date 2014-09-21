angular.module("webodf.controller", [])
.controller("CanvasCtrl", [ 
  "$scope", "$timeout", "Canvas", "$element",
  function($scope, $timeout, Canvas, $element) {
    $scope.loaded = false;
    addEventListener("load", function() {
      Canvas().init($scope, $element);
    }, false);
  }
])
