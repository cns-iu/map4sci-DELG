export function initForceDirected(graph, startForceDirectedInterval) {
  const myEdges = graph.data.myEdges;
  for (let i = 0; i <= myEdges.length; i++) {
    graph.graphData.nodes[i].fx = null;
    graph.graphData.nodes[i].fy = null;
  }
  {
    graph.changeSafeMode(true);

    for (let i = 0; i <= myEdges.length; i++) {
      graph.nodeToLinks[i] = [];
    }
    for (let i = 0; i < graph.graphData.links.length; i++) {
      graph.nodeToLinks[graph.graphData.links[i].source.id].push(
        graph.graphData.links[i]
      );
      graph.nodeToLinks[graph.graphData.links[i].target.id].push(
        graph.graphData.links[i]
      );
    }
  }
  clearInterval(startForceDirectedInterval);
  startForceDirectedInterval = graph.intervalId = setInterval(() => {
    graph.restartSimulation();
  }, 500);
}
