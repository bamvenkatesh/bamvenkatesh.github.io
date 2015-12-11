cp.HammerGestureHandler = function()
{
	cp.HammerGestureHandler.baseConstructor.call(this);
}

cp.inherits(cp.HammerGestureHandler, cp.GestureHandler);


cp.HammerGestureHandler.prototype.scaleMovie = function(e,reset)
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

cp.HammerGestureHandler.prototype.registerGestureEvent = function(elem,eventName,handler)
{
    if(!elem || !eventName || !handler)
		return;
    elem.onclick = undefined;
    if (elem && (elem.tagName.toLowerCase() == 'input' && elem.type == 'text' ||  elem.tagName.toLowerCase() == 'textarea' 
        || elem.tagName.toLowerCase() == 'select' || elem.id.toLowerCase() == "toccontent")) 
	{
        Hammer(elem).on(cp.GESTURE_EVENT_TYPES.DRAG_END, this.fitMovie);
        Hammer(elem).on(eventName, handler);
    }    
    else
        Hammer(elem,{prevent_default: true}).on(eventName, handler);
}

cp.HammerGestureHandler.prototype.removeGestureEvent = function(elem,eventName,handler)
{
	if(!elem || !eventName)
		return;
	Hammer(elem).off(eventName,handler);		
}

cp.HammerGestureHandler.prototype.fitMovie = function(event) 
{
    if(!cp.m_gestureHandler.enabled)
        return false;
    if(cp("div_Slide").scaleFactor == 1)
    {
        window.scrollTo(0,0);
        var lContainer = cp.responsive ? cp("project") : 
                                        cp("main_container");
        var lMainContainerBoundingRect = lContainer.getBoundingClientRect();
        if(event && event.gesture && event.gesture.direction)
        {
            switch(event.gesture.direction)
            {
                case "up"   :   if(lMainContainerBoundingRect.bottom < window.innerHeight 
                                    && lMainContainerBoundingRect.height > window.innerHeight)
                                    lContainer.style.top = (window.innerHeight - lMainContainerBoundingRect.height) + "px";
                                break;
                case "down" :   if(lMainContainerBoundingRect.top > 0 
                                    && lMainContainerBoundingRect.height > window.innerHeight)
                                    lContainer.style.top = "0px";
                                break;
                case "left" :   if(lMainContainerBoundingRect.right < window.innerWidth 
                                    && lMainContainerBoundingRect.width > window.innerWidth)
                                    lContainer.style.left = (window.innerWidth - lMainContainerBoundingRect.width) + "px";
                                break;
                case "right":   if(lMainContainerBoundingRect.left > 0 
                                    && lMainContainerBoundingRect.width > window.innerWidth)
                                    lContainer.style.left = "0px";
                                break;
                default     :   return false;
                                break;
            }    
        }
        else
        {
            if(cp.responsive)
            {
                //just adjust the scroll on slide enter
                if(lMainContainerBoundingRect.bottom <= window.innerHeight 
                    && lMainContainerBoundingRect.height > window.innerHeight)
                    lContainer.style.top = (window.innerHeight - lMainContainerBoundingRect.height) + "px";
                else
                    lContainer.style.top = "0px";

                if(lMainContainerBoundingRect.top >= 0)
                    lContainer.style.top = "0px";
            }
        }
    }

    if(event && event.stopDetect)
        event.stopDetect();
    return false;
}

cp.HammerGestureHandler.prototype.addScaleEvent = function() 
{
    var maincontainer = cp('main_container');
	var container = cp('project');
	var element = cp('div_Slide');
	element.scaleFactor = 1;
    Hammer(container,{
        //transform_always_block: true,
        prevent_default: true,
        no_mouseevents: true,
        transform_min_scale: 1,
        drag_block_horizontal: true,
        drag_block_vertical: true,
        drag_min_distance: 0
    });

    element.scaleFactor = 1;
    
    var displayWidth = container.clientWidth;
    var displayHeight = container.clientHeight;

    //These two constants specify the minimum and maximum zoom
    var MIN_ZOOM = 1;
    var MAX_ZOOM = 3;

    this.scaleFactor = 1;
    this.previousScaleFactor = 1;

    //These two variables keep track of the X and Y coordinate of the finger when it first
    //touches the screen
    var startX = 0;
    var startY = 0;

    //These two variables keep track of the amount we need to translate the canvas along the X
    //and the Y coordinate
    var translateX = 0;
    var translateY = 0;

    //These two variables keep track of the amount we translated the X and Y coordinates, the last time we
    //panned.
    var previousTranslateX = 0;
    var previousTranslateY = 0;

    //Translate Origin variables

    var tch1 = 0, 
        tch2 = 0, 
        tcX = 0, 
        tcY = 0,
        toX = 0,
        toY = 0,
        cssOrigin = "";

    var self = this;
    this.registerGestureEvent(container,"transformstart",function(event){
        if(!cp.m_gestureHandler.enabled)
            return false;
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
                                                            
        //We save the initial midpoint of the first two touches to say where our transform origin is.
        e = event.gesture;

        tch1 = [e.touches[0].pageX, e.touches[0].pageY],
        tch2 = [e.touches[1].pageX, e.touches[1].pageY];

        tcX = (tch1[0]+tch2[0])/2,
        tcY = (tch1[1]+tch2[1])/2;

        toX = tcX;
        toY = tcY;

        var lSlideBoundingClientRect = element.getBoundingClientRect();
        var left = lSlideBoundingClientRect.left;
        var top = lSlideBoundingClientRect.top;

        cssOrigin = (-(left) + toX)/self.scaleFactor +"px "+ (-(top) + toY)/self.scaleFactor +"px";
    });
    
    this.registerGestureEvent(container,"transform", function(event) {
        if(!cp.m_gestureHandler.enabled)
            return false;
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
        self.scaleFactor = self.previousScaleFactor * event.gesture.scale;
		
        self.scaleFactor = Math.max(MIN_ZOOM, Math.min(self.scaleFactor, MAX_ZOOM));
        element.scaleFactor = self.scaleFactor;
        self.transform(element,self.scaleFactor,cssOrigin);
    });

    this.registerGestureEvent(container,"transformend", function(event) {
        if(!cp.m_gestureHandler.enabled)
            return false;
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
        element.scaleFactor = self.scaleFactor;
        self.previousScaleFactor = self.scaleFactor;

        if(event.gesture.stopDetect)
            event.gesture.stopDetect();
    });

    var startPos,elemLeft,elemTop;
    var OnDragStart = function(event) {
		if(!cp.m_gestureHandler.enabled)
            return false;
        if(element.scaleFactor == 1)
		{
            self.fitMovie(event);
            element.scrollDeltaX = 0;
            element.scrollDeltaY = 0;
            return;
        }	
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
		var touches = event.gesture.touches || [event.gesture];
		startPos = {pageX:touches[0].pageX,pageY:touches[0].pageY};
		elemLeft = parseFloat(element.style.left);
		elemTop = parseFloat(element.style.top);
	}

	var OnDrag = function(event) {
		if(!cp.m_gestureHandler.enabled)
            return false;
        if(element.scaleFactor == 1)
        {
            if(((event.gesture.direction == "up" && cp.canScroll("up",cp.GESTURE_EVENT_TYPES.DRAG)) || 
                (event.gesture.direction == "down" && cp.canScroll("down",cp.GESTURE_EVENT_TYPES.DRAG))))
            {
                self.scrollV(event.gesture.deltaY-element.scrollDeltaY);
                element.scrollDeltaY = event.gesture.deltaY;
                self.isScrolling = true;
            }    
            else if(!cp.responsive && ((event.gesture.direction == "left" && cp.canScroll("left",cp.GESTURE_EVENT_TYPES.DRAG)) || 
                (event.gesture.direction == "right" && cp.canScroll("right",cp.GESTURE_EVENT_TYPES.DRAG))))
            {
                self.scrollH(event.gesture.deltaX-element.scrollDeltaX);
                element.scrollDeltaX = event.gesture.deltaX;
                self.isScrolling = true;
            }
            return;
        }    
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
		var lProjBoundingClientRect = container.getBoundingClientRect();
        var left = lProjBoundingClientRect.left;
        var top = lProjBoundingClientRect.top;

        var touches = event.gesture.touches || [event.gesture];
        
        element.style.left = elemLeft + touches[0].pageX - startPos.pageX + "px";
        element.style.top = elemTop + touches[0].pageY - startPos.pageY + "px";
	}

    var OnDragEnd = function(event)
    {
        if(event.gesture.stopDetect)
            event.gesture.stopDetect();
        self.isScrolling = false;
        self.fitMovie(event);
    }

    function customPreventDefault(ev)
    {
        if(ev.target && (ev.target.tagName.toUpperCase() == "INPUT" ||
                            ev.target.tagName.toUpperCase() == "SELECT" ||
                            ev.target.tagName.toUpperCase() == "TEXTAREA"))
            return;
        
        if(cp.isTextInputInFocus() || document.activeElement.tagName.toUpperCase() == "SELECT")
        {
            document.activeElement.blur();
        }

        ev.preventDefault();
    };

    //if(cp.ANDROID == cp.device)
    {
        this.registerGestureEvent(element,"touchstart",customPreventDefault);
        this.registerGestureEvent(element,"touchmove",customPreventDefault);
        this.registerGestureEvent(element,"touchend",customPreventDefault);
        this.registerGestureEvent(element,"touchcancel",customPreventDefault);    
    }    
    
	this.registerGestureEvent(element,cp.GESTURE_EVENT_TYPES.DRAG_START, OnDragStart);
    this.registerGestureEvent(element,cp.GESTURE_EVENT_TYPES.DRAG, OnDrag);
    this.registerGestureEvent(element,cp.GESTURE_EVENT_TYPES.DRAG_END, OnDragEnd);

    this.ondragstarthandler = OnDragStart;
    this.ondraghandler = OnDrag;
    this.ondragendhandler = OnDragEnd;
}

cp.HammerGestureHandler.prototype.transform = function(iElem,iScaleFactor,iCssOrigin)
{
    iElem.scaleFactor = iScaleFactor;
    //We're going to scale the X and Y coordinates by the same amount
    var cssScale = "scaleX("+ iScaleFactor +") scaleY("+ iScaleFactor +")";

    iElem.style["webkitTransform"] = cssScale;
    if(iCssOrigin)
        iElem.style["webkitTransformOrigin"] = iCssOrigin;

    iElem.style["transform"] = cssScale;
    if(iCssOrigin)
        iElem.style["transformOrigin"] = iCssOrigin;

    if(iScaleFactor == 1)
    {
        iElem.style.left = "0px";
        iElem.style.top = "0px";

        if(this.previousScaleFactor > iScaleFactor)
            cp.adjustResponsiveItems(cp.ReasonForDrawing.kOrientationChangeOrResize);

        this.scaleFactor = 1;
        this.previousScaleFactor = 1;
    }   
}

cp.HammerGestureHandler.prototype.resetZoom = function(e)
{
    if(cp.isTextInputInFocus() || document.activeElement.tagName.toUpperCase() == "SELECT")
        return;
    this.transform(cp("div_Slide"),1);  
}

cp.HammerGestureHandler.prototype.resetScroll = function(e)
{
    if(cp.device != cp.DESKTOP)
    {
        var lContainer = cp.responsive ? cp("project") : 
                                        cp("main_container");
        cp.m_gestureHandler.fitMovie(e);
    }    
}

cp.HammerGestureHandler.prototype.initializeDefaultGestureEvents = function()
{
	var lDivSlide = cp('div_Slide');
	var lMainContainer = cp('cpDocument');
	Hammer(lMainContainer,{
        prevent_default: true,
        no_mouseevents: true
    });
    Hammer(lDivSlide,{
        prevent_default: false,
        no_mouseevents: true
    });
    
    cp.HammerGestureHandler.superClass.initializeDefaultGestureEvents.call(this);
}

cp.HammerGestureHandler.prototype.getEventPageX = function(e)
{
	var lEvent = e.gesture;
	
	if(!lEvent || !lEvent.center)
		return cp.HammerGestureHandler.superClass.getEventPageX.call(this,e);

	lEvent = lEvent.center;
	
	if(lEvent.pageX)
		return lEvent.pageX;
	
	var doc = document.documentElement, body = document.body;
	return lEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
}

cp.HammerGestureHandler.prototype.getEventPageY = function(e)
{
	var lEvent = e.gesture;

	if(!lEvent || !lEvent.center)
		return cp.HammerGestureHandler.superClass.getEventPageY.call(this,e);

	lEvent = lEvent.center;
	
	if(lEvent.pageY)
		return lEvent.pageY;
	
	var doc = document.documentElement, body = document.body;
	return lEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
}