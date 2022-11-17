import { hasLinkCrossingsWithInputLink } from './has-link-crossings-with-input-link.js';
import { stopForceDirected } from './stop-force-directed.js';
import * as fs from 'fs';
import * as d3 from 'd3';
import {
  safeMode,
  graph,
  startForceDirectedInterval,
  OUTPUT_FILE,
  nodeToLinks,
  INPUT_FILE,
} from '../cli.js';


export class D3ForceGraph {
  constructor(width, height) {
    let t = this;
    t.crdX = INPUT_FILE.crdX;
    t.myEdges = INPUT_FILE.myEdges
    t.edgeDistance = INPUT_FILE.edgeDistance
    t.crdY = INPUT_FILE.crdY
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
            return t.edgeDistance[d.index];
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
    const edgeDistanceOrg = Object.assign({}, t.edgeDistance);

    function handleTicked() {
      let locked = null;

      if (safeMode) {
        if (!locked) {
          if (safeModeIter == 500) {
            stopForceDirected(
              graph,
              startForceDirectedInterval,
              safeMode,
              edgeDistanceOrg
            );
            graph.simulation.stop();
            const coordinates = JSON.stringify({ crd_x: t.crdX, crd_y: t.crdY });
            fs.writeFileSync(OUTPUT_FILE, coordinates);
            return;
          }
          locked = true;
          console.log('Safe mode iteration:', safeModeIter);
          safeModeIter = safeModeIter + 1;

          const crdXt = {};
          const crdYt = {};
          for (let i = 0; i <= t.myEdges.length; i++) {
            crdXt[i] = graph.graphData.nodes[i].x;
            crdYt[i] = graph.graphData.nodes[i].y;
          }
          for (let i = 0; i <= t.myEdges.length; i++) {
            const prevX = t.crdX[i];
            const prevY = t.crdY[i];
            t.crdX[i] = crdXt[i];
            t.crdY[i] = crdYt[i];
            {
              let introducesCrossing = false;
              for (let j = 0; j < nodeToLinks[i].length; j++) {
                const link = nodeToLinks[i][j];
                if (hasLinkCrossingsWithInputLink(link, t.crdX, t.crdY, graph)) {
                  introducesCrossing = true;
                  break;
                }
              }
              if (introducesCrossing) {
                t.crdX[i] = prevX;
                t.crdY[i] = prevY;
              }
            }
          }
          if (safeModeIter % 100 == 0) {
            const crdXlog = {};
            const crdYlog = {};
            for (let i = 0; i <= t.myEdges.length; i++) {
              crdXlog[i] = t.crdX[i];
              crdYlog[i] = t.crdY[i];
            }
            console.log(crdXlog, crdYlog);
          }
          for (let i = 0; i <= t.myEdges.length; i++) {
            graph.graphData.nodes[i].x = t.crdX[i];
            graph.graphData.nodes[i].y = t.crdY[i];
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
