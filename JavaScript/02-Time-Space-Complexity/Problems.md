# Practice Problems - 02 Time and Space Complexity (JavaScript)

For each: write the brute force, state its complexity, then look at the
constraints and decide whether it survives.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Two Sum | `O(n^2)` loops vs `O(n)` `Map`. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `new Set(nums).size !== nums.length` is `O(n)`. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Intersection of Two Arrays | `includes` is `O(n*m)`; `Set` makes it `O(n+m)`. | [LeetCode 349](https://leetcode.com/problems/intersection-of-two-arrays/) |
| 4 | Maximum Subarray | `O(n^3)` -> `O(n^2)` -> `O(n)` Kadane. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 5 | Best Time to Buy and Sell Stock | One pass, track the running minimum. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 6 | Fibonacci Number | Count the calls, then memoise with a `Map`. | [LeetCode 509](https://leetcode.com/problems/fibonacci-number/) |
| 7 | Squares of a Sorted Array | Sort `O(n log n)` vs two pointers `O(n)`. | [LeetCode 977](https://leetcode.com/problems/squares-of-a-sorted-array/) |
| 8 | Number of Recent Calls | A queue where `shift()` would be `O(n^2)`. | [LeetCode 933](https://leetcode.com/problems/number-of-recent-calls/) |

## Self-check before moving on

- [ ] I never call `includes()` inside a loop over the other array.
- [ ] I know `shift()`/`unshift()`/`splice()` are `O(n)`.
- [ ] I use a head index or linked list for queues.
- [ ] I count every intermediate array in a `map().filter()` chain as `O(n)` space.
- [ ] I know Node overflows the stack at roughly 10k recursive frames.
