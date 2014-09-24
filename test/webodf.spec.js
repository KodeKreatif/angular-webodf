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
    expect(element.html()).toContain("<div class=\"canvas\" id=\"\"></div>");
  });

  it("should have a canvas with correct name", function() {
    var element = compile("<webodf name='odf'></webodf>")(scope);
    scope.$digest();
    expect(element.html()).toContain("<div class=\"canvas\" id=\"odf\"></div>");
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

});
