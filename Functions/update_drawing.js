import * as d3 from "d3";

export function update_drawing(arr, other_vertex, oldX, oldY, comp)
{
  const nx = arr[0];
  const ny = arr[1];
    graph.graphData.nodes[other_vertex.id].x = oldX;
    graph.graphData.nodes[other_vertex.id].y = oldY;
    const tx = nx-oldX;
    const ty = ny-oldY;
    for(let i=0;i<comp.length;i++)
    {
      graph.graphData.nodes[comp[i]].fx += tx;
      graph.graphData.nodes[comp[i]].fy += ty;
    }
    d3.select('#nodes_testSvgId').selectAll('g').attr("transform", d => {return 'translate('+[d.x,d.y]+')';});
    d3.select('#links_testSvgId').selectAll('line').attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y).style("stroke", d => d.stroke).style("stroke-width", d => d["stroke-width"]);
}