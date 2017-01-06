var fs = require('fs');

module.exports = function walkSync(dir, fileAction) {

	if (dir[dir.length - 1] != '/') dir = dir.concat('/')

	var files = fs.readdirSync(dir);
	files.forEach(function(file) {
		if (fs.statSync(dir + file).isDirectory()) {
			walkSync(dir + file + '/', fileAction);
		} else {
			fileAction(dir, file);
		}
	});
}