# Practice Problems - 12 Binary Search Tree (C++)

For each: what does the ordering let you skip? If the solution would work on
an unordered tree, you have not used the invariant.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Search in a Binary Search Tree | One descent. | [LeetCode 700](https://leetcode.com/problems/search-in-a-binary-search-tree/) |
| 2 | Insert into a Binary Search Tree | Attach at the empty spot. | [LeetCode 701](https://leetcode.com/problems/insert-into-a-binary-search-tree/) |
| 3 | Delete Node in a BST | Three cases; free what you unlink. | [LeetCode 450](https://leetcode.com/problems/delete-node-in-a-bst/) |
| 4 | Validate Binary Search Tree | `long long` bounds passed downward. | [LeetCode 98](https://leetcode.com/problems/validate-binary-search-tree/) |
| 5 | Kth Smallest Element in a BST | Iterative inorder, stop at k. | [LeetCode 230](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) |
| 6 | Lowest Common Ancestor of a BST | First node between p and q. | [LeetCode 235](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) |
| 7 | Convert Sorted Array to Binary Search Tree | Middle element as root. | [LeetCode 108](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/) |
| 8 | Range Sum of BST | Prune subtrees outside the range. | [LeetCode 938](https://leetcode.com/problems/range-sum-of-bst/) |
| 9 | Minimum Absolute Difference in BST | Adjacent inorder values. | [LeetCode 530](https://leetcode.com/problems/minimum-absolute-difference-in-bst/) |
| 10 | Trim a Binary Search Tree | Recursive pruning, free what you drop. | [LeetCode 669](https://leetcode.com/problems/trim-a-binary-search-tree/) |
| 11 | Recover Binary Search Tree | Two swapped nodes: find the inorder dips. | [LeetCode 99](https://leetcode.com/problems/recover-binary-search-tree/) |
| 12 | Balance a Binary Search Tree | Inorder to array, then rebuild from the middle. | [LeetCode 1382](https://leetcode.com/problems/balance-a-binary-search-tree/) |

## Self-check before moving on

- [ ] I know why parent-vs-child checking fails to validate a BST.
- [ ] I can implement all three deletion cases and free every node.
- [ ] I use `set`/`map` member `lower_bound`, never the free function.
- [ ] I can do LCA, floor, ceiling and range sum in `O(h)`.
- [ ] I know sorted input degenerates a BST into a linked list.
