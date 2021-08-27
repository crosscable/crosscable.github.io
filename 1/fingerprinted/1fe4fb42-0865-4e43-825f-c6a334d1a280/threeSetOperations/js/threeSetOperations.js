define("threeSetOperations", ["exports"], function(exports) {
var module = {};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var moreOperationsDifferences = [{ op: '(A - B) - C', back: 0, A: 1, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(A - C) - B', back: 0, A: 1, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(B - A) - C', back: 0, A: 0, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(B - C) - A', back: 0, A: 0, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(C - B) - A', back: 0, A: 0, B: 0, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(C - A) - B', back: 0, A: 0, B: 0, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }];

var moreOperationsSymmetricDifferences = [{ op: '(A &oplus; B) &oplus; C', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(B &oplus; A) &oplus; C', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(C &oplus; A) &oplus; B', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }];

var moreOperationsComplement = [{ op: '<span style=\'text-decoration: overline\'>(A - B) - C</span>', back: 1, A: 0, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '<span style=\'text-decoration: overline\'>(A &cup; B) &cup; C</span>', back: 1, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '<span style=\'text-decoration: overline\'>(A &cap; B) &cap; C</span>', back: 1, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 0 }, { op: '<span style=\'text-decoration: overline\'>(A &oplus; B) &oplus; C</span>', back: 1, A: 0, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 0 }];

var moreOperationsTwoOperators = [{ op: '(A &oplus; B) &cup; C', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(A - B) &cup; C', back: 0, A: 1, B: 0, C: 1, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(A &oplus; B) - C', back: 0, A: 1, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(A - B) &oplus; C', back: 0, A: 1, B: 0, C: 1, AuB: 0, AuC: 0, BuC: 1, AuBuC: 1 }];

var moreOperationsThreeOperators = [{ op: '(<span style=\'text-decoration: overline\'>A</span> - B) - C', back: 1, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(<span style=\'text-decoration: overline\'>A</span> - B) &oplus; C', back: 1, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(<span style=\'text-decoration: overline\'>A</span> &cup; B) - C', back: 1, A: 0, B: 1, C: 0, AuB: 1, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(<span style=\'text-decoration: overline\'>A</span> &cap; B) - C', back: 0, A: 0, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }, { op: '(A - B) - <span style=\'text-decoration: overline\'>C</span>', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 0, AuBuC: 0 }, { op: '(A &cup; <span style=\'text-decoration: overline\'>B</span>) &oplus; C', back: 1, A: 1, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 0 }];

var moreOperationsQuestions = [moreOperationsDifferences, moreOperationsSymmetricDifferences, moreOperationsComplement, moreOperationsTwoOperators, moreOperationsThreeOperators];

function ThreeSetOperations() {
    this.init = function (id, eventManager, options) {
        switch (options.type) {
            case 'unionIntersection':
                this.questionsByLevel = unionIntersectionsQuestions;
                break;
            case 'moreOperations':
                this.questionsByLevel = moreOperationsQuestions;
                break;
        }

        var utilities = require('utilities');
        this.questionsByLevel = this.questionsByLevel.map(function (questions) {
            return utilities.getCarousel(questions);
        });

        var html = this['threeSetOperations']['threeSetOperations']({ id: id });
        var self = this;
        require('progressionTool').create().init(id, eventManager, {
            html: html,
            css: '<style>.zyante-bold{font-family:HelveticaNeue-Light,"Helvetica Neue Light","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;font-weight:300}.zyante-section-bold{font-family:Helvetica;font-weight:300}.threeSetOperations .canvasRegion{display:inline-block}.threeSetOperations .enabled{cursor:pointer}.threeSetOperations .instructionExplanationArea{height:40px;line-height:20px;text-align:center;width:300px}.threeSetOperations .vennDiag{border:2px solid #646464;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}</style>',
            numToWin: 5,
            useMultipleParts: true,
            start: function start() {
                self.$userInputVenn.addClass('enabled');
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

                var isAnswerCorrect = self.checkCorrectnessOfRegion(sectionState[0], currQuestionToDisplay.back) && self.checkCorrectnessOfRegion(sectionState[1], currQuestionToDisplay.A) && self.checkCorrectnessOfRegion(sectionState[2], currQuestionToDisplay.B) && self.checkCorrectnessOfRegion(sectionState[3], currQuestionToDisplay.C) && self.checkCorrectnessOfRegion(sectionState[4], currQuestionToDisplay.AuB) && self.checkCorrectnessOfRegion(sectionState[6], currQuestionToDisplay.AuC) && self.checkCorrectnessOfRegion(sectionState[8], currQuestionToDisplay.BuC) && self.checkCorrectnessOfRegion(sectionState[10], currQuestionToDisplay.AuBuC);

                /*
                    The diagram is drawn with 14 partial circles. The state of each partial is stored in |sectionState|.
                    Some partial circles are connected to represent a part of the diagram.
                    The following partial circles are connected:
                    * sectionState[4] and sectionState[5]
                    * sectionState[6] and sectionState[7]
                    * sectionState[8] and sectionState[9]
                    * sectionState[10] - sectionState[13]
                */
                var userAnswer = [sectionState[0], sectionState[1], sectionState[2], sectionState[3], sectionState[4], sectionState[6], sectionState[8], sectionState[10]].join(',');

                var expectedAnswer = [currQuestionToDisplay.back, currQuestionToDisplay.A, currQuestionToDisplay.B, currQuestionToDisplay.C, currQuestionToDisplay.AuB, currQuestionToDisplay.AuC, currQuestionToDisplay.BuC, currQuestionToDisplay.AuBuC].join(',');

                var explanationMessage = 'Correct.';
                if (!isAnswerCorrect) {
                    self.showCorrectAnswer(currQuestionToDisplay.back, currQuestionToDisplay.left, currQuestionToDisplay.right, currQuestionToDisplay.center);
                    self.$solutionRegion.css('visibility', 'visible');
                    explanationMessage = 'See solution.';
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer: userAnswer,
                    expectedAnswer: expectedAnswer,
                    isCorrect: isAnswerCorrect
                };
            }
        });

        this.$instructions = $('#instructions_' + id);
        this.$explanations = $('#explanations_' + id);
        this.$userInputVenn = $('#userInputVenn_' + id);
        this.$solutionRegion = $('#solutionRegion_' + id);
        this.$correctAnswerVenn = $('#correctAnswerVenn_' + id);

        this.$instructions.text('Select the regions corresponding to the set denoted by the given expression.');
        this.$explanations.text('Solution shaded below');
        this.$solutionRegion.css('visibility', 'hidden');

        this.initUserInputAndCorrectAnswerVenn();
    };

    var questionCntr = 0;
    var currQuestionToDisplay;
    this.displayQuestion = function (currentQuestion) {
        currQuestionToDisplay = this.questionsByLevel[currentQuestion].getValue();
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
    var sectionState = [this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial, this.states.initial];

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
        var topCircle_x = 150;
        var topCircle_y = 75;
        var lowerTwoCriclesDistFromTopC_y = 50;
        var lowerTwoCirclesDistFromTopC_x = 30;

        var self = this;
        this.$userInputVenn.drawRect({ // background
            layer: true,
            fillStyle: defaultFillColor,
            width: 300,
            height: 200,
            x: 150, y: 100,
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
        }).drawArc({ // only A (top)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            /* start: 265, end: 95,*/
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
        }).drawArc({ // only B (bottom left)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            /* start: 140, end: 335,*/
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
        }).drawArc({ // only C (bottom right)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            /* start: 25, end: 220,*/
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 155, end: 265,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseover');
                    self.sectionSM(5, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseout');
                    self.sectionSM(5, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 335, end: 85,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseover');
                    self.sectionSM(5, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseout');
                    self.sectionSM(5, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 95, end: 205,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseover');
                    self.sectionSM(7, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseout');
                    self.sectionSM(7, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 275, end: 25,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseover');
                    self.sectionSM(7, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseout');
                    self.sectionSM(7, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 35, end: 145,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseover');
                    self.sectionSM(9, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseout');
                    self.sectionSM(9, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 215, end: 325,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseover');
                    self.sectionSM(9, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseout');
                    self.sectionSM(9, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union B union C - Bottom-side of A
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 153, end: 207,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union B union C - Right-side of B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 33, end: 87,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({ // A union B union C - Left-side of C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 273, end: 327,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawPolygon({
            layer: true,
            fillStyle: defaultFillColor,
            x: topCircle_x, y: 109,
            radius: 23,
            sides: 3,
            click: function click() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function touchstart() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function mouseover() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function mouseout() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(150, 150, 150)',
            strokeWidth: 1,
            x: 15, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'U'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 1,
            x: topCircle_x, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'A'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 1,
            x: topCircle_x - 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'B'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 1,
            x: topCircle_x + 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'C'
        });

        self.$userInputVenn.mouseout(function () {
            if (self.$userInputVenn.hasClass('enabled')) {
                self.sectionSM(0, 'mouseout');
                self.$userInputVenn.drawLayers();
            }
        });

        self.$userInputVenn.mouseover(function () {
            if (self.$userInputVenn.hasClass('enabled')) {
                self.sectionSM(0, 'mouseover');
                self.$userInputVenn.drawLayers();
            }
        });

        self.$correctAnswerVenn.drawRect({ // background
            layer: true,
            fillStyle: defaultFillColor,
            width: 300,
            height: 200,
            x: 150, y: 100
        }).drawArc({ // only A (top)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50
            /* start: 265, end: 95,*/
        }).drawArc({ // only B (bottom left)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50
            /* start: 140, end: 335,*/
        }).drawArc({ // only C (bottom right)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50
            /* start: 25, end: 220,*/
        }).drawArc({ // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 155, end: 265
        }).drawArc({ // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 335, end: 85
        }).drawArc({ // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 95, end: 205
        }).drawArc({ // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 275, end: 25
        }).drawArc({ // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 35, end: 145
        }).drawArc({ // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 215, end: 325
        }).drawArc({ // A union B union C - Bottom-side of A
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 153, end: 207
        }).drawArc({ // A union B union C - Right-side of B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 33, end: 87
        }).drawArc({ // A union B union C - Left-side of C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 273, end: 327
        }).drawPolygon({
            layer: true,
            fillStyle: defaultFillColor,
            x: topCircle_x, y: 109,
            radius: 23,
            sides: 3
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(150, 150, 150)',
            strokeWidth: 1,
            x: 15, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'U'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 1,
            x: topCircle_x, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'A'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 1,
            x: topCircle_x - 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'B'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 1,
            x: topCircle_x + 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'C'
        });
    };

    this.resetUserInputVenn = function () {
        for (var i = 0; i < sectionState.length; i++) {
            sectionState[i] = 0;
            this.sectionSM(i, 'nothing');
        }
        this.$userInputVenn.drawLayers();
    };

    this.showCorrectAnswer = function () {
        var vennLayers = this.$correctAnswerVenn.data().jCanvas.layers;

        this.$correctAnswerVenn.setLayer(vennLayers[0], {
            fillStyle: currQuestionToDisplay.back ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[1], {
            fillStyle: currQuestionToDisplay.A ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[2], {
            fillStyle: currQuestionToDisplay.B ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[3], {
            fillStyle: currQuestionToDisplay.C ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[4], {
            fillStyle: currQuestionToDisplay.AuB ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[5], {
            fillStyle: currQuestionToDisplay.AuB ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[6], {
            fillStyle: currQuestionToDisplay.AuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[7], {
            fillStyle: currQuestionToDisplay.AuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[8], {
            fillStyle: currQuestionToDisplay.BuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[9], {
            fillStyle: currQuestionToDisplay.BuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[10], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[11], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[12], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[13], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.drawLayers();
    };

    /// /////////// End Venn diagram helper functions ///////////

    this["threeSetOperations"] = this["threeSetOperations"] || {};

    this["threeSetOperations"]["threeSetOperations"] = Handlebars.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
            var helper,
                alias1 = depth0 != null ? depth0 : container.nullContext || {},
                alias2 = helpers.helperMissing,
                alias3 = "function",
                alias4 = container.escapeExpression;

            return "<div class=\"canvasRegion\">\r\n    <p id=\"instructions_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"instructionExplanationArea\"></p>\r\n    <canvas id=\"userInputVenn_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"vennDiag\" width=\"300\" height=\"200\"></canvas>\r\n</div>\r\n\r\n<div id=\"solutionRegion_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"canvasRegion\">\r\n    <p id=\"explanations_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"instructionExplanationArea\"></p>\r\n    <canvas id=\"correctAnswerVenn_" + alias4((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2, (typeof helper === 'undefined' ? 'undefined' : _typeof(helper)) === alias3 ? helper.call(alias1, { "name": "id", "hash": {}, "data": data }) : helper)) + "\" class=\"vennDiag\" width=\"300\" height=\"200\"></canvas>\r\n</div>";
        }, "useData": true });
}

var threeSetOperationsExport = {
    create: function create() {
        return new ThreeSetOperations();
    },
    dependencies: {
        "tools": ["progressionTool", "utilities"],
        "vendorJS": ["jcanvas.min.js"]
    }
};
module.exports = threeSetOperationsExport;

var singleVariableQuestions = [{ op: 'A', back: 0, A: 1, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 0, AuBuC: 1 }, { op: 'B', back: 0, A: 0, B: 1, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 1 }, { op: 'C', back: 0, A: 0, B: 0, C: 1, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }];

var twoVariableUnionQuestions = [{ op: 'A &cup; B', back: 0, A: 1, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: 'A &cup; C', back: 0, A: 1, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: 'B &cup; A', back: 0, A: 1, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: 'B &cup; C', back: 0, A: 0, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: 'C &cup; A', back: 0, A: 1, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: 'C &cup; B', back: 0, A: 0, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }];

var twoVariableIntersectionQuestions = [{ op: 'A &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 0, AuBuC: 1 }, { op: 'A &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 0, AuBuC: 1 }, { op: 'B &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 0, AuBuC: 1 }, { op: 'B &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 1, AuBuC: 1 }, { op: 'C &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 0, AuBuC: 1 }, { op: 'C &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 1, AuBuC: 1 }];

var threeVariableQuestionsOneOperator = [{ op: '(A &cup; B) &cup; C', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(A &cup; C) &cup; B', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(B &cup; A) &cup; C', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(B &cup; C) &cup; A', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(C &cup; A) &cup; B', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(C &cup; B) &cup; A', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(A &cap; B) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(A &cap; C) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(B &cap; A) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(B &cap; C) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(C &cap; A) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }, { op: '(C &cap; B) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }];

var threeVariableQuestionsTwoOperators = [{ op: '(A &cup; B) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(A &cup; C) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 1 }, { op: '(B &cup; A) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(B &cup; C) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 0, AuBuC: 1 }, { op: '(C &cup; A) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 1 }, { op: '(C &cup; B) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 0, AuBuC: 1 }, { op: '(A &cap; B) &cup; C', back: 0, A: 0, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(A &cap; C) &cup; B', back: 0, A: 0, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(B &cap; A) &cup; C', back: 0, A: 0, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(B &cap; C) &cup; A', back: 0, A: 1, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(C &cap; A) &cup; B', back: 0, A: 0, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }, { op: '(C &cap; B) &cup; A', back: 0, A: 1, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }];

var unionIntersectionsQuestions = [singleVariableQuestions, twoVariableUnionQuestions, twoVariableIntersectionQuestions, threeVariableQuestionsOneOperator, threeVariableQuestionsTwoOperators];


exports.default = module.exports;
});