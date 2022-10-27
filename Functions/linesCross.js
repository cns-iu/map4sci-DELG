import { onSegment } from "./onSegment.js";
import {direction} from "./direction.js"
export function linesCross(line1, line2) {
  
  const d1 = direction(line2[0], line2[1], line1[0]);
  const d2 = direction(line2[0], line2[1], line1[1]);
  const d3 = direction(line1[0], line1[1], line2[0]);
  const d4 = direction(line1[0], line1[1], line2[1]);
  
    if (
      ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
    ) {
      return true;
    } else if (d1 === 0 && onSegment(line2[0], line2[1], line1[0])) {
      return true;
    } else if (d2 === 0 && onSegment(line2[0], line2[1], line1[1])) {
      return true;
    } else if (d3 === 0 && onSegment(line1[0], line1[1], line2[0])) {
      return true;
    } else if (d4 === 0 && onSegment(line1[0], line1[1], line2[1])) {
      return true;
    }
  
    return false;
  }