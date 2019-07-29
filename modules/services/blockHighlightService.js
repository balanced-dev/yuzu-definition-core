const property = {
	name: 'yuzu-path',
	schema: {
		"type": "string"
	}
};

var addYuzuMarker = function(template) {

	return template.replace(/<\w*\s/, '$&{{#if '+ property +'}}data-yuzu="{{'+ property +'}}"{{/if}} ');
}

module.exports.property = property;
module.exports.addYuzuMarker = addYuzuMarker;