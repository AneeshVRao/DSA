# Practice Problems - 01 Basics and Syntax (Go)

Warm-ups for slices, maps and strings. Watch for the two Go-specific habits:
always reassign `append`, and never depend on map iteration order.

| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Running Sum of 1d Array | Mutate in place, or `make([]int, len(nums))`. | [LeetCode 1480](https://leetcode.com/problems/running-sum-of-1d-array/) |
| 2 | Richest Customer Wealth | Nested `range`, track the max. | [LeetCode 1672](https://leetcode.com/problems/richest-customer-wealth/) |
| 3 | Two Sum | `map[int]int` from value to index, one pass. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 4 | Contains Duplicate | `map[int]struct{}` as a set. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 5 | Reverse String | `[]byte` or `[]rune`, then two pointers. | [LeetCode 344](https://leetcode.com/problems/reverse-string/) |
| 6 | Sort Array By Parity | `sort.SliceStable` with a parity comparator. | [LeetCode 905](https://leetcode.com/problems/sort-array-by-parity/) |
| 7 | Number of Good Pairs | Count with a map, then `c * (c - 1) / 2`. | [LeetCode 1512](https://leetcode.com/problems/number-of-good-pairs/) |
| 8 | Valid Anagram | Compare two `[26]int` arrays (comparable in Go). | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |

## Self-check before moving on

- [ ] I always write `s = append(s, x)`, never bare `append(s, x)`.
- [ ] I know a sub-slice shares memory with its parent, and how to copy.
- [ ] I use the comma-ok idiom (`v, ok := m[k]`) instead of comparing to zero.
- [ ] I use `strings.Builder` rather than `+=` in a loop.
- [ ] I sort map keys before producing any ordered output.
