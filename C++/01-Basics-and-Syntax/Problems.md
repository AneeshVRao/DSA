# Practice Problems - 01 Basics and Syntax (C++)

Warm-ups for STL fluency. Use `vector`, `string`, `map` and `<algorithm>`
instead of hand-written loops wherever you can.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Running Sum of 1d Array | `partial_sum` or one accumulator pass. | [LeetCode 1480](https://leetcode.com/problems/running-sum-of-1d-array/) |
| 2 | Richest Customer Wealth | `accumulate(row.begin(), row.end(), 0)` per row. | [LeetCode 1672](https://leetcode.com/problems/richest-customer-wealth/) |
| 3 | Number of Good Pairs | Frequency array of size 101, then `c*(c-1)/2`. | [LeetCode 1512](https://leetcode.com/problems/number-of-good-pairs/) |
| 4 | Sort the People | `sort` with a lambda comparator on paired data. | [LeetCode 2418](https://leetcode.com/problems/sort-the-people/) |
| 5 | Two Sum | `unordered_map` from value to index, one pass. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 6 | Remove Duplicates from Sorted Array | `unique` + `erase`, or two pointers. | [LeetCode 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) |
| 7 | Reverse String | `reverse(s.begin(), s.end())`, then do it manually. | [LeetCode 344](https://leetcode.com/problems/reverse-string/) |
| 8 | Factorial of a Large Number | Where `long long` overflows: store digits in a `vector`. | [GfG](https://www.geeksforgeeks.org/problems/factorials-of-large-numbers2508/1) |

## Self-check before moving on

- [ ] I always write `1LL * a * b` when the product can exceed 2 * 10^9.
- [ ] I pass containers as `const vector<T>&`, never by value.
- [ ] I know when to pick `map` (sorted) over `unordered_map` (fast).
- [ ] I can use `sort`, `lower_bound`, `accumulate` and `max_element` from memory.
- [ ] I add `ios::sync_with_stdio(false); cin.tie(nullptr);` to contest solutions.
