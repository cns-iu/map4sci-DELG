import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import parse from 'dotparser';
import { processDot } from './functions/processDot.js';

if (process.argv.length !== 4) {
  console.error(`${process.argv[0]}: <input file> <output file>`);
  process.exit(-1);
}

/**
 *
 * @param {Dot formatted input file} inputFile
 * @param {.tsv output file} outputFile
 */
async function main(inputFile, outputFile) {
  const data = parse(
    fs.readFileSync(inputFile, { encoding: 'utf8', flag: 'r' })
  );
  const { collectiveData, cy } = await processDot(data);

  console.log('Starting DELG algorithm...', new Date());
  const graph = new D3ForceGraph(500, 500, collectiveData);
  graph.init();
  myInit(graph);
  await graph.start();
  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${c.id}`)
    .join('\n');

  for (const { id, x, y } of graph.getJSON()) {
    cy.$id(id.toString()).position({ x, y });
  }

  const networkContent = cy.json();
  fs.writeFileSync('test-output.cyjs', JSON.stringify(networkContent, null, 2));
  fs.writeFileSync(outputFile, coordinates);
}

main(process.argv[2], process.argv[3]);
