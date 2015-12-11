(function(cp)
{
	cp.Line = function(el, args)
	{
		cp.Line.baseConstructor.call(this, el);
			
		this.visible = this.getAttribute("visible");
		this.data = cp.D[ this.element.id ];
		this.parentDivName = this.getAttribute("dn");
		var actualParent = document.getElementById(this.parentDivName);
		this.actualParent = actualParent;
		var bounds = this.data.b;
		this.bounds = {
				minX: bounds[0],
				minY: bounds[1],			
				maxX: bounds[2],
				maxY: bounds[3]
			};
		var vbounds = this.data.vb;
		this.vbounds = {
			minX: vbounds[0],
			minY: vbounds[1],			
			maxX: vbounds[2],
			maxY: vbounds[3],
			width: vbounds[2] - vbounds[0],
			height: vbounds[3] - vbounds[1]
		};
		if(actualParent)
		{
			actualParent.drawingBoard = this.element.parentElement;
			actualParent.bounds = this.bounds;
			actualParent.drawingBoard.bounds = this.vbounds;
		}
		this.args = args;	
		this.isDrawn = false;		    
		this.sh = this.getAttribute("sh");
		this.re = this.getAttribute("re");	

		if(cp.responsive)
			this.responsiveCSS = this.getAttribute("css");	

		if(this.cloneOfBaseStateItem==false && this.baseStateItemID!=-1)    
		{
			//playing effects on additional objects for the first time
			this.playEffectsOnStart = true;
		}

		cp.setInitialVisibility(this);
	}
	
	cp.inherits(cp.Line, cp.DisplayObject);
	
	cp.Line.prototype.start = function(iForce,iReasonForDrawing)
	{
		this.drawIfNeeded(iForce,iReasonForDrawing);
		if(!this.effectIsStarted || iForce)
		{
			this.areDimensionsCalculated = false;
			this.updateEffects(this.hasEffect);
			this.effectIsStarted = true;
		}
	}
	
	cp.Line.prototype.reset = function(endOfSlide)
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
		this.effectIsStarted = false;
	}
	
	cp.Line.prototype.getLinkOffsets = function(iStyleObj)
	{
		var lObj = new Object();
		
		lObj.l = 0;
		lObj.t = 0;		
		lObj.r = 0;
		lObj.b = 0;

		lObj.hOff = new Object();
		lObj.hOff.offset = 0;
		lObj.hOff.poleVal = {"init":0,"curr":0};
		lObj.vOff = new Object();
		lObj.vOff.offset = 0;
		lObj.vOff.poleVal = {"init":0,"curr":0};

		var lCPSlideDivRect = cp("div_Slide").getBoundingClientRect();
		var lProjWidthToUse = cp("project").clientWidth;
		var lProjHeightToUse = cp("project").clientHeight;

		var lShouldUseHLink = false;
		var lShouldUseVLink = false;
		var lCPHLinkedItem = undefined;
		var lCPVLinkedItem = undefined;
		if(iStyleObj.lhID || iStyleObj.lvID)
		{
			lCPHLinkedItem = cp.getDisplayObjByCP_UID(iStyleObj.lhID);
			if(iStyleObj.lhID == iStyleObj.lvID)
			{
				lCPVLinkedItem = lCPHLinkedItem;
			}
			else
			 	lCPVLinkedItem = cp.getDisplayObjByCP_UID(iStyleObj.lvID);

			if(lCPHLinkedItem)
				lShouldUseHLink = lCPHLinkedItem.isStarted && lCPHLinkedItem.isDrawnComplete;
			if(lCPVLinkedItem)
				lShouldUseVLink = lCPVLinkedItem.isStarted && lCPVLinkedItem.isDrawnComplete;
		}

		if(lShouldUseHLink && (iStyleObj.lhID != -1))
		{
			var lLinkedItem = lCPHLinkedItem.actualParent;
			if(lLinkedItem)
			{
				var lLinkedItemRect = lLinkedItem.getBoundingClientRect();
				if(lLinkedItem.tr)
				{
					var lTransform = lCPHLinkedItem.actualParent.style['transform'] ||
										lCPHLinkedItem.actualParent.style['msTransform'] ||
										lCPHLinkedItem.actualParent.style['MozTransform'] ||
										lCPHLinkedItem.actualParent.style['WebkitTransform'] ||
										lCPHLinkedItem.actualParent.style['OTransform'];

					cp.applyTransform(lCPHLinkedItem.actualParent,"");
					
					lLinkedItemRect = lLinkedItem.getBoundingClientRect();
					
					cp.applyTransform(lCPHLinkedItem.actualParent,lTransform);
				}	
				
				if(lLinkedItemRect)
				{
					var lStyleLinkedVal = iStyleObj.lhV;
					if(lStyleLinkedVal.indexOf("H%") != -1)
					{
						var lPropLinkedVal = lStyleLinkedVal.split("H%")[0];
						lStyleLinkedVal	= cp.getRoundedValue(lPropLinkedVal*lProjHeightToUse/100) + "px";
					}
					else if(lStyleLinkedVal.indexOf("%") != -1)
					{
						var lPropLinkedVal = lStyleLinkedVal.split("%")[0];
						lStyleLinkedVal	= cp.getRoundedValue(lPropLinkedVal*lProjWidthToUse/100) + "px";
					}

					var lLinkedItemPropVal = lLinkedItemRect[cp.rLinkEdges[iStyleObj.lhEID]];
					lLinkedItemPropVal -= lCPSlideDivRect.left;
					lObj.hOff.poleVal["curr"] = lLinkedItemPropVal;
					if(iStyleObj.l != "auto" && iStyleObj.l != "")
						lObj.hOff.offset = parseFloat(lStyleLinkedVal);
					if(iStyleObj.r != "auto" && iStyleObj.r != "")
						lObj.hOff.offset = -parseFloat(lStyleLinkedVal);
				}

				//put original position of the linked item as well
				var lOriginalRect = cp.createTempElemAndGetBoundingRect(lCPHLinkedItem.currentCSS,undefined,false);
				lObj.hOff.poleVal["init"] = lOriginalRect[cp.rLinkEdges[iStyleObj.lhEID]] - lCPSlideDivRect.left;
			}
		}
		else
		{
			lObj.hOff = undefined;
		}
		if(lShouldUseVLink && (iStyleObj.lvID != -1))
		{
			var lLinkedItem = lCPVLinkedItem.actualParent;
			if(lLinkedItem)
			{
				var lLinkedItemRect = lLinkedItem.getBoundingClientRect();
				if(lLinkedItem.tr)
				{
					var lTransform = lCPVLinkedItem.actualParent.style['transform'] ||
										lCPVLinkedItem.actualParent.style['msTransform'] ||
										lCPVLinkedItem.actualParent.style['MozTransform'] ||
										lCPVLinkedItem.actualParent.style['WebkitTransform'] ||
										lCPVLinkedItem.actualParent.style['OTransform'];

					cp.applyTransform(lCPVLinkedItem.actualParent,"");
					
					lLinkedItemRect = lLinkedItem.getBoundingClientRect();
					
					cp.applyTransform(lCPVLinkedItem.actualParent,lTransform);
				}	
				
				if(lLinkedItemRect)
				{
					var lStyleLinkedVal = iStyleObj.lvV;
					if(lStyleLinkedVal.indexOf("H%") != -1)
					{
						var lPropLinkedVal = lStyleLinkedVal.split("H%")[0];
						lStyleLinkedVal	= cp.getRoundedValue(lPropLinkedVal*lProjWidthToUse/100) + "px";
					}
					else if(lStyleLinkedVal.indexOf("%") != -1)
					{
						var lPropLinkedVal = lStyleLinkedVal.split("%")[0];
						lStyleLinkedVal	= cp.getRoundedValue(lPropLinkedVal*lProjHeightToUse/100) + "px";
					}

					var lLinkedItemPropVal = lLinkedItemRect[cp.rLinkEdges[iStyleObj.lvEID]];
					lLinkedItemPropVal -= lCPSlideDivRect.top;
					lObj.vOff.poleVal["curr"] = lLinkedItemPropVal;
					if(iStyleObj.t != "auto" && iStyleObj.t != "")
						lObj.vOff.offset = parseFloat(lStyleLinkedVal);
					if(iStyleObj.b != "auto" && iStyleObj.b != "")
						lObj.vOff.offset = -parseFloat(lStyleLinkedVal);
				}
				//put original position of the linked item as well
				var lOriginalRect = cp.createTempElemAndGetBoundingRect(lCPVLinkedItem.currentCSS,undefined,false);
				lObj.vOff.poleVal["init"] = lOriginalRect[cp.rLinkEdges[iStyleObj.lvEID]] - lCPSlideDivRect.top;
			}
		}
		else
		{
			lObj.vOff = undefined;
		}
		return lObj;
	}

	cp.Line.prototype.drawForResponsive = function(iForce,iReason)
	{
		if(!this.responsiveCSS) return false;
		if(this.isDrawn && !iForce) return true;
		if (! this.data)
			return false;
		var lCurrentCSS = cp.getResponsiveCSS(this.responsiveCSS);
		
		var lHasShadowOrReflection = false;
		lHasShadowOrReflection = (this.sh && !this.sh.i);
		
		var lHasTransform = this.tr != undefined;

		if(this.isDrawn && this.currentCSS == lCurrentCSS && !(lHasShadowOrReflection || lHasTransform) && (!iForce || iReason == cp.ReasonForDrawing.kMoviePaused))
			return true;

		this.currentCSS = lCurrentCSS;
		
		var itemName = this.getAttribute('dn');
		this.parentDivName = itemName;

		var lResponsiveStyleObj = lCurrentCSS;
		var iUseLinks = true;
		
		var linkOffsets = this.getLinkOffsets(lCurrentCSS);

		cp.applyResponsiveStyles(this.element.parentElement, lResponsiveStyleObj, iUseLinks);

		cp.applyResponsiveStyles(this.actualParent, lCurrentCSS, iUseLinks);

		var lSlideContainerDivRect = cp.movie.stage.mainSlideDiv.getBoundingClientRect();
		this.parentElementClientBoundingRect = this.element.parentElement.getBoundingClientRect();

		var lL = this.parentElementClientBoundingRect.left - lSlideContainerDivRect.left;
		var lT = this.parentElementClientBoundingRect.top - lSlideContainerDivRect.top;
		this.actualParentClientBoundingRect = this.actualParent.getBoundingClientRect();

		var actualParent = this.actualParent;
		var canvas;
		var canvasW = 0, canvasH = 0;

		var lSlideW = cp("div_Slide").clientWidth;
		var lSlideH = cp("div_Slide").clientHeight;
		
		canvasW = lSlideW > this.element.parentElement.clientWidth ? lSlideW : this.element.parentElement.clientWidth;
		canvasH = lSlideH > this.element.parentElement.clientHeight ? lSlideH : this.element.parentElement.clientHeight;
		
		lResponsiveStyleObj = cp.createResponsiveStyleObj(lCurrentCSS, undefined, "0px", "0px", "0px", "0px", canvasW + "px", canvasH + "px", undefined);
		
		var canvas = this.canvas = cp.createResponsiveCanvas(lResponsiveStyleObj, canvasW, canvasH, this.element);
		this.element.style.marginLeft = -(lL) + "px";
		this.element.style.marginTop = -(lT) + "px";
		if(this.re)
			this.element.parentElement.style.webkitBoxReflect = "below " + this.re.d + "px" + " -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(" + (1 - this.re.s/100) +", transparent), to(rgba(255, 255, 255, "+ (1-this.re.p/100) +")))";
		cp.movie.stage.addToParentChildMap(actualParent.id,this.element.id);
		this.element.originalParent = actualParent;
		var gc = canvas.gc;
		gc.clearRect(0, 0, this.element.getBoundingClientRect().width, this.element.getBoundingClientRect().height);
		
		if(cp.DESKTOP == cp.device)
		{
			//IE and FF skips the canvas clearRect and keeps on drawing on top of the previous canvas itself. 
			//beginPath() force clears the canvas
			if((cp.MSIE == cp.browser) || (cp.MSEDGE == cp.browser) || (cp.FIREFOX == cp.browser))
				gc.beginPath();
		}
		gc.save();
		var transX = lL;
		var transY = lT;
		//gc.translate(transX,transY);
		if(this.sh && !this.sh.i)
		{
			gc.shadowOffsetX = this.sh.d*Math.cos((Math.PI*this.sh.a)/180);
			gc.shadowOffsetY = this.sh.d*Math.sin((Math.PI*this.sh.a)/180);
			gc.shadowBlur = this.sh.b;
			gc.shadowColor = cp.ConvertRGBToRGBA(this.sh.c,this.sh.o );
			//cp.applyShadow(this.element , this.sh.d*Math.cos((Math.PI*this.sh.a)/180) + 'px ' + this.sh.d*Math.sin((Math.PI*this.sh.a)/180) + 'px ' + this.sh.b + 'px '+ cp.ConvertRGBToRGBA(this.sh.c,this.sh.o ));
		}
		
		var lLeft = lCurrentCSS.l;
		var lTop = lCurrentCSS.t;
		var lWidth = lCurrentCSS.w;
		var lHeight = lCurrentCSS.h;
		var lLineCSS = cp.getResponsiveCSS(this.data);
		
		if(lWidth.indexOf("H%") != -1)
		{
			var lXVal = lWidth.split("H%")[0];
			lWidth = (cp.getRoundedValue(lXVal*lSlideH/100));	
		}
		else if(lWidth.indexOf("%") != -1)
		{
			var lXVal = lWidth.split("%")[0];
			lWidth = (cp.getRoundedValue(lXVal*lSlideW/100));	
		}
		else
			lWidth = lWidth.split("px")[0];
		
		if(lHeight.indexOf("H%") != -1)
		{
			var lYVal = lHeight.split("H%")[0];
			lHeight = (cp.getRoundedValue(lYVal*lSlideW/100));	
		}
		else if(lHeight.indexOf("%") != -1)
		{
			var lYVal = lHeight.split("%")[0];
			lHeight = (cp.getRoundedValue(lYVal*lSlideH/100));	
		}
		else
			lHeight = lHeight.split("px")[0];
		
		lWidth = parseFloat(lWidth);
		lHeight = parseFloat(lHeight);
		
		var lIsCenterAlignedHorizontally = lCurrentCSS.cah;
		var lIsCenterAlignedVertically = lCurrentCSS.cav;

		if (lIsCenterAlignedHorizontally) {
		    lLeft = (lSlideW - lWidth) / 2;
		}
		else {
		    if (lCurrentCSS.l != "auto") {
		        if (lLeft.indexOf("H%") != -1) {
		            var lXVal = lLeft.split("H%")[0];
		            lLeft = (cp.getRoundedValue(lXVal * lSlideH / 100));
		        }
		        else if (lLeft.indexOf("%") != -1) {
		            var lXVal = lLeft.split("%")[0];
		            lLeft = (cp.getRoundedValue(lXVal * lSlideW / 100));
		        }
		        else
		            lLeft = lLeft.split("px")[0];
		    }
		    else {
		        var lRight = lCurrentCSS.r;
		        if (lRight.indexOf("H%") != -1) {
		            var lXVal = lRight.split("H%")[0];
		            lRight = (cp.getRoundedValue(lXVal * lSlideH / 100));
		        }
		        else if (lRight.indexOf("%") != -1) {
		            var lXVal = lRight.split("%")[0];
		            lRight = (cp.getRoundedValue(lXVal * lSlideW / 100));
		        }
		        else
		            lRight = lRight.split("px")[0];

		        lRight = parseFloat(lRight);
		        lLeft = lSlideW - (lRight + lWidth);
		    }
		}
			
		if (lIsCenterAlignedVertically) {
		    lTop = (lSlideH - lHeight) / 2;
		}
		else {
		    if (lCurrentCSS.t != "auto") {
		        if (lTop.indexOf("H%") != -1) {
		            var lYVal = lTop.split("H%")[0];
		            lTop = (cp.getRoundedValue(lYVal * lSlideW / 100));
		        }
		        else if (lTop.indexOf("%") != -1) {
		            var lYVal = lTop.split("%")[0];
		            lTop = (cp.getRoundedValue(lYVal * lSlideH / 100));
		        }
		        else
		            lTop = lTop.split("px")[0];
		    }
		    else {
		        var lBottom = lCurrentCSS.b;
		        if (lBottom.indexOf("H%") != -1) {
		            var lYVal = lBottom.split("H%")[0];
		            lBottom = (cp.getRoundedValue(lYVal * lSlideW / 100));
		        }
		        else if (lBottom.indexOf("%") != -1) {
		            var lYVal = lBottom.split("%")[0];
		            lBottom = (cp.getRoundedValue(lYVal * lSlideH / 100));
		        }
		        else
		            lBottom = lBottom.split("px")[0];

		        lBottom = parseFloat(lBottom);
		        lTop = lSlideH - (lBottom + lHeight);
		    }
		}
		lLeft = parseFloat(lLeft);
		lTop = parseFloat(lTop);
		
		
		var x1 = 0, x2 = 0;
		var y1 = 0, y2 = 0;
		if(lLineCSS.rpX1IsLeft != "false")
		{
			x1 = lLeft;
			x2 = lLeft + lWidth;
		}
		else
		{
			x1 = lLeft + lWidth;
			x2 = lLeft;
		}
		if(lLineCSS.rpY1IsTop != "false")
		{
			y1 = lTop;
			y2 = lTop + lHeight;
		}
		else
		{
			y1 = lTop + lHeight;
			y2 = lTop;
		}

		var lLeftPoint = lRightPoint = lTopPoint = lBottomPoint = 0;
		if(x1 > x2)
		{
			lLeftPoint = x2;
			lRightPoint = x1;
		}
		else
		{
			lLeftPoint = x1;
			lRightPoint = x2;	
		}

		if(y1 > y2)
		{
			lTopPoint = y2;
			lBottomPoint = y1;
		}
		else
		{
			lTopPoint = y1;
			lBottomPoint = y2;	
		}

		if (linkOffsets.hOff && !lIsCenterAlignedHorizontally)
		{
			var tmpX = 0;
			if(lCurrentCSS.l != "" && lCurrentCSS.l != "auto")
			{
				tmpX = lLeftPoint;
				lLeftPoint = linkOffsets.hOff.poleVal["curr"] + linkOffsets.hOff.offset;
				lRightPoint += lLeftPoint - tmpX;
			}
			else if(lCurrentCSS.r != "" && lCurrentCSS.r != "auto")
			{
				tmpX = lRightPoint;
				lRightPoint = linkOffsets.hOff.poleVal["curr"] + linkOffsets.hOff.offset;
				lLeftPoint += lRightPoint - tmpX;	
			}
		}

		if (linkOffsets.vOff && !lIsCenterAlignedVertically)
		{
			var tmpY = 0;
			if(lCurrentCSS.t != "" && lCurrentCSS.t != "auto")
			{
				tmpY = lTopPoint;
				lTopPoint = linkOffsets.vOff.poleVal["curr"] + linkOffsets.vOff.offset;
				lBottomPoint += lTopPoint - tmpY;
			}
			else if(lCurrentCSS.b != "" && lCurrentCSS.b != "auto")
			{
				tmpY = lBottomPoint;
				lBottomPoint = linkOffsets.vOff.poleVal["curr"] + linkOffsets.vOff.offset;
				lTopPoint += lBottomPoint - tmpY;	
			}
		}

		if(x1 > x2)
		{
			x2 = lLeftPoint;
			x1 = lRightPoint;
		}
		else
		{
			x1 = lLeftPoint;
			x2 = lRightPoint;
		}

		if(y1 > y2)
		{
			y2 = lTopPoint;
			y1 = lBottomPoint;
		}
		else
		{
			y1 = lTopPoint;
			y2 = lBottomPoint;	
		}

		var sWidth = this.data.sw;
		if ( sWidth < 5 )
			sWidth = 5; 
		
		gc.lineWidth = this.data.sw;
		gc.strokeStyle = this.data.sc;

		gc.moveTo( x1, y1 );
		if ( 0 == this.data.ss )
			gc.lineTo( x2, y2 );
		else  
			cp.drawDashedLine( gc, x1, y1, x2, y2, this.data.ss );
		gc.stroke();
			
		cp.drawLineCapStyle( gc, x1, y1, x2, y2, this.data.sc, sWidth, this.data.sst, 0 );
		cp.drawLineCapStyle( gc, x1, y1, x2, y2, this.data.sc, sWidth, this.data.est, 1 );
		
		gc.restore();
				
		gc = null;
		canvas = null;
		this.isDrawn = true;
		this.drawComplete(iReason);

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

	cp.Line.prototype.drawIfNeeded = function(iResponsiveForce,iReasonForDrawing)
	{
		if(cp.responsive)
		{
			if(this.drawForResponsive(iResponsiveForce,iReasonForDrawing))
				return;
		}

		if (this.isDrawn)
			return;

		if (! this.data)
			return;
			
		// Find the canvas elem.
		// Need to fix this bounds business. Need to 
		var bounds = this.bounds;
		var vbounds = this.vbounds;				
		var sWidth = this.data.sw;
		if ( sWidth < 5 )
			sWidth = 5; 
		
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
		
		styleLeft 	= 0 < vbounds.minX ? 0 : vbounds.minX;
		styleTop	= 0 < vbounds.minY ? 0 : vbounds.minY;
		var styleRight 	= cp.D.project.w > vbounds.maxX ? cp.D.project.w : vbounds.maxX;
		var styleBottom	= cp.D.project.h > vbounds.maxY ? cp.D.project.h : vbounds.maxY;
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
		var transX = styleLeft < 0 ? -styleLeft : 0;
		var transY = styleTop < 0 ? -styleTop : 0;
		gc.translate(transX,transY);
		if(this.sh && !this.sh.i)
		{
			gc.shadowOffsetX = this.sh.d*Math.cos((Math.PI*this.sh.a)/180);
			gc.shadowOffsetY = this.sh.d*Math.sin((Math.PI*this.sh.a)/180);
			gc.shadowBlur = this.sh.b;
			gc.shadowColor = cp.ConvertRGBToRGBA(this.sh.c,this.sh.o );
			//cp.applyShadow(this.element , this.sh.d*Math.cos((Math.PI*this.sh.a)/180) + 'px ' + this.sh.d*Math.sin((Math.PI*this.sh.a)/180) + 'px ' + this.sh.b + 'px '+ cp.ConvertRGBToRGBA(this.sh.c,this.sh.o ));
		}
		var x1 = this.data.x1;
		var y1 = this.data.y1;
		var x2 = this.data.x2;
		var y2 = this.data.y2;
		
		gc.lineWidth = this.data.sw;
		gc.strokeStyle = this.data.sc;

		gc.moveTo( x1, y1 );
		if ( 0 == this.data.ss )
			gc.lineTo( x2, y2 );
		else  
			cp.drawDashedLine( gc, x1, y1, x2, y2, this.data.ss );
		gc.stroke();
			
		cp.drawLineCapStyle( gc, x1, y1, x2, y2, this.data.sc, sWidth, this.data.sst, 0 );
		cp.drawLineCapStyle( gc, x1, y1, x2, y2, this.data.sc, sWidth, this.data.est, 1 );
		
		gc.restore();
				
		gc = null;
		canvas = null;
		this.isDrawn = true;

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
})(window.cp);