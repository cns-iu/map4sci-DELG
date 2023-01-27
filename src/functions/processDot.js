import * as fs from 'fs';
import cytoscape from 'cytoscape';
import { cytoscapeLayout } from './cytoscape-layout.js';

/**
 *
 * @param {convereted dot format data into JSON} data
 * @returns Processed data that is suitable for the network to process
 */
export async function processDot(data) {
  const idToLabel = {};
  const labelToId = {};
  let myEdges = [];
  const edgeDistance = {};
  const collectiveData = {};
  const crdX = {};
  const crdY = {};
  let minWeight = Number.MAX_SAFE_INTEGER;
  let maxWeight = Number.MIN_SAFE_INTEGER;

  const normalizeWeight = (weight) =>
    50 + ((weight - minWeight) / (maxWeight - minWeight)) * 300;

  const children = data[0].children
    .filter((e) => e.type === 'edge_stmt')
    .map((e) => ({
      parent: e.edge_list[0].id + '',
      child: e.edge_list[1].id + '',
      weight: parseFloat(e.attr_list[0].eq),
    }))
    .reduce((acc, edge) => {
      acc[edge.parent] = acc[edge.parent] || {};
      acc[edge.parent][edge.child] = edge.weight;
      acc[edge.child] = acc[edge.child] || {};
      acc[edge.child][edge.parent] = edge.weight;
      minWeight = Math.min(edge.weight, minWeight);
      maxWeight = Math.max(edge.weight, maxWeight);
      return acc;
    }, {});

  const nodes = data[0].children
    .filter((e) => e.type === 'node_stmt')
    .map((n) => ({
      id: n.node_id.id + '',
      label: n.attr_list[0].eq,
      weight: parseFloat(n.attr_list.find((a) => a.id === 'weight')?.eq) ?? 0,
      position: n.attr_list
        .find((a) => a.id === 'pos')
        .eq.split(',')
        .map(parseFloat),
    }))
    .filter((n) => n.id in children)
    .sort((a, b) => b.weight - a.weight);

  const startNodeId = nodes[0].id + '';

  //implementing bfs queue
  const seen = new Set();
  let currentId = 0;
  const bfsQueue = [startNodeId];
  while (bfsQueue.length > 0) {
    //removing the first child of previous parent and making it the new parent
    const parent = bfsQueue.shift();
    if (labelToId[parent] === undefined) {
      const id = currentId++;
      idToLabel[id] = parent;
      labelToId[parent] = id;
    }

    for (const child of Object.keys(children[parent] || {})) {
      if (labelToId[child] === undefined) {
        const id = currentId++;
        idToLabel[id] = child;
        labelToId[child] = id;
      }

      const edgeId = `${parent} -- ${child}`;
      const altEdgeId = `${child} -- ${parent}`;
      if (!seen.has(edgeId) && !seen.has(altEdgeId)) {
        myEdges.push([parent, child]);
        edgeDistance[myEdges.length - 1] = normalizeWeight(
          children[parent][child] || 0
        );
        bfsQueue.push(child);
        seen.add(edgeId);
        seen.add(altEdgeId);
      }
    }
  }

  console.log(
    data[0].children.filter((e) => e.type === 'edge_stmt').length,
    '=>',
    myEdges.length
  );

  // Object.keys(idToLabel).forEach((element) => {
  //   crdX[element] = Math.random() * (10000 + 10000) - 10000;
  //   crdY[element] = Math.random() * (10000 + 10000) - 10000;
  // });

  // Object.keys(idToLabel).forEach((node, i) => {
  //   cy.add({
  //     group: 'nodes',
  //     data: {
  //       id: node.toString(),
  //       name: idToLabel[node],
  //     },
  //     position: { x: crdX[node], y: crdY[node] },
  //   });
  // });

  // myEdges.forEach((edge) => {
  //   cy.add({
  //     group: 'edges',
  //     data: {
  //       id: `${labelToId[edge[0]]}-${labelToId[edge[1]]}`.toString(),
  //       source: labelToId[edge[0]],
  //       target: labelToId[edge[1]],
  //     },
  //   });
  // });

  nodes.forEach((node, i) => {
    crdX[i] = node.position[0];
    crdY[i] = node.position[1];
  });

  //storing all the data processed into an Object
  collectiveData['idToLabel'] = idToLabel;
  collectiveData['myEdges'] = myEdges;
  collectiveData['edgeDistance'] = edgeDistance;
  collectiveData['crdX'] = crdX;
  collectiveData['crdY'] = crdY;
  collectiveData['labelToId'] = labelToId;

  let experimentData = `./examples/experimentData.json`;

  const cy = await cytoscapeLayout(collectiveData);

  //  Object.keys(idToLabel).forEach((node) => {
  //   let x = cy.$id(node.toString()).position('x');
  //   let y = cy.$id(node.toString()).position('y');
  //   crdX[node] = x;
  //   crdY[node] = y;
  // });

  //writing the processed data into a file
  fs.writeFileSync(
    `${experimentData}`,
    JSON.stringify(collectiveData, null, 2),
    {
      encoding: 'utf8',
    }
  );
  return { collectiveData, cy };
}
