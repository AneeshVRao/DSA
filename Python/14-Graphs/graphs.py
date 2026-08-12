"""
14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
Dijkstra, Bellman-Ford, Floyd-Warshall, strongly connected components
(Kosaraju and Tarjan), and grids as implicit graphs.

Run:  python graphs.py
"""

from __future__ import annotations

import heapq
import random
from collections import defaultdict, deque
from typing import Iterable, Optional


# ============================================================================
# 1. Representation
# ============================================================================
class Graph:
    """Adjacency-list graph. O(V + E) space - the right default for sparse
    graphs, which is nearly all real ones."""

    def __init__(self, directed: bool = False) -> None:
        self.directed = directed
        self.adjacency: dict[int, list[int]] = defaultdict(list)
        self.vertices: set[int] = set()

    def add_edge(self, u: int, v: int) -> None:
        self.adjacency[u].append(v)
        self.vertices.update((u, v))
        if not self.directed:
            self.adjacency[v].append(u)      # undirected = both directions

    def neighbours(self, u: int) -> list[int]:
        return self.adjacency[u]

    def to_matrix(self) -> list[list[int]]:
        """Adjacency matrix: O(V^2) space, O(1) edge lookup.

        Worth it only for dense graphs or heavy "is there an edge?" querying.
        """
        n = max(self.vertices) + 1 if self.vertices else 0
        matrix = [[0] * n for _ in range(n)]
        for u in self.adjacency:
            for v in self.adjacency[u]:
                matrix[u][v] = 1
        return matrix


# ============================================================================
# 2. Traversals
# ============================================================================
def bfs(graph: dict[int, list[int]], start: int) -> list[int]:
    """Breadth-first: level by level. O(V + E) time, O(V) space.

    Mark visited on ENQUEUE. Marking on dequeue lets a vertex enter the queue
    many times and can explode the work exponentially.
    """
    visited = {start}
    order: list[int] = []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)
    return order


def dfs_recursive(graph: dict[int, list[int]], start: int) -> list[int]:
    """Depth-first via the call stack. O(V + E)."""
    visited: set[int] = set()
    order: list[int] = []

    def walk(node: int) -> None:
        visited.add(node)
        order.append(node)
        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                walk(neighbour)

    walk(start)
    return order


def dfs_iterative(graph: dict[int, list[int]], start: int) -> list[int]:
    """Same traversal with an explicit stack - no recursion depth limit.

    Pushing neighbours reversed makes the visit order match the recursive
    version, which makes the two comparable in tests.
    """
    visited: set[int] = set()
    order: list[int] = []
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbour in reversed(graph.get(node, [])):
            if neighbour not in visited:
                stack.append(neighbour)
    return order


def shortest_path_unweighted(graph: dict[int, list[int]],
                             start: int, goal: int) -> Optional[list[int]]:
    """BFS finds the fewest-edges path. O(V + E).

    BFS is correct here precisely because it expands in order of distance:
    the first time we reach `goal`, no shorter route exists.
    """
    if start == goal:
        return [start]
    parent: dict[int, int] = {start: start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbour in graph.get(node, []):
            if neighbour in parent:
                continue
            parent[neighbour] = node
            if neighbour == goal:
                path = [goal]                       # walk the parents back
                while path[-1] != start:
                    path.append(parent[path[-1]])
                return path[::-1]
            queue.append(neighbour)
    return None


def connected_components(graph: dict[int, list[int]],
                         vertices: Iterable[int]) -> list[list[int]]:
    """Group vertices reachable from each other. O(V + E)."""
    visited: set[int] = set()
    components: list[list[int]] = []
    for v in vertices:
        if v in visited:
            continue
        component = bfs(graph, v)
        visited.update(component)
        components.append(sorted(component))
    return components


# ============================================================================
# 3. Cycle detection
# ============================================================================
def has_cycle_directed(graph: dict[int, list[int]], vertices: Iterable[int]) -> bool:
    """Three-colour DFS. O(V + E).

    WHITE = unvisited, GREY = on the current recursion path, BLACK = finished.
    An edge back to a GREY vertex closes a cycle. An edge to a BLACK vertex is
    fine - that subtree is already known to be cycle-free.
    """
    WHITE, GREY, BLACK = 0, 1, 2
    colour: dict[int, int] = defaultdict(int)

    def walk(node: int) -> bool:
        colour[node] = GREY
        for neighbour in graph.get(node, []):
            if colour[neighbour] == GREY:
                return True                      # back edge: cycle
            if colour[neighbour] == WHITE and walk(neighbour):
                return True
        colour[node] = BLACK
        return False

    return any(colour[v] == WHITE and walk(v) for v in vertices)


def has_cycle_undirected(graph: dict[int, list[int]], vertices: Iterable[int]) -> bool:
    """DFS tracking the parent. O(V + E).

    Every undirected edge looks like a back edge to the vertex you just came
    from, so the parent must be excluded - but only once (a genuine second
    edge to the parent is a real cycle in a multigraph).
    """
    visited: set[int] = set()

    def walk(node: int, parent: int) -> bool:
        visited.add(node)
        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                if walk(neighbour, node):
                    return True
            elif neighbour != parent:
                return True                      # visited and not the parent
        return False

    return any(v not in visited and walk(v, -1) for v in vertices)


# ============================================================================
# 4. Topological sort
# ============================================================================
def topological_sort_kahn(graph: dict[int, list[int]],
                          vertices: Iterable[int]) -> Optional[list[int]]:
    """Kahn's algorithm: repeatedly take a vertex with in-degree 0. O(V + E).

    Returns None if the graph has a cycle - if fewer than V vertices come out,
    the remainder are stuck in a cycle. That is why "course schedule" style
    problems are topological sort in disguise.
    """
    vertices = list(vertices)
    in_degree: dict[int, int] = {v: 0 for v in vertices}
    for u in vertices:
        for v in graph.get(u, []):
            in_degree[v] = in_degree.get(v, 0) + 1

    queue = deque(sorted(v for v in vertices if in_degree[v] == 0))
    order: list[int] = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph.get(node, []):
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    return order if len(order) == len(vertices) else None


def topological_sort_dfs(graph: dict[int, list[int]],
                         vertices: Iterable[int]) -> Optional[list[int]]:
    """DFS variant: append on FINISH, then reverse. O(V + E).

    A vertex is appended only after all its descendants are done, so reversing
    the finish order yields a valid topological order.
    """
    WHITE, GREY, BLACK = 0, 1, 2
    colour: dict[int, int] = defaultdict(int)
    order: list[int] = []

    def walk(node: int) -> bool:
        colour[node] = GREY
        for neighbour in graph.get(node, []):
            if colour[neighbour] == GREY:
                return False                     # cycle: no valid order
            if colour[neighbour] == WHITE and not walk(neighbour):
                return False
        colour[node] = BLACK
        order.append(node)                       # post-order append
        return True

    for v in vertices:
        if colour[v] == WHITE and not walk(v):
            return None
    return order[::-1]


# ============================================================================
# 5. Colouring
# ============================================================================
def is_bipartite(graph: dict[int, list[int]], vertices: Iterable[int]) -> bool:
    """Can the vertices be 2-coloured so no edge joins same-coloured ends?

    BFS assigning alternating colours. O(V + E). A graph is bipartite exactly
    when it contains no odd-length cycle.
    """
    colour: dict[int, int] = {}
    for start in vertices:
        if start in colour:
            continue
        colour[start] = 0
        queue = deque([start])
        while queue:
            node = queue.popleft()
            for neighbour in graph.get(node, []):
                if neighbour not in colour:
                    colour[neighbour] = 1 - colour[node]
                    queue.append(neighbour)
                elif colour[neighbour] == colour[node]:
                    return False
    return True


# ============================================================================
# 6. Weighted shortest paths
# ============================================================================
def dijkstra(graph: dict[int, list[tuple[int, int]]],
             start: int) -> dict[int, float]:
    """Shortest distances from start with NON-NEGATIVE weights. O(E log V).

    Greedy: always finalise the closest unfinished vertex. That is only sound
    without negative edges - a negative edge could later make an
    already-finalised vertex cheaper.

    Python's heapq has no decrease-key, so we push duplicates and skip stale
    entries. That is the standard, and it does not change the complexity.
    """
    distances: dict[int, float] = defaultdict(lambda: float("inf"))
    distances[start] = 0
    heap: list[tuple[float, int]] = [(0, start)]

    while heap:
        distance, node = heapq.heappop(heap)
        if distance > distances[node]:
            continue                             # stale entry: already better
        for neighbour, weight in graph.get(node, []):
            candidate = distance + weight
            if candidate < distances[neighbour]:
                distances[neighbour] = candidate
                heapq.heappush(heap, (candidate, neighbour))

    return dict(distances)


def bellman_ford(edges: list[tuple[int, int, int]], vertices: Iterable[int],
                 start: int) -> Optional[dict[int, float]]:
    """Shortest distances allowing NEGATIVE weights. O(V * E).

    Any shortest path uses at most V-1 edges, so V-1 rounds of relaxing every
    edge suffice. If a Vth round still improves something, a negative cycle
    exists and "shortest" is undefined - we return None.
    """
    vertices = list(vertices)
    distances: dict[int, float] = {v: float("inf") for v in vertices}
    distances[start] = 0

    for _ in range(len(vertices) - 1):
        changed = False
        for u, v, weight in edges:
            if distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                changed = True
        if not changed:
            break                                # early exit: already stable

    for u, v, weight in edges:                   # the Vth round
        if distances[u] + weight < distances[v]:
            return None                          # negative cycle

    return distances


# ============================================================================
# 7. Grids as implicit graphs
# ============================================================================
DIRECTIONS = ((0, 1), (0, -1), (1, 0), (-1, 0))


def count_islands(grid: list[list[str]]) -> int:
    """Number of connected '1' regions. O(rows * cols).

    The grid IS the graph: each cell is a vertex and its four neighbours are
    the edges. Sinking each island as we find it doubles as the visited set.
    """
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1":
                continue
            islands += 1
            stack = [(r, c)]                     # iterative: no depth limit
            grid[r][c] = "0"                     # mark on push, like BFS
            while stack:
                cr, cc = stack.pop()
                for dr, dc in DIRECTIONS:
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                        grid[nr][nc] = "0"
                        stack.append((nr, nc))
    return islands


def shortest_path_grid(grid: list[list[int]]) -> int:
    """Fewest steps from the top-left to the bottom-right through 0 cells.

    BFS again, because every move costs 1. Returns -1 when unreachable.
    """
    if not grid or not grid[0] or grid[0][0] != 0:
        return -1
    rows, cols = len(grid), len(grid[0])
    if grid[rows - 1][cols - 1] != 0:
        return -1

    queue = deque([(0, 0, 1)])                   # row, col, steps
    seen = {(0, 0)}
    while queue:
        r, c, steps = queue.popleft()
        if (r, c) == (rows - 1, cols - 1):
            return steps
        for dr, dc in DIRECTIONS:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols
                    and grid[nr][nc] == 0 and (nr, nc) not in seen):
                seen.add((nr, nc))
                queue.append((nr, nc, steps + 1))
    return -1


# ============================================================================
# 8. All-pairs shortest paths
# ============================================================================
def floyd_warshall(matrix: list[list[float]]) -> list[list[float]]:
    """Shortest path between EVERY pair of vertices. O(V^3) time, O(V^2) space.

    Input is an adjacency matrix where matrix[u][v] is the edge weight and
    float("inf") means "no edge". Returns a new matrix of distances.

    The idea is a DP over which vertices are allowed as intermediates:

        dist[k][u][v] = shortest u->v path using only 0..k-1 in the middle

    Adding vertex k either helps or it does not:

        dist[k+1][u][v] = min(dist[k][u][v],                 # skip k
                              dist[k][u][k] + dist[k][k][v]) # route through k

    The k dimension can be dropped entirely - updating in place is safe because
    dist[u][k] and dist[k][v] are never improved by k itself (that would need a
    negative cycle). Hence three loops with k OUTERMOST. Swapping the loop order
    is the classic bug: it computes paths that use k before k is finished.

    Handles negative edges. A negative cycle shows up as dist[v][v] < 0.

    When to use it over |V| runs of Dijkstra:
      - negative edges present (Dijkstra cannot)
      - dense graph: O(V^3) beats O(V * E log V) once E approaches V^2
      - you want the code to be six lines
    """
    n = len(matrix)
    dist = [row[:] for row in matrix]       # copy: never mutate the input

    for k in range(n):                      # k OUTERMOST - see docstring
        for u in range(n):
            if dist[u][k] == float("inf"):  # no path into k, skip the row
                continue
            for v in range(n):
                if dist[u][k] + dist[k][v] < dist[u][v]:
                    dist[u][v] = dist[u][k] + dist[k][v]
    return dist


def transitive_closure(graph: dict[int, list[int]], n: int) -> list[list[bool]]:
    """reachable[u][v] - can v be reached from u? O(V^3). Warshall's algorithm.

    Floyd-Warshall with (min, +) replaced by (or, and): instead of "how short
    is the path", just "is there one". The same triple loop, on booleans.

    Note reachable[v][v] starts True - a vertex reaches itself by the empty
    path. If you want "reachable by a non-empty path" (i.e. is v on a cycle),
    start the diagonal False.
    """
    reachable = [[False] * n for _ in range(n)]
    for u in range(n):
        reachable[u][u] = True              # empty path
        for v in graph.get(u, []):
            reachable[u][v] = True

    for k in range(n):
        for u in range(n):
            if not reachable[u][k]:
                continue
            for v in range(n):
                if reachable[k][v]:
                    reachable[u][v] = True
    return reachable


# ============================================================================
# 9. Strongly connected components
# ============================================================================
def scc_kosaraju(graph: dict[int, list[int]], vertices: Iterable[int]) -> list[list[int]]:
    """Strongly connected components of a DIRECTED graph. O(V + E).

    An SCC is a maximal set of vertices where every one reaches every other.
    Contracting each SCC to a single node turns any directed graph into a DAG -
    the "condensation" - which is what makes 2-SAT and many DP-on-graph
    problems tractable.

    Kosaraju is two passes:

      1. DFS the graph, pushing each vertex onto a stack when it FINISHES.
         The stack now holds vertices in reverse finishing order.
      2. DFS the REVERSED graph, popping start vertices off that stack. Each
         tree found is exactly one SCC.

    Why it works: reversing every edge leaves the SCCs unchanged (if u reaches
    v and v reaches u, both still hold after reversal) but flips every edge
    BETWEEN components. So in the second pass, starting from the component that
    finished last, there is no way to escape into another component - the DFS
    is trapped inside exactly one SCC.

    Two linear passes, easy to remember. Tarjan below does it in one.
    """
    vertices = list(vertices)

    # Pass 1: order by finishing time. Iterative to survive deep graphs.
    visited: set[int] = set()
    order: list[int] = []
    for start in vertices:
        if start in visited:
            continue
        stack = [(start, iter(graph.get(start, [])))]
        visited.add(start)
        while stack:
            node, children = stack[-1]
            for child in children:
                if child not in visited:
                    visited.add(child)
                    stack.append((child, iter(graph.get(child, []))))
                    break
            else:
                order.append(node)          # all children done: node FINISHES
                stack.pop()

    # Reverse every edge.
    reversed_graph: dict[int, list[int]] = defaultdict(list)
    for u in vertices:
        for v in graph.get(u, []):
            reversed_graph[v].append(u)

    # Pass 2: DFS the reversal in reverse finishing order.
    seen: set[int] = set()
    components: list[list[int]] = []
    for start in reversed(order):
        if start in seen:
            continue
        component: list[int] = []
        stack = [start]
        seen.add(start)
        while stack:
            node = stack.pop()
            component.append(node)
            for neighbour in reversed_graph[node]:
                if neighbour not in seen:
                    seen.add(neighbour)
                    stack.append(neighbour)
        components.append(sorted(component))
    return components


def scc_tarjan(graph: dict[int, list[int]], vertices: Iterable[int]) -> list[list[int]]:
    """Strongly connected components in ONE DFS pass. O(V + E).

    Each vertex gets two numbers:
      - index:   when it was first visited (a timestamp)
      - lowlink: the smallest index reachable from its subtree, following at
                 most one edge back to a vertex still ON THE STACK

    A vertex with lowlink == index is the ROOT of an SCC: nothing in its
    subtree found a way back above it, so everything still stacked above it
    forms exactly one component.

    The "still on the stack" test is the entire subtlety. An edge to an already
    finished vertex leads to an SCC that was already closed off - following it
    would wrongly merge two components. The on_stack set distinguishes a
    back-edge (same component) from a cross-edge (different, finished one).

    One pass instead of Kosaraju's two, and it emits components in reverse
    topological order of the condensation for free.
    """
    index_of: dict[int, int] = {}
    lowlink: dict[int, int] = {}
    on_stack: set[int] = set()
    stack: list[int] = []
    components: list[list[int]] = []
    counter = 0

    for root in vertices:
        if root in index_of:
            continue

        # Iterative DFS: (node, iterator over its children).
        work: list[tuple[int, Iterable[int]]] = [(root, iter(graph.get(root, [])))]
        index_of[root] = lowlink[root] = counter
        counter += 1
        stack.append(root)
        on_stack.add(root)

        while work:
            node, children = work[-1]
            advanced = False
            for child in children:
                if child not in index_of:               # tree edge: descend
                    index_of[child] = lowlink[child] = counter
                    counter += 1
                    stack.append(child)
                    on_stack.add(child)
                    work.append((child, iter(graph.get(child, []))))
                    advanced = True
                    break
                if child in on_stack:                   # back edge, same SCC
                    lowlink[node] = min(lowlink[node], index_of[child])
                # else: cross edge into a CLOSED component - ignore it
            if advanced:
                continue

            work.pop()
            if work:                                    # propagate to the parent
                parent = work[-1][0]
                lowlink[parent] = min(lowlink[parent], lowlink[node])

            if lowlink[node] == index_of[node]:          # node roots an SCC
                component: list[int] = []
                while True:
                    member = stack.pop()
                    on_stack.discard(member)
                    component.append(member)
                    if member == node:
                        break
                components.append(sorted(component))

    return components


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    #   0 --- 1
    #   |   / |
    #   |  /  |
    #   2 --- 3      4 (isolated)
    undirected = Graph(directed=False)
    for u, v in [(0, 1), (0, 2), (1, 2), (1, 3), (2, 3)]:
        undirected.add_edge(u, v)
    undirected.vertices.add(4)
    g = undirected.adjacency

    assert bfs(g, 0) == [0, 1, 2, 3]
    assert dfs_recursive(g, 0) == [0, 1, 2, 3]
    assert dfs_iterative(g, 0) == dfs_recursive(g, 0)

    matrix = undirected.to_matrix()
    assert matrix[0][1] == 1 and matrix[1][0] == 1     # symmetric
    assert matrix[0][3] == 0

    assert shortest_path_unweighted(g, 0, 3) == [0, 1, 3]
    assert shortest_path_unweighted(g, 0, 0) == [0]
    assert shortest_path_unweighted(g, 0, 4) is None   # unreachable

    assert connected_components(g, sorted(undirected.vertices)) == [[0, 1, 2, 3], [4]]

    assert has_cycle_undirected(g, undirected.vertices)
    tree = {0: [1, 2], 1: [0], 2: [0]}                 # a tree has no cycle
    assert not has_cycle_undirected(tree, [0, 1, 2])

    # Directed acyclic: 5 -> 2 -> 3 -> 1, 5 -> 0, 4 -> 0, 4 -> 1
    dag = {5: [2, 0], 4: [0, 1], 2: [3], 3: [1], 0: [], 1: []}
    dag_vertices = [0, 1, 2, 3, 4, 5]
    assert not has_cycle_directed(dag, dag_vertices)

    cyclic = {0: [1], 1: [2], 2: [0]}
    assert has_cycle_directed(cyclic, [0, 1, 2])

    order = topological_sort_kahn(dag, dag_vertices)
    assert order is not None
    position = {v: i for i, v in enumerate(order)}
    for u in dag:                                       # verify every edge
        for v in dag[u]:
            assert position[u] < position[v]
    assert topological_sort_kahn(cyclic, [0, 1, 2]) is None

    dfs_order = topological_sort_dfs(dag, dag_vertices)
    assert dfs_order is not None
    dfs_position = {v: i for i, v in enumerate(dfs_order)}
    for u in dag:
        for v in dag[u]:
            assert dfs_position[u] < dfs_position[v]
    assert topological_sort_dfs(cyclic, [0, 1, 2]) is None

    square = {0: [1, 3], 1: [0, 2], 2: [1, 3], 3: [0, 2]}     # 4-cycle: even
    assert is_bipartite(square, [0, 1, 2, 3])
    triangle = {0: [1, 2], 1: [0, 2], 2: [0, 1]}              # 3-cycle: odd
    assert not is_bipartite(triangle, [0, 1, 2])

    #      (0)--4-->(1)--1-->(3)
    #        \       ^        ^
    #         1      2        5
    #          v    /        /
    #          (2)-'--------'
    weighted = {
        0: [(1, 4), (2, 1)],
        2: [(1, 2), (3, 5)],
        1: [(3, 1)],
        3: [],
    }
    distances = dijkstra(weighted, 0)
    assert distances[0] == 0
    assert distances[2] == 1
    assert distances[1] == 3          # 0->2->1 (3) beats 0->1 (4)
    assert distances[3] == 4          # 0->2->1->3
    assert 99 not in distances        # unreachable vertices never get a distance

    edges = [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5)]
    bf = bellman_ford(edges, [0, 1, 2, 3], 0)
    assert bf is not None
    assert all(bf[v] == distances[v] for v in [0, 1, 2, 3])   # agrees with Dijkstra

    # Negative weights are fine ...
    negative_ok = bellman_ford([(0, 1, 5), (1, 2, -3)], [0, 1, 2], 0)
    assert negative_ok is not None and negative_ok[2] == 2
    # ... but a negative CYCLE has no shortest path.
    negative_cycle = [(0, 1, 1), (1, 2, -1), (2, 1, -1)]
    assert bellman_ford(negative_cycle, [0, 1, 2], 0) is None

    grid = [
        list("11000"),
        list("11000"),
        list("00100"),
        list("00011"),
    ]
    assert count_islands(grid) == 3
    assert count_islands([]) == 0

    maze = [[0, 0, 1], [1, 0, 1], [1, 0, 0]]
    assert shortest_path_grid(maze) == 5
    assert shortest_path_grid([[0, 1], [1, 0]]) == -1     # blocked

    # --- Floyd-Warshall ------------------------------------------------------
    INF = float("inf")
    #  0 -> 1 (3), 1 -> 2 (1), 0 -> 2 (7), 2 -> 0 (2)
    weights: list[list[float]] = [
        [0, 3, 7],
        [INF, 0, 1],
        [2, INF, 0],
    ]
    apsp = floyd_warshall(weights)
    assert apsp[0][2] == 4                  # 0->1->2 beats the direct 7
    assert apsp[1][0] == 3                  # 1->2->0
    assert weights[0][2] == 7               # input was not mutated

    # Negative edges: Dijkstra would be wrong here, Floyd-Warshall is not.
    negative: list[list[float]] = [
        [0, 4, INF],
        [INF, 0, -3],
        [INF, INF, 0],
    ]
    assert floyd_warshall(negative)[0][2] == 1      # 4 + (-3)

    # A negative cycle shows up on the diagonal.
    cycle: list[list[float]] = [[0, 1, INF], [INF, 0, -5], [3, INF, 0]]
    assert floyd_warshall(cycle)[0][0] < 0

    # Against Dijkstra from every source, on random non-negative graphs.
    random.seed(14)
    for _ in range(40):
        n = random.randint(1, 12)
        dense: list[list[float]] = [[0 if u == v else INF for v in range(n)]
                                    for u in range(n)]
        weighted: dict[int, list[tuple[int, int]]] = defaultdict(list)
        for u in range(n):
            for v in range(n):
                if u != v and random.random() < 0.35:
                    w = random.randint(1, 20)
                    dense[u][v] = min(dense[u][v], w)
                    weighted[u].append((v, w))

        all_pairs = floyd_warshall(dense)
        for source in range(n):
            single = dijkstra(weighted, source)
            for target in range(n):
                expected = single.get(target, INF)
                assert all_pairs[source][target] == expected

    # --- Transitive closure --------------------------------------------------
    directed = {0: [1], 1: [2], 2: [0], 3: [2]}
    closure = transitive_closure(directed, 4)
    assert closure[0][2] and closure[2][1]          # around the cycle
    assert closure[3][0] and not closure[0][3]      # 3 is a one-way entrance
    assert all(closure[v][v] for v in range(4))     # empty path

    # Against BFS reachability on random graphs.
    for _ in range(40):
        n = random.randint(1, 12)
        adjacency: dict[int, list[int]] = defaultdict(list)
        for u in range(n):
            for v in range(n):
                if u != v and random.random() < 0.25:
                    adjacency[u].append(v)

        reach = transitive_closure(adjacency, n)
        for source in range(n):
            expected = set(bfs(adjacency, source))
            for target in range(n):
                assert reach[source][target] == (target in expected)

    # --- Strongly connected components ---------------------------------------
    #  0 -> 1 -> 2 -> 0   (one SCC),  3 -> 2  and  3 -> 4  (singletons)
    scc_graph = {0: [1], 1: [2], 2: [0], 3: [2, 4], 4: []}
    expected_sccs = [[0, 1, 2], [3], [4]]
    assert sorted(scc_kosaraju(scc_graph, range(5))) == expected_sccs
    assert sorted(scc_tarjan(scc_graph, range(5))) == expected_sccs

    # A DAG has one component per vertex; a full cycle has exactly one.
    dag = {0: [1, 2], 1: [3], 2: [3], 3: []}
    assert sorted(scc_tarjan(dag, range(4))) == [[0], [1], [2], [3]]
    ring = {i: [(i + 1) % 6] for i in range(6)}
    assert scc_tarjan(ring, range(6)) == [[0, 1, 2, 3, 4, 5]]

    # Both algorithms against the DEFINITION, via the transitive closure:
    # u and v share an SCC exactly when each reaches the other.
    for _ in range(60):
        n = random.randint(1, 11)
        adjacency = defaultdict(list)
        for u in range(n):
            for v in range(n):
                if u != v and random.random() < 0.22:
                    adjacency[u].append(v)

        reach = transitive_closure(adjacency, n)
        groups: dict[tuple[int, ...], list[int]] = {}
        for v in range(n):
            key = tuple(u for u in range(n) if reach[u][v] and reach[v][u])
            groups.setdefault(key, []).append(v)
        brute = sorted(sorted(members) for members in groups.values())

        assert sorted(scc_kosaraju(adjacency, range(n))) == brute
        assert sorted(scc_tarjan(adjacency, range(n))) == brute

    # Tarjan emits components in reverse topological order of the condensation:
    # every edge leaving a component points to one emitted EARLIER.
    for _ in range(30):
        n = random.randint(2, 10)
        adjacency = defaultdict(list)
        for u in range(n):
            for v in range(n):
                if u != v and random.random() < 0.22:
                    adjacency[u].append(v)

        order = scc_tarjan(adjacency, range(n))
        component_of = {v: i for i, members in enumerate(order) for v in members}
        for u in range(n):
            for v in adjacency[u]:
                assert component_of[v] <= component_of[u]

    print("14-Graphs (Python): all checks passed")
    print("  Floyd-Warshall cross-checked against Dijkstra from every source,")
    print("  Kosaraju and Tarjan against the transitive-closure definition")


if __name__ == "__main__":
    demo()
