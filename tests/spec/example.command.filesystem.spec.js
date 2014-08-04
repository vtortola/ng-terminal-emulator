describe('ng-terminal-example.command.filesystem', function () {

    beforeEach(module('ng-terminal-example.command.filesystem', function ($provide) {
        $provide.value('storage',window.sessionStorage);
    }));

    var pathTools = null;

    beforeEach(inject(['pathTools', function (p) {
        pathTools = p;
    }]));

    describe('Service: pathTools', function () {

        it('Can detect absolute path', function () {
            expect(pathTools.isAbsolute("")).toEqual(false);
            expect(pathTools.isAbsolute("\\")).toEqual(true);
            expect(pathTools.isAbsolute("whatever\\")).toEqual(false);
            expect(pathTools.isAbsolute("\\whatever")).toEqual(true);
            expect(pathTools.isAbsolute("what\\ever")).toEqual(false);
        });

        it('Can add directory separator', function () {
            expect(pathTools.addDirectorySeparator("")).toEqual("\\");
            expect(pathTools.addDirectorySeparator("whatever")).toEqual("whatever\\");
            expect(pathTools.addDirectorySeparator("whatever\\")).toEqual("whatever\\");
            expect(pathTools.addDirectorySeparator("\\whatever")).toEqual("\\whatever\\");
        });

        it('Can add root directory separator', function () {
            expect(pathTools.addRootDirectorySeparator("")).toEqual("\\");
            expect(pathTools.addRootDirectorySeparator("whatever")).toEqual("\\whatever");
            expect(pathTools.addRootDirectorySeparator("whatever\\")).toEqual("\\whatever\\");
        });

        it('Can combine paths', function () {
            expect(pathTools.combine("\\")).toEqual("\\");
            expect(pathTools.combine("\\","path1","path2")).toEqual("\\path1\\path2");
            expect(pathTools.combine("\\", "path1", "path2", "path3")).toEqual("\\path1\\path2\\path3");
        });

        it('Can directory up', function () {
            expect(pathTools.directoryUp("\\")).toEqual("\\");
            expect(pathTools.directoryUp("\\path1")).toEqual("\\");
            expect(pathTools.directoryUp("\\path1\\path2")).toEqual("\\path1");
            expect(pathTools.directoryUp("\\path1\\path2\\path3")).toEqual("\\path1\\path2");
        });

        it('Can detect files in a path', function () {
            expect(pathTools.isFileOfPath("\\", "\\_dir")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path", "\\path\\file")).toEqual(true);
            expect(pathTools.isFileOfPath("\\path", "\\path\\_dir")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path", "\\file")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\path2\\file")).toEqual(true);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\path2\\_dir")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\file")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\path2\\path3\\file")).toEqual(false);
        });

        it('Can detect directories in a path', function () {
            expect(pathTools.isDirectoryOfPath("\\", "\\_dir")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path", "\\path\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path", "\\path\\_dir")).toEqual(true);
            expect(pathTools.isDirectoryOfPath("\\path", "\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\path2\\_dir")).toEqual(true);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\path2\\path3\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\path2\\path3\\_dir")).toEqual(false);
        });
        
        it('Can get path item names', function () {
            expect(pathTools.getPathItemName("\\")).toEqual("\\");
            expect(pathTools.getPathItemName("\\file")).toEqual("file");
            expect(pathTools.getPathItemName("\\path1\\file")).toEqual("file");
            expect(pathTools.getPathItemName("\\path1\\path2\\file")).toEqual("file");
            expect(pathTools.getPathItemName("\\path1\\_dir")).toEqual("path1");
            expect(pathTools.getPathItemName("\\path1\\path2\\path3\\_dir")).toEqual("path3");
        });

        it('Can validate file names', function () {
            expect(pathTools.isFileNameValid("\\jklsdfjls")).toEqual(false);
            expect(pathTools.isFileNameValid("jklsdfjls")).toEqual(true);
            expect(pathTools.isFileNameValid("jkl\\sdfjls")).toEqual(false);
            expect(pathTools.isFileNameValid("jklsdfjls\\")).toEqual(false);
            expect(pathTools.isFileNameValid("jklsdfjls.txt")).toEqual(true);
        });
        
        it('Can validate directory names', function () {
            expect(pathTools.isDirNameValid("\\jklsdfjls")).toEqual(false);
            expect(pathTools.isDirNameValid("jklsdfjls")).toEqual(true);
            expect(pathTools.isDirNameValid("jkl\\sdfjls")).toEqual(false);
            expect(pathTools.isDirNameValid("jklsdfjls\\")).toEqual(false);
            expect(pathTools.isDirNameValid("jklsdfjls.txt")).toEqual(false);
        });
    });

    describe('Service: fileSystem', function () {

        var fs = null; 
        beforeEach(inject(['fileSystem', 'storage', function (fileSystem, storage) {
            fs = fileSystem;
            storage.clear();
        }]));

        it('Default path', function () {
            expect(fs.path()).toEqual("\\");
        });

        it('Can create directory', function () {
            fs.createDir("myDir");
            fs.path("myDir");
            expect(fs.path()).toEqual("\\myDir");
            fs.path("..");
            expect(fs.path()).toEqual("\\");
        });

        it('Can create subdirectory', function () {
            fs.createDir("myDir");
            fs.path("myDir");
            expect(fs.path()).toEqual("\\myDir");

            fs.createDir("mySecondDir");
            fs.path("mySecondDir");
            expect(fs.path()).toEqual("\\myDir\\mySecondDir");
        });

        it('Can create file', function () {
            fs.writeFile("file.txt", "hello");
            expect(fs.readFile("file.txt")).toEqual("hello");
        });

        it('Can create file in directory', function () {
            fs.createDir("myDir");
            fs.path("myDir");
            fs.writeFile("file.txt", "hello");
            expect(fs.readFile("file.txt")).toEqual("hello");
            expect(fs.path()).toEqual("\\myDir");
            fs.path("..");
            expect(function () { fs.readFile("file.txt"); }).toThrowError("The file does not exist");
        });

        it('Can list', function () {
            var list = fs.list();
            expect(list.files.length).toEqual(0);
            expect(list.directories.length).toEqual(0);
            fs.createDir("myDir");
            fs.path("myDir");
            fs.writeFile("file1.txt", "hello");
            fs.writeFile("file2.txt", "hello");
            fs.createDir("subDir");
            list = fs.list();
            expect(list.files.length).toEqual(2);
            expect(list.directories.length).toEqual(1);
        });
    });
});