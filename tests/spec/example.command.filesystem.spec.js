describe('ng-terminal-example.command.filesystem', function () {

    beforeEach(module('ng-terminal-example.command.implementations','ng-terminal-example.command.filesystem',  function ($provide) {
        $provide.value('storage', window.sessionStorage);
        $provide.value('$ga', function () { } );
    }));

    var pathTools = null;
    var fs = null;
    var broker = null;
    var session = null;
    var testStorage = null;
    beforeEach(inject(['pathTools', 'fileSystem', 'storage', 'commandBroker', function (p, fileSystem, storage, commandBroker) {
        pathTools = p;
        fs = fileSystem;
        storage.clear();
        testStorage = storage;
        broker = commandBroker;
        session = {
            output: [],
            commands: []
        };
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
            expect(pathTools.isFileOfPath("\\", "\\file")).toEqual(true);
            expect(pathTools.isFileOfPath("\\path", "\\path\\file")).toEqual(true);
            expect(pathTools.isFileOfPath("\\path", "\\path\\_dir")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path", "\\file")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\path2\\file")).toEqual(true);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\path2\\_dir")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\file")).toEqual(false);
            expect(pathTools.isFileOfPath("\\path1\\path2", "\\path1\\path2\\path3\\file")).toEqual(false);
        });

        it('Can detect directories in a path', function () {
            expect(pathTools.isDirectoryOfPath("\\", "\\path1\\path2\\_dir")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\", "\\path1\\_dir")).toEqual(true);
            expect(pathTools.isDirectoryOfPath("\\", "\\_dir")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\", "\\path\\_dir")).toEqual(true);
            expect(pathTools.isDirectoryOfPath("\\path", "\\path\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path", "\\path\\_dir")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path", "\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\path2\\_dir")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1", "\\path1\\path2\\_dir")).toEqual(true);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\path2\\path3\\file")).toEqual(false);
            expect(pathTools.isDirectoryOfPath("\\path1\\path2", "\\path1\\path2\\path3\\_dir")).toEqual(true);
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
            expect(pathTools.isFileNameValid("_jklsdfjls")).toEqual(false);
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

        it('Can delete directory', function () {
            fs.createDir("myDir");
            expect(fs.list().directories.length).toEqual(1);
            fs.removeDir("myDir");
            expect(fs.list().directories.length).toEqual(0);
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

        it('Can append to file', function () {
            fs.writeFile("file.txt", "hello");
            expect(fs.readFile("file.txt")).toEqual("hello");
            fs.appendToFile("file.txt", "hola");
            expect(fs.readFile("file.txt")).toEqual("hello\nhola");
        });

        it('Can delete file', function () {
            fs.writeFile("file.txt", "hello");
            expect(fs.readFile("file.txt")).toEqual("hello");
            fs.deleteFile("file.txt");
            expect(function () { fs.readFile("file.txt"); }).toThrowError("The file does not exist");
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
            expect(list.directories.length).toEqual(2);
        });
    });

    describe("Commands:", function () {

        describe('mkdir', function () {

            it('Can create directory', function () {
                broker.execute(session, "mkdir myDir");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('Directory created.');
                fs.path("myDir");
                expect(fs.path()).toEqual("\\myDir");
            });

            it('Fails when creating directory with invalid name', function () {
                expect(function () { broker.execute(session, "mkdir _myDir"); }).toThrowError();
            });

            it('Fails when creating directory twice', function () {
                broker.execute(session, "mkdir myDir");
                expect(function () { broker.execute(session, "mkdir myDir"); }).toThrowError();
            });

        });

        describe('rmdir', function () {

            it('Can remove directory', function () {
                fs.createDir("myDir");
                broker.execute(session, "rmdir myDir");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('Directory removed.');
            });

            it('Can remove directory with subdirectories', function () {
                fs.createDir("myDir");
                fs.path("myDir");
                fs.createDir("myDir2");
                fs.path("myDir2");
                fs.createDir("myDir3");
                fs.path("myDir3");
                fs.path("..");
                fs.path("..");
                fs.path("..");
                broker.execute(session, "rmdir myDir");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('Directory removed.');

                var counter = 0;
                for (var key in testStorage) {
                    counter++;
                }
                expect(counter).toEqual(0);
            });

            it('Fails when removing directory that does not exist', function () {
                expect(function () { broker.execute(session, "rmdir myDir2"); }).toThrowError();
            });

            it('Can remove directory with subdirectories and files', function () {

                fs.createDir("myDir");
                fs.path("myDir");
                fs.writeFile("file.txt", "test");
                fs.createDir("myDir2");
                fs.path("myDir2");
                fs.writeFile("file.txt", "test");
                fs.createDir("myDir3");
                fs.path("myDir3");
                fs.writeFile("file.txt", "test");
                fs.path("..");
                fs.path("..");
                fs.path("..");
                broker.execute(session, "rmdir myDir");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('Directory removed.');

                var counter = 0;
                for (var key in testStorage) {
                    counter++;
                }
                expect(counter).toEqual(0);
            });

            it('Can remove directory with subdirectories and preserve parent structure', function () {

                fs.createDir("myDir");
                fs.path("myDir");
                fs.writeFile("file.txt", "test");
                fs.createDir("myDir2");
                fs.path("myDir2");
                fs.writeFile("file.txt", "test");
                fs.createDir("myDir3");
                fs.path("myDir3");
                fs.writeFile("file.txt", "test");
                fs.path("..");
                fs.path("..");
                
                broker.execute(session, "rmdir myDir2");

                var counter = 0;
                for (var key in testStorage) {
                    counter++;
                }
                expect(counter).toEqual(2);
            });
        });

        describe('cd', function () {

            it('Can change directory', function () {
                fs.createDir("myDir");
                broker.execute(session, "cd myDir");
                expect(session.commands.length).toEqual(1);
                expect(session.commands[0].command).toEqual('change-prompt');
                expect(session.commands[0].prompt.path).toEqual('\\myDir');
            });

            it('Can go back directory', function () {
                fs.createDir("myDir");
                broker.execute(session, "cd myDir");
                expect(session.commands.length).toEqual(1);
                expect(session.commands[0].command).toEqual('change-prompt');
                expect(session.commands[0].prompt.path).toEqual('\\myDir');
                session.commands = [];
                broker.execute(session, "cd ..");
                expect(session.commands.length).toEqual(1);
                expect(session.commands[0].command).toEqual('change-prompt');
                expect(session.commands[0].prompt.path).toEqual('\\');
            });

            it('Fails when directory does not exist', function () {
                expect(function () { broker.execute(session, "cd myDir"); }).toThrowError();
            });

        });

        describe('ls', function () {

            it('Can list directories', function () {
                fs.createDir("myDir");
                fs.createDir("myDir2");
                fs.createDir("myDir3");
                broker.execute(session, "ls");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text.length).toEqual(5);
                expect(session.output[0].text[0]).toEqual("[DIR]\t\tmyDir");
                expect(session.output[0].text[1]).toEqual("[DIR]\t\tmyDir2");
                expect(session.output[0].text[2]).toEqual("[DIR]\t\tmyDir3");
                expect(session.output[0].text[3]).toEqual("");
                expect(session.output[0].text[4]).toEqual("Total: 3");
            });
        });

        describe('pwd', function () {

            it('Can identify the working directory', function () {
                fs.createDir("myDir");
                fs.path("myDir");
                fs.createDir("myDir2");
                fs.path("myDir2");
                fs.createDir("myDir3");
                fs.path("myDir3");
                broker.execute(session, "pwd");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('\\myDir\\myDir2\\myDir3');
            });
        });

        describe('cat', function () {

            it('Can read single line file', function () {
                fs.writeFile("file.txt", "test");
                broker.execute(session, "cat file.txt");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('test');
            });

            it('Can read multi line file', function () {
                broker.execute(session, "break test test > file.txt");
                broker.execute(session, "cat file.txt");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text.length).toEqual(2);
                expect(session.output[0].text[0]).toEqual('test');
                expect(session.output[0].text[1]).toEqual('test');
            });

            it('Fails when the file does not exists', function () {
                expect(function () { broker.execute(session, "cat file.txt"); }).toThrowError("The file does not exist");
            });
        });

        describe('rm', function () {

            it('Can delete file', function () {
                fs.writeFile("file.txt", "test");
                broker.execute(session, "rm file.txt");
                expect(session.output.length).toEqual(1);
                expect(session.output[0].text[0]).toEqual('File deleted.');
                expect(function () { broker.execute(session, "cat file.txt"); }).toThrowError("The file does not exist");
            });

            it('Fails when the file does not exists', function () {
                expect(function () { broker.execute(session, "rm file.txt"); }).toThrowError("The file does not exist");
            });
        });
    });
    describe("Redirections:", function () {

        describe('>', function () {

            it('Can create simple file', function () {
                broker.execute(session, "echo test > file.txt");
                expect(session.output.length).toEqual(0);
                expect(fs.readFile("file.txt")).toEqual("test");
            });

            it('Can overwrite simple file', function () {
                broker.execute(session, "echo test > file.txt");
                broker.execute(session, "echo xxxxxx > file.txt");
                expect(session.output.length).toEqual(0);
                expect(fs.readFile("file.txt")).toEqual("xxxxxx");
            });

            it('Can create multiline file', function () {
                broker.execute(session, "break line1 line2 line3 > file.txt");
                expect(session.output.length).toEqual(0);
                expect(fs.readFile("file.txt")).toEqual("line1\nline2\nline3");
            });
        });

        describe('>>', function () {

            it('Can create simple file', function () {
                broker.execute(session, "echo test >> file.txt");
                expect(session.output.length).toEqual(0);
                expect(fs.readFile("file.txt")).toEqual("test");
            });

            it('Can append to simple file', function () {
                broker.execute(session, "echo test > file.txt");
                broker.execute(session, "echo xxxxxx >> file.txt");
                expect(session.output.length).toEqual(0);
                expect(fs.readFile("file.txt")).toEqual("test\nxxxxxx");
            });

            it('Can append to multiline file', function () {
                broker.execute(session, "break line1 line2 line3 > file.txt");
                broker.execute(session, "break line4 line5 line6 >> file.txt");
                expect(session.output.length).toEqual(0);
                expect(fs.readFile("file.txt")).toEqual("line1\nline2\nline3\nline4\nline5\nline6");
            });
        });
    });
});
