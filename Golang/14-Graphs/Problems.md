# Practice Problems - 14 Graphs (Go)

Half of graph interviewing is noticing the problem *is* a graph. Prefer
`[][]int` over maps for integer vertices, and use a head index for BFS queues.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Number of Islands | Grid DFS/BFS; sink each island. | [LeetCode 200](https://leetcode.com/problems/number-of-islands/) |
| 2 | Max Area of Island | Same traversal, return the size. | [LeetCode 695](https://leetcode.com/problems/max-area-of-island/) |
| 3 | Rotting Oranges | Multi-source BFS. | [LeetCode 994](https://leetcode.com/problems/rotting-oranges/) |
| 4 | Clone Graph | DFS + `map[*Node]*Node`. | [LeetCode 133](https://leetcode.com/problems/clone-graph/) |
| 5 | Course Schedule | Directed cycle detection. | [LeetCode 207](https://leetcode.com/problems/course-schedule/) |
| 6 | Course Schedule II | Topological sort (Kahn). | [LeetCode 210](https://leetcode.com/problems/course-schedule-ii/) |
| 7 | Is Graph Bipartite? | Two-colour BFS. | [LeetCode 785](https://leetcode.com/problems/is-graph-bipartite/) |
| 8 | Word Ladder | BFS over an implicit word graph. | [LeetCode 127](https://leetcode.com/problems/word-ladder/) |
| 9 | Network Delay Time | Dijkstra with `container/heap`. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |
| 10 | Cheapest Flights Within K Stops | Bellman-Ford limited to k+1 rounds. | [LeetCode 787](https://leetcode.com/problems/cheapest-flights-within-k-stops/) |
| 11 | Number of Provinces | Connected components, or union-find. | [LeetCode 547](https://leetcode.com/problems/number-of-provinces/) |
| 12 | Pacific Atlantic Water Flow | Two traversals inward from the borders. | [LeetCode 417](https://leetcode.com/problems/pacific-atlantic-water-flow/) |
| 13 | Surrounded Regions | Mark from the border, then flip. | [LeetCode 130](https://leetcode.com/problems/surrounded-regions/) |
| 14 | Find Eventual Safe States | Reverse topological sort / three-colour DFS. | [LeetCode 802](https://leetcode.com/problems/find-eventual-safe-states/) |

## Self-check before moving on

- [ ] I mark vertices visited on enqueue.
- [ ] I use a head index rather than reslicing the queue.
- [ ] I use `math.MaxInt64 / 4` as INF so relaxation cannot overflow.
- [ ] I skip stale heap entries in Dijkstra.
- [ ] I sort anything derived from map iteration before comparing it.
