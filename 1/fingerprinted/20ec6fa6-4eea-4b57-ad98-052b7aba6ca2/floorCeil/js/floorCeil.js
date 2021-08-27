define("floorCeil", ["exports"], function(exports) {
var module = {};
function NumberRepresentation(value, display, isFraction) {
    this.value = value;
    this.display = display;
    this.isFraction = isFraction;
}

function floorCeil() {
    this.init = function (id, eventManager, options) {
        this.name = 'floorCeil';
        this.id = id;
        this.eventManager = eventManager;

        var css = '<style>.zyante-bold{font-family:HelveticaNeue-Light,"Helvetica Neue Light","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;font-weight:300}.zyante-section-bold{font-family:Helvetica;font-weight:300}.floorCeil{min-width:460px;font-family:HelveticaNeue-Light,"Helvetica Neue Light","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif}.floorCeil .floorCeil{font-size:24px;text-align:center}.floorCeil .problem{color:#5780a6;display:inline-block;margin-bottom:30px;margin-top:30px;position:relative;top:3px}.floorCeil .instructions{font-size:14px}.floorCeil .explanation{color:#bb0404;display:inline-block}.floorCeil .explanation .leftBar,.floorCeil .explanation .rightBar,.floorCeil .explanation .leftBar.fraction,.floorCeil .explanation .rightBar.fraction{height:16px}.floorCeil .explanation .leftBar{margin-right:3px}.floorCeil .explanation .rightBar{margin-left:3px}.floorCeil .explanation .problem{color:#bb0404;margin:0}.floorCeil input{width:94px}.floorCeil .leftBar{border-left:2px solid;display:inline-block;height:24px;width:7px}.floorCeil .rightBar{border-right:2px solid;display:inline-block;height:24px;width:7px}.floorCeil .innerExpression{display:inline-block;position:relative;top:-3px}.floorCeil .innerExpression.fraction{top:-6px}.floorCeil .leftBar.fraction,.floorCeil .rightBar.fraction{height:30px}.floorCeil .floor>.leftBar,.floorCeil .floor>.rightBar{border-bottom:2px solid}.floorCeil .ceil>.leftBar,.floorCeil .ceil>.rightBar{border-top:2px solid}.floorCeil .inline-block{display:inline-block}.floorCeil .zyante-progression-x-mark{display:inline-block;vertical-align:top}</style>';
        var html = this[this.name]['floorCeil']({ id: this.id });

        this.useNestedQuestions = false;
        if (options && options['useNestedQuestions']) {
            this.useNestedQuestions = options['useNestedQuestions'];
        }

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.utilities = require('utilities');
        this.progressionTool.init(this.id, this.eventManager, {
            html: html,
            css: css,
            numToWin: this.useNestedQuestions ? 4 : 8,
            useMultipleParts: true,
            start: function start() {
                self.enableInput();
            },
            reset: function reset() {
                self.makeLevel(0);
                self.disableInput();
            },
            next: function next(currentQuestion) {
                self.enableInput();

                if (!self.userInputWasInvalid) {
                    self.makeLevel(currentQuestion);
                }
            },
            isCorrect: function isCorrect() {
                var userAnswer = self.$input.val();
                var isCorrect = parseFloat(userAnswer) === self.expectedAnswer;
                var explanationMessage = 'Enter a numeric value';

                self.disableInput();
                self.userInputWasInvalid = userAnswer === '';

                if (!self.userInputWasInvalid) {
                    explanationMessage = self.explanationMessage;
                    if (self.isNegativeDecimalProblem) {
                        explanationMessage += self.additionalExplanationMessage;
                    }
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer: userAnswer,
                    expectedAnswer: self.expectedAnswer,
                    isCorrect: isCorrect
                };
            }
        });

        var $thisTool = $('#' + this.id);
        this.$problem = $thisTool.find('.problem');
        this.$leftBar = $thisTool.find('.leftBar');
        this.$innerExpression = $thisTool.find('.innerExpression');
        this.$rightBar = $thisTool.find('.rightBar');
        this.$input = $thisTool.find('input');

        this.wholeNumbers = this.utilities.getCarousel([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        this.makeLevel(0);

        this.$input.keypress(function (event) {
            if (event.keyCode === self.utilities.ENTER_KEY) {
                self.progressionTool.check();
            }
        });

        this.disableInput();
    };

    this.disableInput = function () {
        this.$input.attr('disabled', true);
    };

    this.enableInput = function () {
        this.$input.attr('disabled', false);
        this.$input.focus();
    };

    /*
        Changes the left and right bars to be floor.
    */
    this.initFloor = function () {
        this.$problem.removeClass('ceil');
        this.$problem.addClass('floor');
    };

    /*
        Changes the left and right bars to be ceil.
    */
    this.initCeil = function () {
        this.$problem.removeClass('floor');
        this.$problem.addClass('ceil');
    };

    /*
        Applies the fraction class to the bar to make them more visually appealing when the innerExpression contains factions.
        |isFraction| is required and a boolean.
    */
    this.adjustProblemForFraction = function (isFraction) {
        if (isFraction) {
            this.$innerExpression.addClass('fraction');
            this.$leftBar.addClass('fraction');
            this.$rightBar.addClass('fraction');
        } else {
            this.$innerExpression.removeClass('fraction');
            this.$leftBar.removeClass('fraction');
            this.$rightBar.removeClass('fraction');
        }
    };

    /*
        Generates a random whole number between 1 and 9.
    */
    this.generateWholeNumber = function () {
        var value = this.wholeNumbers.getValue();
        return new NumberRepresentation(value, value, false);
    };

    /*
        Generates a random number between 1.00 and 9.999.
    */
    this.generateDecimal = function (isNegative) {
        var wholeNumberPart = this.wholeNumbers.getValue();
        var decimalPart = this.utilities.pickNumberInRange(100, 999) / 1000;
        var value = wholeNumberPart + decimalPart;

        if (isNegative) {
            value *= -1;
        }

        var display = Number(value.toFixed(3));

        return new NumberRepresentation(value, display, false);
    };

    /*
        Generates a random fraction with a numerator between 1 and 30, and denominator between 1 and 9.
    */
    this.generateFraction = function () {
        var numerator = this.utilities.pickNumberInRange(1, 30);
        var denominator = this.utilities.pickNumberInRange(1, 9);

        var value = numerator / denominator;
        var display = '<sup>' + numerator + '</sup>/<sub>' + denominator + '</sub>';

        return new NumberRepresentation(value, display, true);
    };

    /*
        Will generate a random decimal, fraction, or a NumberRepresentation that represents pi.
    */
    this.generateRandomValue = function () {
        var random = this.utilities.pickNumberInRange(0, 2);
        var number;

        var isNegative = this.utilities.flipCoin();

        switch (random) {
            case 0:
                number = this.generateDecimal(isNegative);
                break;
            case 1:
                number = this.generateFraction();
                break;
            case 2:
                number = new NumberRepresentation(3.1, '&pi;', false);
                break;
        }

        return number;
    };

    /*
        Returns either the floor or ceil of |value| based on |floorOrCeil|.
        |value| is required and a decimal number.
        |floorOrCeil| is required and a string.
    */
    this.computeFloorOrCeil = function (value, floorOrCeil) {
        if (floorOrCeil === 'floor') {
            return Math.floor(value);
        } else if (floorOrCeil === 'ceil') {
            return Math.ceil(value);
        }
    };

    /*
        Walks through each step of how to solve a nested problem and explains.
        |problemDetails| is required and a dictionary.
        |innerExpressionHTML| is required and a string.
    */
    this.generateWalkThroughExplanation = function (problemDetails, innerExpressionHTML, innerExpressionExplantionHelp) {
        var openExplanationLine = '<div class=\'explanation ' + problemDetails.outerFloorOrCeil + '\'>';
        var leftBar = '<div class=\'leftBar\'></div>';
        var rightBar = '<div class=\'rightBar\'></div>';
        var closeExplanationLine = '</div>';

        var stateProblemLine = openExplanationLine + leftBar + '<div class=\'innerExpression\'>' + innerExpressionHTML + rightBar; // + '</div>' + closeExplanationLine;

        var simplifyFractionLine = '';

        if (problemDetails.number1.isFraction || problemDetails.number2.isFraction) {
            problemDetails.number1.display = problemDetails.number1.value;
            problemDetails.number2.display = problemDetails.number2.value;

            simplifyFractionLine = openExplanationLine + leftBar + '<div class=\'innerExpression\'>' + innerExpressionExplantionHelp + rightBar + '</div>' + closeExplanationLine + '<br>';
        }

        if (problemDetails.firstValueIsFloorOrCeil) {
            problemDetails.number1.value = this.computeFloorOrCeil(problemDetails.number1.value, problemDetails.innerFloorOrCeil);
            problemDetails.number1.display = Number(problemDetails.number1.value.toFixed(3));
        } else {
            problemDetails.number2.value = this.computeFloorOrCeil(problemDetails.number2.value, problemDetails.innerFloorOrCeil);
            problemDetails.number2.display = Number(problemDetails.number2.value.toFixed(3));
        }
        var computeNestLine = openExplanationLine + leftBar + Number(problemDetails.number1.value.toFixed(3)) + problemDetails.addOrSubtract + Number(problemDetails.number2.value.toFixed(3)) + rightBar + closeExplanationLine;

        var sum = 0;
        if (problemDetails.addOrSubtract === ' + ') {
            sum = Number((problemDetails.number1.value + problemDetails.number2.value).toFixed(3));
        } else if (problemDetails.addOrSubtract === ' - ') {
            sum = Number((problemDetails.number1.value - problemDetails.number2.value).toFixed(3));
        }
        var combineTermsLine = openExplanationLine + leftBar + sum + rightBar + closeExplanationLine;

        var showAnswerLine = this.computeFloorOrCeil(sum, problemDetails.outerFloorOrCeil);

        return '<div class="inline-block">Steps to solve: <br>' + stateProblemLine + '<br> ' + simplifyFractionLine + computeNestLine + '<br>' + combineTermsLine + '<br>' + showAnswerLine + '</div>';
    };

    /*
        Generates a random floor or ceil that adds or subtracts |number1| and |number2| and takes the floor or ceil of either the first or second number.
        |number1| is required and a dictionary with a double |value|, string |display| and boolean |isFraction|.
        |number2| is required and a dictionary with a double |value|, string |display| and boolean |isFraction|.
    */
    this.generateNestedProblem = function (number1, number2) {
        var outerFloorOrCeil = this.utilities.flipCoin() ? 'floor' : 'ceil';
        var innerFloorOrCeil = this.utilities.flipCoin() ? 'floor' : 'ceil';

        var additionalClasses = number1.isFraction || number2.isFraction ? ' fraction' : '';

        var innerExpressionValue;
        var innerExpressionHTML;
        var innerExpressionExplanationHelp;

        var openInnerFloorExpression = '<div class=\'problem floor\'>';
        var openInnerCeilExpression = '<div class=\'problem ceil\'>';

        var openInnerFloorCeilExpression = '<div class=\'leftBar' + additionalClasses + '\'></div><div class=\'innerExpression' + additionalClasses + '\'>';
        var closeInnerFloorCeilExpression = '</div><div class=\'rightBar' + additionalClasses + '\'></div></div>';

        var problemDetails = {
            number1: number1,
            number2: number2,
            outerFloorOrCeil: outerFloorOrCeil,
            innerFloorOrCeil: innerFloorOrCeil,
            addOrSubtract: '',
            firstValueIsFloorOrCeil: true
        };

        if (this.utilities.flipCoin()) {
            // First number is floor/ceil
            if (this.utilities.flipCoin()) {
                // Add the values
                problemDetails.addOrSubtract = ' + ';

                if (innerFloorOrCeil === 'floor') {
                    innerExpressionValue = Math.floor(number1.value) + number2.value;

                    // Ex: F(1.5) + 2.3
                    innerExpressionHTML = openInnerFloorExpression + openInnerFloorCeilExpression + number1.display + closeInnerFloorCeilExpression + ' + ' + number2.display + '</div>';
                    innerExpressionExplanationHelp = openInnerFloorExpression + openInnerFloorCeilExpression + Number(number1.value.toFixed(3)) + closeInnerFloorCeilExpression + ' + ' + Number(number2.value.toFixed(3)) + '</div>';
                } else if (innerFloorOrCeil === 'ceil') {
                    innerExpressionValue = Math.ceil(number1.value) + number2.value;

                    // Ex: C(1.5) + 2.3
                    innerExpressionHTML = openInnerCeilExpression + openInnerFloorCeilExpression + number1.display + closeInnerFloorCeilExpression + ' + ' + number2.display + '</div>';
                    innerExpressionExplanationHelp = openInnerCeilExpression + openInnerFloorCeilExpression + Number(number1.value.toFixed(3)) + closeInnerFloorCeilExpression + ' + ' + Number(number2.value.toFixed(3)) + '</div>';
                }
            } else {
                // Subtract the values
                problemDetails.addOrSubtract = ' - ';

                if (innerFloorOrCeil === 'floor') {
                    innerExpressionValue = Math.floor(number1.value) - number2.value;

                    // Ex: F(1.5) - 2.3
                    innerExpressionHTML = openInnerFloorExpression + openInnerFloorCeilExpression + number1.display + closeInnerFloorCeilExpression + ' - ' + number2.display + '</div>';
                    innerExpressionExplanationHelp = openInnerFloorExpression + openInnerFloorCeilExpression + Number(number1.value.toFixed(3)) + closeInnerFloorCeilExpression + ' - ' + Number(number2.value.toFixed(3)) + '</div>';
                } else if (innerFloorOrCeil === 'ceil') {
                    innerExpressionValue = Math.ceil(number1.value) - number2.value;

                    // Ex: C(1.5) - 2.3
                    innerExpressionHTML = openInnerCeilExpression + openInnerFloorCeilExpression + number1.display + closeInnerFloorCeilExpression + ' - ' + number2.display + '</div>';
                    innerExpressionExplanationHelp = openInnerCeilExpression + openInnerFloorCeilExpression + Number(number1.value.toFixed(3)) + closeInnerFloorCeilExpression + ' - ' + Number(number2.value.toFixed(3)) + '</div>';
                }
            }
        } else {
            // Second value is floor/ceil
            problemDetails.firstValueIsFloorOrCeil = false;

            if (this.utilities.flipCoin()) {
                // Add the values
                problemDetails.addOrSubtract = ' + ';

                if (innerFloorOrCeil === 'floor') {
                    innerExpressionValue = number1.value + Math.floor(number2.value);

                    // Ex: 1.5 + F(2.3)
                    innerExpressionHTML = number1.display + ' + ' + openInnerFloorExpression + openInnerFloorCeilExpression + number2.display + closeInnerFloorCeilExpression + '</div>';
                    innerExpressionExplanationHelp = Number(number1.value.toFixed(3)) + ' + ' + openInnerFloorExpression + openInnerFloorCeilExpression + Number(number2.value.toFixed(3)) + closeInnerFloorCeilExpression + '</div>';
                } else if (innerFloorOrCeil === 'ceil') {
                    innerExpressionValue = number1.value + Math.ceil(number2.value);

                    // Ex: 1.5 + C(2.3)
                    innerExpressionHTML = number1.display + ' + ' + openInnerCeilExpression + openInnerFloorCeilExpression + number2.display + closeInnerFloorCeilExpression + '</div>';
                    innerExpressionExplanationHelp = Number(number1.value.toFixed(3)) + ' + ' + openInnerCeilExpression + openInnerFloorCeilExpression + Number(number2.value.toFixed(3)) + closeInnerFloorCeilExpression + '</div>';
                }
            } else {
                // Subtract the values
                problemDetails.addOrSubtract = ' - ';

                if (innerFloorOrCeil === 'floor') {
                    innerExpressionValue = number1.value - Math.floor(number2.value);

                    // Ex: 1.5 - F(2.3)
                    innerExpressionHTML = number1.display + ' - ' + openInnerFloorExpression + openInnerFloorCeilExpression + number2.display + closeInnerFloorCeilExpression + '</div>';
                    innerExpressionExplanationHelp = Number(number1.value.toFixed(3)) + ' - ' + openInnerFloorExpression + openInnerFloorCeilExpression + Number(number2.value.toFixed(3)) + closeInnerFloorCeilExpression + '</div>';
                } else if (innerFloorOrCeil === 'ceil') {
                    innerExpressionValue = number1.value - Math.ceil(number2.value);

                    // Ex: 1.5 - C(2.3)
                    innerExpressionHTML = number1.display + ' - ' + openInnerCeilExpression + openInnerFloorCeilExpression + number2.display + closeInnerFloorCeilExpression + '</div>';
                    innerExpressionExplanationHelp = Number(number1.value.toFixed(3)) + ' - ' + openInnerCeilExpression + openInnerFloorCeilExpression + Number(number2.value.toFixed(3)) + closeInnerFloorCeilExpression + '</div>';
                }
            }
        }

        this.$innerExpression.html(innerExpressionHTML);
        this.adjustProblemForFraction(number1.isFraction || number2.isFraction);

        if (outerFloorOrCeil === 'floor') {
            this.initFloor();
            this.expectedAnswer = Math.floor(innerExpressionValue);
        } else if (outerFloorOrCeil === 'ceil') {
            this.initCeil();
            this.expectedAnswer = Math.ceil(innerExpressionValue);
        }

        this.explanationMessage = this.generateWalkThroughExplanation(problemDetails, innerExpressionHTML, innerExpressionExplanationHelp);
    };

    /*
        Generates a nested level question type based on |currentQuestion|.
        |currentQuestion| is required and an integer.
    */
    this.makeNestedLevel = function (currentQuestion) {
        var number1isNegative = this.utilities.flipCoin();

        switch (currentQuestion) {
            case 0:
                this.generateNestedProblem(this.generateDecimal(number1isNegative), this.generateDecimal());
                break;
            case 1:
                this.generateNestedProblem(this.generateFraction(), this.generateFraction());
                break;
            case 2:
            case 3:
                this.generateNestedProblem(this.generateRandomValue(), this.generateRandomValue());
                break;
        }
    };

    /*
        Generates a non-nested level question type based on |currentQuestion|.
        |currentQuestion| is required and an integer.
    */
    this.makeNonNestedLevel = function (currentQuestion) {
        var number;
        var floorOrCeil;

        this.isNegativeDecimalProblem = false;

        switch (currentQuestion) {
            case 0:
                floorOrCeil = 'floor';
                number = this.generateDecimal();
                break;
            case 1:
                floorOrCeil = 'ceil';
                number = this.generateDecimal();
                break;
            case 2:
                floorOrCeil = 'floor';
                this.isNegativeDecimalProblem = true;
                number = this.generateDecimal(this.isNegativeDecimalProblem);
                this.expectedWrongAnswer = this.computeFloorOrCeil(number.value, 'ceil');
                this.additionalExplanationMessage = '<br>Note: ' + this.expectedWrongAnswer + ' is not &le; to ' + number.value;
                break;
            case 3:
                floorOrCeil = 'ceil';
                this.isNegativeDecimalProblem = true;
                number = this.generateDecimal(this.isNegativeDecimalProblem);
                this.expectedWrongAnswer = this.computeFloorOrCeil(number.value, 'floor');
                this.additionalExplanationMessage = '<br>Note: ' + this.expectedWrongAnswer + ' is not &ge; to ' + number.value;
                break;
            case 4:
                floorOrCeil = 'floor';
                number = this.generateWholeNumber();
                break;
            case 5:
                floorOrCeil = 'ceil';
                number = this.generateWholeNumber();
                break;
            case 6:
                floorOrCeil = 'floor';
                number = this.generateFraction();
                break;
            case 7:
                floorOrCeil = 'ceil';
                number = this.generateFraction();
                break;
        }

        this.$innerExpression.html(number.display);
        this.adjustProblemForFraction(number.isFraction);

        if (floorOrCeil === 'floor') {
            this.initFloor();
            this.expectedAnswer = Math.floor(number.value);
            this.explanationMessage = 'The largest integer &le; to ' + number.display + ' is ' + this.expectedAnswer;
        } else if (floorOrCeil === 'ceil') {
            this.initCeil();
            this.expectedAnswer = Math.ceil(number.value);
            this.explanationMessage = 'The smallest integer &ge; to ' + number.display + ' is ' + this.expectedAnswer;
        }
    };

    this.makeLevel = function (currentQuestion) {
        this.$input.val('');

        if (this.useNestedQuestions) {
            this.makeNestedLevel(currentQuestion);
        } else {
            this.makeNonNestedLevel(currentQuestion);
        }
    };

    this.reset = function () {
        this.progressionTool.reset();
    };

    this["floorCeil"] = this["floorCeil"] || {};

    this["floorCeil"]["floorCeil"] = Handlebars.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
            return "<div class='floorCeil'>\n    <div class='instructions'>Fill in the integer</div>\n    <div class='problem'>\n        <div class='leftBar'></div>\n        <div class='innerExpression'></div>\n        <div class='rightBar'></div>\n    </div>\n    <span> = </span>\n    <input maxlength=\"6\" type=\"number\">\n</div>\n";
        }, "useData": true });
}

var floorCeilExport = {
    create: function create() {
        return new floorCeil();
    },
    dependencies: {
        "tools": ["progressionTool", "utilities"]
    }

};
module.exports = floorCeilExport;


exports.default = module.exports;
});