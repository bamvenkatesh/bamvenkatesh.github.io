(function(cp)
{	
	window['vh'] = {};
	function getMobileOS()
	{
		var lIsMobileDevice = (cp.device != cp.DESKTOP);
		var lDevicesUserAgents = ["blackberry","symbian","smartphone","windows ce","windows phone","webos"];
		var lDeviceUserAgentString = navigator.userAgent.toLowerCase();
		var lDeviceOS = "other";
		for(var i=0; i < lDevicesUserAgents.length; ++i)
		{	
			if(lDeviceUserAgentString.indexOf(lDevicesUserAgents[i]) != -1)
			{
				lIsMobileDevice = true;
				lDeviceOS = lDevicesUserAgents[i];
				lDeviceOS = lDeviceOS.split(" ").join("_");
			}
		}
		if(lIsMobileDevice)
		{
			switch(cp.device)
			{
				case cp.IDEVICE: return 1;
				case cp.ANDROID: return 2;
				default: return lDeviceOS;
			}	
		}
		else
			return 0;
	}

	function getCaptivateVersion()
	{
		if(vh._CaptivateVersion)
			return vh._CaptivateVersion;
		else
			return '';
	}
	
	function createInternalVariable(variableName,variableValue)
	{
		vh['_' + variableName] = variableValue;
	}
	
	function StoreVariableValue(variableName,variableValue)
	{
		var lOldValue = null;
		if(variableName && variableName != '')
		{
			var lVarName = '_' + variableName;
			lOldValue = vh[lVarName];
			if(lOldValue !== variableValue)
			{
				vh[lVarName] = variableValue;
			}
		}
		return lOldValue;
	}
	
	/*Full Name : setVariableValueImpl*/
	window["svvi"] = function(variableName,variableValue,notifyNames)
	{
		var lOldValue = null;
		
		if(variableName != '')
		{
			lOldValue = StoreVariableValue(variableName,variableValue);
			if(cp.em && lOldValue != variableValue)
			{
				var evtArgs = {
					captivateVersion:getCaptivateVersion(),
					varName:variableName,
					oldVal:lOldValue,
					newVal:variableValue,
					notify:notifyNames
				};
				cp.em.fireEvent('CPVariableValueChangedEvent', evtArgs);
			}
		}
		else
		{
			if(cp.em)
			{
				var evtArgs = {
					captivateVersion:getCaptivateVersion(),
					varName:'',
					newVal:variableValue,
					notify:notifyNames
				};
				cp.em.fireEvent('CPVariableValueChangedEvent', evtArgs);
			}
		}
	}
	
	function getCpCmndVolume()
	{
		return vh._cpCmndVolume;
	}
	
	function setCpCmndVolume(aVolume)
	{
		var lValueForNativeElements = aVolume/100;
		if(lValueForNativeElements < 0)
		{
			lValueForNativeElements = 0;
		}
		if(lValueForNativeElements > 1)
		{
			lValueForNativeElements = 1;
		}
		
		cp.movie.am.setVolume(lValueForNativeElements);
		cp.movie.vdm.setVolume(lValueForNativeElements);
		svvi('cpCmndVolume',aVolume,['cpCmndVolume']);
	}
	
	function setCpCmndMute(aMute)
	{
		cp.movie.am.mute(aMute);
		cp.movie.vdm.mute(aMute);
		cp.em.fireEvent('CPMovieAudioMute',cp.movie.am.muted);
		svvi("cpCmndMute",aMute,['cpCmndMute', 'rdcmndMute']);
	}
	
	function getCpCmndMute()
	{
		return vh._cpCmndMute;
	}
	
	function getCpCmndPlaybarMoved()
	{
		return vh._cpCmndPlaybarMoved;
	}
	
	function setCpCmndPlaybarMoved(aMoved)
	{
		svvi("cpCmndPlaybarMoved",aMoved,['cpCmndPlaybarMoved', 'rdcmndPlaybarMoved']);
	}
	
	function getCpCmndShowPlaybar()
	{
		return vh._cpCmndShowPlaybar;
	}
	
	function setCpCmndShowPlaybar(inShow)
	{
		var lQuizController = undefined;
		if(cp.movie && cp.movie.playbackController)
			lQuizController = cp.movie.playbackController.GetQuizController();	
		//Dont show playbar if branch Aware is ON
		/*if(inShow)
		{			 
			if(lQuizController && lQuizController.GetQuizBranchAware())
			{
				lQuizController.m_showPlaybar = false;
				return;
			}
		}		
		*/
		if(lQuizController)
			lQuizController.m_showPlaybar = inShow;

		if((!!inShow) === (!!cpCmndShowPlaybar))
			return;
		
		var playbar = document.getElementById("playbar");
		if(playbar != undefined)
		{
			var lPlaybarFirstChild = document.getElementById('playbarBkGrnd');
			if(lPlaybarFirstChild)
			{
				if(!inShow)
				{
					playbar.style.display = "none";						
					lPlaybarFirstChild.style.visibility = 'hidden';
				}
				else
				{
					playbar.style.display = "block";
					lPlaybarFirstChild.style.visibility = 'visible';
				}
			}
			cp.adjustSkins();
		}
		svvi("cpCmndShowPlaybar",inShow,['cpCmndShowPlaybar']);
		var evtArgs	=	{
							visible:!!inShow,
							locked:false
						};
		cp.em.fireEvent('CPPlaybarStateChanged', evtArgs);
	}

	
	function getCpCmndCC()
	{	
		return vh._cpCmndCC;
	}
	
	function setCpCmndCC(aCC)
	{
		if(aCC){
			cp.movie.cc.style.visibility = '';
			if(cp.movie.cc.style.pointerEvents != 'auto')
			{
				cp.movie.cc.style.pointerEvents = 'auto';
			}
		}
		else
			cp.movie.cc.style.visibility = 'hidden';
		svvi("cpCmndCC",aCC,['cpCmndCC', 'rdcmndCC']);
	}
	
	function getCpCmndRewindAndPlay()
	{	
		return vh._cpCmndRewindAndPlay;
	}
	
	function setCpCmndRewindAndPlay(aRewindAndPlay)
	{
		if(aRewindAndPlay)
			cp.movie.rewind();
		svvi("cpCmndRewindAndPlay",aRewindAndPlay,['cpCmndRewindAndPlay', 'rdcmndRewindAndPlay']);
	}

	function getCpCmndRewindAndStop()
	{	
		return vh._cpCmndRewindAndStop;
	}
	
	function setCpCmndRewindAndStop(aRewindAndStop)
	{
		if(aRewindAndStop)
		{
			cp.movie.jumpToFrame(1);
			cp.movie.pause(cp.ReasonForPause.MOVIE_REWIND_STOP);
		}
		svvi("cpCmndRewindAndStop",aRewindAndStop,['cpCmndRewindAndStop', 'rdcmndRewindAndStop']);
	}	
	
	function getCpCmndPreviousSlide()
	{	
		return vh._cpCmndPreviousSlide;
	}
	
	function setCpCmndPreviousSlide(aPrevious)
	{
		if(aPrevious)
		{
			cp.jumpToPreviousSlide();
		}
		svvi("cpCmndPreviousSlide",aPrevious,['cpCmndPreviousSlide', 'cpCmndPrevious', 'rdcmndPreviousSlide', 'rdcmndPrevious']);
	}
	
	function setCpCmndPreviousOnReview(aPrevious)
	{
		if(!aPrevious)
			return;		
		if(!cp.movie)
			return;
		
		var lPreviousSlide = -1;
		var lIsInReviewMode = false;
		if(cp.movie.playbackController)
		{
		 	var lQuizController = cp.movie.playbackController.GetQuizController();	
			lIsInReviewMode = lQuizController && lQuizController.GetIsInReviewMode();
		
			if(lIsInReviewMode) 
				lPreviousSlide = lQuizController.GetPreviousQuestionSlideNumber();
		}
		if(lIsInReviewMode && (lPreviousSlide >= 0))
			cpCmndGotoSlideAndResume = lPreviousSlide;				
		else
			cpCmndPreviousSlide = aPrevious;	
	}

	function getCpCmndResume()
	{	
		//return vh._cpCmndResume;
		return !cp.movie.paused;
	}
	
	function setCpCmndResume(aCmndResume)
	{
		if(aCmndResume)
		{
			cp.movie.play();
		}
		svvi("cpCmndResume",aCmndResume,['cpCmndResume', 'rdcmndResume']);
	}
	
	function setCpCmndNextOnReview(aVal)
	{
		if(!aVal)
			return;		
			
		if(!cp.movie)
			return;
		
		var lNextSlide = -1;
		var lIsInReviewMode = false;
		if(cp.movie.playbackController)
		{
		 	var lQuizController = cp.movie.playbackController.GetQuizController();	
			lIsInReviewMode = lQuizController && lQuizController.GetIsInReviewMode();
		
			if(lIsInReviewMode) 
				lNextSlide = lQuizController.GetNextQuestionSlideNumber();
		
			
		}
		if(lIsInReviewMode && (lNextSlide >= 0))
			cpCmndGotoSlideAndResume = lNextSlide;				
		else
			cpCmndNextSlide = aVal;	
	}
	
	function setCpCmndGotoFrame(aFrameNum)
	{
		var lIsPlaying = !cp.movie.paused;
		cp.movie.pause(cp.ReasonForPause.CPCMNDGOTOFRAME);
		if(!cp.movie.jumpToFrame(aFrameNum))
		{
			if(lIsPlaying)
				cp.movie.play();
			
			return;
		}
		svvi("",aFrameNum,['cpCmndGotoFrame', 'rdcmndGotoFrame']);
	}
	
	function setCpCmndGotoFrameAndResume(aFrameNum)
	{
		cp.movie.jumpToFrame(aFrameNum);
		cp.movie.play();
		svvi("",aFrameNum,['cpCmndGotoFrameAndResume', 'rdcmndGotoFrameAndResume']);
	}
	
	function setCpCmndGotoSlide(aSlide)
	{
		if( aSlide < 0 || aSlide >= cp.movie.stage.slides.length)
		{
			cpCmndResume = true;
			return;
		}
			
		var slideName = cp.movie.stage.slides[aSlide];
		var slideData = cp.D[slideName];
		if(slideData)
		{
			cp.movie.jumpToFrame(slideData.from);
		}
		svvi("",aSlide,['cpCmndGotoSlide', 'rdcmndGotoSlide']);
	}
			
	function setCpCmndFastForward(aVal)
	{
		var oldSpeed = cp.movie.speed;
		
		switch(cp.movie.speed)
		{
			case 1:
			case 2:
				cp.movie.speed *=2;
				break;
			case 4:
			default:
				cp.movie.speed = 1;
				break;
		}
		
		if(oldSpeed == cp.movie.speed)
			return;
		
		cp.movie.resetFPS();
		
		if(1 == cp.movie.speed)
		{
			cp.movie.am.seekTo(cpInfoCurrentFrame);
			cp.movie.vdm.seekTo(cpInfoCurrentFrame, false);
		}
		else
		{
			cp.movie.am.pause(cp.ReasonForPause.PLAYBAR_ACTION);
			//TODO::video speed up. But SWF output merely mutes the audio (including Video's audio) and lets video play in its own pace!!
		}
		
		if(IsRegisteredForUpdateTimeBasedSystemVariables())
		{
			UnregisterForUpdateTimeBasedSystemVariables();
			RegisterForUpdateTimeBasedSystemVariables();
		}
		
		svvi("",cpInfoFPS,["cpInfoFPS", "rdinfoFPS"]);
		svvi("cpCmndFastForward",aVal,['cpCmndFastForward']);
	}
	
	function setCpLockTOC(aVal)
	{
		svvi("cpLockTOC",aVal,['cpLockTOC']);
		var evtArgs	=	{
							visible:!!cpCmndTOCVisible,
							locked:!!aVal
						};
		cp.em.fireEvent('CPTocStateChanged', evtArgs);
	}
	
	function getCpLockTOC()
	{
		return vh._cpLockTOC;
	}
	
	function setCpCmndTOCVisible(aVal)
	{
		var toc = document.getElementById('toc');
		if(toc!=undefined && cp.D.tocProperties.overlay)
		{
			if(toc.animator)
			{
				if(aVal)
					toc.animator.showTOC();
				else
					toc.animator.hideTOC();	
			}
			if(cp.IsRunningInACAP)
			{
				cp.ACAPTOCVisibility = aVal;
			}
			
			svvi("cpCmndTOCVisible",aVal,['cpCmndTOCVisible']);
			var evtArgs	=	{
								visible:!!aVal,
								locked:!!cpLockTOC
							};
			cp.em.fireEvent('CPTocStateChanged', evtArgs);
		}
	}
	
	function getCpCmndTOCVisible(aVal)
	{
		var toc = document.getElementById('toc');
		if(toc!=undefined && toc.animator)
		{		
			return toc.animator.isVisible();
		}
		else if(cp.IsRunningInACAP && cp.ACAPTOCVisibility != undefined)
		{
			return cp.ACAPTOCVisibility;
		}
		return false;
	}
	
	function setCpCmndGotoSlideAndResume(aSlide)
	{
		if( aSlide < 0 || aSlide >= cp.movie.stage.slides.length)
		{
			cpCmndResume = true;
			return;
		}
			
		var slideName = cp.movie.stage.slides[aSlide];
		var slideData = cp.D[slideName];
		if(slideData)
		{
			cp.movie.jumpToFrame(slideData.from);
			cp.movie.play();
		}
		svvi("",aSlide,['cpCmndGotoSlideAndResume']);
	}
	
	function setCpCmndGotoSlideByUIDAndResume(aSlide)
	{
		var slideName = 'Slide'+aSlide;
		var slideData = cp.D[slideName];
		if(slideData)
		{
			cp.movie.jumpToFrame(slideData.from);
			cp.movie.play();
			svvi("",aSlide,['cpCmndGotoSlideByUIDAndResume']);
		}
	}
	
	function getCpCmndExit()
	{
		return vh._cpCmndExit;
	}
	
	function setCpCmndExit(aVal)
	{
		svvi("cpCmndExit",aVal, ['cpCmndExit', 'rdcmndExit']);
		if(DoCPExit)
			DoCPExit();
		//TODO::look at //captivate\titan\dev\source\components\publish\swfpublish\flash\src\main\com\adobe\captivate\main\cpMovieController.as exit() and implement relevant equivalent code here
	}
	
	function setCpCmndNextSlide(aVal)
	{
		if(aVal)
		{
			cp.jumpToNextSlide();
		}
		svvi("cpCmndNextSlide",aVal, ['cpCmndNextSlide', 'cpCmndNext', 'rdcmndNextSlide', 'rdcmndNext']);
	}
	
	function setCpCmndPause(aVal)
	{
		if(aVal)
		{
			cp.movie.pause(cp.ReasonForPause.CPCMNDPAUSE);
		}
		svvi("cpCmndPause",aVal, ['cpCmndPause', 'rdcmndPause']);
	}
	
	function getCpCmndPause()
	{
		//return vh._cpCmndPause;
		return cp.movie.paused;
	}
	
	function setCpCmndInfo(aVal)
	{
		svvi("cpCmndInfo",aVal, ['cpCmndInfo', 'rdcmndInfo']);
		
		/*//TODO::impl
		if(aVal)
		{
			m_MovieController.doShowInfo();
		}*/
	}
	
	function getCpCmndInfo()
	{
		return vh._cpCmndInfo;
	}
	
	function getCpInfoAuthor()
	{
		return vh._cpInfoAuthor;
	}
	
	function getCpInfoDescription()
	{
		return vh._cpInfoDescription;
	}
	
	function getCpQuizInfoLastSlidePointScored()
	{
		return vh._cpQuizInfoLastSlidePointScored;
	}
	
	function setCpQuizInfoLastSlidePointScored( iVal )
	{
		svvi("cpQuizInfoLastSlidePointScored",iVal,['cpQuizInfoLastSlidePointScored']);
	}
	
	function getCpQuizInfoPointsPerQuestionSlide()
	{
		return vh._cpQuizInfoPointsPerQuestionSlide;
	}
	
	function setCpQuizInfoPointsPerQuestionSlide( iVal )
	{
		svvi("cpQuizInfoPointsPerQuestionSlide",iVal,['cpQuizInfoPointsPerQuestionSlide']);
	}
	
	function getCpQuizInfoNegativePointsOnCurrentQuestionSlide()
	{
		return vh._cpQuizInfoNegativePointsOnCurrentQuestionSlide;
	}
	
	function setCpQuizInfoNegativePointsOnCurrentQuestionSlide( iVal )
	{
		svvi("cpQuizInfoNegativePointsOnCurrentQuestionSlide",iVal,['cpQuizInfoNegativePointsOnCurrentQuestionSlide']);
	}
	
	function getCpQuizInfoQuestionPartialScoreOn()
	{
		return !!vh._cpQuizInfoQuestionPartialScoreOn;
	}
	
	function setCpQuizInfoQuestionPartialScoreOn( iVal )
	{
		svvi("cpQuizInfoQuestionPartialScoreOn",iVal,['cpQuizInfoQuestionPartialScoreOn']);
	}
	
	function getCpInfoCurrentSlideLabel()
	{
		return vh._cpInfoCurrentSlideLabel;
	}
	
	function setCpInfoCurrentSlideLabel(aLabel)
	{
		svvi("cpInfoCurrentSlideLabel",aLabel,['cpInfoCurrentSlideLabel']);
	}

	function getCpQuizInfoQuizPassPercent()
	{
		return vh._cpQuizInfoQuizPassPercent;
	}
	
	function setCpQuizInfoQuizPassPercent( iVal )
	{
		svvi("cpQuizInfoQuizPassPercent",iVal,['cpQuizInfoQuizPassPercent']);
	}

	function getCpQuizInfoTotalProjectPoints()
	{
		return vh._cpQuizInfoTotalProjectPoints;
	}

	function setCpQuizInfoTotalProjectPoints( iVal )
	{
		svvi("cpQuizInfoTotalProjectPoints",iVal,["cpQuizInfoTotalProjectPoints"]);
	}

	function getCpInfoPrevSlide()
	{
		return vh._cpInfoPrevSlide;
	}
	
	function setCpInfoPrevSlide(aPrevSlide)
	{
		svvi("cpInfoPrevSlide",aPrevSlide,['cpInfoPrevSlide']);
	}
	
	function getCpQuizInfoTotalCorrectAnswers()
	{
		if(!cp.movie)
			return 0;
		if(cp.movie.playbackController)
		{		
			var lQuizController = cp.movie.playbackController.GetQuizController();
			if(lQuizController)
				return lQuizController.GetTotalCorrectQuestions();
		}
		return 0;
	}
	
	function setCpQuizInfoTotalCorrectAnswers( iVal)
	{
		svvi("cpQuizInfoTotalCorrectAnswers",iVal,["cpQuizInfoTotalCorrectAnswers"]);
	}
	
	function getCpQuizInfoPreTestTotalCorrectAnswers()
	{
		if(!cp.movie)
			return 0;
		if(cp.movie.playbackController)
		{		
			var lQuizController = cp.movie.playbackController.GetQuizController();
			if(lQuizController)
				return lQuizController.GetTotalPretestCorrectQuestions();
		}
		return 0;
	}
	
	function setCpQuizInfoPreTestTotalQuestions( iVal)
	{
		svvi("cpQuizInfoPreTestTotalQuestions",iVal,["cpQuizInfoPreTestTotalQuestions"]);
	}
	
	function getCpQuizInfoPreTestTotalQuestions()
	{
		return vh._cpQuizInfoPreTestTotalQuestions;
	}
	
	function setCpQuizInfoPreTestTotalCorrectAnswers( iVal)
	{
		svvi("cpQuizInfoPreTestTotalCorrectAnswers",iVal,["cpQuizInfoPreTestTotalCorrectAnswers"]);
	}
	
	function getCpInfoPercentage()
	{
		if(!cp.movie)
			return 0;
		if(cp.movie.playbackController)
		{
			var lQuizController = cp.movie.playbackController.GetQuizController();	
			if(lQuizController)
			{
				var lScore = lQuizController.GetScore();
				var lMaxScore = lQuizController.GetMaxScore();
				if(lMaxScore != 0)
					return Math.round((lScore*100)/lMaxScore);
						}
		}
		return 0;			
	}
	
	function setCpInfoPercentage( iVal)
	{
		svvi("cpInfoPercentage",iVal,["cpInfoPercentage"]);
	}
	
	function getCpQuizInfoTotalQuestionsPerProject()
	{
		return vh._cpQuizInfoTotalQuestionsPerProject;
	}
	
	function setCpQuizInfoTotalQuestionsPerProject( iVal)
	{
		svvi("cpQuizInfoTotalQuestionsPerProject",iVal,["cpQuizInfoTotalQuestionsPerProject"]);
	}
	
	function getCpQuizInfoQuizPassPoints()
	{
		return vh._cpQuizInfoQuizPassPoints;
	}
	
	function setCpQuizInfoQuizPassPoints( iVal )
	{
		svvi("cpQuizInfoQuizPassPoints",iVal,["cpQuizInfoQuizPassPoints"]);
	}
	
	function getCpQuizInfoQuestionSlideType()
	{
		return vh._cpQuizInfoQuestionSlideType;
	}
	
	function setCpQuizInfoQuestionSlideType(inStr)
	{
		svvi("cpQuizInfoQuestionSlideType",inStr,["cpQuizInfoQuestionSlideType"]);
	}

	function getCpQuizInfoTotalUnansweredQuestions()
	{
		if(!cp.movie || !cp.movie.playbackController)
			return 0;
		
		var lRetVal = cp.movie.playbackController.GetTotalUnansweredQuestions();
		return lRetVal;
	}
	
	function setCpQuizInfoTotalUnansweredQuestions( iVal )
	{
		svvi("cpQuizInfoTotalUnansweredQuestions",iVal,["cpQuizInfoTotalUnansweredQuestions"]);
	}
	
	function getCpInfoLastVisitedSlide()
	{
		return vh._cpInfoLastVisitedSlide;
	}
	
	function setCpInfoLastVisitedSlide(aSlide)
	{
		svvi("cpInfoLastVisitedSlide",aSlide,["cpInfoLastVisitedSlide"]);
	}
	
	function getCpQuizInfoMaxAttemptsOnCurrentQuestion()
	{
		return vh._cpQuizInfoMaxAttemptsOnCurrentQuestion;
	}
	
	function setCpQuizInfoMaxAttemptsOnCurrentQuestion( iVal)
	{
		svvi("cpQuizInfoMaxAttemptsOnCurrentQuestion",iVal,["cpQuizInfoMaxAttemptsOnCurrentQuestion"]);
	}
	
	function getCpQuizInfoQuestionSlideTiming()
	{
		return vh._cpQuizInfoQuestionSlideTiming;
	}
	
	function setCpQuizInfoQuestionSlideTiming( iVal )
	{
		svvi("cpQuizInfoQuestionSlideTiming",iVal,["cpQuizInfoQuestionSlideTiming"]);
	}
	
	function getCpInfoCompany()
	{
		return vh._cpInfoCompany;
	}
	function getCpQuizInfoAnswerChoice()
	{
		return vh._cpQuizInfoAnswerChoice;
	}
	function setCpQuizInfoAnswerChoice( iVal )
	{
		svvi("cpQuizInfoAnswerChoice",iVal,["cpQuizInfoAnswerChoice"]);
	}
	function getCpQuizInfoNoQuestionsPerQuiz()
	{
		return vh._cpQuizInfoNoQuestionsPerQuiz;
	}
	
	function setCpQuizInfoNoQuestionsPerQuiz( iVal )
	{
		svvi("cpQuizInfoNoQuestionsPerQuiz",iVal,["cpQuizInfoNoQuestionsPerQuiz"]);
	}
	
	function getCpQuizInfoPointsscored()
	{
		if(!cp.movie)
			return 0;
		if(cp.movie.playbackController)
		{
			var lQuizController = cp.movie.playbackController.GetQuizController();	
			if(lQuizController)
				return lQuizController.GetScore();
		}	
		return 0;
	}
	
	function setCpQuizInfoPointsscored( iVal )
	{
		svvi("cpQuizInfoPointsscored",iVal,["cpQuizInfoPointsscored"]);
	}

	function getCpInfoCopyright()
	{
		return vh._cpInfoCopyright;
	}
	
	function getCpInfoWebsite()
	{
		return vh._cpInfoWebsite;
	}
			
	function getCpInfoProjectName()
	{
		return vh._cpInfoProjectName;
	}
	
	function getCpInfoEmail()
	{
		return vh._cpInfoEmail;
	}
	 
	function getCpInfoIsStandalone()
	{
		return false;
	}
	
	function getCpInfoHasPlaybar()
	{
		return vh._cpInfoHasPlaybar;
	}
	
	function getCpQuizInfoAttempts()
	{
		return vh._cpQuizInfoAttempts;
	}
	
	function setCpQuizInfoAttempts( iVal )
	{
		svvi("cpQuizInfoAttempts",iVal,["cpQuizInfoAttempts"]);
	}
	
	function getCpInfoFrameCount()
	{
		return cp.D.project_main.to;
	}
	
	function getCpQuizInfoTotalQuizPoints()
	{
		return vh._cpQuizInfoTotalQuizPoints;
	}
	function setCpQuizInfoTotalQuizPoints( iVal)
	{
		svvi("cpQuizInfoTotalQuizPoints",iVal,["cpQuizInfoTotalQuizPoints"]);
	}

	var timeBasedVarsUpdateIntervalID = 0;

	function leftPadWithZeroIfNeeded(num)
	{
		var retVal = '' + num;
		if(num >= 0 && num < 10)
			retVal = '0' + retVal;
			
		return retVal;
	}
	
	function UpdateTimeBasedSystemVariables( )
	{
		var lDate = new Date();
		
		if(vh._cpInfoEpochMS != lDate.getTime())
		{
			svvi("cpInfoEpochMS",lDate.getTime() ,["cpInfoEpochMS"]);
		}
		
		if(vh._cpInfoElapsedTimeMS != (cpInfoEpochMS - cp.movie.startTime))
		{
			svvi("cpInfoElapsedTimeMS", cpInfoEpochMS - cp.movie.startTime ,["cpInfoElapsedTimeMS"]);
		}
		
		if(vh._cpInfoCurrentMinutes != lDate.getMinutes())
		{
			svvi("cpInfoCurrentMinutes", lDate.getMinutes(), ["cpInfoCurrentMinutes"]);
		}

		if(vh._cpInfoCurrentHour != lDate.getHours())
		{
			svvi("cpInfoCurrentHour", lDate.getHours(), ["cpInfoCurrentHour"]);
		}
		
		var currentTime = (lDate.getHours() + ":" + leftPadWithZeroIfNeeded(lDate.getMinutes()) + ":" + leftPadWithZeroIfNeeded(lDate.getSeconds()));
		if(vh._cpInfoCurrentTime != currentTime)
		{
			svvi("cpInfoCurrentTime", currentTime, ["cpInfoCurrentTime"]);
		}
		
		if(vh._cpInfoCurrentDay != lDate.getDay() + 1)
		{
			svvi("cpInfoCurrentDay", lDate.getDay() + 1, ["cpInfoCurrentDay"]);
		}
		
		if(vh._cpInfoCurrentYear != lDate.getFullYear())
		{
			svvi("cpInfoCurrentYear", lDate.getFullYear(), ["cpInfoCurrentYear"]);
		}
		
		if(vh._cpInfoCurrentMonth != lDate.getMonth() + 1)
		{
			svvi("cpInfoCurrentMonth", leftPadWithZeroIfNeeded(lDate.getMonth() + 1),["cpInfoCurrentMonth"]);
		}
		
		if(vh._cpInfoCurrentDate != lDate.getDate())
		{
			svvi("cpInfoCurrentDate", leftPadWithZeroIfNeeded(lDate.getDate()), ["cpInfoCurrentDate"]);
		}
		
		var dateString = (lDate.getMonth() + 1) + "/" + lDate.getDate() + "/" + lDate.getFullYear();
		if(vh._cpInfoCurrentDateString != dateString)
		{
			svvi("cpInfoCurrentDateString", dateString , ["cpInfoCurrentDateString"]);
		}
		
		var dateString1 = lDate.getDate() + "/" + (lDate.getMonth() + 1) + "/" + lDate.getFullYear();
		if(vh._cpInfoCurrentDateStringDDMMYYYY != dateString1)
		{
			svvi("cpInfoCurrentDateStringDDMMYYYY", dateString1 , ["cpInfoCurrentDateStringDDMMYYYY"]);
		}
		
		var dateString2 = lDate.toLocaleDateString();
		if(vh._cpInfoCurrentLocaleDateString != dateString2)
		{
			svvi("cpInfoCurrentLocaleDateString", dateString2 , ["cpInfoCurrentLocaleDateString"]);
		}
		
	}
	
	function IsRegisteredForUpdateTimeBasedSystemVariables()
	{
		return (timeBasedVarsUpdateIntervalID != 0);
	}
	
	function RegisterForUpdateTimeBasedSystemVariables()
	{
		if(0 == timeBasedVarsUpdateIntervalID)
		{
			UpdateTimeBasedSystemVariables();
			timeBasedVarsUpdateIntervalID = setInterval(UpdateTimeBasedSystemVariables, 1000/cpInfoFPS);
		}
	}
	
	function UnregisterForUpdateTimeBasedSystemVariables()
	{
		if(0 != timeBasedVarsUpdateIntervalID)
		{
			clearInterval(timeBasedVarsUpdateIntervalID);
			timeBasedVarsUpdateIntervalID = 0;
		}
	}
	
	function getCpInfoCurrentDateString()
	{
		return vh._cpInfoCurrentDateString;
	}
	
	function getCpInfoCurrentDateStringDDMMYYYY()
	{
		return vh._cpInfoCurrentDateStringDDMMYYYY;
	}
	
	function getCpInfoCurrentLocaleDateString()
	{
		return vh._cpInfoCurrentLocaleDateString;
	}
	
	function getCpInfoCurrentDate()
	{
		return vh._cpInfoCurrentDate;
	}
	
	function getCpInfoCurrentMonth()
	{
		return vh._cpInfoCurrentMonth;
	}
	
	function getCpInfoCurrentYear()
	{
		return vh._cpInfoCurrentYear;
	}
	
	function getCpInfoCurrentDay()
	{
		return vh._cpInfoCurrentDay;
	}
	
	function getCpInfoCurrentTime()
	{
		return vh._cpInfoCurrentTime;
	}
	
	function getCpInfoCurrentHour()
	{
		return vh._cpInfoCurrentHour;
	}
		
	function getCpInfoCurrentMinutes()
	{
		return vh._cpInfoCurrentMinutes;
	}
	
	function getCpInfoEpochMS()
	{
		return vh._cpInfoEpochMS;
	}
	
	function getCpInfoElapsedTimeMS()
	{
		return vh._cpInfoElapsedTimeMS;
	}
	
	function getCpInfoCurrentSlideType()
	{
		var currSlideData =  cp.movie.stage.currentSlide;
		var retVal = "";
	
		if(currSlideData)
		{
			retVal = currSlideData.st;
			if(retVal && retVal == 'Question Slide')
			{
				var qNumber = currSlideData.qnq;
				if(qNumber != undefined)
				{
					var lQuestionObj = cp.movie.questionObjs[qNumber];
					var lQuestionData = lQuestionObj.questionData;
					if(lQuestionData && lQuestionData.ikc && lQuestionData.ikc == true)
						retVal = 'Normal Slide';
				}
			}
		}
		return retVal;
	}

	function getCpInfoIsResultSlide()
	{
		var currSlideData =  cp.movie.stage.currentSlide;
		if(currSlideData)
		{
			slideType = currSlideData.st;
			if(slideType && slideType == 'Question Slide' && currSlideData.qnq== undefined)
				return true;
		}
		return false;
	}
	
	/* Quiz Variables */
	function getCpQuizInfoPassFail()
	{
		if(!cp.movie)
			return false;
		if(cp.movie.playbackController)
		{
			var lQuizController = cp.movie.playbackController.GetQuizController();	
			if(lQuizController)
				return lQuizController.GetIsPassed();
		}
		return false;
	}
	
	function getCpInfoSlidesInProject()
	{
		//TODO::impl
		return 0;
	}

	function getCpInfoPrevFrame()
	{
		return vh._cpInfoPrevFrame;
	}
	
	function setCpInfoPrevFrame(aPrevFrame)
	{
		svvi("cpInfoPrevFrame",aPrevFrame, []);
	}
	
	function getCpInfoCurrentFrame()
	{
		return vh._cpInfoCurrentFrame;
	}
	
	function setCpInfoCurrentFrame(aCurrFrameObj)
	{
		var lShouldAdvanceSmoothly = aCurrFrameObj.smoothAdvance;
		var aCurrFrame;
		if(lShouldAdvanceSmoothly)
			aCurrFrame = aCurrFrameObj.currFrame;
		else
			aCurrFrame = aCurrFrameObj;
		
		setCpInfoPrevFrame(getCpInfoCurrentFrame());
		svvi("cpInfoCurrentFrame",aCurrFrame, ["cpInfoCurrentFrame", "rdinfoCurrentFrame"]);
		if(!lShouldAdvanceSmoothly)
			cp.movie.resetMovieElapsedTime();
	}
	
	function getRdInfoCurrentSlide()
	{
		return cpInfoCurrentSlide - 1;
	}
	
	function getCpInfoCurrentSlide()
	{
		return vh._cpInfoCurrentSlide;
	}
	
	function setCpInfoCurrentSlide(aSlide)
	{
		svvi("cpInfoCurrentSlide",aSlide,["cpInfoCurrentSlide"]);
	}
	
	function getCpInfoSlideCount()
	{
		return cp.movie.stage.slides.length;
	}
	
	function getCpInfoFPS()
	{
		return cp.movie.fps*cp.movie.speed;
	}
	
	function getCpQuizScopeSlide()
	{
		return vh._cpQuizScopeSlide; 
	}
	
	function setCpQuizScopeSlide(aSlide)
	{
		svvi("cpQuizScopeSlide",aSlide,["cpQuizScopeSlide"]);
	}
	
	function getCpInQuizScope()
	{
		return vh._cpInQuizScope; 
	}
	
	function setCpInQuizScope(aInQuizScope)
	{
		if(cpInfoHasPlaybar)
		{
			if(cp.movie && cp.movie.playbackController)
			{
				var lQuizController = cp.movie.playbackController.GetQuizController();	
				if(lQuizController &&  lQuizController.GetHidePlaybarInQuiz())
				{
					if(aInQuizScope &&  !lQuizController.GetIsInReviewMode())
						cpCmndShowPlaybar = 0;
					else
						cpCmndShowPlaybar = 1;
				}
			}
		}			
		
		svvi("cpInQuizScope",aInQuizScope,["cpInQuizScope"]);
	}
	
	function getCpQuizInfoPretestPointsscored()
	{
		if(!cp.movie || !cp.movie.playbackController)
			return 0;
		var lQuizController = cp.movie.playbackController.GetQuizController();	
		if(lQuizController)
			 return lQuizController.GetPretestScore();
			 
		return 0;
	}
	
	function getCpInReviewMode()
	{
		if(!cp.movie || !cp.movie.playbackController)
			return false;
			
		lQuizController = cp.movie.playbackController.GetQuizController();	
		if(lQuizController)
		{
			return !!lQuizController.GetIsInReviewMode();
		}
		return false;
	}
	
	
	function getCpQuizInfoPreTestMaxScore()
	{
		if(!cp.movie || !cp.movie.playbackController)
			return 0;
		var lQuizController = cp.movie.playbackController.GetQuizController();	
		if(lQuizController)
		{
			return lQuizController.GetMaxPretestScore() ;
		}
		return 0;
	}
	
	function getCpQuizInfoPretestScorePercentage()
	{
		if(!cp.movie || !cp.movie.playbackController)
			return 0;
		var lQuizController = cp.movie.playbackController.GetQuizController();	
		if(lQuizController)
		{
			var lMaxPretestScore = lQuizController.GetMaxPretestScore() ;
			var lPretestScore = lQuizController.GetPretestScore() ;
			
			if ((lMaxPretestScore == undefined) || (lMaxPretestScore <= 0) || (lPretestScore == undefined) || (lPretestScore <= 0))
				return 0;
			
			return Math.round(lPretestScore*100.0/lMaxPretestScore);
		}
		
		return 0;			
	}
	
	function setCpCmndGotoQuizScopeSlide(aSlide)
	{
		if(!cp.movie || !cp.movie.playbackController)
			return;
		var lQuizController = cp.movie.playbackController.GetQuizController();	
		if(lQuizController)
			lQuizController.GotoQuizScopeSlide(aSlide);
	}
	
	function getCpInfoCourseID()
	{
		return vh._cpInfoCourseID;
	}

	function setCpInfoCourseID(val)
	{
		svvi("cpInfoCourseID",val,["cpInfoCourseID"]);
	}
	

	function getCpInfoCourseName()
	{
		return vh._cpInfoCourseName;
	}

	function setCpInfoCourseName(val)
	{
		svvi("cpInfoCourseName",val,["cpInfoCourseName"]);
	}

	function getCurrentGeolocation()
	{
		return vh._cpInfoGeoLocation?vh._cpInfoGeoLocation:"";
	}

	function setCurrentGeolocation(val)
	{
		svvi('cpInfoGeoLocation', val, ['cpInfoGeoLocation']);
		if(cp.movie && !cp.movie.virgin && cp.D.geoProps.geoAct && cp.D.geoProps.geoAct.length > 0)
			cp.movie.executeAction(cp.D.geoProps.geoAct);
	}

	function emptySetter(val){}
	
	function emptyGetter(){return null;}
	
	/*Full Function Name : assignSetterGetter*/
	window["asg"] = function(propertyName, setter, getter)
	{
		try
		{
			if(setter == null)
			{
				setter = emptySetter;			
			}
			if(getter == null)
			{
				getter = emptyGetter;
			}
			if(Object.defineProperty)// Use the standards-based syntax
			{
				Object.defineProperty(window, propertyName, {get: getter,set: setter});
			}
			else if(window.__defineGetter__)//use legacy syntax
			{
				if(getter)
				{
					window.__defineGetter__(propertyName, getter);
				}
				if(setter)
				{
					window.__defineSetter__(propertyName, setter);
				}
			}
		}
		catch(e)
		{
			if(cp.m_isPreview)
				cp.alert("Please correct the variable name. This might be a javascript variable. : '" + propertyName + "'");
		}
	}

	
	
	function asgForUserVar(x)
	{
		eval('(function(){var _' + x +';function get'+x+'(){return _'+x+';}function set'+x+'(val){svvi('+x+', val, ["'+x+'"]);} asg("'+x+'",set'+x+',get'+x+');})();');
	}
	
	cp.VarInfo = function(name, len, systemDefined)
	{
		this.name = name;
		this.len = len;
		this.systemDefined = systemDefined;
	}
	
	cp.VariablesManager = function()
	{
		cp.vm = this;
		this.varInfos = [];
		this.geoVarIndexes = [];
		
		if (!Object.defineProperty && !window.__defineGetter__)
		{
			alert('VARIABLES SETTER GETTER WILL NOT WORK');
		}
		else
		{
			asg('_registerForUpdateTimeBasedSystemVariables', RegisterForUpdateTimeBasedSystemVariables, null);

			//commands
			asg('cpCmndVolume', setCpCmndVolume, getCpCmndVolume);
			asg('cpCmndMute', setCpCmndMute, getCpCmndMute);asg('rdcmndMute', setCpCmndMute, getCpCmndMute);
			asg('cpCmndCC', setCpCmndCC, getCpCmndCC);asg('rdcmndCC', null, getCpCmndCC);
			asg('cpCmndNext', setCpCmndNextSlide, null);asg('rdcmndNext', setCpCmndNextSlide, null);
			asg('cpCmndNextSlide', setCpCmndNextSlide, null);asg('rdcmndNextSlide', setCpCmndNextSlide, null);
			asg('cpCmndPrevious', setCpCmndPreviousSlide, getCpCmndPreviousSlide);asg('rdcmndPrevious', setCpCmndPreviousSlide, getCpCmndPreviousSlide);
			asg('cpCmndNextOnReview', setCpCmndNextOnReview, null);
			asg('cpCmndPreviousSlide', setCpCmndPreviousSlide, getCpCmndPreviousSlide);asg('rdcmndPreviousSlide', setCpCmndPreviousSlide, getCpCmndPreviousSlide);
			asg('cpCmndPreviousOnReview', setCpCmndPreviousOnReview, null);
			asg('cpCmndPlaybarMoved', setCpCmndPlaybarMoved, getCpCmndPlaybarMoved);asg('rdcmndPlaybarMoved', setCpCmndPlaybarMoved, getCpCmndPlaybarMoved);
			asg('cpCmndShowPlaybar', setCpCmndShowPlaybar, getCpCmndShowPlaybar);
			asg('cpCmndFastForward', setCpCmndFastForward, null);
			asg('cpCmndRewindAndPlay', setCpCmndRewindAndPlay, getCpCmndRewindAndPlay);asg('rdcmndRewindAndPlay', setCpCmndRewindAndPlay, getCpCmndRewindAndPlay);
			asg('cpCmndRewindAndStop', setCpCmndRewindAndStop, getCpCmndRewindAndStop);asg('rdcmndRewindAndStop', setCpCmndRewindAndStop, getCpCmndRewindAndStop);
			asg('cpCmndGotoFrame', setCpCmndGotoFrame, null);asg('rdcmndGotoFrame', setCpCmndGotoFrame, null);
			asg('cpCmndGotoFrameAndResume', setCpCmndGotoFrameAndResume, null);asg('rdcmndGotoFrameAndResume', setCpCmndGotoFrameAndResume, null);
			asg('cpCmndGotoSlide', setCpCmndGotoSlide, null);asg('rdcmndGotoSlide', setCpCmndGotoSlide, null);
			asg('cpCmndGotoSlideAndResume', setCpCmndGotoSlideAndResume, null);
			asg('cpCmndGotoSlideByUIDAndResume', setCpCmndGotoSlideByUIDAndResume, null);
			asg('cpCmndResume', setCpCmndResume, getCpCmndResume);asg('rdcmndResume', setCpCmndResume, getCpCmndResume);
			asg('cpCmndPause', setCpCmndPause, getCpCmndPause);asg('rdcmndPause', setCpCmndPause, getCpCmndPause);
			asg('cpCmndExit', setCpCmndExit, getCpCmndExit);asg('rdcmndExit', setCpCmndExit, getCpCmndExit);
			asg('cpLockTOC', setCpLockTOC, getCpLockTOC);
			asg('cpCmndInfo', setCpCmndInfo, getCpCmndInfo);asg('rdcmndInfo', setCpCmndInfo, getCpCmndInfo);
			asg('cpCmndTOCVisible', setCpCmndTOCVisible, getCpCmndTOCVisible);
			
			//info
			asg('cpInfoSlidesInProject', null, getCpInfoSlidesInProject);asg('rdinfoSlidesInProject', null, getCpInfoSlidesInProject);
			asg('rdinfoCurrentSlideInProject', null, (function(){return 0;}));
			asg('cpInfoFPS', null, getCpInfoFPS);asg('rdinfoFPS', null, getCpInfoFPS);
			asg('cpInfoAuthor', null, getCpInfoAuthor);
			asg('cpInfoCompany', null, getCpInfoCompany);
			asg('cpInfoEmail', null, getCpInfoEmail);
			asg('cpInfoWebsite', null, getCpInfoWebsite);
			asg('cpInfoCopyright', null, getCpInfoCopyright);
			asg('cpInfoProjectName', null, getCpInfoProjectName);
			asg('cpInfoDescription', null, getCpInfoDescription);
			asg('cpInfoCurrentFrame', null, getCpInfoCurrentFrame);asg('rdinfoCurrentFrame', null, getCpInfoCurrentFrame);
			asg('_cpInfoCurrentFrame', setCpInfoCurrentFrame, null);asg('_rdinfoCurrentFrame', getCpInfoCurrentFrame, null);
			asg('cpInfoPrevFrame', null, getCpInfoPrevFrame);
			asg('cpInfoFrameCount', null, getCpInfoFrameCount);
			asg('cpInfoPrevSlide', null, getCpInfoPrevSlide);
			asg('_cpInfoPrevSlide', setCpInfoPrevSlide, null);
			asg('cpInfoLastVisitedSlide', null, getCpInfoLastVisitedSlide);
			asg('_cpInfoLastVisitedSlide', setCpInfoLastVisitedSlide, null);
			asg('cpInfoCurrentSlide', null, getCpInfoCurrentSlide);asg('rdinfoCurrentSlide', null, getRdInfoCurrentSlide);asg('cpInfoCurrentSlideIndex', null, getRdInfoCurrentSlide);
			asg('_cpInfoCurrentSlide', setCpInfoCurrentSlide, null);
			asg('cpInfoCurrentSlideLabel', null, getCpInfoCurrentSlideLabel);
			asg('_cpInfoCurrentSlideLabel', setCpInfoCurrentSlideLabel, null);
			asg('cpInfoSlideCount', null, getCpInfoSlideCount);asg('rdinfoSlideCount', null, getCpInfoSlideCount);
			asg('cpInfoIsStandalone', null, getCpInfoIsStandalone);
			asg('cpInfoHasPlaybar', null, getCpInfoHasPlaybar);
			asg('cpInfoCurrentSlideType', null, getCpInfoCurrentSlideType);
			asg('cpInfoIsResultSlide', null, getCpInfoIsResultSlide);

			//date-time info
			asg('cpInfoElapsedTimeMS', null, getCpInfoElapsedTimeMS);
			asg('cpInfoEpochMS', null, getCpInfoEpochMS);
			asg('cpInfoCurrentMinutes', null, getCpInfoCurrentMinutes);
			asg('cpInfoCurrentHour', null, getCpInfoCurrentHour);
			asg('cpInfoCurrentTime', null, getCpInfoCurrentTime);
			asg('cpInfoCurrentDay', null, getCpInfoCurrentDay);
			asg('cpInfoCurrentYear', null, getCpInfoCurrentYear);
			asg('cpInfoCurrentMonth', null, getCpInfoCurrentMonth);
			asg('cpInfoCurrentDate', null, getCpInfoCurrentDate);
			asg('cpInfoCurrentDateString', null, getCpInfoCurrentDateString);
			asg('cpInfoCurrentDateStringDDMMYYYY', null, getCpInfoCurrentDateStringDDMMYYYY);
			asg('cpInfoCurrentLocaleDateString', null, getCpInfoCurrentLocaleDateString);
			
			//quiz.command
			asg('cpCmndGotoQuizScopeSlide', setCpCmndGotoQuizScopeSlide, null);
			
			//quiz.info
			asg('cpQuizInfoLastSlidePointScored', setCpQuizInfoLastSlidePointScored, getCpQuizInfoLastSlidePointScored);
			asg('cpQuizInfoQuestionSlideType', setCpQuizInfoQuestionSlideType, getCpQuizInfoQuestionSlideType);
			asg('cpQuizInfoAnswerChoice', setCpQuizInfoAnswerChoice, getCpQuizInfoAnswerChoice);
			asg('cpQuizInfoMaxAttemptsOnCurrentQuestion', setCpQuizInfoMaxAttemptsOnCurrentQuestion, getCpQuizInfoMaxAttemptsOnCurrentQuestion);
			asg('cpQuizInfoPointsPerQuestionSlide', setCpQuizInfoPointsPerQuestionSlide, getCpQuizInfoPointsPerQuestionSlide);
			asg('cpQuizInfoNegativePointsOnCurrentQuestionSlide', setCpQuizInfoNegativePointsOnCurrentQuestionSlide, getCpQuizInfoNegativePointsOnCurrentQuestionSlide);
			asg('cpQuizInfoQuestionSlideTiming', setCpQuizInfoQuestionSlideTiming, getCpQuizInfoQuestionSlideTiming);
			asg('cpQuizInfoQuizPassPoints', setCpQuizInfoQuizPassPoints, getCpQuizInfoQuizPassPoints);
			asg('cpQuizInfoQuizPassPercent', setCpQuizInfoQuizPassPercent, getCpQuizInfoQuizPassPercent);
			asg('cpQuizInfoTotalProjectPoints', setCpQuizInfoTotalProjectPoints, getCpQuizInfoTotalProjectPoints);
			asg('cpQuizInfoTotalUnansweredQuestions', setCpQuizInfoTotalUnansweredQuestions, getCpQuizInfoTotalUnansweredQuestions);
			asg('cpQuizInfoNoQuestionsPerQuiz', setCpQuizInfoNoQuestionsPerQuiz, getCpQuizInfoNoQuestionsPerQuiz);
			asg('cpQuizInfoPointsscored', setCpQuizInfoPointsscored, getCpQuizInfoPointsscored);
			asg('cpQuizInfoPretestPointsscored', null, getCpQuizInfoPretestPointsscored);
			asg('cpQuizInfoPretestScorePercentage', null, getCpQuizInfoPretestScorePercentage);
			asg('cpQuizInfoTotalCorrectAnswers', setCpQuizInfoTotalCorrectAnswers, getCpQuizInfoTotalCorrectAnswers);
			asg('cpInfoPercentage', setCpInfoPercentage, getCpInfoPercentage);
			asg('cpQuizInfoTotalQuizPoints', setCpQuizInfoTotalQuizPoints, getCpQuizInfoTotalQuizPoints);
			asg('cpQuizInfoAttempts', setCpQuizInfoAttempts, getCpQuizInfoAttempts);
			asg('cpQuizInfoTotalQuestionsPerProject', setCpQuizInfoTotalQuestionsPerProject, getCpQuizInfoTotalQuestionsPerProject);
			asg('cpQuizInfoQuestionPartialScoreOn', setCpQuizInfoQuestionPartialScoreOn, getCpQuizInfoQuestionPartialScoreOn);
			
			asg('cpQuizScopeSlide', null, getCpQuizScopeSlide);			
			cp['_cpQuizScopeSlide'] = setCpQuizScopeSlide;//internal setter
			
			asg('cpInQuizScope', null, getCpInQuizScope);			
			cp['_cpInQuizScope'] = setCpInQuizScope;//internal setter
			
			asg('cpQuizInfoPassFail', null, getCpQuizInfoPassFail);
			asg('cpInfoCourseID', null, getCpInfoCourseID);
			asg('cpInfoCourseName', null, getCpInfoCourseName);
			
			asg('cpQuizInfoPreTestTotalCorrectAnswers', setCpQuizInfoPreTestTotalCorrectAnswers, getCpQuizInfoPreTestTotalCorrectAnswers);
			asg('cpInReviewMode', null, getCpInReviewMode);
			asg('cpQuizInfoPreTestTotalQuestions', setCpQuizInfoPreTestTotalQuestions, getCpQuizInfoPreTestTotalQuestions);
			asg('cpQuizInfoPreTestMaxScore', null, getCpQuizInfoPreTestMaxScore);
			
			//ver
			asg('CaptivateVersion', null, getCaptivateVersion);

			//mobile
			asg('cpInfoMobileOS', null, getMobileOS)
			if(cp.geo && cp.startWatchingGeoLocationChange )
			{
				asg('cpInfoGeoLocation', setCurrentGeolocation, getCurrentGeolocation);
				cp.startWatchingGeoLocationChange();
			}
			else if(cp.m_isPreview && !cp.m_isEdgeInspectPreview){
				asg('cpInfoGeoLocation', setCurrentGeolocation, getCurrentGeolocation);
			}
		}
		cp.initVariables();
		
		//Create variables used only for internal use (not created from published side).
		cp.vm.createVariable('cpQuizScopeSlide',-1, true, 100, false);	
		
		cp.initVariables = null;
	}
	
	window["DefineProperty"] = function(x)
	{
		var s = '(function(){function get'+x+'(){return vh._'+x+';}function set'+x+'(val){svvi("'+x+'", val, ["'+x+'"]);} asg("'+x+'",set'+x+',get'+x+');})();';
		eval(s);
	}

	cp.VariablesManager.prototype = 
	{
		hasOwnProperty : function(variableName)
		{
			try
			{
				var v = eval('vh._' + variableName);
				if(v == undefined)
				{
					return false;
				}
				return true;
			}
			catch(e)
			{
				return false;
			}			
		},
		
		getVariableValue : function(variableName)
		{
			var lValue = null;
			if(variableName && variableName != '')
			{
				lValue = eval('vh._' + variableName);
			}
			return lValue;
		},

		createVariable: function(variableName,variableValue, systemDefined, length, isGeo)
		{
			if(undefined == systemDefined)
			{
				systemDefined = true;
			}
			if(variableName && variableName != '' && this.hasOwnProperty(variableName) == false)
			{
				this.addVarInfo( variableName, length, systemDefined, isGeo );
				createInternalVariable(variableName, variableValue);
				if(cp.em && systemDefined != true)
				{
					DefineProperty(variableName);
					var evtArgs = {
						captivateVersion:getCaptivateVersion(),
						varName:variableName,
						varVal:variableValue
					};
					cp.em.fireEvent('CPVariableCreatedEvent', evtArgs);
				}
				return true;
			}
			return false;
		},
		
		setVariableValue : function(variableName,variableValue,createNew)
		{
			if(createNew == undefined)
			{
				createNew = true;
			}
			
			var lAssign = true;
			if(createNew)
			{
				if(this.createVariable(variableName,variableValue, true, 10000, false) == true)
				{
					lAssign = false;
				}
			}
			else
			{
				if(this.hasOwnProperty(variableName) == false)
				{
					lAssign = false;
				}
			}
			if(lAssign)
			{
				vh["_" + variableName] = variableValue;
				//eval(variableName+' = variableValue;');
			}
		},
		
		addVarInfo: function( name, len, systemDefined, isGeo )
		{
			var newLength = this.varInfos.push( new cp.VarInfo( name, len, systemDefined ) );
			if(isGeo)
				this.geoVarIndexes.push( newLength - 1);
		},
		
		getVariableLength: function( name )
		{
			var i = 0;
			// Find the name.
			for ( i = 0; i < this.varInfos.length; ++i ) {
				if ( name == this.varInfos[ i ].name )
					return this.varInfos[ i ].len;
			}
			
			return 1000; // default.
		},

		getGeoVarsInfo:function()
		{
			var result=[];
			for(var i in this.geoVarIndexes){
				result.push(this.varInfos[this.geoVarIndexes[i]]);
			}
			return result;
		}
	}	
})(window.cp);