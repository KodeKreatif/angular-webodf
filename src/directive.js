angular.module("webodf.directive", ["webodf.factory"])
.directive("tb", 
  function() {
    console.log("D");
    return {
      restrict: "E",
      controller: "ToolbarButtonsCtrl",
      template: "<style>.webodf-tb-button.active:hover {background: #ddd} .webodf-tb-button:hover {background: #ccc} .webodf-tb-button { text-align: center;vertical-align: middle;width: 50px; line-height: 50px;display: inline-block; cursor: pointer} .webodf-tb-button.active { background: #aaa} </style><span class='webodf-tb-button' ng-repeat='b in buttons' ng-click='click(b)' ng-class='b.class'></span> {{style.italic}}" 
    }
  }
)

.directive("webodf", [
  "Canvas", 
  function(Canvas) {

    var link = function($scope, el, attrs, ctrl) {
      Canvas().data.elementName = attrs.name;
      Canvas().data.memberId = attrs.user || "localuser";
      Canvas().data.loadUrl = attrs.url;
      Canvas().data.readOnly = (typeof(attrs.readonly) !== "undefined");
      $scope.ruler = attrs.ruler == "yes";
      Canvas().data.ruler = $scope.ruler;
    };

    return {
      restrict: "E",
      link: link,
      controller: "CanvasCtrl",
      scope: {
        name: "@name"
      },
      template: "<style>webodf { display:block;position: relative;padding:0px; } div.webodf-toolbar { z-index:101;position: absolute; top: 0px; left:0 px; min-height: 50px;width: auto; background: #eee; } canvas.ruler { position:absolute; top: 50px; left: 0px; z-index: 10;background:transparent} div.canvas {border: 1px solid #aaa;overflow: hidden; position: absolute;top: 0px; left: 0px; z-index: 1} </style><div class='webodf-toolbar'><tb></tb></div> <canvas ng-show='ruler' class='ruler' id='ruler'></canvas><div class='canvas' id='{{name}}'></div>"
    }
  }
]);
