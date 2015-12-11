(function(cp){
	cp.clickHandler =function(div) 
	{ 
		var divdata = cp.D[div.id]; 
		cp.clickSuccessHandler(divdata);
	} 

	cp.ch = function(div)
	{
		return cp.clickHandler(div);
	}

	cp.wch = function(e)
	{
		return cp.HandleInteractiveWidget(e);
	}
	
	function getBaseStateItemData(obj) 
	{
		var retVal = obj;
		if(obj)
		{
			 // If it is clone of base State Item.
			if(obj.sicbs)
			{
				if(undefined !== obj.bstiid && -1 !== obj.bstiid)
					retVal = cp.D[cp.getDisplayObjNameByCP_UID(obj.bstiid)];
			}
		}
		return retVal;
	}

	cp.clickSuccessHandler = function(obj) 
	{ 
		var obj = getBaseStateItemData(obj);
		if (obj) 
		{ 
			if(obj.cpa == false)
				obj.clickedOnce = true; 
			var pauseSlideAudioOnClick = obj['ssc'];
			if(pauseSlideAudioOnClick)
				cp.movie.am.pauseCurrentSlideAudioForInteractiveClick();
			
			var clickAudio = obj['ca'];
			if(clickAudio)
				cp.movie.am.playPauseEventAudio(clickAudio, true);
			
			var successCaptionToBeShown = obj['osct']; 
			var successCaption = obj['osc']; 
			var action = obj['oca']; 
			var stateList = obj['stl'];
			if(stateList && stateList.length > 0)
			{
				for (var i = 0; i < stateList.length; i++)
				{
					var state = stateList[i];
					if(state && state['stt'] == cp.kSTTVisited)
					{
						var itemName = "";
						var stateName = state['stn'];
						if(obj.hasOwnProperty("dn"))
						{
							itemName = obj['dn'];
						}
						else
						{
							itemName = cp.D[obj['mdi']]['dn'];
						}
						cp.changeState(itemName, stateName);
					}
				}
			}
			var feedbackaction = null;
			var showfeedback = true;

            if (successCaption == undefined)
               showfeedback = false;

			if ((successCaption != undefined) && (successCaption.length < 2))
				showfeedback = false;

			if (successCaptionToBeShown && showfeedback) // Wait for feedback.
				feedbackaction = action;
			var pa = obj.pa;
			var pauseMovie = obj.pfc == 1 && successCaptionToBeShown;
			if (obj.handled)
				pauseMovie = false;
			var feedback = null;
			if (showfeedback)
				feedback = new cp.Feedback(successCaption, feedbackaction, pauseMovie, cp.FeedbackType.SUCCESS, obj);
			if ( ! successCaptionToBeShown || ! showfeedback)
				cp.movie.executeAction(action); 
			if (showfeedback)
				feedback.show();
			return true;
		}	 
		return false;
	} 

	cp.clickFailureHandler = function(obj,shouldExecuteAction,iCanShowFeedbackCaption) 
	{ 
        var retVal = false;
        var obj = getBaseStateItemData(obj);
		if (obj) 
		{ 
			// In case this has been handled and success action is continue, failure should not be executed.
			if ( obj.handled ) {
				var successStr = obj[ 'oca' ];
				if ( "cpCmndResume = 1;" == successStr )
					return true;
			}
			var failureCaptionToBeShown = obj['ofct']; 
			var failureCaption = obj['ofc']; 
			var action = obj['ofa']; 
			
			var showfeedback = iCanShowFeedbackCaption;
			if(!failureCaption || failureCaption.length < 2)
				showfeedback = false;

			var feedbackaction = null;
			if (failureCaptionToBeShown && shouldExecuteAction && showfeedback) 
				feedbackaction = action;

			var feedback = null;
			if (showfeedback)
				feedback = new cp.Feedback(failureCaption, feedbackaction, false, cp.FeedbackType.FAILURE, obj); // Failure feedback should not pause movie.
            retVal = true;        
			if ( (! failureCaptionToBeShown || ! showfeedback) && shouldExecuteAction)
			{
				if(obj.cpa == false)
					obj.clickedOnce = true; 
				cp.movie.executeAction(action); 
			}	
            else
                retVal = false;
			if (showfeedback)
				feedback.show();
            else
                retVal = false;			
		}	 
		
        return retVal;
	} 
	
	cp.cbKH = function(obj, objc, isCorrectKey)
	{
		if(!obj)
			return false;
		
		//if any state item is visible that means we can do key handling
		var stateList = obj['stl'];
		var isEnabledAndVisible = ((obj && obj.enabled) && (objc && objc.visible));
		if(isEnabledAndVisible == false && stateList && stateList.length>0)
		{
			for (var i = 0; i < stateList.length && !isEnabledAndVisible; i++)
			{
				var state = stateList[i];
				if(state)
				{
					var stateItems = state['stsi'];
					if(stateItems && stateItems.length>0)
					{
						for(var j =0; j < stateItems.length; j++)
						{
							var currObjID = stateItems[j];
							var objName = cp.getDisplayObjNameByCP_UID(currObjID);
							var currObj = cp.D[objName];
							var lItemCanvasObjKey = currObj['mdi'];
							var currObjc = cp.getDisplayObjByKey(lItemCanvasObjKey);
							isEnabledAndVisible = ((currObj && currObj.enabled) && (currObjc && currObjc.visible));
							if(isEnabledAndVisible == true)
								break;
						}
					}
				}
			}
		}

		// Check whether visible and enabled.
		if ( ! isEnabledAndVisible )
			return false;
	
		if ( obj.actionInProgress )
			return false;
			
		//Submit Interactions
		var lObjId;
		var lCurrentAttempt = 0;
		var retVal = false;
		
		var cAttempt = obj.currentAttempt;
		if (cAttempt != undefined)
			lCurrentAttempt = cAttempt;
		
		if(objc!=undefined)
			lObjId = objc.dn;
		
		if ( isCorrectKey ) {
			if(lObjId)
				cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.CORRECT, lCurrentAttempt);
			retVal = cp.clickSuccessHandler(obj);
			obj.handled = true;
			return retVal;
		}
		// Failure case.
		var maxAttempts = obj['ma'];
		lCurrentAttempt = lCurrentAttempt + 1;
		obj.currentAttempt = lCurrentAttempt;
		
		var shouldExecuteAction = (maxAttempts != -1 && lCurrentAttempt == maxAttempts);
		var lCanShowFeedbackCaption = (maxAttempts == -1 || lCurrentAttempt <= maxAttempts);
		if(lObjId)
			cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.INCORRECT, lCurrentAttempt-1);	
		retVal = cp.clickFailureHandler(obj, shouldExecuteAction, lCanShowFeedbackCaption);
		if ( ! obj.handled )
			obj.handled = (maxAttempts != -1 && lCurrentAttempt >= maxAttempts);;
		return retVal;
	}
	
	cp.qbKH = function(obj, objc, isCorrectKey)
	{
		if(!obj )
			return false;
		if( !objc)
			return false;		
		//if any state item is visible that means we can do key handling
		var stateList = obj['stl'];
		var isEnabledAndVisible = ( obj.enabled && objc.visible);
		if(isEnabledAndVisible == false && stateList && stateList.length>0)
		{
			for (var i = 0; i < stateList.length && !isEnabledAndVisible; i++)
			{
				var state = stateList[i];
				if(state)
				{
					var stateItems = state['stsi'];
					if(stateItems && stateItems.length>0)
					{
						for(var j =0; j < stateItems.length; j++)
						{
							var currObjID = stateItems[j];
							var objName = cp.getDisplayObjNameByCP_UID(currObjID);
							var currObj = cp.D[objName];
							var lItemCanvasObjKey = currObj['mdi'];
							var currObjc = cp.getDisplayObjByKey(lItemCanvasObjKey);
							isEnabledAndVisible = ((currObj && currObj.enabled) && (currObjc && currObjc.visible));
							if(isEnabledAndVisible == true)
								break;
						}
					}
				}
			}
		}
		
		// Check whether visible and enabled.
		if ( ! isEnabledAndVisible )
			return false;		
		var lQuestionButtonType = obj.qbt;
		if(!lQuestionButtonType)
			return false;
		if(!isCorrectKey)
			return false;
		var lDivName = objc.dn;
		if(!lDivName)
			return false;
		var lObjDiv =  document.getElementById(lDivName);
		if(!lObjDiv)
			return false;
		
		var retVal = false;
		switch(lQuestionButtonType)
		{
			case 'clear':
				{
					cp.quizClearButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;			
			case 'back':
				{
					cp.quizBackButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;			
			case 'skip':
				{
					cp.quizSkipButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;			
			case 'submit':
				{
					cp.quizSubmitButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;
			case 'submitAll':
				{
					cp.quizSubmitAllButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;
			case 'continue':
				{
					cp.quizContinueButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;
			case 'review':
				{
					cp.quizReviewButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;
			case 'retake':
				{
					cp.quizRetakeButtonClickHandler(lObjDiv);
					retVal = true;
				}
				break;
			case 'reviewModeNext':
                {
                    cp.quizReviewModeNextButtonClickHandler(lObjDiv);
                    retVal = true;
                }
				break;
            case 'reviewModeBack':
                {
                    cp.quizReviewModeBackButtonClickHandler(lObjDiv);
                    retVal = true;
                }
				break;
			default: break;
		}
		return retVal;
	}
	
	cp.isTEBValueCorrect = function( tebDivName, obj )
	{
		var isToBeValidated = obj.vuin;
		if ( ! isToBeValidated )
			return true; // always correct.
			
		var inputFieldName = tebDivName + '_inputField'; 
		var input = document.getElementById( inputFieldName );
		if ( ! input )
			return false;
			
		var currentValue = input.value;
		var expectedStrings = obj.exp || []; 
		var isCaseSensitive = obj.cs;
		var totalExpectedStrings = expectedStrings.length; 
		var isCorrect = false; 
		
		// Edge case.
		if ( 0 == totalExpectedStrings && '' == currentValue )
			return true; // Correct.
		
		for ( var i = 0; i < totalExpectedStrings && ! isCorrect; ++i ) { 
			if ( isCaseSensitive ) 
				isCorrect = ( currentValue == expectedStrings[ i ] ); 
			else 
				isCorrect = ( currentValue.toLowerCase() == expectedStrings[ i ].toLowerCase() ); 
		}		 
		
		return isCorrect;
	}
	
	cp.tebKH = function( obj, objc, isCorrectKey )
	{
		var isAnswerCorrect = false;
		var lCurrentAttempt = 0;
		var cAttempt;
		var maxAttempts = 1000;
		var shouldExecuteAction = false;
		var lObjId;
		
		if(!obj)
			return false;
		
		if ( objc && objc.keyHandledOnce ) {
			objc.keyHandledOnce = false;
			return false;
		}
		
		if ( ! isCorrectKey )
			return false;
			
		if ( obj && obj.handled )
			return false;
		
		//if any state item is visible that means we can do key handling
		var stateList = obj['stl'];
		var isEnabledAndVisible = ((obj && obj.enabled) && (objc && objc.visible));
		if(isEnabledAndVisible == false && stateList && stateList.length>0)
		{
			for (var i = 0; i < stateList.length && !isEnabledAndVisible; i++)
			{
				var state = stateList[i];
				if(state)
				{
					var stateItems = state['stsi'];
					if(stateItems && stateItems.length>0)
					{
						for(var j =0; j < stateItems.length; j++)
						{
							var currObjID = stateItems[j];
							var objName = cp.getDisplayObjNameByCP_UID(currObjID);
							var currObj = cp.D[objName];
							var lItemCanvasObjKey = currObj['mdi'];
							var currObjc = cp.getDisplayObjByKey(lItemCanvasObjKey);
							isEnabledAndVisible = ((currObj && currObj.enabled) && (currObjc && currObjc.visible));
							if(isEnabledAndVisible == true)
								break;
						}
					}
				}
			}
		}

		// Check whether visible and enabled.
		if ( ! isEnabledAndVisible )
			return false;

		cAttempt = obj.currentAttempt;
		if (cAttempt != undefined)
			lCurrentAttempt = cAttempt;
		
		if(objc!=undefined)
			lObjId = objc.dn;
		
		// Check whether answer is correct.
		isAnswerCorrect = cp.isTEBValueCorrect( obj.id, obj );
		
		if ( isAnswerCorrect ) {
			obj.handled = true;
			if(lObjId)
				cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.CORRECT, lCurrentAttempt);
			return cp.clickSuccessHandler( obj );
		}
		// Failure case.
		maxAttempts = obj[ 'ma' ];
		lCurrentAttempt = lCurrentAttempt +1;
		obj.currentAttempt = lCurrentAttempt;
		
		shouldExecuteAction = ( maxAttempts != -1 && lCurrentAttempt == maxAttempts );
		var lCanShowFeedbackCaption = ( maxAttempts == -1 || lCurrentAttempt <= maxAttempts );
		if ( ! obj.handled )
			obj.handled = ( maxAttempts != -1 && lCurrentAttempt >= maxAttempts );
		
		if(lObjId)
			cp.SubmitInteractions(lObjId, cp.QuestionStatusEnum.INCORRECT, lCurrentAttempt-1);
		return cp.clickFailureHandler( obj, shouldExecuteAction,lCanShowFeedbackCaption );		
	}
	
	cp.ClickData = function( obj, objc, htmlElem )
	{
		this.m_obj = obj;
		this.m_objc = objc;
		this.m_htmlElem = htmlElem;
		this.m_from = obj.from;
		this.m_to = obj.to;
	}
	
	cp.ClickData.prototype.isValid = function()
	{
		return undefined != this.m_obj && undefined != this.m_objc && undefined != this.m_htmlElem && (this.m_to >= this.m_from);
	}
	
	cp.ClickData.prototype.isClickable = function( currFrame )
	{
		if ( ! ( ( this.m_obj && this.m_obj.enabled ) && ( this.m_objc && this.m_objc.visible ) ) )
			return false;
		return this.m_from <= currFrame && currFrame <= this.m_to;
	}
		
	cp.ClickManager = function()
	{
		this.m_rightClickArr = [];
		this.m_doubleClickArr = [];
	}
	
	cp.ClickManager.prototype.addRightClick = function( obj, objc, htmlElem )
	{
		var data = new cp.ClickData( obj, objc, htmlElem );
		this.m_rightClickArr.push( data );
	}
		
	cp.ClickManager.prototype.addDoubleClick = function( obj, objc, htmlElem )
	{
		var data = new cp.ClickData( obj, objc, htmlElem );
		this.m_doubleClickArr.push( data );
	}
	
	cp.ClickManager.prototype.removeRightClick = function( obj )
	{
		var i = 0; 
		for ( i = 0; i < this.m_rightClickArr.length; ++i ) {
			if ( this.m_rightClickArr[ i ].m_obj == obj ) {
				this.m_rightClickArr.splice( i, 1 );
				return;
			}
		}
	}
	
	cp.ClickManager.prototype.removeDoubleClick = function( obj )
	{
		var i = 0; 
		for ( i = 0; i < this.m_doubleClickArr.length; ++i ) {
			if ( this.m_doubleClickArr[ i ].m_obj == obj ) {
				this.m_doubleClickArr.splice( i, 1 );
				return;
			}
		}
	}
		
	cp.ClickManager.prototype.clearClicks = function()
	{
		this.m_rightClickArr = [];
		this.m_doubleClickArr = [];
	}
	
	cp.ClickManager.prototype.getRightClickArr = function( currFrame )
	{
		var arr = new Array();
		var i = 0;
		for ( i = this.m_rightClickArr.length - 1; i >= 0; --i ) {
			if ( this.m_rightClickArr[ i ].isClickable( currFrame ) )
				arr.push( this.m_rightClickArr[ i ] );
		}
		return arr;
	}
	
	cp.ClickManager.prototype.getDoubleClickArr = function( currFrame )
	{
		var arr = new Array();
		var i = 0;
		for ( i = this.m_doubleClickArr.length - 1; i >= 0; --i ) {
			if ( this.m_doubleClickArr[ i ].isClickable( currFrame ) ) {
				arr.push( this.m_doubleClickArr[ i ] );			
			}
		}
		return arr;
	}

	cp.Shortcut = function(keyCode, isCtrl, isShift, isAlt)
	{
		this.m_keyCode = (undefined != keyCode) ? keyCode : null;
		this.m_isCtrl = (undefined != isCtrl && isCtrl) ? isCtrl : false;
		this.m_isShift = (undefined != isShift && isShift) ? isShift : false;
		this.m_isAlt = (undefined != isAlt && isAlt) ? isAlt : false;
	}
	
	cp.Shortcut.prototype.isValid = function()
	{
		return this.m_keyCode != undefined && this.m_keyCode != null;
	}
	
	cp.Shortcut.prototype.isSame = function( shortcut )
	{
		return this.m_keyCode == shortcut.m_keyCode
			&& this.m_isCtrl == shortcut.m_isCtrl
			&& this.m_isShift == shortcut.m_isShift
			&& this.m_isAlt == shortcut.m_isAlt;
	}
	
	cp.getShortCutFromKeyEvent = function( event )
	{
		// Update from event.
		var shift 	= 1 == event.shiftKey;
		var ctrl 	= 1 == event.ctrlKey;
		var alt 	= 1 == event.altKey ;
			
		return new cp.Shortcut( event.keyCode, ctrl, shift, alt );
	}
	
	cp.KeyHandler = function(handler, shortcut, startFrame, endFrame,name)
	{
		this.m_handler = handler;
		this.m_shortcut = null;
		if (shortcut instanceof cp.Shortcut)
			this.m_shortcut = shortcut;
		this.m_startFrame = startFrame;
		this.m_endFrame = endFrame;
        this.m_name = name;        
	}
	
	cp.KeyHandler.prototype.isValid = function()
	{
		return this.m_handler && this.m_shortcut;
	}
	
	cp.SHIFT = 16;
	cp.CONTROL = 17;
	cp.ALT	= 18;
	
	cp.KeyManager = function()
	{
		this.m_keys = [];
		this.m_ctrl = false;
		this.m_alt = false;
		this.m_shift = false;
		this.m_keyHandlers = [];
		this.m_prevKeyCode = false;
	}
	
	cp.KeyManager.prototype.handleKeyDown = function(event)
	{
		var self = this;
		
		function addKey(event) 
		{
			self.m_prevKeyCode = false;
			var handled = false;
			if (event.keyCode == cp.SHIFT) 
				handled = self.m_shift = true;
			else if (event.keyCode == cp.CONTROL) 
				handled = self.m_ctrl = true;
			else if (event.keyCode == cp.ALT) 
				handled = self.m_alt = true;
			
			// Update from event.
			self.m_shift = 1 == event.shiftKey;
			self.m_ctrl = 1 == event.ctrlKey;
			self.m_alt 	= 1 == event.altKey ;
			
			if (handled)
				return;
				
			for (var i = 0; i < self.m_keys.length; ++i)
			{
				if (event.keyCode == self.m_keys[ i ])
					return; // already there.
			}
			
			self.m_keys.push( event.keyCode );
		}
		
		addKey(event);
		//if (this.check(event))
			//event.preventDefault();
	}
	
	cp.KeyManager.prototype.handleKeyUp = function(event)
	{
		var self = this;
		
		function removeKey(event)
		{
			self.m_prevKeyCode  = true;
			var handled = false;
			if (event.keyCode == cp.SHIFT) {
				self.m_shift = false;
				handled = true;
			}
			else if (event.keyCode == cp.CONTROL) {
				self.m_ctrl = false;
				handled = true;
			}
			else if (event.keyCode == cp.ALT) {
				self.m_alt = false;
				handled = true;
			}
			
			// Update from event.
			self.m_shift = 1 == event.shiftKey;
			self.m_ctrl = 1 == event.ctrlKey;
			self.m_alt 	= 1 == event.altKey ;
			
			if (handled)
				return;
			
			for (var i = 0; i < self.m_keys.length; ++i)
			{
				if (event.keyCode == self.m_keys[ i ]) {
					self.m_keys.splice( i, 1 );
					return; 
				}
			}		
		}	
		this.check(event);
		removeKey(event);
	}

	cp.KeyManager.prototype.handleFocusOut = function(event)
	{
		this.m_keys = [];
		this.m_ctrl = false;
		this.m_alt = false;
		this.m_shift = false;
	}
	
	cp.KeyManager.prototype.check = function(event)
	{
		var keyHandler = null;
		var currFrame = cpInfoCurrentFrame;		
		var self = this;
		var i = 0;
		var matched = false;
		var firstHandler = null;

		function keyMatch( shortcut )
		{
			var bFound	= false;
			for (var i = 0; i < self.m_keys.length && ! bFound; ++i) {
				if (shortcut.m_keyCode == self.m_keys[ i ])
					bFound = true;
			}
			
			if (! bFound)
			{
				if(0 == shortcut.m_keyCode && self.m_keys.length == 0)
				{
					if(!self.m_prevKeyCode)	//Implies no other key was pressed along with shift/ctrl
					{
						if(shortcut.m_isCtrl && self.m_ctrl && !self.m_shift && !self.m_alt)
							return true;
						if(shortcut.m_isShift && self.m_shift && !self.m_ctrl && !self.m_alt)
							return true;
					}
				}
				return false;
			}
			return self.m_ctrl == shortcut.m_isCtrl
				&& self.m_shift ==  shortcut.m_isShift
				&& self.m_alt == shortcut.m_isAlt;
		}
		
		// First give to folks who were able to handle.
		for (i = 0; i < this.m_keyHandlers.length; ++i) {
			keyHandler	= this.m_keyHandlers[ i ];
			if (keyHandler.m_startFrame <= currFrame && keyHandler.m_endFrame >= currFrame) {
				matched =  keyMatch( keyHandler.m_shortcut );
				if ( matched ) {
					firstHandler = keyHandler;
					if ( keyHandler.m_handler( matched ) ) 
						return true; // handled.
					break;
				}
			}
		}
		
		// Now for false/unhandled case.
		for (i = 0; i < this.m_keyHandlers.length; ++i) {
			keyHandler	= this.m_keyHandlers[ i ];
			if ( firstHandler == keyHandler )
				continue; // This had already got it's chance.
            if ( keyHandler.m_shortcut.isValid() == false)
                continue;
			if (keyHandler.m_startFrame <= currFrame && keyHandler.m_endFrame >= currFrame) {
				if ( keyHandler.m_handler( false ) ) 
					return true; // handled.
			}
		}
		
           //check the element which is focussed
       
        var code;
        
        //find the keycode
        if (event.keyCode) 
            code = event.keyCode;
	    else if (event.which) 
            code = event.which;	   

        //now handle the object keys
        if ((code == 13) || (code == 32))
        {
            var targ;
            var elementname = '';

            //find the element
            if (event.target) 
                targ = event.target;
	        else if (event.srcElement) 
                targ = event.srcElement;
	
            if (targ.nodeType == 3)
		        targ = targ.parentNode;
        
            if (targ)
                elementname = targ.id;

            if (elementname != '')
            {
                //find the event handler for this object
                for (i = 0; i < this.m_keyHandlers.length; ++i) {
			        keyHandler	= this.m_keyHandlers[ i ];
			        if ( keyHandler.m_name != elementname )
				        continue; // This had already got it's chance.
			    
                    if (keyHandler.m_startFrame <= currFrame && keyHandler.m_endFrame >= currFrame) {
                        if ( keyHandler.m_handler( true ) ) 
					        return true; // handled.
                        }
			    
		        }
            }
        }

       
		
		return false;
	}
	
	cp.KeyManager.prototype.addHandler = function(keyHandler)
	{
		if (! keyHandler)
			return;
			
		if (keyHandler.isValid())
			this.m_keyHandlers.push( keyHandler );
	}
	
	cp.KeyManager.prototype.clearHandlers = function()
	{
		this.m_keyHandlers = [];
	}

	cp.MouseOverManager = function()
	{
		this.m_mouseOverItem = undefined;
		this.m_mouseOutHandler = undefined;
		this.m_TimerID = undefined;
	}

	cp.MouseOverManager.prototype.addMouseOverItem = function(item,iMouseOuthandler)
	{
		if(cp.DESKTOP !== cp.device)
			return;
		
		if(!iMouseOuthandler || !item)
			return;

		this.DoMouseOutOnCurrMouseOverItem();
		this.m_mouseOverItem = item;
		this.m_mouseOutHandler = iMouseOuthandler;
	}

	cp.MouseOverManager.prototype.removeMouseOverItem = function(item)
	{
		if(cp.DESKTOP !== cp.device)
			return;

		if(!item)
			return;

		if(this.m_mouseOverItem === item)
		{
			this.m_mouseOverItem = undefined;
			this.m_mouseOutHandler = undefined;
		}
	}

	cp.MouseOverManager.prototype.DoMouseOutOnCurrMouseOverItem = function()
	{
		if(cp.DESKTOP !== cp.device)
			return;

		if(undefined === this.m_mouseOverItem)
			return;

		if(this.m_mouseOutHandler)
		{
			this.m_mouseOutHandler();
		}

		this.m_mouseOverItem = undefined;
		this.m_mouseOutHandler = undefined;
	}

	cp.MouseOverManager.prototype.CheckIfCurrMouseOverItemIsHit = function(iHitItem)
	{
		if(cp.DESKTOP !== cp.device)
			return;

		var retVal = false;

		if(!iHitItem)
			return retVal;

		if(undefined === this.m_mouseOverItem)
			return retVal;

		if(this.m_mouseOverItem.actualParent)
		{
			var currMouseOverItemID = this.m_mouseOverItem.actualParent.id;		
			var hitItemBaseItemID = iHitItem.id;
			
			var hitItemData = cp.D[iHitItem.id];
			if(!hitItemData)
				return retVal;

			if(undefined !== hitItemData.bstiid && -1 !== hitItemData.bstiid)
				hitItemBaseItemID = cp.getDisplayObjNameByCP_UID(hitItemData.bstiid);
			
			retVal = (currMouseOverItemID === hitItemBaseItemID);
		}

		return retVal;
	}

	cp.MouseOverManager.prototype.handleMouseMove = function(event)
	{
		if(cp.DESKTOP !== cp.device)
			return;

		if(undefined === this.m_mouseOverItem)
		{
			if(undefined !== this.m_TimerID)
			{
				clearTimeout(this.m_TimerID);
				this.m_TimerID = undefined;
			}
			return;
		}

		var that = this;

		function getCurrHitItem()
		{
			var lScaledPosition = cp.getScaledPosition(getPageX(event), getPageY(event));
			var x = lScaledPosition.X - window.pageXOffset;
			var y = lScaledPosition.Y - window.pageYOffset;
			
			//x -= cp.movie.offset;
			//y -= cp.movie.topOffset;
			var currDiv = cp("div_Slide");//e.currentTarget;
			var children = currDiv.childNodes;
			
			for(var i=children.length - 1; i >= 0; --i)
			{
				var currElement = children[i];
				if(currElement.nodeName != 'DIV')
					continue;
				if(currElement.style.display != 'block')
					continue;

				currElementDivData = cp.D[currElement.id];
				if(!currElementDivData)
					continue;
				var canvasItem = currElementDivData['mdi'];
				if(!cp.D[canvasItem].visible)
					continue;
				
				var drawingItemForCurrElement = currElementDivData['mdi'];
				drawingItemDivData = cp.D[drawingItemForCurrElement];
							
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
					return currElement;
				}
			}

			return undefined;
		}

		function onMouseStop()
		{
			that.m_TimerID = undefined;
			if(undefined !== that.m_mouseOverItem)
			{
				var currHitDiv = getCurrHitItem();
				if(undefined !== currHitDiv)
				{
					var bMouseOverItemHit = that.CheckIfCurrMouseOverItemIsHit(currHitDiv);
					if(false == bMouseOverItemHit)
					{
						that.DoMouseOutOnCurrMouseOverItem();
					}
				}
			}
		}

		if(undefined !== this.m_TimerID)
		{
			clearTimeout(this.m_TimerID);
			this.m_TimerID = undefined;
		}
		this.m_TimerID = setTimeout(onMouseStop,300);
	}

})(window.cp);