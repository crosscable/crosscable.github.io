define("setEquation",["exports"],function(a){function b(a,b){this.expectedSet=a,this.explanation=b}function c(a,b){this.set=a,this.setName=b}function d(a,b,c){this.set=a,this.negatedSet=b,this.description=c}function e(){this.init=function(a,b){var c=this.setEquation.setEquation({id:a});this._progressionTool=require("progressionTool").create(),this._utilities=require("utilities"),this._discreteMathUtilities=require("discreteMathUtilities");var d=!1,e=this;this._progressionTool.init(a,b,{html:c,css:'<style>.zyante-bold{font-family:HelveticaNeue-Light,"Helvetica Neue Light","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;font-weight:300}.zyante-section-bold{font-family:Helvetica;font-weight:300}.setEquation{font-family:HelveticaNeue-Light,"Helvetica Neue Light","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;font-size:18px;width:460px}.setEquation .center-container{text-align:center}.setEquation .given-sets{color:#5780a6;display:inline-block;margin-top:20px;margin-bottom:20px;text-align:center}.setEquation .given-sets div{margin-bottom:10px;text-align:left}.setEquation .problem-container{text-align:center;margin-bottom:30px}.setEquation .problem-container div,.setEquation .problem-container input{display:inline-block}.setEquation .negated{border-top:1px solid}</style>',numToWin:7,useMultipleParts:!0,start:function(){e._enableInput()},reset:function(){e._makeLevel(0),e._disableInput()},next:function(a){e._enableInput(),d||e._makeLevel(a),d=!1},isCorrect:function g(a){var b=e._$input.val();e._disableInput();var c=e._expectedAnswer.explanation,g=!0,f=e._isInputValid(b),h=[];if(f){h=e._convertStringToSet(b),h.sort(),e._expectedAnswer.expectedSet.sort();var i=e._findDuplicateElementsInSet(h);i.length>0?(g=!1,c=i[0]+" is listed more than once."):h.length!==e._expectedAnswer.expectedSet.length?g=!1:h.forEach(function(a){var b=a;-1===e._expectedAnswer.expectedSet.indexOf(b)&&(g=!1)})}else g=!1,d=!0,c="Invalid input. Valid input example: 3, 5, 9";return{explanationMessage:c,userAnswer:JSON.stringify(h),expectedAnswer:JSON.stringify(e._expectedAnswer.expectedSet),isCorrect:g}}});var f=$("#"+a);this._$givenSets=f.find(".given-sets").find("div"),this._$problem=f.find(".problem"),this._$input=f.find("input"),this._makeLevel(0),this._$input.keypress(function(a){a.keyCode===e._utilities.ENTER_KEY&&e._progressionTool.check()}),this._disableInput()},this._disableInput=function(){this._$input.attr("disabled",!0)},this._enableInput=function(){this._$input.attr("disabled",!1),this._$input.focus()},this._findDuplicateElementsInSet=function(a){var b=[],c=null;return a.forEach(function(a){a===c&&b.push(a),c=a}),b},this._isInputValid=function(a){return a=a.replace(/ /g,""),/^\d+(,\d+)*$/.test(a)||""===a},this._convertStringToSet=function(a){return a=a.replace(/ /g,""),""===a?[]:a.split(",")},this._stringifySet=function(a){var b="{ ";return b+=a.join(", "),b+=" }"},this._generateSetWithNElements=function(a){for(var b=[],c=[],d=0;a>d;d++){var e=this._utilities.pickNumberInRange(1,9,c);b.push(e.toString()),c.push(e)}return b.sort(),b},this._evaluateMinus=function(a,b){return a.filter(function(a){return-1===b.indexOf(a)})},this._evaluateUnion=function(a,b){var c=[];return a.forEach(function(a){c.push(a)}),b.forEach(function(b){-1===a.indexOf(b)&&c.push(b)}),c},this._evaluateIntersect=function(a,b){var c=[];return a.forEach(function(a,d){-1!==b.indexOf(a)&&c.push(a)}),c},this._evaluateSymmetricDifference=function(a,b){var c=this._evaluateMinus(a,b),d=this._evaluateMinus(b,a);return this._evaluateUnion(c,d)},this._evaluateSetExpression=function(a){for(;a.length>1;){var b=[];switch(a[2]){case"-":b=this._evaluateMinus(a[0],a[1]);break;case this._discreteMathUtilities.unionSymbol:b=this._evaluateUnion(a[0],a[1]);break;case this._discreteMathUtilities.intersectSymbol:b=this._evaluateIntersect(a[0],a[1]);break;case this._discreteMathUtilities.symmetricDifference:b=this._evaluateSymmetricDifference(a[0],a[1])}a.shift(),a.shift(),a[0]=b}return a[0].sort(),a[0]},this._generateSingleSymbolExplanation=function(a,b,c){switch(b){case"-":return this._stringifySet(c)+" contains all elements in "+a[0]+" that are not in "+a[1]+".";case this._discreteMathUtilities.unionSymbol:return this._stringifySet(c)+" contains all elements in  "+a[0]+" or "+a[1]+".";case this._discreteMathUtilities.intersectSymbol:return this._stringifySet(c)+" contains elements in both "+a[0]+" and "+a[1]+".";case this._discreteMathUtilities.symmetricDifference:var d=this._stringifySet(c)+this._utilities.getNewline()+a[0]+" "+this._discreteMathUtilities.symmetricDifference+" "+a[1]+" = ("+a[0]+" - "+a[1]+") "+this._discreteMathUtilities.unionSymbol+" ("+a[1]+" - "+a[0]+")";return d}},this._generateSpecialSet=function(){var a=[new d(["1","3","5","7","9"],["2","4","6","8"],"{ x ∈ Z: x is odd }"),new d(["2","4","6","8"],["1","3","5","7","9"],"{ x ∈ Z: x is even }"),new d(["3","6","9"],["1","2","4","5","7","8"],"{ x ∈ Z: x is an integer multiple of 3 }"),new d(["4","8"],["1","2","3","5","6","7","9"],"{ x ∈ Z: x is an integer multiple of 4 }"),new d(["1","4","9"],["2","3","5","6","7","8"],"{ x ∈ Z: x is a perfect square }")];return this._utilities.shuffleArray(a),a[0]},this._ensureSetOverlap=function(a,b){var c=a[this._utilities.pickNumberInRange(0,a.length-1)];-1===b.indexOf(c)&&(b[this._utilities.pickNumberInRange(0,b.length-1)]=c),b.sort()},this._shuffleAllButLastElement=function(a){var b=a.pop();return this._utilities.shuffleArray(a),a.push(b),a},this._initialGivenSets=function(a,b){this._clearSets();var d=this._generateSetWithNElements(4),e=this._generateSetWithNElements(3),f=this._generateSetWithNElements(3);this._ensureSetOverlap(d,e);var g=[new c(e,"B"),new c(d,"A")],h="A = "+this._stringifySet(d),i="B = "+this._stringifySet(e);if(b&&(specialSet=this._generateSpecialSet(),g[1].set=specialSet.negatedSet,h="A = "+specialSet.description,this._ensureSetOverlap(e,specialSet.set)),3===a&&g.unshift(new c(f,"C")),this._$givenSets.eq(0).text(h),this._$givenSets.eq(1).text(i),3===a){var j="C = "+this._stringifySet(f);this._$givenSets.eq(2).text(j)}return b?g=this._shuffleAllButLastElement(g):this._utilities.shuffleArray(g),g},this._getSetNames=function(a){return a.map(function(a){return a.setName})},this._clearSets=function(){this._$givenSets.html("")},this._clearProblem=function(){this._$problem.html("")},this._generateNegatedASpan=function(){return"<span class='negated'>A</span>"},this._generateNegatedAProblem=function(a,c){this._clearProblem();var d,e,f,g=this._getSetNames(a),h=a[0].set,i=a[1].set,j=3===g.length?a[2].set:{};return"A"===g[0]?2===g.length?(e=this._generateNegatedASpan()+" "+c[0]+" "+g[1],d=this._evaluateSetExpression([h,i,c[0]]),f=this._stringifySet(d)+this._utilities.getNewline()+"The bar over the A means Not A."):3===g.length&&(this._utilities.flipCoin()?(e="("+this._generateNegatedASpan()+" "+c[0]+" "+g[1]+" ) "+c[1]+" "+g[2],d=this._evaluateSetExpression([h,i,c[0],j,c[1]]),f=this._stringifySet(d)+"<br>First evaluate "+this._generateNegatedASpan()+" "+c[0]+" "+g[1]+". Then evaluate "+e+"."):(e=this._generateNegatedASpan()+" "+c[0]+" ( "+g[1]+" "+c[1]+" "+g[2]+" )",d=this._evaluateSetExpression([h,this._evaluateSetExpression([i,j,c[1]]),c[0]]),f=this._stringifySet(d)+"<br>First evaluate "+g[1]+" "+c[1]+" "+g[2]+". Then evaluate "+e+".")):"A"===g[1]?2===g.length?(e=g[0]+" "+c[0]+" "+this._generateNegatedASpan(),d=this._evaluateSetExpression([h,i,c[0]]),f=this._stringifySet(d)+this._utilities.getNewline()+"The bar over the A means Not A."):3===g.length&&(this._utilities.flipCoin()?(e="( "+g[0]+" "+c[0]+" "+this._generateNegatedASpan()+" ) "+c[1]+" "+g[2],d=this._evaluateSetExpression([h,i,c[0],j,c[1]]),f=this._stringifySet(d)+"<br>First evaluate "+g[0]+" "+c[0]+" "+this._generateNegatedASpan()+". Then evaluate ( "+e+"."):(e=g[0]+" "+c[0]+" ( "+this._generateNegatedASpan()+" "+c[1]+" "+g[2]+" )",d=this._evaluateSetExpression([h,this._evaluateSetExpression([i,j,c[1]]),c[0]]),f=this._stringifySet(d)+"<br>First evaluate "+this._generateNegatedASpan()+" "+c[1]+" "+g[2]+". Then evaluate "+e+".")):"A"===g[2]&&(this._utilities.flipCoin()?(e="( "+g[0]+" "+c[0]+" "+g[1]+" ) "+c[1]+" "+this._generateNegatedASpan(),d=this._evaluateSetExpression([h,i,c[0],j,c[1]]),f=this._stringifySet(d)+"<br>First evaluate "+g[0]+" "+c[0]+" "+g[1]+". Then evaluate "+e+"."):(e=g[0]+" "+c[0]+" ( "+g[1]+" "+c[1]+" "+this._generateNegatedASpan()+" )",d=this._evaluateSetExpression([h,this._evaluateSetExpression([i,j,c[1]]),c[0]]),f=this._stringifySet(d)+"<br>First evaluate "+g[1]+" "+c[1]+" "+this._generateNegatedASpan()+". Then evaluate "+e+".")),this._$problem.html(e),new b(d,f)},this._singleSymbolLevel=function(a,c){c=c||!1,sets=this._initialGivenSets(2,c);var d=sets[0].set,e=sets[1].set,f=this._getSetNames(sets);if(c)this._expectedAnswer=this._generateNegatedAProblem(sets,[a]);else{var g=f[0]+" "+a+" "+f[1];this._$problem.html(g);var h=this._evaluateSetExpression([d,e,a]),i=this._generateSingleSymbolExplanation(f,a,h);this._expectedAnswer=new b(h,i)}},this._twoSymbolLevel=function(a){var c=this._initialGivenSets(3,a),d=c[0].set,e=c[1].set,f=c[2].set,g=this._getSetNames(c);if(a){var h=["-",this._discreteMathUtilities.unionSymbol,this._discreteMathUtilities.intersectSymbol];if(this._utilities.shuffleArray(h),h[0]===this._discreteMathUtilities.intersectSymbol)h[1]="-";else if("-"===h[0])h[1]=this._discreteMathUtilities.intersectSymbol;else{var i=["-",this._discreteMathUtilities.intersectSymbol];this._utilities.shuffleArray(h),h[1]=i[0]}this._expectedAnswer=this._generateNegatedAProblem(c,h)}else{var j="",k=[],l="",h=["-",this._discreteMathUtilities.symmetricDifference];this._utilities.shuffleArray(h),this._utilities.flipCoin()?(j="( "+g[0]+" "+h[0]+" "+g[1]+" ) "+h[1]+" "+g[2],k=this._evaluateSetExpression([d,e,h[0],f,h[1]]),l=this._stringifySet(k)+"<br>First evaluate "+g[0]+" "+h[0]+" "+g[1]+". Then evaluate "+j+"."):(j=g[0]+" "+h[0]+" ( "+g[1]+" "+h[1]+" "+g[2]+" )",k=this._evaluateSetExpression([d,this._evaluateSetExpression([e,f,h[1]]),h[0]]),l=this._stringifySet(k)+"<br>First evaluate "+g[1]+" "+h[1]+" "+g[2]+". Then evaluate "+j+"."),this._$problem.html(j),this._expectedAnswer=new b(k,l)}},this._makeLevel=function(a){switch(this._$input.val(""),a){case 0:this._singleSymbolLevel(this._discreteMathUtilities.intersectSymbol);break;case 1:this._singleSymbolLevel(this._discreteMathUtilities.unionSymbol);break;case 2:this._singleSymbolLevel("-");break;case 3:this._singleSymbolLevel(this._discreteMathUtilities.symmetricDifference);break;case 4:var b=["-",this._discreteMathUtilities.intersectSymbol];this._utilities.shuffleArray(b),this._singleSymbolLevel(b[0],!0);break;case 5:this._twoSymbolLevel();break;case 6:this._twoSymbolLevel(!0)}0===this._expectedAnswer.expectedSet.length&&this._makeLevel(a)},this.reset=function(){this._progressionTool.reset()},this.setEquation=this.setEquation||{},this.setEquation.setEquation=Handlebars.template({compiler:[7,">= 4.0.0"],main:function(a,b,c,d,e){return"<div class='center-container'>\n    <div class='given-sets'>\n        <div></div>\n        <div></div>\n        <div></div>\n    </div>\n</div>\n\n<div class='problem-container'>\n    <div class='problem'></div>\n    = { <input type='text' placeholder='Ex: 3, 6'> }\n</div>\n"},useData:!0})}var f={},g={create:function(){return new e},dependencies:{tools:["progressionTool","discreteMathUtilities","utilities"]}};f.exports=g,a["default"]=f.exports});