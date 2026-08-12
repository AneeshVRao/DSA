/**
 * 14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
 * Dijkstra, Bellman-Ford, Floyd-Warshall, strongly connected components
 * (Kosaraju and Tarjan), and grids as implicit graphs.
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
// 7. All-pairs shortest paths
// ============================================================================
/**
 * Floyd-Warshall: shortest path between EVERY pair. O(V^3) time, O(V^2) space.
 *
 * Input is an adjacency matrix where `matrix[u][v]` is the edge weight and
 * `Infinity` means "no edge". Returns a NEW matrix; the input is untouched.
 *
 * A DP over which vertices may be used as intermediates:
 *
 *     dist[k][u][v] = shortest u->v path using only 0..k-1 in the middle
 *
 * Adding vertex k either helps or it does not:
 *
 *     dist[k+1][u][v] = min(dist[k][u][v],                  // skip k
 *                           dist[k][u][k] + dist[k][k][v])  // route through k
 *
 * The k dimension drops out - updating in place is safe because `dist[u][k]`
 * and `dist[k][v]` are never improved by k itself (that would need a negative
 * cycle). Hence three loops with **k outermost**. Reordering them is the
 * classic bug: it uses k before k is finished.
 *
 * Handles negative edges. A negative cycle shows as `dist[v][v] < 0`.
 *
 * `Infinity + Infinity` is `Infinity` and comparisons stay well-defined, so JS
 * needs none of the overflow sentinels C++ and Go do - one of the rare places
 * float64 arithmetic is an advantage.
 */
export function floydWarshall(matrix) {
  const n = matrix.length;
  const dist = matrix.map((row) => [...row]); // copy: never mutate the input

  for (let k = 0; k < n; k++) {
    // k OUTERMOST - see above
    for (let u = 0; u < n; u++) {
      if (dist[u][k] === Infinity) continue; // no path into k, skip the row
      for (let v = 0; v < n; v++) {
        if (dist[u][k] + dist[k][v] < dist[u][v]) {
          dist[u][v] = dist[u][k] + dist[k][v];
        }
      }
    }
  }
  return dist;
}

/**
 * Warshall's transitive closure: can v be reached from u? O(V^3).
 *
 * Floyd-Warshall with (min, +) replaced by (or, and) - instead of "how short is
 * the path", just "is there one". The same triple loop, on booleans.
 *
 * `reachable[v][v]` starts true: a vertex reaches itself by the empty path. For
 * "reachable by a NON-empty path" (i.e. is v on a cycle), start it false.
 */
export function transitiveClosure(graph, n) {
  const reachable = Array.from({ length: n }, () => new Array(n).fill(false));

  for (let u = 0; u < n; u++) {
    reachable[u][u] = true; // empty path
    for (const v of graph.get(u) ?? []) reachable[u][v] = true;
  }

  for (let k = 0; k < n; k++) {
    for (let u = 0; u < n; u++) {
      if (!reachable[u][k]) continue;
      for (let v = 0; v < n; v++) {
        if (reachable[k][v]) reachable[u][v] = true;
      }
    }
  }
  return reachable;
}

// ============================================================================
// 8. Strongly connected components
// ============================================================================
/**
 * Kosaraju's algorithm: strongly connected components of a DIRECTED graph.
 * O(V + E).
 *
 * An SCC is a maximal set of vertices where every one reaches every other.
 * Contracting each SCC to a node turns any directed graph into a DAG - the
 * "condensation" - which is what makes 2-SAT and DP-on-graphs tractable.
 *
 * Two passes:
 *   1. DFS the graph, pushing each vertex when it FINISHES. The stack now holds
 *      vertices in reverse finishing order.
 *   2. DFS the REVERSED graph, taking start vertices off that stack. Each tree
 *      found is exactly one SCC.
 *
 * Why it works: reversing every edge leaves the SCCs unchanged (if u reaches v
 * and v reaches u, both still hold after reversal) but flips every edge BETWEEN
 * components. So the second pass, starting from the component that finished
 * last, cannot escape into another component - the DFS is trapped inside
 * exactly one SCC.
 *
 * Iterative, because a recursive DFS blows the JS stack somewhere around 10k
 * frames and there is no tail-call elimination in practice.
 */
export function sccKosaraju(graph, vertices) {
  const list = [...vertices];

  // Pass 1: order by finishing time.
  const visited = new Set();
  const order = [];
  for (const start of list) {
    if (visited.has(start)) continue;
    visited.add(start);
    const stack = [{ node: start, next: 0 }];
    while (stack.length) {
      const frame = stack.at(-1);
      const children = graph.get(frame.node) ?? [];
      if (frame.next < children.length) {
        const child = children[frame.next++];
        if (!visited.has(child)) {
          visited.add(child);
          stack.push({ node: child, next: 0 });
        }
      } else {
        order.push(frame.node); // all children done: node FINISHES
        stack.pop();
      }
    }
  }

  const reversed = new Map(); // flip every edge
  for (const u of list) {
    for (const v of graph.get(u) ?? []) {
      if (!reversed.has(v)) reversed.set(v, []);
      reversed.get(v).push(u);
    }
  }

  // Pass 2: DFS the reversal in reverse finishing order.
  const seen = new Set();
  const components = [];
  for (let i = order.length - 1; i >= 0; i--) {
    const start = order[i];
    if (seen.has(start)) continue;
    const component = [];
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const node = stack.pop();
      component.push(node);
      for (const neighbour of reversed.get(node) ?? []) {
        if (!seen.has(neighbour)) {
          seen.add(neighbour);
          stack.push(neighbour);
        }
      }
    }
    components.push(component.sort((a, b) => a - b));
  }
  return components;
}

/**
 * Tarjan's algorithm: strongly connected components in ONE DFS pass. O(V + E).
 *
 * Each vertex gets two numbers:
 *   - `index`   - when it was first visited (a timestamp)
 *   - `lowlink` - the smallest index reachable from its subtree, following at
 *                 most one edge back to a vertex still ON THE STACK
 *
 * A vertex with `lowlink === index` ROOTS an SCC: nothing in its subtree found
 * a way back above it, so everything stacked above it is exactly one component.
 *
 * The "still on the stack" test is the entire subtlety. An edge into an already
 * finished vertex leads to a CLOSED component; following it would wrongly merge
 * two SCCs. `onStack` distinguishes a back edge (same component) from a cross
 * edge (a different, finished one).
 *
 * One pass instead of Kosaraju's two, and it emits components in reverse
 * topological order of the condensation for free.
 */
export function sccTarjan(graph, vertices) {
  const index = new Map();
  const lowlink = new Map();
  const onStack = new Set();
  const stack = [];
  const components = [];
  let counter = 0;

  for (const root of vertices) {
    if (index.has(root)) continue;

    index.set(root, counter);
    lowlink.set(root, counter);
    counter++;
    stack.push(root);
    onStack.add(root);
    const work = [{ node: root, next: 0 }];

    while (work.length) {
      const frame = work.at(-1);
      const children = graph.get(frame.node) ?? [];

      if (frame.next < children.length) {
        const child = children[frame.next++];
        if (!index.has(child)) {
          // tree edge: descend
          index.set(child, counter);
          lowlink.set(child, counter);
          counter++;
          stack.push(child);
          onStack.add(child);
          work.push({ node: child, next: 0 });
        } else if (onStack.has(child)) {
          // back edge, same SCC
          lowlink.set(frame.node, Math.min(lowlink.get(frame.node), index.get(child)));
        }
        // else: cross edge into a CLOSED component - ignore it
        continue;
      }

      const finished = frame.node;
      work.pop();
      if (work.length) {
        // propagate to the parent
        const parent = work.at(-1).node;
        lowlink.set(parent, Math.min(lowlink.get(parent), lowlink.get(finished)));
      }

      if (lowlink.get(finished) === index.get(finished)) {
        // roots an SCC
        const component = [];
        for (;;) {
          const member = stack.pop();
          onStack.delete(member);
          component.push(member);
          if (member === finished) break;
        }
        components.push(component.sort((a, b) => a - b));
      }
    }
  }
  return components;
}

// ============================================================================
// 9. Grids as implicit graphs
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

  // --- Floyd-Warshall -------------------------------------------------------
  //  0 -> 1 (3), 1 -> 2 (1), 0 -> 2 (7), 2 -> 0 (2)
  const weightMatrix = [
    [0, 3, 7],
    [Infinity, 0, 1],
    [2, Infinity, 0],
  ];
  const apsp = floydWarshall(weightMatrix);
  assert.equal(apsp[0][2], 4); // 0->1->2 beats the direct 7
  assert.equal(apsp[1][0], 3); // 1->2->0
  assert.equal(weightMatrix[0][2], 7); // input was not mutated

  // Negative edges: Dijkstra would be wrong here, Floyd-Warshall is not.
  assert.equal(
    floydWarshall([
      [0, 4, Infinity],
      [Infinity, 0, -3],
      [Infinity, Infinity, 0],
    ])[0][2],
    1, // 4 + (-3)
  );

  // A negative cycle shows up on the diagonal.
  assert.ok(
    floydWarshall([
      [0, 1, Infinity],
      [Infinity, 0, -5],
      [3, Infinity, 0],
    ])[0][0] < 0,
  );

  // Deterministic PRNG so a failure is always reproducible.
  let seed = 14;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

  // Against Dijkstra from every source, on random non-negative graphs.
  for (let trial = 0; trial < 40; trial++) {
    const n = randInt(1, 12);
    const dense = Array.from({ length: n }, (_, u) =>
      Array.from({ length: n }, (_, v) => (u === v ? 0 : Infinity)),
    );
    const weightedRandom = new Map();
    for (let u = 0; u < n; u++) weightedRandom.set(u, []);
    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        if (u !== v && random() < 0.35) {
          const w = randInt(1, 20);
          dense[u][v] = Math.min(dense[u][v], w);
          weightedRandom.get(u).push([v, w]);
        }
      }
    }

    const allPairs = floydWarshall(dense);
    for (let source = 0; source < n; source++) {
      const single = dijkstra(weightedRandom, source);
      for (let target = 0; target < n; target++) {
        assert.equal(allPairs[source][target], single.get(target) ?? Infinity);
      }
    }
  }

  // --- Transitive closure ---------------------------------------------------
  const reachGraph = new Map([
    [0, [1]],
    [1, [2]],
    [2, [0]],
    [3, [2]],
  ]);
  const closure = transitiveClosure(reachGraph, 4);
  assert.ok(closure[0][2] && closure[2][1]); // around the cycle
  assert.ok(closure[3][0] && !closure[0][3]); // 3 is a one-way entrance
  for (let v = 0; v < 4; v++) assert.ok(closure[v][v]); // empty path

  // Against BFS reachability on random graphs.
  for (let trial = 0; trial < 40; trial++) {
    const n = randInt(1, 12);
    const adjacency = new Map();
    for (let u = 0; u < n; u++) adjacency.set(u, []);
    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        if (u !== v && random() < 0.25) adjacency.get(u).push(v);
      }
    }

    const reach = transitiveClosure(adjacency, n);
    for (let source = 0; source < n; source++) {
      const expected = new Set(bfs(adjacency, source));
      for (let target = 0; target < n; target++) {
        assert.equal(reach[source][target], expected.has(target));
      }
    }
  }

  // --- Strongly connected components ----------------------------------------
  //  0 -> 1 -> 2 -> 0 (one SCC), 3 -> 2 and 3 -> 4 (singletons)
  const sccGraph = new Map([
    [0, [1]],
    [1, [2]],
    [2, [0]],
    [3, [2, 4]],
    [4, []],
  ]);
  const byFirst = (a, b) => a[0] - b[0];
  const expectedSccs = [[0, 1, 2], [3], [4]];
  assert.deepEqual(sccKosaraju(sccGraph, [0, 1, 2, 3, 4]).sort(byFirst), expectedSccs);
  assert.deepEqual(sccTarjan(sccGraph, [0, 1, 2, 3, 4]).sort(byFirst), expectedSccs);

  // A DAG has one component per vertex; a full cycle has exactly one.
  const dagGraph = new Map([
    [0, [1, 2]],
    [1, [3]],
    [2, [3]],
    [3, []],
  ]);
  assert.deepEqual(sccTarjan(dagGraph, [0, 1, 2, 3]).sort(byFirst), [[0], [1], [2], [3]]);

  const ring = new Map();
  for (let i = 0; i < 6; i++) ring.set(i, [(i + 1) % 6]);
  assert.deepEqual(sccTarjan(ring, [...ring.keys()]), [[0, 1, 2, 3, 4, 5]]);

  // Both algorithms against the DEFINITION, via the transitive closure:
  // u and v share an SCC exactly when each reaches the other.
  for (let trial = 0; trial < 60; trial++) {
    const n = randInt(1, 11);
    const adjacency = new Map();
    for (let u = 0; u < n; u++) adjacency.set(u, []);
    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        if (u !== v && random() < 0.22) adjacency.get(u).push(v);
      }
    }

    const reach = transitiveClosure(adjacency, n);
    const groups = new Map();
    for (let v = 0; v < n; v++) {
      const key = [];
      for (let u = 0; u < n; u++) if (reach[u][v] && reach[v][u]) key.push(u);
      const id = key.join(",");
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(v);
    }
    const brute = [...groups.values()].sort(byFirst);
    const vertexList = [...adjacency.keys()];

    assert.deepEqual(sccKosaraju(adjacency, vertexList).sort(byFirst), brute);
    assert.deepEqual(sccTarjan(adjacency, vertexList).sort(byFirst), brute);
  }

  // Tarjan emits components in reverse topological order of the condensation:
  // every edge leaving a component points to one emitted EARLIER.
  for (let trial = 0; trial < 30; trial++) {
    const n = randInt(2, 10);
    const adjacency = new Map();
    for (let u = 0; u < n; u++) adjacency.set(u, []);
    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        if (u !== v && random() < 0.22) adjacency.get(u).push(v);
      }
    }

    const order = sccTarjan(adjacency, [...adjacency.keys()]);
    const componentOf = new Map();
    order.forEach((members, i) => members.forEach((v) => componentOf.set(v, i)));
    for (let u = 0; u < n; u++) {
      for (const v of adjacency.get(u)) {
        assert.ok(componentOf.get(v) <= componentOf.get(u));
      }
    }
  }

  console.log("14-Graphs (JavaScript): all checks passed");
  console.log(
    "  Floyd-Warshall cross-checked against Dijkstra from every source,\n" +
      "  Kosaraju and Tarjan against the transitive-closure definition",
  );
}

demo();
