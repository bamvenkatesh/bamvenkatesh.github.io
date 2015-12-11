(function(cp)
{
	// THIS IS MAIN TIMELINE
	cp.Timeline = function(el)
	{
		cp.Timeline.baseConstructor.call(this, el);
		
		this.updateTimeline();
		
		this.pools = this.getAttribute("pools");
		
		this.previousSlideStartFrame = -1;
		this.nextSlideStartFrame = -1;
		this.currentSlideStartFrame = -1;
		
		this.movieEndAction = this.getAttribute('endAction');
		this.fadeInAtStart = this.getAttribute('fadeInAtStart');
		this.fadeOutAtEnd = this.getAttribute('fadeOutAtEnd');
		
		this.noSkipFrames = {};
		
		this.m_useWidgetVersion7 = this.getAttribute('useWidgetVersion7');
		
		var self = this;    		
		this.paused = false;
		this.cStart = this.lastFrame + 1;
		this.cEnd = -1;
		this.imagesToBeCleared = [];
		this.slideDiv = null;
		this.eventListeners = new Array();
		this.feedbacks = new Array();
		this.m_keyManager = new cp.KeyManager();
		this.m_clickManager = new cp.ClickManager();
		this.parentChildMap = new Array();
		this.audioCCItems = null;
		this.videoCCItems = null;
		this.curAudCCItem = -1;
		this.curVidCCItem = -1;
		this.itemsNotLoaded = [];
		this.interactivePauseFrame = -1;
		
        this.m_interactionManagers = [];

		this.mainSlideDiv = this.element.children[0];
		this.mainSlideDiv.style.display = 'block';
		
		var cpDocElem = document.getElementById( 'cpDocument' );
		if (cpDocElem) {
			jQuery(document).keydown( function(event) {
				self.m_keyManager.handleKeyDown(event);
			});
			jQuery(document).keyup( function(event) {
				self.m_keyManager.handleKeyUp(event);
			});
			jQuery(document).focusout( function(event) {
				self.m_keyManager.handleFocusOut(event);
			});
		}
		cpDocElem.style.backgroundColor = cp.D.project.htmlBgColor;
		this.verbose = false;
	}
	
	cp.inherits(cp.Timeline, cp.DisplayObject);	
	
	cp.Timeline.prototype.updateTimeline = function()
	{
		this.slides = (this.getAttribute("slides") || "").split(",");
		this.questions = [];
		var questionStr = this.getAttribute("questions") || "";
		if (questionStr.length > 0 )
			this.questions = questionStr.split(",");
		
		this.lastFrame = this.getAttribute('to');
	}
	
	cp.Timeline.prototype.addToItemNotLoaded = function( obj )
	{
		this.itemsNotLoaded.push( obj );
	}
	
	cp.Timeline.prototype.removeFromItemNotLoaded = function( obj )
	{
		for ( var i = 0; i < this.itemsNotLoaded.length; ++i ) {
			if ( obj == this.itemsNotLoaded[ i ] ) {	
				this.itemsNotLoaded.splice( i, 1 );
				break;
			}
		}
	}
	
	cp.Timeline.prototype.hasItemsLoaded = function()
	{
		var itemsPending = this.itemsNotLoaded.length > 0;
		if(cp.verbose && itemsPending > 0)
			cp.log(itemsPending + ' widgets pending');
		return ! itemsPending;
	}
	
	cp.Timeline.prototype.addToParentChildMap = function( parentName, childName )
	{
		// Try to find the parent name.
		var i = 0;
		var temp = '';
		var obj = null;
		if ( '' == parentName || '' == childName )
			return;
		
		for ( i = 0; i < this.parentChildMap.length; ++i ) {
			temp = this.parentChildMap[ i ].m_parent;
			if ( temp == parentName ) {
				this.parentChildMap[ i ].m_childArr.push( childName );
				return;
			}
		}
		
		obj = new Object();
		obj.m_parent = parentName;
		obj.m_childArr = new Array();
		obj.m_childArr.push( childName );
		this.parentChildMap.push( obj );
	}
	
	cp.Timeline.prototype.clearParentChildMap = function()
	{
		this.parentChildMap = [];
	}
	
	cp.Timeline.prototype.getChildrenForParent = function( parentName, outArr )
	{
		var i = 0;
		var temp = '';
		var obj = null;
		if ( '' == parentName )
			return;
		
		for ( i = 0; i < this.parentChildMap.length; ++i ) {
			temp = this.parentChildMap[ i ].m_parent;
			if ( temp == parentName ) {
				var j = 0;
				for ( j = 0; j < this.parentChildMap[i].m_childArr.length; ++j ) {
					outArr.push(this.parentChildMap[ i ].m_childArr[j]);
					this.getChildrenForParent(this.parentChildMap[ i ].m_childArr[j],outArr);
				}
			}
		}

		return;
	}
	
	cp.Timeline.prototype.addKeyHandler = function(keyHandler)
	{
		if (keyHandler)
			this.m_keyManager.addHandler(keyHandler);
	}
	
	cp.Timeline.prototype.getClickManager = function()
	{
		return this.m_clickManager;
	}
	
	cp.Timeline.prototype.setupSlideItemDiv = function(item, itemData, slide, slideDiv, itemDiv, slideCanvas, iJustRearrange)
	{
		// For the moment, apply simple hack.
		var elemType = 'canvas';
		var classType = 'cp-shape';
		var rewrap = true;
		if ( cp.kCPHighlight == item.t )
		{
			classType = 'cp-hb';
		}
		else if ( cp.kCPRolloverAreaItem == item.t )
		{
			classType = 'cp-rai';
		}
		else if (cp.kCPZoomSource == item.t)
		{
			classType = 'cp-zoom';
		}
		else if ( cp.kCPMouse == item.t )
		{
			rewrap = true;
		}
		else if ( cp.kCPMouseClick == item.t )
		{
			classType = 'cp-mc';
			rewrap = true;
		}
		else if ( cp.kCPOTReviewArea == item.t )
		{
			elemType = "div";
			classType = "cp-questionSlideReviewLabel";
			rewrap = false;
		}
		else if ( cp.kCPOTProgressIndicator == item.t )
		{
			elemType = "div";
			classType = "cp-progressSlideLabel";
			rewrap = false;
		}
		else if ( cp.kCPOTScoringResult == item.t )
		{
			elemType = "div";
			classType = "cp-resultSlideLabel";
			rewrap = false;
		}
        else if (cp.kCPTypingText == item.t) {
            elemType = 'div';
            classType = 'cp-typingtext';
			//rewrap = false;
        }
		else if (cp.kCPOTTextEntryBoxItem == item.t) {
            elemType = 'div';
            classType = 'cp-input';
			rewrap = false;
		}
		else if (cp.kCPOTLineItem == item.t) 
			classType = 'cp-line';
		else if ((cp.kCPOTAnswerArea == item.t) || (cp.kCPOTMatchingQuestionArea == item.t) || (cp.kCPOTMatchingAnswerArea == item.t) ||
			(cp.kCPOTLikertQuestionArea == item.t) || (cp.kCPOTLikertTotalGroupArea == item.t) )		
			classType = 'cp-answerArea';
		else if (cp.kCPOTStageQuestionText == item.t || cp.kCPOTStageQuestionTitle == item.t)
			classType = 'cp-rectWithText';			
		else if( cp.kCPOTWidgetItem == item.t) {
			elemType = 'div';
            classType = 'cp-widget';
			rewrap = this.m_useWidgetVersion7;
		}
		else if(cp.kCPOTWebObject == item.t){
			elemType = 'div';
			classType = 'cp-WebObject';

			rewrap = this.m_useWidgetVersion7;
			if(itemData.mdi)
			{
				var lItemCanvasData = cp.D[itemData.mdi];
				if(lItemCanvasData)	
				{
					rewrap = (lItemCanvasData.wosvg != undefined);
				}
			}
		}
		else if ( cp.kCPOTTAItem == item.t ) {
			elemType = 'div';
            classType = 'cp-ta';
		}
		else if(cp.kCPOTFLVItem == item.t)
		{
			elemType = 'div';
			classType = 'cp-eventVideo';
			rewrap = true;
		}
		else if(cp.kCPOTVideo == item.t)
		{
			elemType = 'div';
			classType = 'cp-slideVideo';
			rewrap = true;
		}
        else if (cp.kCPFullMotion == item.t)
		{
            elemType = 'div';
            classType = 'cp-fmrVideo';
			rewrap = true;
        }
		else if(cp.kCPOTVideoResource == item.t)
		{
			elemType = 'div';
			classType = 'cp-cpvcVideo';
			rewrap = true;
		}
		else if(cp.kCPOTAnimationItem == item.t)
		{
			elemType = 'div';
			classType = 'cp-animationItem';
			rewrap = true;
		}
        else // Give external guys a chance to handle it
        {
			if(cp.extObjInfo)
			{
				for (var ii =0; ii < cp.extObjInfo.length; ++ii)
				{
					if (cp.IsValidObj(cp.extObjInfo[ii].cb))
					{
						var infoObj = {};
						infoObj.elemType = elemType;
						infoObj.classType = classType;
						infoObj.rewrap = rewrap;

						if ( cp.extObjInfo[ii].cb (item.t, infoObj) )
						{
							elemType = infoObj.elemType;
							classType = infoObj.classType;
							rewrap = infoObj.rewrap;
							break;
						}
					}
				}
			}
        }
		var divStr = "";
		
		var nameSuffix = 'c';
		if ( cp.kCPOTStageAnswerItem == item.t ) {
            var lItemData = cp.D[item.n + 'c'];
            var answerType = lItemData['at'];
            if( answerType == cp.kCPOTStageSingleChoiceMultipleAnswer )
			{
                nameSuffix = 'r';
                classType = 'cp-singleChoiceInput';
            }
            else if( answerType == cp.kCPOTStageMultipleChoiceMultipleAnswer )
            {
                nameSuffix = 'ch';
                classType = 'cp-multipleChoiceInput';
            }
			else if( answerType == cp.kCPOTStageSequenceAnswer )
			{
                nameSuffix = 'seq';
                classType = 'cp-sequenceInput';
            }
			else if( answerType == cp.kCPOTStageMatchingAnswer )
			{
				nameSuffix = 'mtcha';
                classType = 'cp-matchingAnswer';
            }
			
			elemType = "div";
			rewrap = false;
		}
		if( cp.kCPOTQuestionFillBlank == item.t ) {				
                classType = 'cp-fibAnswer';
				nameSuffix = 'fib';
				elemType = 'div';
				rewrap = false;
			}
		if( cp.kCPOTStageShortAnswer == item.t ) {
				classType = 'cp-shortAnswer';
				nameSuffix = 'sha';
				elemType = 'div';
				rewrap = false;
			}
		if( cp.kCPOTItemHotSpot == item.t ) {
			classType = 'cp-hotspotInput';
			nameSuffix = 'hotspot';
			elemType = 'div';
			rewrap = false;
		}
		if( cp.kCPOTStageMatchingQuestion == item.t ){
			classType = 'cp-matchingItem';
			nameSuffix = 'mtchi';
			elemType = 'div';
			rewrap = false;
		}
		if( cp.kCPOTStageLikertQuestion == item.t ){
			classType = 'cp-likertItem';
			nameSuffix = 'li';
			elemType = 'div';
			rewrap = false;
		}
		
		else if ( cp.kCPOTOvalItem == item.t || cp.kCPOTRectangleItem == item.t || cp.kCPOTPolygon == item.t || cp.kCPOTAnswerArea == item.t || cp.kCPOTMatchingQuestionArea == item.t || cp.kCPOTMatchingAnswerArea == item.t || (cp.kCPOTLikertQuestionArea == item.t) || (cp.kCPOTLikertTotalGroupArea == item.t) ) {
			classType = 'cp-drawingItem'; 
		}
		else if ( cp.kCPOTTitleAutoShape == item.t || cp.kCPOTSubTitleAutoShape == item.t || cp.kCPOTAutoShape == item.t || cp.kCPOTRolloverAutoShape == item.t || cp.kCPOTStageCorrectFeedbackShape == item.t || cp.kCPOTSuccessShapeItem == item.t
					|| cp.kCPOTStageIncorrectFeedbackShape == item.t || cp.kCPOTFailureShapeItem == item.t || cp.kCPOTHintShapeItem == item.t || cp.kCPOTStagePartialCorrectFeedbackShape == item.t || cp.kCPOTRetryFeedbackShape == item.t ||
					cp.kCPOTIncompleteFeedbackShape == item.t || cp.kCPOTTimeoutFeedbackShape == item.t || cp.kCPOTAnswerFeedbackShape == item.t)
			classType = 'cp-autoShape';
		else if (cp.responsive && (cp.kCPOTScorableButtonItem == item.t || 
					cp.kCPOTRetakeButton == item.t ||
					cp.kCPOTStageQuestionNextButton == item.t ||
					cp.kCPOTStageQuestionClearButton == item.t ||
					cp.kCPOTStageQuestionBackButton == item.t ||
                    cp.kCPOTStageQuestionReviewModeNextButton == item.t ||
                    cp.kCPOTStageQuestionReviewModeBackButton == item.t ||
					cp.kCPOTStageQuestionSubmitButton == item.t ||
					cp.kCPOTScoringReviewButton == item.t ||
					cp.kCPOTScoringContinueButton == item.t ||
					cp.kCPOTSubmitAllButton == item.t ||
					cp.kCPOTResetButton == item.t ||
					cp.kCPOTUndoButton == item.t ||
					cp.kCPOTDDSubmitButton == item.t ||
					cp.kCPOTTextEntryButtonItem == item.t))
		{
			var lItemData = cp.D[item.n];
			if(lItemData.subt != cp.kImageButton)
			{
				if(lItemData.subt == cp.kTextButton)
				{
					elemType = "div";
					classType = 'cp-textbutton';
				}
				else
					classType = 'cp-drawingItem';
			}
		}
		//SetVisibilty of item
		this.SetItemVisibility(item);

		var itemElem;
		if(!iJustRearrange)
		{
			itemElem = cp.newElem(elemType);
			itemElem.id = item.n + nameSuffix;
			itemElem.setAttribute('class', classType);
		}
		else
		{
			itemElem = cp(item.n + nameSuffix);
		}
		
        if ( cp.kCPOTStageAnswerItem == item.t ){
        var itemData = cp.D[item.n + 'c'];
            var answerType = itemData['at'];
            if( answerType == cp.kCPOTStageSequenceAnswer ){
                itemElem.setAttribute('tabIndex', '-1');
				itemElem.setAttribute('aria-label',itemData['accstr']);
				cp.removeAccessibilityOutline( itemElem );
				itemElem.setAttribute('role','img');
            }
        }

		if ( cp.kCPOTTextEntryBoxItem == item.t  && item.d ) {
			if ( item.d.hc && item.d.hc.length > 0 && cp.device != cp.IDEVICE && cp.device != cp.ANDROID )
			{
				itemElem.setAttribute('onmouseover','cp.showHint("' + item.d.hc + '",this)');
				itemDiv.setAttribute('onmousemove','cp.showHint("' + item.d.hc + '",this)');
				itemElem.setAttribute('onmouseout','cp.hideHint("' + item.d.hc + '",this)');
			}
			if ( item.d.cur )
				itemElem.style.cursor = 'text';
		}
		
		var lDiv = undefined;
		if(rewrap)
		{
			var rewrapDiv;
			if(!iJustRearrange)
			{
				rewrapDiv = cp.newElem('div');
				rewrapDiv.id = 're-'+itemElem.id;
				rewrapDiv.setAttribute('tabIndex',-1);
				rewrapDiv.setAttribute('class', 'cp-rewrap');
				rewrapDiv.appendChild(itemElem);
			}
			else
			{
				rewrapDiv = cp('re-'+itemElem.id);
			}
			
			cp.removeAccessibilityOutline( rewrapDiv );           
		    
			lDiv = rewrapDiv;
			if(!(iJustRearrange && (cp.kCPOTWidgetItem == item.t || cp.kCPOTWebObject == item.t)))
				slideDiv.appendChild(rewrapDiv);
		}
		else
		{
			lDiv = itemDiv;
			if(!iJustRearrange)
				itemDiv.appendChild(itemElem);
			else
			{
				if(cp.kCPOTWidgetItem != item.t && cp.kCPOTWebObject != item.t)
					slideDiv.appendChild(itemDiv);
			}
		}
		var lZIndex = itemData.zIndex;
		lDiv.style.zIndex = lZIndex;

		cp.fixWebkitScaling(lDiv);
	}
	
	cp.Timeline.prototype.SetItemVisibility = function(inItem)
	{
		//Set Visibilty of Retake Button
		if(inItem && (cp.kCPOTRetakeButton == inItem.t))
		{
			if(!cp.movie.playbackController)
				return;
			var lButtonData = cp.D[inItem.n];
			if(lButtonData)
			{
				var lCanvasItem = lButtonData['mdi'];
				var lCanvasData = cp.D[lCanvasItem];				
				var lQuizController = cp.movie.playbackController.GetQuizController();
				if(lCanvasData && lQuizController){
					var lCanShowRetakeButton = lQuizController.CanShowRetakeButton();
					lCanvasData['visible'] = lCanShowRetakeButton;
					lCanvasData['effectiveVi'] = lCanShowRetakeButton;
				}
			}
		}
	}
	
	cp.setupSlideBGDivAndCanvasInternal = function(slide, slideHolderDiv, preDrawBGImg)
	{
		
		var lMovieWidth 	= cp.D.project.w;
		var lMovieHeight	= cp.D.project.h;
		
		var slideDivCreated = false;
		var slideDiv = slideHolderDiv.firstChild;
		
		if(!slideDiv)
		{
			slideDiv = cp.newElem('div');
			slideDiv.setAttribute('class', 'cp-frameset');
			slideDivCreated = true;
		}
		
		var oldSlideId = slideDiv.id;
		slideDiv.id = 'Slide' + slide.id;
		slideDiv.style.zIndex='0';
		
		if(!cp.responsive)
		{
			slideDiv.style.left='0px'; 
			slideDiv.style.width=lMovieWidth+'px';
			slideDiv.style.height=lMovieHeight+'px';
		}
		else
		{
			slideDiv.style.width="100%";
			slideDiv.style.height="100%";			
		}	

		if(slideDivCreated)
			slideHolderDiv.appendChild(slideDiv);
		
		var bgDiv;
		var bgDivFound = false;
		if(slideDivCreated)
			bgDivFound = false;
		else
		{
			if(slideDiv.firstChild && slideDiv.firstChild.id == '__bgDiv__')
			{
				bgDiv = slideDiv.firstChild;
				bgDivFound = true;
			}
		}
		
		var bgDivCreated = false;
		var bgDivRequired = false;
			
		var slideSvgStr = '';
		if (slide.gf) {
			bgDivRequired = true;
			
			if(!bgDivFound)
			{
				bgDiv = cp.newElem('div');
				bgDiv.id = '__bgDiv__';
				bgDivCreated = true;
			}	
			if (cp.browser_supports_svg)
			{
				var svgStr = cp.getGradientSvgStr(slide.gf, 
													lMovieWidth, 
													lMovieHeight, 
													(cp("project").clientWidth/lMovieWidth), 
													(cp("project").clientHeight/lMovieHeight));
				if (svgStr.length > 0) 
				{
					bgDiv.setAttribute('class', '');
					bgDiv.style.position='absolute';					
					if(cp.responsive)
					{
						bgDiv.style.width="100%";
						bgDiv.style.height="100%";
					}
					else
					{
						bgDiv.style.width=lMovieWidth + 'px';
						bgDiv.style.height=lMovieHeight + 'px';
					}	
					bgDiv.innerHTML = svgStr;
				}
			}
			else {
				bgDiv.setAttribute('class', 'cp-gf');
				bgDiv.style.position='absolute'; 
				if(cp.responsive)
				{
					bgDiv.style.width="100%";
					bgDiv.style.height="100%";
				}
				else
				{
					bgDiv.style.width=lMovieWidth + 'px';
					bgDiv.style.height=lMovieHeight + 'px';
				}
				
				if(bgDiv.firstChild && bgDiv.firstChild.nodeName == 'CANVAS')
					bgDiv.firstChild.id = 'Slide' + slide.id + 'gf';
				else
					bgDiv.innerHTML = '<canvas id="Slide' + slide.id + 'gf"></canvas>';
			}
		}
		else if (slide.imgf) {
			bgDivRequired = true;
			
			if(!bgDivFound)
			{
				bgDiv = cp.newElem('div');
				bgDiv.id = '__bgDiv__';
				bgDivCreated = true;
			}
			
			bgDiv.setAttribute('class','cp-imgf');
			bgDiv.style.position='absolute';
			if(cp.responsive)
			{
				bgDiv.style.width="100%";
				bgDiv.style.height="100%";
			}
			else
			{
				bgDiv.style.width=lMovieWidth + 'px';
				bgDiv.style.height=lMovieHeight + 'px';	
			}	
			
			if(bgDiv.firstChild && bgDiv.firstChild.nodeName == 'CANVAS')
				bgDiv.firstChild.id = 'Slide' + slide.id + 'imgf';
			else
				bgDiv.innerHTML = '<canvas id="Slide' + slide.id + 'imgf"></canvas>';
		}
		
		if(bgDivRequired)
		{
			if(bgDivCreated)
			{
				if(slideDiv.firstChild)
					slideDiv.insertBefore(bgDiv, slideDiv.firstChild);
				else
					slideDiv.appendChild(bgDiv);
			}
		}
		else
		{
			if(bgDivFound)
				slideDiv.removeChild(bgDiv);
		}
		
		var slideCanvas;
		
		if(!slideDivCreated)
			slideCanvas = document.getElementById(oldSlideId + 'c');
			
		if(!slideCanvas)
		{
			slideCanvas = cp.newElem('canvas');
			slideCanvas.setAttribute('class', 'cp-shape');
			slideDiv.appendChild(slideCanvas);
		}
		slideCanvas.id = 'Slide' + slide.id + 'c';
		
		var canvasData = cp.D[slideCanvas.id];
		var b = canvasData.b;
		var w = b[2] - b[0];
		var h = b[3] - b[1];
		var lShouldDrawBGColor = true;//(w != lMovieWidth || h != lMovieHeight);
		if(cp.responsive)
		{
			var pw = cp("project").clientWidth;
			var ph = cp("project").clientHeight;
			var slideW = w;
			var slideH = h;
			var lWScalingFactor = (pw/w);
			var lHScalingFactor = (ph/h);
				
			var lFactor = lWScalingFactor < lHScalingFactor ? lWScalingFactor : lHScalingFactor;	
			if(canvasData.aip)
			{
				lShouldDrawBGColor = true;
				slideW *= lFactor;
				slideH *= lFactor;
			}
			else
			{
				if(w > pw)
					slideW = pw;

				if(h > ph)
					slideH = ph;
			}

			var crop = canvasData.css[cp.ResponsiveProjWidth].crop;
			if(crop)
			{
				var lBGImg = cp.movie.im.images[canvasData.ip];
				if(lBGImg && lBGImg.nativeImage && lBGImg.nativeImage.complete)
				{
					var sRect = [0,0,lBGImg.nativeImage.width,lBGImg.nativeImage.height];
					var dRect = [crop["x"],crop["y"],slideW,slideH];
					var lRect = cp.getIntersectionRect(sRect,dRect);
					if((lRect.w >= 0 && lRect.w < slideW)
						|| (lRect.h >= 0 && lRect.h < slideH))
						lShouldDrawBGColor = true;
				}				
			}			

			slideCanvas.style.width = slideW + "px";
			slideCanvas.style.height = slideH + "px";
			slideCanvas.style.left = (cp("project").clientWidth - slideW)/2 + "px";
			slideCanvas.style.top = (cp("project").clientHeight - slideH)/2 + "px";
		}
		else
		{
			slideCanvas.style.width = w + "px";
			slideCanvas.style.height = h + "px";	
			slideCanvas.style.left = b[0] + "px";
			slideCanvas.style.top = b[1] + "px";
		}
		
		

		//Shape.drawIfNeeded will draw the same image later...we are drawing the BG image in advance to reduce flicker in iPad
		//==================
		if(preDrawBGImg && w > 0 && h > 0)
		{
			var imagePath = canvasData.aip?canvasData.aip:canvasData.ip;
			if(imagePath)
			{
				var img = cp.movie.im.images[imagePath];
				if(img && img.nativeImage.complete)
					slideCanvas.getContext('2d').drawImage(img.nativeImage, 0, 0, slideCanvas.clientWidth, slideCanvas.clientHeight);
			}
		}
		//==================

		if(slideDiv.style.backgroundColor != slide.bc)
		{
			if(lShouldDrawBGColor)
				slideDiv.style.backgroundColor=slide.bc;
		}
	}
	
	cp.Timeline.prototype.isSlideBGCropped = function()
	{
		if(!cp.responsive || !this.currentSlide || !cp.D[this.currentSlide.mdi])
			return false;

		var lSlideCData = cp.D[this.currentSlide.mdi];
		if(!lSlideCData)
			return false;

		var lCSSData = lSlideCData.css;
		if(!lCSSData)
			return false;

		var lCurrCSSData = lCSSData[cp.ResponsiveProjWidth];
		if(!lCurrCSSData)
			return false;

		var retVal = (lCurrCSSData.crop != undefined);
		if(retVal)
		{
			this.currentSlide.cropX = lCurrCSSData.crop.x;
			this.currentSlide.cropY = lCurrCSSData.crop.y;
		}		
		return retVal;
	}

	cp.Timeline.prototype.setupSlideDiv = function(slide, slideHolderDiv)
	{
		cp.setupSlideBGDivAndCanvasInternal(slide, slideHolderDiv, false);
			
		var slideDiv = slideHolderDiv.firstChild;
		var slideCanvas = document.getElementById('Slide' + slide.id + 'c');
		
		slideDiv.offsetHeight = slideDiv.offsetHeight;
		slideCanvas.offsetHeight = slideCanvas.offsetHeight;

		if(slide['st'] == "Question Slide")
		{
			slideHolderDiv.onclick = undefined;
			var lQuestionObjName = cp.getQuestionObjectName(slideDiv.id);
			var lQuestionObjData = cp.D[lQuestionObjName];
			if(lQuestionObjData)
			{	
				if(lQuestionObjData['qtp'] != 'Hotspot')
				{
					cp.removeGestureEvent(slideHolderDiv,cp.GESTURE_EVENT_TYPES.TAP);
				}	
				else
				{
					cp.registerGestureEvent(slideHolderDiv,cp.GESTURE_EVENT_TYPES.TAP,cp.handleClick);					
				}	
			}
		}
		else
		{
			cp.registerGestureEvent(slideHolderDiv,cp.GESTURE_EVENT_TYPES.TAP,cp.handleClick);
			if(cp.device == cp.DESKTOP)
			{
				slideHolderDiv.onmousemove = cp.handleMouseMoveNew;	
			}
		}	
		
		this.m_EffectAnimationManager = undefined;
		if(this.m_SlideHasEffects || cp.movie.PPTXSlide)
			this.m_EffectAnimationManager = PPTXLib.initializeAnimationManagerForCPSlide(slide);
		
		if(slide.si.length > 0)
		{
			var itemsArr = slide.si;
			var foundNonImmoObject = false;
			for(var i =0; i< itemsArr.length; ++i)
			{
				var item = itemsArr[i];
				
				var itemData = cp.D[item.n];
				itemData.zIndex = i;

				if(itemData.immo === false)
					foundNonImmoObject = true;
				
				var itemDiv;
				var existingElem = document.getElementById(item.n);
				if(existingElem)
				{
					//do nothing. Just rearrange the order.
					itemDiv = existingElem;
					var lRearrange = true;
					this.setupSlideItemDiv(item, itemData, slide, slideDiv, itemDiv, slideCanvas, lRearrange);
					if(itemData.rp == 1 && itemDiv.tabIndex !== -1)
					{
						if(itemData.rpa == 1)
								itemDiv.setAttribute("tabIndex",2499);
						else
								itemDiv.setAttribute("tabIndex",2500 + itemData.zIndex);
					}
					
				}
				else
				{
					itemDiv = cp.newElem('div');
					itemDiv.id = item.n;
					itemDiv.setAttribute('class', 'cp-frameset');
					this.setupAccessibility(item, itemDiv);

                    this.addHyperLinks(item, itemDiv);
					
					if ( cp.kCPOTTextEntryButtonItem == item.t )
					{
						var lFn = function(lTEBItemDiv)
						{
							return function(e){
										if(!cp.disableInteractions)
											cp.TEBValidator(lTEBItemDiv);
									};
						}
						cp.registerGestureEvent(itemDiv,cp.GESTURE_EVENT_TYPES.TAP,lFn(itemDiv));							
					}	
					if ( (cp.kCPOTScorableButtonItem == item.t || cp.kCPOTClickBoxItem == item.t || cp.kCPOTAutoShape == item.t) && item.d  )
					{
						if(item.d.hc && item.d.hc.length > 0 && cp.device != cp.IDEVICE && cp.device != cp.ANDROID)
						{
							itemDiv.setAttribute('onmouseover','cp.showHint("' + item.d.hc + '",this)');
							itemDiv.setAttribute('onmouseout','cp.hideHint("' + item.d.hc + '",this)');
						}
						if ( item.d.cur) 
						{
							if(cp.kCPOTAutoShape == item.t)
								itemData.handCursor = true;
							else
								itemDiv.style.cursor = "pointer";
						}
					}
					
					this.setupSlideItemDiv(item, itemData, slide, slideDiv, itemDiv, slideCanvas);

					if(itemData.immo === true && itemDiv.tabIndex !== -1)
					{
						if(slide.mmot)
							itemDiv.setAttribute("tabIndex",2499);
						else
							itemDiv.setAttribute("tabIndex",2500 + itemsArr.length);
					}
				}
				
				var lZIndex = itemData.zIndex;
				if(cp.kCPOTWidgetItem == item.t || cp.kCPOTWebObject == item.t)
				{
					if(this.m_useWidgetVersion7 || !existingElem)
						slideHolderDiv.appendChild(itemDiv);
				}
				else
					slideHolderDiv.appendChild(itemDiv);
				itemDiv.style.zIndex = lZIndex;

				cp.fixWebkitScaling(itemDiv);
			}
		}

		cp.createAlternativeAccessibleText(slideDiv,slide.accstr,'img');
		cp.removeAccessibilityOutline( slideDiv );

		var accStr = slide.accstr;
		if(cp.D.pref.acc === 0)
		accStr = " ";

		if(cp.SAFARI === cp.browser)
		{
			slideDiv.setAttribute('role', 'img');
		
	        slideDiv.setAttribute('aria-label', accStr);
		}
		else
		{
			var paraElem = cp.newElem('p');
			paraElem.innerHTML = accStr;
			var childDivElem = cp.newElem('div');
			childDivElem.id = slideDiv.id + "accStr2";
			childDivElem.style.opacity = 0;
			childDivElem.style.width = "0px";
			childDivElem.style.height = "0px";
			childDivElem.style.left = "-1999px";
			childDivElem.style.position = 'fixed';
			childDivElem.appendChild(paraElem);
			childDivElem.setAttribute('tabIndex', '2400');

			slideDiv.appendChild(childDivElem);
		}

	}
	
    cp.Timeline.prototype.addHyperLinks = function (inItem, inDiv)
    {
    	var lFn = function(iHyperlinkName)
		{
			return function(e)
					{
						cp.hyperlinkClick(iHyperlinkName);
					};
		};
        if(inItem)
		{
		    var lItemData = cp.D[inItem.n + 'c'];

            if (lItemData == undefined)
                return;
		    
		    //Is this item marked for accessibility
			var hasHyperLinks = lItemData.hasOwnProperty("hl");
			if (hasHyperLinks == false)
			    return;	

            //find out how many hyperlinks
            var lHyperLinks = lItemData['hl'].split(",");
            for (var i=0; i<lHyperLinks.length; ++i)
			{
                var hyperlinkName = lHyperLinks[i];
               
                if (hyperlinkName != '')
                {
                    //find the corresponding element and add the hyperlink
                 	var hyperLinkData = cp.D[hyperlinkName];
	                if (hyperLinkData == undefined)
	                    return;
	                var actionString = hyperLinkData['oca'];
	                if (actionString == '')
	                	return;
	                var questionTextCanvasBounds = hyperLinkData['b'];
	                if (questionTextCanvasBounds == '')
	                    return;

	                //for number of times a hyperlink is there in caption
	                var hyperlinkDiv;
                    if(cp.responsive)
                    {
                    	hyperlinkDiv = cp(hyperlinkName);
                    	if(hyperlinkDiv)
                    		return;

                    	var lHyperLinkClassName = hyperlinkName.split("_");
                    	lHyperLinkClassName = lHyperLinkClassName[0].substr(2);
                    	hyperlinkDiv = document.getElementsByClassName(lHyperLinkClassName);
                    	hyperlinkDiv = hyperlinkDiv[0];
                    	if(!hyperlinkDiv)
                    		continue;

                    	hyperlinkDiv.id = hyperlinkName;
                    }
                    else
                    {
                    	hyperlinkDiv = cp.newElem('div');
		            	hyperlinkDiv.id = hyperlinkName;
                    }                        
                    
                    //accessibility related stuff
                    var tabbingIndex = hyperLinkData['ti'];
                    hyperlinkDiv.setAttribute('tabIndex', tabbingIndex);
			        hyperlinkDiv.setAttribute('aria-label',hyperLinkData['accstr']);
			        if(cp.D.pref.hsr === 1)
			        cp.removeAccessibilityOutline( hyperlinkDiv );
			        hyperlinkDiv.setAttribute('role','link');
		            
                    if(!cp.responsive)
                    {
                    	hyperlinkDiv.style.display = 'block';
                    	hyperlinkDiv.style.position = 'absolute';

                        hyperlinkDiv.style.width = questionTextCanvasBounds[2] - questionTextCanvasBounds[0] +'px';
                        hyperlinkDiv.style.height = questionTextCanvasBounds[3] - questionTextCanvasBounds[1] +'px';
                        hyperlinkDiv.style.top = questionTextCanvasBounds[1]+'px';
                        hyperlinkDiv.style.left = questionTextCanvasBounds[0]+'px';
                        
                        hyperlinkDiv.style.backgroundColor = '#FFFFFF';
                    	hyperlinkDiv.style.opacity = 0;

                        inDiv.appendChild(hyperlinkDiv);
                    }

                    if(!cp.responsive)
                    {
                    	cp.registerGestureEvent(hyperlinkDiv,cp.GESTURE_EVENT_TYPES.TAP,lFn(hyperlinkName));
                    }	
                    hyperlinkDiv.style.cursor = 'pointer';
                }
            }
        }
    }

    cp.Timeline.prototype.setupAccessibility = function(inItem, inDiv)
	{
	    if(inItem)
		{
		    var lItemData = cp.D[inItem.n + 'c'];

            if (lItemData == undefined)
                return;
		    
            //Is this item marked for accessibility
			var isMarkedForAccessibility = lItemData.hasOwnProperty("accstr");
			if (isMarkedForAccessibility === false)
			    return;	
			
			var tabbingIndex = lItemData['ti'];
			var accessibilityString = cp.getAccessibilityString(lItemData);
			if ((inItem.t == cp.kCPOTCaptionItem) ||(inItem.t == cp.kCPOTTitleAutoShape)|| (inItem.t == cp.kCPOTScoringResultItem) || ( cp.kCPOTSuccessCaptionItem == inItem.t ) || (cp.kCPOTImageBoxItem == inItem.t)
				|| ( cp.kCPOTFailureCaptionItem == inItem.t ) || ( cp.kCPOTHintCaptionItem == inItem.t ) 
				|| ( cp.kCPOTIncompleteFeedbackItem == inItem.t ) || ( cp.kCPOTStageCorrectFeedback == inItem.t ) || ( cp.kCPOTStageIncorrectFeedback == inItem.t ) 
				|| ( cp.kCPOTStagePartialCorrectFeedback == inItem.t ) || ( cp.kCPOTTimeoutFeedbackItem == inItem.t ) || ( cp.kCPOTRetryFeedbackItem == inItem.t ) || (cp.kCPOTFillBlankCaption == inItem.t)
				|| ( cp.kCPOTStageMatchingQuestion == inItem.t ) || ( cp.kCPOTStageMatchingAnswer == inItem.t ) || ( cp.kCPOTStageAnswerItem == inItem.t ) || ( cp.kCPOTQuestionColumn == inItem.t ) 
				|| ( cp.kCPRolloverCaptionItem == inItem.t ) || ( cp.kCPRolloverImageItem == inItem.t ) || (cp.kCPOTStageCorrectFeedbackShape == inItem.t) || (cp.kCPOTSuccessShapeItem == inItem.t) 
				|| ( cp.kCPOTStageIncorrectFeedbackShape == inItem.t ) || ( cp.kCPOTFailureShapeItem == inItem.t ) || ( cp.kCPOTHintShapeItem == inItem.t) || (cp.kCPOTStagePartialCorrectFeedbackShape == inItem.t) 
				|| (cp.kCPOTRetryFeedbackShape == inItem.t) ||	(cp.kCPOTIncompleteFeedbackShape == inItem.t) || (cp.kCPOTTimeoutFeedbackShape == inItem.t)) 
			{
				inDiv.setAttribute('tabIndex', -1);
				if((cp.kCPOTFillBlankCaption == inItem.t))
					cp.createAlternativeAccessibleText(inDiv,lItemData['fibText'],'img');
				else
					cp.createAlternativeAccessibleText(inDiv,accessibilityString,'img');
				cp.removeAccessibilityOutline( inDiv );
			}
			else if( cp.kCPOTStageMatchingAnswerEntry == inItem.t )
			{
				inDiv.setAttribute('tabIndex', -1);
				cp.createAlternativeAccessibleText(inDiv,"",'img');
				cp.removeAccessibilityOutline( inDiv );	
			}
			else if ((inItem.t == cp.kCPOTScorableButtonItem )|| (inItem.t == cp.kCPOTRetakeButton) || (inItem.t == cp.kCPOTScoringReviewButton) || (inItem.t == cp.kCPOTScoringContinueButton))
			{
				inDiv.setAttribute('tabIndex', tabbingIndex);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'button');
				if(cp.D.pref.hsr === 1)
				cp.removeAccessibilityOutline( inDiv );

			}	
			else if (inItem.t == cp.kCPOTTextEntryButtonItem)
			{
				inDiv.setAttribute('tabIndex', tabbingIndex);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'button');
				if(cp.D.pref.hsr === 1)
					cp.removeAccessibilityOutline(inDiv);

			}	
			else if (inItem.t == cp.kCPOTClickBoxItem)
			{
				inDiv.setAttribute('tabIndex', -1);
				cp.removeAccessibilityOutline( inDiv );
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'button');

			}	
			else if ((inItem.t == cp.kCPOTLineItem) || (inItem.t == cp.kCPOTOvalItem) || (inItem.t == cp.kCPOTRectangleItem) || (inItem.t == cp.kCPOTPolygon) || (inItem.t == cp.kCPOTAutoShape) || (inItem.t == cp.kCPOTWebObject))
			{
				inDiv.setAttribute('tabIndex', tabbingIndex);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'img');
				if(cp.D.pref.hsr === 1)
				cp.removeAccessibilityOutline( inDiv );

			}
			else if ((inItem.t == cp.kCPOTStageQuestionText) || (inItem.t == cp.kCPOTStageQuestionTitle))
			{
				inDiv.setAttribute('tabIndex', -1);
				cp.removeAccessibilityOutline( inDiv );
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'img');

			}
			else if ((inItem.t == cp.kCPOTStageQuestionNextButton) || (inItem.t == cp.kCPOTStageQuestionClearButton) || (inItem.t == cp.kCPOTStageQuestionBackButton) || (inItem.t == cp.kCPOTStageQuestionReviewModeBackButton) || (inItem.t == cp.kCPOTStageQuestionReviewModeNextButton) || (inItem.t == cp.kCPOTStageQuestionSubmitButton) || (inItem.t == cp.kCPOTSubmitAllButton))
			{
				inDiv.setAttribute('tabIndex', tabbingIndex);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'button');
				if(cp.D.pref.hsr === 1)
				cp.removeAccessibilityOutline( inDiv );

			}
			else if ((inItem.t == cp.kCPOTAnimationItem) || (inItem.t == cp.kCPOTTAItem) || (inItem.t == cp.kCPOTTitleAutoShape) || (inItem.t == cp.kCPOTSubTitleAutoShape) )
			{
				inDiv.setAttribute('tabIndex', -1);
				cp.removeAccessibilityOutline(inDiv);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'img');
			}
			else if (inItem.t == cp.kCPOTFLVItem)
			{
				inDiv.setAttribute('tabIndex',tabbingIndex);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'presentation');

			}
			else if(inItem.t == cp.kCPOTWidgetItem)
			{
				inDiv.setAttribute('tabIndex',tabbingIndex);
				cp.createAlternativeAccessibleText(inDiv,accessibilityString,'application');
				if(cp.D.pref.hsr === 1)
				cp.removeAccessibilityOutline(inDiv);
			}
		}
	}

	cp.Timeline.prototype.getSlideDiv = function()
	{
		return this.mainSlideDiv;
	}

	cp.Timeline.prototype.canUpdateToFrame = function(frame, indexOfSlideToJumpTo)
	{
		var slideIndex = indexOfSlideToJumpTo;
		if(!slideIndex)
			slideIndex = this.getSlideIndexForFrame(frame);
		return this.canUpdateToSlide(slideIndex);
	}
	
	cp.Timeline.prototype.canUpdateToSlide = function(indexOfSlideToJumpTo)
	{
		if(indexOfSlideToJumpTo >= this.slides.length || indexOfSlideToJumpTo < 0)
			return false;
			
		if(cp.movie.playbackController)
		{	
			var lError = cp.movie.playbackController.AllowedToGoToSlide(cpInfoCurrentSlideIndex, indexOfSlideToJumpTo);
			return ( lError == "" );
		}
		return true;	
	}
			
	cp.Timeline.prototype.getSlideIndexForFrame = function(frame)
	{
		for(var i=0; i<this.slides.length; ++i)
		{					
			var slideName = this.slides[i];
			var slideData = cp.D[slideName];
							
			var from = slideData["from"];
			var to = slideData["to"];
			if( (frame >= from) && (frame <= to) )
			{
				return i;
			}
		}
		
		return -1;
	}
	
	cp.Timeline.prototype.getSlideNameForIndex = function(index)
	{
		if(0 <= index && index < this.slides.length)
			return this.slides[index];
		return '';
	}
	
	cp.Timeline.prototype.getSlideIndexForName = function(aName)
	{
		if((aName == undefined) || (aName ==''))
			return -1;
			
		for(var lSlideIndex =0; lSlideIndex< this.slides.length; ++lSlideIndex)
		{
			if(aName == this.slides[lSlideIndex])
				return lSlideIndex;
		}		
		return -1;
	}
	
	cp.Timeline.prototype.updatePlaybar = function(newFrame)
	{
		if(cp.verbose)
			cp.log('update playbar ' + newFrame);
		
		if(cp.responsive)
		{
			if(cp.PB && cp.PB.playbarCreated)
			{
				if(cp.PB.rootObj && cp.PB.rootObj.slider)
					this.frameSlider = cp.PB.rootObj.slider;
			}
		}

		if(!this.frameSlider)
		{
			this.frameSlider = document.getElementById('playbarSlider');
		}
		if(this.frameSlider!=undefined && this.frameSlider.updateSlider)	
		{
			var lFrameForSlider = newFrame - (Math.floor(cp.movie.framesToSkipForPlaybar) - cp.movie.framesToSkipForPlaybar);
			this.frameSlider.updateSlider( lFrameForSlider );
		}
	}
	
	cp.Timeline.prototype.updateToc = function(newFrame)
	{
		if(!cp.loadedModules.toc)
			return;
		if(!cp.D.tocProperties.showTotalD)
			return;	
		if(!this.toc)
		{
			this.toc = document.getElementById('tocFooterText');
		}
		if(this.toc!=undefined)	
			this.toc.updateTime( newFrame );				
	}
	
	cp.Timeline.prototype.updateSlideNumber = function(i)
	{
	}
	
	cp.Timeline.prototype.setAdjacentSlidesStartFrames = function(slides,i)
	{
		this.updateSlideNumber(i);
		var previousSlide = cp.D[slides[i - 1]];								
		if(previousSlide)
			this.previousSlideStartFrame = previousSlide["from"];
		else
			this.previousSlideStartFrame = -1;
		
		var nextSlide = cp.D[slides[i + 1]];
		if(nextSlide)
			this.nextSlideStartFrame = nextSlide["from"];
		else
			this.nextSlideStartFrame = -1;
	}
	
	cp.Timeline.prototype.AddEventListeners = function(slide)
	{
		if(slide.si.length > 0)
		{
			var itemsArr = slide.si;
			for(var i =0; i< itemsArr.length; ++i)
			{
				var item = itemsArr[i];
				var itemData = cp.D[item.n];
				var htmlItem = cp(item.n);
				if(htmlItem && itemData)
				{
					var added = false;
					var widthWiseTexts = {};
					if(!cp.responsive)
					{
						widthWiseTexts[cp.D.project.w] = [];
						widthWiseTexts[cp.D.project.w].push(itemData.vt);
					}	
					else if(itemData.rpvt)
					{
						var lResponsiveText = itemData.rpvt;
						var lastText = "";
						for(var key in lResponsiveText)
						{
							var lCurrText = lResponsiveText[key].vt;
							//if(lCurrText != lastText)
							{
								widthWiseTexts[key] = [];
								widthWiseTexts[key].push(lCurrText);
								lastText = lCurrText;
							}
						}						
					}

					for(var widthKey in widthWiseTexts)
					{
						var texts = widthWiseTexts[widthKey];
						if ( undefined == itemData.vars && undefined == itemData.varLens && undefined == itemData.texts )
						{
							itemData.vars = {};
							itemData.varLens = {};
							itemData.texts = {};
						}
						for(var currIdx = 0; currIdx < texts.length; ++currIdx)
						{
							text = texts[currIdx];
							if(text != undefined && text != "" )
							{
								if ( undefined == itemData.vars[widthKey] && undefined == itemData.varLens[widthKey] && undefined == itemData.texts[widthKey] ) {
									var i_vars = new Array();
									var i_varLens = new Array();
									var i_texts = new Array();
									var tokens = text.split('$$');
									if(tokens.length >= 3)
									{
										for ( var j = 0; j < tokens.length; j += 2 )
										{
											i_texts.push( tokens[ j ] );
											if ( j + 1 < tokens.length )
											{
												var token 		= tokens[ j + 1 ];
												if(!cp.vm || !cp.vm.hasOwnProperty(token))
												{
													i_texts.push("$$" + token + "$$");
													continue;
												}
												var tokenLen 	= 0;
												if(token && '' != token) {
													added = cp.em.addEventListener(htmlItem, cp.SPECIFIC_VARIABLE_CHANGED_EVENT, token );
													tokenLen = cp.vm.getVariableLength( token );
												}
												if ( undefined == token )
													token = '';
												i_vars.push( token );
												i_varLens.push( tokenLen );
											}
										}
									}
									else 
										i_texts.push( text );

									itemData.vars[widthKey] = i_vars;
									itemData.varLens[widthKey] = i_varLens;
									itemData.texts[widthKey] = i_texts;
								}
								else {
									for(var varKey in itemData.vars)
									{
										var currVars = itemData.vars[varKey];
										if(!currVars) continue;

										for ( var j = 0; j < currVars.length; ++j ) 
											cp.em.addEventListener( htmlItem, cp.SPECIFIC_VARIABLE_CHANGED_EVENT, currVars[ j ] );
									}										
								}
							}
						}		
					}
					
					if(added)
					{
						this.eventListeners.push(htmlItem);
					}				
				}
			}
		}
	}

	cp.Timeline.prototype.AddFeedback = function(feedback)
	{
		if (feedback)
			this.feedbacks.push(feedback);
	}
	
	cp.Timeline.prototype.RemoveFeedbacks = function( closeReason )
	{
		var i = 0;
		var feedbacksRetained = [];
		for (i = 0; i < this.feedbacks.length; ++i) {
			if ( cp.FeedbackCloseReason.SLIDE_CHANGE == closeReason || this.feedbacks[ i ].canHide( closeReason ) )
				this.feedbacks[ i ].hide();
			else
				feedbacksRetained.push( this.feedbacks[ i ] );
		}
		this.feedbacks = [];
		for (i = 0; i < feedbacksRetained.length; ++i) 
			this.feedbacks.push( feedbacksRetained[ i ] );
	}
	
	cp.Timeline.prototype.RemoveFeedback = function(feedback)
	{
		for (var i = 0; i < this.feedbacks.length; ++i) {
			if (this.feedbacks[ i ] == feedback) {
				this.feedbacks.splice( i, 1 );
				break;
			}
		}
	}
	
	cp.Timeline.prototype.UpdateFeedbacks = function()
	{
		for (var i = 0; i < this.feedbacks.length; ++i)
			this.feedbacks[ i ].update();
	}
	
	cp.Timeline.prototype.RemoveEventListeners = function()
	{
		for(var i = 0; i < this.eventListeners.length; ++i)
		{
			cp.em.removeEventListener(this.eventListeners[i], cp.SPECIFIC_VARIABLE_CHANGED_EVENT);
		}
		this.eventListeners.length = 0;
	}
	
	// May be used later.
	cp.Timeline.prototype.getFrameset = function(name)
	{
		var retVal = null, i = 0;
		for (i = 0; i < this.children.length; ++i) {
			if (name == this.children[ i ].element.id)
				return this.children[ i ];
		}
		return retVal;
	}
	
	cp.Timeline.prototype.selectivelyRemoveHTMLObjects = function(slideHolderDiv)
	{
		var slideDiv = slideHolderDiv.firstChild;
		if(!slideDiv)
			return;

		var thingsToPreserve = {}
		if(this.children)
		{
			for(var i = 1; i < this.children.length; ++i)
			{
				var frameset = this.children[i];
				var preserve = false;
				if(frameset.itemData.rp || frameset.itemData.ddv)
				{
					if(frameset.itemData.from <= cpInfoCurrentFrame && frameset.itemData.to >= cpInfoCurrentFrame)
						preserve = true;
				}
				if(cp.kCPOTVideo == frameset.type)
				{
					var displayObj = frameset.children[0];
					if(displayObj && displayObj.element)
					{
						var nativeVideo = displayObj.element.firstChild;
						if(nativeVideo && nativeVideo.tagName == 'VIDEO')
							preserve = true;
					}
				}
				else if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
				{
					if(cp.kCPOTFLVItem == frameset.type || cp.kCPFullMotion == frameset.type || cp.kCPOTVideo == frameset.type || cp.kCPOTVideoResource == frameset.type)
					{
						var displayObj = frameset.children[0];
						if(displayObj && displayObj.element)
						{
							var nativeVideo = displayObj.element.firstChild;
							if(nativeVideo && nativeVideo.tagName == 'VIDEO')
								preserve = true;
						}
					}
				}		

				if(preserve)
				{
					for(var j in frameset.children)
					{
						var displayObj = frameset.children[j];
						if(displayObj.element)
						{
							var parent = displayObj.element.parentElement;
							if(parent)
							{
								if(parent.className == "cp-rewrap")
									thingsToPreserve[parent.id] = 1;
								else
									thingsToPreserve[displayObj.element.id] = 1;
							}
						}
					}
					if(frameset.element)
						thingsToPreserve[frameset.element.id] = 1;
						
					if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
					{
						if(frameset.suppliedElement)
							thingsToPreserve[frameset.suppliedElement.id] = 1;
					}
				}
			}
		}
		
		var next;
		for(var child = slideDiv.firstChild; child; child = next)
		{
			next = child.nextSibling;

			if(!child || child.id == '__bgDiv__' || slideDiv.id + 'c' == child.id || thingsToPreserve[child.id])
				continue;
				
			child.onmouseover = null;
			child.onmouseout = null;
			child.ontouchstart = null;
			child.ontouchend = null;
			child.onmousedown = null;
			child.onmouseup = null;
			child.ontouchmove = null;
			child.onclick = null;
			cp.removeGestureEvent(child,cp.GESTURE_EVENT_TYPES.TAP);
			if(cp.verbose)
				cp.log('removing ' + child.id);
			slideDiv.removeChild(child);
		}
		
		for(var misc = slideDiv.nextSibling; misc; misc = next)
		{
			next = misc.nextSibling;
			if(!thingsToPreserve[misc.id])
			{
				misc.onmouseover = null;
				misc.onmouseout = null;
				misc.ontouchstart = null;
				misc.ontouchend = null;
				misc.onmousedown = null;
				misc.onmouseup = null;
				misc.ontouchmove = null;
				misc.onclick = null;
				cp.removeGestureEvent(misc,cp.GESTURE_EVENT_TYPES.TAP);
				if(cp.verbose)
					cp.log('removing ' + misc.id);
				slideHolderDiv.removeChild(misc);
			}
		}
		
		for(var i = this.parentChildMap.length -1; i >= 0; --i)
		{
			var key = this.parentChildMap[i].m_parent;
			if(!thingsToPreserve[key])
			{
				this.parentChildMap.splice(i, 1);
			}
		}
	}
	
	cp.Timeline.prototype.loadAssetsForSlideAtIndex = function(slideIndex)
	{
		if(cp.verbose)
			cp.log('loadAssetsForSlideAtIndex ' + slideIndex);

		//cp.movie.pause(cp.ReasonForPause.WAIT_FOR_RESOURCES);
		cp.movie.pm.loadSlideAssets(slideIndex);

		var n = cp.movie.pm.numSlidesToAttemptPreloaded();
		var baqPreload = false;
		var sgm = cp.D['sgMgr'];
		if(sgm)
		{
			var sg = sgm.sg;
			if(sg && sg.length > slideIndex)
			{
				var sl = sg[slideIndex][1];
				var len = sl.length;
				var idx = 0;
				while(n-- > 0 && idx < len)
				{
					if(slideIndex < this.slides.length - 1)
						cp.movie.pm.preloadSlideAssets(sl[idx][0]);
					++idx;
					baqPreload = true;
				}
			}
		}
		if(!baqPreload)
		{
			if(slideIndex < this.slides.length - 1)
				cp.movie.pm.preloadSlideAssets(slideIndex+1)
		}
	}
	
	cp.Timeline.prototype.addFramesetsForSlideAtIndex = function(slideIndex)
	{
		if(cp.verbose)
			cp.log('addFramesetsForSlideAtIndex ' + slideIndex);
		
		var tempSlideName = this.slides[slideIndex];
		var tempSlideData = cp.D[tempSlideName];
		var tempSlideID = tempSlideData['id'];
		var slideHolderDiv = this.getSlideDiv();
	
		this.RemoveFeedbacks(cp.FeedbackCloseReason.SLIDE_CHANGE);
		this.m_keyManager.clearHandlers();
		this.m_clickManager.clearClicks();
		
		this.selectivelyRemoveHTMLObjects(slideHolderDiv);
		
		this.m_lowestElementThatIsRestOfProjectAndOnTop = null;
		this.m_lowestRewrapElementThatIsRestOfProjectAndOnTop = null;
		this.itemsNotLoaded = [];
		
		this.setupSlideDiv(tempSlideData, slideHolderDiv);
		
		var lQuestionsOnSlide = tempSlideData['qs'].split(",");
		
		if(this.m_GraphManager)
			this.m_GraphManager.onSlideJump(slideIndex);
		
		if(cp.movie.playbackController)
		{				
			var lQuizController = cp.movie.playbackController.GetQuizController();
			if(lQuestionsOnSlide && (lQuestionsOnSlide != ""))
			{
				if(lQuestionsOnSlide.length > 0)
				{				
					if(!lQuizController)
						return;
						
					for(var questionIdx = 0; questionIdx < lQuestionsOnSlide.length; ++questionIdx)
					{
						var lQuestionObj = cp.getQuestionObject(lQuestionsOnSlide[questionIdx]);
						if(lQuestionObj)
						{
							if(this.verbose)
								cp.log("Starting question for : " + lQuestionsOnSlide[questionIdx]);
							lQuestionObj.m_isStarted = false;
						}					
					}				
				}		
			}
			
			if(lQuizController)
			{
				if(slideIndex == lQuizController.GetAnyScoreSlideIndex())
				{
					//lQuizController.SetIsInReviewMode(true);
					lQuizController.GetScore();
				
					//lQuizController.IncrementCurrentAttempt();
					if(!(lQuizController.GetIsAllowReviewMode()) && (lQuizController.GetIsQuizCompleted()))
					{
						cp.movie.paused = true;
						shouldShowSlide = false;									
					}	
					if(lQuizController.GetCurrentAttempt() >= lQuizController.GetNumberOfQuizAttempts())
					{
						if(lQuizController.GetIsAllowReviewMode())
						{								
							lQuizController.SetIsInReviewMode(true);
						}
						lQuizController.SetIsQuizCompleted(true);
						//lQuizController.HideRetakeButton();									
					}	
					if(lQuizController.GetIsPassed())
						lQuizController.SetIsQuizCompleted(true);
					
					lQuizController.GetScore();				
				}
				else
				{
					shouldShowSlide = false;
				}
			}		
		}
		rewrapChildrenMap = new Object();
		var framesets = [];
		var child = slideHolderDiv.firstChild;
		for( ; child; child = child.nextSibling)
		{
			if (child.nodeType != Node.ELEMENT_NODE)
				continue;

			if (child.nodeName == 'IMG')
				continue;
				
			
			var considerForUpdate = false;
			if('Slide' + tempSlideData.id == child.id)
				considerForUpdate = true;
			else
			{
				for(var k = 0; k < tempSlideData.si.length; ++k)
				{
					if(tempSlideData.si[k].n == child.id)
					{
						considerForUpdate = true;
						break;
					}
				}
			}
				
			var classNames = (child.className + "").split(" ");
			var isFrameset = (classNames.indexOf("cp-frameset") != -1);
			var isMask = classNames.indexOf("cp-mask") != -1;
			if (!isFrameset && !isMask)
			{
				//console.error("cp-timeline ", el, " should only contain cp-framesets or cp-mask. Invalid element: ", child);
				continue;
			}
	
			if (isFrameset)
			{
				var frameset = cp.parseFrameset(child);
				frameset.considerForUpdate = considerForUpdate;
				frameset.timeline = self;
				framesets.push(frameset);
			}
		}
		this.children = framesets;		

        var slideData = cp.D[this.slides[cpInfoCurrentSlideIndex]];
		/*if ( ! cp.movie.stage.hasItemsLoaded() ) {
			cp.movie.pause(cp.ReasonForPause.WAIT_FOR_RESOURCES);
		}*/
			
		var lInteractionManager = null;
		var interactions = slideData.iph;
        if( null != interactions && interactions.length > 0 )
		{
            lInteractionManager = this.m_interactionManagers[this.slides[cpInfoCurrentSlideIndex]];
            if(lInteractionManager == undefined)
            {		    
        	    lInteractionManager = cp.CreateInteractionManager(interactions);
                if(lInteractionManager)
                    this.m_interactionManagers[this.slides[cpInfoCurrentSlideIndex]] = lInteractionManager;
                cp.SetCurrentInteractionManager(lInteractionManager);
            }
            else
                cp.SetCurrentInteractionManager(lInteractionManager);
        }
		
		if(this.m_EffectAnimationManager)
			this.m_EffectAnimationManager.start();
	}			
	
	cp.Timeline.prototype.getCurrentSlideInteractionManager = function()
	{
		return this.m_interactionManagers[this.slides[cpInfoCurrentSlideIndex]];
	}
	
	cp.Timeline.prototype.handleRewindForFramesets = function()
	{
		for ( var i = 0; i < this.children.length; ++i ) 
			this.children[ i ].handleRewind();
	}
	
	cp.Timeline.prototype.initializeGraphManager = function()
	{
		if(!cp.D['baq'])
			return;

		var lBranchData = cp.D['sgMgr'];
		if(lBranchData==undefined)
			return;
		
		if(cp.movie.playbackController)
			this.m_GraphManager = cp.movie.playbackController.GetGraphManager();
		else
			this.m_GraphManager = new  cp.SlideGraphManager();
		
		if(this.m_GraphManager != undefined)
			this.m_GraphManager.initialize();
	}
	
	cp.Timeline.prototype.createQuestionObjs = function()
	{	
		this.questions = [];
		var questionStr = this.getAttribute("questions") || "";
		if (questionStr.length > 0 )
			this.questions = questionStr.split(",");
		for(var k = 0 ; k < this.questions.length; ++k)
		{
			var lQuestionObjName = this.questions[k];			
			
			if("" == lQuestionObjName)
				continue;
				
			var lQuestionData = cp.D[lQuestionObjName];
			var lSlideName = lQuestionData['sn'];
			var lQuestion;
			switch(lQuestionData['qtp'])
			{
				case 'MCQ':
					lQuestion = new cp.MultipleChoiceQuestion(lQuestionObjName,lSlideName);
					break;
				case 'Hotspot':
					lQuestion = new cp.HotspotQuestion(lQuestionObjName,lSlideName);
					break;	
				case 'Sequence':
					lQuestion = new cp.SequenceQuestion(lQuestionObjName,lSlideName);
					break;
					break;	
				case 'Matching':
					lQuestion = new cp.MatchingQuestion(lQuestionObjName,lSlideName);
					break;	
				case 'FIB':
					lQuestion = new cp.FIBQuestion(lQuestionObjName,lSlideName);
					break;	
				case 'ShortAnswer':
					lQuestion = new cp.ShortAnswerQuestion(lQuestionObjName,lSlideName);
					break;
				case 'Widget':
					lQuestion = new cp.WidgetQuestion(lQuestionObjName, lSlideName);
					break;
				case 'InteractiveItemQuestion':
					lQuestion = new cp.InteractiveItemQuestion(lQuestionObjName, lSlideName);
					break;
				case 'InteractiveWidgetQuestion':
					lQuestion = new cp.InteractiveWidgetQuestion(lQuestionObjName, lSlideName);
					break;
				case 'DragDropQuestion':
					var lItemName = lQuestionData['itn'];
					lQuestion = new cp.DragDropQuestion(lQuestionObjName, lSlideName, lItemName);
					break;
				case 'LIKERT':
					var lItemName = lQuestionData['itn'];
					lQuestion = new cp.LikertQuestion(lQuestionObjName, lSlideName, lItemName);
					break;
				default:
					lQuestion = new cp.Question(lQuestionObjName,lSlideName);
					break;
			}
			if(!lQuestion)
				break;
			cp.movie.questionObjs[k] = lQuestion;
		}	
	}
	
	cp.Timeline.prototype.getNextBoundForNoLoad = function(slideIndex)
	{
		slideIndex = (slideIndex < this.slides.length) ? slideIndex : (this.slides.length - 1);
		
		var tempSlideName = this.slides[slideIndex];
		var tempSlideData = cp.D[tempSlideName];
		
		return tempSlideData["to"];
	}
	
	cp.Timeline.prototype.getPreviousBoundForNoLoad = function(slideIndex)			
	{
		slideIndex = (slideIndex >= 0) ? slideIndex : 0;
		
		var tempSlideName = this.slides[slideIndex];
		var tempSlideData = cp.D[tempSlideName];
		
		return tempSlideData["from"];
	}	
	
	cp.Timeline.prototype.loadSlideAtIndex = function(i)
	{		
		if (this.slides.length <= 0)
			return;
			
		cp.resetDisplayAndIdMap();

		var slideName = this.slides[i];
		var slideData = cp.D[slideName];
						
		var from = slideData.from;
		var to = slideData.to;
		_cpInfoCurrentSlide = i+1;
		_cpInfoCurrentSlideLabel = slideData.lb;
		this.currentSlide = slideData;

		cp.adjustProjectHeight(this.currentSlide);			

		this.cStart = from;
		this.cEnd = to;
		this.audioCCItems = slideData.audCC;
		this.videoCCItems = slideData.vidCC;
		this.curAudCCItem = -1;
		this.curVidCCItem = -1;
		cp.movie.ccText.innerHTML = '';
		
		cp.movie.PPTXSlide = ("PPTX Slide" == slideData["st"]);
		this.m_SlideHasEffects = PPTXLib.hasAnimationInfo(slideData);
		cp.movie.resetMovieElapsedTime(cp.movie.PPTXSlide);
		cp.movie.am.changeCurrentSlide(i, from, true);
		
		slideData.v = true;
		var projData = cp.D.project_main;
		projData.currentFrame = from;						
		this.slideEnterAction = slideData.sea;
		this.slideExitAction = slideData.sxa;
		this.currentSlideStartFrame = from;
		this.currentSlideStartTime = (this.currentSlideStartFrame*1000)/cp.getCpInfoOriginalFPS();
		this.setAdjacentSlidesStartFrames(this.slides,i);

		////////Loading images of slide and slideItems						
		try
		{
			this.RemoveEventListeners();
			
			this.addFramesetsForSlideAtIndex(i);
			
			this.AddEventListeners(slideData);
			
			this.noSkipFrames = {};
			this.forEachChild(cp.updateNoSkipFramesAndUpdateVarText);
			PPTXLib.updateNoSkipFramesFromEffectData(slideData);
			this.noSkipFrames[this.cEnd] = this.cEnd;
			this.noSkipFrames[this.cEnd+1] = this.cEnd+1;
			
			var ddim = this.m_interactionManagers[slideName];
			if( ddim )
			{
				var f = ddim.PauseAtFrame();
				if(f != -1)
					this.noSkipFrames[f] = f;
			}
		}
		catch (e)
		{
			cp.log(e);
			if(e.stack)
			{
				cp.log(e.stack);
			}
		}
	}
	
	cp.Timeline.ReasonForUpdate = {};
	cp.Timeline.ReasonForUpdate.PROGRESS = 1;
	cp.Timeline.ReasonForUpdate.JUMP = 2;
	
	cp.Timeline.prototype.fallsOutsideCurrentSlide = function(frame)
	{
		return (this.cEnd < cpInfoCurrentFrame) || (this.cStart > cpInfoCurrentFrame);
	}

	cp.Timeline.prototype.updateSlideTransition = function()
	{
		if(!this.currentSlide || !this.currentTransition)
			return;
		if(this.cStart + 15 < cpInfoCurrentFrame)
		{
			this.currentTransition.reset();
			return;
		}	
		this.currentTransition.update(cpInfoCurrentFrame);
	}

	cp.Timeline.prototype.updateFrame = function(reasonForUpdate)
	{
		var lSameSlideSeek = true; //for singleton Audio
		this.updatingFrame = cpInfoCurrentFrame;
		if(cp.movie.executedActionOnFrame != this.updatingFrame)
			cp.movie.executedActionOnFrame = undefined;
		this.updatePlaybar(cpInfoCurrentFrame);
		this.updateToc(cpInfoCurrentFrame);
		
		{
			var timeUpdateData = new Object();
			timeUpdateData.frame = cpInfoCurrentFrame;
			timeUpdateData.timeInMillSecs = 1000*(cpInfoCurrentFrame/cpInfoFPS);
			cp.em.fireEvent('CPTime_Update',timeUpdateData);	
		}
		
		if (cpInfoCurrentFrame > this.lastFrame)
		{
			this.onEndOfMovie();
			return;
		}
		if(this.cEnd == cpInfoCurrentFrame)
		{
			/*html2canvas(cp("div_Slide"), {
				  onrendered: function(canvas) {
				  	var lOlderCanvas = cp("slide_transition_canvas");
				  	if(lOlderCanvas)
				  		cp("div_Slide").parentElement.removeChild(lOlderCanvas);	
				    cp("div_Slide").parentElement.appendChild(canvas);
				    canvas.id = "slide_transition_canvas";
				    
				  }
				});*/
			if(cp.movie.playbackController)
			{	
				var lQuizController = cp.movie.playbackController.GetQuizController();
				if(lQuizController)
				{
					var lLMSType = cp.movie.playbackController.GetLMSType();
					if(lLMSType)
						lLMSType = lLMSType.toUpperCase();
					if(lQuizController.GetIsReportingEnabled()&& (lLMSType != "EMAIL") &&
													(lLMSType != "ACROBAT") &&
													(lLMSType != "INTERNALSERVER"))
					{
						if(cp.m_isLMSPreview && cp.LMSDriverHolder != undefined)
							cp.toggleLMSPreviewDebugLogsColor(cp.LMSDriverHolder);
						//Optimization for number of calls to LMS
						//cp.movie.playbackController.SendCourseData((!cp.movie.playbackController.LMSIsAICC() || !cp.movie.playbackController.IsRunningInConnect()));//AICC Performance Improvement
						cp.movie.playbackController.SendCourseData(false);
					}

				}
			}
			
			var nextSlideIndex = 1;
			if(cpInfoCurrentSlideIndex)
			{
				nextSlideIndex = cpInfoCurrentSlideIndex + 1;
			}
			
			//Check for the last slide
			if(nextSlideIndex >= this.slides.length && cp.movie.playbackController)
			{
				var lQuizController = cp.movie.playbackController.GetQuizController();	
				if(lQuizController)
				{
					var lHandledSubmitAllOnLastSlide = lQuizController.DoSubmitAll(cpInfoCurrentSlideIndex);
					if(lHandledSubmitAllOnLastSlide)
					{
						cp.movie.pause(cp.ReasonForPause.CANNOT_MOVE_AHEAD);
						return;
					}
				}
			}
			
			if(!this.canUpdateToSlide(nextSlideIndex) && nextSlideIndex < this.slides.length)
			{
				cp.movie.pause(cp.ReasonForPause.CANNOT_MOVE_AHEAD);
				return;
			}

			cp.movie.play();
			
			var tmp = cpInfoCurrentFrame;
			var isQuizControllerHandlingSlideExit = false;
			//Note: Since there is not slide Exit action for QuizSlide so, execute LeaveSlide for the QuizSlide(Question/ResultSlide)
			if(cp.movie.playbackController)
			{
				var lQuizController = cp.movie.playbackController.GetQuizController();	
				if(lQuizController)
				{
					var lSlideType = lQuizController.GetSlideType(cpInfoCurrentSlideIndex);
					if((lSlideType == "Question") || (lSlideType =="AnyScoreSlide"))
					{
						isQuizControllerHandlingSlideExit = lQuizController.LeaveSlide(cpInfoCurrentSlideIndex);
					}	
				}
			}
			
			if(typeof(cptb) != 'undefined')
			{
				if(cptb.onSlideExit)
				{
					cptb.onSlideExit(cp.D[this.slides[cpInfoCurrentSlideIndex]]);
				}
			}
			if(!isQuizControllerHandlingSlideExit)
				cp.movie.frameBasedExecuteAction(this.slideExitAction);	
			if(tmp != cpInfoCurrentFrame)//slide exit action must have triggered a jump
				return;//we may have to load assets, so let us give _onEnterFrame a chance to do that
		}
		
		// Means I need to load..
		var slideLoaded = false;
		if( this.fallsOutsideCurrentSlide(cpInfoCurrentFrame))
		{
			if(this.currentTransition && this.currentTransition.reset)
			{
				this.currentTransition.reset();
				this.currentTransition = undefined;
			}	
        	if(this.cEnd != -1)
			{
				var slideName = this.slides[cpInfoCurrentSlideIndex];
				var ddim = this.m_interactionManagers[slideName];
				if(ddim)
				{
					ddim.handleSlideExit();
				}

				var slideData = cp.D[slideName];
				slideData.slideNumber = cpInfoCurrentSlideIndex + 1;
                slideData.lcpversion = CaptivateVersion;
                slideData.frameNumber = cpInfoCurrentFrame;
                var percentageSlidesVisited = -1;
                if(cp.movie)
		        {
			         var lplaybackController = cp.movie.playbackController;	
			         if(lplaybackController)
					        percentageSlidesVisited = lplaybackController.GetPercentageSlidesSeen();
		        }	
                slideData.percentageSlideSeen = percentageSlidesVisited;
                if(cp.IsRunningInACAP)
		    		slideData.navid = this.slides[cpInfoCurrentSlideIndex];
				cp.em.fireEvent('CPSlideExit',slideData);
			}
		
			this.onEndOfSlide(reasonForUpdate);
			_cpInfoPrevSlide = cpInfoCurrentSlideIndex;
			_cpInfoLastVisitedSlide = cpInfoCurrentSlideIndex;			
			cp.movie.cpInfoLastVisitedSlideStartFrame = this.currentSlideStartFrame;
			var lNewSlideIndex = this.getSlideIndexForFrame(cpInfoCurrentFrame);
			//LeaveCurrentSlide
			if(cp.movie.playbackController)
				cp.movie.playbackController.LeaveCurrentSlide(lNewSlideIndex);

			//Load New Slide
			this.loadSlideAtIndex(lNewSlideIndex);
			slideLoaded = true;
			//Set NewSlide as CurrentSlide			
			if(cp.movie.playbackController)
				cp.movie.playbackController.SetCurrentSlide(lNewSlideIndex);

			if(typeof(cptb) != 'undefined'){
				if(cptb.onSlideEnter)
				{
					cptb.onSlideEnter(cp.D[this.slides[cpInfoCurrentSlideIndex]]);
				}
			}
			
			cp.movie.frameBasedExecuteAction(this.slideEnterAction);

            var slideData = cp.D[this.slides[cpInfoCurrentSlideIndex]];
            slideData.slideNumber = cpInfoCurrentSlideIndex + 1;
            slideData.frameNumber = cpInfoCurrentFrame;
            slideData.lcpversion = CaptivateVersion;
            var percentageSlidesVisited = -1;
            if(cp.movie)
	        {
		         var lplaybackController = cp.movie.playbackController;	
		         if(lplaybackController)
				        percentageSlidesVisited = lplaybackController.GetPercentageSlidesSeen();
	        }	
            slideData.percentageSlideSeen = percentageSlidesVisited;
		    if(cp.IsRunningInACAP)
		    	slideData.navid = this.slides[cpInfoCurrentSlideIndex];
		    cp.em.fireEvent('CPSlideEnter',slideData);

		    if(slideData['st'] == "Question Slide")
		    {
		    	/*
		    	var QuizModelObj = String(slideData.qs);
		    	console.log(QuizModelObj);
		    	if(QuizModelObj)
		    	{
			    	var QuizModelObjName = cp.D[QuizModelObj].sn;
			    	var QuestionObj = cp.getQuestionObject(QuizModelObjName);
			    	var QuizSlideData = QuestionObj.getQuestionEventData();
					cp.em.fireEvent('CPQuizSlideReached',QuizSlideData);
		    	}
		    	else
		    	console.log("fail");*/
		    	var QuizSlideData={};
		    	QuizSlideData.slideNum = slideData['slideNumber'];
				cp.em.fireEvent('CPQuizSlideReached',QuizSlideData);		    	
		    }

		    var slidediv = document.getElementById(this.slides[lNewSlideIndex]);
			if(slidediv)
			{
				var accDiv = document.getElementById(slidediv.id + 'accStr2');
				if(accDiv)
				accDiv.focus();
			}
			
			lSameSlideSeek = false;

			this.currentTransition = cp.getSlideTransition(this.currentSlide);
		}
		
		this.syncMotionToFrame(cpInfoCurrentFrame);

		this.updateSlideTransition(cpInfoCurrentFrame);

		this.updateToFrame(cpInfoCurrentFrame, false,reasonForUpdate);
		
		if(cp.responsive && !lSameSlideSeek)
			cp.adjustResponsiveItems(cp.ReasonForDrawing.kSlideChanged);				
		
		if(reasonForUpdate == cp.Timeline.ReasonForUpdate.JUMP)
		{
			cp.movie.am.seekTo(cpInfoCurrentFrame, lSameSlideSeek);
			cp.movie.vdm.seekTo(cpInfoCurrentFrame, true);
		}
		
		if(slideLoaded)
		{
			var slideToPreload = this.getSlideIndexForFrame(cpInfoCurrentFrame) + 1;
			var slideName = cp.movie.stage.getSlideNameForIndex(slideToPreload);
			if(cp.multiAudioTrack)
			{
				if(slideName != '')
				{
					cp.movie.am.preload(slideName);
				}
			}
			if(slideName != '')
				cp.movie.vdm.preload(slideName);
		}

		var slideData = cp.D[this.slides[cpInfoCurrentSlideIndex]];
         if (slideData.si.length > 0) 
         {
            var itemsArr = slideData.si;
            var tebfocusindex = -1;
            for (var i = 0; i < itemsArr.length; ++i) 
            {
                var item = itemsArr[i];
                var itemData = cp.D[item.n];
                var currElem =document.getElementById(item.n);
                if(item.t === cp.kCPOTTextEntryBoxItem)
                {
                    if(tebfocusindex === -1)
                    {
                        tebfocusindex = i;
                    }
                    else
                    {
                         var previtem = itemsArr[tebfocusindex];
                         var previtemData = cp.D[previtem.n];
                         var prevElem =document.getElementById(previtem.n);

                         if(currElem.tabIndex < prevElem.tabIndex)
                            tebfocusindex = i;
                    }
                }
            }

            if(tebfocusindex !== -1)
            {
                var id = itemsArr[tebfocusindex].n;
                this.inputField = document.getElementById(id + "_inputField");
                if(this.inputField)
                    this.inputField.focus();
            }
        }
		
		this.pauseAtFrame(cpInfoCurrentFrame);
		
		if(!cp.movie.paused)
		{
			cp.movie.am.play(cpInfoCurrentFrame);
		}
		else if(cpInfoCurrentFrame == 1)
		{
			cp.movie.am.play(1,true);
		}
	}
	
	cp.Timeline.prototype.getNextSkipFrame = function()
	{
		if(cp["getCpIsPlaying"]() == false)
			return cpInfoCurrentFrame;

		var newFrame = cpInfoCurrentFrame;
		var nextSkipFrame = -1;

		for(var i in this.noSkipFrames)
		{
			var f = this.noSkipFrames[i];
			if(f >= newFrame)
			{
				nextSkipFrame = f;
				break;
			}
		}
		return nextSkipFrame;
	}

	/**
		This function checks what elapsed time the PPTXLib uses for animations, and checks if at any point, the elapsed time is ahead of the current frame it should be playing,
		In such cases we use the time calculated from the next skip frame
	*/
	cp.Timeline.prototype.canAdvanceCurrentFrameForEffects = function(elapsedTime)
	{
		var newFrame = cpInfoCurrentFrame;
		var nextSkipFrame = -1;
		for(var i in this.noSkipFrames)
		{
			var f = this.noSkipFrames[i];
			if(f >= newFrame)
			{
				nextSkipFrame = f;
				break;
			}
		}
		var skipFrameTime = (nextSkipFrame-cp["movie"]["stage"]["currentSlideStartFrame"])*1000/cp.getCpInfoOriginalFPS();
		if(elapsedTime > skipFrameTime)
			return false;
		return true;
	}


	cp.Timeline.prototype.attemptToAdvanceCurrentFrameByOffset = function(elapsedFrames)
	{
		if(elapsedFrames <= 0)
			return;
		
		var smoothAdvance = true;
		var newFrame = cpInfoCurrentFrame + elapsedFrames;
		for(var i in this.noSkipFrames)
		{
			var f = this.noSkipFrames[i];
			if(cpInfoCurrentFrame < f && newFrame > f)
			{
				newFrame = f;
				smoothAdvance = false;
				break;
			}
		}
		var lNewFrameObj = newFrame;
		if(smoothAdvance)
			lNewFrameObj = {"currFrame":newFrame,"smoothAdvance":true};
		_cpInfoCurrentFrame = lNewFrameObj;
	}
	
	cp.Timeline.prototype.updateFrameCurrentOnPause = function()
	{
		this.updateToFrame(cpInfoCurrentFrame, true);
	}
	
	cp.Timeline.prototype.pauseAtFrame = function(frame)
	{
		if (this.paused)
			return;
		this.paused = false;
		var self = this;
		this.forEachChild(function(child)
		{
			var actualElement = child.suppliedElement || child.element;
			var elem = cp.D[actualElement.id];
			var canvasItem = elem.mdi;
			var isVisible = (cp.D[canvasItem].visible);
			if(frame == cp.movie.stage.interactivePauseFrame)
				return;
			if (isVisible && ((child.pa == frame) || (child.rp_pa && frame == child.rp_pa)))
			{
				// Check whether handled. Return if item is handled OR item is quiz button(QSlide will have 'pa' property)
				//if(this.verbose)
				//	cp.log("Should pause for element : " + elem.id + " - " + !(elem.handled || elem.iqb));
				var isHandled = elem.handled;
				if ( isHandled ) {
					// For button and click box, we should still pause if handled.
					if ( cp.kCPOTClickBoxItem == elem.type || cp.kCPOTScorableButtonItem == elem.type || cp.kCPOTAutoShape == elem.type )
						isHandled = false;
				}
				if (isHandled || elem.iqb  || elem.clickedOnce)
					return;
				if ( undefined != elem.enabled && ! elem.enabled )
					return;

				cp.movie.am.interactiveItemFound = true;
				
				var divData = cp.D[child.element.id];
				if(divData.ssp)
				{
					cp.movie.am.ssp = 1;
				}
				
				cp.movie.pause(cp.ReasonForPause.INTERACTIVE_ITEM);

				if(cp.movie.paused  && null != cp.movie.stage.currentSlide)
					cp.movie.stage.currentSlide.topMostObjectInteractiveObject = child.element.id;
				return;
			}
			else if(child.psv == frame && isVisible)
			{
				if(elem.pausedOnce)
					return;
				if ( undefined != elem.enabled && ! elem.enabled )
					return;
				var dispObj = child.children[0];
				if(dispObj)
				{
					var e = dispObj.element;
					if(e)
					{
						var v = e.firstChild;
						if(v &&  v.tagName == 'VIDEO')
						{
							if(dispObj.started && (dispObj.paused || dispObj.ended))
								return;
						}
					}
				}
				elem.pausedOnce = true;
				cp.movie.pause(cp.ReasonForPause.EVENT_VIDEO_PAUSE);
			}
		});
        var lCurrentSlideInteractionManager = this.m_interactionManagers[this.slides[cpInfoCurrentSlideIndex]];
		if( lCurrentSlideInteractionManager != undefined )
		{
			if(frame == cp.movie.stage.interactivePauseFrame)
				return;
			var shouldPause = lCurrentSlideInteractionManager.CheckInteractionPause( frame );
			if(shouldPause)
				cp.movie.pause(cp.ReasonForPause.INTERACTIVE_ITEM);
		}
	}
	
	cp.Timeline.prototype.updateAudioCC = function()
	{
		if(!this.audioCCItems)
			return;
		
		var lCurrentSlideAudio = cp.movie.am.slideAudios[cp.movie.am.currentSlideAudio];
		if(!lCurrentSlideAudio)
			return;
		if(!lCurrentSlideAudio.nativeAudio)
			return;
		var lCurrentSlideAudioCurrentTime = lCurrentSlideAudio.nativeAudio.currentTime;
		var lFrameCountFromTime = lCurrentSlideAudioCurrentTime * cp.movie.fps;		
		//current implementation - might change with SWF changes
		var frame = 0;
		if(lFrameCountFromTime != 0)
			frame = lFrameCountFromTime + lCurrentSlideAudio.from;
		this.updateCC(this.audioCCItems, this.curAudCCItem, frame);
	}
	
	cp.Timeline.prototype.updateVideoCC = function(frame)
	{
		if(!this.videoCCItems)
			return;
		
		this.updateCC(this.videoCCItems, this.curVidCCItem, frame);
	}
	
	cp.Timeline.prototype.updateCC = function(iCCItems, iCurrItem, frame)
	{
		if(!cpCmndCC)
			return;		
		
		var ccDiv = cp.movie.cc;
		var ccTextDiv = cp.movie.ccText;
		var ccLineCount = cp.movie.ccLines;
		frame -= (this.cStart - 1);
		var i=iCCItems.length-1;
		var minFrame = 1;
		var maxFrame = this.cEnd - this.cStart + 1;
		if(i>=0)
		{
			minFrame = iCCItems[i].sf;
			maxFrame = iCCItems[i].ef;
		}
		for(;i >=0 ; --i)
		{
			if(minFrame > iCCItems[i].sf)
				minFrame = iCCItems[i].sf;
			if(maxFrame < iCCItems[i].ef)
				maxFrame = iCCItems[i].ef;
			if(iCCItems[i].sf <= frame && iCCItems[i].ef >= frame)
		{
				if(iCurrItem == i)
					return;
			var ccString = '';
			var tempStr = iCCItems[i].t.split("<br/>");
			if (tempStr.length>0) 
			{
				ccString=tempStr[0];
				for(var j=1;j<tempStr.length && j<ccLineCount;++j)
					ccString=ccString+"<br/>"+tempStr[j];
			}
			ccTextDiv.innerHTML = ccString;			
		}
	}
		if(frame<minFrame||frame>maxFrame)
			ccTextDiv.innerHTML = '';
	}
	cp.Timeline.prototype.updateToFrame = function(frame, force,reason)
	{
		if(frame > this.lastFrame)
		{
			return;
		}
		this.updateAudioCC();
		if (this.paused)
			return;
			
		if(this.yield)
			return;	

		var lCurrentRelativeFrameFromEnd = this.lastFrame - frame;
		if(this.fadeInAtStart && ( frame <= this.fadeInAtStart) )
			this.mainSlideDiv.style.opacity = frame/this.fadeInAtStart;
		else if(this.fadeOutAtEnd &&  (frame > (this.lastFrame - this.fadeOutAtEnd)) )
			this.mainSlideDiv.style.opacity = lCurrentRelativeFrameFromEnd/this.fadeOutAtEnd;
		else
		{
			// dont set opacity for below transitions as they modify opacity as part of transition
			if(!this.currentTransition || !(this.currentTransition.type == cp.SlideTransitionType.kFTFade || this.currentTransition.type == cp.SlideTransitionType.kFTPhoto))
			 	this.mainSlideDiv.style.opacity = 1;
		}
		
		this.updateVideoCC(frame);
		if(cp.movie.waitingForResources())
			return;
		
		var self = this;
		if(this.interactivePauseFrame != frame)
			this.interactivePauseFrame = -1;
		this.forEachChild(function(child)
		{
			if(child.considerForUpdate)
			{
				if (child.isInRange(frame))
				{
					if (!child.isStarted)
					{
						child.start(force,cp.ReasonForDrawing.kRegularDraw);
					}
					else if(force)
					{
						child.start(force,cp.ReasonForDrawing.kMoviePaused);	
					}
					else
						child.updateFrame(reason);
				}
				else if (child.isStarted)
				{
					child.reset();
				}
			}
		});
		
		if((this.m_EffectAnimationManager != undefined) && (cp.movie.PPTXSlide || this.m_SlideHasEffects))
			PPTXLib.updateAnimationManager();
	}
	
	cp.Timeline.prototype.onEndOfSlide = function(reason)
	{
		var self = this;
		this.forEachChild(function(child)
		{
			child.onEndOfSlide(reason);
		});
	}
	
	cp.Timeline.prototype.onEndOfMovie = function()
	{
		if(this.onEndOfMovieExecutedFrame != undefined && this.onEndOfMovieExecutedFrame < this.updatingFrame)
			return;
		
		this.onEndOfMovieExecutedFrame = this.updatingFrame;
		
		var self = this;

        cp.em.fireEvent('CPMovieStop');

		this.forEachChild(function(child)
		{
			child.onEndOfMovie();
		});
		
		cp.movie.pause(cp.ReasonForPause.MOVIE_ENDED);
		cp.movie.frameBasedExecuteAction(this.movieEndAction);
	}
	
	cp.Timeline.prototype.syncMotionToFrame = function(frame, iForce)
	{
		var self = this;
		this.forEachChild(function(child)
		{
			if (child.isStarted && child.isInRange(frame))
			{
				//if(!cp.movie.paused) // TODO: This was commented for mouse. But need to see how to do it only when frame changes.
					child.ApplyMotion(frame, iForce);
			}

		});
	}
	
	cp.Timeline.prototype.start = function()
	{
		this.paused = false;
		this.element.style.display = "block";
		this.m_keyManager.clearHandlers();
		this.m_clickManager.clearClicks();
		//To prevent the movie to resume from first frame when resuming from LMS. LMS resume sets the cpInfoCurrentFrame to last state before coming to this place of code.
		if(cpInfoCurrentFrame <= 1)
			_cpInfoCurrentFrame = 1;
		this.updateToFrame(cpInfoCurrentFrame);
		this.RemoveFeedbacks(cp.FeedbackCloseReason.SLIDE_CHANGE);
		this.clearParentChildMap();
	}
	
	cp.Timeline.prototype.reset = function()
	{
		this.paused = false;
		this.element.style.display = "none";
		this.m_keyManager.clearHandlers();
		this.m_clickManager.clearClicks();
		_cpInfoCurrentFrame = 0;
		this.updateToFrame(cpInfoCurrentFrame);
		this.RemoveFeedbacks(cp.FeedbackCloseReason.SLIDE_CHANGE);
		this.clearParentChildMap();
	}
	
	cp.Timeline.prototype.stop = function()
	{
		this.paused = true;
	}
})(window.cp);