# Practice Problems - 02 Time and Space Complexity (Python)

These are less about code and more about *analysis*. For each one: write the
brute force, state its complexity, then find the constraint that kills it.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Two Sum | `O(n^2)` nested loops vs `O(n)` dict. Compare them. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `O(n^2)` pairs vs `O(n log n)` sort vs `O(n)` set. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Maximum Subarray | `O(n^3)` -> `O(n^2)` -> `O(n)` Kadane. Derive all three. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 4 | Best Time to Buy and Sell Stock | Every pair is `O(n^2)`; one pass tracking the min is `O(n)`. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 5 | Fibonacci Number | Naive recursion is `O(2^n)`; memoised is `O(n)`. Count the calls. | [LeetCode 509](https://leetcode.com/problems/fibonacci-number/) |
| 6 | Squares of a Sorted Array | `O(n log n)` sort vs `O(n)` two pointers. | [LeetCode 977](https://leetcode.com/problems/squares-of-a-sorted-array/) |
| 7 | Search Insert Position | Prove your binary search is `O(log n)` by counting iterations. | [LeetCode 35](https://leetcode.com/problems/search-insert-position/) |
| 8 | Analysis of Algorithms quiz | Pure Big-O drills, no coding. | [GfG](https://www.geeksforgeeks.org/analysis-of-algorithms/) |

## Self-check before moving on

- [ ] Given `n <= 10^5`, I immediately aim for `O(n log n)` or better.
- [ ] I can spot hidden `O(n)` work in `x in list`, `pop(0)` and slicing.
- [ ] I count recursion depth as space, not just time.
- [ ] I can explain why `list.append` is amortised `O(1)`.
- [ ] I can turn an `O(2^n)` recursion into `O(n)` with memoisation.
