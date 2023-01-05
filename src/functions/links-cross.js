import { linesCross } from './lines-cross.js';

/**
 * 
 * @param {Link1} link1 
 * @param {Link2} link2 
 * @returns True if the links cross and False otherwise
 */
export function linksCross(link1, link2) {
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
    [link1.source.x, link1.source.y],
    [link1.target.x, link1.target.y],
  ];

  const line2 = [
    [link2.source.x, link2.source.y],
    [link2.target.x, link2.target.y],
  ];

  return linesCross(line1, line2);
}
