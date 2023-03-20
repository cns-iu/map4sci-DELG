/**
 * 
 * @param {*} pi 
 * @param {*} pj 
 * @param {*} pk 
 * @returns 
 */

export function onSegment(pi, pj, pk) {
  return (
    Math.min(pi[0], pj[0]) <= pk[0] &&
    pk[0] <= Math.max(pi[0], pj[0]) &&
    Math.min(pi[1], pj[1]) <= pk[1] &&
    pk[1] <= Math.max(pi[1], pj[1])
  );
}
