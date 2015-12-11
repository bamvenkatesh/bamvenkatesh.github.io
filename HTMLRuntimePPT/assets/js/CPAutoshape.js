cp.AutoShape = function(el, canvasId, args)
{
	var that = this;
	
	this.tMatrixMultiplyPoint = function(m, x, y) 
	{
		return [
		  x*m[0] + y*m[2] + m[4],
		  x*m[1] + y*m[3] + m[5]
		];
	};
	
	this.tInvertMatrix = function(m) 
	{
		var d = 1 / (m[0]*m[3]-m[1]*m[2])
		return [
		  m[3]*d, -m[1]*d,
		  -m[2]*d, m[0]*d,
		  d*(m[2]*m[5]-m[3]*m[4]), d*(m[1]*m[4]-m[0]*m[5])
		];
	};
	
	this.is_inside_canvas = function(e,isHandlingClick) 
	{     
		if(e == undefined)
			return false;
			
		var lBool;
		if(!that.element)
			return false;

		var canvasObj = that.getCurrentCanvasObj();

		if(canvasObj && canvasObj.svg)
			return true;

		if(canvasObj && canvasObj.ss && canvasObj.ss != 0)
			return true;

		var lButtonStateTransform = undefined;
		var lWButtonStateTransform = undefined;
		var lMButtonStateTransform = undefined;
		var lMsButtonStateTransform = undefined;
		var lOButtonStateTransform = undefined;
		if(isHandlingClick && ((that.sh && !that.sh.i) || that.re))
		{
			lButtonStateTransform = that.element.style["transform"];
			if(lButtonStateTransform)
			{
				that.element.style["transform"] = "";
			}
			lWButtonStateTransform = that.element.style["WebkitTransform"];
			if(lWButtonStateTransform)
			{
				that.element.style["WebkitTransform"] = "";
			}
			lMButtonStateTransform = that.element.style["MozTransform"];
			if(lMButtonStateTransform)
			{
				that.element.style["MozTransform"] = "";
			}
			lMsButtonStateTransform = that.element.style["msTransform"];
			if(lMsButtonStateTransform)
			{
				that.element.style["msTransform"] = "";
			}
			lOButtonStateTransform = that.element.style["OTransform"];
			if(lOButtonStateTransform)
			{
				that.element.style["OTransform"] = "";
			}
		}

		var lParentClientBoundingRect = that.element.parentElement.getBoundingClientRect();
		var lElemClientBoundingRect = that.element.getBoundingClientRect();
		var lMainContainerClientBoundingRect = cp("div_Slide").getBoundingClientRect();

		var lScaledPosition = cp.getScaledPosition(getPageX(e),getPageY(e));
		var lParentOffsetL = lParentClientBoundingRect.left - cp.movie.offset;
		var lParentOffsetT = lParentClientBoundingRect.top - cp.movie.topOffset;
		var lElemL = lElemClientBoundingRect.left - cp.movie.offset;
		var lElemT = lElemClientBoundingRect.top - cp.movie.topOffset;
		var lElemMarginL = parseFloat(that.element.style.marginLeft);
		var lElemMarginT = parseFloat(that.element.style.marginTop);

		lElemMarginL = !isNaN(lElemMarginL) ? lElemMarginL : 0;
		lElemMarginT = !isNaN(lElemMarginT) ? lElemMarginT : 0;

		function getXY()
		{
			if(!cp.responsive)
			{
				var X = lScaledPosition.X - window.pageXOffset/cp.movie.m_scaleFactor - (lElemMarginL < 0 ? lElemL : lParentOffsetL)/cp.movie.m_scaleFactor;
				var Y = lScaledPosition.Y - window.pageYOffset/cp.movie.m_scaleFactor - (lElemMarginT < 0 ? lElemT : lParentOffsetT)/cp.movie.m_scaleFactor;
				
				if(cp.shouldScale)
				{
					if(cp.loadedModules.toc && !cp.toc.movieProperties.tocProperties.overlay && cp.toc.movieProperties.tocProperties.position==1)
					{
						//handle toc only when toc is left positioned and not in overlay mode
						X += cp.toc.movieProperties.tocProperties.width;
					}
					
					if(cp.loadedModules.playbar && !cp.PB.MP.PBP.overlay)
					{
						//handle playbar only when playbar is left/top positioned and not in overlay mode
						if(cp.PB.MP.PBP.position == 0)//playbar is placed on left 
						{
							X += cp.PB.playBarHeight;
						}
						else if(cp.PB.MP.PBP.position == 1)//playbar is placed on top 
						{
							Y += cp.PB.playBarHeight;
						}
					}
				}				
				
				X *= parseFloat(that.element.parentElement.style.width)/lParentClientBoundingRect.width * cp.movie.m_scaleFactor;
				Y *= parseFloat(that.element.parentElement.style.height)/lParentClientBoundingRect.height * cp.movie.m_scaleFactor;
				
				if(cp.verbose)
				{
					cp.log("lParentOffsetL : " + lParentOffsetL + "," + lParentOffsetT);
					cp.log("lElemL : " + lElemL + "," + lElemT);
					cp.log("lElemMarginL : " + lElemMarginL + lElemMarginT);
					cp.log("X : " + X + "," + Y);
				}
			}
			else
			{
				X = lScaledPosition.X - window.pageXOffset - (lElemClientBoundingRect.left);// - lParentClientBoundingRect.left - lMainContainerClientBoundingRect.left;
				Y = lScaledPosition.Y - window.pageYOffset - (lElemClientBoundingRect.top);// - lParentClientBoundingRect.top - lMainContainerClientBoundingRect.top;

				X /= (cp("div_Slide").scaleFactor);
				Y /= (cp("div_Slide").scaleFactor);
			}

			return {"X":X,"Y":Y};
		}

		var lGc = that.element.getContext("2d");			
		if(lGc)
		{
			var lXYObj = getXY();
			if(isHandlingClick && ((that.sh && !that.sh.i) || that.re))
			{
				if(lButtonStateTransform)
				{
					that.element.style["transform"] = lButtonStateTransform;
				}
				if(lWButtonStateTransform)
				{
					that.element.style["WebkitTransform"] = lWButtonStateTransform;
				}
				if(lMButtonStateTransform)
				{
					that.element.style["MozTransform"] = lMButtonStateTransform;
				}
				if(lMsButtonStateTransform)
				{
					that.element.style["msTransform"] = lMsButtonStateTransform;
				}
				if(lOButtonStateTransform)
				{
					that.element.style["OTransform"] = lOButtonStateTransform;
				}
			}
			lBool = lGc.isPointInPath(lXYObj.X,lXYObj.Y);
			return lBool;
		}
		
		return false;
	}
	
	this.setVBounds = function()
	{
		var canvasObj = that.getCurrentCanvasObj();
		var lSw = 0;
		if(canvasObj.sw > that.canvasObj.sw)
			lSw = canvasObj.sw - that.canvasObj.sw;
		if(cp.responsive)
			lSw = 0;
		
		var vBoundsWithoutRotation = that.canvasObj.vbwr;
		that.wrvBounds = {
			minX: vBoundsWithoutRotation[0] - 2*lSw,
			minY: vBoundsWithoutRotation[1] - 2*lSw,
			maxX: vBoundsWithoutRotation[2] + 2*lSw,
			maxY: vBoundsWithoutRotation[3] + 2*lSw,
			width: vBoundsWithoutRotation[2] - vBoundsWithoutRotation[0] + 4*lSw,
			height: vBoundsWithoutRotation[3] - vBoundsWithoutRotation[1] + 4*lSw
		}

		var vbounds = that.canvasObj.vb;
		that.vbounds = {
			minX: vbounds[0] - 2*lSw,
			minY: vbounds[1] - 2*lSw,
			maxX: vbounds[2] + 2*lSw,
			maxY: vbounds[3] + 2*lSw,
			width: vbounds[2] - vbounds[0] + 4*lSw,
			height: vbounds[3] - vbounds[1] + 4*lSw
		};
	}

	function doOnMouseDown( elem,iInsideCanvas,eventObj)
	{
		that.AutoShapeState = 2;
		//that.isDrawn = false;
		
		if(that.changeStateOnMouseEvents)
			that.changeStateOnMouseEvents("mousedown",eventObj);
	}

	function doOnMouseUp( elem, iInsideCanvas,eventObj)
	{
		that.AutoShapeState = 0;
		//that.isDrawn = false;

		if(that.changeStateOnMouseEvents)
			that.changeStateOnMouseEvents("mouseup",eventObj);
	}
	
	function doOnMouseOut( elem, iInsideCanvas,eventObj)
	{
		doOnMouseUp(elem);
		if(that.parentData &&
				that.parentData.dep &&
				that.parentData.dep.length > 0)
		{
			//if(cp.verbose)
				cp.log("hiding hint");
			that.hintVisible = false;
			cp.hideHint(that.parentData.dep[0], elem);
		}		

		if(that.changeStateOnMouseEvents)
			that.changeStateOnMouseEvents("mouseout",eventObj);
	}

	function doOnMouseOver(elem , iInsideCanvas, eventObj)
	{
		that.AutoShapeState = 1;
		that.isDrawn = false;
		that.setVBounds();

		if(that.changeStateOnMouseEvents)
			that.changeStateOnMouseEvents("mouseover",eventObj);
		
		that.drawIfNeeded(true,cp.ReasonForDrawing.kMouseEvent);
	}

	function doOnMouseMove( elem, iInsideCanvas , eventObj)
	{
		if(iInsideCanvas)
		{
			if(that.parentData && that.parentData.handCursor)
				that.actualParent.style.cursor = "pointer";
			
			if(!that.hintVisible &&
				that.parentData &&
				that.parentData.dep &&
				that.parentData.dep.length > 0)
			{
				//if(cp.verbose)
					cp.log("showing hint");

				that.hintVisible = true;
				cp.showHint(that.parentData.dep[0], elem);
			}	

			// if the MouseOver occur within the Autoshape boundaries but not inside Canvas, then we trigger the moseOver event from Mousemove() after the mouse gets inside Canvas and if it's in UpState.
			if(that.AutoShapeState == 0)
				doOnMouseOver(elem , iInsideCanvas , eventObj);
		}
		else
		{
			that.actualParent.style.cursor = "default";
			
			if(that.parentData &&
				that.parentData.dep &&
				that.parentData.dep.length > 0)
			{
				//if(cp.verbose)
					cp.log("hiding hint");
				that.hintVisible = false;
				cp.hideHint(that.parentData.dep[0], elem);
			}

			// if the mouse is outside the canvas but inside the autoshape boundaries trigger the onMouseOut function
			if(that.AutoShapeState != 0)
				doOnMouseOut(elem , iInsideCanvas , eventObj);
		}
	}
	var lastMouseMoveObj = new Object();
	function getMouseHandler( event,elem, handler, old_handler )
	{
		var old = old_handler;
		var e = elem;
		return function(event) {
			if(event == undefined)
				return;
			if(cp.disableInteractions)
				return;
			var lEventType = event.type.toLowerCase();
			var lInsideCanvas = (that.canvasObj.ss != 0) || that.is_inside_canvas(event);
			if(lEventType != "mousemove")
				that.clicked = event.type.toLowerCase() == "mousedown";
			else
			{
				//chrome fires extra mousemove event on click. Preventing that when mouse is in down state
				if(that.clicked)
					return;

				if(lastMouseMoveObj.x == event.clientX && lastMouseMoveObj.y == event.clientY)
					return;

				lastMouseMoveObj.x = event.clientX;
				lastMouseMoveObj.y = event.clientY;
			}
			
			if(event.type.toLowerCase() == "mousemove" || 
				event.type.toLowerCase() == "mousedown" || 
				event.type.toLowerCase() == "mouseover" ||
				event.type.toLowerCase() == "touch" ||
				event.type.toLowerCase() == "touchstart")
			{
				if(!lInsideCanvas)
				{
					if(handler && (cp.device == cp.DESKTOP && event.type.toLowerCase() == "mousemove"))
						handler(e, lInsideCanvas , event);
					return;
				}	
			}
			var baseStateItem = that;
			if(that.cloneOfBaseStateItem)
			{
				baseStateItem = cp.getDisplayObjByCP_UID(that.baseStateItemID);
			}
			if ( baseStateItem && baseStateItem.parentData && undefined != baseStateItem.parentData.enabled ) {
				if ( ! baseStateItem.parentData.enabled )
					return; // Don't act on disabled elements.
			}
			if ( old ) 
				old();
			if ( handler ) 
				handler( e, lInsideCanvas ,event);
		}
	}

	cp.AutoShape.baseConstructor.call(this, el);
	this.visible = this.getAttribute("visible");
	this.parentId = cp.D[canvasId].dn;
	this.parentObj = cp.D[this.parentId];
	this.canvasObj = null;
	this.transIn = 	this.parentObj['trin'];
	if ( undefined != this.parentObj )
		this.canvasObj = cp.D[ this.parentObj.mdi ];
	this.parentDivName = this.getAttribute("dn");
	this.parentData = cp.D[this.parentDivName];
	this.parentData.isCanvasClicked = this.is_inside_canvas;
	this.parentData.canvasPainterObject = this;
	var actualParent = document.getElementById(this.parentDivName);
	this.actualParent = actualParent;
	if(!(this.parentData.uab === 1)) cp.removeAccessibilityOutline(this.actualParent);
	if ( this.canvasObj ) {
		var bounds = this.canvasObj.b;
		this.bounds = {
				minX: bounds[0],
				minY: bounds[1],			
				maxX: bounds[2],
				maxY: bounds[3],
				width: bounds[2] - bounds[0],
				height: bounds[3] - bounds[1]
			};
		this.args = args;	
		
		this.setVBounds();

		this.sh = this.canvasObj.sh;
		this.re = this.canvasObj.re;				
		this.tr = this.canvasObj.tr;
		
		this.normalImage = this.getAttribute( "ip" );

		this.AutoShapeState = 0;

	}
	if(actualParent)
	{
		actualParent.drawingBoard = this.element.parentElement;
		actualParent.bounds = this.bounds;
		actualParent.drawingBoard.bounds = this.vbounds;
	}		
	// For buttons, we need to handle press.
	if ( actualParent && undefined != this.parentData.pa && this.bounds ) {
		// handle main master slide case.
		if ( -1 != this.parentData.pa && this.parentData.immo ) {
			// Set new pause time.
			if ( cp.movie.stage.currentSlide )
				this.parentData.pa = cp.movie.stage.currentSlide.to - 1;
			this.setAttribute('clickedOnce', false);
		}
		var width = this.bounds.maxX - this.bounds.minX;
		var height = this.bounds.maxY - this.bounds.minY;
		var scaleX = 1.0, scaleY = 1.0;
		var transX = 0, transY = 0;
		if ( width > 10 ) 
			scaleX = ( width - 4 ) / width;
		if ( height > 10 ) 
			scaleY = ( height - 4 ) / height;
		if ( scaleX < 1.0 && scaleY < 1.0 ) {
			// Earlier autoshapes were drawn on canvas of size of stage. Now this is changed
			var projWidth	= cp.D.project.w;
			var projHeight	= cp.D.project.h;
			var lHasShadowOrReflection = false;
			lHasShadowOrReflection = cp.responsive ? (this.sh && !this.sh.i) : ((this.sh && !this.sh.i) || this.re);
			
			var lHasTransform = this.tr != undefined;
			
			var styleLeft 	= (0 < this.vbounds.minX) && lHasShadowOrReflection ? 0 : this.vbounds.minX;
			var styleTop	= (0 < this.vbounds.minY) && lHasShadowOrReflection ? 0 : this.vbounds.minY;
			var styleRight 	= lHasShadowOrReflection && (cp.D.project.w > this.vbounds.maxX) ? cp.D.project.w : this.vbounds.maxX;
			var styleBottom	= lHasShadowOrReflection && (cp.D.project.h > this.vbounds.maxY) ? cp.D.project.h : this.vbounds.maxY;
			var styleWidth	= styleRight - styleLeft;
			var styleHeight	= styleBottom - styleTop;
			
			var centerX = ( ( this.vbounds.maxX + this.vbounds.minX ) / 2 );
			var centerY = ( ( this.vbounds.maxY + this.vbounds.minY ) / 2 );
			
			var dX = ( styleWidth / 2 ) - centerX;
			var dY = ( styleHeight / 2 ) - centerY;
			
			var afterScaleX = ( styleWidth / 2 ) - ( dX * scaleX );
			var afterScaleY = ( styleHeight / 2 ) - ( dY * scaleY );
			
			if(lHasShadowOrReflection)
			{
				transX = afterScaleX - centerX;
				transY = afterScaleY - centerY;
			}
			else
			{
				transX = 0;
				transY = 0;
			}
			
			this.oldMouseOver = actualParent.onmouseover;
			this.oldMouseOut = actualParent.onmouseout;
			
			var dataObj = {sx: scaleX, sy: scaleY, tx: -transX, ty: -transY, p: actualParent, old_tr:this.tr};
			this.dataObjForMouseStates = dataObj;
			var evt = window.event || Event;
			if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID) {
				this.ontouchstartHandler = getMouseHandler( evt,this.element, doOnMouseDown );
				this.ontouchendHandler = getMouseHandler( evt,this.element, doOnMouseUp );
				actualParent.ontouchstart = getMouseHandler( evt,this.element, doOnMouseDown );
				actualParent.ontouchend = getMouseHandler( evt,this.element, doOnMouseUp );					
				//actualParent.ontouchstart = getMouseHandler( evt,this.element, dataObj, doOnMouseDown );
				//actualParent.ontouchend = getMouseHandler( evt,this.element, dataObj, doOnMouseUp );
				//this.ontouchstartHandler = actualParent.ontouchstart;
				//this.ontouchendHandler = actualParent.ontouchend;
			}
			else {
				actualParent.onmouseover = getMouseHandler( evt,this.element, doOnMouseOver, actualParent.onmouseover );
				actualParent.onmousemove = getMouseHandler( evt,this.element, doOnMouseMove, actualParent.onmousemove );
				actualParent.onmouseout = getMouseHandler( evt,this.element, doOnMouseOut, actualParent.onmouseout );
				actualParent.onmousedown = getMouseHandler( evt,this.element, doOnMouseDown );
				actualParent.onmouseup = getMouseHandler( evt,this.element, doOnMouseUp );
				
				this.onmouseoverHandler = actualParent.onmouseover;
				this.onmousemoveHandler = actualParent.onmousemove;
				this.onmouseoutHandler = actualParent.onmouseout;
				this.onmousedownHandler = actualParent.onmousedown;
				this.onmouseupHandler = actualParent.onmouseup;
			}
			this.shouldShowRollOver = true;
			this.setUpClickHandler();
		}
	}
	this.isDrawn = false;	

	if(cp.responsive)
		this.responsiveCSS = this.getAttribute("css");	
	if(this.cloneOfBaseStateItem==false && this.baseStateItemID!=-1)    
	{
		//playing effects on additional objects for the first time
		this.playEffectsOnStart = true;
	}
	cp.setInitialVisibility(this);
}

cp.inherits(cp.AutoShape, cp.DisplayObject);

cp.AutoShape.prototype.start = function(iForce,iReasonForDrawing)
{
	this.drawIfNeeded(iForce,iReasonForDrawing);
	if(!this.effectIsStarted || iForce)
	{
		this.areDimensionsCalculated = false;
		this.updateEffects(this.hasEffect);
		this.effectIsStarted = true;
	}
}

cp.AutoShape.prototype.reset = function(endOfSlide)
{
	delete cp.ropMap[this.element.id];
	// release memory
	this.isDrawn = false;
	this.element.width = "0";
	this.element.height = "0";
	this.element.style.width = "0px";
	this.element.style.height = "0px";
	
	this.element.left = "0";
	this.element.top = "0";
	this.element.style.left = "0px";
	this.element.style.top = "0px";
		
	this.removeMouseHandlers();
	this.effectIsStarted = false;
}

cp.AutoShape.prototype.getCurrentCanvasObj = function()
{
	if (! this.canvasObj || ! this.canvasObj.b || ! this.canvasObj.p0 )
		return;

	var canvasObject = this.canvasObj;
	/*if(this.AutoShapeState == 1)
		canvasObject = this.canvasObj.asbos;
	else if (this.AutoShapeState == 2)
		canvasObject = this.canvasObj.asbds;*/

	return canvasObject;
}

cp.AutoShape.prototype.addMouseHandlers = function()
{
	if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID) 
	{					
		/*this.actualParent.ontouchstart = this.ontouchstartHandler;
		this.actualParent.ontouchend = this.ontouchendHandler;*/
		cp.registerGestureEvent(this.actualParent,cp.GESTURE_EVENT_TYPES.TOUCH,this.ontouchstartHandler);
		cp.registerGestureEvent(this.actualParent,cp.GESTURE_EVENT_TYPES.RELEASE,this.ontouchendHandler);
	}
	else 
	{
		this.actualParent.onmouseover = this.onmouseoverHandler;
		this.actualParent.onmousemove = this.onmousemoveHandler;
		this.actualParent.onmouseout = this.onmouseoutHandler;
		this.actualParent.onmousedown = this.onmousedownHandler;
		this.actualParent.onmouseup = this.onmouseupHandler;
	}
}

cp.AutoShape.prototype.removeMouseHandlers = function()
{
	if ( this.actualParent ) {
		this.actualParent.onclick = null;
		if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID) {
			/*this.actualParent.ontouchstart = null;
			this.actualParent.ontouchend = null;*/
			cp.removeGestureEvent(this.actualParent,cp.GESTURE_EVENT_TYPES.TOUCH);
			cp.removeGestureEvent(this.actualParent,cp.GESTURE_EVENT_TYPES.RELEASE);
		}
		else {
			this.actualParent.onmouseout = null;
			this.actualParent.onmousedown = null;
			this.actualParent.onmouseup = null;
			this.actualParent.onmouseover = null;
			
			if ( this.oldMouseOver ) 
				this.actualParent.onmouseover = this.oldMouseOver;
			if ( this.oldMouseOut ) 
				this.actualParent.onmouseout = this.oldMouseOut;
		
		}
	}
}

cp.AutoShape.prototype.setUpClickHandler = function()
{
	var that = this;
	// Check whether current slide is question slide.
	var isQuestionSlide = false, isHotspot = false, needsOwnHandler = false;
	var currSlide = cp.movie.stage.currentSlide;
	if ( this.actualParent && currSlide ) {
		isQuestionSlide = ( currSlide.st == "Question Slide" );
		// Check whether this is a hotspot.
		if ( isQuestionSlide ) {
			if ( currSlide.qs ) {
				var data = cp.D[ currSlide.qs ]; 
				if ( data && data.qtp == 'Hotspot' )
					isHotspot = true;
			}
		}
		needsOwnHandler = isQuestionSlide && ! isHotspot;
		if ( needsOwnHandler && ! this.actualParent.onclick ) {
			function get_on_click( data ) {
				var objData = data;
				return function (event) {
					if(!that.is_inside_canvas(event))
						return;
					cp.clickSuccessHandler( objData );
				}
			}
			cp.registerGestureEvent(this.actualParent,cp.GESTURE_EVENT_TYPES.TAP,get_on_click( this.parentData ));
		}
		else {
			this.actualParent.onclick = null; // remove.
			cp.removeGestureEvent(this.actualParent,cp.GESTURE_EVENT_TYPES.TAP);
		}
	}
	this.needsOwnHandler = needsOwnHandler;
}

function getTransformDataForMouseStates(iElem,iAutoShape)
{
	if(!cp.responsive)
		return;
	
	var elemRect = iElem.getBoundingClientRect();
	var elemParentRect = iElem.parentElement.getBoundingClientRect();
	var actualParRect = iAutoShape.actualParent.getBoundingClientRect();
	var slideRect = cp("div_Slide").getBoundingClientRect();

	var width = actualParRect.width;
	var height = actualParRect.height;
	var scaleX = 1.0, scaleY = 1.0;
	var transX = 0, transY = 0;
	if ( width > 10 ) 
		scaleX = ( width - 4 ) / width;
	if ( height > 10 ) 
		scaleY = ( height - 4 ) / height;
	if ( scaleX < 1.0 && scaleY < 1.0 ) {
		// Earlier autoshapes were drawn on canvas of size of stage. Now this is changed
		var projWidth	= cp.project.clientWidth;
		var projHeight	= cp.project.clientHeight;
		var lHasShadowOrReflection = false;
		var lHasShadowOrReflection = (iAutoShape.sh && !iAutoShape.sh.i);
		
		var styleLeft 	= (0 < elemRect.left-slideRect.left) && lHasShadowOrReflection ? 0 : elemRect.left-slideRect.left;
		var styleTop	= (0 < elemRect.top-slideRect.top) && lHasShadowOrReflection ? 0 : elemRect.top-slideRect.top;
		var styleRight 	= lHasShadowOrReflection && (projWidth > elemRect.right-slideRect.left) ? projWidth : elemRect.right-slideRect.left;
		var styleBottom	= lHasShadowOrReflection && (projHeight > elemRect.bottom-slideRect.top) ? projHeight : elemRect.bottom-slideRect.top;
		var styleWidth	= styleRight - styleLeft;
		var styleHeight	= styleBottom - styleTop;
		
		var centerX = ( elemParentRect.left - slideRect.left + ( elemParentRect.width  / 2) );
		var centerY = ( elemParentRect.top - slideRect.top + ( elemParentRect.height  / 2) );
		
		var dX = ( styleWidth / 2 ) - centerX;
		var dY = ( styleHeight / 2 ) - centerY;
		
		var afterScaleX = ( styleWidth / 2 ) - ( dX * scaleX );
		var afterScaleY = ( styleHeight / 2 ) - ( dY * scaleY );
		
		if(lHasShadowOrReflection)
		{
			transX = afterScaleX - centerX;
			transY = afterScaleY - centerY;
		}
		else
		{
			transX = 0;
			transY = 0;
		}
	}
	
	var dataObj = {sx: scaleX, sy: scaleY, tx: -transX, ty: -transY, p: iAutoShape.actualParent, old_tr:iAutoShape.tr};
	return dataObj;
}

cp.AutoShape.prototype.shrinkShapeButtonInAllStates = function()
{
	var stateItems = cp.GetBaseItemsInAllStates(this,true);
	for(var i = 0 ; i < stateItems.length ; i++)
	{
		var currItem = stateItems[i];
		if(currItem)
		{
			currItem.shrinkShapeButton();
		}
	}
}

cp.AutoShape.prototype.expandShapeButtonInAllStates = function()
{
	var stateItems = cp.GetBaseItemsInAllStates(this,true);
	for(var i = 0 ; i < stateItems.length ; i++)
	{
		var currItem = stateItems[i];
		if(currItem)
		{
			currItem.expandShapeButton();
		}
	}
}

cp.AutoShape.prototype.shrinkShapeButton = function()
{
	if(this.dataObjForMouseStates)
	{
		var data = {sx: this.dataObjForMouseStates.sx, sy: this.dataObjForMouseStates.sy , tx: this.dataObjForMouseStates.tx, ty: this.dataObjForMouseStates.ty, p: this.dataObjForMouseStates.p , old_tr:this.dataObjForMouseStates.old_tr};

		if(cp.responsive)
			data = getTransformDataForMouseStates(this.element,this);
		var tr_str = 'translate(' + data.tx/cp("div_Slide").scaleFactor + 'px,' + data.ty/cp("div_Slide").scaleFactor + 'px) scalex(' + data.sx + ') scaley(' + data.sy + ')';
		var tr_str1 = '';
		cp.applyTransform( this.element, tr_str );
		var oldTr = data.old_tr ? data.old_tr : '';
		
		if ( oldTr.length > 0 )
			tr_str1 = oldTr + ' ';
		tr_str1 += 'scalex(' + data.sx + ') scaley(' + data.sy + ')';

		//cp.applyTransform( data.p, tr_str1 );
		this.setVBounds();
		if(cp("div_Slide").scaleFactor == 1 || !cp.responsive)
			this.drawIfNeeded(true,cp.ReasonForDrawing.kMouseEvent);
	}
}

cp.AutoShape.prototype.expandShapeButton = function()
{
	if(this.dataObjForMouseStates)
	{
		cp.applyTransform( this.element, '' );
		var oldTr = this.dataObjForMouseStates.old_tr ? this.dataObjForMouseStates.old_tr : '';

		//cp.applyTransform( data.p, oldTr );
		this.setVBounds();
		if(cp("div_Slide").scaleFactor == 1 || !cp.responsive)
			this.drawIfNeeded(true,cp.ReasonForDrawing.kMouseEvent);
	}
}

cp.AutoShape.prototype.restOfProjectDoOnNewSlide = function()
{
	this.addMouseHandlers();
	this.setUpClickHandler();
}

cp.AutoShape.prototype.drawForResponsive = function(iForce,iReason)
{

	if(!this.responsiveCSS) return false;
	if(this.isDrawn && !iForce) return true;
	var lCurrentCSS = cp.getResponsiveCSS(this.responsiveCSS);
	
	var lHasShadowOrReflection = false;
	lHasShadowOrReflection = (this.sh && !this.sh.i);
	
	var lHasTransform = this.tr != undefined;

	if(this.currentCSS == lCurrentCSS && 
		iForce && this.isDrawn &&
		iReason == cp.ReasonForDrawing.kMoviePaused) 
	{
		if(cp.verbose)
			cp.log("Returning because this.isDrawn : " + this.isDrawn);
		return true;
	}	
	
	var lUseLinks = true;
	this.currentCSS = lCurrentCSS;

	var canvasObject = this.getCurrentCanvasObj();
	
	var itemName = this.getAttribute('dn');
	this.parentDivName = itemName;

	var lResponsiveStyleObj = lCurrentCSS;
	
	//cp.logObject(lCurrentCSS, this.element.id);

	var actualParentTransform = this.actualParent.style['transform'] ||
				this.actualParent.style['msTransform'] ||
				this.actualParent.style['MozTransform'] ||
				this.actualParent.style['WebkitTransform'] ||
				this.actualParent.style['OTransform'];

	var parentElementTransform = this.element.parentElement.style['transform'] ||
					this.element.parentElement.style['msTransform'] ||
					this.element.parentElement.style['MozTransform'] ||
					this.element.parentElement.style['WebkitTransform'] ||
					this.element.parentElement.style['OTransform'];

	cp.applyTransform(this.actualParent, "");
	cp.applyTransform(this.element.parentElement, "");
	cp.applyResponsiveStyles(this.actualParent, lCurrentCSS, lUseLinks);
	{
		var itemData = cp.D[itemName];
		if(itemData.rpvt && itemData.autoGrow 
			&& ( iReason == cp.ReasonForDrawing.kTextGrow || 
				iReason == cp.ReasonForDrawing.kLinkedToItemAppeared || 
				iReason == cp.ReasonForDrawing.kMouseEvent || 
				iReason == cp.ReasonForDrawing.kMoviePaused))
		{
			var iItemHeight = itemData.minItemHeight;
			var lMinItemBoundingRectHeight = iItemHeight;
			if(lMinItemBoundingRectHeight && this.actualParent.clientHeight < lMinItemBoundingRectHeight)
			{
				this.actualParent.style.height = lMinItemBoundingRectHeight + "px";					
			}
			lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, 
																lCurrentCSS.p, 
																lCurrentCSS.l, 
																lCurrentCSS.t, 
																lCurrentCSS.r, 
																lCurrentCSS.b, 
																(this.actualParent.clientWidth) + "px", 
																this.actualParent.clientHeight + "px", 
																lCurrentCSS.crop);
		}
	}
	itemData.minItemHeight = this.actualParent.clientHeight;
	this.actualParent.offsetHeight = this.actualParent.offsetHeight;
	this.actualParentClientBoundingRect = this.actualParent.getBoundingClientRect();
	var lSlideContainerDivRect = cp.movie.stage.mainSlideDiv.getBoundingClientRect();

	this.WFactor = 1;
	this.HFactor = 1;

	{
		this.WFactor = Math.round(100*this.actualParent.clientWidth / (this.bounds.width))/100;
		this.HFactor = Math.round(100*this.actualParent.clientHeight / (this.bounds.height))/100;
	}
	var lVisibleBounds = new Object();
	{
		var lLeftDiff = this.wrvBounds.minX - this.bounds.minX;
		var lTopDiff = this.wrvBounds.minY - this.bounds.minY;
		var lRightDiff = this.wrvBounds.maxX - this.bounds.maxX;
		var lBottomDiff = this.wrvBounds.maxY - this.bounds.maxY;

		lVisibleBounds.l = lLeftDiff * this.WFactor;
		lVisibleBounds.t = lTopDiff * this.HFactor;
		lVisibleBounds.r = lRightDiff * this.WFactor;
		lVisibleBounds.b = lBottomDiff * this.HFactor;
		lVisibleBounds.w = this.wrvBounds.width * this.WFactor;//this.actualParent.clientWidth + Math.abs(lVisibleBounds.r - lVisibleBounds.l);
		lVisibleBounds.h = this.wrvBounds.height * this.HFactor;//this.actualParent.clientHeight + Math.abs(lVisibleBounds.b - lVisibleBounds.t);
	}
	
	lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, 
															lCurrentCSS.p, 
															this.actualParentClientBoundingRect.left - lSlideContainerDivRect.left + lVisibleBounds.l - canvasObject.sw/2 + "px",
															this.actualParentClientBoundingRect.top - lSlideContainerDivRect.top + lVisibleBounds.t - canvasObject.sw/2 + "px",
															"0px",
															"0px",
															lVisibleBounds.w + canvasObject.sw + "px", 
															lVisibleBounds.h + canvasObject.sw + "px", 
															lCurrentCSS.crop);
	
	cp.applyResponsiveStyles(this.element.parentElement, lResponsiveStyleObj);

	this.parentElementClientBoundingRect = this.element.parentElement.getBoundingClientRect();

	/* remove this comment for debug purpose
	{
		var canvasId = "sCanvas";//,canvasId2 = "sCanvas1",canvasId3 = "sCanvas3";
		var canvas1 = cp(canvasId + "1");
		var canvas2 = cp(canvasId + "2");
		var canvas3 = cp(canvasId + "3");
		var canvas4 = cp(canvasId + "4");
		var canvas5 = cp(canvasId + "5");
		if(!canvas1)
		{
			canvas1 = document.createElement("canvas");
			canvas1.id = canvasId + "1";
			canvas1.style.display = "block";
			canvas1.style.position = "absolute";
			canvas1.style.zIndex = 20000;
			canvas1.width = lSlideContainerDivRect.width;
			canvas1.height = lSlideContainerDivRect.height;
			canvas1.style.left = "0px";
			canvas1.style.top = "0px";
			cp("div_Slide").appendChild(canvas1);	

			canvas2 = document.createElement("canvas");
			canvas2.id = canvasId + "2";
			canvas2.style.display = "block";
			canvas2.style.position = "absolute";
			canvas2.style.zIndex = 20000;
			canvas2.width = lSlideContainerDivRect.width;
			canvas2.height = lSlideContainerDivRect.height;
			canvas2.style.left = "0px";
			canvas2.style.top = "0px";
			cp("div_Slide").appendChild(canvas2);	

			canvas3 = document.createElement("canvas");
			canvas3.id = canvasId + "3";
			canvas3.style.display = "block";
			canvas3.style.position = "absolute";
			canvas3.style.zIndex = 20000;
			canvas3.width = lSlideContainerDivRect.width;
			canvas3.height = lSlideContainerDivRect.height;
			canvas3.style.left = "0px";
			canvas3.style.top = "0px";
			cp("div_Slide").appendChild(canvas3);	

			canvas4 = document.createElement("canvas");
			canvas4.id = canvasId + "4";
			canvas4.style.display = "block";
			canvas4.style.position = "absolute";
			canvas4.style.zIndex = 20000;
			canvas4.width = lSlideContainerDivRect.width;
			canvas4.height = lSlideContainerDivRect.height;
			canvas4.style.left = "0px";
			canvas4.style.top = "0px";
			cp("div_Slide").appendChild(canvas4);	

			canvas5 = document.createElement("canvas");
			canvas5.id = canvasId + "5";
			canvas5.style.display = "block";
			canvas5.style.position = "absolute";
			canvas5.style.zIndex = 20000;
			canvas5.width = lSlideContainerDivRect.width;
			canvas5.height = lSlideContainerDivRect.height;
			canvas5.style.left = "0px";
			canvas5.style.top = "0px";
			cp("div_Slide").appendChild(canvas5);	
		}
		
		var mgc = canvas1.getContext("2d");		
		mgc.strokeStyle = "#0000ff";
		mgc.strokeRect (this.parentElementClientBoundingRect.left - lSlideContainerDivRect.left, 
						this.parentElementClientBoundingRect.top - lSlideContainerDivRect.top, 
						this.parentElementClientBoundingRect.width, this.parentElementClientBoundingRect.height);	
	}
	*/
	
	var rotateAngle = 0;
	if ( this.tr )
	{
		rotateAngle =cp.getAngleFromRotateStr( this.tr ) ;
		
		this.actualParent.offsetHeight = this.actualParent.offsetHeight;
		if(!this.m_centrePoint || iReason == cp.ReasonForDrawing.kOrientationChangeOrResize || iReason == cp.ReasonForDrawing.kLinkedToItemAppeared)
			this.m_centrePoint = cp.getCenterForRotation(this.actualParent);
		this.actualParentClientBoundingRect = this.actualParent.getBoundingClientRect();
		/* remove this comment for debug purpose
		var cp1 = {X:this.actualParentClientBoundingRect.width/2,Y:this.actualParentClientBoundingRect.height/2};
		var cp2 = {X:this.parentElementClientBoundingRect.width/2,Y:this.parentElementClientBoundingRect.height/2};
		mgc = canvas4.getContext("2d");
		mgc.strokeStyle = "#0000ff";
		mgc.arc(cp1.X+this.actualParentClientBoundingRect.left - lSlideContainerDivRect.left, 
				cp1.Y+this.actualParentClientBoundingRect.top - lSlideContainerDivRect.top, 2,0,360);
		mgc.stroke();
		*/
		var lRotatedBounds = cp.getBoundsForRotatedItem1(this.parentElementClientBoundingRect.left - lSlideContainerDivRect.left,
														this.parentElementClientBoundingRect.top - lSlideContainerDivRect.top,
														this.parentElementClientBoundingRect.width, 
														this.parentElementClientBoundingRect.height,
														this.m_centrePoint,
														rotateAngle, 
														canvasObject.sw)/*for debug purpose ,cp1.X,cp1.Y)*/;
		/* remove this comment for debug purpose
		mgc = canvas2.getContext("2d");		
		mgc.translate(this.actualParentClientBoundingRect.left - lSlideContainerDivRect.left + this.actualParentClientBoundingRect.width/2,
						this.actualParentClientBoundingRect.top - lSlideContainerDivRect.top + this.actualParentClientBoundingRect.height/2);
		mgc.strokeStyle = "#ff0000";
		mgc.arc(0,0,2,0,360);
		mgc.stroke();
		mgc.rotate((Math.PI*rotateAngle)/180);
		mgc.translate(-this.parentElementClientBoundingRect.width/2,
						-this.parentElementClientBoundingRect.height/2);

		mgc.strokeStyle = "#ff00ff";
		mgc.strokeRect (0,0,
						this.parentElementClientBoundingRect.width, 
						this.parentElementClientBoundingRect.height);*/

		var l = t = r = b = undefined;
		if(lCurrentCSS.l != "auto")
			l = lRotatedBounds.l;
		if(lCurrentCSS.t != "auto")
			t = lRotatedBounds.t;
		if(lCurrentCSS.r != "auto")
			r = lRotatedBounds.r;
		if(lCurrentCSS.b != "auto")
			b = lRotatedBounds.b;

		lResponsiveStyleObj = cp.createResponsiveStyleObj(lResponsiveStyleObj, 
															lCurrentCSS.p, 
															l,t,r,b, 
															lRotatedBounds.w, 
															lRotatedBounds.h, 
															lCurrentCSS.crop);
		//cp.logObject(lRotatedBounds, this.element.id + " bounds");
		cp.applyResponsiveStyles(this.element.parentElement, lResponsiveStyleObj);
		this.parentElementClientBoundingRect = this.element.parentElement.getBoundingClientRect();
		/* remove this comment for debug purpose
		var mgc1 = canvas3.getContext("2d");		
		mgc1.strokeStyle = "#ff00ff";
		mgc1.strokeRect (this.parentElementClientBoundingRect.left - lSlideContainerDivRect.left, 
					this.parentElementClientBoundingRect.top - lSlideContainerDivRect.top, 
					this.parentElementClientBoundingRect.width, this.parentElementClientBoundingRect.height);
		*/
	
	}
	
	this.parentElementClientBoundingRect = this.element.parentElement.getBoundingClientRect();
	
	var transformL = 0;
	var transformT = 0;
	if(this.m_centrePoint)
	{
		transformL = (this.m_centrePoint.X - (this.actualParentClientBoundingRect.left - lSlideContainerDivRect.left));
		transformT = (this.m_centrePoint.Y - (this.actualParentClientBoundingRect.top - lSlideContainerDivRect.top));
	}
	
			
	if(itemData.rpvt)
	{
		//add a holder for text in handler section			
		var lTextHolderDivId1 = this.actualParent.id + "_vTxtHandlerHolder";
		var lTextHolderDiv1 = cp(lTextHolderDivId1);
		if(!lTextHolderDiv1)
		{
			lTextHolderDiv1 = cp.newElem("div");
			lTextHolderDiv1.id = lTextHolderDivId1;
			lTextHolderDiv1.style.display = "block";
			lTextHolderDiv1.style.position = "absolute";
			lTextHolderDiv1.style.width = this.actualParent.clientWidth + "px";
			lTextHolderDiv1.style.height = this.actualParent.clientHeight + "px";
			lTextHolderDiv1.style.visibility = "hidden";
			this.actualParent.appendChild(lTextHolderDiv1);
		} 

		lTextHolderDiv1.style.left = "0px";
		lTextHolderDiv1.style.top = "0px";
		lTextHolderDiv1.style.width = this.actualParent.clientWidth + "px";
		lTextHolderDiv1.style.height = this.actualParent.clientHeight + "px";
		
		//add a holder for text in painter section
		var lTextHolderDivId = this.actualParent.id + "_vTxtHolder";
		var lTextHolderDiv = cp(lTextHolderDivId);
		if(!lTextHolderDiv)
		{
			lTextHolderDiv = cp.newElem("div");
			lTextHolderDiv.id = lTextHolderDivId;
			lTextHolderDiv.style.display = "block";
			lTextHolderDiv.style.position = "absolute";
			lTextHolderDiv.style.width = this.actualParent.clientWidth + "px";
			lTextHolderDiv.style.height = this.actualParent.clientHeight + "px";
			lTextHolderDiv.style.zIndex = 1;
			this.element.parentElement.appendChild(lTextHolderDiv);
		}
		
		var tx = this.actualParentClientBoundingRect.left - this.parentElementClientBoundingRect.left + this.actualParent.clientWidth/2;
		var ty = this.actualParentClientBoundingRect.top - this.parentElementClientBoundingRect.top + this.actualParent.clientHeight/2;

		lTextHolderDiv.style.left = tx - this.actualParent.clientWidth/2 + "px";
		lTextHolderDiv.style.top = ty - this.actualParent.clientHeight/2 + "px";
		lTextHolderDiv.style.width = this.actualParent.clientWidth + "px";
		lTextHolderDiv.style.height = this.actualParent.clientHeight + "px";

		if(iReason == cp.ReasonForDrawing.kOrientationChangeOrResize)
			cp.updateVarText(this.actualParent,true,true);

		if(this.tr)
		{
			//lTextHolderDiv.style.left = (this.element.parentElement.clientWidth - lTextHolderDiv.clientWidth)/2 + "px";
			//lTextHolderDiv.style.top = (this.element.parentElement.clientHeight - lTextHolderDiv.clientHeight)/2 + "px";
			var iStr = "center center";
			if(transformL)
				iStr = transformL*100/lTextHolderDiv.clientWidth + "%";
			else
				iStr = "center";
			iStr += " ";
			if(transformT)
				iStr += transformT*100/lTextHolderDiv.clientHeight + "%";
			else
				iStr += "center";

			lTextHolderDiv.style['-ms-transform-origin']= iStr;
			lTextHolderDiv.style['-moz-transform-origin']= iStr;
			lTextHolderDiv.style['-webkit-transform-origin']= iStr;
			lTextHolderDiv.style['-o-transform-origin']= iStr;
			lTextHolderDiv.style['transform-origin']= iStr;
			cp.applyTransform(lTextHolderDiv,this.tr);
		}
	}
	
	cp.applyTransform(this.actualParent, actualParentTransform);
	cp.applyTransform(this.element.parentElement, parentElementTransform);

	var actualParent = this.actualParent;
	var canvas;
	var canvasW = 0, canvasH = 0;

	canvasW = lVisibleBounds.w + 2*canvasObject.sw;
	canvasH = lVisibleBounds.h + 2*canvasObject.sw;

	if(lHasShadowOrReflection)
	{
		var lParentW = this.element.parentElement.clientWidth;
		var lParentH = this.element.parentElement.clientHeight;			
		var sh_CanvasW = cp("div_Slide").clientWidth;
		var sh_CanvasH = cp("div_Slide").clientHeight;
		canvasW = canvasW > sh_CanvasW ? canvasW : sh_CanvasW;
		canvasH = canvasH > sh_CanvasH ? canvasH : sh_CanvasH;
		canvasW = canvasW > lParentW ? canvasW : lParentW;
		canvasH = canvasH > lParentH ? canvasH : lParentH;
	}
	else
	{
		canvasW = Math.ceil(parseFloat(this.element.parentElement.style.width));
		canvasH = Math.ceil(parseFloat(this.element.parentElement.style.height));
	}
	
	lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, undefined, "0px", "0px", "0px", "0px", canvasW + "px", canvasH + "px", undefined);
	
	var lL = this.parentElementClientBoundingRect.left - lSlideContainerDivRect.left;
	var lT = this.parentElementClientBoundingRect.top - lSlideContainerDivRect.top;

	var canvas = this.canvas = cp.createResponsiveCanvas(lResponsiveStyleObj, canvasW, canvasH, this.element);
	if(!this.isParentOfTypeSlide)
	{
		if(lHasShadowOrReflection)
		{
			this.element.style.marginLeft = (lL < 0 ? 0 : -1)*lL + "px";
			this.element.style.marginTop = (lT < 0 ? 0 : -1)*lT + "px";
		}
	}

	if(this.re)
		this.element.parentElement.style.webkitBoxReflect = "below " + this.re.d + "px" + " -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(" + (1 - this.re.s/100) +", transparent), to(rgba(255, 255, 255, "+ (1-this.re.p/100) +")))";
	cp.movie.stage.addToParentChildMap(actualParent.id,this.element.id);
	this.element.originalParent = actualParent;
	var gc = canvas.gc;
	if(lCurrentCSS["crop"])
	{
		gc.crop = lCurrentCSS["crop"];
	}
	else
	{
		gc.crop = undefined;	
	}

	gc.save();
	var transX = 0;
	var transY = 0;		
	if(lHasShadowOrReflection)
	{
		transX = lL < 0 ? -lL : 0;
		transY = lT < 0 ? -lT : 0;
		gc.setTransform(1,0,0,1,transX,transY);
		gc.translate(lL,lT);			
		gc.shadowOffsetX = this.sh.d*Math.cos((Math.PI*this.sh.a)/180);
		gc.shadowOffsetY = this.sh.d*Math.sin((Math.PI*this.sh.a)/180);
		gc.shadowBlur = this.sh.b;
		var opacity = this.sh.o;
		if(opacity == 1.0)
			opacity = 0.999;
		gc.shadowColor = cp.ConvertRGBToRGBA(this.sh.c,opacity );
		//cp.applyShadow(this.element , this.sh.d*Math.cos((Math.PI*this.sh.a)/180) + 'px ' + this.sh.d*Math.sin((Math.PI*this.sh.a)/180) + 'px ' + this.sh.b + 'px '+ cp.ConvertRGBToRGBA(this.sh.c,this.sh.o ));
	}
	else if(!lHasTransform)
	{
		gc.translate(-lVisibleBounds.l,-lVisibleBounds.t);
		gc.translate(canvasObject.sw/2,canvasObject.sw/2);
	}
	
	this.element.style.display = "block";
	this.element.style.position = "absolute";

	var gc = canvas.gc;
	
	gc.save();

	if ( this.tr ) {
		var iStr = "center center";
		if(transformL)
			iStr = transformL*100/actualParent.clientWidth + "%";
		else
			iStr = "center";
		iStr += " ";
		if(transformT)
			iStr += transformT*100/actualParent.clientHeight + "%";
		else
			iStr += "center";
		actualParent.style['-ms-transform-origin']= iStr;
		actualParent.style['-moz-transform-origin']= iStr;
		actualParent.style['-webkit-transform-origin']= iStr;
		actualParent.style['-o-transform-origin']= iStr;
		actualParent.style['transform-origin']= iStr;
		cp.applyTransform( actualParent,this.tr );					
		actualParent.tr = this.tr;
	}
		
	actualParent.rotateAngle = rotateAngle;
	//debug - gc.strokeRect (0, 0, gc.canvas.width, gc.canvas.height);
	if(lHasShadowOrReflection || lHasTransform)
	{
		var dx = this.element.parentElement.clientWidth/2;
		var dy = this.element.parentElement.clientHeight/2;
		//translate to the center point of the actual div
		{
			dx = this.actualParentClientBoundingRect.left - this.parentElementClientBoundingRect.left + transformL;// this.actualParent.clientWidth/2;
			dy = this.actualParentClientBoundingRect.top - this.parentElementClientBoundingRect.top + transformT;// + this.actualParent.clientHeight/2;
		}
		gc.translate(dx,dy);
		if(0 != rotateAngle)
			gc.rotate((Math.PI*rotateAngle)/180);			
		else
			gc.rotate((Math.PI*0.02)/180);
		//gc.translate(-actualParent.clientWidth/2,-actualParent.clientHeight/2);
		gc.translate(-transformL,-transformT);
	}		

	gc.clearRect(0, 0, this.element.getBoundingClientRect().width, this.element.getBoundingClientRect().height);		
	if(cp.DESKTOP == cp.device)
	{
		//IE and FF skips the canvas clearRect and keeps on drawing on top of the previous canvas itself. 
		//beginPath() force clears the canvas
		if((cp.MSIE == cp.browser) || (cp.MSEDGE == cp.browser) || (cp.FIREFOX == cp.browser))
			gc.beginPath();
	}	
	
	var strokeType = 0;
	if ( undefined != canvasObject.ss )
		strokeType = canvasObject.ss;
	var fillAlpha = 1;
	if ( undefined != canvasObject.fa )
		fillAlpha = canvasObject.fa / 100;
	if ( undefined != this.normalImage && fillAlpha != 1 ) {
		var img = cp.movie.im.images[ this.normalImage ];
		if ( img && img.nativeImage.complete) 
		{
			//gc.translate(lL + this.element.parentElement.clientWidth/2,lT + this.element.parentElement.clientHeight/2);
			gc.drawImage(img.nativeImage,-img.nativeImage.width/2,-img.nativeImage.height/2,img.nativeImage.width,img.nativeImage.height);
			//gc.translate(-(lL + this.element.parentElement.clientWidth/2),-(lT + this.element.parentElement.clientHeight/2);
		}
	}
	
	//debug - gc.strokeRect (0, 0, gc.canvas.width, gc.canvas.height);
	
	var ok = this.draw( gc, strokeType );
	
	// Draw an image, if it is there.
	if ( ok && undefined != this.normalImage ) {
		var img = cp.movie.im.images[ this.normalImage ];
		if ( img && img.nativeImage.complete) 
		{
			if(this.sh && !this.sh.i)
			{
				gc.shadowOffsetX = 0;
				gc.shadowOffsetY = 0;
				gc.shadowBlur = 0;
				gc.shadowColor = 'rgba(0,0,0,0)';
			}
			//if ( !this.sh && (0 == rotateAngle))
				//gc.translate(-this.canvasObj.sw*2,-this.canvasObj.sw*2);
			//gc.translate((bounds.minX + bounds.maxX)/2,(bounds.minY + bounds.maxY)/2);
			gc.drawImage(img.nativeImage,-img.nativeImage.width/2,-img.nativeImage.height/2,img.nativeImage.width,img.nativeImage.height);
		}
		else
			ok = false;
	}
			
	gc.restore();
	if(this.transIn && iReason == cp.ReasonForDrawing.kRegularDraw)
		this.element.parentElement.style.opacity = 0;		
	
	gc = null;
	canvas = null;
	this.isDrawn = ok;
	if(this.isDrawn == true)
		this.drawComplete(iReason);
	if(this.parentData.enabled != undefined && !this.parentData.enabled)
		this.removeMouseHandlers();

	if(!cp.isVisible(this))
		cp._hide( this.parentDivName );

	if(cp.isVisible(this) && this.playEffectsOnStart)
	{
		var itemName = this.parentDivName;
		var script = cp.D[itemName]["selfAnimationScript"];
		if(script)
			eval(script);
		this.playEffectsOnStart = false;
	}

	return true;
}

cp.AutoShape.prototype.drawIfNeeded = function(iResponsiveForce,iReasonForDrawing)
{
	if(cp.responsive)
	{
		if(this.drawForResponsive(iResponsiveForce,iReasonForDrawing))
			return;
	}

	if (this.isDrawn)
		return;

	this.WFactor = 1;
	this.HFactor = 1;
	
	var canvasObject = this.getCurrentCanvasObj();
		
	// Need to fix this bounds business. Need to 
	var bounds = this.bounds;
	var boundOffset = canvasObject.sw;
	if ( undefined == boundOffset )
		boundOffset = 1; 
	//Compensating the extra width published from Edit Area
	if(boundOffset != 1 && this.vbounds==undefined)
	{
		this.vbounds.minX += boundOffset*3/2;
		this.vbounds.minY += boundOffset*3/2;
		this.vbounds.maxX -= boundOffset*3/2;
		this.vbounds.maxY -= boundOffset*3/2;
	}
	
	var vbounds = this.vbounds;		
			
	var styleLeft = bounds.minX ;
	var styleTop = bounds.minY;
	var styleWidth = bounds.maxX - bounds.minX;
	var styleHeight = bounds.maxY - bounds.minY;
	
	var actualParent = this.actualParent;
	
	actualParent.style.left = styleLeft +  "px";
	actualParent.style.top = styleTop + "px";
	actualParent.style.width = styleWidth + "px";
	actualParent.style.height = styleHeight + "px";
	
	var x = 0;
	var y = 0;
	var width = bounds.maxX - bounds.minX;
	var height = bounds.maxY - bounds.minY;
	
	var lHasShadowOrReflection = false;
	lHasShadowOrReflection = this.re || (this.sh && !this.sh.i);
	
	var lHasTransform = this.tr != undefined;
	
	styleLeft 	= (0 < vbounds.minX) && lHasShadowOrReflection ? 0 : vbounds.minX;
	styleTop	= (0 < vbounds.minY) && lHasShadowOrReflection ? 0 : vbounds.minY;
	var styleRight 	= lHasShadowOrReflection && (cp.D.project.w > vbounds.maxX) ? cp.D.project.w : vbounds.maxX;
	var styleBottom	= lHasShadowOrReflection && (cp.D.project.h > vbounds.maxY) ? cp.D.project.h : vbounds.maxY;
	styleWidth	= styleRight - styleLeft;
	styleHeight	= styleBottom - styleTop;
	var canvas = this.canvas = cp.createCanvas(0, 0, styleWidth, styleHeight,this.element);
			
	this.element.style.display = "block";
	this.element.style.position = "absolute";
	this.element.parentElement.style.left = this.vbounds.minX + "px";
	this.element.parentElement.style.top = this.vbounds.minY + "px";
	this.element.parentElement.style.width = (this.vbounds.maxX - this.vbounds.minX) + "px";
	this.element.parentElement.style.height = (this.vbounds.maxY - this.vbounds.minY) + "px";
	this.element.style.marginLeft = (styleLeft-this.vbounds.minX) + "px";
	this.element.style.marginTop = (styleTop-this.vbounds.minY) + "px";
	if(this.re)
		this.element.parentElement.style.webkitBoxReflect = "below " + this.re.d + "px" + " -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(" + (1 - this.re.s/100) +", transparent), to(rgba(255, 255, 255, "+ (1-this.re.p/100) +")))";
	cp.movie.stage.addToParentChildMap(actualParent.id,this.element.id);
	this.element.originalParent = actualParent;
	var gc = canvas.gc;
	
	gc.save();
	var transX = 0;
	var transY = 0;		
	if(lHasShadowOrReflection)
	{
		transX = (styleLeft < 0) ? -styleLeft : 0;
		transY = (styleTop < 0) ? -styleTop : 0;
		gc.setTransform(1,0,0,1,transX,transY);
		//gc.translate((bounds.minX + bounds.maxX)/2,(bounds.minY + bounds.maxY)/2);
	}			
	else if(lHasTransform)
	{
		gc.translate(-this.vbounds.minX,-this.vbounds.minY);			
	}
	else
	{
		gc.translate(-this.vbounds.minX,-this.vbounds.minY);
		//gc.translate(-bounds.minX,-bounds.minY);
	}
	if(this.sh && !this.sh.i)
	{
		gc.shadowOffsetX = this.sh.d*Math.cos((Math.PI*this.sh.a)/180);
		gc.shadowOffsetY = this.sh.d*Math.sin((Math.PI*this.sh.a)/180);
		gc.shadowBlur = this.sh.b;
		var opacity = this.sh.o;
		if(opacity == 1.0)
			opacity = 0.999;
		gc.shadowColor = cp.ConvertRGBToRGBA(this.sh.c,opacity );
		//cp.applyShadow(this.element , this.sh.d*Math.cos((Math.PI*this.sh.a)/180) + 'px ' + this.sh.d*Math.sin((Math.PI*this.sh.a)/180) + 'px ' + this.sh.b + 'px '+ cp.ConvertRGBToRGBA(this.sh.c,this.sh.o ));
	}		
	this.element.style.display = "block";
	this.element.style.position = "absolute";

	var rotateAngle = 0;
	if ( this.tr ) {
	cp.applyTransform( actualParent,this.tr );					
		actualParent.tr = this.tr;
		rotateAngle =cp.getAngleFromRotateStr( this.tr );
	}
		
	actualParent.rotateAngle = rotateAngle;
	if ( this.sh || (0 != rotateAngle)) 
	{
		gc.translate((bounds.minX + bounds.maxX)/2,(bounds.minY + bounds.maxY)/2);
		if(0 != rotateAngle)
			gc.rotate((Math.PI*rotateAngle)/180);			
		else
			gc.rotate((Math.PI*0.02)/180);
		gc.translate(-(bounds.minX + bounds.maxX)/2,-(bounds.minY + bounds.maxY)/2);
	}
	var strokeType = 0;
	if ( undefined != canvasObject.ss )
		strokeType = canvasObject.ss;
	var fillAlpha = 1;
	if ( undefined != canvasObject.fa )
		fillAlpha = canvasObject.fa / 100;
	if ( undefined != this.normalImage && fillAlpha != 1 ) {
		var img = cp.movie.im.images[ this.normalImage ];
		if ( img && img.nativeImage.complete) 
		{
			gc.translate((bounds.minX + bounds.maxX)/2,(bounds.minY + bounds.maxY)/2);
			gc.drawImage(img.nativeImage,-img.nativeImage.width/2,-img.nativeImage.height/2,img.nativeImage.width,img.nativeImage.height);
			gc.translate(-(bounds.minX + bounds.maxX)/2,-(bounds.minY + bounds.maxY)/2);
		}
	}
	
	//if ( !this.sh && (0 == rotateAngle)) 
		//gc.translate(this.canvasObj.sw*2,this.canvasObj.sw*2);
	
	var ok = this.draw( gc, strokeType );
	
	// Draw an image, if it is there.
	if ( ok && undefined != this.normalImage ) {
		var img = cp.movie.im.images[ this.normalImage ];
		if ( img && img.nativeImage.complete) 
		{
			if(this.sh && !this.sh.i)
			{
				gc.shadowOffsetX = 0;
				gc.shadowOffsetY = 0;
				gc.shadowBlur = 0;
				gc.shadowColor = 'rgba(0,0,0,0)';
			}
			//if ( !this.sh && (0 == rotateAngle))
				//gc.translate(-this.canvasObj.sw*2,-this.canvasObj.sw*2);
			gc.translate((bounds.minX + bounds.maxX)/2,(bounds.minY + bounds.maxY)/2);
			gc.drawImage(img.nativeImage,-img.nativeImage.width/2,-img.nativeImage.height/2,img.nativeImage.width,img.nativeImage.height);
		}
		else
			ok = false;
	}
			
	gc.restore();
	if(this.transIn)
		this.element.parentElement.style.opacity = 0;		
	
	gc = null;
	canvas = null;
	this.isDrawn = ok;
	if(this.isDrawn == true)
		this.drawComplete(iReasonForDrawing);
	if(this.parentData.enabled != undefined && !this.parentData.enabled)
		this.removeMouseHandlers();

	if(!cp.isVisible(this))
		cp._hide( this.parentDivName );		

	if(cp.isVisible(this) && this.playEffectsOnStart)
	{
		var itemName = this.parentDivName;
		var script = cp.D[itemName]["selfAnimationScript"];
		if(script)
			eval(script);
		this.playEffectsOnStart = false;
	}
}

cp.AutoShape.prototype.draw = function( gc, strokeType )
{
	if(this.canvasObj.svg)
	{
		this.drawSVGShape(gc);
		return true;
	}
	// First draw with solid stroke, so that the fill gets applied correctly.
	var forFill = true;
	var ok = false;
	//if ( 0 == strokeType && this.canvasObj.sw > 0 )
		//forFill = false;
	this.drawFillBoundary( gc, forFill );
	
	var canvasObject = this.getCurrentCanvasObj();
	if(!canvasObject)
		return;

	// Now fill.
	var fillAlpha = 1;
	if ( undefined != canvasObject.fa )
		fillAlpha = canvasObject.fa / 100;
	
	var oldAlpha = gc.globalAlpha;
	var fillDone = false;
	if ( 0 != strokeType && canvasObject.sw > 0 ) {
		// First fill.
		gc.globalAlpha = fillAlpha;
		ok = this.setFill( gc );
		gc.globalAlpha = oldAlpha;
		// Now do the stroking without filling.
		this.drawBoundary( gc, strokeType );
	}

	if ( ! fillDone ) {
		gc.globalAlpha = fillAlpha;
		ok = this.setFill( gc );
		gc.globalAlpha = oldAlpha;
	}
	
	if ( 0 == strokeType && canvasObject.sw > 0 ) {
		// Now draw boundary for stroke.
		this.drawFillBoundary( gc, false );
	}
	
	if ( canvasObject.sw > 0 ) {
		gc.lineWidth = canvasObject.sw;
		gc.strokeStyle = canvasObject.sc;
		gc.stroke();
	}

	if(canvasObject.sw!=0 )
	{
		gc.shadowOffsetX = 0;
		gc.shadowOffsetY = 0;
		gc.shadowBlur = 0;
		gc.shadowColor = 'rgba(0,0,0,0)';
		gc.stroke();
	}	

	return ok;
}

cp.AutoShape.prototype.drawSVGShape = function( gc )
{
	var op = null;
	var dArr = this.canvasObj.p0;
	var opVal;
	var lastX = 0, lastY = 0, i = 0, opIndex = 0;
	var lOldGlobalAlpha = gc.globalAlpha, swidth, pathAlpha = 1.0, strokeAlpha=1.0;

	if ( ! dArr )
		return;

	for ( i = 0; i < dArr.length; ++i )
	{
		op = dArr[ i ];

		if ( op.length <= 0 )
			continue;
		switch ( op[ 0 ] ) {
			
		case cp.kBeginPath:
			if(this.canvasObj.svg)
				gc.beginPath();
			break;			
		case cp.kMoveTo:
			gc.moveTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor );
			lastX = op[ 1 ]*this.WFactor; 
			lastY = op[ 2 ]*this.HFactor;
			break;
		case cp.kLineTo:
			gc.lineTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor );
			lastX = op[ 1 ]*this.WFactor; 
			lastY = op[ 2 ]*this.HFactor;
			break;
		case cp.kBezierTo:
			gc.bezierCurveTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor, op[ 3 ]*this.WFactor, op[ 4 ]*this.HFactor, op[ 5 ]*this.WFactor, op[ 6 ]*this.HFactor );
			lastX = op[ 5 ]*this.WFactor;
			lastY = op[ 6 ]*this.HFactor;
			break;
		case cp.kClosePath:
			gc.closePath();
			break;
		case cp.kPathFillData:
			if (this.canvasObj.svg)
			{
				var fillInfo = op[1];
				if(!fillInfo.indexOf("gf"))
				{
					var gfobj = new Object();
					fillInfo = fillInfo.substr(3);
					gfobj["gf"] =eval('('+fillInfo+')');
					if(gfobj.gf)
					{
						//cp.log("the json1: "+JSON.stringify(gfobj.gf));
						var grad = cp.getGradientFill( gfobj.gf, gc, this.WFactor, this.HFactor);
						//this.canvasElem.clientWidth
						if ( grad )
							gc.fillStyle = grad;
					}
				}
				else
				{
					var pathFillColor = eval('{' + fillInfo + '}');
					gc.fillStyle = pathFillColor;
				}
			}
			break;
		case cp.kPathFillAlpha:
			var pathAlpha = op[1];
			break;
		case cp.KPathStrokeColor:
			var scolor = op[1];
			gc.strokeStyle = "#"+scolor;
			break;
		case cp.KPathStrokeWidth:
			swidth = op[1];
			var oldAlpha = gc.globalAlpha;
			gc.globalAlpha = pathAlpha;
			gc.fill();
			if(swidth)
			{
				gc.lineWidth = swidth;
				gc.globalAlpha = strokeAlpha;
				gc.stroke();
			}
			gc.globalAlpha = oldAlpha;
			break;
		case cp.KPathStrokeAlpha:
			strokeAlpha = op[1];
			break;
		default:
			break;
		}
	}
}

cp.AutoShape.prototype.drawFillBoundary = function( gc, forFill )
{
	var op = null;
	
	var dArr = this.canvasObj.p0;
	var opVal;
	var lastX = 0, lastY = 0, i = 0, opIndex = 0;
	var lOldGlobalAlpha = gc.globalAlpha, swidth, pathAlpha = 1.0, strokeAlpha=1.0;

	if ( ! dArr )
		return;

	for ( i = 0; i < dArr.length; ++i )
	{
		op = dArr[ i ];
		
		if ( op.length <= 0 )
			continue;
		switch ( op[ 0 ] ) {
			
		case cp.kBeginPath:
		//	gc.beginPath();
			break;			
		case cp.kMoveTo:
			gc.moveTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor );
			lastX = op[ 1 ]*this.WFactor; 
			lastY = op[ 2 ]*this.HFactor;
			break;
		case cp.kLineTo:
			gc.lineTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor );
			lastX = op[ 1 ]*this.WFactor; 
			lastY = op[ 2 ]*this.HFactor;
			break;
		case cp.kBezierTo:
			gc.bezierCurveTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor, op[ 3 ]*this.WFactor, op[ 4 ]*this.HFactor, op[ 5 ]*this.WFactor, op[ 6 ]*this.HFactor );
			lastX = op[ 5 ]*this.WFactor;
			lastY = op[ 6 ]*this.HFactor;
			break;
		case cp.kClosePath:
			gc.closePath();
			break;
		case cp.kNotClosed:
			if ( ! forFill )
				break; // We need to consider while stroking.
		case cp.kNoStroke:
			// Skip up to next begin, closed or no stroke;
			opIndex = i;
			if ( i < ( dArr.length - 1 ) ) {
				opVal = dArr[ ++i ][ 0 ];
				if ( cp.kBeginPath != opVal )
					--i;
			}
				while ( i < ( dArr.length - 1 ) ) {
				opVal = dArr[ ++i ][ 0 ];
				if ( cp.kNotClosed == opVal || cp.kNoStroke == opVal || cp.kBeginPath == opVal ) {
					--i;
						break;
				}					
			}
			break; // TODO - Handle.
		default:
			break;
		}
	}
}

cp.AutoShape.prototype.drawBoundary = function( gc, strokeType )
{
	var op = null;
		
	var dArr = this.canvasObj.p0;
	var lastX = 0, lastY = 0, i = 0;
	if ( ! dArr )
		return;
		
	var struct = new cp.dashStruct();
	var pattern = cp.getPattern( strokeType, 7, 3 );			
	
	gc.beginPath();
	for ( i = 0; i < dArr.length; ++i ) {
		op = dArr[ i ];
		if ( op.length <= 0 )
			continue;
		switch ( op[ 0 ] ) {
		case cp.kBeginPath:
			break; 
		case cp.kMoveTo:
			gc.moveTo( op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor );
			lastX = op[ 1 ]*this.WFactor; 
			lastY = op[ 2 ]*this.HFactor;
			struct = new cp.dashStruct();
			break;
		case cp.kLineTo:
			cp.drawDashedLineImpl( gc, pattern, struct, lastX, lastY, op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor );
			lastX = op[ 1 ]*this.WFactor; 
			lastY = op[ 2 ]*this.HFactor;
			break;
		case cp.kBezierTo:
			cp.drawDashedBezierCurve( gc, pattern, struct, lastX, lastY, op[ 1 ]*this.WFactor, op[ 2 ]*this.HFactor, op[ 3 ]*this.WFactor, op[ 4 ]*this.HFactor, op[ 5 ]*this.WFactor, op[ 6 ]*this.HFactor );
			lastX = op[ 5 ]*this.WFactor; 
			lastY = op[ 6 ]*this.HFactor;
			break;
		case cp.kClosePath:
			struct = new cp.dashStruct();
			break;
		case cp.kNotClosed:	
		case cp.kNoStroke:
			break; 
		default:
			break;
		}		
	}
}

cp.AutoShape.prototype.getTranslationValuesForTiletype = function()
{
	var canvasObject = this.getCurrentCanvasObj();
	if(!canvasObject)
		return;

	var tileData = canvasObject.imgf;
	if(!tileData)
		return;

	var tileType = tileData.img.tiletype;
	var xTrans = 0 , yTrans = 0;

	var curCanvasWidth = (tileData.b[2]-tileData.b[0]);
	var curCanvasHeight = (tileData.b[3]-tileData.b[1]);

	var imageWidth =tileData.img.w;
	var imageHeight = tileData.img.h;

	if(cp.responsive)
	{
		curCanvasWidth = Math.floor(curCanvasWidth*this.WFactor)+canvasObject.sw;
		curCanvasHeight = Math.floor(curCanvasHeight*this.HFactor)+canvasObject.sw;
	}

	switch(tileType)
	{
		case 'tl':
			break;
		case 't':
			xTrans	= ( curCanvasWidth - imageWidth ) / 2;
			break;
		case 'tr':
			xTrans	= curCanvasWidth - imageWidth;
			break;
		case 'l':
			yTrans	= ( curCanvasHeight - imageHeight ) / 2;
			break;
		case 'c':
			xTrans	= ( curCanvasWidth - imageWidth ) / 2;
			yTrans	= ( curCanvasHeight - imageHeight ) / 2;
			break;
		case 'r':
			xTrans	= curCanvasWidth - imageWidthimageWidth;
			yTrans	= ( curCanvasHeight - imageHeight ) / 2;
			break;
		case 'bl':
			yTrans	= curCanvasHeight - imageHeight;
			break;
		case 'b':
			xTrans	= ( curCanvasWidth - imageWidth ) / 2;
			yTrans	= curCanvasHeight - imageHeight;
			break;
		case 'br':
			xTrans	= curCanvasWidth - imageWidth;
			yTrans	= curCanvasHeight - imageHeight;
			break;
	}

	if(xTrans > 0)
	{
		var rem = xTrans % imageWidth;
		xTrans = rem - imageWidth;
	}

	if ( yTrans > 0)
	{
		var rem = yTrans % imageHeight;
		yTrans = rem - imageHeight;
	}

	if(!cp.responsive)
	{
		xTrans += canvasObject.b[ 0 ];
		yTrans += canvasObject.b[ 1 ];
	}

	return {'x':xTrans, 'y':yTrans};
}

cp.AutoShape.prototype.setFill = function( gc )
{
	var tileData = null;
	var imagePath = '';
	var img = null;
	var bounds = [];
	var xTrans = 0, yTrans = 0;
	var bStretch = 0;
	var bTile = 1;
	var pat = null, grad = null;
	var ok = true;
	var w = 0, y = 0, scaleX = 1, scaleY = 1;
	var translated = false;
	var hasImageOnTop = false;

	var canvasObject = this.getCurrentCanvasObj();
	if(!canvasObject)
		return;

	var primarycanvas = gc.canvas;
	if(primarycanvas.width == 0 || primarycanvas.height == 0)
		return true;
	
	if ( canvasObject.gf ) {
		grad = cp.getGradientFill( canvasObject.gf, gc, this.WFactor, this.HFactor);
		if ( grad ) 
			gc.fillStyle = grad;
	}
	else if ( canvasObject.imgf ) {
		ok = false;
		tileData = canvasObject.imgf;
		if ( undefined == tileData.img || undefined == tileData.img.ip )
			return false;
		imagePath = tileData.img.ip;
		img = cp.movie.im.images[ imagePath ];
		if ( img && img.nativeImage.complete )
		{
			bStretch = tileData.s;
			bTile = tileData.t;
			if ( bTile ) {
				var transObj = this.getTranslationValuesForTiletype();				
				translated = true;
				xTrans=transObj.x;
				yTrans=transObj.y;
				gc.translate( xTrans, yTrans);
				pat = gc.createPattern( img.nativeImage, "repeat" );
				gc.fillStyle = pat;
			}
			else if ( bStretch ) {
				if ( undefined != this.canvasObj.b && 4 == this.canvasObj.b.length ) {
					
					if(cp.responsive)
					{
						xTrans = Math.floor(xTrans * this.WFactor)+canvasObject.sw;
						yTrans = Math.floor(yTrans * this.HFactor)+canvasObject.sw;
					}
					else
					{
						xTrans += this.canvasObj.b[ 0 ];
						yTrans += this.canvasObj.b[ 1 ];
					}
					bounds = this.canvasObj.b;		
					w = bounds[ 2 ] - bounds[ 0 ];
					h = bounds[ 3 ] - bounds[ 1 ];
					if(cp.responsive)
					{
						w *= this.WFactor;
						h *= this.HFactor;
					}						
					scaleX = w / tileData.img.w;
					scaleY = h / tileData.img.h;
					gc.translate(xTrans,yTrans);
					translated = true;
					gc.scale( scaleX, scaleY );
					pat = gc.createPattern( img.nativeImage, "no-repeat" );
					gc.fillStyle = pat;
				}
			}
			else {

				// Bug : 3971017
				// drawing the image on secondary canvas of same size with fillRect and then 
				// drawing the secondary canvas on Original canvas
				// Reason to do in this way : normal fill with translate has issues. So fillRect should be used with canvas translate.
				// But to crop the fill with respect to our autoshape we should use fill.Hence this way.
				var secCanvas = document.createElement('canvas');
      			var secContext = secCanvas.getContext('2d');

      			var primarycanvas = gc.canvas;
		        secCanvas.left = primarycanvas.left;
		        secCanvas.right = primarycanvas.right;
		        secCanvas.top = primarycanvas.top;
		        secCanvas.bottom = primarycanvas.bottom;
		        secCanvas.width = primarycanvas.width;
		        secCanvas.height = primarycanvas.height;
		        
		        var imageWidth = img.nativeImage.width;
				var imageHeight = img.nativeImage.height;

				var curCanvasWidth = (tileData.b[2]-tileData.b[0]);
				var curCanvasHeight = (tileData.b[3]-tileData.b[1]);

				if(cp.responsive)
				{
					curCanvasWidth = Math.floor(curCanvasWidth*this.WFactor)+canvasObject.sw;
					curCanvasHeight = Math.floor(curCanvasHeight*this.HFactor)+canvasObject.sw;

					xTrans = -(imageWidth-curCanvasWidth)/2;
					yTrans = -(imageHeight-curCanvasHeight)/2;

					secContext.translate( xTrans, yTrans );
				}
				else
				{
					// translate secContext to image position
					var x = (curCanvasWidth - imageWidth)/2;
					var y = (curCanvasHeight - imageHeight)/2;
					secContext.translate( x, y);

					// translate primary content to bounds (x,y) position as it is already translated to (-x,-y) position
					xTrans = this.canvasObj.b[ 0 ];
					yTrans = this.canvasObj.b[ 1 ];
					translated = true;
					gc.translate( xTrans, yTrans);
				}

				var lOldGlobalAlpha = secContext.globalAlpha;
				secContext.globalAlpha = 0;
				secContext.globalAlpha = lOldGlobalAlpha;
				pat = secContext.createPattern( img.nativeImage, "no-repeat" );
				secContext.fillStyle = pat;
				secContext.fillRect(0,0,imageWidth,imageHeight);
				pat = gc.createPattern( secCanvas, "no-repeat" );
				gc.fillStyle = pat;
			}
			ok = true;
		}		
	}
	else if ( canvasObject.bc ) 
		gc.fillStyle = canvasObject.bc;
	else if ( this.normalImage ) {
		hasImageOnTop = true;
		ok = false;
	}
	if ( ok )
		gc.fill();	
	if ( 1 != scaleX || 1 != scaleY )
		gc.scale( 1 / scaleX, 1 / scaleY );			
	if ( translated )
		gc.translate( -xTrans, -yTrans ); 
	return ok || hasImageOnTop;
}

cp.AutoShape.prototype.changeStateOnMouseEvents = function( eventType , eventObj )
{
	var baseStateItem = null ;
			
	if(this.baseStateItemID == -1)
	{
		baseStateItem = this;
	}
	else
	{
		if(this.cloneOfBaseStateItem)
		{
			baseStateItem = cp.getDisplayObjByCP_UID(this.baseStateItemID);
		}
	}

	if(baseStateItem && baseStateItem.HandleMouseEventOnStateItems !== undefined)
	{
		baseStateItem.HandleMouseEventOnStateItems(eventType,this.parentStateType,eventObj);
	}
}

cp.AutoShape.prototype.HandleMouseEventOnStateItems = function( eventType , itemParentState , eventObj )
{
	// Normal, RollOver, Down states of buttons have different rdButton items . When any of the mouse events like down,up,rollover,rollout happens on any such rdButton 
	// Normal State button's function will be called . This function changes state appropriately .
	
	if( this.parentStateType != cp.kSTTNormal )
		return;

	if ( this.parentData && undefined != this.parentData.enabled )
	{
		if ( ! this.parentData.enabled )
			return; // Don't act on disabled elements.
	}

	var currentStateType = cp.kSTTNone;
	var currentStateName = "";
	if( this.currentState >=0 && this.currentState < this.states.length)
	{
		var currentStateData  = this.states[this.currentState];
		if(currentStateData)
		{
			currentStateType = currentStateData.stt;
			currentStateName = currentStateData.stn;
		}
	}

	var bDevice = (cp.device == cp.IDEVICE  || cp.device == cp.ANDROID);
	var bCheckStateType = !bDevice || !(eventType == "mouseup");

	// relax the currentStateType check for touchend case as touchend is fired on the same element on which touchstart happens.
	if(bCheckStateType)
	{
		if(currentStateType != itemParentState)
			return;
	}

	var bCanChangeState  = false;
	var toStateName  = "";
	var bExecuteClick = false;

	if(eventType == "mouseover")
	{
		if( currentStateType == cp.kSTTNormal || currentStateType == cp.kSTTCustom || currentStateType == cp.kSTTVisited)
		{
			if(this.shouldShowRollOver)
			{
				bCanChangeState = true;
				toStateName = cp.getLocalisedStateName("kCPRolloverState");
				this.stateAtStartOfMouseEvents = currentStateName;
				cp.BringBaseItemToFrontWithinState(this,cp.getLocalisedStateName("kCPRolloverState"));
				
				if(cp.device === cp.DESKTOP)
				{
					var mouseOverMgr = cp.GetMouseOverManager();
					if(mouseOverMgr){
						var that = this;
						mouseOverMgr.addMouseOverItem(this,function(){that.ForceMouseOut();});
					}
				}
			}
		}
	}
	else if(eventType == "mouseout")
	{
		if( currentStateType == cp.kSTTRollOver || currentStateType == cp.kSTTDown )
		{
			bCanChangeState = true;
			toStateName = this.stateAtStartOfMouseEvents;

			if(cp.device === cp.DESKTOP)
			{
				var mouseOverMgr = cp.GetMouseOverManager();
				if(mouseOverMgr)
					mouseOverMgr.removeMouseOverItem(this);
			}
		}
		if( currentStateType == cp.kSTTNormal || currentStateType == cp.kSTTCustom || currentStateType == cp.kSTTVisited)
		{
			// Hack for Bug#4015304 . Chrome dispatches an extra mouseout event when State is changed from Normal To Down(on mousedown) and Down To Normal(onmouseup) 
			// Here we are ignoring that extra mouseout event.
			var bIgnoreThisEvent = (cp.browser == cp.CHROME && this.ignoreMouseOutEventOnNormal);
			if(!bIgnoreThisEvent)
			{
				this.shouldShowRollOver =  true;
			}
			else
				this.ignoreMouseOutEventOnNormal = false;
		}
	}
	else if(eventType == "mousedown")
	{
		if( currentStateType == cp.kSTTNormal || currentStateType == cp.kSTTRollOver || currentStateType == cp.kSTTCustom || currentStateType == cp.kSTTVisited)
		{
			bCanChangeState = true;
			toStateName = cp.getLocalisedStateName("kCPDownState");
			this.bShouldListenForMouseUpOnDownState = true;

			if(currentStateType == cp.kSTTNormal || currentStateType == cp.kSTTCustom || currentStateType == cp.kSTTVisited)
			{
				this.stateAtStartOfMouseEvents = currentStateName;
				this.ignoreMouseOutEventOnNormal  = true; //hack for Bug#4015304
			}
		}

		this.shrinkShapeButtonInAllStates();
	}
	else if(eventType == "mouseup")
	{
		if( !bCheckStateType || currentStateType == cp.kSTTDown )
		{
			if(currentStateType==cp.kSTTDown)
			{
				bCanChangeState = true;
				toStateName = this.stateAtStartOfMouseEvents;
			}
			this.shouldShowRollOver = false;
			if(this.bShouldListenForMouseUpOnDownState)
				bExecuteClick = true;
		}

		this.expandShapeButtonInAllStates();
	}

	if(bCanChangeState)
	{
		if(toStateName !== cp.getLocalisedStateName("kCPRolloverState"))
			cp.ResetItemZIndicesWithinState(this,cp.getLocalisedStateName("kCPRolloverState"));

		cp.changeState(this.actualParent.id,toStateName,false);
	}

	if(bExecuteClick)
	{
		if(!cp.IsGestureSupportedDevice() && !cp.disableInteractions)
		{
			var bRelaxBrowserCheck = (this.needsOwnHandler || cp.shouldRelaxBrowserCheck(this.parentData.type));
			// In this case , mouse hanlders are on item's actual parent not on stage because of which onclick is not called
			// even in Chrome and IE.
			if( bRelaxBrowserCheck || (cp.CHROME != cp.browser && cp.MSIE != cp.browser ) || cp.m_isLMSPreview)
			{
				var customData = {}; // customData to identify that click here is dispatched as part of state transitions
				customData["asPartOfStateChange"] = true;
				cp.dispatchClickEvent(this.actualParent,eventObj,customData);
			}
		}
	}
}
