angular.module('ng-terminal-example.command.filesystem', ['ng-terminal-example.command.tools'])

.provider('fileSystemConfiguration',function(){
	var provider = function () {
		var me = {};
		me.directorySeparator = "\\";
		me.$get = [function () {
			return me;
		}];
		return me;
	};

	return provider();
})

.service('storage', [function () {
	return window.localStorage;
}])

.service('pathTools', ['fileSystemConfiguration', function (config) {
	var pathTools = function(){
		var me = {};
		me.isAbsolute = function (path) {
			if (!path || path.length < config.directorySeparator.length)
				return false;
			return path.substring(0, config.directorySeparator.length) == config.directorySeparator;
		};

		me.addDirectorySeparator = function (path) {
			if (path.substr(path.length - config.directorySeparator.length, config.directorySeparator.length) !== config.directorySeparator) {
				path += config.directorySeparator;
			}
			return path;
		};

		me.addRootDirectorySeparator = function (path) {
			if (!me.isAbsolute(path))
				return config.directorySeparator + path;
			return path;
		};

		me.combine = function () {
			var result = '';
			for (var i = 0; i < arguments.length; i++) {

				var arg = arguments[i];

				if (i != 0 && me.isAbsolute(arg))
					throw new Error("When combining a path, only the first element can an absolute path.")
				else if (i == 0)
					arg = me.addRootDirectorySeparator(arg);
				if(i != arguments.length -1)
					arg = me.addDirectorySeparator(arg);

				result += arg;
			}

			return result;
		};

		me.directoryUp = function (path) {
			if (path == config.directorySeparator)
				return path;
			var parts = path.split(config.directorySeparator);
			var count = 1;
			if (parts[parts.length - 1] == "")
				count = 2;

			for (var i = 0; i < count; i++) {
				parts.pop();
			}

			if (parts[0] == "")
				parts = parts.slice(1);

			return me.combine.apply(me,parts);
		};

		me.isFileOfPath = function (basePath, path) {
			if (path.substr(0, basePath.length) == basePath) {
				var sp = path.substr(basePath.length);
				if (me.isAbsolute(sp) && sp.indexOf(config.directorySeparator) === sp.lastIndexOf(config.directorySeparator)) {
					sp = sp.substr(config.directorySeparator.length);
					return sp!="_dir";
				}
			}

			return false
		};

		me.isDirectoryOfPath = function (basePath, path) {
			if (path.substr(0, basePath.length) == basePath) {
				var sp = path.substr(basePath.length);
				if (me.isAbsolute(sp) && sp.indexOf(config.directorySeparator) === sp.lastIndexOf(config.directorySeparator)) {
					sp = sp.substr(config.directorySeparator.length);
					return sp == "_dir";
				}
			}

			return false
		};

		me.getPathItemName = function (path) {
			var parts = path.split(config.directorySeparator);
			var last = parts[parts.length - 1];
			if (last == "_dir") {
				if (parts.length >= 3)
					return parts[parts.length - 2];
				else
					return config.directorySeparator;
			}
			else if(last == "")
				return config.directorySeparator;
			else
				return last;
		};

		return me;
	};
	return pathTools();
}])

.service('fileSystem', ['fileSystemConfiguration', 'pathTools', 'storage', function (config, pathTools, storage) {
	var fs = function (config) {
		var me = {};
		var _currentPath = config.directorySeparator;

		me.path = function (path) {

			if (path == "..") {
				_currentPath = pathTools.directoryUp(_currentPath);
			}
			else if (path) {

				var dirkey = pathTools.combine(_currentPath, path, "_dir");
				if (!storage.getItem(dirkey))
					throw new Error("The directory '" + path + "' does not exist.");

				_currentPath = pathTools.combine(_currentPath, path);
			}

			return _currentPath;
		};

		me.list = function () {
			var result = {
				directories: [],
				files:[]
			};

			for (var key in storage) {
				if (pathTools.isFileOfPath(_currentPath, key)) {
					result.files.push(pathTools.getPathItemName(key));
				}
				else if (path.isDirectoryOfPath(_currentPath, key)) {
					result.directories.push(pathTools.getPathItemName(key));
				}
			}
		};

		me.createDir = function (path) {
			var dirkey = pathTools.combine(_currentPath, path, "_dir");
			if (storage.getItem(dirkey))
				throw new Error("The directory '" + path + "' already exists.");
			else
				storage.setItem(dirkey)
		};

		me.removeDir = function (path) {
			var dirkey = pathTools.combine(_currentPath, path, "_dir");
			if (!storage.getItem(dirkey))
				throw new Error("The directory '" + path + "' does not exist.");
			else {
				path = pathTools.combine(_currentPath, path);
				var keys = [];
				for (var key in storage) {
					if (pathTools.isFileOfPath(path, key)) {
						keys.push(key);
					}
					else if (path.isDirectoryOfPath(path, key)) {
						keys.push(key);
					}
				}
				storage.removeItem(dirkey)
				for (var i = 0; i < keys.length; i++) {
					storage.removeItem(keys[i]);
				}
			}
		};

		me.writeFile = function (path, content) {

		};

		me.appendToFile = function (path, content) {

		};

		me.deleteFile = function (file) {

		};

		return me;
	};
}])

.config(['commandBrokerProvider', function (commandBrokerProvider) {

}])

.run(['fileSystemConfiguration', 'storage', function (fs, storage) {
	if (!storage.getItem(fs.directorySeparator + "_dir"))
		storage.setItem(fs.directorySeparator + "_dir", "_dir");
}])

;