describe('vtortola.ng-terminal', function () {

    beforeEach(module('vtortola.ng-terminal'));

    describe('Controller: terminalController', function () {

        var ctrl = null;
        var scope = null;
        beforeEach(inject(['$controller', '$rootScope', function ($controller, $rootScope) {
            ctrl = $controller;
            scope = $rootScope.$new();

            $controller('terminalController', { '$rootScope': $rootScope, '$scope': scope })
        }]));

        it('Can type on command line', function () {
            scope.keypress(82);
            scope.keypress(82);
            scope.keypress(82);
            expect(scope.commandLine).toEqual("RRR");
        });

        it('Can backspace on command line', function () {
            scope.keypress(82);
            scope.keypress(82);
            scope.keypress(82);
            scope.backspace();
            scope.backspace();
            expect(scope.commandLine).toEqual("R");
        });

        it('Can execute command', function (done) {

            scope.$on('terminal-input', function (e) {
                expect(scope.commandLine).toEqual("");
                expect(scope.results.length).toEqual(1);
                expect(scope.results[0].text.length).toEqual(1);
                expect(scope.results[0].text[0]).toEqual(scope.prompt.text + "RRR");
                done();
            });

            scope.keypress(82);
            scope.keypress(82);
            scope.keypress(82);
            scope.execute();
        });

        describe("CommandLine history", function () {
            it('Can go back on command history', function () {
                scope.keypress(82);
                scope.keypress(82);
                scope.keypress(82);
                scope.execute();
                expect(scope.commandLine).toEqual("");
                scope.previousCommand();
                expect(scope.commandLine).toEqual("RRR");
            });
            it('Can skip empty commands', function () {
                scope.keypress(82);
                scope.keypress(82);
                scope.keypress(82);
                scope.execute();
                scope.execute();
                expect(scope.commandLine).toEqual("");
                scope.previousCommand();
                expect(scope.commandLine).toEqual("RRR");
            });
            it('Can go forward in command history', function () {
                scope.keypress(82);
                scope.keypress(82);
                scope.keypress(82);
                expect(scope.commandLine).toEqual("RRR");
                scope.execute();
                expect(scope.commandLine).toEqual("");
                scope.keypress(83);
                scope.keypress(83);
                scope.keypress(83);
                expect(scope.commandLine).toEqual("SSS");
                scope.execute();
                expect(scope.commandLine).toEqual("");
                scope.previousCommand();
                expect(scope.commandLine).toEqual("SSS");
                scope.previousCommand();
                expect(scope.commandLine).toEqual("RRR");
                scope.previousCommand();
                expect(scope.commandLine).toEqual("RRR");
                scope.nextCommand();
                expect(scope.commandLine).toEqual("SSS");
                scope.nextCommand();
                expect(scope.commandLine).toEqual("");
            });
        });

        describe("Terminal operation commands", function () {
            it('Can change prompt', function () {

                scope.$broadcast('terminal-command', {
                    command: 'change-prompt',
                    prompt: { user: 'testPrompt' }
                });

                expect(scope.prompt.text).toEqual("testPrompt@\\:>");

                scope.$emit('terminal-command', {
                    command: 'reset-prompt'
                });

                expect(scope.prompt.text).toEqual("anon@\\:>");
            });

            it('Can clear results', function () {

                scope.keypress(82);
                scope.keypress(82);
                scope.keypress(82);
                scope.execute();

                expect(scope.results.length).toEqual(1);

                scope.$broadcast('terminal-command', {
                    command: 'clear'
                });

                expect(scope.results.length).toEqual(0);
            });
        });
        
    });

    describe('Service: prompt', function () {
        var prompt = null;
        beforeEach(inject(['promptCreator', function (p) {
            prompt = p();
        }]));

        it('Default prompt', function () {
            expect(prompt.text).toEqual("anon@\\:>");
        });

        it('Can set properties on prompt', function () {
            prompt.path('\\user\\whatever');
            prompt.user('vtortola');
            
            expect(prompt.path()).toEqual("\\user\\whatever");
            expect(prompt.user()).toEqual("vtortola");
            expect(prompt.text).toEqual("vtortola@\\user\\whatever:>");
        });

        it('Can reset all properties on prompt', function () {
            prompt.path('\\user\\whatever');
            prompt.user('vtortola');

            expect(prompt.path()).toEqual("\\user\\whatever");
            expect(prompt.user()).toEqual("vtortola");
            expect(prompt.text).toEqual("vtortola@\\user\\whatever:>");

            prompt.reset();

            expect(prompt.text).toEqual("anon@\\:>");
        });

        it('Can reset user property on prompt', function () {
            prompt.path('\\user\\whatever');
            prompt.user('vtortola');

            expect(prompt.path()).toEqual("\\user\\whatever");
            expect(prompt.user()).toEqual("vtortola");
            expect(prompt.text).toEqual("vtortola@\\user\\whatever:>");

            prompt.resetUser();

            expect(prompt.text).toEqual("anon@\\user\\whatever:>");
        });

        it('Can reset path property on prompt', function () {
            prompt.path('\\user\\whatever');
            prompt.user('vtortola');

            expect(prompt.path()).toEqual("\\user\\whatever");
            expect(prompt.user()).toEqual("vtortola");
            expect(prompt.text).toEqual("vtortola@\\user\\whatever:>");

            prompt.resetPath();

            expect(prompt.text).toEqual("vtortola@\\:>");
        });
    });
});