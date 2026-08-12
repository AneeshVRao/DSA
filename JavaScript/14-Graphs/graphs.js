/**
 * 14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
 * Dijkstra, Bellman-Ford, and grids as implicit graphs.
 *
 * Run:  node graphs.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 0. A minimal binary heap (JS has none) - Dijkstra needs it
// ============================================================================
/** Same structure as chapter 13, trimmed to what Dijkstra uses. */
class MinHeap {
  #data = [];
  #compare;

  constructor(compare = (a, b) => a - b) {
    this.#compare = compare;
  }

  get size() {
    return this.#data.length;
  }

  push(value) {
    this.#data.push(value);
    let i = this.#data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#compare(this.#data[parent], this.#data[i]) <= 0) break;
      [this.#data[parent], this.#data[i]] = [this.#data[i], this.#data[parent]];
      i = parent;
    }
  }

  pop() {
    const top = this.#data[0];
    const last = this.#data.pop();
    if (this.#data.length) {
      this.#data[0] = last;
      let i = 0;
      for (;;) {
        let best = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        const n = this.#data.length;
        if (l < n && this.#compare(this.#data[l], this.#data[best]) < 0) best = l;
        if (r < n && this.#compare(this.#data[r], this.#data[best]) < 0) best = r;
        if (best === i) break;
        [this.#data[i], this.#data[best]] = [this.#data[best], this.#data[i]];
        i = best;
      }
    }
    return top;
  }
}

// ============================================================================
// 1. Representation
// ============================================================================
/**
 * Adjacency-list graph. A Map keeps numeric vertex ids numeric - a plain
 * object would stringify them.
 */
export class Graph {
  constructor(directed = false) {
    this.directed = directed;
    this.adjacency = new Map();
    this.vertices = new Set();
  }

  addVertex(v) {
    if (!this.adjacency.has(v)) this.adjacency.set(v, []);
    this.vertices.add(v);
    return this;
  }

  addEdge(u, v) {
    this.addVertex(u).addVertex(v);
    this.adjacency.get(u).push(v);
    if (!this.directed) this.adjacency.get(v).push(u); // both directions
    return this;
  }

  neighbours(u) {
    return this.adjacency.get(u) ?? [];
  }

  /** O(V^2) space, O(1) edge lookup - worth it only for dense graphs. */
  toMatrix() {
    const n = Math.max(...this.vertices) + 1;
    const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
    for (const [u, neighbours] of this.adjacency) {
      for (const v of neighbours) matrix[u][v] = 1;
    }
    return matrix;
  }
}

// ============================================================================
// 2. Traversals
// ============================================================================
/**
 * Breadth-first, level by level. O(V + E).
 * Two JS-specific details: a head index instead of shift() (which is O(n)),
 * and marking visited on ENQUEUE (marking on dequeue lets a vertex enter the
 * queue many times).
 */
export function bfs(graph, start) {
  const visited = new Set([start]);
  const order = [];
  const queue = [start];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

/** Depth-first via the call stack. O(V + E). */
export function dfsRecursive(graph, start) {
  const visited = new Set();
  const order = [];
  const walk = (node) => {
    visited.add(node);
    order.push(node);
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) walk(next);
    }
  };
  walk(start);
  return order;
}

/**
 * Same traversal with an explicit stack - no 10k-frame ceiling.
 * Pushing neighbours reversed makes the order match the recursive version.
 */
export function dfsIterative(graph, start) {
  const visited = new Set();
  const order = [];
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    const neighbours = graph.get(node) ?? [];
    for (let i = neighbours.length - 1; i >= 0; i--) {
      if (!visited.has(neighbours[i])) stack.push(neighbours[i]);
    }
  }
  return order;
}

/**
 * Fewest-edges path via BFS. O(V + E).
 * BFS is correct here because it expands in distance order: the first time we
 * reach `goal`, no shorter route exists.
 */
export function shortestPathUnweighted(graph, start, goal) {
  if (start === goal) return [start];
  const parent = new Map([[start, start]]);
  const queue = [start];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    for (const next of graph.get(node) ?? []) {
      if (parent.has(next)) continue;
      parent.set(next, node);
      if (next === goal) {
        const path = [goal]; // walk the parents back
        while (path.at(-1) !== start) path.push(parent.get(path.at(-1)));
        return path.reverse();
      }
      queue.push(next);
    }
  }
  return null;
}

export function connectedComponents(graph, vertices) {
  const visited = new Set();
  const components = [];
  for (const v of vertices) {
    if (visited.has(v)) continue;
    const component = bfs(graph, v);
    component.forEach((u) => visited.add(u));
    components.push([...component].sort((a, b) => a - b));
  }
  return components;
}

// ============================================================================
// 3. Cycle detection
// ============================================================================
const WHITE = 0;
const GREY = 1;
const BLACK = 2;

/**
 * Three-colour DFS. WHITE unvisited, GREY on the current path, BLACK done.
 * An edge to a GREY vertex closes a cycle; an edge to BLACK is fine, since
 * that subtree is already known to be cycle-free.
 */
export function hasCycleDirected(graph, vertices) {
  const colour = new Map([...vertices].map((v) => [v, WHITE]));
  const walk = (node) => {
    colour.set(node, GREY);
    for (const next of graph.get(node) ?? []) {
      if (colour.get(next) === GREY) return true; // back edge
      if (colour.get(next) === WHITE && walk(next)) return true;
    }
    colour.set(node, BLACK);
    return false;
  };
  return [...vertices].some((v) => colour.get(v) === WHITE && walk(v));
}

/**
 * Undirected: every edge looks like a back edge to the vertex you came from,
 * so the parent must be excluded - but only the parent.
 */
export function hasCycleUndirected(graph, vertices) {
  const visited = new Set();
  const walk = (node, parent) => {
    visited.add(node);
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        if (walk(next, node)) return true;
      } else if (next !== parent) {
        return true; // visited and not where we came from
      }
    }
    return false;
  };
  return [...vertices].some((v) => !visited.has(v) && walk(v, null));
}

// ============================================================================
// 4. Topological sort
// ============================================================================
/**
 * Kahn: repeatedly take a vertex with in-degree 0. O(V + E).
 * Returns null on a cycle - if fewer than V vertices come out, the rest are
 * stuck in one. That is why "course schedule" problems are topological sort.
 */
export function topologicalSortKahn(graph, vertices) {
  const list = [...vertices];
  const inDegree = new Map(list.map((v) => [v, 0]));
  for (const u of list) {
    for (const v of graph.get(u) ?? []) inDegree.set(v, (inDegree.get(v) ?? 0) + 1);
  }

  const queue = list.filter((v) => inDegree.get(v) === 0).sort((a, b) => a - b);
  let head = 0;
  const order = [];
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const next of graph.get(node) ?? []) {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }
  return order.length === list.length ? order : null;
}

/**
 * DFS variant: append on FINISH, then reverse. A vertex is appended only once
 * all its descendants are done, so the reversed finish order is topological.
 */
export function topologicalSortDfs(graph, vertices) {
  const colour = new Map([...vertices].map((v) => [v, WHITE]));
  const order = [];
  const walk = (node) => {
    colour.set(node, GREY);
    for (const next of graph.get(node) ?? []) {
      if (colour.get(next) === GREY) return false; // cycle
      if (colour.get(next) === WHITE && !walk(next)) return false;
    }
    colour.set(node, BLACK);
    order.push(node); // post-order append
    return true;
  };
  for (const v of vertices) {
    if (colour.get(v) === WHITE && !walk(v)) return null;
  }
  return order.reverse();
}

// ============================================================================
// 5. Colouring
// ============================================================================
/**
 * Two-colourable? BFS with alternating colours. O(V + E).
 * A graph is bipartite exactly when it has no odd-length cycle.
 */
export function isBipartite(graph, vertices) {
  const colour = new Map();
  for (const start of vertices) {
    if (colour.has(start)) continue;
    colour.set(start, 0);
    const queue = [start];
    let head = 0;
    while (head < queue.length) {
      const node = queue[head++];
      for (const next of graph.get(node) ?? []) {
        if (!colour.has(next)) {
          colour.set(next, 1 - colour.get(node));
          queue.push(next);
        } else if (colour.get(next) === colour.get(node)) {
          return false;
        }
      }
    }
  }
  return true;
}

// ============================================================================
// 6. Weighted shortest paths
// ============================================================================
/**
 * Dijkstra with NON-NEGATIVE weights. O(E log V).
 *
 * Greedy: always finalise the closest unfinished vertex - sound only without
 * negative edges. The heap has no decrease-key, so we push duplicates and skip
 * stale entries. (Sorting an array instead of using a heap is the usual way
 * this becomes too slow.)
 */
export function dijkstra(graph, start) {
  const dist = new Map([[start, 0]]);
  const heap = new MinHeap((a, b) => a.distance - b.distance);
  heap.push({ distance: 0, node: start });

  while (heap.size) {
    const { distance, node } = heap.pop();
    if (distance > (dist.get(node) ?? Infinity)) continue; // stale entry
    for (const [next, weight] of graph.get(node) ?? []) {
      const candidate = distance + weight;
      if (candidate < (dist.get(next) ?? Infinity)) {
        dist.set(next, candidate);
        heap.push({ distance: candidate, node: next });
      }
    }
  }
  return dist;
}

/**
 * Bellman-Ford: handles NEGATIVE weights. O(V * E).
 * Any shortest path uses at most V-1 edges, so V-1 relaxation rounds suffice.
 * If a Vth round still improves something, a negative cycle exists and
 * "shortest" is undefined - we return null.
 */
export function bellmanFord(edges, vertices, start) {
  const list = [...vertices];
  const dist = new Map(list.map((v) => [v, Infinity]));
  dist.set(start, 0);

  for (let round = 0; round < list.length - 1; round++) {
    let changed = false;
    for (const [u, v, weight] of edges) {
      if (dist.get(u) + weight < dist.get(v)) {
        dist.set(v, dist.get(u) + weight);
        changed = true;
      }
    }
    if (!changed) break; // already stable
  }

  for (const [u, v, weight] of edges) {
    // the Vth round
    if (dist.get(u) + weight < dist.get(v)) return null; // negative cycle
  }
  return dist;
}

// ============================================================================
// 7. Grids as implicit graphs
// ============================================================================
const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

/**
 * Number of connected "1" regions. O(rows * cols).
 * The grid IS the graph; sinking each island doubles as the visited set.
 */
export function countIslands(grid) {
  if (!grid.length || !grid[0].length) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1") continue;
      islands++;
      const stack = [[r, c]]; // iterative: no recursion limit
      grid[r][c] = "0"; // mark on push
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of DIRECTIONS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
            grid[nr][nc] = "0";
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}

/** Fewest steps through 0 cells, top-left to bottom-right. BFS. -1 if blocked. */
export function shortestPathGrid(grid) {
  if (!grid.length || !grid[0].length || grid[0][0] !== 0) return -1;
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[rows - 1][cols - 1] !== 0) return -1;

  const seen = new Set([0]); // cells encoded as r * cols + c
  const queue = [[0, 0, 1]];
  let head = 0;
  while (head < queue.length) {
    const [r, c, steps] = queue[head++];
    if (r === rows - 1 && c === cols - 1) return steps;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      const key = nr * cols + nc;
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        grid[nr][nc] === 0 &&
        !seen.has(key)
      ) {
        seen.add(key);
        queue.push([nr, nc, steps + 1]);
      }
    }
  }
  return -1;
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  //   0 --- 1
  //   |   / |
  //   |  /  |
  //   2 --- 3      4 (isolated)
  const undirected = new Graph(false);
  for (const [u, v] of [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
  ]) {
    undirected.addEdge(u, v);
  }
  undirected.addVertex(4);
  const g = undirected.adjacency;

  assert.deepEqual(bfs(g, 0), [0, 1, 2, 3]);
  assert.deepEqual(dfsRecursive(g, 0), [0, 1, 2, 3]);
  assert.deepEqual(dfsIterative(g, 0), dfsRecursive(g, 0));

  const matrix = undirected.toMatrix();
  assert.equal(matrix[0][1], 1);
  assert.equal(matrix[1][0], 1); // symmetric
  assert.equal(matrix[0][3], 0);

  assert.deepEqual(shortestPathUnweighted(g, 0, 3), [0, 1, 3]);
  assert.deepEqual(shortestPathUnweighted(g, 0, 0), [0]);
  assert.equal(shortestPathUnweighted(g, 0, 4), null); // unreachable

  assert.deepEqual(connectedComponents(g, [...undirected.vertices].sort((a, b) => a - b)), [
    [0, 1, 2, 3],
    [4],
  ]);

  assert.ok(hasCycleUndirected(g, undirected.vertices));
  const tree = new Map([
    [0, [1, 2]],
    [1, [0]],
    [2, [0]],
  ]);
  assert.ok(!hasCycleUndirected(tree, [0, 1, 2]));

  // DAG: 5 -> 2 -> 3 -> 1, 5 -> 0, 4 -> 0, 4 -> 1
  const dag = new Map([
    [5, [2, 0]],
    [4, [0, 1]],
    [2, [3]],
    [3, [1]],
    [0, []],
    [1, []],
  ]);
  const dagVertices = [0, 1, 2, 3, 4, 5];
  assert.ok(!hasCycleDirected(dag, dagVertices));

  const cyclic = new Map([
    [0, [1]],
    [1, [2]],
    [2, [0]],
  ]);
  assert.ok(hasCycleDirected(cyclic, [0, 1, 2]));

  const order = topologicalSortKahn(dag, dagVertices);
  assert.ok(order !== null);
  const position = new Map(order.map((v, i) => [v, i]));
  for (const [u, neighbours] of dag) {
    for (const v of neighbours) assert.ok(position.get(u) < position.get(v));
  }
  assert.equal(topologicalSortKahn(cyclic, [0, 1, 2]), null);

  const dfsOrder = topologicalSortDfs(dag, dagVertices);
  assert.ok(dfsOrder !== null);
  const dfsPosition = new Map(dfsOrder.map((v, i) => [v, i]));
  for (const [u, neighbours] of dag) {
    for (const v of neighbours) assert.ok(dfsPosition.get(u) < dfsPosition.get(v));
  }
  assert.equal(topologicalSortDfs(cyclic, [0, 1, 2]), null);

  const square = new Map([
    [0, [1, 3]],
    [1, [0, 2]],
    [2, [1, 3]],
    [3, [0, 2]],
  ]);
  assert.ok(isBipartite(square, [0, 1, 2, 3])); // 4-cycle: even
  const triangle = new Map([
    [0, [1, 2]],
    [1, [0, 2]],
    [2, [0, 1]],
  ]);
  assert.ok(!isBipartite(triangle, [0, 1, 2])); // 3-cycle: odd

  const weighted = new Map([
    [0, [[1, 4], [2, 1]]],
    [2, [[1, 2], [3, 5]]],
    [1, [[3, 1]]],
    [3, []],
  ]);
  const dist = dijkstra(weighted, 0);
  assert.equal(dist.get(0), 0);
  assert.equal(dist.get(2), 1);
  assert.equal(dist.get(1), 3); // 0->2->1 (3) beats the direct 0->1 (4)
  assert.equal(dist.get(3), 4); // 0->2->1->3
  assert.equal(dist.has(99), false); // unreachable

  const edges = [
    [0, 1, 4],
    [0, 2, 1],
    [2, 1, 2],
    [1, 3, 1],
    [2, 3, 5],
  ];
  const bf = bellmanFord(edges, [0, 1, 2, 3], 0);
  assert.ok(bf !== null);
  for (const v of [0, 1, 2, 3]) assert.equal(bf.get(v), dist.get(v)); // agrees

  const negativeOk = bellmanFord(
    [
      [0, 1, 5],
      [1, 2, -3],
    ],
    [0, 1, 2],
    0,
  );
  assert.ok(negativeOk !== null);
  assert.equal(negativeOk.get(2), 2); // negative weights are fine
  const negativeCycle = [
    [0, 1, 1],
    [1, 2, -1],
    [2, 1, -1],
  ];
  assert.equal(bellmanFord(negativeCycle, [0, 1, 2], 0), null);

  const grid = [
    [..."11000"],
    [..."11000"],
    [..."00100"],
    [..."00011"],
  ];
  assert.equal(countIslands(grid), 3);
  assert.equal(countIslands([]), 0);

  const maze = [
    [0, 0, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];
  assert.equal(shortestPathGrid(maze), 5);
  assert.equal(
    shortestPathGrid([
      [0, 1],
      [1, 0],
    ]),
    -1,
  );

  console.log("14-Graphs (JavaScript): all checks passed");
}

demo();
