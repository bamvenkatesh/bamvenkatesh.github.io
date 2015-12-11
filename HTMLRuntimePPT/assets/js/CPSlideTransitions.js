(function(cp)
{
	cp.SlideTransitionType = {};
	cp.SlideTransitionType.kFTNone = 0,
    cp.SlideTransitionType.kFTBlinds = 1,
    cp.SlideTransitionType.kFTFade = 2,
    cp.SlideTransitionType.kFTFly = 3,
    cp.SlideTransitionType.kFTIris = 4,
    cp.SlideTransitionType.kFTPhoto = 5,
    cp.SlideTransitionType.kFTPixelDissolve = 6,
    cp.SlideTransitionType.kFTRotate = 7,
    cp.SlideTransitionType.kFTSqeeze = 8,
    cp.SlideTransitionType.kFTWipe = 9,
    cp.SlideTransitionType.kFTZoom = 10

	cp.getSlideTransition = function(currSlideData)
	{
		if(!currSlideData)
			return;
		var lTransitionData = currSlideData.transition;
		if(!lTransitionData)
			return;

		switch(lTransitionData.type)
		{
			case cp.SlideTransitionType.kFTFade: return (new cp.FadeInTransition(currSlideData));
			case cp.SlideTransitionType.kFTFly: return (new cp.FlyTransition(currSlideData));
			case cp.SlideTransitionType.kFTIris: return (new cp.IrisTransition(currSlideData));
			case cp.SlideTransitionType.kFTPhoto: return (new cp.PhotoTransition(currSlideData));
			case cp.SlideTransitionType.kFTRotate:  return (new cp.RotateTransition(currSlideData));
			case cp.SlideTransitionType.kFTSqeeze: return (new cp.SqueezeTransition(currSlideData));
			case cp.SlideTransitionType.kFTZoom: return (new cp.ZoomTransition(currSlideData));
			case cp.SlideTransitionType.kFTBlinds: return (new cp.BlindsTransition(currSlideData));
			case cp.SlideTransitionType.kFTPixelDissolve: return (new cp.PixelTransition(currSlideData));
			case cp.SlideTransitionType.kFTWipe: return (new cp.WipeTransition(currSlideData));			
			default: return (new cp.SlideTransition(currSlideData));
		}
	};

	cp.SlideTransition = function(currSlideData)
	{
		this.item = cp("div_Slide");
		this.data = currSlideData.transition;
		this.duration = 15;
		this.from = currSlideData.from;
		this.type = cp.SlideTransitionType.kFTNone;
	};
	cp.SlideTransition.prototype = 
	{
		update: function(iFrame)
		{

		},

		isCompleted: function(iFrame)
		{
			return ((iFrame-this.from-this.duration) > 0);
		},

		reset: function()
		{

		}
	};

	cp.FadeInTransition = function(currSlideData)
	{
		cp.FadeInTransition.baseConstructor.call(this,currSlideData);
		var lSlideDiv = cp("div_Slide");
		this.finalOpacity = 1;
		this.type = cp.SlideTransitionType.kFTFade;
	};

	cp.inherits(cp.FadeInTransition, cp.SlideTransition);

	cp.FadeInTransition.prototype.reset = function()
	{
		this.item.style.opacity = "1";
	};

	cp.FadeInTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;
		this.item.style.opacity = ((iFrame-this.from)*this.finalOpacity/this.duration).toString();
	};

	cp.FlyTransition = function(currSlideData)
	{
		cp.FlyTransition.baseConstructor.call(this,currSlideData);
		this.steps = this.item.clientWidth/this.duration;
		this.type = cp.SlideTransitionType.kFTFly;
	};

	cp.inherits(cp.FlyTransition, cp.SlideTransition);

	cp.FlyTransition.prototype.reset = function()
	{
		this.item.style.left = "0px";
	};

	cp.FlyTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;
		this.item.style.left = ((iFrame-this.from)*this.steps - this.item.clientWidth) + "px";
	};

	cp.IrisTransition = function(currSlideData)
	{
		cp.IrisTransition.baseConstructor.call(this,currSlideData);
		this.stepsH = 1/this.duration;
		this.stepsV = 1/this.duration;
		var iStr = "center";
		this.item.style['-ms-transform-origin']= iStr;
		this.item.style['-moz-transform-origin']= iStr;
		this.item.style['-webkit-transform-origin']= iStr;
		this.item.style['-o-transform-origin']= iStr;
		this.item.style['transform-origin']= iStr;	
		cp.applyTransform(this.item,"scale(0,0)");
		this.type = cp.SlideTransitionType.kFTIris;
	};

	cp.inherits(cp.IrisTransition, cp.SlideTransition);

	cp.IrisTransition.prototype.reset = function()
	{
		cp.applyTransform(this.item,"");
	};

	cp.IrisTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;

		var lScaleTransform = "scale(" + (iFrame-this.from)*this.stepsH + "," + (iFrame-this.from)*this.stepsV + ")";
		cp.applyTransform(this.item,lScaleTransform);
	};

	cp.PhotoTransition = function(currSlideData)
	{
		cp.PhotoTransition.baseConstructor.call(this,currSlideData);	
		this.type = cp.SlideTransitionType.kFTPhoto;	
	};

	cp.inherits(cp.PhotoTransition, cp.SlideTransition);

	cp.PhotoTransition.prototype.reset = function()
	{
		this.item.style.opacity = "1";
	};

	cp.PhotoTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;
		
		var lCurrTime = iFrame - this.from;
		if(lCurrTime <= 10)
		{
			this.item.style.opacity = (lCurrTime/this.duration).toString();
		}
		else if(lCurrTime <= 13)
		{
			this.item.style.opacity = "0";
		}
		else
		{
			this.item.style.opacity = "1";
		}
	};

	cp.RotateTransition = function(currSlideData)
	{
		cp.RotateTransition.baseConstructor.call(this,currSlideData);
		this.stepsR = 90/this.duration;
		cp.applyTransform(this.item,"rotate(-90deg)");
		this.type = cp.SlideTransitionType.kFTRotate;
	};

	cp.inherits(cp.RotateTransition, cp.SlideTransition);

	cp.RotateTransition.prototype.reset = function()
	{
		cp.applyTransform(this.item,"");
	};

	cp.RotateTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;
		
		var iStr = "left top";
		this.item.style['-ms-transform-origin']= iStr;
		this.item.style['-moz-transform-origin']= iStr;
		this.item.style['-webkit-transform-origin']= iStr;
		this.item.style['-o-transform-origin']= iStr;
		this.item.style['transform-origin']= iStr;

		var lRotateTransform = "rotate(" + (this.duration - (iFrame-this.from))*this.stepsR + "deg)";
		cp.applyTransform(this.item,lRotateTransform);
	};

	cp.SqueezeTransition = function(currSlideData)
	{
		cp.SqueezeTransition.baseConstructor.call(this,currSlideData);
		this.stepsH = 1/this.duration;
		cp.applyTransform(this.item,"scale(0,1)");
		this.type = cp.SlideTransitionType.kFTSqeeze;
	};

	cp.inherits(cp.SqueezeTransition, cp.SlideTransition);

	cp.SqueezeTransition.prototype.reset = function()
	{
		cp.applyTransform(this.item,"");
	};

	cp.SqueezeTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;

		var lScaleTransform = "scale(" + (iFrame-this.from)*this.stepsH + ",1)";
		cp.applyTransform(this.item,lScaleTransform);
	};

	cp.ZoomTransition = function(currSlideData)
	{
		cp.ZoomTransition.baseConstructor.call(this,currSlideData);
		this.stepsH = 1/this.duration;
		this.stepsV = 1/this.duration;	
		var iStr = "left top";
		this.item.style['-ms-transform-origin']= iStr;
		this.item.style['-moz-transform-origin']= iStr;
		this.item.style['-webkit-transform-origin']= iStr;
		this.item.style['-o-transform-origin']= iStr;
		this.item.style['transform-origin']= iStr;	
		cp.applyTransform(this.item,"scale(0,0)");
		this.type = cp.SlideTransitionType.kFTZoom;
	};

	cp.inherits(cp.ZoomTransition, cp.SlideTransition);

	cp.ZoomTransition.prototype.reset = function()
	{
		cp.applyTransform(this.item,"");
	};

	cp.ZoomTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;
		
		var lScaleTransform = "scale(" + (iFrame-this.from)*this.stepsH + "," + (iFrame-this.from)*this.stepsV + ")";
		cp.applyTransform(this.item,lScaleTransform);
	};
	//canvas based transitions
	cp.BlindsTransition = function(currSlideData)
	{
		cp.BlindsTransition.baseConstructor.call(this,currSlideData);
		var lSlideDiv = cp("div_Slide");		
		this.item = cp("slide_transition_canvas");
		this.item.width = lSlideDiv.clientWidth;
		this.item.height = lSlideDiv.clientHeight;
		this.gc = this.item.getContext('2d');
		this.totalRects = 10;
		this.hsteps = this.item.width;
		this.vstepsMajor = this.item.height/this.totalRects;
		this.vstepsMinor = this.vstepsMajor/this.duration;
		this.type = cp.SlideTransitionType.kFTBlinds;
	};

	cp.inherits(cp.BlindsTransition, cp.SlideTransition);

	cp.BlindsTransition.prototype.reset = function()
	{
		this.gc.fillStyle = "rgba(255, 255, 255, 1)";
		this.gc.fillRect(0,0,this.item.width,this.item.height);
		this.item.style.display = "none";
	};

	cp.BlindsTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
		{
			this.item.style.display = "none";
			return;
		}
		this.item.style.display = "block";
		this.gc.fillStyle = "rgba(255, 255, 255, 1)";
		this.gc.fillRect(0,0,this.item.width,this.item.height);
		var height = (iFrame - this.from)*this.vstepsMinor;
		for(var i = 0; i < this.totalRects; ++i)
		{
			var y = i * this.vstepsMajor;
			this.gc.clearRect(0,y,this.hsteps,height);
		}
	};

	cp.PixelTransition = function(currSlideData)
	{
		cp.PixelTransition.baseConstructor.call(this,currSlideData);
		var lSlideDiv = cp("div_Slide");		
		this.item = cp("slide_transition_canvas");
		this.item.width = lSlideDiv.clientWidth;
		this.item.height = lSlideDiv.clientHeight;
		this.gc = this.item.getContext('2d');
		this.totalHPixels = this.item.width;
		this.totalVPixels = this.item.height;
		this.totalRects = this.totalHPixels * this.totalVPixels;
		this.pixelArr = [];
		for(var i = 0; i < this.totalRects; ++i)
		{
			this.pixelArr.push(i);
		}
		this.gc.fillStyle = "rgba(255, 255, 255, 1)";
		this.gc.fillRect(0,0,this.item.width,this.item.height);
		this.type = cp.SlideTransitionType.kFTPixelDissolve;
	};

	cp.inherits(cp.PixelTransition, cp.SlideTransition);

	cp.PixelTransition.prototype.reset = function()
	{
		this.gc.fillStyle = "rgba(255, 255, 255, 1)";
		this.gc.fillRect(0,0,this.item.width,this.item.height);
		this.item.style.display = "none";
	};

	cp.PixelTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
		{
			this.item.style.display = "none";
			return;
		}
		this.item.style.display = "block";
		for(var i = 0; this.pixelArr.length > 0 && i < this.totalRects/this.duration; ++i)
		{
			var lIndex = Math.floor((Math.random() * this.pixelArr.length));
			var currPoint = lIndex;
			this.pixelArr.splice(lIndex,1);
			var currX = currPoint/this.totalVPixels;
			var currY = currPoint/this.totalHPixels;
			this.gc.clearRect(currX,currY,1,1);
		}
	};

	cp.WipeTransition = function(currSlideData)
	{
		cp.WipeTransition.baseConstructor.call(this,currSlideData);
		var lSlideDiv = cp("div_Slide");		
		this.item = cp("slide_transition_canvas");
		this.item.width = lSlideDiv.clientWidth;
		this.item.height = lSlideDiv.clientHeight;
		this.gc = this.item.getContext('2d');
		this.steps = this.item.width/this.duration;
		this.gc.fillStyle = "rgba(255, 255, 255, 1)";
		this.gc.fillRect(0,0,this.item.width,this.item.height);
		this.type = cp.SlideTransitionType.kFTWipe;
	};

	cp.inherits(cp.WipeTransition, cp.SlideTransition);

	cp.WipeTransition.prototype.reset = function()
	{
		this.gc.fillStyle = "rgba(255, 255, 255, 1)";
		this.gc.fillRect(0,0,this.item.width,this.item.height);
		this.item.style.display = "none";
		this.item.style.left = "0px";
	};

	cp.WipeTransition.prototype.update = function(iFrame)
	{
		if(this.isCompleted(iFrame))
			return;
		this.item.style.display = "block";
		this.item.style.left = ((iFrame-this.from)*this.steps) + "px";
	};	
})(window.cp);