cp.CPProjInit();

cp.fireModuleReadyEvent = function(iWindow)
{
	if(!cp.IsRunningInACAP)
	{
	if(cp.isExpired || !cp.passwordAccepted)
		return;
	}
		
	if(document.createEvent)
	{
		var evt = document.createEvent("Events");
		evt.initEvent('moduleReadyEvent', true, true, null );
		evt.Data = cp.currentWindow.cpAPIInterface;
		iWindow.dispatchEvent(evt);		
	}
}

cp.DoCPInit = function()
{		
	cp.disableInteractions = false;
	if(cp.initializeGestureEvents)
		cp.initializeGestureEvents();
	if(!cp.pg && !(cp.sbw || cp.getIsBrowserSupported() || cp.isSupportedWebkitBasedBrowser()) && RuntimeBrowserDetect)
	{
		var lMsg = "This browser does not support some of the content in the file you are trying to view. Use one of the following browsers:<ul><li>Internet Explorer 9 or later</li><li>Safari 5.1 or later</li><li>Google Chrome 17 or later</li><li>Firefox " + cp.FF_MIN_SUPPORTED_VERSION + " or later</li></ul>";
		var lTitle = 'Adobe Captivate';
		var lOK = 'OK';
		if(cp && cp.model && cp.model.data)
		{
			var lDialogData = cp.model.data.rtDialog;
			if(lDialogData)
			{
				lMsg = lDialogData.rtUnsupportedBowser;
				if(lMsg.indexOf("@FFVERSION") != -1)
				{
					lMsg = lMsg.replace("@FFVERSION",cp.FF_MIN_SUPPORTED_VERSION);
				}
				lTitle = lDialogData.rtWarningTitle;				
				lOK = lDialogData.rtokb;
			}
		}
		
		RuntimeBrowserDetect.init(lMsg, lTitle, lOK);
	}
	
	cp.initiated = false;

	cp.LMSTypes = new Object();
	cp.LMSTypes.NONE = 0;
	cp.LMSTypes.SCORM2004 = 1;
	cp.LMSTypes.SCORM12 = 2;
	cp.LMSTypes.Authorware = 3;
	cp.LMSTypes.AICC = 4;
	cp.LMSTypes.QuestionMark = 5;
	cp.LMSTypes.Email = 6;
	cp.LMSTypes.Breeze = 7;
	cp.LMSTypes.Acrobat = 8;
	cp.LMSTypes.InternalServer = 9;
	cp.LMSTypes.TinCan = 10;

	var f = cp.ContinueCPInit;
	
	var u = function() { jQuery(window).unload( function () { cp.UnloadActivties(); } ) };
	
	cp.currentWindow = window;
	cp.parentWindow = window.parent;
	cp.topWindow = window.top;
	cp.setAllowForceQuitContainer = true;
	try
	{
		if(cp.parentWindow.document && cp.verbose)
			console.log("tring to access document of parent window");
	}
	catch(e)
	{
		cp.parentWindow = cp.currentWindow;
	}
	try
	{
		if(cp.topWindow.document && cp.verbose)
			console.log("tring to access document of top window");
	}
	catch(e)
	{
		cp.topWindow = cp.currentWindow;
		try
		{
			while(cp.topWindow.parent.document)
				cp.topWindow = cp.topWindow.parent;
		}
		catch(e)
		{}
	}

	cp.IsRunningInACAP = (cp.getParameterByName("capi_player") == 1);
	cp.IsRunningInALEC = (cp.getParameterByName("CPinsideAlec") == 1);
	cp.IsRunningInRoboHelp = (cp.getParameterByName("CPinsideRH") == "true");

	
	if(cp.IsRunningInACAP)
		cp.currentWindow.cpAPIInterface = new cp.ACAPInterfaceClass();
	else if(cp.IsRunningInConnect())
		cp.currentWindow.cpAPIInterface = new cp.ConnectInterfaceClass();
	else
		cp.currentWindow.cpAPIInterface = new cp.CPAPIInterfaceClass();
	
	cp.currentWindow.cpAPIEventEmitter = cp.currentWindow.cpAPIInterface.getEventEmitter();		
	
	if(cp.IsRunningInACAP)
	{
		cp.fireModuleReadyEvent(cp.parentWindow);
		var lResumeDataEvent = new Object();
		lResumeDataEvent.Name = 'CPGetEvent';
		lResumeDataEvent.cpName = lResumeDataEvent.Name;
		lResumeDataEvent.Data = new Object();
		lResumeDataEvent.Data.ask = "resumeData";//RESUME DATA CONSTANT
		lResumeDataEvent.Data.callback = cp.handleACAPResumeData;
		lResumeDataEvent.cpData = lResumeDataEvent.Data;
		cp.currentWindow.cpAPIEventEmitter.trigger(lResumeDataEvent);
		u();
		return;
	}

	if(!cp.IsRunningInACAP && cp.D && cp.D["quizReportingData"])
	{
		var lLMSType = cp.D["quizReportingData"]["lmsType"];
		cp.LMSDriverHolder = undefined;
		switch(lLMSType)
		{		
			case cp.LMSTypes.SCORM2004:
			case cp.LMSTypes.SCORM12:
			{
				cp.LMSDriverHolder = window;
				f = cp.LoadActivities;
				u();
				break;
			}
			case cp.LMSTypes.TinCan:
			{
				var lIsResponsive =  cp.D["project_main"].useResponsive;
				if(cp.m_isLMSPreview && lIsResponsive)
					cp.LMSDriverHolder = window.parent.parent;
				else if(cp.m_isLMSPreview)
					cp.LMSDriverHolder = window.parent;
				else
					cp.LMSDriverHolder = window;
				f = cp.LoadActivities;
				u();
				cp.D["quizReportingData"]["lmsType"] = cp.LMSTypes.SCORM2004;
				break;
			}
			case cp.LMSTypes.AICC:
			{
				var lIsResponsive =  cp.D["project_main"].useResponsive;
				if(cp.m_isLMSPreview && lIsResponsive)
					cp.LMSDriverHolder = window.parent.parent;
				else
					cp.LMSDriverHolder = window.parent;
				if(!cp.LMSDriverHolder.blockedForLMS)
				{
					cp.LMSDriverHolder.blockedForLMS = true;
					cp('blockUserInteraction').style.display = 'block';
					cp('blockUserInteraction').style.width = '100%';
					cp('blockUserInteraction').style.height = '100%';
				}
				f = cp.LMSDriverHolder.HTMLContentLoadedCallback;
				u();
				break;
			}
			default:
			{
				cp.LMSDriverHolder = undefined;				
				break;
			}
		}
	}
	
	f = cp.IsRunningInConnect() ? cp.LoadActivities : f;
	if(!f)
	{
		f = cp.ContinueCPInit;
		cp.NotRunningInLMS = true;
	}

	if(cp.pg && window.device && window.device.platform === 'iOS')
	{
		if(StatusBar)
		{
			StatusBar.overlaysWebView(false);
		}
	}
	
	function phonegapLoadCallback()
	{
		f();

		cp.Automate();
	}

	if(cp.pg && window.device && window.device.platform === 'Android')
	{
		cp.Phonegap.loadResources(phonegapLoadCallback);
	}
	else
		phonegapLoadCallback();
}

cp.ContinueCPInit = function()
{
	cp.CPPreInit();
	cp.QuizLibraryInit();
	cp.CPPostInit();
	if(typeof(CPAutomator) != 'undefined'){
		CPAutomator.init();
	}
	//For accessibility purposes
	document.getElementById('playImage').focus();

	cp.initiated = true;
	cp.complete();
}

window["DoCPExit"] = function()
{
	try
	{
		cp.em.fireEvent('CPMovieExit');
		if(cp.IsRunningInACAP || cp.IsRunningInALEC || cp.m_isLMSPreview)
		{
			cp.currentWindow.open("goodbye.html","_self");
			return;
		}	
		if(cp.IsRunningInRoboHelp)
		{
			var win = cp.currentWindow.open("","_self");
			win.close();
			return;
		}	
		if(cp.currentWindow != cp.parentWindow && cp.parentWindow && cp.parentWindow.hasOwnProperty("DoCPExit"))
		{
			if(cp.setAllowForceQuitContainer)
				cp.parentWindow.DoCPExit();
			else
				cp.currentWindow.close();
		}
		else
		{
			if(cp.IsRunningInConnect())
			{
				if(cp.setAllowForceQuitContainer)
				{
					cp.parentWindow.close();
				}					
				else
				{
					cp.currentWindow.close();
				}
					
			}
			else
			{
				if(cp.topWindow == self )
				{
					var win = window.open("","_self");
					win.close();
				}
				else
				{
					if(cp.setAllowForceQuitContainer)
					{
						var win = cp.topWindow.open("","_self");
						win.top.close();
					}
					else
					{
						var win = window.open("","_self");
						win.close();
					}
				}
			}	
		}
	}
	catch(e)
	{}

	if(cp.pg)
	{
		if(navigator && navigator.app )
		{
			if(typeof navigator.app.exitApp === 'function')
				navigator.app.exitApp(); 
		}
	}

	if(cp.win8)
	{
		if(window && window.parent)
		{
			var messageData = {} ;
			messageData.name = "WIN8APPCLOSE";
			messageData.data = {} ;
			window.parent.postMessage(messageData,"*");
		}
	}
				
	cp.currentWindow.open("goodbye.html","_self");
}

cp.Automate = function()
{
	if(typeof(CPAutomator) == 'undefined') return;
	
	if(CPAutomator.CPRunSuite.model.workflow)
	{
		setTimeout(function(){CPAutomator.Replay.init();},10000);
	}		
}
/*
function getParameterByName(parameterName) {
    parameterName = parameterName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + parameterName + "=([^&#]*)");
    var searchResult = regex.exec(location.search);
    return searchResult == null ? "" : decodeURIComponent(searchResult[1].replace(/\+/g, " "));
}
*/
