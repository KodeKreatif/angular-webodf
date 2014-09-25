var ToolbarButtonsCtrl = function($scope, Canvas) {
  var self = this;
  self.formattingCtrl = null;

  self.tools = [
    { type: "toggle-button", name: "bold", className: "fa-bold", active: false, functionName: "setBold", check: "isBold" } ,
    { type: "toggle-button", name: "italic", className: "fa-italic", active: false, functionName: "setItalic", check: "isItalic" } ,
    { type: "toggle-button", name: "underline", className: "fa-underline", active: false, functionName: "setHasUnderline", check: "hasUnderline" } ,
    { type: "button", name: "strikethrough", className: "fa-strikethrough", active: false, functionName: "setHasStrikeThrough", check: "hasStrikeThrough" } ,
    { type: "button", name: "indent", className: "fa-indent", active: false, functionName: "indent"} ,
    { type: "button", name: "outdent", className: "fa-outdent", active: false, functionName: "outdent"} ,
    { type: "radio-button", group: "paragraph", name: "paragraphLeft", className: "fa-align-left", active: false, functionName: "alignParagraphLeft", check: "isAlignedLeft" } ,
    { type: "radio-button", group: "paragraph", name: "paragraphCenter", className: "fa-align-center", active: false, functionName: "alignParagraphCenter", check: "isAlignedCenter" } ,
    { type: "radio-button", group: "paragraph", name: "paragraphRight", className: "fa-align-right", active: false, functionName: "alignParagraphRight", check: "isAlignedRight" } ,
    { type: "radio-button", group: "paragraph", name: "paragraphJustify", className: "fa-align-justify", active: false, functionName: "alignParagraphJustified", check: "isAlignedJustified" } ,
  ];

  // Creates a hash map for a quick lookup
  self.toolsMap = {};
  for (var i = 0; i < self.tools.length; i ++) {
    self.toolsMap[self.tools[i].name] = self.tools[i];
    self.updateVisual(self.tools[i]);
  }

  var textStylingChanged = function(arg) {
    // update button styling
    for (var i = 0; i < self.tools.length; i ++) {
      var b = self.tools[i];
      var check = b.check;
      if (b.type == "toggle-button") {
        b.active = (arg[check] ? true : false);
      }
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
    Canvas().data.sessionController.getEventManager().focus();
  }
};

// Update css class of a button
ToolbarButtonsCtrl.prototype.updateVisual = function(button) {
  var self = this;
  if (button.type == "toggle-button") {
    button.class = (button.active ? "webodf-tb-button-active" : "") + " fa " + button.className;
  } else {
    button.class = "fa " + button.className;
  }
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

var CanvasCtrl = function($scope, $timeout, Canvas, $element) {
  var self = this;

  self.canvas = Canvas();
  $scope.loaded = false;
  addEventListener("load", function() {
    Canvas().init($element);
    Canvas().loadDone(function() {
      $scope.$broadcast("load-done");
    });
  }, false);

  $scope.getByteArray = function(cb) {
    self.getByteArray(cb);
  };

  $scope.isLoaded = function() {
    return Canvas().data.loaded;
  };

  $scope.updateGeometry = function() {
    Canvas().updateGeometry();
  };
}

CanvasCtrl.prototype.getByteArray = function(cb) {
  var self = this;

  var container = self.canvas.data.canvas.odfContainer();
  if (container) {
    container.createByteArray(function(data) {
      cb(null, data);
    }, function(err) {
      cb(new Error(err || "No data"));
    });
  } else {
    cb(new Error("No container"));
  }
}

CanvasCtrl.$inject = ["$scope", "$timeout", "Canvas", "$element"];

angular.module("webodf.controller", [])
.controller("ToolbarButtonsCtrl", ToolbarButtonsCtrl)
.controller("CanvasCtrl", CanvasCtrl)
