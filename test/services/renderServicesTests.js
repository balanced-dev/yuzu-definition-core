handlebars = require('handlebars')

var should = require('should'),
    rewire = require('rewire'),
    S = require('string'),
    svc = rewire('../../modules/services/renderService.js');


describe('render service', function () {

    describe('render', function () {
        it('should render hbs files', function () {

            var data = {
                title: 'title'
            };

            var hbs = '<h1>{{title}}</h1>'

            var output = svc.render(hbs, data, []);

            output.should.equal('<h1>title</h1>')
        });


        it('should register partial', function () {

            var partial = '<h1>{{title}}</h1>';

            handlebars.registerPartial('partial', partial)

            var data = {
                title: 'title'
            };

            var hbs = '{{> partial}}'

            var output = svc.render(hbs, data, []);

            output.should.equal('<h1>title</h1>')
        });

        it('should register helper', function () {

            var helper = function (name) {
                return name.first + " " + name.last;
            }

            handlebars.registerHelper('helper', helper)

            var data = {
                name: {
                    first: 'first',
                    last: 'last'
                }
            };

            var hbs = '<h1>{{helper name}}</h1>'

            var output = svc.render(hbs, data, []);

            output.should.equal('<h1>first last</h1>')
        });

    });

    describe('wrap', function () {

        it('should wrap template', function () {

            var contents = '<div>main</div>'

            var data = {
                title: 'title'
            };

            var hbs = '<body><h1>{{title}}</h1>{{{contents}}}</body>'

            var output = svc.wrapSingle(hbs, data, new Buffer(contents), []);

            output.should.equal('<body><h1>title</h1><div>main</div></body>')
        });

        it('should render all wrapped', function () {

            var datas = [
                {
                    title: 'contentTitle'
                },
                {
                    title: 'subLayoutTitle'
                },
                {
                    title: 'layoutTitle'
                }
            ];

            var hbses = [
                "<h3>{{title}}</h3>",
                "<h2>{{title}}</h2>{{{ contents }}}",
                "<h1>{{title}}</h1>{{{ contents }}}"
            ];

            var output = svc.wrapMultiple(hbses, datas, []);

            output.should.equal('<h1>layoutTitle</h1><h2>subLayoutTitle</h2><h3>contentTitle</h3>')
        });

    });

    describe('from template', function () {

        it('should render from a default layout', function () {

            var path = 'parHeader';
            var template = "<h3>{{title}}</h3>";
            var data = {
                title: 'contentTitle'
            };

            var layouts = [
                {
                    name: '_page',
                    template: "<h1>{{title}}</h1>{{{ contents }}}",
                    data: [{
                        name: '_page',
                        value: {
                            title: "layoutTitle"
                        }
                    }]
                }
            ]

            var output = svc.fromTemplate(path, template, data, layouts, []);

            output.should.equal('<h1>layoutTitle</h1><h3>contentTitle</h3>')
        });

        it('should render from a bespoke layout', function () {

            var path = 'parHeader';
            var template = "<h3>{{title}}</h3>";
            var data = {
                title: 'contentTitle',
                _layout: {
                    name: 'bespoke',
                    data: 'bespoke_state'
                }
            };

            var layouts = [
                {
                    name: 'bespoke',
                    template: "<h1>{{title}}</h1>{{{ contents }}}",
                    data: [{
                        name: 'bespoke_state',
                        value: {
                            title: "layoutTitle"
                        }
                    }]
                }
            ]

            var output = svc.fromTemplate(path, template, data, layouts, []);

            output.should.equal('<h1>layoutTitle</h1><h3>contentTitle</h3>')
        });

    });

    describe('render errors', function () {

        it('should error gracefully', function () {

            var errors = [];
            var hbs = '{{error}'

            svc.render(hbs, {}, errors);

            errors[0].source.should.equal('Template rendering');
        });

        it('should error when file not present', function () {

            var errors = [];
            var hbs = undefined;

            svc.render(hbs, {}, errors);

            errors[0].message.should.equal('You must pass a string or Handlebars AST to Handlebars.compile. You passed undefined');

        });

        it('should error hbs file contains an error', function () {

            var errors = [];

            var hbs = '{{#if}}';

             svc.render(hbs, {}, errors);

            errors[0].message.should.startWith('Parse error on line 1:');

        });

    });

});