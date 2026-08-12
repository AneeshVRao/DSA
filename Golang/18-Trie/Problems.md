# Practice Problems - 18 Trie (Go)

The tell: **prefixes**, autocomplete, dictionaries, or "maximum XOR". If you
only need exact membership, `map[string]struct{}` is simpler and smaller.

| # | Problem | Why a trie | Link |
|---|---------|-----------|------|
| 1 | Implement Trie (Prefix Tree) | The reference implementation. | [LeetCode 208](https://leetcode.com/problems/implement-trie-prefix-tree/) |
| 2 | Design Add and Search Words Data Structure | `.` wildcards need DFS over children. | [LeetCode 211](https://leetcode.com/problems/design-add-and-search-words-data-structure/) |
| 3 | Longest Common Prefix | Walk while there is exactly one child. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 4 | Replace Words | Stop at the first stored prefix. | [LeetCode 648](https://leetcode.com/problems/replace-words/) |
| 5 | Word Search II | Trie + grid backtracking; prune dead prefixes. | [LeetCode 212](https://leetcode.com/problems/word-search-ii/) |
| 6 | Maximum XOR of Two Numbers in an Array | Bitwise trie: `O(32n)` beats `O(n^2)`. | [LeetCode 421](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) |
| 7 | Search Suggestions System | Autocomplete with three suggestions per prefix. | [LeetCode 1268](https://leetcode.com/problems/search-suggestions-system/) |
| 8 | Map Sum Pairs | Store values in nodes; sum a subtree. | [LeetCode 677](https://leetcode.com/problems/map-sum-pairs/) |
| 9 | Concatenated Words | Trie + DP over each word. | [LeetCode 472](https://leetcode.com/problems/concatenated-words/) |
| 10 | Stream of Characters | Trie of REVERSED words over a recent-byte buffer. | [LeetCode 1032](https://leetcode.com/problems/stream-of-characters/) |
| 11 | Prefix and Suffix Search | Insert `suffix{prefix}` combinations. | [LeetCode 745](https://leetcode.com/problems/prefix-and-suffix-search/) |
| 12 | Palindrome Pairs | Trie of reversed words + palindrome checks. | [LeetCode 336](https://leetcode.com/problems/palindrome-pairs/) |

## Self-check before moving on

- [ ] I know why `isEnd` is necessary.
- [ ] I can choose between `[26]*TrieNode` and a map, and justify it.
- [ ] I remember map iteration is randomised, so the array form gives free order.
- [ ] I can implement deletion without breaking longer words.
- [ ] I can build a bitwise trie for maximum-XOR problems.
