# Practice Problems - 02 Time and Space Complexity (Go)

Write the brute force first, state its complexity, then check it against the
constraints. Use `go test -bench=. -benchmem` when you want real numbers.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Two Sum | `O(n^2)` loops vs `O(n)` `map[int]int`. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `map[int]struct{}` in one pass. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Maximum Subarray | `O(n^3)` -> `O(n^2)` -> `O(n)` Kadane. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 4 | Best Time to Buy and Sell Stock | One pass, track the running minimum. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 5 | Squares of a Sorted Array | `sort.Ints` `O(n log n)` vs two pointers `O(n)`. | [LeetCode 977](https://leetcode.com/problems/squares-of-a-sorted-array/) |
| 6 | Fibonacci Number | Count calls, then memoise with a slice. | [LeetCode 509](https://leetcode.com/problems/fibonacci-number/) |
| 7 | Majority Element | `O(n log n)` sort vs `O(n)`/`O(1)` Boyer-Moore. | [LeetCode 169](https://leetcode.com/problems/majority-element/) |
| 8 | Longest Common Prefix | Compare `O(n*m)` scanning with sort-based tricks. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |

## Self-check before moving on

- [ ] I pre-size slices with `make([]T, 0, n)` when the length is known.
- [ ] I use `strings.Builder`, never `+=`, to build strings in a loop.
- [ ] I know a sub-slice keeps the whole backing array alive.
- [ ] I can read allocation counts from `go test -benchmem`.
- [ ] I pick the target complexity from the constraints before writing code.
