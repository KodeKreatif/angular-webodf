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
    var odfDocument;
    var loadDone;

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

      sessionController.setUndoManager(new gui.TrivialUndoManager());
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
      setupGeometry();
      updateGeometry();
    }

    var setupGeometry = function() {
      var rulerCursorCanvas;
      var c = document.getElementsByTagName("canvas"); 
      for (var i = 0; i < c.length; i ++) {
        if (!c[i].id && c[i].className == "webodf-ruler") {
          rulerCursorCanvas = c[i];
        }
      }
      document.body.removeChild(rulerCursorCanvas);
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
