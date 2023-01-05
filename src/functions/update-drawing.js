import * as d3 from 'd3';

/**
 * 
 * @param {New Coordinate} arr 
 * @param {Crossing Vertex} otherVertex 
 * @param {Old x-coordinate} oldX 
 * @param {Old y-coordinate} oldY 
 * @param {*} comp 
 * @param {Graph} graph 
 */
export function updateDrawing(arr, otherVertex, oldX, oldY, comp,graph) {
  const nx = arr[0];
  const ny = arr[1];
  graph.graphData.nodes[otherVertex.id].x = oldX;
  graph.graphData.nodes[otherVertex.id].y = oldY;
  const tx = nx - oldX;
  const ty = ny - oldY;
  for (let i = 0; i < comp.length; i++) {
    graph.graphData.nodes[comp[i]].fx += tx;
    graph.graphData.nodes[comp[i]].fy += ty;
  }
  d3.select('#nodes_testSvgId')
    .selectAll('g')
    .attr('transform', (d) => {
      return 'translate(' + [d.x, d.y] + ')';
    });
  d3.select('#links_testSvgId')
    .selectAll('line')
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y)
    .style('stroke', (d) => d.stroke)
    .style('stroke-width', (d) => d['stroke-width']);
}
