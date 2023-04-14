import * as fs from 'fs';
import { D3ForceGraph } from './functions/d3-force-graph.js';
import { myInit } from './functions/my-init.js';
import parse from 'dotparser';
import { processDot } from './functions/processDot.js';
import { cytoscapeLayout } from './functions/cytoscape-layout.js';

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
  const data = JSON.parse(fs.readFileSync(inputFile));
  console.log('Starting DELG algorithm...', new Date());
  const graph = new D3ForceGraph(500, 500, data);
  graph.init();
  myInit(graph);
  await graph.start();

  for (const { id, x, y } of graph.getJSON()) {
    data.crdX[id] = x;
    data.crdY[id] = y;
  }

  const coordinates = graph
    .getJSON()
    .map((c) => `${c.x}\t${c.y}\t${data.idToLabel[c.id]}`)
    .join('\n');

  if (data.myEdges.length < 1000) {
    const cy = await cytoscapeLayout(data);
    for (const { id, x, y } of graph.getJSON()) {
      cy.$id(id.toString()).position({ x, y });
    }
    const networkContent = cy.json();
    fs.writeFileSync(
      'test-output.cyjs',
      JSON.stringify(networkContent, null, 2)
    );
  }

  fs.writeFileSync(outputFile, coordinates);
}

main(process.argv[2], process.argv[3]);
