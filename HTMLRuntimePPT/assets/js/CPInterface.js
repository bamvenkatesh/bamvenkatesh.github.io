//These two variables should be present on the window object so that this interface is available for Execute JS workflow also.
window.cpAPIInterface = undefined;
window.cpAPIEventEmitter = undefined;

cp.EventEmitterClass = function()
{
	this.callbackFns = {};
}

cp.EventEmitterClass.prototype.getGenericEventName = function(eventName)
{
	var leftRegExp = new RegExp("^CP");
	var rightRegExp = new RegExp("Event$");

	eventName = eventName.replace(leftRegExp,"");
	eventName = eventName.replace(rightRegExp,"");

	return eventName.toUpperCase();
}

cp.EventEmitterClass.prototype.addEventListener = function(eventName,fn,varName)
{
	if(eventName == undefined)
	{
		eventName = "Default";	
	}
	
	var lCallbacks = [];
	if(varName && varName != "")
	{
		if(this.callbackFns[eventName] == undefined)
			this.callbackFns[eventName] = new Object();
		if(this.callbackFns[eventName][varName] == undefined)
			this.callbackFns[eventName][varName] = new Array();

		lCallbacks = this.callbackFns[eventName][varName];
	}	
	else
	{
		if(this.callbackFns[eventName] == undefined)
			this.callbackFns[eventName] = new Array();

		lCallbacks = this.callbackFns[eventName];
	}		
	
	var index = lCallbacks.indexOf(fn);
	if( index < 0)
		lCallbacks.push(fn);
}

cp.EventEmitterClass.prototype.removeEventListener = function(eventName,fn,varName)
{
	if(eventName == undefined)
	{
		eventName = "Default";	
	}
	
	var lCallbacks = [];
	if(varName && varName != "")
	{
		if(this.callbackFns[eventName] == undefined)
			return;	
		if(this.callbackFns[eventName][varName] == undefined)
			return;	
		lCallbacks = this.callbackFns[eventName][varName]; 
	}
	else
	{
		if(this.callbackFns[eventName] == undefined)
			return;	
		lCallbacks = this.callbackFns[eventName];
	}
	
	var index = lCallbacks.indexOf(fn);
	if( index > -1){
		lCallbacks.splice(index, 1);
	}
	
}

cp.EventEmitterClass.prototype.trigger = function(event)
{	
	event.Name = "CPAPI_" + this.getGenericEventName(event.cpName);
	var lCallbacks = this.callbackFns[event.Name];
	if(event.Name == "CPAPI_VARIABLEVALUECHANGED")
	{
		if(!lCallbacks)
			return;
		var lVarName = event.Data.varName;
		lCallbacks = lCallbacks[lVarName];
	}
	if(!lCallbacks)
		return;
	for (var i = 0; i < lCallbacks.length; i++) {
		lCallbacks[i](event);
		/*var xmlhttp = new XMLHttpRequest();
		var msg = event.Name + ":{\n";
		var sortedKeys = [];
		for (k in event.Data)
		{
		    if (event.Data.hasOwnProperty(k))
		    {
		        sortedKeys.push(k);
		    }
		}
		sortedKeys.sort();
		for(var j = 0; j < sortedKeys.length; ++j)
		{
			msg += sortedKeys[j] + "=" + event.Data[sortedKeys[j]] + ";\n";
		}
		msg += "};"
		msg = escape(msg);
		var fName = "html.txt";
		xmlhttp.open("GET","log.php?fName=" + fName + "&msg=" + msg,false);
		xmlhttp.send();	*/		
	}
}

cp.ACAPEventEmitterClass = function()
{			
	cp.ACAPEventEmitterClass.baseConstructor.call(this);
};

cp.inherits(cp.ACAPEventEmitterClass, cp.EventEmitterClass);

cp.ACAPEventEmitterClass.prototype.addEventListener = function(fn,eventName)
{
	cp.ACAPEventEmitterClass.superClass.addEventListener.call(this,eventName,fn);
}

cp.ACAPEventEmitterClass.prototype.removeEventListener = function(fn,eventName)
{
	cp.ACAPEventEmitterClass.superClass.removeEventListener.call(this,eventName,fn);	
}

cp.ACAPEventEmitterClass.prototype.trigger = function(event)
{	
	event.Name = "CAPI_" + this.getGenericEventName(event.cpName);
	var lCallbacks = this.callbackFns["Default"];
	if(!lCallbacks)
		return;
	for (var i = 0; i < lCallbacks.length; i++) {
		lCallbacks[i](event);			
	}
}	

/*
* args will contain the data requested.
* callbackFn is a function which takes a jquery promise object as parameter
*/
cp.ACAPEventEmitterClass.prototype.getEvent = function(eventName, args, callbackFn)
{		
	var evt = document.createEvent("Events");
	evt.initEvent('getData', true, true, null );
	evt.data = eventName;
	evt.get = callbackFn;
	
	for (var i = 0; i < this.callbackFns.length; i++) 
	{
		this.callbackFns[i](event);			
	}
}

/*
* CPAPIInterface - interface provided to access/control the layout/playback of the content.

*/

cp.CPAPIInterfaceClass = function()
{
	this.m_eventEmitter = undefined;		
}

cp.CPAPIInterfaceClass.prototype = 
{
	canPlay: function()
	{
		if(cp.isExpired || !cp.passwordAccepted)
			return false;

		return true;
	},
	play : function()
	{
		if(!this.canPlay())
			return;
		if(cp.movie.paused)
			cp.playPause(true);
	},
	pause : function()
	{
		if(!cp.movie.paused)
			cp.playPause(true);
	},
	rewind : function()
	{	
		cp.rewind();
	},
	next : function()
	{
		cp.goToNextSlide();
	},
	previous :function()
	{
		cp.goToPreviousSlide();
	},
	fastForward :function()
	{
		cp.fastForward();
	},
	getPlaySpeed : function()
	{
		return cpInfoFPS;
	},
	getDurationInFrames : function()
	{
		return cpInfoFrameCount;
	},
	getDurationInSeconds : function()
	{	
		return this.getDurationInFrames() / this.getPlaySpeed();
	},
	getVolume : function()
	{
		return cpCmndVolume;
	},		
	setVolume : function(vol)
	{
		cpCmndVolume = vol;
	},
	navigateToTime : function(timeinmilliseconds)
	{
		//convert time to frame and 
		var frame = timeinmilliseconds * cpInfoFPS/1000;
		if(frame >= 0 && frame < 1)
			frame = 1;
		cp.movie.jumpToFrame(frame);			
	},
	
	gotoSlide : function(slideNum)
	{
		cpCmndGotoSlide = slideNum;
	},
	canNavigateToTime : function(timeinmilliseconds)
	{			
		var frame = timeinmilliseconds * cpInfoFPS/1000;			
		if(frame >= 0 && frame < 1)
			frame = 1;
		return cp.shouldMoveTo(frame);
	},
	getCurrentFrame : function()
	{
		return cpInfoCurrentFrame;
	},
	getCurrentSlideIndex : function()
	{
		return cpInfoCurrentSlide;
	},
	getEventEmitter : function()
	{
		if(this.m_eventEmitter == undefined)
		{
			if(cp.IsRunningInACAP)
				this.m_eventEmitter = new cp.ACAPEventEmitterClass();
			else
				this.m_eventEmitter = new cp.EventEmitterClass();
		}
		return this.m_eventEmitter;
	},
	getVariableValue: function(varname)
	{
		return window[varname];
	},
	setVariableValue: function(varname,val)
	{
		window[varname] = val;
	},
	close: 	function()
	{
		window.DoCPExit();
	},
	setAllowForceQuitContainer: function(val)
	{
		if(val)
			cp.setAllowForceQuitContainer = true;
		else
			cp.setAllowForceQuitContainer = false;
	},
	isSWFOrHTMLContent: function()
	{
		return 'html';
	},
	getCurrentDeviceMode: function() {
		if(cp.ResponsiveProjWidth == cp.responsiveWidths[0])
			return 'mobile';
		else if(cp.ResponsiveProjWidth == cp.responsiveWidths[1])
			return 'tablet';
		else
			return 'desktop';
	}
};

/*
* ACAPInterface - interface provided to ACAP player to control the layout/playback of the content.

*/

cp.ACAPInterfaceClass = function()
{
	this.ReportingCriteriaMap = new Object();
	this.ReportingCriteriaMap["user_access"] = cp.ReportingOptionsEnum.access;
	this.ReportingCriteriaMap["quiz_only"] = cp.ReportingOptionsEnum.quiz_only;
	this.ReportingCriteriaMap["slideviews_only"] = cp.ReportingOptionsEnum.views_only;
	this.ReportingCriteriaMap["quiz_and_slideviews"] = cp.ReportingOptionsEnum.quiz_and_views;

	this.QuizCriteriaMap = new Object();
	this.QuizCriteriaMap["quiz_passed"] = cp.QuizCriteriaEnum.QuizIsPassed;
	this.QuizCriteriaMap["quiz_attempted"] = cp.QuizCriteriaEnum.QuizIsAttempted;
	this.QuizCriteriaMap["quizpassed_or_limitreached"] = cp.QuizCriteriaEnum.QuizIsPassedOrAttempLimitReached;

	cp.ACAPTOCVisibility = false;
}

cp.inherits(cp.ACAPInterfaceClass, cp.CPAPIInterfaceClass);

cp.ACAPInterfaceClass.prototype.controlVisibility = function(component,visibility)
{
	if(component == "playbar")
		cp.D.playBarProperties.hasPlayBar = visibility;
	else if(component == "toc"){
		cp.D.project.hasTOC = visibility? 1:0;
		cp.ACAPTOCVisibility = visibility;
	}
	else if(component == "cc")			
		cp.D.playBarProperties.hasCC = visibility;				
}

cp.ACAPInterfaceClass.prototype.navigateToItem = function(item_id)
{
	//search from item in project data. Get its start frame and jump to frame
	var itemData = cp.D[item_id];
	var fromFrame = itemData.from;
	cp.movie.jumpToFrame(fromFrame);
}

cp.ACAPInterfaceClass.prototype.canNavigateToItem = function(item_id)
{
	//search from item in project data. Get its start frame and jump to frame
	var itemData = cp.D[item_id];
	var fromFrame = itemData.from;
	return cp.shouldMoveTo(fromFrame);
}

cp.ACAPInterfaceClass.prototype.enterReviewMode = function()
{
	//resume the project from first slide
	setCpInfoCurrentFrame(0);
}

cp.ACAPInterfaceClass.prototype.prepareForACAPRender = function()
{
	this.controlVisibility("playbar",false);
	this.controlVisibility("cc",false);
	this.controlVisibility("toc",false);
}

cp.ACAPInterfaceClass.prototype.stop = function()
{
	cpCmndRewindAndStop = true;
}
cp.ACAPInterfaceClass.prototype.ShowTOC = function(visibility)
{
	if(visibility)
		this.setVariableValue('cpCmndTOCVisible',1);
	else
		this.setVariableValue('cpCmndTOCVisible',0);
}
/*
setReportingOptions = function(iSuccessCriteriaObj,iCompletionCriteriaObj)
completionCriteria.criteriaChosen			- "user_access", "quiz_only", "slideviews_only", "quiz_and_slideviews"
completionCriteria.slideviewsValue			- number
completionCriteria.isPercentageSlideviews	- boolean
completionCriteria.quizCriteria				- "quiz_passed","quiz_attempted","quizpassed_or_limitreached"

successCriteria.criteriaChosen				- "user_access", "quiz_only", "slideviews_only", "quiz_and_slideviews"
successCriteria.slideviewsValue				- number
successCriteria.isPercentageSlideviews		- boolean
successCriteria.quizCriteria				- "quiz_passed"
*/
cp.ACAPInterfaceClass.prototype.setReportingOptions = function(iSuccessCriteriaObj,iCompletionCriteriaObj)
{	
	this.completionCriteria = this.ReportingCriteriaMap[iCompletionCriteriaObj.criteriaChosen];
	this.quizCriteriaForCompletion = this.QuizCriteriaMap[iCompletionCriteriaObj.quizCriteria];
	this.slideViewsForCompletion = iCompletionCriteriaObj.slideviewsValue;
	this.slideViewsTypeForCompletion = cp.SlideViewsTypeEnum.percent;
	if(!iCompletionCriteriaObj.isPercentageSlideviews)
		this.slideViewsTypeForCompletion = cp.SlideViewsTypeEnum.number;

	this.successCriteria = this.ReportingCriteriaMap[iSuccessCriteriaObj.criteriaChosen];
	this.quizCriteriaForSuccess = this.QuizCriteriaMap[iSuccessCriteriaObj.quizCriteria];
	this.slideViewsForSuccess = iSuccessCriteriaObj.slideviewsValue;
	this.slideViewsTypeForSuccess = cp.SlideViewsTypeEnum.percent;
	if(!iSuccessCriteriaObj.isPercentageSlideviews)
		this.slideViewsTypeForSuccess = cp.SlideViewsTypeEnum.number;
}
cp.ConnectInterfaceClass = function()
{

}
cp.inherits(cp.ConnectInterfaceClass, cp.CPAPIInterfaceClass);

cp.ConnectInterfaceClass.prototype.goToScrubPosition = function(timeinmilliseconds)
{
	var frame = timeinmilliseconds * cpInfoFPS/1000;
	if(frame >= 0 && frame < 1)
		frame = 1;
	var itemData = cp.movie.stage.currentSlide;
	var fromFrame = itemData.from;
	var toFrame  = itemData.to;
	if(frame<fromFrame)
	{
		cp.movie.jumpToFrame(fromFrame);
	}
	else if(frame>toFrame)
	{
		cp.movie.jumpToFrame(toFrame);
	}
	else
	{
		cp.movie.jumpToFrame(frame);
	}
}
cp.ConnectInterfaceClass.prototype.setAllowForceQuitContainer = function(val)
{
	if(val)
		cp.setAllowForceQuitContainer = true;
	else
		cp.setAllowForceQuitContainer = false;
}
cp.ConnectInterfaceClass.prototype.close = function()
{
	window.DoCPExit();
}
cp.ConnectInterfaceClass.prototype.showUI = function(iComponentName,iShow)
{
	if(iComponentName == 'playbar')
	{
		if(iShow)
		{
			this.setVariableValue('cpCmndShowPlaybar',1);
			cp.disableInteractions = false;
		}			
		else
		{
			this.setVariableValue('cpCmndShowPlaybar',0);
			cp.disableInteractions = true;
		}

		//blockerDiv.style.display = iShow ? "none" : "block";

		return true;
	}
	else if(iComponentName == 'closeButton')
	{
		if(cpCmndShowPlaybar == false)
			return false;
		var pbButtonsArray = cp.PB.rootObj.firstRowArray;
		var exitButtonElem;
		for(var i = 0 ; i < pbButtonsArray.length; i++)
		{
			if(pbButtonsArray[i].iconName == cp.PB.Btns.kBtnExit)
			{
				exitButtonElem = pbButtonsArray[i];
			}
		}
		if(exitButtonElem == undefined)
			return false;
		if(iShow)
		{
			exitButtonElem.currDiv.style.display = "block";
			cp.PB.hideExitButton = false;
			if(cp.adjustSkins)
				cp.adjustSkins();
		}
		else
		{	
			exitButtonElem.currDiv.style.display = "none";
			cp.PB.hideExitButton = true;;
		}
	}
	return false;
}