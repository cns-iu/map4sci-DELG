import { removeExistingCrossings } from './remove-existing-crossings.js';
import { idealEdgeLengthPreservation } from './ideal-edge-length-preservation.js';
import { linkCrossingsParam } from './link-crossings-param.js';

export function stopForceDirected(
  graph,
  startForceDirectedInterval,
  edgeDistanceOrg
) {
  const myEdges = graph.data.myEdges;
  const crdX = graph.data.crdX;
  const crdY = graph.data.crdY;
  let locked = false;
  let epsMovement = 2;

  clearInterval(startForceDirectedInterval);
  if (graph.safeMode) {
    locked = true;
    for (let i = 0; i <= myEdges.length; i++) {
      graph.graphData.nodes[i].fx = crdX[i];
      graph.graphData.nodes[i].fy = crdY[i];
    }
  }
  if (myEdges.length <= 2000) {
    epsMovement = -1;
  }
  if (graph.safeMode == false) {
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
    removeExistingCrossings(graph);
  }

  console.log(
    'Ideal edge length preservation:',
    idealEdgeLengthPreservation(graph.graphData.links, edgeDistanceOrg)
  );
  const nCrossings = linkCrossingsParam(graph.graphData.links).length;
  console.log('Number of crossings:', nCrossings);
  if (graph.safeMode == false) {
    if (nCrossings == 0) {
      for (let i = 0; i <= myEdges.length; i++) {
        crdX[i] = graph.graphData.nodes[i].x;
        crdY[i] = graph.graphData.nodes[i].y;
      }
    }
  }
}
