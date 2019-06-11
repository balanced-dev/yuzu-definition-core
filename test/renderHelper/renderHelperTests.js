var should = require('should'),
rewire = require('rewire'),
S = require('string'),
svc = rewire('../../modules/renderHelper/renderHelper.js');


describe('renderHelper error', function() {
	
	it('should render hbs files', function() {
	
		var data = {
			title: 'title'
		};

		var hbs = '<h1>{{title}}</h1>'

		var output = svc.render(hbs, data, []);

        output.should.equal('<h1>title</h1>')
    });	
    
    
	it('should register partial', function() {
    
        var partial = '<h1>{{title}}</h1>';

        svc.handlebars.registerPartial('partial', partial)

		var data = {
			title: 'title'
		};

		var hbs = '{{> partial}}'

		var output = svc.render(hbs, data, []);

        output.should.equal('<h1>title</h1>')
    });	
    
    it('should register helper', function() {
    
        var helper = function(name) {
            return name.first + " " + name.last;
        }

        svc.handlebars.registerHelper('helper', helper)

		var data = {
            name : {
                first: 'first',
                last: 'last'
            }
		};

		var hbs = '<h1>{{helper name}}</h1>'

		var output = svc.render(hbs, data, []);

        output.should.equal('<h1>first last</h1>')
    });
    
    it('should error gracefully', function() {
    
        var errors = [];
		var hbs = '{{error}'

		svc.render(hbs, {}, errors);

        errors[0].source.should.equal('Handlebars render');
    });
    
    it('should wrap template', function() {
    
        var contents = '<div>main</div>'

		var data = {
            title: 'title'
		};

		var hbs = '<body><h1>{{title}}</h1>{{{contents}}}</body>'

		var output = svc.wrapSingle(hbs, data, new Buffer(contents), []);

        output.should.equal('<body><h1>title</h1><div>main</div></body>')
    });
    
    it('should render all wrapped', function() {
    
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
    
    it('should render from layouts', function() {
    
        var path = 'parHeader';
        var template = "<h3>{{title}}</h3>";
        var data = {
            title: 'contentTitle'
        };

        var layouts = [
            {
                name: 'layout',
                template: "<h1>{{title}}</h1>{{{ contents }}}",
                data: {
                    title: 'layoutTitle'
                }
            }
        ]

		var output = svc.fromTemplate(path, template, data, layouts, []);

        output.should.equal('<h1>layoutTitle</h1><h3>contentTitle</h3>')
    });
    
    it('should render from layouts and blockData', function() {
    

        svc.__set__(
            {
                templateHelper: {
                    GetLayout: function() {
                        return {
                            template: "<h1>{{title}}</h1>{{{ contents }}}",
                            data: {
                                title: 'layoutTitle'
                            }
                        }
                    },
                    GetBlockLayout: function() {
                        return {
                            template: "<h2>{{title}}</h2>{{{ contents }}}",
                            data: {
                                title: 'subLayoutTitle'
                            }
                        }
                    }
                }
            }
        )

        var path = 'parHeader';
        var template = "<h3>{{title}}</h3>";
        var data = {
            title: 'contentTitle'
        };

		var output = svc.fromTemplate(path, template, data, [], [], 'blockLayout');

        output.should.equal('<h1>layoutTitle</h1><h2>subLayoutTitle</h2><h3>contentTitle</h3>')
	});
	
});