cp.GESTURE_EVENT_TYPES = new Object();
cp.GESTURE_EVENT_TYPES.TAP = "tap";
cp.GESTURE_EVENT_TYPES.DOUBLE_TAP = "doubletap";
cp.GESTURE_EVENT_TYPES.LONG_TAP = "longtap"
cp.GESTURE_EVENT_TYPES.HOLD = "hold";
cp.GESTURE_EVENT_TYPES.ROTATE = "rotate";

cp.GESTURE_EVENT_TYPES.DRAG = "drag";
cp.GESTURE_EVENT_TYPES.DRAG_START = "dragstart";
cp.GESTURE_EVENT_TYPES.DRAG_END = "dragend";

cp.GESTURE_EVENT_TYPES.SWIPE_UP = "swipeup";
cp.GESTURE_EVENT_TYPES.SWIPE_DOWN = "swipedown";
cp.GESTURE_EVENT_TYPES.SWIPE_LEFT = "swipeleft";
cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT = "swiperight";

//hammer specific events
cp.GESTURE_EVENT_TYPES.TOUCH = "touch";
cp.GESTURE_EVENT_TYPES.RELEASE = "release";
cp.GESTURE_EVENT_TYPES.PINCH_OUT = "pinchout";
cp.GESTURE_EVENT_TYPES.PINCH_IN = "pinchin";

//jGesture events
cp.GESTURE_EVENT_TYPES.TAP_ONE = "tapone";
cp.GESTURE_EVENT_TYPES.TAP_TWO = "taptwo";
cp.GESTURE_EVENT_TYPES.TAP_THREE = "tapthree";

cp.GESTURE_EVENT_TYPES.SWIPE_MOVE = "swipemove";
cp.GESTURE_EVENT_TYPES.SWIPE_ONE = "swipeone";
cp.GESTURE_EVENT_TYPES.SWIPE_TWO = "swipetwo";
cp.GESTURE_EVENT_TYPES.SWIPE_THREE = "swipethree";
cp.GESTURE_EVENT_TYPES.SWIPE_FOUR = "swipefour";

cp.GESTURE_EVENT_TYPES.SWIPE_LEFT_UP = "swipeleftup";
cp.GESTURE_EVENT_TYPES.SWIPE_LEFT_DOWN = "swipeleftdown";
cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT_UP = "swiperightup";
cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT_DOWN = "swiperightdown";

cp.GESTURE_EVENT_TYPES.PINCH = "pinch";
cp.GESTURE_EVENT_TYPES.PINCH_OPEN = "pinchopen";
cp.GESTURE_EVENT_TYPES.PINCH_CLOSE = "pinchclose";

cp.GESTURE_EVENT_TYPES.ROTATECW = "rotatecw";
cp.GESTURE_EVENT_TYPES.ROTATECCW = "rotateccw";

cp.GESTURE_EVENT_TYPES.SHAKE = "shake";
cp.GESTURE_EVENT_TYPES.SHAKE_FRONT_BACK = "shakefrontback";
cp.GESTURE_EVENT_TYPES.SHAKE_LEFT_RIGHT = "shakeleftright";
cp.GESTURE_EVENT_TYPES.SHAKE_UP_DOWN = "shakeupdown";

cp.GestureHandler = function()
{
	this.movie = cp.movie;
	this.enabled = true;
	this.initializeDefaultGestureEvents();
}

cp.GestureHandler.prototype.scaleMovie = function(e,reset)
{
	e.gesture.stopPropagation();
	e.gesture.preventDefault();
	var lDivSlide = cp('div_Slide');
	lDivSlide.style['webkitTransformOrigin'] = "" + e.gesture.center.pageX + " " + e.gesture.center.pageY + "";
	lDivSlide.style['MozTransformOrigin'] = "" + e.gesture.center.pageX + " " + e.gesture.center.pageY + "";
	lDivSlide.style['msTransformOrigin'] = "" + e.gesture.center.pageX + " " + e.gesture.center.pageY + "";
	lDivSlide.style['webkitTransform'] = "scale(" + !reset ? e.gesture.scale : 1 + ")";
	lDivSlide.style['MozTransform'] = "scale(" + !reset ? e.gesture.scale : 1 + ")";	
	lDivSlide.style['msTransform'] = "scale(" + !reset ? e.gesture.scale : 1 + ")";	
}

cp.GestureHandler.prototype.addCPEventListeners = function()
{
	if(cp.device != cp.DESKTOP)
	{
		var that = this;
		cp.em.addEventListener(function(e)
			{
				that.resetZoom.call(that,e);
				that.resetScroll.call(that,e);
			},cp.SLIDEENTEREVENT);
		cp.em.addEventListener(function(e)
			{
				that.resetZoom.call(that,e);
				that.resetScroll.call(that,e);
			},cp.ORIENTATIONCHANGEDEVENT);
	}
}

cp.GestureHandler.prototype.registerGestureEvent = function(elem,eventName,handler)
{
	if(!cp.IsGestureSupportedDevice() || !cp.useg)
		elem.onclick = handler;
}

cp.GestureHandler.prototype.removeGestureEvent = function(elem,eventName)
{
	if(!cp.IsGestureSupportedDevice() || !cp.useg)
		elem.onclick = undefined;	
}

cp.GestureHandler.prototype.enableGestures = function(elem,eventName,handler)
{
	this.enabled = true;
	if(typeof(Hammer) != 'undefined' && Hammer && Hammer.detection)
		Hammer.detection.current = null;
}

cp.GestureHandler.prototype.disableGestures = function(elem,eventName)
{
	this.enabled = false;
}

cp.GestureHandler.prototype.addScaleEvent = function() 
{
	//every library should implement its own way of scaling the slide
}

cp.GestureHandler.prototype.changeClickEventsToTouch = function()
{
	this.registerGestureEvent(cp('playImage'),cp.GESTURE_EVENT_TYPES.TAP,function(){cp.movie.play();});
	this.registerGestureEvent(cp('ccClose'),cp.GESTURE_EVENT_TYPES.TAP,function(){cp.showHideCC()});
}

cp.GestureHandler.prototype.scrollH = function(delta)
{
	var lContainer = cp.responsive ? cp("project") : 
    								cp("main_container");
    var lMainContainerBoundingRect = lContainer.getBoundingClientRect();
	var lShift = lMainContainerBoundingRect.left + delta;
	lContainer.style.left = (lShift) + "px";
}

cp.GestureHandler.prototype.scrollV = function(delta)
{
	var lContainer = cp.responsive ? cp("project") : 
    								cp("main_container");
    var lMainContainerBoundingRect = lContainer.getBoundingClientRect();
            
	var lShift = lMainContainerBoundingRect.top + delta;
	lContainer.style.top = (lShift) + "px";	
}

cp.GestureHandler.prototype.getDefaultGestureHandler = function(eventType)
{
	var self = this;
	switch(eventType)
	{
		/*case cp.GESTURE_EVENT_TYPES.TAP 			: 	return cp.handleClick; 
														break;*/
		case cp.GESTURE_EVENT_TYPES.TAP_TWO			: 	return function(e)
														{
															if(cp.m_gestureHandler.enabled)
																cp.handlePlaybarShowHide();
														}
														break;
		case cp.GESTURE_EVENT_TYPES.LONG_TAP		: 	return function(e)
														{
															if(cp.m_gestureHandler.enabled)
																cp.toggleMoviePlayPause();
														}
														break;
		case cp.GESTURE_EVENT_TYPES.HOLD 			: 	return function(e)
														{
															if(cp.m_gestureHandler.enabled)
																cp.handlePlaybarShowHide();
														}
														break;
		case cp.GESTURE_EVENT_TYPES.DOUBLE_TAP 		: 	return function(e)
														{
															if(cp.m_gestureHandler.enabled)
																cp.handleTOCOpenClose(); 
														}
														break;
		case cp.GESTURE_EVENT_TYPES.SWIPE_UP		: 	return function(e)
														{
															if(!cp.m_gestureHandler.enabled)
																return;
															if(cp.canScroll("up",cp.GESTURE_EVENT_TYPES.SWIPE_UP))
															{
																return false;
															}
															if(e.gesture.distance < 50)
																return;
															e.gesture.stopPropagation();
															e.gesture.preventDefault();
															if(cp("div_Slide").scaleFactor && 
																cp("div_Slide").scaleFactor != 1)
															{
																return;
															}
															
															cp.togglePlaybarShowHide();
														} 
														break;
		case cp.GESTURE_EVENT_TYPES.SWIPE_DOWN		: 	return function(e)
														{
															if(!cp.m_gestureHandler.enabled)
																return;
															if(cp.canScroll("down",cp.GESTURE_EVENT_TYPES.SWIPE_DOWN))
															{
																return false;
															}
															if(e.gesture.distance < 50)
																return;
															e.gesture.stopPropagation();
															e.gesture.preventDefault();
															if(cp("div_Slide").scaleFactor && 
																cp("div_Slide").scaleFactor != 1)
															{
																return;
															}
															
															cp.togglePlaybarShowHide();
														}
														break;
		case cp.GESTURE_EVENT_TYPES.SWIPE_LEFT 		: 	return function(e)
														{
															if(!cp.m_gestureHandler.enabled)
																return;
															if(!cp.responsive && cp.canScroll("left",cp.GESTURE_EVENT_TYPES.SWIPE_LEFT))
															{
																return false;
															}
															if(e.gesture.distance < 50)
																return;
															e.gesture.stopPropagation();
															e.gesture.preventDefault();
															if(cp("div_Slide").scaleFactor && 
																cp("div_Slide").scaleFactor != 1)
															{
																return;
															}
															if(cp.D && cp.D['baq'])
																return;
															var lFn = cp.goToNextSlide;
															var lParam = undefined;
															var lObj = window;

															if(cp.movie.stage &&
																cp.movie.stage.currentSlide)
															{
																var lSlideData = cp.movie.stage.currentSlide;
																if(!lSlideData.useng)
																	return;
																if(lSlideData['st'] == "Question Slide")
																{
																	var lSlideName = cp.D[lSlideData.mdi].dn;
																	var questionObj = cp.getQuestionObject(lSlideName);
															        if (questionObj)
															        {
															        	lFn = questionObj.moveForward;
															        	lObj = questionObj;
															        }
															    }																
															}
															
															lFn.call(lObj,lParam);
														}
														break;
		case cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT		: 	return function(e)
														{
															if(!cp.m_gestureHandler.enabled)
																return;
															if(!cp.responsive && cp.canScroll("right",cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT))
															{
																return false;
															}
															if(e.gesture.distance < 50)
																return;
															e.gesture.stopPropagation();
															e.gesture.preventDefault();
															if(cp("div_Slide").scaleFactor && 
																cp("div_Slide").scaleFactor != 1)
															{
																return;
															}
															if(cp.D && cp.D['baq'])
																return;
															var lFn = cp.goToPreviousSlide;
															var lParam = undefined;
															var lObj = window;

															if(cp.movie.stage &&
																cp.movie.stage.currentSlide)
															{
																var lSlideData = cp.movie.stage.currentSlide;
																if(!lSlideData.useng)
																	return;
																if(lSlideData['st'] == "Question Slide")
																{
																	var lSlideName = cp.D[lSlideData.mdi].dn;
																	var questionObj = cp.getQuestionObject(lSlideName);
															        if (questionObj)
															        {
															        	lFn = questionObj.moveBackward;
															        	lObj = questionObj;
															        }
														        }																
															}
															
															lFn.call(lObj,lParam);
														}
														break;
		default 									: 	return undefined;
	}
}

cp.GestureHandler.prototype.initializeDefaultGestureEvents = function()
{
	cp("div_Slide").scaleFactor = 1;
	if(!cp.IsGestureSupportedDevice() || !cp.useg)
		return;
	this.changeClickEventsToTouch();
	var lDivSlide = cp('div_Slide');
	var lMainContainer = cp('main_container');
	
	if(!cp.D.project.shc)
		this.addScaleEvent();
	var that = this;
	
	//this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.TAP, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.TAP));
	//this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.TAP_TWO, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.TAP_TWO));
	//this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.HOLD, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.HOLD));
	
	this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.LONG_TAP, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.LONG_TAP));
	this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.DOUBLE_TAP, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.DOUBLE_TAP));
	this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.SWIPE_UP, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.SWIPE_UP));
	this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.SWIPE_DOWN, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.SWIPE_DOWN));
	this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.SWIPE_LEFT, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.SWIPE_LEFT));
	this.registerGestureEvent(lDivSlide,cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT, this.getDefaultGestureHandler(cp.GESTURE_EVENT_TYPES.SWIPE_RIGHT));
}

cp.GestureHandler.prototype.resetZoom = function(e)
{
    //Gesture library specific implementation
}

cp.GestureHandler.prototype.resetScroll = function(e)
{
    //Gesture library specific implementation
}

cp.GestureHandler.prototype.initializeProjectGestures = function()
{
	if(!cp.useg)
		return;
	var lGestureData = cp.D["project"].GestureData;
	if(lGestureData)
	{
		for(var key in lGestureData)
		{
			cp.registerGestureEvent(cp("project"),key,lGestureData[key]);
		}
	}
}

cp.GestureHandler.prototype.getEventPageX = function(e)
{
	var lEvent = e;
	if(e.changedTouches && e.changedTouches.length > 0)
	{
		lEvent = e.changedTouches[0];
	}

	if(!lEvent)
		return 0;

	if(lEvent.pageX)
		return lEvent.pageX;
	
	var doc = document.documentElement, body = document.body;
	return lEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
}

cp.GestureHandler.prototype.getEventPageY = function(e)
{
	var lEvent = e;
	if(e.changedTouches && e.changedTouches.length > 0)
	{
		lEvent = e.changedTouches[0];
	}

	if(!lEvent)
		return 0;

	if(lEvent.pageY)
		return lEvent.pageY;
	
	var doc = document.documentElement, body = document.body;
	return lEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
}

cp.registerGestureEvent = function(elem,type,handler)
{
	if(!elem || !type || !handler)
		return;
	cp.m_gestureHandler.registerGestureEvent(elem,type,handler);
}

cp.removeGestureEvent = function(elem,type,handler)
{
	if(!elem || !type)
		return;
	cp.m_gestureHandler.removeGestureEvent(elem,type,handler);
}

cp.IsGestureSupportedDevice = function()
{
	return (cp.device == cp.IDEVICE || cp.device == cp.ANDROID);
}

cp.initializeGestureEvents = function()
{
	if(!cp.m_gestureHandler)
	{
		if(cp.IsGestureSupportedDevice())
			cp("cpDocument").style.overflow = "auto";
		if(!cp.IsGestureSupportedDevice() || !cp.useg)
		{
			cp.m_gestureHandler = new cp.GestureHandler();				
		}
		else
		{
			cp.m_gestureHandler = new cp.HammerGestureHandler();
		}

		cp.m_gestureHandler.initializeProjectGestures();
	}
}

cp.canScroll = function(direction,iCheckForGestureType)
{
	if(!cp.m_gestureHandler.enabled)
		return false;

	if(cp.D.project.shc)
		return false;

	if(cp("div_Slide").scaleFactor != 1)
		return false;

	if((iCheckForGestureType != cp.GESTURE_EVENT_TYPES.DRAG) && cp.m_gestureHandler.isScrolling)
		return true;

	var lMainContainerBoundingRect = cp.responsive ? cp("project").getBoundingClientRect() : 
														cp("main_container").getBoundingClientRect();
	switch(direction)
	{
		case "up" 	: 	return (lMainContainerBoundingRect.bottom > window.innerHeight);
						break;
		case "down"	: 	return (lMainContainerBoundingRect.top < 0);
						break;
		case "left"	: 	return (lMainContainerBoundingRect.right > window.innerWidth);
						break;
		case "right": 	return (lMainContainerBoundingRect.left < 0);
						break;
		default 	: 	return false;
						break;
	}
}
