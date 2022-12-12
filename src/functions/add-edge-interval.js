import { graph } from "../cli.js";
import { startAddingEdges } from "./start-adding-edges.js";


export const addEdgeInterval = setInterval(() => {
    const edgeDistanceOrg = Object.assign({}, graph.data.edgeDistance);
    startAddingEdges(edgeDistanceOrg);
  }, 5);
