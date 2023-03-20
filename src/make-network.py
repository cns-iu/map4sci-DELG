import json
import networkx as nx
from networkx.drawing.nx_agraph import write_dot
from networkx.relabel import convert_node_labels_to_integers
import sys


inputfile = sys.argv[1]
f = open(inputfile)

data = json.load(f)
G = nx.Graph()

for node in data["nodes"]:
    weight = maxWeight - node["id"]
    # adding nodes
    G.add_node(node["id"], label=node["name"], weight=weight)

for edge in data["edges"]:
    w1 = maxWeight - edge["source"]
    w2 = maxWeight - edge["target"]
    edgeWeight = max(w1, w2)
    G.add_edge(edge["source"], edge['target'], weight=edgeWeight)

T = nx.bfs_tree(G, 0)

G = nx.Graph()
maxWeight = len(data["nodes"])

for node in data["nodes"]:
    weight = maxWeight - node["id"]
    G.add_node(node["id"], label=node["name"], weight=weight)

for source, target in T.edges():
    # Adding edges
    w1 = maxWeight - source
    w2 = maxWeight - target
    edgeWeight = max(w1, w2)
    G.add_edge(source, target, weight=edgeWeight)

outputFile = sys.argv[2]
write_dot(G, outputFile)
