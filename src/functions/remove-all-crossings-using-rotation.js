import { linkCrossingsWithInputLink } from './link-crossings-with-input-link.js';
import { myEdges } from '../cli.js';
export function removeAllCrossingsUsingRotation(
  cntr_vertex,
  other_vertex,
  inputLink,graph
) {
  const oldX = other_vertex.x;
  const oldY = other_vertex.y;
  const rotation_dir = 1;
  const number_of_angles = 100;
  if (myEdges.length > 2000) {
    number_of_angles = 1000;
  }
  const theta = Math.atan(
    (other_vertex.y - cntr_vertex.y) / (other_vertex.x - cntr_vertex.x)
  );
  for (let i = 0; i < number_of_angles; i++) {
    let tx = other_vertex.x - cntr_vertex.x;
    let ty = other_vertex.y - cntr_vertex.y;
    let rx = tx * Math.cos(theta) - ty * Math.sin(theta);
    let ry = tx * Math.sin(theta) + ty * Math.cos(theta);
    tx = rx + cntr_vertex.x;
    ty = ry + cntr_vertex.y;
    other_vertex.x = tx;
    other_vertex.y = ty;
    const crossings = linkCrossingsWithInputLink(inputLink,graph);
    if (crossings.length == 0) return [tx, ty];
    theta = theta + rotation_dir * (Math.PI / number_of_angles);
  }
  return [oldX, oldY];
}
