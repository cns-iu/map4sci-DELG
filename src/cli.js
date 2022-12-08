import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import { startAddingEdges } from './functions/start-adding-edges.js';
import { startForceDirected } from './functions/start-force-directed.js';

export const nodeToLinks = {};
export let safeMode = null;

// if (process.argv.length >= 4) {
//   console.error(`${process.argv[0]}: <input file> <output file>`);
//   process.exit(-1);
// }

export const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
);
export const OUTPUT_FILE = process.argv[3];
const SIMULATION_TIME =
  process.argv > 4 ? parseInt(process.argv[4], 10) || 20000 : 20000;

export let startForceDirectedInterval = setInterval(() => {
  startForceDirected(graph);
}, 5);

export let addEdgeInterval = setInterval(() => {
  const edgeDistanceOrg = Object.assign({}, INPUT_FILE.edgeDistance);
  let timeWhenLastEdgeAdded = 0;
  startAddingEdges(timeWhenLastEdgeAdded, edgeDistanceOrg);
}, 0);

export function changeSafeMode(newValue) {
  safeMode = newValue;
}
export const graph = new D3ForceGraph(500, 500);
//after init returnning grap.toJson, Must return object and then writefile sync

async function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function main() {
  graph.init();
  myInit(graph);
  await wait(SIMULATION_TIME);
  graph.stop();
  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${c.id}`)
    .join('\n');

  // tsv == tab-separated values format
  fs.writeFileSync(OUTPUT_FILE, coordinates);
  process.exit();
}
main();
