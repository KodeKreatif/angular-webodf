var ToolbarButtonsCtrl = function($scope, Canvas) {
  var self = this;
  self.formattingCtrl = null;
  self.Canvas = Canvas;

  self.tools = [
    { type: "button", name: "indent", className: "fa-file-text", active: false, functionName: "ctrl:openFile", enable: true }, //Canvas().data.enableOpenFile } ,
    { type: "toggle-button", name: "bold", className: "fa-bold", active: false, functionName: "setBold", check: "isBold", enable: true } ,
    { type: "toggle-button", name: "italic", className: "fa-italic", active: false, functionName: "setItalic", check: "isItalic", enable: true } ,
    { type: "toggle-button", name: "underline", className: "fa-underline", active: false, functionName: "setHasUnderline", check: "hasUnderline", enable: true } ,
    { type: "button", name: "strikethrough", className: "fa-strikethrough", active: false, functionName: "setHasStrikeThrough", check: "hasStrikeThrough", enable: true } ,
    { type: "button", name: "indent", className: "fa-indent", active: false, functionName: "indent", enable: true} ,
    { type: "button", name: "outdent", className: "fa-outdent", active: false, functionName: "outdent", enable: true} ,
    { type: "radio-button", group: "paragraph", name: "paragraphLeft", className: "fa-align-left", active: false, functionName: "alignParagraphLeft", check: "isAlignedLeft", enable: true } ,
    { type: "radio-button", group: "paragraph", name: "paragraphCenter", className: "fa-align-center", active: false, functionName: "alignParagraphCenter", check: "isAlignedCenter", enable: true } ,
    { type: "radio-button", group: "paragraph", name: "paragraphRight", className: "fa-align-right", active: false, functionName: "alignParagraphRight", check: "isAlignedRight", enable: true } ,
    { type: "radio-button", group: "paragraph", name: "paragraphJustify", className: "fa-align-justify", active: false, functionName: "alignParagraphJustified", check: "isAlignedJustified", enable: true } ,
  ];

  // Creates a hash map for a quick lookup
  self.toolsMap = {};
  for (var i = 0; i < self.tools.length; i ++) {
    if (!self.tools[i].enable) continue;
    self.toolsMap[self.tools[i].name] = self.tools[i];
    self.updateVisual(self.tools[i]);
  }

  var textStylingChanged = function(arg) {
    // update button styling
    for (var i = 0; i < self.tools.length; i ++) {
      var b = self.tools[i];
      if (!b.enable) continue;
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
    Canvas().sessionController.getEventManager().focus();
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
    if (f.indexOf("ctrl:") == 0) {
      self[f.split(":")[1]]();
    } else {
      self.formattingCtrl[f](button.active);
    }
  }
};

// Called from openFile button on the toolbar
ToolbarButtonsCtrl.prototype.openFile = function(button) {
  var self = this;
  var tryLoadFile = function(e) {
    console.log(e);
    var file, files, reader;
    files = (e.target && e.target.files) ||
      (e.dataTransfer && e.dataTransfer.files);
    if (files && files.length === 1) {
      self.Canvas().openFile(files[0]);
    } else {
      alert("File could not be opened in this browser.");
    }
  }
  var form = document.getElementById("fileloader");
  if (!form) {
    var form = document.createElement("form"),
      input = document.createElement("input");                   

    function internalHandler(e) {
      if (input.value !== "") {
        tryLoadFile(e);
      }
      input.value = "";
    }
    form.appendChild(input);                                       
    form.style.display = "none";                                   
    input.id = "fileloader";                                       
    input.setAttribute("type", "file");                            
    input.addEventListener("change", internalHandler, false);      
    document.body.appendChild(form); 
  }
  form.click();
}

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
  var dirty = false;
  var checkingGeometry = false;
  var lastGeometryCheck = new Date;

  self.canvas = Canvas();
  $scope.loaded = false;
  addEventListener("load", function() {
    Canvas().init($element);
    Canvas().loadDone(function() {
      $scope.$broadcast("load-done");
      Canvas().odfDocument.subscribe(ops.OdtDocument.signalUndoStackChanged, function(e) {
        dirty = true;
        $scope.$broadcast(ops.OdtDocument.signalUndoStackChanged, e);
        setTimeout(function() {
          if (checkingGeometry) {
            return;
          }
          var d = new Date;
          if (d - lastGeometryCheck < 1000) {
            return;
          }

          checkingGeometry = true;
          $scope.updateGeometry();
          checkingGeometry = false;
          lastGeometryCheck = new Date;
        }, 1000);
      });
    });
  }, false);

  $scope.dirty = function() {
    return dirty;
  };

  $scope.getByteArray = function(cb) {
    Canvas().getByteArray(cb);
  };

  $scope.isLoaded = function() {
    return Canvas().data.loaded;
  };

  $scope.updateGeometry = function() {
    Canvas().updateGeometry();
  };
}

CanvasCtrl.$inject = ["$scope", "$timeout", "Canvas", "$element"];

angular.module("webodf.controller", [])
.controller("ToolbarButtonsCtrl", ToolbarButtonsCtrl)
.controller("CanvasCtrl", CanvasCtrl)
