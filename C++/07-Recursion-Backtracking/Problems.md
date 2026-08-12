# Practice Problems - 07 Recursion and Backtracking (C++)

Write the template from memory: choose, explore, un-choose. Then ask what
prunes. Pass state by reference - copying vectors per node is the usual
performance bug.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Subsets | Take/skip at each index. | [LeetCode 78](https://leetcode.com/problems/subsets/) |
| 2 | Subsets II | Sort, then skip duplicate siblings. | [LeetCode 90](https://leetcode.com/problems/subsets-ii/) |
| 3 | Permutations | `vector<bool> used`. | [LeetCode 46](https://leetcode.com/problems/permutations/) |
| 4 | Combination Sum | Recurse on `i` to allow reuse; sort to enable `break`. | [LeetCode 39](https://leetcode.com/problems/combination-sum/) |
| 5 | Generate Parentheses | Two counters, valid by construction. | [LeetCode 22](https://leetcode.com/problems/generate-parentheses/) |
| 6 | Letter Combinations of a Phone Number | One level per digit. | [LeetCode 17](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) |
| 7 | Word Search | Mark, recurse, restore. | [LeetCode 79](https://leetcode.com/problems/word-search/) |
| 8 | N-Queens | Track `cols`, `r-c`, `r+c`. | [LeetCode 51](https://leetcode.com/problems/n-queens/) |
| 9 | Sudoku Solver | Row, column and box constraint sets. | [LeetCode 37](https://leetcode.com/problems/sudoku-solver/) |
| 10 | Palindrome Partitioning | Cut at every palindromic prefix. | [LeetCode 131](https://leetcode.com/problems/palindrome-partitioning/) |
| 11 | Pow(x, n) | Fast exponentiation; `n = INT_MIN` is the trap. | [LeetCode 50](https://leetcode.com/problems/powx-n/) |
| 12 | Rat in a Maze | Classic grid backtracking. | [GfG](https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1) |

## Self-check before moving on

- [ ] I pass containers by reference, never by value, into recursion.
- [ ] I undo every piece of state I set, including all three N-Queens sets.
- [ ] I `push_back` a copy of the path, not a reference to it.
- [ ] I can state the recursion tree and complexity for each classic.
- [ ] I know a stack overflow in C++ is a segfault, not an exception.
