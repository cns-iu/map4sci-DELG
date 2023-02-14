import networkx as nx
from networkx.drawing.nx_agraph import read_dot as nx_read_dot
import sys
from generate_initial_layout import *
#import time

levels=1
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
    if len(cnt_str)==1:
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

# print(edgeAndLevels)

if not nx.is_connected(G):
    # print("nodes:", len(G.nodes()))
    # print("edges:", len(G.edges()))
    # print("edges:", G.edges())
    # print("not connected:", fname)
    quit()
cycle = None
try:
    cycle = nx.find_cycle(G)
except:
    pass
if not cycle==None:
    print("Found cycle in ", fname)
    quit()

org_to_alphanum, alphanum_to_org = create_alphanum_dict(G)
G = convert_nodes_to_alphanum(G, org_to_alphanum, alphanum_to_org)

number_lab_to_name_lab = dict()
name_lab_to_number_lab = dict()
edges_to_index = dict()
edge_distance = dict()

#for n in G.nodes():
# number_lab_to_name_lab[n] = G.nodes[n]["label"]
# name_lab_to_number_lab[G.nodes[n]["label"]] = n

for u in G.nodes():
  if not u in name_lab_to_number_lab.keys():
   name_lab_to_number_lab[u] = len(name_lab_to_number_lab.keys())
   number_lab_to_name_lab[len(name_lab_to_number_lab.keys())-1] = u

label_to_index = dict()
index_to_label = dict()
bfs_edges = []
#center = "1149"
center = nx.center(G)[0]
#center = "algorithmic game"
for e in nx.bfs_edges(G, center):
#for e in nx.dfs_edges(G, center):
 u, v = e
 bfs_edges.append((u, v))
bfs_edges2 = []
for e in bfs_edges:
 u, v = e
 #u, v = number_lab_to_name_lab[u], number_lab_to_name_lab[v]
 u = u[:max_label_size]
 v = v[:max_label_size]
 bfs_edges2.append([u, v])
bfs_edges = bfs_edges2
G2 = nx.Graph()
for e in G.edges():
 u, v = e
 #u, v = number_lab_to_name_lab[u], number_lab_to_name_lab[v]
 u = u[:max_label_size]
 v = v[:max_label_size]
 G2.add_edge(u, v)
G = G2
for i in range(len(bfs_edges)):
  edges_to_index[(bfs_edges[i][0], bfs_edges[i][1])] = i
edge_list = []
#for e in nx.bfs_edges(G, "machine learning"):
for e in bfs_edges:
 #print(e)
 u, v = e
 if not u in label_to_index.keys():
  label_to_index[u] = len(label_to_index.keys())
  index_to_label[len(label_to_index.keys())-1] = u
 if not v in label_to_index.keys():
  label_to_index[v] = len(label_to_index.keys())
  index_to_label[len(label_to_index.keys())-1] = v
 edge_list.append([label_to_index[u], label_to_index[v]])
# print(label_to_index)
#print(index_to_label)
# print("my_edges = ", bfs_edges)
# print("label_to_id = ", label_to_index)
# print("id_to_label = ", index_to_label)

l = levels-1
# cur_dis = 50
# cur_dis = 200
#cur_dis = 100
#cur_dis = 169.30
#cur_dis = 300
#cur_dis = 600
#cur_dis = 1200
#cur_dis = 2000
#cur_dis = 4000
# cur_dis = 8000
cur_dis = 15000
#init_dis = 100
#init_fac = 2
cur_lev = 0
nodes_to_levels = {}
nodes_to_files = {}
lv = len(bfs_edges) // 3 
while l>=0:
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
      #u, v = number_lab_to_name_lab[u], number_lab_to_name_lab[v]
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
      nodes_to_levels[e[0]] = cur_lev
      nodes_to_levels[e[1]] = cur_lev
      edge_distance[edge_index] = cur_dis
      # nodes_to_files[e[0]] = file_name[l]
      # nodes_to_files[e[1]] = file_name[l]   
    l -= 1
    cur_dis += 50
    #cur_dis += 25
    cur_lev -= 1
    #if l%2==0:
    ##if change_length[l]:
    #  cur_dis += 50
    #  cur_lev -= 1
    #if l%2==0:
    #  init_fac *= 2
    #  cur_dis = init_dis + init_fac

min_lev = nodes_to_levels[list(nodes_to_levels.keys())[0]]
for k in nodes_to_levels.keys():
  if min_lev>nodes_to_levels[k]:
    min_lev = nodes_to_levels[k]
max_lev = - min_lev + 1
for k in nodes_to_levels.keys():
  nodes_to_levels[k] = nodes_to_levels[k] + max_lev


# print("edge_distance = ", edge_distance)
# print("nodes_to_levels = ", nodes_to_levels)
# print("nodes_to_files = ", nodes_to_files)
#quit()

G = G2
cnt = {}
#src = list(G.nodes())[0]
src = center
numberOfNodes(G, src, -1, cnt)
crd_x = {}
crd_y = {}
crd_x[label_to_index[src]] = 500
crd_y[label_to_index[src]] = 500
label_to_id = {u:u for u in G.nodes()}
get_drawing_coordinates(G, src, -1, 0, 2*math.pi, crd_x[label_to_index[src]], crd_y[label_to_index[src]], crd_x, crd_y, cnt, label_to_index, edges_to_index, edge_distance)
# print("crd_x = ", crd_x)
# print("crd_y = ", crd_y)

#print("Time taken:", time.time()-start_time)

output_file_name = sys.argv[2]
# count = 0
# maxWeight = 800
# for e in bfs_edges:
#   u,v = e
#   temp = []
#   t = tuple(e)
#   # print(edgeAndLevels[('2217', '250')])
#   if t not in edgeAndLevels:
#     # print(edgeAndLevels[t]
#     # print(f"Not present {e}")
#     temp.append(v)
#     temp.append(u)
#     s = tuple(temp)
#     if s in edgeAndLevels:
#       edge_distance[count] = maxWeight - int(edgeAndLevels[s]['level']) * 50
#       count+=1
#   else:
#     edge_distance[count] = int(maxWeight) - int(edgeAndLevels[t]['level']) * 50
#     count+=1
# print(count)

output = {}
output["myEdges"] = bfs_edges
output["edgeDistance"] = edge_distance
output["idToLabel"] = index_to_label
output["labelToId"] = label_to_index
output["crdX"] = crd_x
output["crdY"] = crd_y



import json
with open(output_file_name, 'w') as f:
    json.dump(output, f,indent=2)
