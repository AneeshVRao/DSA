# Practice Problems - 04 Strings (Python)

Most string problems are an array problem wearing a costume. Ask first: is this
two pointers, a frequency count, or a sliding window?

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Palindrome | Two pointers, skip non-alphanumerics. | [LeetCode 125](https://leetcode.com/problems/valid-palindrome/) |
| 2 | Valid Anagram | 26-slot count array, not sorting. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 3 | Group Anagrams | Count tuple as the dict key. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 4 | Longest Substring Without Repeating Characters | Sliding window + last-seen dict. | [LeetCode 3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) |
| 5 | Minimum Window Substring | Window + a `missing` counter. Hard but foundational. | [LeetCode 76](https://leetcode.com/problems/minimum-window-substring/) |
| 6 | Longest Common Prefix | Vertical scan, stop at the first mismatch. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 7 | String Compression | In-place write pointer; count runs. | [LeetCode 443](https://leetcode.com/problems/string-compression/) |
| 8 | Implement strStr() | Naive first, then KMP. | [LeetCode 28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) |
| 9 | Longest Palindromic Substring | Expand around each of the 2n-1 centres. | [LeetCode 5](https://leetcode.com/problems/longest-palindromic-substring/) |
| 10 | Reverse Words in a String | `split()` then `reversed()`; then do it in place. | [LeetCode 151](https://leetcode.com/problems/reverse-words-in-a-string/) |
| 11 | Valid Parentheses | A stack - preview of chapter 06. | [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) |
| 12 | Roman to Integer | Right to left; subtract when a smaller value precedes a larger. | [LeetCode 13](https://leetcode.com/problems/roman-to-integer/) |

## Self-check before moving on

- [ ] I build strings with `"".join(parts)`, never `+=` in a loop.
- [ ] I can write the palindrome two-pointer loop with filtering from memory.
- [ ] I use a 26-slot list for lowercase-only frequency problems.
- [ ] I can explain what `lps[i]` means in KMP.
- [ ] I remember that slicing a string copies it.
