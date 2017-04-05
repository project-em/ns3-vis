namespace ns3.main.directives {

    interface SentenceDirectiveScope {
        sentence: types.Sentence;
    }

    export class SentenceDirectiveController {
        constructor(private $state: ng.ui.IStateService, 
                    private $scope: SentenceDirectiveScope) {
            console.log($scope.sentence);
        }

        public sentenceStyle = () => {
            if (this.$scope.sentence.bias == 0) {
                return "background-color: white; color: black;";
            } else {
                var hue = this.$scope.sentence.bias > 0 ? 0 : 0.6;
                var lightness = 0.6;
                var saturation = 0.8;
                var rgbs = this.hslToRgb(hue, saturation, lightness);
                return "background-color: rgb(" + rgbs[0] + ", " + rgbs[1] + ", " + rgbs[2] + "); color: white;";
            }
        }

        hslToRgb(h, s, l) {
            var r, g, b;

            if(s == 0){
                r = g = b = l; // achromatic
            }else{
                var hue2rgb = function hue2rgb(p, q, t){
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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