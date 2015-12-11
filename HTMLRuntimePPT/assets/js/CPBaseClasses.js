(function(cp)
{
	cp.Canvas = function(element)
	{
		this.element = element;
		this.gc = element.getContext("2d");
	};	
	
    if(typeof(PPTXLib) == 'undefined' || PPTXLib == undefined)
	{
		//dummy PPTXLib in absence of PPTLibrary	
		cp.dummyPPTXLib = new Object();
		PPTXLib = cp.dummyPPTXLib;
		PPTXLib.PptxAnimatableDisplayItem = function(dummyElemId,dummyElemData)
		{
		}
		PPTXLib.PptxAnimatableDisplayItem.prototype.updateEffects = function(dummyHasEffects)
		{
		}
		PPTXLib.PptxAnimatableDisplayItem.prototype.updateFrameData = function()
		{
		}

		PPTXLib.initializeAnimationManagerForCPSlide = function(dummySlide) {};
		PPTXLib.hasAnimationInfo = function(){return false;};
		PPTXLib.updateNoSkipFramesFromEffectData = function(){};
		PPTXLib.updateAnimationManager = function(){};
		PPTXLib.initializePPTXLibrary = function(){};
		PPTXLib.processTriggerForObject = function(){};
	}
	
	cp.DisplayObject = function(el)
	{
		var lItemData = cp.D[el.id];
		if(lItemData)
		{
			this.isCpObject = true;
			lItemData.isCpObject = true;
		}
		cp.DisplayObject.baseConstructor.call(this, el.id, lItemData);
		this.element = el;
		this.hasEffect = this.getAttribute("JSONEffectData");
		if(cp.responsive) this.isStarted = false;

		if(lItemData)
		{
			var actualParentItemData = cp.D[this.getAttribute("dn")];
			if(actualParentItemData)
			{
				this.states = actualParentItemData["stl"];
				if(this.states !== undefined)
				{
					this.currentState = actualParentItemData["stis"];
					this.initialState = actualParentItemData["stis"];
					var bRetainState = (actualParentItemData.hasOwnProperty("retainState") && actualParentItemData["retainState"] === true);

					if(actualParentItemData.hasOwnProperty("temporaryInitialState") && actualParentItemData["temporaryInitialState"] != -1)
					{
						this.currentState = actualParentItemData["temporaryInitialState"];
						
						if(!bRetainState)
							actualParentItemData["temporaryInitialState"] = -1;
					}
					actualParentItemData["currentState"] = this.currentState;
					this.baseStateItemID = actualParentItemData["bstiid"];
					this.parentStateType = actualParentItemData["sipst"];
					this.cloneOfBaseStateItem = actualParentItemData["sicbs"];
					this.itemOrParentHasHoverState = actualParentItemData["sihhs"];
					this.itemOrParentHasDownState = actualParentItemData["sihds"];

					//Set visited state variable
					for (var i = 0; i < this.states.length ; i++)
					{
						var state = this.states[i];
						if(state && state.stt == cp.kSTTVisited)
						{
							this.visitedState = state.stn;
							break;
						}
					}
				}
				else 
				{
					this.currentState = -1;
					this.initialState = -1;
					this.baseStateItemID = -1;
					this.parentStateType = -1;
					this.cloneOfBaseStateItem = false;
					this.itemOrParentHasHoverState = false;
					this.itemOrParentHasDownState = false;
					this.states = [];
					actualParentItemData["currentState"] = -1;
				}
			}
		}
		cp.setInitialVisibility(this);
	}
	cp.inherits(cp.DisplayObject, PPTXLib.PptxAnimatableDisplayItem);

	cp.DisplayObject.prototype.updateInputFontStyle = function(iInputElem)
	{
		if(!iInputElem)
			return;

		this.ResponsiveFontProp = this.getAttribute("rpfont");
		this.font = this.ResponsiveFontProp[cp.ResponsiveProjWidth].font;
		
		if ( this.font ) 
		{
			iInputElem.style.fontFamily = this.font.n;
			iInputElem.style.fontSize = this.font.s + "px";
			iInputElem.style.color = this.font.c;
			
			if ( this.font.B )
				iInputElem.style.fontWeight = 'bold';
			else
				iInputElem.style.fontWeight = 'normal';
			if ( this.font.u )
				iInputElem.style.textDecoration = 'underline';
			else
				iInputElem.style.textDecoration = 'none';
			if ( this.font.i )
				iInputElem.style.fontStyle = 'italic';
			else
				iInputElem.style.fontStyle = 'normal';			
		}
	}

	cp.DisplayObject.prototype.subscribeToItemDrawingCompleteHandler = function(evt)
	{
		if(cp.responsive)
		{
			var that = this;
			var cssObj = cp.getResponsiveCSS(that.getAttribute("css"));
			if(cssObj && (cssObj.lhID && cssObj.lvID) && (cssObj.lhID != -1 || cssObj.lvID != -1))
			{
				//we never call remove event listener because we just empty the eventlisteners array 
				//for cp.ITEMDRAWINGCOMPLETEEVENT in every cp.adjustResponsiveItems function call.
				cp.em.addEventListener(function(evt)
				{
					that.linkedItemDrawingCompleteHandler(evt);	
				},cp.ITEMDRAWINGCOMPLETEEVENT);
			}
		}	
	}

	cp.DisplayObject.prototype.linkedItemDrawingCompleteHandler	= function(evt)
	{
		if(cp.responsive && this.drawForResponsive && this.isStarted)
		{
			var cssObj = cp.getResponsiveCSS(this.getAttribute("css"));
			if(!evt.cpData || !evt.cpData.uid)
				return;
			if(evt.cpData.uid != cssObj.lhID &&
				evt.cpData.uid != cssObj.lvID)
				return;
			if(cp.linksVerbose)
				cp.log("drawing " + this.element.id + ", for " + evt.cpData.uid);
			this.drawForResponsive(true,cp.ReasonForDrawing.kLinkedToItemAppeared);
			cp.updateVarText(this.actualParent.id,true,true);
		}
	}

	cp.DisplayObject.prototype.forEachChild = function(fn,params)
	{
		if (this.children)
		{
			var children = this.children;
			var childrenLength = children.length;
			
			for (var i=0; i<childrenLength; ++i)
				fn(children[i],params);
		}
	}
		
	cp.DisplayObject.prototype.updateFrame = function()
	{
		this.updateEffects(this.hasEffect);
		this.forEachChild(function(child) {
			if(cp.responsive && !child.isDrawn && child.drawIfNeeded)
				child.drawIfNeeded();
			else
				child.updateFrame();
		});
	}

	cp.DisplayObject.prototype.updateEffects = function(iHasEffect)
	{
		if(iHasEffect)
		{
			if(this && this.actualDrawingElement && this.actualDrawingElement.className && this.actualDrawingElement.className == "cp-WebObject")
			{
				var retData = cp.DisplayObject.superClass.updateFrameData.call(this);
				if(retData)
				{
					/*While animating a div with SVG, if svg object size is more, effects are choppy(even in a PC browser).
					  So before effect starts, replace SVG with a PNG.
					  After effect ends, replace PNG with SVG.*/
					if(retData[0] == true)
						this.replaceSVGWithPNG();
					else
						this.replacePNGGWithSVG();
				}
			}
		}

		cp.DisplayObject.superClass.updateEffects.call(this, iHasEffect);
		if(this.actualParent && (iHasEffect))
		{	
			//if(this.isDrawn)
			{
				var lItemData = cp.D[this.actualParent.id];
				var lItemFromFrame = lItemData.from;				
				if(lItemData.rp || lItemData.rpa)
				{	
					//currently avoiding the fix of effect flicker for rest of the project items for #3562505
					return;
					//lItemFromFrame = cp.movie.stage.currentSlideStartFrame;					
				}
				
				if(cpInfoCurrentFrame <= lItemFromFrame + 2)// && !(lItemData.hiddenFromFrame == cpInfoCurrentFrame) && !lItemData.hiddenFromFlicker)
				{
					if(cp.verbose)
						cp.log("hiding " + this.parentDivName);
					
					var lVisible = cp.isVisible(this);
					cp._hide( this.parentDivName );
					lItemData.hiddenFromFrame = cpInfoCurrentFrame;
					lItemData.hiddenFromFlicker = true;
					this.visible = lVisible;
				}
				else if(lItemData.hiddenFromFlicker)
				{
					if(this.visible)
					{
						if(cp.verbose)
							cp.log("showing " + this.parentDivName);
						cp._show( this.parentDivName );
						lItemData.hiddenFromFlicker = false;
					}
				}
			}
		}
	}
	
	cp.DisplayObject.prototype.isSizeNPositionUpdated = function(a,b)
	{
		if(!cp.responsive)
			return false;

		if(!a || !b)
		{
			if(cp.linksVerbose)
				cp.log("first time initialization. lastSizeNPosition = null");
			return true;
		}
		if(a.l != b.l)
		{
			if(cp.linksVerbose)
				cp.log(a.l + "!=" + b.l);
			return true;
		}
		if(a.t != b.t)
		{
			if(cp.linksVerbose)
				cp.log(a.t + "!=" + b.t);
			return true;
		}
		if(a.r != b.r)
		{
			if(cp.linksVerbose)
				cp.log(a.r + "!=" + b.r);
			return true;
		}
		if(a.b != b.b)
		{
			if(cp.linksVerbose)
				cp.log(a.b + "!=" + b.b);
			return true;
		}
		if(a.w != b.w)
		{
			if(cp.linksVerbose)
				cp.log(a.w + "!=" + b.w);
			return true;
		}
		if(a.h != b.h)
		{
			if(cp.linksVerbose)
				cp.log(a.h + "!=" + b.h);
			return true;
		}

		return false;
	}

	cp.DisplayObject.prototype.drawComplete = function(iReasonForDrawing)
	{		
		if(!this.isRegistered)
		{
			if(cp.verbose)
				cp.log("draw completed: " + this.element.id);
			var currInteraction = cp.movie.stage.getCurrentSlideInteractionManager();
			if(currInteraction!=null)
			{
				currInteraction.registerDisplayObject(this.element.id,iReasonForDrawing);
			}
		}

		if(cp.responsive)
		{
			//modify responsive accessible text
			{
				var lItemCanvasData = cp.D[this.element.id];
				if(lItemCanvasData)
				{
					var lItemData = cp.D[lItemCanvasData.dn];
					var lUseAccStr = true;
					
					if(lItemData && lItemData.type == cp.kCPOTStageMatchingAnswerEntry)
						lUseAccStr = false;
					
					if(lItemCanvasData && lUseAccStr)
					{
						if(lItemCanvasData)
						{
							var lAccStr = cp.getAccessibilityString(lItemCanvasData);
							if(lAccStr != undefined)
							{
								cp.modifyAlternativeAccessibleText(this.actualParent,lAccStr);
							}
						}
					}
				}
			}
			
			if(iReasonForDrawing == cp.ReasonForDrawing.kRegularDraw || 
				iReasonForDrawing == cp.ReasonForDrawing.kOrientationChangeOrResize)
			{
				if(cp.linksVerbose)
					cp.log("subscribeToItemDrawingCompleteHandler : " + this.element.id);
				this.subscribeToItemDrawingCompleteHandler();
			}

			var actualParentBoundingRect = this.actualParent.getBoundingClientRect();
			var SlideBoundingRect = cp("div_Slide").getBoundingClientRect();
			var currentSizeNPosition = {
				l:actualParentBoundingRect.left - SlideBoundingRect.left,
				t:actualParentBoundingRect.top - SlideBoundingRect.top,
				r:actualParentBoundingRect.right - SlideBoundingRect.right,
				b:actualParentBoundingRect.bottom - SlideBoundingRect.bottom,
				w:actualParentBoundingRect.width,
				h:actualParentBoundingRect.height
			};

			if((iReasonForDrawing == cp.ReasonForDrawing.kMoviePaused && !this.isStarted) ||
				iReasonForDrawing == cp.ReasonForDrawing.kRegularDraw ||
				iReasonForDrawing == cp.ReasonForDrawing.kOrientationChangeOrResize ||
				iReasonForDrawing == cp.ReasonForDrawing.kTextGrow ||
				iReasonForDrawing == cp.ReasonForDrawing.kLinkedToItemAppeared)
			{
				var evtArgs = {
					uid: this.getAttribute("uid")
				};
				this.isDrawnComplete = true;
				this.isStarted = true;
				if(this.isSizeNPositionUpdated(this.lastSizeNPosition,currentSizeNPosition))
				{
					if(cp.linksVerbose)
						cp.log("firing event for : " + this.actualParent.id);
					this.lastSizeNPosition = currentSizeNPosition;
					return cp.em.fireEvent("CPItemDrawingCompleteEvent",evtArgs);
				}	
			}
			this.lastSizeNPosition = currentSizeNPosition;
		}
	}

	cp.DisplayObject.prototype.setTransformOrigin = function(iCanvasObj)
	{
		if(!iCanvasObj)
			return;
		
		var lCanvasData = cp.D[iCanvasObj.id];
		var lItemData = cp.D[lCanvasData.dn];
		
		var lXTransformOrigin = 0;
		var lYTransformOrigin = 0;

		if(cp.responsive)
		{
			var breakPointID = cp.getCurrentBreakPointID();
			var xOrigStr = "xorig_" + breakPointID;
			var yOrigStr = "yorig_" + breakPointID;
			lXTransformOrigin = lItemData[xOrigStr];
			lYTransformOrigin = lItemData[yOrigStr];

			if(lItemData.gm)
			{
				var groupLeft=0, groupTop=0, groupBottom=0, groupRight=0;
				var groupMember0UID = lItemData.gm[0];
				var groupMember0 = cp.getDisplayObjByCP_UID(groupMember0UID);
				if(groupMember0)
				{
					if(!groupMember0.isStarted && !groupMember0.areDimensionsCalculated)
						cp.initializeDimensions(groupMember0, true);
					else if(groupMember0.isStarted && !groupMember0.areDimensionsCalculated)
						cp.initializeDimensions(groupMember0);
					
					var boundingRect = groupMember0.dimensions;
					groupLeft = boundingRect.left;
					groupTop = boundingRect.top;
					groupBottom = boundingRect.bottom;
					groupRight = boundingRect.right;

				}
				for (var item = 1; item < lItemData.gm.length; ++item)
				{
					var objUID = lItemData.gm[item];
					var obj = cp.getDisplayObjByCP_UID(objUID);
					if(obj)
					{
						if(!obj.isStarted && !obj.areDimensionsCalculated)
							cp.initializeDimensions(obj, true);
						else if(obj.isStarted && !obj.areDimensionsCalculated)
							cp.initializeDimensions(obj);

						var boundingRect = obj.dimensions;
						tempLeft = boundingRect.left;
						tempTop = boundingRect.top;
						tempBottom = boundingRect.bottom;
						tempRight = boundingRect.right;

						if(tempLeft < groupLeft)
							groupLeft = tempLeft;
						if(tempTop < groupTop)
							groupTop = tempTop;
						if(tempBottom > groupBottom)
							groupBottom = tempBottom;
						if(tempRight > groupRight)
							groupRight = tempRight;
					}
				}
				var groupCenterX = (groupLeft+groupRight)/2;
				var groupCenterY = (groupTop+groupBottom)/2;
				var currObjStr = lCanvasData.dn + "c";
				var currObj = cp.getDisplayObjByKey(currObjStr);
				var currObjBounds = currObj.dimensions;		
				var itemX = currObjBounds.left;
				var itemY = currObjBounds.top;
				var itemWidth = currObjBounds.right - currObjBounds.left;
				var itemHeight = currObjBounds.bottom - currObjBounds.top;

				lXTransformOrigin = (groupCenterX-itemX)/itemWidth;
				lYTransformOrigin = (groupCenterY-itemY)/itemHeight;
			}
		}
		else
		{
			lXTransformOrigin = lItemData.xorig;
			lYTransformOrigin = lItemData.yorig;
			if(lItemData.gm)
			{
				var groupLeft=0, groupTop=0, groupBottom=0, groupRight=0;
				var groupMember0UID = lItemData.gm[0];
				var groupMember0 = cp.getDisplayObjByCP_UID(groupMember0UID);
				if(groupMember0)
				{
					var vb = cp.D[groupMember0.mUniqueName].vb;
					groupLeft = vb[0];
					groupTop = vb[1];
					groupRight = vb[2];
					groupBottom = vb[3];
				}
				for (var item = 1; item < lItemData.gm.length; ++item)
				{
					var objUID = lItemData.gm[item];
					var obj = cp.getDisplayObjByCP_UID(objUID);
					if(obj)
					{
						var vb = cp.D[obj.mUniqueName].vb;
						if(vb[0]<groupLeft)
							groupLeft = vb[0];
						if(vb[1]<groupTop)
							groupTop = vb[1];
						if(vb[2]>groupRight)
							groupRight = vb[2];
						if(vb[3]>groupBottom)
							groupBottom = vb[3];
					}
				}
				var groupCenterX = (groupLeft+groupRight)/2;
				var groupCenterY = (groupTop+groupBottom)/2;

				var itemX = lCanvasData.vb[0];
				var itemY = lCanvasData.vb[1];
				var itemWidth = lCanvasData.vb[2]-lCanvasData.vb[0];
				var itemHeight = lCanvasData.vb[3]-lCanvasData.vb[1];

				lXTransformOrigin = (groupCenterX-itemX)/itemWidth;
				lYTransformOrigin = (groupCenterY-itemY)/itemHeight;
			}
		}
		
		var lLeftOrig = "0px";
		var lTopOrig = "0px";
		if(this.actualParent)
		{			
			lLeftOrig = lXTransformOrigin*100 + "%";
			lTopOrig = lYTransformOrigin*100 + "%";
		}
		var iStr = lLeftOrig + " " + lTopOrig;
		if(iCanvasObj != undefined)
		{
			iCanvasObj.parentElement.style['-ms-transform-origin']= iStr;
			iCanvasObj.parentElement.style['-moz-transform-origin']= iStr;
			iCanvasObj.parentElement.style['-webkit-transform-origin']= iStr;
			iCanvasObj.parentElement.style['-o-transform-origin']= iStr;
			iCanvasObj.parentElement.style['transform-origin']= iStr;
		}
	}
	
		cp.DisplayObject.prototype.start = function(iForce,iReasonForDrawing)
	{
		if(!this.effectIsStarted || iForce)
		{
			this.areDimensionsCalculated = false;
			this.updateEffects();
			this.effectIsStarted = true;
		}
		this.forEachChild(function(child) {
			child.start(iForce,iReasonForDrawing);
			if(cp.responsive) child.isStarted = true;
		});
	}
	
	cp.DisplayObject.prototype.reset = function(endOfSlide)
	{
		this.isRegistered = false;
		this.forEachChild(function(child) {
			child.reset(endOfSlide);
			if(cp.responsive)
			{
				child.currentCSS = undefined;
				child.isStarted = false;
			}
		});
		this.effectIsStarted = false;	
	}
	
	cp.DisplayObject.prototype.onEndOfMovie = function()
	{
		this.forEachChild(function(child) {
			child.onEndOfMovie();
		});
	}
	
	cp.DisplayObject.prototype.getAttribute = function(name)
	{
		var x = cp.D[this.element.id];
		if (!x) 
			return null;
		return x[name];
	}
	
	cp.DisplayObject.prototype.setAttribute = function(name, value)
	{
		var x = cp.D[this.element.id];
		if (x) 
			x[name] = value;
	}
	
	cp.DisplayObject.prototype.restOfProjectDoOnNewSlide = function()
	{
	}
	
	cp.DisplayObject.prototype.deleteFromRopMap = function(el)
	{
		delete cp.ropMap[el.id];
	}

	cp.DisplayObject.prototype.ForceMouseOut = function()
	{
		if(cp.DESKTOP !== cp.device)
			return;

		var currentStateType = cp.kSTTNone;
		if( this.currentState >=0 && this.currentState < this.states.length)
		{
			var currentStateData  = this.states[this.currentState];
			if(currentStateData)
			{
				currentStateType = currentStateData.stt;
			}
		}

		if(this.HandleMouseEventOnStateItems)
			this.HandleMouseEventOnStateItems("mouseout",currentStateType,undefined);
	}
	
	// SHAPE CLASS for DRAWING
	cp.Shape = function(el, args)
	{
		var self = this;
		this.mouseState = cp.mouseStateOut;
		
		function doOnMouseOver(eventObj)
		{
			self.visible = self.getAttribute("visible");
			self.isDrawn = false;
			if(cp.responsive)
				self.currentCSS = undefined;
			if(self.supportsStates == false)
			{
				if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
				{
					if(self.downImage)
						self.currImage = self.downImage;
				}
				else
				{
					if(self.hoverImage)
						self.currImage = self.hoverImage;
				}
			}
			else 
			{
				if(self.changeStateOnMouseEvents)
				{
					if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID)
						self.changeStateOnMouseEvents("mousedown",eventObj);
					else
						self.changeStateOnMouseEvents("mouseover",eventObj);
				}
			}
			
			// Hack.
			var oldTransIn = self.transIn;
			var oldModParent = self.modifyParent;
			self.modifyParent = false || cp.responsive;
			self.transIn = null;
			self.drawIfNeeded();
			self.transIn = oldTransIn; 
			self.modifyParent = oldModParent;
		}
		
		function doOnMouseOut(eventObj)
		{
			self.visible = self.getAttribute("visible");
			self.isDrawn = false;
			if(cp.responsive)
				self.currentCSS = undefined;
			if(self.supportsStates == false)
				self.currImage = self.normalImage;
			else
			{
				if(self.changeStateOnMouseEvents)
				{
					if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID)
						self.changeStateOnMouseEvents("mouseup",eventObj);
					else
						self.changeStateOnMouseEvents("mouseout",eventObj);
				}
			} 

			// Hack.
			var oldTransIn = self.transIn;
			var oldModParent = self.modifyParent;
			self.modifyParent = false || cp.responsive;
			self.transIn = null;
			self.drawIfNeeded();
			self.transIn = oldTransIn; 
			self.modifyParent = oldModParent;
		}
			
		function doOnMouseDown(eventObj)
		{
			self.isDrawn = false;
			if(cp.responsive)
				self.currentCSS = undefined;
			if(self.supportsStates == false)
			{
				if(self.downImage)
					self.currImage = self.downImage;
			}
			else
			{
				if(self.changeStateOnMouseEvents)
					self.changeStateOnMouseEvents("mousedown",eventObj);
			}

			// Hack.
			var oldTransIn = self.transIn;
			var oldModParent = self.modifyParent;
			self.modifyParent = false || cp.responsive;
			self.transIn = null;
			self.drawIfNeeded();
			self.transIn = oldTransIn; 
			self.modifyParent = oldModParent;
		}

		function doOnMouseUp(eventObj)
		{
			self.isDrawn = false;
			if(cp.responsive)
				self.currentCSS = undefined;
			if(self.supportsStates == false)
			{
				if ( self.hoverImage && cp.device != cp.IDEVICE && cp.device != cp.ANDROID)
					self.currImage = self.hoverImage;
				else
					self.currImage = self.normalImage;
			}
			else
			{
				if(self.changeStateOnMouseEvents)
					self.changeStateOnMouseEvents("mouseup",eventObj);
			}

			// Hack.
			var oldTransIn = self.transIn;
			var oldModParent = self.modifyParent;
			self.modifyParent = false || cp.responsive;
			self.transIn = null;
			self.drawIfNeeded();
			self.transIn = oldTransIn; 
			self.modifyParent = oldModParent;
		}
		
		function getMouseHandler( state, handler, check, old_handler )
		{
			var s = state;
			var c = check;
			var old = old_handler;
			return function(event) {
				if(cp.disableInteractions)
					return;
				if ( self.parentData && undefined != self.parentData.enabled ) {
					if ( ! self.parentData.enabled )
						return; // Don't act on disabled elements.
				}
				if ( old )
					old();
				if ( c && self.mouseState == s )
					return;
				self.mouseState = s;
				handler(event);
			}
		}

		cp.Shape.baseConstructor.call(this, el);
			
		var shapeRenderer = this.getAttribute("sr");
		if (shapeRenderer)
			this.shape = shapeRenderer;
		
		if(cp.responsive)
			this.responsiveCSS = this.getAttribute("css");

		var bounds = this.getAttribute("b");
		this.bounds = {
				minX: bounds[0],
				minY: bounds[1],			
				maxX: bounds[2],
				maxY: bounds[3]
			};
		var vbounds = this.getAttribute("vb");
		this.vbounds = null;
		if(vbounds)
		{
			this.vbounds = {
				minX: vbounds[0],
				minY: vbounds[1],			
				maxX: vbounds[2],
				maxY: vbounds[3]
			};
		}
		else
			this.vbounds = this.bounds ;
		this.args = args;		
		this.isDrawn = false;
		this.canvas = null;
		this.visible = this.getAttribute("visible");
		if(this.getAttribute("dns"))
			this.divName = this.getAttribute("dns");			
		else
			this.divName = this.getAttribute("dn");
		if(this.getAttribute("tex"))
			this.tex = this.getAttribute("tex");
		else
			this.tex = 0;
		if(this.getAttribute("tey"))
			this.tey = this.getAttribute("tey");
		else
			this.tey = 0;
		this.parentData = cp.D[this.divName];
		this.isParentOfTypeSlide = ( undefined == this.parentData.type );
		this.modifyParent = ! this.isParentOfTypeSlide;
		this.transIn = 	this.parentData['trin'];
		this.normalImage = this.getAttribute( "ip" );
		if(cp.responsive && !this.normalImage && this.parentData.subt && this.parentData.subt == cp.kImageButton)
		{
			this.normalImage = this.getAttribute( "uImg" );	
		}
		
		if(!this.normalImage)
		{
			if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
				this.normalImage = this.getAttribute("aip");
		}
		this.currImage = this.normalImage;
		this.isMouse = false;
		if(this.parentData['mp'])
			this.isMouse = true;
		var hoverImg = this.getAttribute( "hImg" );
		var downImg = this.getAttribute( "pImg" );

		var mouseHandlersRequired = cp.doesSupportStates(this.parentData.type) ;
		// if item has RollOver or Down states , we need not listen to mouse events when playing in devices.
		// This is because when gestures are off , both mouseover and touchstart events are fired which causes issue mentioned in Bug#3939690
		var bShouldRegisterForMouseEvents = true;
		if(cp.device == cp.IDEVICE  || cp.device == cp.ANDROID)
		{
			if(this.itemOrParentHasHoverState || this.itemOrParentHasDownState)
				bShouldRegisterForMouseEvents = false;
		}

		// Hack to fix Bug#3940601 . The issue is that Image button in down state also publishes 3 images (up,down,hover) 
		// and when Image button(in down state) is shown as part of state change, its up image is the currentImage.
		// Changing the normal image and hover image to down image 
		// Proper fix will be to publish only the respective images for ImageButtons in States and use them.
		if(cp.kSTTDown == this.parentStateType)
		{
			if( cp.kCPOTScorableButtonItem == this.parentData.type && cp.kImageButton == this.parentData.subt )
			{
				if(downImg)
				{
					this.normalImage = downImg;
					this.currImage = this.normalImage;
					if(hoverImg)
						hoverImg = downImg;
				}
			}
		}

		var actualParent = document.getElementById(this.divName);

		if(actualParent)
		{
			actualParent.drawingBoard = this.element.parentElement;
			actualParent.bounds = this.bounds;
			actualParent.drawingBoard.bounds = this.vbounds;
		}			
		this.actualParent = actualParent;
		if ( hoverImg || mouseHandlersRequired ) {
			if(hoverImg)
				this.hoverImage = hoverImg;
			if(actualParent)
			{
				if(bShouldRegisterForMouseEvents)
				{
					actualParent.onmouseover = getMouseHandler( cp.mouseStateOver, doOnMouseOver, false, actualParent.onmouseover );
					actualParent.onmouseout = getMouseHandler( cp.mouseStateOut, doOnMouseOut, false, actualParent.onmouseout );
				}
				if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID) 
					actualParent.ontouchstart = getMouseHandler( cp.mouseStateTouchStart, doOnMouseOver );
				if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID) 
					actualParent.ontouchend = getMouseHandler( cp.mouseStateTouchEnd, doOnMouseOut );
				if ( downImg || mouseHandlersRequired) {
					if(downImg)
						this.downImage = downImg;

					if(bShouldRegisterForMouseEvents)
					{
						actualParent.onmousedown = getMouseHandler( cp.mouseStateDown, doOnMouseDown );
						actualParent.onmouseup = getMouseHandler( cp.mouseStateUp, doOnMouseUp );
						if ( cp.device == cp.IDEVICE  || cp.device == cp.ANDROID) 
							actualParent.ontouchmove = getMouseHandler( cp.mouseStateTouchMove, doOnMouseDown, true );
					}
				}
			}
		}
		this.shouldShowRollOver = true;
		this.tr = this.getAttribute("tr");
		this.sh = this.getAttribute("sh");
		this.re = this.getAttribute("re");

		if(this.cloneOfBaseStateItem==false && this.baseStateItemID!=-1)    
		{
			//playing effects on additional objects for the first time
			this.playEffectsOnStart = true;
		}

		this.supportsStates = cp.doesSupportStates(this.parentData.type) ;
		cp.setInitialVisibility(this);
	}
	
	cp.inherits(cp.Shape, cp.DisplayObject);
	
	cp.Shape.prototype.start = function(iForce,iReasonForDrawing)
	{
		this.drawIfNeeded(iForce,iReasonForDrawing);
		if(!this.effectIsStarted || iForce)
		{
			this.areDimensionsCalculated = false;
			this.updateEffects(this.hasEffect);
			this.effectIsStarted = true;
		}
	}
	
	cp.Shape.prototype.reset = function(endOfSlide)
	{
		delete cp.ropMap[this.element.id];
		// release memory
		this.canvas = null;
		this.isDrawn = false;
		
		var setDisplayNone = true;
		if(this.parentData && this.parentData.st)//very weak link to identify a slide!!!
			setDisplayNone = false;
		
		if(setDisplayNone)
		{
			this.element.width = "0";
			this.element.height = "0";
			this.element.style.width = "0px";
			this.element.style.height = "0px";
			this.element.left = "0";
			this.element.top = "0";
			this.element.style.left = "0px";
			this.element.style.top = "0px";
		}
		this.effectIsStarted = false;
	}
	
	cp.Shape.prototype.drawIfNeeded = function(iResponsiveForce,iReasonForDrawing)
	{
		if(cp.responsive)
		{
			if(this.drawForResponsive(iResponsiveForce,iReasonForDrawing))
				return;
		}

		if (this.isDrawn)
			return;
	
		var itemName = this.getAttribute('dn');
		var itemData = cp.D[itemName];
		this.parentDivName = itemName;
		var bounds = this.bounds;
		var canvasWidth = - bounds.minX + bounds.maxX;
		var canvasHeight = - bounds.minY + bounds.maxY;
		if(canvasWidth == 0 || canvasHeight == 0)
		{
			this.isDrawn = true;
			this.drawComplete();
			return;
		}
		if(this.args)
		{
			canvasWidth += Number(this.args[1])+Number(this.args[2]);
			canvasHeight += Number(this.args[1])+Number(this.args[3]);
		}
		
		var lType = itemData['type'];
		var canvas;
		if(lType == cp.kCPOTClickBoxItem)
			canvas = this.canvas = cp.createCanvas(bounds.minX, bounds.minY, 0, 0, this.element);
		else
			canvas = this.canvas = cp.createCanvas(bounds.minX, bounds.minY, Math.ceil(canvasWidth), Math.ceil(canvasHeight), this.element);
		var gc = canvas.gc;
		
		this.element.style.left = bounds.minX + "px";
		this.element.style.top = bounds.minY + "px";
		this.element.style.width = bounds.maxX - bounds.minX + "px";
		this.element.style.height = bounds.maxY - bounds.minY + "px";
		
		var lHasShadowOrReflection = false;
		lHasShadowOrReflection = this.re || (this.sh && !this.sh.i);
		
		var lHasTransform = this.tr != undefined;
		
		var imagePath = this.currImage;
		var modifyParent = this.modifyParent && ! this.isParentOfTypeSlide;
		
		gc.save();
		if(!this.isMouse)
		{
			var styleLeft = bounds.minX ;
			var styleTop = bounds.minY;
			var styleWidth = bounds.maxX - bounds.minX;
			var styleHeight = bounds.maxY - bounds.minY;
			var actualParent = this.actualParent;
			if(actualParent)
			{
				if ( modifyParent ) {
					actualParent.style.left = styleLeft + "px";
					actualParent.style.top = styleTop + "px";
					actualParent.style.width = styleWidth + "px";
					actualParent.style.height = styleHeight + "px";
				}
				var rotateAngle = 0;
				
				if(this.tr)
				{
					if ( modifyParent ) {
					cp.applyTransform( actualParent,this.tr);					
						actualParent.tr = this.tr;
					}
					rotateAngle =cp.getAngleFromRotateStr(this.tr);
				}
				this.element.style.display = "block";
				this.element.style.position = "absolute";
				if ( modifyParent ) { 
					actualParent.rotateAngle = rotateAngle;
					cp.movie.stage.addToParentChildMap(actualParent.id,this.element.id);
					this.element.parentElement.style.left = this.vbounds.minX + "px";
					this.element.parentElement.style.top = this.vbounds.minY + "px";
					this.element.parentElement.style.width = (this.vbounds.maxX - this.vbounds.minX) + "px";
					this.element.parentElement.style.height = (this.vbounds.maxY - this.vbounds.minY) + "px";
					if(this.re)
						this.element.parentElement.style.webkitBoxReflect = "below " + this.re.d + "px" + " -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(" + (1 - this.re.s/100) +", transparent), to(rgba(255, 255, 255, "+ (1-this.re.p/100) +")))";				
				}
			}
			this.init = true;
			this.element.originalParent = actualParent;
			styleLeft 	= (0 < this.vbounds.minX) && lHasShadowOrReflection ? 0 : this.vbounds.minX;
			styleTop	= (0 < this.vbounds.minY) && lHasShadowOrReflection ? 0 : this.vbounds.minY;
			var styleRight 	= lHasShadowOrReflection && (cp.D.project.w > this.vbounds.maxX) ? cp.D.project.w : this.vbounds.maxX;
			var styleBottom	= lHasShadowOrReflection && (cp.D.project.h > this.vbounds.maxY) ? cp.D.project.h : this.vbounds.maxY;
			styleWidth	= styleRight - styleLeft;
			styleHeight	= styleBottom - styleTop;
			if(lType == cp.kCPOTClickBoxItem)
				canvas = this.canvas = cp.createCanvas(0, 0, 0, 0, this.element);
			else
			{
				var lCanvasLeft = (itemData.st != undefined) ? styleLeft : 0;
				var lCanvasTop = (itemData.st != undefined) ? styleTop : 0;
				canvas = this.canvas = cp.createCanvas(lCanvasLeft, lCanvasTop, styleWidth, styleHeight,this.element);
			}
			this.element.style.display = "block";
			this.element.style.position = "absolute";
			if ( ! this.isParentOfTypeSlide ) {
				this.element.style.marginLeft = (styleLeft-this.vbounds.minX) + "px";
				this.element.style.marginTop = (styleTop-this.vbounds.minY) + "px";
			}
			if(this.sh && !this.sh.i)
			{
				gc.shadowOffsetX = this.sh.d*Math.cos((Math.PI*this.sh.a)/180);
				gc.shadowOffsetY = this.sh.d*Math.sin((Math.PI*this.sh.a)/180);
				gc.shadowBlur = this.sh.b;
				gc.shadowColor = cp.ConvertRGBToRGBA(this.sh.c,this.sh.o );	
			}
			var rotateAngle = 0;
			if(this.tr)
				rotateAngle =cp.getAngleFromRotateStr(this.tr);
			
			var transX = 0;
			var transY = 0;
			if(lHasShadowOrReflection)
			{
				transX = (styleLeft < 0) ? -styleLeft : 0;
				transY = (styleTop < 0) ? -styleTop : 0;
				gc.setTransform(1,0,0,1,transX,transY);
				gc.translate((bounds.minX + bounds.maxX)/2,(bounds.minY + bounds.maxY)/2);
			}			
			else if(lHasTransform)
			{
				gc.translate(styleWidth/2,styleHeight/2);
			}
			gc.rotate((Math.PI*rotateAngle)/180);						
			gc.tex = this.tex;
			gc.tey = this.tey;
			gc.centreImage = true;
			gc.width = styleWidth;
			gc.height = styleHeight;
			
		}
		if (this.shape)
		{
			try {
				var objectToBeHidden = this.getAttribute("objectToBeHidden");
				var lDrawnOnCanvas = this.shape(gc,imagePath,objectToBeHidden,cp.isVisible(this),this.divName,lHasShadowOrReflection,lHasTransform);
				if (lDrawnOnCanvas || (lType == cp.kCPOTClickBoxItem))
				{
					this.isDrawn = true;
					this.drawComplete();
				}	
			}
			catch(e)
			{
				//console.error(e);
			}
		}
		gc.restore();
		
		cp.handleQuizzingItemsInReviewMode(this.element,itemData,this.divName);
		
		gc = null;
		canvas = null;
		if(this.transIn)
			this.element.parentElement.style.opacity = 0;

		if(!cp.isVisible(this))
			cp._hide( this.divName );

		if(cp.isVisible(this) && this.playEffectsOnStart)
		{
			var itemName = this.parentDivName;
			var script = cp.D[itemName]["selfAnimationScript"];
			if(script)
				eval(script);
			this.playEffectsOnStart = false;
		}
	}
	
	cp.Shape.prototype.drawForResponsive = function(iForce,iReason)
	{
		if(!this.responsiveCSS) return false;
		if(this.isDrawn && !iForce) return true;
		var lCurrentCSS = cp.getResponsiveCSS(this.responsiveCSS);
		
		var lHasShadowOrReflection = false;
		lHasShadowOrReflection = (this.sh && !this.sh.i);
		
		var lHasTransform = this.tr != undefined;

		if(this.isDrawn && this.currentCSS == lCurrentCSS && (!iForce || iReason == cp.ReasonForDrawing.kMoviePaused))
			return true;

		var lUseLinks = true;
		this.currentCSS = lCurrentCSS;
		
		var itemName = this.getAttribute('dn');
		var itemData = cp.D[itemName];
		this.parentDivName = itemName;
		var lAnswerAreaName = this.getAttribute("aan");

		var lResponsiveStyleObj = lCurrentCSS;
		
		var modifyParent = this.modifyParent && ! this.isParentOfTypeSlide;

		var rotateAngle = 0;
		var lUseModifiedActualParentProperties = false;

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

		this.parentElementClientBoundingRect = this.element.parentElement.getBoundingClientRect();
		var lSlideContainerDivRect = cp.movie.stage.mainSlideDiv.getBoundingClientRect();		
		
		if(!this.isMouse)
		{
			if(modifyParent)
			{
				cp.applyResponsiveStyles(this.actualParent, lCurrentCSS, lUseLinks);
				{
					//"dns" property comes for the quizzing answer text items which are dynamically added to the DOM. 
					//Somehow the actual parent div names are not correct. Hence avoiding the below operation for the answer text divs.
					if(itemData.rpvt && itemData.autoGrow && 
						(iReason == cp.ReasonForDrawing.kTextGrow ||
							iReason == cp.ReasonForDrawing.kMoviePaused))
					{
						var iItemHeight = itemData.minItemHeight;
						var lMinItemBoundingRectHeight = iItemHeight;
						if(lMinItemBoundingRectHeight && this.actualParent.clientHeight < lMinItemBoundingRectHeight)
						{
							lUseModifiedActualParentProperties = true;
							this.actualParent.style.height = lMinItemBoundingRectHeight + "px";							
						}	
						lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, 
																			lCurrentCSS.p, 
																			lCurrentCSS.l, 
																			lCurrentCSS.t, 
																			lCurrentCSS.r, 
																			lCurrentCSS.b, 
																			this.actualParent.clientWidth + "px", 
																			this.actualParent.clientHeight + "px", 
																			lCurrentCSS.crop);
					}					
				}
				if(cp.adjustPositionWithAnswerArea && 
					(itemData.type == cp.kCPOTStageAnswerLabel ||
						itemData.type == cp.kCPOTStageAnswerItem ||
						itemData.type == cp.kCPOTFillBlankCaption ||
						itemData.type == cp.kCPOTStageMatchingAnswerEntry))
					cp.adjustPositionWithAnswerArea(lCurrentCSS,this.actualParent,lAnswerAreaName);
				this.actualParent.offsetHeight = this.actualParent.offsetHeight;
				this.actualParentClientBoundingRect = this.actualParent.getBoundingClientRect();

				if ( this.tr )
				{
					rotateAngle =cp.getAngleFromRotateStr( this.tr );
					if(!this.m_centrePoint || iReason == cp.ReasonForDrawing.kOrientationChangeOrResize || iReason == cp.ReasonForDrawing.kLinkedToItemAppeared)
						this.m_centrePoint = cp.getCenterForRotation(this.actualParent);
					//var lRotatedBounds = cp.getBoundsForRotatedItem(this.actualParent.clientWidth, this.actualParent.clientHeight,this.m_centrePoint,rotateAngle, this.strokeWidth);
					var lRotatedBounds = cp.getBoundsForRotatedItem1(this.actualParentClientBoundingRect.left - lSlideContainerDivRect.left,
														this.actualParentClientBoundingRect.top - lSlideContainerDivRect.top,
														this.actualParentClientBoundingRect.width, 
														this.actualParentClientBoundingRect.height,
														this.m_centrePoint,
														rotateAngle, 
														this.strokeWidth);
					var l = t = r = b = undefined;
					if(lCurrentCSS.l != "auto")
						l = lRotatedBounds.l;
					if(lCurrentCSS.t != "auto")
						t = lRotatedBounds.t;
					if(lCurrentCSS.r != "auto")
						r = lRotatedBounds.r;
					if(lCurrentCSS.b != "auto")
						b = lRotatedBounds.b;
					lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, 
																		lCurrentCSS.p, 
																		l,t,r,b, 
																		lRotatedBounds.w, 
																		lRotatedBounds.h, 
																		lCurrentCSS.crop);
					lUseLinks = false;
					//cp.logObject(lRotatedBounds, this.element.id + " bounds");
				}
			}			
			if(!this.isParentOfTypeSlide)
				cp.applyResponsiveStyles(this.element.parentElement, lResponsiveStyleObj, lUseLinks);
		}		

		var transformL = 0;
		var transformT = 0;
		if(this.m_centrePoint)
		{
			transformL = (this.m_centrePoint.X - (this.actualParentClientBoundingRect.left - lSlideContainerDivRect.left));
			transformT = (this.m_centrePoint.Y - (this.actualParentClientBoundingRect.top - lSlideContainerDivRect.top));
		}

		if(itemData.rpvt)
		{
			var lCaptionOffsets = itemData.offsets;
			if(!lCaptionOffsets)
				lCaptionOffsets = [0,0,0,0];
			
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

			lTextHolderDiv1.style.left = lCaptionOffsets[0] + "px";
			lTextHolderDiv1.style.top = lCaptionOffsets[1] + "px";
			lTextHolderDiv1.style.width = this.actualParent.clientWidth-(lCaptionOffsets[0] + lCaptionOffsets[2]) + "px";
			lTextHolderDiv1.style.height = this.actualParent.clientHeight-(lCaptionOffsets[1] + lCaptionOffsets[3]) + "px";	

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
				this.element.parentElement.appendChild(lTextHolderDiv);
			} 
			cp.applyTransform(lTextHolderDiv,"rotate(0)")
			lTextHolderDiv.style.left = lCaptionOffsets[0] + "px";
			lTextHolderDiv.style.top = lCaptionOffsets[1] + "px";
			lTextHolderDiv.style.width = this.actualParent.clientWidth-(lCaptionOffsets[0] + lCaptionOffsets[2]) + "px";
			lTextHolderDiv.style.height = this.actualParent.clientHeight-(lCaptionOffsets[1] + lCaptionOffsets[3]) + "px";	
			
			if(iReason == cp.ReasonForDrawing.kOrientationChangeOrResize)
				cp.updateVarText(this.actualParent,true,true);

			if(this.tr)
			{				
				lTextHolderDiv.style.left = (this.element.parentElement.clientWidth - lTextHolderDiv.clientWidth)/2 + "px";
				lTextHolderDiv.style.top = (this.element.parentElement.clientHeight - lTextHolderDiv.clientHeight)/2 + "px";
				var iStr = "center center";
				
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

		if(cp.adjustPositionWithAnswerArea && 
			(itemData.type == cp.kCPOTStageAnswerLabel ||
				itemData.type == cp.kCPOTStageAnswerItem ||
				itemData.type == cp.kCPOTFillBlankCaption ||
				itemData.type == cp.kCPOTStageMatchingAnswerEntry))
			cp.adjustPositionWithAnswerArea(lCurrentCSS,this.element.parentElement,lAnswerAreaName);
		
		this.parentElementClientBoundingRect = this.element.parentElement.getBoundingClientRect();

		var lType = itemData['type'];
		var canvas;

		var canvasW = 0, canvasH = 0;

		var lL = this.parentElementClientBoundingRect.left - lSlideContainerDivRect.left;
		var lT = this.parentElementClientBoundingRect.top - lSlideContainerDivRect.top;

		if(lType == cp.kCPOTClickBoxItem)
			lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, undefined, "0px", "0px", "0px", "0px", "0px", "0px", undefined);
		else
		{
			if(lHasShadowOrReflection)
			{
				canvasW = cp("div_Slide").clientWidth;
				canvasH = cp("div_Slide").clientHeight;
				lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, undefined, "0px", "0px", "0px", "0px", canvasW + "px", canvasH + "px", undefined);
			}	
			else
			{
				if(this.isMouse)
				{
					canvasW = this.bounds.maxX - this.bounds.minX;
					canvasH = this.bounds.maxY - this.bounds.minY;

					itemData.clientWidth = canvasW;
					itemData.clientHeight = canvasH;

					var lMouseStartLeft = "0px";
					var lMouseStartTop = "0px";

					var lMousePathData = itemData.mpa;
					if(lMousePathData)
					{
						var lIsSlideCropOn = cp.movie.stage.isSlideBGCropped();
						
						var lProjWidthToUse = lIsSlideCropOn ? cp.RespDefaultBptW : cp.project.clientWidth;
						var lMousePathBounds = lMousePathData.b[cp.ResponsiveProjWidth];
						if(!lIsSlideCropOn)
							lMouseStartLeft = cp.getRoundedValue(lProjWidthToUse * lMousePathBounds[0]/cp.ResponsiveProjWidth);
						else
							lMouseStartLeft = lMousePathBounds[0];
						lMouseStartLeft += "px";
						lMouseStartTop = cp.getRoundedValue(lMousePathBounds[1]) + "px";
					}
					
					lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, undefined, lMouseStartLeft, lMouseStartTop, "0px", "0px", canvasW + "px", canvasH + "px", undefined);
				}
				else
				{
					canvasW = this.element.parentElement.clientWidth;
					canvasH = this.element.parentElement.clientHeight;
					lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, undefined, "0px", "0px", "0px", "0px", "100%", "100%", undefined);
				}				
			}	
		}

		if(!this.isParentOfTypeSlide)
			this.canvas = cp.createResponsiveCanvas(lResponsiveStyleObj, canvasW, canvasH, this.element);
		else
		{
			if(cp.movie.stage.isSlideBGCropped())
			{
				var cropRect = lCurrentCSS["crop"];
				this.canvas = cp.createCanvas(0,0,
											cp("div_Slide").clientWidth,
											cp("div_Slide").clientHeight,this.element);
			}
			else
			{
				this.canvas = cp.createCanvas((cp("project").clientWidth - this.element.clientWidth)/2, 
											(cp("project").clientHeight - this.element.clientHeight)/2,
											this.element.clientWidth,
											this.element.clientHeight,this.element);
			}
		}	

		var canvas = this.canvas;		
		var gc = canvas.gc;
		if(lCurrentCSS["crop"])
		{
			gc.crop = lCurrentCSS["crop"];
		}
		else
		{
			gc.crop = undefined;	
		}

		if(!this.isParentOfTypeSlide)
		{
			if(lHasShadowOrReflection)
			{			
				this.element.style.marginLeft = (lL < 0 ? 1 : -1)*lL + "px";
				this.element.style.marginTop = (lT < 0 ? 1 : -1)*lT + "px";
			}
		}
		
		var imagePath = this.currImage;
		
		gc.save();
		if(!this.isMouse)
		{
			var actualParent = this.actualParent;
			if(actualParent)
			{
				var rotateAngle = 0;
				
				if(this.tr)
				{
					if ( modifyParent ) {
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
						cp.applyTransform( actualParent,this.tr);					
						actualParent.tr = this.tr;
					}
					rotateAngle =cp.getAngleFromRotateStr(this.tr);
				}
				
				if ( modifyParent ) { 
					actualParent.rotateAngle = rotateAngle;
					cp.movie.stage.addToParentChildMap(actualParent.id,this.element.id);					
					if(this.re)
						this.element.parentElement.style.webkitBoxReflect = "below " + this.re.d + "px" + " -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(" + (1 - this.re.s/100) +", transparent), to(rgba(255, 255, 255, "+ (1-this.re.p/100) +")))";				
				}
			}
			this.init = true;
			this.element.originalParent = actualParent;
			if(this.sh && !this.sh.i)
			{
				gc.shadowOffsetX = this.sh.d*Math.cos((Math.PI*this.sh.a)/180);
				gc.shadowOffsetY = this.sh.d*Math.sin((Math.PI*this.sh.a)/180);
				gc.shadowBlur = this.sh.b;
				gc.shadowColor = cp.ConvertRGBToRGBA(this.sh.c,this.sh.o );	
			}
			var rotateAngle = 0;
			if(this.tr)
				rotateAngle =cp.getAngleFromRotateStr(this.tr);
			
			var transX = 0;
			var transY = 0;
			if(lHasShadowOrReflection)
			{
				transX = lL < 0 ? -lL : 0;
				transY = lT < 0 ? -lT : 0;
				gc.setTransform(1,0,0,1,transX,transY);
				gc.translate(lL + this.element.parentElement.clientWidth/2,lT + this.element.parentElement.clientHeight/2);
			}			
			else if(lHasTransform)
			{
				/*var dx = this.element.parentElement.clientWidth/2;
				var dy = this.element.parentElement.clientHeight/2;
				//translate to the center point of the actual div
				{
					dx = this.actualParentClientBoundingRect.left - this.parentElementClientBoundingRect.left + transformL;// this.actualParent.clientWidth/2;
					dy = this.actualParentClientBoundingRect.top - this.parentElementClientBoundingRect.top + transformT;// + this.actualParent.clientHeight/2;
				}
				gc.translate(dx,dy);*/
				gc.translate(this.element.parentElement.clientWidth/2,this.element.parentElement.clientHeight/2);
			}

			gc.rotate((Math.PI*rotateAngle)/180);						
			gc.tex = this.tex/* + transformL*/;
			gc.tey = this.tey/* + transformT*/;
			gc.centreImage = true;
			gc.width = this.element.clientWidth; 
			gc.height = this.element.clientHeight;

			if(this.isParentOfTypeSlide)
			{
				itemData.clientWidth = this.element.clientWidth;
				itemData.clientHeight = this.element.clientHeight;
			}
			else
			{
				if(lHasTransform)
				{
					itemData.clientWidth = this.actualParent.clientWidth;
					itemData.clientHeight = this.actualParent.clientHeight;
				}
				else
				{
					itemData.clientWidth = this.element.parentElement.clientWidth;
					itemData.clientHeight = this.element.parentElement.clientHeight;
				}
			}


			if(cp.isCaptionItem(itemData.type))
			{
				var isImageBasedCaption = this.shape;
				if(!isImageBasedCaption)
				{
					this.isDrawn = true;
					this.drawComplete(iReason);
				}
				else
					itemData.pixelColor = this.getAttribute("bc");
			}	
		}
		if (this.shape)
		{
			try {
				var objectToBeHidden = this.getAttribute("objectToBeHidden");
				var lDrawnOnCanvas = this.shape(gc,imagePath,objectToBeHidden,cp.isVisible(this),this.divName,lHasShadowOrReflection,lHasTransform);
				if (lDrawnOnCanvas || (lType == cp.kCPOTClickBoxItem) || !lCurrentCSS.ipiv)
				{
					this.isDrawn = true;
					this.drawComplete(iReason);
				}
				else
				{
					return false;
				}
			}
			catch(e)
			{
				//console.error(e);
			}
		}
		
		if(itemData.type == cp.kCPOTScoringResultItem ||
			itemData.type == cp.kCPOTStageAnswerLabel ||
			itemData.type == cp.kCPOTStageAnswerItem ||
			itemData.type == cp.kCPOTFillBlankCaption ||
			itemData.type == cp.kCPOTStageMatchingAnswerEntry ||
			itemData.type == cp.kCPOTQuestionColumn)
		{
			this.isDrawn = true;
			this.drawComplete(iReason);
		}	

		gc.restore();
		
		cp.handleQuizzingItemsInReviewMode(this.element,itemData,this.divName);
		
		gc = null;
		canvas = null;
		if(this.transIn && iReason == cp.ReasonForDrawing.kRegularDraw)
			this.element.parentElement.style.opacity = 0;

		if(!cp.isVisible(this))
			cp._hide( this.divName );
		
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

	cp.Shape.prototype.playPath = function(path)
	{
		var l = path.length;
		var c = 0; 
		var gc = this.canvas.gc;
		gc.beginPath();
		while(c < l)
			switch(path[c++])
			{
				case 'M': gc.moveTo(path[c++], path[c++]);break;
				case 'L': gc.lineTo(path[c++], path[c++]);break;
				case 'Z': gc.closePath();break;
				case 'Q': gc.quadraticCurveTo(path[c++],path[c++],path[c++],path[c++]);break;
				case 'C': gc.bezierCurveTo(path[c++],path[c++],path[c++],path[c++],path[c++],path[c++]);
			}		
	}

	cp.Shape.prototype.changeStateOnMouseEvents = function( eventType , eventObj )
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

	cp.Shape.prototype.HandleMouseEventOnStateItems = function( eventType , itemParentState , eventObj )
	{
		// Normal, RollOver, Down states of interactive items have different items . When any of the mouse events like down,up,rollover,rollout happens on any such rdButton 
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
					this.shouldShowRollOver = true;
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

				if(currentStateType ==  cp.kSTTNormal || currentStateType == cp.kSTTCustom || currentStateType == cp.kSTTVisited )
				{
					this.stateAtStartOfMouseEvents = currentStateName;
					this.ignoreMouseOutEventOnNormal  = true; //hack for Bug#4015304
				}
			}
		}
		else if(eventType == "mouseup")
		{
			if( !bCheckStateType || currentStateType == cp.kSTTDown )
			{
				bCanChangeState = true;
				toStateName = this.stateAtStartOfMouseEvents;
				this.shouldShowRollOver = false;
				if(this.bShouldListenForMouseUpOnDownState)
					bExecuteClick = true;
			}
		}

		if(bCanChangeState)
		{
			if(toStateName !== cp.getLocalisedStateName("kCPRolloverState"))
				cp.ResetItemZIndicesWithinState(this,cp.getLocalisedStateName("kCPRolloverState"));

			cp.changeState(this.actualParent.id,toStateName,false);
		}

		if(bExecuteClick)
		{
			if(!cp.IsGestureSupportedDevice())
			{
				var bRelaxBrowserCheck = cp.shouldRelaxBrowserCheck(this.parentData.type);
				if( bRelaxBrowserCheck || (cp.CHROME != cp.browser && cp.MSIE != cp.browser) || cp.m_isLMSPreview)
				{
					var customData = {}; // customData to identify that click here is dispatched as part of state transitions
					customData["asPartOfStateChange"] = true;
					cp.dispatchClickEvent(this.actualParent,eventObj,customData);
				}
			}
		}
	}


	// FRAMESET OR ANY CP OBJECT...
	cp.FrameSet = function(el, children)
	{
		function getKeyHandler(handler, shortcut, obj, objc, from, to)
		{
			var cachedObj = obj;
			var cachedObjc = objc;
			var cpShortcut = new cp.Shortcut(shortcut.k, 
				(shortcut.c ? true : false), 
				(shortcut.s ? true : false),
				(shortcut.a ? true : false));
			function kHandler(isCorrectKey)
			{
				return handler(cachedObj, cachedObjc, isCorrectKey);
			}
            var name = '';
            if (obj.eh != undefined)
                name = objc.dn;
			return new cp.KeyHandler(kHandler, cpShortcut, from, to,name);
		}
		
		cp.FrameSet.baseConstructor.call(this, el);
		this.children = children;
		
		this.from = this.getAttribute("from");
		this.to = this.getAttribute("to");
		this.afrom = this.getAttribute("afrom"); // Needed for mouse. Will not be available elsewhere.
		this.ato = this.getAttribute("ato"); // Needed for mouse. Will not be available elsewhere.

		this.transIn = this.getAttribute("trin");
		if(!this.transIn)
			this.transIn = 0;
		this.transOut = this.getAttribute("trout"); 
		if(!this.transOut)
			this.transOut = 0;
		if(this.element.drawingBoard)
		{
			this.element.drawingBoard.style.display = 'block';
			if(this.transIn > 0)
				this.element.drawingBoard.style.opacity = 0;
			else
				this.element.drawingBoard.style.opacity = 1;
		}	
		var cpMotionPath = this.getAttribute("mp");
		if (cpMotionPath == 'mouse')
		{
			this.motionPathMover = cp.movie.mousePath;
			this.motionPathArgs = this.getAttribute("mpa");
		}
		
		this.type = this.getAttribute("type");
		this.itemData = cp.D[this.element.id];
		this.itemCanvasData = null;
		if ( this.itemData && this.itemData.mdi )
			this.itemCanvasData = cp.D[ this.itemData.mdi ];

		if(this.itemCanvasData)
			cp.cpIDMap[this.itemCanvasData.uid] = this.itemData.mdi;

		this.pa = this.getAttribute("pa");
		this.alwaysPause = this.getAttribute("cpa");
		var psv = this.getAttribute("psv");
		if(psv)
			this.psv = psv;
			
		if (undefined != this.pa) {
			this.element.style["WebkitTapHighlightColor"] = "rgba(0,0,0,0.3)";
			this.setAttribute('handled', false);
			this.setAttribute('clickedOnce', false);
			this.setAttribute('currentAttempt', 0); // re-initialize.
			this.setAttribute('actionInProgress', false);
			var lIsQuizButton = ((this.getAttribute("iqb") != undefined) && this.getAttribute("iqb"));
			if(lIsQuizButton)
			{
				var slideName = this.getAttribute("sn");
				var parentSlideData = cp.D[slideName];
				var questions = parentSlideData['qs'];
				var questionObj;
				if(questions && (questions.indexOf(",") == -1))
					questionObj = cp.getQuestionObject(questions);
				var buttonType = this.getAttribute("qbt");
				this.element.style.cursor = "pointer";
				var lBaseStateItemID = this.getAttribute("bstiid");
				var isStateItem = lBaseStateItemID && (lBaseStateItemID !== -1);

				if(buttonType)
				{
					switch(buttonType)
					{
						case "submit": questionObj.registerSubmitButton(this.element,isStateItem);break;
						case "back": questionObj.registerBackButton(this.element,isStateItem);break;
						case "skip": questionObj.registerSkipButton(this.element,isStateItem);break;
						case "clear": questionObj.registerClearButton(this.element,isStateItem);break;
						case "submitAll": questionObj.registerSubmitAllButton(this.element,isStateItem);break;
						case "reviewModeNext": questionObj.registerReviewModeNextButton(this.element,isStateItem);break;
                        case "reviewModeBack": questionObj.registerReviewModeBackButton(this.element,isStateItem);break;
						default: 	cp.registerGestureEvent(this.element,cp.GESTURE_EVENT_TYPES.TAP,cp.QuizButtonCH); 
									break;
					}
				}
			}
			this.dependents = this.getAttribute( "dep" );
			// Do special handling for rest of project for autoshape button.
			if ( cp.kCPOTAutoShape == this.type && 1 == this.getAttribute( 'rp' ) ) {
				// Need to ensure that they pause once on each slide.
				// Get current slide. If start of slide is > pause time, means it's on later slide, set special flag.
				var currSlide = cp.movie.stage.currentSlide;
				if ( currSlide && currSlide.from > this.pa ) {
					this.rp_pa = currSlide.from + this.pa - this.from;
				}
			}
		}
		this.htmlDependents = [];
		if(undefined != this.psv)
		{
			this.setAttribute('pausedOnce', false);
		}
		
		var cpOnShowFn = this.getAttribute("onShow");
		if (cpOnShowFn)	
			this.onShow = window[cpOnShowFn];
		this.keyHandler = this.getAttribute("kh");
		if (this.keyHandler) {
			this.keyShortcut = this.getAttribute("sc");
			if (this.keyShortcut) {
				var keyHandler = getKeyHandler( this.keyHandler, this.keyShortcut, cp.D[this.element.id], 
					cp.D[this.element.id + 'c'], this.from, this.to);
				if (keyHandler) 
					cp.movie.stage.addKeyHandler(keyHandler);
			}
		}
		
        //add enter and return key handlers
		if ( ! this.keyHandler ) { // No point in having 2 key handlers.
			this.keyHandler = this.getAttribute("eh");
			if (this.keyHandler) {						
				var keyHandler = getKeyHandler( this.keyHandler, '', cp.D[this.element.id], 
					cp.D[this.element.id + 'c'], this.from, this.to);
				if (keyHandler) 
					cp.movie.stage.addKeyHandler(keyHandler);			
			}
		}
		
		this.isStarted = false;
		if ( cp.kCPOTClickBoxItem == this.type || cp.kCPOTScorableButtonItem == this.type || cp.kCPOTAutoShape == this.type ) {
			// Do checks for right click or double click.
			this.dblClick = this.getAttribute( "dclk" );
			if ( this.dblClick ) {
				cp.movie.stage.getClickManager().addDoubleClick( cp.D[this.element.id], 
					cp.D[this.element.id + 'c'], this.element );
			}
			else if ( cp.kCPOTClickBoxItem == this.type ) {
				this.rightClick = this.getAttribute( "rclk" );
				if ( this.rightClick ) {
					cp.movie.stage.getClickManager().addRightClick( cp.D[this.element.id], 
						cp.D[this.element.id + 'c'], this.element );
				}
			}
		}

		if ( cp.kCPOTTextEntryButtonItem == this.type ) {
			this.parentId = this.getAttribute( 'vid' );
			if ( this.parentId ) 
				cp.movie.stage.addToParentChildMap( this.parentId, this.element.id );
		}
		
		// For IE9, add white background with full opacity. This is needed for making the div respond to mouse events.
		if ( cp.MSIE == cp.browser && undefined != this.type) {
			switch ( this.type ) {
			case cp.kCPOTStageShortAnswer:
			case cp.kCPOTQuestionFillBlank:
			case cp.kCPOTFillBlankCaption:
			case cp.kCPOTWidgetItem:
			case cp.kCPOTProgressIndicator:
			case cp.kCPOTReviewArea:
			case cp.kCPOTScoringResult:
			case cp.kCPOTStageAnswerItem:
			case cp.kCPOTStageAnswerLabel:
			case cp.kCPOTStageMatchingQuestion:
			case cp.kCPOTStageMatchingAnswerEntry:
			case cp.kCPOTFLVItem:
				break;

			case cp.kCPOTWebObject:
				if(this.itemCanvasData)
				{
					var svgData = this.itemCanvasData.wosvg;
					if(svgData && svgData!="")
					{
						el.style.backgroundColor = '#FFFFFF';
						el.style.opacity = 0;
					}
				}
					break;

			default:
				el.style.backgroundColor = '#FFFFFF';
				el.style.opacity = 0;
				break;
			}
		}
		
	}
	
	cp.inherits(cp.FrameSet, cp.DisplayObject);
	
	cp.FrameSet.prototype.isInRange = function(frame)
	{
		if (this.from == 0 && this.to == 0)
			return true;

		//Additional state items of the following items should also return true. So, for check if 'this' is part of state and if base item is of the following type...
		var lThisCanvasItem = cp.getDisplayObjByKey(this.itemData.mdi);
		if(lThisCanvasItem)
		{
			var bItemPartOfState = (-1 !== lThisCanvasItem.baseStateItemID);
			if(bItemPartOfState)
			{
				var baseItem = cp.getBaseStateItem(lThisCanvasItem);
				if(baseItem && baseItem.parentData)
				{
					if (cp.kCPOTSuccessCaptionItem == baseItem.parentData.type ||
						cp.kCPOTFailureCaptionItem == baseItem.parentData.type ||
						cp.kCPOTHintCaptionItem == baseItem.parentData.type ||
						cp.kCPRolloverCaptionItem == baseItem.parentData.type ||
						cp.kCPRolloverImageItem == baseItem.parentData.type ||
						cp.kCPOTRolloverAutoShape == baseItem.parentData.type ||
						cp.kCPOTSuccessShapeItem == baseItem.parentData.type ||
						cp.kCPOTFailureShapeItem == baseItem.parentData.type ||
						cp.kCPOTHintShapeItem == baseItem.parentData.type
					)
					return true;
				}
			}
		}
		
		if (cp.kCPOTSuccessCaptionItem == this.type ||
			cp.kCPOTFailureCaptionItem == this.type ||
			cp.kCPOTHintCaptionItem == this.type ||
			cp.kCPRolloverCaptionItem == this.type ||
			cp.kCPRolloverImageItem == this.type ||
			cp.kCPOTRolloverAutoShape == this.type ||
			cp.kCPOTSuccessShapeItem == this.type ||
			cp.kCPOTFailureShapeItem == this.type ||
			cp.kCPOTHintShapeItem == this.type)
			return true;

		return (this.from <= frame) && (this.to >= frame);
	}
	
	cp.FrameSet.prototype.updateOpacity = function()
	{
		if(this.element.drawingBoard)
		{
			var areFeedbackCaptions = (cp.kCPOTSuccessCaptionItem == this.type ||
				cp.kCPOTFailureCaptionItem == this.type ||
				cp.kCPOTHintCaptionItem == this.type ||
				cp.kCPOTSuccessShapeItem == this.type ||
				cp.kCPOTFailureShapeItem == this.type ||
				cp.kCPOTHintShapeItem == this.type);
				
			if(!areFeedbackCaptions)
			{
				
				
				if(this.transIn){
					var currentRelativeFrame = cpInfoCurrentFrame - this.from + 1;
					if(currentRelativeFrame > 0 && currentRelativeFrame <= this.transIn){
						this.element.drawingBoard.style.opacity = (currentRelativeFrame)/this.transIn;
						return;
					}
				}
				
				if(this.transOut){
					var currentRelativeFrameFromEnd = this.to - cpInfoCurrentFrame;
					if(currentRelativeFrameFromEnd >= 0 && currentRelativeFrameFromEnd < this.transOut){
						this.element.drawingBoard.style.opacity = (currentRelativeFrameFromEnd)/this.transOut;
						return;
					}
				}

				if((this.transIn || this.transOut) && this.element.drawingBoard.style.opacity != '1')
					this.element.drawingBoard.style.opacity = 1;
			}
		}
	}
	
	cp.FrameSet.prototype.updateFrame = function(reason)
	{
		this.updateOpacity();
		
		cp.FrameSet.superClass.updateFrame.call(this);

		var areFeedbackCaptions = (cp.kCPOTSuccessCaptionItem == this.type ||
			cp.kCPOTFailureCaptionItem == this.type || cp.kCPOTFailureShapeItem == this.type ||
			cp.kCPOTHintCaptionItem == this.type || cp.kCPOTHintShapeItem == this.type ||
			cp.kCPOTSuccessShapeItem == this.type);

		if(reason == cp.Timeline.ReasonForUpdate.JUMP)
			this.setAttribute('clickedOnce', false);
	}
	
	cp.FrameSet.prototype.start = function(iForce,iReasonForDrawing)
	{
		var i = 0;
		var shouldUpdateVar = !this.isStarted;
		this.isStarted = true;
		this.element.style.display = "block";
		if(this.element.drawingBoard)
			this.element.drawingBoard.style.display = "block";
				
		if (undefined != this.pa) {
			if(null != cp.movie.stage.currentSlide) {
				var doSet = -1 != this.pa;
				if ( ! doSet ) {
					// Check for interactive objects.
					doSet = cp.kCPOTClickBoxItem == this.type || cp.kCPOTScorableButtonItem == this.type || 
						cp.kCPOTAutoShape == this.type || cp.kCPOTTextEntryBoxItem == this.type;
				}
				if ( doSet )
					cp.movie.stage.currentSlide.topMostObjectInteractiveObject = this.element.id;
			}
		}
		cp.FrameSet.superClass.start.call(this,iForce,iReasonForDrawing);

		var lTempVisible = (this.itemCanvasData && 1 == this.itemCanvasData.visible);

		if ( lTempVisible ) { // actual visible guy.
			for ( i = 0; i < this.htmlDependents.length; ++i ) 
				this.htmlDependents[ i ].style.visibility = 'visible';	
		}
		
		this.updateOpacity();
		if (this.onShow)
		{
			try {
				this.onShow.call(this.timeline);
			} catch (e) {
				//console.error(e);
			}
		}
		//on object enter call goes to test code.
		if(typeof(cptb) != 'undefined')
		{
			if(!cptb.isObjectDrawn(this))
			{
				cptb.onObjectEnter(this);
			}	
		}	
		if(cp.responsive && shouldUpdateVar)
		{
			cp.updateVarText(this.element, true, true);
			if(this.element)
			{
				var lElemData = cp.D[this.element.id]
				if(lElemData && (lElemData.rpvt != undefined || lElemData.vt != undefined))
				{
					//just a hack for appear after fix
					cp.updateVarText(this.element, true, true);
				}
			}
		}	
	}
	
	cp.FrameSet.prototype.reset = function(endOfSlide)
	{
		//On object exit call goes to test code.
		if(typeof(cptb) != 'undefined'){
			if(!cptb.isObjectReset(this)){
				cptb.onObjectExit(this);
			}
		}

		var i = 0;
		delete cp.ropMap[this.element.id];
		cp.FrameSet.superClass.reset.call(this, endOfSlide);
		this.isStarted = false;
		var setDisplayNone = true;
		
		if(this.itemData.st)//very weak link to identify a slide!!!
			setDisplayNone = false;
		if(endOfSlide)
		{
			if(this.children && this.children[0] && this.children[0].continueToNextSlide)
				setDisplayNone = false;
		}
		
		if(setDisplayNone)
			this.element.style.display = "none";
			
		if (undefined != this.pa) {
			this.setAttribute('handled', false);
			this.setAttribute('clickedOnce', false);
			if (undefined != this.dependents) {
				// Hide each of them.
				for ( i = 0; i < this.dependents.length; ++i )
					cp.hide( this.dependents[ i ] );
			}
		}
		for ( i = 0; i < this.htmlDependents.length; ++i ) 
			this.htmlDependents[ i ].style.visibility = 'hidden';
		
		if( undefined != this.psv )
		{
			this.setAttribute('pausedOnce', false);
		}
		
		if(setDisplayNone && this.element.drawingBoard)
		{
			this.element.drawingBoard.style.opacity = 0;
			this.element.drawingBoard.style.display = "none";
		}
	}
	
	cp.FrameSet.prototype.ApplyMotion = function(frame,iForce)
	{
		
		if(this.motionPathMover == null)
			return;
		try 
		{
			this.motionPathMover(this, frame, iForce);
		}
		catch(e)
		{
			//console.error(e);
		}	
		
	}	
	
	cp.FrameSet.prototype.handleRewind = function()
	{
		// For the moment set handle only handled property.
		if (undefined != this.pa) {
			this.setAttribute('handled', false);
			this.setAttribute('clickedOnce', false);
		}
		if(undefined != this.psv)
		{
			this.setAttribute('pausedOnce', false);
		}
		
		if ( undefined != this.type && cp.kCPOTWidgetItem == this.type && ! this.itemData.rp ) {
			if ( 1 == this.children.length )
				this.reset(); // Do reset for widgets.
		}
	}
	
	cp.FrameSet.prototype.onEndOfSlide = function(reason)
	{
		var doReset = this.isStarted && !this.isInRange(cpInfoCurrentFrame);
		if ( ! doReset ) {
			var alwaysReset = (cp.kCPOTSuccessCaptionItem == this.type ||
				cp.kCPOTFailureCaptionItem == this.type ||
				cp.kCPOTHintCaptionItem == this.type || 
				((cp.kCPOTAutoShape == this.type) && (this.getAttribute( 'rp' ) != 1))  ||
				cp.kCPRolloverCaptionItem == this.type ||
				cp.kCPRolloverImageItem == this.type ||
				cp.kCPOTRolloverAutoShape == this.type ||
				cp.kCPOTSuccessShapeItem == this.type || cp.kCPOTFailureShapeItem == this.type || cp.kCPOTHintShapeItem == this.type);
			doReset = alwaysReset; // Always reset feedback captions. They don't get started always and cause special problems otherwise.
			// And also auto shape, since they add handlers. Ideally we could have left out non button auto shapes but anyway..
			// Also reset widgets, if they are not rest of project.
			if ( ! doReset ) {
				if ( this.type == cp.kCPOTWidgetItem && ! this.itemData.rp )
					doReset = true;
			}
		}
		if ( doReset )
			this.reset(reason == cp.Timeline.ReasonForUpdate.PROGRESS);
		else
		{
			if((cp.kCPOTAutoShape == this.type) && (this.getAttribute( 'uab' ) == 1) )//doReset == false ==> rest-of-project == true
			{
				var autoShape = this.children[0];
				if(autoShape)
					autoShape.removeMouseHandlers();
			}
		}
	}
})(window.cp);