namespace ns3.main.directives {

    interface SentenceDirectiveScope {
        sentence: types.Sentence;
    }

    export class SentenceDirectiveController {
        constructor(private $state: ng.ui.IStateService, 
                    private $scope: SentenceDirectiveScope) {
        }

    }

    export class SentenceDirective {

        constructor() {}

        public restrict = 'E';
        public controller = 'SentenceDirectiveController';
        public controllerAs = 'ctrl';
        public templateUrl = 'html/directives/sentence.html';
        public scope = {
            sentence: '='
        };

        static Factory = () => {
            return () => new SentenceDirective();
        };
    }

    getModule().controller('SentenceDirectiveController', SentenceDirectiveController);
    getModule().directive('sentence', SentenceDirective.Factory());
}