define("singleInputQuestionProgressionTool",["exports"],function(a){function b(a,b){this.expectedAnswer=a||"",this.explanationTemplate=b||"",this.validAnswerExplanation="Your answer has an invalid format."}function c(){this.numberOfQuestions=1}function d(){this.init=function(a,b,c){this.name="singleInputQuestionProgressionTool",this.id=a,this.parentResource=b,this.utilities=require("utilities"),this.progressionTool=require("progressionTool").create();var d=this[this.name].singleInputQuestionProgressionTool(),e=c.css;this.displayTemplate=c.displayTemplate;var f=c.latexChanged||!1,g=c.questionFactory;this.questionCache=this.utilities.getQuestionCache(g,5),this.currentQuestion=null,this.userAnswerWasInvalid=!1;var h=this;this.progressionTool.init(this.id,this.parentResource,{html:d,css:e,numToWin:g.numberOfQuestions,useMultipleParts:!0,start:function(){h.enableInput()},reset:function(){h.generateProblem(0),h.disableInput()},next:function(a){h.userAnswerWasInvalid?h.userAnswerWasInvalid=!1:h.generateProblem(a),h.enableInput()},isCorrect:function(){var a=h.utilities.removeWhitespace(h.$input.val()),b=!1,c=h.currentQuestion.validAnswerExplanation;return h.currentQuestion.isInputFormatValid(a)?(b=h.currentQuestion.isCorrect(a),c=h.currentQuestion.getExplanation(a)):h.userAnswerWasInvalid=!0,h.disableInput(),{userAnswer:JSON.stringify(a),expectedAnswer:JSON.stringify(h.currentQuestion.expectedAnswer),isCorrect:b,explanationMessage:c,latexChanged:f,callbackFunction:function(){h.currentQuestion.explanationPostProcess()},metadata:h.currentQuestion.getMetadata()}}}),this.$questionContainer=$("#"+this.id+" .question-container"),this.generateProblem(0),this.disableInput()},this.disableInput=function(){this.$input.prop("disabled",!0)},this.enableInput=function(){this.$input.prop("disabled",!1).focus()},this.generateProblem=function(a){this.currentQuestion=this.questionCache.makeQuestion(a);var b=this.displayTemplate({question:this.currentQuestion});this.$questionContainer.html(b),this.$input=this.$questionContainer.find("input");var c=this;this.$input.keypress(function(a){a.which===c.utilities.ENTER_KEY&&c.progressionTool.check()}),this.parentResource.setSolution(""+this.currentQuestion.expectedAnswer,"text",!0),this.parentResource.latexChanged(),this.currentQuestion.generateProblemPostProcess()},this.singleInputQuestionProgressionTool=this.singleInputQuestionProgressionTool||{},this.singleInputQuestionProgressionTool.singleInputQuestionProgressionTool=Handlebars.template({compiler:[7,">= 4.0.0"],main:function(a,b,c,d,e){return"<div class='question-container'></div>"},useData:!0})}var e={};b.prototype.isCorrect=function(a){return a===this.expectedAnswer},b.prototype.isInputFormatValid=function(a){return/\S/.test(a)},b.prototype.getExplanation=function(a){return this.explanationTemplate.replace(/USER_ANSWER/g,a)},b.prototype.explanationPostProcess=function(){},b.prototype.generateProblemPostProcess=function(){},b.prototype.getMetadata=function(){return{}},c.prototype.make=function(a){return new b};var f={create:function(){return new d},dependencies:{tools:["progressionTool","utilities"]},getNewQuestionFactory:function(){return new c},getNewQuestion:function(){return new b}};e.exports=f,a["default"]=e.exports});