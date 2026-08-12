# Practice Problems - 04 Strings (JavaScript)

Ask first: two pointers, frequency count, or sliding window? Build output with
arrays and `join`, not `+=`.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Palindrome | Two pointers; `/[a-z0-9]/i` to filter. | [LeetCode 125](https://leetcode.com/problems/valid-palindrome/) |
| 2 | Valid Anagram | 26-slot array via `charCodeAt`. | [LeetCode 242](https://leetcode.com/problems/valid-anagram/) |
| 3 | Group Anagrams | Count signature as a `Map` key. | [LeetCode 49](https://leetcode.com/problems/group-anagrams/) |
| 4 | Longest Substring Without Repeating Characters | Window + last-seen `Map`. | [LeetCode 3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) |
| 5 | Minimum Window Substring | Window + `missing` counter. | [LeetCode 76](https://leetcode.com/problems/minimum-window-substring/) |
| 6 | Longest Common Prefix | Vertical scan. | [LeetCode 14](https://leetcode.com/problems/longest-common-prefix/) |
| 7 | String Compression | Write index, in place on a char array. | [LeetCode 443](https://leetcode.com/problems/string-compression/) |
| 8 | Find the Index of the First Occurrence | Naive, then KMP. | [LeetCode 28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) |
| 9 | Longest Palindromic Substring | Expand around each centre. | [LeetCode 5](https://leetcode.com/problems/longest-palindromic-substring/) |
| 10 | Reverse Words in a String | `trim().split(/\s+/).reverse().join(" ")`. | [LeetCode 151](https://leetcode.com/problems/reverse-words-in-a-string/) |
| 11 | Valid Parentheses | Stack - preview of chapter 06. | [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) |
| 12 | Zigzag Conversion | Simulate rows with a direction flip. | [LeetCode 6](https://leetcode.com/problems/zigzag-conversion/) |

## Self-check before moving on

- [ ] I build output with `array.push` + `join("")`.
- [ ] I know `.length` counts UTF-16 code units, not characters.
- [ ] I use `[...s]` when emoji or accents could appear.
- [ ] I use `charCodeAt(i) - 97` for 26-slot frequency arrays.
- [ ] I can write the KMP LPS table from memory.
