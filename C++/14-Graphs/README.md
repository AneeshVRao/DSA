# 14 - Graphs (C++)

> Trees were graphs with training wheels. Remove the "no cycles" guarantee and
> everything needs a `visited` array.

**At a glance**

| | |
|---|---|
| **What it is** | Everything else, with cycles allowed - so every traversal needs a `visited` set. |
| **Must know** | BFS = shortest path unweighted. Dijkstra = non-negative weights. Bellman-Ford = negatives. |
| **The one trap** | Marking visited on **dequeue**. Mark on *enqueue*, or the work blows up. |
| **Reach for it when** | Connections, dependencies, reachability - and every grid, which is a graph in disguise. |

---

## 1. Vocabulary

| Term | Meaning |
|------|---------|
| Vertex / node | a point |
| Edge | a connection `(u, v)`, possibly weighted |
| Directed | edges have direction |
| Degree | incident edges (in/out when directed) |
| Cycle | a path returning to its start |
| DAG | directed acyclic graph |
| Dense / sparse | `E` near `V^2` / `E` near `V` |

`V` = vertices, `E` = edges.

---

## 2. Representations

```cpp
vector<vector<int>> adj(V);              // adjacency list - the default
adj[u].push_back(v);

vector<vector<int>> matrix(V, vector<int>(V, 0));   // adjacency matrix
matrix[u][v] = 1;

vector<array<int,3>> edges;              // edge list: {u, v, weight}

vector<vector<pair<int,int>>> weighted(V);          // {neighbour, weight}
```

| | Adjacency list | Adjacency matrix |
|---|----------------|------------------|
| Space | `O(V + E)` | `O(V^2)` |
| Edge exists? | `O(degree)` | `O(1)` |
| Iterate neighbours | `O(degree)` | `O(V)` |
| Best for | sparse (most graphs) | dense |

With integer vertex ids, `vector<vector<int>>` beats
`unordered_map<int, vector<int>>` on both memory and cache behaviour. Relabel
string vertices to indices once, up front.

---

## 3. Traversals - both `O(V + E)`

```cpp
// BFS
queue<int> q;
vector<bool> visited(V, false);
q.push(start);
visited[start] = true;                   // mark on ENQUEUE
while (!q.empty()) {
    int node = q.front(); q.pop();
    for (int next : adj[node])
        if (!visited[next]) { visited[next] = true; q.push(next); }
}
```

> Marking on dequeue instead lets the same vertex enter the queue repeatedly -
> a classic source of TLE.

BFS gives the shortest path when every edge costs the same. DFS (recursive or
with an explicit stack) is for cycles, topological order and connectivity.

---

## 4. The algorithm menu

| Question | Algorithm | Complexity |
|----------|-----------|-----------|
| Shortest path, unweighted | BFS | `O(V + E)` |
| Shortest path, non-negative weights | Dijkstra + `priority_queue` | `O(E log V)` |
| Shortest path with negative weights | Bellman-Ford | `O(V * E)` |
| All-pairs shortest paths | Floyd-Warshall | `O(V^3)` |
| Dependency order | Topological sort (Kahn / DFS) | `O(V + E)` |
| Cycle, directed | three-colour DFS, or Kahn | `O(V + E)` |
| Cycle, undirected | DFS with parent, or union-find | `O(V + E)` |
| Connected components | BFS/DFS per unvisited vertex | `O(V + E)` |
| Two-colourable? | BFS colouring | `O(V + E)` |
| Minimum spanning tree | Kruskal / Prim | `O(E log E)` |
| Strongly connected components | **Kosaraju** or **Tarjan** | `O(V + E)` |

---

## 5. Dijkstra in C++ specifically

`priority_queue` is a **max**-heap and has no decrease-key, so:

```cpp
priority_queue<pair<long long,int>,
               vector<pair<long long,int>>,
               greater<>> pq;             // min-heap on distance
pq.push({0, start});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;            // stale entry - skip it
    for (auto [v, w] : adj[u])
        if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
}
```

Use `long long` for distances: summed weights overflow `int` quickly.
Initialise to `LLONG_MAX / 2` so `dist[u] + w` cannot overflow during
relaxation.

---

## 6. All pairs, and strongly connected components

### Floyd-Warshall - every pair at once

A DP over *which vertices may sit in the middle of the path*:

```text
dist[k][u][v] = shortest u->v path using only vertices 0..k-1 as intermediates

dist[k+1][u][v] = min( dist[k][u][v],                    skip k
                       dist[k][u][k] + dist[k][k][v] )   route through k
```

The `k` dimension drops out - the update is safe in place - leaving three loops
and `O(V^3)`.

> **`k` must be the outermost loop.** Swapping the loop order is the single most
> common bug here: it computes paths through `k` before `k` itself is finished.

Handles negative edges (Dijkstra cannot), and a **negative cycle** announces
itself as `dist[v][v] < 0`. Choose it over `V` runs of Dijkstra when weights can
be negative, when the graph is dense (`V^3` beats `V*E log V` once `E` nears
`V^2`), or when you want six lines instead of sixty.

**Warshall's transitive closure** is the same triple loop with `(min, +)`
replaced by `(or, and)` - "is there a path" instead of "how short is it".

### Strongly connected components

An **SCC** is a maximal set of vertices where every one reaches every other.
Contract each SCC to a single node and *any* directed graph becomes a DAG - the
**condensation**. That is why SCCs underpin 2-SAT, deadlock detection and most
DP-on-a-cyclic-graph problems: find the components, then DP on the DAG.

| | Kosaraju | Tarjan |
|---|----------|--------|
| Passes | 2 (needs the reversed graph) | **1** |
| Extra memory | the reversal, `O(V + E)` | two ints per vertex |
| Output order | arbitrary | reverse topological order of the condensation |
| To remember | easier | fiddlier |

**Kosaraju.** DFS once, pushing each vertex as it *finishes*. Then DFS the
**reversed** graph, taking starts off that stack. Reversing edges leaves SCCs
unchanged (if `u` reaches `v` and `v` reaches `u`, both survive reversal) but
flips every edge *between* components - so the second pass, beginning at the
component that finished last, cannot escape, and each tree it finds is exactly
one SCC.

**Tarjan.** Give each vertex an `index` (visit timestamp) and a `lowlink` (the
smallest index reachable from its subtree using at most one back edge). A vertex
with `lowlink == index` **roots** an SCC - nothing below it found a way higher -
so everything stacked above it pops off as one component.

> The whole subtlety is the **on-stack** test. An edge into an already *finished*
> vertex leads to a component that is already closed; following it would merge
> two distinct SCCs. `on_stack` is what separates a back edge (same component)
> from a cross edge (a different, finished one).

---

## 7. Grids are graphs

```cpp
const int dr[] = {0, 0, 1, -1};
const int dc[] = {1, -1, 0, 0};
```

Islands, flood fill and maze shortest paths are BFS/DFS with the coordinates
as vertices - no adjacency list needed.

---

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `bfs` / `dfs` | `O(V + E)` | `O(V)` |
| `shortestPathUnweighted` | `O(V + E)` | `O(V)` |
| `connectedComponents` | `O(V + E)` | `O(V)` |
| `hasCycleDirected` / `Undirected` | `O(V + E)` | `O(V)` |
| `topologicalSortKahn` / `Dfs` | `O(V + E)` | `O(V)` |
| `isBipartite` | `O(V + E)` | `O(V)` |
| `dijkstra` | `O(E log V)` | `O(V)` |
| `bellmanFord` | `O(V * E)` | `O(V)` |
| `floydWarshall` | `O(V^3)` | `O(V^2)` |
| `transitiveClosure` | `O(V^3)` | `O(V^2)` |
| `sccKosaraju` / `sccTarjan` | `O(V + E)` | `O(V + E)` |
| `countIslands` | `O(rows * cols)` | `O(rows * cols)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall graphs.cpp -o graphs && ./graphs
```

---

[<- 13 Heaps & Priority Queue](../13-Heaps-Priority-Queue/) · [All topics](../../README.md) · [15 Dynamic Programming ->](../15-Dynamic-Programming/)
