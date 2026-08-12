# Practice Problems - 04 Strings (C++)

Most string problems are array problems in disguise. Decide first: two
pointers, frequency count, or sliding window?

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Palindrome | Two pointers, `isalnum` + `tolower`. | [LeetCode 125](https://leetcode.com/problems/valid-palindrome/) |
| 2 | Valid Anagram | `int count[26]`, one pass each. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 3 | Group Anagrams | Count signature as an `unordered_map` key. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 4 | Longest Substring Without Repeating Characters | Window + `lastSeen[256]`. | [LeetCode 3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) |
| 5 | Minimum Window Substring | Window + a `missing` counter. | [LeetCode 76](https://leetcode.com/problems/minimum-window-substring/) |
| 6 | Longest Common Prefix | Vertical scan. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 7 | String Compression | In-place write index; return the new length. | [LeetCode 443](https://leetcode.com/problems/string-compression/) |
| 8 | Find the Index of the First Occurrence | Naive, then KMP. | [LeetCode 28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) |
| 9 | Longest Palindromic Substring | Expand around 2n-1 centres. | [LeetCode 5](https://leetcode.com/problems/longest-palindromic-substring/) |
| 10 | Reverse Words in a String | Reverse the whole string, then each word. | [LeetCode 151](https://leetcode.com/problems/reverse-words-in-a-string/) |
| 11 | Integer to Roman | Greedy over a value/symbol table. | [LeetCode 12](https://leetcode.com/problems/integer-to-roman/) |
| 12 | Anagram (GfG) | Same as #2, different judge. | [GfG](https://www.geeksforgeeks.org/problems/anagram-1587115620/1) |

## Self-check before moving on

- [ ] I `reserve()` before building a string in a loop.
- [ ] I compare `find(...)` against `string::npos`, never `< 0`.
- [ ] I cast to `unsigned char` before calling `tolower`/`isalnum`.
- [ ] I know `substr` allocates, and avoid it inside loops.
- [ ] I can write the LPS table for KMP from memory.
