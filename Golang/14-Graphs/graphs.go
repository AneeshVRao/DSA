// 14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
// Dijkstra, Bellman-Ford, Floyd-Warshall, strongly connected components
// (Kosaraju and Tarjan), and grids as implicit graphs.
//
// Run:  go run graphs.go
package main

import (
	"container/heap"
	"fmt"
	"math"
	"math/rand"
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
// 7. All-pairs shortest paths
// ============================================================================

// FloydWarshall returns the shortest path between EVERY pair of vertices.
// O(V^3) time, O(V^2) space.
//
// Input is an adjacency matrix where matrix[u][v] is the edge weight and INF
// means "no edge". Returns a NEW matrix; the caller's is untouched.
//
// A DP over which vertices may be used as intermediates:
//
//	dist[k][u][v] = shortest u->v path using only 0..k-1 in the middle
//
// Adding vertex k either helps or it does not:
//
//	dist[k+1][u][v] = min(dist[k][u][v],                  // skip k
//	                      dist[k][u][k] + dist[k][k][v])  // route through k
//
// The k dimension drops out entirely - updating in place is safe because
// dist[u][k] and dist[k][v] are never improved by k itself (that would require
// a negative cycle). Hence three loops with k OUTERMOST. Reordering them is the
// classic bug: it uses k before k is finished.
//
// Handles negative edges. A negative cycle shows as dist[v][v] < 0.
//
// Prefer it over |V| runs of Dijkstra when weights can be negative, when the
// graph is dense (V^3 beats V*E log V once E approaches V^2), or when you want
// six lines instead of sixty.
func FloydWarshall(matrix [][]int) [][]int {
	n := len(matrix)
	dist := make([][]int, n)
	for i := range dist {
		dist[i] = append([]int(nil), matrix[i]...) // copy, do not alias
	}

	for k := 0; k < n; k++ { // k OUTERMOST - see above
		for u := 0; u < n; u++ {
			if dist[u][k] >= INF {
				continue // no path into k, skip the row
			}
			for v := 0; v < n; v++ {
				if dist[k][v] < INF && dist[u][k]+dist[k][v] < dist[u][v] {
					dist[u][v] = dist[u][k] + dist[k][v]
				}
			}
		}
	}
	return dist
}

// TransitiveClosure answers "can v be reached from u?" for every pair. O(V^3).
//
// Warshall's algorithm: Floyd-Warshall with (min, +) replaced by (or, and).
// Instead of "how short is the path", just "is there one". Same triple loop, on
// booleans.
//
// reachable[v][v] starts true - a vertex reaches itself by the empty path. For
// "reachable by a NON-empty path" (i.e. is v on a cycle), start it false.
func TransitiveClosure(adj AdjList) [][]bool {
	n := len(adj)
	reachable := make([][]bool, n)
	for u := range reachable {
		reachable[u] = make([]bool, n)
		reachable[u][u] = true // empty path
		for _, v := range adj[u] {
			reachable[u][v] = true
		}
	}

	for k := 0; k < n; k++ {
		for u := 0; u < n; u++ {
			if !reachable[u][k] {
				continue
			}
			for v := 0; v < n; v++ {
				if reachable[k][v] {
					reachable[u][v] = true
				}
			}
		}
	}
	return reachable
}

// ============================================================================
// 8. Strongly connected components
// ============================================================================

// SCCKosaraju returns the strongly connected components of a directed graph.
// O(V + E).
//
// An SCC is a maximal set of vertices where every one reaches every other.
// Contracting each SCC to a single node turns any directed graph into a DAG -
// the "condensation" - which is what makes 2-SAT and DP-on-graphs tractable.
//
// Two passes:
//
//  1. DFS the graph, pushing each vertex when it FINISHES. The stack now
//     holds vertices in reverse finishing order.
//  2. DFS the REVERSED graph, taking start vertices off that stack. Each
//     tree found is exactly one SCC.
//
// Why it works: reversing every edge leaves the SCCs unchanged (if u reaches v
// and v reaches u, both still hold after reversal) but flips every edge BETWEEN
// components. So the second pass, starting from the component that finished
// last, cannot escape into another component - the DFS is trapped inside
// exactly one SCC.
func SCCKosaraju(adj AdjList) [][]int {
	n := len(adj)

	// Pass 1: order by finishing time. Iterative, to survive deep graphs.
	type frame struct{ node, next int }
	visited := make([]bool, n)
	order := make([]int, 0, n)

	for start := 0; start < n; start++ {
		if visited[start] {
			continue
		}
		visited[start] = true
		stack := []frame{{start, 0}}
		for len(stack) > 0 {
			top := &stack[len(stack)-1]
			if top.next < len(adj[top.node]) {
				child := adj[top.node][top.next]
				top.next++
				if !visited[child] {
					visited[child] = true
					stack = append(stack, frame{child, 0})
				}
			} else {
				order = append(order, top.node) // all children done: FINISHES
				stack = stack[:len(stack)-1]
			}
		}
	}

	reversed := make(AdjList, n) // flip every edge
	for u := 0; u < n; u++ {
		for _, v := range adj[u] {
			reversed[v] = append(reversed[v], u)
		}
	}

	// Pass 2: DFS the reversal in reverse finishing order.
	seen := make([]bool, n)
	components := [][]int{}
	for i := len(order) - 1; i >= 0; i-- {
		if seen[order[i]] {
			continue
		}
		component := []int{}
		todo := []int{order[i]}
		seen[order[i]] = true
		for len(todo) > 0 {
			node := todo[len(todo)-1]
			todo = todo[:len(todo)-1]
			component = append(component, node)
			for _, neighbour := range reversed[node] {
				if !seen[neighbour] {
					seen[neighbour] = true
					todo = append(todo, neighbour)
				}
			}
		}
		sort.Ints(component)
		components = append(components, component)
	}
	return components
}

// SCCTarjan returns the strongly connected components in ONE DFS pass. O(V + E).
//
// Each vertex gets two numbers:
//
//	index   - when it was first visited (a timestamp)
//	lowlink - the smallest index reachable from its subtree, following at most
//	          one edge back to a vertex still ON THE STACK
//
// A vertex with lowlink == index ROOTS an SCC: nothing in its subtree found a
// way back above it, so everything still stacked above it forms exactly one
// component.
//
// The "still on the stack" test is the entire subtlety. An edge into an already
// finished vertex leads to a CLOSED component; following it would wrongly merge
// two SCCs. onStack distinguishes a back edge (same component) from a cross
// edge (a different, finished one).
//
// One pass instead of Kosaraju's two, and it emits components in reverse
// topological order of the condensation for free.
func SCCTarjan(adj AdjList) [][]int {
	n := len(adj)
	index := make([]int, n)
	lowlink := make([]int, n)
	onStack := make([]bool, n)
	for i := range index {
		index[i] = -1
	}

	stack := []int{}
	components := [][]int{}
	counter := 0

	type frame struct{ node, next int }

	for root := 0; root < n; root++ {
		if index[root] != -1 {
			continue
		}

		index[root], lowlink[root] = counter, counter
		counter++
		stack = append(stack, root)
		onStack[root] = true
		work := []frame{{root, 0}}

		for len(work) > 0 {
			top := &work[len(work)-1]
			if top.next < len(adj[top.node]) {
				child := adj[top.node][top.next]
				top.next++
				if index[child] == -1 { // tree edge: descend
					index[child], lowlink[child] = counter, counter
					counter++
					stack = append(stack, child)
					onStack[child] = true
					work = append(work, frame{child, 0})
				} else if onStack[child] { // back edge, same SCC
					lowlink[top.node] = min(lowlink[top.node], index[child])
				}
				// else: cross edge into a CLOSED component - ignore it
				continue
			}

			finished := top.node
			work = work[:len(work)-1]
			if len(work) > 0 { // propagate to the parent
				parent := work[len(work)-1].node
				lowlink[parent] = min(lowlink[parent], lowlink[finished])
			}

			if lowlink[finished] == index[finished] { // roots an SCC
				component := []int{}
				for {
					member := stack[len(stack)-1]
					stack = stack[:len(stack)-1]
					onStack[member] = false
					component = append(component, member)
					if member == finished {
						break
					}
				}
				sort.Ints(component)
				components = append(components, component)
			}
		}
	}
	return components
}

// ============================================================================
// 9. Grids as implicit graphs
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

// sortComponents orders a component list by its first vertex, so two runs are
// comparable. Map iteration order is randomised in Go and both SCC algorithms
// emit components in their own order, so nothing is comparable without this.
func sortComponents(components [][]int) [][]int {
	sort.Slice(components, func(i, j int) bool {
		return components[i][0] < components[j][0]
	})
	return components
}

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

	// --- Floyd-Warshall ------------------------------------------------------
	//  0 -> 1 (3), 1 -> 2 (1), 0 -> 2 (7), 2 -> 0 (2)
	weightMatrix := [][]int{
		{0, 3, 7},
		{INF, 0, 1},
		{2, INF, 0},
	}
	apsp := FloydWarshall(weightMatrix)
	assert(apsp[0][2] == 4, "0->1->2 beats the direct edge")
	assert(apsp[1][0] == 3, "1->2->0")
	assert(weightMatrix[0][2] == 7, "input matrix was not mutated")

	// Negative edges: Dijkstra would be wrong here, Floyd-Warshall is not.
	negativeMatrix := [][]int{{0, 4, INF}, {INF, 0, -3}, {INF, INF, 0}}
	assert(FloydWarshall(negativeMatrix)[0][2] == 1, "4 + (-3) == 1")

	// A negative cycle shows up on the diagonal.
	cycleMatrix := [][]int{{0, 1, INF}, {INF, 0, -5}, {3, INF, 0}}
	assert(FloydWarshall(cycleMatrix)[0][0] < 0, "negative cycle on the diagonal")

	// Against Dijkstra from every source, on random non-negative graphs.
	rng := rand.New(rand.NewSource(14))
	for trial := 0; trial < 40; trial++ {
		n := rng.Intn(12) + 1
		dense := make([][]int, n)
		weightedRandom := make(WeightedAdj, n)
		for u := 0; u < n; u++ {
			dense[u] = make([]int, n)
			for v := 0; v < n; v++ {
				if u != v {
					dense[u][v] = INF
				}
			}
		}
		for u := 0; u < n; u++ {
			for v := 0; v < n; v++ {
				if u != v && rng.Float64() < 0.35 {
					w := rng.Intn(20) + 1
					dense[u][v] = min(dense[u][v], w)
					weightedRandom[u] = append(weightedRandom[u], Edge{v, w})
				}
			}
		}

		allPairs := FloydWarshall(dense)
		for source := 0; source < n; source++ {
			single := Dijkstra(weightedRandom, source)
			for target := 0; target < n; target++ {
				assert(allPairs[source][target] == single[target],
					"Floyd-Warshall agrees with Dijkstra")
			}
		}
	}

	// --- Transitive closure --------------------------------------------------
	reachGraph := AdjList{{1}, {2}, {0}, {2}} // 0->1->2->0, and 3->2
	closure := TransitiveClosure(reachGraph)
	assert(closure[0][2] && closure[2][1], "reachable around the cycle")
	assert(closure[3][0] && !closure[0][3], "3 is a one-way entrance")
	for v := 0; v < 4; v++ {
		assert(closure[v][v], "a vertex reaches itself by the empty path")
	}

	// Against BFS reachability on random graphs.
	for trial := 0; trial < 40; trial++ {
		n := rng.Intn(12) + 1
		adjacency := make(AdjList, n)
		for u := 0; u < n; u++ {
			for v := 0; v < n; v++ {
				if u != v && rng.Float64() < 0.25 {
					adjacency[u] = append(adjacency[u], v)
				}
			}
		}

		reach := TransitiveClosure(adjacency)
		for source := 0; source < n; source++ {
			expected := make([]bool, n)
			for _, v := range BFS(adjacency, source) {
				expected[v] = true
			}
			for target := 0; target < n; target++ {
				assert(reach[source][target] == expected[target],
					"closure agrees with BFS reachability")
			}
		}
	}

	// --- Strongly connected components ---------------------------------------
	//  0 -> 1 -> 2 -> 0 (one SCC), 3 -> 2 and 3 -> 4 (singletons)
	sccGraph := AdjList{{1}, {2}, {0}, {2, 4}, {}}
	const expectedSccs = "[[0 1 2] [3] [4]]"
	assert(fmt.Sprint(sortComponents(SCCKosaraju(sccGraph))) == expectedSccs,
		"Kosaraju finds the cycle and two singletons")
	assert(fmt.Sprint(sortComponents(SCCTarjan(sccGraph))) == expectedSccs,
		"Tarjan agrees")

	// A DAG has one component per vertex; a full cycle has exactly one.
	dagGraph := AdjList{{1, 2}, {3}, {3}, {}}
	assert(fmt.Sprint(sortComponents(SCCTarjan(dagGraph))) == "[[0] [1] [2] [3]]",
		"a DAG is all singletons")

	ring := make(AdjList, 6)
	for i := 0; i < 6; i++ {
		ring[i] = []int{(i + 1) % 6}
	}
	assert(fmt.Sprint(SCCTarjan(ring)) == "[[0 1 2 3 4 5]]", "a ring is one SCC")

	// Both algorithms against the DEFINITION, via the transitive closure:
	// u and v share an SCC exactly when each reaches the other.
	for trial := 0; trial < 60; trial++ {
		n := rng.Intn(11) + 1
		adjacency := make(AdjList, n)
		for u := 0; u < n; u++ {
			for v := 0; v < n; v++ {
				if u != v && rng.Float64() < 0.22 {
					adjacency[u] = append(adjacency[u], v)
				}
			}
		}

		reach := TransitiveClosure(adjacency)
		groups := map[string][]int{}
		for v := 0; v < n; v++ {
			key := []int{}
			for u := 0; u < n; u++ {
				if reach[u][v] && reach[v][u] {
					key = append(key, u)
				}
			}
			id := fmt.Sprint(key)
			groups[id] = append(groups[id], v)
		}
		brute := [][]int{}
		for _, members := range groups {
			brute = append(brute, members) // already ascending
		}
		expected := fmt.Sprint(sortComponents(brute))

		assert(fmt.Sprint(sortComponents(SCCKosaraju(adjacency))) == expected,
			"Kosaraju matches the definition")
		assert(fmt.Sprint(sortComponents(SCCTarjan(adjacency))) == expected,
			"Tarjan matches the definition")
	}

	// Tarjan emits components in reverse topological order of the condensation:
	// every edge leaving a component points to one emitted EARLIER.
	for trial := 0; trial < 30; trial++ {
		n := rng.Intn(9) + 2
		adjacency := make(AdjList, n)
		for u := 0; u < n; u++ {
			for v := 0; v < n; v++ {
				if u != v && rng.Float64() < 0.22 {
					adjacency[u] = append(adjacency[u], v)
				}
			}
		}

		order := SCCTarjan(adjacency)
		componentOf := make([]int, n)
		for i, members := range order {
			for _, v := range members {
				componentOf[v] = i
			}
		}
		for u := 0; u < n; u++ {
			for _, v := range adjacency[u] {
				assert(componentOf[v] <= componentOf[u],
					"Tarjan emits in reverse topological order")
			}
		}
	}

	fmt.Println("14-Graphs (Go): all checks passed")
	fmt.Println("  Floyd-Warshall cross-checked against Dijkstra from every source,")
	fmt.Println("  Kosaraju and Tarjan against the transitive-closure definition")
}
