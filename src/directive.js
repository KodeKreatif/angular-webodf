angular.module("webodf.directive", ["webodf.factory"])
.directive("webodf", [
  "Canvas", 
  function(Canvas) {

    var link = function($scope, el, attrs, ctrl) {
      Canvas().data.elementName = attrs.name;
      Canvas().data.memberId = attrs.user || "localuser";
      Canvas().data.loadUrl = attrs.url;
      Canvas().data.readOnly = (typeof(attrs.readonly) !== "undefined");
      $scope.id = attrs.id;
    };

    return {
      restrict: "E",
      link: link,
      controller: "CanvasCtrl",
      scope: {
        id: "@name"
      },
      template: "<odfcanvas class='canvas' id='{{id}}'></odvcanvas>"
    }
  }
]);
