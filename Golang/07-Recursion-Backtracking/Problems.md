# Practice Problems - 07 Recursion and Backtracking (Go)

Write the template from memory: choose, explore, un-choose. And clone the path
before recording it - that is the Go-specific trap.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Subsets | Take/skip at each index; clone before appending. | [LeetCode 78](https://leetcode.com/problems/subsets/) |
| 2 | Subsets II | Sort, then skip duplicate siblings. | [LeetCode 90](https://leetcode.com/problems/subsets-ii/) |
| 3 | Permutations | `used []bool` prunes repeats. | [LeetCode 46](https://leetcode.com/problems/permutations/) |
| 4 | Combination Sum | Recurse on `i` to allow reuse; sort to enable `break`. | [LeetCode 39](https://leetcode.com/problems/combination-sum/) |
| 5 | Generate Parentheses | Two counters, valid by construction. | [LeetCode 22](https://leetcode.com/problems/generate-parentheses/) |
| 6 | Letter Combinations of a Phone Number | One level per digit. | [LeetCode 17](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) |
| 7 | Word Search | Mark, recurse, restore. | [LeetCode 79](https://leetcode.com/problems/word-search/) |
| 8 | N-Queens | `cols`, `r-c+n`, `r+c` boolean arrays. | [LeetCode 51](https://leetcode.com/problems/n-queens/) |
| 9 | Sudoku Solver | Three constraint sets. | [LeetCode 37](https://leetcode.com/problems/sudoku-solver/) |
| 10 | Palindrome Partitioning | Cut at every palindromic prefix. | [LeetCode 131](https://leetcode.com/problems/palindrome-partitioning/) |
| 11 | Pow(x, n) | Fast exponentiation. | [LeetCode 50](https://leetcode.com/problems/powx-n/) |
| 12 | Rat in a Maze | Grid backtracking with direction letters. | [GfG](https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1) |

## Self-check before moving on

- [ ] I clone the path (`append([]int(nil), path...)`) before recording it.
- [ ] I declare `var backtrack func(...)` before assigning the closure.
- [ ] I never shadow `path` with `:=` inside the loop.
- [ ] I undo every piece of state after the recursive call.
- [ ] I know Go grows stacks dynamically, unlike C++ and Node.
