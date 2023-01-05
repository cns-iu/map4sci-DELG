import * as fs from 'fs';

export function processJson(data) {
  // console.log(data[0].children[3]);
  const idToLabel = {};
  const labelToId = {};
  let myEdges = [];
  const edgeDistance = {};
  const collectiveData = {};
  const crdX = {};
  const crdY = {};

  const children = data[0].children
    .filter((e) => e.type === 'edge_stmt')
    .map((e) => ({
      parent: e.edge_list[0].id,
      child: e.edge_list[1].id,
      weight: parseInt(e.attr_list[0].eq, 10),
    }))
    .reduce((acc, edge) => {
      acc[edge.parent] = acc[edge.parent] || {};
      acc[edge.parent][edge.child] = edge.weight;
      return acc;
    }, {});

  const nodes = data[0].children
    .filter((e) => e.type === 'node_stmt')
    .map((n) => ({
      id: n.node_id.id + '',
      label: n.attr_list[0].eq,
      weight: parseInt(n.attr_list.find((a) => a.id === 'weight')?.eq, 10) ?? 0,
    }))
    .filter((n) => n.id in children)
    .sort((a, b) => b.weight - a.weight);

  const startNodeId = nodes[0].id;

  const seen = new Set();
  let currentId = 0;
  const bfsQueue = [startNodeId];
  while (bfsQueue.length > 0) {
    //changed to shift
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
      if (!seen.has(edgeId)) {
        myEdges.push([parent, child]);
        edgeDistance[myEdges.length - 1] = children[parent][child] || 0;
        bfsQueue.push(child);
        seen.add(edgeId);
      }
    }
  }

  Object.keys(idToLabel).forEach((element) => {
    crdX[element] = Math.random() * (10000 + 10000) - 10000;
    crdY[element] = Math.random() * (10000 + 10000) - 10000;
  });
  collectiveData['idToLabel'] = idToLabel;
  collectiveData['myEdges'] = myEdges;
  collectiveData['edgeDistance'] = edgeDistance;
  collectiveData['crdX'] = crdX;
  collectiveData['crdY'] = crdY;
  collectiveData['labelToId'] = labelToId;

  let experimentData = `./examples/experimentData.json`;
  fs.writeFileSync(
    `${experimentData}`,
    JSON.stringify(collectiveData, null, 2),
    {
      encoding: 'utf8',
    }
  );
  return collectiveData;
}
