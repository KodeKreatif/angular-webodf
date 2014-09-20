angular.module("webodf.directive", [])
.directive("webodf", function() {
  var elementName;
  var memberId;
  var session;
  var sessionController;
  var sessionView;
  var loadUrl;

  var eventNotifier = new core.EventNotifier([
      "unknownError",
      "metadataChanged" 
  ]);
  var canvas;

  var initSession = function(container) {
    if (session) return;

    session = new ops.Session(canvas);
    var doc = session.getOdtDocument();
    var cursor = new gui.ShadowCursor(doc);
    sessionController = new gui.SessionController(session, memberId, cursor, {
      annotationsEnabled: true,
      directTextStylingEnabled: true, 
      directParagraphStylingEnabled: true
    });

    var viewOptions = {
      editInfoMarkersInitiallyVisible: false,
      caretAvatarsInitiallyVisible: false,
      caretBlinksOnRangeSelect: true
    };
    var caretManager = new gui.CaretManager(sessionController, canvas.getViewport());
    var selectionViewManager = new gui.SelectionViewManager(gui.SvgSelectionView);
    var sessionConstraints = sessionController.getSessionConstraints();
    sessionView = new gui.SessionView(viewOptions, memberId, session, sessionConstraints, caretManager, selectionViewManager);
    selectionViewManager.registerCursor(cursor, true);

    sessionController.getMetadataController().subscribe(gui.MetadataController.signalMetadataChanged, function(changes) {
      eventNotifier.emit("metadataChanged", changes);
    });

    var op = new ops.OpAddMember();
    op.init({
      memberid: memberId,
      setProperties: {
        fullName: "",
        color: "black",
        imageUrl: ""
      }
    });
    session.enqueue([op]);

    sessionController.insertLocalCursor();
    sessionController.startEditing();
  }

  var initCanvas = function() {
    var e = document.getElementById(elementName);
    canvas = new odf.OdfCanvas(e); 
    canvas.addListener("statereadychange", initSession);

    if (loadUrl) {
      canvas.load(loadUrl);
    }
  };

  var link = function($scope, el, attrs, ctrl) {
    elementName = attrs.id;
    memberId = attrs.user || "localuser";
    loadUrl = attrs.url;
    initCanvas();
  };

  var controller = function($scope) {
  };

  return {
    restrict: "E",
    link: link,
    controller: controller,
    template: ""
  }
});
