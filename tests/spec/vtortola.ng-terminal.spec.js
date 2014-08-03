describe('vtortola.ng-terminal', function () {

    beforeEach(module('vtortola.ng-terminal'));

    describe('terminalController', function () {

        var ctrl = null;
        var scope = null;
        beforeEach(inject(['$controller', '$rootScope', function ($controller, $rootScope) {
            ctrl = $controller;
            scope = $rootScope.$new();

            $controller('terminalController', { '$rootScope': $rootScope, '$scope': scope })
        }]));

        it('CommandLine writting', function () {
            scope.keypress(82);
            scope.keypress(82);
            scope.keypress(82);
            expect(scope.commandLine).toEqual("RRR");
        });

        it('CommandLine backspacing', function () {
            scope.keypress(82);
            scope.keypress(82);
            scope.keypress(82);
            scope.backspace();
            scope.backspace();
            expect(scope.commandLine).toEqual("R");
        });

        it('CommandLine executing', function (done) {

            var c = {};
            scope.$on('terminal-input', function (e) {
                console.log(e);
                c.event = e;
                
                expect(scope.commandLine).toEqual("");
                expect(scope.results.length).toEqual(1);
                done();
            });

            scope.keypress(82);
            scope.keypress(82);
            scope.keypress(82);
            scope.execute();
            expect(c.event).toBeDefined();
        });

        describe("CommandLine history",function(){
            it('Previous', function () {
                scope.keypress(82);
                scope.keypress(82);
                scope.keypress(82);
                scope.execute();
                expect(scope.commandLine).toEqual("");
                scope.previousCommand();
                expect(scope.commandLine).toEqual("RRR");
            });
            it('Next', function () {
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
        })
        
    });
});