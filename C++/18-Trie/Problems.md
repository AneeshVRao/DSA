# Practice Problems - 18 Trie (C++)

The tell: **prefixes**, autocomplete, dictionaries, or "maximum XOR". If the
problem only needs exact membership, `unordered_set` is simpler and smaller.

| # | Problem | Why a trie | Link |
|---|---------|-----------|------|
| 1 | Implement Trie (Prefix Tree) | The reference implementation. | [LeetCode 208](https://leetcode.com/problems/implement-trie-prefix-tree/) |
| 2 | Design Add and Search Words Data Structure | `.` wildcards need DFS over children. | [LeetCode 211](https://leetcode.com/problems/design-add-and-search-words-data-structure/) |
| 3 | Longest Common Prefix | Walk while there is exactly one child. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 4 | Replace Words | Stop at the first stored prefix. | [LeetCode 648](https://leetcode.com/problems/replace-words/) |
| 5 | Word Search II | Trie + grid backtracking; prune dead prefixes. | [LeetCode 212](https://leetcode.com/problems/word-search-ii/) |
| 6 | Maximum XOR of Two Numbers in an Array | Bitwise trie: `O(32n)` beats `O(n^2)`. | [LeetCode 421](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) |
| 7 | Map Sum Pairs | Store values in nodes; sum a subtree. | [LeetCode 677](https://leetcode.com/problems/map-sum-pairs/) |
| 8 | Prefix and Suffix Search | Insert `suffix{prefix}` combinations. | [LeetCode 745](https://leetcode.com/problems/prefix-and-suffix-search/) |
| 9 | Concatenated Words | Trie + DP over each word. | [LeetCode 472](https://leetcode.com/problems/concatenated-words/) |
| 10 | Palindrome Pairs | Trie of reversed words + palindrome checks. | [LeetCode 336](https://leetcode.com/problems/palindrome-pairs/) |
| 11 | Stream of Characters | Trie of REVERSED words, query the recent stream. | [LeetCode 1032](https://leetcode.com/problems/stream-of-characters/) |
| 12 | Search Suggestions System | Autocomplete with three suggestions per prefix. | [LeetCode 1268](https://leetcode.com/problems/search-suggestions-system/) |

## Self-check before moving on

- [ ] I know why `isEnd` is necessary.
- [ ] I free the whole subtree in the destructor (postorder).
- [ ] I can choose between `TrieNode*[26]` and a map, and justify it.
- [ ] I can implement deletion without breaking longer words.
- [ ] I can build a bitwise trie for maximum-XOR problems.
