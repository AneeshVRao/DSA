# Practice Problems - 10 Hashing (JavaScript)

Reach for `Map`/`Set` the moment you write a nested loop over the same array,
or `includes` inside a loop.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Complement lookup in a `Map`. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | `new Set(nums).size !== nums.length`. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Valid Anagram | Frequency `Map`, or a 26-slot array. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 4 | Group Anagrams | Sorted word as the `Map` key. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 5 | Top K Frequent Elements | Count, then bucket by frequency. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Subarray Sum Equals K | Prefix sum + count map seeded with `[0,1]`. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 7 | Longest Consecutive Sequence | `Set`; only start runs at their beginning. | [LeetCode 128](https://leetcode.com/problems/longest-consecutive-sequence/) |
| 8 | Intersection of Two Arrays | `Set` intersection. | [LeetCode 349](https://leetcode.com/problems/intersection-of-two-arrays/) |
| 9 | LRU Cache | A `Map` alone is enough - it keeps insertion order. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |
| 10 | Design HashMap | Implement chaining yourself. | [LeetCode 706](https://leetcode.com/problems/design-hashmap/) |
| 11 | Insert Delete GetRandom O(1) | Array + index `Map`; swap with last on delete. | [LeetCode 380](https://leetcode.com/problems/insert-delete-getrandom-o1/) |
| 12 | Isomorphic Strings | Two maps, one per direction. | [LeetCode 205](https://leetcode.com/problems/isomorphic-strings/) |

## Self-check before moving on

- [ ] I use `Map` for dynamic keys and objects only for fixed shapes.
- [ ] I know object keys are coerced to strings and `Map` keys are not.
- [ ] I can implement chaining, load factor and resizing from scratch.
- [ ] I never use `includes` inside a loop over another array.
- [ ] I know `Map` preserves insertion order and how that gives a free LRU.
