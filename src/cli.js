import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import { wait } from './functions/wait.js';
import { startAddingEdges } from './functions/start-adding-edges.js';

if (process.argv.length < 4 || process.argv.length > 5) {
  console.error(`${process.argv[0]}: <input file> <output file>`);
  process.exit(-1);
}

const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
);

const OUTPUT_FILE = process.argv[3];
const SIMULATION_TIME =
  process.argv > 4 ? parseInt(process.argv[4], 10) || 20000 : 20000;

export const graph = new D3ForceGraph(500, 500, INPUT_FILE);

async function main() {
  console.log(new Date());
  graph.init();
  myInit(graph);
  await wait(SIMULATION_TIME);
  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${c.id}`)
    .join('\n');

  fs.writeFileSync(OUTPUT_FILE, coordinates);
}
main();
