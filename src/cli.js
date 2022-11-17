import { myInit } from './functions/my-init.js';
import { startForceDirected } from './functions/start-force-directed.js';
import { startAddingEdges } from './functions/start-adding-edges.js';
import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';

export const nodeToLinks = {};
export let safeMode = null;

if (process.argv.length !== 4) {
  console.error(`${process.argv[0]}: <input file> <output file>`);
  process.exit(-1);
}

export const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
  );
  export const OUTPUT_FILE = process.argv[3];
  
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
  graph.init();

myInit(graph);
