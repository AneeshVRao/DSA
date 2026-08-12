// 14 - Graphs: representations, BFS/DFS, cycle detection, topological sort,
// Dijkstra, Bellman-Ford, and grids as implicit graphs.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall graphs.cpp -o graphs && ./graphs

#include <algorithm>
#include <array>
#include <cassert>
#include <climits>
#include <iostream>
#include <queue>
#include <string>
#include <vector>

using namespace std;

// Sentinel that is safely below overflow: dist + weight cannot wrap.
constexpr long long INF = LLONG_MAX / 4;

// ============================================================================
// 1. Representation
// ============================================================================
// With integer vertex ids, vector<vector<int>> beats a hash map on both memory
// and cache behaviour. Relabel string vertices to indices once, up front.
using AdjList = vector<vector<int>>;
using WeightedAdj = vector<vector<pair<int, int>>>;   // {neighbour, weight}
using EdgeList = vector<array<int, 3>>;               // {u, v, weight}

AdjList buildUndirected(int n, const vector<pair<int, int>>& edges) {
    AdjList adj(n);
    for (auto [u, v] : edges) {
        adj[u].push_back(v);
        adj[v].push_back(u);              // undirected = both directions
    }
    return adj;
}

vector<vector<int>> toMatrix(const AdjList& adj) {
    int n = int(adj.size());
    vector<vector<int>> matrix(n, vector<int>(n, 0));
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) matrix[u][v] = 1;
    return matrix;
}

// ============================================================================
// 2. Traversals
// ============================================================================
// Mark visited on ENQUEUE. Marking on dequeue lets a vertex enter the queue
// many times - a classic source of TLE.
vector<int> bfs(const AdjList& adj, int start) {
    vector<bool> visited(adj.size(), false);
    vector<int> order;
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        order.push_back(node);
        for (int next : adj[node]) {
            if (!visited[next]) {
                visited[next] = true;
                q.push(next);
            }
        }
    }
    return order;
}

void dfsHelper(const AdjList& adj, int node, vector<bool>& visited,
               vector<int>& order) {
    visited[node] = true;
    order.push_back(node);
    for (int next : adj[node])
        if (!visited[next]) dfsHelper(adj, next, visited, order);
}

vector<int> dfsRecursive(const AdjList& adj, int start) {
    vector<bool> visited(adj.size(), false);
    vector<int> order;
    dfsHelper(adj, start, visited, order);
    return order;
}

// Same traversal with an explicit stack - no recursion depth limit. Pushing
// neighbours in reverse makes the visit order match the recursive version.
vector<int> dfsIterative(const AdjList& adj, int start) {
    vector<bool> visited(adj.size(), false);
    vector<int> order;
    vector<int> stack{start};
    while (!stack.empty()) {
        int node = stack.back();
        stack.pop_back();
        if (visited[node]) continue;
        visited[node] = true;
        order.push_back(node);
        for (auto it = adj[node].rbegin(); it != adj[node].rend(); ++it)
            if (!visited[*it]) stack.push_back(*it);
    }
    return order;
}

// BFS finds the fewest-edges path: it expands in distance order, so the first
// time we reach `goal` no shorter route exists. Empty vector = unreachable.
vector<int> shortestPathUnweighted(const AdjList& adj, int start, int goal) {
    if (start == goal) return {start};
    vector<int> parent(adj.size(), -1);
    parent[start] = start;
    queue<int> q;
    q.push(start);
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        for (int next : adj[node]) {
            if (parent[next] != -1) continue;
            parent[next] = node;
            if (next == goal) {
                vector<int> path{goal};          // walk the parents back
                while (path.back() != start) path.push_back(parent[path.back()]);
                reverse(path.begin(), path.end());
                return path;
            }
            q.push(next);
        }
    }
    return {};
}

vector<vector<int>> connectedComponents(const AdjList& adj) {
    vector<bool> visited(adj.size(), false);
    vector<vector<int>> components;
    for (int v = 0; v < int(adj.size()); v++) {
        if (visited[v]) continue;
        vector<int> component = bfs(adj, v);
        for (int u : component) visited[u] = true;
        sort(component.begin(), component.end());
        components.push_back(move(component));
    }
    return components;
}

// ============================================================================
// 3. Cycle detection
// ============================================================================
// Three-colour DFS: WHITE unvisited, GREY on the current path, BLACK finished.
// An edge to a GREY vertex closes a cycle; an edge to BLACK is fine, because
// that subtree is already known to be cycle-free.
enum Colour { WHITE, GREY, BLACK };

bool directedCycleHelper(const AdjList& adj, int node, vector<Colour>& colour) {
    colour[node] = GREY;
    for (int next : adj[node]) {
        if (colour[next] == GREY) return true;            // back edge
        if (colour[next] == WHITE && directedCycleHelper(adj, next, colour))
            return true;
    }
    colour[node] = BLACK;
    return false;
}

bool hasCycleDirected(const AdjList& adj) {
    vector<Colour> colour(adj.size(), WHITE);
    for (int v = 0; v < int(adj.size()); v++)
        if (colour[v] == WHITE && directedCycleHelper(adj, v, colour)) return true;
    return false;
}

// Undirected: every edge looks like a back edge to the vertex you came from,
// so the parent must be excluded - but only the parent.
bool undirectedCycleHelper(const AdjList& adj, int node, int parent,
                           vector<bool>& visited) {
    visited[node] = true;
    for (int next : adj[node]) {
        if (!visited[next]) {
            if (undirectedCycleHelper(adj, next, node, visited)) return true;
        } else if (next != parent) {
            return true;                                   // visited, not parent
        }
    }
    return false;
}

bool hasCycleUndirected(const AdjList& adj) {
    vector<bool> visited(adj.size(), false);
    for (int v = 0; v < int(adj.size()); v++)
        if (!visited[v] && undirectedCycleHelper(adj, v, -1, visited)) return true;
    return false;
}

// ============================================================================
// 4. Topological sort
// ============================================================================
// Kahn: repeatedly take a vertex with in-degree 0. If fewer than V come out,
// the rest are stuck in a cycle - which is why "course schedule" problems are
// topological sort in disguise. Empty result = cycle.
vector<int> topologicalSortKahn(const AdjList& adj) {
    int n = int(adj.size());
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) inDegree[v]++;

    priority_queue<int, vector<int>, greater<int>> ready;   // smallest first
    for (int v = 0; v < n; v++)
        if (inDegree[v] == 0) ready.push(v);

    vector<int> order;
    while (!ready.empty()) {
        int node = ready.top();
        ready.pop();
        order.push_back(node);
        for (int next : adj[node])
            if (--inDegree[next] == 0) ready.push(next);
    }
    return int(order.size()) == n ? order : vector<int>{};
}

// DFS variant: append on FINISH, then reverse. A vertex is appended only once
// all its descendants are done, so the reversed finish order is topological.
bool topoDfsHelper(const AdjList& adj, int node, vector<Colour>& colour,
                   vector<int>& order) {
    colour[node] = GREY;
    for (int next : adj[node]) {
        if (colour[next] == GREY) return false;            // cycle
        if (colour[next] == WHITE && !topoDfsHelper(adj, next, colour, order))
            return false;
    }
    colour[node] = BLACK;
    order.push_back(node);                                 // post-order append
    return true;
}

vector<int> topologicalSortDfs(const AdjList& adj) {
    vector<Colour> colour(adj.size(), WHITE);
    vector<int> order;
    for (int v = 0; v < int(adj.size()); v++)
        if (colour[v] == WHITE && !topoDfsHelper(adj, v, colour, order))
            return {};
    reverse(order.begin(), order.end());
    return order;
}

// ============================================================================
// 5. Colouring
// ============================================================================
// A graph is bipartite exactly when it has no odd-length cycle. BFS assigns
// alternating colours and fails the moment an edge joins two of one colour.
bool isBipartite(const AdjList& adj) {
    vector<int> colour(adj.size(), -1);
    for (int start = 0; start < int(adj.size()); start++) {
        if (colour[start] != -1) continue;
        colour[start] = 0;
        queue<int> q;
        q.push(start);
        while (!q.empty()) {
            int node = q.front();
            q.pop();
            for (int next : adj[node]) {
                if (colour[next] == -1) {
                    colour[next] = 1 - colour[node];
                    q.push(next);
                } else if (colour[next] == colour[node]) {
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
// Dijkstra is greedy: always finalise the closest unfinished vertex. That is
// sound only with NON-NEGATIVE weights. priority_queue has no decrease-key,
// so we push duplicates and skip stale entries - standard, same complexity.
vector<long long> dijkstra(const WeightedAdj& adj, int start) {
    vector<long long> dist(adj.size(), INF);
    dist[start] = 0;
    priority_queue<pair<long long, int>, vector<pair<long long, int>>,
                   greater<pair<long long, int>>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;              // stale entry
        for (auto [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}

// Bellman-Ford handles NEGATIVE weights. Any shortest path uses at most V-1
// edges, so V-1 relaxation rounds suffice; if a Vth round still improves
// something, a negative cycle exists and "shortest" is undefined.
// Returns false when a negative cycle is reachable.
bool bellmanFord(int n, const EdgeList& edges, int start, vector<long long>& dist) {
    dist.assign(n, INF);
    dist[start] = 0;

    for (int round = 0; round < n - 1; round++) {
        bool changed = false;
        for (const auto& [u, v, w] : edges) {
            if (dist[u] < INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;                    // already stable
    }

    for (const auto& [u, v, w] : edges)         // the Vth round
        if (dist[u] < INF && dist[u] + w < dist[v]) return false;
    return true;
}

// ============================================================================
// 7. Grids as implicit graphs
// ============================================================================
const int DR[] = {0, 0, 1, -1};
const int DC[] = {1, -1, 0, 0};

// The grid IS the graph: each cell is a vertex, its four neighbours the edges.
// Sinking each island doubles as the visited set.
int countIslands(vector<vector<char>> grid) {     // by value: we mutate it
    if (grid.empty() || grid[0].empty()) return 0;
    int rows = int(grid.size()), cols = int(grid[0].size()), islands = 0;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != '1') continue;
            islands++;
            vector<pair<int, int>> stack{{r, c}};
            grid[r][c] = '0';                      // mark on push
            while (!stack.empty()) {
                auto [cr, cc] = stack.back();
                stack.pop_back();
                for (int d = 0; d < 4; d++) {
                    int nr = cr + DR[d], nc = cc + DC[d];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                        grid[nr][nc] == '1') {
                        grid[nr][nc] = '0';
                        stack.push_back({nr, nc});
                    }
                }
            }
        }
    }
    return islands;
}

// Fewest steps from top-left to bottom-right through 0 cells. BFS, because
// every move costs the same. -1 when unreachable.
int shortestPathGrid(const vector<vector<int>>& grid) {
    if (grid.empty() || grid[0].empty() || grid[0][0] != 0) return -1;
    int rows = int(grid.size()), cols = int(grid[0].size());
    if (grid[rows - 1][cols - 1] != 0) return -1;

    vector<vector<bool>> seen(rows, vector<bool>(cols, false));
    queue<array<int, 3>> q;                        // row, col, steps
    q.push({0, 0, 1});
    seen[0][0] = true;

    while (!q.empty()) {
        auto [r, c, steps] = q.front();
        q.pop();
        if (r == rows - 1 && c == cols - 1) return steps;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                grid[nr][nc] == 0 && !seen[nr][nc]) {
                seen[nr][nc] = true;
                q.push({nr, nc, steps + 1});
            }
        }
    }
    return -1;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    //   0 --- 1
    //   |   / |
    //   |  /  |
    //   2 --- 3      4 (isolated)
    AdjList undirected = buildUndirected(5, {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}});

    assert((bfs(undirected, 0) == vector<int>{0, 1, 2, 3}));
    assert((dfsRecursive(undirected, 0) == vector<int>{0, 1, 2, 3}));
    assert(dfsIterative(undirected, 0) == dfsRecursive(undirected, 0));

    auto matrix = toMatrix(undirected);
    assert(matrix[0][1] == 1 && matrix[1][0] == 1);      // symmetric
    assert(matrix[0][3] == 0);

    assert((shortestPathUnweighted(undirected, 0, 3) == vector<int>{0, 1, 3}));
    assert((shortestPathUnweighted(undirected, 0, 0) == vector<int>{0}));
    assert(shortestPathUnweighted(undirected, 0, 4).empty());   // unreachable

    assert((connectedComponents(undirected) ==
            vector<vector<int>>{{0, 1, 2, 3}, {4}}));

    assert(hasCycleUndirected(undirected));
    AdjList tree = buildUndirected(3, {{0, 1}, {0, 2}});
    assert(!hasCycleUndirected(tree));

    // DAG: 5 -> 2 -> 3 -> 1, 5 -> 0, 4 -> 0, 4 -> 1
    AdjList dag(6);
    dag[5] = {2, 0};
    dag[4] = {0, 1};
    dag[2] = {3};
    dag[3] = {1};
    assert(!hasCycleDirected(dag));

    AdjList cyclic(3);
    cyclic[0] = {1};
    cyclic[1] = {2};
    cyclic[2] = {0};
    assert(hasCycleDirected(cyclic));

    vector<int> order = topologicalSortKahn(dag);
    assert(order.size() == 6);
    vector<int> position(6);
    for (int i = 0; i < 6; i++) position[order[i]] = i;
    for (int u = 0; u < 6; u++)                          // verify every edge
        for (int v : dag[u]) assert(position[u] < position[v]);
    assert(topologicalSortKahn(cyclic).empty());

    vector<int> dfsOrder = topologicalSortDfs(dag);
    assert(dfsOrder.size() == 6);
    vector<int> dfsPosition(6);
    for (int i = 0; i < 6; i++) dfsPosition[dfsOrder[i]] = i;
    for (int u = 0; u < 6; u++)
        for (int v : dag[u]) assert(dfsPosition[u] < dfsPosition[v]);
    assert(topologicalSortDfs(cyclic).empty());

    AdjList square = buildUndirected(4, {{0, 1}, {1, 2}, {2, 3}, {3, 0}});
    assert(isBipartite(square));                          // 4-cycle: even
    AdjList triangle = buildUndirected(3, {{0, 1}, {1, 2}, {2, 0}});
    assert(!isBipartite(triangle));                       // 3-cycle: odd

    WeightedAdj weighted(4);
    weighted[0] = {{1, 4}, {2, 1}};
    weighted[2] = {{1, 2}, {3, 5}};
    weighted[1] = {{3, 1}};
    vector<long long> dist = dijkstra(weighted, 0);
    assert(dist[0] == 0);
    assert(dist[2] == 1);
    assert(dist[1] == 3);            // 0->2->1 (3) beats the direct 0->1 (4)
    assert(dist[3] == 4);            // 0->2->1->3

    EdgeList edges{{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}};
    vector<long long> bf;
    assert(bellmanFord(4, edges, 0, bf));
    for (int v = 0; v < 4; v++) assert(bf[v] == dist[v]);   // agrees with Dijkstra

    vector<long long> negativeOk;
    assert(bellmanFord(3, {{0, 1, 5}, {1, 2, -3}}, 0, negativeOk));
    assert(negativeOk[2] == 2);                            // negatives are fine
    vector<long long> unused;
    assert(!bellmanFord(3, {{0, 1, 1}, {1, 2, -1}, {2, 1, -1}}, 0, unused));

    vector<vector<char>> grid{
        {'1', '1', '0', '0', '0'},
        {'1', '1', '0', '0', '0'},
        {'0', '0', '1', '0', '0'},
        {'0', '0', '0', '1', '1'},
    };
    assert(countIslands(grid) == 3);
    assert(countIslands({}) == 0);

    vector<vector<int>> maze{{0, 0, 1}, {1, 0, 1}, {1, 0, 0}};
    assert(shortestPathGrid(maze) == 5);
    assert(shortestPathGrid({{0, 1}, {1, 0}}) == -1);      // blocked

    cout << "14-Graphs (C++): all checks passed\n";
    return 0;
}
