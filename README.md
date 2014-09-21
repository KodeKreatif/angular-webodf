Angular WebODF
==============

This is the Angular directive for [WebODF](http://www.webodf.org).

## How to use

1. Get Angular
1. Get WebODF by running:
```
gulp webodf
```
  You will have webodf.js in vendor/webodf/ directory. You can specify the WebODF version in `gulpfiles.js`.
  Otherwise you can download it manually from it's site.

```
<script type="text/javascript" src="angular.js"></script>
<script type="text/javascript" src="webodf.js"></script>
<script type="text/javascript" src="angular-webodf.js"></script>

...
<webodf url="file.odt" name="odf"></webodf>
```
## Attributes
`url`: This contains the url of the ODF document you're opening using the directive.

`name`: This specifies the name of the directive. You should use different name if you have more than one directives.

`readonly`: This specifies that the document you're loading is read only. No editor is going to be present.

## Building
If you're missing something in this directive, you're free to help out. By having a basic `bower` and `gulp`
 skill, you can easily build the project.

### Installation
```
npm install
bower install
```

### Building the directive
```
gulp src
```
You will get the `dist` directory containing ready to use `angular-webodf.js`.

### Building demo site

```
gulp demo
```
You will get the demo directory which you can try by running it in a web server in `demo` directory.


## License

MIT
(c) 2014, Mohammad Anwari

"But WebODF is AGPL!", yes it is, but it has an exception to the license:

> As a special exception to the AGPL, any HTML file which merely makes function calls to this code, and for that purpose includes it in unmodified form by reference or in-line shall be deemed a separate work for copyright law purposes.
