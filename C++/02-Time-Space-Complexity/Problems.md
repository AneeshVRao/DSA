# Practice Problems - 02 Time and Space Complexity (C++)

For each problem: write the brute force, compute its complexity, check it
against the stated constraints, then optimise only if the constraints demand it.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Two Sum | `O(n^2)` loops vs `O(n)` `unordered_map`. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `O(n^2)` vs `O(n log n)` sort vs `O(n)` hash set. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Maximum Subarray | Derive `O(n^3)` -> `O(n^2)` -> `O(n)` Kadane. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 4 | Best Time to Buy and Sell Stock | One pass tracking the running minimum. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 5 | Squares of a Sorted Array | Sorting is `O(n log n)`; two pointers is `O(n)`. | [LeetCode 977](https://leetcode.com/problems/squares-of-a-sorted-array/) |
| 6 | Fibonacci Number | Count recursive calls; then memoise. | [LeetCode 509](https://leetcode.com/problems/fibonacci-number/) |
| 7 | Majority Element | `O(n log n)` sort vs `O(n)`/`O(1)` Boyer-Moore. | [LeetCode 169](https://leetcode.com/problems/majority-element/) |
| 8 | Sieve of Eratosthenes | Why is it `O(n log log n)`, not `O(n^2)`? | [GfG](https://www.geeksforgeeks.org/sieve-of-eratosthenes/) |

## Empirical analysis
| Problem | Hint | Link |
|---------|------|------|
| Time-complexity practice set | Read the constraints, name the class BEFORE coding. | [GfG](https://www.geeksforgeeks.org/practice-questions-time-complexity-analysis/) |
| Sort an Array | Implement two sorts, count the comparisons, compare the growth. | [LeetCode 912](https://leetcode.com/problems/sort-an-array/) |
| Kth Largest Element in an Array | Measure heap vs quickselect vs full sort at several sizes. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |

## Self-check before moving on

- [ ] I use the 10^8-operations-per-second rule to sanity check a design.
- [ ] I never pass a `vector` by value in a hot path.
- [ ] I write `for (const auto& x : v)`, not `for (auto x : v)`.
- [ ] I know `map` is `O(log n)` and `unordered_map` is `O(1)` average.
- [ ] I count recursion depth against the stack limit.
- [ ] I assert on operation COUNTS and only report wall-clock times.
- [ ] I take the MINIMUM of several runs, never the mean.
- [ ] I can name a complexity class from its growth ratio alone.
