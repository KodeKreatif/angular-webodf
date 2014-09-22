describe("WebODF directive", function() {
  var compile;
  var scope;
  var controller;

  beforeEach(module("ngWebODF"));

  beforeEach(inject(function($compile, $rootScope, $controller){
    compile = $compile;
    scope = $rootScope.$new();
    controller = $controller;
  }));


  it("should create the intermediate div element which holds the webodf canvas", function() {
    var element = compile("<webodf></webodf>")(scope);
    scope.$digest();
    expect(element.html()).toContain("<odfcanvas class=\"canvas\" id=\"\"></odfcanvas>");
  });

  it("should have a canvas with correct name", function() {
    var element = compile("<webodf name='odf'></webodf>")(scope);
    scope.$digest();
    expect(element.html()).toContain("<odfcanvas class=\"canvas\" id=\"odf\"></odfcanvas>");
  });

  it("should open the test.odt", function() {
    var element = compile("<webodf url='/base/test/test.odt' name='odf'></webodf>")(scope);
    scope.$digest();
    dispatchEvent(new Event("load"));
    expect(scope.$$childTail.loaded).toBeTruthy();
  });


});
