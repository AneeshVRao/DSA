# 14 - Graphs (Go)

> Trees were graphs with training wheels. Remove "no cycles" and every
> traversal needs a visited set.

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

```go
adj := make([][]int, n)                 // adjacency list - the default
adj[u] = append(adj[u], v)

type Edge struct{ To, Weight int }
weighted := make([][]Edge, n)           // weighted adjacency list

matrix := make([][]int, n)              // adjacency matrix
for i := range matrix { matrix[i] = make([]int, n) }

type WeightedEdge struct{ From, To, Weight int }
edges := []WeightedEdge{...}            // edge list (Bellman-Ford, Kruskal)
```

| | Adjacency list | Adjacency matrix |
|---|----------------|------------------|
| Space | `O(V + E)` | `O(V^2)` |
| Edge exists? | `O(degree)` | `O(1)` |
| Iterate neighbours | `O(degree)` | `O(V)` |

With integer vertices, `[][]int` beats `map[int][]int` on memory, speed and
determinism (map iteration order is randomised). Relabel string vertices to
indices once.

---

## 3. Traversals - both `O(V + E)`

```go
// BFS with a head index: q = q[1:] is O(1) but keeps the backing array alive
visited := make([]bool, n)
queue := []int{start}
visited[start] = true                    // mark on ENQUEUE
for head := 0; head < len(queue); head++ {
    node := queue[head]
    for _, next := range adj[node] {
        if !visited[next] {
            visited[next] = true
            queue = append(queue, next)
        }
    }
}
```

> Mark visited when enqueuing. Marking on dequeue lets a vertex enter the
> queue repeatedly and can blow up the work exponentially.

BFS gives shortest paths when all edges cost the same. DFS (recursive, since
Go grows stacks dynamically) handles cycles, topological order and
connectivity.

---

## 4. The algorithm menu

| Question | Algorithm | Complexity |
|----------|-----------|-----------|
| Shortest path, unweighted | BFS | `O(V + E)` |
| Shortest path, non-negative weights | Dijkstra + `container/heap` | `O(E log V)` |
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

## 5. Dijkstra in Go

`container/heap` gives you `heap.Fix` for a real decrease-key, but the simpler
push-duplicates-and-skip-stale approach is what most Go solutions use:

```go
if d > dist[u] { continue }              // stale entry
```

Use `math.MaxInt64 / 4` as INF so `dist[u] + w` cannot overflow during
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

```go
var dr = []int{0, 0, 1, -1}
var dc = []int{1, -1, 0, 0}
```

Islands, flood fill and maze shortest paths are BFS/DFS with the coordinates
as vertices - no adjacency list needed.

---

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `BFS` / `DFS` | `O(V + E)` | `O(V)` |
| `ShortestPathUnweighted` | `O(V + E)` | `O(V)` |
| `ConnectedComponents` | `O(V + E)` | `O(V)` |
| `HasCycleDirected` / `Undirected` | `O(V + E)` | `O(V)` |
| `TopologicalSortKahn` / `DFS` | `O(V + E)` | `O(V)` |
| `IsBipartite` | `O(V + E)` | `O(V)` |
| `Dijkstra` | `O(E log V)` | `O(V)` |
| `BellmanFord` | `O(V * E)` | `O(V)` |
| `FloydWarshall` | `O(V^3)` | `O(V^2)` |
| `TransitiveClosure` | `O(V^3)` | `O(V^2)` |
| `SCCKosaraju` / `SCCTarjan` | `O(V + E)` | `O(V + E)` |
| `CountIslands` | `O(rows * cols)` | `O(rows * cols)` |

## Run the code

```bash
go run graphs.go
```

---

[<- 13 Heaps & Priority Queue](../13-Heaps-Priority-Queue/) · [All topics](../../README.md) · [15 Dynamic Programming ->](../15-Dynamic-Programming/)
