(function(cp)
{
	cp.Gradient = function(el, parentId, args)
	{
		cp.Gradient.baseConstructor.call(this, el);
			
		this.visible = 1;
		this.parentId = parentId;
		this.parentObj = cp.D[parentId];
		
		if (this.parentObj) {
			this.gradientData = this.parentObj.gf;		
			var bounds = this.gradientData.b;
			this.bounds = {
					minX: bounds[0],
					minY: bounds[1],			
					maxX: bounds[2],
					maxY: bounds[3]
				};
			this.args = args;	
		}		
		this.isDrawn = false;		    
	}
	
	cp.inherits(cp.Gradient, cp.DisplayObject);
	
	cp.Gradient.prototype.start = function(iForce,iReasonForDrawing)
	{
		this.drawIfNeeded(iForce,iReasonForDrawing);
		if(!this.effectIsStarted || iForce)
		{
			this.updateEffects(this.hasEffect);
			this.effectIsStarted = true;
		}
	}
	
	cp.Gradient.prototype.reset = function(endOfSlide)
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
	
	cp.Gradient.prototype.drawIfNeeded = function(iResponsiveForce,iReasonForDrawing)
	{
		if(cp.responsive)
		{
			if(this.drawForResponsive(iResponsiveForce,iReasonForDrawing))
				return;
		}
		if (this.isDrawn)
			return;

		if (! this.gradientData)
			return;
			
		// Find the canvas elem.
		if (undefined == this.canvasElem) {
			var child = this.element.firstChild;
			for( ; child; child = child.nextSibling)
			{
				if (child.nodeType != Node.ELEMENT_NODE)
					continue;

				if (child.id && child.id == this.parentId + 'gf')
				{
					this.canvasElem = child;
					break;
				}
			}
		}

		if (! this.canvasElem)
			return;
			
		// Need to fix this bounds business. Need to 
		var bounds = this.bounds;
						
		var styleLeft = bounds.minX;
		var styleTop = bounds.minY;
		var styleWidth = bounds.maxX - bounds.minX;
		var styleHeight = bounds.maxY - bounds.minY;
				
		this.canvasElem.style.position = "absolute";
		
		var canvas = this.canvas = cp.createCanvas(styleLeft, styleTop, styleWidth, styleHeight, this.canvasElem);
		var gc = canvas.gc;
		
		gc.save();
		// Create the gradient.
		var grad = cp.getGradientFill(this.gradientData, gc);
		if (grad) {
			gc.fillStyle = grad;
			gc.fillRect( 0, 0, styleWidth, styleHeight );			
		}
		
		gc.restore();
				
		gc = null;
		canvas = null;
		this.isDrawn = true;
	}

	cp.Gradient.prototype.drawForResponsive = function(iForce,iReason)
	{
		if(!cp.responsive) return false;
		if (this.isDrawn && !iForce)
			return true;

		if (! this.gradientData)
			return false;
			
		// Find the canvas elem.
		if (undefined == this.canvasElem) {
			var child = this.element.firstChild;
			for( ; child; child = child.nextSibling)
			{
				if (child.nodeType != Node.ELEMENT_NODE)
					continue;

				if (child.id && child.id == this.parentId + 'gf')
				{
					this.canvasElem = child;
					break;
				}
			}
		}

		if (! this.canvasElem)
			return false;
			
		this.canvasElem.style.width = "100%";
		this.canvasElem.style.height = "100%";
		
		var lResponsiveStyleObj = cp.createResponsiveStyleObj(undefined, undefined, "0px", "0px", undefined, undefined, "100%", "100%", undefined);
		lResponsiveStyleObj.ipiv = true;
		var canvas = this.canvas = cp.createResponsiveCanvas(lResponsiveStyleObj, this.canvasElem.clientWidth, this.canvasElem.clientHeight, this.canvasElem);

		var gc = canvas.gc;
		
		gc.save();
		// Create the gradient.
		var grad = cp.getGradientFill(this.gradientData, gc, this.canvasElem.clientWidth/cp.D.project.w, this.canvasElem.clientHeight/cp.D.project.h);
		if (grad) {
			gc.fillStyle = grad;
			gc.fillRect( 0, 0, this.canvasElem.clientWidth, this.canvasElem.clientHeight );			
		}
		
		gc.restore();
				
		gc = null;
		canvas = null;
		this.isDrawn = true;

		return true;
	}

	cp.ImageFill = function(el, parentId, args)
	{
		cp.ImageFill.baseConstructor.call(this, el);
			
		this.visible = 1;
		this.parentId = parentId;
		this.parentObj = cp.D[parentId];
		
		if (this.parentObj) {
			this.tileData = this.parentObj.imgf;		
			var bounds = this.tileData.b;
			this.bounds = {
					minX: bounds[0],
					minY: bounds[1],			
					maxX: bounds[2],
					maxY: bounds[3]
				};
			this.args = args;	
		}		
		this.isDrawn = false;		    
	}
	
	cp.inherits(cp.ImageFill, cp.DisplayObject);
	
	cp.ImageFill.prototype.start = function(iForce,iReasonForDrawing)
	{
		this.drawIfNeeded(iForce,iReasonForDrawing);
		if(!this.effectIsStarted || iForce)
		{
			this.updateEffects(this.hasEffect);
			this.effectIsStarted = true;
		}
	}
	
	cp.ImageFill.prototype.reset = function(endOfSlide)
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
	}

	cp.ImageFill.prototype.getTranslationValuesForTiletype = function(tileData)
	{
		var tileType = tileData.img.tiletype;
		var xTrans = 0 , yTrans = 0;
		var curCanvasWidth = (tileData.b[2]-tileData.b[0]);
		var curCanvasHeight = (tileData.b[3]-tileData.b[1]);

		var imageWidth = tileData.img.w;
		var imageHeight = tileData.img.h;

		var WFactor = this.canvasElem.clientWidth/cp.D.project.w;
		var HFactor = this.canvasElem.clientHeight/cp.D.project.h;

		if(cp.responsive)
		{
			curCanvasWidth = Math.floor(curCanvasWidth*WFactor);
			curCanvasHeight = Math.floor(curCanvasHeight*HFactor);
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

		return {'x':xTrans, 'y':yTrans};
	}
	
	cp.ImageFill.prototype.drawIfNeeded = function(iResponsiveForce,iReasonForDrawing)
	{
		if(cp.responsive)
		{
			if(this.drawForResponsive(iResponsiveForce,iReasonForDrawing))
				return;
		}
		if (this.isDrawn)
			return;

		if (! this.tileData || ! this.tileData.img || ! this.tileData.img.ip)
			return;
			
		// Find the canvas elem.
		if (undefined == this.canvasElem) {
			var child = this.element.firstChild;
			for( ; child; child = child.nextSibling)
			{
				if (child.nodeType != Node.ELEMENT_NODE)
					continue;

				if (child.id && child.id == this.parentId + 'imgf')
				{
					this.canvasElem = child;
					break;
				}
			}
		}

		if (! this.canvasElem)
			return;
			
		// Need to fix this bounds business. Need to 
		var bounds = this.bounds;
						
		var styleLeft = bounds.minX;
		var styleTop = bounds.minY;
		var styleWidth = bounds.maxX - bounds.minX;
		var styleHeight = bounds.maxY - bounds.minY;
				
		this.canvasElem.style.position = "absolute";
		this.canvasElem.style.backgroundColor = '#FFFFFF';
		
		var imagePath = this.tileData.img.ip;
		var img = cp.movie.im.images[imagePath];
		if ( img && img.nativeImage.complete )
		{
			var canvas = this.canvas = cp.createCanvas(styleLeft, styleTop, styleWidth, styleHeight, this.canvasElem);
			var gc = canvas.gc;
			
			gc.save();
				
			var bStretch = this.tileData.s;
			var bTile = this.tileData.t;
			if ( bTile ) {
				gc.rect( 0, 0, styleWidth, styleHeight);
				var transObj = this.getTranslationValuesForTiletype(this.tileData);
				gc.translate( transObj.x, transObj.y );
				var pat = gc.createPattern( img.nativeImage, "repeat" );
				gc.fillStyle = pat;
				gc.fill();	
			}
			else if ( bStretch ) 
				gc.drawImage( img.nativeImage, 0, 0, styleWidth, styleHeight );
			else 
			{
				var imageWidth = this.tileData.img.w;
				var imageHeight = this.tileData.img.h;

				var xTrans = (styleWidth - imageWidth)/2;
				var yTrans = (styleHeight - imageHeight)/2;
				gc.translate( xTrans, yTrans );
				gc.drawImage( img.nativeImage, 0, 0 );		
			}
			gc.restore();
					
			gc = null;
			canvas = null;
			this.isDrawn = true;
		}
	}
	
	cp.ImageFill.prototype.drawForResponsive = function(iForce,iReason)
	{
		if(!cp.responsive) return false;
		if (this.isDrawn && !iForce)
			return true;

		if (! this.tileData || ! this.tileData.img || ! this.tileData.img.ip)
			return false;
			
		// Find the canvas elem.
		if (undefined == this.canvasElem) {
			var child = this.element.firstChild;
			for( ; child; child = child.nextSibling)
			{
				if (child.nodeType != Node.ELEMENT_NODE)
					continue;

				if (child.id && child.id == this.parentId + 'imgf')
				{
					this.canvasElem = child;
					break;
				}
			}
		}

		if (! this.canvasElem)
			return false;
			
		// Need to fix this bounds business. Need to 
		var bounds = this.bounds;
						
		var styleLeft = bounds.minX;
		var styleTop = bounds.minY;
		var styleWidth = bounds.maxX - bounds.minX;
		var styleHeight = bounds.maxY - bounds.minY;
		
		this.canvasElem.style.width = "100%";
		this.canvasElem.style.height = "100%";

		this.canvasElem.style.position = "absolute";
		this.canvasElem.style.backgroundColor = '#FFFFFF';
		
		var imagePath = this.tileData.img.ip;
		var img = cp.movie.im.images[imagePath];
		if ( img && img.nativeImage.complete )
		{
			var lResponsiveStyleObj = cp.createResponsiveStyleObj(undefined, undefined, "0px", "0px", undefined, undefined, "100%", "100%", undefined);
			lResponsiveStyleObj.ipiv = true;
			var canvas = this.canvas = cp.createResponsiveCanvas(lResponsiveStyleObj, this.canvasElem.clientWidth, this.canvasElem.clientHeight, this.canvasElem);
			
			var gc = canvas.gc;
			
			gc.save();

			var bStretch = this.tileData.s;
			var bTile = this.tileData.t;
			if ( bTile ) {
				gc.rect( 0, 0, this.canvasElem.clientWidth, this.canvasElem.clientHeight);
				var transObj = this.getTranslationValuesForTiletype(this.tileData);
				gc.translate( transObj.x, transObj.y );
				var pat = gc.createPattern( img.nativeImage, "repeat" );
				gc.fillStyle = pat;
				gc.fill();	
			}
			else if ( bStretch ) 
				gc.drawImage( img.nativeImage, 0, 0, this.canvasElem.clientWidth, this.canvasElem.clientHeight);
			else 
			{
				var WFactor = this.canvasElem.clientWidth/cp.D.project.w;
				var HFactor = this.canvasElem.clientHeight/cp.D.project.h;

				var lImageW = img.nativeImage.width*WFactor;
				var lImageH = img.nativeImage.height*HFactor;

				var curCanvasWidth = styleWidth*WFactor;
				var curCanvasHeight = styleHeight*HFactor;

				var xTrans = Math.floor((curCanvasWidth-lImageW)/2);
				var yTrans = Math.floor((curCanvasHeight-lImageH)/2);

				gc.translate( xTrans, yTrans );
				gc.drawImage( img.nativeImage, 0, 0, Math.floor(lImageW), Math.floor(lImageH));
			}	

			gc.restore();
			gc = null;
			canvas = null;
			this.isDrawn = true;

			return true;
		}

		return false;
	}
})(window.cp);