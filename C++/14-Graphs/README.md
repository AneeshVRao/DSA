# 14 - Graphs (C++)

> Trees were graphs with training wheels. Remove the "no cycles" guarantee and
> everything needs a `visited` array.

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

## 6. Grids are graphs

```cpp
const int dr[] = {0, 0, 1, -1};
const int dc[] = {1, -1, 0, 0};
```

Islands, flood fill and maze shortest paths are BFS/DFS with the coordinates
as vertices - no adjacency list needed.

---

## 7. Complexity of what is implemented here

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
| `countIslands` | `O(rows * cols)` | `O(rows * cols)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall graphs.cpp -o graphs && ./graphs
```
