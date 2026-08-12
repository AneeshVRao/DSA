// 14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
// Dijkstra, Bellman-Ford, and grids as implicit graphs.
//
// Run:  go run graphs.go
package main

import (
	"container/heap"
	"fmt"
	"math"
	"sort"
)

// INF is safely below overflow: dist + weight cannot wrap.
const INF = math.MaxInt64 / 4

// ============================================================================
// 1. Representation
// ============================================================================

// AdjList uses integer vertices: [][]int beats map[int][]int on memory, speed
// and determinism (map iteration order is randomised in Go).
type AdjList [][]int

// Edge is one weighted out-edge.
type Edge struct{ To, Weight int }

// WeightedAdj is the weighted adjacency list.
type WeightedAdj [][]Edge

// WeightedEdge is an entry in an edge list (what Bellman-Ford consumes).
type WeightedEdge struct{ From, To, Weight int }

func BuildUndirected(n int, pairs [][2]int) AdjList {
	adj := make(AdjList, n)
	for _, p := range pairs {
		adj[p[0]] = append(adj[p[0]], p[1])
		adj[p[1]] = append(adj[p[1]], p[0]) // undirected = both directions
	}
	return adj
}

// ToMatrix is O(V^2) space with O(1) edge lookup - worth it only for dense
// graphs or heavy "is there an edge?" querying.
func (adj AdjList) ToMatrix() [][]int {
	n := len(adj)
	matrix := make([][]int, n)
	for i := range matrix {
		matrix[i] = make([]int, n)
	}
	for u, neighbours := range adj {
		for _, v := range neighbours {
			matrix[u][v] = 1
		}
	}
	return matrix
}

// ============================================================================
// 2. Traversals
// ============================================================================

// BFS visits level by level. O(V + E).
// Mark visited on ENQUEUE: marking on dequeue lets a vertex enter the queue
// many times and can blow the work up exponentially.
func BFS(adj AdjList, start int) []int {
	visited := make([]bool, len(adj))
	visited[start] = true
	queue := []int{start}
	var order []int

	for head := 0; head < len(queue); head++ { // head index, no reslicing
		node := queue[head]
		order = append(order, node)
		for _, next := range adj[node] {
			if !visited[next] {
				visited[next] = true
				queue = append(queue, next)
			}
		}
	}
	return order
}

// DFSRecursive uses the call stack. O(V + E). Go grows stacks dynamically, so
// depth is rarely a problem here.
func DFSRecursive(adj AdjList, start int) []int {
	visited := make([]bool, len(adj))
	var order []int

	var walk func(int)
	walk = func(node int) {
		visited[node] = true
		order = append(order, node)
		for _, next := range adj[node] {
			if !visited[next] {
				walk(next)
			}
		}
	}

	walk(start)
	return order
}

// DFSIterative uses an explicit stack. Pushing neighbours in reverse makes
// the visit order match the recursive version.
func DFSIterative(adj AdjList, start int) []int {
	visited := make([]bool, len(adj))
	var order []int
	stack := []int{start}

	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if visited[node] {
			continue
		}
		visited[node] = true
		order = append(order, node)
		for i := len(adj[node]) - 1; i >= 0; i-- {
			if !visited[adj[node][i]] {
				stack = append(stack, adj[node][i])
			}
		}
	}
	return order
}

// ShortestPathUnweighted returns the fewest-edges path, or nil.
// BFS is correct here because it expands in distance order: the first time we
// reach goal, no shorter route exists.
func ShortestPathUnweighted(adj AdjList, start, goal int) []int {
	if start == goal {
		return []int{start}
	}
	parent := make([]int, len(adj))
	for i := range parent {
		parent[i] = -1
	}
	parent[start] = start
	queue := []int{start}

	for head := 0; head < len(queue); head++ {
		node := queue[head]
		for _, next := range adj[node] {
			if parent[next] != -1 {
				continue
			}
			parent[next] = node
			if next == goal {
				path := []int{goal} // walk the parents back
				for path[len(path)-1] != start {
					path = append(path, parent[path[len(path)-1]])
				}
				for lo, hi := 0, len(path)-1; lo < hi; lo, hi = lo+1, hi-1 {
					path[lo], path[hi] = path[hi], path[lo]
				}
				return path
			}
			queue = append(queue, next)
		}
	}
	return nil
}

func ConnectedComponents(adj AdjList) [][]int {
	visited := make([]bool, len(adj))
	var components [][]int
	for v := range adj {
		if visited[v] {
			continue
		}
		component := BFS(adj, v)
		for _, u := range component {
			visited[u] = true
		}
		sort.Ints(component)
		components = append(components, component)
	}
	return components
}

// ============================================================================
// 3. Cycle detection
// ============================================================================

const (
	white = 0 // unvisited
	grey  = 1 // on the current recursion path
	black = 2 // finished
)

// HasCycleDirected uses three-colour DFS. An edge to a GREY vertex closes a
// cycle; an edge to BLACK is fine, since that subtree is already cycle-free.
func HasCycleDirected(adj AdjList) bool {
	colour := make([]int, len(adj))

	var walk func(int) bool
	walk = func(node int) bool {
		colour[node] = grey
		for _, next := range adj[node] {
			if colour[next] == grey {
				return true // back edge
			}
			if colour[next] == white && walk(next) {
				return true
			}
		}
		colour[node] = black
		return false
	}

	for v := range adj {
		if colour[v] == white && walk(v) {
			return true
		}
	}
	return false
}

// HasCycleUndirected tracks the parent: every undirected edge looks like a
// back edge to the vertex you came from, so the parent must be excluded -
// but only the parent.
func HasCycleUndirected(adj AdjList) bool {
	visited := make([]bool, len(adj))

	var walk func(node, parent int) bool
	walk = func(node, parent int) bool {
		visited[node] = true
		for _, next := range adj[node] {
			if !visited[next] {
				if walk(next, node) {
					return true
				}
			} else if next != parent {
				return true // visited and not where we came from
			}
		}
		return false
	}

	for v := range adj {
		if !visited[v] && walk(v, -1) {
			return true
		}
	}
	return false
}

// ============================================================================
// 4. Topological sort
// ============================================================================

// TopologicalSortKahn repeatedly takes a vertex with in-degree 0. O(V + E).
// Returns nil on a cycle: if fewer than V vertices come out, the rest are
// stuck in one - which is why "course schedule" problems are this algorithm.
func TopologicalSortKahn(adj AdjList) []int {
	n := len(adj)
	inDegree := make([]int, n)
	for _, neighbours := range adj {
		for _, v := range neighbours {
			inDegree[v]++
		}
	}

	// A sorted ready-set makes the output deterministic (any valid order works).
	var ready []int
	for v := 0; v < n; v++ {
		if inDegree[v] == 0 {
			ready = append(ready, v)
		}
	}
	sort.Ints(ready)

	var order []int
	for len(ready) > 0 {
		node := ready[0]
		ready = ready[1:]
		order = append(order, node)
		for _, next := range adj[node] {
			inDegree[next]--
			if inDegree[next] == 0 {
				ready = append(ready, next)
			}
		}
	}

	if len(order) != n {
		return nil // a cycle swallowed the remaining vertices
	}
	return order
}

// TopologicalSortDFS appends on FINISH and reverses. A vertex is appended only
// after all its descendants, so the reversed finish order is topological.
func TopologicalSortDFS(adj AdjList) []int {
	colour := make([]int, len(adj))
	var order []int

	var walk func(int) bool
	walk = func(node int) bool {
		colour[node] = grey
		for _, next := range adj[node] {
			if colour[next] == grey {
				return false // cycle: no valid order
			}
			if colour[next] == white && !walk(next) {
				return false
			}
		}
		colour[node] = black
		order = append(order, node) // post-order append
		return true
	}

	for v := range adj {
		if colour[v] == white && !walk(v) {
			return nil
		}
	}
	for lo, hi := 0, len(order)-1; lo < hi; lo, hi = lo+1, hi-1 {
		order[lo], order[hi] = order[hi], order[lo]
	}
	return order
}

// ============================================================================
// 5. Colouring
// ============================================================================

// IsBipartite 2-colours the graph with BFS. A graph is bipartite exactly when
// it contains no odd-length cycle. O(V + E).
func IsBipartite(adj AdjList) bool {
	colour := make([]int, len(adj))
	for i := range colour {
		colour[i] = -1
	}

	for start := range adj {
		if colour[start] != -1 {
			continue
		}
		colour[start] = 0
		queue := []int{start}
		for head := 0; head < len(queue); head++ {
			node := queue[head]
			for _, next := range adj[node] {
				if colour[next] == -1 {
					colour[next] = 1 - colour[node]
					queue = append(queue, next)
				} else if colour[next] == colour[node] {
					return false
				}
			}
		}
	}
	return true
}

// ============================================================================
// 6. Weighted shortest paths
// ============================================================================

type pqItem struct{ distance, node int }

type pqHeap []pqItem

func (h pqHeap) Len() int           { return len(h) }
func (h pqHeap) Less(i, j int) bool { return h[i].distance < h[j].distance }
func (h pqHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *pqHeap) Push(x any)        { *h = append(*h, x.(pqItem)) }
func (h *pqHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// Dijkstra needs NON-NEGATIVE weights: it finalises the closest unfinished
// vertex, and a negative edge could later make a finalised vertex cheaper.
// Duplicate pushes plus a staleness check replace decrease-key. O(E log V).
func Dijkstra(adj WeightedAdj, start int) []int {
	dist := make([]int, len(adj))
	for i := range dist {
		dist[i] = INF
	}
	dist[start] = 0

	pq := &pqHeap{{distance: 0, node: start}}
	heap.Init(pq)

	for pq.Len() > 0 {
		item := heap.Pop(pq).(pqItem)
		if item.distance > dist[item.node] {
			continue // stale entry: we already found something better
		}
		for _, e := range adj[item.node] {
			if candidate := item.distance + e.Weight; candidate < dist[e.To] {
				dist[e.To] = candidate
				heap.Push(pq, pqItem{distance: candidate, node: e.To})
			}
		}
	}
	return dist
}

// BellmanFord handles NEGATIVE weights. Any shortest path uses at most V-1
// edges, so V-1 relaxation rounds suffice; if a Vth round still improves
// something, a negative cycle exists and "shortest" is undefined.
// Returns (distances, false) when a negative cycle is reachable.
func BellmanFord(n int, edges []WeightedEdge, start int) ([]int, bool) {
	dist := make([]int, n)
	for i := range dist {
		dist[i] = INF
	}
	dist[start] = 0

	for round := 0; round < n-1; round++ {
		changed := false
		for _, e := range edges {
			if dist[e.From] < INF && dist[e.From]+e.Weight < dist[e.To] {
				dist[e.To] = dist[e.From] + e.Weight
				changed = true
			}
		}
		if !changed {
			break // already stable
		}
	}

	for _, e := range edges { // the Vth round
		if dist[e.From] < INF && dist[e.From]+e.Weight < dist[e.To] {
			return dist, false // negative cycle
		}
	}
	return dist, true
}

// ============================================================================
// 7. Grids as implicit graphs
// ============================================================================

var dr = []int{0, 0, 1, -1}
var dc = []int{1, -1, 0, 0}

// CountIslands counts connected '1' regions. The grid IS the graph: each cell
// is a vertex and its four neighbours are the edges. Sinking each island as we
// find it doubles as the visited set. O(rows * cols).
func CountIslands(grid [][]byte) int {
	if len(grid) == 0 || len(grid[0]) == 0 {
		return 0
	}
	rows, cols, islands := len(grid), len(grid[0]), 0

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] != '1' {
				continue
			}
			islands++
			stack := [][2]int{{r, c}}
			grid[r][c] = '0' // mark on push
			for len(stack) > 0 {
				cell := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				for d := 0; d < 4; d++ {
					nr, nc := cell[0]+dr[d], cell[1]+dc[d]
					if nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
						grid[nr][nc] == '1' {
						grid[nr][nc] = '0'
						stack = append(stack, [2]int{nr, nc})
					}
				}
			}
		}
	}
	return islands
}

// ShortestPathGrid returns the fewest steps through 0 cells from the top-left
// to the bottom-right, or -1. BFS, because every move costs the same.
func ShortestPathGrid(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 || grid[0][0] != 0 {
		return -1
	}
	rows, cols := len(grid), len(grid[0])
	if grid[rows-1][cols-1] != 0 {
		return -1
	}

	seen := make([][]bool, rows)
	for i := range seen {
		seen[i] = make([]bool, cols)
	}
	type state struct{ r, c, steps int }
	queue := []state{{0, 0, 1}}
	seen[0][0] = true

	for head := 0; head < len(queue); head++ {
		s := queue[head]
		if s.r == rows-1 && s.c == cols-1 {
			return s.steps
		}
		for d := 0; d < 4; d++ {
			nr, nc := s.r+dr[d], s.c+dc[d]
			if nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
				grid[nr][nc] == 0 && !seen[nr][nc] {
				seen[nr][nc] = true
				queue = append(queue, state{nr, nc, s.steps + 1})
			}
		}
	}
	return -1
}

// ============================================================================
// demo
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func equal(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func main() {
	//   0 --- 1
	//   |   / |
	//   |  /  |
	//   2 --- 3      4 (isolated)
	undirected := BuildUndirected(5, [][2]int{{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}})

	assert(equal(BFS(undirected, 0), []int{0, 1, 2, 3}), "bfs")
	assert(equal(DFSRecursive(undirected, 0), []int{0, 1, 2, 3}), "dfs recursive")
	assert(equal(DFSIterative(undirected, 0), DFSRecursive(undirected, 0)),
		"iterative dfs matches recursive")

	matrix := undirected.ToMatrix()
	assert(matrix[0][1] == 1 && matrix[1][0] == 1, "matrix is symmetric")
	assert(matrix[0][3] == 0, "no edge 0-3")

	assert(equal(ShortestPathUnweighted(undirected, 0, 3), []int{0, 1, 3}), "shortest path")
	assert(equal(ShortestPathUnweighted(undirected, 0, 0), []int{0}), "trivial path")
	assert(ShortestPathUnweighted(undirected, 0, 4) == nil, "unreachable")

	components := ConnectedComponents(undirected)
	assert(len(components) == 2, "two components")
	assert(equal(components[0], []int{0, 1, 2, 3}) && equal(components[1], []int{4}),
		"component contents")

	assert(HasCycleUndirected(undirected), "square has a cycle")
	tree := BuildUndirected(3, [][2]int{{0, 1}, {0, 2}})
	assert(!HasCycleUndirected(tree), "a tree has no cycle")

	// DAG: 5 -> 2 -> 3 -> 1, 5 -> 0, 4 -> 0, 4 -> 1
	dag := make(AdjList, 6)
	dag[5] = []int{2, 0}
	dag[4] = []int{0, 1}
	dag[2] = []int{3}
	dag[3] = []int{1}
	assert(!HasCycleDirected(dag), "dag has no cycle")

	cyclic := AdjList{{1}, {2}, {0}}
	assert(HasCycleDirected(cyclic), "cycle detected")

	order := TopologicalSortKahn(dag)
	assert(len(order) == 6, "all vertices ordered")
	position := make([]int, 6)
	for i, v := range order {
		position[v] = i
	}
	for u, neighbours := range dag { // verify every edge
		for _, v := range neighbours {
			assert(position[u] < position[v], "edge respected by kahn")
		}
	}
	assert(TopologicalSortKahn(cyclic) == nil, "no topological order for a cycle")

	dfsOrder := TopologicalSortDFS(dag)
	assert(len(dfsOrder) == 6, "dfs order covers everything")
	dfsPosition := make([]int, 6)
	for i, v := range dfsOrder {
		dfsPosition[v] = i
	}
	for u, neighbours := range dag {
		for _, v := range neighbours {
			assert(dfsPosition[u] < dfsPosition[v], "edge respected by dfs sort")
		}
	}
	assert(TopologicalSortDFS(cyclic) == nil, "dfs sort detects the cycle")

	square := BuildUndirected(4, [][2]int{{0, 1}, {1, 2}, {2, 3}, {3, 0}})
	assert(IsBipartite(square), "even cycle is bipartite")
	triangle := BuildUndirected(3, [][2]int{{0, 1}, {1, 2}, {2, 0}})
	assert(!IsBipartite(triangle), "odd cycle is not bipartite")

	weighted := make(WeightedAdj, 4)
	weighted[0] = []Edge{{To: 1, Weight: 4}, {To: 2, Weight: 1}}
	weighted[2] = []Edge{{To: 1, Weight: 2}, {To: 3, Weight: 5}}
	weighted[1] = []Edge{{To: 3, Weight: 1}}
	dist := Dijkstra(weighted, 0)
	assert(dist[0] == 0, "distance to self")
	assert(dist[2] == 1, "direct edge")
	assert(dist[1] == 3, "0->2->1 beats the direct 0->1")
	assert(dist[3] == 4, "0->2->1->3")

	edges := []WeightedEdge{
		{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5},
	}
	bf, ok := BellmanFord(4, edges, 0)
	assert(ok, "no negative cycle")
	assert(equal(bf, dist), "bellman-ford agrees with dijkstra")

	negativeOk, ok := BellmanFord(3, []WeightedEdge{{0, 1, 5}, {1, 2, -3}}, 0)
	assert(ok && negativeOk[2] == 2, "negative weights are fine")
	_, ok = BellmanFord(3, []WeightedEdge{{0, 1, 1}, {1, 2, -1}, {2, 1, -1}}, 0)
	assert(!ok, "negative cycle detected")

	grid := [][]byte{
		[]byte("11000"),
		[]byte("11000"),
		[]byte("00100"),
		[]byte("00011"),
	}
	assert(CountIslands(grid) == 3, "three islands")
	assert(CountIslands(nil) == 0, "empty grid")

	maze := [][]int{{0, 0, 1}, {1, 0, 1}, {1, 0, 0}}
	assert(ShortestPathGrid(maze) == 5, "maze path length")
	assert(ShortestPathGrid([][]int{{0, 1}, {1, 0}}) == -1, "blocked maze")

	fmt.Println("14-Graphs (Go): all checks passed")
}
