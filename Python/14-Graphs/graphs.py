"""
14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
Dijkstra, Bellman-Ford, and grids as implicit graphs.

Run:  python graphs.py
"""

from __future__ import annotations

import heapq
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

    print("14-Graphs (Python): all checks passed")


if __name__ == "__main__":
    demo()
