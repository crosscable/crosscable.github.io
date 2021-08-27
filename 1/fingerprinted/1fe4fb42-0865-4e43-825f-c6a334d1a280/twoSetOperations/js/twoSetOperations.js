define("twoSetOperations", ["exports"], function(exports) {
var module = {};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function TwoSetOperations() {
    this.init = function (id, eventManager, options) {
        this.name = 'twoSetOperations';
        this.id = id;
        this.eventManager = eventManager;

        this.isLayPersonEdition = options && options.layPersonEdition;
        this.useMultipleParts = options && options.useMultipleParts;

        var css = '<style>.zyante-bold{font-family:HelveticaNeue-Light,"Helvetica Neue Light","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;font-weight:300}.zyante-section-bold{font-family:Helvetica;font-weight:300}.twoSetOperations .canvasRegion{display:inline-block}.twoSetOperations .enabled{cursor:pointer}.twoSetOperations .instructionExplanationArea{height:40px;line-height:20px;text-align:center;width:300px}.twoSetOperations .vennDiag{border:2px solid #646464;height:150px;width:300px;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}</style>';
        var html = this[this.name]['twoSetOperations']({ id: this.id });

        this.progressionTool = require('progressionTool').create();

        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html: html,
            css: css,
            numToWin: 5,
            useMultipleParts: this.useMultipleParts,
            start: function start() {
                self.$userInputVenn.addClass('enabled');
                self.shuffleQuestions();
                self.displayQuestion(0);
            },
            reset: function reset() {
                self.$userInputVenn.removeClass('enabled');
                self.$solutionRegion.css('visibility', 'hidden');
                self.resetUserInputVenn();
            },
            next: function next(currentQuestion) {
                self.$userInputVenn.addClass('enabled');
                self.$solutionRegion.css('visibility', 'hidden');
                self.displayQuestion(currentQuestion);
                self.resetUserInputVenn();
            },
            isCorrect: function isCorrect(currentQuestion) {
                self.$userInputVenn.removeClass('enabled');

                var isAnswerCorrect = self.checkCorrectnessOfRegion(sectionState[0], currQuestionToDisplay.back) && self.checkCorrectnessOfRegion(sectionState[1], currQuestionToDisplay.left) && self.checkCorrectnessOfRegion(sectionState[2], currQuestionToDisplay.right) && self.checkCorrectnessOfRegion(sectionState[3], currQuestionToDisplay.center);

                /*
                    The diagram is drawn with 5 partial circles. The state of each partial is stored in |sectionState|.
                    Some partial circles are connected to represent a part of the diagram.
                    The following partial circles are connected:
                    * sectionState[3] and sectionState[4]
                */
                var userAnswer = sectionState.slice(0, 4).join(',');
                var expectedAnswer = [currQuestionToDisplay.back, currQuestionToDisplay.left, currQuestionToDisplay.right, currQuestionToDisplay.center].join(',');

                var explanationMessage = '';
                if (!isAnswerCorrect) {
                    self.showCorrectAnswer(currQuestionToDisplay.back, currQuestionToDisplay.left, currQuestionToDisplay.right, currQuestionToDisplay.center);
                    self.$solutionRegion.css('visibility', 'visible');
                    explanationMessage = 'See solution.';
                } else {
                    explanationMessage = 'Correct.';
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer: userAnswer,
                    expectedAnswer: expectedAnswer,
                    isCorrect: isAnswerCorrect
                };
            }
        });

        this.$instructions = $('#instructions_' + this.id);
        this.$explanations = $('#explanations_' + this.id);
        this.$userInputVenn = $('#userInputVenn_' + this.id);
        this.$solutionRegion = $('#solutionRegion_' + this.id);
        this.$correctAnswerVenn = $('#correctAnswerVenn_' + this.id);

        this.$instructions.text('Select the regions corresponding to the set denoted by the given expression.');
        this.$explanations.text('');
        this.$solutionRegion.css('visibility', 'hidden');

        this.initUserInputAndCorrectAnswerVenn();
    };

    var easyQuestions = [{ op: '<span style=\'text-decoration: overline\'>A</span>', left: 0, center: 0, right: 1, back: 1 }, { op: 'B', left: 0, center: 1, right: 1, back: 0 }, { op: 'A', left: 1, center: 1, right: 0, back: 0 }, { op: '<span style=\'text-decoration: overline\'>B</span>', left: 1, center: 0, right: 0, back: 1 }];

    var moderateQuestions = [{ op: 'B - A', left: 0, center: 0, right: 1, back: 0 }, { op: 'A &cap; B', left: 0, center: 1, right: 0, back: 0 }, { op: 'A - B', left: 1, center: 0, right: 0, back: 0 }, { op: 'A &cup; B', left: 1, center: 1, right: 1, back: 0 }];

    var symmetricDifferenceQuestions = [{ op: 'A &oplus; B', left: 1, center: 0, right: 1, back: 0 }, { op: 'B &oplus; A', left: 1, center: 0, right: 1, back: 0 }, { op: '<span style=\'text-decoration: overline\'>A &oplus; B</span>', left: 0, center: 1, right: 0, back: 1 }];

    var hardQuestions = [{ op: '(B - A) &cup; (A - B)', left: 1, center: 0, right: 1, back: 0 }, { op: '<span style=\'text-decoration: overline\'>A</span> &cap; <span style=\'text-decoration: overline\'>B</span>', left: 0, center: 0, right: 0, back: 1 }, { op: 'B &cup; <span style=\'text-decoration: overline\'>A</span>', left: 0, center: 1, right: 1, back: 1 }, { op: '<span style=\'text-decoration: overline\'>A</span> &cup; <span style=\'text-decoration: overline\'>B</span>', left: 1, center: 0, right: 1, back: 1 }, { op: '<span style=\'text-decoration: overline\'>B</span> &cup; A', left: 1, center: 1, right: 0, back: 1 }];

    var layPersonQuestions = [{ op: '<span style=\'text-decoration: overline\'>A</span>', left: 0, center: 0, right: 1, back: 1 }, { op: 'B', left: 0, center: 1, right: 1, back: 0 }, { op: 'A', left: 1, center: 1, right: 0, back: 0 }, { op: '<span style=\'text-decoration: overline\'>B</span>', left: 1, center: 0, right: 0, back: 1 }, { op: 'B - A', left: 0, center: 0, right: 1, back: 0 }, { op: 'A &cap; B', left: 0, center: 1, right: 0, back: 0 }, { op: 'A - B', left: 1, center: 0, right: 0, back: 0 }, { op: 'A &cup; B', left: 1, center: 1, right: 1, back: 0 }];

    this.shuffleArray = function (array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        while (currentIndex > 0) {
            // While there remain elements to shuffle
            randomIndex = Math.floor(Math.random() * currentIndex); // Randomly pick a remaining element
            currentIndex--;

            // Swap the randomly selected element with the current index element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    };

    this.shuffleQuestions = function () {
        this.shuffleArray(easyQuestions);
        this.shuffleArray(moderateQuestions);
        this.shuffleArray(symmetricDifferenceQuestions);
        this.shuffleArray(hardQuestions);
        this.shuffleArray(layPersonQuestions);
    };

    var questionCntr = 0;
    var currQuestionToDisplay;
    this.displayQuestion = function (currentQuestion) {
        var nextQuestionsArray = [];
        if (!this.isLayPersonEdition) {
            switch (currentQuestion) {
                case 0:
                    nextQuestionsArray = easyQuestions;
                    break;
                case 1:
                    nextQuestionsArray = moderateQuestions;
                    break;
                case 2:
                    nextQuestionsArray = symmetricDifferenceQuestions;
                    break;
                case 3:
                case 4:
                    nextQuestionsArray = hardQuestions;
                    break;
            }
        } else {
            nextQuestionsArray = layPersonQuestions;
        }

        currQuestionToDisplay = nextQuestionsArray[++questionCntr % nextQuestionsArray.length];

        this.$instructions.html('Select the region(s) of:<br/>' + currQuestionToDisplay.op);
    };

    /// /////// Start Venn diagram helper functions ////////////////

    this.states = {
        initial: 0, // not clicked or hovered
        clicked: 1,
        hovered: 2
    };

    this.checkCorrectnessOfRegion = function (currentState, shouldBeClicked) {
        var isCorrect = true;

        if (shouldBeClicked) {
            if (currentState !== this.states.clicked) {
                isCorrect = false;
            }
        } else {
            if (currentState === this.states.clicked) {
                isCorrect = false;
            }
        }

        return isCorrect;
    };

    var defaultFillColor = 'white';
    var hoverFillColor = 'rgb(227, 227, 227)';
    var selectedFillColor = 'rgb(200, 200, 200)';
    var sectionState = [this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial];

    this.isTouchDevice = function () {
        return !!('ontouchstart' in window);
    };

    this.sectionSM = function (i, action) {
        var state = sectionState[i];
        var self = this;
        switch (state) {// transitions
            case this.states.initial:
                if (action === 'mouseover') {
                    if (!self.isTouchDevice()) {
                        state = this.states.hovered;
                    }
                } else if (action === 'click') {
                    state = this.states.clicked;
                }
                break;
            case this.states.clicked:
                if (action === 'click') {
                    if (self.isTouchDevice()) {
                        state = this.states.initial;
                    } else {
                        state = this.states.hovered;
                    }
                }
                break;
            case this.states.hovered:
                if (action === 'mouseout') {
                    if (!self.isTouchDevice()) {
                        state = this.states.initial;
                    }
                } else if (action === 'click') {
                    state = this.states.clicked;
                }
                break;
            default:
                state = this.states.initial;
        }

        switch (state) {// actions
            case this.states.initial:
                self.$userInputVenn.setLayer(self.$userInputVenn.data().jCanvas.layers[i], {
                    fillStyle: defaultFillColor
                });
                break;
            case this.states.clicked:
                self.$userInputVenn.setLayer(self.$userInputVenn.data().jCanvas.layers[i], {
                    fillStyle: selectedFillColor
                });
                break;
            case this.states.hovered:
                self.$userInputVenn.setLayer(self.$userInputVenn.data().jCanvas.layers[i], {
                    fillStyle: hoverFillColor
                });
                break;
        }

        sectionState[i] = state;
    };

    this.initUserInputAndCorrectAnswerVenn = function () {
        var leftCircStart = 145;
        var leftCircEnd = 35;
        var rightCircStart = -35;
        var rightCircEnd = 215;
        var setOps_2sets_venn_leftCircleColor = 'rgb(0, 0, 255)';
        var setOps_2sets_venn_rightCircleColor = 'rgb(128, 0, 128)';
        var setOps_2sets_venn_x = 120;
        var setOps_2sets_venn_y = 75;
        var setOps_2sets_venn_radius = 50;
        var setOps_2sets_venn_strokeWidth = 2;

        var self = this;
        this.$userInputVenn.drawRect({ // background
            layer: true,
            fillStyle: defaultFillColor,
            width: 600,
            height: 300,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // only A
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_leftCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: leftCircStart, end: leftCircEnd,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // only B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_rightCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x + 60, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: rightCircStart, end: rightCircEnd,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // (A intersect B)'s left-half
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_rightCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x + 60, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: rightCircEnd, end: rightCircStart,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.sectionSM(4, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.sectionSM(4, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseover');
                    self.sectionSM(4, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseout');
                    self.sectionSM(4, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // (A intersect B)'s right-half
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_leftCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: leftCircEnd, end: leftCircStart,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.sectionSM(4, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.sectionSM(4, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseover');
                    self.sectionSM(4, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseout');
                    self.sectionSM(4, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(100, 100, 100)',
            strokeWidth: 1,
            x: 15, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'U'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 1,
            x: 72, y: 35,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'A'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 1,
            x: 228, y: 35,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'B'
        });

        this.$userInputVenn.mouseout(function () {
            if (self.$userInputVenn.hasClass('enabled')) {
                self.sectionSM(0, 'mouseout');
                self.$userInputVenn.drawLayers();
            }
        });

        this.$userInputVenn.mouseover(function () {
            if (self.$userInputVenn.hasClass('enabled')) {
                self.sectionSM(0, 'mouseover');
                self.$userInputVenn.drawLayers();
            }
        });

        this.$correctAnswerVenn.drawRect({ // background
            layer: true,
            fillStyle: defaultFillColor,
            width: 600,
            height: 300
        }).drawArc({ // only A
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_leftCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: leftCircStart, end: leftCircEnd
        }).drawArc({ // only B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_rightCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x + 60, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: rightCircStart, end: rightCircEnd
        }).drawArc({ // (A intersect B)'s left-half
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_rightCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x + 60, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: rightCircEnd, end: rightCircStart
        }).drawArc({ // (A intersect B)'s right-half
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: setOps_2sets_venn_leftCircleColor,
            strokeWidth: setOps_2sets_venn_strokeWidth,
            x: setOps_2sets_venn_x, y: setOps_2sets_venn_y,
            radius: setOps_2sets_venn_radius,
            start: leftCircEnd, end: leftCircStart
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(100, 100, 100)',
            strokeWidth: 1,
            x: 15, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'U'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 1,
            x: 72, y: 35,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'A'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 1,
            x: 228, y: 35,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'B'
        });
    };

    this.resetUserInputVenn = function () {
        for (var i = 0; i < sectionState.length; i++) {
            sectionState[i] = 0;
            this.sectionSM(i, 'nothing');
        }
        this.$userInputVenn.drawLayers();
    };

    this.showCorrectAnswer = function (back, left, right, center) {
        var vennLayers = this.$correctAnswerVenn.data().jCanvas.layers;

        this.$correctAnswerVenn.setLayer(vennLayers[0], {
            fillStyle: back ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[1], {
            fillStyle: left ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[2], {
            fillStyle: right ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[3], {
            fillStyle: center ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[4], {
            fillStyle: center ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.drawLayers();
    };

    /// /////////// End Venn diagram helper functions ///////////

    this["twoSetOperations"] = this["twoSetOperations"] || {};

    this["twoSetOperations"]["twoSetOperations"] = Handlebars.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
            var helper,
                alias1 = depth0 != null ? depth0 : container.nullContext || {},
                alias2 = helpers.helperMissing,
                alias3 = "function",
                alias4 = container.escapeExpression;

            return "<div class=\"canvasRegion\">\r\n    <p id=\"instructions_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"instructionExplanationArea\"></p>\r\n    <canvas id=\"userInputVenn_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"vennDiag\"></canvas>\r\n</div>\r\n\r\n<div id=\"solutionRegion_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"canvasRegion\">\r\n    <p id=\"explanations_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"instructionExplanationArea\"></p>\r\n    <canvas id=\"correctAnswerVenn_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"vennDiag\"></canvas>\r\n</div>";
        }, "useData": true });
}

var twoSetOperationsExport = {
    create: function create() {
        return new TwoSetOperations();
    },
    dependencies: {
        "tools": ["progressionTool"],
        "vendorJS": ["jcanvas.min.js"]
    }
};
module.exports = twoSetOperationsExport;


exports.default = module.exports;
});