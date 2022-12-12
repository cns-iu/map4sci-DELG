import { hasLinkCrossingsWithInputLink } from './has-link-crossings-with-input-link.js';
import { stopForceDirected } from './stop-force-directed.js';
import * as d3 from 'd3';
// import { graph } from '../cli.js';
import { startAddingEdges } from './start-adding-edges.js';
import { initForceDirected } from './init-force-directed.js';

let outputObject = {};
export class D3ForceGraph {
  constructor(width, height, data) {
    this.safeMode = null;
    this.nodeToLinks = {};
    this.data = data;
    this.crdX = data.crdX;
    this.myEdges = data.myEdges;
    this.edgeDistance = data.edgeDistance;
    this.crdY = data.crdY;
    this.width = width;
    this.height = height;
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.dataTick = null;
    this.stopRunning = false;
    this.edgeDistanceOrg = Object.assign({}, data.edgeDistance);
    this.intervalId = null;
    this.updateRefCount = 0;
  }

  async init() {
    this.graphData = { nodes: [], links: [] };

    const simulation = this.initSimulation();
    this.simulation = simulation;
    this.update(this, simulation);
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

  start() {
    startAddingEdges(this);
  }

  startForceDirected() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.restartSimulation();
    }, 5);
    initForceDirected(this, this.intervalId);
  }

  restartSimulation() {
    this.simulation.alpha(1).restart();
  }

  changeSafeMode(newValue) {
    this.safeMode = newValue;
  }

  stop() {
    this.simulation.stop();
  }

  getJSON() {
    const output = this.dataTick;
    let newOutput = [];
    for (let i = 0; i < Object.keys(output.crd_x).length; i++) {
      newOutput.push({ id: i, x: output.crd_x[i], y: output.crd_y[i] });
    }
    return newOutput;
  }

  update(t, simulation) {
    const nodes = this.graphData.nodes;
    const links = this.graphData.links;

    simulation.nodes(nodes).on('end', () => t.handleEnd());

    simulation.on('tick', handleTicked);

    let safeModeIter = 1;

    simulation.force('link').links(links);
    const edgeDistanceOrg = Object.assign({}, t.edgeDistance);

    function handleTicked() {
      let locked = null;
      if (t.safeMode) {
        if (!locked) {
          //the end point is based on the safemodeIter. As it reaches 500 the program end
          if (safeModeIter == 500) {
            console.log(`Stopping after ${safeModeIter} iterations.`);
            console.log(new Date());
            t.dataTick = outputObject;
            stopForceDirected(
              t,
              t.intervalId || startForceDirectedInterval,
              edgeDistanceOrg
            );
            t.stop();
          }
          locked = true;
          safeModeIter = safeModeIter + 1;

          const crdXt = {};
          const crdYt = {};
          for (let i = 0; i <= t.myEdges.length; i++) {
            crdXt[i] = t.graphData.nodes[i].x;
            crdYt[i] = t.graphData.nodes[i].y;
          }
          for (let i = 0; i <= t.myEdges.length; i++) {
            const prevX = t.crdX[i];
            const prevY = t.crdY[i];
            t.crdX[i] = crdXt[i];
            t.crdY[i] = crdYt[i];
            {
              let introducesCrossing = false;
              for (let j = 0; j < t.nodeToLinks[i].length; j++) {
                const link = t.nodeToLinks[i][j];
                if (
                  hasLinkCrossingsWithInputLink(link, t.crdX, t.crdY, t)
                ) {
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
            outputObject['crd_x'] = crdXlog;
            outputObject['crd_y'] = crdYlog;
          }
          for (let i = 0; i <= t.myEdges.length; i++) {
            t.graphData.nodes[i].x = t.crdX[i];
            t.graphData.nodes[i].y = t.crdY[i];
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
