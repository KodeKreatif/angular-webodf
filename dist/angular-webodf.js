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
    button.class = (button.active ? "active" : "") + " fa " + button.className;
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

  self.canvas = Canvas;
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
    console.log("x");
    Canvas().data.loaded;
  };
}

CanvasCtrl.prototype.getByteArray = function(cb) {
  var self = this;

  var container = Canvas().data.canvas.odfContainer();
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
      $scope.name = attrs.name;
      Canvas().data.ruler = $scope.ruler;
    };

    return {
      restrict: "E",
      link: link,
      controller: "CanvasCtrl",
      template: "<style>webodf { display:block;position: relative;padding:0px; } div.webodf-toolbar { z-index:101;position: absolute; top: 0px; left:0 px; min-height: 50px;width: auto; background: #eee; } canvas.ruler { position:absolute; top: 50px; left: 0px; z-index: 10;background:transparent} div.canvas {border: 1px solid #aaa;overflow: hidden; position: absolute;top: 0px; left: 0px; z-index: 1} </style><div class='webodf-toolbar'><tb></tb></div> <canvas ng-show='ruler' class='ruler' id='ruler'></canvas><div class='canvas' id='{{name}}'></div>"
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
    var canvas;
    var ruler;
    var toolbar;
    var webOdfCanvas;

    var eventNotifier = new core.EventNotifier([
        "unknownError",
        "metadataChanged" 
    ]);

    var initSession = function(container) {
      if (data.session) return;

      data.session = new ops.Session(data.canvas);
      var doc = data.session.getOdtDocument();
      var cursor = new gui.ShadowCursor(doc);
      data.sessionController = new gui.SessionController(data.session, data.memberId, cursor, {
        annotationsEnabled: false,
        directTextStylingEnabled: true, 
        directParagraphStylingEnabled: true
      });
      data.formattingController = data.sessionController.getDirectFormattingController();

      var viewOptions = {
        editInfoMarkersInitiallyVisible: false,
        caretAvatarsInitiallyVisible: false,
        caretBlinksOnRangeSelect: true
      };
      var caretManager = new gui.CaretManager(data.sessionController, data.canvas.getViewport());
      var selectionViewManager = new gui.SelectionViewManager(gui.SvgSelectionView);
      var sessionConstraints = data.sessionController.getSessionConstraints();
      data.sessionView = new gui.SessionView(viewOptions, data.memberId, data.session, sessionConstraints, caretManager, selectionViewManager);
      selectionViewManager.registerCursor(cursor, true);

      data.sessionController.getMetadataController().subscribe(gui.MetadataController.signalMetadataChanged, function(changes) {
        eventNotifier.emit("metadataChanged", changes);
      });

      var op = new ops.OpAddMember();
      op.init({
        memberid: data.memberId,
        setProperties: {
          fullName: "",
          color: "black",
          imageUrl: ""
        }
      });
      data.session.enqueue([op]);

      data.sessionController.insertLocalCursor();
      data.sessionController.startEditing();

      canvas.width = webOdfCanvas.clientWidth + 1;
      toolbar.width = webOdfCanvas.clientWidth;
      canvas.height = 15;
      ruler.render("#aaa", "cm", 100);

      data.loaded = true;
      if (initFormattingController) {
        initFormattingController(data.formattingController);
      }
      if (loadDone) {
        loadDone();
      }
    }

    var init = function(element) {
      var list = element.find("div");
      webOdfCanvas = angular.element(list)[1];
      toolbar = angular.element(list)[0];
      canvas = angular.element(element.find("canvas"))[0];
      if (!webOdfCanvas) return;

      ruler = new Ruler(canvas);
      webOdfCanvas.addEventListener("resize", function() {
        element[0].width = webOdfCanvas.clientWidth;
        element[0].height = webOdfCanvas.clientHeight;
        canvas.width = webOdfCanvas.clientWidth + 1;
        toolbar.width = webOdfCanvas.clientWidth;
        
        canvas.height = 15;
        ruler.render("#aaa", "cm", 100);
      });
      data.canvas = new odf.OdfCanvas(webOdfCanvas); 
      if (!data.readOnly) {
        data.canvas.addListener("statereadychange", initSession);
      } 

      if (data.loadUrl) {
        data.canvas.load(data.loadUrl);
        if (data.readOnly && loadDone) {
          loadDone();
        }
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
        }
      }
    }
  }
])

var ngWebODF = angular.module("ngWebODF", [
    "webodf.controller"
    ,"webodf.factory"
    , "webodf.directive"
])
