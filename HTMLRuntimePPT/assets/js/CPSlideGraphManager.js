(function(cp)
{
	cp.SlideGraphManager = function()
	{
		this.m_CurrentBranch = [];
		this.m_BranchHistory = [];
		this.m_SlideGraphObj = {};
		this.m_RootSlideIndex = -1;
		this.m_InvalidSlideJump = false;
			
			
		// slide view traverse variables
		this.m_CompletionBranch = [];
		this.m_CompletionBranchSet = false;
		this.m_CompletionBranchSlideCount = -1;
		this.m_CompletionBranchSlideCountSet = false;
		this.m_BranchNumber = 0;
		this.m_PrevBranch = [];
		
		//Branch Enum
		if (!this['BranchEnum'])
		{
			this.BranchEnum = new Object();
			this.BranchEnum.kBranchNotFound = 0;
			this.BranchEnum.kBranchFound = 1;
			this.BranchEnum.kLoopBranchFound = 2;
			this.BranchEnum.kMultipleBranchFound = 3;
		}
	}

	cp.SlideGraphManager.prototype =
	{

		countUniqItems: function( iArray )
		{
			var countObj = {};
			var count = 0;
			for( var iter = 0; iter < iArray.length ; ++iter )
			{
				var valueObj = iArray[iter];
				if( countObj[ valueObj]==undefined )
				{
					countObj[ valueObj ] = valueObj;
					++count;
				}
			}
			return count;
		},
			
		findCompletionBranchTraverse:function( aCurrentSlideIndex , aCurrentTempSlidesArray , aCurrentTempSlidesObj )
		{
			var lBranchEnded = false;
			var lCurrentBranchType = -1;
			
			//trace(" aCurrentSlideIndex = "+aCurrentSlideIndex);
			
			if( !lBranchEnded && (this.m_SlideGraphObj[aCurrentSlideIndex ]==undefined))
			{
				lCurrentBranchType = this.BranchEnum.kBranchFound;
				lBranchEnded = true;
				//trace("lBranchEnded = true");
			}
			//trace(" !m_SlideGraphObj.hasOwnProperty( aCurrentSlideIndex ) "+lBranchEnded);
			
			if( !lBranchEnded && (aCurrentTempSlidesObj[ aCurrentSlideIndex ]!=undefined))
			{
				lCurrentBranchType = this.BranchEnum.kLoopBranchFound;
				lBranchEnded = true;
				//trace("lBranchEnded = true");
			}
			//trace(" aCurrentTempSlidesObj.hasOwnProperty( aCurrentSlideIndex ) "+lBranchEnded);
			//trace("lBranchEnded = "+lBranchEnded);
			
			
			aCurrentTempSlidesArray.push(aCurrentSlideIndex);
			aCurrentTempSlidesObj[aCurrentSlideIndex] = aCurrentSlideIndex;
			//trace("aCurrentTempSlidesArray.length"+aCurrentTempSlidesArray.length);
			
			if( lBranchEnded )
			{ 
				++this.m_BranchNumber;
				if( this.m_BranchNumber == 1 )
				{
					
					this.m_CompletionBranch = this.m_CurrentBranch.concat(aCurrentTempSlidesArray);
					this.m_CompletionBranchSet = true;
					
					var lShouldCountSlides = ! ( ( lCurrentBranchType == this.BranchEnum.kLoopBranchFound ) && (aCurrentSlideIndex == aCurrentTempSlidesArray[0]) );
					
					if(lShouldCountSlides)
					{
						this.m_CompletionBranchSlideCount = this.countUniqItems(this.m_CurrentBranch.concat(aCurrentTempSlidesArray));
						this.m_CompletionBranchSlideCountSet = true;
					}
					
					aCurrentTempSlidesArray.pop(); // remove the last element
					delete aCurrentTempSlidesObj[aCurrentSlideIndex];
					
					return this.BranchEnum.kBranchFound;
					
				}
				else if( this.m_BranchNumber >= 2 )
				{
					this.m_CompletionBranchSet = false;
					if(this.m_CompletionBranchSlideCountSet)
					{
						var lPresentCount = this.countUniqItems(this.m_CurrentBranch.concat(aCurrentTempSlidesArray));
						//trace(" lPresentCount = "+lPresentCount);
						var lShouldCountSlidesSecond = ! ( ( lCurrentBranchType == this.BranchEnum.kLoopBranchFound ) && (aCurrentSlideIndex == aCurrentTempSlidesArray[0]) );
						if( lShouldCountSlidesSecond && ( lPresentCount == this.m_CompletionBranchSlideCount ) )
						{
							aCurrentTempSlidesArray.pop(); // remove the last element
							delete aCurrentTempSlidesObj[aCurrentSlideIndex];
							return this.BranchEnum.kBranchFound;
						}
						else
						{
							this.m_CompletionBranchSlideCountSet = false;
							aCurrentTempSlidesArray.pop(); // remove the last element
							delete aCurrentTempSlidesObj[aCurrentSlideIndex];
							return this.BranchEnum.kMultipleBranchFound;
						}
					}
					else
					{
						aCurrentTempSlidesArray.pop(); // remove the last element
						delete aCurrentTempSlidesObj[aCurrentSlideIndex];
						return this.BranchEnum.kMultipleBranchFound;
					}
				}
			}
			
			var lConnectedSlideObj = this.m_SlideGraphObj[ aCurrentSlideIndex ];
			
			var lIsBranchFound = false;
			
			for( var lConnectedSlide in lConnectedSlideObj )
			{
				var lTempState = this.findCompletionBranchTraverse(Number(lConnectedSlide),aCurrentTempSlidesArray,aCurrentTempSlidesObj);
				switch( lTempState )
				{
					case this.BranchEnum.kBranchFound:
						lIsBranchFound = true;
					case this.BranchEnum.kBranchNotFound:
						break;
					case this.BranchEnum.kMultipleBranchFound:
						return this.BranchEnum.kMultipleBranchFound;
				}
			}
			
			aCurrentTempSlidesArray.pop(); // remove the last element
			delete aCurrentTempSlidesObj[aCurrentSlideIndex];
			
			return (lIsBranchFound)?this.BranchEnum.kBranchFound:this.BranchEnum.kBranchNotFound;		
		},
			
		findCompletionBranch: function()
		{
			this.m_CompletionBranch = [];
			this.m_CompletionBranchSet = false;
			this.m_BranchNumber = 0;
			
			var lStartSlideIndex = (this.m_CurrentBranch.length>=1)?this.m_CurrentBranch[this.m_CurrentBranch.length-1]:this.m_RootSlideIndex;
			var tempArray = [];
			var tempObject = {};
			this.findCompletionBranchTraverse(lStartSlideIndex,tempArray,tempObject);
		},
			
			
		/* Initializes the slide graph from movie XML */
		initialize: function()
		{
			if(!cp.D['baq'])
				return;
				
			var lGraphManagerData = cp.D['sgMgr'];
			if(lGraphManagerData == undefined)
				return;
			var lRootSlideIndex = lGraphManagerData['ri'];		
			var lSlideGraph = lGraphManagerData['sg'];
			if((lRootSlideIndex == undefined )||(lSlideGraph == undefined))
				return;
			
			this.m_InvalidSlideJump = false;
			this.m_RootSlideIndex = lRootSlideIndex;
			
			for (var i = 0; i < lSlideGraph.length; ++i) 
			{
				var lSlide = lSlideGraph[i]; 
				if((lSlide==undefined) || (lSlide.length != 2)) // lSlide = [slideIndex, [ConnectedSlideVector]]
					continue;
				this.m_SlideGraphObj[lSlide[0]]={};
				var lConnectedSlideVector = lSlide[1]; //[[3,[0]],[5,[3]]]
				for(var k=0; k<lConnectedSlideVector.length; ++k)
				{
					var lConnectedSlide = lConnectedSlideVector[k]; //lConnectedSlide = [slideIndex,[branchTypeVector]]
					if((lConnectedSlide==undefined) || (lConnectedSlide.length != 2)) // lSlide = [slideIndex, [ConnectedSlideVector]]
						continue;
					this.m_SlideGraphObj[lSlide[0]][lConnectedSlide[0]]={};
					var lbranchTypes = lConnectedSlide[1];
					for(var bt=0; bt<lbranchTypes.length;++bt)
					{
						var lbt = lbranchTypes[bt];
						if(lbt!=undefined)
							this.m_SlideGraphObj[lSlide[0]][lConnectedSlide[0]][lbt]=lbt;
					}
				}			
			}			
		},

		/* Capture Slide Jump */
		onSlideJump: function( aDestinationSlideIndex )
		{
			if(this. m_CurrentBranch.length > 0 )
			{
				var lPreviousSlideIndex = this.m_CurrentBranch[this.m_CurrentBranch.length-1];
				if( aDestinationSlideIndex == lPreviousSlideIndex )
				{
					//trace("Same slide added before");
					return;
				}
				
				if( this.m_SlideGraphObj[lPreviousSlideIndex]  == undefined)
				{
					//alert(" Inavlid slide jump ");
					this.m_BranchHistory.push( aDestinationSlideIndex );
					this.m_InvalidSlideJump = true;
					return;
				}
				
				if( this.m_SlideGraphObj[lPreviousSlideIndex][aDestinationSlideIndex] == undefined )
				{
					//alert(" Inavlid slide jump ");
					this.m_InvalidSlideJump = true;
					//Since this might be the case when user is try to jump to visited slide (transition not present in the graph) e.g through TOC
					//In that case we might need to update the current branch or scores.
					this.updateCurrentBranch(aDestinationSlideIndex);
					this.m_BranchHistory.push( aDestinationSlideIndex );
					return;
				}
			}
			this.m_BranchHistory.push( aDestinationSlideIndex );
			this.m_CurrentBranch.push( aDestinationSlideIndex );			
		},
			
		/* Calculate Slide view percentage */
		getSlideViewPercentage:function()
		{
			if( ( !this. m_CompletionBranchSet ) && ( ! this.m_CompletionBranchSlideCountSet  ) )
			{
				//trace("findCompletionBranch() called");
				this.findCompletionBranch();
			}
			
			if( ( ! this.m_CompletionBranchSet ) && ( ! this.m_CompletionBranchSlideCountSet  ) )
			{
				//trace(" No completion branch found second time ");
				return 'NaN';
			}
			
			var lViewedSlideCount = this.countUniqItems(this.m_CurrentBranch);
			
			var lTotalSlideCount = -1;
			if(this.m_CompletionBranchSlideCountSet)
				lTotalSlideCount = this.m_CompletionBranchSlideCount ;
			else
				lTotalSlideCount = this.countUniqItems(this.m_CompletionBranch);
			
			if( lTotalSlideCount <= 0 ) 
				return 'NaN'; 
			
			return lViewedSlideCount*100/lTotalSlideCount;
		},
			
		/*Check if Slide is present in the current branch*/
		isSlidePartOfCurrentBranch: function(aSlideIndex)
		{
			if((this.m_CurrentBranch.length > 0) && (this.m_CurrentBranch.indexOf(aSlideIndex) != -1))
				return true;			
			return false;
		},
			
		getCompletionBranch: function()
		{
			if(!this.m_CompletionBranchSet)
				this.findCompletionBranch();
			
			if(!this.m_CompletionBranchSet) //No completion branch found second time
				return [];
				
			return this.m_CompletionBranch;					
		},
		
		getCurrentBranch:function()
		{
			return this.m_CurrentBranch;					
		},
		
		getBranchHistory: function()
		{
			return this.m_BranchHistory;
		},
			
		/*restore Completion Branch from LMS */
		restoreCompletionBranchState:function(aCompletionBranch)
		{
			if(aCompletionBranch.length>0)
			{
				this.m_CompletionBranch = []
				this.m_CompletionBranch = aCompletionBranch;
				this.m_CompletionBranchSet = true;
			}
		},
		/*restore Current Branch from LMS */
		restoreCurrentBranchState:function( aCurrentBranch)
		{
			if(aCurrentBranch.length>0)
			{
				this.m_CurrentBranch = []
				this.m_CurrentBranch = aCurrentBranch;
				
				this.m_BranchHistory = []
				this.m_BranchHistory = aCurrentBranch.slice();
			}
		},
		
		/*Reset Current Branch e.g while retaking from quiz */
		resetCurrentBranch: function(aSlideIndex)
		{
			if(aSlideIndex < 0)
				return;
			var lSlideIndexInBranch = -1;
			for(var lIndex = 0; lIndex < this.m_CurrentBranch.length; ++lIndex)
			{
				if(this.m_CurrentBranch[lIndex] == aSlideIndex)
				{
					lSlideIndexInBranch = aSlideIndex;
					break;
				}
			}
			if((lSlideIndexInBranch >=0) && ((lSlideIndexInBranch+1) < this.m_CurrentBranch.length))
				this.m_CurrentBranch.splice(lSlideIndexInBranch+1);
		},
		
		updateCurrentBranch: function(aDestinationSlideIndex)
		{
			//Need to take care the case where aDestinationSlideIndex is present multiple times in branch. In that case how to update the branch
		},
		
		/* calcuates teh max Quiz Score */
		getMaxQuizScore: function()
		{	
			//Should be implemented in QuizSlideGraphManager	
			return 0;
		},
		
		/* calcuates the min Quiz Score */
		getMinQuizScore: function()
		{
			//Should be implemented in QuizSlideGraphManager
			return 0;
		},
		
		/* Calculate The marks percentage */
		getQuizScorePercentage: function()
		{
			//Should be implemented in QuizSlideGraphManager
			return 0;
		},
		
		/* First Slide to Jump to after second attempt */
		getNextAttemptFirstQuestionSlideIndex: function()
		{	
			//Should be implemented in QuizSlideGraphManager
			return -1;
		},	
		
		/* First Slide to Jump to after review is clicked */
		getReviewFirstQuestionSlideIndex: function()
		{
			//Should be implemented in QuizSlideGraphManager
			return -1;
		},
		/* calcuates num of questions in a branch. Returns NaN if not able to find definitive branch*/
		getNumQuestions: function()
		{
			//Should be implemented in QuizSlideGraphManager
			return 0;
		},
		getQuestionSlideProgressNumber: function(aQSlideIndex)
		{
			//Should be implemented in QuizSlideGraphManager
			return 'NaN';
		},
		setQuestionSlideProgressNumber: function(aQSlideIndex)
		{
			//Should be implemented in QuizSlideGraphManager
		},
		getLastQuestionSlideIndex: function()
		{
			//Should be implemented in QuizSlideGraphManager
			return -1;
		},
		
		/* get the list of connected slides for the last visited slide */
		getNextSlideList: function( aFromSlideIndex)
		{
			var lRetVal = [];
			if( this.m_SlideGraphObj[aFromSlideIndex] != undefined )
			{
				var lConnectedSlides = this.m_SlideGraphObj[aFromSlideIndex];
				for( var lSlideIter in lConnectedSlides )
				{
					lRetVal.push(Number(lSlideIter));
				}
			}		
			return lRetVal;
		},
		getIsJumpValid: function( aStartSlideIndex, aEndSlideIndex )
		{
			if(this.m_SlideGraphObj[aStartSlideIndex] == undefined )
			{
				return false;
			}
			if( this.m_SlideGraphObj[aStartSlideIndex][aEndSlideIndex] == undefined )
			{
				return false;
			}
			return true;
		},
		SaveCurrentBranch: function()
		{
			this.m_PrevBranch = this.m_CurrentBranch.slice();
		},
		GetPrevBranch: function()
		{
			return this.m_PrevBranch;
		}
	}
})(window.cp);