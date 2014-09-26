describe("WebODF directive", function() {
  var compile;
  var scope;
  var controller;
  var w;

  beforeEach(module("ngWebODF"));

  beforeEach(inject(function($compile, $rootScope, $controller, $window){
    w= $window;
    compile = $compile;
    scope = $rootScope.$new();
    controller = $controller;
  }));


  it("should create the intermediate div element which holds the webodf canvas", function() {
    var element = compile("<webodf></webodf>")(scope);
    scope.$digest();
    expect(element.html()).toContain("<div class=\"webodf-canvas\" id=\"\"></div>");
  });

  it("should have a canvas with correct name", function() {
    var element = compile("<webodf name='odf'></webodf>")(scope);
    scope.$digest();
    expect(element.html()).toContain("<div class=\"webodf-canvas\" id=\"odf\"></div>");
  });

  it("should open the test.odt", function(done) {
    var element = compile("<webodf url='/base/test/test.zip' name='odf'></webodf>")(scope);
    scope.$digest();
    scope.$on("load-done", function() {
      expect(scope.isLoaded()).toBeTruthy();
      done();
    });
    dispatchEvent(new Event("load"));
  });

  it("should open the test.odt and get the byte array", function(done) {
    var element = compile("<webodf url='/base/test/test.zip' name='odf'></webodf>")(scope);
    scope.$digest();
    scope.$on("load-done", function() {
      scope.getByteArray(function(err, data) {
        expect(err).toBeNull();
        expect(data.length).toBeGreaterThan(100000);
        done();
      });
    });
    dispatchEvent(new Event("load"));
  });

  it("should recalculate geometry", function(done) {
    var element = compile("<webodf style='width:500px' url='/base/test/test.zip' name='odf'></webodf>")(scope);
    scope.$digest();
    scope.$on("load-done", function() {
      element[0].clientWidth = 1000;
      scope.updateGeometry();
      var list = element.find("div");
      var toolbar;
      for (var i = 0; i < list.length; i ++) {
        if (list[i].className.indexOf("webodf-toolbar")) {
          toolbar = list[i];
        }
      }

      if (toolbar) {
        console.log(toolbar.clientWidth);
      }
      done();
    });
    dispatchEvent(new Event("load"));
  });



});
