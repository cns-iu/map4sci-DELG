import { remove_existing_crossings } from "./Functions/remove_existing_crossings.js";
import { id_to_label } from "./topics_compute_mlst.js";
import { my_edges } from "./topics_compute_mlst.js";
import { edge_distance } from "./topics_compute_mlst.js";
import { label_to_id } from "./topics_compute_mlst.js";
import { crd_x } from "./topics_compute_mlst.js";
import { crd_y } from "./topics_compute_mlst.js";
import { ideal_edge_length_preservation } from "./Functions/ideal_edge_length_preservation.js";
import { linkCrossingsParam } from "./Functions/linkCrossingsParam.js";
import {hasLinkCrossingsWithInputLink} from "./Functions/hasLinkCrossingsWithInputLink.js"
import * as fs from "fs";
import * as d3 from "d3";

let intervalTime = 5;
const steps_before_fix_position = 50000;
let edge_distance_org = null;
let eps_movement = null;
let safeMode = null;
let safeModeIter = null;
let locked = null;
let t0 = null;
let myGraph = null;
let node_to_links = null;

class D3ForceGraph {
  constructor(width, height) {
    let t = this;

    t.width = width;
    t.height = height;
    t.center = { x: t.width / 2, y: t.height / 2 };

    t.updateRefCount = 0;
  }

  init() {
    let t = this;

    t.graphData = { nodes: [], links: [] };

    const simulation = t.initSimulation();
    t.simulation = simulation;

    // update();
    t.update(t, simulation);
  }

  initSimulation() {
    let t = this;

    const result = d3
      .forceSimulation()
      .velocityDecay(0.55)
      .force(
        "link",
        d3
          .forceLink()
          .distance(function (d) {
            return edge_distance[d.index];
          })
          .id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-10).distanceMin(10000))
      .force("collide", d3.forceCollide(100))
      .force("center", d3.forceCenter(t.center.x, t.center.y));

    return result;
  }

  determine_collision_force(d) {
    if (typeof myGraph == "undefined") return subdivision_length / 2;
    const neighbors = myGraph.AdjList.get(d.id);
    if (typeof neighbors == "undefined") return subdivision_length / 2;
    const curr_x = graph.graphData.nodes[d.id].x;
    const curr_y = graph.graphData.nodes[d.id].y;
    const max_dis = 0;
    const min_dis = 10000000;
    for (let i = 0; i < neighbors.length; i++) {
      const n_x = graph.graphData.nodes[neighbors[i]].x;
      const n_y = graph.graphData.nodes[neighbors[i]].y;
      const d_x = n_x - curr_x;
      const d_y = n_y - curr_y;
      const curr_dis = Math.sqrt(d_x * d_x + d_y * d_y);
      if (max_dis < curr_dis) max_dis = curr_dis;
      if (min_dis > curr_dis) min_dis = curr_dis;
    }
    if (neighbors.length <= 2) {
      if (min_dis == 10000000) return subdivision_length / 2;
      return min_dis / 2;
    } else return max_dis / 2;
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

  update(t, simulation) {
    const nodes = t.graphData.nodes;
    const links = t.graphData.links;

    simulation.nodes(nodes).on("end", () => t.handleEnd());

    simulation.on("tick", handleTicked);

    simulation.force("link").links(links);

    function handleTicked() {
      if (safeMode) {
        if (!locked) {
          if (safeModeIter == 500) {
            stopForceDirected();
            graph.simulation.stop();
            let coordinates = JSON.stringify({ crd_x: crd_x, crd_y: crd_y });
            fs.writeFileSync("DELG_coordinates.json", coordinates);
            return;
          }
          locked = true;
          console.log("Safe mode iteration:", safeModeIter);
          safeModeIter = safeModeIter + 1;

          let crd_x_t = {};
          let crd_y_t = {};
          for (var i = 0; i <= my_edges.length; i++) {
            crd_x_t[i] = graph.graphData.nodes[i].x;
            crd_y_t[i] = graph.graphData.nodes[i].y;
          }
          for (let i = 0; i <= my_edges.length; i++) {
            const prev_x = crd_x[i];
            const prev_y = crd_y[i];
            crd_x[i] = crd_x_t[i];
            crd_y[i] = crd_y_t[i];
            {
              let introducesCrossing = false;
              for (let j = 0; j < node_to_links[i].length; j++) {
                const link = node_to_links[i][j];
                if (hasLinkCrossingsWithInputLink(link, crd_x, crd_y)) {
                  introducesCrossing = true;
                  break;
                }
              }
              if (introducesCrossing) {
                crd_x[i] = prev_x;
                crd_y[i] = prev_y;
              }
            }
          }
          if (safeModeIter % 100 == 0) {
            let crd_x_log = {};
            let crd_y_log = {};
            for (let i = 0; i <= my_edges.length; i++) {
              crd_x_log[i] = crd_x[i];
              crd_y_log[i] = crd_y[i];
            }
            console.log(crd_x_log, crd_y_log);
          }
          for (let i = 0; i <= my_edges.length; i++) {
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
      nodesToAdd.forEach((n) => t.graphData.nodes.push(n));
    }
    if (linksToAdd) {
      linksToAdd.forEach((l) => t.graphData.links.push(l));
    }

    t.update(t, t.simulation);
    t.simulation.restart();
    t.simulation.alpha(1);
  }

  remove(dToRemove) {
    console.log(`dToRemove: ${JSON.stringify(dToRemove)}`);

    let t = this;

    const currentNodes = t.graphData.nodes;
    const currentLinks = t.graphData.links;
    const nIndex = currentNodes.indexOf(dToRemove);
    if (nIndex > -1) {
      currentNodes.splice(nIndex, 1);
    }

    const toRemoveLinks = currentLinks.filter((l) => {
      return l.source.id === dToRemove.id || l.target.id === dToRemove.id;
    });
    toRemoveLinks.forEach((l) => {
      const lIndex = currentLinks.indexOf(l);
      currentLinks.splice(lIndex, 1);
    });

    t.update(t, t.simulation);
    t.simulation.restart();
    t.simulation.alpha(1);
  }

  handleNodeClicked(d) {
    console.log(`node clicked: ${JSON.stringify(d)}`);

    let t = this;

    const newId = Math.trunc(Math.random() * 1000);
    const newNode = { id: newId, name: "server 22", x: d.x, y: d.y };
    const newNodes = [newNode];
    const newLinks = [{ source: d.id, target: newNode.id }];

    t.add(newNodes, newLinks);
  }

  handleEnd() {
    console.log("end");
  }
}

// START RUNNING everyting
export const graph = new D3ForceGraph(500, 500);
graph.init();
const subdivision_length = 50;
class Queue {
  // Array is used to implement a Queue
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    // adding element to the queue
    this.items.push(element);
  }

  dequeue() {
    // removing element from the queue
    // returns underflow when called
    // on empty queue
    if (this.isEmpty()) return "Underflow";
    return this.items.shift();
  }

  // front function
  front() {
    // returns the Front element of
    // the queue without removing it.
    if (this.isEmpty()) return "No elements in Queue";
    return this.items[0];
  }

  // isEmpty function
  isEmpty() {
    // return true if the queue is empty.
    return this.items.length == 0;
  }

  // printQueue function
  printQueue() {
    let str = "";
    for (let i = 0; i < this.items.length; i++) str += this.items[i] + " ";
    return str;
  }
}

class MyGraph {
  constructor(noOfVertices) {
    this.noOfVertices = noOfVertices;
    this.AdjList = new Map();
  }
  addVertex(v) {
    this.AdjList.set(v, []);
  }
  addEdge(v, w) {
    this.AdjList.get(v).push(w);
    this.AdjList.get(w).push(v);
  }

  // remove edge from the graph
  removeEdge(v, w) {
    let arr = this.AdjList.get(v);
    if (typeof arr == "undefined") {
      graph.simulation.stop();
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === w) {
        arr.splice(i, 1);
      }
    }
    arr = this.AdjList.get(w);
    if (typeof arr == "undefined") {
      graph.simulation.stop();
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === v) {
        arr.splice(i, 1);
      }
    }
  }

  // Prints the vertex and adjacency list
  printGraph() {
    // get all the vertices
    let get_keys = this.AdjList.keys();

    // iterate over the vertices
    for (let i of get_keys) {
      // great the corresponding adjacency list
      // for the vertex
      let get_values = this.AdjList.get(i);
      let conc = "";

      // iterate over the adjacency list
      // concatenate the values into a string
      for (let j of get_values) conc += j + " ";

      // print the vertex and its adjacency list
      console.log(i + " -> " + conc);
    }
  }

  // function to performs BFS
  bfs(startingNode) {
    let bfsTraversal = [];

    // create a visited array
    let visited = [];
    for (let i = 0; i < this.noOfVertices; i++) visited[i] = false;

    // Create an object for queue
    let q = new Queue();

    // add the starting node to the queue
    visited[startingNode] = true;
    q.enqueue(startingNode);

    // loop until queue is element
    while (!q.isEmpty()) {
      // get the element from the queue
      const getQueueElement = q.dequeue();

      // passing the current vertex to callback funtion
      bfsTraversal.push(getQueueElement);

      // get the adjacent list for current vertex
      const get_List = this.AdjList.get(getQueueElement);

      // loop through the list and add the element to the
      // queue if it is not processed yet
      for (let i in get_List) {
        const neigh = get_List[i];

        if (!visited[neigh]) {
          visited[neigh] = true;
          q.enqueue(neigh);
        }
      }
    }
    return bfsTraversal;
  }
  bfs_depth(startingNode) {
    let bfsTraversal = [];

    // create a visited array
    let visited = [];
    for (let i = 0; i < this.noOfVertices; i++) visited[i] = false;

    // Create an object for queue
    let q = new Queue();

    // add the starting node to the queue
    visited[startingNode] = true;
    q.enqueue([startingNode, 0]);

    // loop until queue is element
    while (!q.isEmpty()) {
      // get the element from the queue
      const nodeDepth = q.dequeue();
      const getQueueElement = nodeDepth[0];

      // passing the current vertex to callback funtion
      bfsTraversal.push(nodeDepth);

      // get the adjacent list for current vertex
      const get_List = this.AdjList.get(getQueueElement);

      // loop through the list and add the element to the
      // queue if it is not processed yet
      for (let i in get_List) {
        let neigh = get_List[i];

        if (!visited[neigh]) {
          visited[neigh] = true;
          q.enqueue([neigh, nodeDepth[0] + 1]);
        }
      }
    }
    return bfsTraversal;
  }
}

let time_when_last_edge_added = 0;
let time_for_inserting_edge = [];

function myInit() {
  t0 = new Date().getTime();
  time_when_last_edge_added = t0;
  let nodes = [{ id: 0, name: my_edges[0][0], x: crd_x[0], y: crd_y[0] }];
  let links = [];
  graph.add(nodes, links);
  graph.graphData.nodes[0].fx = graph.graphData.nodes[0].x;
  graph.graphData.nodes[0].fy = graph.graphData.nodes[0].y;
  myGraph = new MyGraph(id_to_label.length);
  myGraph.addVertex(0);
}

let my_count = 0;
intervalTime = 5;

edge_distance_org = Object.assign({}, edge_distance);
function startAddingEdges() {
  if (my_count >= my_edges.length) {
    stopAddingEdges();
    let t1 = new Date().getTime();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    console.log(
      "Ideal edge length preservation:",
      ideal_edge_length_preservation(graph.graphData.links, edge_distance_org)
    );
    console.log(
      "Number of crossings:",
      linkCrossingsParam(graph.graphData.links).length
    );
    initForceDirected();
    return;
  }
  if (my_count >= steps_before_fix_position) {
    let prev_node_id = my_count - steps_before_fix_position;
    graph.graphData.nodes[prev_node_id].fx =
      graph.graphData.nodes[prev_node_id].x;
    graph.graphData.nodes[prev_node_id].fy =
      graph.graphData.nodes[prev_node_id].y;
  }

  let existingNode = graph.graphData.nodes[label_to_id[my_edges[my_count][0]]];
  let newId = label_to_id[my_edges[my_count][1]];
  let newNode = { id: newId, name: my_edges[my_count][1] };

  newNode.x = crd_x[newId];
  newNode.y = crd_y[newId];
  let newLink = { source: existingNode.id, target: newId };
  graph.add([newNode], [newLink]);
  graph.graphData.nodes[newId].fx = graph.graphData.nodes[newId].x;
  graph.graphData.nodes[newId].fy = graph.graphData.nodes[newId].y;
  myGraph.addVertex(newId);
  myGraph.addEdge(existingNode.id, newId);
  let cur_time = new Date().getTime();
  time_for_inserting_edge.push(cur_time - time_when_last_edge_added);
  time_when_last_edge_added = cur_time;
  my_count++;
  graph.simulation.alpha(1).restart();
}
function initForceDirected() {
  for (let i = 0; i <= my_edges.length; i++) {
    graph.graphData.nodes[i].fx = null;
    graph.graphData.nodes[i].fy = null;
  }
  {
    safeMode = true;
    node_to_links = {};
    for (let i = 0; i <= my_edges.length; i++) {
      node_to_links[i] = [];
    }
    for (let i = 0; i < graph.graphData.links.length; i++) {
      node_to_links[graph.graphData.links[i].source.id].push(
        graph.graphData.links[i]
      );
      node_to_links[graph.graphData.links[i].target.id].push(
        graph.graphData.links[i]
      );
    }
  }
  intervalTime = 500;
  startForceDirectedInterval = setInterval(startForceDirected, intervalTime);
}

function startForceDirected() {
  graph.simulation.alpha(1).restart();
}

let startForceDirectedInterval = setInterval(startForceDirected, intervalTime);

eps_movement = 2;
safeMode = false;
safeModeIter = 1;
locked = false;
if (my_edges.length <= 2000) {
  eps_movement = -1;
}

//difficult to export because of a lot of global variables
function stopForceDirected() {
  console.log("inside stopForceDirected");
  clearInterval(startForceDirectedInterval);
  if (safeMode) {
    locked = true;
    for (let i = 0; i <= my_edges.length; i++) {
      graph.graphData.nodes[i].fx = crd_x[i];
      graph.graphData.nodes[i].fy = crd_y[i];
    }
  }
  if (safeMode == false) {
    if (eps_movement != -1) {
      for (let i = 0; i <= my_edges.length; i++) {
        let x_diff = graph.graphData.nodes[i].x - crd_x[i];
        let y_diff = graph.graphData.nodes[i].y - crd_y[i];
        let node_movement = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
        if (node_movement > eps_movement) {
          let eps_fact = eps_movement / node_movement;
          graph.graphData.nodes[i].fx = crd_x[i] + x_diff * eps_fact;
          graph.graphData.nodes[i].fy = crd_y[i] + y_diff * eps_fact;
        }
      }
    } else {
      for (let i = 0; i <= my_edges.length; i++) {
        graph.graphData.nodes[i].fx = graph.graphData.nodes[i].x;
        graph.graphData.nodes[i].fy = graph.graphData.nodes[i].y;
      }
    }
    remove_existing_crossings();
  }

  const t1 = new Date().getTime();
  console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
  console.log(
    "Ideal edge length preservation:",
    ideal_edge_length_preservation(graph.graphData.links, edge_distance_org)
  );
  let n_crossings = linkCrossingsParam(graph.graphData.links).length;
  console.log("Number of crossings:", n_crossings);
  if (safeMode == false) {
    if (n_crossings == 0) {
      for (let i = 0; i <= my_edges.length; i++) {
        crd_x[i] = graph.graphData.nodes[i].x;
        crd_y[i] = graph.graphData.nodes[i].y;
      }
    }
  }
}

let addEdgeInterval = setInterval(startAddingEdges, intervalTime);

function stopAddingEdges() {
  clearInterval(addEdgeInterval);
}

myInit();
