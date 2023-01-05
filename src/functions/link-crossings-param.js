import { linksCross } from './links-cross.js';


/**
 * 
 * @param {links} links 
 * @returns final array
 */
export function linkCrossingsParam(links) {
  let i,
    j,
    c = 0,
    link1,
    link2;
  let res = [];

  // Sum the upper diagonal of the edge crossing matrix.
  const m = links.length;
  for (i = 0; i < m; ++i) {
    for (j = i + 1; j < m; ++j) {
      (link1 = links[i]), (link2 = links[j]);

      // Check if link i and link j intersect
      if (linksCross(link1, link2)) {
        const line1 = [
          [link1.source.x, link1.source.y],
          [link1.target.x, link1.target.y],
        ];
        const line2 = [
          [link2.source.x, link2.source.y],
          [link2.target.x, link2.target.y],
        ];
        ++c;
        res.push([
          [link1.source, link1.target, link1.index],
          [link2.source, link2.target, link2.index],
        ]);
      }
    }
  }

  return res;
}
