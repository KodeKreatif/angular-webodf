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
    var container;
    var session;
    var sessionController;
    var odfDocument;

    var eventNotifier = new core.EventNotifier([
        "unknownError",
        "metadataChanged" 
    ]);

    var initSession = function(container) {
      if (session) return;

      session = new ops.Session(data.canvas);
      odfDocument = session.getOdtDocument();
      var cursor = new gui.ShadowCursor(odfDocument);
      sessionController = new gui.SessionController(session, data.memberId, cursor, {
        annotationsEnabled: false,
        directTextStylingEnabled: true, 
        directParagraphStylingEnabled: true
      });
      data.formattingController = sessionController.getDirectFormattingController();

      var viewOptions = {
        editInfoMarkersInitiallyVisible: false,
        caretAvatarsInitiallyVisible: false,
        caretBlinksOnRangeSelect: true
      };
      var caretManager = new gui.CaretManager(sessionController, data.canvas.getViewport());
      var selectionViewManager = new gui.SelectionViewManager(gui.SvgSelectionView);
      var sessionConstraints = sessionController.getSessionConstraints();
      data.sessionView = new gui.SessionView(viewOptions, data.memberId, session, sessionConstraints, caretManager, selectionViewManager);
      selectionViewManager.registerCursor(cursor, true);

      sessionController.getMetadataController().subscribe(gui.MetadataController.signalMetadataChanged, function(changes) {
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
      session.enqueue([op]);

      sessionController.insertLocalCursor();
      sessionController.startEditing();

      data.loaded = true;
      if (initFormattingController) {
        initFormattingController(data.formattingController);
      }
      if (loadDone) {
        loadDone();
      }
      updateGeometry();
    }

    var updateGeometry = function() {
      setTimeout(function() {
        // Queue for the next tick
        var width = webOdfCanvas.clientWidth;
        w=webOdfCanvas;
        canvas.width = width;
        canvas.height = 15;
        toolbar.style.width = width + "px";
        webOdfCanvas.style.top = (canvas.clientHeight + toolbar.clientHeight) + "px";
        container.style.width = width + "px";
        container.style.height = (webOdfCanvas.style.top + webOdfCanvas.clientHeight) + "px";
        if (canvas.width != 0)
          ruler.render("#aaa", "cm", 100);
      }, 0);
    }


    var init = function(element) {
      var list = element.find("div");
      container = element[0];
      for (var i = 0; i < list.length; i ++) {
        if (list[i].className && list[i].className.indexOf("webodf-canvas") >= 0) {
          webOdfCanvas = list[i];
          break;
        }
      }
      toolbar = angular.element(list)[0];
      canvas = angular.element(element.find("canvas"))[0];
      if (!webOdfCanvas) return;

      ruler = new Ruler(canvas);
      webOdfCanvas.addEventListener("resize", function() {
        updateGeometry();
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
        odfDocument: odfDocument
      }
    }
  }
])
