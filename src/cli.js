import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import parse from 'dotparser';
import { processJson } from './functions/processJson.js';

if (process.argv.length !== 4) {
  console.error(`${process.argv[0]}: <input file> <output file>`);
  process.exit(-1);
}

async function main(inputFile, outputFile) {
  const data = parse(
    fs.readFileSync(inputFile, { encoding: 'utf8', flag: 'r' })
  );
  const convertedData = processJson(data);

  console.log('Starting DELG algorithm...', new Date());
  const graph = new D3ForceGraph(500, 500, convertedData);
  graph.init();
  myInit(graph);
  await graph.start();
  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${c.id}`)
    .join('\n');

  fs.writeFileSync(outputFile, coordinates);
}

main(process.argv[2], process.argv[3]);
