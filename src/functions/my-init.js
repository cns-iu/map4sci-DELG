import { MyGraph } from './my-graph.js';

export function myInit(graph) {
  const idToLabel = graph.data.idToLabel;
  const myEdges = graph.data.myEdges;
  const crdX = graph.data.crdX;
  const crdY = graph.data.crdY;
  const nodes = [{ id: 0, name: myEdges[0][0], x: crdX[0], y: crdY[0] }];
  const links = [];
  graph.add(nodes, links);
  graph.graphData.nodes[0].fx = graph.graphData.nodes[0].x;
  graph.graphData.nodes[0].fy = graph.graphData.nodes[0].y;
  graph.myGraph = new MyGraph(idToLabel.length, graph);
  graph.myGraph.addVertex(0);
}
