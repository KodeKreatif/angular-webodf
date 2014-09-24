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

      if (initFormattingController) {
        initFormattingController(data.formattingController);
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
      }
    }

    return function() {
      return {
        init: init,
        data: data,
        initFormattingController: function(set) {
          initFormattingController = set;
        }
      }
    }
  }
])
