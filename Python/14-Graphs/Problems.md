# Practice Problems - 14 Graphs (Python)

Half of graph interviewing is recognising that a problem *is* a graph. Grids,
course prerequisites, word ladders and network delays are all the same shape.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Number of Islands | Grid DFS/BFS; sink each island as you find it. | [LeetCode 200](https://leetcode.com/problems/number-of-islands/) |
| 2 | Max Area of Island | Same traversal, return the size. | [LeetCode 695](https://leetcode.com/problems/max-area-of-island/) |
| 3 | Flood Fill | The simplest grid DFS. | [LeetCode 733](https://leetcode.com/problems/flood-fill/) |
| 4 | Rotting Oranges | Multi-source BFS - seed the queue with every rotten cell. | [LeetCode 994](https://leetcode.com/problems/rotting-oranges/) |
| 5 | Clone Graph | DFS + a `visited` map from old node to new. | [LeetCode 133](https://leetcode.com/problems/clone-graph/) |
| 6 | Course Schedule | Cycle detection in a directed graph. | [LeetCode 207](https://leetcode.com/problems/course-schedule/) |
| 7 | Course Schedule II | Topological sort (Kahn). | [LeetCode 210](https://leetcode.com/problems/course-schedule-ii/) |
| 8 | Is Graph Bipartite? | Two-colour BFS. | [LeetCode 785](https://leetcode.com/problems/is-graph-bipartite/) |
| 9 | Word Ladder | BFS over words as an implicit graph. | [LeetCode 127](https://leetcode.com/problems/word-ladder/) |
| 10 | Network Delay Time | Dijkstra with `heapq`. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |
| 11 | Cheapest Flights Within K Stops | Bellman-Ford limited to k+1 rounds. | [LeetCode 787](https://leetcode.com/problems/cheapest-flights-within-k-stops/) |
| 12 | Number of Connected Components | BFS/DFS from each unvisited vertex, or union-find. | [LeetCode 323](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) |
| 13 | Pacific Atlantic Water Flow | Two BFS runs from the borders inward. | [LeetCode 417](https://leetcode.com/problems/pacific-atlantic-water-flow/) |
| 14 | Alien Dictionary | Build a graph from word pairs, then topological sort. | [LeetCode 269](https://leetcode.com/problems/alien-dictionary/) |

## All-pairs shortest paths and SCCs
| # | Problem | Hint | Link |
|---|---------|------|------|
| 15 | Find the City With the Smallest Number of Neighbors | Floyd-Warshall, then count who is within the threshold. | [LeetCode 1334](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/) |
| 16 | Course Schedule IV | Transitive closure - Warshall on booleans. | [LeetCode 1462](https://leetcode.com/problems/course-schedule-iv/) |
| 17 | Number of Operations to Make Network Connected | Components, then count spare cables. | [LeetCode 1319](https://leetcode.com/problems/number-of-operations-to-make-network-connected/) |
| 18 | Critical Connections in a Network | Tarjan for bridges - same lowlink idea, edge version. | [LeetCode 1192](https://leetcode.com/problems/critical-connections-in-a-network/) |
| 19 | Strongly Connected Components (Kosaraju) | Two passes; reverse the graph between them. | [GfG](https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1) |
| 20 | Minimum Number of Days to Disconnect Island | The answer is always 0, 1 or 2 - articulation points. | [LeetCode 1568](https://leetcode.com/problems/minimum-number-of-days-to-disconnect-island/) |

## Self-check before moving on

- [ ] I mark vertices visited when I enqueue them, never on dequeue.
- [ ] I know BFS gives shortest paths only when every edge costs the same.
- [ ] I know Dijkstra breaks on negative weights and Bellman-Ford does not.
- [ ] I can write both topological sorts and use them to detect cycles.
- [ ] I treat grids as implicit graphs without building an adjacency list.
- [ ] I know why `k` must be the OUTERMOST loop in Floyd-Warshall.
- [ ] I can say when Floyd-Warshall beats running Dijkstra V times.
- [ ] I know what an SCC is and why contracting them yields a DAG.
- [ ] I can explain why reversing the graph is what makes Kosaraju work.
- [ ] I know what Tarjan'''s `lowlink` measures and what the on-stack test prevents.
