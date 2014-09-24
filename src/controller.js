var ToolbarButtonsCtrl = function($scope, Canvas) {
  var self = this;
  self.formattingCtrl = null;

  self.tools = [
  { type: "button", name: "bold", className: "fa-bold", active: false, functionName: "setBold", check: "isBold" } ,
  { type: "button", name: "italic", className: "fa-italic", active: false, functionName: "setItalic", check: "isItalic" } ,
  ];

  // Creates a hash map for a quick lookup
  self.toolsMap = {};
  for (var i = 0; i < self.tools.length; i ++) {
    self.toolsMap[self.tools[i].name] = self.tools[i];
  }

  var textStylingChanged = function(arg) {
    // update button styling
    for (var i = 0; i < self.tools.length; i ++) {
      var b = self.tools[i];
      var check = b.check;
      b.active = (arg[check] ? true : false);
      self.updateVisual(b);
    }
  }

  Canvas().initFormattingController(function(ctrl) {
    self.formattingCtrl = ctrl;
    // This is called by the canvas upon successful loading
    ctrl.subscribe(gui.DirectFormattingController.textStylingChanged, function(arg) {
      $scope.$apply(function() {
        textStylingChanged(arg);
      });
    });
  });

  $scope.buttons = self.tools;

  $scope.click = function(button) {
    self.click(button);
  }
};

// Update css class of a button
ToolbarButtonsCtrl.prototype.updateVisual = function(button) {
  var self = this;
  button.class = (button.active ? "active" : "") + " fa " + button.className;
};

// Updates active state of a button
ToolbarButtonsCtrl.prototype.updateState = function(button) {
  var self = this;

  var f = button.functionName;
  if (f) {
    self.formattingCtrl[f](button.active);
  }
};

// Clicks
ToolbarButtonsCtrl.prototype.click = function(button) {
  var self = this;
  button.active = !button.active;
  this.updateVisual(button);
  this.updateState(button);
};

ToolbarButtonsCtrl.$inject = ["$scope", "Canvas"];

angular.module("webodf.controller", [])
.controller("ToolbarButtonsCtrl", ToolbarButtonsCtrl)
.controller("CanvasCtrl", [ 
  "$scope", "$timeout", "Canvas", "$element",
  function($scope, $timeout, Canvas, $element) {
    $scope.loaded = false;
    addEventListener("load", function() {
      Canvas().init($element);
    }, false);
  }
])
