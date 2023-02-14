import sys
import numpy as np
import networkx as nx
from generate_initial_layout import *
from networkx.drawing.nx_agraph import write_dot
from networkx.relabel import convert_node_labels_to_integers


#root = int(sys.argv[1])
#edge_file_name = "datasets/raw/Graph_8.txt.weighted.mtx"
#label_file_name = "datasets/raw/Graph_8.txt.labels"
#out_dir = "datasets/output/"
edge_file_name = sys.argv[1]
label_file_name = sys.argv[2]
output_file_name = sys.argv[3]

my_edges = []
f = open(edge_file_name)
ln = f.readline()
ln = f.readline()
ln = ln.split()
n, m = int(ln[1]), int(ln[2])
for i in range(m):
 ln = f.readline()
 ln = ln.split()
 if len(ln)>2:
  u, v, w = int(ln[0])-1, int(ln[1])-1, float(ln[2])
 else:
  u, v, w = int(ln[0])-1, int(ln[1])-1, 100
 my_edges.append([u, v, w])
f.close()

label_to_index = {}
index_to_label = {}
f = open(label_file_name)
ln = f.readline()
cnt = 0
for i in range(n):
 label = ln[:len(ln)-1]
 label_to_index[label] = cnt
 index_to_label[cnt] = label
 cnt += 1
 ln = f.readline()
f.close()

G = nx.Graph()
for u, v, w in my_edges:
    G.add_edge(index_to_label[u], index_to_label[v])
root = label_to_index[nx.center(G)[0]]

cnt = {}
src = index_to_label[root]
numberOfNodes(G, src, -1, cnt)
crd_x = {}
crd_y = {}
crd_x[label_to_index[src]] = 500
crd_y[label_to_index[src]] = 500
edges_to_index = dict()
edge_distance = dict()
for i in range(len(my_edges)):
  edges_to_index[(index_to_label[my_edges[i][0]], index_to_label[my_edges[i][1]])] = i
  edge_distance[i] = my_edges[i][2]
get_drawing_coordinates(G, src, -1, 0, 2*math.pi, crd_x[label_to_index[src]], crd_y[label_to_index[src]], crd_x, crd_y, cnt, label_to_index, edges_to_index, edge_distance)
# print(G.nodes)



# import json
# with open(output_file_name, 'w') as f:
#     json.dump(pos0, f)

output = {}
output["crdX"] = dict()
output["crdY"] = dict()
for i in range(len(crd_x)):
    output["crdX"][i] = crd_x[i]
    output["crdY"][i] = crd_y[i]

bfs_edges = []
center = nx.center(G)[0]
id_to_lab = dict()
count = 0
id_to_lab[count] = center
lab_to_id = dict()
lab_to_id[center] = count
count = count + 1
for e in nx.bfs_edges(G, center):
 u, v = e
 bfs_edges.append([u, v])
 id_to_lab[count] = v
 lab_to_id[v] = count
 count = count + 1
output["myEdges"] = bfs_edges
edge_distance = dict()
for i,e in enumerate(bfs_edges):
 edge_distance[i] = 100
output["edgeDistance"] = edge_distance
output["idToLabel"] = id_to_lab
output["labelToId"] = lab_to_id

pos0 = {}


for i in range(len(crd_x)):
    # G.add_node(index_to_label[i],x=crd_x[i],y=crd_y[i])
    G.add_node(index_to_label[i],pos = f"{crd_x[i]},{crd_y[i]}")

    pos0[i] = [crd_x[i], crd_y[i]]
# print(nx.get_node_attributes(G,'x'))
print(G)
for u, v, w in my_edges:
    G.add_edge(index_to_label[u], index_to_label[v],weight=w)

H = convert_node_labels_to_integers(G, 0, 'decreasing degree', 'label')
# write_dot(H, "./examples/graph.dot")

import json
with open(output_file_name, 'w') as f:
    json.dump(output, f, indent=2)

