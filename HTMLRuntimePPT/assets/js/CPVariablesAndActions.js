(function(cp)
{
	cp.enable = function(item)
	{
		var itemData = cp.D[item];
		if(itemData)
		{
			itemData.enabled = 1;
			
			if ( itemData.mdi )
			{
				if(itemData.type == cp.kCPOTTextEntryBoxItem)
				{
					var canvasItem = cp( itemData.mdi );
					if ( canvasItem )
					{
						var input = canvasItem.firstChild;
						if(input && (input.tagName == 'INPUT' || input.tagName == 'TEXTAREA'))
							input.disabled = false;
					}
				}
				
				var displayObj = cp.getDisplayObjByKey(itemData.mdi);
				if(displayObj)
					displayObj.enabled = 1;
				
				if(itemData.type == cp.kCPOTAutoShape && itemData.canvasPainterObject)
					itemData.canvasPainterObject.addMouseHandlers();
			}
		}
	}

	cp.animateItem = function(item,effectId,continueProj,iTriggeringItem,iTriggerType)
	{
		var lJSObject = cp.getDisplayObjByKey(iTriggeringItem);
		var lItemData = cp.D[iTriggeringItem];
		if(lItemData == undefined)
			return;
		if(lItemData.qtp != undefined)
		{
			/*means its a question slide trigger*/
			lJSObject = cp.getDisplayObjByKey(lItemData.sn);
		}
		
		if(lJSObject == undefined)
			return;
		if(iTriggerType != "Self")
		{
			lJSObject.m_triggerTimelineIds = lItemData["JSONTT_" + iTriggerType];
			var items = item.split("CPGroupTriggerEffectsDelimiterString");
			for(i=0; i<items.length; i++)
			{
				if(items[i]!= "")
				{		
					var lTriggerName = items[i] + "_" + effectId;
					console.log(lTriggerName);
					console.log(lJSObject);
					var considerTimesTriggered = true;
					PPTXLib.processTriggerForObject(lJSObject,lTriggerName,considerTimesTriggered);
				}
			}
		}
		else
		{
			//process self based animations like trigger animations
			var animationTrigger = lItemData["selfAnimationTrigger"];
			var items = animationTrigger.split(";");
			lJSObject.m_triggerTimelineIds = items;
			var items = item.split("CPGroupTriggerEffectsDelimiterString");
			for(i=0; i<items.length; i++)
			{
				var lTriggerName = items[i] + "_" + effectId;
				console.log(lTriggerName);
				console.log(lJSObject);
				var considerTimesTriggered = false;
				PPTXLib.processTriggerForObject(lJSObject,lTriggerName,considerTimesTriggered);
			}
		}
	}
	cp.disable = function(item)
	{
		var itemData = cp.D[item];
		if(itemData)
		{
			itemData.enabled = 0;
			
			if ( itemData.mdi )
			{
				if(itemData.type == cp.kCPOTTextEntryBoxItem)
				{
					var canvasItem = cp( itemData.mdi );
					if ( canvasItem )	
					{
						var input = canvasItem.firstChild;
						if(input && (input.tagName == 'INPUT' || input.tagName == 'TEXTAREA'))
							input.disabled = true;
					}
				}

				var displayObj = cp.getDisplayObjByKey(itemData.mdi);
				if(displayObj)
					displayObj.enabled = 0;
					
				if(itemData.type == cp.kCPOTAutoShape && itemData.canvasPainterObject)
					itemData.canvasPainterObject.removeMouseHandlers();
			}
		}
	}

	cp.contains = function(a,b)
	{
		if(!(typeof a == 'string' || a instanceof String))
			a = "" + a + "";
		if(!(typeof b == 'string' || b instanceof String))
			b = "" + b + "";
		
		return (a.indexOf(b) != -1);		
	}
	cp.actionChoicePauseMovie = function()
	{
		cp.movie.pause(cp.ReasonForPause.ACTION_CHOICE);
	}
	cp.actionChoiceContinueMovie = function()
	{
		cp.movie.play(cp.ReasonForPlay.ACTION_CHOICE);
	}
	cp.show = function(item)
	{
		var i = 0;
		var childArr;
		// Create an arr.
		var itemArr = new Array();
		var itemData;
		var oneItem;
		var canvasDataItem = null;
		
		itemArr.push( item );
		var lItemFramesetObj = cp.getDisplayObjByKey(item);
		cp.movie.stage.getChildrenForParent( item, itemArr );
		var lFrame = cpInfoCurrentFrame > cp.movie.stage.lastFrame ? cp.movie.stage.lastFrame : cpInfoCurrentFrame;
		for ( i = 0; i < itemArr.length; ++i ) {
			oneItem = itemArr[ i ];
			itemData = cp.D[oneItem];
			if(itemData)
			{
				itemData.effectiveVi = 1;
				// Check for canvas item.
				if ( itemData.mdi ) {
					canvasDataItem = cp.D[ itemData.mdi ];
					if ( canvasDataItem )
						canvasDataItem.effectiveVi = 1;
				}				
			}
		}
		cp._show(item);
		cp._showCurrentState(item);
	}

	cp._show = function(item,modifyAudioIfBaseItem,repaintUsingTextNode)
	{
		if(modifyAudioIfBaseItem === undefined)
			modifyAudioIfBaseItem = true;

		var i = 0;
		var childArr;
		// Create an arr.
		var itemArr = new Array();
		var itemData;
		var oneItem;
		var canvasDataItem = null;
		
		itemArr.push( item );
		var lItemFramesetObj = cp.getDisplayObjByKey(item);
		cp.movie.stage.getChildrenForParent( item, itemArr );
		var lFrame = cpInfoCurrentFrame > cp.movie.stage.lastFrame ? cp.movie.stage.lastFrame : cpInfoCurrentFrame;
		var isVideoItem = false;		
		for ( i = 0; i < itemArr.length; ++i ) {
			oneItem = itemArr[ i ];
			itemData = cp.D[oneItem];
			if(itemData)
			{
				itemData.visible = 1;
				// Check for canvas item.
				var bPlayAudio = true;
				if ( itemData.mdi ) {
					canvasDataItem = cp.D[ itemData.mdi ];
					if ( canvasDataItem )
						canvasDataItem.visible = 1;
						
					var displayObj = cp.getDisplayObjByKey(itemData.mdi);
					if(displayObj)
					{
						displayObj.visible = 1;

						// When changing to rollover and down states, item audio should not be changed.Bug#3919756.
						if(!modifyAudioIfBaseItem && cp.isBaseItemInState(displayObj))
							bPlayAudio = false;
						
						//if(lItemFramesetObj && lItemFramesetObj.isInRange(lFrame))
						//ignoring the check for video item as of now
						{
							if(displayObj.type == cp.kCPOTVideo && displayObj.nativeVideo)
							{
								isVideoItem = true;
								displayObj.nativeVideo.style.display = "block";
							}
							
							if(displayObj.element)
							{
								var fc = displayObj.element.firstElementChild;
								if(fc && fc.tagName == 'VIDEO')
								{
									isVideoItem = true;
									displayObj.nativeVideo.style.display = "block";
									displayObj.seekTo(displayObj.from);									
									if(displayObj.showControls && displayObj.nativeVideo)
									{
										if(cp.IDEVICE != cp.device || cp.IOSMajor >= cp.IOS8)
										{
											if(cp.movie.stage.NativeVideoElement)
											{
												cp.movie.stage.NativeVideoElement.style.backgroundColor = "#000000";
											}	
											cp.addVideoSkin(displayObj.actualParent, displayObj, displayObj.autoPlay);
										}
										else
											displayObj.nativeVideo.controls = true;	
									}
									if(displayObj.autoPlay)
										displayObj.play();
									else
									{
										displayObj.nativeVideo.style.position = "static";
										displayObj.nativeVideo.style.left = "0px";
									}
								}
							}	
						}
					}
				}
				
				var htmlItem = cp(oneItem);
				if (htmlItem)
				{
					if(isVideoItem || (lItemFramesetObj && lItemFramesetObj.isInRange(lFrame)))
					{
						htmlItem.style.visibility = 'visible';
						htmlItem.style.display = 'block';
					}	
					if(itemData.type == cp.kCPOTWebObject){
						//Hide iFrame also
						var iFrameElement = htmlItem.getElementsByTagName('iframe')[0];
						if(iFrameElement){
							iFrameElement.style.visibility = 'visible';
							iFrameElement.style.display = 'block';
						}
					}	
				}

				if(itemData.ia && bPlayAudio)
				{
					cp.movie.am.showHideObjectAudio(itemData.ia, true);
				}

				// Find out other children.
				if(itemData.iea && bPlayAudio)
				{
					cp.movie.am.playPauseEventAudio(itemData.iea, true);
				}				
			}
			else { // Temporary HTML element - example variable in text.
				var htmlItem = cp(oneItem);
				if (htmlItem)
				{
					if(isVideoItem || (lItemFramesetObj && lItemFramesetObj.isInRange(lFrame)))
					{						
						htmlItem.style.visibility = 'visible';
						var lIdx = oneItem.indexOf("-vtext_Handler");
						if(cp.responsive && lIdx != -1)
						{
							//means it is just the text handler for hyperlinks. It should not be visible
							var canvasId = oneItem.substr(0,lIdx);
							var canvasData = cp.D[canvasId];
							if(canvasData)
							{
								var hasHyperLinks = canvasData.hl;
								if(hasHyperLinks)
								{
									htmlItem.style.backgroundColor = "#ffffff";
									htmlItem.style.opacity = 0;
								}
							}
						}
					}
				}
			}
		
			cp.redrawItem(oneItem,repaintUsingTextNode);
		}
	}

	cp.hide = function(item)
	{
		var i = 0;
		var childArr;
		// Create an arr.
		var itemArr = new Array();
		var itemData;
		var oneItem;
		
		itemArr.push( item );
		
		cp.movie.stage.getChildrenForParent( item, itemArr );
		
		for ( i = 0; i < itemArr.length; ++i ) {
			oneItem = itemArr[ i ];
			itemData = cp.D[oneItem];
			if(itemData)
			{
				itemData.effectiveVi = 0;
				// Check for canvas item.
				if ( itemData.mdi ) {
					canvasDataItem = cp.D[ itemData.mdi ];
					if ( canvasDataItem )
						canvasDataItem.effectiveVi = 0;
				}
			}
		}

		cp._hide(item);
		cp._hideCurrentState(item);	
	}
	
	cp._hide = function(item,modifyAudioIfBaseItem)
	{
		if(modifyAudioIfBaseItem === undefined)
			modifyAudioIfBaseItem = true;

		var i = 0;
		var childArr;
		// Create an arr.
		var itemArr = new Array();
		var itemData;
		var oneItem;
		
		itemArr.push( item );
		
		cp.movie.stage.getChildrenForParent( item, itemArr );
		
		for ( i = 0; i < itemArr.length; ++i ) {
			oneItem = itemArr[ i ];
			itemData = cp.D[oneItem];
			if(itemData)
			{
				itemData.visible = 0;
				// Check for canvas item.
				var bStopAudio = true;
				if ( itemData.mdi ) {
					canvasDataItem = cp.D[ itemData.mdi ];
					if ( canvasDataItem )
						canvasDataItem.visible = 0;

					var displayObj = cp.getDisplayObjByKey(itemData.mdi);
					if(displayObj)
					{
						displayObj.visible = 0;

						// When changing to rollover and down states, item audio should not be changed.Bug#3919756.
						if(!modifyAudioIfBaseItem && cp.isBaseItemInState(displayObj))
							bStopAudio = false;

						if(!cp.CanPauseAudioDuringHide(displayObj))
							bStopAudio = false;

						var lIsVideo = false;
						if(displayObj.type == cp.kCPOTVideo)
						{
							lIsVideo = true;
						}
						else
						{
							if(displayObj.element)
							{
								var fc = displayObj.element.firstElementChild;
								if(fc && fc.tagName == 'VIDEO')
									lIsVideo = true;
							}							
						}
						if(lIsVideo)
						{
							if(displayObj.nativeVideo)
								displayObj.nativeVideo.style.display = "none";
							if(displayObj.pause)
							{
								displayObj.pause();
							}
						}
					}
				}
				
				var htmlItem = cp(oneItem);
				if (htmlItem)
				{
					htmlItem.style.visibility = 'hidden';
					if(itemData.type == cp.kCPOTWebObject){
						//Hide iFrame also
						var iFrameElement = htmlItem.getElementsByTagName('iframe')[0];
						if(iFrameElement){
							iFrameElement.style.visibility = 'hidden';
							iFrameElement.style.display = 'none';
						}
					}
				}
				
				if(itemData.ia && bStopAudio)
				{
					cp.movie.am.showHideObjectAudio(itemData.ia, false);
				}
				if(itemData.iea && bStopAudio)
				{
					cp.movie.am.playPauseEventAudio(itemData.iea, false);
				}
			}
			else { // Temporary HTML element - example variable in text.
				var htmlItem = cp(oneItem);
				if (htmlItem)
					htmlItem.style.visibility = 'hidden';
			}
		}
	}
	
	cp.jumpToPreviousSlide = function()
	{
		var previousSlideStartingFrame = cp.movie.stage.previousSlideStartFrame;
		if(previousSlideStartingFrame <= 0)
			previousSlideStartingFrame = 1; //jump to first frame
		
		var lCanPlayMovie = cp.movie.jumpToFrame(previousSlideStartingFrame);
		if(lCanPlayMovie)
			cp.movie.play();
	}
	
	cp.jumpToNextSlide = function()
	{
		var nextSlideStartingFrame = cp.movie.stage.nextSlideStartFrame;
		if(nextSlideStartingFrame != -1)
		{
			var lCanPlayMovie = cp.movie.jumpToFrame(nextSlideStartingFrame);
			if(lCanPlayMovie)
				cp.movie.play();
		}
		else if(!cp.movie.virgin && cp.movie.stage.slides.length - 1 == cpInfoCurrentSlideIndex)
		{
			cp.movie.play();
		}
	}
	
	cp.jumpToLastVisitedSlide = function()
	{
		cp.movie.jumpToFrame("cpInfoLastVisitedSlide");
		cp.movie.play();
	}
	var isAbsoluteURL = function(lURL)
	{
		if(lURL.search('http:')!= -1 || lURL.search('https:')!=-1 || lURL.search('www.')!=-1)
			return true;
		else
			return false;
	}
	cp.openURL = function(url, context)
	{
		var lFinalURL = url;
		if ( cp.MSIE != cp.browser )
			lFinalURL = encodeURI(url);
		if(cp.m_isPreview)
			cp.parentWindow.open(lFinalURL, context);	
		else if(cp.IsRunningInACAP && (context == '_self' || context =='_parent') && isAbsoluteURL(lFinalURL))
			cp.parentWindow.open(lFinalURL,'_blank');
		else
			cp.currentWindow.open(lFinalURL, context);
	}
	
	cp.openMovie = function(movie, context)
	{
		return cp.openURL(movie, context);
	}
	
	cp.sendEmail = function(to)
	{
		var w;
		if(cp.m_isPreview)
			w = cp.parentWindow.open('mailto:'+to, '_blank');
		else
			w = cp.currentWindow.open('mailto:'+to, '_blank');
		if(w)
		{
			w.close();    
		}
	}
	
	cp.showMessage = function(msg)
	{
		cp.alert(msg);
	}
	
	cp.runJavascript = function(script, context)
	{
		if(cp.verbose)
			cp.log('runJavascript [' + script + ']');
		try
		{
			var lWindow = window;
			switch(context)
			{
				case '_self':
				{
					lWindow = window;
					break;
				}
				case '_blank':
				{
					lWindow = window.open("");
					break;
				}
				case '_parent':
				{
					lWindow = window.parent;
					break;
				}
				case '_top':
				{
					lWindow = window.top;
					break;
				}
			}
			if (lWindow.execScript) 
			{
		        lWindow.execScript(script);
		    }
		    else 
		    {
		        lWindow.eval.call(lWindow,script);
		    };
		}
		catch(e)
		{
			cp.log(e);
		}
	}
	
	cp.stopMovie = function()
	{
		//cp.log('TODO::stopMovie');
	}
	
	cp.loopMovie = function()
	{
		cpCmndGotoSlideAndResume = 0;
	}
	
	cp.closeMovie = function()
	{
		//this function - DoCPExit, should be present in the HTML template. This function has logic of handling parent containers close if present
		if(DoCPExit)
			DoCPExit();
	}

	cp.playAudio2 = function(name)
	{
		return cp.playAudio(name, false);
	}

	cp.playAudio = function(name, onEndAutoPlayMovie)
	{
		var am = cp.movie.am;
		
		if(cp.lastMediaPlayReqTime)
		{
			if(((new Date()).getTime() - cp.lastMediaPlayReqTime.getTime()) < 50)
			{
				if(am.verbose)
					cp.log('crowded request postponed ' + name);
				setTimeout(function(){cp.playAudio(name, onEndAutoPlayMovie);}, 50);
				return;
			}
		}
		

		if(am.muted || 1 != cp.movie.speed)
			return;
			
		if(am.verbose)
			cp.log('cp.playAudio ' + name + ', ' + onEndAutoPlayMovie);
		
		if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
		{
			if(!cp.multiAudioTrack && (am.audioPlaying || cp.movie.stage.VideoPlaying))
			{
				if(am.verbose)
					cp.log('audioPlaying ' + am.audioPlaying + ' videoPlaying ' + cp.movie.stage.VideoPlaying);
				return;
			}
		}

		var eventAudioName = "PA" + name;
		var src = cp.D[eventAudioName].src;

		if(undefined == onEndAutoPlayMovie)
			onEndAutoPlayMovie = true;

		var pa = am.singletonPlayAudio;
		pa.pause();
		if(pa.nativeAudio != null)
		{
			pa.nativeAudio.cpAudio = null;
			pa.nativeAudio = null;
		}
		pa.onEndAutoPlayMovie = onEndAutoPlayMovie;
		pa.setSrc(src);
		pa.resetAndPlay();
	}
	
	cp.stopAudio = function(name)
	{
		cp.movie.am.singletonPlayAudio.pause();
	}

	cp.cv = function(a,b,c,d,e)
	{
		return cp.vm.createVariable(a,b,((c==1)?true:false),d,((e==1)?true:false));
	}
	
	cp.getCurrentStateNameForSlideItem = function(slideItem)

	{
		var cState = undefined ;
		var retVal = "";
		var lItemData = cp.D[slideItem];
    	if(!lItemData)
    		return retVal ;

    	//for slideitem present on the current slide
		var lItemCanvasObjKey = lItemData["mdi"];
    	
    	var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);
    		
    	if(lItemCanvasDisplayObj)
    	{
    		var stateArr = lItemCanvasDisplayObj.states;
    		var currentState = lItemCanvasDisplayObj.currentState;

    		if(currentState >= 0 && currentState < stateArr.length )
    		{
    			cState = stateArr[currentState];
    			retVal = cState.stn;
    		}
    	}
    	//for slide item NOT present on the current slide.
		else 
		{
			var tempStateArr = lItemData["stl"];
			if(tempStateArr !== undefined)
			{
				cState = lItemData["stis"];
				retVal = tempStateArr[cState].stn;
				if(lItemData["temporaryInitialState"] && lItemData["temporaryInitialState"]!=-1)
				{
					cState = lItemData["temporaryInitialState"];
					retVal = tempStateArr[cState].stn;
				}
			}
		}
    	return retVal;
	}

	// get IntegerValue if possible from operand
	cp.iv = function(operand)
	{
		var val = cp.ho(operand);

		// Ex: val = 12.a123
		// parseFloat(val) = 12;
		// parseFloat(val) == val -> false, hence return val ( 12.a123 - string )

		// Ex: val = 12.123
		// parseFloat(val) = 12.123;
		// parseFloat(val) == val -> true, hence return parseFloat(val) ( 12.123 - float value )

		// if(parseFloat(val) == val)
		// 	return parseFloat(val);

		// return val;

		if(isNaN(parseFloat(val)))
			return 0;
		
		return parseFloat(val);
	}

	cp.ho = function(operand)
	{
		if(typeof operand == "string")
		{
			var retVal;
			
			try
			{
				if(isNaN(Number(operand)))
					retVal = window[operand];
			}catch(e){}

			if(undefined != retVal)
				return retVal;

			try
			{
				//handle number literals
				if(!isNaN(Number(operand)))
					retVal = eval(operand);
			}catch(e){}

			if(undefined != retVal)
			{
				if(typeof retVal == "string")
				{
					var retVal2;
					try
					{
						retVal2 = eval(retVal);
					}catch(e){}
					
					if(undefined != retVal2)
						return retVal2;
				}
				return retVal;
			}
		}
		return operand;
	}


	//playbar related actions
	cp.playPause = function(fromPlaybar)
	{
		var reason;
		if(cp.movie.paused)
		{
			if (fromPlaybar == true)
				reason = cp.ReasonForPlay.PLAYBAR_ACTION;
			cp.movie.play(reason);
		}
		else
		{
			if (fromPlaybar == true)
				reason = cp.ReasonForPause.PLAYBAR_ACTION;
			cp.movie.pause(reason);
		}
	}
	
	cp.goToPreviousSlide = function()
	{
		cp.jumpToPreviousSlide()
	}
	cp.goToNextSlide = function()
	{
		cp.jumpToNextSlide();
	}
	cp.jumpToSlide = function(uid)
	{
		cpCmndGotoSlideByUIDAndResume = uid;
	}
	cp.rewind = function()
	{
		cpCmndRewindAndPlay = 1;
	}
	cp.showHideCC = function()
	{
		if(cpCmndCC)
			cpCmndCC = 0;
		else
			cpCmndCC = 1;
	}
	cp.showHideTOC = function()
	{
		var toc = document.getElementById('toc');
		if(toc!=undefined && toc.animator)
		{
			if(toc.animator.direction == 0)
				toc.animator.showTOC();
			else
				toc.animator.hideTOC();
		}
	}
	cp.fastForward = function()
	{
		cpCmndFastForward = 1;
	}
	cp.handleCCClick=function(event) 
	{	
		if(cp.DESKTOP != cp.device)
			return;
		//if ( cp.MSIE != cp.browser )
			//return;
		var lTarget = document.getElementById("div_Slide");
		//if(lTarget.onclick == null)
		//{

		if(!cp.ccdv)
			return;
		
			document.getElementById('cc').style.display = "none";
			lTarget = document.elementFromPoint(event.clientX,event.clientY);
			document.getElementById('cc').style.display = "block";
		//}
		if (event.initMouseEvent) 
		{     // all browsers except IE before version 9
			var clickEvent = document.createEvent ("MouseEvent");
			clickEvent.initMouseEvent ("click", true, true, window, 0, 
										event.screenX, event.screenY, event.clientX, event.clientY, 
										event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 
										0, null);
			lTarget.dispatchEvent (clickEvent);
		} 
		else 
		{
			if (document.createEventObject) 
			{   // IE before version 9
				var clickEvent = document.createEventObject (window.event);
				clickEvent.button = 1;  // left click			
				lTarget.fireEvent ("onclick", clickEvent);
			}
		}
	}
	cp.showInfoDialog = function()
	{
		var lPausedByInfo = false;
		if(!cp.movie.paused)
		{
			cp.movie.pause(cp.ReasonForPause.PLAYBAR_ACTION);
			lPausedByInfo = true;
		}
		var infoBGImage = cp.infoBgImg;	
		var lInfoDialog = cp.newElem("div");
		cp.project.appendChild(lInfoDialog);
		lInfoDialog.id = "infoDialog";	
		lInfoDialog.style.position = "absolute";
		lInfoDialog.style.backgroundImage = "url(" + infoBGImage.src + ")";	
		var lProjW = cp.D.project.w;
		var lProjH = cp.D.project.h;
		if(cp.responsive)
		{
			var lSlide = cp("div_Slide");
			lProjW = lSlide.clientWidth;
			lProjH = lSlide.clientHeight > window.innerHeight ? window.innerHeight : lSlide.clientHeight;
		}
		lInfoDialog.style.left = (lProjW - infoBGImage.width)/2 + "px";
		lInfoDialog.style.top = (lProjH - infoBGImage.height)/2 + "px";	
		lInfoDialog.style.width = infoBGImage.width + "px";
		lInfoDialog.style.height = infoBGImage.height + "px";	
		lInfoDialog.style.zIndex = 10000;
		
		var lInfoCloseButton = cp.newElem("div");
		var lFn = function(e){cp.project.removeChild(lInfoDialog);if(lPausedByInfo)cp.movie.play();};
		cp.registerGestureEvent(lInfoCloseButton,cp.GESTURE_EVENT_TYPES.TAP,lFn);

		lInfoCloseButton.style.cursor = "pointer";
		lInfoCloseButton.style.backgroundColor = "#ffffff";
		lInfoCloseButton.style.opacity = 0;	
		lInfoCloseButton.style.left = "170px";
		lInfoCloseButton.style.top = "5px";
		lInfoCloseButton.style.width = "15px";
		lInfoCloseButton.style.height = "15px";
		lInfoCloseButton.style.position = "absolute";
		lInfoCloseButton.style.display = "block";
		lInfoCloseButton.style.zIndex = 10000;
		lInfoDialog.appendChild(lInfoCloseButton);
		
		var lInformationDiv = cp.newElem("div");
		var lInfoStr = "<ul style='padding-left:15px;padding-right:15px;padding-top:20px;list-style-type: none;text-indent: 0em;'>";
		lInfoStr += "<li style='overflow:hidden'>" + cpInfoAuthor + "</li>";
		lInfoStr += "<li style='overflow:hidden'>" + cpInfoCompany + "</li>";
		lInfoStr += "<li style='overflow:hidden;cursor:pointer;' onclick='cp.sendEmail(\"" + cpInfoEmail + "\")'>" + cpInfoEmail + "</li>";
		
		var lCpInfoWebsite = "http://";
		
		if(cpInfoWebsite.indexOf("://") == -1)
			lCpInfoWebsite += cpInfoWebsite;
		else
			lCpInfoWebsite = cpInfoWebsite;
			
		lInfoStr += "<li style='overflow:hidden;cursor:pointer;' onclick='cp.openURL(\"" + lCpInfoWebsite + "\")'>" + cpInfoWebsite + "</li>";
		lInfoStr += "<li style='overflow:hidden'>" + cpInfoCopyright + "</li>";
		lInfoStr += "</ul>";
		
		lInformationDiv.innerHTML = lInfoStr;
		lInfoDialog.appendChild(lInformationDiv);
		
		var lInfoCPLinkButton = cp.newElem("div");
		var lFn = function(e){cp.openURL("http://www.adobe.com/products/captivate");};
		cp.registerGestureEvent(lInfoCPLinkButton,cp.GESTURE_EVENT_TYPES.TAP,lFn);
		lInfoCPLinkButton.style.cursor = "pointer";
		lInfoCPLinkButton.style.backgroundColor = "#ffffff";	
		lInfoCPLinkButton.style.opacity = 0;	
		lInfoCPLinkButton.style.left = "10px";
		lInfoCPLinkButton.style.bottom = "10px";
		lInfoCPLinkButton.style.width = "170px";
		lInfoCPLinkButton.style.height = "25px";
		lInfoCPLinkButton.style.position = "absolute";
		lInfoCPLinkButton.style.display = "block";
		lInfoDialog.appendChild(lInfoCPLinkButton);
	}
	cp.toggleMute = function()
	{
		if(cp.movie.am.muted)
		{
			cp.movie.am.mute(false);
		}
		else
		{
			cp.movie.am.mute(true);
		}
		if(cp.movie.vdm.muted)
		{
			cp.movie.vdm.mute(false);
		}
		else
		{
			cp.movie.vdm.mute(true);
		}
		cp.em.fireEvent('CPMovieAudioMute',cp.movie.am.muted);
	}
	cp.playbarMoved = function()
	{
		cpCmndPlaybarMoved=1;
	}
	document.Captivate = window.cp;
	window.m_VarHandle = window;
	cp.cpEIGetValue = function(iVarStr)
	{
		return eval.call(window,iVarStr);
	}
	cp.cpEISetValue = function(iVarStr,iVarVal)
	{
		var lExecutionStr = iVarStr + "=" + "\"" + iVarVal + "\"";
		eval.call(window,lExecutionStr);
	}
	
	cp.goToNextState = function(item)
	{
		var lItemData = cp.D[item];
		if(!lItemData)
			return;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);

		if(lItemCanvasDisplayObj)
		{
			var stateArr = lItemCanvasDisplayObj.states;
			var currStateIndex = lItemCanvasDisplayObj.currentState;
			if(currStateIndex < 0 || currStateIndex > (stateArr.length - 1))
				return;
			var lNextCustomStateIndex = (currStateIndex == stateArr.length - 1) ? 0 : currStateIndex + 1;
			while(lNextCustomStateIndex < stateArr.length && cp.isInbuiltState(stateArr[lNextCustomStateIndex]))
				lNextCustomStateIndex++;

			if(lNextCustomStateIndex == stateArr.length)
				return;
			var nextState = stateArr[lNextCustomStateIndex];
			if(nextState)
			{
				cp.changeState(item, nextState.stn);
			}
		}
		else
		{
			var currentStateName = cp.getCurrentStateNameForSlideItem(item);
			var nextStateIndex = cp.GetNextOrPreviousStateOfItemNotPresent(item, currentStateName, 0);
			if(nextStateIndex != -1)
			{
				//if(cp.canStateBeRetained_Name(nextStateIndex))
				lItemData["temporaryInitialState"] = nextStateIndex;
			}
		}
	}

	cp.isInbuiltState = function(state)
	{
		var lStateName = state.stn;
		if(	lStateName == "RollOver"	||
			lStateName == "Down"		||
			lStateName == "Visited"		||
			lStateName == "DragStart"	||
			lStateName == "DragOver"	||
			lStateName == "DropAccept"	||
			lStateName == "DropReject"	||
			lStateName == "DropCorrect"	||
			lStateName == "DropIncorrect"
			)
		return true;
		return false;
	}

	cp.goToPreviousState = function(item)
	{
		var lItemData = cp.D[item];
		if(!lItemData)
			return;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);

		if(lItemCanvasDisplayObj)
		{
			var stateArr = lItemCanvasDisplayObj.states;
			var currStateIndex = lItemCanvasDisplayObj.currentState;
			if(currStateIndex < 0 || currStateIndex >= stateArr.length)
				return;
			var lPrevCustomStateIndex = (currStateIndex == 0) ? (stateArr.length - 1) : (currStateIndex - 1);
			while(lPrevCustomStateIndex >= 0 && cp.isInbuiltState(stateArr[lPrevCustomStateIndex]))
				lPrevCustomStateIndex--;

			if(lPrevCustomStateIndex < 0)
				return;
			var nextState = stateArr[lPrevCustomStateIndex];
			if(nextState)
			{
				cp.changeState(item, nextState.stn);
			}
		}
		else
		{
			var currentStateName = cp.getCurrentStateNameForSlideItem(item);
			var prevStateIndex = cp.GetNextOrPreviousStateOfItemNotPresent(item, currentStateName, 1);
			if(prevStateIndex != -1)
			{
				//if(cp.canStateBeRetained_Name(prevStateIndex))
				lItemData["temporaryInitialState"] = prevStateIndex;
			}
		}
	}
	
	cp.changeState = function(item,state,modifyBaseItemAudio,repaintUsingTextNode)
	{
		var lItemData = cp.D[item];
		if(!lItemData)
			return;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);
		if(lItemCanvasDisplayObj)
		{
			var stateChangeInfo = cp.getInfoForStateChange(item,state);
			if(stateChangeInfo.bFound)
			{
				// When item is hidden just change the currentState property, instead of actually showing the state items.
				if(!lItemCanvasDisplayObj.getAttribute("effectiveVi"))
				{
					lItemCanvasDisplayObj.currentState = stateChangeInfo.stateIndex;
					lItemData["currentState"] = stateChangeInfo.stateIndex;

					if(lItemData["retainState"] === true && cp.canStateBeRetained_Name(state))
						lItemData["temporaryInitialState"] = stateChangeInfo.stateIndex;
					return;	
				}
		
				cp._changeState(item,state,false,modifyBaseItemAudio,repaintUsingTextNode);
			}
		}
		else
		{
			var stateList = lItemData["stl"];
			var temporaryInitialState = -1;
			if(stateList.length > 0)
			{
				for(var index=0; index < stateList.length; index++)
				{
					if(stateList[index]["stn"] == state)
					{
						temporaryInitialState = index;
						break;
					}
				}
			}
			if(temporaryInitialState != -1)
				lItemData["currentState"] = temporaryInitialState;
			
			if(cp.canStateBeRetained_Name(state))
				lItemData["temporaryInitialState"] = temporaryInitialState;
		}
	}

	cp._changeState = function(item,state,ibForceUpdate,modifyBaseItemAudio, repaintUsingTextNode)
	{
		//ibForceUpdate will execute _show and _hide even though the item is in the same state.
		var lItemData = cp.D[item];
		if(!lItemData)
			return;

		if( modifyBaseItemAudio === undefined )
			modifyBaseItemAudio = true;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);

		if(lItemCanvasDisplayObj)
		{
			var stateChangeInfo = cp.getInfoForStateChange(item,state);

			if(stateChangeInfo.bFound)
			{
				var currState = lItemCanvasDisplayObj.currentState;
				if(!ibForceUpdate && (currState === stateChangeInfo.stateIndex))
					return;
				
				// Call DND before State Change function
				var bHasDNDMouseHandlers = false;
				var currInteraction = cp.movie.stage.getCurrentSlideInteractionManager();
				if(currInteraction!=null)
					bHasDNDMouseHandlers = currInteraction.DoNecessaryStuffBeforeChangeState(item);

				// change currentState variable.
				lItemCanvasDisplayObj.currentState = stateChangeInfo.stateIndex;
				lItemData["currentState"] = stateChangeInfo.stateIndex;

				if(lItemData["retainState"] === true && cp.canStateBeRetained_Name( state))
					lItemData["temporaryInitialState"] = stateChangeInfo.stateIndex;

				// do actual Show/Hide of items.
				for(var i = 0 ; i < stateChangeInfo.showItemList.length ; ++i)
				{
					var itemName = cp.getDisplayObjNameByCP_UID(stateChangeInfo.showItemList[i]);
					cp._show(itemName,modifyBaseItemAudio,repaintUsingTextNode);	
					
					if(cp.D[itemName])
					{
						var script = cp.D[itemName]["selfAnimationScript"];
						if(script )//&& currState!=stateChangeInfo.stateIndex)
						{
							eval(script);
							
							var itemData = cp.D[itemName];
							if(itemData)
							{
								var canvasObjKey = itemData["mdi"];
								var canvasDisplayObj = cp.getDisplayObjByKey(canvasObjKey);

								if(canvasDisplayObj && canvasDisplayObj.updateEffects)
									canvasDisplayObj.updateEffects(true);	
							}
						}
					}
					
				}
				for(var i = 0 ; i < stateChangeInfo.hideItemList.length ; ++i)
				{
					var itemName = cp.getDisplayObjNameByCP_UID(stateChangeInfo.hideItemList[i]);
					var script = cp.D[itemName]["selfAnimationScript"];
					//Bug# 256425 : Object flickers on change of state event, so when hiding the additional object with effects itself we reset the effects on them
					if(script && PPTXLib.resetObjects)
						PPTXLib.resetObjects(itemName);
					cp._hide(itemName,modifyBaseItemAudio);
				}

				// Call DND After State Change function
				if(currInteraction!=null)
					currInteraction.DoNecessaryStuffAfterChangeState(item,bHasDNDMouseHandlers);
			}
		}
	}

	cp._showCurrentState = function(item)
	{
		var lItemData = cp.D[item];
		if(!lItemData)
			return;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);

		if(lItemCanvasDisplayObj)
		{
			var currentState = lItemCanvasDisplayObj.currentState;
			var statesArr = lItemCanvasDisplayObj.states;

			if( currentState >= 0 && currentState < statesArr.length )
			{
				var currStateObj = statesArr[currentState];
				if(currStateObj)
					cp._changeState(item,currStateObj.stn,true);
			}
		}

		return;	
	}

	cp._hideCurrentState = function(item)
	{
		var lItemData = cp.D[item];
		if(!lItemData)
			return;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);

		if(lItemCanvasDisplayObj)
		{
			var currentState = lItemCanvasDisplayObj.currentState;
			var statesArr = lItemCanvasDisplayObj.states;

			if( currentState >= 0 && currentState < statesArr.length )
			{
				var currStateObj = statesArr[currentState];
				if(currStateObj)
				{
					var statesItems = currStateObj.stsi;
					for(var i = 0 ; i < statesItems.length ; ++i)
					{
						var itemName = cp.getDisplayObjNameByCP_UID(statesItems[i]);
						cp._hide(itemName);
					}
				}				
			}
		}
	}

	cp.Executewhile = function ( conditionStr, actionStr )
	{
		if(eval(conditionStr) == true)
		{
			conditionStr = conditionStr.replace(/'/g, "\\\'");
			var escapedActionStr = actionStr.replace(/'/g, "\\\'");
			var tmpActionStr = actionStr.replace ( "#@LOOP-END@#", "cp.Executewhile('" + conditionStr + "','" + escapedActionStr + "');");
			eval(tmpActionStr);			
		}
	}

})(window.cp);