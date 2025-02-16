/**
 * 
 * @param {edge 1} firstEdge 
 * @param {edge 2} secondEdge 
 * @param {graph} myGraph 
 * @returns child nodes
 */

export function getChildNodes(firstEdge, secondEdge,myGraph) {
  let comp1Size = null;
  let comp1 = null;
  myGraph.removeEdge(firstEdge[0].id, firstEdge[1].id);
  let part1 = myGraph.bfs(firstEdge[0].id);
  let part2 = myGraph.bfs(firstEdge[1].id);
  let part1ContainsSecondEdge = false;
  for (let i = 0; i < part1.length; i++) {
    if (part1[i] == secondEdge[0].id || part1[i] == secondEdge[1].id) {
      part1ContainsSecondEdge = true;
      break;
    }
  }
  if (part1ContainsSecondEdge) {
    let t = firstEdge[0];
    firstEdge[0] = firstEdge[1];
    firstEdge[1] = t;
    t = part1;
    part1 = part2;
    part2 = t;
  }
  comp1Size = part1.length;
  comp1 = part1;
  myGraph.addEdge(firstEdge[0].id, firstEdge[1].id);
  return [comp1, firstEdge];
}
