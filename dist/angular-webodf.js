var Ruler;

(function () {
	"use strict";

	var MAJOR_INTERVAL_RATIO = 0.5,
		MINOR_INTERVAL_RATIO = 0.2,
		TICKS_PER_MAJOR_INTERVAL = 10,
		CURSOR_FPS = 48,
		GUTTER_SIZE = 15;

	Ruler = function (canvas) {
		/*global document, window, Blob, setInterval*/

		this.canvas = (canvas.getContext) ? canvas : document.getElementById(canvas);
		this.ctx = this.canvas.getContext('2d');

		this.cursor = document.createElement('canvas');
		this.cursor_ctx = this.cursor.getContext('2d');

		document.body.appendChild(this.cursor);
		this.cursor.width = this.canvas.width;
		this.cursor.height = this.canvas.height;

		this.cursor.className = this.canvas.className;

		this.cursor.style.zIndex = (this.canvas.style.zIndex + 1) || 1;
		this.cursor.x = this.cursor.currentX = 0;
		this.cursor.y = this.cursor.currentY = 0;

		var refreshCursor = setInterval(function () {
			if (this.cursor.y !== this.cursor.currentY) {
				this.cursor_ctx.clearRect(0, 0, GUTTER_SIZE, window.innerHeight);
				this.cursor_ctx.beginPath();
			    this.cursor_ctx.moveTo(0, this.cursor.y);
			    this.cursor_ctx.lineTo(GUTTER_SIZE, this.cursor.y);
			    this.cursor_ctx.stroke();
			    this.cursor.currentY = this.cursor.y;
			}

			if (this.cursor.x !== this.cursor.currentX) {
				this.cursor_ctx.clearRect(0, 0, window.innerWidth, GUTTER_SIZE);
				this.cursor_ctx.beginPath();
			    this.cursor_ctx.moveTo(this.cursor.x, 0);
			    this.cursor_ctx.lineTo(this.cursor.x, GUTTER_SIZE);
			    this.cursor_ctx.stroke();
			    this.cursor.currentX = this.cursor.x;
			}
		}.bind(this), 1000 / CURSOR_FPS);

		this.cursor.onmousemove = function (ev) {
			if (ev.clientX > GUTTER_SIZE) {
				this.cursor.x = ev.clientX;
			}
			if (ev.clientY > GUTTER_SIZE) {
				this.cursor.y = ev.clientY;
			}
		}.bind(this);

		function fillContextWithRuler(context, ruler, width, height) {
			var pattern_holder = document.createElement('canvas'),
				pattern_ctx = pattern_holder.getContext('2d');

			context.fillStyle = context.createPattern(ruler, 'repeat-x');
			context.fillRect(GUTTER_SIZE, 0, width, height);

			pattern_holder.width = width;
			pattern_holder.height = 100;

			pattern_ctx.translate(0, 0);
			pattern_ctx.scale(-1, 1);
			pattern_ctx.rotate(Math.PI / 4 * 2);
			pattern_ctx.drawImage(ruler, 0, 0);

			context.fillStyle = context.createPattern(pattern_holder, 'repeat-y');
			context.fillRect(0, GUTTER_SIZE, width, width);
		}

		function constructSVGData(color, units, major) {
			var majorHeight = parseInt(GUTTER_SIZE * MAJOR_INTERVAL_RATIO, 10),
				minorHeight = parseInt(GUTTER_SIZE * MINOR_INTERVAL_RATIO, 10),
				tickWidth = parseInt(major / 10, 10),
				html = "",
				i;

			for (i = 0; i < TICKS_PER_MAJOR_INTERVAL; i += 1) {
				html += "<div xmlns='http://www.w3.org/1999/xhtml' style='position: absolute; bottom: 0px; width: " + tickWidth + "px; border-bottom: 1px solid #555; border-left: 1px solid #999;  height: " + ((i % 5 === 0) ? majorHeight : minorHeight)  + "px; left: "  + i * tickWidth + "px'></div>";
			}

			// https://developer.mozilla.org/en-US/docs/HTML/Canvas/Drawing_DOM_objects_into_a_canvas
			return "<svg xmlns='http://www.w3.org/2000/svg' width='" + major + "' height='" + GUTTER_SIZE + "'><foreignObject width='100%' height='100%'>" + html + "</foreignObject></svg>";
		}

		this.render = function (color, units, major, width, height, options) {
			var svg, svgdata, ruler, url, DOMURL;

			options = options || {};

			this.ctx.fillStyle = options.backgroundColor || "#474747";
			this.ctx.strokeStyle = "#ffffff";
			this.cursor_ctx.strokeStyle = options.cursorColor || '#ffffff';

			this.ctx.fillRect(0, 0, this.canvas.width, GUTTER_SIZE);
			this.ctx.fillRect(0, 0, GUTTER_SIZE, this.canvas.height);

			svgdata = constructSVGData.apply(this, arguments);

			ruler = document.createElement('img');

			DOMURL = window.URL || window.webkitURL || window;

			ruler.onload = function () {
			    DOMURL.revokeObjectURL(url);
			    fillContextWithRuler(this.ctx, ruler, this.canvas.width, this.canvas.height);
			}.bind(this);

			svg = new Blob([svgdata], {
				type: "image/svg+xml;charset=utf-8"
			});

			url = DOMURL.createObjectURL(svg);
			ruler.src = url;
		};

		//window.onresize = this.render;
	};

}());

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

angular.module("webodf.directive", ["webodf.factory"])
.directive("tb", 
  function() {
    console.log("D");
    return {
      restrict: "E",
      controller: "ToolbarButtonsCtrl",
      template: "<style>.webodf-tb-button.webodf-tb-button-active:hover {background: #ddd} .webodf-tb-button:hover {background: #ccc} .webodf-tb-button { text-align: center;vertical-align: middle;width: 50px; height: 50px;line-height: 50px;display: inline-block; cursor: pointer} .webodf-tb-button.webodf-tb-button-active { background: #aaa} </style><span class='webodf-tb-button' ng-show='b.enable' ng-repeat='b in buttons' ng-click='click(b)' ng-class='b.class'></span> {{style.italic}}" 
    }
  }
)
.directive("odtFileLoaded", [
  "$parse", "Canvas",
  function($parse, Canvas) {
    return {
      restrict: "A",
      scope: false,
      link: function(scope, element, attrs) {
        var fn = $parse(attrs.onReadFile);

        element.on("change", function(onChangeEvent) {
          var reader = new FileReader();

          reader.onload = function(onLoadEvent) {
            scope.$apply(function() {
              fn(scope, {$fileContent:onLoadEvent.target.result});
            });
          };

          reader.readAsArrayBuffer((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  }
])
.directive("webodf", [
  "Canvas", 
  function(Canvas) {

    var link = function($scope, el, attrs, ctrl) {
      Canvas().data.elementName = attrs.name;
      Canvas().data.memberId = attrs.user || "localuser";
      Canvas().data.loadUrl = attrs.url;
      Canvas().data.readOnly = (typeof(attrs.readonly) !== "undefined");
      $scope.ruler = attrs.ruler == "yes";
      $scope.hasToolbar = true;
      if (attrs.toolbar == "no" || Canvas().data.readOnly) {
        $scope.hasToolbar = false;
      }
      Canvas().data.enableOpenFile = attrs.enableOpenFile == "yes";
      $scope.name = attrs.name;
      Canvas().data.ruler = $scope.ruler;
      Canvas().data.hasToolbar = $scope.hasToolbar;
    };

    return {
      restrict: "E",
      link: link,
      controller: "CanvasCtrl",
      template: "<style>document > body {border:1px solid #eee; background: #fff} webodf {display:block;} .webodf-wrapper { display:block;position: relative;padding:0px; } div.webodf-toolbar { z-index:101;position: absolute; top: 0px; left:0px; min-height: 50px;width: auto; background: #eee; } canvas.webodf-ruler { position:absolute; top: 50px; left: 0px; z-index: 10;background:transparent} div.webodf-canvas {background: #eee;overflow: hidden; position: absolute; left: 0px; z-index: 1} </style><div class='webodf-wrapper'><div ng-show='hasToolbar' class='webodf-toolbar'><tb></tb></div> <canvas ng-show='ruler' class='webodf-ruler' id='ruler'></canvas><div class='webodf-canvas' id='{{name}}'></div></div>"
    }
  }
]);

angular.module("webodf.factory", [])
.factory("Canvas", [
  "$window",
  function($window) {
    var initFormattingController;

    var data = {
    };
    var rulerCanvas;
    var ruler;
    var toolbar;
    var webOdfCanvas;
    var container;
    var session;
    var sessionController;
    var caretManager;
    var selectionViewManager;
    var odfDocument;
    var loadDone;
    var destroyFuncs = [];

    var eventNotifier = new core.EventNotifier([
        "unknownError",
        "metadataChanged" 
    ]);

    var metadataChanged = function(changes) {
      eventNotifier.emit("metadataChanged", changes);
    }

    var initSession = function(container) {
      if (session) return;
      console.log("Init session for ", data.memberId);

      destroyFuncs = [ data.canvas.destroy ];
      session = new ops.Session(data.canvas);
      odfDocument = session.getOdtDocument();
      var cursor = new gui.ShadowCursor(odfDocument);
      sessionController = new gui.SessionController(session, data.memberId, cursor, {
        annotationsEnabled: false,
        directTextStylingEnabled: true, 
        directParagraphStylingEnabled: true
      });
      destroyFuncs.push(sessionController.destroy);
      data.formattingController = sessionController.getDirectFormattingController();

      var viewOptions = {
        editInfoMarkersInitiallyVisible: false,
        caretAvatarsInitiallyVisible: false,
        caretBlinksOnRangeSelect: true
      };
      caretManager = new gui.CaretManager(sessionController, data.canvas.getViewport());
      destroyFuncs.push(caretManager.destroy);
      selectionViewManager = new gui.SelectionViewManager(gui.SvgSelectionView);
      destroyFuncs.push(selectionViewManager.destroy);
      var sessionConstraints = sessionController.getSessionConstraints();
      data.sessionView = new gui.SessionView(viewOptions, data.memberId, session, sessionConstraints, caretManager, selectionViewManager);
      destroyFuncs.push(data.sessionView.destroy);
      selectionViewManager.registerCursor(cursor, true);

      sessionController.setUndoManager(new gui.TrivialUndoManager());
      sessionController.getMetadataController().subscribe(gui.MetadataController.signalMetadataChanged, metadataChanged);

      var op = new ops.OpAddMember();
      op.init({
        memberid: data.memberId,
        setProperties: {
          fullName: "",
          color: "black",
          imageUrl: ""
        }
      });
      session.enqueue([op]);

      sessionController.insertLocalCursor();
      sessionController.startEditing();

      if (initFormattingController) {
        initFormattingController(data.formattingController);
      }
      setupGeometry();
      updateGeometry();
      if (loadDone) {
        loadDone();
      }
      data.loaded = true;
      console.log("Init session done");
    }

    var close = function(cb) {
      sessionController.endEditing();
      sessionController.removeLocalCursor();
      var op = new ops.OpRemoveMember();
      op.init({
        memberid: data.memberId
      });
      session.enqueue([op]);

      session.close(function(err) {
        sessionController.getMetadataController().unsubscribe(gui.MetadataController.signalMetadataChanged, metadataChanged);
        core.Async.destroyAll(destroyFuncs, function(err) {
          session = null;
          sessionController = null;
          cb(err);
        });

      });
    }

    var setupGeometry = function() {
      var rulerCursorCanvas;
      var c = document.getElementsByTagName("canvas"); 
      for (var i = 0; i < c.length; i ++) {
        if (!c[i].id && c[i].className == "webodf-ruler") {
          rulerCursorCanvas = c[i];
        }
      }
      if (rulerCursorCanvas) {
        document.body.removeChild(rulerCursorCanvas);
      }
    }

    var updateGeometry = function() {
      setTimeout(function() {
        // Queue for the next tick
        var width = webOdfCanvas.clientWidth;
        w=webOdfCanvas;
        if (!data.readOnly) {
          rulerCanvas.width = width;
          rulerCanvas.height = 15;
          toolbar.style.width = width + "px";
          webOdfCanvas.style.top = (rulerCanvas.clientHeight + toolbar.clientHeight) + "px";
        } else {
          webOdfCanvas.style.top = "0"; 
          rulerCanvas.width = 0;
        }
        container.style.width = width + "px";
        container.style.height = (
            parseInt(webOdfCanvas.style.top) 
            + (parseInt(webOdfCanvas.style.borderTopWidth) || 0)
            + (parseInt(webOdfCanvas.style.borderBottomWidth) || 0) 
            + (parseInt(webOdfCanvas.style.paddingTop) || 0)
            + (parseInt(webOdfCanvas.style.paddingBottom) || 0) 
            + webOdfCanvas.clientHeight
            + 1
          ) + "px";
        if (rulerCanvas.width != 0)
          ruler.render("#aaa", "cm", 100);
      }, 1000);
    }


    var init = function(element) {
      var list = element.find("div");
      container = element[0];
      for (var i = 0; i < list.length; i ++) {
        if (list[i].className && list[i].className.indexOf("webodf-canvas") >= 0) {
          webOdfCanvas = list[i];
        }
        if (list[i].className && list[i].className.indexOf("webodf-toolbar") >= 0) {
          toolbar = list[i];
        }

      }
      rulerCanvas = angular.element(element.find("canvas"))[0];
      if (!webOdfCanvas) return;

      ruler = new Ruler(rulerCanvas);
      webOdfCanvas.addEventListener("resize", function() {
        setupGeometry();
        updateGeometry();
      });
      data.canvas = new odf.OdfCanvas(webOdfCanvas); 
      if (!data.readOnly) {
        data.canvas.addListener("statereadychange", initSession);
      } 

      if (data.loadUrl) {
        data.canvas.load(data.loadUrl);
        if (data.readOnly) {
          updateGeometry();
          if (loadDone) {
            loadDone();
          }
        }
      }
    }

    var getByteArray = function(cb) {
      var c = data.canvas.odfContainer();
      if (c) {
        c.createByteArray(function(data) {
          cb(null, data);
        }, function(err) {
          cb(new Error(err || "No data"));
        });
      } else {
        cb(new Error("No container"));
      }
    }

    var openFile = function(file) {
      if (data.canvas) {
        close(function() {
          var originalReadFile;
          var cache = {};

          var readFile = function(path, encoding, cb) {
            if (cache[path]) {
              var array = new Uint8Array(cache[path]);
              cb(null, array);
            } else if (originalReadFile) {
              originalReadFile(path, encoding, cb);
            }
          }

          var loadEnd = function() {
            if (reader.readyState === 2) {

              originalReadFile = runtime.readFile;
              runtime.readFile = readFile;
              cache[file.name] = reader.result;
              data.canvas = new odf.OdfCanvas(webOdfCanvas); 
              if (!data.readOnly) {
                data.canvas.addListener("statereadychange", initSession);
              } 
              data.canvas.load(file.name);
            }
          }
          var reader = new FileReader();
          reader.onloadend = loadEnd;
          reader.readAsArrayBuffer(file);
        });
      }
    }

    return function() {
      return {
        init: init,
        data: data,
        initFormattingController: function(set) {
          initFormattingController = set;
        },
        loadDone: function(set) {
          loadDone = set;
        },
        updateGeometry: updateGeometry,
        getByteArray: getByteArray,
        session: session,
        sessionController: sessionController,
        odfDocument: odfDocument,
        openFile: openFile
      }
    }
  }
])

var ngWebODF = angular.module("ngWebODF", [
    "webodf.controller"
    ,"webodf.factory"
    , "webodf.directive"
])
