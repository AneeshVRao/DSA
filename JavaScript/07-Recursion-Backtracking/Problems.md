# Practice Problems - 07 Recursion and Backtracking (JavaScript)

Write the template from memory: choose, explore, un-choose. Always spread the
path when you record a result.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Subsets | Take/skip at each index. | [LeetCode 78](https://leetcode.com/problems/subsets/) |
| 2 | Subsets II | Sort, then skip duplicate siblings. | [LeetCode 90](https://leetcode.com/problems/subsets-ii/) |
| 3 | Permutations | `used[]` array prunes repeats. | [LeetCode 46](https://leetcode.com/problems/permutations/) |
| 4 | Combination Sum | Recurse on `i` to allow reuse. | [LeetCode 39](https://leetcode.com/problems/combination-sum/) |
| 5 | Generate Parentheses | Two counters, valid by construction. | [LeetCode 22](https://leetcode.com/problems/generate-parentheses/) |
| 6 | Letter Combinations of a Phone Number | One recursion level per digit. | [LeetCode 17](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) |
| 7 | Word Search | Mark the cell, recurse, restore. | [LeetCode 79](https://leetcode.com/problems/word-search/) |
| 8 | N-Queens | Sets for column, `r-c` and `r+c`. | [LeetCode 51](https://leetcode.com/problems/n-queens/) |
| 9 | Sudoku Solver | Three constraint sets, same skeleton. | [LeetCode 37](https://leetcode.com/problems/sudoku-solver/) |
| 10 | Palindrome Partitioning | Cut at every palindromic prefix. | [LeetCode 131](https://leetcode.com/problems/palindrome-partitioning/) |
| 11 | Pow(x, n) | Fast exponentiation. | [LeetCode 50](https://leetcode.com/problems/powx-n/) |
| 12 | Flatten Deeply Nested Array | Recursion on arrays; compare with `flat(Infinity)`. | [LeetCode 2625](https://leetcode.com/problems/flatten-deeply-nested-array/) |

## Self-check before moving on

- [ ] I push `[...path]`, never `path`.
- [ ] I undo every mutation, including `Set.delete`.
- [ ] I know Node overflows at roughly 10k frames.
- [ ] I can state the recursion tree for each classic problem.
- [ ] I can rewrite any recursion with an explicit stack array.
