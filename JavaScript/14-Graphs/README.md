# 14 - Graphs (JavaScript)

> Trees were graphs with training wheels. Remove "no cycles" and every
> traversal needs a `Set` of visited nodes.

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
| Edge | a connection `[u, v]`, possibly weighted |
| Directed | edges have direction |
| Degree | incident edges (in/out when directed) |
| Cycle | a path returning to its start |
| DAG | directed acyclic graph |
| Dense / sparse | `E` near `V^2` / `E` near `V` |

`V` = vertices, `E` = edges.

---

## 2. Representations

```js
// Adjacency list - the default
const graph = new Map([[0, [1, 2]], [1, [2]], [2, []]]);

// Weighted: [neighbour, weight] pairs
const weighted = new Map([[0, [[1, 4], [2, 1]]]]);

// Adjacency matrix
const matrix = Array.from({ length: V }, () => new Array(V).fill(0));

// Edge list
const edges = [[u, v, weight], ...];
```

| | Adjacency list | Adjacency matrix |
|---|----------------|------------------|
| Space | `O(V + E)` | `O(V^2)` |
| Edge exists? | `O(degree)` | `O(1)` |
| Iterate neighbours | `O(degree)` | `O(V)` |

Prefer a `Map` over an object: it keeps numeric keys numeric (an object would
stringify them) and `map.size` is `O(1)`.

---

## 3. Traversals - both `O(V + E)`

```js
// BFS with a head index - queue.shift() would be O(n) per step
const queue = [start];
let head = 0;
const visited = new Set([start]);
while (head < queue.length) {
  const node = queue[head++];
  for (const next of graph.get(node) ?? []) {
    if (!visited.has(next)) {
      visited.add(next);            // mark on ENQUEUE
      queue.push(next);
    }
  }
}
```

> Two JS-specific traps in four lines: use a head index instead of `shift()`,
> and mark visited when enqueuing (marking on dequeue lets a vertex enter the
> queue many times).

BFS gives shortest paths when every edge costs the same. DFS is for cycles,
topological order and connectivity - and should be **iterative** for large
graphs, since Node overflows at roughly 10k frames.

---

## 4. The algorithm menu

| Question | Algorithm | Complexity |
|----------|-----------|-----------|
| Shortest path, unweighted | BFS | `O(V + E)` |
| Shortest path, non-negative weights | Dijkstra + heap | `O(E log V)` |
| Shortest path with negative weights | Bellman-Ford | `O(V * E)` |
| Dependency order | Topological sort (Kahn / DFS) | `O(V + E)` |
| Cycle, directed | three-colour DFS, or Kahn | `O(V + E)` |
| Cycle, undirected | DFS with parent, or union-find | `O(V + E)` |
| Connected components | BFS/DFS per unvisited vertex | `O(V + E)` |
| Two-colourable? | BFS colouring | `O(V + E)` |
| All-pairs shortest paths | **Floyd-Warshall** | `O(V^3)` |
| Strongly connected components | **Kosaraju** or **Tarjan** | `O(V + E)` |

> JavaScript has no built-in priority queue, so Dijkstra needs the heap from
> chapter 13. Using `sort()` inside the loop instead turns `O(E log V)` into
> `O(E * V log V)` - the most common way to get a TLE on this problem.

---

## 5. All pairs, and strongly connected components

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

## 6. Grids are graphs

```js
const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
```

Islands, flood fill, rotting oranges and maze shortest paths are BFS/DFS with
coordinates as vertices. Encode a cell as `r * cols + c` when you need it in a
`Set`, or use a string key - the numeric form is faster.

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
| `floydWarshall` | `O(V^3)` | `O(V^2)` |
| `transitiveClosure` | `O(V^3)` | `O(V^2)` |
| `sccKosaraju` / `sccTarjan` | `O(V + E)` | `O(V + E)` |
| `countIslands` | `O(rows * cols)` | `O(rows * cols)` |

## Run the code

```bash
node graphs.js
```

---

[<- 13 Heaps & Priority Queue](../13-Heaps-Priority-Queue/) · [All topics](../../README.md) · [15 Dynamic Programming ->](../15-Dynamic-Programming/)
