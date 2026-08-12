# Practice Problems - 01 Basics and Syntax (JavaScript)

Warm-ups for array, `Map`/`Set` and string fluency. Prefer `const`, arrow
functions and `===` throughout.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Running Sum of 1d Array | `reduce`, or one pass with an accumulator. | [LeetCode 1480](https://leetcode.com/problems/running-sum-of-1d-array/) |
| 2 | Richest Customer Wealth | `Math.max(...accounts.map(r => r.reduce(...)))`. | [LeetCode 1672](https://leetcode.com/problems/richest-customer-wealth/) |
| 3 | Shuffle the Array | Build with a loop, or `flatMap` over index pairs. | [LeetCode 1470](https://leetcode.com/problems/shuffle-the-array/) |
| 4 | Number of Good Pairs | `Map` of counts, then `c * (c - 1) / 2`. | [LeetCode 1512](https://leetcode.com/problems/number-of-good-pairs/) |
| 5 | Sorting the Sentence | `split(" ")`, sort by the trailing digit, `join`. | [LeetCode 1859](https://leetcode.com/problems/sorting-the-sentence/) |
| 6 | Two Sum | `Map` from value to index, single pass. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 7 | Contains Duplicate | `new Set(nums).size !== nums.length`. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 8 | Create Target Array in the Given Order | `splice(index, 0, value)` in a loop. | [LeetCode 1389](https://leetcode.com/problems/create-target-array-in-the-given-order/) |

## Self-check before moving on

- [ ] I never call `.sort()` on numbers without a comparator.
- [ ] I know `shift()` and `unshift()` are `O(n)`.
- [ ] I reach for `Map`/`Set` instead of objects and `includes`.
- [ ] I can build a 2-D grid with `Array.from` without aliasing rows.
- [ ] I use `===`, and `Number.isNaN` instead of `=== NaN`.
