describe('ng-terminal-example.command.tools', function () {

    beforeEach(module('ng-terminal-example.command.tools'));

    describe('commandLineSplitter', function () {

        var splitter = null;
        beforeEach(inject(['commandLineSplitter', function (commandLineSplitter) {
            splitter = commandLineSplitter;
        }]));

        it('Simple splitting', function () {
            expect(splitter.split("hello hello")).toEqual(["hello", "hello"]);
            expect(splitter.split("'hello hello'")).toEqual(["hello hello"]);
            expect(splitter.split('"hello hello"')).toEqual(["hello hello"]);
            expect(splitter.split("\"hello '' hello\"")).toEqual(["hello '' hello"]);
            expect(splitter.split('\'hello " hello\'')).toEqual(["hello \" hello"]);
        });

        it('Object splitting', function () {
            expect(splitter.split("{ prop:1 } { prop:2 }")).toEqual(["{ prop:1 }", "{ prop:2 }"]);
            expect(splitter.split("{ prop:'hello hello' } { prop:'hello hello' }")).toEqual(["{ prop:'hello hello' }", "{ prop:'hello hello' }"]);
        });
    });

    describe('commandBroker', function () {

        var broker = null;

        beforeEach(module('ng-terminal-example.command.tools', ['commandBrokerProvider', function (commandBrokerProvider) {
            commandBrokerProvider.appendCommandHandler({
                command: 'test',
                description: ['test'],
                handle: function (session) {
                    session.output.push({ output: true, text: ['test1'], breakLine: true });
                    session.commands.push({ text: 'test2' });
                }
            });
        }]));

        beforeEach(inject(['commandBroker', function (commandBroker) {
            broker = commandBroker;
        }]));

        var session = {
            output: [],
            commands: []
        };

        it('Find command', function () {
            broker.execute(session, "test");
            expect(session.output.length).toEqual(1);
            expect(session.output[0].text[0]).toEqual('test1');
            expect(session.commands.length).toEqual(1);
            expect(session.commands[0].text).toEqual('test2');
        });
    });
});