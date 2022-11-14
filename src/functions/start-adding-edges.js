import { idealEdgeLengthPreservation } from './ideal-edge-length-preservation.js';
import { linkCrossingsParam } from './link-crossings-param.js';
import { initForceDirected } from '../initForceDirected.js';
import { graph, labelToId } from '../cli.js';
import { myEdges } from '../cli.js';
import { crdX } from '../cli.js';
import { crdY } from '../cli.js';
import { addEdgeInterval } from '../cli.js';
import { startForceDirectedInterval } from '../cli.js';

let myCount = 0;

export function startAddingEdges(
  timeWhenLastEdgeAdded,
  edgeDistanceOrg
) {
  const timeForInsertingEdge = [];
  const stepsBeforeFixPosition = 50000;
  if (myCount >= myEdges.length) {
    stopAddingEdges();
    const t1 = new Date().getTime();
    //   console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
    console.log(
      'Ideal edge length preservation:',
      idealEdgeLengthPreservation(graph.graphData.links, edgeDistanceOrg)
    );
    console.log(
      'Number of crossings:',
      linkCrossingsParam(graph.graphData.links).length
    );
    initForceDirected(graph,startForceDirectedInterval);
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
  graph.myGraph.addVertex(newId);
  graph.myGraph.addEdge(existingNode.id, newId);
  let curTime = new Date().getTime();
  timeForInsertingEdge.push(curTime - timeWhenLastEdgeAdded);
  timeWhenLastEdgeAdded = curTime;
  myCount++;
  graph.simulation.alpha(1).restart();
}

function stopAddingEdges() {
  clearInterval(addEdgeInterval);
}
