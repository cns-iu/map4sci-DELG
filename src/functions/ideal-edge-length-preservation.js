/**
 * 
 * @param {array of links} links 
 * @param {array of ideal lengths} ideal_lengths 
 * @returns average difference
 */
export function idealEdgeLengthPreservation(links, ideal_lengths) {
  let total_difference = 0;
  for (let i = 0; i < links.length; i++) {
    const x1 = links[i].source.x;
    const y1 = links[i].source.y;
    const x2 = links[i].target.x;
    const y2 = links[i].target.y;
    const dist = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    const diff = Math.abs(ideal_lengths[i] - dist);
    total_difference += Math.pow(diff / ideal_lengths[i], 2);
  }
  const average_difference = Math.sqrt(total_difference / links.length);
  return average_difference;
}
