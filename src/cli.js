import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import { wait } from './functions/wait.js';

if (process.argv.length < 4 || process.argv.length > 5) {
  console.error(`${process.argv[0]}: <input file> <output file>`);
  process.exit(-1);
}

async function main(inputFile, outputFile, simTime) {
  const INPUT_FILE = JSON.parse(
    fs.readFileSync(inputFile, { encoding: 'utf8', flag: 'r' })
  );
  const SIMULATION_TIME =
  process.argv.length > 4 ? parseInt(simTime, 10) : 20000;
  console.log(new Date());
  const graph = new D3ForceGraph(500, 500, INPUT_FILE);
  graph.init();
  myInit(graph);
  graph.start();
  await wait(SIMULATION_TIME);
  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${c.id}`)
    .join('\n');

  fs.writeFileSync(outputFile, coordinates);
}

main(process.argv[2], process.argv[3], process.argv[4]);
