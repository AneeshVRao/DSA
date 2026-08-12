# 14 - Graphs (Python)

> Trees were graphs with training wheels: no cycles, one path between any two
> nodes. Remove those guarantees and you need a `visited` set - that is the
> whole difference.

## 1. Vocabulary

| Term | Meaning |
|------|---------|
| Vertex / node | a point |
| Edge | a connection; `(u, v)` |
| Directed | edges have a direction (one-way streets) |
| Weighted | edges carry a cost |
| Degree | number of incident edges (in-degree / out-degree when directed) |
| Path | a sequence of connected vertices |
| Cycle | a path that returns to its start |
| Connected | every vertex is reachable from every other (undirected) |
| DAG | directed acyclic graph - the shape topological sort needs |
| Dense / sparse | `E` near `V^2` / `E` near `V` |

Throughout: `V` = number of vertices, `E` = number of edges.

---

## 2. Representations

### Adjacency list - the default
```python
graph = {0: [1, 2], 1: [2], 2: []}          # or defaultdict(list)
```
Space `O(V + E)`. Iterating a vertex's neighbours is `O(degree)`. Checking
whether a specific edge exists is `O(degree)`.

### Adjacency matrix
```python
matrix = [[0] * V for _ in range(V)]
matrix[u][v] = 1
```
Space `O(V^2)`. Edge lookup is `O(1)`, but iterating neighbours is `O(V)` even
if there are none.

### Edge list
```python
edges = [(u, v, weight), ...]
```
Space `O(E)`. What Kruskal's MST and Bellman-Ford consume directly.

| | Adjacency list | Adjacency matrix |
|---|----------------|------------------|
| Space | `O(V + E)` | `O(V^2)` |
| Edge exists? | `O(degree)` | `O(1)` |
| Iterate neighbours | `O(degree)` | `O(V)` |
| Best for | sparse (most real graphs) | dense, or heavy edge queries |

**Use an adjacency list unless you have a specific reason not to.**

---

## 3. The two traversals

Both visit every vertex once and every edge once: `O(V + E)`.

| | BFS | DFS |
|---|-----|-----|
| Structure | queue (`deque`) | stack, or recursion |
| Order | level by level | as deep as possible first |
| Finds | **shortest path in an unweighted graph** | any path, cycles, topological order |
| Space | `O(V)` for the frontier (can be wide) | `O(V)` for the stack (can be deep) |

```python
# BFS
queue = deque([start])
visited = {start}
while queue:
    node = queue.popleft()
    for neighbour in graph[node]:
        if neighbour not in visited:
            visited.add(neighbour)       # mark on ENQUEUE, not on dequeue
            queue.append(neighbour)
```

> Mark visited when **enqueuing**. Marking on dequeue lets the same vertex
> enter the queue several times and can blow up to exponential work.

---

## 4. The algorithm menu

| Question | Algorithm | Complexity |
|----------|-----------|-----------|
| Shortest path, unweighted | BFS | `O(V + E)` |
| Shortest path, non-negative weights | **Dijkstra** (heap) | `O(E log V)` |
| Shortest path, negative weights allowed | **Bellman-Ford** | `O(V * E)` |
| Shortest path, all pairs | Floyd-Warshall | `O(V^3)` |
| Any valid order respecting dependencies | **Topological sort** (Kahn or DFS) | `O(V + E)` |
| Cycle in a directed graph | DFS with three colours, or Kahn | `O(V + E)` |
| Cycle in an undirected graph | DFS tracking the parent, or union-find | `O(V + E)` |
| Connected components | BFS/DFS from each unvisited vertex | `O(V + E)` |
| Two-colourable? | BFS/DFS colouring | `O(V + E)` |
| Cheapest spanning tree | Kruskal (union-find) or Prim (heap) | `O(E log E)` |
| Strongly connected components | **Kosaraju** or **Tarjan** | `O(V + E)` |

---

## 5. The three that need care

**Dijkstra** is greedy: always expand the closest unfinished vertex. That is
only correct with **non-negative** weights - a negative edge could make an
already-finalised vertex cheaper later. Use a heap of `(distance, vertex)` and
skip stale entries (`if d > dist[v]: continue`) rather than trying to
decrease-key.

**Bellman-Ford** relaxes every edge `V - 1` times, because any shortest path
has at most `V - 1` edges. A `V`th round that still improves something proves
a **negative cycle**.

**Topological sort** only exists for a DAG. Kahn's algorithm repeatedly
removes a vertex with in-degree 0; if fewer than `V` vertices come out, the
graph has a cycle - which is why "course schedule" problems are topological
sort in disguise.

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

A 2-D grid is an implicit graph: each cell is a vertex, and its up/down/left/
right neighbours are edges. Islands, flood fill, shortest path in a maze and
rotting oranges are all plain BFS/DFS with

```python
DIRECTIONS = ((0, 1), (0, -1), (1, 0), (-1, 0))
```

No adjacency list needed - the coordinates *are* the graph.

---

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `bfs` / `dfs` | `O(V + E)` | `O(V)` |
| `shortest_path_unweighted` | `O(V + E)` | `O(V)` |
| `connected_components` | `O(V + E)` | `O(V)` |
| `has_cycle_directed` / `_undirected` | `O(V + E)` | `O(V)` |
| `topological_sort_kahn` / `_dfs` | `O(V + E)` | `O(V)` |
| `is_bipartite` | `O(V + E)` | `O(V)` |
| `dijkstra` | `O(E log V)` | `O(V)` |
| `bellman_ford` | `O(V * E)` | `O(V)` |
| `floyd_warshall` | `O(V^3)` | `O(V^2)` |
| `transitive_closure` | `O(V^3)` | `O(V^2)` |
| `scc_kosaraju` / `scc_tarjan` | `O(V + E)` | `O(V + E)` |
| `count_islands` | `O(rows * cols)` | `O(rows * cols)` |

## Run the code

```bash
python graphs.py
```
