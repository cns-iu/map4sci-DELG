import { linksCross } from './links-cross.js';

export function linkCrossingsWithInputLink(inputLink,graph) {
  let c = 0,
    link1,
    link2,
    line1,
    line2;
  let res = [];

  // Sum the upper diagonal of the edge crossing matrix.
  const links = graph.graphData.links;
  const m = links.length;
  for (let i = 0; i < m; ++i) {
    (link1 = links[i]), (link2 = inputLink);

    // Check if link i and link j intersect
    if (linksCross(link1, link2)) {
      line1 = [
        [link1.source.x, link1.source.y],
        [link1.target.x, link1.target.y],
      ];
      line2 = [
        [link2.source.x, link2.source.y],
        [link2.target.x, link2.target.y],
      ];
      ++c;
      res.push([
        [link1.source, link1.target],
        [link2.source, link2.target],
      ]);
    }
  }

  return res;
}
