angular.module('ng-terminal-example.command.tools', [])

.provider('commandLineSplitter', function () {
    var provider = function () {
        var me = {};
        var brackets = ['{', '}'];
        brackets.keep = true;
        me.separators = [['"'], ["'"], brackets];

        var isOpener = function (c) {
            var suitableOpeners = me.separators.filter(function (item) { return item[0] == c; });
            if (suitableOpeners.length > 1)
                throw new Error("Opening tag in multiple pairs: " + c);
            else if (suitableOpeners.length == 0)
                return null;
            else {
                return suitableOpeners[0];
            }
        };

        me.$get = function () {
            return {
                split: function (input) {
                    var parts = [];
                    var part = '';
                    var currentOc = null;
                    for (var i = 0; i < input.length; i++) {
                        var c = input[i];

                        if (c == ' ' && !currentOc) {
                            if (part)
                                parts.push(part);
                            part = '';
                            continue;
                        }

                        if (currentOc && currentOc[currentOc.length - 1] == c) {
                            if (i != input.length - 1 && input[i + 1] != ' ')
                                throw new Error("An closing tag can only appear at the end of a sentence or before a space.");

                            if (currentOc.keep)
                                part += c;

                            parts.push(part);
                            part = '';
                            currentOc = null;
                            continue;
                        }

                        var oc = currentOc ? null : isOpener(c);

                        if (oc) {
                            if (i != 0 && input[i - 1] != ' ')
                                throw new Error("An opening tag can only appear at the beggining of a sentence or after a space.");

                            currentOc = oc;
                            if (currentOc.keep)
                                part += c;
                            continue;
                        }

                        part += c;

                    }
                    if (part)
                        parts.push(part);
                    return parts;
                }
            };
        };
        return me;
    }

    return provider();
})

.provider('commandBroker', function () {

    var provider = function () {
        var me = {};
        me.handlers = [];
        me.redirectors = [];

        var selectByRedirectors = function (commandParts) {
            var result = [], r=[];
            for (var i = 0; i < commandParts.length; i++) {
                var cp = commandParts[i];
                var suitableRedirectors = me.redirectors.filter(function (r) { return r.command == cp; });
                if (suitableRedirectors.length) {
                    result.push(r);
                    result.push(cp);
                    r = [];
                }
                else
                    r.push(cp);
            }
            if (r.length)
                result.push(r);

            return result;
        };

        me.$get = ['$injector', 'commandLineSplitter', function ($injector, commandLineSplitter) {
            return {
                execute: function (session, consoleInput) {

                    if (!consoleInput)
                        return;

                    var fullCommandParts = commandLineSplitter.split(consoleInput);

                    var stackedParts = selectByRedirectors(fullCommandParts);

                    var tempSession = {
                        commands: [],
                        output: []
                    };

                    var redirector = null;

                    for (var i = 0; i < stackedParts.length; i++) {
                        var p = stackedParts[i];

                        if (redirector) {
                            p.splice(0, 0, tempSession);
                            redirector.handle.apply(redirector, p);
                            redirector = null;
                            continue;
                        }

                        var suitableRedirectors = me.redirectors.filter(function (r) { return r.command == p; });
                        if (suitableRedirectors.length) {

                            var redirector = suitableRedirectors[0];
                            tempSession = {
                                commands: [],
                                output: [],
                                input: tempSession.output
                            };
                        }
                        else {

                            var suitableHandlers = me.handlers.filter(function (item) {
                                return p.length && item.command == p[0].toLowerCase();
                            });

                            if (suitableHandlers.length == 0)
                                throw new Error("There is no suitable handler for that command.");

                            var h = suitableHandlers[0];

                            p[0] = tempSession;
                            h.handle.apply(h, p);
                        }
                    }
                    angular.extend(session, tempSession);
                },

                init: function () { // inject dependencies on commands
                    // this method should run in '.config()' time, but also does the command addition,
                    // so run it at '.run()' time makes more sense and ensure all commands are already present.
                    var inject = function (handler) {
                        if (handler.init) {
                            $injector.invoke(handler.init);
                        }
                    };
                    for (var i = 0; i < me.handlers.length; i++) {
                        inject(me.handlers[i]);

                    }
                    for (var i = 0; i < me.redirectors.length; i++) {
                        inject(me.redirectors[i]);
                    }
                }
            }
        }];

        me.appendCommandHandler = function (handler) {
            if (!handler || !handler.command || !handler.handle || !handler.description)
                throw new Error("Invalid command handler");

            var suitableHandlers = me.handlers.filter(function (item) {
                return item.command == handler.command;
            });

            if (suitableHandlers.length != 0)
                throw new Error("There is already a handler for that command.");

            me.handlers.push(handler);
        };

        me.appendRedirectorHandler = function (handler) {
            if (!handler || !handler.command || !handler.handle)
                throw new Error("Invalid redirect handler");

            var suitableHandlers = me.redirectors.filter(function (item) {
                return item.command == handler.command;
            });

            if (suitableHandlers.length != 0)
                throw new Error("There is already a handler for that redirection.");

            me.redirectors.push(handler);
        };

        me.describe = function () {
            return me.handlers.map(function (item) { return { command: item.command, description: item.description }; });
        };

        return me;
    };

    return provider();
})

.run(['commandBroker', function (commandBroker) {
    commandBroker.init();
}])

;