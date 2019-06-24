//var trree = JSON.parse(sessionStorage.getItem("sessionTree1")).taxonomy;
//var trree2 = JSON.parse(sessionStorage.getItem("sessionTree2")).taxonomy;

var tree  = JSON.parse(sessionStorage.getItem("sessionTree1"));
var tree2 = JSON.parse(sessionStorage.getItem("sessionTree2"));
var treeTax  = tree.taxonomy;
var treeTax2 = tree2.taxonomy;

countChildren(treeTax);
countChildren(treeTax2);

//Calculates al tasks for both taxonomies
let levelList = createRankList(treeTax);
let levelList2 = createRankList(treeTax2);
calculate_all_merges(levelList,levelList2);

console.log(treeTax);
console.log(treeTax2);


document.getElementById("table_taxon_id").innerHTML =
    "<tr><th></th><th>" + tree.name + "</th><th>" + tree2.name + "</th></tr>" +
        "<tr><th>        </th><th>" + tree.author + " - " + tree.date  + "</th><th>" + tree2.author + " - " + tree2.date + "</th></tr>" +
		"<tr><th>Rank</th><th>" + tree.accesDate + "</th><th>" + tree2.accesDate + "</th></tr>" +
    "<tr> <th>Kingdom</th><th>" + "Buscar" + "</th><th>" + "Buscar" + "</th> </tr>" +
    "<tr> <th>Phylum</th><th>" + "Buscar" + "</th><th>" + "Buscar" + "</th> </tr>" +
    "<tr> <th>Class</th><th>" + treeTax.totalClass + "</th><th>" + treeTax2.totalClass + "</th> </tr>" +
    "<tr> <th>Family</th><th>" + treeTax.totalFamily + "</th><th>" + treeTax2.totalFamily + "</th> </tr>" +
    "<tr> <th>Genus</th><th>" + treeTax.totalGenus + "</th><th>" + treeTax2.totalGenus + "</th> </tr>" +
    "<tr> <th>Species</th><th>" + treeTax.totalSpecies + "</th><th>" + treeTax2.totalSpecies + "</th> </tr>" +
    "<tr> <th>Total Nodes</th><th>" + "Buscar" + "</th><th>" + "Buscar" + "</th> </tr>";


document.getElementById("table_rank_id").innerHTML =
    "<tr><th>Changes</th><th>" + tree.name + "</th><th>" + tree2.name + "</th></tr>" +
        "<tr><th>        </th><th>" + tree.author + " - " + tree.date  + "</th><th>" + tree2.author + " - " + tree2.date + "</th></tr>" +
    "<tr><th>        </th><th>" + tree.accesDate + "</th><th>" + tree2.accesDate + "</th></tr>" +
    "<tr><th>Synonyms</th><th>" + tree.name + "</th><th>" + tree2.name + "</th> </tr>" +
    "<tr><th>Split</th><th>" + treeTax.totalSplits + "</th><th>" + treeTax2.totalSplits + "</th></tr>" +
    "<tr><th>Merged</th><th>" + treeTax.totalMerges + "</th><th>" + treeTax2.totalMerges + "</th></tr>" +
    "<tr><th>Moved</th><th>" + treeTax.totalMoves + "</th><th>" + treeTax2.totalMoves + "</th></tr>" +
    "<tr><th>Renamed</th><th>" + treeTax.totalRenames + "</th><th>" + treeTax2.totalRenames + "</th></tr>" +
    "<tr><th>Added</th><th>" + treeTax.totalInsertions + "</th><th>" + treeTax2.totalInsertions + "</th></tr>" +
    "<tr><th>Excluded</th><th>" + treeTax.totalRemoves + "</th><th>" + treeTax2.totalRemoves + "</th></tr>" +
    "<tr><th>Taxa changed</th><th>" + "Revisar ya que implica conjuntos" + "</th><th>" + "Revisar ya que implica conjuntos" + "</th></tr>" +
    "<tr><th>% changed</th><th>" + "Necesita el valor anterior" + "</th><th>" + "Necesita el valor anterior" + "</th></tr>";


//checks if bot trees are valid for visualization
//this treeTax comes from a file selected by the user and is modified by preprocesamiento.js and contChildren.js
if(!treeTax || !treeTax2){
	window.location.replace(loadingUrl);
}


//all options that can influece how the visualization is displayed
var initOptions = {
    defaultSize : 20,				//the size of a node
    defaultBarSize: 10,				//the size of resume bars
    indent : 30,					//indent betwen each rank of hierarchy
    increment: 20,					//old color changin parameters
    hsbColor: 30,					
    hsbIncrement: 2,
    hsbBrigthnes: 50,
    hsbbrigthnesIncrement: 7,		//end of old color changin parameters
    use_log_scale:false,			//proporcional scale of nodes acording to their content
    use_resume_bars:true,
    log_increment: 15,				//increment of node size by logarigmic level
    log_scale: 5,					//base of the logaritm for scale
    text_size: 12,					//display text size in indented treeTax
    text_hover: 14,					//Size of text when hovered
    "circle-padding": 3,			
    "hierarchy_distance":700,		//distance betwen hierarchys deprecated
    "width" : 350,					//indented-treeTax height
    "height" : 500,					//indented-treeTax height
    separation: 100,				//Separation betwen indented-treeTax and the size of the screen
    "background-color" : undefined,			//color of the background
    "stroke-color" : undefined,				
    "indent-stroke" : 0.5,					// weight of indent iine
    "indent-stroke-color" : undefined,		// color of indent line
    "hover-color" : undefined,				//hover color for node deprecated
    "hover-color-rect" : undefined,			
	"text-color": undefined,				//Color of display text
	"remove-color":undefined,				//color of removed nodes used in lines and text
	"add-color":undefined,					//color of added nodes used in lines and text
	"split-color":"#e066ff",				//color of split nodes used in lines and text
	"merge-color":"#ff9a47",				//color of merge nodes used in lines and text
	"rename-color":"#a37c58",				//color of rename nodes used in lines and text
	"move-color":"#8888CC",					//color of move nodes used in lines and text
	"equal-color":"#e8e8e8",				//color of congruence nodes used in lines and text
	"focus-color":"#50500020",				//color of text when a node is clicked
	"atractionForce":0.01,					// force by pixel distance causes movement of nodes
	 bundle_radius: 60,						//radius in pixel to create bundles
	 dirtyNodes:false,						//flag marked when a node is moved in the children array of its parent
}

//stores the canvas
var canvas = null;


//amuount of the screen the canvas takes
var totalCanvasWidth = 1.0;
var totalCanvasHeight = 0.9;



//position of canvas focus
var xPointer = 0;	//stores x displacement of visualization, not used
var yPointer = 0;  //stores y displacement of  visualization

//variables for focus and focus animation
var dispLefTree = 0;
var dispRightTree = 0;
var targetDispLefTree = 0;
var targetDispRightTree = 0;

//speed at wich the mouse scrolls the visualization
const SCROLL_SPEED = -0.4;

var changed = false;		//
var click = false; 			//


var focusNode = undefined;	//Last node selected by the user
var focusClick = 0;


//List of visible nodes for both trees by rank
//Only nodes on this list will be rendered, they are added or removed when user open or closes a node
//No all nodes on list are drawn, there is an algorithm that determines wich nodes are on the screen
//It is required that nodes in this treeTax are sorted by it's  y coordinate any disorder will cause inconcistencis in the render behaviour
treeTax.visible_lbr = {
      "domain" :        [],
      "kingdom":        [],
      "phylum" :        [],
      "class" :         [],
      "order" :         [],
      "superfamily" :   [],
      "family" :        [],
      "subfamily" :     [],
      "tribe" :         [],
      "subtribe" :      [],
      "genus" :         [],
      "subgenus" :      [],
      "species" :       [],
      "infraspecies":   [],
      "subspecies":      [],
  
};

treeTax2.visible_lbr = {
      "domain" :        [],
      "kingdom":        [],
      "phylum" :        [],
      "class" :         [],
      "order" :         [],
      "superfamily" :   [],
      "family" :        [],
      "subfamily" :     [],
      "tribe" :         [],
      "subtribe" :      [],
      "genus" :         [],
      "subgenus" :      [],
      "species" :       [],
      "infraspecies":   [],
      "subspecies":      [],
  
};

/*This function reasign value of windowWith due to the division*/
function getWindowWidth(){
	return windowWidth - windowWidth*0.2;
}

//processing function executed before the first draw
function setup() {
	console.log({dispLefTree,dispRightTree,targetDispLefTree,targetDispRightTree});
	


	//make canvas size dynamic
	canvas = createCanvas(getWindowWidth()*totalCanvasWidth, windowHeight*totalCanvasHeight);
	canvas.parent('sketch-holder');
	var x = 0;
	var y = 0;//(windowHeight*(1.0-totalCanvasHeight));
	canvas.position(x, y);
  
	//setup optiopns that cannot be initialized before setup
	initOptions["background-color"] = color(255,180,40);
	initOptions["stroke-color"] = color(0,0,0);
	initOptions["indent-stroke-color"] = color(80,80,80);
	initOptions["hover-color"] = color(120,80,87);
	initOptions["text-color"] = color(0,0,0);
	initOptions["hover-color-rect"] = color(48, 44, 66);
	initOptions["remove-color"] = color(255, 96, 96);
	initOptions["add-color"] = color(177, 255, 175);

	//Inicialization of first and second treeTax
	countChildren(treeTax);
	initializeIndentedTree(treeTax,initOptions,1);
	

	countChildren(treeTax2);
	initializeIndentedTree(treeTax2,initOptions,-1);
	

	//calculates al tasks for both taxonomies
	let levelList = createRankList(treeTax);
	let levelList2 = createRankList(treeTax2);
	calculate_all_merges(levelList,levelList2);

	
	//first line update before drawing
	update_lines(treeTax);
	sort_and_update_lines();


	//filte system 
	var filter = new FilterSystem(treeTax,treeTax2);

	console.log(filter.getClosestKey("treu"));
	console.log(filter.getTopNKeys(3,"treu"));
	console.log(filter.queryTaxons(null,"treu"));
}


//processing function to detect mouse wheel movement used to move the visualization
function mouseWheel(event) {
	yPointer -= event.delta*SCROLL_SPEED;
}

//processing function to detect mouse click, used to turn on a flag
function mouseClicked(){
	click = true;
}


//processing function to detect window change in size
//resize and change canvas position according to window size
function windowResized() {
	resizeCanvas(getWindowWidth()*totalCanvasWidth, windowHeight*totalCanvasHeight);
	var x = 0;
	var y = 0;//(windowHeight*(1.0-totalCanvasHeight));
	canvas.position(x, y);
}


//processing function to draw on canvas, executed at a fixed rate, normaly 30 times per second
function draw() {
	//smooth node focusing
	dispLefTree = lerp(dispLefTree, targetDispLefTree, 0.1);
	dispRightTree = lerp(dispRightTree, targetDispRightTree, 0.1);


	left_pos = {x: initOptions.separation, y: 0 + dispLefTree};
  	right_pos = {x: getWindowWidth()-initOptions.separation, y: 0 + dispRightTree};



	//if interface lines changed force update
	if(interface_variables.changedLines){
		changedLines = false;
		createBundles(left_pos,right_pos,initOptions.bundle_radius);
		//console.log("updated lines");
	}

	translate(xPointer,-yPointer);
	background(255);
	fill(0);


	//draws based on the current window size
	let base_y = getWindowWidth()/2 - initOptions.width/2;

	//Draw function, this draws the indented-treeTax
	optimizedDrawIndentedTree(treeTax.visible_lbr,initOptions,initOptions.separation ,dispLefTree,false);
	optimizedDrawIndentedTree(treeTax2.visible_lbr,initOptions,getWindowWidth()-initOptions.separation ,dispRightTree,true);

  	
	//bundling comes from draw_menu js
	//Draw current visible lines
	ls_drawLines(initOptions,yPointer,left_pos,right_pos,interface_variables.bundling);

  
  	//check if we are using bars
  	//this is basicaly a switch when changed executes code
  	if(initOptions.use_resume_bars != interface_variables.bars){
  		initOptions.use_resume_bars = interface_variables.bars
  		//update the treeTax if we are not using bars
  		recalculateTree(treeTax,initOptions,function(){return;});
  		recalculateTree(treeTax2,initOptions,function(){return;});
  	}

  	//set click flag to false
  	click = false;


  	//mark focused node, little gray rect on screen
  	if(focusNode){
  		let pc = 0.4;
	  	fill(initOptions["focus-color"]);
	  	stroke(initOptions["focus-color"]);
	  	strokeWeight(1);
	  	rect(-10,focusNode.y + initOptions.defaultSize*(1-pc)/2 ,getWindowWidth()+10,initOptions.defaultSize*0.4);
  	}
}


//initialize required values on the json treeTax
function initializeIndentedTree(originalTree,options,growDirection){

	//add required variables to node
	//function comes from countChildren.js
    proccesByLevel(originalTree,function(node){
      node.x = 0;
      node.y = 0;
      node.width = 0;
      node.height = 0;
      node.collapsed = true;
    });
    
    
    //set parent node initial size values
    originalTree.width = options.width;
    originalTree.height = options.defaultSize; 

    //open first node of each hirarchy
    unfoldNode(originalTree,initOptions);

    //adds indent to treeTax
    setIndentCordinates(originalTree,options,growDirection);
    calculateSize(originalTree,options);
	calculateCordinates(originalTree,options,0,0);

	//add treeTax root to render
	originalTree.visible_lbr[originalTree.r.toLowerCase()].push(originalTree);
    pushIntoUnfolded(originalTree);
    originalTree.c.forEach(function(child_node){pushIntoUnfolded(child_node)});

}

//recaulculates treeTax
//this functions updates node size and cordinates when needed
//it's executed asynchronously so it does not interfere with de drawing process
async function recalculateTree(originalTree,options,callback) {

  	calculateSize(originalTree,options);
	calculateCordinates(originalTree,options,0,0);
  	callback();
  	changed = false;
}

//add indent coordinates to nodes
function setIndentCordinates(root, options,growDirection){
  let pendingNodes = [];
  pendingNodes.push(root);
  
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop();
     
    if(actual !== null && actual !== undefined){
    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      let childNode = actual.c[childIndex];
      if(childNode){
      childNode.x = actual.x + options.indent*growDirection;
      //childNode.x *= growDirection;
      //if(growDirection < 0) childNode.x -= textWidth()
      childNode.width = actual.width-options.indent;
      pendingNodes.push(childNode);
      }
    }
    }
  }
}

//calculate node size, supports proportional size on nodes when using logarithmic scale
function calculateSize(root, options){
  let pendingNodes = [];
  pendingNodes.push(root);
  
  //iterative iteration of a treeTax
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop(); 
    //reset in case of being an actualizatioo
    //console.log(pendingNodes);
    if(actual.collapsed){
    	actual.height = getNodeSize(actual, options);/*options.defaultSize*/;
    }else{
    	actual.height = options.defaultSize;/*options.defaultSize*/;
    }
    actual.y = 0;

    if(actual !== null && actual !== undefined){
    let acumulatedSize = options.defaultSize;


	//increaseFamilySize(actual,options.defaultSize*2);
    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      let childNode = actual.c[childIndex];
      if(childNode){
			let nodeSize = getNodeSize(childNode, options);
			//relative position to parent
			//childNode.y = acumulatedSize;
			
			childNode.height += nodeSize;
			acumulatedSize += nodeSize;
			//increaseFamilySize(actual,nodeSize)
			if(!actual.collapsed){
				increaseFamilySize(childNode,nodeSize);
				pendingNodes.push(childNode);
		}
      }
        
    }
    }
	//fin de if
	}
  
	
}

//return node logaritimicScale
//this helper functions defines node size
function getNodeSize(node, options){
	//stores how much extra size the node gets
	let extra = 0;
	
	if(node.desendece && options.use_log_scale && options.use_resume_bars)
		extra =  Math.log(node.desendece)/Math.log(options.log_scale)*options.log_increment;
	else if(node.desendece && options.use_resume_bars)
		extra = options.defaultBarSize;
	//console.log({options,extra});
	return (options.defaultSize+extra);
				
}

//adds size to a node based on tis famili
function increaseFamilySize(node, increment){
	node.f.forEach(function(fam){
			fam.height += increment;
		})
	}

//sets the position of a node based on other node sizes, and treeTax cordinates
function calculateCordinates(root, options, xPos,yPos){
  let pendingNodes = [];
  pendingNodes.push(root);
  
  root.x = xPos;
  root.y = yPos;
  
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop(); 
    
    if(actual !== null && actual !== undefined && !actual.collapsed){
    let acumulatedHeigth = options.defaultSize;

    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      let childNode = actual.c[childIndex];
      if(childNode){
			//relative position to parent
			childNode.y += actual.y + acumulatedHeigth;
			childNode.x += xPos;
			acumulatedHeigth += childNode.height;
			pendingNodes.push(childNode);
      }  
    }

    }
  }
	
}

//opens a node
function unfoldNode(node,options){
	node.collapsed = false;
}
 

 //closes a bode 
function foldNode(node, options){
	//node.collapsed = true;
	node.collapsed = true;
	node.c.forEach(
	
	//removes node and it's children from render, and closes them if needed
	function(child_node){
		proccesByLevelConditional(child_node,function(actual){
			actual.collapsed = true;
			popFromUnfolded(child_node);
		}
		,"collapsed",false)
	}
	)
}


//Main draw functions this simply cals a draw for each rank on the hierarchy
//also  checks the state of nodes and if they need to be recalculated to avoid inconsistency on the render
//uses options.dirtyNodes flag to check if nodes have been reordered
function optimizedDrawIndentedTree(listByRank,options,xpos,ypos,isRight){
	//if nodes are dirty requires update could be moved to a diferent thread
	if(options.dirtyNodes){
		//checks positions of nodes, for changes that were not recalculated
		recalculateTree(treeTax,initOptions,function(){return;});
  		recalculateTree(treeTax2,initOptions,function(){return;});


		sortVisualNodes(options);
		createBundles(left_pos,right_pos,initOptions.bundle_radius);

  		options.dirtyNodes = false;

	}

	//for debug purposes
	//stores how many nodes are drawn on each frame
	let totalDrawnNodes = 0;
	
	//simple variable with rank names
	//Extract ranks contained on listByRank
	let drawRanks = Object.keys(listByRank);
	//draws each of the specified ranks on listByRank
	drawRanks.forEach(
		(rankName) => {
			let currentRankList = listByRank[rankName];
			//the drawing function 
			totalDrawnNodes += drawHierarchyLevel(currentRankList,options,yPointer,xpos,ypos,isRight);


		}
	)

	//console.log("Total draw nodes on render: ", totalDrawnNodes);
	
	}


//This is the drawing functions
//Receives a list of nodes sorted by it's y corrdinate and draw only the nodes inside the screen
//returns the amount of nodes drawn
function drawHierarchyLevel(taxons,options,pointer,xpos,ypos,isRight){
	if(taxons.length <= 0) return 0; //check if there are node to draw
	
	//adds node focus displacement to the corresponding treeTax
	pointer += isRight ? -dispRightTree : -dispLefTree;

	//binary search to find the first node inside the screen
	let initial = findHead(taxons,pointer);

	//set color acording to rank instead of using defined colors //deprecated
	let iniColor = (options.hsbColor + options.hsbIncrement*getValueOfRank(taxons[0].r))%100; //deprecated
	let iniBrigthnes = (options.hsbBrigthnes + options.hsbbrigthnesIncrement*getValueOfRank(taxons[0].r))%100; //deprecated

	//counter for debuggin purposes
	var draws = 0;

	//Variable to store displacement required if the treeTax is on the right side
	let extra_pos = 0;

	if(isRight){
		extra_pos = -taxons[0].width;
	}


	//draw each node until a taxon is out of the screen
	for(let taxon = initial; taxon < taxons.length; taxon++){
		let node = taxons[taxon]; //current drawn taxon
		

		if(node.f.length <= 0 || !node.f[node.f.length-1].collapsed){
			
			draws++;//increase draws variable for debug
			
			let node_text_width = node.tw;//size of the text displayed on scren
			//this depends on the data displkayed on DrawOnlyText and should be changed if that variable is changed

			fill(iniColor,0,iniBrigthnes);
			//drawCutNode(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos);
			if(isRight){
			
			//a lot of dangerous magin numbers, they control the displcacement of the left treeTax text and button
			drawOnlyText(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos-node_text_width-25,ypos,isRight,node_text_width);
			drawExpandButton(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos-10,ypos,isRight);
			}
			else{
			drawOnlyText(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos+15,ypos,isRight,node_text_width);
			drawExpandButton(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos,isRight);
			
			}

			//checks if need to draw outline of nodes
			if(interface_variables.squares){
				drawInside(node, xpos+extra_pos,ypos, options);
			}
			//chek if indent lines are active or unactive
			if(interface_variables.lines){
				drawIndent(node, xpos,ypos, options,isRight);
			}
			//check if resume bars must be drawm
			if(interface_variables.bars)
				drawResumeBars(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos+extra_pos,ypos);

		}
		//if the node is out of the screen stop drawing
		if(node.y > pointer + windowHeight*totalCanvasHeight){break;}

	}

	//console.log("amount of draw calls from render:",draws);
	
	return draws;

	}


//binary search to find first node to draw
function findHead(list, targetY){
		let initialIndex = 0;
		let finalIndex = list.length-1;
		let previousIndex = -1;
		let middleIndex = 0;
		if(list.length <= 0) return 0;
		while( initialIndex <= finalIndex){
			previousIndex = middleIndex;
			middleIndex = Math.floor((initialIndex+finalIndex)/2);
			if(list[middleIndex].y < targetY){
				initialIndex = middleIndex + 1;
			}else if(list[middleIndex].y > targetY){
				finalIndex = middleIndex -1;
			}else{
				return middleIndex;
			}
		}
		
		return middleIndex;
	}
	

//checks if a node is on the screen
function isOnScreen(node,yScreenPos,screenHeight){
		if(node.y+node.height >= yScreenPos + screenHeight && node.y <= yScreenPos + screenHeight){
			return true;
		}
		if(node.y+node.height >= yScreenPos && node.y <= yScreenPos){
			return true;
		}
		if(node.y >= yScreenPos && node.y <= yScreenPos + screenHeight){
				return true;
		}
		//console.log(node.n+ ": "+node.y+"--"+(node.y+node.height)+"  is not on screen" + yScreenPos +"---" + (yScreenPos + screenHeight));
		//console.log("node.y+node.height >= yScreenPos + screenHeight -->" + (node.y+node.height >= yScreenPos + screenHeight ));
		//console.log("node.y <= yScreenPos + screenHeight -->" + (node.y <= yScreenPos + screenHeight));
		return false;
	}



//basic node drawing function
//draws text
//set information on screen box
//this functions knows when the mouse is over a node and also chekcs for clicks
//this is done every frame
function drawOnlyText(node,initialY,finalY,options,xpos,ypos, isRight,node_text_width){
	let clicked = false;
	//hover interaction
	fill(options["text-color"]);
	//set color of tasks
	if(interface_variables.removed && node.removed){
		fill(options["remove-color"]);
	}else if(interface_variables.added && node.added){
		fill(options["add-color"]);
	}else{
		fill(options["text-color"]);
	}

	//check if mouse is over node
	if(isOverRect(mouseX +xPointer, mouseY+yPointer,node.x + xpos,node.y + ypos,node_text_width,options.defaultSize)){
		fill(options["hover-color"]); 
		textSize(options.text_hover);



		//this functions comes from drawMenu.js
		// Pending to delete, code to show a box with data
		/*if(showInfo){*/
			let author = node.a == "" ? "" : `<br>Author:${node.a}`;
			let date = (node.ad || node.ad == "") ? "" : `  Date:${node.da}`;
			let synonim = node.equivalent ? "<br>Synonims: "+ node.equivalent.length : "";
			let splits = "<br>Splits: "+ node.totalSplits ;
			let merges = "----Merges: "+ node.totalMerges;
			let removes = "<br>Removes: "+ node.totalRemoves;
			let insertions = "----Insertions: "+ node.totalInsertions;
			let renames = "<br>Renames: "+ node.totalRenames;
			let moves = "----Moves: "+ node.totalMoves;
			let pv = "<br>----P: "+ node.p;
			//shows info on screen*/

      // document.getElementById("table_rank_id").rows[0].cells[0].innerHTML = node.n;

      "<tr><th>Changes</th><th>" + node.n + "</th><th>" + tree2.name + "</th></tr>" +
        "<tr><th>        </th><th>" + author + " - " + tree.date  + "</th><th>" + tree2.author + " - " + tree2.date + "</th></tr>" +
    "<tr><th>        </th><th>" + date + "</th><th>" + tree2.accesDate + "</th></tr>" +
    "<tr><th>Synonyms</th><th>" + tree.name + "</th><th>" + tree2.name + "</th> </tr>" +
    "<tr><th>Split</th><th>" + splits + "</th><th>" + treeTax2.totalSplits + "</th></tr>" +
    "<tr><th>Merged</th><th>" + merges + "</th><th>" + treeTax2.totalMerges + "</th></tr>" +
    "<tr><th>Moved</th><th>" + moves + "</th><th>" + treeTax2.totalMoves + "</th></tr>" +
    "<tr><th>Renamed</th><th>" + renames + "</th><th>" + treeTax2.totalRenames + "</th></tr>" +
    "<tr><th>Added</th><th>" + insertions + "</th><th>" + treeTax2.totalInsertions + "</th></tr>" +
    "<tr><th>Excluded</th><th>" + removes + "</th><th>" + treeTax2.totalRemoves + "</th></tr>" +
    "<tr><th>Taxa changed</th><th>" + "Revisar ya que implica conjuntos" + "</th><th>" + "Revisar ya que implica conjuntos" + "</th></tr>" +
    "<tr><th>% changed</th><th>" + "Necesita el valor anterior" + "</th><th>" + "Necesita el valor anterior" + "</th></tr>";


			// showInfo(node.n,`Rank: ${node.r}` + author + date + synonim+splits+merges+removes+insertions+renames+moves+pv);
		//}

    //Bryan, good job!
    

		//if mouse is over and the button clicked
		if(click){
			//focus the equivalent node on the other side
			if(node.equivalent && node.equivalent.length > 0){
				//iterate equivalent nodes
				if(focusNode === node) focusClick++
				else focusClick = 0;

				if(isRight){
					let index = focusClick%node.equivalent.length;
					targetDispLefTree = node.y - findOpen(node.equivalent[index]).y;
					yPointer -= targetDispRightTree;
					targetDispRightTree = 0;
					dispRightTree = 0;
					
				}else{ /* isLeft! */
					let index = focusClick%node.equivalent.length;
					targetDispRightTree = node.y - findOpen(node.equivalent[index]).y;
					yPointer -= targetDispLefTree;
					targetDispLefTree = 0;
					dispLefTree = 0;
				}
				
				focusNode = node;
				console.log(focusClick);
				forceRenderUpdate(initOptions);

        /*Change table info on click*/
        document.getElementById("table_rank_id").innerHTML =
      "<tr><th>Changes</th><th>" + node.n + "</th><th>" + node.equivalent[0].n + "</th></tr>" +
        "<tr><th>        </th><th>" + node.a + " - " + node.da  + "</th><th>" + node.equivalent[0].a + " - " + node.equivalent[0].da + "</th></tr>" +
      "<tr><th>        </th><th>" + node.ad + "</th><th>" + node.equivalent[0].ad + "</th></tr>" +
      "<tr><th>Synonyms</th><th>" + node.equivalent.length + "</th><th>" + node.lenght + "</th> </tr>" +
      "<tr><th>Split</th><th>" + node.totalSplits + "</th><th>" + node.equivalent[0].totalSplits + "</th></tr>" +
      "<tr><th>Merged</th><th>" + node.totalMerges + "</th><th>" + node.equivalent[0].totalMerges + "</th></tr>" +
      "<tr><th>Moved</th><th>" + node.totalMoves + "</th><th>" + node.equivalent[0].totalMoves + "</th></tr>" +
      "<tr><th>Renamed</th><th>" + node.totalRenames + "</th><th>" + node.equivalent[0].totalRenames + "</th></tr>" +
      "<tr><th>Added</th><th>" + node.totalInsertions + "</th><th>" + node.equivalent[0].totalInsertions + "</th></tr>" +
      "<tr><th>Excluded</th><th>" + node.totalRemoves + "</th><th>" + node.equivalent[0].totalRemoves + "</th></tr>" +
      "<tr><th>Taxa changed</th><th>" + "Revisar ya que implica conjuntos" + "</th><th>" + "Revisar ya que implica conjuntos" + "</th></tr>" +
      "<tr><th>% changed</th><th>" + "Necesita el valor anterior" + "</th><th>" + "Necesita el valor anterior" + "</th></tr>";

				//console.log(node.n, node.y , findOpen(node.equivalent[0]).y);

			}
			
		}

	}

	noStroke();


	let size = (node.totalSpecies) ? node.totalSpecies : "";
	let displayText = node.r +":"+node.n + " " + size; //text displayed as node name
	node.tw = textWidth(displayText); //update textwidht required on other modules
	text(displayText,node.x +5 +xpos,ypos + node.y+15); //draw the text !!!!
	textSize(options.text_size);
}



//draw the button that can open or close nodes
function drawExpandButton(node,initialY,finalY,options,xpos,ypos, isRight){
	if(node.c.length <= 0 )return;
	fill("#FFFFFF");
	stroke("#000000");
	strokeWeight(2);
	let button_size = 12;
	let button_padding = 3;
	let node_x_pos = node.x + xpos;
	let node_y_pos = node.y + ypos + 4;

	//check if mouse is over button
	if(isOverRect(mouseX +xPointer, mouseY+yPointer,node_x_pos,node_y_pos,button_size,button_size)){
		button_size *=  1.2;

		//check if clicked
		if(click && !changed){
			synchronizedToggle(node,isRight)
		}
		forceRenderUpdate(options);
	}

	//draw the graphics of the button
	rect(node_x_pos,node_y_pos,button_size ,button_size );
	line(node_x_pos + button_padding,node_y_pos + button_size /2, node_x_pos + button_size - button_padding ,node_y_pos + button_size /2);
	if(node.collapsed)
	line(node_x_pos + button_size /2,node_y_pos + button_padding, node_x_pos + button_size/2 ,node_y_pos + button_size - button_padding);
	

}

function synchronizedToggle(node,isRight){
	if(node.collapsed){
				node.equivalent.forEach(
					(eqNode)=>{	scaleToggleNode(eqNode,!isRight);}
				)
			}else{
				node.equivalent.forEach(
					(eqNode)=>{	
						//for synchronization change only if they are the same
						if(node.collapsed == eqNode.collapsed)
						toggleNode(eqNode,!isRight);}
				)
			}
			toggleNode(node,isRight);
}


function scaleToggleNode(node,isRight){
	node.f.forEach(
		(familiar) => {if(familiar.collapsed) toggleNode(familiar,isRight)}
	)
	if(node.collapsed){
		toggleNode(node,isRight);
	}
}

//visualy opens or close nodes
function toggleNode(node,isRight){
	//keep visible nodes list clean
			//if its parent is closed  open the higest node in the rank
			let cleaning_function;
			let elder = getRoot(node);
			//cleaning functions is the function executed to the affected nodes
			//open or close node
			if(node.collapsed){
				unfoldNode(node);
				cleaning_function = function(){node.c.forEach( 
				function(child_node){if(child_node){pushIntoUnfolded(child_node)}})
			};
			}else{
				foldNode(node);
				cleaning_function = undefined;
			}
			changed = true;
			
			click = false;

			//update treeTax acording to changes
			recalculateTree(elder,initOptions,function(){
				if(cleaning_function){cleaning_function(elder);}
			});
			//create groups for hierarchical edge bundling
			//recreate lines
	  		let left_pos = {x: initOptions.separation, y: 0 + dispLefTree};
	  		let right_pos = {x: getWindowWidth()-initOptions.separation, y: 0 + dispRightTree};
	  		//recreate bundles with the extra or removed lines
	  		update_lines(node,isRight);
	  		createBundles(left_pos,right_pos,initOptions.bundle_radius);
}

//add element to rendering queue
function pushIntoUnfolded(node){
	let elder = getRoot(node);
	let actualVisibleRank = elder.visible_lbr[node.r.toLowerCase()];
	//console.log({actualVisibleRank});
	let headIndex = findHead(actualVisibleRank,node.y)
	let head =	actualVisibleRank[headIndex];
	//console.log(`head : ${headIndex}`);
	//console.log({actualVisibleRank});
	if(!head || (headIndex == 0 && head.y >= node.y) ){
		actualVisibleRank.unshift(node);
		//console.log(`unshifted ${node.n}`);
	}else
	if(head.y >= node.y){
		//console.log(`${node.y}>=${head.y}spliced - ${node.n}--${head.n}: ` + (headIndex)+"--"+headIndex);
		actualVisibleRank.splice(headIndex, 0, node);
	}else{
		//console.log(`spliced + ${node.n}: `+ (headIndex + 1));

		actualVisibleRank.splice(headIndex + 1, 0, node);
	}
	//printListNodeNames(actualVisibleRank);

}

//helper function for printen the name of a list of taxons
function printListNodeNames(printedList){
	let result = "";
	for(let i = 0; i < printedList.length; i++){
		result = result + "->" + printedList[i].n;
	}
	console.log(result);
}


//remove element from rendering queue
function popFromUnfolded(node){
	let elder = getRoot(node);
	let actualVisibleRank = elder.visible_lbr[node.r.toLowerCase()];
	let headIndex = findHead(actualVisibleRank,node.y)
	if(actualVisibleRank.length > 0){
		actualVisibleRank.splice(headIndex, 1);
	}
}

//gets root of a treeTax with a given node
function getRoot(node){
			if(node.f.length > 0){
				return node.f[0];
			}
			return node; 
			
}


//check if a cordinate is inside a rect
function isOverRect(xpos,ypos,rxpos,rypos,rwidth,rheight){
	return (xpos >= rxpos && xpos <= rxpos+rwidth
		&& ypos >= rypos && ypos <= rypos+rheight);
}





function drawInside(node,xpos,ypos,options){
	//console.log(node.x+"--"+node.y+"--"+node.width+"--"+node.height );
	stroke(options["stroke-color"]);
	noFill();
	if(!node.collapsed){
		rect(node.x + xpos +options.indent,node.y +ypos + options.defaultSize,node.width-options.indent,node.height - options.defaultSize);
	}else{
		//rect(node.x + xpos /*- options.indent*/,node.y +ypos ,node.width /*+ options.indent*/,node.height);
	}
}

//draw indent lines
function drawIndent(node,xpos,ypos,options, isRight){
	stroke(options["indent-stroke-color"]);
	strokeWeight(options["indent-stroke"]);
	if(node.f.length > 0){
	let parentNode = node.f[node.f.length -  1];
	let defaultYDisp = options.defaultSize/2 + ypos;
	let xdirection = 1
	if(isRight) xdirection = -1;
	let defaultXDisp = xpos + options.indent/2*xdirection;
	line(parentNode.x + defaultXDisp, node.y + defaultYDisp, node.x + xpos, node.y + defaultYDisp);
	line(parentNode.x + defaultXDisp, parentNode.y + defaultYDisp + 10, parentNode.x + defaultXDisp, node.y + defaultYDisp);
	
	}
}

//draws only a part of a node is not used
function drawCutNode(node,initialY,finalY,options,xpos,ypos){
	//console.log(node.x+"--"+node.y+"--"+node.width+"--"+node.height );
	let yCoord = Math.max(node.y,initialY);
	//console.log(node.x,node.y);
	//calculate te rect that is inside the screen
	let newHeigth = Math.min(node.height + (node.y - yCoord),finalY - initialY);
	//console.log(newHeigth);
	//fill(options["background-color"]);
	stroke(options["stroke-color"]);
	strokeWeight(2);
	if(isOverRect(mouseX +xPointer, mouseY+yPointer,node.x + xpos,node.y + ypos,node.width,options.defaultSize)){
		fill(options["hover-color-rect"]);
	}
	//noFill();
	/*if(!node.collapsed){
		rect(node.x+xpos,yCoord,node.width,options.defaultSize);	
	}else
	{rect(node.x+xpos,yCoord,node.width,newHeigth);
	}*/
	rect(node.x+xpos,yCoord,node.width,newHeigth);
	noStroke();
	fill(0);
	
}


//deprecated function for drawing resume as dots instead of bars
function drawResumeDots(node,initialY,finalY,options,xpos,ypos){
		if(node.collapsed){
		let bar_width = options["width"] - node.x;
		let bar_heigth = node["height"] - options.defaultSize;
		let min = Math.min(bar_width ,bar_heigth);
		let max = Math.max(bar_width ,bar_heigth);
		let ratio = max/min;
		let density = node.desendece/ratio;
		let size = 0;
		if(density > 1){
			size = min/Math.sqrt(density);
		}else{
			size = min;
		}
		let radius = size - options["circle-padding"];
		let local_x = 0 ;
		let local_x_disp = node.x + xpos;
		let local_y = 0;
		let local_y_disp = node.y + ypos + options.defaultSize + size/2;
		//splits
		fill(options["split-color"]);
		let acc = 0;
		for(let taxon = 0; taxon < node.totalSplits; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
			
		}
		//merges
		fill(options["merge-color"]);
		for(let taxon = 0; taxon < node.totalMerges; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
		}
		//moves

		//removes
		fill(options["remove-color"]);
		for(let taxon = 0; taxon < node.totalRemoves; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
		}
		//adds
		fill(options["add-color"]);
		for(let taxon = 0; taxon < node.totalInsertions; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
		}
		//no change
		fill(options["equal-color"]);
		for(let taxon = 0; taxon < node.desendece - acc; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
		}
}
}

//annother form of displaying the resume incomplete
function drawResumeCircles(node,initialY,finalY,options,xpos,ypos){

}


//Draw the sumary of tasks as a bar can be activated or deactivated
function drawResumeBars(node,initialY,finalY,options,xpos,ypos){
	noStroke();
	//necesita cambiarse por value of rank
	if(node.collapsed && node.r.toLowerCase() != "species"){
		let bar_width = options["width"] - Math.abs(node.x);
		let bar_heigth = node["height"] - options.defaultSize;
		let unit = bar_width/node.desendece;
		let bar_x = node.x + xpos;
		let bar_y = node.y + options.defaultSize + ypos;

		//splits
		fill(options["split-color"]);
		rect(bar_x, bar_y, node.totalSplits*unit,bar_heigth);
		bar_x += node.totalSplits*unit;
		//merges
		fill(options["merge-color"]);
		rect(bar_x, bar_y,node.totalMerges*unit,bar_heigth);
		bar_x += node.totalMerges*unit;
		//moves
		fill(options["move-color"]);
		rect(bar_x, bar_y,node.totalMoves*unit,bar_heigth);
		bar_x += node.totalMoves*unit;
		//removes
		fill(options["remove-color"]);
		rect(bar_x, bar_y, node.totalRemoves*unit,bar_heigth);
		bar_x += node.totalRemoves*unit;
		//adds
		fill(options["add-color"]);
		rect(bar_x, bar_y, node.totalInsertions*unit,bar_heigth);
		bar_x += node.totalInsertions*unit;
		//renames
		fill(options["rename-color"]);
		rect(bar_x, bar_y, node.totalRenames*unit,bar_heigth);
		bar_x += node.totalRenames*unit;
		//nonde
		fill(options["equal-color"]);
		rect(bar_x, bar_y, bar_width + (node.x + xpos - bar_x)  ,bar_heigth);
		
	}


	

}

//sorts and update relation lines
async function sort_and_update_lines(){
		
		let sort_iterations = 10;
		//simulate n steps of sort
		for(let i = 0; i < sort_iterations; i++){
			//calculate forces for this step
			updateP(initOptions,lines.splits, targetDispLefTree,targetDispRightTree);
			updateP(initOptions,lines.merges, targetDispLefTree,targetDispRightTree);
			updateP(initOptions,lines.renames, targetDispLefTree,targetDispRightTree);
			updateP(initOptions,lines.equals, targetDispLefTree,targetDispRightTree);
			updateP(initOptions,lines.moves, targetDispLefTree,targetDispRightTree);

			//calculates a simulation step of physical atraction btwen nodes
			sort_all_lines(targetDispLefTree,targetDispRightTree);
			recalculateTree(treeTax,initOptions,function(){return;});
  			recalculateTree(treeTax2,initOptions,function(){return;});
		}
		

		


  		//create groups for hierarchical edge bundling
  		let left_pos = {x: initOptions.separation, y: 0 + dispLefTree};
  		let right_pos = {x: getWindowWidth()-initOptions.separation, y: 0 + dispRightTree};

  		

  		forceRenderUpdate(initOptions);
  		focusSelectedNode();

	}




//focus the last selected node
function focusSelectedNode(){
	if(focusNode){
		yPointer += focusNode.y-yPointer - windowHeight/2;
	}
}



//moves the node and tells the grafic system that things need to be reordered;
function moveNode(node,newX,newY,options){
	options.dirtyNodes = true;
	node.x = newX;
	node.y =newY;
}



//when you modify position of nodes you need to tell the drawing system
function forceRenderUpdate(options){
	options.dirtyNodes = true;
}



//sorts nodes on the list of visible nodes
//required by the optimized draw function
function sortVisualNodes(options){
	//sort visible node order
  		Object.keys(treeTax.visible_lbr).forEach(function(rank){
  			rank = rank.toLowerCase();
  			//console.log(rank.toUpperCase(),treeTax.visible_lbr[rank].length);
  			treeTax.visible_lbr[rank].sort((a, b) => + parseFloat(a.y) - parseFloat(b.y))
  			//treeTax.visible_lbr[rank].forEach((node) => console.log(node.n, node.y));
  		});

  		Object.keys(treeTax2.visible_lbr).forEach(function(rank){
  			rank = rank.toLowerCase();
  			//console.log(rank.toUpperCase(),treeTax.visible_lbr[rank].length);
  			treeTax2.visible_lbr[rank].sort((a, b) => + parseFloat(a.y) - parseFloat(b.y))
  			//treeTax2.visible_lbr[rank].forEach((node) => console.log(node.n, node.y));
  		});

  		//options.dirtyNodes = false;

}	




//expand button function



function setNode(node,isRight,state){
  let cleaning_function;
  let elder = getRoot(node);
  if(state){
      foldNode(node);
      cleaning_function = undefined;
  }else{
      unfoldNode(node);
      cleaning_function = function(){node.c.forEach( 
      function(child_node){if(child_node){pushIntoUnfolded(child_node)}})
  }
  }
  changed = true;
  click = false;
  //update treeTax acording to changes
  recalculateTree(elder,initOptions,function(){
  if(cleaning_function){cleaning_function(elder);}});
  //create groups for hierarchical edge bundling
  //recreate lines
  let left_pos = {x: initOptions.separation, y: 0 + dispLefTree};
  let right_pos = {x: getWindowWidth()-initOptions.separation, y: 0 + dispRightTree};
  //recreate bundles with the extra or removed lines
  update_lines(node,isRight);
  createBundles(left_pos,right_pos,initOptions.bundle_radius);
  
}


function synchronizedSetState(node,isRight,state){
  if(node.collapsed){
        node.equivalent.forEach(
          (eqNode)=>{ 
            scaleToggleNode(eqNode,!isRight);
            setNode(eqNode,!isRight,state);
          }
        )
      }else{
        node.equivalent.forEach(
          (eqNode)=>{ 
            //for synchronization change only if they are the same
            if(node.collapsed == eqNode.collapsed)
            setNode(eqNode,!isRight,state);}
        )
      }
      toggleNode(node,isRight);
}


function toggleSelection(){
  let isRight = checkRight(isRight);
  let newState = focusNode.collapsed;
  synchronizedSetState(focusNode,isRight,newState)
  proccesByLevel(focusNode, (node) => {synchronizedSetState(node,isRight,newState)})

}

//requires that node position has been given at least onece
//could acend and ask question to root to remove this limitation
function checkRight(node){
  return node.x > getWindowWidth() / 2

}

async function resetTrees(){

  toggleNode(treeTax,false)
  toggleNode(treeTax2,false)

  //reset tree 1 from draw system
  proccesByLevel(tree,resetSort);
  proccesByLevel(tree2,resetSort);

  //when moving nodes this should be done
  forceRenderUpdate(initOptions);

}
