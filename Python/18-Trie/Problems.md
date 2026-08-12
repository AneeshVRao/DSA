# Practice Problems - 18 Trie (Python)

The tell: the problem mentions **prefixes**, autocomplete, dictionaries, or
"maximum XOR". If it only needs exact membership, a `set` is simpler and
smaller.

| # | Problem | Why a trie | Link |
|---|---------|-----------|------|
| 1 | Implement Trie (Prefix Tree) | The reference implementation. | [LeetCode 208](https://leetcode.com/problems/implement-trie-prefix-tree/) |
| 2 | Design Add and Search Words Data Structure | `.` wildcards need DFS over children. | [LeetCode 211](https://leetcode.com/problems/design-add-and-search-words-data-structure/) |
| 3 | Longest Common Prefix | Walk while there is exactly one child. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 4 | Replace Words | Stop at the first stored prefix. | [LeetCode 648](https://leetcode.com/problems/replace-words/) |
| 5 | Word Search II | Trie + grid backtracking; prune dead prefixes. | [LeetCode 212](https://leetcode.com/problems/word-search-ii/) |
| 6 | Maximum XOR of Two Numbers in an Array | Bitwise trie: `O(32n)` beats `O(n^2)`. | [LeetCode 421](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) |
| 7 | Design Search Autocomplete System | Trie + top-k per prefix. | [LeetCode 642](https://leetcode.com/problems/design-search-autocomplete-system/) |
| 8 | Map Sum Pairs | Store values in nodes and sum a subtree. | [LeetCode 677](https://leetcode.com/problems/map-sum-pairs/) |
| 9 | Index Pairs of a String | Trie of words, scan from every index. | [LeetCode 1065](https://leetcode.com/problems/index-pairs-of-a-string/) |
| 10 | Camelcase Matching | Trie or two-pointer matching over queries. | [LeetCode 1023](https://leetcode.com/problems/camelcase-matching/) |
| 11 | Palindrome Pairs | Trie of reversed words plus palindrome checks. | [LeetCode 336](https://leetcode.com/problems/palindrome-pairs/) |
| 12 | Word Break II | Trie for prefixes + memoised backtracking. | [LeetCode 140](https://leetcode.com/problems/word-break-ii/) |

## Self-check before moving on

- [ ] I know why `is_end` is necessary.
- [ ] I know trie lookup is `O(L)` and independent of how many words are stored.
- [ ] I can implement deletion without breaking longer words.
- [ ] I know a trie only beats a hash set on PREFIX queries.
- [ ] I can build a bitwise trie for maximum-XOR problems.
