(function(cp)
{
	var rewrapChildrenMap = {};
	cp.ropMap = {};
	var displayObjectMap = {};
	cp.cpIDMap = {};

	cp.inherits = function(subClass, baseClass)
	{
        function inheritance() { }
        inheritance.prototype = baseClass.prototype;

        subClass.prototype = new inheritance();
        subClass.prototype.constructor = subClass;

        subClass.baseConstructor = baseClass;
        subClass.superClass = baseClass.prototype;
	}
	
	cp.getParameterByName = function (parameterName) {
		parameterName = parameterName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regex = new RegExp("[\\?&]" + parameterName + "=([^&#]*)");
		var location = window.location.search;
		var searchResult = regex.exec(location);
		return searchResult == null ? "" : decodeURIComponent(searchResult[1].replace(/\+/g, " "));
	}

	cp.getCorrectMediaPath = function(val)
	{
		var retVal = val ;
		if(cp.pg && window.device && window.device.platform === 'Android')
		{
			retVal = cp.Phonegap.getResourcePath(val);
		}
		return retVal ;
	}

	cp.log = function(msg)
	{
		var timeStampNeeded = false;
		if(timeStampNeeded)
		{
			msg = "@"+(new Date()).getTime() + " " + msg;
		}
		
		if(cp.customConsole)
		{
			cp.customConsole.value += msg;
		}
		else
		{
			if(cp.consolidateLogs && cp.logArray)
				cp.logArray.push(msg);
			else
				console.log(msg);
		}
	}
	
	cp.logObject = function(obj, objName)
	{
		if(!objName) objName = "";
		var str = "object " + objName + " : {";
		for(var key in obj)
		{
			str += key + ":" + obj[key] + "; ";
		}
		str += "}";
		cp.log(str);
	}

	cp.IsValidObj = function(obj) 
	{
		return (undefined != obj && null != obj);
	}

	cp.getCurrentBrowserVersion = function(iVersionString, iVersionSearchString) 
	{
		var index = iVersionString.indexOf(iVersionSearchString);
		if (index == -1) 
			return cp.UNKNOWN;
		return parseFloat(iVersionString.substring(index+iVersionSearchString.length+1));
	}

	cp.showColoredNonModalWarning = function(iMsg)
	{
		var lWarningDiv = cp.newElem("div");
		lWarningDiv.style.position = "fixed";
		lWarningDiv.style.right = "10px";
		lWarningDiv.style.bottom = "10px";
		lWarningDiv.style.backgroundColor = "#7f7f7f";
		lWarningDiv.style.border = "10px solid #FF0000";
		lWarningDiv.style.padding = "10px";
		lWarningDiv.style.fontSize = "22px";
		lWarningDiv.style.zIndex = "10000";
		lWarningDiv.innerHTML = iMsg;

		cp.parentWindow.document.body.appendChild(lWarningDiv);
			
		setTimeout(function()
		{
			cp.parentWindow.document.body.removeChild(lWarningDiv);
		},1000);
	}

	cp.getRoundedValue = function(iVal, iNumberOfDecimalPlaces)
	{
		if(iNumberOfDecimalPlaces == undefined)
			iNumberOfDecimalPlaces = 2;

		var lFactor = Math.pow(10,iNumberOfDecimalPlaces);
		iVal = Math.round(iVal * lFactor)/lFactor;
		return iVal;
	}

	cp.resetDisplayAndIdMap = function()
	{
		displayObjectMap = {};
		cp.cpIDMap = {};		
	}

	cp.getDisplayObjByCP_UID = function(UID)
	{
		var lInstanceId = cp.cpIDMap[UID];
		return displayObjectMap[lInstanceId];
	}

	cp.getDisplayObjByKey = function(key)
	{
		return displayObjectMap[key];
	}

	cp.getDisplayObjNameByCP_UID = function(UID)
	{
		var lInstanceId = cp.cpIDMap[UID];
		var lInstanceName = "" ;
		if(lInstanceId)
		{
			lInstanceName = cp.D[lInstanceId].dn;
		}
		return lInstanceName;
	}

	cp.getParentStateObjectForItem = function(item)
	{
		var retVal = undefined;
		var baseStateItemID = item.baseStateItemID;
		if(baseStateItemID && baseStateItemID != -1)
		{
			var baseStateItem = cp.getDisplayObjByCP_UID(baseStateItemID);
			if(baseStateItem)
			{
				var stateArr = baseStateItem.states;
				if(stateArr)
				{
					for(var index = 0 ; index < stateArr.length ; ++index )
					{
						var stateIter = stateArr[index];
						if(stateIter)
						{
							var stateItems = stateIter.stsi ;
							for(var itemIndex = 0 ; itemIndex < stateItems.length ; ++itemIndex)
							{
								var currItem = stateItems[itemIndex];
								if(currItem == item.getAttribute("uid"))
								{
									retVal = stateIter;
									break;
								}
							}
						}
					}
				}
			}
		}
		return retVal ;
	}

	cp.getCurrentStateObjectForItem = function(item)
    {
    	var retVal = undefined ;

		if(item)
    	{
    		var stateArr = item.states;
    		var currentState = item.currentState;

    		if(currentState >= 0 && currentState < stateArr.length )
    		{
    			retVal = stateArr[currentState];
    		}
    	}

    	return retVal;	
    }

	cp.hasStateOfType = function(item,stateType)
	{
		var retVal = false;

		if(item)
		{
			var stateArr = item.states;
			if(stateArr)
			{
				for(var index = 0 ; index < stateArr.length ; ++index )
				{
					var stateIter = stateArr[index];
					if(stateIter)
					{
						if(stateIter.stt == stateType)
						{
							retVal = true;
							break;
						}
					}
				}
			}
		}

		return retVal;
	}

	cp.getStateName = function(item,stateIndex)
	{
		var retVal = "";

		if(item)
		{
			var stateArr = item.states;
			if(stateArr)
			{
				if(stateIndex >= 0 && stateIndex < stateArr.length)
				{
					var stateData = stateArr[stateIndex];
					if(stateData)
					{
						retVal = stateData["stn"];
					}
				}
			}
		}

		return retVal;
	}

	cp.getBaseStateItem = function(item)
	{
		var retVal = item;
		if(item)
		{
			if(-1 !== item.baseStateItemID)
			{
				var baseItem = cp.getDisplayObjByCP_UID(item.baseStateItemID);
				if(baseItem)
					retVal = baseItem;
			}
		}
		return retVal;
	}

	cp.getStateType = function(item, stateIndex)
	{
		var retVal = cp.kSTTNone;
		if(item)
		{
			var stateArr = item.states;
			if(stateArr)
			{
				if(stateIndex >= 0 && stateIndex < stateArr.length)
				{
					var stateData = stateArr[stateIndex];
					if(stateData)
					{
						retVal = stateData["stt"];
					}
				}
			}
		}

		return retVal;
	}

	cp.canStateBeRetained_Type = function(stateType)
	{
		if(	stateType == cp.kSTTRollOver	||
			stateType == cp.kSTTDown		||
			stateType == cp.kSTTDragStart	||
			stateType == cp.kSTTDragOver	||
			stateType == cp.kSTTDropReject	||
			stateType == cp.kSTTDropAccept	||
			stateType == cp.kSTTDropCorrect	||
			stateType == cp.kSTTDropIncorrect
			)
			return false;
		return true;
	}

	cp.canStateBeRetained_Name = function(stateName)
	{
		if(	stateName == "RollOver"		||
			stateName == "Down"			||
			stateName == "DragStart"	||
			stateName == "DragOver"		||
			stateName == "DropReject"	||
			stateName == "DropAccept"	||
			stateName == "DropCorrect"	||
			stateName == "DropIncorrect"
			)
			return false;
		return true;
	}

	cp.isVisible = function(item)
	{
		var retVal = false;
		if(item)
		{
			retVal = item.visible;
			
			var bItemPartOfState = (-1 !== item.baseStateItemID);
			var bItemHasStates = (item.states && item.states.length > 0);
			if(bItemPartOfState || bItemHasStates)
			{
				var itemUID = item.getAttribute("uid");
				var baseItem = cp.getBaseStateItem(item);
				if(baseItem)
				{
					var baseItemIsVisible = baseItem.getAttribute("effectiveVi"); // effective visibility
					var bPartOfCurrentState = false;
					var stateArr = baseItem.states;
					var currState = baseItem.currentState;
					if(stateArr)
					{ 
						if(currState >= 0 && currState < stateArr.length)
						{
							var stateObj = stateArr[currState];
							var stateItems = stateObj.stsi;
							bPartOfCurrentState = (stateItems.indexOf(itemUID) != -1);
						}
					}
					retVal = (baseItemIsVisible && bPartOfCurrentState);
				}
			}
		}
		return retVal;
	}

	cp.isBaseItemInState = function(item)
	{
		var retVal = false;

		if(item)
		{
			if(-1 == item.baseStateItemID)
				retVal = true;
			else if(item.cloneOfBaseStateItem)
				retVal = true;
		}

		return retVal;
	}

	cp.getInfoForStateChange = function(item,state)
	{
		var retVal = {"bFound":false,"stateIndex":-1,"showItemList":[],"hideItemList":[]};

		var lItemData = cp.D[item];
		if(!lItemData)
			return retVal;

		var lItemCanvasObjKey = lItemData["mdi"];
		var lItemCanvasDisplayObj = cp.getDisplayObjByKey(lItemCanvasObjKey);

		if(lItemCanvasDisplayObj)
		{
			var stateArr = lItemCanvasDisplayObj.states;

			var showItemArr = [];
			var hideItemArr = [];

			for(var i = 0 ; i < stateArr.length ; i++)
			{
				var stateIter = stateArr[i];
				if(stateIter.stn == state)
				{
					retVal.stateIndex = i;
					showItemArr = showItemArr.concat(stateIter.stsi);
					retVal.bFound = true;
				}
				else
				{
					hideItemArr = hideItemArr.concat(stateIter.stsi);
				}
			}

			retVal.showItemList = showItemArr;
			retVal.hideItemList = hideItemArr;
		}

		return retVal;
	} 

	cp.CanPauseAudioDuringHide = function(item)
	{
		// This is required to continue playing base object audio when rollover/Down state of item is show.
		// Drawifneeded code will call cp._hide on base object and it will stop audio when item is in RollOver/Down state.
		// The assumption is that rollover/down state can only be triggered during mouse events.

		//Mukul: Ideally, when an object is hidden, its audio should be stopped. But there are two cases where we are interested in playing audio of a hidden object:
		//	case 1: Button, rollover area -> when we rollover or press the button, we are hiding the base button but we must continue to play the audio of the base button
		//	case 2: DragNDrop -> The transition states in DND like DragStart and DragOver are simulated by paiting a dummy canvas with the same properties as that of the actual states.
					// The actual DragStart/Dragover state item is hidden always, only the dummy canvas shows up. And we need to play the audio associated with these states...
		var retVal = true;

		if(item)
		{
			var bIsBaseItem = false;
			var parentStateName = "";
			var parentStateType = cp.kSTTNone;
			if(-1 === item.baseStateItemID)
			{
				bIsBaseItem = true;
				parentStateName = "Normal";
			}
			else if(item.cloneOfBaseStateItem)
			{
				bIsBaseItem = true;
				var parentStateObject = cp.getParentStateObjectForItem(item);
				if(parentStateObject)
				{
					parentStateName = parentStateObject.stn;
					parentStateType = parentStateObject.stt;
				}
			}

			if(bIsBaseItem)
			{
				var baseItem = cp.getBaseStateItem(item);
				if(baseItem)
				{
					var currStateObject = cp.getCurrentStateObjectForItem(baseItem);
					if(currStateObject !== undefined)
					{
						if(currStateObject.stt === cp.kSTTRollOver || currStateObject.stt === cp.kSTTDown)
						{
							var stateAtStartOfMouseEvents = baseItem.stateAtStartOfMouseEvents;
							if(stateAtStartOfMouseEvents)
							{
								if(parentStateName === stateAtStartOfMouseEvents)
								{
									retVal = false;
								}
							}
						}
					}
					if((parentStateType === cp.kSTTDragOver || parentStateType === cp.kSTTDragStart || parentStateType === cp.kSTTDropReject) )
					{
						var DNDInteractionMgr = cp.GetCurrentInteractionManager();
						if(DNDInteractionMgr)
						{
							var activeInteraction = DNDInteractionMgr.getActiveInteraction();
							if(activeInteraction && activeInteraction.m_DsFrameSetDataID === baseItem.parentId && activeInteraction.m_DragSourceCurrentTransientState === parentStateName)
							{
								retVal = false;
							}
						}
					}
				}
				
			}
		}

		return retVal;
	}

	cp.GetBaseItemsInAllStates = function(iItem,ibIncludeSelf)
    {
    	if(undefined === ibIncludeSelf) 
    		ibIncludeSelf = true;

    	var retVal = [] ;
    	if(iItem)
    	{
    		var stateArr = iItem.states;
    		for(var stateIter =0;stateIter < stateArr.length; stateIter++)
    		{
    			var currState = stateArr[stateIter];
    			if(currState)
    			{
    				var stateItems = currState.stsi;
    				if(stateItems)
    				{
    					for(var stateItemIter = 0; stateItemIter < stateItems.length ; stateItemIter++)
    					{
    						var currItem = cp.getDisplayObjByCP_UID(stateItems[stateItemIter]);
    						if(!ibIncludeSelf && currItem == iItem)
    							continue;

    						if(cp.isBaseItemInState(currItem))
    						{
    							retVal.push(currItem);
    						}
    					}
    				}
    			}
    		}
    	}
    	return retVal;
    }

	cp.dispatchClickEvent = function(target,eventObj,customData)
	{
		if(eventObj && target)
		{
			if(cp.MSIE != cp.browser && window.MouseEvent)
			{
				var clickEvent = new MouseEvent("click",{bubbles:true,cancelable:true,
												screenX:eventObj.screenX,screenY:eventObj.screenY,clientX:eventObj.clientX,
												clientY:eventObj.clientY,ctrlKey:eventObj.ctrlKey,altKey:eventObj.altKey,
												shiftKey:eventObj.shiftKey,metaKey:eventObj.metaKey});
				clickEvent.cpCustomData = customData;
				target.dispatchEvent(clickEvent);
			}
			else if(document && document.createEventObject)
			{
				// IE 
				var clickEvent = document.createEventObject(window.event);
				clickEvent.button = 1;  // left click
				clickEvent.cpCustomData = customData;
				clickEvent.target = target;			
				target.fireEvent ("onclick", clickEvent);
			}
		}
	}

	cp.BringBaseItemToFrontWithinState = function(item,inStateName)
	{
		if(!item)
			return;

		var stateObjects = [];
		// Get Items in State.
		var states = item.states;
		if(states)
		{
			for(var i = 0; i < states.length ; i++)
			{
				var currState = states[i];
				if(currState && currState.stn == inStateName)
				{
					var stateItems = currState.stsi;
					for(var j = 0; j < stateItems.length ; j++)
					{	
						var currItemName = cp.getDisplayObjNameByCP_UID(stateItems[j]);
						var currItemDisplayObj = cp.getDisplayObjByCP_UID(stateItems[j]);
						var currItemData = cp.D[currItemName];
						if(currItemData && currItemDisplayObj)
						{
							var bBaseItem = cp.isBaseItemInState(currItemDisplayObj);
							var fsSetDiv = currItemDisplayObj.actualParent;
							if(fsSetDiv)
							{
								stateObjects.push({"frameSetDiv":fsSetDiv,"zIndex":currItemData.zIndex,"isBaseItem":bBaseItem});
							}
						}
					}
				}
			}
		}

		if(0 == stateObjects.length)
			return;

		function localSortFunc(a,b)
		{
			if(a.zIndex > b.zIndex)
				return 1;
			else if( a.zIndex < b.zIndex )
				return -1;
			return 0;
		}

		stateObjects.sort(localSortFunc);

		var highestZIndex = stateObjects[stateObjects.length-1].zIndex;
		var prevZIndex = stateObjects[0].zIndex;
		var baseItemFound = false;
		for(var i = 0 ; i < stateObjects.length ; i++)
		{
			var currObj = stateObjects[i];
			if(!currObj)
				continue;
			if(!currObj.frameSetDiv)
				continue;
			if(baseItemFound)
			{
				currObj.frameSetDiv.style.zIndex = prevZIndex;
			}
			if(currObj.isBaseItem)
			{
				currObj.frameSetDiv.style.zIndex = highestZIndex;
				baseItemFound = true;
			}
			prevZIndex = currObj.zIndex;
		}
	}

	cp.ResetItemZIndicesWithinState = function(item,inStateName)
	{
		if(!item)
			return;

		var states = item.states;
		if(!states)
			return;

		for(var i = 0; i < states.length ; i++)
		{
			var currState = states[i];
			if(currState && currState.stn == inStateName)
			{
				var stateItems = currState.stsi;
				if(!stateItems)
					continue;

				for(var j = 0; j < stateItems.length ; j++)
				{	
					var currItemName = cp.getDisplayObjNameByCP_UID(stateItems[j]);
					var currItemDisplayObj = cp.getDisplayObjByCP_UID(stateItems[j]);
					var currItemData = cp.D[currItemName];
					if(currItemData && currItemDisplayObj)
					{
						var fsSetDiv = currItemDisplayObj.actualParent;
						if(fsSetDiv)
						{
							fsSetDiv.style.zIndex = currItemData.zIndex;
						}
					}
				}
			}
		}
	}

	cp.scaleItem = function(iElem, iScaleX, iScaleY)
	{
		var cssScale = "scaleX("+ iScaleX +") scaleY("+ iScaleY +")";
	    cp.applyTransform(iElem,cssScale);
	}

	cp.getCorrectBreakpoint = function(iWidth)
	{
		if(!cp.responsiveWidths || cp.responsiveWidths.length <= 0) return;
		var totalBreakpoints = cp.responsiveWidths.length;
		
		if(iWidth <= cp.responsiveWidths[0]) return cp.responsiveWidths[0];
		if(iWidth >= cp.responsiveWidths[cp.responsiveWidths.length - 1]) return cp.responsiveWidths[cp.responsiveWidths.length - 1];

		for(var idx=0; idx <= totalBreakpoints-1; ++idx)
		{
			if(iWidth <= cp.responsiveWidths[idx])
			{
				var lWidth = cp.responsiveWidths[idx];
				return lWidth;
			}
		}
	}

	cp.getResponsiveCSS = function(responsiveCSSObj)
	{
		if(!responsiveCSSObj) return;
		if(!cp.responsiveWidths || cp.responsiveWidths.length <= 0) return;

		if(cp.ResponsiveProjWidth)
			return responsiveCSSObj[cp.ResponsiveProjWidth];

		var totalBreakpoints = cp.responsiveWidths.length;
		var lViewportWidth = window.innerWidth;
		
		if(lViewportWidth <= cp.responsiveWidths[0]) return responsiveCSSObj[cp.responsiveWidths[0]];
		if(lViewportWidth >= cp.responsiveWidths[cp.responsiveWidths.length - 1]) return responsiveCSSObj[cp.responsiveWidths[cp.responsiveWidths.length - 1]];

		for(var idx=0; idx <= totalBreakpoints-1; ++idx)
		{
			if(lViewportWidth <= cp.responsiveWidths[idx])
			{
				var lWidth = cp.responsiveWidths[idx];
				return responsiveCSSObj[lWidth];
			}
		}
	}

	cp.getMaxWHBpt = function(iCss,iBreakPointWidth)
	{
		//getMaxWidthHeightForBreakpointRange
		var lTempSlideElemId = "cpTempElemForMaxWidth_123456";//just to avoid the name clash :P
		var lTempElemId = "cpTempInnerElemForMaxWidth_123456";//just to avoid the name clash :P

		var lTempSlideElem = cp(lTempSlideElemId);
		var lElem = cp(lTempElemId);
		if(!lTempSlideElem)
		{
			lTempSlideElem = cp.newElem("div");
			lTempSlideElem.id = lTempSlideElemId;
			lTempSlideElem.style.display = "block";
			lTempSlideElem.style.zIndex = "-1";
			lTempSlideElem.tabIndex = -1;
			document.body.insertBefore(lTempSlideElem,document.body.firstChild);
		}

		lTempSlideElem.style.display = "block";
		lTempSlideElem.style.position = "absolute";
		lTempSlideElem.style.left = "0px";
		lTempSlideElem.style.top = "0px";
		lTempSlideElem.style.width = iBreakPointWidth + "px";
		lTempSlideElem.style.height = cp.getCurrentSlideResponsiveHeight(iBreakPointWidth) + "px";
			
		if(!lElem)
		{
			lElem = cp.newElem(lTempElemId);
			lElem.id = lTempElemId;
			lTempSlideElem.appendChild(lElem);	
		}			
			
		cp.applyResponsiveStyles(lElem,iCss);
		var lRetObj = {"w":lElem.clientWidth,"h":lElem.clientHeight};

		lTempSlideElem.style.display = "none";
		return lRetObj;
	}

	cp.getAccessibilityString = function(iCanvasData)
	{
		if(!iCanvasData) return "";
		if(!iCanvasData.accstr) return "";

		var lAccStr = iCanvasData.accstr;
		if(lAccStr == undefined)
			return "";
		var lTriggerStr = iCanvasData.traccstr;
		if(typeof(lAccStr) != "string")
		{
			lAccStr = lAccStr[cp.ResponsiveProjWidth];
		}
		if(lTriggerStr)
			lAccStr += " " + lTriggerStr;

		return lAccStr;
	}

	cp.createTempElemAndGetBoundingRect = function(iCss,iParentElem,iUseLinks)
	{
		var lElem = cp.newElem("div");
		if(!iParentElem)
			iParentElem = cp("div_Slide");
		iParentElem.appendChild(lElem);
		cp.applyResponsiveStyles(lElem,iCss,iUseLinks);

		var lBoundingRect = lElem.getBoundingClientRect();
		iParentElem.removeChild(lElem);

		return lBoundingRect;
	}

	cp.createTempTextElemAndGetBoundingRect = function(iWidthInPixels,iElemData,iText)
	{
		if(iText == "" || iText == undefined)
			iText = iElemData.rpvt[cp.ResponsiveProjWidth].vt;

		var lTempTextElemId = "cpTempTextElem_123456";//just to avoid the name clash :P
		var lTempTextElem = cp(lTempTextElemId);
		if(!lTempTextElem)
		{
			lTempTextElem = cp.newElem("div");
			lTempTextElem.id = lTempTextElemId;
			/* //remove comments for debug purpose
			lTempTextElem.style.zIndex = 20000;
			lTempTextElem.style.display = "block";
			lTempTextElem.style.position = "absolute";*/
			lTempTextElem.style.overflow = "hidden";
			lTempTextElem.style.wordWrap = "break-word";
			lTempTextElem.style.whiteSpace = "pre-wrap";
			lTempTextElem.style.lineHeight = "90%";
			lTempTextElem.style.left = "-1999px";
			lTempTextElem.tabIndex = "-1";
			document.body.insertBefore(lTempTextElem,document.body.firstChild);
		}
		lTempTextElem.style.width = "";
		lTempTextElem.style.display = "block";
		lTempTextElem.style.width = iWidthInPixels + "px";		
		lTempTextElem.setAttribute("aria-hidden","true");
		lTempTextElem.innerHTML = iText;
		lTempTextElem.offsetHeight = lTempTextElem.offsetHeight;//make it repaint and avoid browser optimization
		var lBoundingRect = lTempTextElem.getBoundingClientRect();

		lTempTextElem.innerHTML = "";
		lTempTextElem.style.display = "none";
		return lBoundingRect;
	}

	cp.getExpectedWindowWidthToFitText = function(iStyleObj,iMinWidth,iMinHeight)
	{
		var retVal = iMinHeight;
		if(iStyleObj.h.indexOf("%") != -1 ||
			iStyleObj.h.indexOf("px") != -1)
		{
			if(iStyleObj.w.indexOf("%") != -1)
			{
				retVal = Math.floor(iMinWidth * 100/parseFloat(iStyleObj.w));
			}
			else
			{
				retVal = window.innerWidth;	
			}
		}
		else if(iStyleObj.h.indexOf("H%") != -1)
		{
			var lVal = iStyleObj.h.split("H%")[0];
			retVal = Math.floor(iMinHeight * 100/parseFloat(lVal));
		}
		else if(iStyleObj.h.indexOf("auto") != -1)
		{
			var lTargetWidth = iMinHeight * parseFloat(iStyleObj["apr"]);
			lTargetWidth = lTargetWidth > iMinWidth ? iMinWidth : lTargetWidth;
			if(iStyleObj.w.indexOf("H%") != -1)
			{
				retVal = Math.floor(iMinHeight * 100/parseFloat(iStyleObj.h));
			}
			else if(iStyleObj.w.indexOf("%") != -1)
			{
				retVal = Math.floor(iMinWidth * 100/parseFloat(iStyleObj.w));
			}
			else
			{
				retVal = window.innerWidth;	
			}	
		}

		return retVal;
	}

	cp.getInterpolatedFontSize = function(iWHObj,iCurrentFontSize,iCurrItemW)
	{
		var lWindowWidth = window.innerWidth;
		if(lWindowWidth > iWHObj.winW)
			return iCurrentFontSize; 
		var lInterpolatedFontSize = iCurrentFontSize*iCurrItemW/iWHObj.expw;
		return lInterpolatedFontSize;
	}

	cp.applyResponsiveStylesWRTItem = function(iElem, iStyleObj, iRespectElem)
	{
		if(!iStyleObj) return;

		var lTotalProperties = cp.rCSSProps.length;
		
		for(var i = 0; i < lTotalProperties; ++i)
		{
			var lCurrProp = cp.rCPProps[i];
			var lStyleObjVal = iStyleObj[lCurrProp];
			if(lStyleObjVal)
			{
				if(lCurrProp == "h")
				{
					if(lStyleObjVal.indexOf("auto") != -1)
					{
						var lWidthVal = iStyleObj["w"];
						lWidthVal = (lWidthVal.indexOf("%") != -1) ? (parseFloat(lWidthVal) * iRespectElem.clientWidth)/100 : parseFloat(lWidthVal);
						lStyleObjVal = (cp.getRoundedValue(lWidthVal / parseFloat(iStyleObj["apr"]))) + "px";
					}
					else if(lStyleObjVal.indexOf("H%") != -1)
					{
						var lHVal = lStyleObjVal.split("H%")[0];
						lStyleObjVal = (cp.getRoundedValue(lHVal*iRespectElem.clientWidth/100)) + "px";
					}
					else if(lStyleObjVal.indexOf("%") != -1)
					{
						var lHVal = lStyleObjVal.split("%")[0];
						lStyleObjVal = (cp.getRoundedValue(lHVal*iRespectElem.clientHeight/100)) + "px";	
					}
				}
				else if(lCurrProp == "w")
				{
					if(lStyleObjVal.indexOf("auto") != -1)
					{
						var lHeightVal = iStyleObj["h"];
						lHeightVal = (lHeightVal.indexOf("%") != -1) ? (parseFloat(lHeightVal) * iRespectElem.clientHeight)/100 : parseFloat(lHeightVal);
						lStyleObjVal = (cp.getRoundedValue(lHeightVal * parseFloat(iStyleObj["apr"]))) + "px";	
					}
					else if(lStyleObjVal.indexOf("H%") != -1)
					{
						var lWVal = lStyleObjVal.split("H%")[0];
						lStyleObjVal = (cp.getRoundedValue(lWVal*iRespectElem.clientHeight/100)) + "px";
					}
					else if(lStyleObjVal.indexOf("%") != -1)
					{
						var lWVal = lStyleObjVal.split("%")[0];
						lStyleObjVal = (cp.getRoundedValue(lWVal*iRespectElem.clientWidth/100)) + "px";	
					}
				}
				
				var iRespectElemBoundingRect = iRespectElem.getBoundingClientRect();
				var lSlideContainerDivRect = cp.movie.stage.mainSlideDiv.getBoundingClientRect();

				if(lStyleObjVal != "auto")
				{
					if(lCurrProp == "t" || 
						lCurrProp == "b")
					{
						if(lStyleObjVal.indexOf("H%") != -1)
						{
							var lPropVal = lStyleObjVal.split("H%")[0];
							lStyleObjVal = (cp.getRoundedValue(lPropVal*iRespectElem.clientWidth/100));
						}
						else if(lStyleObjVal.indexOf("%") != -1)
						{
							var lPropVal = lStyleObjVal.split("%")[0];
							lStyleObjVal = (cp.getRoundedValue(lPropVal*iRespectElem.clientHeight/100));
						}
						else
						{
							lStyleObjVal = parseFloat(lStyleObjVal);
						}
					}

					if(lCurrProp == "l" || 
						lCurrProp == "r")
					{
						if(lStyleObjVal.indexOf("H%") != -1)
						{
							var lPropVal = lStyleObjVal.split("H%")[0];
							lStyleObjVal = (cp.getRoundedValue(lPropVal*iRespectElem.clientHeight/100));
						}
						else if(lStyleObjVal.indexOf("%") != -1)
						{
							var lPropVal = lStyleObjVal.split("%")[0];
							lStyleObjVal = (cp.getRoundedValue(lPropVal*iRespectElem.clientWidth/100));
						}
						else
						{
							lStyleObjVal = parseFloat(lStyleObjVal);
						}
					}

					if(lCurrProp == "l")
						lStyleObjVal = (lStyleObjVal + iRespectElemBoundingRect.left) + "px";

					if(lCurrProp == "r")
						lStyleObjVal = (lStyleObjVal + lSlideContainerDivRect.right - iRespectElemBoundingRect.right) + "px";

					if(lCurrProp == "t")
						lStyleObjVal = (lStyleObjVal + iRespectElemBoundingRect.top) + "px";

					if(lCurrProp == "b")
						lStyleObjVal = (lStyleObjVal + lSlideContainerDivRect.bottom - iRespectElemBoundingRect.bottom) + "px";
				}				

				if(iStyleObj["rpmm"])
				{
					if(cp.rCSSProps[i] == "width")
					{
						var lMinW = (iStyleObj["rpmm"]["mw"]);
						var lMaxW = (iStyleObj["rpmm"]["Mw"]);

						var lTmpVal = lStyleObjVal;
						if(lMinW.indexOf("%") != -1)
							lMinW = parseFloat(lMinW) * iRespectElem.clientWidth / 100;
						if(lMaxW.indexOf("%") != -1)
							lMaxW = parseFloat(lMaxW) * iRespectElem.clientWidth / 100;
						if(lTmpVal.indexOf("%") != -1)
							lTmpVal = parseFloat(lTmpVal) * iRespectElem.clientWidth / 100;

						lMinW = parseFloat(lMinW);
						lMaxW = parseFloat(lMaxW);
						lTmpVal = parseFloat(lTmpVal);

						if(!isNaN(lMinW) && lTmpVal < lMinW)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMinW * 100 / iRespectElem.clientWidth) + "%";
							else
								lStyleObjVal = lMinW + "px";
						}
						else if(!isNaN(lMaxW) && lTmpVal > lMaxW)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMaxW * 100 / iRespectElem.clientWidth) + "%";
							else
								lStyleObjVal = lMaxW + "px";
						}
					}
					else if(cp.rCSSProps[i] == "height")
					{
						var lMinH = (iStyleObj["rpmm"]["mh"]);
						var lMaxH = (iStyleObj["rpmm"]["Mh"]);

						var lTmpVal = lStyleObjVal;
						if(lMinH.indexOf("%") != -1)
							lMinH = parseFloat(lMinH) * iRespectElem.clientHeight / 100;
						if(lMaxH.indexOf("%") != -1)
							lMaxH = parseFloat(lMaxH) * iRespectElem.clientHeight / 100;
						if(lTmpVal.indexOf("%") != -1)
							lTmpVal = parseFloat(lTmpVal) * iRespectElem.clientHeight / 100;

						lMinH = parseFloat(lMinH);
						lMaxH = parseFloat(lMaxH);
						lTmpVal = parseFloat(lTmpVal);

						if(!isNaN(lMinH) && lTmpVal < lMinH)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMinH * 100 / iRespectElem.clientHeight) + "%";
							else
								lStyleObjVal = lMinH + "px";
						}
						else if(!isNaN(lMaxH) && lTmpVal > lMaxH)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMaxH * 100 / iRespectElem.clientHeight) + "%";
							else
								lStyleObjVal = lMaxH + "px";
						}
					}
				}
				
				iElem.style[cp.rCSSProps[i]] = lStyleObjVal;
			}	
		}
	}

	cp.resetStyles = function(iElem)
	{
		if(!iElem)
			return;

		var lTotalProperties = cp.rCSSProps.length;
		for(var i = 0; i < lTotalProperties; ++i)
		{
			iElem.style[cp.rCSSProps[i]] = "";
		}
	}

	cp.getMinMaxHeight = function(iStyleObj)
	{
		if(!cp.responsive)
			return;
		var retObj= new Object();
		var lUseDifferentSlideDimensions = false;//cp.movie.stage.isSlideBGCropped();
		var lProjHeightToUse = lUseDifferentSlideDimensions ? cp.RespDefaultBptH : cp("project").clientHeight;
		if(iStyleObj.sh)
		{
			lProjHeightToUse = parseFloat(iStyleObj.sh);
			lUseDifferentSlideDimensions = true;
		}
		var lMinH = (iStyleObj["rpmm"]["mh"]);
		var lMaxH = (iStyleObj["rpmm"]["Mh"]);

		if(lMinH.indexOf("%") != -1)
			lMinH = parseFloat(lMinH) * lProjHeightToUse / 100;
		if(lMaxH.indexOf("%") != -1)
			lMaxH = parseFloat(lMaxH) * lProjHeightToUse / 100;
		
		retObj.minH = parseFloat(lMinH);
		retObj.maxH = parseFloat(lMaxH);

		return retObj;
	}

	cp.applyResponsiveStyles = function(iElem, iStyleObj, iUseLinks, iNotIsPresentInView, iDontModifyHeight)
	{
		if(!iStyleObj) return;

		if(!iStyleObj.ipiv)
		{
			iStyleObj.w = "0.000%";
			iStyleObj.h = "0.000%";
			iStyleObj.rpmm = {mw:'0px',mh:'0px',Mw:'',Mh:''};
		}

		var lTotalProperties = cp.rCSSProps.length;
		var lUseDifferentSlideDimensions = false;//cp.movie.stage.isSlideBGCropped();
		
		var lProjWidthToUse = lUseDifferentSlideDimensions ? cp.RespDefaultBptW : cp("project").clientWidth;
		var lProjHeightToUse = lUseDifferentSlideDimensions ? cp.RespDefaultBptH : cp("project").clientHeight;
		if(iStyleObj.sh)
		{
			lProjHeightToUse = parseFloat(iStyleObj.sh);
			lUseDifferentSlideDimensions = true;
		}

		var lCPSlideDivRect = cp("div_Slide").getBoundingClientRect();

		var lIsCenterAlignedHorizontally = iStyleObj.cah;
		var lIsCenterAlignedVertically = iStyleObj.cav;

		var lShouldUseHLink = false;
		var lShouldUseVLink = false;
		var lCPHLinkedItem = undefined;
		var lCPVLinkedItem = undefined;
		if(iUseLinks && (iStyleObj.lhID || iStyleObj.lvID))
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

		for(var i = 0; i < lTotalProperties; ++i)
		{
			iElem.style[cp.rCSSProps[i]] = "";
			var lCurrProp = cp.rCPProps[i];
			var lStyleObjVal = iStyleObj[lCurrProp];
			if(lStyleObjVal)
			{
				if(!iDontModifyHeight)
				{
					if(lCurrProp == "h")
					{
						if(lStyleObjVal.indexOf("auto") != -1)
						{
							var lWidthVal = iStyleObj["w"];
							lWidthVal = (lWidthVal.indexOf("H%") != -1) ? (parseFloat(lWidthVal) * lProjHeightToUse)/100 :
							(lWidthVal.indexOf("%") != -1) ? (parseFloat(lWidthVal) * lProjWidthToUse)/100 : parseFloat(lWidthVal);
							lStyleObjVal = (cp.getRoundedValue(lWidthVal / parseFloat(iStyleObj["apr"]))) + "px";
						}
						else if(lStyleObjVal.indexOf("H%") != -1)
						{
							var lHVal = lStyleObjVal.split("H%")[0];
							lStyleObjVal = (cp.getRoundedValue(lHVal*lProjWidthToUse/100)) + "px";
						}
						else if(lUseDifferentSlideDimensions && lStyleObjVal.indexOf("%") != -1)
						{
							//% values should only be converted to pixels when slide background cropping is on
							var lHVal = lStyleObjVal.split("%")[0];
							lStyleObjVal = (cp.getRoundedValue(lHVal*lProjHeightToUse/100)) + "px";
						}
					}
					else if(lCurrProp == "w")
					{
						if(lStyleObjVal.indexOf("auto") != -1)
						{
							var lHeightVal = iStyleObj["h"];
							lHeightVal = (lHeightVal.indexOf("%") != -1) ? (parseFloat(lHeightVal) * lProjHeightToUse)/100 : parseFloat(lHeightVal);
							lStyleObjVal = (cp.getRoundedValue(lHeightVal * parseFloat(iStyleObj["apr"]))) + "px";
						}
						else if(lStyleObjVal.indexOf("H%") != -1)
						{
							var lWVal = lStyleObjVal.split("H%")[0];
							lStyleObjVal = (cp.getRoundedValue(lWVal*lProjHeightToUse/100)) + "px";
						}
						else if(lUseDifferentSlideDimensions && lStyleObjVal.indexOf("%") != -1)
						{
							//% values should only be converted to pixels when slide background cropping is on
							var lWVal = lStyleObjVal.split("%")[0];
							lStyleObjVal = (cp.getRoundedValue(lWVal*lProjWidthToUse/100)) + "px";
						}
					}
				}

				if(!lIsCenterAlignedHorizontally && 
					(lCurrProp == "l" || lCurrProp == "r"))
				{
					if(lStyleObjVal.indexOf("H%") != -1)
					{
						var lWVal = lStyleObjVal.split("H%")[0];
						lStyleObjVal = (cp.getRoundedValue(lWVal*lProjHeightToUse/100)) + "px";
					}
					else if(lUseDifferentSlideDimensions && lStyleObjVal.indexOf("%") != -1)
					{
						//% values should only be converted to pixels when slide background cropping is on
						var lWVal = lStyleObjVal.split("%")[0];
						lStyleObjVal = (cp.getRoundedValue(lWVal*lProjWidthToUse/100)) + "px";
					}

					
					if(lStyleObjVal != "auto" && lShouldUseHLink && 
						(iStyleObj.lhID != -1))
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
								
								lCPHLinkedItem.actualParent.offsetHeight = lCPHLinkedItem.actualParent.offsetHeight;
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
								if(lCurrProp == "r")
								{
									lLinkedItemPropVal = lCPSlideDivRect.right - lLinkedItemPropVal;
								}
								else
								{
									lLinkedItemPropVal = lLinkedItemPropVal - lCPSlideDivRect.left;
								}
								lStyleObjVal = (lLinkedItemPropVal + parseFloat(lStyleLinkedVal)) + "px";
							}
						}
					}
				}

				if(!lIsCenterAlignedVertically && 
					(lCurrProp == "t" || lCurrProp == "b"))
				{
					if(lStyleObjVal.indexOf("H%") != -1)
					{
						var lPropVal = lStyleObjVal.split("H%")[0];
						lStyleObjVal = (cp.getRoundedValue(lPropVal*lProjWidthToUse/100)) + "px";
					}
					else if(lUseDifferentSlideDimensions && lStyleObjVal.indexOf("%") != -1)
					{
						//% values should only be converted to pixels when slide background cropping is on
						var lPropVal = lStyleObjVal.split("%")[0];
						lStyleObjVal = (cp.getRoundedValue(lPropVal*lProjHeightToUse/100)) + "px";
					}

					if(lStyleObjVal != "auto" && lShouldUseVLink && 
						(iStyleObj.lvID != -1))
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
								
								lCPVLinkedItem.actualParent.offsetHeight = lCPVLinkedItem.actualParent.offsetHeight;
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
								if(lCurrProp == "b")
								{
									lLinkedItemPropVal = lCPSlideDivRect.bottom - lLinkedItemPropVal;
								}
								else
								{
									lLinkedItemPropVal = lLinkedItemPropVal - lCPSlideDivRect.top;
								}
								lStyleObjVal = (lLinkedItemPropVal + parseFloat(lStyleLinkedVal)) + "px";
							}
						}
					}
				}

				if(iStyleObj["rpmm"])
				{
					if(cp.rCSSProps[i] == "width")
					{
						var lMinW = (iStyleObj["rpmm"]["mw"]);
						var lMaxW = (iStyleObj["rpmm"]["Mw"]);

						var lTmpVal = lStyleObjVal;
						if(lMinW.indexOf("%") != -1)
							lMinW = parseFloat(lMinW) * lProjWidthToUse / 100;
						if(lMaxW.indexOf("%") != -1)
							lMaxW = parseFloat(lMaxW) * lProjWidthToUse / 100;
						if(lTmpVal.indexOf("%") != -1)
							lTmpVal = parseFloat(lTmpVal) * lProjWidthToUse / 100;

						lMinW = parseFloat(lMinW);
						lMaxW = parseFloat(lMaxW);
						lTmpVal = parseFloat(lTmpVal);

						if(!isNaN(lMinW) && lTmpVal < lMinW)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMinW * 100 / lProjWidthToUse) + "%";
							else
								lStyleObjVal = lMinW + "px";
						}
						else if(!isNaN(lMaxW) && lTmpVal > lMaxW)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMaxW * 100 / lProjWidthToUse) + "%";
							else
								lStyleObjVal = lMaxW + "px";
						}
					}
					else if(cp.rCSSProps[i] == "height")
					{
						var lMinH = (iStyleObj["rpmm"]["mh"]);
						var lMaxH = (iStyleObj["rpmm"]["Mh"]);

						var lTmpVal = lStyleObjVal;
						if(lMinH.indexOf("%") != -1)
							lMinH = parseFloat(lMinH) * lProjHeightToUse / 100;
						if(lMaxH.indexOf("%") != -1)
							lMaxH = parseFloat(lMaxH) * lProjHeightToUse / 100;
						if(lTmpVal.indexOf("%") != -1)
							lTmpVal = parseFloat(lTmpVal) * lProjHeightToUse / 100;

						lMinH = parseFloat(lMinH);
						lMaxH = parseFloat(lMaxH);
						lTmpVal = parseFloat(lTmpVal);

						if(!isNaN(lMinH) && lTmpVal < lMinH)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMinH * 100 / lProjHeightToUse) + "%";
							else
								lStyleObjVal = lMinH + "px";
						}
						else if(!isNaN(lMaxH) && lTmpVal > lMaxH)
						{
							if(lStyleObjVal.indexOf("%") != -1)
								lStyleObjVal = (lMaxH * 100 / lProjHeightToUse) + "%";
							else
								lStyleObjVal = lMaxH + "px";
						}
					}
				}
				iElem.style[cp.rCSSProps[i]] = lStyleObjVal;
			}	
		}

		if(lIsCenterAlignedHorizontally)
		{
			var lRect = iElem.getBoundingClientRect();
			iElem.style.right = "auto";
			iElem.style.left = (lProjWidthToUse - lRect.width)/2 + "px";
		}
		if(lIsCenterAlignedVertically)
		{
			var lRect = iElem.getBoundingClientRect();
			iElem.style.bottom = "auto";
			iElem.style.top = (lProjHeightToUse - lRect.height)/2 + "px";
		}
	}

	//creates style object for responsive styles. Properties will keep adding in the parameter list.
	cp.createResponsiveStyleObj = function(iSourceObj,
											position,
											left,
											top,
											right,
											bottom,
											width,
											height,
											crop)
	{
		var retStyleObj = new Object();		
		for(var i = 0; i < arguments.length; ++i)
		{
			if(iSourceObj) 
			{
				if(iSourceObj[cp.rCPProps[i]])
					retStyleObj[cp.rCPProps[i]] = arguments[i+1];
			}	
			else
				retStyleObj[cp.rCPProps[i]] = arguments[i+1];
		}	

		//copy link properties as well
		var totalLinkProps = cp.rCPLinkProps.length;
		for(var j = 0; j < totalLinkProps; ++j)
		{
			if(iSourceObj && iSourceObj[cp.rCPLinkProps[j]])
				retStyleObj[cp.rCPLinkProps[j]] = iSourceObj[cp.rCPLinkProps[j]];
		}

		//copy ipiv property as it is
		if(iSourceObj)
			retStyleObj.ipiv = iSourceObj.ipiv;

		return retStyleObj;
	}

	cp.getCenterForRotation = function(elem)
	{
		var lRetCenterPoint = new Object();
		lRetCenterPoint.x = 0;
		lRetCenterPoint.y = 0;
		if(!elem) return 0;

		var lSlideRect = cp("div_Slide").getBoundingClientRect();
		var lBoundingRect = elem.getBoundingClientRect();

        var centreX = (lBoundingRect.left - lSlideRect.left) + (lBoundingRect.width/2);
        var centreY = (lBoundingRect.top - lSlideRect.top) + (lBoundingRect.height/2);
        
        lRetCenterPoint.X = centreX;
        lRetCenterPoint.Y = centreY;
        return lRetCenterPoint;
	}

	cp.RotatePoint = function (pointX, pointY, centerX, centerY, angle) {
		// convert angle to radians
		angle = angle * Math.PI / 180.0;
		var dx = pointX - centerX;
		var dy = pointY - centerY;
		var a = Math.atan2(dy, dx);
		var dist = Math.sqrt(dx * dx + dy * dy);
		// calculate new angle
		var a2 = a + angle;
		// calculate new coordinates
		var dx2 = Math.cos(a2) * dist;
		var dy2 = Math.sin(a2) * dist;
		// return coordinates relative to top left corner
		return { x: dx2 + centerX, y: dy2 + centerY };
	};

	cp.getBoundsForRotatedItem = function(iWidth, iHeight, centre, clockWiseRotAngle, strokeWidth)
	{
		var lRotatedBounds = new Object();
		if(clockWiseRotAngle == undefined)
			return lRotatedBounds;
		
		var actualWidth = iWidth;
		var actualHeight = iHeight;

		var radians = Math.PI * ( -clockWiseRotAngle ) / 180;

		var x1 = -actualWidth/2,
            x2 = actualWidth/2,
            x3 = actualWidth/2,
            x4 = -actualWidth/2,
            y1 = -actualHeight/2,
            y2 = -actualHeight/2,
            y3 = actualHeight/2,
            y4 = actualHeight/2;

        var x11 = x1 * Math.cos(radians) + y1 * Math.sin(radians),
            y11 = -x1 * Math.sin(radians) + y1 * Math.cos(radians),
            x21 = x2 * Math.cos(radians) + y2 * Math.sin(radians),
            y21 = -x2 * Math.sin(radians) + y2 * Math.cos(radians), 
            x31 = x3 * Math.cos(radians) + y3 * Math.sin(radians),
            y31 = -x3 * Math.sin(radians) + y3 * Math.cos(radians),
            x41 = x4 * Math.cos(radians) + y4 * Math.sin(radians),
            y41 = -x4 * Math.sin(radians) + y4 * Math.cos(radians);

        var x_min = Math.min(x11,x21,x31,x41),
            x_max = Math.max(x11,x21,x31,x41);

        var y_min = Math.min(y11,y21,y31,y41);
            y_max = Math.max(y11,y21,y31,y41);

        if(!strokeWidth)
        	strokeWidth = 0;
        var width = Math.round(100*(x_max - x_min + 2*strokeWidth))/100;
        var height = Math.round(100*(y_max - y_min + 2*strokeWidth))/100;

        var lSlideRect = cp("div_Slide").getBoundingClientRect();

        lRotatedBounds.l = (Math.round((centre.X - (width/2))*100)/100) + "px";
        lRotatedBounds.r = (lSlideRect.width - (Math.round((centre.X + (width/2))*100)/100)) + "px";
        lRotatedBounds.t = (Math.round((centre.Y - (height/2))*100)/100) + "px";
        lRotatedBounds.b = (lSlideRect.height - (Math.round((centre.Y + (height/2))*100)/100)) + "px";
        lRotatedBounds.w = width + "px";
        lRotatedBounds.h = height + "px";

        return lRotatedBounds;
	}

	cp.getBoundsForRotatedItem1 = function(left, top, width, height,center, clockWiseRotAngle, strokeWidth)/*,cx,cy)*/
	{
		var lRotatedBounds = new Object();
		if(clockWiseRotAngle == undefined)
			return lRotatedBounds;
		
		var angle_degrees = clockWiseRotAngle;
		var actualWidth = width;
		var actualHeight = height;

		//var radians = Math.PI * ( -clockWiseRotAngle ) / 180;

		var endPoints =[];
		var left_top = {x:left,y:top};
		var right_top = {x:left+width,y:top};
		var right_bottom = {x:left+width,y:top+height};
		var left_bottom = {x:left,y:top+height};

		left_top = cp.RotatePoint(left_top.x,left_top.y,center.X,center.Y,angle_degrees);
		right_top = cp.RotatePoint(right_top.x,right_top.y,center.X,center.Y,angle_degrees);
		right_bottom = cp.RotatePoint(right_bottom.x,right_bottom.y,center.X,center.Y,angle_degrees);
		left_bottom = cp.RotatePoint(left_bottom.x,left_bottom.y,center.X,center.Y,angle_degrees);

		var lSlideRect = cp("div_Slide").getBoundingClientRect();
		/* remove this comment for debug purpose
		var canvas1 = cp("canvast");
		if(!canvas1)
		{
			canvas1 = document.createElement("canvas");
			canvas1.id = "canvast";
			canvas1.style.display = "block";
			canvas1.style.position = "absolute";
			canvas1.style.zIndex = 20000;
			canvas1.width = 2*lSlideRect.width;
			canvas1.height = 2*lSlideRect.height;
			canvas1.style.left = "0px";
			canvas1.style.top = "0px";
			cp("div_Slide").appendChild(canvas1);	
		}

		var mgc = canvast.getContext("2d");
		mgc.strokeStyle = "#00ffff";
		mgc.strokeWidth = 10;
		//mgc.translate(cx,cy);
		//mgc.rotate((Math.PI*(angle_degrees))/180);
		mgc.arc(left_top.x,left_top.y, 5, 0,360);
		mgc.arc(right_top.x,right_top.y, 5, 0,360);
		mgc.arc(right_bottom.x,right_bottom.y, 5, 0,360);
		mgc.arc(left_bottom.x,left_bottom.y, 5, 0,360);
		mgc.stroke();
		*/

		endPoints = [left_top,right_top,right_bottom,left_bottom];

        var x_min = Math.min(left_top.x,right_top.x,right_bottom.x,left_bottom.x),
            x_max = Math.max(left_top.x,right_top.x,right_bottom.x,left_bottom.x);

        var y_min = Math.min(left_top.y,right_top.y,right_bottom.y,left_bottom.y);
            y_max = Math.max(left_top.y,right_top.y,right_bottom.y,left_bottom.y);

        if(!strokeWidth)
        	strokeWidth = 0;
        var width = Math.round(100*(x_max - x_min + 2*strokeWidth))/100;
        var height = Math.round(100*(y_max - y_min + 2*strokeWidth))/100;
        
        lRotatedBounds.l = x_min + "px";
        lRotatedBounds.r = (lSlideRect.width - x_max) + "px";
        lRotatedBounds.t = y_min + "px";
        lRotatedBounds.b = (lSlideRect.height - y_max) + "px";
        lRotatedBounds.w = width + "px";
        lRotatedBounds.h = height + "px";

        return lRotatedBounds;
	}

	cp.isCaptionItem = function(type)
	{
		return (type == cp.kCPOTCaptionItem ||
				type == cp.kCPOTSuccessCaptionItem ||
				type == cp.kCPOTFailureCaptionItem ||
				type == cp.kCPRolloverCaptionItem ||
				type == cp.kCPOTStageCorrectFeedback ||
				type == cp.kCPOTStageIncorrectFeedback ||
				type == cp.kCPOTStagePartialCorrectFeedback ||
				type == cp.kCPOTTimeoutFeedbackItem ||
				type == cp.kCPOTRetryFeedbackItem ||
				type == cp.kCPOTHintCaptionItem);
	}

	cp.isSupportedWebkitBasedBrowser = function()
	{
		var version = 0;
	   	
		var regexp = /( AppleWebKit\/)([^ ]+)/;		
		var result = regexp.exec(navigator.userAgent);
		if (!result || result.length < 3)
			return false;
		var lVersionString = result[2];

		// Remove '+' or any other stray characters
		var invalidCharacterRegExp = /[^\\.0-9]/;
		var invalidCharacter = invalidCharacterRegExp.exec(lVersionString);
		if (invalidCharacter)
			lVersionString = lVersionString.slice(0, invalidCharacter.index);
		
		if(result) 
		{
			version = parseFloat(lVersionString);
		}

		if(cp.verbose)
			cp.log("Webkit version : " + version);
		return (version >= 534);
	}

	cp.canUseWebkitAnimations = function() 
	{   
		var lIsSupportedWebkitVersion = cp.isSupportedWebkitBasedBrowser();
		if(!lIsSupportedWebkitVersion)
			return false;
		return lIsSupportedWebkitVersion && (cp.device == cp.IDEVICE);   
	}
	
	cp.getIsBrowserSupported = function()
	{
		var lSupported = false;
		
		if((cp.browser == cp.MSIE) && (cp.browserVersion >= cp.MSIE_MIN_SUPPORTED_VERSION ))
			lSupported = true;					
		else if((cp.browser == cp.CHROME) && (cp.browserVersion >= cp.CHROME_MIN_SUPPORTED_VERSION ))
			lSupported = true;	
		else if((cp.browser == cp.SAFARI) && (cp.browserVersion >= cp.SAFARI_MIN_SUPPORTED_VERSION ))
			lSupported = true;	
		else if((cp.browser == cp.FIREFOX) && (cp.browserVersion >= cp.FF_MIN_SUPPORTED_VERSION ))
			lSupported = true;	
			
		return lSupported;
	}

	cp.ShowWarning = function(iWarningMsg, iTitle,dontShow,cancelBtn)
	{
		//Get RuntimeDialog Attribute from publish side		
		var lRuntimeDialogData = cp.D['rtDialog'];
		var lBGFillColor = lRuntimeDialogData['rtbgfc'];
		var lBGStrokeColor = lRuntimeDialogData['rtbgsc'];
		var lBtnFillColor = lRuntimeDialogData['rtbtnfc'];
		var lBtnStrokeColor = lRuntimeDialogData['rtbtnsc'];
		var lSeparatorColor = lRuntimeDialogData['rtsc'];
		var lTextColor = lRuntimeDialogData['rttc'];
		var lTextShadowColor = lRuntimeDialogData['rttsc'];
		var lTextFontName = lRuntimeDialogData['rtfn'];
		var lOKButtonString = lRuntimeDialogData['rtokb'];
		var lCancelButtonString = lRuntimeDialogData['rtcb'];
			
		//Create Message Box
		var numBtns = 1;
		if(cancelBtn)
			++numBtns;
		var lRunTimeMsgBox = new cp.RuntimeMessageBox(document.getElementById("cpDocument"),numBtns,
										lBGFillColor,lBGStrokeColor,
										lBtnFillColor,lBtnStrokeColor,
										lSeparatorColor,lTextColor,
										lTextShadowColor,lTextFontName);
		lRunTimeMsgBox.setTitleText(iTitle);			
		lRunTimeMsgBox.setMessageText(iWarningMsg);
		lRunTimeMsgBox.setFirstButtonText(lOKButtonString);	
		lRunTimeMsgBox.registerFirstButtonHandler(lRunTimeMsgBox.hide);		
		lRunTimeMsgBox.setSecondButtonText(lCancelButtonString);	
		if(!dontShow)		
		lRunTimeMsgBox.show();			
		return lRunTimeMsgBox;
	}
	
	cp.alert = function(msg, title)
	{
		if(!title)
			title = 'Adobe Captivate';
		if(!msg)
			msg = '';
		cp.ShowWarning(msg, title);
	}
	window.alert = cp.alert;
	
	cp.modifyAlternativeAccessibleText = function (divElem,accStr)
	{
		if(accStr == "")
			return;

		if(!divElem || divElem == "undefined") return;

		if(cp.SAFARI === cp.browser)
		{
	        divElem.setAttribute('aria-label', accStr);
			return;
		}

		if(cp.D.pref.acc === 0 || accStr === "")
			accStr = " ";

		var accDiv = divElem.firstChild;
		if(accDiv)
		{
			if(accDiv.tagName !== 'DIV' || accDiv.className != 'cp-accessibility')
				accDiv = accDiv.nextSibling;

			if(accDiv)
			{
				var paraDiv = accDiv.firstChild;
				if(paraDiv)
				{
					paraDiv.innerHTML = accStr;
				}
			}

		}
	}

	
	cp.removeAccessibilityOutline = function( div )
	{
		if ( ! div )
			return;
			
		switch ( cp.browser ) {
		case cp.CHROME:
		case cp.SAFARI:
		case cp.FIREFOX:
			div.style.outlineStyle = 'none';
			break;
		default:
			break;
		}
		
		switch ( cp.device ) {
		case cp.IDEVICE:
		case cp.ANDROID:		
			div.style.outlineStyle = 'none';
			break;
		default:
			break;
		}
	}
	
	cp.complete = function()
	{
		if(!cp.initiated) return;
		if(cp.loadedModules.playbar && !cp.PB.playbarCreated) return;
		if(cp.loadedModules.toc && !cp.toc.tocCreated) return;
		if(cp.loadedModules.border && !cp.borderCreated) return;

		var lInitialLoader = cp("initialLoading");
		if(lInitialLoader)
		{
			lInitialLoader.parentElement.removeChild(lInitialLoader);
		}	

		cp.unblockFromLMS();

		if(!cp.passwordAccepted) return;
		
		if(cp.completed)
			return;
		cp.completed = true;

		if(cp.responsive)
			cp.adjustResponsiveItems(cp.ReasonForDrawing.kRegularDraw);
		
		cp.fireModuleReadyEvent(cp.currentWindow);

		if(cp.device == cp.DESKTOP)
		{
			var lShouldAutoplay = cp.D["project_main"].autoplay;
			if(lShouldAutoplay && cp.currentWindow.cpAPIInterface && cp.currentWindow.cpAPIInterface.canPlay())
				cp.movie.play();
		}
	}

	cp.newElem = function(iType)
	{
		var i = document.createElement(iType);
		if(cp.shouldScale)
			cp.fixWebkitScaling(i);
		return i;		
	}

	cp.fixWebkitScaling = function(iItem)
	{
		if(!cp.shouldScale) return;
		if(!iItem || !iItem.style) return;
		//There is a Scalability issue with Webkit. All individual items must be specifically have scaled transform applied. Hence, currently fixing only for Webkit.
		var lWebkitTransformStr = iItem.style["WebkitTransform"];
		if(lWebkitTransformStr && lWebkitTransformStr.toString().indexOf("translate3d") != -1)
			return;
		iItem.style["WebkitTransform"] += "translate3d(0px, 0px, 0px)";
	}

	cp.addDCHDiv = function(iParent, iHandler)
	{
		//addDummyClickHandlerDiv
		//this function will simply append an empty div as the top most child of the iParent element
		//this div is supposed to handle the clicks happening on the iParent element area
		var lClickHandlerDiv = document.createElement("div");
		lClickHandlerDiv.style.width = iParent.style.width;
		lClickHandlerDiv.style.height = iParent.style.height;
		lClickHandlerDiv.style.display = "block";
		lClickHandlerDiv.style.position = "absolute";
		lClickHandlerDiv.style.left = "0px";
		lClickHandlerDiv.style.top = "0px";
		lClickHandlerDiv.style.backgroundColor = "#ffffff";
		lClickHandlerDiv.style.opacity = 0;
		cp.registerGestureEvent(lClickHandlerDiv,cp.GESTURE_EVENT_TYPES.TAP,iHandler);

		iParent.appendChild(lClickHandlerDiv);

		return lClickHandlerDiv;
	}

	cp.clearCanvasProperly = function(iCanvas)
	{
		//With reference to http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
		iCanvas.element.width = iCanvas.element.width;
		/*var lGc = iCanvas.gc;
		// Store the current transformation matrix
		lGc.save();

		// Use the identity matrix while clearing the canvas
		lGc.setTransform(1, 0, 0, 1, 0, 0);
		lGc.clearRect(0, 0, iCanvas.width, iCanvas.height);

		// Restore the transform
		lGc.restore();
		*/
	}

	cp.cloneObject = function(iObj)
	{
		if (null == iObj || "object" != typeof iObj) 
			return iObj;		
		var copy = iObj.constructor();
		for (var attr in iObj) 
		{
			if (iObj.hasOwnProperty(attr)) copy[attr] = cp.cloneObject(iObj[attr]);
		}
		return copy;
	}

	cp.showHint = function(item,elem)
	{
		if(cp.disableInteractions)
			return;
		elem.hintFeedback = new cp.Feedback(item,null,false,cp.FeedbackType.HINT);
		elem.hintFeedback.onRollover();
	}
	cp.hideHint = function(item,elem)
	{
		if(cp.disableInteractions)
			return;
		if(elem && elem.hintFeedback)
			elem.hintFeedback.onRollout();
	}

	cp.addRewrapObjectAsPerRestOfProjectItem = function(aItem)
	{
		if(!aItem)
			return;
			
		var lParentContainer = cp.movie.stage.getSlideDiv().firstChild;
		if(!lParentContainer)
			return;
		
		var lLowestRewrapElemRPAOT = cp.movie.stage.m_lowestRewrapElementThatIsRestOfProjectAndOnTop;
		
		if(lLowestRewrapElemRPAOT)
			lParentContainer.insertBefore(aItem,lLowestRewrapElemRPAOT);
		else
			lParentContainer.appendChild(aItem);		
	}
	cp.addDivObjectAsPerRestOfProjectItem = function(aItem)
	{
		if(!aItem)
			return;		
		
		var lParentContainer = cp.movie.stage.getSlideDiv()
		if(!lParentContainer)
			return;
		
		var lLowestElemRPAOT = cp.movie.stage.m_lowestElementThatIsRestOfProjectAndOnTop;
		
		if(lLowestElemRPAOT)
			lParentContainer.insertBefore(aItem,lLowestElemRPAOT);
		else
			lParentContainer.appendChild(aItem);
	}
	cp.moveRewrapElemToTop = function(aItem)
	{
		if(!aItem)
			return;
		aItem.parentNode.removeChild(aItem);
		cp.addRewrapObjectAsPerRestOfProjectItem(aItem);
	}
	cp.moveDivElemToTop = function(aItem)
	{
		if(!aItem)
			return;
		aItem.parentNode.removeChild(aItem);
		cp.addDivObjectAsPerRestOfProjectItem(aItem);
	}
	cp.redrawItem = function(itemName,repaintUsingTextNode)
	{
		if(repaintUsingTextNode === undefined)
			repaintUsingTextNode = false;

	    var lItemElem = cp(itemName);
	    if(!lItemElem)
        	return;
	    if(cp("dummyStyle"))
            return;
	    var lLastDisplayStyle = lItemElem.style.display;
	    var elem;
		if(repaintUsingTextNode == false)
		{
			//This function is just for avoiding repainting issues, mostly visible on webkit.
	                                //Currently used by cp.show() function only. Can be used anywhere required. Causes a little slowness 100ms from hide to show state.
    		elem = document.createElement('style');

		}
		else
		{
		    elem = document.createTextNode('');
		}

	    elem.id = "dummyStyle";
		document.body.appendChild(elem);
		var l = setTimeout(function()
						{
	                        document.body.removeChild(elem);
	                        lItemElem.style.display = lLastDisplayStyle;
						},50);
	}

	cp.g_clickTimer = 0;
	
	cp.isClickTimerRunning = function()
	{
		return 0 != cp.g_clickTimer;
	}

	cp.startClickTimer = function( t, callback )
	{
		if ( ! cp.isClickTimerRunning() ) 
			cp.g_clickTimer = setInterval( callback, t );
	}
	
	cp.stopClickTimer = function()
	{
		if ( cp.isClickTimerRunning() ) {
			clearInterval( cp.g_clickTimer );
			cp.g_clickTimer = 0;
		}
	}

	cp.getGradientSvgStr = function(gObj, width, height, iResponsiveFactorX, iResponsiveFactorY)
	{
		var gradStr = '';
		var gradientTag = '';
		if (!gObj.cs || gObj.cs.length < 2)
			return '';
		if (0 == gObj.t) {
			gradientTag = 'linearGradient';
			if (undefined == gObj.x1 || undefined == gObj.x2 || undefined == gObj.y1 || undefined == gObj.y2)
				return ''; // Invalid.
		}
		else if (1 == gObj.t) {
			gradientTag = 'radialGradient';
			if (undefined == gObj.cx || undefined == gObj.cy || undefined == gObj.r)
				return ''; // Invalid.			
		}
		else
			return '';

		if(iResponsiveFactorX == undefined || iResponsiveFactorX == 0)
			iResponsiveFactorX = 1;
		if(iResponsiveFactorY == undefined || iResponsiveFactorY == 0)
			iResponsiveFactorY = 1;
		var svgStart = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + (width*iResponsiveFactorX) + 
										'" height="' + (height*iResponsiveFactorY) + '">';
		var svgEnd	= '</svg>';
		var topTag = '<' + gradientTag + ' id="grad1" gradientUnits="userSpaceOnUse"';
		if (0 == gObj.t) 
			topTag += (' x1="' + gObj.x1*iResponsiveFactorX + '" y1="' + gObj.y1*iResponsiveFactorY + '" x2="' + gObj.x2*iResponsiveFactorX + '" y2="' + gObj.y2*iResponsiveFactorY + '"');
		else {
			topTag += (' cx="' + gObj.cx*iResponsiveFactorX + '" cy="' + gObj.cy*iResponsiveFactorY + '" r="' + gObj.r*iResponsiveFactorX + '"');
			if (undefined != gObj.tf && undefined != gObj.tf.x && undefined != gObj.tf.y) {
				topTag += (' gradientTransform="translate(' + gObj.tf.x*iResponsiveFactorX + ' ' + gObj.tf.y*iResponsiveFactorY + ')"');
			}
		}
		var smStr = 'pad';
		if (undefined != gObj.s) {
			if (1 == gObj.s)
				smStr = 'reflect';
			else if (2 == gObj.s)
				smStr = 'repeat';			
		}
		topTag += (' spreadMethod="' + smStr + '">');
		var stopStr = '';
		// Now for the color stops.
		for (var i = 0; i < gObj.cs.length; ++i) {
			var cs = gObj.cs[i];
			stopStr += ('<stop offset="' + cs.p + '%" style="stop-color:' + cs.c + ';stop-opacity:' + cs.o + '" />');
		}
		var rectStr = ('<rect x="0" y="0" width="' + (width*iResponsiveFactorX) + 
										'" height="' + (height*iResponsiveFactorY) + '" fill="url(#grad1)"/>');
		gradStr = svgStart + '<defs>' + topTag + stopStr + '</' + gradientTag + '></defs>' + rectStr + svgEnd;
		return gradStr;
	}
	
	cp.getGradientFill = function(gObj, ctx, iResponsiveFactorX, iResponsiveFactorY)
	{
		if (!ctx || !gObj.cs || gObj.cs.length < 2)
			return null;
		if(iResponsiveFactorX == undefined)
			iResponsiveFactorX = 1;
		if(iResponsiveFactorY == undefined)
			iResponsiveFactorY = 1;
		var grad = null;
		if (0 == gObj.t) {
			if (undefined == gObj.x1 || undefined == gObj.x2 || undefined == gObj.y1 || undefined == gObj.y2)
				return null; // Invalid.
			grad = ctx.createLinearGradient( gObj.x1 * iResponsiveFactorX, gObj.y1 * iResponsiveFactorY, gObj.x2 * iResponsiveFactorX, gObj.y2 * iResponsiveFactorY );
		}
		else if (1 == gObj.t) {
			if (undefined == gObj.cx || undefined == gObj.cy || undefined == gObj.r)
				return null; // Invalid.	
			var x = gObj.cx;
			var	y = gObj.cy;
			if (undefined != gObj.tf && undefined != gObj.tf.x && undefined != gObj.tf.y) {
				x += gObj.tf.x;
				y += gObj.tf.y;
			}
			grad = ctx.createRadialGradient( x * iResponsiveFactorX, y * iResponsiveFactorY, 0, x * iResponsiveFactorX, y * iResponsiveFactorY, gObj.r * iResponsiveFactorX);
		}
		else
			return null;
		// Spread method is ignored.
		// Now for the color stops.
		for (var i = 0; i < gObj.cs.length; ++i) {
			var cs = gObj.cs[i];
			var colorStr = cp.getRGBA( cs.c, cs.o );
			grad.addColorStop( cs.p / 100, colorStr );
		}
		return grad;
	}
	
	cp.drawLineCapStyle = function( gc, x1, y1, x2, y2, lineColor, lineWidth, capStyle, endLocation )
	{
		var R = Math.sqrt( ( x2 - x1 ) * ( x2 - x1 ) + ( y2 - y1 ) * ( y2- y1 ) );
		if ( R == 0)
			return;

		switch ( capStyle ) {
			case 1: // Arrow
				cp.drawSquareCap( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation );
				break;
			case 2: // Round
				cp.drawRoundCap( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation );
				break;
			case 3: // Diamond
				cp.drawDiamondCap( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation );
				break;
			case 4: // Square
				cp.drawArrowCap( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation );
				break;
			default: // None or other
			{
				break;
			}
		}
	}
	
	cp.drawRoundCap = function( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation )
	{
		var centerX = 0, centerY = 0;
		var strokeRadius = 0;
		var arrowHeadLength = 0, strokeCorrection = 0, sinHeadAngle = 0;
		
		sinHeadAngle = Math.sin( 0.349 ); 
		arrowHeadLength = 4;	//Note: HardCoded Number are in sync with Stage (CPDrawingPainter)
		strokeCorrection = lineWidth / ( 2.0 * sinHeadAngle );
		// Adjust arrowhead  length to correct for stroke width
		arrowHeadLength += strokeCorrection ;	
		strokeRadius = arrowHeadLength / 2;
		
		if ( 0 == endLocation ) {
			centerX = x1;
			centerY = y1;
		}
		else {
			centerX = x2;
			centerY = y2;				
		}
		gc.save();
		gc.beginPath();
		gc.arc( centerX, centerY, strokeRadius, 0, 2 * Math.PI, false );
		gc.closePath();
		gc.fillStyle = lineColor;
		gc.fill();
		
		gc.restore();
	}
	
	cp.drawSquareCap = function( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation )
	{
		var strokeRadius = 0;
		var centerX = 0, centerY = 0;
		var xDelta = 0, xDist = 0, yDist = 0, xPerpDist = 0, yPerpDist = 0; 
		var slope = 0;
		
		var arrowHeadLength = 0, strokeCorrection = 0, sinHeadAngle = 0;
		
		sinHeadAngle = Math.sin( 0.349 ); 
		arrowHeadLength = 4;	//Note: HardCoded Number are in sync with Stage (CPDrawingPainter)
		strokeCorrection = lineWidth / ( 2.0 * sinHeadAngle );
		// Adjust arrowhead  length to correct for stroke width
		arrowHeadLength += strokeCorrection;	
		strokeRadius = arrowHeadLength / 2;
		
		if ( 0 == endLocation ) {//cap at Start Point
			centerX = x1; 
			centerY = y1;
		}
		else {
			centerX = x2; 
			centerY = y2;
		}

		xDelta = x2 - x1;
		if ( xDelta == 0 ) {
			xDist = 0;
			yDist = strokeRadius;
	
			xPerpDist = strokeRadius;
			yPerpDist = 0;
		}
		else {
			// First need to find the slope of the current line
			slope = (y2 - y1) / xDelta;		
			if ( slope != 0 ) {
				xDist = Math.sqrt( ( strokeRadius * strokeRadius ) / ( slope * slope + 1 ) );
				yDist = slope * xDist;		
				slope = -1.0 / slope;
	
				// Plug into formula derived from Pythags and equation for a line:
				//        ________________
				//		  |      d^2         d = barLength
				// x =	  |    ------
				//      \/     m^2 + 1       m = slope
	
				xPerpDist = Math.sqrt( ( strokeRadius * strokeRadius ) / ( slope * slope + 1 ) );
				yPerpDist = slope * xPerpDist;
			}
			else
			{
				xDist = strokeRadius;
				yDist = 0;		
				xPerpDist = 0;
				yPerpDist = strokeRadius;
			}
		}

		gc.save();
		gc.beginPath();
		gc.moveTo( centerX - xDist - xPerpDist, centerY - yDist - yPerpDist );
		gc.lineTo( centerX + xDist - xPerpDist, //point2
				centerY + yDist - yPerpDist );
		gc.lineTo( centerX + xDist + xPerpDist, //point3
				centerY + yDist + yPerpDist );
		gc.lineTo( centerX - xDist + xPerpDist, //point4
			   centerY - yDist + yPerpDist ); 
		gc.lineTo( centerX - xDist - xPerpDist, //point1
				centerY - yDist - yPerpDist );
		gc.closePath();
		gc.fillStyle = lineColor;
		gc.fill();
		gc.restore();
	}
	
	cp.drawDiamondCap = function( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation )
	{
		var strokeRadius = 0;
		var centerX = 0, centerY = 0;
		var xDelta = 0, xDist = 0, yDist = 0, xPerpDist = 0, yPerpDist = 0; 
		var slope = 0;
		
		var arrowHeadLength = 0, strokeCorrection = 0, sinHeadAngle = 0;
		
		sinHeadAngle = Math.sin( 0.349 ); 
		arrowHeadLength = 4;	//Note: HardCoded Number are in sync with Stage (CPDrawingPainter)
		strokeCorrection = lineWidth / ( 2.0 * sinHeadAngle );
		// Adjust arrowhead  length to correct for stroke width
		arrowHeadLength += strokeCorrection ;	
		strokeRadius = arrowHeadLength / 2;
		
		if ( 0 == endLocation ) { //cap at Start Point
			centerX = x1; 
			centerY = y1;
		}
		else {
			centerX = x2; 
			centerY = y2;
		}

		xDelta = x2 - x1;
		if ( xDelta == 0 ) {
			xDist = 0;
			yDist = strokeRadius;
	
			xPerpDist = strokeRadius;
			yPerpDist = 0;
		}
		else {
			// First need to find the slope of the current line
			slope = (y2 - y1) / xDelta;		
			if ( slope != 0 )
			{
				xDist = Math.sqrt( ( strokeRadius * strokeRadius ) / ( slope * slope + 1 ) );
				yDist = slope * xDist;		
				slope = -1.0 / slope;
	
				// Plug into formula derived from Pythags and equation for a line:
				//        ________________
				//		  |      d^2         d = barLength
				// x =	  |    ------
				//      \/     m^2 + 1       m = slope
	
				xPerpDist = Math.sqrt( ( strokeRadius * strokeRadius ) / ( slope * slope + 1 ) );
				yPerpDist = slope * xPerpDist;
			}
			else {
				xDist = strokeRadius;
				yDist = 0;		
				xPerpDist = 0;
				yPerpDist = strokeRadius;
			}
		}

		gc.save();
		gc.beginPath();

		gc.moveTo( centerX - xDist , //point1
				centerY - yDist );
		gc.lineTo( centerX - xPerpDist, //point2
			centerY - yPerpDist );
		gc.lineTo( centerX + xDist, //point3
				centerY + yDist );
		gc.lineTo( centerX + xPerpDist, //point4
				centerY + yPerpDist ); 
		gc.lineTo( centerX - xDist, //point1
				centerY - yDist );

		gc.closePath();
		gc.fillStyle = lineColor;
		gc.fill();
		gc.restore();
	}

	cp.drawArrowCap = function( gc, x1, y1, x2, y2, lineColor, lineWidth, endLocation )
	{
		//Note: Hardcoded constant are in sync with cpDrawingpainter
		var lenFactor = 0, arrowLength = 0, insideArrowLength = 0, strokeCorrection = 0;
		var aLcLcHmsLsH = 0, aLsLcHpcLsH = 0, aLcLcHpsLsH = 0, aLsLcHmcLsH = 0;
		var adjustx = 0, adjusty = 0;
		var cosLineAngle = 0, sinLineAngle = 0, cosHeadAngle = 0, sinHeadAngle = 0;
		var R = 0;
		
		R = Math.sqrt( ( x2 - x1 ) * ( x2 - x1 ) + ( y2 - y1 ) * ( y2 - y1 ) );
		if ( R == 0 )
			return;
			
		cosLineAngle = ( x2 - x1 ) / R; 
		sinLineAngle = ( y2 - y1 ) / R;
		cosHeadAngle = Math.cos( 0.349 );
		sinHeadAngle = Math.sin( 0.349 );
		
		lenFactor = 1;
		if ( lineWidth > 1 )
			lenFactor = Math.sqrt( lineWidth ); 
		
		arrowLength = 6 * lenFactor;
		insideArrowLength = 4; 
		
		strokeCorrection = lineWidth / ( 2 * sinHeadAngle );
			
		arrowLength += strokeCorrection;
		insideArrowLength += strokeCorrection;
		
		aLcLcHmsLsH = arrowLength * ( cosLineAngle * cosHeadAngle - sinLineAngle * sinHeadAngle );
		aLsLcHpcLsH = arrowLength * ( sinLineAngle * cosHeadAngle + cosLineAngle * sinHeadAngle );
		aLcLcHpsLsH = arrowLength * ( cosLineAngle * cosHeadAngle + sinLineAngle * sinHeadAngle );
		aLsLcHmcLsH = arrowLength * ( sinLineAngle * cosHeadAngle - cosLineAngle * sinHeadAngle );
		
		adjustx = insideArrowLength * cosLineAngle; 
		adjusty = insideArrowLength * sinLineAngle;
		
		var px = 0, py = 0, p1x = 0, p1y = 0, p2x = 0, p2y = 0;
		if ( 0 == endLocation ) {//startCap
			px = x1 - adjustx;
			py = y1 - adjusty;
			p1x = x1 + aLcLcHmsLsH - adjustx; 
			p1y = y1 + aLsLcHpcLsH - adjusty;
			p2x = x1 + aLcLcHpsLsH - adjustx; 
			p2y = y1 + aLsLcHmcLsH - adjusty;
		}
		else {
			px = x2 + adjustx;
			py = y2 + adjusty;
			p1x = x2 - aLcLcHmsLsH + adjustx; 
			p1y = y2 - aLsLcHpcLsH + adjusty;;
			p2x = x2 - aLcLcHpsLsH + adjustx; 
			p2y = y2 - aLsLcHmcLsH + adjusty;
		}

		// now we need  a triangle from  (x1,y1) , (p1x,p1y) , (p2x,p2y)
		gc.save();
		gc.beginPath();

		gc.moveTo( px, py );
		gc.lineTo( p1x, p1y );
		gc.lineTo( p2x, p2y );
		gc.lineTo( px, py );

		gc.closePath();
		gc.fillStyle = lineColor;
		gc.fill();
		gc.restore();		
	}
		
	cp.getPattern = function( ss, dotLength, dashDotFactor )
	{
		var pattern = new Array();
		switch( ss ) {
			case 1: 		
				pattern[ 0 ] = dashDotFactor * dotLength;
				pattern[ 1 ] = dotLength;
				break;
			case 2: 		
				pattern[ 0 ] = dotLength;
				pattern[ 1 ] = dotLength;
				break;
			case 3: 		
				pattern[ 0 ] = dashDotFactor * dotLength;
				pattern[ 1 ] = dotLength;
				pattern[ 2 ] = dotLength;
				pattern[ 3 ] = dotLength;
				break;			
			case 4: 		
				pattern[ 0 ] = dashDotFactor * dotLength;
				pattern[ 1 ] = dotLength;
				pattern[ 2 ] = dotLength;
				pattern[ 3 ] = dotLength;
				pattern[ 4 ] = dotLength;
				pattern[ 5 ] = dotLength;
				break;			
			default:
				pattern[ 0 ] = 10000 * dotLength;
				pattern[ 1 ] = 0;
				break;			
		}
		return pattern;
	}
	
	cp.dashStruct = function()
	{
		this.m_drawingDash = true;
		this.m_patternIndex = 0;
		this.m_offset = 0;
	}
	
	cp.drawDashedLineImpl = function( gc, pattern, drawingState, x0, y0, x1, y1 )
	{
		var cos = x1 - x0;
		var sin = y1 - y0;
		var len = Math.sqrt( cos * cos + sin * sin );
		var cosp = 0, sinp = 0, R = 0, offset = 0;
		var drawingDash;
		var patternIndex = 0;
		var prevx = x0, prevy = y0, x2 = 0, y2 = 0;
	
		// if both the points coincide.
		if ( 0 == len ) 
			return;
		
		cos /= len;
		sin /= len;
		cosp = -sin;
		sinp = cos;
		
		R = len;
		
		offset 			= -drawingState.m_offset;
		drawingDash 	= drawingState.m_drawingDash;
		patternIndex 	= drawingState.m_patternIndex;
		
		while( offset < R ) {
			offset += pattern[ patternIndex ];
			if ( offset >= R ) {
				drawingState.m_offset = pattern[ patternIndex ] - ( offset - R );
				drawingState.m_patternIndex = patternIndex;
				drawingState.m_drawingDash = drawingDash;
				offset = R;
			}
			x2 = x0 + offset * cos;
			y2 = y0 + offset * sin;			

			if ( drawingDash ) 
				gc.lineTo( x2, y2 );
			else 
			{
				gc.moveTo( x2, y2 );
				prevx = x2;
				prevy = y2;
			}
			
			drawingDash = ! drawingDash;
			patternIndex = ( patternIndex + 1 ) % pattern.length;
		}
	}	
	
	cp.drawDashedLine = function( gc, x0, y0, x1, y1, ss )
	{
		var pattern = cp.getPattern( ss, 7, 3 );
		var drawingState = new cp.dashStruct();
		cp.drawDashedLineImpl( gc, pattern, drawingState, x0, y0, x1, y1 );
		drawingState = null;
		pattern = null;
	}

	cp.drawDashedCurve = function( gc, pattern, drawingState, x0, y0, x1, y1, x2, y2, radiusX, radiusY, R )
	{
		if (radiusY < 0 )
			radiusY = radiusX;
			
		/*  Bezier Curve representation
			1) point on curve is 
					P(t) = (1-t)*(1-t)*P0 + 2t(1-t)P1 + t*t *P2;  0=<t<=1
			2) point on line from P0(xo,yo) --> P1(x1,y1)
					A(t) = (1-t)*P0 + t*P1
			3) point on line from P1(x1,y1) --> P2(x2,y2)
					B(t) = (1-t)*P1 + t*P2
		*/
		
		// find the length of the curve
		// cx, cy are control points 
		// px, py are the points on the curve
		// t is the parameter of the above curve
		var cx = 0, cy = 0, px = 0, py = 0, t = 0, _t = 0, x = 0;
		var i = 0;
		var offset 			= -drawingState.m_offset;
		var drawingDash 	= drawingState.m_drawingDash;
		var patternIndex 	= drawingState.m_patternIndex;
		var D = 0;
		// following will be coefficients of the 2 tangents.
		var A1 = 0, B1 = 0, C1 = 0, A2 = 0, B2 = 0, C2 = 0;
		var prevx = 0, prevy = 0;
				
		// length of the curve
		if ( R < 0 ) {
			R = 0;
			
			// Initially the first point is used as the control point, since we
			// want to find the length of the curve with straight line approximation
			//len = (Math.PI * Math.sqrt((radiusX*radiusX + radiusY*radiusY)/2));

			cx = x0; 
			cy = y0;
			for ( i = 1; i < 100; ++i ) {
				t = i / 100; 
				_t = 1 - t;
			
				px = _t * _t * cx + 2 * t * _t * x1 + t * t * x2;
				py = _t * _t * cy + 2 * t * _t * y1 + t * t * y2;
			
				R += Math.sqrt( ( px - cx ) * ( px - cx ) + ( py - cy ) *( py - cy ) )
				cx = px;
				cy = py;
			}
			// some error or if the points coincide.
			if ( R < 0 || R == 0 ) 
			  return;
		}

		// restore the previous offset, drawingMode, patternIndex		
		// this is the length of the line from 
		//Anchor Point1 ---> Control Point
		D = Math.sqrt( ( x1 - x0 ) * ( x1 - x0 ) + ( y1 - y0 ) * ( y1 - y0 ) );
		
		// initialize first point, control points and the eq parameter t
		px = x0; py = y0;
		cx = x1; cy = y1;
		t = 0; 	_t = 1;

		// offset ==> length of the curve from P0 so maximum value of offset = R
		while ( offset < R ) {
			offset += pattern[ patternIndex ];

			// if somehow its -ve => error just reset to 5
			if ( offset < 0 ) 
				x = 5;
			
			// this means that the current pattern will cover the entire remaining curve
			if ( offset >= R ) {
				// store the values of offset, drawingMode, patternIndex for using next time.
				drawingState.m_offset = pattern[ patternIndex ] - ( offset - R );
				drawingState.m_patternIndex = patternIndex;
				drawingState.m_drawingDash = drawingDash;
				
				// set offset to length of the curve
				offset = R;
			}
			
			// this is the start point for curve segment
			prevx = px;
			prevy = py;
			
			// tangent equation  at the start point
			A1 = py - cy;  B1 = cx - px;  C1 = px * cy - py * cx;
		
			// find the Bezier Curve parameter based on the new offset
			t = ( offset / R ); 
			if ( t > 1 ) 
				t = 1;
			_t = 1 - t;
			
			// find the control point on line A(t) = line from P0(xo,yo) --> P1(x1,y1)
			cx = _t * x0 + t * x1;
			cy = _t * y0 + t * y1;
			
			// find the point on curve at a distance = Offset from P0
			// this is the end point for the current curve segment
			px = _t * _t * x0 + 2 * t * _t * x1 + t * t * x2;
			py = _t * _t * y0 + 2 * t * _t * y1 + t * t * y2;
		
			// tangent equation at the end point
			A2 = py - cy;  B2 = cx - px;  C2 = px * cy - py * cx;
			
			// Now find the control point. intersection of the above 2 line
			if ( ( B2 * A1 - B1 * A2 ) != 0 ) {
				cx  = ( B1 * C2 - B2 * C1 ) / ( B2 * A1 - B1 * A2 );	
				cy  = ( A1 * C2 - A2 * C1 ) / ( B1 * A2 - B2 * A1 );
			} 
			else {
				cx = prevx;
				cy = prevy;
			}
			if ( drawingDash ) 
				gc.quadraticCurveTo( cx, cy, px, py );
			else 
				gc.moveTo( px, py );
			
			drawingDash = ! drawingDash;
			patternIndex = ( patternIndex + 1 ) % pattern.length;
		}
	}
	
	cp.drawDashedOval = function( gc, xCenter, yCenter, xRadius, yRadius, ss )
	{
		var radians = 0, xr = 0, yr = 0, angle = 0, angleMid = 0, anchorX = 0, anchorY = 0;
		var controlX = 0, controlY = 0, prevX = 0, prevY = 0, i = 0;
		var struct = new cp.dashStruct();
		var pattern = cp.getPattern( ss, 7, 3 );
		
		if ( yRadius < 0 ) 
			yRadius = xRadius;

		// get 45 degrees to radians
		radians = Math.PI / 4;
		
		// distance for the control point
		xr = xRadius / Math.cos( radians / 2 );
		yr = yRadius / Math.cos( radians / 2 );
		
		gc.beginPath();	
		angle = 0;
		gc.moveTo( xCenter + xRadius, yCenter );
		
		prevX = xCenter + xRadius;
		prevY = yCenter;

		for ( i = 0; i < 8; ++i ) {
			// increment our angles
			angle += radians;
			angleMid = angle - ( radians / 2 );
				
			controlX = xCenter + Math.cos( angleMid ) * xr;
			controlY = yCenter + Math.sin( angleMid ) * yr;
			
			anchorX = xCenter + Math.cos( angle ) * xRadius;
			anchorY = yCenter + Math.sin( angle ) * yRadius;
			
			cp.drawDashedCurve( gc, pattern, struct, prevX, prevY, controlX, 
							controlY, anchorX, anchorY, xRadius, yRadius, -1 );
			prevX = anchorX;
			prevY = anchorY;		
		}
		
		gc.closePath();	
		
		pattern = null;
		struct = null;
	}	

	cp.drawDashedArc = function( gc, pattern, struct, xCenter, yCenter, xRadius, yRadius, startAngle, endAngle )
	{
		var radians = 0, xr = 0, yr = 0;
		var angle = 0, angleMid = 0;
		var anchorX = 0, anchorY = 0;
		var controlX = 0, controlY = 0;
		var prevX = xCenter - xRadius;
		var prevY = yCenter, i = 0;

		if ( yRadius < 0 ) 
			yRadius = xRadius;
		
		// get 45 degrees to radians
		radians = Math.PI/4;
		
		// distance for the control point
		xr = xRadius / Math.cos(radians / 2);
		yr = yRadius / Math.cos(radians / 2);
		
		angle = 0;
		gc.moveTo( xCenter - xRadius, yCenter );
		
		for ( i = 0; i < 16; ++i ) {
			// increment our angles
			angle += radians;

			angleMid = angle - ( radians / 2 );
				
			controlX = xCenter + Math.cos( angleMid ) * xr;
			controlY = yCenter + Math.sin( angleMid ) * yr;
			
			anchorX = xCenter + Math.cos( angle ) * xRadius;
			anchorY = yCenter + Math.sin( angle ) * yRadius;
			
			if ( ( angle > startAngle ) && ( angle <= endAngle ) ) {
				cp.drawDashedCurve( gc, pattern, struct, 
					prevX, prevY, controlX, controlY, anchorX, anchorY, 
					xRadius, yRadius, Math.PI * xRadius / 4 );
				prevX = anchorX;
				prevY = anchorY;		
			}			
			else if ( angle <= startAngle ) {
				prevX = anchorX;
				prevY = anchorY;		
				gc.moveTo( prevX, prevY );
				continue;
			}
			else if ( angle > endAngle )
				break;
		}
	}
	
	cp.drawDashedRectangle = function( gc, left, top, width, height, radius, ss )
	{
		var struct = new cp.dashStruct();		
		var pattern = cp.getPattern( ss, 7, 3 );
		
		if ( radius <= 0 )
			radius = 0;
			
		gc.beginPath();
		gc.moveTo( left, top + height - radius );

		cp.drawDashedLineImpl( gc, pattern, struct, left, top + height - radius, left, top + radius );
		if ( radius > 0 )
			cp.drawDashedArc( gc, pattern, struct, left + radius, top + radius, radius, radius, Math.PI, 3 * Math.PI / 2 );
		cp.drawDashedLineImpl( gc, pattern, struct, left + radius, top, left + width - radius, top );
		if ( radius > 0 )
			cp.drawDashedArc( gc, pattern, struct, left + width - radius, top + radius, radius, radius, 3 * Math.PI / 2, 2 * Math.PI );
		cp.drawDashedLineImpl( gc, pattern, struct, left + width, top + radius, left + width, top + height - radius );
		if ( radius > 0 )
			cp.drawDashedArc( gc, pattern, struct, left + width - radius, top + height - radius, radius, radius, 2 * Math.PI, 5 * Math.PI / 2 );
		cp.drawDashedLineImpl( gc, pattern, struct, left + width - radius, top + height, left + radius, top + height );
		if ( radius > 0 )
			cp.drawDashedArc( gc, pattern, struct, left + radius, top + height - radius, radius, radius, Math.PI / 2, Math.PI );
		gc.closePath();
		
		pattern = null;
		struct = null;
	}
	
	cp.drawDashedPolyLine = function( gc, ptArr, ss, iWFactor, iHFactor )
	{
		var struct = new cp.dashStruct();		
		var pattern = cp.getPattern( ss, 7, 3 );
		
		var prevX = 0, prevY = 0, currentX = 0, currentY = 0, i = 0;
		if ( 0 == ptArr.length )
			return;
		
		prevX = ptArr[ 0 ].x;
		prevY = ptArr[ 0 ].y;
		
		gc.beginPath();
		gc.moveTo( prevX, prevY );
		
		for ( i = 1; i < ptArr.length; ++i ) {
			currentX = ptArr[ i ].x;
			currentY = ptArr[ i ].y;			
			cp.drawDashedLineImpl( gc, pattern, struct, prevX*iWFactor, prevY*iHFactor, currentX*iWFactor, currentY*iHFactor );
			prevX = currentX;
			prevY = currentY;			
		}
		
		currentX = ptArr[ 0 ].x;
		currentY = ptArr[ 0 ].y;	
		
		cp.drawDashedLineImpl( gc, pattern, struct, prevX*iWFactor, prevY*iHFactor, currentX*iWFactor, currentY*iHFactor );
		
		gc.closePath();
	}
		
	cp.moveTo = function( gc, x, y, ss )
	{
		gc.moveTo( x, y );
	}
	
	cp.lineTo = function( gc, x, y, ss )
	{
		gc.lineTo( x, y );
	}

	cp.bezierCurveTo = function( gc, x1, y1, x2, y2, x3, y3, ss )
	{
		// TODO. Handle ss (stroke type)
		gc.bezierCurveTo( x1, y1, x2, y2, x3, y3 );
	}
			
	cp.getBezierLength = function( x0, y0, cx1, cy1, cx2, cy2, x3, y3, nIter )
	{
		/*  Bezier Curve representation
			1) point on curve is 
					P(t) = (1-t)^3*P0 + 3t(1-t)^2*P1 + 3t^2(1-t)*P2 + t^3*P3;  0=<t<=1
		*/
		// Find out the length.
		var i = 0, t = 0, _t = 0, R = 0, px = 0, py = 0, prevX = x0, prevY = y0;
		
		for ( i = 1; i < nIter; ++i ) {
			t = i / nIter; 
			_t = 1 - t;
		
			px = (_t * _t * _t * x0) + (3 * t * _t * _t * cx1) + (3 * t * t * _t * cx2) + ( t * t * t * x3);
			py = (_t * _t * _t * y0) + (3 * t * _t * _t * cy1) + (3 * t * t * _t * cy2) + ( t * t * t * y3);
		
			R += Math.sqrt( ( px - prevX ) * ( px - prevX ) + ( py - prevY ) *( py - prevY ) )
			prevX = px;
			prevY = py;
		}
		
		return R;
	}

    cp.getCPSlideData = function()
    {
        var slideArray = new Array();
        //what is the number of slides
        var slideCount = cp.movie.stage.slides.length;

        for (i = 0; i < slideCount; ++i)
        {
            var slideName = cp.movie.stage.slides[i];
		    var slideData = cp.D[slideName];

            var slideObject = new Object();
            slideObject.slideNumber = i + 1;
            slideObject.title = slideData.lb;
			slideObject.idealTime = (slideData.to - slideData.from + 1)/ cpInfoFPS;			
            
            slideObject.isQuestionSlide = false;
            if(cp.movie.playbackController)
			{
		        var lQuizController = cp.movie.playbackController.GetQuizController();	
		        if(lQuizController)
                {
                    var lSlideType = lQuizController.GetSlideType(i);			
			        slideObject.isQuestionSlide = lSlideType == "Question"? true : false;
                }
            }
			
			slideObject.isEndSlide = false;
            slideArray[i] = slideObject;
        }
        slideObject.isEndSlide = true;

        return slideArray;
    }

    cp.doesCourseHasQuiz = function()
    {
        if(!cp.movie.playbackController)
			return false;
        
        return cp.movie.playbackController.HasQuiz();
    }

	cp.drawDashedBezierCurve = function( gc, pattern, drawingState, x0, y0, cx1, cy1, cx2, cy2, x3, y3 )
	{
		/*  Bezier Curve representation
			1) point on curve is 
					P(t) = (1-t)^3*P0 + 3t(1-t)^2*P1 + 3t^2(1-t)*P2 + P3;  0=<t<=1
		*/
		// Find out the length.
		var i = 0, t = 0, _t = 0, R = 0, px = 0, py = 0;
		var kMagic = 3;
		var t = 0;
		var offset = 0;
		var delta = kMagic;
		var offset 			= -drawingState.m_offset;
		//offset = 0;
		var drawingDash 	= drawingState.m_drawingDash;
		var patternIndex 	= drawingState.m_patternIndex;
		var patternDistance	= 0, remaining = 0, currOffset = 0, temp = 0;
		var getOut = false;

		R = cp.getBezierLength( x0, y0, cx1, cy1, cx2, cy2, x3, y3, 100 );
		if ( R <= 0 )
			return;

		//gc.beginPath();
		//gc.moveTo( x0, y0 );
		
		while ( offset < R ) {

			currOffset = offset;
			patternDistance = pattern[ patternIndex ];

			// this means that the current pattern will cover the entire remaining curve
			if ( offset + patternDistance >= R ) {
				// store the values of offset, drawingMode, patternIndex for using next time.
				drawingState.m_offset = pattern[ patternIndex ] - ( offset + patternDistance - R );
				drawingState.m_patternIndex = patternIndex;
				drawingState.m_drawingDash = drawingDash;
				
				// set offset to length of the curve
				patternDistance = ( R - offset );
				if ( patternDistance > R ) 
					patternDistance = R; // negative offset.
				getOut = true;	
				if ( ! drawingDash ) {
					gc.moveTo( x3, y3 ); // While not drawing dash, just end.
					break;
				}
			}
			else {
				// Need to check that we just draw until the remaining distance of pattern.
				if ( offset < 0 ) {
					temp = offset;
					while ( temp < 0 )
						temp += patternDistance;
					patternDistance = temp;
					offset = 0;
				}
				// Restore.
				drawingState.m_offset = 0;
				drawingState.m_patternIndex = 0;
				drawingState.m_drawingDash = true;
			}
			if ( currOffset < 0 )
				currOffset = 0;
			if ( drawingDash && patternDistance > 0 ) {
				// Since we are drawing using fixed distances, so we may need to draw a number of lines.
				if ( patternDistance > R )
					patternDistance = R;
				if ( patternDistance > kMagic )
					delta = kMagic;
				else
					delta = patternDistance;
				remaining = patternDistance;
				do {
					if ( remaining > delta )
						currOffset += delta;
					else
						currOffset += remaining;
					t = currOffset / R;
					_t = 1 - t;
					if ( t >= 1 ) { // Edge case
						px = x3; 
						py = y3;
					}
					else {
						px = (_t * _t * _t * x0) + (3 * t * _t * _t * cx1) + (3 * t * t * _t * cx2) + (t * t * t * x3);
						py = (_t * _t * _t * y0) + (3 * t * _t * _t * cy1) + (3 * t * t * _t * cy2) + (t * t * t * y3);								
					}					
					gc.lineTo( px, py );
					remaining -= delta;
				} while ( remaining > 0 )
				if ( getOut )
					return;
			}
			else {
				t = ( offset + patternDistance ) / R;
				_t = 1 - t;
				if ( t >= 1 ) { // Edge case
					px = x3; 
					py = y3;
				}
				else {
					px = (_t * _t * _t * x0) + (3 * t * _t * _t * cx1) + (3 * t * t * _t * cx2) + (t * t * t * x3);
					py = (_t * _t * _t * y0) + (3 * t * _t * _t * cy1) + (3 * t * t * _t * cy2) + (t * t * t * y3);								
				}
				gc.moveTo( px, py );
			}

			drawingDash = ! drawingDash;
			patternIndex = ( patternIndex + 1 ) % pattern.length;			
			if ( offset < 0 )
				offset = 0;
			offset += patternDistance;
		}
	}	
	
	cp.handleQuizzingItemsInReviewMode = function(iElem, itemData, iDivName)
	{
		if(cp.movie.playbackController)
		{	
			var lQuizController = cp.movie.playbackController.GetQuizController();	
			if(lQuizController)
			{
				var isQuizButton = itemData['iqb'];		
			
				var isInReviewMode = lQuizController.GetIsInReviewMode();
				if(isQuizButton)
				{
					var type = itemData['qbt'];
					switch(type)
					{
						case 'submit':
						case 'submitAll':
						case 'clear':
						case 'skip':
						case 'back':
							if(isInReviewMode == true)
							{
								var lSlide = cp.movie.stage.currentSlide;
								var isQuestionSlide = ( lSlide.st == "Question Slide" );
								if(isQuestionSlide)
								{
									var lQuestionObj = cp.getQuestionObject(lSlide.qs);
									if(lQuestionObj)
										if(lQuestionObj.getIsKnowledgeCheck())
											break;
										cp.hide(iDivName);
								}
								//iElem.style.visibility = 'hidden';
								iElem.tabIndex = -1;
							}
							break;
						case 'reviewModeNext':
                        case 'reviewModeBack':
                            if(isInReviewMode == false)
                            {
                                cp.hide(iDivName);
                                iElem.tabIndex = -1;
                            }
							else
							{
								cp.show(iDivName);
							}
                            break;
						case 'postResult':
							var lLMSType = cp.movie.playbackController.GetLMSType();
							if(!cp.movie.playbackController.CanPostResults() || (lLMSType && lLMSType.toUpperCase() == "INTERNALSERVER"))
							{
								cp.hide(iDivName);
								//iElem.style.visibility = 'hidden';
								iElem.tabIndex = -1;
							}
							break;						
						default: break;
					}
				}
			}
		}
	}

	cp.createCanvas = function(left, top, width, height, el, styleWidth, styleHeight)
	{
		if (!el)
		{
			el = cp.newElem("canvas");
		}
		
		el.width = width;
		el.height = height;
		el.style.width = (styleWidth == undefined) ? width + "px" : styleWidth;
		el.style.height = (styleHeight == undefined) ? height + "px" : styleHeight;

		el.left = left;
		el.top = top;
		el.style.left = left + "px";
		el.style.top = top + "px";
		
		return new cp.Canvas(el);
	}

	cp.createResponsiveCanvas = function(stylesObj, width, height, el, iUseLinks)
	{
		if (!el)
		{
			el = cp.newElem("canvas");
		}
		
		if(stylesObj.ipiv)
		{
			el.width = width;
			el.height = height;	
		}
		else
		{
			el.width = 0;
			el.height = 0;
		}

		cp.applyResponsiveStyles(el, stylesObj, iUseLinks, true);

		return new cp.Canvas(el);
	}

	cp.preventEventDefault = function( event )
	{
		if ( event ) {
			if ( event.preventDefault )
				event.preventDefault();
			else
				event.returnValue = false;
		}
	}

	cp.getHitTestingRect = function(elem)
	{
		var lRect = new Object();
		lRect.minX = 0;
		lRect.minY = 0;
		lRect.maxX = 0;
		lRect.maxY = 0;
		
		if(!elem) return lRect;
		
		var lBoundingClientRect = elem.getBoundingClientRect();
		var lLeftTopScaled = cp.getScaledPosition(lBoundingClientRect.left,lBoundingClientRect.top);
		var lRightBottomScaled = cp.getScaledPosition(lBoundingClientRect.right,lBoundingClientRect.bottom);
		
		lRect.minX = lLeftTopScaled.X;
		lRect.minY = lLeftTopScaled.Y;
		lRect.maxX = lRightBottomScaled.X;
		lRect.maxY = lRightBottomScaled.Y;
		lRect.width = lRect.maxX - lRect.minX;
		lRect.height = lRect.maxY - lRect.minY;
		
		return lRect;
	}
	
	cp.IsPointWithElem = function( elem, x, y, minX, minY, maxX, maxY ) 
	{
		var rot = 0, tempX = x, tempY = y, newX = 0, newY = 0;
		if ( elem.rotateAngle )
			rot = elem.rotateAngle;
		tempX -= ( minX + maxX ) / 2;
		tempY -= ( minY + maxY ) / 2;
		newX = tempX * Math.cos( ( Math.PI * ( -rot ) ) / 180 ) - tempY * Math.sin( ( Math.PI * ( -rot ) ) / 180 );
		newY = tempX * Math.sin( ( Math.PI * ( -rot ) ) / 180 ) + tempY * Math.cos( ( Math.PI * ( -rot ) ) / 180 );
		newX += ( minX + maxX ) / 2;
		newY += ( minY + maxY ) / 2;
		if ( ( newX >= minX && newX <= maxX ) && ( newY >= minY && newY <= maxY ) )
			return true;
		return false;
	}
	
	cp.handleDblClick = function( event )
	{
		var clickManager = null;
		var clickDataArr = null;
		var clickData = null;
		var lScaledPosition = cp.getScaledPosition(getPageX(event), getPageY(event));
		var x = lScaledPosition.X;// - cp.movie.offset;
		var y = lScaledPosition.Y;// - cp.movie.topOffset;
		var minX = 0, minY = 0, maxX = 0, maxY = 0;
		var divElem = null;
		var retVal = false;
		var i = 0;
				
		// Check whether there is any double click in the click region.
		clickManager = cp.movie.stage.getClickManager();
		clickDataArr = clickManager.getDoubleClickArr( cpInfoCurrentFrame );
		if ( null == clickDataArr || 0 == clickDataArr.length )
			return;

		// Remove timer for mouse down if present.
		cp.stopClickTimer();
		for ( i = 0; i < clickDataArr.length; ++i ) { 
			clickData = clickDataArr[ i ];
			if ( ! clickData )
				continue;
			divElem = clickData.m_htmlElem;
			if ( clickData.m_obj && clickData.m_obj.actionInProgress )
				continue;
			
			var lHitTestingRect = cp.getHitTestingRect(divElem);
						
			// If handled, set handled true and remove the handler.
			if ( clickData.m_obj && cp.IsPointWithElem( divElem, x, y, lHitTestingRect.minX, lHitTestingRect.minY, lHitTestingRect.maxX, lHitTestingRect.maxY ) ) {
				var lCurrentAttempt = 0;
				var lObjId;
				var lObjC;
				var cAttempt = clickData.m_obj.currentAttempt;
				if (cAttempt != undefined)
					lCurrentAttempt = cAttempt;
				if(clickData.m_obj.mdi)
					lObjC = cp.D[clickData.m_obj.mdi];
				if(lObjC!=undefined)
					lObjId = lObjC.dn;
				if(lObjId)
					cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.CORRECT, lCurrentAttempt);
				retVal = cp.clickSuccessHandler( clickData.m_obj );
				clickData.m_obj.handled = true;
				return;
			}
		}
		// Exhausted success, so, go for failure, with first one.
		clickData = clickDataArr[ 0 ];
		if ( clickData && clickData.m_obj && ! clickData.m_obj.actionInProgress ) 
		{
			var canvasItem = clickData.m_obj.mdi;
			var isVisible = cp.D[ canvasItem ].visible;	
			
			var currentAttempt = 0;
			var cAttempt = clickData.m_obj.currentAttempt;
			if (cAttempt != undefined)
				currentAttempt = cAttempt;

			currentAttempt = currentAttempt + 1;
			clickData.m_obj[ 'currentAttempt' ] = currentAttempt;
			
			var maxAttempts = clickData.m_obj[ 'ma' ];			
			var shouldExecuteAction = ( maxAttempts != -1 && currentAttempt == maxAttempts ) && ( isVisible );		
			var lCanShowFeedbackCaption = ( maxAttempts == -1 || currentAttempt <= maxAttempts ) && ( isVisible );		
			var lObjId;
			var lObjC;
			if(clickData.m_obj.mdi)
				lObjC = cp.D[clickData.m_obj.mdi];
			if(lObjC!=undefined)
				lObjId = lObjC.dn;
			if(lObjId)
				cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.INCORRECT, currentAttempt-1);
				
			cp.clickFailureHandler( clickData.m_obj, shouldExecuteAction, lCanShowFeedbackCaption );
			if ( ! clickData.m_obj.handled )
				clickData.m_obj.handled = ( maxAttempts != -1 && currentAttempt >= maxAttempts ) && ( isVisible );
		}	
	}
	
	cp.handleRightClick = function(event)
	{
		var clickManager = null;
		var clickDataArr = null;
		var clickData = null;
		var lScaledPosition = cp.getScaledPosition(getPageX(event), getPageY(event));
		var x = lScaledPosition.X;// - cp.movie.offset;
		var y = lScaledPosition.Y;// - cp.movie.topOffset;
		var minX = 0, minY = 0, maxX = 0, maxY = 0;
		var divElem = null;
		var retVal = false;
		var i = 0;
		
		// Check whether there is any double click in the click region.
		clickManager = cp.movie.stage.getClickManager();
		clickDataArr = clickManager.getRightClickArr( cpInfoCurrentFrame );
		if ( null == clickDataArr || 0 == clickDataArr.length )
			return;
		
		// Remove timer for mouse down if present.
		cp.stopClickTimer();
		
		for ( i = 0; i < clickDataArr.length; ++i ) { 
			clickData = clickDataArr[ i ];
			if ( ! clickData )
				continue;
		
			if ( clickData.m_obj && clickData.m_obj.actionInProgress )
				continue;
			divElem = clickData.m_htmlElem;
			
			var lHitTestingRect = cp.getHitTestingRect(divElem);
			
			// If handled, set handled true and remove the handler.
			if ( clickData.m_obj && cp.IsPointWithElem( divElem, x, y, lHitTestingRect.minX, lHitTestingRect.minY, lHitTestingRect.maxX, lHitTestingRect.maxY ) ) {
				var lCurrentAttempt = 0;
				var lObjId;
				var lObjC;
				var cAttempt = clickData.m_obj.currentAttempt;
				if (cAttempt != undefined)
					lCurrentAttempt = cAttempt;
				if(clickData.m_obj.mdi)
					lObjC = cp.D[clickData.m_obj.mdi];
				if(lObjC!=undefined)
					lObjId = lObjC.dn;
				if(lObjId)
					cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.CORRECT, lCurrentAttempt);
					
				retVal = cp.clickSuccessHandler( clickData.m_obj );
				clickData.m_obj.handled = true;
				if ( retVal ) 
					cp.preventEventDefault( event ); // prevent default.
				return;
			}
		}
		// Exhausted success, so, go for failure, with first one.
		clickData = clickDataArr[ 0 ];
		if ( clickData && clickData.m_obj && ! clickData.m_obj.actionInProgress ) {
			var canvasItem = clickData.m_obj.mdi;
			var isVisible = cp.D[ canvasItem ].visible;	
			
			var currentAttempt = 0;
			var cAttempt = clickData.m_obj.currentAttempt;
			if (cAttempt != undefined)
				currentAttempt = cAttempt;

			currentAttempt = currentAttempt + 1;
			clickData.m_obj[ 'currentAttempt' ] = currentAttempt;
			
			var maxAttempts = clickData.m_obj[ 'ma' ];			
			var shouldExecuteAction = ( maxAttempts != -1 && currentAttempt == maxAttempts ) && ( isVisible );		
			var lCanShowFeedbackCaption = ( maxAttempts == -1 || currentAttempt <= maxAttempts ) && ( isVisible );		
			
			var lObjId;
			var lObjC ;
			if(clickData.m_obj.mdi)
				lObjC = cp.D[clickData.m_obj.mdi];
			if(lObjC!=undefined)
				lObjId = lObjC.dn;
			if(lObjId)
				cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.INCORRECT, currentAttempt-1);					
			cp.clickFailureHandler( clickData.m_obj, shouldExecuteAction, lCanShowFeedbackCaption );
			if ( ! clickData.m_obj.handled )
				clickData.m_obj.handled = ( maxAttempts != -1 && currentAttempt >= maxAttempts ) && ( isVisible );
		}	
	}
	cp.handleMouseOut = function(event)
	{
		if(cp.device == cp.DESKTOP)
		{
			//this.onmousemove = null;
			var slideDiv = cp.movie.stage.getSlideDiv();
			if (slideDiv)
			{
				slideDiv.touchstartX = null;
				slideDiv.isMoving = false;
			}
		}
	}
	cp.handleMouseMove = function(event)
	{
		var lCurrMousePosition = event.pageX + "," + event.pageY;
		if(cp.LastMousePosition == lCurrMousePosition)
			return;

		cp.LastMousePosition = lCurrMousePosition;
		var playbar = document.getElementById('playbar');	
		if(playbar!=undefined && playbar.animator)
		{
			playbar.animator.showPlaybar(cpInfoCurrentFrame >= cp.movie.stage.lastFrame ? true : false);
		}
	}

	cp.handleMouseOver = function(event)
	{
		var playbar = document.getElementById('playbar');	
		if(playbar!=undefined && playbar.animator)
		{
			playbar.animator.showPlaybar(cpInfoCurrentFrame >= cp.movie.stage.lastFrame ? true : false);
		}		
	}

	var objectsByType = {};
	cp.initObjectFactory = function ()
	{
		objectsByType["questionSlideReviewLabel"] = cp.QuestionSlideReviewLabel;
		objectsByType["progressSlideLabel"]= cp.ProgressSlideLabel;
		objectsByType["fibAnswer"] = cp.FIBAnswer;
		objectsByType["shortAnswer"] = cp.ShortAnswer;
		objectsByType["sequenceInput"]= cp.SequenceInput;
		objectsByType["matchingAnswer"]= cp.MatchingAnswer;
		objectsByType["matchingItem"]= cp.MatchingItem;
		objectsByType["likertItem"]= cp.LikertItem;
		objectsByType["hotspotInput"]= cp.HotspotInput;
		objectsByType["multipleChoiceInput"]= cp.MCQInput;
		objectsByType["resultSlideLabel"]= cp.ResultSlideLabel;
		objectsByType["singleChoiceInput"]= cp.MCQInput;
		objectsByType["input"]= cp.TextInput;
		objectsByType["textbutton"]= cp.TextButton;
		objectsByType["shape"]= cp.Shape;
		objectsByType["image"]= cp.DisplayObject;
		objectsByType["group"]= cp.Group;
		objectsByType["svg"]= cp.DisplayObject;
		objectsByType["text"]= cp.DisplayObject;
		objectsByType["placeholder"]= cp.Placeholder;
		objectsByType["hb"]= cp.HighlightBox;
		objectsByType["rai"]= cp.RolloverAreaItem;
		objectsByType["mc"]= cp.MouseClick;
		objectsByType["gf"]= cp.Gradient;
		objectsByType["imgf"]= cp.ImageFill;
        objectsByType["typingtext"]= cp.TypingText;
		objectsByType["line"]= cp.Line;
		objectsByType["drawingItem"]= cp.DrawingItem;
		objectsByType["answerArea"] = cp.AnswerArea;
		objectsByType["rectWithText"]= cp.RectWithText;
		objectsByType["autoShape"] = cp.AutoShape;
		objectsByType["widget"]= cp.Widget;
		objectsByType["WebObject"] = cp.WebObject;
		objectsByType["eventVideo"] = cp.EventVideo;
		objectsByType["slideVideo"] = cp.SlideVideo;
		objectsByType["fmrVideo"]= cp.FMRVideo;
		objectsByType["cpvcVideo"]= cp.CPVCVideo;
		objectsByType["zoom"] = cp.Zoom;
		objectsByType["ta"] = cp.TextAnimation;
		objectsByType["animationItem"] = cp.AnimationItem;
        
		if(cp.extObjInfo)
		{
			if (cp.IsValidObj(cp.extObjInfo))
			{
				for (var ii = 0; ii < cp.extObjInfo.length; ++ii)
				{
					if (cp.IsValidObj(cp.extObjInfo[ii]))
					{
						objectsByType[cp.extObjInfo[ii].n] = cp.extObjInfo[ii].cls;
					}
				}
			 }
		}
	};

	cp.parseChildren = function(el, args)
	{
		var prefix = "cp-";
		var prefixLength = prefix.length;
		
		var children = [];
		
		var childCanvasName = el.id + 'c';
		if(rewrapChildrenMap[childCanvasName])
			children.push(rewrapChildrenMap[childCanvasName]);
			 
		var child = el.firstChild;
		for( ; child; child = child.nextSibling)
		{
			var elObj = child;
			var rewrapChild = false;
			if(child.className == "cp-rewrap")
			{
				elObj = child.firstChild;
				rewrapChild = true;
			}
			if (elObj.nodeType != Node.ELEMENT_NODE)
				continue;
				
			var classNames = (elObj.className + "").split(" ");
			
			var type = null;
			var classname;
			var needsId = false;
			var parentId = '';
			
			for (var i=0; i<classNames.length && type == null; ++i)
			{
				if (classNames[i].substr(0, prefixLength) == prefix)
				{
					// found a potential type prefix
					classname = classNames[i].substr(prefixLength);
					type = objectsByType[classname];
					var tempStr = classNames[i].substr(prefixLength);
					if (tempStr == "gf" || tempStr == "imgf" || tempStr == "drawingItem" 
						|| tempStr == "answerArea" || tempStr == "rectWithText" || tempStr == "autoShape")
						needsId = true;
					if (( tempStr == "gf" || tempStr == "imgf" ) && elObj.parentElement)
						parentId = elObj.parentElement.id; // Gradient background for JS.
				}
			}
			
			if (!type)
			{
				//console.error("Invalid type for element " + elObj.id);
				continue;
			}

			var childObj = cp.ropMap[elObj.id];
			if(!childObj)
			{
				if (needsId) {
					if (0 == parentId.length)
						parentId = elObj.id;
					childObj = new type(elObj, parentId, args);
				}
				else
					childObj = new type(elObj, args);

				if(cp.verbose)
					cp.log('created new ' + classname);
					
				var rop = 0;
				var divName = childObj.getAttribute('dn');
				if(divName)
				{
					rop = cp.D[divName].rp;
				}
				if(elObj.id && 1 == rop)
				{
					cp.ropMap[elObj.id] = childObj;
					if(cp.verbose)
						cp.log('added ' + elObj.id +' to cp.ropMap');
				}
			}
			else
			{
				childObj.restOfProjectDoOnNewSlide();
				if(cp.verbose)
					cp.log('resued childObj from cp.ropMap for ' + elObj.id);
			}

			displayObjectMap[elObj.id] = childObj;

			if(rewrapChild)
				rewrapChildrenMap[elObj.id] = childObj;
			else
				children.push(childObj);
		}
		return children;
	}
	
	cp.removeFromDisplayObjectMap = function(iKey)
	{
		displayObjectMap[iKey] = undefined;
	}

	cp.parseFrameset = function(el)
	{
		if(cp.verbose)
			cp.log('parseFrameset ' + el.id);
			
		var children = cp.parseChildren(el);
		
		if(PPTXLib.instanceManager)
			PPTXLib.addToInstanceManager(el.id,children[0]);
		
		var f = new cp.FrameSet(el, children);
		displayObjectMap[el.id] = f;
		return f;
	}
		
	cp.parseTimeline = function (el)
	{
		return new cp.Timeline(el);
	}

	cp.shouldMoveTo = function(frame)
	{
		return cp.movie.stage.canUpdateToFrame(frame);
	}
	cp.getCpInfoOriginalFPS = function()
	{
		return cp.movie.fps;
	}
	cp.getCpInfoSpeed = function()
	{
		return cp.movie.speed;
	}
	cp.getCpElapsedMovieTime =function()
	{
		return cp.movie.elapsedMovieTime;
	}
	cp.getCpIsPlaying = function()
	{
		return !cp.movie.paused;
	}
	cp.showValue = function(frame) 
	{
		cp.showHideElements();
		cp.movie.pause(cp.ReasonForPause.SHOW_VALUE_AT_FRAME);
		cp.movie.jumpToFrame(frame);
	}
	cp.hyperlinkClick = function( divId ) 
	{ 
		var hyperLink_divData = cp.D[divId];
		if (hyperLink_divData)
		{
			var actionString = hyperLink_divData['oca'];
				if(cp.movie.paused)
				{
				   actionString = actionString.replace("cpCmndResume = 1;", "");
				   actionString = actionString.replace("cp.actionChoiceContinueMovie();","");         		
				}
													
			cp.movie.executeAction(actionString); 
		}	
	}

	function getBaseStateItemName(item)
	{
		var retVal = item;
		var itemData = cp.D[item];
		if(itemData)
		{
			if(itemData.sicbs)
			{ // clone of base State Item.
				if(undefined !== itemData.bstiid && -1 !== itemData.bstiid)
					retVal = cp.getDisplayObjNameByCP_UID(itemData.bstiid);
			}
		}
		return retVal;
	}

	cp.SubmitInteractions = function(objName,isCorrectEnum,currentAttempt,iCorrectValues,iCurrentValue)
	{
		var lClickItemData = cp.D[objName];
		
		var objName = getBaseStateItemName(objName);
		lClickItemData = cp.D[objName];

		var objType = lClickItemData.type;   
		var isCorrect = (isCorrectEnum == cp.QuestionStatusEnum.CORRECT || isCorrectEnum == cp.QuestionStatusEnum.PARTIAL_CORRECT);
		if ( ! lClickItemData )
			return;
		var shouldIncludeInQuiz = ((lClickItemData['siq'] != undefined) && (lClickItemData['siq']));
		if(shouldIncludeInQuiz)
		{
			var lQuestionObj = cp.getQuestionObject(objName);
			if(lQuestionObj)
			{
				if(!cp.movie.playbackController)
					return;
				var lQuizController = cp.movie.playbackController.GetQuizController();	
				if(!lQuizController)
					return;
				
				var wasDisabled = lQuestionObj.isDisabled;
				var lIsDone = false;
				if(!lQuizController.GetIsInReviewMode() && !lQuizController.GetIsQuizCompleted())
					lQuestionObj.setCurrentAttempt(currentAttempt + 1);
				
				var lCorrectValues = iCorrectValues;
				var lCurrentValue = iCurrentValue;
				if(lCorrectValues == undefined || lCurrentValue == undefined)
				{		
					if(!lQuestionObj.getIsInteractiveWidget() && lQuestionObj.getInteractionType() == "fill-in")
					{
						var inputFieldName = objName + '_inputField'; 
						var input = document.getElementById( inputFieldName );
						if ( ! input )
							return false;				
						
						lCorrectValues = lClickItemData['exp'];
						lCurrentValue = input.value;
					}	
					else
					{					
						lCorrectValues = ['1'];
						if(isCorrect)
							lCurrentValue = '1';
						else
							lCurrentValue = '0';
					}
				}

				lQuestionObj.questionData['cal'] = lCorrectValues;
				lQuestionObj.setSelectedAnswers(lCurrentValue);
				
				if(isCorrectEnum == cp.QuestionStatusEnum.CORRECT || isCorrectEnum == cp.QuestionStatusEnum.PARTIAL_CORRECT)
				{				
					lIsDone = true
				}
				else
				{
					if(lQuestionObj.getCurrentAttempt() >= lQuestionObj.getNumberOfAttempts())
						lIsDone = true;
				}
							
				var shouldAddToTotal = ((lClickItemData['sat'] != undefined) && (lClickItemData['sat']));
				lQuestionObj.setShouldAddToTotal(shouldAddToTotal);
				if(!lQuizController.GetIsInReviewMode() && !lQuizController.GetIsQuizCompleted())
				{				
					if(lIsDone)
					{
						if(isCorrect)
							lQuestionObj.setQuestionStatus(lQuestionObj.QuestionStatusEnum.CORRECT);
						else
							lQuestionObj.setQuestionStatus(lQuestionObj.QuestionStatusEnum.INCORRECT);
						if(!wasDisabled)
						{
							lQuestionObj.endQuestion(true);
						}
					}
					else
					{
						lQuestionObj.endQuestion(false);
					}
				}
			}        
		}

			var evtArgs = {
							itemname: objName,
							frameNumber: cpInfoCurrentFrame,
							objecttype: objType,
							issuccess: isCorrect,
							slideNumber: cpInfoCurrentSlideIndex + 1,
							includedInQuiz:shouldIncludeInQuiz
						};
			if (lQuestionObj)
				  evtArgs.questioneventdata = lQuestionObj.getQuestionEventData()       

			cp.em.fireEvent('CPInteractiveItemSubmit',evtArgs);
		}
	cp.hotspotQuestionSlideHandler = function(e) 
	{ 
		cp.m_gestureHandler.disableGestures();
		var currDiv = e.currentTarget; 
		var children = currDiv.childNodes; 
		var currElement = children[0]; 
		var currElementDivData = cp.D[currElement.id];
		var lQuestionObj = cp.getQuestionObject(currElement.id); 
		if(lQuestionObj)
			lQuestionObj.hotspotQuestionHandler(currDiv, getPageX(e), getPageY(e));

		cp.m_gestureHandler.enableGestures();
	} 
	cp.handleClickExternal = function(e)
	{
		function IsNonQuestionInteractiveObject(obj)
		{
			// For the moment, handle only click box.
			return cp.kCPOTClickBoxItem == obj.type || cp.kCPOTScorableButtonItem == obj.type || cp.kCPOTAutoShape == obj.type;
		}	
		
		function createClickTimer( currElem, clickItem, attempt ) 
		{
			var elem = currElem;
			var cItem = clickItem;
			var currentAttempt = attempt;
			
			function handleClickInternal()
			{
				cp.stopClickTimer();
				currentAttempt = currentAttempt + 1;
				cItem[ 'currentAttempt' ] = currentAttempt;
				
				var maxAttempts	= cItem[ 'ma' ];
				var canvasItem = cItem[ 'mdi' ];
				var isVisible = (cp.D[canvasItem].visible);	
				
				var shouldExecuteAction = (maxAttempts != -1 && currentAttempt == maxAttempts) && (isVisible);
				var lCanShowFeedbackCaption = (maxAttempts == -1 || currentAttempt <= maxAttempts) && (isVisible);
				var retVal = cp.showHideFeedbackCaptionsClickHandler( currElem, shouldExecuteAction, cp.D[canvasItem].dn, lCanShowFeedbackCaption);
				if ( IsNonQuestionInteractiveObject( cItem ) && ! cItem.handled ) 
					cItem.handled = (maxAttempts != -1 && currentAttempt >= maxAttempts) && (isVisible);
				return retVal;
			}
			
			if ( ! cp.isClickTimerRunning() )
				cp.startClickTimer( 500, handleClickInternal );
		}
		
		function ShouldHandle( obj )
		{
			// For autoshape on hotspot question, we need to handle only when autoshape is on top.
			if ( ! obj || cp.kCPOTAutoShape != obj.type )
				return true; // handle.
				
			var currSlide = cp.movie.stage.currentSlide;
			var isHotspot = false;
			var areQuestionSlideOptionsDisabled = false;
			
			var sFrom = 0, sTo = 0;
			
			if ( currSlide ) {
				sFrom = currSlide.from;
				sTo = currSlide.to;
				if ( currSlide.st == "Question Slide" ) {
					if ( currSlide.qs ) {
						var data = cp.D[ currSlide.qs ]; 
						if ( data && data.qtp == 'Hotspot' )
							isHotspot = true;
						
						var lQuestionObj = cp.getQuestionObject(currSlide.qs);
						if(lQuestionObj && lQuestionObj.shouldDisableOptions())
							areQuestionSlideOptionsDisabled = true;
					}
				}
			}
			
			if ( ! isHotspot )
				return true; // not hot spot, so default behaviour.
			
			if(areQuestionSlideOptionsDisabled)
				return true; // if answer options are to be disabled on any question slide, smart button actions can be handled.
					
			if ( ! obj.rp )
				return false; // not rest of project, on hot spot, so no handling.
				
			if ( ! obj.rpa )
				return false; // not above, so no handling.
				
			// This autoshape is rest of project and above, but starts at this slide.
			var objfrom = obj.from;
			if ( obj.from > sFrom )
				return false; // Starts on this slide.
				
			return true; // handle
		}
		
		function ShouldShowFailure()
		{
			shouldShowFailure = true;
			if ( null == firstFailureClickItem ) {
				// Now check whether this really has failure action. For failure action:
				// a) failure caption should be there OR
				// b) attempts should not be infinite.
				if ( clickItem.ofc || clickItem.ma != -1 ) {
					firstFailureClickItemId = clickItemId;
					firstFailureClickItem = clickItem;
					failureCurrentAttempt = currentAttempt;
					failureMaxAttempts = maxAttempts;
					failureElemDivData = currElementDivData;
				}
			}
		}
		
		if ( cp.isClickTimerRunning() )
		{
			if(e.cpCustomData && e.cpCustomData.asPartOfStateChange)
			{
				return cp.handleDblClick(e);
			}
			return false;
		}
			
		var lScaledPosition = cp.getScaledPosition(getPageX(e), getPageY(e));
		var x = lScaledPosition.X - window.pageXOffset;
		var y = lScaledPosition.Y - window.pageYOffset;
		
		//x -= cp.movie.offset;
		//y -= cp.movie.topOffset;
		var clickItem = null;
		var currDiv = cp("div_Slide");//e.currentTarget;
		var children = currDiv.childNodes;
		var shouldShowFailure = false;
		var clickItemId = '';
		var firstFailureClickItem = null;
		var firstFailureClickItemId = '';
		var maxAttempts = -1;
		var currentAttempt = 0;
		var failureMaxAttempts = -1;
		var failureCurrentAttempt = 0;
		var failureElemDivData = null;
		
		for(var i=children.length - 1; i >= 0; --i)
		{
			var currElement = children[i];
			if(currElement.nodeName != 'DIV')
				continue;
			if(currElement.style.display != 'block')
				continue;

			//only for question slides
			if(currElement.id == "feedbackClickDiv")
				currElement.remover();

			currElementDivData = cp.D[currElement.id];
			if(!currElementDivData)
				continue;
			var canvasItem = currElementDivData['mdi'];
			if(!cp.D[canvasItem].visible)
				continue;
			
			if(!currElementDivData['chfn'])
				continue;
			if(undefined != currElementDivData['val'])
				continue;
			
			var drawingItemForCurrElement = currElementDivData['mdi'];
			drawingItemDivData = cp.D[drawingItemForCurrElement];
			
			currentAttempt = 0;
			maxAttempts = -1;
			var cAttempt = currElementDivData ['currentAttempt'];
			if (cAttempt != undefined)
				currentAttempt = cAttempt;
			maxAttempts = currElementDivData ['ma'];
			clickItem = currElementDivData;
			clickItemId = currElement.id;
			
			if (undefined != clickItem.amc && ! clickItem.amc) {
				if ( cp.device != cp.IDEVICE  || cp.device == cp.ANDROID) // For touch based devices we don't honour this.
					continue; // No mouse click allowed.
			}
			
			if ( currElementDivData  &&  drawingItemDivData && (cp.kCPOTWidgetItem  == currElementDivData.type)  && drawingItemDivData.iiw)
			{
				//check for interactive widget
				//Check if we need to send Scaled Position in event
				cp.HandleInteractiveWidget(e,drawingItemForCurrElement);
				continue;
			}
			
			var projectData = cp.D['project'];
			
			var minX = 0;
			var minY = 0;
			var maxX = 0;
			var maxY = 0;
			if(currElement.getBoundingClientRect == undefined)
			{
				minX = parseFloat(currElement.style.left);
				minY = parseFloat(currElement.style.top);
				maxX = parseFloat(currElement.style.left) + parseFloat(currElement.style.width);
				maxY = parseFloat(currElement.style.top) + parseFloat(currElement.style.height);
			}
			else
			{
				var lTransform;
				if(currElement.rotateAngle)
				{
					lTransform = currElement.style['transform'] ||
									currElement.style['msTransform'] ||
									currElement.style['MozTransform'] ||
									currElement.style['WebkitTransform'] ||
									currElement.style['OTransform'];
				
					cp.applyTransform(currElement,"rotate(0)");
				}
				currElement.offsetHeight = currElement.offsetHeight;
				var lHitTestingRect = cp.getHitTestingRect(currElement);
				
				if(currElement.rotateAngle)
					cp.applyTransform(currElement,lTransform);
				
				minX = lHitTestingRect.minX;
				minY = lHitTestingRect.minY;
				maxX = lHitTestingRect.maxX;
				maxY = lHitTestingRect.maxY;
			}
			var rot = 0;
			if(currElement.rotateAngle)
				rot = currElement.rotateAngle;
			var IsPointWithin = function()
			{
				var tempX = x;
				var tempY = y;
				tempX -= (minX + maxX)/2;
				tempY -= (minY + maxY)/2;
				var newX = tempX*Math.cos((Math.PI*(-rot))/180) - tempY*Math.sin((Math.PI*(-rot))/180);
				var newY = tempX*Math.sin((Math.PI*(-rot))/180) + tempY*Math.cos((Math.PI*(-rot))/180);
				newX += (minX + maxX)/2;
				newY += (minY + maxY)/2;
				if((newX >= minX && newX <= maxX) && (newY >= minY && newY <= maxY))
					return true;
				
				return false;
			};
			if(IsPointWithin())
			{
				if(currElementDivData['iqb'])
					return true; // Question buttons - have been handled separately.
				if(currElementDivData['vid'])
					return true; // TEB button - has already been handled.
				if(cp.kCPOTAutoShape == clickItem.type) 
				{
					if(currElementDivData.isCanvasClicked)
					{
						if(!currElementDivData.isCanvasClicked(e,true))
						{
							ShouldShowFailure();
							continue;
						}
					}
										
					/*if((currentAttempt <= maxAttempts) || (maxAttempts == -1))
						clickHandlerFunctionName(currElement);	// can cause slide jump.
					currElementDivData.enabled = false;
					if(currElementDivData.canvasPainterObject)
						currElementDivData.canvasPainterObject.removeMouseHandlers();*/
				}

				var baseStateItemName = getBaseStateItemName(currElement.id);
				var baseStateItemData = cp.D[baseStateItemName];
				if(baseStateItemData['enabled'])
				{
					if ( clickItem.actionInProgress )
						return false;
					if ( clickItem.dclk || clickItem.rclk ) {
						// Can only be wrong.
						createClickTimer( currElement, clickItem, currentAttempt ); 
						return false;
					}
					if ( ! ShouldHandle( clickItem ) ) 
						return false;

					var clickHandlerFunctionName = currElementDivData['chfn'];
					cp.SubmitInteractions(currElement.id, cp.QuestionStatusEnum.CORRECT, currentAttempt);
					var oldSlide = cp.movie.stage.currentSlide;
					
					clickHandlerFunctionName(currElement);	// can cause slide jump.
						
					var newSlide = cp.movie.stage.currentSlide;
					if ( oldSlide == newSlide && IsNonQuestionInteractiveObject( clickItem ) )
						clickItem.handled = true; 
					return true;
				}
				shouldShowFailure = false;
				break;
			}
			else if ( currElementDivData['vid'] ) // TEB button. No handling needed.
				continue;
			else {
				ShouldShowFailure();
			}
		}
		
		if ( shouldShowFailure ) {
			if ( firstFailureClickItem ) {
				clickItem = firstFailureClickItem;
				clickItemId = firstFailureClickItemId;
				currentAttempt = failureCurrentAttempt;
				maxAttempts = failureMaxAttempts;
				currElementDivData = failureElemDivData;
			}
			if ( clickItem && clickItem.actionInProgress )
				return false;
			if(clickItem && !clickItem.iqb)
			{
				currentAttempt = currentAttempt + 1;
				clickItem.currentAttempt = currentAttempt;
				
				/*if(clickItem.type == cp.kCPOTAutoShape)
				{
					if((maxAttempts != -1) && currentAttempt >= maxAttempts || !currElementDivData.enabled)
					{
						if(!currElementDivData.enabled && currElementDivData.canvasPainterObject)
							currElementDivData.canvasPainterObject.removeMouseHandlers();									
						if(currentAttempt > maxAttempts || !currElementDivData.enabled)
						{
							currElementDivData.enabled = false;
							return;
						}				
					}
				}*/
				
				var lItemId;
				var lItemCanvas;
				if(clickItem.mdi)
					lItemCanvas = cp.D[clickItem.mdi];
				if(lItemCanvas)
					lItemId = lItemCanvas.dn;			
				cp.SubmitInteractions(lItemId, cp.QuestionStatusEnum.INCORRECT, currentAttempt - 1);
			}
			
			var canvasItem = currElementDivData['mdi'];
			var isVisible = (cp.D[canvasItem].visible);	
			
			var shouldExecuteAction = (maxAttempts != -1 && currentAttempt == maxAttempts) && (isVisible);
			var lCanShowFeedbackCaption = (maxAttempts == -1 || currentAttempt <= maxAttempts) && (isVisible);
			var itemForHandling = '';
			if ( clickItem && IsNonQuestionInteractiveObject( clickItem ) )
				itemForHandling = clickItemId;
			cp.showHideFeedbackCaptionsClickHandler(children[0],shouldExecuteAction, itemForHandling, lCanShowFeedbackCaption);
			if (clickItem && IsNonQuestionInteractiveObject( clickItem ) && ! clickItem.handled ) 
				clickItem.handled = (maxAttempts != -1 && currentAttempt >= maxAttempts) && (isVisible);
		}
		return false;
	}

	cp.handleClick = function(e)
	{
		if(cp.disableInteractions)
			return;
		if(e.preventDefault)
			e.preventDefault();
		if(e.stopPropagation)
			e.stopPropagation();
		var handled = cp.handleClickExternal(e);
		if(!handled)
		{
			/*var currDiv = e.currentTarget; */
			var currDiv = cp("div_Slide");
			var children = currDiv.childNodes; 
			var currElement = children[0]; 
			if(!currElement)
				return;
			if(currElement.nodeName != 'DIV') 
					return; 
			if(currElement.style.display != 'block') 
					return; 
			
			if(cp.getQuestionObjectName)
			{
				var lQuestionObjName = cp.getQuestionObjectName(currElement.id);		
				var lQuestionObjData = cp.D[lQuestionObjName];
				if(lQuestionObjData)
				{	
					if(lQuestionObjData['qtp'] == 'Hotspot')
					{
						cp.hotspotQuestionSlideHandler(e);
						handled = true;
					}
				}
			}			
			if(cp.extObjInfo)
			{
				for (var ii =0; ii < cp.extObjInfo.length; ++ii)
				{
					if (cp.IsValidObj(cp.extObjInfo[ii].chcb))
					{
						if (cp.extObjInfo[ii].chcb ())
						{
							handled = true;
							break;
						}
					}
				}
			}
			/*if(!handled && cp.device != cp.DESKTOP)
			{
				if(getCpCmndPause())
					setCpCmndResume(true);
				else
					setCpCmndPause(true);

			}*/
		}
	}
	
	cp.showHideElements = function()
	{
		cp('blockUserInteraction').style.display = 'none';
		cp.autoplayDiv.style.display = 'none';
		cp.autoplayDiv.style.visibility = 'hidden';
		if(cp.loadedModules.playbar)	
		document.getElementById('playbar').style.display = 'block';
		var snapShotElem = document.getElementById('firstSlideSnapshot');
		if ( snapShotElem )
			snapShotElem.style.display = 'none';
		if(cp.gesturesDiv)
		{
			cp.gesturesDiv.style.display="none";
			cp.gesturesDiv.parentElement.removeChild(cp.gesturesDiv);
		}
		if(cp("gImage"))
		{
			cp("gImage").className = "";
		}
		if(cp("gestureHint"))
		{
			cp("gestureHint").style.position = "absolute";
			cp("gestureHint").style.backgroundColor = "";
		}
	}

	cp.beginMovie = function()
	{
		cp.showHideElements();
		if(1 == cpInfoCurrentFrame)
			cp.movie.am.play(1, true);
		cp.movie.play();
	}

	cp.InitMedia = function()
	{
		cp.movie.vdm.deviceSpecificInit();
		cp.movie.am.deviceSpecificInit();
	}

	cp.playMovie = function() 
	{
		cp.movie.play();
	}
	cp.pauseMovie = function()
	{
		cp.movie.pause();
	}

	cp.mouse_click_draw = function(ctx, data, objectToBeHidden, visible, divName)
	{
		var drawColor = "#000000";
		var r = 3;
		if (undefined != data.c) {
			drawColor = data.c;
			r = data.r;
		}

		ctx.save();

		ctx.fillStyle = drawColor;
		ctx.beginPath();
		ctx.arc( r, r, r, 0, Math.PI*2, true );
		ctx.closePath();
		ctx.fill();
		
		ctx.restore();
		ctx = null;	
		return true;
	}
	 
	cp.mcd = function(ctx, data, objectToBeHidden, visible, divName)
	{
		return cp.mouse_click_draw(ctx, data, objectToBeHidden, visible, divName);
	}
	
	cp.tcd = function(ctx,image,l,t,w,h,lPixelColor)
	{
		if(w <= 0 || h <= 0)
			return;
		ctx.clearRect(l,t,w,h);
		ctx.translate(l,t);
		var srcWidth = image.width;
		var srcHeight = image.height;
		var lIsTargetImageWSmaller = srcWidth > w;
		var lIsTargetImageHSmaller = srcHeight > h;
		var lRectW = lIsTargetImageWSmaller ? w : srcWidth;
		var lRectH = lIsTargetImageHSmaller ? h : srcHeight;

		// Copy left, top
		ctx.drawImage(image,0, 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 
							0, 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));
		// Copy right, top
		ctx.drawImage(image,Math.floor(srcWidth - lRectW / 2), 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 
							Math.floor(w - ( lRectW / 2 )), 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));
		// Copy left, bottom
		ctx.drawImage(image,0, Math.floor(srcHeight - lRectH / 2), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 0, 
							Math.floor(h - ( lRectH / 2 )), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));
		// Copy right, bottom
		ctx.drawImage(image,Math.floor(srcWidth - lRectW / 2), 
							Math.floor(srcHeight - lRectH / 2), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 
							Math.floor(w - ( lRectW / 2 )), 
							Math.floor(h - ( lRectH / 2 )), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));	

		ctx.save();
		ctx.shadowColor = cp.ConvertRGBToRGBA("#ffffff","1" );	
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 0;
		
		// Copy left, top
		ctx.drawImage(image,0, 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 
							0, 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));
		// Copy right, top
		ctx.drawImage(image,Math.floor(srcWidth - lRectW / 2), 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 
							Math.floor(w - ( lRectW / 2 )), 0, 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));
		// Copy left, bottom
		ctx.drawImage(image,0, Math.floor(srcHeight - lRectH / 2), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 0, 
							Math.floor(h - ( lRectH / 2 )), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));
		// Copy right, bottom
		ctx.drawImage(image,Math.floor(srcWidth - lRectW / 2), 
							Math.floor(srcHeight - lRectH / 2), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2), 
							Math.floor(w - ( lRectW / 2 )), 
							Math.floor(h - ( lRectH / 2 )), 
							Math.ceil(lRectW/2), 
							Math.ceil(lRectH/2));		

		//fill the center with color at the center
		ctx.fillStyle = "rgba(" + lPixelColor[0] + "," + lPixelColor[1] + "," + lPixelColor[2] + "," + lPixelColor[3] + ")";
		var fW = lIsTargetImageWSmaller ? w : srcWidth;
		var fH = lIsTargetImageHSmaller ? h : srcHeight;

		ctx.fillRect(Math.floor(fW/2),Math.floor(fH/2), (w - fW) + 1, (h - fH) + 1);
		
		// OK. Now, copying some regions.
		// This logic directly taken from the old captivate edit area code. What does this do?
		// It copies the a 3 (or less) pixel height, width/2 section from the each a) left and middle height
		// of the src and b) right and middle height of the src and keeps copying them to left border 
		// (at some distance from top) and right border (at some distance from top ) into the
		// destination image.
		var stepPixels		= 3;
		var srcWidthBy2		= !lIsTargetImageWSmaller ? (srcWidth / 2) : (w / 2);
		var srcHeightBy2	= !lIsTargetImageHSmaller ? (srcHeight / 2) : (h / 2);
		var destY			= Math.floor(srcHeight - srcHeightBy2 - 1) - 1;

		while ( destY < h - srcHeightBy2) {
			var	diffY		= h - destY;
			if ( diffY < stepPixels )
				stepPixels	= diffY;
			
			var	srcRectLeft		= 0;
			var srcRectTop		= srcHeightBy2 - 1;
			var	srcRectRight	= srcWidthBy2;
			var	srcRectBottom	= srcHeightBy2 - 1 + stepPixels;
			var	srcRectW		= Math.ceil(srcRectRight - srcRectLeft);
			var	srcRectH		= Math.ceil(srcRectBottom - srcRectTop);

			ctx.drawImage(image,Math.floor(srcRectLeft), Math.floor(srcRectTop), srcRectW, srcRectH, 0, destY, srcRectW, srcRectH);

			srcRectLeft		= srcWidth - srcWidthBy2;
			srcRectRight	= srcWidth;
			srcRectW		= Math.ceil(srcRectRight - srcRectLeft);
			
			ctx.drawImage(image,Math.floor(srcRectLeft), Math.floor(srcRectTop), srcRectW, srcRectH, Math.floor(w - srcWidthBy2), destY, srcRectW, srcRectH);

			stepPixels	= ( h - destY ) < 3 ? ( h - destY ) : 3;
			if ( stepPixels <= 0 )
				stepPixels	= 1;
			destY	+= stepPixels - 1;
		}

		// This logic copies a 3 pixel width and src image height by 2 region from top middle 
		// and bottom middle of the src image into the destination image to create most of the
		// top and bottom ends of the destination image.
		stepPixels	= 3;
		var	destX	= Math.floor(srcWidthBy2) - 1;

		while ( destX < w - srcWidthBy2 ) {
			var	diffX	= w - destX;
			if ( diffX < stepPixels )
				stepPixels	= diffX;

			var	srcRectLeft		= srcWidthBy2 - 1;
			var	srcRectTop		= 0;
			var	srcRectRight	= srcWidthBy2 - 1 + stepPixels;
			var srcRectBottom	= srcHeightBy2;
			var	srcRectW		= Math.ceil(srcRectRight - srcRectLeft);
			var	srcRectH		= Math.ceil(srcRectBottom - srcRectTop);
			
			ctx.drawImage(image,Math.floor(srcRectLeft), srcRectTop, srcRectW, srcRectH, destX, 0, srcRectW, srcRectH);

			srcRectTop		= srcHeight - srcHeightBy2;
			srcRectBottom	= srcHeight;
			srcRectH		= Math.ceil(srcHeightBy2);
			
			ctx.drawImage(image,Math.floor(srcRectLeft), Math.floor(srcRectTop), srcRectW, srcRectH, destX, Math.floor(h - srcHeightBy2), srcRectW, srcRectH);
			
			stepPixels	= ( w - destX ) < 3 ? ( w - destX ) : 3;
			if ( stepPixels <= 0 )
				stepPixels	= 1;
			destX	+= stepPixels - 1;
		}

		ctx.restore();
	}

	cp.getIntersectionRect = function(sRect,dRect)
	{
		//sRect = [x,y,w,h],
		//dRect = [x,y,w,h]

		var smaxX = sRect[0] + sRect[2];
		var smaxY = sRect[1] + sRect[3];
		var dmaxX = dRect[0] + dRect[2];
		var dmaxY = dRect[1] + dRect[3];

		var targetRect = new Object();
		targetRect.l = 0;
		targetRect.t = 0;
		targetRect.w = 0;
		targetRect.h = 0;

		if(smaxX < dRect[0])
			return targetRect;

		if(smaxY < dRect[1])
			return targetRect;

		if(sRect[0] > dmaxX)
			return targetRect;

		if(sRect[1] > dmaxY)
			return targetRect;
		
		targetRect.l = sRect[0] > dRect[0] ? sRect[0] : dRect[0];
		targetRect.t = sRect[1] > dRect[1] ? sRect[1] : dRect[1];
		
		var maxX = smaxX < dmaxX ? smaxX : dmaxX;
		var maxY = smaxY < dmaxY ? smaxY : dmaxY;

		targetRect.w = maxX - targetRect.l;
		targetRect.h = maxY - targetRect.t;

		return targetRect;
	}

	cp.frameset_mc_draw=function(ctx,imagePath,objectToBeHidden,visible,divName,lHasShadowOrReflection,lHasTransform)
	{
		if(imagePath == '' ||
			imagePath == undefined)
		{
			return true;
		}
		
		var drawn = false;
		ctx.save();
		var divData = cp.D[divName];
		if(divData.shouldShowDisabledState)
		{
			ctx.globalAlpha=0.5;
		}
		var img = cp.movie.im.images[imagePath];
		try
		{
			if(img)
			{
				if(img.complete && img.nativeImage.complete)
				{
					if(cp.verbose)
						cp.log('drawing completed img ' + imagePath);
					if(ctx.centreImage && (lHasShadowOrReflection || lHasTransform))
					{
						if(cp.responsive)
						{
							ctx.clearRect(-ctx.width,-ctx.height,2*ctx.width,2*ctx.height);
							var targetW = divData.clientWidth;//img.nativeImage.width*ctx.canvas.clientWidth/cp.D.project.w;
							var targetH = divData.clientHeight;//img.nativeImage.height*ctx.canvas.clientHeight/cp.D.project.h;
							if(cp.isCaptionItem(divData.type))
								cp.tcd(ctx,img.nativeImage,-targetW/2+ctx.tex,-targetH/2+ctx.tey,targetW,targetH,divData.pixelColor);
							else
							{
								if(ctx.crop)
									ctx.drawImage(img.nativeImage,ctx.crop["x"],ctx.crop["y"],targetW,targetH,-targetW/2+ctx.tex,-targetH/2+ctx.tey,targetW,targetH);
								else
									ctx.drawImage(img.nativeImage,-targetW/2+ctx.tex,-targetH/2+ctx.tey,targetW,targetH);
							}						
						}
						else
						{
							ctx.clearRect(-ctx.width,-ctx.height,2*ctx.width,2*ctx.height);
							ctx.drawImage(img.nativeImage,-img.nativeImage.width/2+ctx.tex,-img.nativeImage.height/2+ctx.tey,img.nativeImage.width,img.nativeImage.height);
						}
					}
					else
					{
						if(cp.responsive)
						{	
							if(cp.isCaptionItem(divData.type))
								cp.tcd(ctx,img.nativeImage,0,0,divData.clientWidth,divData.clientHeight,divData.pixelColor);
							else
							{
								if(ctx.crop)
								{
									var lImgW = img.nativeImage.width;
									var lImgH = img.nativeImage.height;

									var sRect = [0,0,lImgW,lImgH];
									var dRect = [ctx.crop["x"],ctx.crop["y"],divData.clientWidth,divData.clientHeight];
									
									var lRect = cp.getIntersectionRect(sRect,dRect);

									if(ctx.crop["x"] < 0)
									{
										dRect[0] = -ctx.crop["x"];
									}
									else
										dRect[0] = 0;

									if(ctx.crop["y"] < 0)
									{
										dRect[1] = -ctx.crop["y"];
									}
									else
										dRect[1] = 0;

									ctx.drawImage(img.nativeImage,lRect.l,lRect.t,lRect.w,lRect.h,dRect[0],dRect[1],lRect.w,lRect.h);
								}								
								else
									ctx.drawImage(img.nativeImage, 0, 0, divData.clientWidth, divData.clientHeight);
							}
						}
						else
							ctx.drawImage(img.nativeImage, 0, 0);
					}
					drawn = true;
					if(objectToBeHidden)
					{
						if(cp.verbose)
							cp.log('hiding1 ' + imagePath);
						cp.hide(objectToBeHidden);
					}
					else if(!visible)
					{
						if(cp.verbose)
							cp.log('hiding2 ' + imagePath);
						cp._hide(divName);
					}
					ctx = null;	
				}
				else
				{
					if(cp.exceptionalLogs && !cp.responsive)
						console.log('**** drawing failed. img incomplete ' + imagePath);
				}
			}
			else
			{
				if(imagePath)
				{
					if(cp.exceptionalLogs && !cp.responsive)
						console.log('***** drawing failed. img not found ' + imagePath);
				}
			}
		}
		catch(e)
		{
			console.log('***** drawing failed. img not found ' + imagePath);
		}
		return drawn;
	}

	cp.fd = function(a,b,c,d,e,f,g)
	{
		return cp.frameset_mc_draw(a,b,c,d,e,f,g);
	}
	cp.setMovieLeftTopRightBottom = function(leftOffset,topOffset,rightOffset,bottomOffset)
	{
		if(cp.responsive)
			return;
		
		var pc = cp.getProjectContainer();
		pc.style.width = parseFloat(pc.style.width) + leftOffset + rightOffset + 'px';
		pc.style.height = parseFloat(pc.style.height) + topOffset + bottomOffset + 'px';
		
		var mc = cp.getMainContainer();
		var lMainContainerLeft = (cp.getInnerWidth() - parseFloat(mc.style.width))/2;
		lMainContainerLeft = (lMainContainerLeft > 0 ? lMainContainerLeft : 0 );
		mc.style.left = lMainContainerLeft + 'px';
		
		//var playImage = cp.playImage;
		//playImage.style.top = parseFloat(playImage.style.top) + topOffset;
		//playImage.style.left = parseFloat(playImage.style.left) + leftOffset;

		var p = cp.getProject();
		cp.movie.topOffset += topOffset + parseFloat(pc.style.top);
		p.style.top = topOffset + "px";
		p.style.left = parseFloat(p.style.left) + leftOffset + "px";
		
		if(cp.loadedModules.toc)
			cp.tocInit(cp.D,leftOffset,topOffset,rightOffset,bottomOffset);	
		
		cp.updateBorderPosition(cp.D);
		cp.adjustWindow();
	}
	cp.setCCPosition = function(playbarHeight)
	{
		cp.movie.cc.style.pointerEvents = "auto";
		cp.movie.cc.style.left =  cp.project.style.left;
		if(cp.responsive)
			cp.movie.cc.style.top =  (cp("project").clientHeight - cp.movie.cc.clientHeight) + 'px';	
		else
			cp.movie.cc.style.bottom =  (playbarHeight) + 'px';	
	}
	cp.ConvertRGBToRGBA = function(str,opacity)
	{
		var sopacity = opacity + '';
		var s = str.replace(')', ' ,' + sopacity + ')');
		return s.replace('rgb','rgba');
	}
	cp.ConvertColorToRGBA = function(str,opacity)
	{
		var retVal = 'rgba(' + parseInt(str.substr(1,2),16) + ' ,' + parseInt(str.substr(3,2),16) + ' ,' + parseInt(str.substr(5,2),16) + ' ,' + opacity + ')';
		return retVal;
	}
	cp.getAngleFromRotateStr = function(rotStr)
	{
		var rotate1 = rotStr.replace('rotate(','');
		return parseFloat(rotate1.replace('deg)',''));
	}
	cp.applyTransform = function(element,matrixStr)
	{
		element.style['transform']  = matrixStr;
		element.style['msTransform'] = matrixStr;
		element.style['MozTransform'] =  matrixStr;
		element.style['WebkitTransform']  = matrixStr;
		element.style['OTransform'] = matrixStr;
	};
	cp.applyShadow = function(element,shadowStr,applyTextShadow)
	{
		element.style['mozBoxShadow']  = shadowStr;
		element.style['webkitBoxShadow'] =  shadowStr;
		element.style['boxShadow'] = shadowStr;
		if(applyTextShadow)
		{
			var angleInRadians = shadowStr.a*Math.PI/180;
			
			var	dx = cp.getRoundedValue(shadowStr.d*Math.cos(angleInRadians));
			var dy = cp.getRoundedValue(shadowStr.d*Math.sin(angleInRadians))

			element.style.textShadow = dx + "px " + dy + "px " + shadowStr.b + "px " +  shadowStr.c;
		}
	};
	cp.setFillStrokeStyle = function(fillObj, canvasElem, stroke, shouldNotSetAlpha)
	{
		var srccontext = canvasElem.getContext('2d');
		if(fillObj.gf)
		{
			var gradObj;
			if(fillObj.gf.t == 0)
			{	
				switch(fillObj.gf.di)
				{
					case 0:
						gradObj = srccontext.createLinearGradient(0, canvasElem.height/2, canvasElem.width, canvasElem.height/2);
						break;
					case 1:
						gradObj = srccontext.createLinearGradient(canvasElem.width, canvasElem.height/2, 0, canvasElem.height/2);
						break;
					case 2:
						gradObj = srccontext.createLinearGradient(0, 0, canvasElem.width, canvasElem.height);
						break;
					case 3:
						gradObj = srccontext.createLinearGradient(canvasElem.width, canvasElem.height, 0, 0);
						break;
					case 5:
						gradObj = srccontext.createLinearGradient(canvasElem.width/2, canvasElem.height, canvasElem.width/2, 0);
						break;
					case 6:
						gradObj = srccontext.createLinearGradient(0, canvasElem.height, canvasElem.width, canvasElem.height);
						break;
					case 7:
						gradObj = srccontext.createLinearGradient(canvasElem.width, canvasElem.height, 0, canvasElem.height);
						break;
					default:
					case 4:
						gradObj = srccontext.createLinearGradient(canvasElem.width/2, 0, canvasElem.width/2, canvasElem.height);
						break;
				}
			}
			else
			{
				var dist = 0;
				switch(fillObj.gf.di)
				{
					case 0:
						gradObj = srccontext.createRadialGradient(canvasElem.width/2, canvasElem.height/2, 0, canvasElem.width, canvasElem.height/2,canvasElem.width/2);
						break;
					case 2:
						dist = canvasElem.width < canvasElem.height ? canvasElem.width : canvasElem.height;
						gradObj = srccontext.createRadialGradient(0, 0, 0, dist, 0,dist);
						break;
					case 3:
						gradObj = srccontext.createRadialGradient(canvasElem.width/2, 0, 0, canvasElem.width/2, canvasElem.height,canvasElem.height);
						break;
					case 4:
						dist = canvasElem.width < canvasElem.height ? canvasElem.width : canvasElem.height;
						gradObj = srccontext.createRadialGradient(canvasElem.width, 0, 0, canvasElem.width, dist,dist);
						break;
					case 5:
						gradObj = srccontext.createRadialGradient(canvasElem.width, canvasElem.height/2, 0, 0, canvasElem.height/2,canvasElem.width);
						break;
					case 6:
						dist = canvasElem.width < canvasElem.height ? canvasElem.width : canvasElem.height;
						gradObj = srccontext.createRadialGradient(canvasElem.width, canvasElem.height, 0, canvasElem.width-dist, canvasElem.height-dist,dist);
						break;
					case 7:
						gradObj = srccontext.createRadialGradient(canvasElem.width/2, canvasElem.height, 0, canvasElem.width/2, 0,canvasElem.height);
						break;
					case 8:
						dist = canvasElem.width < canvasElem.height ? canvasElem.width : canvasElem.height;
						gradObj = srccontext.createRadialGradient(0, canvasElem.height, 0, dist, canvasElem.height,dist);
						break;
					case 9:
						gradObj = srccontext.createRadialGradient(0, canvasElem.height/2, 0, canvasElem.width, canvasElem.height/2,canvasElem.width);
						break;
					default:
					case 4:
						gradObj = srccontext.createRadialGradient(canvasElem.width/2, canvasElem.height/2, 0, canvasElem.width, canvasElem.height,Math.sqrt(canvasElem.width*canvasElem.width + canvasElem.height*canvasElem.height));
						break;
				}
			}
			for(var i=0;i < fillObj.gf.cs.length ; ++i)
			{
				var colorStop = fillObj.gf.cs[i];
				var colorStr = cp.getRGBA(colorStop.c,colorStop.o);
				gradObj.addColorStop(colorStop.p/100,colorStr);
			}
			if(stroke)
				srccontext.strokeStyle = gradObj;
			else
				srccontext.fillStyle = gradObj;
		}
		else
		{
			if(stroke)
				srccontext.strokeStyle = fillObj.bc;
			else
				srccontext.fillStyle = fillObj.bc;
		}
		if(!shouldNotSetAlpha)
			srccontext.globalAlpha = fillObj.alpha/100;
	}

	cp.loadjscssfile = function(filename, filetype,onloadfunc)
	{
		var fileref;
		if (filetype=="js"){ //if filename is a external JavaScript file
		fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", filename);
		fileref.onload = onloadfunc;
		}
		else if (filetype=="css"){ //if filename is an external CSS file
			  fileref=document.createElement("link");
			  fileref.setAttribute("rel", "stylesheet");
			  fileref.setAttribute("type", "text/css");
			  fileref.setAttribute("href", filename);
			  var loadfunc = onloadfunc;
			  fileref.onload = loadfunc;
			  var cssnum = document.styleSheets.length;
				  var ti = setInterval(function() {
					if (document.styleSheets.length > cssnum) {
					  clearInterval(ti);
					  loadfunc();
					}
				  }, 50);
		}
		if(fileref!= undefined)
			document.getElementsByTagName("head")[0].appendChild(fileref);
		return fileref;
	};

	cp.CPPlayButtonHandle = function(event)
	{
		var code;
			
		//find the keycode
		if (event.keyCode) 
			code = event.keyCode;
		else if (event.which) 
			code = event.which;	   
			
		//handle the space bar and enter key        
		if (code == 32)
		{
			cp.movie.play();
		}
	}

	cp.handleVariablesInURLParams = function()
	{
		var lURL = window.location.toString();
		if(lURL.indexOf("?") == -1)
			return;
			
		var lURLComponents = lURL.split("?");	
		var lURLParams = lURLComponents[1];
		var lURLParamsNameValuePairs = lURLParams.split("&");
		for(var i = 0; i < lURLParamsNameValuePairs.length; ++i)
		{
			var lPairStr = lURLParamsNameValuePairs[i];
			if(lPairStr.indexOf("=") == -1)
				continue;
			var lNameValArr = lPairStr.split("=");
			
			//Call setVariableValue blindly, because it handles the presence of variable internally
			cp.vm.setVariableValue(lNameValArr[0],unescape(lNameValArr[1]),false);
		}
	}
	
	cp.getInnerWidth = function()
	{
		if((!window.innerWidth) || (window.innerWidth == 0))
			cp.offsetInnerWidth = 640;
		else
			cp.offsetInnerWidth = window.innerWidth;
		return cp.offsetInnerWidth;
	}
	cp.getProjectContainer = function()
	{
		if(!cp.projectContainer)
			cp.projectContainer	= cp('project_container');
		return cp.projectContainer;
	}
	cp.getMainContainer = function()
	{
		if(!cp.mainContainer)
			cp.mainContainer	= cp('main_container');
		return cp.mainContainer;
	}
	cp.getProject = function()
	{
		if(!cp.project)
			cp.project	= cp('project');
		return cp.project;
	}
	
	cp.adjustProjectHeight = function(iSlideData)
	{
		if(cp.responsive)
		{
			if(iSlideData)
			{
				var lSlideDisplayData = cp.D[iSlideData["mdi"]];
				var lResponsiveCSSData = lSlideDisplayData["css"];
				var lResponsiveBoundsData = lResponsiveCSSData[cp.ResponsiveProjWidth];
				cp.RespDefaultBptH = parseFloat(lResponsiveCSSData[cp.RespDefaultBptW].h);
				if(parseFloat(cp("project").style.height) != lResponsiveBoundsData.h)
					cp("project").style.height = lResponsiveBoundsData.h;

				var lProjectHeight = cp("project").clientHeight;
				//Assumption : lResponsiveBoundsData.h is always in pixels. Following line should be changed if it changes to %.
				lProjectHeight = lProjectHeight > 0 ? lProjectHeight : parseFloat(lResponsiveBoundsData.h);
				var lPlaybarH = cp("playbar").clientHeight;
				if(cp.PB && cp.PB.MP && cp.PB.MP.PBP && cp.PB.MP.PBP.showOnHover && 
					cp("playbar").animator)
				{
					lPlaybarH = 0;
				}
				cp("project_container").style.height = (lProjectHeight + lPlaybarH) + "px";
				if(cp("project_container").clientHeight > window.innerHeight)
				{
					cp("main_container").style.height = (lProjectHeight + lPlaybarH) + "px";
					cp("cpDocument").style.height = (lProjectHeight + lPlaybarH) + "px";
				}
				else
				{
					cp("main_container").style.height = "100%";
					cp("cpDocument").style.height = "100%";
				}
			}
		}		
	}

	cp.adjustSkins = function(iReason)
	{
		if(!cp.responsive)
			return;
		if(iReason == undefined)
			iReason = cp.ReasonForDrawing.kOrientationChangeOrResize;
		
		var lProject = cp("project");
		var lPB = cp("playbar");
			
		if(cp.PB && cp.PB.playbarCreated)
		{
			if(cp.PB.rootObj && cp.PB.rootObj.layoutPlaybar && iReason == cp.ReasonForDrawing.kOrientationChangeOrResize)
			{
				var lPlaybarDim = lProject.clientWidth;
				cp.PB.rootObj.layoutPlaybar(true,lPlaybarDim);
			}	

			if(cp.responsive)
			{
				var lTotalHeightRequired = lProject.clientHeight + lPB.clientHeight;
					
				if( lTotalHeightRequired < window.innerHeight && lProject.clientHeight > 0)
					lPB.style.bottom = (window.innerHeight - lTotalHeightRequired) + "px";
				else
					lPB.style.bottom = "0px";

				lPB.style.left = lProject.style.left;
				
				var lAnimator = lPB.animator;
				if(cp.PB && cp.PB.MP && cp.PB.MP.PBP && cp.PB.MP.PBP.showOnHover && 
					lAnimator)
				{
					lAnimator.resetStartEndValForResponsive();
					lPB.style.bottom = "";
					if(lAnimator.playbarHidden)
					{
						lPB.style.bottom = "";
						lPB.style.top = cp("div_Slide").getBoundingClientRect().bottom + "px";	
					}
					else
					{
						lPB.style.top = "";
						lPB.style.bottom = "0px";	
					}
					
					lPB.style.position = "absolute";	
				}
				else
					lPB.style.position = "fixed";

				lPB.style.transform = 'scale(1)';
			}
		}
		
		if(cp.toc && cp.toc.tocCreated && cp.toc.rootObj)
		{
			cp.toc.rootObj.adjustTOC();
		}

		if(cp.movie.cc)
		{
			cp("cc").style.width = lProject.clientWidth + "px";
			cp.setCCPosition(lPB.clientHeight);
		}		

		if(cp.playImage)
		{
			var lPlayButtonL = lPlayButtonT = 0;
			//alert(window.innerWidth + "," + window.innerHeight);
			if(cp.project.clientWidth > window.innerWidth)
				lPlayButtonL = (window.innerWidth - cp.playImage.clientWidth)/2;
			else
				lPlayButtonL = (cp.project.clientWidth - cp.playImage.clientWidth)/2;

			if(cp.project.clientHeight > window.innerHeight)
				lPlayButtonT = (window.innerHeight - cp.playImage.clientHeight)/2;
			else
				lPlayButtonT = (cp.project.clientHeight - cp.playImage.clientHeight)/2;

			cp.playImage.style.left = lPlayButtonL + "px";
			cp.playImage.style.top = lPlayButtonT + "px";
		}

		if(cp.autoplayImage)
		{
			cp.autoplayImage.style.left = (cp.project.clientWidth - cp.movie.autoplayimagew)/2 + 'px';
			cp.autoplayImage.style.top = (cp.project.clientHeight - cp.movie.autoplayimageh)/2 + 'px';
		}
	}

	cp.getCurrentBreakpointWidth = function(iWidth)
	{
		var totalBreakpoints = cp.responsiveWidths.length;
		if(iWidth <= cp.responsiveWidths[0])
		{
			return cp.responsiveWidths[0];
		}
		if(iWidth >= cp.responsiveWidths[cp.responsiveWidths.length - 1])
		{
			return cp.responsiveWidths[cp.responsiveWidths.length - 1];
		}
		else
		{
			for(var idx=0; idx <= totalBreakpoints-1; ++idx)
			{
				if(iWidth <= cp.responsiveWidths[idx])
				{
					return cp.responsiveWidths[idx];
				}
			}
		}
	}

	cp.getCurrentBreakPointID = function()
	{
		var breakPointIDToWidthMap = cp.D["project"].breakpointIdToWidthMap;
		for(var i in breakPointIDToWidthMap)
		{
			if(breakPointIDToWidthMap[i] == cp["ResponsiveProjWidth"])
				return i;
		}
	}

	cp.updateResponsiveGlobals = function()
	{
		if(!cp.responsive) 
			return;

		if(!cp.responsiveWidths || cp.responsiveWidths.length <= 0) return;
		var totalBreakpoints = cp.responsiveWidths.length;
		var lViewportWidth = window.innerWidth;

		cp.RespDefaultBptW = cp.responsiveWidths[cp.responsiveWidths.length - 1];
		
		cp.ResponsiveProjWidth = cp.getCurrentBreakpointWidth(lViewportWidth);

		if(cp.responsiveMaxWidth == undefined)
			cp.responsiveMaxWidth = cp.D["project"].maxWidth;		
	}

	cp.adjustResponsiveItems = function(iReason)
	{
		if(cp.responsive)
		{
			if(iReason == undefined)
				iReason = cp.ReasonForDrawing.kOrientationChangeOrResize;


			//save state for drag drop question
			var lDDInteractionManager = cp.movie.stage.getCurrentSlideInteractionManager();	
			if(lDDInteractionManager)
			{
				lDDInteractionManager.saveResponsiveInteractionState(iReason);
			}
			
			var iLastBreakpointWidth = cp.ResponsiveProjWidth;
			cp.updateResponsiveGlobals();			
			
			var lViewportWidth = window.innerWidth;
			if(cp.responsiveMaxWidth && window.innerWidth > cp.responsiveMaxWidth)
			{
				if(parseFloat(cp("project_container").style.width) != cp.ResponsiveProjWidth)
					cp("project_container").style.width = cp.ResponsiveProjWidth + "px";
				cp("project_container").style.left = (lViewportWidth - cp.ResponsiveProjWidth)/2 + "px";
			}
			else
			{
				cp("project_container").style.width = "100%";
				cp("project_container").style.left = "0px";
			}	
			
			var lSlide = cp.movie.stage.currentSlide;
			var lSlideIdx = cp.movie.stage.getSlideIndexForFrame(cpInfoCurrentFrame);
			if(!lSlide)
			{
				var lSlideName = cp.movie.stage.getSlideNameForIndex(lSlideIdx);
				lSlide = cp.D[lSlideName];
			}

			cp.adjustProjectHeight(lSlide);
			cp.setupSlideBGDivAndCanvasInternal(lSlide, cp.movie.stage.getSlideDiv());

			cp.adjustSkins(iReason);

			if(cp.EventListeners)
			{
				cp.EventListeners[cp.ITEMDRAWINGCOMPLETEEVENT] = [];
			}
			
			if(iReason == cp.ReasonForDrawing.kOrientationChangeOrResize)
			{
				cp.movie.pm.loadSlideAssets(cpInfoCurrentSlideIndex);
			}

			var lAllItemsDrawn = true;
			for(var key in displayObjectMap)
			{
				var lItem = displayObjectMap[key];
				if(lItem && lItem.isStarted && lItem.drawForResponsive)
				{
					if(lItem.saveState)
						lItem.saveState(iLastBreakpointWidth);
					lItem.drawForResponsive(true,cp.ReasonForDrawing.kOrientationChangeOrResize);
					//if(lItem.isDrawn)
					{
						var lItemData = lItem.element ? cp.D[lItem.element.id] : undefined;
						if(lItemData)
						{
							var lResponsiveCSS = lItem.getAttribute("css");
							if(!lResponsiveCSS)
								continue;
							var lCurrentCSS = cp.getResponsiveCSS(lResponsiveCSS);
							if(!lCurrentCSS)
								continue;
							var lPresentInView = lCurrentCSS.ipiv;
							if(lItem.visible)
							{
								var lItemDivData = cp.D[lItemData.dn];
								if(!lItemDivData && lItemData.actid)
									lItemDivData = cp.D[lItemData.actid];
								if(!lItemDivData)
									continue;
								if(!lPresentInView)
								{
									if(lItem.type == cp.kCPOTVideo)
									{
										if(lItem.nativeVideo)
											lItem.nativeVideo.style.display = "none";
										if(lItem.pause)
										{
											lItem.pause();
										}
									}
									if(lItemDivData.ia)
									{
										cp.movie.am.showHideObjectAudio(lItemDivData.ia, false);
									}
									if(lItemDivData.iea)
									{
										cp.movie.am.playPauseEventAudio(lItemDivData.iea, false);
									}
								}
								else
								{
									if(lItem.type == cp.kCPOTVideo && lItem.nativeVideo)
									{
										lItem.nativeVideo.style.display = "block";
									}
									
									if(lItem.element)
									{
										var fc = lItem.element.firstElementChild;
										if(fc && fc.tagName == 'VIDEO')
										{
											//lItem.seekTo(lItem.from);
											if(this.started == true &&
												this.ended == false && 
												this.paused == false)
												lItem.play();
										}
									}
									
									if(lItemDivData.ia)
									{
										cp.movie.am.showHideObjectAudio(lItemDivData.ia, true);
									}

									// Find out other children.
									if(lItemDivData.iea)
									{
										cp.movie.am.playPauseEventAudio(lItemDivData.iea, true);
									}
								}
							}
						}
					}
					
					lAllItemsDrawn = lAllItemsDrawn && lItem.isDrawn;
				}
				lItem.areDimensionsCalculated = false;
			}

			var currSlide = cp.movie.stage.currentSlide;
			var isQuestionSlide = false;
			if ( currSlide ) 
			{
				isQuestionSlide = ( currSlide.st == "Question Slide" );
				if(isQuestionSlide)
				{
					var lQuestionObj = cp.getQuestionObject(currSlide.qs);
					if(lQuestionObj && lQuestionObj.adjustCustomObjects)
						lQuestionObj.adjustCustomObjects();
					if(lQuestionObj && lQuestionObj.updateCustomReviewAreaTransforms)
						lQuestionObj.updateCustomReviewAreaTransforms();
				}
			}			

			cp.movie.stage.forEachChild(cp.updateVariableTextBounds, true);
			if(cpInfoCurrentFrame)
				cp.movie.stage.syncMotionToFrame(cpInfoCurrentFrame, true);

			if(lDDInteractionManager)
			{
				lDDInteractionManager.adjustResponsiveInteraction(iReason);
			}

			//check if all items are drawn. If not, one of the possible reasons is image download failure. Redownload the images.
			if(!lAllItemsDrawn)
			{
				cp.movie.pm.loadSlideAssets(lSlideIdx);
			}

			return;
		}
	}

	cp.getCurrentSlideResponsiveHeight = function(iWidth)
	{
		if(!cp.responsive)
			return;
		var lSlide = undefined;
		if(!cp.movie || !cp.movie.stage)
		{
			lSlide = cp.D["project_main"].slides.split(",")[0];
			lSlide = cp.D[lSlide];
		}
		else
		{
			lSlide = cp.movie.stage.currentSlide;
			if(!lSlide)
			{
				var lSlideIdx = cp.movie.stage.getSlideIndexForFrame(cpInfoCurrentFrame);
				var lSlideName = cp.movie.stage.getSlideNameForIndex(lSlideIdx);
				lSlide = cp.D[lSlideName];
			}
		}

		var lSlideDisplayData = cp.D[lSlide["mdi"]];
		var lResponsiveCSSData = lSlideDisplayData["css"];
		var lResponsiveBoundsData = lResponsiveCSSData[cp.getCorrectBreakpoint(iWidth)];

		var lPlaybarH = cp("playbar").clientHeight;
		if(cp.PB && cp.PB.MP && cp.PB.MP.PBP && cp.PB.MP.PBP.showOnHover)
		{
			lPlaybarH = 0;
		}
		return parseFloat(lResponsiveBoundsData.h) + lPlaybarH;
	}

	function eatEvent(e){
		e.stopPropagation();
		e.preventDefault();
	}

	function shuntMouseEventsForElement(e){
		e.onclick = e.ondblclick = e.onmousedown = e.onmousemove = e.onmouseup = e.onmouseover = e.onmouseout = eatEvent;
	}

	function shuntTouchEventsForElement(e){
		e.addEventListener('touchstart', eatEvent);
		e.addEventListener('touchmove', eatEvent);
		e.addEventListener('touchend', eatEvent);
	}

	function shuntMouseAndTouchEventsForElement(e){
		shuntMouseEventsForElement(e);
		shuntTouchEventsForElement(e);
	}

	function isPhoneInLandscapeOrientation(){
		var w = window.innerWidth, h = window.innerHeight;
		return w > 320 && w < 800 && w > h && h > 0 && w/h > 4/3;
	}

	var movieLock = {'locked':false, 'resumePlay': undefined, 'curtain':undefined};

	function lockMovie(){
		if(movieLock.locked)
			return;

		if(!cp.movie.paused){
			cp.movie.pause(cp.ReasonForPause.BAD_ORIENTATION);
			if(cp.movie.paused)
				movieLock.resumePlay = true;
		}

		movieLock.locked = true;

		if(!movieLock.curtain){
			movieLock.curtain = document.createElement('div');
			movieLock.curtain.classList.add('curtain');
			document.body.appendChild(movieLock.curtain);
			shuntMouseAndTouchEventsForElement(movieLock.curtain);

			var msg = document.createElement('div');
			msg.classList.add('curtainMsg');
			msg.innerText = cp.lpm;
			movieLock.curtain.appendChild(msg);
		}

		movieLock.curtain.style.display = 'table';
	}

	function unlockMovie(){
		if(!movieLock.locked)
			return;

		if(movieLock.resumePlay)
			cp.movie.play(cp.ReasonForPlay.ORIENTATION_OK);

		movieLock.curtain.style.display = 'none';
		movieLock.locked = false;
	}

	cp.adjustWindow = function(event){
		cp.__adjustWindow(event);
		if(cp.lpp){
			if(isPhoneInLandscapeOrientation())
				lockMovie();
			else
				unlockMovie();
		}
	}

	cp.__adjustWindow = function(event)
	{
		//adjust Gesture indicator
		if(cp.useg && cp.gesturesDiv)
		{
			if(cp.responsive || window.innerWidth < cp.D.project.w)
			{
				cp.gesturesDiv.style.position = "fixed";
			}
			else
				cp.gesturesDiv.style.position = "absolute";
		}
		
		//adjust Play button and autoplay image
		{
			if(cp.playImage)
			{
				if(cp.D.project.w <= window.innerWidth || cp.shouldScale)
					cp.playImage.style.left = (cp.D.project.w - 96)/2 + 'px';
				else
					cp.playImage.style.left = (window.innerWidth - 96)/2 + 'px';

				if(cp.D.project.h <= window.innerHeight || cp.shouldScale)
					cp.playImage.style.top = (cp.D.project.h - 96)/2 + 'px';
				else
					cp.playImage.style.top = (window.innerHeight - 96)/2 + 'px';
			}			
			
			if(cp.autoplayImage)
			{
				cp.autoplayImage.style.left = (cp.D.project.w - cp.movie.autoplayimagew)/2 + 'px';
				cp.autoplayImage.style.top = (cp.D.project.h - cp.movie.autoplayimageh)/2 + 'px';
			}
		}
		var lPB = cp("playbar");
		if(cp.responsive && cp.device != cp.DESKTOP)
		{
			if(cp.movie && cp.movie.stage)
			{
				var lSlide = cp.movie.stage.currentSlide;
				if(!lSlide)
				{
					var lSlideIdx = cp.movie.stage.getSlideIndexForFrame(cpInfoCurrentFrame);
					var lSlideName = cp.movie.stage.getSlideNameForIndex(lSlideIdx);
					lSlide = cp.D[lSlideName];
				}
				var lCurrBrkPt = cp.getCurrentBreakpointWidth(window.innerWidth);
				if(lSlide)
				{
					var lSlideDisplayData = cp.D[lSlide["mdi"]];
					if(lSlideDisplayData)
					{
						var lResponsiveCSSData = lSlideDisplayData["css"];
						if(lResponsiveCSSData)
						{
							var lResponsiveBoundsData = lResponsiveCSSData[lCurrBrkPt];
							if(lResponsiveBoundsData)
							{
								var lTotalHeightRequired = (parseFloat(lResponsiveBoundsData.h) + lPB.clientHeight);
								lPB.style.position = "fixed";
								if(lTotalHeightRequired >= window.innerHeight)
								{
									lPB.style.bottom = "0px";
								}
								else
								{
									lPB.style.bottom = (window.innerHeight - lTotalHeightRequired) + "px";
								}
							}
						}
					}					
				}
			}
			else
			{
				lPB.style.bottom = "0px";
				lPB.style.position = "fixed";
			}
		}
		var lEvntType = event ? event.type : event;		
		if(lEvntType == "resize")
		{
			cp.em.fireEvent('CPWindowResized');
			if(cp.device != cp.DESKTOP)
			{
				if(cp.isTextInputInFocus())
				{
					if(cp.device != cp.IDEVICE)
					{
						var el = document.activeElement;
						var a = cp.getMainContainer();
						a.style.position = "absolute";
						document.body.style.overflow = "scroll";
						var l = t = 0;
						if(!cp.responsive)
						{
							//assumption is that teb's and textarea's grandparent will be absolutely positioned						
							l = parseFloat(a.parentElement.parentElement.style.left);
							t = parseFloat(a.parentElement.parentElement.style.top);	
							window.scrollTo(l,t);
						}

						if(cp.responsive)
						{
							lPB.style.top = cp.project.clientHeight + "px";
							lPB.style.position = "absolute";
							lPB.offsetHeight = lPB.offsetHeight;
						}	
					}
					else
					{
						if(cp.responsive)
						{
							var lFn = document.activeElement.onblur;
							document.activeElement.onblur = function(e)
							{
								setTimeout("cp.adjustSkins();if(cp.m_gestureHandler){cp.m_gestureHandler.fitMovie();}",500);
								if(lFn)
									lFn(e);
							};
						}
					}
					return;
				}
				else
				{
					if(cp.responsive)
					{
						lPB.style.top = "";
						lPB.style.position = "fixed";
						lPB.offsetHeight = lPB.offsetHeight;
						if(cp("div_Slide").scaleFactor != 1)
							return;
						setTimeout("window.scrollTo(0,0);cp.adjustResponsiveItems();cp.em.fireEvent('CPWindowResizeCompleted');",500);
						return;
					}	
				}					
			}
		}
		else
		{
			var el = document.activeElement;
			if (el && (el.tagName.toLowerCase() == 'input' && el.type == 'text' ||	el.tagName.toLowerCase() == 'textarea')) 
				el.blur();
			cp.em.fireEvent('CPOrientationChanged');
		}
		window.scrollTo(0,0);
		if(cp.responsive)
		{
			cp.adjustResponsiveItems();
			if(lEvntType == "resize")
				cp.em.fireEvent('CPWindowResizeCompleted');
			else
				cp.em.fireEvent('CPOrientationChangeCompleted');
			if(PPTXLib && PPTXLib.resetAnimationsDueToResizeOrOrientationChange)
			{
				PPTXLib.resetAnimationsDueToResizeOrOrientationChange();
				if(cpInfoCurrentFrame >= cp.movie.stage.lastFrame)
				{
					PPTXLib.updateAnimationManager();
					PPTXLib.forceRedraw();
				}
					
			}
			return;
		}	
		
		if(!cp.SetScaleAndPosition())
		{
			cp.getInnerWidth();
			var mc = cp.getMainContainer();
			var pc = cp.getProjectContainer();
			var p = cp.getProject();
			
			var lMainContainerLeft = (cp.offsetInnerWidth - parseFloat(mc.style.width))/2;
			mc.style.left = ((lMainContainerLeft > 0) ? lMainContainerLeft : 0) + 'px';
			cp.movie.offset = ((lMainContainerLeft > 0) ? lMainContainerLeft : 0) +  (cp.movie.m_scaleFactor?cp.movie.m_scaleFactor:1) * (parseFloat(p.style.left) + parseFloat(pc.style.left));
		}
		
		if(cp.useg && cp.gesturesDiv && cp.shouldScale && (cp.movie && cp.movie.virgin))
		{
			//just a hack for refreshing its position. 
			//IOS and Android were not putting it correctly in first place. Refreshing it resolves the issue.
			cp.gesturesDiv.style.display = "none";
			setTimeout("cp.gesturesDiv.style.display = \"block\";",500);
		}

		cp('blockUserInteraction').style.width = "100%";
		cp('blockUserInteraction').style.height = "100%";

		if(lEvntType == "resize")
			cp.em.fireEvent('CPWindowResizeCompleted');
		else
			cp.em.fireEvent('CPOrientationChangeCompleted');
	};

	cp.getOffsetPosition = function(iValX,iValY)
	{
		var lRetVal = new Object();
		
		lRetVal.X = iValX - cp.movie.offset;
		lRetVal.Y = iValY - cp.movie.topOffset;
			
		return lRetVal;
	}

	cp.getScaledPosition = function(iValX,iValY)
	{
		if(cp.responsive)
			return {"X":iValX,"Y":iValY};

		var lRetVal = new Object();
		
		if(!cp.shouldScale)
		{
			var lOffsetPosition = cp.getOffsetPosition(iValX,iValY);
			return lOffsetPosition;
		}	
		
		var lXPositionPercentageWRTNewW = (iValX - cp.movie.newMainContainerL) / (cp.movie.newMainContainerW);
		var lYPositionPercentageWRTNewH = (iValY - cp.movie.newMainContainerT) / (cp.movie.newMainContainerH);
		
		var lOrigXPosition = Math.round(cp.movie.oldMainContainerW * lXPositionPercentageWRTNewW);
		var lOrigYPosition = Math.round(cp.movie.oldMainContainerH * lYPositionPercentageWRTNewH);
			
		var pc = cp.getProjectContainer();
		var p = cp.getProject();
		
		lRetVal.X = lOrigXPosition - parseFloat(pc.style.left) - parseFloat(p.style.left);
		lRetVal.Y = lOrigYPosition - parseFloat(pc.style.top) - parseFloat(p.style.top);
		
		return lRetVal;
	}

	cp.SetScaleAndPosition = function()
	{
		var lMainContainer = cp.getMainContainer();
		var lWindowToRescale = window;
					
		var lScreenWidth = lWindowToRescale.innerWidth;
		var lScreenHeight = lWindowToRescale.innerHeight;
		
		cp.movie.oldMainContainerW = parseFloat(lMainContainer.style.width);
		cp.movie.oldMainContainerH = parseFloat(lMainContainer.style.height);
		
		var lWScalingFactor = ((cp.movie.oldMainContainerW == undefined) || (cp.movie.oldMainContainerW == 0)) ? 1 : (lScreenWidth/cp.movie.oldMainContainerW);
		var lHScalingFactor = ((cp.movie.oldMainContainerH == undefined) || (cp.movie.oldMainContainerH == 0))?1:(lScreenHeight/cp.movie.oldMainContainerH);
			
		cp.movie.m_scaleFactor = 1;
		
		if(!cp.shouldScale)
			return false;
			
		cp.movie.m_scaleFactor = lWScalingFactor < lHScalingFactor ? lWScalingFactor : lHScalingFactor;	
			
		if(cp.verbose)
		{
			cp.log(cp.D.project.shc);
			cp.log(cp.movie.m_scaleFactor);
			cp.log(cp.shouldScale);
		}
		
		cp.movie.newMainContainerW = Math.round(cp.movie.m_scaleFactor * cp.movie.oldMainContainerW);
		cp.movie.newMainContainerH = Math.round(cp.movie.m_scaleFactor * cp.movie.oldMainContainerH);
		
		cp.movie.oldMainContainerL = parseFloat(lMainContainer.style.left);
		cp.movie.oldMainContainerT = parseFloat(lMainContainer.style.top);
			
		lMainContainer.style['webkitTransformOrigin'] = "left top";
		lMainContainer.style['MozTransformOrigin'] = "left top";
		lMainContainer.style['msTransformOrigin'] = "left top";
		
		cp.movie.newMainContainerL = Math.round((lScreenWidth - cp.movie.newMainContainerW)/2 > 0 ? (lScreenWidth - cp.movie.newMainContainerW)/2 : 0);
		cp.movie.newMainContainerT = Math.round((lScreenHeight - cp.movie.newMainContainerH)/2 > 0 ? (lScreenHeight - cp.movie.newMainContainerH)/2 : 0);
		
		lMainContainer.style.left = cp.movie.newMainContainerL + "px";
		lMainContainer.style.top = cp.movie.newMainContainerT + "px";
		
		var pc = cp.getProjectContainer();
		var p = cp.getProject();
		
		cp.movie.offset = cp.movie.newMainContainerL;
		cp.movie.topOffset = cp.movie.newMainContainerT;
		
		lMainContainer.style['webkitTransform'] = "scale(" + cp.movie.m_scaleFactor + ")";
		lMainContainer.style['MozTransform'] = "scale(" + cp.movie.m_scaleFactor + ")";	
		lMainContainer.style['msTransform'] = "scale(" + cp.movie.m_scaleFactor + ")";	
		
		document.body.style.overflow = "hidden";//this will hide the scrollbars which appear on resizing the window. Since we are rescaling, there is no need of scrollbars.
		lMainContainer.style.position = "fixed";//everytime the content the rescaled it should appear in the center of the visible area. Hence position of the container will be changed to fixed.
		return true;
	}

	cp.trimStartingAndTrailingSpaces = function(strToTrim)
	{	
		var tempTrimmedStr = "";
		tempTrimmedStr = strToTrim.replace(/^[\s|\t|\n]+/g,"");
		tempTrimmedStr = tempTrimmedStr.replace(/[\s|\t|\n]+$/g,"");
		return tempTrimmedStr;	
	}
	cp.cpJoin = function(iArr, str)
	{
		if(!iArr || str == "" || str == undefined)
			return;
		
		if(iArr.length <= 0)
			return;
			
		var lRetStr = iArr[0];
		for(var i = 1; i < iArr.length; ++i)
		{
			lRetStr += str + iArr[i];
		}
		
		return lRetStr;
	}

	cp.getLeftTopAfterTranslate = function(iDivElem)
	{
		//Use this function to get Left Top values for any item which transform applied.
		var curTransform = new WebKitCSSMatrix(window.getComputedStyle(iDivElem).webkitTransform);
		
		var retObj = new Object();
		retObj.L = parseFloat(iDivElem.style.left) + curTransform.m41;
		retObj.T = parseFloat(iDivElem.style.top) + curTransform.m42;
		
		return retObj;
	}
	cp.createAlternativeAccessibleText = function(divElem,accStr,role)
	{

		if(cp.SAFARI === cp.browser)
		{
			if(role !== "")
			divElem.setAttribute('role', role);
		
			divElem.setAttribute('aria-label', accStr);
			return;
		}

		if(cp.D.pref.acc === 0 || accStr === "")
			accStr = " ";

		var paraElem = cp.newElem('p');
		paraElem.innerHTML = accStr;
		var childDivElem = cp.newElem('div');
		childDivElem.id = divElem.id + "accStr";
		childDivElem.className = "cp-accessibility";
		childDivElem.appendChild(paraElem);

		divElem.appendChild(childDivElem);
	}
	
	cp.getRGBA = function(color,alpha)
	{
		return 'rgba(' + 	
		parseInt(color.substring(1,3),16) + 
		' , ' +
		parseInt(color.substring(3,5),16) + 
		' , ' + 
		parseInt(color.substring(5,7),16) + 
		' , '+
		alpha + ' )';
	}

	cp.IsRunningInConnect = function()
	{
		if(!document.location || !document.URL || !document.referrer)
				return false;
		return (document.location.href.indexOf("airspeed") != -1 || document.URL.indexOf("airspeed") != -1 || document.referrer.indexOf("airspeed") != -1)
	}

	cp.isBlockedForLMS = function()
	{
		return ((typeof(cp.LMSDriverHolder) != 'undefined') && cp.LMSDriverHolder && cp.LMSDriverHolder.blockedForLMS);
	}

	cp.unblockFromLMS = function()
	{
		if((typeof(cp.LMSDriverHolder) != 'undefined') && cp.LMSDriverHolder)
			cp.LMSDriverHolder.blockedForLMS = false;
		cp('blockUserInteraction').style.display = 'none';
	}

	cp.closeGesturesHint = function()
	{
		if(cp("gestureHint"))
		{
			cp.removeGestureEvent(cp("gestureHint"),cp.GESTURE_EVENT_TYPES.TAP,cp.closeGesturesHint);
			cp("gestureHint").style.display = "none";
		}	
	}

	cp.showGesturesHint = function()
	{
		var lGestureHintDiv = cp("gestureHint");
		if(!cp.useg || !lGestureHintDiv)
			return;

		lGestureHintDiv.style.display = "block";
		lGestureHintDiv.style.zIndex = 10;
		cp.registerGestureEvent(cp("gestureHint"),cp.GESTURE_EVENT_TYPES.TAP,cp.closeGesturesHint);
	}

	cp.getStartFrameOfMovie = function()
	{
		if(cp.loadedModules.toc && cp.toc.movieProperties.tocProperties.hasSelfPaced)
		{
			if(cp.toc.tocPersistanceManager.lastVisitedEntry!=-1)
			{
				if(cp.toc.movieProperties['Slide'+cp.toc.rootObj.tocEntries[cp.toc.tocPersistanceManager.lastVisitedEntry].link])
					return cp.toc.movieProperties['Slide'+cp.toc.rootObj.tocEntries[cp.toc.tocPersistanceManager.lastVisitedEntry].link].from;
			}
		}
		return cpInfoCurrentFrame;
	}
	
	cp.addAndUpdateProjectBackgroundDiv = function(iData)
	{
		var lProjBackgroundDiv = cp("proj_bg");
		var lPlaybar = cp("playbar");
		var lTOC = cp("toc");
		var lPlaybarData = iData.playBarProperties;
		
		if(lProjBackgroundDiv == undefined)
		{
			lProjBackgroundDiv = cp.newElem("div");		
			lProjBackgroundDiv.id = "proj_bg";
			lTOC.parentElement.insertBefore(lProjBackgroundDiv,lTOC);
			lProjBackgroundDiv.style.display = "none";
			lProjBackgroundDiv.style.cssFloat = "left";
			lProjBackgroundDiv.style.position = "absolute";
			lProjBackgroundDiv.style.backgroundColor = iData.project.prjBgColor;
		}
		
		if(lPlaybarData.hasPlayBar && !cp.responsive)
		{
			if((lPlaybarData.position == 0) || (lPlaybarData.position == 2))
			{
				lProjBackgroundDiv.style.width = lPlaybarData.playBarHeight + "px";
				lProjBackgroundDiv.style.height = iData.project.h + "px";
				lProjBackgroundDiv.style.top = "0px";
				var lTocWidth = iData.project.hasTOC ? ((iData.tocProperties.position == 0) ? iData.tocProperties.width : 0 ) : 0;
				lProjBackgroundDiv.style.left = (lPlaybarData.position == 0) ? lPlaybar.style.left : (parseFloat(lPlaybar.style.left) + iData.project.w) + "px";
			}
			else if((lPlaybarData.position == 1) || (lPlaybarData.position == 3))
			{
				lProjBackgroundDiv.style.width = iData.project.w + "px";
				lProjBackgroundDiv.style.height = lPlaybarData.playBarHeight + "px";
				lProjBackgroundDiv.style.top = (lPlaybarData.position == 1) ? "0px" : iData.project.h + "px";;
				lProjBackgroundDiv.style.left = lPlaybar.style.left;
			}
			
			if((lPlaybarData.position == 0 && cp.lBorderW == 0) ||
				(lPlaybarData.position == 1 && cp.tBorderW == 0) ||
				(lPlaybarData.position == 2 && cp.rBorderW == 0) ||
				(lPlaybarData.position == 3 && cp.bBorderW == 0))
				lProjBackgroundDiv.style.display = "block";
		}	
	}

	cp.updateBorderPosition = function(iData,isInit)
	{
		var lMainContainer = cp('main_container');
		var pb = document.getElementById('projectBorder');
			var pc = cp.getProjectContainer();
		
		var lPlaybarData = iData.playBarProperties;
		lPlaybarData.playBarHeight = (lPlaybarData.playBarHeight != undefined) ? lPlaybarData.playBarHeight : 0;
		var m_BorderData = iData.borderProperties;
		if(!m_BorderData)
			return;
		
		if(!m_BorderData.hasBorder && !cp.responsive)
		{
			lMainContainer.style.left = (parseFloat(pc.style.left)) + "px";
			lMainContainer.style.top = (parseFloat(pc.style.top)) + "px";
			lMainContainer.style.width = (parseFloat(pc.style.width)) + "px";
			lMainContainer.style.height = (parseFloat(pc.style.height)) + "px";
			return;
		}
		
		cp.lBorderW = (cp.lBorderW != undefined) ? cp.lBorderW : 0;
		cp.tBorderW = (cp.tBorderW != undefined) ? cp.tBorderW : 0;
		cp.rBorderW = (cp.rBorderW != undefined) ? cp.rBorderW : 0;
		cp.bBorderW = (cp.bBorderW != undefined) ? cp.bBorderW : 0;
		
		if(!isInit)
				cp.addAndUpdateProjectBackgroundDiv(iData);
		
		if(!cp.responsive)
		{
			if(isInit)
				lMainContainer.style.left = (parseFloat(pc.style.left) - cp.lBorderW) + "px";
			else
			{
				if((lPlaybarData.position == 0 || lPlaybarData.position == 2) && !lPlaybarData.overlay)
				{
					if(lPlaybarData.position == 0)
					{
						if(lPlaybarData.playBarHeight > cp.lBorderW)
						{
							m_BorderData.w += lPlaybarData.playBarHeight - cp.lBorderW;
							lMainContainer.style.width = pb.style.width = m_BorderData.w + "px";
							cp.lBorderW = lPlaybarData.playBarHeight;
						}
						
						pc.style.left = (cp.lBorderW - lPlaybarData.playBarHeight) + "px";
					}
					else
					{
						if(lPlaybarData.playBarHeight > cp.rBorderW)
						{
							m_BorderData.w += lPlaybarData.playBarHeight - cp.rBorderW;
							lMainContainer.style.width = pb.style.width = m_BorderData.w + "px";
							cp.rBorderW = lPlaybarData.playBarHeight;
						}			
						pc.style.left = (cp.lBorderW) + "px";
					}
					var lPlaybarH = lPlaybarData && lPlaybarData.playBarHeight ? lPlaybarData.playBarHeight : 0;
					var lOffset = (lPlaybarData.position == 0) ? (lPlaybarH/2) : -(lPlaybarH/2);			
					lMainContainer.style.left = (parseFloat(lMainContainer.style.left) + lOffset) + "px";
				}
				else
					pc.style.left = (cp.lBorderW) + "px";
			}
			
			if(lPlaybarData.position != 1)
			{
				if(lPlaybarData.position == 3)
				{
					if(lPlaybarData.playBarHeight > cp.bBorderW && !lPlaybarData.overlay)
					{
						m_BorderData.h += lPlaybarData.playBarHeight - cp.bBorderW;
						lMainContainer.style.height = pb.style.height = m_BorderData.h + "px";	
						cp.bBorderW = lPlaybarData.playBarHeight;			
					}
				}
				pc.style.top = (cp.tBorderW) + "px";
			}
			else if(!lPlaybarData.overlay)
			{
				if(lPlaybarData.playBarHeight > cp.tBorderW)
				{
					m_BorderData.h += lPlaybarData.playBarHeight - cp.tBorderW;
					lMainContainer.style.height = pb.style.height = m_BorderData.h + "px";	
					cp.tBorderW	= lPlaybarData.playBarHeight;
				}
				
				pc.style.top = (cp.tBorderW - lPlaybarData.playBarHeight) + "px";
			}
			else
			{
				pc.style.top = (cp.tBorderW) + "px";
			}
		}
		else
		{
			cp.project.style.width = "auto";
			cp.project.style.height = "auto";
			cp.project.style.left = cp.lBorderW + "%";
			cp.project.style.right = cp.rBorderW + "%";
			cp.project.style.top = cp.tBorderW + "%";
			cp.project.style.bottom = cp.bBorderW + "%";
		}		
	}

	cp.handleTOCOpenClose = function()
	{
		var toc = cp("toc");
		if(!toc || !toc.animator) return;

		if(cpCmndTOCVisible)
			toc.animator.hideTOC();
		else
			toc.animator.showTOC();
	}

	cp.toggleMoviePlayPause = function()
	{
		var lClassName = "";
		if(cp.movie.paused)
        {
        	cp.movie.play(cp.ReasonForPause.PLAYBAR_ACTION);
        	lClassName = "playAnimation";
        }    
        else
        {
        	cp.movie.pause(cp.ReasonForPause.PLAYBAR_ACTION);	
        	lClassName = "pauseAnimation";
        }

        if(cp.useg && cp.showGesturesAnim)
        {
        	cp.showGesturesAnim(lClassName);
        }
	}

	cp.togglePlaybarShowHide = function()
	{
		if(!cpInfoHasPlaybar)
			return;

		var playbar = cp('playbar');	
		if(!playbar)
			return;

		var shouldShowPlaybar = true;
		if(cp.movie.playbackController)
		{
			var lQuizController = cp.movie.playbackController.GetQuizController();	
			if(lQuizController)
			{
				if(cp.movie.stage &&
					cp.movie.stage.currentSlide &&
					cp.movie.stage.currentSlide['st'] == "Question Slide")
				{
					shouldShowPlaybar = lQuizController.GetHidePlaybarInQuiz();
				}
			}
		}

		if(playbar.animator)
		{
			playbar.animator.showPlaybar(cpInfoCurrentFrame >= cp.movie.stage.lastFrame ? true : false);
			playbar.shown = true;
		}
		else
		{
			playbar.style.display = !playbar.shown ? "block" : "none";
			cp.adjustSkins();
			playbar.shown = !playbar.shown;
		}
	}

	cp.isTextInputInFocus = function()
	{
		var el = document.activeElement;
		return (el && (el.tagName.toLowerCase() == 'input' && el.type == 'text' ||	el.tagName.toLowerCase() == 'textarea'));
	}

	cp.ccInit = function(ccProperties)
	{
		if(!cp.ccdv)
			return;
		var ccDiv = cp.ccdv;
		ccDiv.style.width = ccProperties.w + 'px';
		ccDiv.style.height = ccProperties.h + 'px';
		var ccBkDiv = ccDiv.firstElementChild;
		ccBkDiv.style.backgroundColor = cp.ConvertColorToRGBA(ccProperties.c,ccProperties.o/100);
		ccBkDiv.style.fontFamily = ccProperties.f;
		ccBkDiv.style.fontSize = ccProperties.fs + 'px';
		ccBkDiv.style.color = ccProperties.tc;	
		cp.movie.ccText = ccBkDiv.firstElementChild;
		cp.movie.ccLines = ccProperties.lc;
		var p = cp.getProject();
		ccDiv.style.left = p.style.left;
		ccDiv.style.bottom =  "0px";
	}

	cp.markTOCEntryComplete = function(i)
	{
		var slideData = cp.D[cp.movie.stage.slides[i]];
		if(slideData && slideData.tocEntry)
			slideData.tocEntry.setVisited();
	}

	cp.updateTextBounds = function(iTextDiv,iParentDiv,lTextBounds, iMargins)
    {
    	if(cp.responsive && iTextDiv)
    	{
    		if(lTextBounds)
			{
				var lParentW = iParentDiv.clientWidth;
				var lParentH = iParentDiv.clientHeight;
				var l = lTextBounds[cp.ResponsiveProjWidth].l;
				var t = lTextBounds[cp.ResponsiveProjWidth].t;
				var w = lTextBounds[cp.ResponsiveProjWidth].w;
				var h = lTextBounds[cp.ResponsiveProjWidth].h;
				var lProps = [l,t,w,h];
				var lMargins = [iMargins[0],iMargins[1],-(iMargins[0] + iMargins[2]),-(iMargins[1] + iMargins[3])];
				var lStyleProps = ["left","top","width","height"];
				var lRefVals = [iTextDiv.parentElement.clientWidth,iTextDiv.parentElement.clientHeight,lParentW,lParentH];
				for(var lIdx = 0; lIdx < 4; ++lIdx)
				{
					var lProp = lProps[lIdx];
					if(lProp.indexOf("%") != -1)
					{
						iTextDiv.style[lStyleProps[lIdx]] = (cp.getRoundedValue(parseFloat(lProp) * lRefVals[lIdx]/100) + lMargins[lIdx]) + "px";
					}
					else
					{
						iTextDiv.style[lStyleProps[lIdx]] = (parseFloat(lProp) + lMargins[lIdx]) + "px";
					}
				}
			}
    	}
    }

    cp.adjustFontSizesForVariableText = function(lItem,lObj,iCurrItemW)
    {
    	if(lItem)
		{
			var lChildren = lItem.children;
			for(var key in lChildren)
			{
				var lSpan = lChildren[key];
				if(!lSpan || !lSpan.tagName || lSpan.tagName.toLowerCase() != "span")
				{
					cp.adjustFontSizesForVariableText(lSpan,lObj,iCurrItemW);
					continue;
				}	
					
				var lCurrentFontSize = parseFloat(lSpan.style.fontSize);
				//loop through the spans and accordingly update every span's font size
				var lInterpolatedFontSize = Math.floor(cp.getInterpolatedFontSize(lObj,lCurrentFontSize,iCurrItemW));
				if(lInterpolatedFontSize < 8)
					lInterpolatedFontSize = 8;
				lSpan.style.fontSize = lInterpolatedFontSize + "px";
				cp.adjustFontSizesForVariableText(lSpan,lObj,iCurrItemW);
			}
		}
    }

    function updateResponsiveVarText(element, checkVisibility, force)
    {
    	var iVar = 0, iText = 0;
		var nVars = 0, nTexts = 0, oneVarLen = 0;
		var tempStr = '', innerDivId = '', isVisible = false;
		var parentFrameset = null;
		var lCPCanvasElem = undefined;
		var lParentTextHolderDiv = undefined;
		var lParentTextHandlerHolderDiv = undefined;
		var lQuizAnswerItem = undefined;
		var checkForVisibility = false;
		if ( checkVisibility )
			checkForVisibility = true;
		if(element.id)
		{
			var elementData = cp.D[element.id];
			if(elementData)
			{
				var canvasId = elementData.mdi;
				var canvasItem = null;
				var canvasElem = null;
				if(canvasId)
				{
					canvasItem = cp.D[canvasId];
					canvasElem = cp(canvasId);
				}

				var isCaptionItem = cp.isCaptionItem(elementData.type);
				var isImageBasedCaption = (isCaptionItem
											&& cp.D[elementData.mdi] 
											&& cp.D[elementData.mdi].ip);

				var isAutoshapeItem = (cp.kCPOTAutoShape == elementData.type || cp.kCPOTStageCorrectFeedbackShape == elementData.type || cp.kCPOTSuccessShapeItem == elementData.type 
										|| cp.kCPOTStageIncorrectFeedbackShape == elementData.type || cp.kCPOTFailureShapeItem == elementData.type || cp.kCPOTHintShapeItem == elementData.type || cp.kCPOTStagePartialCorrectFeedbackShape == elementData.type
										|| (cp.kCPOTRetryFeedbackShape == elementData.type) ||	(cp.kCPOTIncompleteFeedbackShape == elementData.type) || (cp.kCPOTTimeoutFeedbackShape == elementData.type) || (cp.kCPOTAnswerFeedbackShape == elementData.type));
				
				var isButtonItem = (cp.kCPOTScorableButtonItem == elementData.type || 
					cp.kCPOTRetakeButton == elementData.type ||
					cp.kCPOTStageQuestionNextButton == elementData.type ||
					cp.kCPOTStageQuestionClearButton == elementData.type ||
					cp.kCPOTStageQuestionBackButton == elementData.type ||
					cp.kCPOTStageQuestionReviewModeNextButton == elementData.type ||
					cp.kCPOTStageQuestionReviewModeBackButton == elementData.type ||
					cp.kCPOTStageQuestionSubmitButton == elementData.type ||
					cp.kCPOTScoringReviewButton == elementData.type ||
					cp.kCPOTScoringContinueButton == elementData.type ||
					cp.kCPOTSubmitAllButton == elementData.type ||
					cp.kCPOTResetButton == elementData.type ||
					cp.kCPOTUndoButton == elementData.type ||
					cp.kCPOTDDSubmitButton == elementData.type ||
					cp.kCPOTTextEntryButtonItem == elementData.type);

				var isQuizAnswerItem = (cp.kCPOTStageAnswerLabel == elementData.type || 
										cp.kCPOTStageAnswerItem == elementData.type ||
										cp.kCPOTStageMatchingAnswerEntry == elementData.type ||
										cp.kCPOTStageMatchingQuestion == elementData.type);

				if(isButtonItem && elementData.subt != undefined && elementData.subt == cp.kTextButton)
					return;

				lParentTextHolderDiv = cp(element.id + "_vTxtHolder");
				lParentTextHandlerHolderDiv = cp(element.id + "_vTxtHandlerHolder");
				if(isQuizAnswerItem)
				{
					lParentTextHolderDiv = element.drawingBoard;
					lParentTextHandlerHolderDiv = element;
				}	
				
				var text = elementData.vt;
				var lResponsiveText = elementData.rpvt;
				if(!lResponsiveText)
					return;

				var captionOffsets = [0,0,0,0];

				var marginL = marginT = marginR = marginB = 0;
				//currently this will be global preference option. But it should become object level option
				//everywhere we will be checking this property on object data only.
				elementData.autoGrow = cp.autoGrow && !isQuizAnswerItem;

				marginL = elementData.rplm ? elementData.rplm[cp.ResponsiveProjWidth] : 0;
				marginT = elementData.rptm ? elementData.rptm[cp.ResponsiveProjWidth] : 0;
				marginR = elementData.rprm ? elementData.rprm[cp.ResponsiveProjWidth] : 0;
				marginB = elementData.rpbm ? elementData.rpbm[cp.ResponsiveProjWidth] : 0;

				var textLayout = elementData.rptl ? elementData.rptl[cp.ResponsiveProjWidth] : cp.TextLayoutEnum.kTLCenter;
				var textAlignment = elementData.rpta ? elementData.rpta[cp.ResponsiveProjWidth] : cp.TextAlignmentEnum.kTACenter;

				text = lResponsiveText[cp.ResponsiveProjWidth].vt;
				var evalText = '';
				if(text)
				{
					if(element.drawingBoard && lParentTextHolderDiv)
					{
						var rlm=rrm=rtm=rbm=0;
						// if(canvasItem.sw)
						// 	rlm = rtm = rbm = rrm = canvasItem.sw/2;
						
						var isFIBCaption = elementData.type == cp.kCPOTFillBlankCaption;
						if(isFIBCaption && !force)
							return;
						var hasHyperLinks = canvasItem.hl;
						var drawingBoard = element.drawingBoard;
						if(canvasItem && canvasItem.b && lParentTextHolderDiv)
						{
							var nhtmlelems = 2;
							var innerDiv = null;
							var innerDiv1 = null;
							innerDivId = canvasId + '-vtext';
							innerDiv = cp(innerDivId);
							innerDiv1 = cp(innerDivId + "_Handler");

							parentFrameset = cp.movie.stage.getFrameset( element.id );
							if(lParentTextHolderDiv && !innerDiv && !innerDiv1)
							{
								// Check visibility.
								if ( canvasItem && parentFrameset && parentFrameset.isStarted && 1 == canvasItem.visible && lParentTextHolderDiv.style.visible == "visible" )
									isVisible = true;
								
								innerDiv = cp.newElem('div');
								innerDiv.className = 'cp-vtxt';
								innerDiv.setAttribute("aria-hidden","true");
								innerDiv.id = innerDivId;
								if(canvasElem)
									innerDiv.style.left = canvasElem.style.left;
								
								var lWidth, lHeight;						
								innerDiv.style.cssText = "word-wrap:break-word;white-space:pre-wrap;overflow:hidden;line-height:90%;";
								var lStyleText = "";
								
								innerDiv.style.cssText += lStyleText;
								
								if ( ! isVisible )
									innerDiv.style.visibility = 'hidden';
								if ( parentFrameset )
									parentFrameset.htmlDependents.push( innerDiv );
								
								cp.movie.stage.addToParentChildMap( element.id, lParentTextHolderDiv.id );
								cp.movie.stage.addToParentChildMap( element.id, innerDivId );
								lParentTextHolderDiv.appendChild(innerDiv);
								
								//if(canvasItem.sh)
								//	cp.applyShadow(innerDiv,canvasItem.sh,!isImageBasedCaption);
								
								if(hasHyperLinks || isFIBCaption) 
								{
									innerDiv1 = cp.newElem('div');
									innerDiv1.className = 'cp-vtxt';
									innerDiv1.id = innerDivId + "_Handler";
									innerDiv1.style.cssText = "word-wrap:break-word;white-space:pre-wrap;overflow:hidden;line-height:90%;";
									innerDiv1.style.cssText += lStyleText;
									if ( ! isVisible )
										innerDiv1.style.visibility = 'hidden';
									/*if ( parentFrameset )
										parentFrameset.htmlDependents.push( innerDiv1 );*/
									cp.movie.stage.addToParentChildMap( element.id, lParentTextHandlerHolderDiv.id );
									cp.movie.stage.addToParentChildMap( element.id, innerDiv1.id );
									lParentTextHandlerHolderDiv.appendChild(innerDiv1);	
									
									//if(canvasItem.sh)
									//	cp.applyShadow(innerDiv1,canvasItem.sh,!isImageBasedCaption);
									
									if(isFIBCaption)
									{
										cp(element.id).style.overflow = "visible";
										innerDiv1.style.overflow = "visible";
									}
									if(canvasElem)
										innerDiv1.style.left = canvasElem.style.left;
								}
							}
							else
							{
								if(!parentFrameset || !parentFrameset.isStarted)
									return;
								lCPCanvasElem = displayObjectMap[canvasId];
								if(!lCPCanvasElem)
								{
									//for quizzing items
									var lQuizPainterId = elementData.qdi;
									lQuizAnswerItem = displayObjectMap[lQuizPainterId];
									lCPCanvasElem = lQuizAnswerItem.answertextCanvasShape;
								}
								if(!isFIBCaption)
									innerDiv = cp(innerDivId);//drawingBoard.children[ nhtmlelems - 1 ];
								if ( innerDiv && checkForVisibility ) {									
									if ( canvasItem && 1 == canvasItem.visible && lCPCanvasElem && lCPCanvasElem.isDrawn )
										innerDiv.style.visibility = 'visible';									
								}

								if(hasHyperLinks || isFIBCaption)
								{
									innerDiv1 = document.getElementById(innerDivId + "_Handler");
									if ( innerDiv1 && checkForVisibility ) 
									{
										if ( canvasItem && 1 == canvasItem.visible )
										{
											innerDiv1.style.visibility = 'visible';
											if(hasHyperLinks)
											{
												innerDiv1.style.backgroundColor = "#ffffff";
												innerDiv1.style.opacity = 0;
											}											
										}	
									}
									if(canvasElem)
										innerDiv1.style.left = canvasElem.style.left;
								}
								if(innerDiv)
								{
									if(canvasElem)
										innerDiv.style.left = canvasElem.style.left;
									//this is done to avoid the function to pick the previous breakpoint value
									innerDiv.style.width = "";
									innerDiv.style.height = "";
								}
								if(innerDiv1)
								{
									//this is done to avoid the function to pick the previous breakpoint value
									innerDiv1.style.width = "";
									innerDiv1.style.height = "";
								}
								lWidth = lCPCanvasElem.actualParent.clientWidth;
								lHeight = lCPCanvasElem.actualParent.clientHeight;
								lCPCanvasElem.actualParent.offsetHeight = lCPCanvasElem.actualParent.offsetHeight;

								if(isAutoshapeItem)
								{
									var lMargins = [marginL + rlm,marginT + rtm,marginR + rrm,marginB + rbm];
									if(innerDiv)
									{
										cp.updateTextBounds(innerDiv,lCPCanvasElem.actualParent, canvasItem.tb,lMargins);
									} 
									if(innerDiv1)
									{
										cp.updateTextBounds(innerDiv1,lCPCanvasElem.actualParent, canvasItem.tb,lMargins);
									}
								}

								//if(isCaptionItem && elementData.offsets)
								//	captionOffsets = elementData.offsets;
								
								if(captionOffsets && !isAutoshapeItem)
								{
									lWidth = lCPCanvasElem.actualParent.clientWidth - 
												(captionOffsets[0] + marginL + captionOffsets[2] + marginR + (rlm + rrm));
									lHeight = lCPCanvasElem.actualParent.clientHeight - 
												(captionOffsets[1] + marginT + captionOffsets[3] + marginB + (rtm + rbm));
									{
										if(innerDiv)
										{
											{
												innerDiv.style.left = (captionOffsets[0] + marginL + rlm) + "px";
												innerDiv.style.top = (captionOffsets[1] + marginT + rtm) + "px";
												innerDiv.style.right = (captionOffsets[2] + marginR + rrm) + "px";
												innerDiv.style.bottom = (captionOffsets[3] + marginB + rbm) + "px";
											}
										}

										if(innerDiv1)
										{
											{
												innerDiv1.style.left = (captionOffsets[0] + marginL + rlm) + "px";
												innerDiv1.style.top = (captionOffsets[1] + marginT + rtm) + "px";
												innerDiv1.style.right = (captionOffsets[2] + marginR + rrm) + "px";
												innerDiv1.style.bottom = (captionOffsets[3] + marginB + rbm) + "px";
											}
										}	
									}
								}
							}
						}
							
						try
						{
							// The variables can have various lengths. So we need to be able to break down the variables, set their values
							// and then merge them back.
							if ( undefined != elementData.vars && undefined != elementData.varLens && undefined != elementData.texts ) 
							{
								var lCurrWidth = cp.ResponsiveProjWidth;
								// Now we need to create the text.
								var i_vars = elementData.vars[lCurrWidth];
								var i_varLens = elementData.varLens[lCurrWidth];
								var i_texts = elementData.texts[lCurrWidth];

								nVars = i_vars.length, nTexts = i_texts.length;
								while ( true ) 
								{
									evalText += i_texts[ iText++ ];
									if ( iVar < nVars ) 
									{
										tempStr = window[ i_vars[ iVar ] ];
										if ( undefined == tempStr )
											tempStr = '';
										oneVarLen = i_varLens[ iVar ];
										if ( tempStr.length > oneVarLen )
											tempStr = tempStr.substr( 0, oneVarLen );
										++iVar;
										evalText += tempStr;
									}
									if ( iText >= nTexts )
										break;
								}
								if(innerDiv && !isFIBCaption) innerDiv.innerHTML = evalText;
								if(hasHyperLinks || isFIBCaption)
								{
									if(hasHyperLinks)
										text = evalText;
									
									if(innerDiv1.innerHTML == "" || 
										hasHyperLinks && innerDiv1.innerHTML != text)
									{
										innerDiv1.innerHTML = text;
									}	
									var evtArgs = {
										captionName: element.id,
										reason:"updateResponsiveVarText",
										callbackFn:function(e)
										{
											innerDiv1.innerHTML = text;
										}
									};
									cp.em.fireEvent('CPInputControlReplacedEvent',evtArgs);
								}
							}
							else 
							{
								if(innerDiv && (innerDiv.innerHTML != text) && !isFIBCaption) innerDiv.innerHTML = text;
								if(hasHyperLinks || isFIBCaption) 
								{
									if(innerDiv1.innerHTML == "" || 
										hasHyperLinks && innerDiv1.innerHTML != text)
									{
										innerDiv1.innerHTML = text;
									}
									var evtArgs = {
										captionName: element.id,
										reason:"updateResponsiveVarText",
										callbackFn:function(e)
										{
											innerDiv1.innerHTML = text;
										}
									};
									cp.em.fireEvent('CPInputControlReplacedEvent',evtArgs);
								}
							}	
							
							if(force)
							{
								var lSlideItemObj = {"n":element.id,"t":elementData.type};
								cp.movie.stage.addHyperLinks(lSlideItemObj,cp(element.id));
							}

							if(canvasItem.sh)
							{
								var lDrawTextShadow = !isImageBasedCaption;
								if(canvasItem.fa != undefined)
								{
									lDrawTextShadow = (canvasItem.fa == 0);
								}
								var lTextHolder;
								if(innerDiv) lTextHolder = innerDiv.firstChild;
								var lTextHolder1;
								if(innerDiv1) lTextHolder1 = innerDiv1.firstChild;

								if(lTextHolder && lTextHolder.firstChild)
									cp.applyShadow(lTextHolder.firstChild,canvasItem.sh,lDrawTextShadow);
								if(lTextHolder1 && lTextHolder1.firstChild)
									cp.applyShadow(lTextHolder1.firstChild,canvasItem.sh,lDrawTextShadow);
							}						

							{
								function getItemBoundingRect(inItem)
								{
									var lItemWidth = inItem.clientWidth;
									if(isFIBCaption)
										lItemWidth = inItem.parentElement.clientWidth;
									return cp.createTempTextElemAndGetBoundingRect(lItemWidth,elementData,inItem.innerHTML);
								};
								
								var lItem = innerDiv ? innerDiv : innerDiv1;
								var lTextRect = getItemBoundingRect(lItem);
								if(lCPCanvasElem)
								{
									elementData.variableText = lItem.innerHTML;
									var lLeft = parseFloat(lItem.style.left);
									var lTop = parseFloat(lItem.style.top);
									var lRight = parseFloat(lItem.style.right);
									var lBottom = parseFloat(lItem.style.bottom);									
									
									var lHasFixedHeight = isFIBCaption || (lCPCanvasElem && lCPCanvasElem.currentCSS &&
															lCPCanvasElem.currentCSS.h &&
															((lCPCanvasElem.currentCSS.h.indexOf("H%") == -1) && (lCPCanvasElem.currentCSS.h.indexOf("auto") == -1)));

									elementData.autoGrow = elementData.autoGrow && !lHasFixedHeight && !elementData.isPartOfInteraction;
									if(elementData.autoGrow)
									{
										var lShouldGrow = false;
										if(lItem && lItem.clientHeight < lTextRect.height)
										{
											if(!elementData.breakevenWidth)
												elementData.breakevenWidth = new Object();
											var lObj = elementData.breakevenWidth[cp.ResponsiveProjWidth];
											var lHOffsets = lCPCanvasElem.actualParent.clientWidth - lItem.clientWidth;
											var lVOffsets = lCPCanvasElem.actualParent.clientHeight - lItem.clientHeight;
											if(!lObj)
											{
												var lMaxItemWHInBpt = cp.getMaxWHBpt(lCPCanvasElem.responsiveCSS[cp.ResponsiveProjWidth],
																						cp.ResponsiveProjWidth);
												
												var lReqW = lMaxItemWHInBpt.w - (lHOffsets);
												var lTempTextRect = cp.createTempTextElemAndGetBoundingRect(lReqW,
																										elementData,
																										lItem.innerHTML);
												var lMinItemWToHoldText = lTempTextRect.width + lHOffsets;
												var lMinItemHToHoldText = lTempTextRect.height + lVOffsets;
												var lExpectedWindowWidth = cp.getExpectedWindowWidthToFitText(lCPCanvasElem.currentCSS,
																											lMinItemWToHoldText,
																											lMinItemHToHoldText);	
												lExpectedWindowWidth = cp.getExpectedWindowWidthToFitText(lCPCanvasElem.currentCSS,
																											lMinItemWToHoldText,
																											lMinItemHToHoldText);
												var lObj = {"winW":lExpectedWindowWidth,
																	 "expw":lTempTextRect.width,"hOffsets":lHOffsets,"vOffsets":lVOffsets};
												elementData.breakevenWidth[cp.ResponsiveProjWidth] = lObj;
											}
											
											function setItemMinHeight(iTextRectHeight)
											{
												elementData.minItemHeight = iTextRectHeight + lVOffsets;
											}
											
											setItemMinHeight(lTextRect.height);

											if(cp.fluidFont)
											{
												if(innerDiv)
													cp.adjustFontSizesForVariableText(innerDiv,lObj,(innerDiv.clientWidth));
												if(innerDiv1)
												{
													var lW = innerDiv1.clientWidth;
													if(innerDiv)
														lW = innerDiv.clientWidth;
													cp.adjustFontSizesForVariableText(innerDiv1,lObj,lW);
												}	
											}	
											var lTextRect = getItemBoundingRect(lItem);
											if(lItem.clientHeight < lTextRect.height)
											{
												var lHt = lTextRect.height;
												setItemMinHeight(lHt);
												var lMaxWHObj = cp.getMinMaxHeight(lCPCanvasElem.currentCSS);
												if(!isNaN(lMaxWHObj.maxH))
												{
													if(elementData.minItemHeight > lMaxWHObj.maxH)
													{
														elementData.minItemHeight = lMaxWHObj.maxH;
														lHt = elementData.minItemHeight - lVOffsets;
													}	
												}
												lShouldGrow = true;
												if(innerDiv)
													innerDiv.style.height = lHt + "px";
												if(innerDiv1)
													innerDiv1.style.height = lHt + "px";
											}											
										}
										if(lShouldGrow)
										{
											if(lQuizAnswerItem)
												lQuizAnswerItem.drawForResponsive(true,cp.ReasonForDrawing.kTextGrow);
											else
												lCPCanvasElem.drawForResponsive(true,cp.ReasonForDrawing.kTextGrow);
										}
									}
								}
								function updateTextHolder(iItem)
								{
									if(!iItem)
										return;
									
									iItem.style.width = /*isFIBCaption ? "100%" : */(lTextRect.width + "px");
									iItem.style.height = /*isFIBCaption ? "100%" : */(lTextRect.height + "px");
									/*if(!isFIBCaption) */iItem.style.position = "absolute";
																		
									switch(textAlignment)
									{
										case cp.TextAlignmentEnum.kTARightJustify :
											iItem.style.textAlign = "right";
											break;
										case cp.TextAlignmentEnum.kTACenter :
											iItem.style.textAlign = "center";
											break;
										default :
											iItem.style.textAlign = "left";
											break;
									}
									
									switch(textLayout)
									{
										case cp.TextLayoutEnum.kTLBottom :
											var lTopShift = (innerDiv.clientHeight - lTextRect.height);
											if(isFIBCaption)
												lTopShift = (lItem.parentElement.clientHeight - lTextRect.height);
											lTopShift = lTopShift < 0 ? 0 : lTopShift;
											iItem.style.top = lTopShift + "px";
											break;
										case cp.TextLayoutEnum.kTLCenter :
											var lTopShift = (innerDiv.clientHeight - lTextRect.height)/2;
											if(isFIBCaption)
												lTopShift = (lItem.parentElement.clientHeight - lTextRect.height)/2;
											if(lTopShift > 0)
											{
												iItem.style.bottom = "";
												iItem.style.top = lTopShift + "px";
											}											
											break;
										default :
											iItem.style.top = "0px";
											break;
									}	
								}
								if(innerDiv) 
									updateTextHolder(innerDiv.firstChild);
								if(innerDiv1) 
								{
									updateTextHolder(innerDiv1.firstChild);
									if(isFIBCaption)
									{
										var evtArgs = {
											captionName: element.id,
											reason:"updateResponsiveVarText:textadjust"
										};
										cp.em.fireEvent('CPInputControlReplacedEvent',evtArgs);
									}
								}
							}
						}
						catch(e){
							cp.log(e);
						}
					}
				}
			}
		}
    }

	function updateVarText(element, checkVisibility, force)
	{
		if(cp.responsive)
			return updateResponsiveVarText(element, checkVisibility, force);
		
		var iVar = 0, iText = 0;
		var nVars = 0, nTexts = 0, oneVarLen = 0;
		var tempStr = '', innerDivId = '', isVisible = false;
		var parentFrameset = null;
		var checkForVisibility = false;
		if ( checkVisibility )
			checkForVisibility = true;
		if(element.id)
		{
			var elementData = cp.D[element.id];
			if(elementData)
			{
				var text = elementData.vt;
				var evalText = '';
				if(text)
				{
					if(element.drawingBoard)
					{
						var canvasId = elementData.mdi;
						var canvasItem = null;
						if(canvasId)
						{
							canvasItem = cp.D[canvasId];
						}

						var hasHyperLinks = canvasItem.hl;
						var drawingBoard = element.drawingBoard;
						if(canvasItem && canvasItem.b && drawingBoard)
						{
							var nhtmlelems = 2;
							var innerDiv = null;
							var innerDiv1 = null;
							innerDivId = canvasId + '-vtext';
								
							if(drawingBoard.children.length < nhtmlelems)
							{
								var margins = {};
								if(undefined != elementData.lm)
								{
									margins.lm = elementData.lm;
									margins.tm = elementData.tm;
									margins.rm = elementData.rm;
									margins.bm = elementData.bm;
								}
								innerDiv = cp.newElem('div');
								innerDiv.className = 'cp-vtxt';
								innerDiv.id = innerDivId;
								// Check visibility.
								parentFrameset = cp.movie.stage.getFrameset( element.id );
								if ( canvasItem && parentFrameset && parentFrameset.isStarted && 1 == canvasItem.visible )
									isVisible = true;
										
								var lWidth, lHeight;						
								lWidth = (canvasItem.b[2] - canvasItem.b[0] - (margins.lm + margins.rm)) +"px";
								lHeight = (canvasItem.b[3] - canvasItem.b[1] - (margins.tm + margins.bm)) + "px";
								
								innerDiv.style.cssText = "word-wrap:break-word;white-space:pre-wrap; width: " + lWidth + ";height:" + lHeight + ";line-height:90%;overflow:hidden;";
								var lStyleText = "";
								lStyleText += "margin-left:" + ((canvasItem.b[0] + margins.lm) - canvasItem.vb[0]) + "px;";
								lStyleText += "margin-top:" + ((canvasItem.b[1] + margins.tm) - canvasItem.vb[1]) + "px;";
								
								innerDiv.style.cssText += lStyleText;
								
								if ( ! isVisible )
									innerDiv.style.visibility = 'hidden';
								if(canvasItem.tr)
									cp.applyTransform(innerDiv,canvasItem.tr);
								if(canvasItem.sh)
									cp.applyShadow(innerDiv,canvasItem.sh);
								if ( parentFrameset )
									parentFrameset.htmlDependents.push( innerDiv );
								cp.movie.stage.addToParentChildMap( element.id, innerDivId );
								drawingBoard.appendChild(innerDiv);
							}
							else
							{
								var lCPCanvasElem = displayObjectMap[canvasId];
								innerDiv = drawingBoard.children[ nhtmlelems - 1 ];
								if ( innerDiv && checkForVisibility ) {									
									if ( canvasItem && 1 == canvasItem.visible && lCPCanvasElem && lCPCanvasElem.isDrawn )
										innerDiv.style.visibility = 'visible';									
								}																
							}
						
							try
							{
								// The variables can have various lengths. So we need to be able to break down the variables, set their values
								// and then merge them back.
								if ( undefined != elementData.vars && undefined != elementData.varLens && undefined != elementData.texts ) 
								{
									var lCurrWidth = cp.D.project.w;
									// Now we need to create the text.
									var i_vars = elementData.vars[lCurrWidth];
									var i_varLens = elementData.varLens[lCurrWidth];
									var i_texts = elementData.texts[lCurrWidth];

									nVars = i_vars.length, nTexts = i_texts.length;
									while ( true ) 
									{
										evalText += i_texts[ iText++ ];
										if ( iVar < nVars ) 
										{
											tempStr = window[ i_vars[ iVar ] ];
											if ( undefined == tempStr )
												tempStr = '';
											oneVarLen = i_varLens[ iVar ];
											if ( tempStr.length > oneVarLen )
												tempStr = tempStr.substr( 0, oneVarLen );
											++iVar;
											evalText += tempStr;
										}
										if ( iText >= nTexts )
											break;
									}
									innerDiv.innerHTML = evalText;
								}
								else 
								{
									innerDiv.innerHTML = text;
								}
							}
							catch(e){
								cp.log(e);
							}
						}
					}
				}
			}
		}
	}
	cp.updateVarText = updateVarText;
	
	cp.updateVariableTextBounds = function(cpElement, force)
	{
		if(cpElement.element)
		{
			cp.updateVarText(cpElement.element, true, force);
		}
	}

	cp.updateNoSkipFramesAndUpdateVarText = function(cpElement)
	{
		if(cpElement.element)
		{
			cp.updateVarText(cpElement.element, true);
		}
		if(cpElement.pa)
		{
			cp.movie.stage.noSkipFrames[cpElement.pa] = cpElement.pa;
		}
		if(cpElement.psv)
		{
			cp.movie.stage.noSkipFrames[cpElement.psv] = cpElement.psv;
		}
		
		/*if(cpElement.itemData && cpElement.itemData.JSONEffectData)
		{
			//NOTE - END Frames are updated from the place where this method is called.
		}*/
	}
	
	// ------------------ External interfaces -----------------------

    // For external guys to register their object creator, this is for plugging in their objects in Cp's system so that 
    // they get proper load.unload and onenter frame callbacks based on Cp's timeline
    cp.RegisterExternalObjects = function(name, objClass, objCreatorCallBack, clickHandlerCb)
    {
         if (!cp.IsValidObj(cp.extObjInfo))
            cp.extObjInfo = new Array();

        var bFound = false;
        for (var item =0; item < cp.extObjInfo.length; ++item)
		{
            if (cp.extObjInfo[item].cb == objCreatorCallBack)
            {
                bFound = true;
                break;
            }
        }
        if (!bFound)
        {
            var obj = {};
            obj.n = name;
            obj.cls = objClass;
            obj.cb = objCreatorCallBack;
            obj.chcb = clickHandlerCb;
            cp.extObjInfo.push(obj);
        }
    }

	// Supposed to be used by the external guys if they want to add a noSkipFrame
	cp.AddNoSkipFrameExternal = function (frame)
	{
		if (cp.movie.stage)
			cp.movie.stage.noSkipFrames[frame] = frame;
	}
    
    // For external guys who want to register their audio to avail the benefit of Cp's channel allocation, pre-loading, pause, resume and other logics. 
    // Those guys must implement the cp.ExtAudioObject interface for their AudioObject
    cp.AddExternalAudioCb = function(extAudioCb)
    {
        var bFound = false;
        if (undefined == cp.extAudioCallbacks)
                cp.extAudioCallbacks = new Array();
                
        for (var item =0; item < cp.extAudioCallbacks.length; ++item)
		{
            if (cp.extAudioCallbacks[item] == extAudioCb)
            {
                bFound = true;
                break;
            }
        }
        if (!bFound)
        {
            cp.extAudioCallbacks.push(extAudioCb);
        }
    }

    cp.showHideFeedbackCaptionsClickHandler = function(div,shouldExecuteAction, item, iCanShowFeedbackCaption) 
	{ 
		var object = item;
		if (! object) {
			var slideDivData = cp.D[div.id]; 
			object = slideDivData['topMostObjectInteractiveObject']; 
		}
		if (! object)
			return false;
		var divdata = cp.D[object]; 
		if ( divdata && undefined != divdata.val ) // means TEB.
			return false; // TEB has it's own handler.
		return cp.clickFailureHandler(divdata, shouldExecuteAction, iCanShowFeedbackCaption);
	}


	cp.getLocalisedStateName = function(inStateName)
	{
		var stateNameToLocalizedStateNameMap = cp.D["project"].stateNameToLocalizedStateNameMap;
		return stateNameToLocalizedStateNameMap[inStateName];
	}
	cp.doesSupportStates = function(itemType) 
	{ 
		var bRetVal = false;
		if(undefined == itemType)
			return bRetVal;

		switch(itemType)
		{
			case cp.kCPOTScorableButtonItem:
			case cp.kCPOTTextEntryButtonItem:
			case cp.kCPOTDDSubmitButton:
			case cp.kCPOTResetButton:
			case cp.kCPOTUndoButton:
			case cp.kCPOTStageQuestionReviewModeNextButton:
			case cp.kCPOTStageQuestionReviewModeBackButton:
			case cp.kCPOTStageQuestionSubmitButton:
			case cp.kCPOTStageQuestionNextButton:
			case cp.kCPOTStageQuestionClearButton:
			case cp.kCPOTStageQuestionBackButton:
			case cp.kCPOTScoringReviewButton:
			case cp.kCPOTScoringResultItem:
			case cp.kCPOTScoringContinueButton:
			case cp.kCPOTRetakeButton:
			case cp.kCPOTAdvanceNextButton:
			case cp.kCPOTAdvanceReviewButton:
			case cp.kCPOTSubmitAllButton:
				bRetVal = true;
				break;
		}
		return bRetVal;
	}
	cp.shouldRelaxBrowserCheck = function(itemType) 
	{ 
		var bRetVal = false;
		if(undefined == itemType)
			return bRetVal;

		switch(itemType)
		{
			case cp.kCPOTTextEntryButtonItem:
			case cp.kCPOTStageQuestionReviewModeNextButton:
			case cp.kCPOTStageQuestionReviewModeBackButton:
			case cp.kCPOTStageQuestionSubmitButton:
			case cp.kCPOTStageQuestionNextButton:
			case cp.kCPOTStageQuestionClearButton:
			case cp.kCPOTStageQuestionBackButton:
			case cp.kCPOTScoringReviewButton:
			case cp.kCPOTScoringResultItem:
			case cp.kCPOTScoringContinueButton:
			case cp.kCPOTRetakeButton:
			case cp.kCPOTAdvanceNextButton:
			case cp.kCPOTAdvanceReviewButton:
			case cp.kCPOTSubmitAllButton:
				bRetVal = true;
				break;
		}
		var bShouldDispatchClickEvent = cp.vm.getVariableValue('cpInfoParentRequestToRelaxBrowserCheck');
		if(bShouldDispatchClickEvent === true)
		{
			bRetVal=true;
		}
		return bRetVal;
	}
	cp.toggleLMSPreviewDebugLogsColor = function(aLMSHolder)
	{
		lBackgroundColorArray= ["#FFFFFF","#D8D8D8"];
		var curBkgColor = aLMSHolder.getBackgroundColorForLogs();
		if(curBkgColor == lBackgroundColorArray[0])
			aLMSHolder.setBackgroundColorForLogs(lBackgroundColorArray[1]);
		else
			aLMSHolder.setBackgroundColorForLogs(lBackgroundColorArray[0]);
	}

 	cp.isInbuiltState = function(aState)
	{
		var lStateName = aState.stn;
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

   	cp.GetNextOrPreviousState = function(item, aNextPrevious, aCurrentState )
	{
		if(!item)
			return aCurrentState;

		var lCurrStateIndex = aCurrentState;
		var lStates = item.states;
		switch (aNextPrevious)
		{
			case 0 : //GoToNextState
			{
				if(lCurrStateIndex < 0 || lCurrStateIndex >= lStates.length)
					return aCurrentState;
		
				var lNextCustomStateIndex = (lCurrStateIndex == lStates.length - 1) ? 0 : lCurrStateIndex + 1; //If current state is the last, next state will be the first(LOOPING)
				
				while(lNextCustomStateIndex < lStates.length && cp.isInbuiltState(lStates[lNextCustomStateIndex]))
					lNextCustomStateIndex++;

				if(lNextCustomStateIndex == lStates.length)
					return aCurrentState;
				
				return lNextCustomStateIndex;
			}
			break;

			case 1 : //GoToPreviousState
			{
				if(lCurrStateIndex < 0 || lCurrStateIndex >= lStates.length)
					return aCurrentState;
		
				var lPrevCustomStateIndex = (lCurrStateIndex == 0) ? (lStates.length - 1) : (lCurrStateIndex - 1);

				while(lPrevCustomStateIndex >= 0 && cp.isInbuiltState(lStates[lPrevCustomStateIndex]))
					lPrevCustomStateIndex--;

				if(lPrevCustomStateIndex < 0)
					return aCurrentState;
				
				return lPrevCustomStateIndex;
			}
			break;

			default:
				return aCurrentState;
		}
		return aCurrentState;
	}
	
	cp.GetNextOrPreviousStateOfItemNotPresent = function(aItemName, aCurrentStateName, aNextOrPrevious)
	{
		var retVal = -1;

		var lItemData = cp.D[aItemName];
		if(!lItemData)
			return retVal;

		var lStates = lItemData["stl"];

		for(var index = 0; index < lStates.length; ++index)
		{
			if(aCurrentStateName === lStates[index]["stn"])
			{
				retVal = index;

				switch (aNextOrPrevious)
				{
					case 0 : //GoToNextState
					{
						var lNextCustomStateIndex = (index == lStates.length - 1) ? 0 : index + 1; //If current state is the last, next state will be the first(LOOPING)
						
						while(lNextCustomStateIndex < lStates.length && cp.isInbuiltState(lStates[lNextCustomStateIndex]))
							lNextCustomStateIndex++;

						if(lNextCustomStateIndex == lStates.length)
							return retVal;
						
						return lNextCustomStateIndex;
					}
					break;

					case 1 : //GoToPreviousState
					{
						var lPrevCustomStateIndex = (index == 0) ? (lStates.length - 1) : (index - 1);

						while(lPrevCustomStateIndex >= 0 && cp.isInbuiltState(lStates[lPrevCustomStateIndex]))
							lPrevCustomStateIndex--;

						if(lPrevCustomStateIndex < 0)
							return retVal;
						
						return lPrevCustomStateIndex;
					}
					break;

					default:
					break;
				}
				return retVal;
			}
		}
		return retVal;
	}

	cp.setInitialVisibility = function(item)
	{
		if(!item)
			return;

		var statesList = [];
		var isBaseVisibleSet = true;
		var itemName = item.element.id;
		var currentState = -1;
		var itemData = cp.D[itemName];

		if(item.baseStateItemID === "undefined")
			return;

		if(item.initialState === "undefined")
			return;

		if(item.baseStateItemID == -1)
		{
			statesList = item.states;
			if(cp.D[itemName] && cp.D[itemName].visible)
				isBaseVisibleSet = cp.D[itemName].visible;
			currentState = item.currentState;
		}
		else
		{
			var baseItemID = item.baseStateItemID;
			var allObjects = cp.model.data;
			for (var index in allObjects)
			{
				var object = allObjects[index];
				if(object && object.uid && object.uid == baseItemID)
				{
					statesList = cp.D[object.dn].stl;
					isBaseVisibleSet = object.effectiveVi;
					currentState = cp.D[object.dn].stis;

					//Fix for bug#4082176:Responsive project>Text item doesn't retain its text on Slide revisit.
					var lbaseItemData = cp.D[object.dn];
					if(lbaseItemData)
					{
						if(lbaseItemData.hasOwnProperty("currentState") && lbaseItemData["currentState"] != -1)
						{
							currentState = lbaseItemData["currentState"];
						}
					}
					break;
				}
			}
		}

		if(statesList.length == 0 || currentState == -1)
			return;

		var partOfCurrentState = false;
		if(item.currentState < statesList.length)
		{
			var lCurrentState = statesList[currentState];
			if(lCurrentState)
			{
				var lCurrentStateItems = lCurrentState.stsi;
				for(var index=0; index<lCurrentStateItems.length; index++)
				{
					var stateItem = lCurrentStateItems[index];

					if(cp.D[itemName] && cp.D[itemName].uid && (stateItem == cp.D[itemName].uid))
					{
						partOfCurrentState = true
						break;
					}
				}
			}
		}

		item.visible = partOfCurrentState && isBaseVisibleSet;
		if(cp.D[itemName])
			cp.D[itemName].visible = item.visible;

		/*if(item.visible === true) //cp.Hide on any item hides its audio as well. If this item's audio was hidden, then unhide it here so that it could be played on frame enter.
		{
			if(itemData && itemData.ia)
			{
				cp.movie.am.showHideObjectAudio(itemData.ia, true);
			}
		}*/
	}

	cp.GetMouseOverManager = function()
	{
		if(!cp.movie.mouseOverManager)
		{
			cp.movie.mouseOverManager = new cp.MouseOverManager();
		}

		return cp.movie.mouseOverManager;
	}

	cp.handleMouseMoveNew = function(event)
	{
		var mouseOverMgr = cp.GetMouseOverManager();
		if(mouseOverMgr)
		{
			mouseOverMgr.handleMouseMove(event);
		}
	}

	cp.initializeDimensions = function(item, redrawRequired)
	{
		if(!item)
			return; 
		
		var displayNone = false;
		if(item.actualParent.style.display == "")
			displayNone = true;

		if(redrawRequired)
		{
			item.actualParent.style.display = "block";
			item.element.parentElement.style.display ="block";
			if(item.drawForResponsive)
				item.drawForResponsive(true);
		}

		var lTransform = item.element.parentElement.style['transform'] ||
						item.element.parentElement.style['msTransform'] ||
						item.element.parentElement.style['MozTransform'] ||
						item.element.parentElement.style['WebkitTransform'] ||
						item.element.parentElement.style['OTransform'];

		cp.applyTransform(item.element.parentElement,"");
		item.dimensions = item.element.parentElement.getBoundingClientRect();
		item.areDimensionsCalculated = true;
		cp.applyTransform(item.element.parentElement,lTransform);

		if(redrawRequired && displayNone)
		{
			item.actualParent.style.visibility = "hidden";
			item.element.parentElement.style.visibility ="hidden";
		}

	}

})(window.cp);