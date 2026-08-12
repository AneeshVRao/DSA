# Practice Problems - 11 Trees (C++)

Ask first: does the answer come from the children (bottom-up) or from the
parents (pass state down)? Then write the postorder-shaped recursion.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Maximum Depth of Binary Tree | The base recursion. | [LeetCode 104](https://leetcode.com/problems/maximum-depth-of-binary-tree/) |
| 2 | Same Tree | Structure and values together. | [LeetCode 100](https://leetcode.com/problems/same-tree/) |
| 3 | Invert Binary Tree | Swap children; save one before overwriting. | [LeetCode 226](https://leetcode.com/problems/invert-binary-tree/) |
| 4 | Symmetric Tree | Mirror comparison. | [LeetCode 101](https://leetcode.com/problems/symmetric-tree/) |
| 5 | Binary Tree Level Order Traversal | `queue`, capture `q.size()` per level. | [LeetCode 102](https://leetcode.com/problems/binary-tree-level-order-traversal/) |
| 6 | Balanced Binary Tree | Return height + verdict in one pass. | [LeetCode 110](https://leetcode.com/problems/balanced-binary-tree/) |
| 7 | Diameter of Binary Tree | Track the best while computing heights. | [LeetCode 543](https://leetcode.com/problems/diameter-of-binary-tree/) |
| 8 | Path Sum II | Backtracking with push/pop on the path vector. | [LeetCode 113](https://leetcode.com/problems/path-sum-ii/) |
| 9 | Binary Tree Right Side View | Last node of each level. | [LeetCode 199](https://leetcode.com/problems/binary-tree-right-side-view/) |
| 10 | Lowest Common Ancestor of a Binary Tree | The split point. | [LeetCode 236](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) |
| 11 | Binary Tree Maximum Path Sum | Clamp negative branches to 0. | [LeetCode 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/) |
| 12 | Serialize and Deserialize Binary Tree | Preorder + null markers. | [LeetCode 297](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) |
| 13 | Construct Binary Tree from Preorder and Inorder | Root from preorder, split with inorder. | [LeetCode 105](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) |
| 14 | Count Complete Tree Nodes | Exploit completeness for `O(log^2 n)`. | [LeetCode 222](https://leetcode.com/problems/count-complete-tree-nodes/) |

## Euler tour
| Problem | Hint | Link |
|---------|------|------|
| Lowest Common Ancestor of a Binary Tree | Euler tour + RMQ, or the plain recursive version. | [LeetCode 236](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) |
| Number of Good Leaf Nodes Pairs | Subtree ranges make the pairing tractable. | [LeetCode 1530](https://leetcode.com/problems/number-of-good-leaf-nodes-pairs/) |
| Sum of Distances in Tree | Rerooting on a flattened tree. | [LeetCode 834](https://leetcode.com/problems/sum-of-distances-in-tree/) |
| Create Sorted Array through Instructions | Subtree ranges plus a Fenwick tree. | [LeetCode 1649](https://leetcode.com/problems/create-sorted-array-through-instructions/) |

## Expression trees
| Problem | Hint | Link |
|---------|------|------|
| Evaluate Reverse Polish Notation | Postfix, one stack pass - the tree is optional. | [LeetCode 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/) |
| Basic Calculator II | Precedence without brackets; shunting-yard or a running term. | [LeetCode 227](https://leetcode.com/problems/basic-calculator-ii/) |
| Basic Calculator | Now with brackets - the full shunting-yard. | [LeetCode 224](https://leetcode.com/problems/basic-calculator/) |
| Build Binary Expression Tree From Infix Expression | Exactly this section. | [LeetCode 1597](https://leetcode.com/problems/build-binary-expression-tree-from-infix-expression/) |
| Design an Expression Tree With Evaluate Function | Post-order fold. | [LeetCode 1628](https://leetcode.com/problems/design-an-expression-tree-with-evaluate-function/) |
| Different Ways to Add Parentheses | Every possible tree shape, not just one. | [LeetCode 241](https://leetcode.com/problems/different-ways-to-add-parentheses/) |

## Self-check before moving on

- [ ] I can write all four traversals recursively and iteratively.
- [ ] I free trees in postorder and never leak a subtree.
- [ ] I return "value + answer" from one pass instead of nesting traversals.
- [ ] I know why `q.size()` must be captured before the level loop.
- [ ] I can explain Morris traversal's `O(1)` space trick.
- [ ] I know the Euler tour has 2n-1 entries and why.
- [ ] I can use tin/tout to test ancestry in O(1).
- [ ] I know a subtree is a CONTIGUOUS timestamp range, and what that buys.
- [ ] I know why postfix and prefix need no brackets but infix does.
- [ ] I know the RIGHT operand pops first, and what breaks if it does not.
- [ ] I know shunting-yard does not validate unless I make it.
