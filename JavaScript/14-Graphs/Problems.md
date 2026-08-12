# Practice Problems - 14 Graphs (JavaScript)

Half of graph interviewing is recognising the problem *is* a graph. Use a head
index for BFS queues and bring your heap from chapter 13 for Dijkstra.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Number of Islands | Grid DFS/BFS; sink each island. | [LeetCode 200](https://leetcode.com/problems/number-of-islands/) |
| 2 | Max Area of Island | Same traversal, return the size. | [LeetCode 695](https://leetcode.com/problems/max-area-of-island/) |
| 3 | Flood Fill | The simplest grid DFS. | [LeetCode 733](https://leetcode.com/problems/flood-fill/) |
| 4 | Rotting Oranges | Multi-source BFS. | [LeetCode 994](https://leetcode.com/problems/rotting-oranges/) |
| 5 | Clone Graph | DFS + a `Map` from old node to new. | [LeetCode 133](https://leetcode.com/problems/clone-graph/) |
| 6 | Course Schedule | Directed cycle detection. | [LeetCode 207](https://leetcode.com/problems/course-schedule/) |
| 7 | Course Schedule II | Topological sort (Kahn). | [LeetCode 210](https://leetcode.com/problems/course-schedule-ii/) |
| 8 | Is Graph Bipartite? | Two-colour BFS. | [LeetCode 785](https://leetcode.com/problems/is-graph-bipartite/) |
| 9 | Word Ladder | BFS over an implicit word graph. | [LeetCode 127](https://leetcode.com/problems/word-ladder/) |
| 10 | Network Delay Time | Dijkstra with a real heap. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |
| 11 | Cheapest Flights Within K Stops | Bellman-Ford limited to k+1 rounds. | [LeetCode 787](https://leetcode.com/problems/cheapest-flights-within-k-stops/) |
| 12 | Number of Connected Components | BFS per unvisited vertex. | [LeetCode 323](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) |
| 13 | Pacific Atlantic Water Flow | Two traversals inward from the borders. | [LeetCode 417](https://leetcode.com/problems/pacific-atlantic-water-flow/) |
| 14 | Surrounded Regions | Mark from the border, then flip the rest. | [LeetCode 130](https://leetcode.com/problems/surrounded-regions/) |

## Self-check before moving on

- [ ] I use a head index for BFS queues, never `shift()`.
- [ ] I mark vertices visited on enqueue.
- [ ] I use a heap for Dijkstra, never a re-sorted array.
- [ ] I write DFS iteratively when the graph could be large.
- [ ] I encode grid cells as `r * cols + c` for `Set` membership.
