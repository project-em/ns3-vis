namespace ns3.main.directives {

    interface SourceDirectiveScope {
        source: types.Source;
    }

    export class SourceDirectiveController {

        constructor(private $state: ng.ui.IStateService, 
                    private $scope: SourceDirectiveScope) {
        }

        // handle deep linking later
        // public go = () => {
        //     this.$tate.go('main.topic', { id : this.$scope.source.id });
        // }
    }

    export class SourceDirective {

        constructor() {}

        public restrict = 'E';
        public controller = 'SourceDirectiveController';
        public controllerAs = 'ctrl';
        public templateUrl = 'html/directives/source.html';
        public scope = {
            source: '='
        };

        static Factory = () => {
            return () => new SourceDirective();
        };
    }

    getModule().controller('SourceDirectiveController', SourceDirectiveController);
    getModule().directive('source', SourceDirective.Factory());
}