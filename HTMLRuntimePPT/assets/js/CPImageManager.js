(function(cp)
{
	cp.ImageObject = function(imageManager, src, isProjectImage)
	{
		this.im = imageManager;
		this.nativeImage = new Image();this.nativeImage.cpImage = this;
		this.src = src;
		this.complete = false;//nativeImage.complete is *readonly* and *true* by default
		this.loaders = {};
		this.preloaded = false;
		this.isProjectImage = isProjectImage;
		this.includedInViews = {};
		this.monitorFunc = function(event)
		{
			event.target.cpImage.complete = true;
			if(cp.responsive &&
				cp.movie.stage && cp.movie.stage.lastFrame < cpInfoCurrentFrame)
			{
				if(cp.movie.im && !cp.movie.im.imagesNotLoaded())
				{
					cp.adjustResponsiveItems();
				}
			}
			if(cp.movie.im.verbose)
				cp.log('loaded ' + event.target.src);
		}
	}
	
	cp.ImageObject.prototype = 
	{
		isIncludedInView: function()
		{
			var lRet = !cp.responsive;
			if(cp.responsive)
			{
				if(this.isProjectImage)
					return true;
				var lDeviceMaxWidth, lDeviceMinWidth = cp.ResponsiveProjWidth;
				if(cp.DESKTOP != cp.device)
				{
					if(window.innerWidth > window.innerHeight) 
					{
						lDeviceMaxWidth = window.innerWidth;
						lDeviceMinWidth = window.innerHeight;
					}
					else
					{
						lDeviceMaxWidth = window.innerHeight;
						lDeviceMinWidth = window.innerWidth;
					}
					lDeviceMaxWidth = cp.getCorrectBreakpoint(lDeviceMaxWidth);
					lDeviceMinWidth = cp.getCorrectBreakpoint(lDeviceMinWidth);

					lRet = (this.includedInViews[lDeviceMaxWidth] == 1) || (this.includedInViews[lDeviceMinWidth] == 1);
				}				
				else
				{
					if(cp.m_isPreview)
						lRet = true;
					else
					{
						lDeviceMaxWidth = cp.getCorrectBreakpoint(window.innerWidth);
						lRet = (this.includedInViews[lDeviceMaxWidth] == 1);
					}
				}
			}

			return lRet;
		},

		load: function(loader, monitor)
		{
			if(undefined == this.src || '' == this.src || null == this.src)
				return;
			
			if(cp.responsive && !this.isIncludedInView())
				return;

			if(this.im.verbose)
			{
				cp.log('load (monitor = '+ monitor+') ' + this.src);
				if(this.complete)
					cp.log('completed');
				if(this.nativeImage.onload)
					cp.log('onload is set');
			}
			
			if(!this.complete && !this.nativeImage.onload)
			{
				if(true == monitor)
					this.monitor = true;
				else
					this.monitor = false;
				this.nativeImage.onload = this.monitorFunc;
			}
			
			if(!this.complete && this.nativeImage.onload)
			{
				if(true == monitor)
					this.monitor = true;
			}

			this.loaders[loader] = 1;
			if(this.im.verbose)
				cp.log('loaded by = ' + loader);

			if(true != monitor)
				this.preloaded = true;

			if(this.nativeImage.src != '')
				return;

			if(this.im.verbose)
				cp.log('loading ' + this.src);
			this.nativeImage.src = this.src;

			return true;
		},
		
		unload:function(loader)
		{
			if(this.im.verbose)
				cp.log('unload ' + this.src + ' preloaded = ' + this.preloaded);
			
			if(this.loaders[loader])
				delete this.loaders[loader];
				
			var j = 0;
			for(var i in this.loaders)
			{
				++j;
			}
			if(j == 0)
			{
				if(this.im.verbose)
					cp.log('unloading ' + this.src);
				this.nativeImage = new Image();this.nativeImage.cpImage = this;
				this.complete = false;
				this.preloaded = false;
				this.monitor = false;
				return true;
			}

			return false;
		}
	}
	
	cp.ImageManager = function()
	{
		cp.movie.im = this;
		this.images = {};
		this.preloadingProjectImages = false;
		this.m_projectImages = {};
		this.verbose = false;
		this.reset();
		
		var projectImages = cp.model.projectImages;
		for (var i=0; i<projectImages.length; ++i)
		{
			this.m_projectImages[projectImages[i]] = new cp.ImageObject(this, projectImages[i], true);
		}
		
		var images = cp.model.images;
		for (var i=0; i<images.length; ++i)
		{
			var imageJSONObj = images[i];
			var imagePath = cp.responsive ? imageJSONObj.ip : imageJSONObj;
			var lImageObj = new cp.ImageObject(this, imagePath, false);
			if(cp.responsive)
				lImageObj.includedInViews = imageJSONObj.ipiv;
			this.images[imagePath] = lImageObj;
		}
	}
	
	cp.ImageManager.prototype = 
	{
		imagesNotLoaded : function()
		{
			var pendingImages = 0;
			
			if(this.preloadingProjectImages)
			{
				for(var i in this.m_projectImages)
				{
					if(this.m_projectImages[i].monitor && !this.m_projectImages[i].complete)
						++pendingImages;
				}
			}
			else
			{
				for(var i in this.images)
				{
					if(this.images[i].monitor && !this.images[i].complete)
						++pendingImages;
				}
			}
			
			if(this.verbose && pendingImages > 0)
				cp.log(pendingImages + ' imaged pending');
			return pendingImages > 0;
		},

		loadImages: function(slideIndex, imageNames, monitor, iProjectImages)
		{
			if(imageNames.length == 0)
				return;
						
			this.preloadingProjectImages = iProjectImages ? true : false;
			
			for(var i = 0; i < imageNames.length; ++i)
			{
				var imageName = imageNames[i];
				var img = iProjectImages ? this.m_projectImages[imageName]:this.images[imageName];
				if(!img)
				{
					img = new cp.ImageObject(this, imageName, iProjectImages);
					if(iProjectImages)
						this.m_projectImages[imageName] = img;
					else
						this.images[imageName] = img;
				}				
					
				img.load(slideIndex, monitor);				
			}
			/*if(true == monitor)
			{
				if(this.imagesNotLoaded())
					cp.movie.pause(cp.ReasonForPause.WAIT_FOR_RESOURCES);
			}*/
		},
		
		unloadImage: function(slideIndex, imageName)
		{
			var img = this.images[imageName];
			if(img)
			{
				img.unload(slideIndex);
			}
		},
		reset: function()
		{
			if(this.preloadingProjectImages)
			{
				for(var i in this.m_projectImages)
					this.m_projectImages[i].monitor = false;
			}
			else
			{
				for(var i in this.images)
					this.images[i].monitor = false;
			}
		}
	}
})(window.cp);