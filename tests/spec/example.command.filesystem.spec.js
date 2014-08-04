describe('ng-terminal-example.command.filesystem', function () {

    beforeEach(module('ng-terminal-example.command.filesystem'));

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
            expect(pathTools.combine("\\", "path1", "path2","path3")).toEqual("\\path1\\path2\\path3");
        });

        it('Can directory up', function () {
            expect(pathTools.directoryUp("\\")).toEqual("\\");
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

        
    });
});