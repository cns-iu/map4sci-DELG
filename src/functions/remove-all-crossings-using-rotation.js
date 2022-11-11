import { linkCrossingsWithInputLink } from './link-crossings-with-input-link.js';

export function removeAllCrossingsUsingRotation(
  cntr_vertex,
  other_vertex,
  inputLink
) {
  const oldX = other_vertex.x;
  const oldY = other_vertex.y;
  const rotation_dir = 1;
  const number_of_angles = 100;
  if (my_edges.length > 2000) {
    number_of_angles = 1000;
  }
  const theta = Math.atan(
    (other_vertex.y - cntr_vertex.y) / (other_vertex.x - cntr_vertex.x)
  );
  for (let i = 0; i < number_of_angles; i++) {
    const tx = other_vertex.x - cntr_vertex.x;
    const ty = other_vertex.y - cntr_vertex.y;
    const rx = tx * Math.cos(theta) - ty * Math.sin(theta);
    const ry = tx * Math.sin(theta) + ty * Math.cos(theta);
    tx = rx + cntr_vertex.x;
    ty = ry + cntr_vertex.y;
    other_vertex.x = tx;
    other_vertex.y = ty;
    const crossings = linkCrossingsWithInputLink(inputLink);
    if (crossings.length == 0) return [tx, ty];
    theta = theta + rotation_dir * (Math.PI / number_of_angles);
  }
  return [oldX, oldY];
}
