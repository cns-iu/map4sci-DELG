import json
import networkx as nx
from networkx.drawing.nx_agraph import read_dot as nx_read_dot
import sys


levels = 1
max_label_size = 16


def convert_nodes_to_alphanum(G, org_to_alphanum, alphanum_to_org):
    G2 = nx.Graph()
    for e in G.edges():
        u, v = e
        u2, v2 = org_to_alphanum[u], org_to_alphanum[v]
        G2.add_edge(u2, v2)
    return G2


def create_alphanum_dict(G):
    org_to_alphanum = dict()
    alphanum_to_org = dict()
    for n in G.nodes():
        n_short = n[:max_label_size]
        if n_short in alphanum_to_org.keys():
            n_short = n[:(max_label_size-2)]
            cnt = 2
            while True:
                cnt_str = str(cnt)
                if len(cnt_str) == 1:
                    cnt_str = '0'+cnt_str
                n_alphanum = n_short+cnt_str
                if not n_alphanum in alphanum_to_org.keys():
                    org_to_alphanum[n] = n_alphanum
                    alphanum_to_org[n_alphanum] = n
                    break
                cnt = cnt + 1
        else:
            org_to_alphanum[n] = n_short
            alphanum_to_org[n_short] = n
    return org_to_alphanum, alphanum_to_org


dotfile = sys.argv[1]
G = nx_read_dot(dotfile)

edgeAndLevels = dict()
for e, datadict in G.edges.items():
    edgeAndLevels[e] = datadict

if not nx.is_connected(G):
    quit()
cycle = None
try:
    cycle = nx.find_cycle(G)
except:
    pass
if not cycle == None:
    print("Found cycle in ", fname)
    quit()

org_to_alphanum, alphanum_to_org = create_alphanum_dict(G)
G = convert_nodes_to_alphanum(G, org_to_alphanum, alphanum_to_org)

number_lab_to_name_lab = dict()
name_lab_to_number_lab = dict()
edges_to_index = dict()
edge_distance = dict()

for u in G.nodes():
    if not u in name_lab_to_number_lab.keys():
        name_lab_to_number_lab[u] = len(name_lab_to_number_lab.keys())
        number_lab_to_name_lab[len(name_lab_to_number_lab.keys())-1] = u

label_to_index = dict()
index_to_label = dict()
bfs_edges = []
center = nx.center(G)[0]
for e in nx.bfs_edges(G, center):
    u, v = e
    bfs_edges.append((u, v))
bfs_edges2 = []
for e in bfs_edges:
    u, v = e
    u = u[:max_label_size]
    v = v[:max_label_size]
    bfs_edges2.append([u, v])
bfs_edges = bfs_edges2
G2 = nx.Graph()
for e in G.edges():
    u, v = e
    u = u[:max_label_size]
    v = v[:max_label_size]
    G2.add_edge(u, v)
G = G2
for i in range(len(bfs_edges)):
    edges_to_index[(bfs_edges[i][0], bfs_edges[i][1])] = i
edge_list = []
for e in bfs_edges:
    u, v = e
    if not u in label_to_index.keys():
        label_to_index[u] = len(label_to_index.keys())
        index_to_label[len(label_to_index.keys())-1] = u
    if not v in label_to_index.keys():
        label_to_index[v] = len(label_to_index.keys())
        index_to_label[len(label_to_index.keys())-1] = v
    edge_list.append([label_to_index[u], label_to_index[v]])


l = levels-1
cur_lev = 0
nodes_to_levels = {}
nodes_to_files = {}
if len(G.nodes()) < 5000:
    maxWeight = 1200
    step_size = 100
else:
    maxWeight = 2200
    step_size = 150
while l >= 0:
    G = nx_read_dot(dotfile)
    G = convert_nodes_to_alphanum(G, org_to_alphanum, alphanum_to_org)
    bfs_edges = []
    center = nx.center(G)[0]
    for e in nx.bfs_edges(G, center):
        u, v = e
        bfs_edges.append((u, v))
    bfs_edges2 = []
    for e in bfs_edges:
        u, v = e
        u = u[:max_label_size]
        v = v[:max_label_size]
        bfs_edges2.append([u, v])
    bfs_edges = bfs_edges2

    for i in range(len(bfs_edges)):
        e = bfs_edges[i]
        if (e[0], e[1]) in edges_to_index.keys():
            edge_index = edges_to_index[(e[0], e[1])]
        elif (e[1], e[0]) in edges_to_index.keys():
            edge_index = edges_to_index[(e[1], e[0])]
        else:
            print("Edge not found!")
            quit()
        u, v = e
        temp = []
        t = tuple(e)
        if t not in edgeAndLevels:
            temp.append(v)
            temp.append(u)
            s = tuple(temp)
            if s in edgeAndLevels:
                edge_distance[i] = maxWeight - \
                    int(edgeAndLevels[s]['level']) * step_size
        else:
            edge_distance[i] = int(maxWeight) - \
                int(edgeAndLevels[t]['level']) * step_size
        nodes_to_levels[e[0]] = cur_lev
        nodes_to_levels[e[1]] = cur_lev
    l -= 1
    cur_lev -= 1

min_lev = nodes_to_levels[list(nodes_to_levels.keys())[0]]
for k in nodes_to_levels.keys():
    if min_lev > nodes_to_levels[k]:
        min_lev = nodes_to_levels[k]
max_lev = - min_lev + 1
for k in nodes_to_levels.keys():
    nodes_to_levels[k] = nodes_to_levels[k] + max_lev


G = G2
cnt = {}
src = center
numberOfNodes(G, src, -1, cnt)
crd_x = {}
crd_y = {}
crd_x[label_to_index[src]] = 500
crd_y[label_to_index[src]] = 500
label_to_id = {u: u for u in G.nodes()}
get_drawing_coordinates(G, src, -1, 0, 2*math.pi, crd_x[label_to_index[src]],
                        crd_y[label_to_index[src]], crd_x, crd_y, cnt, label_to_index, edges_to_index, edge_distance)


output_file_name = sys.argv[2]
output = {}
output["myEdges"] = bfs_edges
output["edgeDistance"] = edge_distance
output["idToLabel"] = index_to_label
output["labelToId"] = label_to_index
output["crdX"] = crd_x
output["crdY"] = crd_y


with open(output_file_name, 'w') as f:
    json.dump(output, f, indent=2)

print("Initialization Complete")
