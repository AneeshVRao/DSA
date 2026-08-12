# Practice Problems - 07 Recursion and Backtracking (Python)

Write the template from memory each time: choose, explore, un-choose. Then ask
what prunes the search.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Subsets | Include/exclude at each index. | [LeetCode 78](https://leetcode.com/problems/subsets/) |
| 2 | Subsets II | Sort first, then skip duplicate siblings. | [LeetCode 90](https://leetcode.com/problems/subsets-ii/) |
| 3 | Permutations | `used[]` array prunes repeats. | [LeetCode 46](https://leetcode.com/problems/permutations/) |
| 4 | Combination Sum | Reuse allowed: recurse on `i`, not `i+1`. | [LeetCode 39](https://leetcode.com/problems/combination-sum/) |
| 5 | Generate Parentheses | Two counters make every result valid by construction. | [LeetCode 22](https://leetcode.com/problems/generate-parentheses/) |
| 6 | Letter Combinations of a Phone Number | Digit -> letters, one level per digit. | [LeetCode 17](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) |
| 7 | Word Search | Mark the cell, recurse, restore. | [LeetCode 79](https://leetcode.com/problems/word-search/) |
| 8 | N-Queens | Track column, `r-c` and `r+c` diagonals. | [LeetCode 51](https://leetcode.com/problems/n-queens/) |
| 9 | Sudoku Solver | Same skeleton, three constraint sets. | [LeetCode 37](https://leetcode.com/problems/sudoku-solver/) |
| 10 | Palindrome Partitioning | Cut at every valid palindrome prefix. | [LeetCode 131](https://leetcode.com/problems/palindrome-partitioning/) |
| 11 | Pow(x, n) | Fast exponentiation; handle negative n. | [LeetCode 50](https://leetcode.com/problems/powx-n/) |
| 12 | Tower of Hanoi | Prove the `2^n - 1` bound. | [GfG](https://www.geeksforgeeks.org/problems/tower-of-hanoi-1587115621/1) |

## Self-check before moving on

- [ ] I always append a **copy** of the path, never the path itself.
- [ ] I undo every piece of state I mutated, in reverse order.
- [ ] I can state the recursion tree and complexity for each classic problem.
- [ ] I know where to prune and can quantify what it saves.
- [ ] I can convert a recursion into an explicit-stack loop.
