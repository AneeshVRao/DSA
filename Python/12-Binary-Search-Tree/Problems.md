# Practice Problems - 12 Binary Search Tree (Python)

For each one, ask: what does the BST property let me skip? If your solution
would work unchanged on an unordered tree, you have not used the invariant.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Search in a Binary Search Tree | One descent. | [LeetCode 700](https://leetcode.com/problems/search-in-a-binary-search-tree/) |
| 2 | Insert into a Binary Search Tree | Search, then attach at the empty spot. | [LeetCode 701](https://leetcode.com/problems/insert-into-a-binary-search-tree/) |
| 3 | Delete Node in a BST | Three cases; successor for the two-child case. | [LeetCode 450](https://leetcode.com/problems/delete-node-in-a-bst/) |
| 4 | Validate Binary Search Tree | Pass `(low, high)` bounds down. | [LeetCode 98](https://leetcode.com/problems/validate-binary-search-tree/) |
| 5 | Kth Smallest Element in a BST | Inorder walk, stop at k. | [LeetCode 230](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) |
| 6 | Lowest Common Ancestor of a BST | First node between p and q. | [LeetCode 235](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) |
| 7 | Convert Sorted Array to Binary Search Tree | Middle element as root. | [LeetCode 108](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/) |
| 8 | Range Sum of BST | Prune subtrees outside the range. | [LeetCode 938](https://leetcode.com/problems/range-sum-of-bst/) |
| 9 | Minimum Absolute Difference in BST | Adjacent values in the inorder walk. | [LeetCode 530](https://leetcode.com/problems/minimum-absolute-difference-in-bst/) |
| 10 | Inorder Successor in BST | Remember the node whenever you go left. | [LeetCode 285](https://leetcode.com/problems/inorder-successor-in-bst/) |
| 11 | Two Sum IV - Input is a BST | Inorder + two pointers, or a seen set. | [LeetCode 653](https://leetcode.com/problems/two-sum-iv-input-is-a-bst/) |
| 12 | Recover Binary Search Tree | Two nodes swapped: find the inorder dips. | [LeetCode 99](https://leetcode.com/problems/recover-binary-search-tree/) |

## Self-check before moving on

- [ ] I know why checking parent-vs-child is not enough for validation.
- [ ] I can implement all three deletion cases.
- [ ] I know inorder yields sorted output, and use it deliberately.
- [ ] I can do LCA, floor, ceiling and range sum in `O(h)`.
- [ ] I know sorted input degenerates a BST, and how to build a balanced one.
