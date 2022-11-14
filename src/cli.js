import { hasLinkCrossingsWithInputLink } from './functions/has-link-crossings-with-input-link.js';
import { myInit } from './functions/my-init.js';
import { startForceDirected } from './functions/start-force-directed.js';
import { stopForceDirected } from './functions/stop-force-directed.js';
import { startAddingEdges } from './functions/start-adding-edges.js';
import * as fs from 'fs';
import * as d3 from 'd3';


//being used by both class and function
const nodeToLinks = {};
let safeMode = null;
let t0 = null;

const INPUT_FILE = JSON.parse(
  fs.readFileSync(process.argv[2], { encoding: 'utf8', flag: 'r' })
);
const OUTPUT_FILE = process.argv[3];

export const idToLabel = INPUT_FILE.idToLabel;
export const myEdges = INPUT_FILE.myEdges;
const edgeDistance = INPUT_FILE.edgeDistance;
export const labelToId = INPUT_FILE.labelToId;
export const crdX = INPUT_FILE.crdX;
export const crdY = INPUT_FILE.crdY;

export let addEdgeInterval = setInterval(() => {
  const edgeDistanceOrg = Object.assign({}, edgeDistance);
  let timeWhenLastEdgeAdded = 0
  startAddingEdges(
    graph,
    graph.myGraph,
    timeWhenLastEdgeAdded,
    edgeDistanceOrg,
    nodeToLinks
  );
}, 5);

class D3ForceGraph {
  constructor(width, height) {
    let t = this;

    t.width = width;
    t.height = height;
    t.center = { x: t.width / 2, y: t.height / 2 };

    t.updateRefCount = 0;
  }

  init() {
    const t = this;

    t.graphData = { nodes: [], links: [] };

    const simulation = t.initSimulation();
    t.simulation = simulation;
    t.update(t, simulation);
  }

  initSimulation() {
    const t = this;

    const result = d3
      .forceSimulation()
      .velocityDecay(0.55)
      .force(
        'link',
        d3
          .forceLink()
          .distance(function (d) {
            return edgeDistance[d.index];
          })
          .id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-10).distanceMin(10000))
      .force('collide', d3.forceCollide(100))
      .force('center', d3.forceCenter(t.center.x, t.center.y));

    return result;
  }

  update(t, simulation) {
    const nodes = t.graphData.nodes;
    const links = t.graphData.links;

    simulation.nodes(nodes).on('end', () => t.handleEnd());

    simulation.on('tick', handleTicked);

    simulation.force('link').links(links);
    let safeModeIter = 1;
    const edgeDistanceOrg = Object.assign({}, edgeDistance);

    function handleTicked() {
      let locked = null;
      let startForceDirectedInterval = setInterval(() => {
        startForceDirected(graph);
      }, 5);
      if (safeMode) {
        if (!locked) {
          if (safeModeIter == 500) {
            stopForceDirected(
              graph,
              startForceDirectedInterval,
              safeMode,
              t0,
              edgeDistanceOrg
            );
            graph.simulation.stop();
            const coordinates = JSON.stringify({ crd_x: crdX, crd_y: crdY });
            fs.writeFileSync(OUTPUT_FILE, coordinates);
            return;
          }
          locked = true;
          console.log('Safe mode iteration:', safeModeIter);
          safeModeIter = safeModeIter + 1;

          const crdXt = {};
          const crdYt = {};
          for (let i = 0; i <= myEdges.length; i++) {
            crdXt[i] = graph.graphData.nodes[i].x;
            crdYt[i] = graph.graphData.nodes[i].y;
          }
          for (let i = 0; i <= myEdges.length; i++) {
            const prevX = crdX[i];
            const prevY = crdY[i];
            crdX[i] = crdXt[i];
            crdY[i] = crdYt[i];
            {
              let introducesCrossing = false;
              for (let j = 0; j < nodeToLinks[i].length; j++) {
                const link = nodeToLinks[i][j];
                if (hasLinkCrossingsWithInputLink(link, crdX, crdY, graph)) {
                  introducesCrossing = true;
                  break;
                }
              }
              if (introducesCrossing) {
                crdX[i] = prevX;
                crdY[i] = prevY;
              }
            }
          }
          if (safeModeIter % 100 == 0) {
            const crdXlog = {};
            const crdYlog = {};
            for (let i = 0; i <= myEdges.length; i++) {
              crdXlog[i] = crdX[i];
              crdYlog[i] = crdY[i];
            }
            console.log(crdXlog, crdYlog);
          }
          for (let i = 0; i <= myEdges.length; i++) {
            graph.graphData.nodes[i].x = crdX[i];
            graph.graphData.nodes[i].y = crdY[i];
          }
          locked = false;
        }
      }
    }
  }

  add(nodesToAdd, linksToAdd) {
    const t = this;

    if (nodesToAdd) {
      nodesToAdd.forEach((n) => t.graphData.nodes.push(n));
    }
    if (linksToAdd) {
      linksToAdd.forEach((l) => t.graphData.links.push(l));
    }

    t.update(t, t.simulation);
    t.simulation.restart();
    t.simulation.alpha(1);
  }
  handleEnd() {
    console.log('end');
  }
}

export function initForceDirected(
  graph,
  nodeToLinks,
  startForceDirectedInterval
) {
  for (let i = 0; i <= myEdges.length; i++) {
    graph.graphData.nodes[i].fx = null;
    graph.graphData.nodes[i].fy = null;
  }
  {
    safeMode = true;
    for (let i = 0; i <= myEdges.length; i++) {
      nodeToLinks[i] = [];
    }
    for (let i = 0; i < graph.graphData.links.length; i++) {
      nodeToLinks[graph.graphData.links[i].source.id].push(
        graph.graphData.links[i]
      );
      nodeToLinks[graph.graphData.links[i].target.id].push(
        graph.graphData.links[i]
      );
    }
  }
  startForceDirectedInterval = setInterval(() => {
    startForceDirected(graph);
  }, 500);
}

const graph = new D3ForceGraph(500, 500);
graph.init();

myInit(graph, t0);
