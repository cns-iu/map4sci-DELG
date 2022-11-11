import { linkCrossingsParam } from './link-crossings-param.js';
import { getChildNodes } from './get-child-nodes.js';
import { removeAllCrossingsUsingRotation } from './remove-all-crossings-using-rotation.js';
import { updateDrawing } from './update-drawing.js';

export function removeExistingCrossings() {
  const res = linkCrossingsParam(graph.graphData.links);
  let oldLength = 0;
  while (res.length > 0) {
    for (let crossingIndex = 0; crossingIndex < res.length; crossingIndex++) {
      const crossingPair = res[crossingIndex];
      let arr = getChildNodes(crossingPair[0], crossingPair[1]);
      const comp1 = arr[0];
      crossingPair[0] = arr[1];
      arr = getChildNodes(crossingPair[1], crossingPair[0]);
      const comp2 = arr[0];
      crossingPair[1] = arr[1];
      let newCoord = null;
      if (comp1.length < comp2.length) {
        const oldX = crossingPair[0][0].x;
        const oldY = crossingPair[0][0].y;
        newCoord = removeAllCrossingsUsingRotation(
          crossingPair[0][1],
          crossingPair[0][0],
          graph.graphData.links[crossingPair[0][2]]
        );
        updateDrawing(newCoord, crossingPair[0][0], oldX, oldY, comp1);
        if (oldX == newCoord[0] && oldX == newCoord[1]) {
          edge_distance[crossingPair[0][2]] = Math.max(
            10,
            edge_distance[crossingPair[0][2]] - 5
          );
        }
      } else {
        const oldX = crossingPair[1][0].x;
        const oldY = crossingPair[1][0].y;
        newCoord = removeAllCrossingsUsingRotation(
          crossingPair[1][1],
          crossingPair[1][0],
          graph.graphData.links[crossingPair[1][2]]
        );
        updateDrawing(newCoord, crossingPair[1][0], oldX, oldY, comp2);
        if (oldX == newCoord[0] && oldX == newCoord[1]) {
          edge_distance[crossingPair[0][2]] = Math.max(
            10,
            edge_distance[crossingPair[0][2]] - 5
          );
        }
      }
    }
    res = linkCrossingsParam(graph.graphData.links);
    if (oldLength == res.length) {
      if (res.length > 0) {
        console.log('Unable to remove crossing, leaving as it is.');
      }
      break;
    }
    oldLength = res.length;
    console.log('crossings', res.length);
  }
}
