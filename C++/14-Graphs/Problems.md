# Practice Problems - 14 Graphs (C++)

Half of graph interviewing is noticing the problem *is* a graph. Grids, course
prerequisites, word ladders and flight routes are all the same shape.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Number of Islands | Grid DFS/BFS; sink each island. | [LeetCode 200](https://leetcode.com/problems/number-of-islands/) |
| 2 | Max Area of Island | Same traversal, return the size. | [LeetCode 695](https://leetcode.com/problems/max-area-of-island/) |
| 3 | Rotting Oranges | Multi-source BFS. | [LeetCode 994](https://leetcode.com/problems/rotting-oranges/) |
| 4 | Clone Graph | DFS + `unordered_map<Node*,Node*>`. | [LeetCode 133](https://leetcode.com/problems/clone-graph/) |
| 5 | Course Schedule | Directed cycle detection. | [LeetCode 207](https://leetcode.com/problems/course-schedule/) |
| 6 | Course Schedule II | Topological sort (Kahn). | [LeetCode 210](https://leetcode.com/problems/course-schedule-ii/) |
| 7 | Is Graph Bipartite? | Two-colour BFS. | [LeetCode 785](https://leetcode.com/problems/is-graph-bipartite/) |
| 8 | Word Ladder | BFS over an implicit word graph. | [LeetCode 127](https://leetcode.com/problems/word-ladder/) |
| 9 | Network Delay Time | Dijkstra with `priority_queue`. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |
| 10 | Cheapest Flights Within K Stops | Bellman-Ford limited to k+1 rounds. | [LeetCode 787](https://leetcode.com/problems/cheapest-flights-within-k-stops/) |
| 11 | Path With Minimum Effort | Dijkstra on a grid with a max-edge metric. | [LeetCode 1631](https://leetcode.com/problems/path-with-minimum-effort/) |
| 12 | Number of Provinces | Connected components, or union-find. | [LeetCode 547](https://leetcode.com/problems/number-of-provinces/) |
| 13 | Pacific Atlantic Water Flow | Two traversals inward from the borders. | [LeetCode 417](https://leetcode.com/problems/pacific-atlantic-water-flow/) |
| 14 | Minimum Spanning Tree | Kruskal with union-find (chapter 19). | [GfG](https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1) |

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

- [ ] I mark vertices visited on enqueue, never on dequeue.
- [ ] I use `long long` and a safe INF for weighted distances.
- [ ] I skip stale heap entries in Dijkstra instead of chasing decrease-key.
- [ ] I know Dijkstra fails on negative weights and Bellman-Ford does not.
- [ ] I treat grids as implicit graphs with a direction array.
- [ ] I know why `k` must be the OUTERMOST loop in Floyd-Warshall.
- [ ] I can say when Floyd-Warshall beats running Dijkstra V times.
- [ ] I know what an SCC is and why contracting them yields a DAG.
- [ ] I can explain why reversing the graph is what makes Kosaraju work.
- [ ] I know what Tarjan'''s `lowlink` measures and what the on-stack test prevents.
