import {linkCrossingsParam} from "./linkCrossingsParam.js";
import {get_child_nodes} from "./get_child_nodes.js";
import {removeAllCrossingsUsingRotation} from "./removeAllCrossingsUsingRotation.js";
import { update_drawing } from "./update_drawing.js";

export function remove_existing_crossings(){
    const res = linkCrossingsParam(graph.graphData.links);
    let old_length = 0;
    while(res.length>0)
    {
      for(let crossingIndex=0;crossingIndex<res.length;crossingIndex++){
        const crossingPair = res[crossingIndex];
        let arr = get_child_nodes(crossingPair[0], crossingPair[1]);
        const comp1 = arr[0];
        crossingPair[0] = arr[1];
         arr = get_child_nodes(crossingPair[1], crossingPair[0]);
        const comp2 = arr[0];
        crossingPair[1] = arr[1];
        let new_coord = null;
        if(comp1.length<comp2.length)
          {
            const oldX = crossingPair[0][0].x;
            const oldY = crossingPair[0][0].y;
            new_coord = removeAllCrossingsUsingRotation(crossingPair[0][1], crossingPair[0][0], graph.graphData.links[crossingPair[0][2]]);
            update_drawing(new_coord, crossingPair[0][0], oldX, oldY, comp1);
            if((oldX==new_coord[0])&&(oldX==new_coord[1]))
            {
              edge_distance[crossingPair[0][2]] = Math.max(10, edge_distance[crossingPair[0][2]]-5)
            }
          }
        else
          {
            const oldX = crossingPair[1][0].x;
            const oldY = crossingPair[1][0].y;
            new_coord = removeAllCrossingsUsingRotation(crossingPair[1][1], crossingPair[1][0], graph.graphData.links[crossingPair[1][2]]);
            update_drawing(new_coord, crossingPair[1][0], oldX, oldY, comp2);
            if((oldX==new_coord[0])&&(oldX==new_coord[1]))
            {
              edge_distance[crossingPair[0][2]] = Math.max(10, edge_distance[crossingPair[0][2]]-5)
            }
          }
      }
      res = linkCrossingsParam(graph.graphData.links);
      if(old_length==res.length){
        if(res.length>0){
          console.log('Unable to remove crossing, leaving as it is.');
        }
        break;
      }
      old_length = res.length;
      console.log("crossings", res.length);
    }
    }