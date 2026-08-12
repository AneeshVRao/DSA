# Practice Problems - 01 Basics and Syntax (Python)

Warm-ups. The goal is fluency with lists, dicts, sets and strings, not clever
algorithms. Try to solve each in under 15 lines.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Running Sum of 1d Array | One pass, keep an accumulator. | [LeetCode 1480](https://leetcode.com/problems/running-sum-of-1d-array/) |
| 2 | Richest Customer Wealth | `max(sum(row) for row in accounts)`. | [LeetCode 1672](https://leetcode.com/problems/richest-customer-wealth/) |
| 3 | Number of Good Pairs | Count frequencies, then add `c * (c - 1) // 2`. | [LeetCode 1512](https://leetcode.com/problems/number-of-good-pairs/) |
| 4 | Shuffle the Array | Zip the two halves, flatten with a comprehension. | [LeetCode 1470](https://leetcode.com/problems/shuffle-the-array/) |
| 5 | Kids With the Greatest Number of Candies | Compare each kid to `max(candies) - extra`. | [LeetCode 1431](https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/) |
| 6 | Defanging an IP Address | `s.replace(".", "[.]")` - know your `str` methods. | [LeetCode 1108](https://leetcode.com/problems/defanging-an-ip-address/) |
| 7 | Jewels and Stones | Put jewels in a `set`, then one pass over stones. | [LeetCode 771](https://leetcode.com/problems/jewels-and-stones/) |
| 8 | Find Numbers with Even Number of Digits | `len(str(x)) % 2 == 0`. | [LeetCode 1295](https://leetcode.com/problems/find-numbers-with-even-number-of-digits/) |
| 9 | Python DSA drills | Language-level practice set. | [GfG](https://www.geeksforgeeks.org/python-data-structures-and-algorithms/) |

## Self-check before moving on

- [ ] I know why `list.pop(0)` is `O(n)` and what to use instead.
- [ ] I can build a 2-D grid without aliasing rows.
- [ ] I reach for a `set` the moment I write `in` inside a loop.
- [ ] I build strings with `"".join(...)`, never `+=` in a loop.
- [ ] I can use `deque`, `Counter`, `defaultdict`, `heapq` and `bisect` from memory.
