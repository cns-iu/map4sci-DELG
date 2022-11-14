import { myInit } from './functions/my-init.js';
import { startForceDirected } from './functions/start-force-directed.js';
import { startAddingEdges } from './functions/start-adding-edges.js';
import * as fs from 'fs';
import { D3ForceGraph } from './D3ForceGraph.js';

//being used by both class and function
export const nodeToLinks = {};
export let safeMode = null;

export function changeSafeMode(newValue) {
  safeMode = newValue;
}

export let t0 = null;

const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
);
export const OUTPUT_FILE = process.argv[3];



export let startForceDirectedInterval = setInterval(() => {
  startForceDirected(graph);
}, 5);

export const idToLabel = INPUT_FILE.idToLabel;
export const myEdges = INPUT_FILE.myEdges;
export const edgeDistance = INPUT_FILE.edgeDistance;
export const labelToId = INPUT_FILE.labelToId;
export const crdX = INPUT_FILE.crdX;
export const crdY = INPUT_FILE.crdY;

export let addEdgeInterval = setInterval(() => {
  const edgeDistanceOrg = Object.assign({}, edgeDistance);
  let timeWhenLastEdgeAdded = 0;
  startAddingEdges(
    timeWhenLastEdgeAdded,
    edgeDistanceOrg,
  );
}, 5);

export const graph = new D3ForceGraph(500, 500);
graph.init();

myInit(graph, t0);


// export const edgeDistanceOrg = Object.assign({}, edgeDistance);
//   let timeWhenLastEdgeAdded = 0;
//   startAddingEdges(
//     timeWhenLastEdgeAdded,
//   );