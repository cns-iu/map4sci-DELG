import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import { wait } from './functions/wait.js';

if (process.argv.length < 4 || process.argv.length > 5) {
  console.error(`${process.argv[0]}: <input file> <output file>`);
  process.exit(-1);
}

const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
);

const OUTPUT_FILE = process.argv[3];
const SIMULATION_TIME =
  process.argv.length > 4 ? parseInt(process.argv[4], 10) : 20000;

async function main(inputFile, outputFile, simTime) {
  console.log(new Date());
  const graph = new D3ForceGraph(500, 500, inputFile);
  graph.init();
  myInit(graph);
  graph.start();
  await wait(simTime);
  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${c.id}`)
    .join('\n');

  fs.writeFileSync(outputFile, coordinates);
}

main(INPUT_FILE, OUTPUT_FILE, SIMULATION_TIME);
