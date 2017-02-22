namespace ns3.main.directives {

    interface SourceDirectiveScope {
        source: types.Source;
    }

    export class SourceDirectiveController {

        constructor(private $state: ng.ui.IStateService, 
                    private $scope: SourceDirectiveScope,
                    private $window: ng.IWindowService) {
        }

        private hexToRgb = (hex) => {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        private getBackground = (alpha) => {top
            let rgbs = this.hexToRgb(this.$scope.source.primaryColor);
            return 'rgba(' + rgbs.r + ', ' + rgbs.g + ', ' + rgbs.b + ', ' + alpha + ')';
        }

        public go = () => {
            if (this.$scope.source.url.indexOf('http://') == -1 && this.$scope.source.url.indexOf('https://') == -1) {
                this.$scope.source.url = 'http://' + this.$scope.source.url;
            }
            console.log(this.$scope.source.url);
            this.$window.open(this.$scope.source.url);
        }
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