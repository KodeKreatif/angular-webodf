module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],

    files: [
      "vendor/webodf/webodf.js-0.5.4/webodf-debug.js",
      "vendor/angular/angular.js",
      "vendor/angular-mocks/angular-mocks.js",
      "vendor/Rulers/rulers.js",
      "src/*.js",
      "test/webodf.spec.js",
      { pattern:  'test/*.odt',
        watched:  false,
        served:   true,
        included: false }
    ]
  });
};
