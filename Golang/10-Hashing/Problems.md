# Practice Problems - 10 Hashing (Go)

Use `map[T]struct{}` for sets, pre-size with `make(map[K]V, n)`, and sort keys
before producing any ordered output.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Complement lookup in `map[int]int`. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `map[int]struct{}`. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Valid Anagram | Two `[26]int` arrays compared with `==`. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 4 | Group Anagrams | `map[[26]int][]string` - arrays are comparable. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 5 | Top K Frequent Elements | Count, then bucket by frequency. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Subarray Sum Equals K | Prefix sum + `map[int]int{0: 1}`. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 7 | Longest Consecutive Sequence | Set; only start runs at their beginning. | [LeetCode 128](https://leetcode.com/problems/longest-consecutive-sequence/) |
| 8 | Intersection of Two Arrays | Set membership, then sort. | [LeetCode 349](https://leetcode.com/problems/intersection-of-two-arrays/) |
| 9 | LRU Cache | `container/list` + `map[int]*list.Element`. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |
| 10 | Design HashMap | Implement chaining yourself. | [LeetCode 706](https://leetcode.com/problems/design-hashmap/) |
| 11 | Insert Delete GetRandom O(1) | Slice + index map; swap with last on delete. | [LeetCode 380](https://leetcode.com/problems/insert-delete-getrandom-o1/) |
| 12 | Word Pattern | Two maps, one per direction. | [LeetCode 290](https://leetcode.com/problems/word-pattern/) |

## Self-check before moving on

- [ ] I use the comma-ok idiom instead of comparing against the zero value.
- [ ] I know writing to a nil map panics.
- [ ] I never rely on map iteration order.
- [ ] I know which types are comparable enough to be map keys.
- [ ] I use `map[T]struct{}` for sets and pre-size maps I am about to fill.
