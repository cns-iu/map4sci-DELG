import { linksCrossWithCrds } from './links-cross-with-crds.js';
import { graph } from '../cli.js';

export function hasLinkCrossingsWithInputLink(inputLink, crd_x, crd_y) {
  let link1, link2;

  // Sum the upper diagonal of the edge crossing matrix.
  const links = graph.graphData.links;
  const m = links.length;
  for (let i = 0; i < m; ++i) {
    (link1 = links[i]), (link2 = inputLink);

    // Check if link i and link j intersect
    if (linksCrossWithCrds(link1, link2, crd_x, crd_y)) {
      return true;
    }
  }

  //return res;
  return false;
}
