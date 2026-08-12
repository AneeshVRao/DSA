# Practice Problems - 17 Bit Manipulation (Python)

If a problem says "constant extra space" and involves duplicates or a missing
value, try XOR first.

| # | Problem | Trick | Link |
|---|---------|-------|------|
| 1 | Single Number | XOR everything; pairs cancel. | [LeetCode 136](https://leetcode.com/problems/single-number/) |
| 2 | Single Number III | XOR all, then split on a differing bit. | [LeetCode 260](https://leetcode.com/problems/single-number-iii/) |
| 3 | Missing Number | XOR indices with values. | [LeetCode 268](https://leetcode.com/problems/missing-number/) |
| 4 | Number of 1 Bits | Brian Kernighan's `n & (n-1)`. | [LeetCode 191](https://leetcode.com/problems/number-of-1-bits/) |
| 5 | Counting Bits | `count[i] = count[i >> 1] + (i & 1)`. | [LeetCode 338](https://leetcode.com/problems/counting-bits/) |
| 6 | Power of Two | `n > 0 and n & (n - 1) == 0`. | [LeetCode 231](https://leetcode.com/problems/power-of-two/) |
| 7 | Reverse Bits | Shift out, shift in, 32 times. | [LeetCode 190](https://leetcode.com/problems/reverse-bits/) |
| 8 | Hamming Distance | Count set bits of `a ^ b`. | [LeetCode 461](https://leetcode.com/problems/hamming-distance/) |
| 9 | Subsets | Iterate masks `0 .. 2^n - 1`. | [LeetCode 78](https://leetcode.com/problems/subsets/) |
| 10 | Sum of Two Integers | XOR for the sum, AND-shift for the carry; mask to 32 bits. | [LeetCode 371](https://leetcode.com/problems/sum-of-two-integers/) |
| 11 | Bitwise AND of Numbers Range | The answer is the common prefix. | [LeetCode 201](https://leetcode.com/problems/bitwise-and-of-numbers-range/) |
| 12 | Maximum XOR of Two Numbers in an Array | Bitwise trie (chapter 18). | [LeetCode 421](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) |

## Self-check before moving on

- [ ] I know `x ^ x == 0` and `x ^ 0 == x`, and what that buys me.
- [ ] I can explain what `n & (n - 1)` and `n & -n` do, and why.
- [ ] I can set, clear, toggle and test any bit from memory.
- [ ] I know Python integers are infinite-precision and when to mask to 32 bits.
- [ ] I can enumerate subsets and submasks with bitmasks.
