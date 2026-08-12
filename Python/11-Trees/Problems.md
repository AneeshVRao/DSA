# Practice Problems - 11 Trees (Python)

Ask one question first: does the answer need information from the children
(bottom-up recursion) or from the parents (pass state down)?

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Maximum Depth of Binary Tree | The base recursion. | [LeetCode 104](https://leetcode.com/problems/maximum-depth-of-binary-tree/) |
| 2 | Same Tree | Compare structure and values together. | [LeetCode 100](https://leetcode.com/problems/same-tree/) |
| 3 | Invert Binary Tree | Swap children, recurse. | [LeetCode 226](https://leetcode.com/problems/invert-binary-tree/) |
| 4 | Symmetric Tree | Mirror comparison: outer with outer. | [LeetCode 101](https://leetcode.com/problems/symmetric-tree/) |
| 5 | Binary Tree Level Order Traversal | BFS, capture the level size first. | [LeetCode 102](https://leetcode.com/problems/binary-tree-level-order-traversal/) |
| 6 | Binary Tree Zigzag Level Order Traversal | BFS, reverse alternate levels. | [LeetCode 103](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) |
| 7 | Balanced Binary Tree | Return height + verdict together for `O(n)`. | [LeetCode 110](https://leetcode.com/problems/balanced-binary-tree/) |
| 8 | Diameter of Binary Tree | Track the best while computing heights. | [LeetCode 543](https://leetcode.com/problems/diameter-of-binary-tree/) |
| 9 | Path Sum | Subtract as you descend; check at leaves. | [LeetCode 112](https://leetcode.com/problems/path-sum/) |
| 10 | Binary Tree Right Side View | Last node of each BFS level. | [LeetCode 199](https://leetcode.com/problems/binary-tree-right-side-view/) |
| 11 | Lowest Common Ancestor of a Binary Tree | Split point of the two searches. | [LeetCode 236](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) |
| 12 | Binary Tree Maximum Path Sum | Clamp negative branches to 0. | [LeetCode 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/) |
| 13 | Serialize and Deserialize Binary Tree | Preorder with explicit null markers. | [LeetCode 297](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) |
| 14 | Construct Binary Tree from Preorder and Inorder | Root from preorder, split with inorder. | [LeetCode 105](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) |

## Self-check before moving on

- [ ] I can write all four traversals recursively and iteratively.
- [ ] I know inorder on a BST yields sorted output.
- [ ] I use the "return the value AND the answer" trick to avoid `O(n^2)`.
- [ ] I know why level order needs the level size captured up front.
- [ ] I can explain why serialisation needs explicit null markers.
