# Practice Problems - 10 Hashing (Python)

When you catch yourself writing a nested loop over the same array, ask whether
a dict or set collapses it to one pass. That is this chapter in one sentence.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Complement lookup in a dict. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Contains Duplicate | Seen set. | [LeetCode 217](https://leetcode.com/problems/contains-duplicate/) |
| 3 | Valid Anagram | Frequency map, or `Counter(a) == Counter(b)`. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 4 | Group Anagrams | Grouping by a computed key. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 5 | Top K Frequent Elements | `Counter` + bucket sort. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Subarray Sum Equals K | Prefix sum + count map. Seed `{0: 1}`. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 7 | Longest Consecutive Sequence | Set + only start runs at their beginning. | [LeetCode 128](https://leetcode.com/problems/longest-consecutive-sequence/) |
| 8 | First Unique Character in a String | Count, then scan. | [LeetCode 387](https://leetcode.com/problems/first-unique-character-in-a-string/) |
| 9 | Intersection of Two Arrays | Set intersection. | [LeetCode 349](https://leetcode.com/problems/intersection-of-two-arrays/) |
| 10 | LRU Cache | `OrderedDict`, or dict + doubly linked list. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |
| 11 | Design HashMap | Implement chaining yourself; no `dict` allowed. | [LeetCode 706](https://leetcode.com/problems/design-hashmap/) |
| 12 | 4Sum II | Hash the sums of two arrays, then look up complements. | [LeetCode 454](https://leetcode.com/problems/4sum-ii/) |

## Self-check before moving on

- [ ] I can implement a hash map with chaining, resizing and rehashing.
- [ ] I can explain load factor and why inserts are amortised `O(1)`.
- [ ] I know the `O(n)` worst case and what causes it.
- [ ] I know which objects can be dict keys and why.
- [ ] I recognise the prefix-sum-plus-map pattern on sight.
