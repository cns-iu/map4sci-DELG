import { startForceDirected } from './start-force-directed.js';
import { changeSafeMode, INPUT_FILE, nodeToLinks } from '../cli.js';

export function initForceDirected(graph, startForceDirectedInterval) {
  const myEdges = INPUT_FILE.myEdges;
  for (let i = 0; i <= myEdges.length; i++) {
    graph.graphData.nodes[i].fx = null;
    graph.graphData.nodes[i].fy = null;
  }
  {
    changeSafeMode(true);
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
  startForceDirectedInterval = setInterval(() => {
    startForceDirected(graph);
  }, 500);
}
