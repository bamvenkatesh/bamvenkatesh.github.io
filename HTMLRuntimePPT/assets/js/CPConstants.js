(function(cp)
{
	cp.UNKNOWN = 0;

	//OS
	cp.WINDOWS = 1;
	cp.MACOS = 2;
	
	//devices
	cp.DESKTOP = 1;
	cp.IDEVICE = 2;
	cp.ANDROID = 3;
	cp.KINDLE = 4;
	
	//deviceFlavors
	cp.IPAD2 = 1;
	cp.IPAD3 = 2;
	cp.IPHONE = 3;
	
	//IOS flavors
	cp.IOS1 = 1;
	cp.IOS2 = 2;
	cp.IOS3 = 3;
	cp.IOS4 = 4;
	cp.IOS5 = 5;
	cp.IOS6 = 6;
	cp.IOS7 = 7;
	cp.IOS8 = 8;
	
	//browsers
	cp.MSIE = 1;
	cp.FIREFOX = 2;
	cp.CHROME = 3;
	cp.SAFARI = 4;
	cp.NETSCAPE = 5;
	cp.OPERA = 6;
	cp.CAMINO = 7;
	cp.FIREBIRD = 8;
	cp.MSEDGE = 9;
	
	cp.MSIE_MIN_SUPPORTED_VERSION = 9;
	cp.CHROME_MIN_SUPPORTED_VERSION = 17;
	cp.SAFARI_MIN_SUPPORTED_VERSION = 5.1;
	cp.FF_MIN_SUPPORTED_VERSION_WIN = 22;
	cp.FF_MIN_SUPPORTED_VERSION_MAC = 35;
	cp.FF_MIN_SUPPORTED_VERSION_FFOS = 15;
	cp.FF_MIN_SUPPORTED_VERSION_ANDROID = 20;

	cp.FF_MIN_SUPPORTED_VERSION = undefined;
	
	//Audio/Video readyStates
	cp.HAVE_NOTHING = 0;
	cp.HAVE_METADATA = 1;
	cp.HAVE_CURRENT_DATA = 2;
	cp.HAVE_FUTURE_DATA = 3;
	cp.HAVE_ENOUGH_DATA = 4;
	
	cp.disablePaceMaker = false;
	cp.verbose = false;
	cp.poolVerbose = false;
	cp.exceptionalLogs = true;
	cp.consolidateLogs = false;
	cp.dynamicLogControl = false;
	cp.projectContainer = null;
	cp.project = null;
	cp.playImage = null;
	cp.autoplayImage = null;
	cp.autoplayDiv = null;
	cp.pwdv = null;
	cp.exdv = null;
	cp.preloaderImage = null;
	
	if(cp.verbose)
		cp.log('navigator.userAgent = '+ navigator.userAgent);
		
	cp.OS = cp.UNKNOWN;
	cp.device = cp.DESKTOP;
	cp.deviceFlavor = cp.UNKNOWN;
	cp.IOSMajor = cp.UNKNOWN;
	cp.IOSMinor = cp.UNKNOWN;
	cp.IOSBuild = cp.UNKNOWN;
	cp.browser = cp.UNKNOWN;
	cp.browserVersion = cp.UNKNOWN;
	cp.browser_supports_svg = true;

	cp.kTextButton = 0;
	cp.kTransparentButton = 2;
	cp.kImageButton = 3;

	cp.kCPRolloverCaptionItem = 25;
	cp.kCPRolloverImageItem = 26;
	cp.kCPOTRolloverAutoShape = 617;
	cp.kCPRolloverAreaItem = 27;
	cp.kCPOTAnimationItem = 28;
	cp.kCPOTCaptionItem = 19;
	cp.kCPHighlight 	= 14;
	cp.kCPOTImageBoxItem = 15;
	cp.kCPMouse		= 12;
	cp.kCPMouseClick 	= 15728652;
	cp.kCPOTStageAnswerItem = 80;
	cp.kCPOTIncompleteFeedbackItem = 97;
	cp.kCPZoomSource 	= 99;
	cp.kCPOTStageCorrectFeedback = 10086;
	cp.kCPOTStageIncorrectFeedback = 10087;
	cp.kCPOTStagePartialCorrectFeedback = 10139;
	cp.kCPOTTimeoutFeedbackItem = 174;
	cp.kCPOTRetryFeedbackItem = 81;
    cp.kCPOTStageSingleChoiceMultipleAnswer = 10082;
    cp.kCPOTStageMultipleChoiceMultipleAnswer = 10081;
	cp.kCPOTStageLikertQuestion = 10112;
	cp.kCPOTStageSequenceAnswer = 10096;
	cp.kCPOTStageMatchingAnswer = 10097;
	cp.kCPOTStageMatchingAnswerEntry = 10098;
	cp.kCPOTStageMatchingQuestion = 10110;
	cp.kCPOTQuestionColumn = 87;
	cp.kCPOTQuestionFillBlank = 10011;
	cp.kCPOTStageShortAnswer = 10094
	cp.kCPOTItemHotSpot = 131;
	cp.kCPOTFillBlankCaption = 10106;
	cp.kCPOTReviewArea = 94;
	cp.kCPOTProgressIndicator = 92;
	cp.kCPOTScoringResult = 111;
	cp.kCPOTClickBoxItem = 13;
	cp.kCPOTScorableButtonItem = 177;
    cp.kCPTypingText = 64;
    cp.kCPFullMotion = 270;
	cp.kCPOTFLVItem = 98;
	cp.kCPOTVideo = 365;
	cp.kCPOTVideoResource = 359;
	cp.kCPOTSuccessCaptionItem = 21;
	cp.kCPOTFailureCaptionItem = 22;
	cp.kCPOTHintCaptionItem = 23;
	cp.kCPOTTextEntryBoxItem = 24;
	cp.kCPOTTextEntryButtonItem = 75;
	cp.kCPOTRetakeButton = 175;
	cp.kCPOTLineItem = 142;
	cp.kCPOTOvalItem = 167;
	cp.kCPOTRectangleItem = 168;
	cp.kCPOTPolygon = 209;
	cp.kCPOTAnswerArea = 10142;
	cp.kCPOTMatchingQuestionArea = 10143;
	cp.kCPOTMatchingAnswerArea = 10144;
	cp.kCPOTLikertHeaderArea = 10146;
	cp.kCPOTLikertQuestionArea = 10147;
	cp.kCPOTLikertTotalGroupArea = 10148;
	cp.kCPOTStageQuestionText = 79;
	cp.kCPOTStageQuestionTitle = 86;
	cp.kCPOTTitleAutoShape = 589;
	cp.kCPOTSubTitleAutoShape = 590;
	cp.kCPOTAutoShape = 612;
	cp.kCPOTWidgetItem = 133;
	cp.kCPOTWebObject = 652;
	cp.kCPOTTAItem = 76;
	cp.kCPOTStageAnswerLabel = 10088;

    cp.kCPOTStageQuestionNextButton = 83;
	cp.kCPOTStageQuestionClearButton = 84;
	cp.kCPOTStageQuestionBackButton = 85;
	cp.kCPOTStageQuestionSubmitButton = 91;
	cp.kCPOTStageQuestionReviewModeNextButton = 10180;
	cp.kCPOTStageQuestionReviewModeBackButton = 10182;
	cp.kCPOTScoringResultItem = 112;
	cp.kCPOTScoringReviewButton = 103;
	cp.kCPOTScoringContinueButton = 10119;
	cp.kCPOTSubmitAllButton = 10149;
	cp.kCPOTResetButton = 640;
	cp.kCPOTUndoButton = 639;
	cp.kCPOTDDSubmitButton = 641;

	cp.kCPOTStageCorrectFeedbackShape = 10166;
	cp.kCPOTStageIncorrectFeedbackShape = 10168;
	cp.kCPOTStagePartialCorrectFeedbackShape = 10170;
	cp.kCPOTRetryFeedbackShape = 10172;
	cp.kCPOTIncompleteFeedbackShape = 10174;
	cp.kCPOTAnswerFeedbackShape = 10176;
	cp.kCPOTTimeoutFeedbackShape = 10178;
	cp.kCPOTSuccessShapeItem = 661;
	cp.kCPOTFailureShapeItem = 663;
	cp.kCPOTHintShapeItem = 665;

	//whenever adding properties from Publish or for JS, do not modify the order for initial properties of rCSSProps and rCPProps
	//rCSSProps holds the actual CSS property names which are mapped to the properties dumped from Captivate publish listed in rCPProps
	//rCPProps holds the property names which are dumped from CP.
	cp.rCSSProps = ["position","left","top","right","bottom","width","height"];
	cp.rCPProps = ["p","l","t","r","b","w","h","apr","cr","rpmm","sh"];
	cp.rCPLinkProps = ["lhEID","lhV","lhID","lvEID","lvV","lvID"];

	cp.rLinkEdges = ["","left","top","right","bottom"];
	cp.rLinkEdge = {};
	cp.rLinkEdge.UNKNOWN = 0;
	cp.rLinkEdge.LEFT = 1;
	cp.rLinkEdge.TOP = 2;
	cp.rLinkEdge.RIGHT = 3;
	cp.rLinkEdge.BOTTOM = 4;

	//Reason for Autogrow
	cp.ReasonForDrawing = {};
	cp.ReasonForDrawing.kRegularDraw = 0;
	cp.ReasonForDrawing.kOrientationChangeOrResize = 1;
	cp.ReasonForDrawing.kTextGrow = 2;
	cp.ReasonForDrawing.kMouseEvent = 3;
	cp.ReasonForDrawing.kMoviePaused = 4;
	cp.ReasonForDrawing.kSlideChanged = 5;
	cp.ReasonForDrawing.kLinkedToItemAppeared = 6;

	//Text Alignment Enum
	cp.TextAlignmentEnum = {};
    cp.TextAlignmentEnum.kTALeftJustify = 0;
	cp.TextAlignmentEnum.kTARightJustify = 1;
	cp.TextAlignmentEnum.kTACenter = 2;
	cp.TextAlignmentEnum.kTAJustified = 3;

	//Text Layout Enum
	cp.TextLayoutEnum = {};
    cp.TextLayoutEnum.kTLTop = 0;
	cp.TextLayoutEnum.kTLCenter = 1;
	cp.TextLayoutEnum.kTLBottom = 2;
	
	//cp.ReportingOptionsEnum
	{
		cp.ReportingOptionsEnum = {};
		cp.ReportingOptionsEnum.breeze = 0;
		cp.ReportingOptionsEnum.quiz_only = 1;
		cp.ReportingOptionsEnum.quiz_and_views = 2;
		cp.ReportingOptionsEnum.views_only = 3;
		cp.ReportingOptionsEnum.access = 4;
		cp.ReportingOptionsEnum.completion_success = 5;
		cp.ReportingOptionsEnum.incompleteToPassedOrFailed = 6;
		cp.ReportingOptionsEnum.completion_only = 7;
	}	
	
	//Slide Views Type Enum
	{
		cp.SlideViewsTypeEnum = {};
		cp.SlideViewsTypeEnum.percent = 0;
		cp.SlideViewsTypeEnum.number = 1;		
	}
	
	//QuizCriteria Enum
	{
		cp.QuizCriteriaEnum = {};
		cp.QuizCriteriaEnum.QuizIsPassed = 0;
		cp.QuizCriteriaEnum.QuizIsAttempted = 1;	
		cp.QuizCriteriaEnum.QuizIsPassedOrAttempLimitReached = 2
	}

	cp.kBeginPath = 0;
	cp.kMoveTo = 1;
	cp.kLineTo = 2;
	cp.kBezierTo = 3;
	cp.kClosePath = 4;
	cp.kNotClosed = 5;
	cp.kNoStroke = 6;
	cp.kPathFillData = 7;
	cp.kPathFillAlpha = 8;
	cp.KPathStrokeColor = 9;
	cp.KPathStrokeWidth = 10;
	cp.KPathStrokeAlpha = 11;
	cp.accOutlineStyleStr = '';
	
	cp.kPPTXSlideImagesStr = 'pxi';
	cp.kPPTXSlideImagesDir = 'dr/pptxIm/';
	
	//Trigger Type Enum - Same as CP
	cp.kTTNone = -1;
	/** On Enter */
	cp.kTTOnEnter = 0;
	/** On Click */
	cp.kTTOnClick = 1;
	/** On Text Entry */
	cp.kTTOnTextEntry = 2;
	/** On Roll over */
	cp.kTTOnRollover = 3;
	/** On Success */
	cp.kTTOnSuccess = 4;
	/** On Failure */
	cp.kTTOnFailure = 5;
	/** On Frame Exit */
	cp.kTTOnSlideExit = 6;
	/** Hyperlink Enum */
	cp.kTTOnHyperlink = 7;
	/** On Drop of Type trigger*/
	cp.kTTOnDropOfType = 8;

	// Slide Item State Type Enum 
	cp.kSTTNone = -1;
	cp.kSTTNormal = 0;
	cp.kSTTDown	= 1;
	cp.kSTTRollOver = 2;
	cp.kSTTDragOver = 3;
	cp.kSTTDragStart = 4;
	cp.kSTTDropCorrect = 5;
	cp.kSTTDropIncorrect = 6;
	cp.kSTTDropAccept = 7;
	cp.kSTTDropReject = 8;
	cp.kSTTCustom = 9;
	cp.kSTTVisited = 10;
	
	//Question Status Enum. Keeping it here since it is used by Interactive items as well.
	cp.QuestionStatusEnum = {};
    cp.QuestionStatusEnum.INCOMPLETE = 0;
	cp.QuestionStatusEnum.INCORRECT = 1;
	cp.QuestionStatusEnum.CORRECT = 2;
	cp.QuestionStatusEnum.PARTIAL_CORRECT = 3;

	cp.mouseStateOver = 1;
	cp.mouseStateOut = 2;
	cp.mouseStateDown = 3;
	cp.mouseStateUp = 4;
	cp.mouseStateTouchStart = 5;
	cp.mouseStateTouchMove = 6;
	cp.mouseStateTouchEnd = 7;
	
	cp.ReasonForPause = {};
	cp.ReasonForPause.PLAYBAR_ACTION = 0;
	cp.ReasonForPause.INTERACTIVE_ITEM = 1;
	cp.ReasonForPause.MOVIE_ENDED = 2;
	cp.ReasonForPause.VIDEO_SYNC = 3;
	cp.ReasonForPause.FEEDBACK_ITEM = 4;
	cp.ReasonForPause.CANNOT_MOVE_AHEAD = 5;
	cp.ReasonForPause.WAIT_FOR_RESOURCES = 6;
	cp.ReasonForPause.MOVIE_REWIND_STOP = 7;
	cp.ReasonForPause.CPCMNDPAUSE = 8;
	cp.ReasonForPause.SHOW_VALUE_AT_FRAME = 9;
	cp.ReasonForPause.DONT_CARE_DEPRECATED_CODE = 10;
	cp.ReasonForPause.EVENT_VIDEO_PAUSE = 11;
	cp.ReasonForPause.ONLY_ONE_MEDIUM_CAN_PLAY = 12;//iDevices
	cp.ReasonForPause.PPTX_PAUSE_FOR_ONCLICK_ANIMATION = 13;
	cp.ReasonForPause.CPCMNDGOTOFRAME = 14;
	cp.ReasonForPause.BAD_ORIENTATION = 15;
	cp.ReasonForPause.WK_EXIT_FULL_SCREEN = 16;
	cp.ReasonForPause.ACTION_CHOICE = 17;

	
	cp.ReasonForPlay = {};
	cp.ReasonForPlay.PLAYBAR_ACTION = 0;
	cp.ReasonForPlay.INTERNAL = 1;
	cp.ReasonForPlay.ORIENTATION_OK = 2;
	cp.ReasonForPlay.MOVIE_REWIND = 3;
	cp.ReasonForPlay.ACTION_CHOICE = 4;

	
	cp.FeedbackType = {
		SUCCESS: 0,
		FAILURE: 1,
		HINT: 2,
		OTHER: 3
	};

	cp.FeedbackCloseReason = {
		SHOW_SUCCESS: 1,
		SHOW_FAILURE: 2,
		SHOW_HINT: 3,
		SLIDE_CHANGE:4,
		OTHER: 5
	};
	
	cp.lastTouch = new Date().getTime();
	
    if (navigator.appVersion.indexOf("Win")!=-1)
		cp.OS = cp.WINDOWS;
	else if (navigator.appVersion.indexOf("Mac")!=-1)
		cp.OS = cp.MACOS;
	
	cp.multiAudioTrack = true;
	cp.waitForAudio = false;
	if(navigator.userAgent.match(/(iPhone|iPad)/i))
	{
		cp.device = cp.IDEVICE;
		cp.browser_supports_svg = false;
		cp.accOutlineStyleStr = 'outline-style:none';
		
		var pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
		
		if(navigator.userAgent.indexOf('iPhone') != -1)
			cp.deviceFlavor = cp.IPHONE;//TODO::subversions of iPhone
		else if(navigator.userAgent.indexOf('iPad') != -1)
		{
			cp.deviceFlavor = cp.IPAD2;
			if(pixelRatio >= 2)
				cp.deviceFlavor = cp.IPAD3;
		}
		
		var IOSVer = navigator.userAgent.match(/OS [1-9][0-9]*_[0-9][0-9]*_[0-9][0-9]*/);
		if(!IOSVer)
			IOSVer = navigator.userAgent.match(/OS [1-9][0-9]*_[0-9][0-9]*/);
		if(IOSVer && IOSVer[0])
		{
			var parts = IOSVer[0].split("_");
			cp.IOSMajor = parseInt(parts[0].substr(2), 10);
			cp.IOSMinor = parseInt(parts[1], 10);
			if(parts.length >= 3)
				cp.IOSBuild = parseInt(parts[2], 10);
		}
		

		if(cp.IOSMajor >= cp.IOS5)
			cp.waitForAudio = true;
	}
	else if(navigator.userAgent.match(/android/i))
	{
		cp.device = cp.ANDROID;
		cp.waitForAudio = true;
		cp.accOutlineStyleStr = 'outline-style:none';
	}
	else if(navigator.userAgent.match(/Silk/i))
	{
		cp.device = cp.KINDLE;
	}
	
	
	
	if(navigator.userAgent.match(/MSIE/i))
	{
		cp.browser = cp.MSIE;
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"MSIE") || cp.getCurrentBrowserVersion(navigator.appVersion,"MSIE")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Edge/i))
	{
		cp.browser = cp.MSEDGE;
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Edge") || cp.getCurrentBrowserVersion(navigator.appVersion,"Edge")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Firefox/i))
	{
		cp.browser = cp.FIREFOX;
		cp.accOutlineStyleStr = 'outline-style:none';
		if(cp.OS == cp.WINDOWS)
			cp.FF_MIN_SUPPORTED_VERSION = cp.FF_MIN_SUPPORTED_VERSION_WIN;
		else if(cp.OS == cp.MACOS)
			cp.FF_MIN_SUPPORTED_VERSION = cp.FF_MIN_SUPPORTED_VERSION_MAC;
		else if(cp.OS == cp.ANDROID)
			cp.FF_MIN_SUPPORTED_VERSION = cp.FF_MIN_SUPPORTED_VERSION_ANDROID;
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Firefox") || cp.getCurrentBrowserVersion(navigator.appVersion,"Firefox")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Chrome/i))
	{
		cp.browser = cp.CHROME;
		cp.accOutlineStyleStr = 'outline-style:none';
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Chrome") || cp.getCurrentBrowserVersion(navigator.appVersion,"Chrome")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Safari/i))
	{
		cp.browser = cp.SAFARI;
		cp.browser_supports_svg = false;
		cp.accOutlineStyleStr = 'outline-style:none';
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Version") || cp.getCurrentBrowserVersion(navigator.appVersion,"Version")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Netscape/i))
	{
		cp.browser = cp.NETSCAPE;
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Netscape") || cp.getCurrentBrowserVersion(navigator.appVersion,"Netscape")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Opera/i))
	{
		cp.browser = cp.OPERA;
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Version") || cp.getCurrentBrowserVersion(navigator.appVersion,"Version")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Camino/i))
	{
		cp.browser = cp.CAMINO;
		cp.browserVersion =  cp.getCurrentBrowserVersion(navigator.userAgent,"Camino") || cp.getCurrentBrowserVersion(navigator.appVersion,"Camino")|| cp.UNKNOWN;
	}
	else if(navigator.userAgent.match(/Firebird/i))
	{
		cp.browser = cp.FIREBIRD;
	}

	if(cp.verbose)
	{
		cp.log('browser = ' + cp.browser);
		cp.log('browserVersion = '+cp.browserVersion);
		cp.log('device = ' + cp.device);
		if(cp.device == cp.IDEVICE)
		{
			cp.log('device flavor = ' + cp.deviceFlavor);
			cp.log('IOS Version = ' + cp.IOSMajor + '_' + cp.IOSMinor + '_' + cp.IOSBuild);
		}
		cp.log('browser_supports_svg = ' + cp.browser_supports_svg);
	}
})(window.cp);