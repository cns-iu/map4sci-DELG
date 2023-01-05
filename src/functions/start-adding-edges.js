import { idealEdgeLengthPreservation } from './ideal-edge-length-preservation.js';
import { linkCrossingsParam } from './link-crossings-param.js';
import { initForceDirected } from './init-force-directed.js';

export function startAddingEdges(graph) {
  let myCount = 0;
  let lastProgress = -1;
  const addEdgeInterval = setInterval(() => {
    startAddingEdgesFun();
  }, 5);

  function startAddingEdgesFun() {
    const labelToId = graph.data.labelToId;
    const myEdges = graph.data.myEdges;
    const crdX = graph.data.crdX;
    const crdY = graph.data.crdY;

    const progress = Math.floor((myCount / myEdges.length) * 100);
    if (progress !== lastProgress && progress % 5 === 0) {
      console.log(`Edges loaded: ${progress}%`, new Date());
      lastProgress = progress;
    }

    const stepsBeforeFixPosition = 50000;
    if (myCount >= myEdges.length) {
      // clearing the interval or previously called stop adding
      clearInterval(addEdgeInterval);
      console.log(
        'Ideal edge length preservation:',
        idealEdgeLengthPreservation(
          graph.graphData.links,
          graph.edgeDistanceOrg
        )
      );
      console.log(
        'Number of crossings:',
        linkCrossingsParam(graph.graphData.links).length
      );

      console.log('Initializing force directed graph...', new Date());
      initForceDirected(graph, graph.intervalId);
      return;
    }
    if (myCount >= stepsBeforeFixPosition) {
      const prevNodeId = myCount - stepsBeforeFixPosition;
      graph.graphData.nodes[prevNodeId].fx =
        graph.graphData.nodes[prevNodeId].x;
      graph.graphData.nodes[prevNodeId].fy =
        graph.graphData.nodes[prevNodeId].y;
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
    graph.myGraph.addVertex(newId);
    graph.myGraph.addEdge(existingNode.id, newId);
    myCount++;
    graph.simulation.alpha(1).restart();
  }

  return addEdgeInterval;
}
