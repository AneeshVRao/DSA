# 14 - Graphs (JavaScript)

> Trees were graphs with training wheels. Remove "no cycles" and every
> traversal needs a `Set` of visited nodes.

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

> JavaScript has no built-in priority queue, so Dijkstra needs the heap from
> chapter 13. Using `sort()` inside the loop instead turns `O(E log V)` into
> `O(E * V log V)` - the most common way to get a TLE on this problem.

---

## 5. Grids are graphs

```js
const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
```

Islands, flood fill, rotting oranges and maze shortest paths are BFS/DFS with
coordinates as vertices. Encode a cell as `r * cols + c` when you need it in a
`Set`, or use a string key - the numeric form is faster.

---

## 6. Complexity of what is implemented here

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

## Run the code

```bash
node graphs.js
```
