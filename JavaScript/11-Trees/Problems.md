# Practice Problems - 11 Trees (JavaScript)

Decide first whether the answer flows up from the children or down from the
parents. Use a head index for every BFS queue.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Maximum Depth of Binary Tree | The base recursion. | [LeetCode 104](https://leetcode.com/problems/maximum-depth-of-binary-tree/) |
| 2 | Same Tree | Compare structure and values together. | [LeetCode 100](https://leetcode.com/problems/same-tree/) |
| 3 | Invert Binary Tree | Destructuring swap. | [LeetCode 226](https://leetcode.com/problems/invert-binary-tree/) |
| 4 | Symmetric Tree | Mirror comparison. | [LeetCode 101](https://leetcode.com/problems/symmetric-tree/) |
| 5 | Binary Tree Level Order Traversal | BFS with a head index. | [LeetCode 102](https://leetcode.com/problems/binary-tree-level-order-traversal/) |
| 6 | Binary Tree Zigzag Level Order Traversal | Reverse alternate levels. | [LeetCode 103](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) |
| 7 | Balanced Binary Tree | Return height + verdict together. | [LeetCode 110](https://leetcode.com/problems/balanced-binary-tree/) |
| 8 | Diameter of Binary Tree | Track the best while computing heights. | [LeetCode 543](https://leetcode.com/problems/diameter-of-binary-tree/) |
| 9 | Path Sum | Subtract as you descend; check at leaves. | [LeetCode 112](https://leetcode.com/problems/path-sum/) |
| 10 | Binary Tree Right Side View | Last node per level. | [LeetCode 199](https://leetcode.com/problems/binary-tree-right-side-view/) |
| 11 | Lowest Common Ancestor of a Binary Tree | The split point. | [LeetCode 236](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) |
| 12 | Binary Tree Maximum Path Sum | Clamp negative branches to 0. | [LeetCode 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/) |
| 13 | Serialize and Deserialize Binary Tree | Preorder + null markers. | [LeetCode 297](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) |
| 14 | Flatten Binary Tree to Linked List | Reverse postorder with a running pointer. | [LeetCode 114](https://leetcode.com/problems/flatten-binary-tree-to-linked-list/) |

## Self-check before moving on

- [ ] I can write all four traversals recursively and iteratively.
- [ ] I never use `shift()` in a BFS queue.
- [ ] I return "value + answer" from one pass to avoid `O(n^2)`.
- [ ] I know Node overflows at roughly 10k frames and when that matters.
- [ ] I can explain Morris traversal's `O(1)` space trick.
