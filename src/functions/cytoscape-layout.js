import cytoscape from 'cytoscape';

export async function cytoscapeLayout(collectiveData) {
  const cy = cytoscape({
    /* options */
  });
  Object.keys(collectiveData.idToLabel).forEach((node, i) => {
    cy.add({
      group: 'nodes',
      data: {
        id: node.toString(),
        name: collectiveData.idToLabel[node],
      },
      // position: { x: collectiveData.crdX[node], y: collectiveData.crdY[node] },
    });
  });

  collectiveData.myEdges.forEach((edge) => {
    cy.add({
      group: 'edges',
      data: {
        id: `${collectiveData.labelToId[edge[0]]}-${
          collectiveData.labelToId[edge[1]]
        }`.toString(),
        source: collectiveData.labelToId[edge[0]],
        target: collectiveData.labelToId[edge[1]],
      },
    });
  });

  // const layout = cy.layout({
  //   name: 'breadthfirst',
  //   directed: true,
  //   avoidOverlap: true,
  //   spacingFactor: 7,
  // });
  // const layoutFinished = cy.pon('layoutstop');
  // layout.run();
  // await layoutFinished;
  return cy;
}
