angular.module("webodf.controller", [])
.controller("CanvasCtrl", [ 
  "$scope", "$timeout", "Canvas", "$element",
  function($scope, $timeout, Canvas, $element) {
    $scope.loaded = false;
    addEventListener("load", function() {
      Canvas().init($scope, $element);
    }, false);
  }
])

angular.module("webodf.directive", ["webodf.factory"])
.directive("webodf", [
  "Canvas", 
  function(Canvas) {

    var link = function($scope, el, attrs, ctrl) {
      Canvas().data.elementName = attrs.name;
      Canvas().data.memberId = attrs.user || "localuser";
      Canvas().data.loadUrl = attrs.url;
      Canvas().data.readOnly = (typeof(attrs.readonly) !== "undefined");
      $scope.id = attrs.id;
    };

    return {
      restrict: "E",
      link: link,
      controller: "CanvasCtrl",
      scope: {
        id: "@name"
      },
      template: "<div class='canvas' id='{{id}}'></div>"
    }
  }
]);

angular.module("webodf.factory", [])
.factory("Canvas", [
  "$window",
  function($window) {
    var data = {};
    var $scope;

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
        annotationsEnabled: true,
        directTextStylingEnabled: true, 
        directParagraphStylingEnabled: true
      });

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
      $scope.editable = true;
    }

    var init = function(scope, element) {
      $scope = scope;
      $scope.data = data;
      var e = angular.element(element)[0];
      if (!e) return;
      data.canvas = new odf.OdfCanvas(e); 
      $scope.editable = false;
      if (!data.readOnly) {
        data.canvas.addListener("statereadychange", initSession);
      }

      if (data.loadUrl) {
        $scope.loaded = true;
        data.canvas.load(data.loadUrl);
      }
    }

    return function() {
      return {
      init: init,
      data: data
      }
    }
  }
])

var ngWebODF = angular.module("ngWebODF", [
    "webodf.controller"
    ,"webodf.factory"
    , "webodf.directive"
])
