module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],

    files: [
      "vendor/webodf/webodf.js",
      "vendor/angular/angular.js",
      "vendor/angular-mocks/angular-mocks.js",
      "src/*.js",
      "test/webodf.spec.js",
      { pattern:  'test/*.odt',
        watched:  false,
        served:   true,
        included: false }
    ]
  });
};
