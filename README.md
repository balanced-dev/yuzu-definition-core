Block Template And Parse
=

A collection of utilities to help with the templating side of blocking. 

findTemplateAndValidateFromJson and findTemplateAndValidateFromJson
-
These are gulp plugins that output a file object that contains all the details required by 
a block for it to render an output html file using handlebars. The difference between
the 2 is that one uses json files (output one example file per json) and the other
uses the payout file (one example file per layout)

The is built of the following properties
- contents : the raw handlbars markup
- layout : the layout file that is wrapped around the contents
- path : the name of the html example file
- data : the date to be used when rendering the handlebars file

This is used in a standard gulp stream as follows, it takes 2 peoprties. arrays of the
schema and data files.

```
gulp.task('ui-render-partials', function () {

	return gulp.src(files.templatePages + '/**/*.json')
		.pipe(findTemplateAndValidateFromJson(externalItems.schema, externalItems.data))       
		.pipe(wrap(function (data) {
			return fs.readFileSync(files.templateLayouts + data.file.layout + '.hbs', 'utf8');
		}, layoutData, {
				engine: 'handlebars'
			}))
		.pipe(compileHandlebars($.data, options))
		.pipe(rename(function (path) {
			path.dirname = path.dirname.replace('data', '');
			path.extname = ".html";
		}))
		.pipe(gulp.dest(files.templateHTML));

});
```
The above is pseudo code to remonstrate how it works, it won't work from a copy and paste.
Go to our example app to get a running copy.

registerHandlebarsPartials
-
Registers all the partials in Handlebars and returns then as an array.
