edgeLengthAddition = 0;

class D3ForceGraph {
  constructor(width, height) {
    let t = this;

    t.width = width;
    t.height = height;
    t.center = {x: t.width / 2, y: t.height / 2};

    t.updateRefCount = 0;
  }

  init() {
    let t = this;

    t.graphData = { "nodes": [], "links": [] };

    let simulation = t.initSimulation();
    t.simulation = simulation;

    // update();
    t.update(t, simulation);
  }

  initSimulation() {
    let t = this;

    let result = d3.forceSimulation()
      .velocityDecay(0.55)
      .force("link", d3.forceLink()
                       //.distance(100)
                       //.distance(0)
                       //.distance(function(d) {if(d.index>=parseInt(my_edges.length/2)){return 50;}else{return 100;}})
                       .distance(function(d) {return edge_distance[d.index];})
                       //.distance(function(d) {return edge_distance[d.index]+edgeLengthAddition;})
                       //.distance(function(d) {return edge_distance[d.index]+100;})
                       .id(d => d.id))
      //.force("charge", d3.forceManyBody().strength(-100).distanceMin(10000))
      .force("charge", d3.forceManyBody().strength(-10).distanceMin(10000))  //use this one
      //.force("charge", d3.forceManyBody().strength(-10).distanceMin(500))
      //.force("charge", d3.forceManyBody().strength(-50))
      //.force("collide", d3.forceCollide(25))
      //.force("collide", d3.forceCollide(50))
      .force("collide", d3.forceCollide(100)) //use this one
      //.force("collide", d3.forceCollide(d=>collide_arr[d.id]))
      //.force("collide", d3.forceCollide(d=>t.determine_collision_force(d)))
      //.force("x", d3.forceX())
      //.force("y", d3.forceY())
      .force("center", d3.forceCenter(t.center.x, t.center.y));

    return result;
  }

  determine_collision_force(d)
  {
    if(typeof myGraph == "undefined")return subdivision_length/2;
    //console.log(d, d.id);
    let neighbors = myGraph.AdjList.get(d.id);
    if(typeof neighbors == "undefined")return subdivision_length/2;
    //if(typeof neighbors == "undefined"){graph.simulation.stop();stopAddingEdges();}
    //console.log("neighbors", neighbors);
    //if(neighbors.length>2)return subdivision_length/2;
    let curr_x = graph.graphData.nodes[d.id].x;
    let curr_y = graph.graphData.nodes[d.id].y;
    let max_dis = 0;
    let min_dis = 10000000;
    for(let i=0;i<neighbors.length;i++)
    {
      let n_x = graph.graphData.nodes[neighbors[i]].x;
      let n_y = graph.graphData.nodes[neighbors[i]].y;
      let d_x = n_x - curr_x;
      let d_y = n_y - curr_y;
      let curr_dis = Math.sqrt(d_x*d_x + d_y*d_y);
      if(max_dis<curr_dis)max_dis = curr_dis;
      if(min_dis>curr_dis)min_dis = curr_dis;
    }
    //return max_dis/2;
    if(neighbors.length<=2){
      if(min_dis==10000000)return subdivision_length/2;
      return min_dis/2;
    }
    else return max_dis/2;
    //else return min_dis/2;
  }

  getRadius(d) {
    return this.determine_collision_force(d);
  }
  getRadiusOld(d) {
    const min = 5;
    const max = 50;
    let r = Math.trunc(500 / (d.id || 1));
    if (r < min) r = min;
    if (r > max) r = max;

    return r;
  }

  handleDragStarted(d, simulation) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
  }

  update(t, simulation){
    let nodes = t.graphData.nodes;
    let links = t.graphData.links;

    // nodes
    let graphNodesData = null;
    let graphNodesEnter = null;
    let graphNodesExit = null;
    let graphNodeCircles = null;
    let graphNodeLabels = null;
    // links
    let graphLinksData = null;
    let graphLinksEnter = null;
    let graphLinksExit = null;

    simulation
      .nodes(nodes)
      .on("end", () => t.handleEnd());

    simulation.on("tick", handleTicked);

    simulation
      .force("link")
      .links(links);

    function handleTicked() {
      //console.log("Number of crossings:", linkCrossingsParam(graph.graphData.links).length);
      if(safeMode)
      {
        if(!locked){
          if(safeModeIter==500){
            stopForceDirected();
            graph.simulation.stop();
            let coordinates = JSON.stringify({crd_x:crd_x, crd_y:crd_y});
            fs.writeFileSync('DELG_coordinates.json', coordinates);
            return;
          }
          locked = true;
          console.log("Safe mode iteration:", safeModeIter);
          safeModeIter = safeModeIter + 1;

          /*let links = graph.graphData.links;
          var quadtree = d3.quadtree()
            .x(function (d) { return crd_x[d.id]; })
            .y(function (d) { return crd_y[d.id]; });
          var data = [links[0].source];
          for(var i=0;i<links.length;i++)
            data.push(links[i].target);
          quadtree.addAll(data);
          let max_edge_len = 0;
          for(var i = 0;i<links.length;i++)
          {
            //let dis = Math.sqrt((links[i].source.x-links[i].target.x)*(links[i].source.x-links[i].target.x) + (links[i].source.y-links[i].target.y)*(links[i].source.y-links[i].target.y));
            let dis = Math.sqrt((crd_x[links[i].source.id]-crd_x[links[i].target.id])*(crd_x[links[i].source.id]-crd_x[links[i].target.id]) + (crd_y[links[i].source.id]-crd_y[links[i].target.id])*(crd_y[links[i].source.id]-crd_y[links[i].target.id]));
            if(max_edge_len<dis)max_edge_len=dis;
          }*/

          let crd_x_t = {};
          let crd_y_t = {};
          for(var i=0;i<=my_edges.length;i++)
          {
            crd_x_t[i] = graph.graphData.nodes[i].x;
            crd_y_t[i] = graph.graphData.nodes[i].y;
            //graph.graphData.nodes[i].x = crd_x[i];
            //graph.graphData.nodes[i].y = crd_y[i];
          }
          for(var i=0;i<=my_edges.length;i++)
          {
            //graph.graphData.nodes[i].x = crd_x_t[i];
            //graph.graphData.nodes[i].y = crd_y_t[i];
            let prev_x = crd_x[i];
            let prev_y = crd_y[i];
            crd_x[i] = crd_x_t[i];
            crd_y[i] = crd_y_t[i];

            /*quadtree = quadtree.remove(graph.graphData.nodes[i]);
            quadtree = quadtree.add(graph.graphData.nodes[i]);
            let edge_will_get_too_large = false;
            for(let j=0;j<node_to_links[i].length;j++)
            {
              //let dis = Math.sqrt((links[j].source.x-links[j].target.x)*(links[j].source.x-links[j].target.x) + (links[j].source.y-links[j].target.y)*(links[j].source.y-links[j].target.y));
              let cur_link = node_to_links[i][j];
              let dis = Math.sqrt((crd_x[cur_link.source.id]-crd_x[cur_link.target.id])*(crd_x[cur_link.source.id]-crd_x[cur_link.target.id]) + (crd_y[cur_link.source.id]-crd_y[cur_link.target.id])*(crd_y[cur_link.source.id]-crd_y[cur_link.target.id]));
              //if(dis>600)
              //{
              //  edge_will_get_too_large = true;
              //  break;
              //}
              if(max_edge_len<dis)max_edge_len=dis; 
            }
            if(edge_will_get_too_large)
            {
              crd_x[i] = prev_x;
              crd_y[i] = prev_y;
              quadtree = quadtree.remove(graph.graphData.nodes[i]);
              quadtree = quadtree.add(graph.graphData.nodes[i]);
            }
            if(!edge_will_get_too_large)*/
            {
              let introducesCrossing = false;
              for(let j=0;j<node_to_links[i].length;j++)
              {
                let link = node_to_links[i][j];
                /*if(linkCrossingsParamQuadTree (link, crd_x, crd_y, node_to_links, quadtree, max_edge_len+10)!=hasLinkCrossingsWithInputLink(link, crd_x, crd_y))
                {
                  console.log("quadtree error", link);
                  
          for(var l=0;l<=my_edges.length;l++)
          {
            graph.graphData.nodes[l].x = crd_x[l];
            graph.graphData.nodes[l].y = crd_y[l];
          }
          graphLinksData
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            //.attr("y2", d => d.target.y);
            .attr("y2", d => d.target.y)
            .style("stroke", d => d.stroke)
            .style("stroke-width", d => d["stroke-width"]);
          // Translate the groups
          graphNodesData
              .attr("transform", d => {
                return 'translate(' + [d.x, d.y] + ')';
              });
          if(show_collision_circle){
            graphNodesData
                .selectAll("circle")
                .attr("r", d => t.getRadius(d));
          }
                  locked=true;return;
                }
                if(linkCrossingsParamQuadTree (link, crd_x, crd_y, node_to_links, quadtree, max_edge_len+10))*/
                if(hasLinkCrossingsWithInputLink(link, crd_x, crd_y))
                {
                  introducesCrossing = true;
                  break;
                }
              }
              /*if(introducesCrossing)
              {
                graph.graphData.nodes[i].x = crd_x[i];
                graph.graphData.nodes[i].y = crd_y[i];
              }
              else
              {
                crd_x[i] = crd_x_t[i];
                crd_y[i] = crd_y_t[i];
              }*/
              if(introducesCrossing)
              {
                crd_x[i] = prev_x;
                crd_y[i] = prev_y;

                //quadtree = quadtree.remove(graph.graphData.nodes[i]);
                //quadtree = quadtree.add(graph.graphData.nodes[i]);

              }
            }
          }
          //console.log("Number of crossings:", linkCrossingsWithCrds (crd_x, crd_y).length);
          if(safeModeIter%100==0)
          {
            let crd_x_log = {};
            let crd_y_log = {};
            for(var i=0;i<=my_edges.length;i++)
            { 
              crd_x_log[i] = crd_x[i];
              crd_y_log[i] = crd_y[i];
            }
            console.log(crd_x_log, crd_y_log);
          }
          for(var i=0;i<=my_edges.length;i++)
          {
            graph.graphData.nodes[i].x = crd_x[i];
            graph.graphData.nodes[i].y = crd_y[i];
          }
          locked = false;
        }
      }
    }
  }

  add(nodesToAdd, linksToAdd) {
    let t = this;

    if (nodesToAdd) {
      nodesToAdd.forEach(n => t.graphData.nodes.push(n));
    }
    if (linksToAdd) {
      linksToAdd.forEach(l => t.graphData.links.push(l));
    }

    // update();
    t.update(t, t.simulation)
    t.simulation.restart();
    t.simulation.alpha(1);
  }

  remove(dToRemove) {
    console.log(`dToRemove: ${JSON.stringify(dToRemove)}`)

    let t = this;

    let currentNodes = t.graphData.nodes;
    let currentLinks = t.graphData.links;
    let nIndex = currentNodes.indexOf(dToRemove);
    if (nIndex > -1) {
      currentNodes.splice(nIndex, 1);
    }

    let toRemoveLinks = currentLinks.filter(l => {
      return l.source.id === dToRemove.id || l.target.id === dToRemove.id;
    });
    toRemoveLinks.forEach(l => {
      let lIndex = currentLinks.indexOf(l);
      currentLinks.splice(lIndex, 1);
    })

    t.update(t, t.simulation)
    t.simulation.restart();
    t.simulation.alpha(1);
  }

  handleNodeClicked(d) {
    console.log(`node clicked: ${JSON.stringify(d)}`);

    let t = this;

    let newId = Math.trunc(Math.random() * 1000);
    let newNode = {"id": newId, "name": "server 22", x: d.x, y: d.y};
    let newNodes = [newNode];
    let newLinks = [{source: d.id, target: newNode.id}]

    t.add(newNodes, newLinks);
  }

  handleEnd() {
    //this.simulation.force('x', d3.forceX(0));
    //this.simulation.force('y', d3.forceY(0));
    console.log("end");
    //initialize();
  }
}

let graph = new D3ForceGraph(500, 500);
graph.init();

function subdivide_edges(subdivision_length, subdivision_factor)
{
  var new_edges = [];
  var new_distance = [];
  var counter = 0;
  var new_label_to_id = {};
  new_label_to_id[my_edges[0][0]] = counter;
  var new_id_to_label = {};
  new_id_to_label[counter] = my_edges[0][0];
  counter = counter + 1;
  collide_arr = [];
  var n = my_edges.length + 1;
  for(var i=0;i<n;i++)
    collide_arr.push(subdivision_factor*subdivision_length/2);
  for(var i=0;i<my_edges.length;i++)
  {
    var dis = edge_distance[i]+edgeLengthAddition;
    var n_sub = dis/subdivision_length-1;
    var prev_ver = n+"";
    //label_to_id[prev_ver] = n;
    //id_to_label[n] = prev_ver;
    new_label_to_id[prev_ver] = counter;
    new_id_to_label[counter] = prev_ver;
    counter = counter + 1;
    new_edges.push([my_edges[i][0], prev_ver]);
    new_distance.push(subdivision_length);
    collide_arr.push(subdivision_factor*subdivision_length/2);
    n = n+1;
    for(var j=0;j<n_sub-1;j++)
    {
      var cur_ver = n+"";
      //label_to_id[cur_ver] = n;
      //id_to_label[n] = cur_ver;
      new_label_to_id[cur_ver] = counter;
      new_id_to_label[counter] = cur_ver;
      counter = counter + 1;
      new_edges.push([prev_ver, cur_ver]);
      new_distance.push(subdivision_length);
      collide_arr.push(subdivision_factor*subdivision_length/2);
      prev_ver = cur_ver;
      n = n+1;
    }
    new_label_to_id[my_edges[i][1]] = counter;
    new_id_to_label[counter] = my_edges[i][1];
    counter = counter + 1;
    new_edges.push([prev_ver, my_edges[i][1]]);
    new_distance.push(subdivision_length);
  }
  my_edges = new_edges;
  edge_distance = new_distance;
  label_to_id = new_label_to_id;
  id_to_label = new_id_to_label;
}
subdivision_length = 50;
//subdivision_length = 100;
//subdivision_factor = 1.0;
subdivision_factor = 1.5;
//subdivide_edges(subdivision_length, subdivision_factor);

// Queue class 
class Queue 
{ 
	// Array is used to implement a Queue 
	constructor() 
	{ 
		this.items = []; 
	} 
				
	// Functions to be implemented 
	// enqueue(item) 
// enqueue function 
enqueue(element) 
{	 
	// adding element to the queue 
	this.items.push(element); 
} 

	// dequeue() 
// dequeue function 
dequeue() 
{ 
	// removing element from the queue 
	// returns underflow when called 
	// on empty queue 
	if(this.isEmpty()) 
		return "Underflow"; 
	return this.items.shift(); 
} 

	// front() 
// front function 
front() 
{ 
	// returns the Front element of 
	// the queue without removing it. 
	if(this.isEmpty()) 
		return "No elements in Queue"; 
	return this.items[0]; 
} 

	// isEmpty() 
// isEmpty function 
isEmpty() 
{ 
	// return true if the queue is empty. 
	return this.items.length == 0; 
} 

	// printQueue() 
// printQueue function 
printQueue() 
{ 
	var str = ""; 
	for(var i = 0; i < this.items.length; i++) 
		str += this.items[i] +" "; 
	return str; 
} 

}

class MyGraph {
    constructor(noOfVertices) 
    { 
        this.noOfVertices = noOfVertices; 
        this.AdjList = new Map(); 
    }

    // add vertex to the graph 
    addVertex(v) 
    { 
	// initialize the adjacent list with a 
	// null array 
	this.AdjList.set(v, []); 
    } 

    // add edge to the graph 
    addEdge(v, w) 
    {
	// get the list for vertex v and put the 
	// vertex w denoting edge between v and w 
	/*if(typeof this.AdjList.get(v)=='undefined')this.AdjList.set(v, [w]);
        else this.AdjList.get(v).push(w);*/
        //if(typeof this.AdjList.get(v)=='undefined'){graph.simulation.stop();stopAddingEdges();stopRemovingSmallCompMultipleSafe();return;}
        this.AdjList.get(v).push(w); 

	// Since graph is undirected, 
	// add an edge from w to v also 
	/*if(typeof this.AdjList.get(w)=='undefined')this.AdjList.set(w, [v]);
	else this.AdjList.get(w).push(v);*/
        //if(typeof this.AdjList.get(w)=='undefined'){graph.simulation.stop();stopAddingEdges();stopRemovingSmallCompMultipleSafe();return;}
	this.AdjList.get(w).push(v);

    }

    // remove edge from the graph 
    removeEdge(v, w) 
    { 
        var arr = this.AdjList.get(v);
        if(typeof arr == 'undefined')
        {
          graph.simulation.stop();
          return;
        }
        for( var i = 0; i < arr.length; i++){ if ( arr[i] === w) { arr.splice(i, 1); }}
        arr = this.AdjList.get(w);
        if(typeof arr == 'undefined')
        {
          graph.simulation.stop();
          return;
        }
        for( var i = 0; i < arr.length; i++){ if ( arr[i] === v) { arr.splice(i, 1); }}
    }

    // Prints the vertex and adjacency list 
    printGraph() 
    { 
	// get all the vertices 
	var get_keys = this.AdjList.keys(); 

	// iterate over the vertices 
	for (var i of get_keys) 
        { 
		// great the corresponding adjacency list 
		// for the vertex 
		var get_values = this.AdjList.get(i); 
		var conc = ""; 

		// iterate over the adjacency list 
		// concatenate the values into a string 
		for (var j of get_values) 
			conc += j + " "; 

		// print the vertex and its adjacency list 
		console.log(i + " -> " + conc); 
	} 
    }

    // function to performs BFS 
    bfs(startingNode) 
    { 
        var bfsTraversal = [];

	// create a visited array 
	var visited = []; 
	for (var i = 0; i < this.noOfVertices; i++) 
		visited[i] = false; 

	// Create an object for queue 
	var q = new Queue(); 

	// add the starting node to the queue 
	visited[startingNode] = true; 
	q.enqueue(startingNode); 

	// loop until queue is element 
	while (!q.isEmpty()) { 
		// get the element from the queue 
		var getQueueElement = q.dequeue(); 

		// passing the current vertex to callback funtion 
		//console.log(getQueueElement); 
                bfsTraversal.push(getQueueElement);

		// get the adjacent list for current vertex 
		var get_List = this.AdjList.get(getQueueElement); 

		// loop through the list and add the element to the 
		// queue if it is not processed yet 
		for (var i in get_List) { 
			var neigh = get_List[i]; 

			if (!visited[neigh]) { 
				visited[neigh] = true; 
				q.enqueue(neigh); 
			} 
		} 
	} 
        return bfsTraversal;
    }
    bfs_depth(startingNode)
    {   
        var bfsTraversal = [];
        
        // create a visited array
        var visited = []; 
        for (var i = 0; i < this.noOfVertices; i++)
                visited[i] = false;
        
        // Create an object for queue
        var q = new Queue();
        
        // add the starting node to the queue
        visited[startingNode] = true;
        q.enqueue([startingNode,0]);
        
        // loop until queue is element
        while (!q.isEmpty()) { 
                // get the element from the queue 
                var nodeDepth = q.dequeue();
                var getQueueElement = nodeDepth[0];
                
                // passing the current vertex to callback funtion
                //console.log(getQueueElement); 
                bfsTraversal.push(nodeDepth);
                
                // get the adjacent list for current vertex 
                var get_List = this.AdjList.get(getQueueElement);
                
                // loop through the list and add the element to the
                // queue if it is not processed yet
                for (var i in get_List) { 
                        var neigh = get_List[i];
                        
                        if (!visited[neigh]) { 
                                visited[neigh] = true;
                                q.enqueue([neigh, nodeDepth[0]+1]);
                        }
                }
        } 
        return bfsTraversal;
    }
}

var time_when_last_edge_added = 0;
var time_for_inserting_edge = [];

function myInit() {
  t0 = new Date().getTime();
  time_when_last_edge_added = t0;
  //let nodes = [ {"id": 0, "name": "machine lear"} ];
  let nodes = [ {"id": 0, "name": my_edges[0][0], "x": crd_x[0], "y": crd_y[0]} ];
  let links = [];
  graph.add(nodes, links);
  graph.graphData.nodes[0].fx = graph.graphData.nodes[0].x;
  graph.graphData.nodes[0].fy = graph.graphData.nodes[0].y;
  myGraph = new MyGraph(id_to_label.length);
  myGraph.addVertex(0);
}

addEdgePhase = true;
my_count = 0;
crossing_step_cnt=0;
crossing_step_speed=20;
//crossing_step_type="circular";
crossing_step_type="straight";
//intervalTime = 500;
//intervalTime = 100;
//intervalTime = 50; //***
//intervalTime = 20;
//intervalTime = 10;
intervalTime = 5;
//steps_before_fix_position = 1;
//steps_before_fix_position = 50;
steps_before_fix_position = 50000;
/*function initializeAddingEdge()
{
    let existingNode = graph.graphData.nodes[label_to_id[my_edges[my_count][0]]];
    let newId = label_to_id[my_edges[my_count][1]];
}
function increaseEdgeLength()
{
}*/
function farthest_location(cntr_vertex){
    var edg_dis = edge_distance[my_count];
    var new_x = cntr_vertex.x + edg_dis;
    var new_y = cntr_vertex.y;
    var max_min_distance = 0;
    var max_min_x = 0;
    var max_min_y = 0;
    var rotation_dir = 1;
    let number_of_angles = 100;
    var theta=Math.atan((new_y-cntr_vertex.y)/(new_x-cntr_vertex.x));
    for(var i=0;i<number_of_angles;i++)
    {
      let tx = new_x-cntr_vertex.x;
      let ty = new_y-cntr_vertex.y;
      //console.log("tx, ty", tx, ty);
      let rx = tx*Math.cos(theta)-ty*Math.sin(theta);
      let ry = tx*Math.sin(theta)+ty*Math.cos(theta);
      tx = rx+cntr_vertex.x;
      ty = ry+cntr_vertex.y;
      //console.log("tx, ty", tx, ty);
      let min_dis = 10000000000000;
      for(var j=0;j<graph.graphData.nodes.length;j++)
      {
        let dx = graph.graphData.nodes[j].x - tx;
        let dy = graph.graphData.nodes[j].y - ty;
        let node_dis = Math.sqrt(dx*dx + dy*dy);
        if(min_dis>node_dis)min_dis = node_dis;
      }
      if(max_min_distance<min_dis)
      {
        max_min_distance=min_dis;
        max_min_x = tx;
        max_min_y = ty;
      }

      theta=theta+(rotation_dir)*(Math.PI/number_of_angles);
    }
    return [max_min_x, max_min_y];
}
function anti_clockwise_location(cntr_vertex){
    var edg_dis = edge_distance[my_count];
    var new_x = cntr_vertex.x;
    var new_y = cntr_vertex.y + edg_dis;
    var rotation_dir = 1;
    let number_of_angles = 100;
    var theta = 0;
    for(var i=0;i<number_of_angles;i++)
    {
      let tx = new_x-cntr_vertex.x;
      let ty = new_y-cntr_vertex.y;
      let rx = tx*Math.cos(theta)-ty*Math.sin(theta);
      let ry = tx*Math.sin(theta)+ty*Math.cos(theta);
      tx = rx+cntr_vertex.x;
      ty = ry+cntr_vertex.y;
      let inputLink = {index:my_count, source:cntr_vertex, target:{x:tx, y:ty}};
      var crossings = linkCrossingsWithInputLink(inputLink);
      //console.log(crossings);
      if(crossings.length==0)return [tx, ty];
      theta=theta+(rotation_dir)*(Math.PI/number_of_angles);
    }
    //console.log("Haven't found any crossing free position");
    return [new_x, new_y];
}
edge_distance_org = Object.assign({}, edge_distance);
function startAddingEdges() {
    //if(my_count>=my_edges.length) return;
    /*if(my_count>=my_edges.length){
      stopAddingEdges();
      return; 
    }*/
    //document.getElementById("number_of_crossings").value = linkCrossingsParam(graph.graphData.links).length;
    /*if(linkCrossingsParam(graph.graphData.links).length>0)
    //if(linkCrossingsParam(graph.graphData.links).length>=20)
    //if(linkCrossingsParam(graph.graphData.links).length>=200)
    //if(!addEdgePhase)
    {
      stopAddingEdges();
      crossing_step_cnt=0;
      //removeSmallCompIntervalMultipleSafe = setInterval(removeSmallCompAutoMultipleSafe, intervalTime);
      remove_existing_crossings();
      addEdgeInterval = setInterval(startAddingEdges, intervalTime);
      return; 
    }
    else if(my_count>=my_edges.length){*/
    if(my_count>=my_edges.length){
      stopAddingEdges();
      var t1 = new Date().getTime();
      //remove_existing_crossings();
      console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
      //console.log("Ideal edge length preservation:", ideal_edge_length_preservation(graph.graphData.links, edge_distance));
      console.log("Ideal edge length preservation:", ideal_edge_length_preservation(graph.graphData.links, edge_distance_org));
      //area_coverage(graph.graphData.nodes);
      console.log("Number of crossings:", linkCrossingsParam(graph.graphData.links).length);
      //console.log("Distribution:", ideal_edge_length_distribution());
      //console.log("time_for_inserting_edge", time_for_inserting_edge);
      //console.log(graph.graphData.nodes);
      //console.log(crd_x, crd_y);
      initForceDirected();
      return;
    }
    if(my_count>=steps_before_fix_position)
    {
      let prev_node_id = my_count-steps_before_fix_position;
      graph.graphData.nodes[prev_node_id].fx = graph.graphData.nodes[prev_node_id].x;
      graph.graphData.nodes[prev_node_id].fy = graph.graphData.nodes[prev_node_id].y;
    }
    //let randomIndex = Math.trunc(Math.random() * graph.graphData.nodes.length);
    //let randomNode = graph.graphData.nodes[randomIndex];
    let existingNode = graph.graphData.nodes[label_to_id[my_edges[my_count][0]]];
    //let randomId = Math.trunc(Math.random() * 100000);
    let newId = label_to_id[my_edges[my_count][1]];
    //let newNode = {"id": randomId, "name": "server " + randomId};
    let newNode = {"id": newId, "name": my_edges[my_count][1]};
    /*//if(nodes_to_levels[my_edges[my_count][1]]>2)
    //if(my_count>3500)
    //if(my_count>2500)
    //if(my_count>1600)
    //if(my_count>800)
    //if(my_count>400)
    //if(my_count>200)
    if(my_count>100)
    {
      //newNode.name = "";
      stopAddingEdges();
    }*/
    /*if (existingNode.x) {
      //newNode.x = existingNode.x;
      //newNode.y = existingNode.y;
      let new_crd = farthest_location(existingNode);
      //let new_crd = anti_clockwise_location(existingNode);
      newNode.x = new_crd[0];
      newNode.y = new_crd[1];
    }*/
    newNode.x = crd_x[newId];
    newNode.y = crd_y[newId];
    let newLink = {source: existingNode.id, target: newId};
    graph.add([newNode], [newLink]);
    graph.graphData.nodes[newId].fx = graph.graphData.nodes[newId].x;
    graph.graphData.nodes[newId].fy = graph.graphData.nodes[newId].y;
    myGraph.addVertex(newId);
    myGraph.addEdge(existingNode.id, newId);
    let cur_time = new Date().getTime();
    time_for_inserting_edge.push(cur_time-time_when_last_edge_added);
    time_when_last_edge_added = cur_time;
    /*if(time_for_inserting_edge.length==100)
    {
      console.log("time_for_inserting_edge", time_for_inserting_edge);
      time_for_inserting_edge = [];
    }*/
    my_count++;
    graph.simulation.alpha(1).restart();
}
function initForceDirected()
{
  for(var i=0;i<=my_edges.length;i++)
  {
    //if(randomNumber(0,100)<=5)
    //{
      graph.graphData.nodes[i].fx = null;
      graph.graphData.nodes[i].fy = null;
    //}
  }
  //if(my_edges.length>2000)
  {
    safeMode = true;
    node_to_links = {};
    for(var i=0;i<=my_edges.length;i++)
    {
      node_to_links[i] = [];
    }
    for(var i=0;i<graph.graphData.links.length;i++)
    {
      node_to_links[graph.graphData.links[i].source.id].push(graph.graphData.links[i]);
      node_to_links[graph.graphData.links[i].target.id].push(graph.graphData.links[i]);
    }

    /*let links = graph.graphData.links;
    var data = [links[0].source];
    for(var i=0;i<links.length;i++)
      data.push(links[i].target);
    quadtree.addAll(data);
    for(var i = 0;i<links.length;i++)
    {
      let dis = Math.sqrt((crd_x[links[i].source.id]-crd_x[links[i].target.id])*(crd_x[links[i].source.id]-crd_x[links[i].target.id]) + (crd_y[links[i].source.id]-crd_y[links[i].target.id])*(crd_y[links[i].source.id]-crd_y[links[i].target.id]));
      if(max_edge_len<dis)max_edge_len=dis;
    }*/

  }
  intervalTime = 500;
  startForceDirectedInterval = setInterval(startForceDirected, intervalTime);
}

function startForceDirected()
{
  graph.simulation.alpha(1).restart();
}

function getTreeOfParticularLevel(l)
{
  let new_my_edges = [];
  let new_edge_count = 0;
  let new_edge_distance = {};
  let new_label_to_id = {};
  let new_id_to_label = {};
  let new_crd_x = {};
  let new_crd_y = {};
  new_label_to_id[my_edges[0][0]] = 0;
  new_id_to_label[0] = my_edges[0][0];
  new_crd_x[0] = crd_x[0];
  new_crd_y[0] = crd_y[0];
  for(var i=0;i<my_edges.length;i++)
  {
    /*if(nodes_to_levels[my_edges[i][0]]>nodes_to_levels[my_edges[i][1]])
    {
      console.log(my_edges[i][0], "has higher level than", my_edges[i][1]);
      return;
    }*/
    let new_label = my_edges[i][1];
    //if(nodes_to_levels[new_label]<=l)
    //if(i<=3500)
    //if(i<=2500)
    //if(i<=1600)
    //if(i<=800)
    //if(i<=400)
    //if(i<=200)
    //if(i<=100)
    //if(nodes_to_files[new_label]=='Graph_25.txt')
    //if(nodes_to_files[new_label]=='Graph_100.txt')
    //if(nodes_to_files[new_label]=='Graph_200.txt')
    //if(nodes_to_files[new_label]=='Graph_400.txt')
    //if(nodes_to_files[new_label]=='Graph_800.txt')
    //if(nodes_to_files[new_label]=='Graph_1600.txt')
    //if(nodes_to_files[new_label]=='Graph_2500.txt')
    //if(nodes_to_files[new_label]=='Graph_3500.txt')
    //if(nodes_to_files[new_label]=='Graph_1.txt')
    if(nodes_to_files[new_label]=='Graph_1_25.txt')
    //if(nodes_to_files[new_label]=='Graph_2.txt')
    //if(nodes_to_files[new_label]=='Graph_3.txt')
    //if(nodes_to_files[new_label]=='Graph_4.txt')
    //if(nodes_to_files[new_label]=='Graph_5.txt')
    //if(nodes_to_files[new_label]=='Graph_6.txt')
    //if(nodes_to_files[new_label]=='Graph_7.txt')
    {
      //if(nodes_to_levels[my_edges[i][0]]>l)console.log(my_edges[i]);
      //if((my_edges[i][0]=="applied microe03")&&(my_edges[i][1]=="labor economics"))console.log(i);
      new_my_edges.push([my_edges[i][0], my_edges[i][1]]);
      new_edge_distance[new_edge_count] = edge_distance[i];
      new_edge_count = new_edge_count + 1;
      new_label_to_id[new_label] = new_edge_count;
      new_id_to_label[new_edge_count] = new_label;
      new_crd_x[new_edge_count] = crd_x[label_to_id[new_label]];
      new_crd_y[new_edge_count] = crd_y[label_to_id[new_label]];
    }
  }
  my_edges = new_my_edges;
  edge_distance = new_edge_distance;
  label_to_id = new_label_to_id;
  id_to_label = new_id_to_label;
  crd_x = new_crd_x;
  crd_y = new_crd_y;
}

var startForceDirectedInterval = setInterval(startForceDirected, intervalTime);

//getTreeOfParticularLevel(7);
eps_movement = 2;
//eps_movement = 20;
//eps_movement = 50;
safeMode = false;
safeModeIter = 1;
locked = false;
/*quadtree = d3.quadtree()
  .x(function (d) { return crd_x[d.id]; })
  .y(function (d) { return crd_y[d.id]; });
max_edge_len = 0;*/
if(my_edges.length<=2000)
{
  eps_movement = -1;
}
function stopForceDirected() {
  console.log("inside stopForceDirected");
  clearInterval(startForceDirectedInterval);
  if(safeMode){
    locked = true;
    for(var i=0;i<=my_edges.length;i++)
    {
      graph.graphData.nodes[i].fx = crd_x[i];
      graph.graphData.nodes[i].fy = crd_y[i];
    }
  }
  if(safeMode==false)
  {
    if(eps_movement!=-1){
      for(var i=0;i<=my_edges.length;i++)
      {
        let x_diff = graph.graphData.nodes[i].x - crd_x[i];
        let y_diff = graph.graphData.nodes[i].y - crd_y[i];
        let node_movement = Math.sqrt(x_diff*x_diff + y_diff*y_diff);
        if(node_movement>eps_movement)
        {
          let eps_fact = eps_movement/node_movement;
          graph.graphData.nodes[i].fx = crd_x[i] + x_diff*eps_fact;
          graph.graphData.nodes[i].fy = crd_y[i] + y_diff*eps_fact;
        }
      }
    }
    else
    {
      for(var i=0;i<=my_edges.length;i++)
      {
        graph.graphData.nodes[i].fx = graph.graphData.nodes[i].x;
        graph.graphData.nodes[i].fy = graph.graphData.nodes[i].y;
      }
    }
    remove_existing_crossings();
  }
  /*for(var i=0;i<=my_edges.length;i++)
  {
    graph.graphData.nodes[i].fx = graph.graphData.nodes[i].x;
    graph.graphData.nodes[i].fy = graph.graphData.nodes[i].y;
  }*/
  var t1 = new Date().getTime();
  //remove_existing_crossings();
  console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
  //console.log("Ideal edge length preservation:", ideal_edge_length_preservation(graph.graphData.links, edge_distance));
  console.log("Ideal edge length preservation:", ideal_edge_length_preservation(graph.graphData.links, edge_distance_org));
  //area_coverage(graph.graphData.nodes);
  let n_crossings = linkCrossingsParam(graph.graphData.links).length;
  console.log("Number of crossings:", n_crossings);
  if(safeMode==false)
  {
    if(n_crossings==0)
    {
      for(var i=0;i<=my_edges.length;i++)
      {
        crd_x[i] = graph.graphData.nodes[i].x;
        crd_y[i] = graph.graphData.nodes[i].y;
      }
    }
  }
}

function ideal_edge_length_distribution()
{
    let arr = [];
    let links = graph.graphData.links;
    let m = links.length;
    for (let i = 0; i < m; ++i) {
      let x1 = links[i].source.x;
      let y1 = links[i].source.y;
      let x2 = links[i].target.x;
      let y2 = links[i].target.y;
      let drawing_dis = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
      let graph_dis = edge_distance[links[i].index]+edgeLengthAddition;
      arr.push(drawing_dis/graph_dis-1);
    }
    /*console.log("[");
    for(let i=0;i<arr.length;i++)
    {
      console.log(arr[i], ",");
    }
    console.log(arr[arr.length-1]);
    console.log("]");*/
    return arr;
}

var addEdgeInterval = setInterval(startAddingEdges, intervalTime);

var crossingForceInterval = null;
var removeSmallCompIntervalMultipleSafe = null;


function stopAddingEdges() {
  clearInterval(addEdgeInterval);
}

function myMove(){
   //graph.simulation.force('x', d3.forceX([1000])); 
   graph.simulation.force('x', d3.forceX().x(function(d) {
    //console.log(d);
    if(d.id>0){
      //console.log(d);
      if(d.x>graph.graphData.nodes[0].x){
        return d.x+10;
      }
      else{
        return d.x-10;
      }
    }
    else
      return 0;
   }));
   graph.simulation.force('y', d3.forceY().y(function(d) {
    if(d.id>0){
      if(d.y>graph.graphData.nodes[0].y){
        return d.y+10;
      }
      else{
        return d.y-10;
      }
    }
    else
      return 0;
   })); 
   graph.simulation.alpha(1).restart();
   //console.log("center", graph.graphData.nodes[0].x, graph.graphData.nodes[0].y)
}

function moveUp(){
    var nodeName = document.getElementById("nodeName").value;
    var nodeId = label_to_id[nodeName];
    var moveAmount = parseFloat(document.getElementById("moveAmount").value);
    graph.simulation.force('y', d3.forceY().y(function(d) {
    if(d.id==nodeId){
        return d.y-moveAmount;
    }
    else
    {
        return d.y+moveAmount;
    }
   }));
   graph.simulation.alpha(1).restart();
}

function moveDown(){
    console.log("Down");
    var nodeName = document.getElementById("nodeName").value;
    var nodeId = label_to_id[nodeName];
    var moveAmount = parseFloat(document.getElementById("moveAmount").value);
    graph.simulation.force('y', d3.forceY().y(function(d) {
    if(d.id==nodeId){
        console.log(d);
        return d.y+moveAmount;
    }
    else
    {
        return d.y-moveAmount;
    }
   }));
   graph.simulation.alpha(1).restart();
}

function moveRight(){
    var nodeName = document.getElementById("nodeName").value;
    var nodeId = label_to_id[nodeName];
    var moveAmount = parseFloat(document.getElementById("moveAmount").value);
    graph.simulation.force('x', d3.forceX().x(function(d) {
    if(d.id==nodeId){
        return d.x+moveAmount;
    }
    else
    {
        return d.x-moveAmount;
    }
   }));
   graph.simulation.alpha(1).restart();
}

function moveLeft(){
    console.log("Left");
    var nodeName = document.getElementById("nodeName").value;
    var nodeId = label_to_id[nodeName];
    var moveAmount = parseFloat(document.getElementById("moveAmount").value);
    graph.simulation.force('x', d3.forceX().x(function(d) {
    if(d.id==nodeId){
        console.log(d);
        console.log(d.x-10);
        return d.x-moveAmount;
    }
    else
    {
        return d.x+moveAmount;
    }
   }));
   graph.simulation.alpha(1).restart();
}

function movePar(nodeId, moveAmountUp, moveAmountRight){
    graph.simulation.force('y', d3.forceY().y(function(d) {
    if(d.id==nodeId){
        return d.y-moveAmountUp;
    }
    else
    {
        return d.y+moveAmountUp;
    }
   }));
    graph.simulation.force('x', d3.forceX().x(function(d) {
    if(d.id==nodeId){
        return d.x+moveAmountRight;
    }
    else
    {
        return d.x-moveAmountRight;
    }
   }));
   graph.simulation.alpha(1).restart();
}

function moveParMultiple(nodeId_set, moveAmountUp, moveAmountRight){
    graph.simulation.force('y', d3.forceY().y(function(d) {
    if(nodeId_set.has(d.id)){
        return d.y-moveAmountUp;
    }
    else
    {
        return d.y+moveAmountUp;
    }
   }));
    graph.simulation.force('x', d3.forceX().x(function(d) {
    if(nodeId_set.has(d.id)){
        return d.x+moveAmountRight;
    }
    else
    {
        return d.x-moveAmountRight;
    }
   }));
   graph.simulation.alpha(1).restart();
}

function moveParRun(){
    var nodeName = document.getElementById("nodeName").value;
    var nodeId = label_to_id[nodeName];
    var moveAmountUp = parseFloat(document.getElementById("moveAmountUp").value);
    var moveAmountRight = parseFloat(document.getElementById("moveAmountRight").value);
    movePar(nodeId, moveAmountUp, moveAmountRight);
}

function switchPhase(){
  if(addEdgePhase)addEdgePhase=false;
  else addEdgePhase=true;
}

function removeCrossing()
{
  removeSmallComp(parseInt(document.getElementById("crossingID").value), linkCrossingsParam(graph.graphData.links));
}

font_size = 10;
function zoomLabelsMain(){
  let max_label_reached = false;
  let labelDoms = d3.select('body').selectAll('text')["_groups"][0];
  let data = d3.select('body').selectAll('text').data();
  let count = 0;
  for(var i=0;i<labelDoms.length;i++)
  {
    //if((data[i].name=="pyrolysis")||(data[i].name=="sports medicine")||(data[i].name=="liquid crystals")||(data[i].name=="uncertainty quan"))continue;
    for(var j=i+1;j<labelDoms.length;j++)
    {
      //if((data[j].name=="environmental ph")||(data[j].name=="cavitation")||(data[j].name=="quantum control")||(data[j].name=="muscle physiolog")||(data[j].name=="translational re")||(data[j].name=="history of polit")||(data[j].name=="deafness")||(data[j].name=="behavior")||(data[j].name=="hearing")||(data[j].name=="surface modifica")||(data[j].name=="computer simulat")||(data[j].name=="performance")||(data[j].name=="martensitic tran")||(data[j].name=="performance stud")||(data[j].name=="voting")||(data[j].name=="sedimentary geol")||(data[j].name=="percolation theo")||(data[j].name=="evolutionary dyn")||(data[j].name=="science of scien")||(data[j].name=="question answeri")||(data[j].name=="environmental")||(data[j].name=="statistical rela")||(data[j].name=="field experiment")||(data[j].name=="isotope geochemi")||(data[j].name=="underwater acous"))continue;
      if((!isNaN(data[i].name))||(!isNaN(data[j].name)))continue;
      var rect1 = labelDoms[i].getBoundingClientRect();
      var rect2 = labelDoms[j].getBoundingClientRect();
      max_label_reached = !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom)
      if(max_label_reached)
      {
        if(count==0){
          console.log(labelDoms[i], " overlaps ", labelDoms[j]);
          console.log(rect1, rect2);
        }
        count += 1;
        ////max_label_reached = false;
        //break;
      }
    }
    //if(max_label_reached==true)break;
  }
  font_size += 1;
  d3.select('body').selectAll('text').style("font-size", function(d){if(isNaN(d.name))return font_size+"px"; else return "0px";});
  return count;
  /*if(!max_label_reached)
  {
    font_size += 1;
    d3.select('body').selectAll('text').style("font-size", function(d){if(isNaN(d.name))return font_size+"px"; else return "0px";});
  }
  else
  {
    alert("Can not zoom further!");
    console.log("Area coverage:", areaCoverage(labelDoms));
  }*/
}
function zoomLabels(){
  let count = zoomLabelsMain();
  console.log("count:", count);
}
function postProcessing(){
  let node_to_links = {};
  for(var i=0;i<=my_edges.length;i++)
  {
      node_to_links[i] = [];
  }
  for(var i=0;i<graph.graphData.links.length;i++)
  {
      node_to_links[graph.graphData.links[i].source.id].push(graph.graphData.links[i]);
      node_to_links[graph.graphData.links[i].target.id].push(graph.graphData.links[i]);
  }
  let shift_x_arr = [];
  let shift_y_arr = [];
  for(var i=0;i<graph.graphData.nodes.length;i++)
  {
    shift_x_arr.push(0);
    shift_y_arr.push(0);
  }
  let crd_x_rev = {};
  let crd_y_rev = {};
  for(var l=0;l<=my_edges.length;l++){
    crd_x_rev[l] = graph.graphData.nodes[l].fx;
    crd_y_rev[l] = graph.graphData.nodes[l].fy;
  }
  let max_label_reached = false;
  let labelDoms = d3.select('body').selectAll('text')["_groups"][0];
  let data = d3.select('body').selectAll('text').data();
  let count = 0;
  let count_solved = 0;
  for(var i=0;i<labelDoms.length;i++)
  {
    for(var j=i+1;j<labelDoms.length;j++)
    { 
      if((!isNaN(data[i].name))||(!isNaN(data[j].name)))continue;
      var rect1 = labelDoms[i].getBoundingClientRect();
      var rect2 = labelDoms[j].getBoundingClientRect();
      max_label_reached = !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom)
      if(max_label_reached)
      { 
        /*if(count==0){
          console.log(labelDoms[i], " overlaps ", labelDoms[j]);
          console.log(rect1, rect2);
        }*/
        // The postprocessing step
        let overlapped_labels = [i, j];
        let overlap_crossing_free = false;
        for(let k=0;k<overlapped_labels.length;k++)
        {
          let ind = overlapped_labels[k];
          // continue this for 100 times
          for(let l=0;l<100;l++)
          //for(let l=0;l<1;l++)
          {
            // consider a small square of 300x300
            // random sample a number from -150 to 150, once for x coord, once for y coord
            //let box_size = 301;
            let box_size = 601;
            let shift_x = (Math.random() * box_size) - (box_size/2);
            let shift_y = (Math.random() * box_size) - (box_size/2);
            shift_x_arr[ind] = shift_x;
            shift_y_arr[ind] = shift_y;
            let prev_x = graph.graphData.nodes[ind].fx;
            let prev_y = graph.graphData.nodes[ind].fy;
            graph.graphData.nodes[ind].fx += shift_x;
            graph.graphData.nodes[ind].fy += shift_y;
            crd_x_rev[ind] = graph.graphData.nodes[ind].fx;
            crd_y_rev[ind] = graph.graphData.nodes[ind].fy;
            // check whether it removes overlap without new crossing
            let overlap_free = true;
            for(let m=0;m<labelDoms.length;m++)
            {
              if(m==ind)continue;
              var rect3 = labelDoms[ind].getBoundingClientRect();
              var rect4 = labelDoms[m].getBoundingClientRect();
              let is_overlap = !(rect3.right+shift_x_arr[ind] < rect4.left ||
                rect3.left+shift_x_arr[ind] > rect4.right ||
                rect3.bottom+shift_y_arr[ind] < rect4.top ||
                rect3.top+shift_y_arr[ind] > rect4.bottom);
              if(is_overlap)
              {
                overlap_free = false;
                break;
              }
            }
            if(overlap_free)
            {
              // take all neighbor edges, check whether any of these edges make crossing with any other edge
              let introducesCrossing = false;
              for(let m=0;m<node_to_links[ind].length;m++)
              { 
                let link = node_to_links[ind][m]; 
                if(hasLinkCrossingsWithInputLink(link, crd_x_rev, crd_y_rev))
                { 
                  introducesCrossing = true;
                  break;
                }
              }
              if(overlap_free && (!introducesCrossing))
              //if(overlap_free)
              {
                overlap_crossing_free = true;
                console.log("Found an overlap and crossing free coordinate for", overlapped_labels);
                count_solved += 1;
              }
            }
            if(overlap_crossing_free)break;
            else
            {
              graph.graphData.nodes[ind].fx = prev_x;
              graph.graphData.nodes[ind].fy = prev_y;
              shift_x_arr[ind] = 0;
              shift_y_arr[ind] = 0;
              crd_x_rev[ind] = prev_x;
              crd_y_rev[ind] = prev_y;
            }
          }
          if(overlap_crossing_free)break;
          else
          {
            console.log("Could not found an overlap and crossing free coordinate for", overlapped_labels);
          }
        }
        count += 1;
        ////max_label_reached = false;
        //break;
      }
    }
    //if(max_label_reached==true)break;
  }
  console.log("Post-processing- overlaps:", count, " removed:", count_solved);
}
function best_rotation()
{
  let number_of_rotations = 360/15;
  let angles = [];
  for(let i=0;i<number_of_rotations;i++)
  {
    angles.push(i*15);
  }
  let crd_x_rev = {};
  let crd_y_rev = {};
  for(var l=0;l<=my_edges.length;l++){
    crd_x_rev[l] = graph.graphData.nodes[l].fx;
    crd_y_rev[l] = graph.graphData.nodes[l].fy;
  }
  let max_area_cov = -1;
  let best_theta = -1;
  let cntr_x = crd_x_rev[0];
  let cntr_y = crd_y_rev[0];
  for(let i=0;i<number_of_rotations;i++)
  {
    let theta = angles[i];
    theta = theta*(2*Math.PI/360);
    for(var l=0;l<=my_edges.length;l++){
      let x = crd_x_rev[l];
      let y = crd_y_rev[l];
      x = x - cntr_x;
      y = y - cntr_y;
      let rx = x*Math.cos(theta)-y*Math.sin(theta);
      let ry = x*Math.sin(theta)+y*Math.cos(theta);
      x = rx + cntr_x;
      y = ry + cntr_y;
      graph.graphData.nodes[l].fx = x;
      graph.graphData.nodes[l].fy = y;
    }
    let cur_count = zoomLabelsMain();
    let labelDoms = zoomOutLabelsMain();
    let cur_area_cov = areaCoverage(labelDoms);
    if(max_area_cov==-1)
    {
      max_area_cov = cur_area_cov;
      best_theta = theta;
    }
    else
    {
      if((cur_count==0)&&(cur_area_cov>max_area_cov))
      {
        max_area_cov = cur_area_cov;
        best_theta = theta;
      }
    }
  }
  theta = best_theta;
  for(var l=0;l<=my_edges.length;l++){
    let x = crd_x_rev[l];
    let y = crd_y_rev[l];
    x = x - cntr_x;
    y = y - cntr_y;
    let rx = x*Math.cos(theta)-y*Math.sin(theta);
    let ry = x*Math.sin(theta)+y*Math.cos(theta);
    x = rx + cntr_x;
    y = ry + cntr_y;
    graph.graphData.nodes[l].fx = x;
    graph.graphData.nodes[l].fy = y;
  }
  console.log("best_theta:", best_theta);
}
function findLabelOverlaps(){
  safeMode = false;
  let max_label_reached = false;
  let labelDoms = d3.select('body').selectAll('text')["_groups"][0];
  let data = d3.select('body').selectAll('text').data();
  let count = 0;
  for(var i=0;i<labelDoms.length;i++)
  {
    for(var j=i+1;j<labelDoms.length;j++)
    {
      if((!isNaN(data[i].name))||(!isNaN(data[j].name)))continue;
      var rect1 = labelDoms[i].getBoundingClientRect();
      var rect2 = labelDoms[j].getBoundingClientRect();
      max_label_reached = !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom)
      if(max_label_reached)
      {
        first_overlapping_label = id_to_label[i];
        label_to_go = id_to_label[j];
        label_right_now = document.getElementById("centerLabelID").value;
        //label_right_now = my_edges[0][0];
        graph.svgGroup.attr("transform", `translate(${-crd_x[label_to_id[label_to_go]]+crd_x[label_to_id[label_right_now]]}, ${-crd_y[label_to_id[label_to_go]]+crd_y[label_to_id[label_right_now]]})`);
        if(count==0){
          console.log(labelDoms[i], " overlaps ", labelDoms[j]);
          console.log(rect1, rect2);
        }
        count += 1;
        //max_label_reached = false;
        break;
      }
    }
    if(max_label_reached==true)break;
  }
  console.log("count:", count);
  font_size += 1;
  d3.select('body').selectAll('text').style("font-size", function(d){if(isNaN(d.name))return font_size+"px"; else return "0px";});
  /*if(!max_label_reached)
  {
    font_size += 1;
    d3.select('body').selectAll('text').style("font-size", function(d){if(isNaN(d.name))return font_size+"px"; else return "0px";});
  }
  else
  {
    alert("Can not zoom further!");
    console.log("Area coverage:", areaCoverage(labelDoms));
  }*/
}
function labelUp()
{
  graph.graphData.nodes[label_to_id[label_to_go]].fy -= 10;
}
function labelDown()
{ 
  graph.graphData.nodes[label_to_id[label_to_go]].fy += 10;
}
function labelLeft()
{
  graph.graphData.nodes[label_to_id[label_to_go]].fx -= 10;
}
function labelRight()
{ 
  graph.graphData.nodes[label_to_id[label_to_go]].fx += 10;
}
function labelUpOther()
{
  graph.graphData.nodes[label_to_id[first_overlapping_label]].fy -= 10;
}
function labelDownOther()
{
  graph.graphData.nodes[label_to_id[first_overlapping_label]].fy += 10;
}
function labelLeftOther()
{
  graph.graphData.nodes[label_to_id[first_overlapping_label]].fx -= 10;
}
function labelRightOther()
{
  graph.graphData.nodes[label_to_id[first_overlapping_label]].fx += 10;
}
function printCoordinates()
{
  let crd_x_rev = {};
  let crd_y_rev = {};
  for(var l=0;l<=my_edges.length;l++){
    crd_x_rev[l] = graph.graphData.nodes[l].fx;
    crd_y_rev[l] = graph.graphData.nodes[l].fy;
  }
  console.log(crd_x_rev, crd_y_rev);
  console.log("Number of crossings:", linkCrossingsWithCrds (crd_x_rev, crd_y_rev).length);
}
function zoomOutLabelsMain(){
  let labelDoms = d3.select('body').selectAll('text')["_groups"][0];
  let labelDoms_temp = [];
  for(var i=0;i<labelDoms.length;i++)
  {
    /*//if(labelDoms[i].__data__.id>3500)continue;
    //if(labelDoms[i].__data__.id>2500)continue;
    //if(labelDoms[i].__data__.id>1600)continue;
    //if(labelDoms[i].__data__.id>800)continue;
    //if(labelDoms[i].__data__.id>400)continue;
    //if(labelDoms[i].__data__.id>200)continue;
    if(labelDoms[i].__data__.id>100)continue;*/
    labelDoms_temp.push(labelDoms[i]);
  }
  labelDoms = labelDoms_temp;
  font_size -= 1;
  d3.select('body').selectAll('text').style("font-size", function(d){if(isNaN(d.name))return font_size+"px"; else return "0px";});
  return labelDoms;
}
function zoomOutLabels(){
  let labelDoms = zoomOutLabelsMain();
  console.log("Area coverage:", areaCoverage(labelDoms));
}

myInit();

function randomNumber(min, max) {  
    min = Math.ceil(min); 
    max = Math.floor(max); 
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function straight_or_circular_force(cnt, speed, type)
{
    if(type=="straight")
    {
      return 1;
    }
    else
    {
      //return Math.cos(speed*cnt*Math.PI/360)+1;
      return Math.cos(speed*cnt*Math.PI/360)*.5+.5;
    }
}

function edgeInArray(removed_edges, u, v)
{
  for(var i=0;i<2;i++)
  {
    if(removed_edges[i][0]==u && removed_edges[i][1]==v)return true;
    if(removed_edges[i][0]==v && removed_edges[i][1]==u)return true;
  }
  return false;
}

function removeCrossingUsingRotation(cntr_vertex, other_vertex, crossing_line){
    //console.log("center vertex", id_to_label[cntr_vertex.id], cntr_vertex.x, cntr_vertex.y, "other vertex", id_to_label[other_vertex.id], other_vertex.x, other_vertex.y);
    var rotation_dir = 1;
    /*var rotation_dir = randomNumber(0, 1);
    if(rotation_dir==0)rotation_dir=1;
    else rotation_dir=-1;*/
    let number_of_angles = 100;
    var theta=Math.atan((other_vertex.y-cntr_vertex.y)/(other_vertex.x-cntr_vertex.x));
    for(var i=0;i<number_of_angles;i++)
    {
      let tx = other_vertex.x-cntr_vertex.x;
      let ty = other_vertex.y-cntr_vertex.y;
      //console.log("tx, ty", tx, ty);
      let rx = tx*Math.cos(theta)-ty*Math.sin(theta);
      let ry = tx*Math.sin(theta)+ty*Math.cos(theta);
      tx = rx+cntr_vertex.x;
      ty = ry+cntr_vertex.y;
      //console.log("tx, ty", tx, ty);
      var line1 = [
        [cntr_vertex.x, cntr_vertex.y],
        [tx, ty]
      ];

      var line2 = [
        [crossing_line[0].x, crossing_line[0].y],
        [crossing_line[1].x, crossing_line[1].y]
      ];

      if(linesCross(line1, line2)==false)return [tx, ty];
      theta=theta+(rotation_dir)*(Math.PI/number_of_angles);
    }
}

function removeAllCrossingsUsingRotation(cntr_vertex, other_vertex, inputLink){
    //console.log("center vertex", id_to_label[cntr_vertex.id], cntr_vertex.x, cntr_vertex.y, "other vertex", id_to_label[other_vertex.id], other_vertex.x, other_vertex.y);
    var oldX = other_vertex.x;
    var oldY = other_vertex.y;
    var rotation_dir = 1;
    /*var rotation_dir = randomNumber(0, 1);
    if(rotation_dir==0)rotation_dir=1;
    else rotation_dir=-1;*/
    let number_of_angles = 100;
    if(my_edges.length>2000)
    {
      number_of_angles = 1000;
    }
    var theta=Math.atan((other_vertex.y-cntr_vertex.y)/(other_vertex.x-cntr_vertex.x));
    for(var i=0;i<number_of_angles;i++)
    {
      let tx = other_vertex.x-cntr_vertex.x;
      let ty = other_vertex.y-cntr_vertex.y;
      //console.log("tx, ty", tx, ty);
      let rx = tx*Math.cos(theta)-ty*Math.sin(theta);
      let ry = tx*Math.sin(theta)+ty*Math.cos(theta);
      tx = rx+cntr_vertex.x;
      ty = ry+cntr_vertex.y;
      //console.log("tx, ty", tx, ty);
      other_vertex.x = tx;
      other_vertex.y = ty;
      var crossings = linkCrossingsWithInputLink(inputLink);
      //console.log(crossings);
      if(crossings.length==0)return [tx, ty];
      theta=theta+(rotation_dir)*(Math.PI/number_of_angles);
    }
    //console.log("Haven't found any crossing free position");
    return [oldX, oldY];
}

function get_child_nodes(firstEdge, secondEdge){
    var comp1Size = null;
    var comp1 = null;
    var removed_edges = [];
    myGraph.removeEdge(firstEdge[0].id, firstEdge[1].id);
    var part1 = myGraph.bfs(firstEdge[0].id);
    var part2 = myGraph.bfs(firstEdge[1].id);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {   
        if((part1[i]==secondEdge[0].id)||(part1[i]==secondEdge[1].id))
        { 
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {   
        var t = firstEdge[0];
        firstEdge[0] = firstEdge[1];
        firstEdge[1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp1Size = part1.length;
    comp1 = part1;
    myGraph.addEdge(firstEdge[0].id, firstEdge[1].id);
    return [comp1, firstEdge];
}

function update_drawing(arr, other_vertex, oldX, oldY, comp)
{
      let nx = arr[0];
      let ny = arr[1];
      graph.graphData.nodes[other_vertex.id].x = oldX;
      graph.graphData.nodes[other_vertex.id].y = oldY;
      let tx = nx-oldX;
      let ty = ny-oldY;
      for(var i=0;i<comp.length;i++)
      {
        graph.graphData.nodes[comp[i]].fx += tx;
        graph.graphData.nodes[comp[i]].fy += ty;
      }
      d3.select('#nodes_testSvgId').selectAll('g').attr("transform", d => {return 'translate('+[d.x,d.y]+')';});
      d3.select('#links_testSvgId').selectAll('line').attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y).style("stroke", d => d.stroke).style("stroke-width", d => d["stroke-width"]);
}

function remove_existing_crossings(){
  var res = linkCrossingsParam(graph.graphData.links);
  var old_length = 0;
  while(res.length>0)
  {
    //var crossingIndex = randomNumber(0, res.length-1);
    for(var crossingIndex=0;crossingIndex<res.length;crossingIndex++){
      //console.log("crossingIndex", crossingIndex);
      var crossingPair = res[crossingIndex];
      var arr = get_child_nodes(crossingPair[0], crossingPair[1]);
      var comp1 = arr[0];
      crossingPair[0] = arr[1];
      //console.log(crossingPair[0]);
      var arr = get_child_nodes(crossingPair[1], crossingPair[0]);
      var comp2 = arr[0];
      crossingPair[1] = arr[1];
      //console.log(crossingPair[1]);
      var new_coord = null;
      if(comp1.length<comp2.length)
        {
          var oldX = crossingPair[0][0].x;
          var oldY = crossingPair[0][0].y;
          new_coord = removeAllCrossingsUsingRotation(crossingPair[0][1], crossingPair[0][0], graph.graphData.links[crossingPair[0][2]]);
          update_drawing(new_coord, crossingPair[0][0], oldX, oldY, comp1);
          //console.log("Center", crossingPair[0][1], "other", crossingPair[0][0]);
          if((oldX==new_coord[0])&&(oldX==new_coord[1]))
          {
            edge_distance[crossingPair[0][2]] = Math.max(10, edge_distance[crossingPair[0][2]]-5)
          }
        }
      else
        {
          var oldX = crossingPair[1][0].x;
          var oldY = crossingPair[1][0].y;
          new_coord = removeAllCrossingsUsingRotation(crossingPair[1][1], crossingPair[1][0], graph.graphData.links[crossingPair[1][2]]);
          update_drawing(new_coord, crossingPair[1][0], oldX, oldY, comp2);
          //console.log("Center", crossingPair[1][1], "other", crossingPair[1][0]);
          if((oldX==new_coord[0])&&(oldX==new_coord[1]))
          {
            edge_distance[crossingPair[0][2]] = Math.max(10, edge_distance[crossingPair[0][2]]-5)
          }
        }
    }
    res = linkCrossingsParam(graph.graphData.links);
    if(old_length==res.length){
      if(res.length>0){
        //addEdgePhase = false;
        //removeSmallCompIntervalMultipleSafe = setInterval(removeSmallCompAutoMultipleSafe, intervalTime);
        console.log('Unable to remove crossing, leaving as it is.');
      }
      break;
    }
    old_length = res.length;
    //document.getElementById("number_of_crossings").value = res.length;
    console.log("crossings", res.length);
  }
}

var removeSmallCompMultiple = function (crossingIndex, res) {
    // select a crossing pair randomly
    //var crossingIndex = randomNumber(0, res.length-1);
    var crossingPair = res[crossingIndex];

    var comp1Size = null;
    var comp1 = null;
    var removed_edges = [];
    myGraph.removeEdge(crossingPair[0][0].id, crossingPair[0][1].id);
    removed_edges.push([crossingPair[0][0].id, crossingPair[0][1].id]);
    var part1 = myGraph.bfs(crossingPair[0][0].id);
    var part2 = myGraph.bfs(crossingPair[0][1].id);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {
        if((part1[i]==crossingPair[1][0].id)||(part1[i]==crossingPair[1][1].id))
        {
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {
        var t = crossingPair[0][0];
        crossingPair[0][0] = crossingPair[0][1];
        crossingPair[0][1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp1Size = part1.length;
    comp1 = part1;
    var comp2Size = null;
    var comp2 = null;
    myGraph.removeEdge(crossingPair[1][0].id, crossingPair[1][1].id);
    removed_edges.push([crossingPair[1][0].id, crossingPair[1][1].id]);
    var part1 = myGraph.bfs(crossingPair[1][0].id);
    var part2 = myGraph.bfs(crossingPair[1][1].id);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {
        if((part1[i]==crossingPair[0][0].id)||(part1[i]==crossingPair[0][1].id))
        {
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {
        var t = crossingPair[1][0];
        crossingPair[1][0] = crossingPair[1][1];
        crossingPair[1][1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp2Size = part1.length;
    comp2 = part1;
    var commonCompSize = part2.length;
    var commonComp = part2;
    myGraph.addEdge(crossingPair[0][0].id, crossingPair[0][1].id);
    if(!edgeInArray(removed_edges, crossingPair[0][0].id, crossingPair[0][1].id))console.log(crossingPair[0][0].id, crossingPair[0][1].id, "not in", removed_edges);
    myGraph.addEdge(crossingPair[1][0].id, crossingPair[1][1].id);
    if(!edgeInArray(removed_edges, crossingPair[1][0].id, crossingPair[1][1].id))console.log(crossingPair[1][0].id, crossingPair[1][1].id, "not in", removed_edges);
    // In both edge the first vertex contains the separate component, place force accordingly
    //console.log("comp1Size:", comp1Size, "comp2Size:", comp2Size, "commonCompSize:", commonCompSize);

    let force_factor = straight_or_circular_force(crossing_step_cnt, crossing_step_speed, crossing_step_type);
    crossing_step_cnt = crossing_step_cnt + 1;
    /*if((comp1Size==1) || (comp2Size==1))
    {
      let cntr_vertex = -1;
      let other_vertex = -1;
      let crossing_line = -1;
      if(comp1Size==1)
      {
        //console.log(id_to_label[comp1[0]], "is empty");
        if(crossingPair[0][0].id==comp1[0])
        {
          other_vertex=crossingPair[0][0];
          cntr_vertex=crossingPair[0][1];
        }
        else
        {
          other_vertex=crossingPair[0][1];
          cntr_vertex=crossingPair[0][0];
        }
        crossing_line = crossingPair[1];
      }
      else if(comp2Size==1)
      {
        //console.log(id_to_label[comp2[0]], "is empty");
        if(crossingPair[1][0].id==comp2[0])
        {
          other_vertex=crossingPair[1][0];
          cntr_vertex=crossingPair[1][1];
        }
        else
        {
          other_vertex=crossingPair[1][1];
          cntr_vertex=crossingPair[1][0];
        }
        crossing_line = crossingPair[0];
      }
      let arr = removeCrossingUsingRotation(cntr_vertex, other_vertex, crossing_line);
      let nx = arr[0];
      let ny = arr[1];
      //console.log(graph.graphData.nodes[other_vertex.id].x);
      graph.graphData.nodes[other_vertex.id].x = nx;
      graph.graphData.nodes[other_vertex.id].y = ny;
      //console.log(graph.graphData.nodes[other_vertex.id].x);
      d3.select('#nodes_testSvgId').selectAll('g').attr("transform", d => {return 'translate('+[d.x,d.y]+')';});
      d3.select('#links_testSvgId').selectAll('line').attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y).style("stroke", d => d.stroke).style("stroke-width", d => d["stroke-width"]);
    }
    else*/ 
    if((comp1Size<=comp2Size) && (comp1Size<=commonCompSize))
    {
      var moveAmountUp = crossingPair[0][1].x-crossingPair[0][0].x;
      var moveAmountRight = crossingPair[0][1].y-crossingPair[0][0].y;
      var nodeId = crossingPair[0][1].id;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight*force_factor, moveAmountUp*force_factor);
      moveParMultiple(new Set(comp1), moveAmountUp*force_factor, moveAmountRight*force_factor);
    }
    else if((comp2Size<=comp1Size) && (comp2Size<=commonCompSize))
    {
      var moveAmountUp = crossingPair[1][1].x-crossingPair[1][0].x;
      var moveAmountRight = crossingPair[1][1].y-crossingPair[1][0].y;
      var nodeId = crossingPair[1][1].id;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight*force_factor, moveAmountUp*force_factor);
      moveParMultiple(new Set(comp2), moveAmountUp*force_factor, moveAmountRight*force_factor);
    }
    else
    {
      var moveAmountUp = crossingPair[0][0].x-crossingPair[0][1].x;
      var moveAmountRight = crossingPair[0][0].y-crossingPair[0][1].y;
      var nodeId = crossingPair[0][0].id;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight*force_factor, moveAmountUp*force_factor);
      moveParMultiple(new Set(comp1), moveAmountUp*force_factor, moveAmountRight*force_factor);
    }

}

var removeSmallCompMultipleOld = function (crossingIndex, res) {
    // select a crossing pair randomly
    //var crossingIndex = randomNumber(0, res.length-1);
    var crossingPair = res[crossingIndex];
    console.log(crossingPair);

    var comp1Size = null;
    var comp1 = null;
    //myGraph.removeEdge(crossingPair[0][0].index, crossingPair[0][1].index);
    myGraph.removeEdge(crossingPair[0][0].id, crossingPair[0][1].id);
    console.log("removing edge:", crossingPair[0][0].index, crossingPair[0][1].index);
    console.log("Adj list:", myGraph.AdjList);
    var part1 = myGraph.bfs(crossingPair[0][0].index);
    var part2 = myGraph.bfs(crossingPair[0][1].index);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {
        if((part1[i]==crossingPair[1][0].index)||(part1[i]==crossingPair[1][1].index))
        {
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {
        var t = crossingPair[0][0];
        crossingPair[0][0] = crossingPair[0][1];
        crossingPair[0][1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp1Size = part1.length;
    comp1 = part1;
    var comp2Size = null;
    var comp2 = null;
    //myGraph.removeEdge(crossingPair[1][0].index, crossingPair[1][1].index);
    myGraph.removeEdge(crossingPair[1][0].id, crossingPair[1][1].id);
    console.log("removing edge:", crossingPair[1][0].index, crossingPair[1][1].index);
    console.log("Adj list:", myGraph.AdjList);
    var part1 = myGraph.bfs(crossingPair[1][0].index);
    var part2 = myGraph.bfs(crossingPair[1][1].index);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {
        if((part1[i]==crossingPair[0][0].index)||(part1[i]==crossingPair[0][1].index))
        {
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {
        var t = crossingPair[1][0];
        crossingPair[1][0] = crossingPair[1][1];
        crossingPair[1][1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp2Size = part1.length;
    comp2 = part1;
    var commonCompSize = part2.length;
    var commonComp = part2;
    //myGraph.addEdge(crossingPair[0][0].index, crossingPair[0][1].index);
    myGraph.addEdge(crossingPair[0][0].id, crossingPair[0][1].id);
    console.log("adding edge:", crossingPair[0][0].index, crossingPair[0][1].index);
    //myGraph.addEdge(crossingPair[1][0].index, crossingPair[1][1].index);
    myGraph.addEdge(crossingPair[1][0].id, crossingPair[1][1].id);
    console.log("adding edge:", crossingPair[1][0].index, crossingPair[1][1].index);
    // In both edge the first vertex contains the separate component, place force accordingly
    //console.log("comp1Size:", comp1Size, "comp2Size:", comp2Size, "commonCompSize:", commonCompSize);

    let force_factor = straight_or_circular_force(crossing_step_cnt, crossing_step_speed, crossing_step_type);
    crossing_step_cnt = crossing_step_cnt + 1;
    if((comp1Size<=comp2Size) && (comp1Size<=commonCompSize))
    {
      var moveAmountUp = crossingPair[0][1].x-crossingPair[0][0].x;
      var moveAmountRight = crossingPair[0][1].y-crossingPair[0][0].y;
      var nodeId = crossingPair[0][1].index;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight*force_factor, moveAmountUp*force_factor);
      moveParMultiple(new Set(comp1), moveAmountUp*force_factor, moveAmountRight*force_factor);
    }
    else if((comp2Size<=comp1Size) && (comp2Size<=commonCompSize))
    {
      var moveAmountUp = crossingPair[1][1].x-crossingPair[1][0].x;
      var moveAmountRight = crossingPair[1][1].y-crossingPair[1][0].y;
      var nodeId = crossingPair[1][1].index;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight*force_factor, moveAmountUp*force_factor);
      moveParMultiple(new Set(comp2), moveAmountUp*force_factor, moveAmountRight*force_factor);
    }
    else
    {
      var moveAmountUp = crossingPair[0][0].x-crossingPair[0][1].x;
      var moveAmountRight = crossingPair[0][0].y-crossingPair[0][1].y;
      var nodeId = crossingPair[0][0].index;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight*force_factor, moveAmountUp*force_factor);
      moveParMultiple(new Set(comp1), moveAmountUp*force_factor, moveAmountRight*force_factor);
    }

}

var removeSmallCompAutoMultiple = function () {
  var res = linkCrossingsParam(graph.graphData.links);
  var crossingIndex = randomNumber(0, res.length-1);
  //var crossingIndex = 0;
  if(res.length>0){
    removeSmallCompMultiple(crossingIndex, res);
  }
  else
  {
    stopRemovingSmallCompMultiple();
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
  }
}

function stopRemovingSmallCompMultiple() {
  clearInterval(removeSmallCompIntervalMultiple);
}

function unhighlightEdge(){
    if(previousCrossingIndex!=null)
    {
      graph.graphData.links[previousCrossingIndex].stroke = "#76963e";
      graph.graphData.links[previousCrossingIndex]["stroke-width"] = "1.0px";
    }
}

function moveAwayFromCenter(forceFactor){
  var nodeDepth = myGraph.bfs_depth(0);
  //console.log(nodeDepth);
  var i=0;
  for(var i=1;i<nodeDepth.length;i++)
  {
    var vx = graph.graphData.nodes[i].x - graph.graphData.nodes[0].x;
    var vy = graph.graphData.nodes[i].y - graph.graphData.nodes[0].y;
    var nrm = Math.sqrt(vx*vx + vy*vy);
    vx = vx/nrm;
    vy = vy/nrm;
    movePar(i, vx*forceFactor, vy*forceFactor);
  }
  //console.log("Added force from the direction from center");
}

previousCrossingIndex = null;
var removeSmallCompAutoMultipleSafe = function () {
  moveAwayFromCenter(100);
  var res = linkCrossingsParam(graph.graphData.links);
  //var crossingIndex = randomNumber(0, res.length-1);
  var crossingIndex = 0;
  document.getElementById("number_of_crossings").value = res.length;
  //if(res.length>0){
  //if(res.length>50){
  if(!addEdgePhase){
    let edgeIndex = res[crossingIndex][0][2];
    graph.graphData.links[edgeIndex].stroke = "red";
    graph.graphData.links[edgeIndex]["stroke-width"] = "5.0px";
    if(edgeIndex!=previousCrossingIndex)unhighlightEdge();
    previousCrossingIndex = edgeIndex;
    removeSmallCompMultiple(crossingIndex, res);
  }
  else
  {
    stopRemovingSmallCompMultipleSafe();
    unhighlightEdge();
    addEdgeInterval = setInterval(startAddingEdges, intervalTime);
  }
}

function stopRemovingSmallCompMultipleSafe() {
  clearInterval(removeSmallCompIntervalMultipleSafe);
}

var removeSmallComp = function (crossingIndex, res, forceFactor) {
    // select a crossing pair randomly
    //var crossingIndex = randomNumber(0, res.length-1);
    var crossingPair = res[crossingIndex];

    var comp1Size = null;
    myGraph.removeEdge(crossingPair[0][0].index, crossingPair[0][1].index);
    var part1 = myGraph.bfs(crossingPair[0][0].index);
    var part2 = myGraph.bfs(crossingPair[0][1].index);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {
        if((part1[i]==crossingPair[1][0].index)||(part1[i]==crossingPair[1][1].index))
        {
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {
        var t = crossingPair[0][0];
        crossingPair[0][0] = crossingPair[0][1];
        crossingPair[0][1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp1Size = part1.length;
    var comp2Size = null;
    myGraph.removeEdge(crossingPair[1][0].index, crossingPair[1][1].index);
    var part1 = myGraph.bfs(crossingPair[1][0].index);
    var part2 = myGraph.bfs(crossingPair[1][1].index);
    var part1ContainsSecondEdge = false;
    for(var i=0; i<part1.length; i++)
    {
        if((part1[i]==crossingPair[0][0].index)||(part1[i]==crossingPair[0][1].index))
        {
          part1ContainsSecondEdge = true;
          break;
        }
    }
    if(part1ContainsSecondEdge)
    {
        var t = crossingPair[1][0];
        crossingPair[1][0] = crossingPair[1][1];
        crossingPair[1][1] = t;
        t = part1;
        part1 = part2;
        part2 = t;
    }
    comp2Size = part1.length;
    var commonCompSize = part2.length;
    myGraph.addEdge(crossingPair[0][0].index, crossingPair[0][1].index);
    myGraph.addEdge(crossingPair[1][0].index, crossingPair[1][1].index);
    // In both edge the first vertex contains the separate component, place force accordingly
    //console.log("comp1Size:", comp1Size, "comp2Size:", comp2Size, "commonCompSize:", commonCompSize);

    if((comp1Size<=comp2Size) && (comp1Size<=commonCompSize))
    {
      var moveAmountUp = crossingPair[0][1].x-crossingPair[0][0].x;
      var moveAmountRight = crossingPair[0][1].y-crossingPair[0][0].y;
      var nodeId = crossingPair[0][1].index;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight, moveAmountUp);
      movePar(nodeId, moveAmountUp*forceFactor, moveAmountRight*forceFactor);
    }
    else if((comp2Size<=comp1Size) && (comp2Size<=commonCompSize))
    {
      var moveAmountUp = crossingPair[1][1].x-crossingPair[1][0].x;
      var moveAmountRight = crossingPair[1][1].y-crossingPair[1][0].y;
      var nodeId = crossingPair[1][1].index;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight, moveAmountUp);
      movePar(nodeId, moveAmountUp*forceFactor, moveAmountRight*forceFactor);
    }
    else
    {
      var moveAmountUp = crossingPair[0][0].x-crossingPair[0][1].x;
      var moveAmountRight = crossingPair[0][0].y-crossingPair[0][1].y;
      var nodeId = crossingPair[0][0].index;
      //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight, moveAmountUp);
      movePar(nodeId, moveAmountUp*forceFactor, moveAmountRight*forceFactor);
    }

}

prevResLength = null;
forceFactor = 1;
var removeSmallCompAuto = function () {
  var res = linkCrossingsParam(graph.graphData.links);
  var crossingIndex = randomNumber(0, res.length-1);
  //var crossingIndex = 0;
  if(prevResLength!=null){
    //if(prevResLength>=res.length){if(forceFactor<128)forceFactor *=2;}
    if(prevResLength>=res.length){if(forceFactor<32)forceFactor *=2;}
    else{forceFactor = 1;}
  }
  else{prevResLength = res.length;}
  if(res.length>0){
    removeSmallComp(crossingIndex, res, forceFactor);
  }
  else
  {
    stopRemovingSmallComp();
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
  }
}

function stopRemovingSmallComp() {
  clearInterval(removeSmallCompInterval);
}

//var initialize = function () {
var addCrossingForce = function () {
  //console.log(graph.graphData.links);
  links = graph.graphData.links;
  m = links.length;
  res = linkCrossings();
  //console.log("Number of crossings:", res.length);
  if(res.length>0){
    // select a crossing pair randomly
    var crossingIndex = randomNumber(0, res.length-1);
    var crossingPair = res[crossingIndex];
    // swap the edges with probability .5
    var coin = randomNumber(0, 1);
    if(coin==0){
      var t = crossingPair[0];
      crossingPair[0] = crossingPair[1];
      crossingPair[1] = t;
    }
    // swap the points with probability .5
    var coin = randomNumber(0, 1);
    if(coin==0){
      var t = crossingPair[0][0];
      crossingPair[0][0] = crossingPair[0][1];
      crossingPair[0][1] = t;
    }
    var moveAmountUp = crossingPair[0][0].x-graph.graphData.nodes[0].x;
    var moveAmountRight = crossingPair[0][0].y-graph.graphData.nodes[0].y;
    var nodeId = crossingPair[0][1].index;
    //console.log("Moving ", id_to_label[nodeId], " to ", moveAmountRight, moveAmountUp);
    movePar(nodeId, moveAmountUp, moveAmountRight);
  }
  else{
    stopCrossingForce();
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
  }
}

function stopCrossingForce() {
  clearInterval(crossingForceInterval);
}

function direction (pi, pj, pk) {
    var p1 = [pk[0] - pi[0], pk[1] - pi[1]];
    var p2 = [pj[0] - pi[0], pj[1] - pi[1]];
    return p1[0] * p2[1] - p2[0] * p1[1];
}

// Is point k on the line segment formed by points i and j?
// Inclusive, so if pk == pi or pk == pj then return true.
function onSegment (pi, pj, pk) {
    return Math.min(pi[0], pj[0]) <= pk[0] &&
      pk[0] <= Math.max(pi[0], pj[0]) &&
      Math.min(pi[1], pj[1]) <= pk[1] &&
      pk[1] <= Math.max(pi[1], pj[1]);
}

function linesCross (line1, line2) {
    var d1, d2, d3, d4;

    // CLRS 2nd ed. pg. 937
    d1 = direction(line2[0], line2[1], line1[0]);
    d2 = direction(line2[0], line2[1], line1[1]);
    d3 = direction(line1[0], line1[1], line2[0]);
    d4 = direction(line1[0], line1[1], line2[1]);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    } else if (d1 === 0 && onSegment(line2[0], line2[1], line1[0])) {
      return true;
    } else if (d2 === 0 && onSegment(line2[0], line2[1], line1[1])) {
      return true;
    } else if (d3 === 0 && onSegment(line1[0], line1[1], line2[0])) {
      return true;
    } else if (d4 === 0 && onSegment(line1[0], line1[1], line2[1])) {
      return true;
    }

    return false;
}

function linksCross (link1, link2) {
    // Self loops are not intersections
    if (link1.index === link2.index ||
      link1.source === link1.target ||
      link2.source === link2.target) {
      return false;
    }

    // Links cannot intersect if they share a node
    if (link1.source === link2.source ||
      link1.source === link2.target ||
      link1.target === link2.source ||
      link1.target === link2.target) {
      return false;
    }

    var line1 = [
      [link1.source.x, link1.source.y],
      [link1.target.x, link1.target.y]
    ];

    var line2 = [
      [link2.source.x, link2.source.y],
      [link2.target.x, link2.target.y]
    ];

    return linesCross(line1, line2);
}

function linksCrossWithCrds (link1, link2, crd_x, crd_y) {
    // Self loops are not intersections
    if (link1.index === link2.index ||
      link1.source === link1.target ||
      link2.source === link2.target) {
      return false;
    }

    // Links cannot intersect if they share a node
    if (link1.source === link2.source ||
      link1.source === link2.target ||
      link1.target === link2.source ||
      link1.target === link2.target) {
      return false;
    }

    var line1 = [
      [crd_x[link1.source.id], crd_y[link1.source.id]],
      [crd_x[link1.target.id], crd_y[link1.target.id]]
    ];

    var line2 = [
      [crd_x[link2.source.id], crd_y[link2.source.id]],
      [crd_x[link2.target.id], crd_y[link2.target.id]]
    ];

    return linesCross(line1, line2);
}

function linkCrossings () {
    var i, j, c = 0, link1, link2, line1, line2;;
    var res = [];

    // Sum the upper diagonal of the edge crossing matrix.
    for (i = 0; i < m; ++i) {
      for (j = i + 1; j < m; ++j) {
        link1 = links[i], link2 = links[j];

        // Check if link i and link j intersect
        if (linksCross(link1, link2)) {
          line1 = [
            [link1.source.x, link1.source.y],
            [link1.target.x, link1.target.y]
          ];
          line2 = [
            [link2.source.x, link2.source.y],
            [link2.target.x, link2.target.y]
          ];
          ++c;
          //console.log(id_to_label[link1.source.index], ",", id_to_label[link1.target.index], " crosses ", id_to_label[link2.source.index], ",", id_to_label[link2.target.index]);
          res.push([[link1.source, link1.target], [link2.source, link2.target]]);
          //d += Math.abs(idealAngle - acuteLinesAngle(line1, line2));
        }
      }
    }

    return res;
}

function linkCrossingsWithCrds (crd_x, crd_y) {
    var i, j, c = 0, link1, link2, line1, line2;;
    var res = [];

    var links = graph.graphData.links;
    let m = links.length;
    // Sum the upper diagonal of the edge crossing matrix.
    for (i = 0; i < m; ++i) {
      for (j = i + 1; j < m; ++j) {
        link1 = links[i], link2 = links[j];

        // Check if link i and link j intersect
        if (linksCrossWithCrds(link1, link2, crd_x, crd_y)) {
          /*line1 = [
            [link1.source.x, link1.source.y],
            [link1.target.x, link1.target.y]
          ];
          line2 = [
            [link2.source.x, link2.source.y],
            [link2.target.x, link2.target.y]
          ];
          ++c;*/
          //console.log(id_to_label[link1.source.index], ",", id_to_label[link1.target.index], " crosses ", id_to_label[link2.source.index], ",", id_to_label[link2.target.index]);
          res.push([[link1.source, link1.target], [link2.source, link2.target]]);
          //d += Math.abs(idealAngle - acuteLinesAngle(line1, line2));
        }
      }
    }

    return res;
}

function linkCrossingsWithInputLink (inputLink) {
    var i, j, c = 0, link1, link2, line1, line2;;
    var res = [];

    // Sum the upper diagonal of the edge crossing matrix.
    var links = graph.graphData.links;
    let m = links.length;
    for (var i = 0; i < m; ++i) {
        link1 = links[i], link2 = inputLink;

        // Check if link i and link j intersect
        if (linksCross(link1, link2)) {
          line1 = [
            [link1.source.x, link1.source.y],
            [link1.target.x, link1.target.y]
          ];
          line2 = [
            [link2.source.x, link2.source.y],
            [link2.target.x, link2.target.y]
          ];
          ++c;
          //console.log(id_to_label[link1.source.index], ",", id_to_label[link1.target.index], " crosses ", id_to_label[link2.source.index], ",", id_to_label[link2.target.index]);
          res.push([[link1.source, link1.target], [link2.source, link2.target]]);
          //d += Math.abs(idealAngle - acuteLinesAngle(line1, line2));
        }
    }

    return res;
}

function hasLinkCrossingsWithInputLink (inputLink, crd_x, crd_y) {
    var i, j, c = 0, link1, link2, line1, line2;;
    //var res = [];

    // Sum the upper diagonal of the edge crossing matrix.
    var links = graph.graphData.links;
    let m = links.length;
    for (var i = 0; i < m; ++i) {
        link1 = links[i], link2 = inputLink;

        // Check if link i and link j intersect
        if (linksCrossWithCrds(link1, link2, crd_x, crd_y)) {
          /*line1 = [
            [link1.source.x, link1.source.y],
            [link1.target.x, link1.target.y]
          ];
          line2 = [
            [link2.source.x, link2.source.y],
            [link2.target.x, link2.target.y]
          ];
          ++c;*/
          //console.log(id_to_label[link1.source.index], ",", id_to_label[link1.target.index], " crosses ", id_to_label[link2.source.index], ",", id_to_label[link2.target.index]);
          //res.push([[link1.source, link1.target], [link2.source, link2.target]]);
          //d += Math.abs(idealAngle - acuteLinesAngle(line1, line2));
          return true;
        }
    }

    //return res;
    return false;
}

function linkCrossingsParam (links) {
    var i, j, c = 0, link1, link2, line1, line2;;
    var res = [];

    // Sum the upper diagonal of the edge crossing matrix.
    let m = links.length;
    for (i = 0; i < m; ++i) {
      for (j = i + 1; j < m; ++j) {
        link1 = links[i], link2 = links[j];

        // Check if link i and link j intersect
        if (linksCross(link1, link2)) {
          line1 = [
            [link1.source.x, link1.source.y],
            [link1.target.x, link1.target.y]
          ];
          line2 = [
            [link2.source.x, link2.source.y],
            [link2.target.x, link2.target.y]
          ];
          ++c;
          //console.log(id_to_label[link1.source.index], ",", id_to_label[link1.target.index], " crosses ", id_to_label[link2.source.index], ",", id_to_label[link2.target.index]);
          res.push([[link1.source, link1.target, link1.index], [link2.source, link2.target, link2.index]]);
          //d += Math.abs(idealAngle - acuteLinesAngle(line1, line2));
        }
      }
    }

    return res;
}

//overall the idea does not work
//reason one: there is no efficient way to calculate all points in a region
//reason two, even you detect all the points in a region containing the edge, there might be a vertex far away from that region but still crosses the edge
function search(quadtree, xmin, ymin, xmax, ymax) {
  const results = [];
  quadtree.visit(function(node, x1, y1, x2, y2) {
    if (!node.length) {
      do {
        var d = node.data;
        //if (d[0] >= xmin && d[0] < xmax && d[1] >= ymin && d[1] < ymax) {
        //if (d.x >= xmin && d.x < xmax && d.y >= ymin && d.y < ymax) {
        if (crd_x[d.id] >= xmin && crd_x[d.id] < xmax && crd_y[d.id] >= ymin && crd_y[d.id] < ymax) {
          results.push(d);
        }
      } while (node = node.next);
    }
    return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
  });
  return results;
}

function linkCrossingsParamQuadTree (link1, crd_x, crd_y, node_to_links, quadtree, max_edge_len) {
  /*let links = graph.graphData.links;
  var quadtree = d3.quadtree()
  .x(function (d) { return d.x; })
  .y(function (d) { return d.y; });
  var data = [links[0].source];
  for(var i=0;i<links.length;i++)
    data.push(links[i].target);
  quadtree.addAll(data);
  let max_edge_len = 500;
  for(var i = 0;i<links.length;i++)
  {
    let dis = Math.sqrt((links[i].source.x-links[i].target.x)*(links[i].source.x-links[i].target.x) + (links[i].source.y-links[i].target.y)*(links[i].source.y-links[i].target.y));
    if(max_edge_len<dis)max_edge_len=dis;
  }
  let count = 0;
  for(var i = 0;i<links.length;i++)
  {
    let xmin = Math.min(links[i].source.x, links[i].target.x)-max_edge_len;
    let ymin = Math.min(links[i].source.y, links[i].target.y)-max_edge_len;
    let xmax = Math.max(links[i].source.x, links[i].target.x)+max_edge_len;
    let ymax = Math.max(links[i].source.y, links[i].target.y)+max_edge_len;
    let crossings = search(quadtree, xmin, ymin, xmax, ymax);
    count = count + crossings.length;
  }*/
  let xmin = Math.min(crd_x[link1.source.id], crd_x[link1.target.id])-max_edge_len;
  let ymin = Math.min(crd_y[link1.source.id], crd_y[link1.target.id])-max_edge_len;
  let xmax = Math.max(crd_x[link1.source.id], crd_x[link1.target.id])+max_edge_len;
  let ymax = Math.max(crd_y[link1.source.id], crd_y[link1.target.id])+max_edge_len;
  let nbrNodes = search(quadtree, xmin, ymin, xmax, ymax);
  for(var i=0;i<nbrNodes.length;i++)
  {
     let id = nbrNodes[i].id;
     for(let j=0;j<node_to_links[id].length;j++)
     {
       let link2 = node_to_links[id][j];
       if (linksCrossWithCrds(link1, link2, crd_x, crd_y))
       {
         return true;
       }
     }
  }
  return false;
}


