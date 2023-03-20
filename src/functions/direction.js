/**
 *
 * @param {line1} pi
 * @param {line2} pj
 * @param {line3} pk
 * @returns direction
 */
export function direction(pi, pj, pk) {
  const p1 = [pk[0] - pi[0], pk[1] - pi[1]];
  const p2 = [pj[0] - pi[0], pj[1] - pi[1]];
  return p1[0] * p2[1] - p2[0] * p1[1];
}
