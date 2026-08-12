# 14 - Graphs (Go)

> Trees were graphs with training wheels. Remove "no cycles" and every
> traversal needs a visited set.

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

## 6. Grids are graphs

```go
var dr = []int{0, 0, 1, -1}
var dc = []int{1, -1, 0, 0}
```

Islands, flood fill and maze shortest paths are BFS/DFS with the coordinates
as vertices - no adjacency list needed.

---

## 7. Complexity of what is implemented here

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
| `CountIslands` | `O(rows * cols)` | `O(rows * cols)` |

## Run the code

```bash
go run graphs.go
```
