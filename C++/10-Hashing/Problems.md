# Practice Problems - 10 Hashing (C++)

When a nested loop scans the same container twice, a hash map usually
collapses it to one pass. Call `reserve()` when you know the size.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Complement lookup in `unordered_map`. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `unordered_set::insert` reports duplicates. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Valid Anagram | `int count[26]` beats a map here. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 4 | Group Anagrams | Sorted word as the key. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 5 | Top K Frequent Elements | Count, then bucket by frequency. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Subarray Sum Equals K | Prefix sum + count map, seeded with `{0,1}`. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 7 | Longest Consecutive Sequence | Set; only start runs at their beginning. | [LeetCode 128](https://leetcode.com/problems/longest-consecutive-sequence/) |
| 8 | LRU Cache | `list` + `unordered_map` of iterators. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |
| 9 | Design HashMap | Implement chaining yourself. | [LeetCode 706](https://leetcode.com/problems/design-hashmap/) |
| 10 | 4Sum II | Hash pairwise sums, then look up complements. | [LeetCode 454](https://leetcode.com/problems/4sum-ii/) |
| 11 | Insert Delete GetRandom O(1) | Vector + index map; swap-with-last on erase. | [LeetCode 380](https://leetcode.com/problems/insert-delete-getrandom-o1/) |
| 12 | Number of Islands (visited set) | Encode `(r,c)` as `r * cols + c`. | [LeetCode 200](https://leetcode.com/problems/number-of-islands/) |

## Self-check before moving on

- [ ] I can implement chaining, load factor and rehashing from scratch.
- [ ] I know when `map` beats `unordered_map`.
- [ ] I can supply a custom hash for a `pair` key (and know not to use plain XOR).
- [ ] I call `reserve()` before bulk inserts.
- [ ] I know rehashing invalidates iterators but not references.
