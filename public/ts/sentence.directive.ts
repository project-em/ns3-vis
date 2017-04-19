namespace ns3.main.directives {

    interface SentenceDirectiveScope {
        sentence: types.Sentence;
        threshold: number;
        gradient: boolean;
    }

    export class SentenceDirectiveController {
        constructor(private $state: ng.ui.IStateService, 
                    private $scope: SentenceDirectiveScope) {
            //console.log($scope.threshold);
            //console.log($scope.sentence.topicRelevance);
        }


        public sentenceStyle = () => {
            if (this.$scope.sentence.topicRelevance < this.$scope.threshold) {
                var hue = 0;
                var lightness = 0.75;
                var saturation = 0;
                var rgbs = this.hslToRgb(hue, saturation, lightness)
                return  "background-color: rgb(" + rgbs[0] + ", " + rgbs[1] + ", " + rgbs[2] + "); color: black;";
            } else if (this.$scope.sentence.bias == 0) {
                return "background-color: white; color: black;";
            } else {
                var test = true;
                //for conservative, make lightness lower as it gets more conservative, lowest should be .35
                //for liberal (negative), make lightness lower as it gets more liberal, lowest should be .35
                //range is 0.7 down to 0.35
                var hue = this.$scope.sentence.bias < 0 ? 0.6 : 0;
                var lightness = 0.6;
                if (this.$scope.gradient) {
                    lightness = this.$scope.sentence.bias < 0 ? this.convertRange(this.$scope.sentence.bias, [-1, -50], [0.7, 0.35]) : this.convertRange(this.$scope.sentence.bias, [1, 50], [0.7, 0.35]);
                } else {
                    lightness = 0.6;
                }
                
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

        convertRange( value, r1, r2 ) { 

            if (Math.abs(value) < Math.abs(r1[0])) {
                return r2[0];
            } else if (Math.abs(value) > Math.abs(r1[1])) {
                return r2[1];
            } else {
                return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
            }
        }
    }

    export class SentenceDirective {

        constructor() {}

        public restrict = 'E';
        public controller = 'SentenceDirectiveController';
        public controllerAs = 'ctrl';
        public templateUrl = 'html/directives/sentence.html';
        public scope = {
            sentence: '=',
            threshold: '=',
            gradient: "="
        };

        static Factory = () => {
            return () => new SentenceDirective();
        };
    }

    getModule().controller('SentenceDirectiveController', SentenceDirectiveController);
    getModule().directive('sentence', SentenceDirective.Factory());
}