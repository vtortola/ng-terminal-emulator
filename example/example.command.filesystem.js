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
			if (!parts.length)
				return config.directorySeparator;

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
				if (sp.length> 5) {
				    var sp2 = sp.substr(0, sp.length - 5);
                    if(sp2 + "\\_dir" === sp)
					    return !!sp;
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

		var fileNameValidator = /^[\w_.\-]+$/;
		me.isFileNameValid = function (name) {
			return !!name && name[0] != "_" && !!name.match(fileNameValidator);
		};

		var dirNameValidator = /^[\w_\-]+$/;
		me.isDirNameValid = function (name) {
		    return !!name && name[0] != "_" && !!name.match(dirNameValidator);
		};

		return me;
	};
	return pathTools();
}])

.service('fileSystem', ['fileSystemConfiguration', 'pathTools', 'storage', function (config, pathTools, storage) {
	var fs = function () {
		var me = {};
		var _currentPath = config.directorySeparator;

		me.path = function (path) {

			if (path == "..") {
				_currentPath = pathTools.directoryUp(_currentPath);
			}
			else if (path && !pathTools.isDirNameValid(path))
			    throw new Error("The directory name is not valid");
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
				else if (pathTools.isDirectoryOfPath(_currentPath, key)) {
					result.directories.push(pathTools.getPathItemName(key));
				}
			}
			result.directories.sort();
			result.files.sort();
			return result;
		};

		me.existsDir = function (path, failIfNotExist) {

		    if (!pathTools.isDirNameValid(path))
		        throw new Error("The directory name is not valid");

			var dirkey = pathTools.combine(_currentPath, path, "_dir");
			var exists = storage.getItem(dirkey);
			if (!exists && failIfNotExist)
				throw new Error("The directory does not exist.");
			return exists;
		};

		me.createDir = function (path) {

		    if (!pathTools.isDirNameValid(path))
		        throw new Error("The directory name is not valid");

			if (!pathTools.isDirNameValid(pathTools.getPathItemName(path)))
				throw new Error("Invalid directory name");
			if (me.existsDir(path))
				throw new Error("The directory already exists.");
			else {
				var dirkey = pathTools.combine(_currentPath, path, "_dir");
				storage.setItem(dirkey,"_dir");
			}
		};

		me.removeDir = function (path) {

		    if (!pathTools.isDirNameValid(path))
		        throw new Error("The directory name is not valid");

		    if (me.existsDir(path, true)) {
		        var dirkey = pathTools.combine(_currentPath, path, "_dir");
				path = pathTools.combine(_currentPath, path);
				var keys = [];
				for (var key in storage) {
					if (pathTools.isFileOfPath(path, key)) {
						keys.push(key);
					}
					else if (pathTools.isDirectoryOfPath(path, key)) {
						keys.push(key);
					}
				}
				storage.removeItem(dirkey)
				for (var i = 0; i < keys.length; i++) {
					storage.removeItem(keys[i]);
				}
			}
		};

		me.writeFile = function (name, content) {
			if (!pathTools.isFileNameValid(name))
				throw new Error("Invalid file name");
			if (!content)
				throw new Error("No content has been passed");

			var filekey = pathTools.combine(_currentPath, name);
			storage.setItem(filekey, content);
		};

		me.appendToFile = function (name, content) {
			if (!pathTools.isFileNameValid(name))
				throw new Error("Invalid file name");
			if (!content)
				throw new Error("No content has been passed");

			var filekey = pathTools.combine(_currentPath, name);
			var prevcontent = storage.getItem(filekey);
			storage.setItem(filekey, prevcontent + content);
		};

		me.deleteFile = function (name) {
			if (!pathTools.isFileNameValid(name))
				throw new Error("Invalid file name");
			var filekey = pathTools.combine(_currentPath, name);
			if (!storage.getItem(filekey)) {
				throw new Error("The file does not exist");
			}
			storage.removeItem(filekey);
		};

		me.readFile = function (name) {
			if (!pathTools.isFileNameValid(name))
				throw new Error("Invalid file name");

			var filekey = pathTools.combine(_currentPath, name);
			var content = storage.getItem(filekey);
			if (!content) {
				throw new Error("The file does not exist");
			}
			return content;
		};

		return me;
	};
	return fs();
}])

.config(['commandBrokerProvider', function (commandBrokerProvider) {

    var pwdCommand = function () {
        var me = {};
        var fs = null;
        me.command= 'pwd';
        me.description= ['Shows current directory.'];
        me.init = ['fileSystem', function (fileSystem) {
            fs = fileSystem;
        }];
        me.handle = function (session) {
            session.output.push({ output: true, text: [fs.path()], breakLine: true });
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(pwdCommand());

    var cdCommand = function () {
        var me = {};
        var fs = null;
        me.command = 'cd';
        me.description = ['Changes directory.', "Syntax: cd <path>", "Example: cd myDirectory", "Example: cd .."];
        me.init = ['fileSystem', function (fileSystem) {
            fs = fileSystem;
        }];
        me.handle = function (session, path) {
            if (!path)
                throw new Error("A directory name is required");
            session.commands.push({ command: 'change-prompt', prompt: { path: fs.path(path) } });
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(cdCommand());

    var mkdirCommand = function () {
        var me = {};
        var fs = null;
        me.command = 'mkdir';
        me.description = ['Creates directory.',"Syntax: mkdir <directoryName>", "Example: mkdir myDirectory"];
        me.init = ['fileSystem', function (fileSystem) {
            fs = fileSystem;
        }];
        me.handle = function (session, path) {
            if (!path)
                throw new Error("A directory name is required");
            fs.createDir(path);
            session.output.push({ output: true, text: ["Directory created."], breakLine: true });
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(mkdirCommand());

    var rmdirCommand = function () {
        var me = {};
        var fs = null;
        me.command = 'rmdir';
        me.description = ['Removes directory.', "Syntax: rmdir <directoryName>", "Example: rmdir myDirectory"];
        me.init = ['fileSystem', function (fileSystem) {
            fs = fileSystem;
        }];
        me.handle = function (session, path) {
            if (!path)
                throw new Error("A directory name is required");
            fs.removeDir(path);
            session.output.push({ output: true, text: ["Directory removed."], breakLine: true });
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(rmdirCommand());

    var lsCommand = function () {
        var me = {};
        var fs = null;
        me.command = 'ls';
        me.description = ['List directory contents'];
        me.init = ['fileSystem', function (fileSystem) {
            fs = fileSystem;
        }];
        me.handle = function (session) {
            var l = fs.list();
            var output = [];
            
            for (var i = 0; i < l.directories.length; i++) {
                output.push("[DIR]\t\t" + l.directories[i]);
            }
            for (var i = 0; i < l.files.length; i++) {
                output.push("     \t\t" + l.files[i]);
            }
            output.push("");
            output.push("Total: " + (l.directories.length + l.files.length));

            session.output.push({ output: true, text: output, breakLine: true });
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(lsCommand());
}])

.run(['fileSystemConfiguration', 'storage', function (fs, storage) {
	if (!storage.getItem(fs.directorySeparator + "_dir"))
		storage.setItem(fs.directorySeparator + "_dir", "_dir");
}])

;