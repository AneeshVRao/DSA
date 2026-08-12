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

## Self-check before moving on

- [ ] I mark vertices visited on enqueue, never on dequeue.
- [ ] I use `long long` and a safe INF for weighted distances.
- [ ] I skip stale heap entries in Dijkstra instead of chasing decrease-key.
- [ ] I know Dijkstra fails on negative weights and Bellman-Ford does not.
- [ ] I treat grids as implicit graphs with a direction array.
