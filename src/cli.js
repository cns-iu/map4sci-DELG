import { removeExistingCrossings } from './functions/remove-existing-crossings.js';
import { idealEdgeLengthPreservation } from './functions/ideal-edge-length-preservation.js';
import { linkCrossingsParam } from './functions/link-crossings-param.js';
import { hasLinkCrossingsWithInputLink } from './functions/has-link-crossings-with-input-link.js';
import * as fs from 'fs';
import * as d3 from 'd3';

let intervalTime = 5;
const stepsBeforeFixPosition = 50000;
let epsMovement = null;
let safeMode = null;
let safeModeIter = null;
let locked = null;
let t0 = null;
let myGraph = null;
const nodeToLinks = {};

const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
);
const OUTPUT_FILE = process.argv[3];

const idToLabel = INPUT_FILE.idToLabel;
const myEdges = INPUT_FILE.myEdges;
const edgeDistance = INPUT_FILE.edgeDistance;
const labelToId = INPUT_FILE.labelToId;
const crdX = INPUT_FILE.crdX;
const crdY = INPUT_FILE.crdY;

class D3ForceGraph {
  constructor(width, height) {
    let t = this;

    t.width = width;
    t.height = height;
    t.center = { x: t.width / 2, y: t.height / 2 };

    t.updateRefCount = 0;
  }

  init() {
    const t = this;

    t.graphData = { nodes: [], links: [] };

    const simulation = t.initSimulation();
    t.simulation = simulation;
    t.update(t, simulation);
  }

  initSimulation() {
    const t = this;

    const result = d3
      .forceSimulation()
      .velocityDecay(0.55)
      .force(
        'link',
        d3
          .forceLink()
          .distance(function (d) {
            return edgeDistance[d.index];
          })
          .id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-10).distanceMin(10000))
      .force('collide', d3.forceCollide(100))
      .force('center', d3.forceCenter(t.center.x, t.center.y));

    return result;
  }
  update(t, simulation) {
    const nodes = t.graphData.nodes;
    const links = t.graphData.links;

    simulation.nodes(nodes).on('end', () => t.handleEnd());

    simulation.on('tick', handleTicked);

    simulation.force('link').links(links);

    function handleTicked() {
      if (safeMode) {
        if (!locked) {
          if (safeModeIter == 500) {
            stopForceDirected();
            graph.simulation.stop();
            const coordinates = JSON.stringify({ crd_x: crdX, crd_y: crdY });
            fs.writeFileSync(OUTPUT_FILE, coordinates);
            return;
          }
          locked = true;
          console.log('Safe mode iteration:', safeModeIter);
          safeModeIter = safeModeIter + 1;

          const crdXt = {};
          const crdYt = {};
          for (let i = 0; i <= myEdges.length; i++) {
            crdXt[i] = graph.graphData.nodes[i].x;
            crdYt[i] = graph.graphData.nodes[i].y;
          }
          for (let i = 0; i <= myEdges.length; i++) {
            const prevX = crdX[i];
            const prevY = crdY[i];
            crdX[i] = crdXt[i];
            crdY[i] = crdYt[i];
            {
              let introducesCrossing = false;
              for (let j = 0; j < nodeToLinks[i].length; j++) {
                const link = nodeToLinks[i][j];
                if (hasLinkCrossingsWithInputLink(link, crdX, crdY)) {
                  introducesCrossing = true;
                  break;
                }
              }
              if (introducesCrossing) {
                crdX[i] = prevX;
                crdY[i] = prevY;
              }
            }
          }
          if (safeModeIter % 100 == 0) {
            const crdXlog = {};
            const crdYlog = {};
            for (let i = 0; i <= myEdges.length; i++) {
              crdXlog[i] = crdX[i];
              crdYlog[i] = crdY[i];
            }
            console.log(crdXlog, crdYlog);
          }
          for (let i = 0; i <= myEdges.length; i++) {
            graph.graphData.nodes[i].x = crdX[i];
            graph.graphData.nodes[i].y = crdY[i];
          }
          locked = false;
        }
      }
    }
  }

  add(nodesToAdd, linksToAdd) {
    const t = this;

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
  handleEnd() {
    console.log('end');
  }
}

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
    if (this.isEmpty()) return 'Underflow';
    return this.items.shift();
  }

  // front function
  front() {
    // returns the Front element of
    // the queue without removing it.
    if (this.isEmpty()) return 'No elements in Queue';
    return this.items[0];
  }

  // isEmpty function
  isEmpty() {
    // return true if the queue is empty.
    return this.items.length == 0;
  }

  // printQueue function
  printQueue() {
    let str = '';
    for (let i = 0; i < this.items.length; i++) str += this.items[i] + ' ';
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
    if (typeof arr == 'undefined') {
      graph.simulation.stop();
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === w) {
        arr.splice(i, 1);
      }
    }
    arr = this.AdjList.get(w);
    if (typeof arr == 'undefined') {
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
    const getKeys = this.AdjList.keys();

    // iterate over the vertices
    for (let i of getKeys) {
      // great the corresponding adjacency list
      // for the vertex
      const getValues = this.AdjList.get(i);
      let conc = '';

      // iterate over the adjacency list
      // concatenate the values into a string
      for (let j of getValues) conc += j + ' ';

      // print the vertex and its adjacency list
      console.log(i + ' -> ' + conc);
    }
  }

  // function to performs BFS
  bfs(startingNode) {
    const bfsTraversal = [];

    // create a visited array
    const visited = [];
    for (let i = 0; i < this.noOfVertices; i++) visited[i] = false;

    // Create an object for queue
    const q = new Queue();

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
      const getList = this.AdjList.get(getQueueElement);

      // loop through the list and add the element to the
      // queue if it is not processed yet
      for (let i in getList) {
        const neigh = getList[i];

        if (!visited[neigh]) {
          visited[neigh] = true;
          q.enqueue(neigh);
        }
      }
    }
    return bfsTraversal;
  }
  bfsDepth(startingNode) {
    const bfsTraversal = [];

    // create a visited array
    const visited = [];
    for (let i = 0; i < this.noOfVertices; i++) visited[i] = false;

    // Create an object for queue
    const q = new Queue();

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
      const getList = this.AdjList.get(getQueueElement);

      // loop through the list and add the element to the
      // queue if it is not processed yet
      for (let i in getList) {
        const neigh = getList[i];

        if (!visited[neigh]) {
          visited[neigh] = true;
          q.enqueue([neigh, nodeDepth[0] + 1]);
        }
      }
    }
    return bfsTraversal;
  }
}

let timeWhenLastEdgeAdded = 0;
const timeForInsertingEdge = [];

function myInit() {
  t0 = new Date().getTime();
  timeWhenLastEdgeAdded = t0;
  const nodes = [{ id: 0, name: myEdges[0][0], x: crdX[0], y: crdY[0] }];
  const links = [];
  graph.add(nodes, links);
  graph.graphData.nodes[0].fx = graph.graphData.nodes[0].x;
  graph.graphData.nodes[0].fy = graph.graphData.nodes[0].y;
  myGraph = new MyGraph(idToLabel.length);
  myGraph.addVertex(0);
}

let myCount = 0;
intervalTime = 5;

const edgeDistanceOrg = Object.assign({}, edgeDistance);

function startAddingEdges() {
  if (myCount >= myEdges.length) {
    stopAddingEdges();
    const t1 = new Date().getTime();
    console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
    console.log(
      'Ideal edge length preservation:',
      idealEdgeLengthPreservation(graph.graphData.links, edgeDistanceOrg)
    );
    console.log(
      'Number of crossings:',
      linkCrossingsParam(graph.graphData.links).length
    );
    initForceDirected();
    return;
  }
  if (myCount >= stepsBeforeFixPosition) {
    const prevNodeId = myCount - stepsBeforeFixPosition;
    graph.graphData.nodes[prevNodeId].fx = graph.graphData.nodes[prevNodeId].x;
    graph.graphData.nodes[prevNodeId].fy = graph.graphData.nodes[prevNodeId].y;
  }

  const existingNode = graph.graphData.nodes[labelToId[myEdges[myCount][0]]];
  const newId = labelToId[myEdges[myCount][1]];
  const newNode = { id: newId, name: myEdges[myCount][1] };

  newNode.x = crdX[newId];
  newNode.y = crdY[newId];
  const newLink = { source: existingNode.id, target: newId };
  graph.add([newNode], [newLink]);
  graph.graphData.nodes[newId].fx = graph.graphData.nodes[newId].x;
  graph.graphData.nodes[newId].fy = graph.graphData.nodes[newId].y;
  myGraph.addVertex(newId);
  myGraph.addEdge(existingNode.id, newId);
  let curTime = new Date().getTime();
  timeForInsertingEdge.push(curTime - timeWhenLastEdgeAdded);
  timeWhenLastEdgeAdded = curTime;
  myCount++;
  graph.simulation.alpha(1).restart();
}

function initForceDirected() {
  for (let i = 0; i <= myEdges.length; i++) {
    graph.graphData.nodes[i].fx = null;
    graph.graphData.nodes[i].fy = null;
  }
  {
    safeMode = true;
    for (let i = 0; i <= myEdges.length; i++) {
      nodeToLinks[i] = [];
    }
    for (let i = 0; i < graph.graphData.links.length; i++) {
      nodeToLinks[graph.graphData.links[i].source.id].push(
        graph.graphData.links[i]
      );
      nodeToLinks[graph.graphData.links[i].target.id].push(
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

epsMovement = 2;
safeMode = false;
safeModeIter = 1;
locked = false;
if (myEdges.length <= 2000) {
  epsMovement = -1;
}

function stopForceDirected() {
  console.log('inside stopForceDirected');
  clearInterval(startForceDirectedInterval);
  if (safeMode) {
    locked = true;
    for (let i = 0; i <= myEdges.length; i++) {
      graph.graphData.nodes[i].fx = crdX[i];
      graph.graphData.nodes[i].fy = crdY[i];
    }
  }
  if (safeMode == false) {
    if (epsMovement != -1) {
      for (let i = 0; i <= myEdges.length; i++) {
        const xDiff = graph.graphData.nodes[i].x - crdX[i];
        const yDiff = graph.graphData.nodes[i].y - crdY[i];
        const nodeMovement = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        if (nodeMovement > epsMovement) {
          const epsFact = epsMovement / nodeMovement;
          graph.graphData.nodes[i].fx = crdX[i] + xDiff * epsFact;
          graph.graphData.nodes[i].fy = crdY[i] + yDiff * epsFact;
        }
      }
    } else {
      for (let i = 0; i <= myEdges.length; i++) {
        graph.graphData.nodes[i].fx = graph.graphData.nodes[i].x;
        graph.graphData.nodes[i].fy = graph.graphData.nodes[i].y;
      }
    }
    removeExistingCrossings();
  }

  const t1 = new Date().getTime();
  console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
  console.log(
    'Ideal edge length preservation:',
    idealEdgeLengthPreservation(graph.graphData.links, edgeDistanceOrg)
  );
  const nCrossings = linkCrossingsParam(graph.graphData.links).length;
  console.log('Number of crossings:', nCrossings);
  if (safeMode == false) {
    if (nCrossings == 0) {
      for (let i = 0; i <= myEdges.length; i++) {
        crdX[i] = graph.graphData.nodes[i].x;
        crdY[i] = graph.graphData.nodes[i].y;
      }
    }
  }
  process.exit();
}

let addEdgeInterval = setInterval(startAddingEdges, intervalTime);

function stopAddingEdges() {
  clearInterval(addEdgeInterval);
}

myInit();
