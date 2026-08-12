# Practice Problems - 12 Binary Search Tree (Go)

For each: what does the ordering let you skip? Return `(value, bool)` rather
than sentinels, and prefer iterative descents.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Search in a Binary Search Tree | One descent. | [LeetCode 700](https://leetcode.com/problems/search-in-a-binary-search-tree/) |
| 2 | Insert into a Binary Search Tree | Attach at the empty spot. | [LeetCode 701](https://leetcode.com/problems/insert-into-a-binary-search-tree/) |
| 3 | Delete Node in a BST | Three cases; successor for two children. | [LeetCode 450](https://leetcode.com/problems/delete-node-in-a-bst/) |
| 4 | Validate Binary Search Tree | `math.MinInt64` / `math.MaxInt64` bounds. | [LeetCode 98](https://leetcode.com/problems/validate-binary-search-tree/) |
| 5 | Kth Smallest Element in a BST | Iterative inorder, stop at k. | [LeetCode 230](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) |
| 6 | Lowest Common Ancestor of a BST | First node between p and q. | [LeetCode 235](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) |
| 7 | Convert Sorted Array to Binary Search Tree | Middle element as root. | [LeetCode 108](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/) |
| 8 | Range Sum of BST | Prune subtrees outside the range. | [LeetCode 938](https://leetcode.com/problems/range-sum-of-bst/) |
| 9 | Minimum Absolute Difference in BST | Adjacent inorder values. | [LeetCode 530](https://leetcode.com/problems/minimum-absolute-difference-in-bst/) |
| 10 | Increasing Order Search Tree | Inorder rebuild into a right-leaning chain. | [LeetCode 897](https://leetcode.com/problems/increasing-order-search-tree/) |
| 11 | Trim a Binary Search Tree | Recursive pruning. | [LeetCode 669](https://leetcode.com/problems/trim-a-binary-search-tree/) |
| 12 | Balance a Binary Search Tree | Inorder to slice, rebuild from the middle. | [LeetCode 1382](https://leetcode.com/problems/balance-a-binary-search-tree/) |

## Balanced trees
| Problem | Hint | Link |
|---------|------|------|
| Balance a Binary Search Tree | In-order walk, then rebuild from the sorted array. | [LeetCode 1382](https://leetcode.com/problems/balance-a-binary-search-tree/) |
| Balanced Binary Tree | Return the height and the verdict together, in one pass. | [LeetCode 110](https://leetcode.com/problems/balanced-binary-tree/) |
| Convert Sorted Array to BST | Always pick the middle - that is why it comes out balanced. | [LeetCode 108](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/) |
| Count of Smaller Numbers After Self | A BST with subtree sizes, or a Fenwick tree. | [LeetCode 315](https://leetcode.com/problems/count-of-smaller-numbers-after-self/) |
| AVL Tree Insertion | Write the four rotation cases from scratch. | [GfG](https://www.geeksforgeeks.org/problems/avl-tree-insertion/1) |
| AVL Tree Deletion | The case that can cascade - rebalance all the way up. | [GfG](https://www.geeksforgeeks.org/problems/avl-tree-deletion/1) |

## Self-check before moving on

- [ ] I know why parent-vs-child checking fails to validate a BST.
- [ ] I can implement all three deletion cases.
- [ ] I return `(value, bool)` instead of magic sentinels.
- [ ] I can do LCA, floor, ceiling and range sum in `O(h)`.
- [ ] I know Go has no ordered map in the standard library.
- [ ] I can draw the four AVL rotation cases and say which fixes which.
- [ ] I know why a rotation preserves the BST ordering.
- [ ] I know heights are CACHED, and why recomputing them is O(n) per insert.
- [ ] I know insert needs one rotation but delete may cascade to the root.
