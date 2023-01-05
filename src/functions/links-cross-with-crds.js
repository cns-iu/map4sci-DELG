import { linesCross } from './lines-cross.js';

/**
 * 
 * @param {Link1} link1 
 * @param {Link2} link2 
 * @param {x coordinate} crd_x 
 * @param {y coordinate} crd_y 
 * @returns true if these lines and coordinates intersect and False otherwise
 */

export function linksCrossWithCrds(link1, link2, crd_x, crd_y) {
  // Self loops are not intersections
  if (
    link1.index === link2.index ||
    link1.source === link1.target ||
    link2.source === link2.target
  ) {
    return false;
  }

  // Links cannot intersect if they share a node
  if (
    link1.source === link2.source ||
    link1.source === link2.target ||
    link1.target === link2.source ||
    link1.target === link2.target
  ) {
    return false;
  }

  const line1 = [
    [crd_x[link1.source.id], crd_y[link1.source.id]],
    [crd_x[link1.target.id], crd_y[link1.target.id]],
  ];

  const line2 = [
    [crd_x[link2.source.id], crd_y[link2.source.id]],
    [crd_x[link2.target.id], crd_y[link2.target.id]],
  ];

  return linesCross(line1, line2);
}
