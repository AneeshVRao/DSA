# Practice Problems - 04 Strings (Go)

Decide up front whether the problem is byte-oriented (ASCII) or rune-oriented
(Unicode). Build every string with `strings.Builder`.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Palindrome | Two pointers over `[]rune`, `unicode.IsLetter`. | [LeetCode 125](https://leetcode.com/problems/valid-palindrome/) |
| 2 | Valid Anagram | `var a, b [26]int`, then `a == b`. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 3 | Group Anagrams | `map[[26]int][]string` - arrays are comparable. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 4 | Longest Substring Without Repeating Characters | Window + `[256]int` last-seen. | [LeetCode 3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) |
| 5 | Minimum Window Substring | Window + `missing` counter. | [LeetCode 76](https://leetcode.com/problems/minimum-window-substring/) |
| 6 | Longest Common Prefix | Vertical scan. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 7 | String Compression | `strings.Builder`, count runs. | [LeetCode 443](https://leetcode.com/problems/string-compression/) |
| 8 | Find the Index of the First Occurrence | Naive, then KMP. | [LeetCode 28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) |
| 9 | Longest Palindromic Substring | Expand around each centre. | [LeetCode 5](https://leetcode.com/problems/longest-palindromic-substring/) |
| 10 | Reverse Words in a String | `strings.Fields` + reverse + `Join`. | [LeetCode 151](https://leetcode.com/problems/reverse-words-in-a-string/) |
| 11 | Reverse String | `[]byte` two pointers, in place. | [LeetCode 344](https://leetcode.com/problems/reverse-string/) |
| 12 | Implement Atoi | Careful overflow handling with `int64`. | [LeetCode 8](https://leetcode.com/problems/string-to-integer-atoi/) |

## Rolling hash
| Problem | Hint | Link |
|---------|------|------|
| Longest Duplicate Substring | Binary search the length, hash every window of it. | [LeetCode 1044](https://leetcode.com/problems/longest-duplicate-substring/) |
| Repeated DNA Sequences | Fixed window of 10 - a rolling hash or a set of slices. | [LeetCode 187](https://leetcode.com/problems/repeated-dna-sequences/) |
| Longest Happy Prefix | Prefix == suffix: KMP's LPS, or hash both ends. | [LeetCode 1392](https://leetcode.com/problems/longest-happy-prefix/) |
| Distinct Echo Substrings | Hash to compare halves in O(1). | [LeetCode 1316](https://leetcode.com/problems/distinct-echo-substrings/) |
| Rabin-Karp / Search Pattern | The reference implementation - and verify on hash match. | [GfG](https://www.geeksforgeeks.org/problems/search-pattern-rabin-karp-algorithm--141631/1) |

## Self-check before moving on

- [ ] I know `len(s)` counts bytes, not characters.
- [ ] I use `strings.Builder` (with `Grow`) instead of `+=` in loops.
- [ ] I use `[26]int` arrays as map keys where it helps.
- [ ] I know string slicing is `O(1)` and shares memory.
- [ ] I can write the KMP LPS table from memory.
- [ ] I never trust a hash match without comparing the characters.
