import { idToLabel } from '../examples/input.js';
import { myEdges } from '../examples/input.js';
import { edgeDistance } from '../examples/input.js';
import { labelToId } from '../examples/input.js';
import { crdX } from '../examples/input.js';
import { crdY } from '../examples/input.js';
import * as fs from 'fs';

let arr = [idToLabel, myEdges, edgeDistance, labelToId, crdX, crdY];
let arr1 = [
  'idToLabel',
  'myEdges',
  'edgeDistance',
  'labelToId',
  'crdX',
  'crdY',
];

const hashMap = {};
for (let i = 0; i < arr.length; i++) {
  hashMap[arr1[i]] = arr[i];
}
fs.writeFileSync('./examples/input.json', JSON.stringify(hashMap));
