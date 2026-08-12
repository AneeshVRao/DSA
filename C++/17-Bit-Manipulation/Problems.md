# Practice Problems - 17 Bit Manipulation (C++)

If a problem demands `O(1)` extra space and involves duplicates or a missing
value, try XOR first.

| # | Problem | Trick | Link |
|---|---------|-------|------|
| 1 | Single Number | XOR everything; pairs cancel. | [LeetCode 136](https://leetcode.com/problems/single-number/) |
| 2 | Single Number II | Count bits mod 3, or two-state masks. | [LeetCode 137](https://leetcode.com/problems/single-number-ii/) |
| 3 | Single Number III | XOR all, split on a differing bit. | [LeetCode 260](https://leetcode.com/problems/single-number-iii/) |
| 4 | Missing Number | XOR indices with values. | [LeetCode 268](https://leetcode.com/problems/missing-number/) |
| 5 | Number of 1 Bits | Kernighan, or `__builtin_popcount`. | [LeetCode 191](https://leetcode.com/problems/number-of-1-bits/) |
| 6 | Counting Bits | `count[i] = count[i >> 1] + (i & 1)`. | [LeetCode 338](https://leetcode.com/problems/counting-bits/) |
| 7 | Power of Two | `n > 0 && (n & (n - 1)) == 0`. | [LeetCode 231](https://leetcode.com/problems/power-of-two/) |
| 8 | Reverse Bits | Shift out, shift in, 32 times. | [LeetCode 190](https://leetcode.com/problems/reverse-bits/) |
| 9 | Subsets | Iterate masks `0 .. (1 << n) - 1`. | [LeetCode 78](https://leetcode.com/problems/subsets/) |
| 10 | Sum of Two Integers | XOR for the sum, AND-shift for the carry, unsigned. | [LeetCode 371](https://leetcode.com/problems/sum-of-two-integers/) |
| 11 | Bitwise AND of Numbers Range | The answer is the common prefix. | [LeetCode 201](https://leetcode.com/problems/bitwise-and-of-numbers-range/) |
| 12 | Maximum XOR of Two Numbers in an Array | Bitwise trie (chapter 18). | [LeetCode 421](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) |

## Gray code
| Problem | Hint | Link |
|---------|------|------|
| Gray Code | `n ^ (n >> 1)`, or build it by reflection. | [LeetCode 89](https://leetcode.com/problems/gray-code/) |
| Circular Permutation in Binary Representation | A Gray code sequence rotated to start at `start`. | [LeetCode 1238](https://leetcode.com/problems/circular-permutation-in-binary-representation/) |
| Minimum One Bit Operations to Make Integers Zero | This is the Gray code INVERSE in disguise. | [LeetCode 1611](https://leetcode.com/problems/minimum-one-bit-operations-to-make-integers-zero/) |

## Self-check before moving on

- [ ] I know `x ^ x == 0` and `x ^ 0 == x`, and what they buy me.
- [ ] I can explain `n & (n - 1)` and `n & -n`.
- [ ] I write `1LL << i` when `i` can reach 31 or more.
- [ ] I know shifting by >= the type width is undefined behaviour.
- [ ] I know `__builtin_popcount` / `std::popcount` and when to reach for `bitset`.
- [ ] I can derive `G(n) = n ^ (n >> 1)` and explain why one bit changes.
- [ ] I can build the sequence by reflection as well as by xor.
