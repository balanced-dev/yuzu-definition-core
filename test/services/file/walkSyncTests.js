var rewire = require('rewire'), should = require('should'),
	fileService = rewire('../../../modules/services/fileService');

var createFsMock = function (readdirSync, statSync) {
	fileService.__set__(
		{
			fs:
			{
				readdirSync: readdirSync,
				statSync: statSync
			}
		}
	);
}

var dir = '';
var fileList = [];
var fileListAction = function (dir, filename) {
	fileList.push(dir + filename)
}

describe('file service', function () {
	describe('getFilesInDir', function () {

		beforeEach(function () {
			fileList = [];
			dir = 'dir/';
		});

		it('should handle missing forward slashes on directory name', function () {
			var readdirSync = function (dir) {
				return [];
			}
			createFsMock(readdirSync);

			dir = 'test';
			fileService.getFilesInDir(dir, fileListAction);

			fileList.should.be.empty;
		})

		it('should return empty file list when no files found', function () {

			var readdirSync = function (dir) {
				dir.should.be.equal(dir);
				return [];
			}
			createFsMock(readdirSync);

			fileService.getFilesInDir(dir, fileListAction);
		})

		it('should return a single file from the root directory', function () {

			var readdirSync = function (dir) {
				return ["testFile"];
			};
			var statSync = function (path) {
				return {
					isDirectory: function () { return false; }
				}
			}
			createFsMock(readdirSync, statSync);

			fileService.getFilesInDir(dir, fileListAction);

			fileList[0].should.be.equal("dir/testFile");
		})

		it('should return multiple files from the root directory', function () {

			var readdirSync = function (dir) {
				return ["testFile", 'testFile2'];
			};
			var statSync = function (path) {
				return {
					isDirectory: function () { return false; }
				}
			}
			createFsMock(readdirSync, statSync);

			fileService.getFilesInDir(dir, fileListAction);

			fileList[0].should.be.equal("dir/testFile");
			fileList[1].should.be.equal("dir/testFile2");
		})

		it('should return multiple files from the root and sub directory', function () {

			var readdirSync = function (dir) {
				if (dir == 'dir/')
					return ['testFile', 'sub'];
				else
					return ['testFile2'];
			};
			var statSync = function (path) {
				var output = path == 'dir/sub' ? true : false;
				return {
					isDirectory: function () { return output; }
				}
			}
			createFsMock(readdirSync, statSync);

			fileService.getFilesInDir(dir, fileListAction);

			fileList[0].should.be.equal("dir/testFile");
			fileList[1].should.be.equal("dir/sub/testFile2");
		})

		it('should return multiple files from the root and second level sub directory', function () {

			var readdirSync = function (dir) {
				if (dir == 'dir/')
					return ['testFile', 'sub'];
				else if (dir == 'dir/sub/')
					return ['sub2'];
				else
					return ['testFile2'];
			};
			var statSync = function (path) {
				var output = path == 'dir/sub' || path == 'dir/sub/sub2' ? true : false;
				return {
					isDirectory: function () { return output; }
				}
			}
			createFsMock(readdirSync, statSync);

			fileService.getFilesInDir(dir, fileListAction);

			fileList[0].should.be.equal("dir/testFile");
			fileList[1].should.be.equal("dir/sub/sub2/testFile2");
		})

	})
});
