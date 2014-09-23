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
      $scope.ruler = attrs.ruler == "yes";
      Canvas().data.ruler = $scope.ruler;
    };

    return {
      restrict: "E",
      link: link,
      controller: "CanvasCtrl",
      scope: {
        id: "@name"
      },
      template: "<style>webodf { display:block;position: relative;padding:0px; } div.webodf-toolbar { position: absolute; top: 0px; left:0 px; min-height: 100px;width: auto; background: #eee; } canvas.ruler { position:absolute; top: 10px; left: 0px; z-index: 10;background:transparent} div.canvas {border: 1px solid #aaa;overflow: hidden; position: absolute;top: 0px; left: 0px; z-index: 1} </style><div class='webodf-toolbar'></div> <canvas ng-show='ruler' class='ruler' id='ruler'></canvas><div class='canvas' id='{{id}}'></div>"
    }
  }
]);
