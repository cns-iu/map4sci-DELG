import { MyGraph } from "./my-graph.js";
import { idToLabel } from '../cli.js';
import { myEdges } from '../cli.js';
import { crdX } from '../cli.js';
import { crdY } from '../cli.js';

export function myInit(graph, t0) {
    let timeWhenLastEdgeAdded = 0;
    t0 = new Date().getTime();
    timeWhenLastEdgeAdded = t0;
    const nodes = [{ id: 0, name: myEdges[0][0], x: crdX[0], y: crdY[0] }];
    const links = [];
    graph.add(nodes, links);
    graph.graphData.nodes[0].fx = graph.graphData.nodes[0].x;
    graph.graphData.nodes[0].fy = graph.graphData.nodes[0].y;
    graph.myGraph = new MyGraph(idToLabel.length, graph);
    graph.myGraph.addVertex(0);
  }