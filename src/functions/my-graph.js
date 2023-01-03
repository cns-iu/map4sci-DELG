import { Queue } from './queue.js';


export class MyGraph {
  constructor(noOfVertices,graph) {
    this.noOfVertices = noOfVertices;
    this.AdjList = new Map();
    this.graph = graph
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
