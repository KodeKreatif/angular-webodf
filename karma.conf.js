module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    logLevel: config.LOG_DEBUG,

    files: [
      "vendor/webodf/webodf.js-0.5.4/webodf-debug.js",
      "vendor/angular/angular.js",
      "vendor/angular-mocks/angular-mocks.js",
      "vendor/Rulers/rulers.js",
      "src/*.js",
      "test/webodf.spec.js",
      { pattern:  'test/test.zip',
        watched:  true,
        served:   true,
        included: false }
    ]
  });
};
