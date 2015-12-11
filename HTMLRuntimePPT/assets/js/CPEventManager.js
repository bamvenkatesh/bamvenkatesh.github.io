(function(cp)
{
	cp.VARIABLE_CREATED_EVENT = 0;
	cp.VARIABLE_CHANGED_EVENT = 1;
	cp.SPECIFIC_VARIABLE_CHANGED_EVENT = 2;
	cp.SLIDEENTEREVENT = 3;	
	cp.SLIDEEXITEVENT = 4;

    cp.INTERACTIVEITEMSUBMITEVENT = 5;    
    cp.MOVIEPAUSEEVENT = 6;
    cp.MOVIERESUMEEVENT = 7;
    cp.MOVIESTARTEVENT = 8;
    cp.MOVIESTOPEVENT = 9;
    cp.QUESTIONSKIPEVENT = 10;
    cp.QUESTIONSUBMITEVENT = 11;
    cp.STARTPLAYBARSCRUBBINGEVENT = 12;
    cp.ENDPLAYBARSCRUBBINGEVENT = 13;   
	cp.MOVIEFOCUSINEVENT = 14;
    cp.MOVIEFOCUSLOSTEVENT = 15; 
	cp.MOVIEAUDIOMUTEEVENT = 16;

	cp.INPUTCONTROLREPLACEDEVENT = 17;
	cp.WINDOWRESIZEDEVENT = 18;
	cp.WINDOWRESIZECOMPLETEDEVENT = 19;
	cp.ORIENTATIONCHANGEDEVENT = 20;
	cp.ORIENTATIONCHANGECOMPLETEDEVENT = 21;

	cp.TIMEUPDATEEVENT = 22;
	
	//Only for ACAP suspend resume
	cp.SET_RESUMEDATA = 23;

	cp.PLAYBARSTATECHANGED = 24;
	cp.TOCSTATECHANGED = 25;

	cp.ITEMDRAWINGCOMPLETEEVENT = 26;

	cp.MOVIEEXITEVENT = 27;
	cp.QUIZSLIDEREACHED = 28;
	
	window.EventListeners = new Array();
	window.EventListeners[cp.VARIABLE_CREATED_EVENT] = new Array();
	window.EventListeners[cp.VARIABLE_CHANGED_EVENT] = new Array();
	window.EventListeners[cp.SPECIFIC_VARIABLE_CHANGED_EVENT] = new Array();
	window.EventListeners[cp.SLIDEENTEREVENT] = new Array();
	window.EventListeners[cp.SLIDEEXITEVENT] = new Array();
	
  
	window.EventListeners[cp.INTERACTIVEITEMSUBMITEVENT] = new Array();
    window.EventListeners[cp.MOVIEPAUSEEVENT] = new Array();
    window.EventListeners[cp.MOVIERESUMEEVENT] = new Array();
    window.EventListeners[cp.MOVIESTARTEVENT] = new Array();
    window.EventListeners[cp.MOVIESTOPEVENT] = new Array();
    window.EventListeners[cp.QUESTIONSKIPEVENT] = new Array();
    window.EventListeners[cp.QUESTIONSUBMITEVENT] = new Array(); 
    window.EventListeners[cp.STARTPLAYBARSCRUBBINGEVENT] = new Array();
    window.EventListeners[cp.ENDPLAYBARSCRUBBINGEVENT] = new Array();
    window.EventListeners[cp.MOVIEFOCUSINEVENT] = new Array();
    window.EventListeners[cp.MOVIEFOCUSLOSTEVENT] = new Array();     
    window.EventListeners[cp.MOVIEAUDIOMUTEEVENT] = new Array();     

    window.EventListeners[cp.INPUTCONTROLREPLACEDEVENT] = new Array();
    window.EventListeners[cp.WINDOWRESIZEDEVENT] = new Array();
    window.EventListeners[cp.WINDOWRESIZECOMPLETEDEVENT] = new Array();
	window.EventListeners[cp.ORIENTATIONCHANGEDEVENT] = new Array();
	window.EventListeners[cp.ORIENTATIONCHANGECOMPLETEDEVENT] = new Array();

	window.EventListeners[cp.TIMEUPDATEEVENT] = new Array();
	
	window.EventListeners[cp.SET_RESUMEDATA] = new Array();

window.EventListeners[cp.PLAYBARSTATECHANGED] = new Array();
	window.EventListeners[cp.TOCSTATECHANGED] = new Array();
	
	window.EventListeners[cp.ITEMDRAWINGCOMPLETEEVENT] = new Array();
	window.EventListeners[cp.MOVIEEXITEVENT] = new Array();
	window.EventListeners[cp.QUIZSLIDEREACHED] = new Array();

    
	function tellListener(listener, evt)
	{
		try{
			if(listener.id)
			{
				cp.updateVarText(listener);
			}
			else
			{
				listener(evt);
			}
		}
		catch(e){}
	}
	
	function PrivateEventListener(evt)
	{
		//cp.log("evt listener :" + evt.cpData.varName);
		if(evt.cpName == 'CPVariableValueChangedEvent')
		{
			var arr = EventListeners[cp.VARIABLE_CHANGED_EVENT];
			tellAllListeners(evt,arr);			
			
			for(var k = 0; k < evt.cpData.notify.length; ++k)
			{
				var name = evt.cpData.notify[k];
				var arr2 = EventListeners[cp.SPECIFIC_VARIABLE_CHANGED_EVENT];
				for(var j = 0; j < arr2.length; ++j)
				{
					if(arr2[j].n == name)
					{
						var listener = arr2[j].l;

                        if (arr2[j].r)
                            evt.reciever = arr2[j].r;

						tellListener(listener, evt);
					}
				}
			}
		}
		else if(evt.cpName == 'CPVariableCreatedEvent')
		{
			var arr = EventListeners[cp.VARIABLE_CREATED_EVENT];
			tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == 'CPTime_Update')
		{
			var arr = EventListeners[cp.TIMEUPDATEEVENT];
            tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == 'CPSet_ResumeData')
		{
			var arr = EventListeners[cp.SET_RESUMEDATA];
            tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == 'CPPlaybarStateChanged')
		{
			var arr = EventListeners[cp.PLAYBARSTATECHANGED];
            tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == 'CPTocStateChanged')
		{
			var arr = EventListeners[cp.TOCSTATECHANGED];
            tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == 'CPSlideEnter')
		{
			var arr = EventListeners[cp.SLIDEENTEREVENT];
            tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == 'CPSlideExit')
		{
			var arr = EventListeners[cp.SLIDEEXITEVENT];
			tellAllListeners(evt,arr);
		}       
        else if(evt.cpName == 'CPInteractiveItemSubmit')
		{
			var arr = EventListeners[cp.INTERACTIVEITEMSUBMITEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPMoviePause')
		{
			var arr = EventListeners[cp.MOVIEPAUSEEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPMovieResume')
		{
			var arr = EventListeners[cp.MOVIERESUMEEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPMovieStart')
		{
			var arr = EventListeners[cp.MOVIESTARTEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPMovieStop')
		{
			var arr = EventListeners[cp.MOVIESTOPEVENT];
			tellAllListeners(evt,arr);
		}
		else if(evt.cpName == 'CPMovieExit')
		{
			var arr = EventListeners[cp.MOVIEEXITEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPQuestionSkip')
		{
			var arr = EventListeners[cp.QUESTIONSKIPEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPQuestionSubmit')
		{
			var arr = EventListeners[cp.QUESTIONSUBMITEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPStartPlaybarScrubbing')
		{
			var arr = EventListeners[cp.STARTPLAYBARSCRUBBINGEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPEndPlaybarScrubbing')
		{
			var arr = EventListeners[cp.ENDPLAYBARSCRUBBINGEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPMovieFocusIn')
		{
			var arr = EventListeners[cp.MOVIEFOCUSINEVENT];
			tellAllListeners(evt,arr);
		}
        else if(evt.cpName == 'CPMovieFocusLost')
		{
			var arr = EventListeners[cp.MOVIEFOCUSLOSTEVENT];
			tellAllListeners(evt,arr);
		}
		else if(evt.cpName == 'CPMovieAudioMute')
		{
			var arr = EventListeners[cp.MOVIEAUDIOMUTEEVENT];
			tellAllListeners(evt,arr);
		}
		else if(evt.cpName == 'CPInputControlReplacedEvent')
		{
			var arr = EventListeners[cp.INPUTCONTROLREPLACEDEVENT];
			tellAllListeners(evt,arr);	
		}
		else if(evt.cpName == "CPWindowResized")
		{
			var arr = EventListeners[cp.WINDOWRESIZEDEVENT];
			tellAllListeners(evt,arr);		
		}
		else if(evt.cpName == "CPWindowResizeCompleted")
		{
			var arr = EventListeners[cp.WINDOWRESIZECOMPLETEDEVENT];
			tellAllListeners(evt,arr);		
		}
		else if(evt.cpName == "CPOrientationChanged")
		{
			var arr = EventListeners[cp.ORIENTATIONCHANGEDEVENT];
			tellAllListeners(evt,arr);			
		}
		else if(evt.cpName == "CPOrientationChangeCompleted")
		{
			var arr = EventListeners[cp.ORIENTATIONCHANGECOMPLETEDEVENT];
			tellAllListeners(evt,arr);
		}
		else if(evt.cpName == "CPItemDrawingCompleteEvent")
		{
			var arr = EventListeners[cp.ITEMDRAWINGCOMPLETEEVENT];
			tellAllListeners(evt,arr);
		}
		else if(evt.cpName == "CPQuizSlideReached")
		{
			var arr = EventListeners[cp.QUIZSLIDEREACHED];
			tellListener(evt,arr);
		}
	}
	
    function tellAllListeners(evt,arr)
    {
		for(var i =0; i < arr.length; ++i)
		{
			var listener = arr[i];
		if (listener.r)
			evt.reciever = listener.r;
		tellListener(listener.l, evt);
		}
	}

	cp.EventManager = function()
	{
		cp.em = this;
		if((/*!document.createEventObject &&*/ !document.createEvent) || !document.addEventListener)
		{
			alert('EVENT FIRING WILL NOT WORK');
		}
		
		document.addEventListener('propertyChange', PrivateEventListener, false);
		this.verbose = false;
	}
		
	
	cp.EventManager.prototype = 
	{
		fireEvent: function(eventName, args)
		{
			if(document.createEvent)
			{
				var evt = document.createEvent("Events");
				evt.initEvent('propertyChange', true, true, null );
				evt.cpName = eventName;
				evt.cpData = args;
								
				if(window.cpAPIEventEmitter)
				{
					evt.Name = eventName;
					evt.Data = args;
					window.cpAPIEventEmitter.trigger(evt);
				}
				
				return !document.dispatchEvent(evt);
			}
		},
		
		addEventListener : function(listener, type, varname,reciever)
		{
			if(this.verbose)
				cp.log("cp.em.addEventListener : " + listener + " " + type + " " + varname);
			if(type == cp.VARIABLE_CREATED_EVENT || type == cp.VARIABLE_CHANGED_EVENT ||
				type == cp.SLIDEENTEREVENT || type == cp.SLIDEEXITEVENT ||
				type == cp.STARTPLAYBARSCRUBBINGEVENT || type == cp.INTERACTIVEITEMSUBMITEVENT ||
				type == cp.MOVIEPAUSEEVENT || type == cp.MOVIERESUMEEVENT ||
				type == cp.MOVIESTARTEVENT || type == cp.MOVIESTOPEVENT || type == cp.MOVIEEXITEVENT ||
				type == cp.QUESTIONSKIPEVENT || type == cp.QUESTIONSUBMITEVENT ||
                type == cp.MOVIEFOCUSINEVENT || type == cp.MOVIEFOCUSLOSTEVENT || type == cp.MOVIEAUDIOMUTEEVENT ||
				type == cp.ENDPLAYBARSCRUBBINGEVENT ||
				type == cp.INPUTCONTROLREPLACEDEVENT ||
				type == cp.WINDOWRESIZEDEVENT || type == cp.ORIENTATIONCHANGEDEVENT ||
				type == cp.WINDOWRESIZECOMPLETEDEVENT || type == cp.ORIENTATIONCHANGECOMPLETEDEVENT ||
				type == cp.TIMEUPDATEEVENT || type == cp.SET_RESUMEDATA ||
				type == cp.ITEMDRAWINGCOMPLETEEVENT || type == cp.QUIZSLIDEREACHED)
			{
				var array = EventListeners[type];
				array.push({l:listener, r:reciever});
				if(this.verbose)
					cp.log(array);
				return true;
			}
			else if(type == cp.SPECIFIC_VARIABLE_CHANGED_EVENT)
			{
				var array = EventListeners[type];
				array.push({l:listener, n:varname,r:reciever});
				if(this.verbose)
					cp.log(array);
				return true;
			}
			
			return false;
		},
		
		removeEventListener : function(listener, type, varname)
		{
			if(this.verbose)
				cp.log("cp.em.removeEventListener : " + listener + " " + type + " " + varname);
			var retVal = false;
			if(type == cp.VARIABLE_CREATED_EVENT || type == cp.VARIABLE_CHANGED_EVENT ||
            type == cp.SLIDEENTEREVENT || type == cp.SLIDEEXITEVENT ||
				type == cp.STARTPLAYBARSCRUBBINGEVENT || type == cp.INTERACTIVEITEMSUBMITEVENT ||
				type == cp.MOVIEPAUSEEVENT || type == cp.MOVIERESUMEEVENT ||
				type == cp.MOVIESTARTEVENT || type == cp.MOVIESTOPEVENT || type == cp.MOVIEEXITEVENT ||
				type == cp.QUESTIONSKIPEVENT || type == cp.QUESTIONSUBMITEVENT ||
                type == cp.MOVIEFOCUSINEVENT || type == cp.MOVIEFOCUSLOSTEVENT || type == cp.MOVIEAUDIOMUTEEVENT ||	 
				type == cp.ENDPLAYBARSCRUBBINGEVENT ||
				type == cp.INPUTCONTROLREPLACEDEVENT ||
				type == cp.WINDOWRESIZEDEVENT || type == cp.ORIENTATIONCHANGEDEVENT ||
				type == cp.WINDOWRESIZECOMPLETEDEVENT || type == cp.ORIENTATIONCHANGECOMPLETEDEVENT ||
				type == cp.TIMEUPDATEEVENT || type == cp.SET_RESUMEDATA ||
				type == cp.ITEMDRAWINGCOMPLETEEVENT || type == cp.QUIZSLIDEREACHED)
			{
				var array = EventListeners[type];
				if(listener.id != undefined)
				{
					for(var i = 0; i < array.length; ++i)
					{
						if(array[i].l.id == listener.id)
						{
							array.splice(i,1);
							retVal = true;
						}
					}
				}
				else
				{
				for(var i = 0; i < array.length; ++i)
				{
					if(array[i].l == listener)
					{
						array.splice(i,1);
							retVal = true;
						}
					}
				}
				if(retVal)
				{
					if(this.verbose)
						cp.log(array);
				}
			}
			else if(type == cp.SPECIFIC_VARIABLE_CHANGED_EVENT)
			{
				var array = EventListeners[type];
				if(varname != undefined && varname != '')
				{
					if(listener.id != undefined)
					{
						for(var i = 0; i < array.length; ++i)
						{
							if(array[i].l.id == listener.id && array[i].n == varname)
							{
								array.splice(i,1);
								retVal = true;
							}
						}
					}
					else
					{
				for(var i = 0; i < array.length; ++i)
				{
					if(array[i].l == listener && array[i].n == varname)
					{
						array.splice(i,1);
								retVal = true;
							}
						}
					}
				}
				else
				{
					if(listener.id != undefined)
					{
						for(var i = 0; i < array.length; ++i)
						{
							if(array[i].l.id == listener.id)
							{
								array.splice(i,1);
								retVal = true;
							}
						}
					}
					else
					{
						for(var i = 0; i < array.length; ++i)
						{
							if(array[i].l == listener)
							{
								array.splice(i,1);
								retVal = true;
							}
						}
					}
					}
				if(retVal)
				{
					if(this.verbose)
						cp.log(array);
				}

			}
			return retVal;
		}
	}	
})(window.cp);