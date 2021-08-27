define("PropositionalCalculusSDK", ["exports"], function(exports) {
var module = {};
'use strict';

/* global ExpressionPart, Constant, Expression, OPERATOR_SYMBOLS, CONSTANT_SYMBOLS */

/* exported buildDigitalExpressionPrototype */

/**
    Expressions using digital design printing standards.
    @class DigitalExpression
    @extends Expression
    @constructor
    @param {MathSymbol} root The root symbol of the expression.
*/

function DigitalExpression(root) {
    Expression.prototype.constructor.call(this, root);
    this.utilities = require('utilities');
}

/**
    Build the prototype.
    @method buildDigitalExpressionPrototype
    @return {void}
*/
function buildDigitalExpressionPrototype() {
    DigitalExpression.prototype = new Expression();
    DigitalExpression.prototype.constructor = DigitalExpression;

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.shouldPrintParens = function (symbol, parentSymbol) {

        // |root| does not need parens since entire expression doesn't need to be in parens.
        var symbolIsRoot = symbol.is(this.root);

        // NOT does not need parens. Ex: a'
        var symbolIsNot = symbol.name === OPERATOR_SYMBOLS.NOT;

        // AND does not have parens. Ex: ab
        var symbolIsAnd = symbol.name === OPERATOR_SYMBOLS.AND;
        var generalReasonsToNotHaveParens = symbolIsRoot || symbolIsAnd || symbolIsNot;

        /*
            Usually AND does not have parens, but if |parentSymbol| is NOT, then add parens.
            Ex: (ab)'
        */
        var parentSymbolIsNot = parentSymbol && parentSymbol.name === OPERATOR_SYMBOLS.NOT;
        var symbolIsAndParentSymbolIsNot = symbolIsAnd && parentSymbolIsNot;

        // |symbol| is not |root| but is AND. Also, |symbol| has a child that is a Constant.
        var symbolIsAndAChildIsConstant = false;

        if (symbolIsAnd) {
            symbolIsAndAChildIsConstant = symbol.children[0] instanceof Constant || symbol.children[1] instanceof Constant;
        }
        var symbolIsNotRootButIsAndAChildIsConstant = !symbolIsRoot && symbolIsAndAChildIsConstant;

        /*
            Usually AND does not have parens, but if one of the childs is an OR operator, then add parens.
            Avoid y AND (x AND (z OR z')) to be printed the same as (y AND z) AND (z OR z')
            Ex: y(x(z+z'))
        */
        var symbolIsAndAChildIsOr = false;

        if (symbolIsAnd) {
            symbolIsAndAChildIsOr = symbol.children[0].name === 'OR' || symbol.children[1].name === 'OR';
        }

        var symbolIsNotRootButIsAndAChildIsOr = !symbolIsRoot && symbolIsAndAChildIsOr;

        return !generalReasonsToNotHaveParens || symbolIsAndParentSymbolIsNot || symbolIsNotRootButIsAndAChildIsConstant || symbolIsNotRootButIsAndAChildIsOr;
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printConstantSymbol = function (constant) {
        return constant.name === CONSTANT_SYMBOLS.TRUE ? '1' : '0';
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printNotOperator = function (parts, symbol) {
        parts.push(new ExpressionPart('\'', symbol));
        return parts;
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printAndOperator = function (parts, andOperator) {

        // If either child is a Constant, use the multiplication symbol.
        var aChildIsConstant = andOperator.children[0] instanceof Constant || andOperator.children[1] instanceof Constant;

        if (aChildIsConstant) {
            parts.push(new ExpressionPart(this.utilities.multiplicationSymbol, andOperator));
        }

        return parts.concat(this._toPartsHelper(andOperator.children[1], andOperator));
    };

    /**
        @inheritdoc
    */
    DigitalExpression.prototype.printOrOperator = function (parts, orOperator) {
        parts.push(new ExpressionPart('+', orOperator));
        return parts.concat(this._toPartsHelper(orOperator.children[1], orOperator));
    };

    /**
        Make a clone of this expression.
        @method clone
        @return {DigitalExpression} A clone of this expression.
    */
    DigitalExpression.prototype.clone = function () {
        return Expression.prototype.clone.call(this, new DigitalExpression());
    };
}

'use strict';

/* global Operator, Variable, Constant, ExpressionPart, OPERATOR_SYMBOLS */

/**
    Expression is an abstract object that represents an expression as a tree structure. Ex: x + y'
    @class Expression
    @constructor
    @param {MathSymbol} root The symbol at the top of the tree.
*/
function Expression(root) {
    this.root = root;
}

/**
    Return the parent of |symbolToFind|. Return null if parent not found.
    @method parentOf
    @param {MathSymbol} symbolToFind The symbol whose parent is to be found.
    @return {MathSymbol} The parent of |symbolToFind|.
*/
Expression.prototype.parentOf = function (symbolToFind) {
    if (!symbolToFind.is(this.root)) {
        return this.parentOfHelper(symbolToFind, this.root);
    }
    return null;
};

/**
    Search for the parent of |symbolToFind| by traversing from |currentSymbol|. Return null if parent not found.
    @method parentOfHelper
    @private
    @param {MathSymbol} symbolToFind The symbol to find.
    @param {MathSymbol} currentSymbol The current symbol in the traversal.
    @return {MathSymbol} The parent of |symbolToFind|.
*/
Expression.prototype.parentOfHelper = function (symbolToFind, currentSymbol) {
    var parent = null;

    // If |currentSymbol| is not an Operator, then we've hit a dead end.
    if (currentSymbol instanceof Operator) {

        // Check if |symbolToFind| is one of |currentSymbol|'s children.
        var childrenSymbolsThatMatchSymbolToFind = currentSymbol.children.filter(function (child) {
            return symbolToFind.is(child);
        });

        if (childrenSymbolsThatMatchSymbolToFind.length === 1) {
            parent = currentSymbol;
        } else {
            var self = this;
            var parentSymbol = null;

            currentSymbol.children.forEach(function (child) {
                parentSymbol = parentSymbol || self.parentOfHelper(symbolToFind, child);
            });
            parent = parentSymbol;
        }
    }

    return parent;
};

/**
    Print the expression.
    @method print
    @return {String} The printed current symbol.
*/
Expression.prototype.print = function () {
    return this.toParts().map(function (part) {
        return part.output;
    }).join('');
};

/**
    Return an array of expression parts.
    @method toParts
    @return {Array} Array of {ExpressionPart} wherein each object stores output and symbol.
*/
Expression.prototype.toParts = function () {
    return this._toPartsHelper(this.root, null);
};

/**
    Return an array of expression parts via depth-first traversal from |root|.
    @method _toPartsHelper
    @private
    @param {MathSymbol} symbol The current symbol in the traversal to be printed.
    @param {Operator} parentSymbol The parent of |symbol|.
    @return {Array} Array of {ExpressionPart} wherein each object stores output and symbol.
*/
Expression.prototype._toPartsHelper = function (symbol, parentSymbol) {
    var parts = [];

    if (symbol instanceof Variable) {
        parts.push(new ExpressionPart(symbol.name, symbol));
    } else if (symbol instanceof Constant) {
        parts.push(new ExpressionPart(this.printConstantSymbol(symbol), symbol));
    } else if (symbol instanceof Operator) {
        var openingEnclosure = this.addOpeningEnclosure(symbol, parentSymbol);

        if (openingEnclosure) {
            parts.push(new ExpressionPart(openingEnclosure, symbol));
        }

        parts = parts.concat(this._toPartsHelper(symbol.children[0], symbol));

        var operatorFunction = this.operatorNameToFunction(symbol.name);

        parts = operatorFunction.call(this, parts, symbol);

        var closingEnclosure = this.addClosingEnclosure(symbol, parentSymbol);

        if (closingEnclosure) {
            parts.push(new ExpressionPart(closingEnclosure, symbol));
        }
    }

    return parts;
};

/**
    Convert the given operator name to that operator's print function.
    @method operatorName
    @param {String} operatorName The name of the operator.
    @return {Function} The print function for the given operator name.
*/
Expression.prototype.operatorNameToFunction = function (operatorName) {
    var operatorFunction = null;

    switch (operatorName) {
        case OPERATOR_SYMBOLS.NOT:
            operatorFunction = this.printNotOperator;
            break;
        case OPERATOR_SYMBOLS.AND:
            operatorFunction = this.printAndOperator;
            break;
        case OPERATOR_SYMBOLS.OR:
            operatorFunction = this.printOrOperator;
            break;
        case OPERATOR_SYMBOLS.CONDITIONAL:
            operatorFunction = this.printConditionalOperator;
            break;
        case OPERATOR_SYMBOLS.BICONDITIONAL:
            operatorFunction = this.printBiconditionalOperator;
            break;
        default:
            throw new Error('Unknown operator named: ' + operatorName);
    }

    return operatorFunction;
};

/**
    Return the opening enclosure (such as an opening parens) if one is appropriate.
    @method addOpeningEnclosure
    @private
    @param {MathSymbol} symbol The first symbol in the sub-expression.
    @param {MathSymbol} parentSymbol The parent of |symbol|.
    @return {String} The opening of a sub-expression.
*/
Expression.prototype.addOpeningEnclosure = function (symbol, parentSymbol) {
    return this.shouldPrintParens(symbol, parentSymbol) ? '(' : '';
};

/**
    Return the closing enclosure (such as a closing parens) if one is appropriate.
    @method addClosingEnclosure
    @private
    @param {MathSymbol} symbol The first symbol in the sub-expression.
    @param {MathSymbol} parentSymbol The parent of |symbol|.
    @return {String} The closing of a sub-expression.
*/
Expression.prototype.addClosingEnclosure = function (symbol, parentSymbol) {
    return this.shouldPrintParens(symbol, parentSymbol) ? ')' : '';
};

/**
    Return whether to print parens based on the current symbol and that symbol's parent.
    @method shouldPrintParens
    @private
    @param {MathSymbol} symbol The symbol part of deciding whether to print a parens.
    @param {Operator} parentSymbol The parent of |symbol|.
    @return {Boolean} Whether to print a parens.
*/
Expression.prototype.shouldPrintParens = function () {
    throw new Error('Expression\'s shouldPrintParens is undefined.');
};

/**
    Return a string of the |constant|. Ex: If |constant| stores CONSTANT_SYMBOLS.TRUE, then return 'T'.
    @method printConstantSymbol
    @private
    @param {Constant} constant The constant to print.
    @return {String} The string version of the given constant.
*/
Expression.prototype.printConstantSymbol = function () {
    throw new Error('Expression\'s printConstantSymbol is undefined.');
};

/**
    Print the NOT operator and the operator's first child.
    @method printNotOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the NOT operator.
    @param {MathSymbol} symbol The not operator's symbol.
    @return {String} NOT operator and the operator's first child.
*/
Expression.prototype.printNotOperator = function () {
    throw new Error('Expression\'s printNotOperator is undefined.');
};

/**
    Print the AND operator and the operator's first child.
    @method printAndOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the AND operator.
    @param {Operator} andOperator The operator to print.
    @return {String} AND operator and the operator's first child.
*/
Expression.prototype.printAndOperator = function () {
    throw new Error('Expression\'s printAndOperator is undefined.');
};

/**
    Print the OR operator and the operator's first child.
    @method printOrOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the OR operator.
    @param {Operator} orOperator The operator to print.
    @return {String} OR operator and the operator's first child.
*/
Expression.prototype.printOrOperator = function () {
    throw new Error('Expression\'s printOrOperator is undefined.');
};

/**
    Print the CONDITIONAL operator and the operator's first child.
    @method printConditionalOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the CONDITIONAL operator.
    @param {Operator} conditionalOperator The operator to print.
    @return {String} CONDITIONAL operator and the operator's first child.
*/
Expression.prototype.printConditionalOperator = function () {
    throw new Error('Expression\'s printConditionalOperator is undefined.');
};

/**
    Print the BICONDITIONAL operator and the operator's first child.
    @method printBiconditionalOperator
    @private
    @param {Array} parts Array of {ExpressionPart}. The first child of the BICONDITIONAL operator.
    @param {Operator} biconditionalOperator The operator to print.
    @return {String} BICONDITIONAL operator and the operator's first child.
*/
Expression.prototype.printBiconditionalOperator = function () {
    throw new Error('Expression\'s printBiconditionalOperator is undefined.');
};

/**
    Make a clone of this expression.
    @method clone
    @param {Expression} newExpression A copy of the cloned expression.
    @return {Expression} A clone of this expression.
*/
Expression.prototype.clone = function (newExpression) {
    newExpression.root = this.root.clone();
    return newExpression;
};

'use strict';

/* exported ExpressionPart */

/**
    A part of an expression, such as the variable a in: NOT a
    @class ExpressionPart
    @constructor
    @param {String} output The printable part of the expression.
    @param {MathSymbol} symbol Reference to the particular symbol that the output is associated with.
*/
function ExpressionPart(output, symbol) {
    this.output = output;
    this.symbol = symbol;
}

'use strict';

/* global ExpressionPart, Expression, OPERATOR_SYMBOLS, CONSTANT_SYMBOLS */

/**
    Expressions using proposition printing standards.
    @class PropositionExpression
    @extends Expression
    @constructor
    @param {MathSymbol} root The root symbol of the expression.
*/
function PropositionExpression(root) {
    Expression.prototype.constructor.call(this, root);
    this.discreteMathUtilities = require('discreteMathUtilities');
}

PropositionExpression.prototype = new Expression();
PropositionExpression.prototype.constructor = PropositionExpression;

/**
    @inheritdoc
*/
PropositionExpression.prototype.shouldPrintParens = function (symbol) {

    // |root| does not need parens since entire expression doesn't need to be in parens.
    var symbolIsRoot = symbol.is(this.root);

    // NOT does not need parens. Ex: ¬a
    var symbolIsNot = symbol.name === OPERATOR_SYMBOLS.NOT;

    return !symbolIsRoot && !symbolIsNot;
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printConstantSymbol = function (constant) {
    return constant.name === CONSTANT_SYMBOLS.TRUE ? 'T' : 'F';
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printNotOperator = function (parts, symbol) {
    var notPart = [new ExpressionPart(this.discreteMathUtilities.notSymbol, symbol)];

    return notPart.concat(parts);
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printAndOperator = function (parts, andOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.andSymbol, andOperator));
    return parts.concat(this._toPartsHelper(andOperator.children[1], andOperator));
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printOrOperator = function (parts, orOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.orSymbol, orOperator));
    return parts.concat(this._toPartsHelper(orOperator.children[1], orOperator));
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printConditionalOperator = function (parts, conditionalOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.conditionalSymbol, conditionalOperator));
    return parts.concat(this._toPartsHelper(conditionalOperator.children[1], conditionalOperator));
};

/**
    @inheritdoc
*/
PropositionExpression.prototype.printBiconditionalOperator = function (parts, biconditionalOperator) {
    parts.push(new ExpressionPart(this.discreteMathUtilities.biconditionalSymbol, biconditionalOperator));
    return parts.concat(this._toPartsHelper(biconditionalOperator.children[1], biconditionalOperator));
};

/**
    Make a clone of this expression.
    @method clone
    @return {PropositionExpression} A clone of this expression.
*/
PropositionExpression.prototype.clone = function () {
    return Expression.prototype.clone.call(this, new PropositionExpression());
};

'use strict';

/* global OPERATOR_SYMBOLS, CONSTANT_SYMBOLS, ManipulationError, PropositionExpression, DigitalExpression, Constant, Operator, Variable, FactoredChildAndNotFactoredChildren */
/* exported ExpressionManipulation */
/* eslint-disable no-underscore-dangle */

/**
    Collection of expression manipulation functions.
    @class ExpressionManipulation
    @constructor
*/
function ExpressionManipulation() {} // eslint-disable-line no-empty-function

/**
    Perform double negation on first element in |subExpressions|.
    @method doubleNegation
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.doubleNegation = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions);

    // |subExpression| should begin with two NOT operators.
    var subExpression = subExpressions[0];
    var rootIsNot = subExpression.root.name === OPERATOR_SYMBOLS.NOT;
    var rootIsNotAndChildIsNot = rootIsNot && subExpression.root.children[0].name === OPERATOR_SYMBOLS.NOT;

    if (!rootIsNotAndChildIsNot) {
        var beginOrEnd = '';

        if (subExpressions[0] instanceof PropositionExpression) {
            beginOrEnd = 'begin';
        } else if (subExpressions[0] instanceof DigitalExpression) {
            beginOrEnd = 'end';
        }

        throw new ManipulationError(['Selected term should ' + beginOrEnd + ' with: ', new Operator(OPERATOR_SYMBOLS.NOT, [new Operator(OPERATOR_SYMBOLS.NOT, [])])]);
    }

    var doubleNegatedResult = subExpression.root.children[0].children[0];

    this._insertManipulationResultInExpression(expression, subExpression.root, doubleNegatedResult);
};

/**
    Perform a complement on TRUE.
    Ex: Convert (NOT T) to F.
    @method complementTrue
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementTrue = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions);

    // |subExpression| should be: NOT T
    var subExpression = subExpressions[0];
    var rootIsNotAndChildIsTrue = subExpression.root.deepEquals(new Operator(OPERATOR_SYMBOLS.NOT, [new Constant(CONSTANT_SYMBOLS.TRUE)]));

    if (!rootIsNotAndChildIsTrue) {
        throw new ManipulationError(['Selected term should be: ', new Operator(OPERATOR_SYMBOLS.NOT, [new Constant(CONSTANT_SYMBOLS.TRUE)])]);
    }

    var complementResult = new Constant(CONSTANT_SYMBOLS.FALSE);

    this._insertManipulationResultInExpression(expression, subExpression.root, complementResult);
};

/**
    Perform a complement on FALSE.
    Ex: Convert (NOT F) to T.
    @method complementFalse
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementFalse = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions);

    // |subExpression| should be: NOT F
    var subExpression = subExpressions[0];
    var rootIsNotAndChildIsFalse = subExpression.root.deepEquals(new Operator(OPERATOR_SYMBOLS.NOT, [new Constant(CONSTANT_SYMBOLS.FALSE)]));

    if (!rootIsNotAndChildIsFalse) {
        throw new ManipulationError(['Selected term should be: ', new Operator(OPERATOR_SYMBOLS.NOT, [new Constant(CONSTANT_SYMBOLS.FALSE)])]);
    }

    var complementResult = new Constant(CONSTANT_SYMBOLS.TRUE);

    this._insertManipulationResultInExpression(expression, subExpression.root, complementResult);
};

/**
    Perform a reverse AND distribution on an expression given two sub-expressions.
    Ex: Convert ((a AND b) OR (a AND c)) to (a AND (b OR c)).
    @method reverseAndDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseAndDistribution = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers
    this._expectedSymbolOfSubExpressionsRoot(subExpressions, OPERATOR_SYMBOLS.AND);

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    var result = this._findFactoredAndNotFactoredSubExpressionChildren(subExpressions);
    var factoredChild = result.factoredChild;
    var notFactoredChildren = result.notFactoredChildren;

    /*
        Build resulting reverse AND distribution.
        Ex: From ((a AND b) OR (a AND c)) to (a AND (b OR c))
    */
    var reverseDistributedResult = new Operator(OPERATOR_SYMBOLS.AND, [factoredChild, new Operator(OPERATOR_SYMBOLS.OR, [notFactoredChildren[0], notFactoredChildren[1]])]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, reverseDistributedResult);
};

/**
    Perform a reverse OR distribution on an expression given two sub-expressions.
    Ex: Convert ((a OR b) AND (a OR c)) to (a OR (b AND c)).
    @method reverseOrDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseOrDistribution = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers
    this._expectedSymbolOfSubExpressionsRoot(subExpressions, OPERATOR_SYMBOLS.OR);

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    var result = this._findFactoredAndNotFactoredSubExpressionChildren(subExpressions);
    var factoredChild = result.factoredChild;
    var notFactoredChildren = result.notFactoredChildren;

    /*
        Build resulting reverse OR distribution.
        Ex: From ((a OR b) AND (a OR c)) to (a OR (b AND c))
    */
    var reverseDistributedResult = new Operator(OPERATOR_SYMBOLS.OR, [factoredChild, new Operator(OPERATOR_SYMBOLS.AND, [notFactoredChildren[0], notFactoredChildren[1]])]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, reverseDistributedResult);
};

/**
    Perform a commutative OR on an expression given two sub-expressions.
    Ex: Convert (a OR b) to (b OR a)
    @method commutativeOr
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.commutativeOr = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    var commutativeResult = new Operator(OPERATOR_SYMBOLS.OR, [subExpressionParent.children[1], subExpressionParent.children[0]]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, commutativeResult);
};

/**
    Perform a commutative AND on an expression given two sub-expressions.
    Ex: Convert (a AND b) to (b AND a)
    @method commutativeAnd
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.commutativeAnd = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    var commutativeResult = new Operator(OPERATOR_SYMBOLS.AND, [subExpressionParent.children[1], subExpressionParent.children[0]]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, commutativeResult);
};

/**
    Perform a complement between two sub-expressions connected by an OR.
    Ex: Convert (a OR (NOT a)) to T.
    @method complementOr
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementOr = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    var originalSubExpression = this._verifyOneSubExpressionIsNOTOfOtherSubExpression(subExpressions);
    var notFirstSubExpression = new Operator(OPERATOR_SYMBOLS.NOT, [originalSubExpression.root]);
    var firstSubExpressionOrNotFirst = new Operator(OPERATOR_SYMBOLS.OR, [originalSubExpression.root, notFirstSubExpression]);
    var actualExpressionString = '';
    var expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(firstSubExpressionOrNotFirst).print();
    } else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(firstSubExpressionOrNotFirst).print();
    }

    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], originalSubExpression.root, actualExpressionString, expectedExpressionString, 'Right-hand side must be the NOT of left side.');

    var complementResult = new Constant(CONSTANT_SYMBOLS.TRUE);

    this._insertManipulationResultInExpression(expression, subExpressionParent, complementResult);
};

/**
    Perform a reverse complement from a constant to a variable.
    Ex: Convert T to (a OR (NOT a)).
    @method reverseOrComplement
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @param {String} options Additional options for the manipulation.
    @param {String} options.variableName The string representation of the variable to add.
    @return {void}
*/
ExpressionManipulation.prototype.reverseOrComplement = function (expression, subExpressions, options) {
    var variable = new Variable(options.variableName);
    var subExpression = subExpressions[0];

    this._numberOfExpectedSubExpressions(1, subExpressions);

    var trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);

    var isCorrectTerm = subExpression.root.deepEquals(trueConstant);

    if (!isCorrectTerm) {
        throw new ManipulationError(['Selected term must be TRUE.']);
    }

    var complementResult = new Operator(OPERATOR_SYMBOLS.OR, [variable, new Operator(OPERATOR_SYMBOLS.NOT, [variable.clone()])]);

    this._insertManipulationResultInExpression(expression, subExpression.root, complementResult);
};

/**
    Perform a complement between two sub-expressions connected by an AND.
    Ex: Convert (a AND (NOT a)) to F.
    @method complementAnd
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.complementAnd = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    var originalSubExpression = this._verifyOneSubExpressionIsNOTOfOtherSubExpression(subExpressions);

    var notFirstSubExpression = new Operator(OPERATOR_SYMBOLS.NOT, [originalSubExpression.root]);
    var firstSubExpressionOrNotFirst = new Operator(OPERATOR_SYMBOLS.OR, [originalSubExpression.root, notFirstSubExpression]);

    var actualExpressionString = '';
    var expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(firstSubExpressionOrNotFirst).print();
    } else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(firstSubExpressionOrNotFirst).print();
    }

    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], originalSubExpression.root, actualExpressionString, expectedExpressionString, 'Right-hand side must be the NOT of left side.');

    var complementResult = new Constant(CONSTANT_SYMBOLS.FALSE);

    this._insertManipulationResultInExpression(expression, subExpressionParent, complementResult);
};

/**
    Perform an identity: two sub-expressions connected by an AND wherein one sub-expression is TRUE.
    Ex: Convert (a AND T) to a.
    @method identityAndTrue
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.identityAndTrue = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    var otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.TRUE);
    var identityResult = otherExpression.root;

    var trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
    var subExpressionAndTrue = new Operator(OPERATOR_SYMBOLS.AND, [otherExpression.root, trueConstant]);

    var actualExpressionString = '';
    var expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionAndTrue).print();
    } else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionAndTrue).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], identityResult, actualExpressionString, expectedExpressionString, 'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, identityResult);
};

/**
    Perform a reverse AND identity: one sub-expression that is converted in sub-expression AND True.
    Ex: Convert a to (a AND T).
    @method reverseIdentityAndTrue
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseIdentityAndTrue = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpression = subExpressions[0];
    var trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
    var reverseIdentityAndTrue = new Operator(OPERATOR_SYMBOLS.AND, [subExpression.root, trueConstant]);

    this._insertManipulationResultInExpression(expression, subExpression.root, reverseIdentityAndTrue);
};

/**
    Perform an identity: two sub-expressions connected by an OR wherein one sub-expression is FALSE.
    Ex: Convert (a OR F) to a.
    @method identityOrFalse
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.identityOrFalse = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    var otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.FALSE);
    var identityResult = otherExpression.root;

    var falseConstant = new Constant(CONSTANT_SYMBOLS.FALSE);
    var subExpressionOrFalse = new Operator(OPERATOR_SYMBOLS.OR, [otherExpression.root, falseConstant]);
    var actualExpressionString = '';
    var expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionOrFalse).print();
    } else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionOrFalse).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], identityResult, actualExpressionString, expectedExpressionString, 'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, identityResult);
};

/**
    Perform a reverse OR identity: one sub-expression that is converted in sub-expression AND False.
    Ex: Convert a to (a OR F).
    @method reverseIdentityOrFalse
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseIdentityOrFalse = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(1, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpression = subExpressions[0];
    var falseConstant = new Constant(CONSTANT_SYMBOLS.FALSE);
    var reverseIdentityOrFalse = new Operator(OPERATOR_SYMBOLS.OR, [subExpression.root, falseConstant]);

    this._insertManipulationResultInExpression(expression, subExpression.root, reverseIdentityOrFalse);
};

/**
    Perform an OR null element. Two sub-expressions connected by an OR wherein one sub-expression is TRUE.
    Ex: Convert (a OR T) to T.
    @method orNullElements
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.orNullElements = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    var otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.TRUE);
    var trueConstant = new Constant(CONSTANT_SYMBOLS.TRUE);
    var nullElementsResult = trueConstant.clone();
    var subExpressionOrTrue = new Operator(OPERATOR_SYMBOLS.OR, [otherExpression.root, trueConstant]);

    var actualExpressionString = '';
    var expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionOrTrue).print();
    } else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionOrTrue).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], otherExpression.root, actualExpressionString, expectedExpressionString, 'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, nullElementsResult);
};

/**
    Perform an AND null element. Two sub-expressions connected by an AND wherein one sub-expression is FALSE.
    Ex: Convert (a AND F) to F.
    @method andNullElements
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.andNullElements = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    var otherExpression = this._findOtherExpressionWhenOneConstantIsGiven(subExpressions, CONSTANT_SYMBOLS.FALSE);
    var falseConstant = new Constant(CONSTANT_SYMBOLS.FALSE);
    var nullElementsResult = falseConstant.clone();
    var subExpressionAndFalse = new Operator(OPERATOR_SYMBOLS.AND, [otherExpression.root, falseConstant]);

    var actualExpressionString = '';
    var expectedExpressionString = '';

    if (subExpressions[0] instanceof PropositionExpression) {
        actualExpressionString = new PropositionExpression(subExpressionParent).print();
        expectedExpressionString = new PropositionExpression(subExpressionAndFalse).print();
    } else if (subExpressions[0] instanceof DigitalExpression) {
        actualExpressionString = new DigitalExpression(subExpressionParent).print();
        expectedExpressionString = new DigitalExpression(subExpressionAndFalse).print();
    }

    // Verify if the first child is the varible. If not, then first must use commutative law.
    this._verifyMathSymbolsAreTheSame(subExpressionParent.children[0], otherExpression.root, actualExpressionString, expectedExpressionString, 'Constant must be on the right-hand side.');

    this._insertManipulationResultInExpression(expression, subExpressionParent, nullElementsResult);
};

/**
    Perform an AND idempotence manipulation. Two sub-expressions connected by an AND wherein both sub-expressions are the same.
    Ex: Convert (a AND a) to a.
    @method andIdempotence
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.andIdempotence = function (expression, subExpressions) {
    this._idempotence(expression, subExpressions, OPERATOR_SYMBOLS.AND);
};

/**
    Perform an OR idempotence manipulation. Two sub-expressions connected by an OR wherein both sub-expressions are the same.
    Ex: Convert (a OR a) to a.
    @method orIdempotence
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.orIdempotence = function (expression, subExpressions) {
    this._idempotence(expression, subExpressions, OPERATOR_SYMBOLS.OR);
};

/**
    Perform an OR idempotence manipulation. Two sub-expressions connected by an OR wherein both sub-expressions are the same.
    Ex: Convert (a OR a) to a.
    @method _idempotence
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @param {String} operator The operator of this idempotence.
    @return {void}
*/
ExpressionManipulation.prototype._idempotence = function (expression, subExpressions, operator) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers
    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    if (!subExpressions[0].root.deepEquals(subExpressions[1].root)) {
        throw new ManipulationError(['Both sub-expressions must be equivalent.']);
    }

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, operator);
    this._insertManipulationResultInExpression(expression, subExpressionParent, subExpressions[0].root.clone());
};

/**
    Perform a conditional manipulation with two sub-expressions connected by a CONDITIONAL operator.
    Ex: Convert (a -> b) to ((NOT a) OR b)
    @method conditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.conditional = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.CONDITIONAL);

    var result = new Operator(OPERATOR_SYMBOLS.OR, [new Operator(OPERATOR_SYMBOLS.NOT, [subExpressions[0].root]), subExpressions[1].root]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a reverse conditional manipulation with two sub-expressions.
    Ex: Convert ((NOT a) OR b) to (a -> b)
    @method reverseConditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseConditional = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionRootIsGivenOperatorName(subExpressions[0].root, OPERATOR_SYMBOLS.NOT);

    var firstVariable = subExpressions[0].root.children[0];
    var secondVariable = subExpressions[1].root;

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);

    var result = new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [firstVariable, secondVariable]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a biconditional manipulation with two sub-expressions connected by a BICONDITIONAL operator.
    Ex: Convert (a <-> b) to ((a -> b) AND (b -> a))
    @method biconditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.biconditional = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.BICONDITIONAL);

    var result = new Operator(OPERATOR_SYMBOLS.AND, [new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [subExpressions[0].root, subExpressions[1].root]), new Operator(OPERATOR_SYMBOLS.CONDITIONAL, [subExpressions[1].root.clone(), subExpressions[0].root.clone()])]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a reverse biconditional manipulation with two CONDITIONAL sub-expressions connected by an AND operator.
    Ex: Convert ((a -> b) AND (b -> a)) to (a <-> b)
    @method reverseBiconditional
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.reverseBiconditional = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var firstSubExpression = subExpressions[0].root;
    var secondSubExpression = subExpressions[1].root;

    this._verifySubexpressionRootIsGivenOperatorName(firstSubExpression, OPERATOR_SYMBOLS.CONDITIONAL);
    this._verifySubexpressionRootIsGivenOperatorName(secondSubExpression, OPERATOR_SYMBOLS.CONDITIONAL);

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);

    // First sub-expression's left-child must be the same as the second sub-expression's right-child
    var firstSubExpressionLeftChild = firstSubExpression.children[0];
    var secondSubExpressionRightChild = secondSubExpression.children[1];

    // First sub-expression's right-child must be the same as the second sub-expression's left-child
    var firstSubExpressionRightChild = firstSubExpression.children[1];
    var secondSubExpressionLeftChild = secondSubExpression.children[0];

    if (!firstSubExpressionLeftChild.deepEquals(secondSubExpressionRightChild) || !firstSubExpressionRightChild.deepEquals(secondSubExpressionLeftChild)) {
        throw new ManipulationError(['Selected terms do not match expectation.']);
    }

    var result = new Operator(OPERATOR_SYMBOLS.BICONDITIONAL, [firstSubExpressionLeftChild.clone(), firstSubExpressionRightChild.clone()]);

    this._insertManipulationResultInExpression(expression, subExpressionParent, result);
};

/**
    Perform a de Morgan's manipulation with two sub-expressions connected by an AND operator.
    Ex: Convert NOT(a AND b) to ((NOT a) OR (NOT b))
    @method deMorganAnd
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.deMorganAnd = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);
    var subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.NOT);

    var result = new Operator(OPERATOR_SYMBOLS.OR, [new Operator(OPERATOR_SYMBOLS.NOT, [subExpressions[0].root]), new Operator(OPERATOR_SYMBOLS.NOT, [subExpressions[1].root])]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Perform a de Morgan's manipulation with two sub-expressions connected by an OR operator.
    Ex: Convert NOT(a OR b) to ((NOT a) AND (NOT b))
    @method deMorganOr
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.deMorganOr = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(2, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, subExpressions);
    var subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.NOT);

    var result = new Operator(OPERATOR_SYMBOLS.AND, [new Operator(OPERATOR_SYMBOLS.NOT, [subExpressions[0].root]), new Operator(OPERATOR_SYMBOLS.NOT, [subExpressions[1].root])]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Perform an AND distribution.
    Ex: Convert (a AND (b OR c)) to ((a AND b) OR (a AND c))
    @method andDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.andDistribution = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(3, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionsOrdered = this.orderSubExpressionsForDistribution(expression, subExpressions);

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, [subExpressionsOrdered[1], subExpressionsOrdered[2]]);
    var subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.OR);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.AND);

    var result = new Operator(OPERATOR_SYMBOLS.OR, [new Operator(OPERATOR_SYMBOLS.AND, [subExpressionsOrdered[0].root, subExpressionsOrdered[1].root]), new Operator(OPERATOR_SYMBOLS.AND, [subExpressionsOrdered[0].root.clone(), subExpressionsOrdered[2].root])]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Perform an OR distribution.
    Ex: Convert (a OR (b AND c)) to ((a OR b) AND (a OR c))
    @method orDistribution
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The relevant parts of |expression| to manipulate.
    @return {void}
*/
ExpressionManipulation.prototype.orDistribution = function (expression, subExpressions) {
    this._numberOfExpectedSubExpressions(3, subExpressions); // eslint-disable-line no-magic-numbers

    var subExpressionsOrdered = this.orderSubExpressionsForDistribution(expression, subExpressions);

    var subExpressionParent = this._findCommonParentForBothSubExpressions(expression, [subExpressionsOrdered[1], subExpressionsOrdered[2]]);
    var subExpressionGrandparent = expression.parentOf(subExpressionParent);

    this._verifySubexpressionsConnectedByGivenOperatorName(subExpressionParent, OPERATOR_SYMBOLS.AND);
    this._verifySubexpressionsGrandparentIsGivenOperatorName(subExpressionGrandparent, OPERATOR_SYMBOLS.OR);

    var result = new Operator(OPERATOR_SYMBOLS.AND, [new Operator(OPERATOR_SYMBOLS.OR, [subExpressionsOrdered[0].root, subExpressionsOrdered[1].root]), new Operator(OPERATOR_SYMBOLS.OR, [subExpressionsOrdered[0].root.clone(), subExpressionsOrdered[2].root])]);

    this._insertManipulationResultInExpression(expression, subExpressionGrandparent, result);
};

/**
    Verify that the sub-expressions' parent operator has the expected name.
    @method _verifySubexpressionsConnectedByGivenOperatorName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {void}
*/
ExpressionManipulation.prototype._verifySubexpressionsConnectedByGivenOperatorName = function (operator, expectedOperatorString) {
    if (!this._operatorHasExpectedName(operator, expectedOperatorString)) {
        throw new ManipulationError(['Selected terms should be connected by ' + expectedOperatorString + ', but are connected by ' + operator.name + '.']);
    }
};

/**
    Verify that the sub-expressions' grandparent operator exists and has the expected name.
    @method _verifySubexpressionsGrandparentIsGivenOperatorName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {void}
*/
ExpressionManipulation.prototype._verifySubexpressionsGrandparentIsGivenOperatorName = function (operator, expectedOperatorString) {
    if (!this._operatorHasExpectedName(operator, expectedOperatorString)) {
        throw new ManipulationError(['Selected terms do not match expected format']);
    }
};

/**
    Verify that |operator|'s name stores the |expectedOperatorString|.
    @method _verifySubexpressionRootIsGivenOperatorName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {void}
*/
ExpressionManipulation.prototype._verifySubexpressionRootIsGivenOperatorName = function (operator, expectedOperatorString) {
    if (!this._operatorHasExpectedName(operator, expectedOperatorString)) {
        throw new ManipulationError([operator, ' does not match the expected format']);
    }
};

/**
    Return whether the operator's name stores |expectedOperatorString|.
    @method _operatorHasExpectedName
    @private
    @param {Operator} operator The operator to verify.
    @param {String} expectedOperatorString The expected value of |operator|'s |name| property.
    @return {Boolean} Whether the operator's name stores |expectedOperatorString|.
*/
ExpressionManipulation.prototype._operatorHasExpectedName = function (operator, expectedOperatorString) {
    return operator && operator.name === expectedOperatorString;
};

/**
    Return the other expression from |expressions| that isn't the given |constantString|.
    @method _findOtherExpressionWhenOneConstantIsGiven
    @private
    @param {Array} expressions Array of {Expression}. The expressions to search.
    @param {String} constantString The given constant is expected to exist, and we use this to find the other expression in |expressions|.
    @return {Expression} The other expression that isn't the expected expression.
*/
ExpressionManipulation.prototype._findOtherExpressionWhenOneConstantIsGiven = function (expressions, constantString) {

    // At least one sub-expression should be the |constantString|.
    var foundExpectedExpressions = expressions.filter(function (expression) {
        return expression.root.name === constantString;
    });

    if (foundExpectedExpressions.length === 0) {
        throw new ManipulationError(['The selected term on the right-hand side should be: ', new Constant(constantString)]);
    }

    // Find the other sub-expression besides the expected sub-expression.
    var foundExpectedExpression = foundExpectedExpressions[0];

    return expressions.filter(function (expression) {
        return expression !== foundExpectedExpression;
    })[0];
};

/**
    One sub-expression should be the NOT of the other sub-expression. Throw error otherwise.
    @method _verifyOneSubExpressionIsNOTOfOtherSubExpression
    @private
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @return {Expression} The original sub-expression. Ex: a in (a v ¬a) ; or b in (b ∧ ¬b).
*/
ExpressionManipulation.prototype._verifyOneSubExpressionIsNOTOfOtherSubExpression = function (subExpressions) {
    var originalSubExpression = null;

    // At least one sub-expression's root should be a NOT operator.
    var subExpressionsStartingWithNot = subExpressions.filter(function (subExpression) {
        return subExpression.root.name === OPERATOR_SYMBOLS.NOT;
    });

    var hadError = subExpressionsStartingWithNot.length === 0;

    if (!hadError) {

        // One sub-expression should be the NOT of the other sub-expression.
        var oneSubExpressionIsNOTOfOther = subExpressionsStartingWithNot.some(function (subExpressionStartingWithNot) {
            return subExpressions.some(function (subExpression) {
                var subExpressionIsNotOfOther = false;

                if (subExpressionStartingWithNot !== subExpression) {
                    var childOfNot = subExpressionStartingWithNot.root.children[0];

                    subExpressionIsNotOfOther = subExpression.root.deepEquals(childOfNot);
                }

                return subExpressionIsNotOfOther;
            });
        });

        subExpressionsStartingWithNot.forEach(function (subExpressionStartingWithNot) {
            return subExpressions.forEach(function (subExpression) {
                if (subExpressionStartingWithNot !== subExpression) {
                    var childOfNot = subExpressionStartingWithNot.root.children[0];

                    if (subExpression.root.deepEquals(childOfNot)) {
                        originalSubExpression = subExpression;
                    }
                }
            });
        });

        hadError = !oneSubExpressionIsNOTOfOther;
    }

    if (hadError) {
        throw new ManipulationError(['The term on the right-hand side should be the NOT of the term on the left.']);
    }

    return originalSubExpression;
};

/**
    Checks that both {MathSymbol} are the same one.
    @method _verifyMathSymbolsAreTheSame
    @private
    @param {MathSymbol} firstMathSymbol The first {MathSymbol} to check if it is the same one as the second.
    @param {MathSymbol} secondMathSymbol The second {MathSymbol} to check if it is the same one as the first.
    @param {String} actualString The expression selected by the user in a {String}.
    @param {String} expectedString The expected expression in a {String}.
    @param {String} [errorMessage='Incorrect expression order.'] The error message to show. If not given a generic error message will be shown.
    @return {void}
*/
ExpressionManipulation.prototype._verifyMathSymbolsAreTheSame = function (firstMathSymbol, secondMathSymbol, actualString, expectedString) {
    var errorMessage = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'Incorrect expression order.';

    var isCorrectOrder = firstMathSymbol.deepEquals(secondMathSymbol);
    var expectedMessage = expectedString + ', but found ' + actualString + '.';

    if (!isCorrectOrder) {
        throw new ManipulationError(['Expected ' + expectedMessage + ' ' + errorMessage + ' May need to use the Commutative law first.']);
    }
};

/**
    Find a factorable common child from each sub-expression and not-factored children.
    Ex: If sub-expressions are [(a OR b), (a OR c)], then factored is |a| and not-factored are [b, c].
    @method _findFactoredAndNotFactoredSubExpressionChildren
    @private
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @return {FactoredChildAndNotFactoredChildren} The factored child and unfactored children.
*/
ExpressionManipulation.prototype._findFactoredAndNotFactoredSubExpressionChildren = function (subExpressions) {

    // At least one variable from each sub-expression should be the same variable.
    var matchingChildren = subExpressions[0].root.children.filter(function (child0) {
        var matches = subExpressions[1].root.children.filter(function (child1) {
            return child0.deepEquals(child1);
        });

        return matches.length > 0;
    });

    if (matchingChildren.length === 0) {
        throw new ManipulationError(['Selected terms do not have a common part.']);
    }
    var factoredChild = matchingChildren[0];

    // The factored child has to be on the left side in both sub-expressions.
    var isFactoredChildInLeftSide = subExpressions[0].root.children[0].deepEquals(subExpressions[1].root.children[0]);
    var notFactoredChildren = subExpressions.map(function (subExpression) {
        var notFactoredChild = subExpression.root.children[0];

        if (factoredChild.deepEquals(subExpression.root.children[0])) {
            notFactoredChild = subExpression.root.children[1];
        }
        return notFactoredChild;
    });

    if (!isFactoredChildInLeftSide) {

        // Find not factored sub-expression children.
        var actualExpressionString1 = '' + subExpressions[0].print();
        var factoredAndOther1 = new Operator(subExpressions[0].root.name, [factoredChild, notFactoredChildren[0]]);

        var actualExpressionString2 = '' + subExpressions[1].print();
        var factoredAndOther2 = new Operator(subExpressions[1].root.name, [factoredChild, notFactoredChildren[1]]);

        var expectedExpressionString1 = '';
        var expectedExpressionString2 = '';

        if (subExpressions[0] instanceof PropositionExpression) {
            expectedExpressionString1 = new PropositionExpression(factoredAndOther1).print();
            expectedExpressionString2 = new PropositionExpression(factoredAndOther2).print();
        } else if (subExpressions[0] instanceof DigitalExpression) {
            expectedExpressionString1 = new DigitalExpression(factoredAndOther1).print();
            expectedExpressionString2 = new DigitalExpression(factoredAndOther2).print();
        }

        this._verifyMathSymbolsAreTheSame(factoredChild, subExpressions[0].root.children[0], actualExpressionString1, expectedExpressionString1, 'The factored term must be on the left side in both sub-expressions.');
        this._verifyMathSymbolsAreTheSame(factoredChild, subExpressions[1].root.children[0], actualExpressionString2, expectedExpressionString2, 'The factored term must be on the left side in both sub-expressions.');
    }

    return new FactoredChildAndNotFactoredChildren(factoredChild, notFactoredChildren);
};

/**
    Find the parent of both sub-expressions.
    Throw error if sub-expressions do not have same parent within |expression|.
    @method _findCommonParentForBothSubExpressions
    @private
    @param {Expression} expression The expression containing each sub-expression.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @return {Operator} The parent of both sub-expressions.
*/
ExpressionManipulation.prototype._findCommonParentForBothSubExpressions = function (expression, subExpressions) {
    var subExpressionParents = subExpressions.map(function (subExpression) {
        return expression.parentOf(subExpression.root);
    });

    if (!subExpressionParents[0] || !subExpressionParents[1] || subExpressionParents[0] !== subExpressionParents[1]) {
        throw new ManipulationError(['Selected terms should be connected by one operator.']);
    }
    return subExpressionParents[0];
};

/**
    Throw error if root of each sub-expression is not an expected symbol.
    @method _expectedSymbolOfSubExpressionsRoot
    @private
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to check.
    @param {String} expectedSymbol The expected symbol of each sub-expression's root.
    @return {void}
*/
ExpressionManipulation.prototype._expectedSymbolOfSubExpressionsRoot = function (subExpressions, expectedSymbol) {
    subExpressions.forEach(function (subExpression) {
        if (subExpression.root.name !== expectedSymbol) {
            throw new ManipulationError(['Selected term has wrong form: ', subExpression.root]);
        }
    });
};

/**
    Throw an error if the number of sub-expressions is different than expected.
    @method _numberOfExpectedSubExpressions
    @private
    @param {Number} numberExpected The number of expected sub-expressions.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions.
    @return {void}
*/
ExpressionManipulation.prototype._numberOfExpectedSubExpressions = function (numberExpected, subExpressions) {
    if (subExpressions.length !== numberExpected) {
        throw new ManipulationError(['Should have ' + numberExpected + ' term(s) selected but have ' + subExpressions.length + '.']);
    }
};

/**
    Insert a manipulation result into an expression at the given operator.
    @method _insertManipulationResultInExpression
    @private
    @param {Expression} expression The expression to insert result.
    @param {Operator} operatorToReplace The operator in |expression| to replace with |result|.
    @param {MathSymbol} result The manipulation result to insert into |expression|.
    @return {void}
*/
ExpressionManipulation.prototype._insertManipulationResultInExpression = function (expression, operatorToReplace, result) {

    // Special case: |expression|'s root is the |operatorToFind|.
    if (expression.root.is(operatorToReplace)) {
        expression.root = result;
    }

    // Otherwise, set |result| to |subExpressions|'s parent.
    else {
            var parentOfOperatorToReplace = expression.parentOf(operatorToReplace);

            parentOfOperatorToReplace.children.forEach(function (child, index) {

                // Replace the |child| of |parentOfOperatorToReplace| that matches |operatorToReplace|.
                if (child.is(operatorToReplace)) {
                    parentOfOperatorToReplace.children[index] = result;
                }
            });
        }
};

/**
    Order the sub-expressions such that the two sub-expressions connected by a single-operator are at the end of the array.
    @method orderSubExpressionsForDistribution
    @private
    @param {Expression} expression The expression containing each sub-expression.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions to order.
    @return {Array} Array of {Expression}. The ordered sub-expressions.
*/
ExpressionManipulation.prototype.orderSubExpressionsForDistribution = function (expression, subExpressions) {
    var subExpressionParents = subExpressions.map(function (subExpression) {
        return expression.parentOf(subExpression.root);
    });

    var subExpressionsOrdered = [];

    // Index 0 and 1 have the same parent. Place index 0 and 1 at the end.
    if (subExpressionParents[0].is(subExpressionParents[1])) {
        subExpressionsOrdered = [subExpressions[2], subExpressions[0], subExpressions[1]];
    }

    // Index 0 and 2 have the same parent. Place index 0 and 2 at the end.
    else if (subExpressionParents[0].is(subExpressionParents[2])) {
            subExpressionsOrdered = [subExpressions[1], subExpressions[0], subExpressions[2]];
        }

        // Index 1 and 2 have the same parent. Place index 1 and 2 at the end.
        else if (subExpressionParents[1].is(subExpressionParents[2])) {
                subExpressionsOrdered = [subExpressions[0], subExpressions[1], subExpressions[2]];
            }

            // No indices have the same parent.
            else {
                    throw new ManipulationError(['Selected terms should be connected by one operator.']);
                }

    return subExpressionsOrdered;
};

'use strict';

/* exported FactoredChildAndNotFactoredChildren */

/**
    Store a factored child and unfactored children.
    @class FactoredChildAndNotFactoredChildren
    @constructor
    @param {MathSymbol} factoredChild The factored child.
    @param {Array} notFactoredChildren Array of {MathSymbol}. The unfactored children.
*/
function FactoredChildAndNotFactoredChildren(factoredChild, notFactoredChildren) {
    this.factoredChild = factoredChild;
    this.notFactoredChildren = notFactoredChildren;
}

'use strict';

/* global makeExpression */

/**
    An error that occurred during manipulation.
    @class ManipulationError
    @param {Array} parts Array of {String} and {MathSymbol}. The parts of the error message.
*/
function ManipulationError(parts) {
    this._parts = parts;
}

/**
    Get the error message.
    @method getMessage
    @param {String} expressionType The type of expression to render with.
    @return {String} The error message.
*/
ManipulationError.prototype.getMessage = function (expressionType) {
    return this._parts.map(function (part) {
        var partString = part;

        if (typeof part !== 'string') {
            partString = makeExpression(expressionType, part).print();
        }
        return partString;
    }).join('');
};

'use strict';

/* global MathSymbol */
/* exported buildConstantPrototype */

/**
    Constant stores a constant-value symbol. Ex: True
    @class Constant
    @extends MathSymbol
    @constructor
    @param {String} name A constant-value symbol from CONSTANT_SYMBOLS.
*/
function Constant(name) {
    MathSymbol.prototype.constructor.call(this, name);
}

/**
    Build the prototype for Constant.
    @method buildConstantPrototype
    @return {void}
*/
function buildConstantPrototype() {
    Constant.prototype = new MathSymbol();
    Constant.prototype.constructor = Constant;

    /**
        Clone this symbol.
        @method clone
        @return {Constant} A clone of this symbol.
    */
    Constant.prototype.clone = function () {
        return MathSymbol.prototype.clone.call(this, new Constant());
    };
}

'use strict';

/* global PropositionExpression */

/**
    MathSymbol stores a name. Ex: x
    @class MathSymbol
    @constructor
    @param {String} [name=''] The name of the symbol.
*/
function MathSymbol(name) {
    this.name = name || '';
    this.marks = [];
}

/**
    Return whether |otherSymbol| points to the same object as |this|.
    @method is
    @param {MathSymbol} otherSymbol The symbol to compare |this| to.
    @return {Boolean} Whether |otherSymbol| points to same object as |this|.
*/
MathSymbol.prototype.is = function (otherSymbol) {
    return this === otherSymbol;
};

/**
    Return whether the |otherSymbol| represents the same expression as |this|.
    @method deepEquals
    @param {MathSymbol} otherSymbol The symbol to compare |this| to.
    @return {Boolean} Whether the |otherSymbol| represents the same expression as |this|.
*/
MathSymbol.prototype.deepEquals = function (otherSymbol) {
    var thisExpression = new PropositionExpression(this);
    var otherSymbolExpression = new PropositionExpression(otherSymbol);

    return thisExpression.print() === otherSymbolExpression.print();
};

/**
    Mark the symbol with the given mark.
    @method addMark
    @param {String} mark The id to mark the symbol with.
    @return {void}
*/
MathSymbol.prototype.addMark = function (mark) {
    if (!this.hasMark(mark)) {
        this.marks.push(mark);
    }
};

/**
    Recursively add the given mark.
    @method addMarkRecursive
    @param {String} mark The id to mark the symbol with.
    @return {void}
*/
MathSymbol.prototype.addMarkRecursive = function (mark) {
    this.addMark(mark);
};

/**
    Remove the given mark.
    @method removeMark
    @param {String} mark The mark to remove.
    @return {void}
*/
MathSymbol.prototype.removeMark = function (mark) {
    if (this.hasMark(mark)) {
        var markIndex = this.marks.indexOf(mark);

        this.marks.splice(markIndex, 1);
    }
};

/**
    Recursively remove the given mark.
    @method removeMarkRecursive
    @param {String} mark The mark to remove.
    @return {void}
*/
MathSymbol.prototype.removeMarkRecursive = function (mark) {
    this.removeMark(mark);
};

/**
    Remove all marks.
    @method removeAllMarks
    @return {void}
*/
MathSymbol.prototype.removeAllMarks = function () {
    this.marks.length = 0;
};

/**
    Return whether the symbol is unmarked.
    @method isUnmarked
    @return {Boolean} Whether the symbol is marked.
*/
MathSymbol.prototype.isUnmarked = function () {
    return this.marks.length === 0;
};

/**
    Return whether the symbol has the given mark.
    @method hasMark
    @param {String} mark Check whether the symbol has this mark.
    @return {Boolean} Whether the symbol has the given mark.
*/
MathSymbol.prototype.hasMark = function (mark) {
    var indexOfNotFound = -1;

    return this.marks.indexOf(mark) !== indexOfNotFound;
};

/**
    Return whether the symbol has a specific mark or is unmarked.
    @method hasSpecificMarkOrIsUnmarked
    @param {String} mark The specific allowed mark.
    @return {Boolean} Whether the symbol is marked.
*/
MathSymbol.prototype.hasSpecificMarkOrIsUnmarked = function (mark) {
    return this.hasMark(mark) || this.isUnmarked();
};

/**
    Return whether the symbol's descendant has a specific mark or is unmarked. Symbol has no children, so return true.
    @method descendantHasSpecificMarkOrIsUnmarked
    @return {Boolean} Symbol has no children, so returns true.
*/
MathSymbol.prototype.descendantHasSpecificMarkOrIsUnmarked = function () {
    return true;
};

/**
    Return the root of the already marked symbols.
    @method findRootOfMark
    @param {String} mark The mark to find.
    @return {MathSymbol} The root of the marked symbols.
*/
MathSymbol.prototype.findRootOfMark = function (mark) {
    if (this.hasMark(mark)) {
        return this;
    }
    return null;
};

/**
    Return the common ancestor of s1 and s2.
    @method findCommonAncestor
    @param {MathSymbol} s1 One symbol to find.
    @param {MathSymbol} s2 Other symbol to find.
    @return {MathSymbol} The common ancestor of s1 and s2.
*/
MathSymbol.prototype.findCommonAncestor = function (s1, s2) {
    if (s1.is(s2)) {
        return s1;
    }
    return null;
};

/**
    Find the ancestors of the given symbol.
    @method findAncestors
    @param {MathSymbol} symbol The symbol's ancestors to find.
    @return {Array} Array of {MathSymbol}. List of ancestors of given symbol.
*/
MathSymbol.prototype.findAncestors = function (symbol) {
    var ancestors = [];

    if (this.is(symbol)) {
        ancestors.push(this);
    }
    return ancestors;
};

/**
    Find all operator paths from root to leaves. Non-{Operator} symbols are not part of that path, so return null.
    @method findOperatorPaths
    @return {null}
*/
MathSymbol.prototype.findOperatorPaths = function () {
    return null;
};

/**
    Clone this symbol.
    @method clone
    @param {MathSymbol} newSymbol The clone of this symbol.
    @return {MathSymbol} A clone of this symbol.
*/
MathSymbol.prototype.clone = function (newSymbol) {
    newSymbol.name = this.name;
    newSymbol.marks = this.marks.slice();
    return newSymbol;
};

/**
    Return whether this symbol is an operator.
    @method isOperator
    @return {Boolean} Whether this symbol is an {Operator}.
*/
MathSymbol.prototype.isOperator = function () {
    return false;
};

'use strict';

/* global MathSymbol */

/* exported buildOperatorPrototype */

/**
    Operator stores children MathSymbols.
    @class Operator
    @extends MathSymbol
    @constructor
    @param {String} name The name of the operator.
    @param {Array} children Array of {MathSymbol}. Children symbols to this operator.
*/
function Operator(name, children) {
    this.children = children;

    MathSymbol.prototype.constructor.call(this, name);
}

/**
    Build the prototype for Operator.
    @method buildOperatorPrototype
    @return {void}
*/
function buildOperatorPrototype() {
    Operator.prototype = new MathSymbol();
    Operator.prototype.constructor = Operator;

    /**
        Generate a children length error. Ex: NOT operator has 2 children. Expected: 1
        @method generateChildrenLengthError
        @param {Number} expectedLength The expected number of children for this operator.
        @return {void}
    */
    Operator.prototype.generateChildrenLengthError = function (expectedLength) {
        var pluralChildren = this.children.length === 1 ? '' : 'ren';

        throw new Error(this.name + ' operator has ' + this.children.length + ' child' + pluralChildren + '. Expected: ' + expectedLength);
    };

    /**
        Mark the operator and operator's children.
        @method addMarkRecursive
        @param {String} mark The id to mark the symbol with.
        @return {void}
    */
    Operator.prototype.addMarkRecursive = function (mark) {
        this.addMark(mark);
        this.children.forEach(function (child) {
            return child.addMarkRecursive(mark);
        });
    };

    /**
        Remove the mark by setting markId to 0. Same for operator's children.
        @method removeMarkRecursive
        @param {String} mark The mark to remove.
        @return {void}
    */
    Operator.prototype.removeMarkRecursive = function (mark) {
        this.removeMark(mark);
        this.children.forEach(function (child) {
            return child.removeMarkRecursive(mark);
        });
    };

    /**
        Remove all marks.
        @method removeAllMarks
        @return {void}
    */
    Operator.prototype.removeAllMarks = function () {
        MathSymbol.prototype.removeAllMarks.call(this);
        this.children.forEach(function (child) {
            return child.removeAllMarks();
        });
    };

    /**
        Return whether the symbol has a specific mark or is unmarked.
        @method hasSpecificMarkOrIsUnmarked
        @param {String} mark The specific allowed mark.
        @return {Boolean} Whether the symbol is marked.
    */
    Operator.prototype.hasSpecificMarkOrIsUnmarked = function (mark) {
        return MathSymbol.prototype.hasSpecificMarkOrIsUnmarked.call(this, mark) && this.descendantHasSpecificMarkOrIsUnmarked(mark);
    };

    /**
        Return whether the symbol's descendant has a specific mark or is unmarked.
        @method descendantHasSpecificMarkOrIsUnmarked
        @param {String} mark The specific allowed mark.
        @return {Boolean} Whether the symbol is marked.
    */
    Operator.prototype.descendantHasSpecificMarkOrIsUnmarked = function (mark) {
        return this.children.every(function (child) {
            return child.hasSpecificMarkOrIsUnmarked(mark);
        });
    };

    /**
        Return the root of the already marked symbols.
        @method findRootOfMark
        @param {String} mark The mark to find.
        @return {MathSymbol} The root of the marked symbols.
    */
    Operator.prototype.findRootOfMark = function (mark) {
        var rootOfMark = MathSymbol.prototype.findRootOfMark.call(this, mark);
        var rootOfMarkExists = Boolean(rootOfMark);

        if (!rootOfMarkExists) {
            var markedDescendants = this.children.map(function (child) {
                return child.findRootOfMark(mark);
            }).filter(function (child) {
                return child !== null;
            });

            if (markedDescendants.length > 0) {
                rootOfMark = markedDescendants[0];
            }
        }
        return rootOfMark;
    };

    /**
        Return the common ancestor of s1 and s2.
        @method findCommonAncestor
        @param {MathSymbol} s1 One symbol to find.
        @param {MathSymbol} s2 Other symbol to find.
        @return {MathSymbol} The common ancestor of s1 and s2.
    */
    Operator.prototype.findCommonAncestor = function (s1, s2) {
        var s1Ancestors = this.findAncestors(s1);
        var s2Ancestors = this.findAncestors(s2);
        var minAncestorsLength = Math.min(s1Ancestors.length, s2Ancestors.length);
        var index = 0;

        // The common ancestor is just before the first different ancestor.
        while (index < minAncestorsLength) {
            if (!s1Ancestors[index].is(s2Ancestors[index])) {
                break;
            }
            ++index;
        }
        return s1Ancestors[index - 1];
    };

    /**
        Find the ancestors of the given symbol with root as index 0.
        @method findAncestors
        @param {MathSymbol} symbol The symbol's ancestors to find.
        @return {Array} Array of {MathSymbol}. List of ancestors of given symbol.
    */
    Operator.prototype.findAncestors = function (symbol) {
        var ancestors = MathSymbol.prototype.findAncestors.call(this, symbol);

        if (ancestors.length === 0) {
            var childrenAncestors = this.children.map(function (child) {
                return child.findAncestors(symbol);
            }).filter(function (child) {
                return child.length > 0;
            });

            if (childrenAncestors.length > 0) {
                ancestors.push(this);
                ancestors = ancestors.concat(childrenAncestors[0]);
            }
        }
        return ancestors;
    };

    /**
        Find all operator paths from root to leaves.
        @method findOperatorPaths
        @return {Array} Array of {Array} of {Operator}. List of each operator path through the tree.
    */
    Operator.prototype.findOperatorPaths = function () {
        var _this = this;

        var paths = [];

        this.children.forEach(function (child) {
            var childPaths = child.findOperatorPaths();
            var childPathsExist = Boolean(childPaths);

            // Add |this| to the front of each child path.
            if (childPathsExist) {
                childPaths.forEach(function (childPath) {
                    return paths.push([_this].concat(childPath));
                });
            }
        });

        // The children are all leaves, so this operator is the only in the path.
        if (paths.length === 0) {
            paths.push([this]);
        }

        return paths;
    };

    /**
        Clone this symbol.
        @method clone
        @return {Operator} A clone of this symbol.
    */
    Operator.prototype.clone = function () {
        var newChildren = this.children.map(function (child) {
            return child.clone();
        });

        return MathSymbol.prototype.clone.call(this, new Operator(this.name, newChildren));
    };

    /**
        Return whether this symbol is an operator.
        @method isOperator
        @return {Boolean} Whether this symbol is an {Operator}.
    */
    Operator.prototype.isOperator = function () {
        return true;
    };
}

'use strict';

/* exported CONSTANT_SYMBOLS */
/* exported OPERATOR_SYMBOLS */

var CONSTANT_SYMBOLS = {
    TRUE: 'TRUE',
    FALSE: 'FALSE'
};

var OPERATOR_SYMBOLS = {
    NOT: 'NOT',
    AND: 'AND',
    OR: 'OR',
    CONDITIONAL: 'CONDITIONAL',
    BICONDITIONAL: 'BICONDITIONAL',
    UNKNOWN: 'unknown'
};

'use strict';

/* global MathSymbol */

/**
    Variable stores a variable name. Ex: x
    @class Variable
    @extends MathSymbol
    @constructor
    @param {String} name The name of the variable.
*/
function Variable(name) {
    MathSymbol.prototype.constructor.call(this, name);
}

Variable.prototype = new MathSymbol();
Variable.prototype.constructor = Variable;

/**
    Clone this symbol.
    @method clone
    @return {Variable} A clone of this symbol.
*/
Variable.prototype.clone = function () {
    return MathSymbol.prototype.clone.call(this, new Variable());
};

'use strict';

/* global Constant */
/* global Operator */
/* global Variable */
/* global ExpressionManipulation */
/* global makeExpression */
/* global buildConstantPrototype */
/* global buildOperatorPrototype */
/* global buildDigitalExpressionPrototype */
/* global CONSTANT_SYMBOLS */
/* global OPERATOR_SYMBOLS */

/**
    A set of models for performing propositional calculus.
    @module PropositionalCalculusSDK
    @return {void}
*/
function PropositionalCalculusSDK() {} // eslint-disable-line no-empty-function

/**
    Return a {MathSymbol} of the given type with the given name and children.
    @method makeSymbol
    @param {String} type The type of symbol to make. Valid values: 'constant', 'operator', and 'variable'.
    @param {String} name The name of the symbol.
    @param {Array} [children] Array of {MathSymbol}. The children of the symbol.
    @return {MathSymbol} The new symbol from given type, name, and children.
*/
PropositionalCalculusSDK.prototype.makeSymbol = function (type, name, children) {
    var symbolClass = null;

    switch (type) {
        case 'constant':
            symbolClass = Constant;
            break;
        case 'operator':
            symbolClass = Operator;
            break;
        case 'variable':
            symbolClass = Variable;
            break;
        default:
            throw new Error('Unrecognized symbol type: ' + type);
    }

    var newSymbol = Object.create(symbolClass.prototype);

    symbolClass.call(newSymbol, name, children);
    return newSymbol;
};

/**
    Run the manipulation function of the given name
    @method runManipulation
    @param {String} name The name of the manipulation to run.
    @param {Expression} expression The expression to manipulate.
    @param {Array} subExpressions Array of {Expression}. The sub-expressions in the manipulation.
    @param {Object} [options={}] Additional options for the manipulation.
    @return {Expression} Result of the manipulation.
*/
PropositionalCalculusSDK.prototype.runManipulation = function (name, expression, subExpressions) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var manipulation = new ExpressionManipulation();

    return manipulation[name](expression, subExpressions, options);
};

/**
    Return an {Expression} of the given type with the given root.
    @method makeExpression
    @param {String} type The type of expression to make. Valid values: 'proposition' and 'digital'.
    @param {MathSymbol} root The root of the expression.
    @return {Expression} The created expression from given type and root.
*/
PropositionalCalculusSDK.prototype.makeExpression = function (type, root) {
    return makeExpression(type, root);
};

/**
    Build prototypes for objects that are alphabetically before the inherited object.
    @method buildPrototypes
    @return {void}
*/
function buildPrototypes() {
    buildConstantPrototype();
    buildOperatorPrototype();
    buildDigitalExpressionPrototype();

    PropositionalCalculusSDK.prototype.CONSTANT_SYMBOLS = CONSTANT_SYMBOLS;
    PropositionalCalculusSDK.prototype.OPERATOR_SYMBOLS = OPERATOR_SYMBOLS;
}

var propositionalCalculusSDKInstance = null;

module.exports = {
    create: function create() {
        if (!propositionalCalculusSDKInstance) {
            buildPrototypes();
            propositionalCalculusSDKInstance = new PropositionalCalculusSDK();
        }
        return propositionalCalculusSDKInstance;
    },
    dependencies: {
        "tools": ["utilities", "discreteMathUtilities"]
    },
    runTests: function runTests() {
        buildPrototypes();
    }
};

'use strict';

/* global PropositionExpression, DigitalExpression */
/* exported makeExpression */

/**
    Return an {Expression} of the given type with the given root.
    @method makeExpression
    @param {String} type The type of expression to make. Valid values: 'proposition' and 'digital'.
    @param {MathSymbol} root The root of the expression.
    @return {Expression} The created expression from given type and root.
*/
function makeExpression(type, root) {
    var expressionClass = null;

    switch (type) {
        case 'proposition':
            expressionClass = PropositionExpression;
            break;
        case 'digital':
            expressionClass = DigitalExpression;
            break;
        default:
            throw new Error('Unrecognized expression type: ' + type);
    }

    var newExpression = Object.create(expressionClass.prototype);

    expressionClass.call(newExpression, root);
    return newExpression;
}


exports.default = module.exports;
});