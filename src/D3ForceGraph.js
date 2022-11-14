import { hasLinkCrossingsWithInputLink } from './functions/has-link-crossings-with-input-link.js';
import { stopForceDirected } from './functions/stop-force-directed.js';
import * as fs from 'fs';
import * as d3 from 'd3';
import {
  edgeDistance,
  safeMode,
  graph,
  startForceDirectedInterval,
  t0,
  crdX,
  crdY,
  OUTPUT_FILE,
  myEdges,
  nodeToLinks,
} from './cli.js';

export class D3ForceGraph {
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
