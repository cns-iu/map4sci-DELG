import { startForceDirected } from "./start-force-directed.js";
import { graph } from "../cli.js";

export let startForceDirectedInterval = setInterval(() => {
    startForceDirected(graph);
  }, 5);
  