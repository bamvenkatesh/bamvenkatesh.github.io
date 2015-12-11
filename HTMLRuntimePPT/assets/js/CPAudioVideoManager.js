(function(cp)
{
	cp.redrawVideo = function(iNativeVideoElem)
	{
		//Fix for bug - #3656414
		//This is a hack.
		//This function is added just for Safari >= 7.0 release on MAC OS X >= 10.9.
		//Although there is no check for OS as it seems that no other OS can have it.
				
		if(cp.DESKTOP != cp.device)
			return;

		if(cp.SAFARI === cp.browser && cp.browserVersion >= 7)
		{
			//following line used to play the video but with a flicker.
			//iNativeVideoElem.offsetHeight = iNativeVideoElem.offsetHeight;
			
			//following line plays video without any flicker but has some changes in other parts of code as well. Search for "#3656414" in the JS files.
			setTimeout(function(){iNativeVideoElem.controls = false;},40);
		}		
	};	

	cp.MediaSeeker = function()
	{
		cp.movie.ms = this;
		this.retryQueue = {};
		this.verbose = false;
		
		this.enabled = false;//MediaSeeker turned out to be a disaster on multiple browser/device combinations
		if((cp.browser == cp.MSIE && cp.browserVersion >= cp.MSIE_MIN_SUPPORTED_VERSION) ||
		(cp.browser == cp.FIREFOX && cp.browserVersion >= cp.FF_MIN_SUPPORTED_VERSION) ||
		(cp.OS == cp.WINDOWS && cp.browser == cp.CHROME && cp.browserVersion >= cp.CHROME_MIN_SUPPORTED_VERSION) ||
		(cp.device == cp.IDEVICE && cp.IOSMajor >= cp.IOS4) ||
		cp.device == cp.ANDROID)
			this.enabled = true;//selectively enable MediaSeeker
	
		if(this.verbose)
			cp.log('MediaSeeker enabled = ' + this.enabled);
	}
	
	cp.MediaSeeker.prototype = 
	{
		resetFlags: function(cpMedia)
		{
			delete cpMedia.retryCount;
			delete cpMedia.lastKnownBuffered;
			delete cpMedia.thulped;
			delete cpMedia.resting;
			delete cpMedia.rested;
			delete cpMedia.failure1;
			delete cpMedia.failure2;
		},
		
		addToQueue: function(cpMedia)
		{
			if(!this.enabled)
				return;
			this.retryQueue[cpMedia.id] = cpMedia;
			cpMedia.retryCount = 1;
			cpMedia.lastKnownBuffered = 0;
			cpMedia.thulped = false;
			cpMedia.resting = false;
			cpMedia.rested = false;
			cpMedia.failure1 = 0;
			cpMedia.failure2 = 0;
		},
		removeFromQueue: function(cpMedia)
		{
			if(!this.enabled)
				return;
			this.resetFlags(cpMedia);
			delete this.retryQueue[cpMedia.id];
		},
		inQueue: function(cpMedia)
		{
			if(!this.enabled)
				return false;
			if(this.retryQueue[cpMedia.id])
				return true;
			return false;
		},
		hasSeeked: function(cpMedia)
		{
			if(!this.enabled)
				return true;
			++cpMedia.retryCount;

			var nativeMedia = cpMedia.nativeAudio;
			if(!nativeMedia)
				nativeMedia = cpMedia.nativeVideo;
			
			if(!nativeMedia)
			{
				if(this.verbose)
					cp.log('MediaSeeker: no native media to seek ' + cpMedia.id);
				return true;
			}
			
			if(undefined == cpMedia.seekToTime)
			{
				if(this.verbose)
					cp.log('MediaSeeker: seekToTime is undefined ' + cpMedia.id);
				return true;
			}
			
			if(cpMedia.thulped)
			{
				if(cpMedia.retryCount < 3)
					return false;
				else
				{
					if(this.verbose)
						cp.log('retrying thulped media ' + cpMedia.id + ' seekToTime = ' + cpMedia.seekToTime);
					cpMedia.thulped = false;
					cpMedia.retryCount = 0;
					nativeMedia.src = cpMedia.src;
					nativeMedia.load();
					return false;
				}
			}
			
			if(cpMedia.resting)
			{
				if(cpMedia.retryCount >= 3)
				{
					if(this.verbose)
						cp.log('retrying rested media ' + cpMedia.id + ' seekToTime = ' + cpMedia.seekToTime);
					cpMedia.resting = false;
					cpMedia.rested = true;
					cpMedia.retryCount = 0;
				}
				return false;
			}

			if(cpMedia.seekToTime < 0)
				cpMedia.seekToTime = 0;
				
			if(isNaN(nativeMedia.duration) || !isFinite(nativeMedia.duration))
			{
				if(this.verbose)
					cp.log('MediaSeeker: duration is NAN ' + cpMedia.id );
				
				if(cpMedia.seekToTime == 0)
					return true;//no need to seek to beginning if the video is yet to load. It will anyway play from zero
				
				if(cpMedia.rested)
				{
					cpMedia.rested = false;
					++cpMedia.failure1;
					if(cpMedia.failure1 >= 2)
					{
						if(cp.exceptionalLogs)
							console.log(cpMedia.id + ' gotStuck while seeking (NAN). gave up seeking');
						return true;
					}

					cpMedia.thulped = true;
					try{
						nativeMedia.src = '_cp_n_m_';//cp_non_existing_media
					}catch(e){}
					try{
						nativeMedia.load();
					}catch(e){}
				}
				else
					cpMedia.resting = true;
				return false;
			}

			if(cpMedia.seekToTime > nativeMedia.duration)
				cpMedia.seekToTime = nativeMedia.duration;
			
			var seekSuccess = true;
			try{
				nativeMedia.currentTime = cpMedia.seekToTime;
				var delta = Math.abs(nativeMedia.currentTime - cpMedia.seekToTime);
				if(delta >= 0.05)
				{
					seekSuccess = false;
					var b = nativeMedia.buffered;
					var buffered = b.end(b.length - 1);
					if(cpMedia.lastKnownBuffered == b)
					{
						if(cpMedia.rested)
						{
							cpMedia.rested = false;
							++cpMedia.failure2;
							if(cpMedia.failure2 >= 2)
							{
								if(cp.exceptionalLogs)
									console.log(cpMedia.id + ' gotStuck while seeking (CONST BUFF). gave up seeking');
								return true;
							}

							cpMedia.thulped = true;
							try{
								nativeMedia.src = '_cp_n_m_';
							}catch(e){}
							try{
								nativeMedia.load();
							}catch(e){}
						}
						else
							cpMedia.resting = true;
					}
					else
					{
						cpMedia.lastKnownBuffered = b;
					}
				}
			}
			catch(e)
			{
				var delta = Math.abs(nativeMedia.currentTime - cpMedia.seekToTime);
				if(delta >= 0.05)
					seekSuccess = false;
				else
					seekSuccess = true;
			}
			
			if(this.verbose && seekSuccess)
				cp.log('MediaSeeker: ' + cpMedia.id + ' currentTime = ' + nativeMedia.currentTime);
			return seekSuccess;
		},
		
		pendingItems: function()
		{
			if(!this.enabled)
				return 0;
				
			var numPending = 0;
			for(var i in this.retryQueue)
			{
				var j = this.retryQueue[i];
				if(this.hasSeeked(j))
				{
					delete j.seekToTime;
					this.removeFromQueue(j);
					if(j.revoke)
					{
						delete j.revoke;
						if(this.verbose)
							cp.log('MediaSeeker revoking play of ' + j.id);
						j.play();
					}
				}
				else
				{
					++numPending;
				}
			}
			
			if(this.verbose && numPending && this.numPending != numPending)
				cp.log('MediaSeeker: ' + numPending + ' items pending seek');

			this.numPending = numPending;
			
			if(cp.verbose && numPending > 0)
				cp.log(numPending + ' pendingForSeek');
			return numPending;
		},
		
		reset: function()
		{
			for(var i in this.retryQueue)
			{
				var j = this.retryQueue[i];
				delete j.seekToTime;
				delete j.revoke;
				this.resetFlags(j);
			}
			
			this.retryQueue = {};
		}
	}
	
	cp.NativeAudio = function()
	{
		var dummyNativeAudio = function()
		{
			this.currentTime = 0;
			this.duration = 0;
			this.paused = true;
			this.ended = true;
			this.defaultPlaybackRate = 0;
			this.playbackRate = 1.0;
			this.played = false;
			this.seeking = false;
			this.seekable = false;
			this.fastSeek = false;
			this.src = "";
			this.crossorigin = false;			
			this.preload = false;
			this.autoplay = false;
			this.mediagroup = "";
			this.loop = false;
			this.muted = false;
			this.controls = false;		
		};
		
		dummyNativeAudio.prototype = 
		{
			load: function() {},
			play: function() {},
			pause: function() {},
			addEventListener: function(a,b,c) {},
			removeEventListener: function(a,b,c){}
		}
		
		if(typeof Audio === "undefined" || !Audio)		
		{
			var a = document.createElement('audio');
			if(a.load == undefined ||
			a.play == undefined ||
			a.pause == undefined ||
			a.addEventListener == undefined)
				return new dummyNativeAudio();
			else
				return a;
		}		
		
		return new Audio();
	}
	
	cp.AudioObject = function(audioManager, id, src, fromFrame, toFrame, duration, restOfProject)
	{
		this.am = audioManager;
		this.id = id;
		this.nativeAudio = null;
		this.src = cp.getCorrectMediaPath(src);
		this.from = fromFrame;
		this.to = toFrame;
		if(duration)
			this.duration = duration/1000;//convert from mS to seconds
		this.ended = false;
		this.hidden = false;
		this.paused = true;
		this.loop = false;
		this.cploop = false;
		this.gotStuck = 0;
		this.rp = restOfProject;
	}
	
	cp.AudioObject.prototype = 
	{
		load:function()
		{
			if(this.nativeAudio)
				this.nativeAudio.load();
		},
		setSrc:function(src)
		{
			this.src = cp.getCorrectMediaPath(src);
			if(this.nativeAudio)
			{
				this.nativeAudio.cpSrc = cp.getCorrectMediaPath(src);
				this.nativeAudio.src = cp.getCorrectMediaPath(src);
				this.load();
			}
		},
		play: function()
		{
			if(this.ended == true || this.hidden)
			{
				return;
			}
			
			if(!this.paused)
			{
				if(cp.device == cp.IDEVICE && !cp.multiAudioTrack && this.nativeAudio)
				{
					if(this.lastTime == this.nativeAudio.currentTime)
					{
						++this.gotStuck;
						if(this.gotStuck >= 30)
						{
							if(cp.exceptionalLogs)
								cp.log(this.id + ' ' + this.src + ' gotStuck @' + this.nativeAudio.currentTime);
							this.gotStuck = 0;
							try
							{
								this.nativeAudio.src = '_cp_n_m_';
							}catch(e){};
							this.nativeAudio.src = this.src;
							this.nativeAudio.load();
							this.nativeAudio.play();
						}
					}
					else
					{
						this.lastTime = this.nativeAudio.currentTime;
						this.gotStuck = 0;
					}
				}
				return;
			}

			if(this.paused && this.am.webAudio)
			{
				if(this.am.playWebAudio(this))
				{
					this.paused = false;
					return;
				}
			}

			if(cp.lastMediaPlayReqTime)
			{
				if(((new Date()).getTime() - cp.lastMediaPlayReqTime.getTime()) < 50)
				{
					if(cp.movie.paused)
					{
						if(this.am.verbose)
							cp.log('crowded request postponed ' + this.id);
						var self = this;
						setTimeout(function(){self.play();}, 50);
					}
					else
					{
						if(this.am.verbose)
							cp.log('crowded request denied ' + this.id);
					}
					return;
				}
			}
			
			this.paused = false;
			
			if(this.am.verbose)
				cp.log("AdObjPlay "+ this.id+" "+this.src);

			if(!this.nativeAudio)
				this.am.allocAudioChannel(this, (cp.IDEVICE != cp.device && cp.device != cp.ANDROID));
				
			if(!this.nativeAudio)
				return;
				
			if(this.isSeekPending())
			{
				this.finishPendingSeek();
				return;
			}

			if(cp.device == cp.IDEVICE && cp.multiAudioTrack)
				cp.lastMediaPlayReqTime = new Date();
				
			this.nativeAudio.play();
		},
		resetAndPlay: function()
		{
			if(this.am.verbose)
				cp.log("AudioObject "+ this.id+" resetAndPlay()");
				
			this.ended = false;
			
			this.setCurrentTime(0);
			this.play();
		},
		show: function()
		{
			if(this.am.verbose)
				cp.log("AudioObject "+ this.id+" show()");
			this.hidden = false;
			this.shownAt = cpInfoCurrentFrame;
			this.resetAndPlay();
		},
		hide: function()
		{
			if(this.am.verbose)
				cp.log("AudioObject "+ this.id+" hide()");
		
			this.hidden = true;
			delete this.shownAt;
			this.pause();
		},
		pause: function()
		{
			if(!this.paused && this.am.webAudio)
			{
				if(this.am.pauseWebAudio(this.src))
				{
					/* When a playaudio is running with continue movie at end of audio=true and another playaudio starts, HTML continues the movie. SWF will NOT continue the movie.
					To maintain the same legacy behavior, EndAutoPlayMovie is handled here after onEnded is set to null. */
					if(this.onEndAutoPlayMovie === true)
						cp.movie.play();

					this.paused = true;
					if(this.am.verbose)
						cp.log("webAudio:pause "+ this.id+" "+this.src);
					return;
				}
			}
			
			if(this.isSeekPending())
			{
				if(this.am.verbose && this.revoke)
					cp.log("AdObjPause deleting revoke "+ this.id);
				delete this.revoke;
			}

			if(this.paused)
				return;
			
			this.paused = true;

			if(this.am.verbose)
				cp.log("AdObjPause "+ this.id+" "+this.src);
				
			if(this.nativeAudio)
			{
				this.nativeAudio.pause();
				this.nativeAudio.pausedAt = new Date().getTime();
			}
		},
		setLoop: function(loop, loopFrames)
		{
			this.loop = loop;
			this.loopFrames = loopFrames;
			
			if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
				this.cploop = loop;
			else
			{
				if(this.nativeAudio)
				{
					if(loop)
						this.nativeAudio.loop = true;
					else
						delete this.nativeAudio.loop;
				}
			}
		},
		setCurrentTime: function(time)
		{
			if(this.from == -1 && this.to == -1)//eventAudio
			{
				return;
			}
			
			if(this.am.verbose)
				cp.log("AudioObject "+ this.id+" setCurrentTime("+time+")");

			if(!this.nativeAudio)
			{
				this.seekToTime = time;
				if(this.am.verbose)
					cp.log('no native audio. Kept in pending...');
				return;
			}
		
			if(this.am.verbose)
				cp.log('this.nativeAudio.currentTime = ' + this.nativeAudio.currentTime);
			if(Math.abs(this.nativeAudio.currentTime - time) < 0.1)
			{
				if(this.am.verbose)
					cp.log('not seeking delta < 0.1');
					
				if(!cp.movie.ms.inQueue(this))
				{
					delete this.seekToTime;
				}

				return;
			}
			
			delete this.seekToTime;
			
			if(!this.paused)
			{
				if(this.am.verbose)
					cp.log('setting revoke to true');
				this.revoke = true;
				this.pause();
			}
			
			var seekSuccess = true;
			try
			{
				this.nativeAudio.currentTime = time;
				var delta = Math.abs(this.nativeAudio.currentTime - time);
				if(delta >= 0.05)
					seekSuccess = false;
			}
			catch(e)
			{
				var delta = Math.abs(this.nativeAudio.currentTime - time);
				if(delta >= 0.05)
					seekSuccess = false;
				else
					seekSuccess = true;
			}
			
			if(this.am.verbose)
				cp.log('seekSuccess = ' + seekSuccess);
			
			if(cp.movie.ms.enabled)
			{
				if(seekSuccess)
				{
					if(this.revoke)
					{
						if(this.am.verbose)
							cp.log('revoking play');
						delete this.revoke;
						this.play();
					}
				}
				else
				{
					if(this.am.verbose)
						cp.log('pause movie and add to seekQueue');

					this.seekToTime = time;
					//this.pause(cp.ReasonForPause.WAIT_FOR_RESOURCES);
					cp.movie.ms.addToQueue(this);
				}
			}
			else
			{
				if(this.revoke)
				{
					if(this.am.verbose)
						cp.log('revoking play');
					delete this.revoke;
					this.play();
				}
			}
		},
		isSeekPending: function()
		{
			if(this.from == -1 && this.to == -1)//eventAudio
			{
				return false;
			}
			var result = (undefined != this.seekToTime);
			//if(this.am.verbose)
				//cp.log("AudioObject "+ this.id+" isSeekPending " + result);
			return result;
		},
		finishPendingSeek: function()
		{
			if(!this.nativeAudio || !this.isSeekPending())
				return;
			
			if(this.am.verbose)
				cp.log("AudioObject "+ this.id+" finishPendingSeek");

			this.setCurrentTime(this.seekToTime);
		},
		seekTo: function(frame)
		{
			if(this.from == -1 && this.to == -1)//eventAudio
			{
				return true;
			}
			
			//if(this.from > frame) //removing this so that seeking from right to left is also taken care of
			//	return false;
				
			if(this.am.verbose)
				cp.log("AudioObject "+ this.id+" seekTo("+frame+")");
			if(this.loop && this.loopFrames)
			{
				if(this.from <= frame)
				{
					var f = (frame - this.from) % this.loopFrames;
					this.setCurrentTime(f /cpInfoFPS);
					this.ended = false;
					return true;
				}
			}
			else
			{
				if(this.from <= frame && this.to >= frame)
				{
					this.setCurrentTime((frame - this.from)/cpInfoFPS);
					this.ended = false;
					return true;
				}
				else if(this.to >= frame)
				{
					this.setCurrentTime(0);
					this.ended = false;
				}
			}
			
			if(this.id == 'bga' && !this.loop)
				this.ended = true;
			return false;
		}
	}	
    
    // This is like an interface
    // External libraries who want to avail the benefit of channel allocation, pre-loading, pause, resume, slide switch callbacks, automatic mute
    // and volume control handling by CpLibrary should implement this interface and populate cp.am.extAudios, Cp will then do all of the above.
    // External may override the functions defined for ExtAudioObject.prototype to take the control. 

    // This interface should be similar to cp.AudioObject in terms of member variables so that all the functions of cp.AudioManager work properly
    // But the implementation of member functions (play, pause, seek) will differ and need to be overridden by the guys deriving it.
    cp.ExtAudioObject = function(audioManager, id, src, from, to)
	{
		this.am = audioManager;
		this.id = id;
		this.nativeAudio = null;
		this.src = cp.getCorrectMediaPath(src);
        
        // These are dummy values, the external guys should control his own playback
        this.from = from;
		this.to = to;    // LRUAudioIndex uses this to find out the free audio channel

		this.ended = false;
        this.hidden = false;
		this.paused = true;
		
        // Don't use these 2, else cp will take control, create ur own variables in ur object and use them in ur implementation
        this.loop = false;
        this.cploop = false;

		this.gotStuck = 0;
	}
	
	cp.ExtAudioObject.prototype = 
	{
		load:function()
		{
			if(this.nativeAudio)
				this.nativeAudio.load();
		},

        // Here we have defined only those functions that can ever be called on extAudios objects by cp.am, they are just there to avoid exceptions at runtime
        // if they are useful to external guys they might override them.	
		play: function() // Pure virtual
		{
			// Nothing is done here, derived guy should implement it 
		},
		pause: function(reasonForPause)
		{
			if(this.paused)
				return;
			
			this.paused = true;
		
			if(this.nativeAudio)
			{
				this.nativeAudio.pause();
				this.nativeAudio.pausedAt = new Date().getTime();
			}
		},
		isSeekPending: function()
		{
			return false;
		},
		finishPendingSeek: function()
		{
		},
		seekTo: function(frame)
		{
			return true; // dummy implementation is always successfully
		},

        // Will be called on slide switch or when the audio need to be stopped
        reset: function()
        {
        }
	}


    // -----------------------------------------
	cp.MediaView = function(channel)
	{
		this.a = channel;
		
		if(!cp.MediaView.PROGRESS_WIDTH)
		{
			cp.MediaView.PROGRESS_WIDTH = 300;
			cp.MediaView.STATUS1_WIDTH = 100;
			cp.MediaView.STATUS2_WIDTH = 100;
			cp.MediaView.STATUS3_WIDTH = 100;
			cp.MediaView.STATUS4_WIDTH = 50;
			cp.MediaView.STATUS_WIDTH = cp.MediaView.STATUS1_WIDTH + cp.MediaView.STATUS2_WIDTH + cp.MediaView.STATUS3_WIDTH + cp.MediaView.STATUS4_WIDTH;
			cp.MediaView.LEFT_OFFSET = 260;
			cp.MediaView.TOP_OFFSET = 5;
			cp.MediaView.HEIGHT = 15;
			cp.MediaView.GAP = 5;
			cp.MediaView.NUM_MEDIA_VIEWS = 0;
		}
		
		this.view = cp.newElem("div");
		this.status = cp.newElem("div");
		this.status2 = cp.newElem("div");
		this.status3 = cp.newElem("div");
		this.status4 = cp.newElem("div");
		this.progressBar = cp.newElem("div");
		this.srcNameBar = cp.newElem("div");
		this.downloaded = cp.newElem("div");
		this.playHead = cp.newElem("div");
		document.body.appendChild(this.view);
		this.view.appendChild(this.status);
		this.view.appendChild(this.status2);
		this.view.appendChild(this.status3);
		this.view.appendChild(this.status4);
		this.view.appendChild(this.progressBar);
		this.progressBar.appendChild(this.downloaded);
		this.progressBar.appendChild(this.playHead);
		this.progressBar.appendChild(this.srcNameBar);
		
		this.view.style.cssText = "z-index:100;display:block; position:fixed; left:"+cp.MediaView.LEFT_OFFSET+"px; top:" + (cp.MediaView.TOP_OFFSET + cp.MediaView.NUM_MEDIA_VIEWS * (cp.MediaView.HEIGHT+cp.MediaView.GAP)) + "px; width:" + (cp.MediaView.STATUS_WIDTH + cp.MediaView.PROGRESS_WIDTH) +"px; height:"+cp.MediaView.HEIGHT+"px; background-color:#555555;opacity:0.5";
		this.status.style.cssText = "z-index:100;display:block; position:absolute; left:0px; top:0px; width:"+cp.MediaView.STATUS1_WIDTH+"px; height:"+cp.MediaView.HEIGHT+"px;background-color:#0000ff";
		this.status2.style.cssText = "z-index:100;display:block; position:absolute; left:"+cp.MediaView.STATUS1_WIDTH+"px; top:0px; width:"+cp.MediaView.STATUS2_WIDTH+"px; height:"+cp.MediaView.HEIGHT+"px;background-color:#ffffff";
		this.status3.style.cssText = "z-index:100;display:block; position:absolute; left:"+(cp.MediaView.STATUS1_WIDTH+cp.MediaView.STATUS2_WIDTH) +"px; top:0px; width:"+cp.MediaView.STATUS3_WIDTH+"px; height:"+cp.MediaView.HEIGHT+"px;background-color:#ffffff";
		this.status4.style.cssText = "z-index:100;display:block; position:absolute; left:"+(cp.MediaView.STATUS1_WIDTH+cp.MediaView.STATUS2_WIDTH+cp.MediaView.STATUS3_WIDTH) +"px; top:0px; width:"+cp.MediaView.STATUS4_WIDTH+"px; height:"+cp.MediaView.HEIGHT+"px;background-color:#ffffff";
		this.progressBar.style.cssText = "z-index:100;display:block; position:absolute; left:" + cp.MediaView.STATUS_WIDTH + "px; top:0px; width:"+cp.MediaView.PROGRESS_WIDTH+"px; height:"+cp.MediaView.HEIGHT+"px;background-color:#888888";
		this.srcNameBar.style.cssText = "z-index:100;display:block; position:absolute; left:0px; top:0px; width:"+cp.MediaView.PROGRESS_WIDTH+"px; height:"+cp.MediaView.HEIGHT+"px;white-space: nowrap; overflow: hidden;";
		this.downloaded.style.cssText = "z-index:100;display:block; position:absolute; left:0px; top:0px; width:0px; height:"+(cp.MediaView.HEIGHT/3)+"px;background-color:#10ff10;";
		this.playHead.style.cssText = "z-index:100;display:block; position:absolute; left:0px; top:0px; width:2px; height:"+(cp.MediaView.HEIGHT/3)+"px;background-color:#101010";
		
		++cp.MediaView.NUM_MEDIA_VIEWS;
	}

	cp.MediaView.prototype = 
	{
		update:function()
		{
			var cpMedia = this.a.cpAudio;
			if(!cpMedia)
				cpMedia = this.a.cpVideo;
			
			var index = this.a.src.indexOf('/ar/');
			if(index == -1)
				index = this.a.src.indexOf('/vr/');
			if(index == -1)
				index = this.a.src.indexOf('_cp_n_m_');
			if(index == -1)
				index = 0;
			var s = this.a.src.substr(index);
			if(cpMedia)
				s += '|' + cpMedia.src + '|' + cpMedia.id;
			this.srcNameBar.innerHTML = "<font style='font-size:9px'>" + s + "</font>";
			
			if(this.a.paused)
				s = 'paused';
			else
				s = 'playing';
			if(this.a.ended)
				s += ' end';
			this.status2.innerHTML = "<font color='#000000' style='font-size:8px'>"+s+"</font>";
			
			if(cpMedia)
			{
				if(cpMedia.paused)
					s = 'paused';
				else
					s = 'playing';
				if(cpMedia.ended)
					s += ' end';
				if(cpMedia.hidden)
					s += ' hdn';
			}
			else
				s = 'NULL';
			
			this.status3.innerHTML = "<font color='#000000' style='font-size:8px'>"+s+"</font>";
			
			switch(this.a.readyState)
			{
			case cp.HAVE_NOTHING:
				s = 'HaveNone';
				this.status4.style.backgroundColor = '#ff0000';
				break;
			case cp.HAVE_METADATA:
				s = 'HaveMeta';
				this.status4.style.backgroundColor = '#ffaa00';
				break;
			case cp.HAVE_CURRENT_DATA:
				s = 'HaveCurr';
				this.status4.style.backgroundColor = '#aacc00';
				break;
			case cp.HAVE_FUTURE_DATA:
				s = 'HaveMore';
				this.status4.style.backgroundColor = '#55ff00';
				break;
			case cp.HAVE_ENOUGH_DATA:
				s = 'HaveAll';
				this.status4.style.backgroundColor = '#00ff00';
				break;
			default:
				s = '???';
				this.status4.style.backgroundColor = '#555555';
				break;
			}
			
			this.status4.innerHTML = "<font color='#000000' style='font-size:8px'>"+s+"</font>";
			
			if(this.a.ended)
			{
				this.status.style.backgroundColor = "#ffff00";
				this.status.innerHTML = "<font color='#000000' style='font-size:8px'>Ended</font>";
			}
			else if(this.a && this.a.networkState == this.a.NETWORK_EMPTY)
			{
				this.status.style.backgroundColor = "#000000";
				this.status.innerHTML = "<font color='#ffffff' style='font-size:8px'>Empty</font>";
			}
			else if(this.a && this.a.networkState == this.a.NETWORK_IDLE)
			{
				this.status.style.backgroundColor = "#aaaaaa";
				this.status.innerHTML = "<font color='#000000' style='font-size:8px'>Idle</font>";
			}
			else if(this.a && this.a.networkState == this.a.NETWORK_LOADING)
			{
				this.status.style.backgroundColor = "#00ff00";
				this.status.innerHTML = "<font color='#000000' style='font-size:8px'>Loading</font>";
			}
			else if(this.a && this.a.networkState == this.a.NETWORK_NO_SOURCE)
			{
				this.status.style.backgroundColor = "#ff0000";
				this.status.innerHTML = "<font color='#ffffff' style='font-size:8px'>NoSrc</font>";
			}

			var duration;
			if(this.a && !isNaN(this.a.duration) && isFinite(this.a.duration))
				duration = this.a.duration;
			else if(cpMedia && cpMedia.duration)
				duration = cpMedia.duration;
				
			if(duration)
			{
				var buffered = this.a.buffered;
				if(buffered.length)
				{
					var downloaded = buffered.end(buffered.length - 1);
					this.downloaded.style.width = ((downloaded/duration)*cp.MediaView.PROGRESS_WIDTH) + 'px';
				}

				this.playHead.style.left = (this.a.currentTime/duration)*cp.MediaView.PROGRESS_WIDTH + 'px';
			}
			else
			{
				this.downloaded.style.width = '0px';
				this.playHead.style.left  = '0px';
			}
		}
	}
	
	cp.AudioView = cp.MediaView;
	cp.VideoView = cp.MediaView;
	
	cp.AudioManager = function()
	{
		cp.movie.am = this;
		this.volume = 1;
		this.muted = false;
		this.loaded = false;
		this.verbose = false;
		this.viewAudio = false;
		
		if(window.location.protocol.substr(0,4) == 'http')
		{
			var audioContext = window.AudioContext || window.webkitAudioContext;
			if(audioContext)
			{
				this.webAudio = new audioContext();
				this.webAudioCache = {};
				this.webAudioReq = 0;
				this.webAudioLoaded = 0;
			}
		}
		
		this.errorCallBackFn = function(e)
		{
			if(-1 == this.src.indexOf('_cp_n_m_'))
			{
				if(cp.exceptionalLogs)
				{
					cp.log('src = ' + this.src + ' error code = ' + (this.error?this.error.code:'NULL') + ' n/w state = ' + this.networkState);
					cp.log(e);
				}
				
				this.waitCount = 0;
			}
		}
		
		this.waitingFn = function(e)
		{
			var duration;
			if((!isNaN(this.duration)) && isFinite(this.duration)) 
				duration = this.duration;
			else if(this.cpAudio && this.cpAudio.duration)
				duration = this.cpAudio.duration;
			
			if(duration)
			{
				var delta = Math.abs(this.currentTime - duration);
				if(cp.movie.am.verbose)
					cp.log(this.cpSrc + ' wait came when delta = ' + delta + ' duration = ' + duration);
				if( delta < 0.3)//some arbitrary cut off
				{
					if(duration < 0.3)//for example, mouse click
						return;
					else
					{
						if(cp.movie.am.verbose)
							cp.log('simulating arrival of ended event');
						cp.movie.am.onEndedCallBackFn.call(this, e);
						return;
					}
				}
			}
			++this.waitCount;
			if(cp.movie.am.verbose)
			{
				var s = 'wait ' + this.waitCount + ' ' + this.cpSrc  + ' currTime = ' + this.currentTime + ' duration = ' + duration + ' curFrame = ' + cpInfoCurrentFrame;
					
				if(this.cpAudio)
				{
					s += ' id = ' + this.cpAudio.id;
					s += ' from ' + this.cpAudio.from;
					s += ' to ' + this.cpAudio.to;
				}
				cp.log(s);
			}
		}
		
		this.canPlayCallBackFn = function(e)
		{
			this.waitCount = 0;
			
			if(cp.movie.am.verbose)
				cp.log('cnPly ' + this.cpSrc + ' ' + (this.cpAudio?this.cpAudio.id:''));
		}
		
		this.onEndedCallBackFn = function(e)
		{
			this.waitCount = 0;
			if(this.cploop)
			{
				if(cp.movie.am.verbose)
					cp.log(this.cpSrc+' loop');
				if(this.cpAudio)
				{
					this.cpAudio.pause();
					this.cpAudio.seekTo(this.cpAudio.from);
					this.cpAudio.play();
				}
			}
			else
			{
				if(cp.movie.am.verbose)
					cp.log(this.cpSrc+' ended');
				this.endedAt = new Date().getTime();
				if(this.cpAudio)
				{
					this.cpAudio.ended = true;
					this.cpAudio.pause();
					
					if(this.cpAudio.onEndAutoPlayMovie)
					{
						delete this.cpAudio.onEndAutoPlayMovie;
						cp.movie.play();
					}
				}
			}
		}		
		
		this.PlayPauseCallBackFn = function(e)
		{
			if(this.paused)
			{
				this.pausedAt = new Date().getTime();
			}
			if(this.cpAudio)
				this.cpAudio.paused = this.paused;
		}
		
		if(cp.multiAudioTrack)
			this.MAX_AUDIO_CHANNELS = 10;
		else
			this.MAX_AUDIO_CHANNELS = 1;

		this.audioChannels = new Array();
		
		for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
		{
			var a = cp.NativeAudio();
			a.cpSrc = '';
			a.cpAudio = null;
			a.ended = false;
			a.addEventListener("ended", this.onEndedCallBackFn, false);
			a.addEventListener("error", this.errorCallBackFn, false);
			
			if(cp.waitForAudio)
			{
				a.addEventListener("waiting", this.waitingFn, false);
				a.addEventListener("canplay", this.canPlayCallBackFn, false);
			}
			
			a.addEventListener("play", this.PlayPauseCallBackFn, false);
			a.addEventListener("pause", this.PlayPauseCallBackFn, false);
			a.waitCount = 0;
			a.muted = this.muted;
			a.volume = this.volume;
			this.audioChannels[i] = a;
		}
		
		if(this.verbose)
		{
			var tmp = cp.NativeAudio();
			cp.log('NetworkStates: NETWORK_EMPTY = ' + tmp.NETWORK_EMPTY + ' NETWORK_IDLE = ' + tmp.NETWORK_IDLE + ' NETWORK_LOADING = ' + tmp.NETWORK_LOADING + ' NETWORK_NO_SOURCE = ' + tmp.NETWORK_NO_SOURCE);
			tmp = null;
		}
	}
		
	cp.AudioManager.prototype = 
	{
		unlockWebAudio: function()
		{
			if(this.webAudio)
			{
				var buffer = this.webAudio.createBuffer(1, 1, 22050);
				var source = this.webAudio.createBufferSource();
				source.buffer = buffer;
				source.connect(this.webAudio.destination);
				source.noteOn = source.noteOn || source.start;

				source.noteOn(0);
				var that = this;

				setTimeout(function() {
					if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
						that.webAudioUnlocked = true;
						if(that.verbose)
							cp.log('web audio unlocked');
					}
				}, 100);
			}
		},
		
		loadWebAudio: function(url) //typically click sounds, key-tap sounds etc.
		{
			var that = this;
			var node = {};
			node.sync = 0;
			node.retry = 0;
			
			function syncStream(node){
				var buf8 = new Uint8Array(node.buf); 
				buf8.indexOf = Array.prototype.indexOf;
				var i=node.sync, b=buf8;
				while(1) {
					++node.retry;
					i=b.indexOf(0xFF,i); if(i==-1 || (b[i+1] & 0xE0 == 0xE0 )) break;
					++i;
				}
				if(i!=-1) {
					var tmp=node.buf.slice(i);
					delete(node.buf);
					node.buf=tmp;
					node.sync=i;
					return true;
				}
				return false;
			}
			
			function initSound(node) {
				try{
					that.webAudio.decodeAudioData(node.buf, 
						function(buffer) {
							var webAudio = {}; webAudio.buffer = buffer; that.webAudioCache[url] = webAudio;
						}, 
						function() {
							if(cp.exceptionalLogs)
								cp.log(url + ' Error decoding. Attempting to sync stream');
							if(syncStream(node))
								initSound(node);
						}
					);
				}catch(e){
					if(cp.exceptionalLogs)cp.log(url + ' Error decoding2 ' + e);
				}
			}
			
			if(this.webAudio)
			{
				if(!this.webAudioCache[url])
				{
					++this.webAudioReq;
					this.webAudioCache[url] = {};//this will be eventually overwritten with the audio buffer
					var request = new XMLHttpRequest();
					request.open('GET', url, true);
					request.setRequestHeader('X-Requested-With','XMLHttpRequest');
					request.responseType = 'arraybuffer';
					request.onload = function(e) {
						if(that.verbose)
							cp.log('webAudio:loaded ' + url);
						++that.webAudioLoaded;
						node.buf = e.target.response;
						initSound(node);
					};
					request.send();
				}
			}
		},
		
		playWebAudio: function(audioObject)
		{
			if(this.webAudio)
			{
				var url = audioObject.src;
				var webAudio = this.webAudioCache[url];
				if(webAudio && webAudio.buffer)
				{
					webAudio.source = this.webAudio.createBufferSource(); 
					webAudio.source.buffer = webAudio.buffer; 
					webAudio.source.loop = false;
					webAudio.source.connect(this.webAudio.destination);
					webAudio.source.noteOn = webAudio.source.noteOn || webAudio.source.start;
					
					webAudio.source.onended = function()
					{
						if(audioObject)
						{
							if(cp.movie.am.verbose)
								cp.log(audioObject.cpSrc+' ended')
								
							audioObject.ended = true;
							audioObject.pause(false);

							if(audioObject.onEndAutoPlayMovie)
							{
								delete audioObject.onEndAutoPlayMovie;
								cp.movie.play();
							}
						}
					}

					webAudio.source.noteOn(0);
					
					if(this.verbose)
						cp.log("webAudio:play "+ url);

					return true;
				}
			}
			return false;
		},
		
		pauseWebAudio: function(url)
		{
			if(this.webAudio)
			{
				var webAudio = this.webAudioCache[url];
				if(webAudio)
				{
					if(webAudio.source)
					{
						webAudio.source.onended = null;
						webAudio.source.noteOff = webAudio.source.noteOff || webAudio.source.stop;						
						webAudio.source.noteOff(0);
						delete webAudio.source;
					}
					if(this.verbose)
						cp.log("webAudio:pause "+ url);

					return true;
				}
			}
			return false;
		},
		
		pendingAudios: function()
		{
			var numPending = 0;
			
			if(this.webAudio)
				numPending = (this.webAudioReq - this.webAudioLoaded);
			
			for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
			{
				var a = this.audioChannels[i];
				if(a.waitCount > 0 && !a.ended && !a.paused)
					++numPending;
			}

			if(numPending > 0)
			{
				if(this.numPending != numPending)
				{
					this.numPending = numPending;
					if(cp.verbose)
						cp.log(numPending + ' audios pending');
				}
			}
			else
			{
				if(this.numPending && cp.verbose)
					cp.log('no audios pending');
				this.numPending = 0;
			}

			return numPending;
		},
		
		resetAllWaitingAudios:function()
		{
			for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
			{
				var a = this.audioChannels[i];
				a.waitCount = 0;
			}
		},
		
		LRUAudioIndex: function()
		{
			var t = new Date().getTime();
			var idx = -1;
			var currFrame = cpInfoCurrentFrame;
			for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
			{
				var a = this.audioChannels[i];
				if(a.ended || a.paused)
				{
					if(a.ended && a.endedAt)
					{
						if(t > a.endedAt)
						{
							t = a.endedAt;
							idx = i;
						}
					}
					else if(a.paused && a.pausedAt)
					{
						if(t > a.pausedAt)
						{
							t = a.pausedAt;
							idx = i;
						}
					}
					else if(idx == -1 && currFrame > a.cpTo)
					{
						idx = i;
					}
				}
			}
			return idx;
		},
		
		allocAudioChannel: function(audioObj)
		{
			if(this.verbose)
				cp.log('allocAudioChannel ' + audioObj.id + ' ' + audioObj.src);

			if(this.webAudio && this.webAudioCache[audioObj.src])
			{
				if(this.verbose)
					cp.log('found in web-audio cache');
				return;
			}

			if(!cp.multiAudioTrack)
			{
				var a1 = this.audioChannels[0];
				if(!a1.paused)
				{
					if(a1.cpAudio != null)
						a1.cpAudio.pause();
					else
						a1.pause();
				}

				if(a1.cpAudio != null)
					a1.cpAudio.nativeAudio = null;

				audioObj.nativeAudio = a1;
				a1.cpAudio = audioObj;
				//a1.loop = audioObj.loop;
				a1.cploop = audioObj.cploop;
				a1.ended = false;

				if(a1.cpSrc != audioObj.src)
				{
					a1.waitCount = 0;
					a1.cpSrc = audioObj.src;
					a1.src = audioObj.src;
					
					if(a1.currentTime >0)
						if(this.verbose)
							cp.log('currentTime after changing src = ' + a1.currentTime+ ' going to wait...');
			
					if(cp.IOSFlavor <= cp.IOS5)
					{
						while(a1.currentTime > 0)
							a1.load();
					}
					else
					{
						var lLoadWaitCtr = 0;
						while(a1.currentTime > 0 && ++lLoadWaitCtr < 100)
						{
							if(cp.verbose)
								cp.log("waiting for " + lLoadWaitCtr + " time");
							a1.load();
						}
					}
					
					if(this.verbose)
						cp.log('finished waiting');
				}
				else if(!audioObj.isSeekPending())
					audioObj.seekTo(audioObj.from);
				
				audioObj.finishPendingSeek();
				a1.load();
				return;
			}
			else
			{
				var currFrame = cpInfoCurrentFrame;
				for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				{
					var a = this.audioChannels[i];
					var audioItemIsInRange = (a.cpAudio && a.cpAudio.from <= currFrame && a.cpAudio.to >= currFrame);
					if(a.cpSrc == audioObj.src && (a.ended || a.paused) && !audioItemIsInRange)
					{
						if(a.cpAudio != null)
						{
							a.cpAudio.nativeAudio = null;
							a.cpAudio = null;
						}
						
						audioObj.nativeAudio = a;
						a.cpAudio = audioObj;
						if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
							a.cploop = audioObj.cploop;
						else
							a.loop = audioObj.loop;
						a.ended = false;
						a.cpTo = audioObj.to;

						if(!audioObj.isSeekPending())
							audioObj.seekTo(audioObj.from);

						audioObj.finishPendingSeek();

						if(cp.DESKTOP != cp.device)
							a.load();
						
						if(this.verbose)
							cp.log('allocAudioChannel found existing @ ' + i);
						return true;
					}
				}
				for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				{
					var a = this.audioChannels[i];
					if(a.cpSrc == '')
					{
						a.waitCount = 0;
						a.cpSrc = audioObj.src;
						a.src = audioObj.src;
						audioObj.nativeAudio = a;
						a.cpAudio = audioObj;
						if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
							a.cploop = audioObj.cploop;
						else
							a.loop = audioObj.loop;
						a.ended = false;
						a.cpTo = audioObj.to;
						audioObj.finishPendingSeek();
						a.load();
						if(this.verbose)
							cp.log('allocAudioChannel found empty slot @ ' + i);
						return true;
					}
				}
				var idx = this.LRUAudioIndex();
				if(-1 != idx)
				{
					var a = this.audioChannels[idx];
					if(a.cpAudio != null)
					{
						a.cpAudio.nativeAudio = null;
						a.cpAudio = null;
					}
				
					audioObj.nativeAudio = a;
					a.cpAudio = audioObj;
					if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
						a.cploop = audioObj.cploop;
					else
						a.loop = audioObj.loop;
					a.ended = false;
					a.cpTo = audioObj.to;
					
					if(a.cpSrc != audioObj.src)
					{
						a.waitCount = 0;
						a.cpSrc = audioObj.src;
						a.src = audioObj.src;
					}
					else if(!audioObj.isSeekPending())
						audioObj.seekTo(audioObj.from);

					audioObj.finishPendingSeek();
					a.load();
					if(this.verbose)
						cp.log('allocAudioChannel re-used LRU slot @ ' + idx);
					return true;
				}
			}
			return false;
		},
		
		allocSingletonAudioChannelForPlayAudioAction: function(src)
		{
			if(this.verbose)
				cp.log('allocSingletonAudioChannelForPlayAudioAction ' + src);

			var a = cp.NativeAudio();
			a.addEventListener("ended", this.onEndedCallBackFn, false);
			a.addEventListener("error", this.errorCallBackFn, false);
			if(cp.waitForAudio)
			{
				a.addEventListener("waiting", this.waitingFn, false);
				a.addEventListener("canplay", this.canPlayCallBackFn, false);
			}
			a.addEventListener("play", this.PlayPauseCallBackFn, false);
			a.addEventListener("pause", this.PlayPauseCallBackFn, false);
			a.waitCount = 0;					
			a.cpSrc = src;
			a.src = src;
			cp.movie.am.singletonPlayAudio.nativeAudio = a;
			a.cpAudio = cp.movie.am.singletonPlayAudio;
			a.muted = this.muted;
			a.volume = this.volume;
			a.ended = false;
			a.load();
			
			if(this.audioViews)
				this.audioViews.push(new cp.AudioView(a));
			
		},
		
		load:function()
		{
			//load bg audio
			var bgAudioData = cp.D.pbga;
			if(bgAudioData)
			{
				this.bgAudio = new cp.AudioObject(this, 'bga', bgAudioData.src, 1, bgAudioData.to, bgAudioData.du);
				
				if(bgAudioData.l)
				{
					this.bgAudio.setLoop(true);
				}
				this.bgAudio.stopAtProjectEnd = bgAudioData.spe;
				this.bgAudio.lowerVolumeOnSlidesWithAudio = bgAudioData.lv;
				this.bgAudio.lowerVolumePercentage = bgAudioData.vp;
			}
			
			
			//load slides' audio
			var slideAudioNames = (cp.D.project_main.slideAudios || "").split(',');
			this.slideAudios = {};
			for(var i =0; i < slideAudioNames.length; ++i)
			{
				if('' != slideAudioNames[i])
				{
					var slideAudioData = cp.D[slideAudioNames[i]];
					var newAudioObj = new cp.AudioObject(this, slideAudioNames[i], slideAudioData.src, slideAudioData.from, slideAudioData.to, slideAudioData.du);
					
					if(slideAudioData.l)
					{
						newAudioObj.setLoop(true, slideAudioData.lf);
					}
					
					this.slideAudios[slideAudioNames[i]] = newAudioObj;
					newAudioObj = null;
				}
			}
			
			//load slide items' audios
			var ropAudios = {};
			this.objectAudios = {};
			this.eventAudios = {};
			var slideNames = (cp.D.project_main.slides || "").split(',');
			for(var j=0; j < slideNames.length; ++j)
			{
				var slideData = cp.D[slideNames[j]];
				var objectAudioNames = (slideData.oa || "").split(',');
				var slideObjectAudios = {};
				var slideHasObjectAudio = false;
				for(var k = 0; k < objectAudioNames.length; ++k)
				{
					if('' != objectAudioNames[k])
					{
						var objectAudioData = cp.D[objectAudioNames[k]];
						
						var a;
						if(objectAudioData.rp)
							a = ropAudios[objectAudioNames[k]];
						else
							a = undefined;
						
						if(!a)
						{
							a = new cp.AudioObject(this, objectAudioNames[k], objectAudioData.src, objectAudioData.from, objectAudioData.to, objectAudioData.du, objectAudioData.rp);
							a.mouseAudio = objectAudioData.msa;
							if(objectAudioData.rp)
								ropAudios[objectAudioNames[k]] = a;
						}
							
						slideObjectAudios[objectAudioNames[k]] = a;
						slideHasObjectAudio = true;
					}
				}
				if(slideHasObjectAudio)
				{
					this.objectAudios[slideNames[j]] = slideObjectAudios;
				}
			
				var eventAudioNames = (slideData.ea || "").split(',');
				var slideEventAudios = {};
				var slideHasEventAudio = false;
				for(var k = 0; k < eventAudioNames.length; ++k)
				{
					if('' != eventAudioNames[k])
					{
						var eventAudioData = cp.D[eventAudioNames[k]];
						
						var a;
						if(eventAudioData.rp)
							a = ropAudios[eventAudioNames[k]];
						else
							a = undefined;
							
						if(!a)
						{
							a = new cp.AudioObject(this, eventAudioNames[k], eventAudioData.src, -1, -1, eventAudioData.du, eventAudioData.rp);
							if(eventAudioData.rp)
								ropAudios[eventAudioNames[k]] = a;
						}
						
						slideEventAudios[eventAudioNames[k]] = a;
						slideHasEventAudio = true;
					}
				}
				
				if(slideHasEventAudio)
				{
					this.eventAudios[slideNames[j]] = slideEventAudios;
				}
			}

			if(cp.movie.playKeyTap)
			{
				this.keyTap = new cp.AudioObject(this, 'pkt', 'ar/KeyClick.mp3', -1, -1, undefined);
			}
			
			this.singletonPlayAudio = new cp.AudioObject(this, 'spa', '', -1, -1, undefined);

            // load external audios  
            this.extAudios = {};
			if(cp.extAudioCallbacks)
			{
			    for (var item =0; item < cp.extAudioCallbacks.length; ++item)
				{
					cp.extAudioCallbacks[item](this);
				}
			}
			this.loaded = true;
		},
		
		deviceSpecificFlush: function()
		{
			if((cp.IDEVICE == cp.device || cp.device == cp.ANDROID) && cp.multiAudioTrack)
			{
				var freeSlots = 0;
				for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				{
					var aud = this.audioChannels[i];
					if(aud.src.indexOf('_cp_n_m_') != -1)
					{
						++freeSlots;
						if(freeSlots >= this.MAX_AUDIO_CHANNELS/2)
							return;
					}
				}
				
				for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				{
					var aud = this.audioChannels[i];
					if(aud.ended || aud.paused)
					{
						if(aud.cpAudio != null)
						{
							aud.cpAudio.nativeAudio = null;
							aud.cpAudio = null;
						}
						aud.cpSrc = '';
						aud.waitCount = 0;
						delete aud.cploop;
						aud.ended = false;
						delete aud.cpTo;
						
						if(aud.src.indexOf('_cp_n_m_') == -1)
						{
							try{
								aud.src = '_cp_n_m_';
							}catch(e){}
							try{
								aud.load();
							}catch(e){}
						}
					}
				}
			}
		},
		
		deviceSpecificInit: function()
		{
			if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
			{
				for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				{
					var aud = this.audioChannels[i];
					if(!aud.cpSrc)
					{
						try{
							aud.src = '_cp_n_m_';
						}catch(e){}
					}
					try{
						aud.load();
					}catch(e){}
				}
			}
		},
		
		playKeyTap: function()
		{
			if(this.verbose)
				cp.log('playKeyTap');
				
			if(this.playWebAudio(this.keyTap))
				return;
				
			if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
			{
				if(!cp.multiAudioTrack && (this.audioPlaying || cp.movie.stage.VideoPlaying))
				{
					if(this.verbose)
						cp.log('audioPlaying ' + this.audioPlaying + ' videoPlaying ' + this.videoPlaying);
					return;
				}
			}
			
			if(!this.muted && 1 == cp.movie.speed)
			{
				this.eventAudioPlaying = this.keyTap.id;
				this.keyTap.resetAndPlay();
			}
		},
	
		seekTo:function(frame, isSameSlideSeek)
		{
			if(!this.loaded)
				return -1;
				
			var idx = cp.movie.stage.getSlideIndexForFrame(frame);
			if(-1 == idx)
				return -1;
				
			this.ssc = 0;
			
			this.changeCurrentSlide(idx, frame, false);

			if(this.currentSlide)
			{
				var objectAudios = this.objectAudios[this.currentSlide];
				
				if(objectAudios)
				{
					for(var j in objectAudios)
					{
						var objectAudio = objectAudios[j];
						if(objectAudio)
						{
							if(!objectAudio.seekTo(frame))
							{
								objectAudio.pause();
							}
						}
					}
				}
			}
		
			if(this.currentSlideAudio)
			{
				var slideAudio = this.slideAudios[this.currentSlideAudio];
				
				if(slideAudio)
				{
					if(!slideAudio.seekTo(frame))
					{
						slideAudio.pause();
					}
				}
			}
			
			if(this.bgAudio && (this.bgAudio.paused || this.bgAudio.ended))
			{
				this.bgAudio.seekTo(frame);
			}
			
			//fixing the onSlideEnter playAudio audio issue. seekTo should not pause event audio
			if(this.singletonPlayAudio && isSameSlideSeek)
				this.singletonPlayAudio.pause();
			
            // No need to handle extAudios here
			return idx;
		},
		
		changeCurrentSlide:function(newSlideIdx, newSlideFromFrame, seek)
		{
			this.deviceSpecificFlush();
			
			var newSlide = cp.movie.stage.getSlideNameForIndex(newSlideIdx);
			
			if(newSlide == '' || this.currentSlide == newSlide)
			{
				return;
			}
			
			if(this.verbose)
				cp.log('am changing slide from '+this.currentSlide+ ' to ' + newSlide + ' seek = ' + seek);
			
			this.interactiveItemFound = false;
			this.ssc = 0;//stop slide audio on item click
			this.ssp = 0;//stop slide audio in item pause
			
			if(this.currentSlide)
			{
				var objectAudios = this.objectAudios[this.currentSlide];
				
				if(objectAudios)
				{
					for(var j in objectAudios)
					{
						var objectAudio = objectAudios[j];
						if(objectAudio.mouseAudio)
							setTimeout((function(x){return function(){x.pause();}})(objectAudio), 500);
						else
							objectAudio.pause();
						//objectAudio.seekTo(objectAudio.from);
					}
				}
				
				var eventAudios = this.eventAudios[this.currentSlide];
				
				if(eventAudios)
				{
					for(var k in eventAudios)
					{
						var ea = eventAudios[k];
						if(ea.id.length <= 5 || ea.id.substring(ea.id.length - 5) != 'ClkAd')//don't pause click audios, they get paused on their own...see cp.movie.am.playPauseEventAudio()
							ea.pause();
						else 
							setTimeout((function(x){return function(){x.pause();}})(ea), 500);//pause the click audios after a while since they may appear on a slide boundary
					}
				}
				
				this.singletonPlayAudio.pause();
				
				if(this.currentSlideAudio)
				{
					var slideAudio = this.slideAudios[this.currentSlideAudio];
					if(slideAudio.from > newSlideFromFrame || slideAudio.to < newSlideFromFrame)
					{
						slideAudio.pause();
						if(slideAudio.nativeAudio)
						{
							slideAudio.nativeAudio.cpAudio = null;
							slideAudio.nativeAudio = null;
						}
						if(slideAudio.ended)
							slideAudio.ended = false;
						delete this.currentSlideAudio;
					}
					else if(seek)
					{
						if(cpInfoPrevFrame != newSlideFromFrame - 1)
							slideAudio.seekTo(newSlideFromFrame);
					}
				}

                var extAudios = this.extAudios[this.currentSlide];
				if(extAudios)
				{
					for(var j in extAudios)
					{
						var extAudio = extAudios[j];
						extAudio.reset();
					}
				}
			}
			
			this.currentSlide = newSlide;
			if(!this.currentSlideAudio)
			{
				this.currentSlideAudio = cp.D[this.currentSlide].audioName;
                var slideAudio = this.slideAudios[this.currentSlideAudio];
				if(slideAudio)
					slideAudio.seekTo(newSlideFromFrame);
			}
			
			if(seek)
			{
				if(this.currentSlide)
				{
					var objectAudios = this.objectAudios[this.currentSlide];
					
					if(objectAudios)
					{
						for(var j in objectAudios)
						{
							var objectAudio = objectAudios[j];
							
							if(objectAudio.rp)
							{
								if(objectAudio.ended) 
									objectAudio.seekTo(objectAudio.from);
							}
							else
								objectAudio.seekTo(objectAudio.from);
						}
					}
				}
			}
			
			var currentSlideData = cp.D[this.currentSlide];
			if(currentSlideData && currentSlideData.sba)
			{
				this.stopBGAudio = true;
			}
			else
			{
				this.stopBGAudio = false;
			}
		},
		
		preload: function(slideName)
		{
			if(this.webAudio)
			{
				var eventAudios = this.eventAudios[slideName];
				if(eventAudios)
				{
					for(var k in eventAudios)
					{
						var eventAudio = eventAudios[k];
						if(eventAudio)
							this.loadWebAudio(eventAudio.src);
					}
				}
				
				if(this.keyTap && cp.movie.playKeyTap)
					this.loadWebAudio(this.keyTap.src);
					
				var objectAudios = this.objectAudios[slideName];
				for(var j in objectAudios)
				{
					var objectAudio = objectAudios[j];
					if(objectAudio && objectAudio.mouseAudio)
						this.loadWebAudio(objectAudio.src);
				}
			}
			
			if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID || cp.device == cp.KINDLE)
				return;
				
			if(!this.loaded || 1 != cp.movie.speed)
				return;
			
			if(this.verbose)
				cp.log('audio manager preload ' + slideName);
				
			var slideData = cp.D[slideName];
			if(slideData)
			{
				var slideAudio = this.slideAudios[slideData.audioName];
				if(slideAudio && !slideAudio.nativeAudio)
				{
					if(!this.allocAudioChannel(slideAudio, false))
						return;
				}
			}
			
			var objectAudios = this.objectAudios[slideName];
			for(var j in objectAudios)
			{
				var objectAudio = objectAudios[j];
				
				if(objectAudio && objectAudio.rp && objectAudio.nativeAudio)
					continue;
				if(objectAudio && (!objectAudio.mouseAudio || !this.webAudio))
				{
					if(!this.allocAudioChannel(objectAudio, false))
						return;
				}
			}
			
			if(!this.webAudio)
			{
			var eventAudios = this.eventAudios[slideName];
			if(eventAudios)
			{
				for(var k in eventAudios)
				{
					var eventAudio = eventAudios[k];
					if(eventAudio)
					{
						if(eventAudio.rp && eventAudio.nativeAudio)
							continue;
						if(!this.allocAudioChannel(eventAudio, false))
							return;
					}
				}
			}
			
			if(this.keyTap && cp.movie.playKeyTap)
			{
				if(!this.allocAudioChannel(this.keyTap, false))
					return;
			}
			}

            var extAudios = this.extAudios[slideName];
			for(var j in extAudios)
			{
				var extAudio = extAudios[j];
				if(extAudio)
				{
					if(!this.allocAudioChannel(extAudio, false))
						return;
				}
			}
		},
		
		play:function(frame, iPlayOnlyBGAudio)
		{
			this.pace = null;

			if(!this.loaded || 1 != cp.movie.speed)
				return;
				
			if((cp.device == cp.IDEVICE || cp.device == cp.ANDROID) && !cp.multiAudioTrack)
			{
				var a = this.audioChannels[0];
				if(!a.paused && !a.ended && a.cpAudio && a.cpAudio.id == this.eventAudioPlaying)
					return;
					
				if(cp.movie.stage.VideoPlaying)
					return;
			}
			
			var foregroundAudioPlaying = false;
			var audioObj = null;
			var slideAudioObj = null;
			
			if(!iPlayOnlyBGAudio)
			{
				if(this.currentSlide)
				{
					var objectAudios = this.objectAudios[this.currentSlide];
					
					if(objectAudios)
					{
						for(var j in objectAudios)
						{
							var objectAudio = objectAudios[j];
							if(objectAudio && !objectAudio.ended)
							{
								if((objectAudio.from <= frame && objectAudio.to >= frame)
								|| (objectAudio.shownAt && objectAudio.shownAt <= frame && (objectAudio.shownAt + objectAudio.to - objectAudio.from >= frame))
								)
								{
									if((cp.device == cp.IDEVICE || cp.device == cp.ANDROID) && !cp.multiAudioTrack)
									{
										if(null == audioObj)
										{
											audioObj = objectAudio;
										}
									}
									else
									{
										if(null == audioObj)
										{
											audioObj = objectAudio;
										}
										objectAudio.play();
									}
									foregroundAudioPlaying = true;
								}
								else
								{
									if(objectAudio.mouseAudio)//special handling for (short) mouse click audio
									{
										if(this.webAudio)//webAudio is instantaneous. If not webAudio, don't pause, as the click audio will be missed due to the lag
											objectAudio.pause();
									}
									else
										objectAudio.pause();
								}
							}
						}
					}
				}
				
				if(this.currentSlideAudio)
				{
					var slideAudio = this.slideAudios[this.currentSlideAudio];
					
					if(slideAudio && !slideAudio.ended)
					{
						if(slideAudio.from <= frame && slideAudio.to >= frame)
						{
							if((cp.device == cp.IDEVICE || cp.device == cp.ANDROID) && !cp.multiAudioTrack)
							{
								if(null == audioObj)
								{
									audioObj = slideAudio;
									slideAudioObj = slideAudio;
								}
								if(this.ssc != 1 && this.ssp != 1)
									foregroundAudioPlaying = true;
							}
							else
							{
								if(this.ssc != 1 && this.ssp != 1)
								{
									slideAudio.play();
									if(null == audioObj)
									{
										audioObj = slideAudio;
									}
									slideAudioObj = slideAudio;
									foregroundAudioPlaying = true;
								}
								else
									slideAudio.pause();
							}
						}
						else
						{
							slideAudio.pause();
						}
					}
				}
			}	
			if(this.bgAudio)
			{
				if(foregroundAudioPlaying)
				{
					if(this.bgAudio.lowerVolumeOnSlidesWithAudio)
					{
						if(this.bgAudio.nativeAudio)
							this.bgAudio.nativeAudio.volume = (this.volume * (this.bgAudio.lowerVolumePercentage/100.0));
					}
				}
				else
				{
					if(this.bgAudio.nativeAudio)
						this.bgAudio.nativeAudio.volume = this.volume;
				}
				
				if((cp.device == cp.IDEVICE || cp.device == cp.ANDROID) && !cp.multiAudioTrack)
				{
					if(null == audioObj)
						audioObj = this.bgAudio;
				}
				else
				{
					if(this.stopBGAudio)
						this.bgAudio.pause();
					else
						this.bgAudio.play();
				}
			}
			
			this.audioPlaying = null;
			if((cp.device == cp.IDEVICE || cp.device == cp.ANDROID) && audioObj && !cp.multiAudioTrack)
			{
				if(slideAudioObj == audioObj)
				{
					if(this.ssc != 1 && this.ssp != 1)
					{
						this.audioPlaying = audioObj.id;
						audioObj.play();
					}
				}
				else if(this.bgAudio == audioObj)
				{
					if(this.stopBGAudio)
						audioObj.pause();
					else
					{
						this.audioPlaying = audioObj.id;
						audioObj.play();
					}
				}
				else
				{
					this.audioPlaying = audioObj.id;
					audioObj.play();
				}
			}
			
			if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
			{
				if(1 == cp.movie.speed)
				{
						if(audioObj && audioObj != this.bgAudio && !audioObj.shownAt
						&& !audioObj.ended && !audioObj.paused && !audioObj.loop 
						&& audioObj.nativeAudio && audioObj.nativeAudio.currentTime > 0)
						{
							this.pace = audioObj.from + audioObj.nativeAudio.currentTime * cpInfoFPS;
							if(this.pace > audioObj.to)
								this.pace = audioObj.to;
						}
					else
						this.pace = cp.movie.vdm.pace();
				}
			}
			else
			{
				if(1 == cp.movie.speed && !this.interactiveItemFound)
				{
					if(slideAudioObj && !slideAudioObj.ended && !slideAudioObj.paused && !slideAudioObj.loop && slideAudioObj.nativeAudio && slideAudioObj.nativeAudio.currentTime > 0)
					{
						this.pace = slideAudioObj.from + slideAudioObj.nativeAudio.currentTime * cpInfoFPS;
						if(this.pace > slideAudioObj.to)
						{
							if(cp.movie.vdm.pace())
								this.pace = null;
							else
								this.pace = slideAudioObj.to;
						}
					}
					else
						this.pace = cp.movie.vdm.pace();
				}
			}
            // No need to consider extAudios here
		},
		
		pause:function(reasonForPause)
		{
			this.reasonForPause = reasonForPause;
			
			if(reasonForPause == cp.ReasonForPause.PLAYBAR_ACTION ||
			reasonForPause == cp.ReasonForPause.CPCMNDPAUSE ||
			reasonForPause == cp.ReasonForPause.MOVIE_REWIND_STOP ||
			reasonForPause == cp.ReasonForPause.EVENT_VIDEO_PAUSE ||
			reasonForPause == cp.ReasonForPause.ONLY_ONE_MEDIUM_CAN_PLAY || 
			reasonForPause == cp.ReasonForPause.PPTX_PAUSE_FOR_ONCLICK_ANIMATION ||
			reasonForPause == cp.ReasonForPause.CPCMNDGOTOFRAME ||
			reasonForPause == cp.ReasonForPause.ACTION_CHOICE )
			{
				if(this.currentSlide)
				{
					var objectAudios = this.objectAudios[this.currentSlide];
					
					if(objectAudios && reasonForPause != cp.ReasonForPause.ACTION_CHOICE)
					{
						for(var j in objectAudios)
						{
							var objectAudio = objectAudios[j];
							objectAudio.pause();
						}
					}
					
                    var extAudios = this.extAudios[this.currentSlide];
					if(extAudios)
					{
						for(var j in extAudios)
						{
							var extAudio = extAudios[j];
							extAudio.pause(reasonForPause);
						}
					}
					//Should we pause event audios of this slide??
				}
			}
			
			var frame = cpInfoCurrentFrame;
			if(this.currentSlideAudio)
			{
				var slideAudio = this.slideAudios[this.currentSlideAudio];
				
				if(slideAudio)
				{
					if(slideAudio.from <= frame && slideAudio.to >= frame)
					{
						if(reasonForPause == cp.ReasonForPause.INTERACTIVE_ITEM)
						{
							if(this.ssp == 1)
								slideAudio.pause();
						}
						else if(reasonForPause == cp.ReasonForPause.PLAYBAR_ACTION ||
						reasonForPause == cp.ReasonForPause.CPCMNDPAUSE ||
						reasonForPause == cp.ReasonForPause.MOVIE_REWIND_STOP ||
						reasonForPause == cp.ReasonForPause.EVENT_VIDEO_PAUSE ||
						reasonForPause == cp.ReasonForPause.ONLY_ONE_MEDIUM_CAN_PLAY ||
						reasonForPause == cp.ReasonForPause.PPTX_PAUSE_FOR_ONCLICK_ANIMATION ||
						reasonForPause == cp.ReasonForPause.CPCMNDGOTOFRAME ||
						reasonForPause == cp.ReasonForPause.WK_EXIT_FULL_SCREEN)
							slideAudio.pause();
					}
					else
					{
						slideAudio.pause();
					}
				}
			}
				
			if(this.bgAudio)
			{
				if(reasonForPause == cp.ReasonForPause.MOVIE_ENDED)
				{
					if(this.bgAudio.stopAtProjectEnd)
					{
						this.bgAudio.pause();
					}
					//else...continue playback
				}
				else
				{
					if(reasonForPause == cp.ReasonForPause.PLAYBAR_ACTION ||
					reasonForPause == cp.ReasonForPause.MOVIE_REWIND_STOP ||
					reasonForPause == cp.ReasonForPause.EVENT_VIDEO_PAUSE ||
					reasonForPause == cp.ReasonForPause.ONLY_ONE_MEDIUM_CAN_PLAY)
					{
						this.bgAudio.pause();
					}
				}
			}
		},
		
		pauseCurrentSlideAudioForInteractiveClick:function()
		{
			if(this.verbose)
				cp.log('pause currentSlide Audio for SSC');
			var frame = cpInfoCurrentFrame;
			if(this.currentSlideAudio)
			{
				var slideAudio = this.slideAudios[this.currentSlideAudio];
				
				if(slideAudio)
				{
					if(slideAudio.from <= frame && slideAudio.to >= frame)
					{
						this.ssc = 1;
						slideAudio.pause();
					}
				}
			}				
		},
		
		mute:function(aMute)
		{
			var m;
			if(aMute == true || aMute > 0)
				m = true;
			else
				m = false;
		
			var playbar = document.getElementById("playbar");
			if(m&&playbar['mute']!=undefined)
				playbar.mute();
			if(!m&&playbar['unmute']!=undefined)
				playbar.unmute();
				
			for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				this.audioChannels[i].muted = m;
			this.muted = m;
		},
		
		setVolume:function(v)
		{
			if(v < 0)
			{
				v = 0;
			}
			if(v > 1)
			{
				v = 1;
			}
			
			this.volume = v;
				
			for(var i = 0; i < this.MAX_AUDIO_CHANNELS; ++i)
				this.audioChannels[i].volume = v;
		},
		
		playPauseEventAudio: function(eventAudioName, play)
		{
			if(play && (cp.device == cp.IDEVICE || cp.device == cp.ANDROID) && !cp.multiAudioTrack)
			{
				if(this.audioPlaying || cp.movie.stage.VideoPlaying)
					return;
			}
			
			if(play &&  (this.muted || 1 != cp.movie.speed))
				return;
				
			if(this.currentSlide)
			{
				var eventAudios = this.eventAudios[this.currentSlide];
				
				if(eventAudios)
				{
					var eventAudio = eventAudios[eventAudioName];
					
					if(eventAudio)
					{
						if(play)
						{
							this.eventAudioPlaying = eventAudio.id;
							eventAudio.resetAndPlay();
							if(eventAudio.id.length > 5 && eventAudio.id.substring(eventAudio.id.length - 5) == 'ClkAd')
							{
								//pause the click audios after a while since they may appear on a slide boundary
								if(eventAudio.duration)
									setTimeout(function(){eventAudio.pause();}, (eventAudio.duration+0.2)*1000);
								else
									setTimeout(function(){eventAudio.pause();}, 500);
							}
						}
						else
						{
							eventAudio.pause();
						}
					}
				}
			}
		},
		
		showHideObjectAudio: function(objectAudioName, show)
		{
			if(this.currentSlide)
			{
				var objectAudios = this.objectAudios[this.currentSlide];
				
				if(objectAudios)
				{
					var objectAudio = objectAudios[objectAudioName];
					
					if(objectAudio)
					{
						if(show)
						{
							if(objectAudio.hidden)
								objectAudio.show();
						}
						else
						{
							if(!objectAudio.hidden)
								objectAudio.hide();
						}
					}
				}
			}
		},
		
		doesAudioStartBetween:function(from, to)
		{
			if(this.currentSlide)
			{
				var objectAudios = this.objectAudios[this.currentSlide];
				
				if(objectAudios)
				{
					for(var j in objectAudios)
					{
						var objectAudio = objectAudios[j];
						if(objectAudio && !objectAudio.ended && (objectAudio.from >= from && objectAudio.from <= to))
						{
							if(this.verbose)
								cp.log('objAudio ' + objectAudio.id + ' starts between ' + from + ' & ' + to);
							return true;
						}
					}
				}
			}
			
			if(this.currentSlideAudio)
			{
				var slideAudio = this.slideAudios[this.currentSlideAudio];
				
				if(slideAudio && !slideAudio.ended && (slideAudio.from >= from && slideAudio.from <= to))
				{
					if(this.verbose)
						cp.log('slideAudio ' + slideAudio.id + ' starts between ' + from + ' & ' + to);
					return true;
				}
			}
			
			return false;
		},
		
		/*print: function()
		{
			//cp.log('***** Audio status *******');
			for(var i in this.objectAudios)
			{
				var objectAudios = this.objectAudios[i];
				
				if(objectAudios)
				{
					for(var j in objectAudios)
					{
						var objectAudio = objectAudios[j];
						objectAudio.print();
					}
				}
			}
			
			for(var k in this.slideAudios)
			{
				var slideAudio = this.slideAudios[k];
				
				if(slideAudio)
				{
					slideAudio.print();
				}
			}
				
			if(this.bgAudio)
			{
				this.bgAudio.print();
			}
			//cp.log('**********************');
		},*/

		updateAudioViews: function()
		{
			if(this.viewAudio && this.audioViews)
				for(var i in this.audioViews)
					this.audioViews[i].update();
		}
	}

	cp.NativeVideo = function(id)
	{
		makeItDummyNativeVideo = function(iVideo)
		{
			iVideo.currentTime = 0;
			iVideo.duration = 0;
			iVideo.paused = true;
			iVideo.ended = true;
			iVideo.defaultPlaybackRate = 0;
			iVideo.playbackRate = 1.0;
			iVideo.played = false;
			iVideo.seeking = false;
			iVideo.seekable = false;
			iVideo.fastSeek = false;
			iVideo.src = "";
			iVideo.crossorigin = false;			
			iVideo.preload = false;
			iVideo.autoplay = false;
			iVideo.mediagroup = "";
			iVideo.loop = false;
			iVideo.muted = false;
			iVideo.controls = false;	
			iVideo.style = new Object();
			
			iVideo.load = function() {};
			iVideo.play = function() {};
			iVideo.pause = function() {};
			iVideo.addEventListener = function(a,b,c) {};
			iVideo.removeEventListener = function(a,b,c){};
		};
		
		var v = cp.newElem('video');		
		if(typeof Video === "undefined" || !Video)
		{
			if(v.load == undefined ||
				v.play == undefined ||
				v.pause == undefined ||
				v.addEventListener == undefined)
				makeItDummyNativeVideo(v);
		}		
		
		if(id)
		{
			v.id = id;
		}
		return v;
	}
	
	cp.VideoManager = function()
	{
		cp.movie.vdm = this;
		this.loaded = false;
		this.verbose = false;
		this.viewVideo = false;
		
		this.errorCallBackFn = function(e)
		{
			var vdm = cp.movie.vdm;
			if(-1 == this.src.indexOf('_cp_n_m_'))
			{
				if(cp.exceptionalLogs)
				{
					cp.log('src = ' + this.src + ' error code = ' + (this.error?this.error.code:'NULL') + ' n/w state = ' + this.networkState);
					cp.log(e);
				}
			
				if(this.cpVideo)
				{
					var divData = cp.D[this.cpVideo.id];
					if(divData.psv)
						divData.pausedOnce = true;
				}
				
				this.waitCount = 0;
			}
		}
		
		this.waitingFn = function(e)
		{
			++this.waitCount;
			if(cp.movie.vdm.verbose)
				cp.log('wait ' + this.waitCount + ' ' + this.cpSrc + ' ' + (this.cpVideo?this.cpVideo.id:''));
		}
		
		this.canPlayCallBackFn = function(e)
		{
			if(this.CPcanPlay == false)
			{
				var delay = 100;
				if(cp.device == cp.ANDROID)
					delay = 2000;
				else
				{
					this.CPcanPlay = true;
					this.waitCount = 0;
				}
				
				var that = this;
				setTimeout(function(){
					that.CPcanPlay = true;
					that.waitCount = 0;
					var tmp = cpInfoCurrentFrame;
					if(that.from <= tmp && tmp <= that.to)
					{
							that.style.position = "static";
							that.style.left = "0px";
						if(that.CPtoc)
						{
							cp.toc.rootObj.showVideo(true);
						}
					}
				}, delay);
			}
			else
				this.waitCount = 0;

			
			if(this.cpVideo && this.cpVideo.displayForDurationOfVideo)
				cp.D[this.cpVideo.parentDivName].to = this.duration* cp.movie.fps;//not using cpInfoFPS since this calc is independent of movie speed
				
			if(cp.movie.vdm.verbose)
				cp.log('cnPly ' + this.cpSrc + ' ' + (this.cpVideo?this.cpVideo.id:''));
		}
		
		this.onEndedCallBackFn = function(e)
		{
			this.waitCount = 0;
			if(this.cploop)
			{
				if(cp.movie.vdm.verbose)
					cp.log(this.cpSrc+' loop');
				if(this.cpVideo)
				{
					this.cpVideo.pause();
					this.cpVideo.seekTo(this.cpVideo.from);
					this.cpVideo.play();
				}
			}
			else
			{
				if(cp.movie.vdm.verbose)
					cp.log(this.cpSrc+' ended');
					
				if(this.cpVideo)
				{
					if(this.cpVideo.autoRewind)
					{
						this.cpVideo.pause();
						this.cpVideo.seekTo(this.cpVideo.from);
					}
					else
					{
						this.cpVideo.ended = true;
						this.endedAt = new Date().getTime();
						this.cpVideo.pause();
					}
				}
				else
					this.endedAt = new Date().getTime();
				
				if(cp.movie.paused)
				{
					if(cp.ReasonForPause.EVENT_VIDEO_PAUSE == cp.movie.reasonForPause)
					{
						if(this.cpVideo.nativeVideo)
						{
							if(Document && Document.exitFullscreen)
							{
								Document.exitFullscreen();
							}
							else if(Document && Document.webkitExitFullscreen)
							{
								Document.webkitExitFullscreen();
							}
							else if (this.cpVideo.nativeVideo.exitFullscreen) 
							{
						    	this.cpVideo.nativeVideo.exitFullscreen();
						    } 
						    else if (this.cpVideo.nativeVideo.msExitFullscreen) 
					    	{
					    		this.cpVideo.nativeVideo.msExitFullscreen();
						    } 
						    else if (this.cpVideo.nativeVideo.mozCancelFullScreen) 
					    	{
					    		this.cpVideo.nativeVideo.mozCancelFullScreen();
						    } 
						    else if (this.cpVideo.nativeVideo.webkitExitFullscreen) 
						    {
						    	this.cpVideo.nativeVideo.webkitExitFullscreen();
						    }
						}
					    cp.movie.play();//can be buggy with multiple event videos on a slide. But SWF o/p is also similar.
					}	
				}
				else if(this.cpVideo)
					this.cpVideo.actualParent.pausedOnce = true;
					
				if(this.cpVideo && this.cpVideo.displayForDurationOfVideo)
					this.cpVideo.reset();
			}
		}
		
		this.PlayPauseCallBackFn = function(e)
		{
			if(this.paused)
			{
				this.pausedAt = new Date().getTime();
			}
			if(this.cpVideo)
				this.cpVideo.paused = this.paused;
		}
		
		if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
		{
			this.slideVideoChannel = new cp.NativeVideo();
			this.slideVideoChannel.cpSrc = '';
			this.slideVideoChannel.cpVideo = null;
			this.slideVideoChannel.ended = false;
			//this.slideVideoChannel.addEventListener("ended", this.onEndedCallBackFn, false);
			this.slideVideoChannel.addEventListener("error", this.errorCallBackFn, false);
			
			if(cp.IOSMajor >= cp.IOS5 || cp.device == cp.ANDROID)
			{
				this.slideVideoChannel.addEventListener("waiting", this.waitingFn, false);
				this.slideVideoChannel.addEventListener("canplay", this.canPlayCallBackFn, false);
			}
			
			this.slideVideoChannel.addEventListener("play", this.PlayPauseCallBackFn, false);
			this.slideVideoChannel.addEventListener("pause", this.PlayPauseCallBackFn, false);
			this.slideVideoChannel.waitCount = 0;

			var sv = this.slideVideoChannel;

			this.slideVideoChannel.addEventListener('webkitbeginfullscreen', function(){
				if(sv.src != '' && sv.src != '_cp_n_m_' && !sv.paused)// --> slide video is playing...
					sv.pauseMovieOnExitFullScreen = true;
			}, false);
			this.slideVideoChannel.addEventListener('webkitendfullscreen', function(){
				if(sv.pauseMovieOnExitFullScreen){
					sv.pauseMovieOnExitFullScreen = false;
					cp.movie.pause(cp.ReasonForPause.WK_EXIT_FULL_SCREEN);
				}
			}, false);
		}
		else
		{
			this.slideVideoChannel0 = new cp.NativeVideo();
			this.slideVideoChannel0.cpSrc = '';
			this.slideVideoChannel0.cpVideo = null;
			this.slideVideoChannel0.ended = false;
			//this.slideVideoChannel0.addEventListener("ended", this.onEndedCallBackFn, false);
			this.slideVideoChannel0.addEventListener("error", this.errorCallBackFn, false);
			this.slideVideoChannel0.addEventListener("waiting", this.waitingFn, false);
			this.slideVideoChannel0.addEventListener("canplay", this.canPlayCallBackFn, false);
			this.slideVideoChannel0.addEventListener("play", this.PlayPauseCallBackFn, false);
			this.slideVideoChannel0.addEventListener("pause", this.PlayPauseCallBackFn, false);
			this.slideVideoChannel0.waitCount = 0;
		
			this.slideVideoChannel1 = new cp.NativeVideo();
			this.slideVideoChannel1.cpSrc = '';
			this.slideVideoChannel1.cpVideo = null;
			this.slideVideoChannel1.ended = false;
			//this.slideVideoChannel1.addEventListener("ended", this.onEndedCallBackFn, false);
			this.slideVideoChannel1.addEventListener("error", this.errorCallBackFn, false);
			this.slideVideoChannel1.addEventListener("waiting", this.waitingFn, false);
			this.slideVideoChannel1.addEventListener("canplay", this.canPlayCallBackFn, false);
			this.slideVideoChannel1.addEventListener("play", this.PlayPauseCallBackFn, false);
			this.slideVideoChannel1.addEventListener("pause", this.PlayPauseCallBackFn, false);
			this.slideVideoChannel1.waitCount = 0;

			this.slideVideoChannel = this.slideVideoChannel0;
		}
			
		if(cp.loadedModules.toc)
		{
			if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
			{
				this.tocVideoChannel = document.getElementById('tocVideo');
				if(!this.tocVideoChannel)
				{
					this.tocVideoChannel = new cp.NativeVideo('tocVideo');
				}
				
				this.tocVideoChannel.cpSrc = '';
				this.tocVideoChannel.cpVideo = null;
				this.tocVideoChannel.ended = false;
				//this.tocVideoChannel.addEventListener("ended", this.onEndedCallBackFn, false);
				this.tocVideoChannel.addEventListener("error", this.errorCallBackFn, false);
				
				if(cp.IOSMajor >= cp.IOS5 || cp.device == cp.ANDROID)
				{
					this.tocVideoChannel.addEventListener("waiting", this.waitingFn, false);
					this.tocVideoChannel.addEventListener("canplay", this.canPlayCallBackFn, false);
				}
				
				this.tocVideoChannel.addEventListener("play", this.PlayPauseCallBackFn, false);
				this.tocVideoChannel.addEventListener("pause", this.PlayPauseCallBackFn, false);
				this.tocVideoChannel.waitCount = 0;
			}
			else
			{
				this.tocVideoChannel0 = document.getElementById('tocVideo');
				if(!this.tocVideoChannel0)
				{
					this.tocVideoChannel0 = new cp.NativeVideo('tocVideo');
				}
				
				this.tocVideoChannel0.cpSrc = '';
				this.tocVideoChannel0.cpVideo = null;
				this.tocVideoChannel0.ended = false;
				//this.tocVideoChannel0.addEventListener("ended", this.onEndedCallBackFn, false);
				this.tocVideoChannel0.addEventListener("error", this.errorCallBackFn, false);
				this.tocVideoChannel0.addEventListener("waiting", this.waitingFn, false);
				this.tocVideoChannel0.addEventListener("canplay", this.canPlayCallBackFn, false);
				this.tocVideoChannel0.addEventListener("play", this.PlayPauseCallBackFn, false);
				this.tocVideoChannel0.addEventListener("pause", this.PlayPauseCallBackFn, false);
				this.tocVideoChannel0.waitCount = 0;
				
				this.tocVideoChannel1 = new cp.NativeVideo('tocVideo');
				this.tocVideoChannel1.cpSrc = '';
				this.tocVideoChannel1.cpVideo = null;
				this.tocVideoChannel1.ended = false;
				//this.tocVideoChannel1.addEventListener("ended", this.onEndedCallBackFn, false);
				this.tocVideoChannel1.addEventListener("error", this.errorCallBackFn, false);
				this.tocVideoChannel1.addEventListener("waiting", this.waitingFn, false);
				this.tocVideoChannel1.addEventListener("canplay", this.canPlayCallBackFn, false);
				this.tocVideoChannel1.addEventListener("play", this.PlayPauseCallBackFn, false);
				this.tocVideoChannel1.addEventListener("pause", this.PlayPauseCallBackFn, false);
				this.tocVideoChannel1.waitCount = 0;
				
				this.tocVideoChannel = this.tocVideoChannel0;
			}
		}
		
		if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
			this.MAX_VIDEO_CHANNELS = 2;
		else
			this.MAX_VIDEO_CHANNELS = 10;

		this.videoChannels = new Array();
			
		for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
		{
			var v = new cp.NativeVideo();
			v.cpSrc = '';
			v.cpVideo = null;
			v.ended = false;
			v.addEventListener("ended", this.onEndedCallBackFn, false);
			v.addEventListener("error", this.errorCallBackFn, false);
			
			if(cp.device == cp.DESKTOP || (cp.device == cp.IDEVICE && cp.IOSMajor >= cp.IOS5) || cp.device == cp.ANDROID)
			{
				v.addEventListener("waiting", this.waitingFn, false);
				v.addEventListener("canplay", this.canPlayCallBackFn, false);
			}
			
			v.addEventListener("play", this.PlayPauseCallBackFn, false);
			v.addEventListener("pause", this.PlayPauseCallBackFn, false);
			v.waitCount = 0;
			this.videoChannels[i] = v;
		}
	}
	
	
	cp.VideoManager.prototype = 
	{
		pendingVideos: function()
		{
			var numPending = 0;

			var sv = this.slideVideoChannel;
			if(sv.waitCount > 0 && !sv.ended && !sv.paused)
				++numPending;
					
			var tv = this.tocVideoChannel;
			if(tv && tv.waitCount > 0 && !tv.ended && !tv.paused)
				++numPending;
				
			for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
			{
				var v = this.videoChannels[i];
				if(v.waitCount > 0 && !v.ended && !v.paused)
					++numPending;
			}

			if(numPending > 0)
			{
				if(this.numPending != numPending)
				{
					this.numPending = numPending;
					if(cp.verbose)
						cp.log(numPending + ' videos pending');
				}
			}
			else
			{
				if(this.numPending && cp.verbose)
					cp.log('no videos pending');
				this.numPending = 0;
			}

			return numPending;
		},
		
		resetAllWaitingVideos:function()
		{
			for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
			{
				var v = this.videoChannels[i];
				v.waitCount = 0;
			}
		},
		
		mute:function(aMute)
		{
			var m;
			if(aMute == true || aMute > 0)
				m = true;
			else
				m = false;
		
			for(var i in this.videoChannels)
				this.videoChannels[i].muted = m;
				
			this.slideVideoChannel.muted = m;
			if(this.tocVideoChannel)
				this.tocVideoChannel.muted = m;
			this.muted = m;
		},
		
		setVolume:function(v)
		{
			if(v < 0)
			{
				v = 0;
			}
			if(v > 1)
			{
				v = 1;
			}
			
			this.volume = v;
				
			for(var i in this.videoChannels)
				this.videoChannels[i].volume = v;
				
			this.slideVideoChannel.volume = v;
			if(this.tocVideoChannel)
				this.tocVideoChannel.volume = v;
		},
		
		LRUVideoIndex: function()
		{
			var t = new Date().getTime();
			var idx = -1;
			var currFrame = cpInfoCurrentFrame;
			for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
			{
				var v = this.videoChannels[i];
				if(v.ended || v.paused)
				{
					if(v.ended && v.endedAt)
					{
						if(t > v.endedAt)
						{
							t = v.endedAt;
							idx = i;
						}
					}
					else if(v.paused && v.pausedAt)
					{
						if(t > v.pausedAt)
						{
							t = v.pausedAt;
							idx = i;
						}
					}
					else if(idx == -1 && currFrame > v.cpTo)
					{
						idx = i;
					}
				}
			}
			return idx;
		},
		
		allocVideoChannel: function(videoObj)
		{
			if(this.verbose)
				cp.log('allocVideoChannel ' + videoObj.id + ' ' + videoObj.src);
			if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
			{
				if(this._LRUVideoIndex == undefined)
					this._LRUVideoIndex = 0;
				else
					this._LRUVideoIndex = 1 - this._LRUVideoIndex;
				if(this.verbose)
					cp.log('picking video @ index ' + this._LRUVideoIndex);
				var v1 = this.videoChannels[this._LRUVideoIndex];
				
				if(v1.cpVideo != null)
					v1.cpVideo.nativeVideo = null;

				videoObj.nativeVideo = v1;
				v1.cpVideo = videoObj;
				//v1.loop = videoObj.loop;
				v1.cploop = videoObj.cploop;
				v1.ended = false;

					v1.waitCount = 0;
					v1.cpSrc = videoObj.src;
					v1.src = videoObj.src;
				v1.load();
				return;
			}
			else
			{
				var currFrame = cpInfoCurrentFrame;
				for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
				{
					var v = this.videoChannels[i];
					var videoItemIsInRange = (v.cpVideo && v.cpVideo.from <= currFrame && v.cpVideo.to >= currFrame);
					if(v.cpSrc == videoObj.src && (v.ended || v.paused) && !videoItemIsInRange)
					{
						if(v.cpVideo != null)
						{
							v.cpVideo.nativeVideo = null;
							v.cpVideo = null;
						}

						videoObj.nativeVideo = v;
						v.cpVideo = videoObj;
						v.loop = videoObj.loop;
						v.ended = false;
						v.cpTo = videoObj.to;

						if(!videoObj.isSeekPending())
							videoObj.seekTo(videoObj.from);

						videoObj.finishPendingSeek();
						//v.load();
						if(this.verbose)
							cp.log('allocVideoChannel found existing @ ' + i);
						return true;
					}
				}
				for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
				{
					var v = this.videoChannels[i];
					if(v.cpSrc == '')
					{
						v.waitCount = 0;
						v.cpSrc = videoObj.src;
						v.src = videoObj.src;
						videoObj.nativeVideo = v;
						v.cpVideo = videoObj;
						v.loop = videoObj.loop;
						v.ended = false;
						v.cpTo = videoObj.to;
						videoObj.finishPendingSeek();
						v.load();
						if(this.verbose)
							cp.log('allocVideoChannel found empty slot @ ' + i);
						return true;
					}
				}
				var idx = this.LRUVideoIndex();
				if(-1 != idx)
				{
					var v = this.videoChannels[idx];
					if(v.cpVideo != null)
					{
						v.cpVideo.nativeVideo = null;
						v.cpVideo = null;
					}

					videoObj.nativeVideo = v;
					v.cpVideo = videoObj;
					v.loop = videoObj.loop;
					v.ended = false;
					v.cpTo = videoObj.to;

					if(v.cpSrc != videoObj.src)
					{
						v.waitCount = 0;
						v.cpSrc = videoObj.src;
						v.src = videoObj.src;
					}
					else if(!videoObj.isSeekPending())
						videoObj.seekTo(videoObj.from);

					videoObj.finishPendingSeek();
					v.load();
					if(this.verbose)
						cp.log('allocVideoChannel re-used LRU slot @ ' + idx);
					return true;
				}
			}
			return false;
		},
		
		preallocVideoChannel: function(videoSrc)
		{
			videoSrc = cp.getCorrectMediaPath(videoSrc);
			if(this.verbose)
				cp.log('preallocVideoChannel ' + videoSrc);
			for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
			{
				var v = this.videoChannels[i];
				if(v.cpSrc == videoSrc)
				{
					if(this.verbose)
						cp.log('preallocVideoChannel found existing @ ' + i);
					return true;
				}
			}
			for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
			{
				var v = this.videoChannels[i];
				if(v.cpSrc == '')
				{
					v.waitCount = 0;
					v.cpSrc = videoSrc;
					v.src = videoSrc;
					v.ended = false;
					delete v.cpTo;
					v.load();
					if(this.verbose)
						cp.log('preallocVideoChannel found empty slot @ ' + i);
					return true;
				}
			}
			return false;
		},
		
		deviceSpecificInit:function()
		{
			function initVideo(v)
			{
				if(!v.cpSrc)
				{
					try{
						v.src = '_cp_n_m_';
					}catch(e){}
				}
				try{
					v.load();
				}catch(e){}
			};
			
			if(cp.IDEVICE == cp.device || cp.device == cp.ANDROID)
			{
				for(var i = 0; i < this.MAX_VIDEO_CHANNELS; ++i)
					initVideo(this.videoChannels[i]);
				
				initVideo(this.slideVideoChannel);

				if(this.tocVideoChannel)
					initVideo(this.tocVideoChannel);
			}
		},
		
		load:function()
		{
			this.loaded = true;
		},
		
		preload2: function(slideName)
		{
			if(!this.loaded || 1 != cp.movie.speed)
				return;

			if(this.verbose)
				cp.log('video manager preload ' + slideName);
			
			var slide = cp.D[slideName];
			if(slide.videos)
			{
				var prealloc1Success = true;
				var prealloc2Success = true;
				var prealloc3Success = true;
				for(var i = 0; i < slide.videos.length; ++i)
				{
					var v = cp.D[slide.videos[i]];
					if(v.type == cp.kCPFullMotion || v.type == cp.kCPOTVideoResource || v.type == cp.kCPOTFLVItem)
					{
						if(prealloc1Success)
						{
							var vc = cp.D[v.mdi];
							prealloc1Success = this.preallocVideoChannel(vc.mp4);
						}
					}
					else if(v.type == cp.kCPOTVideo)
					{
						var vc = cp.D[v.mdi];
						if(vc.sit)//toc
						{
							if(!prealloc2Success)
								continue;

							var correctedVCMp4 = cp.getCorrectMediaPath(vc.mp4);
								
							if(this.tocVideoChannel0.cpSrc == correctedVCMp4 || this.tocVideoChannel1.cpSrc == correctedVCMp4)
							{
								if(this.verbose)
									cp.log('vdm preload found existing ' + correctedVCMp4);
								continue;
							}
							if(!this.tocVideoChannel0.cpVideo)
							{
								this.tocVideoChannel0.cpSrc = correctedVCMp4;
								this.tocVideoChannel0.src = correctedVCMp4;
								this.tocVideoChannel0.load();
								if(this.verbose)
									cp.log('vdm preloaded tocV0 with ' + correctedVCMp4);
							}
							else if(!this.tocVideoChannel1.cpVideo)
							{
								this.tocVideoChannel1.cpSrc = correctedVCMp4;
								this.tocVideoChannel1.src = correctedVCMp4;
								this.tocVideoChannel1.load();
								if(this.verbose)
									cp.log('vdm preloaded tocV1 with ' + correctedVCMp4);
							}
							else prealloc2Success = false;
						}
						else
						{
							if(!prealloc3Success)
								continue;

							var correctedVCMp4 = cp.getCorrectMediaPath(vc.mp4);
								
							if(this.slideVideoChannel0.cpSrc == correctedVCMp4 || this.slideVideoChannel1.cpSrc == correctedVCMp4)
							{
								if(this.verbose)
									cp.log('vdm preload found existing ' + correctedVCMp4);
								continue;
							}
							if(!this.slideVideoChannel0.cpVideo)
							{
								this.slideVideoChannel0.cpSrc = correctedVCMp4;
								this.slideVideoChannel0.src = correctedVCMp4;
								this.slideVideoChannel0.load();
								if(this.verbose)
									cp.log('vdm preloaded SV0 with ' + correctedVCMp4);
							}
							else if(!this.slideVideoChannel1.cpVideo)
							{
								this.slideVideoChannel1.cpSrc = correctedVCMp4;
								this.slideVideoChannel1.src = correctedVCMp4;
								this.slideVideoChannel1.load();
								if(this.verbose)
									cp.log('vdm preloaded SV1 with ' + correctedVCMp4);
							}
							else prealloc3Success = false;
						}
					}
				}
			}
		},
		
		preload: function(slideName)
		{
			if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
				return;
			else
				return this.preload2(slideName);
		},
		
		seekTo: function(frame, pause)
		{
			var v1, v2, v3;

			if(this.slideVideoChannel)
				v1 = this.slideVideoChannel.cpVideo;
			if(this.tocVideoChannel)
				v2 = this.tocVideoChannel.cpVideo;
			if(this.demoVideo)
				v3 = this.demoVideo.cpVideo;

			if(pause)
			{
				if(v1)
					v1.pause();
				if(v2)
					v2.pause();
				if(v3)
					v3.pause();
			}
			
			
			if(v1)
				v1.seekTo(frame);

			if(v2)
				v2.seekTo(frame);
			
			if(v3)			
				v3.seekTo(frame);
		},
		
		pause: function(reasonForPause)
		{
			this.reasonForPause = reasonForPause;
			
			if(reasonForPause == cp.ReasonForPause.PLAYBAR_ACTION ||
			reasonForPause == cp.ReasonForPause.CPCMNDPAUSE ||
			reasonForPause == cp.ReasonForPause.MOVIE_REWIND_STOP ||
			reasonForPause == cp.ReasonForPause.EVENT_VIDEO_PAUSE ||
			reasonForPause == cp.ReasonForPause.PPTX_PAUSE_FOR_ONCLICK_ANIMATION ||
			reasonForPause == cp.ReasonForPause.INTERACTIVE_ITEM ||
			reasonForPause == cp.ReasonForPause.CPCMNDGOTOFRAME)
			{
				//skipping event Videos
				if(this.slideVideoChannel && this.slideVideoChannel.cpVideo)
					this.slideVideoChannel.cpVideo.pause();
				if(this.tocVideoChannel && this.tocVideoChannel.cpVideo)
					this.tocVideoChannel.cpVideo.pause();
				if(this.demoVideo && this.demoVideo.cpVideo)
					this.demoVideo.cpVideo.pause();
			}
		},
		
		pace: function()
		{
			if(cp.device == cp.IDEVICE || cp.device == cp.ANDROID)
			{
				if(!cp.movie.stage.VideoPlaying)
					return null;
			}

			var v = this.slideVideoChannel;
			if(v)
			{
				var cpv = v.cpVideo;
				//cp.log(v.currentTime + "," + cpInfoCurrentFrame + ',cpv ended ' + (cpv?cpv.ended:'???') + ' cpv.paused ' + (cpv?cpv.paused:'???') +  ',v.ended=' + v.ended+',v.paused='+v.paused);
				
				if(cpv && !cpv.ended && !cpv.paused && !cpv.loop && v.currentTime > 0){
					cpv.pacedAt = (new Date()).getTime(); 
					return cpv.from + ((v.currentTime - cpv.seek_From) * cpInfoFPS);
				}
			}
			
			v = this.tocVideoChannel;
			if(v)
			{
				var cpv = v.cpVideo;
				if(cpv && !v.ended && !v.paused && !cpv.loop && v.currentTime > 0)
					return cpv.from + ((v.currentTime - cpv.seek_From) * cpInfoFPS);
			}
			
			v = this.demoVideo;
			if(v)
			{
				var cpv = v.cpVideo;
				if(cpv && !v.ended && !v.paused && !cpv.loop && v.currentTime > 0)
					return cpv.from + (v.currentTime* cpInfoFPS);
			}
			
			return null;
		},
		
		updateVideoViews: function()
		{
			if(this.viewVideo && this.videoViews)
				for(var i in this.videoViews)
					this.videoViews[i].update();
		}
	}	
})(window.cp);