angular.module('ng-terminal-example', ['vtortola.ng-terminal', 'ng-terminal-example.command.tools', 'ng-terminal-example.command.implementations', 'ng-terminal-example.command.filesystem'])
.provider('$ga', function () {

    window['GoogleAnalyticsObject'] = 'ga';
    window['ga'] = window['ga'] || function () { (window['ga'].q = window['ga'].q || []).push(arguments) }
    window['ga'].l = 1 * new Date();
    var script = document.createElement('script');
    var prevScript = document.getElementsByTagName('script')[0];
    script.async = 1;
    script.src = '//www.google-analytics.com/analytics_debug.js';
    prevScript.parentNode.insertBefore(script, prevScript);

    var provider = function () {
        var me = {};

        me.$get = function () {
            ga('send', 'pageview');
            return function () {
                return window.ga.apply(window, arguments);
            }
        };

        me.ga = function () {
            return window.ga.apply(window, arguments);
        };

        return me;
    };

    return provider();
})
.controller('console',['$scope','$ga','commandBroker','$rootScope', function ($scope, $ga, commandBroker, $rootScope) {

    $rootScope.theme = 'vintage';

    setTimeout(function () {
        $scope.$broadcast('terminal-output', {
            output: true,
            text: ['Welcome to vtortola.GitHub.io',
                   'This is an example of ng-terminal-emulator.',
                   '',
                   "Please type 'help' to open a list of commands"],
            breakLine: true
        });
        $scope.$apply();
    }, 100);

    $scope.gitHub = function () {
        $ga('send', 'event', 'ng-terminal-emulator', 'click', 'GitHub');
    };

    $scope.unitTests = function () {
        $ga('send', 'event', 'ng-terminal-emulator', 'click', 'UnitTest');
    };

    $scope.session = {
        commands: [],
        output: [],
        $scope:$scope
    };

    $scope.$watchCollection(function () { return $scope.session.commands; }, function (n) {
        for (var i = 0; i < n.length; i++) {
            $ga('send', 'event', 'Console', 'Command', JSON.stringify(n[i]));
            $scope.$broadcast('terminal-command', n[i]);
        }
        $scope.session.commands.splice(0, $scope.session.commands.length);
        $scope.$$phase || $scope.$apply();
    });

    $scope.$watchCollection(function () { return $scope.session.output; }, function (n) {
        for (var i = 0; i < n.length; i++) {
            $ga('send', 'event', 'Console', 'Output', JSON.stringify(n[i]));
            $scope.$broadcast('terminal-output', n[i]);
        }
        $scope.session.output.splice(0, $scope.session.output.length);
        $scope.$$phase || $scope.$apply();
    });

    $scope.$on('$viewContentLoaded', function (event) {
        $ga('send', 'pageview');
    });

    $scope.$on('terminal-input', function (e, consoleInput) {
        var cmd = consoleInput[0];

        $ga('send', 'event', 'Console', 'Input', cmd.command );
        try {
            if ($scope.session.context) {
                $scope.session.context.execute($scope.session, cmd.command);
            }
            else {
                commandBroker.execute($scope.session, cmd.command);
            }
        } catch (err) {
            $scope.session.output.push({ output: true, breakLine: true, text: [err.message] });
        }
    });
}])

.config(['$gaProvider',function ($gaProvider) {
    $gaProvider.ga('create', 'UA-53263543-1', 'auto');
}])

.config(['terminalConfigurationProvider', function (terminalConfigurationProvider) {

    terminalConfigurationProvider.config('vintage').outputDelay = 10;
    terminalConfigurationProvider.config('vintage').allowTypingWriteDisplaying = false;
    terminalConfigurationProvider.config('vintage').typeSoundUrl ='example/content/type.wav';
    terminalConfigurationProvider.config('vintage').startSoundUrl ='example/content/start.wav';
}])

;
