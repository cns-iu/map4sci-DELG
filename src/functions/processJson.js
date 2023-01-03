import * as fs from 'fs';

export function processJson(data) {
  console.log(data[0].children[3]);
  const idToLabel = {};
  const labelToId = {};
  let myEdges = [];
  const edgeDistance = {};
  const collectiveData = {};
  const crdX = {};
  const crdY = {};
  data[0].children.forEach((element) => {
    if (element.type == 'node_stmt') {
      idToLabel[element.node_id.id] = element.attr_list[0].eq;
      //   console.log(element.attr_list)
      // labelToId[element.attr_list[0].eq] = element.node_id.id;
      edgeDistance[element.node_id.id] = element.attr_list[2].eq;
    }
  });
  data[0].children.forEach((element) => {
    let tempArray = [];
    if (element.type == 'edge_stmt') {
      element.edge_list.forEach((element) => {
        tempArray.push(idToLabel[element.id]);
      });
    }
    if (tempArray.length != 0) {
      myEdges.push(tempArray);
    }
  });

  Object.keys(idToLabel).forEach((element) => {
    crdX[element] = Math.random() * (10000 + 10000) - 10000;
    crdY[element] = Math.random() * (10000 + 10000) - 10000;
  });
  collectiveData['idToLabel'] = idToLabel;
  collectiveData['myEdges'] = myEdges;
  collectiveData['edgeDistance'] = edgeDistance;
  collectiveData['crdX'] = crdX;
  collectiveData['crdY'] = crdY;
  for (let key in idToLabel) {
    labelToId[idToLabel[key]] = key;
  }
  collectiveData['labelToId'] = labelToId;

  let experimentData = `./examples/experimentData.json`;
  fs.writeFileSync(
    `${experimentData}`,
    JSON.stringify(collectiveData, null, 2),
    {
      encoding: 'utf8',
    }
  );
  // console.log(edgeDistance);
  return collectiveData;
}
