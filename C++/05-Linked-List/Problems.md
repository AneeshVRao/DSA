# Practice Problems - 05 Linked List (C++)

Draw the pointers on paper first. Then check: did you save `next` before
overwriting it, and did you free what you unlinked?

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Reverse Linked List | Three pointers, `O(1)` space. | [LeetCode 206](https://leetcode.com/problems/reverse-linked-list/) |
| 2 | Middle of the Linked List | Fast/slow pointers. | [LeetCode 876](https://leetcode.com/problems/middle-of-the-linked-list/) |
| 3 | Linked List Cycle | Floyd's tortoise and hare. | [LeetCode 141](https://leetcode.com/problems/linked-list-cycle/) |
| 4 | Linked List Cycle II | Restart one pointer at the head after they meet. | [LeetCode 142](https://leetcode.com/problems/linked-list-cycle-ii/) |
| 5 | Merge Two Sorted Lists | Dummy node + splice, no `new`. | [LeetCode 21](https://leetcode.com/problems/merge-two-sorted-lists/) |
| 6 | Remove Nth Node From End of List | Gap of n, dummy head. | [LeetCode 19](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) |
| 7 | Palindrome Linked List | Middle, reverse second half, compare, restore. | [LeetCode 234](https://leetcode.com/problems/palindrome-linked-list/) |
| 8 | Intersection of Two Linked Lists | Two pointers that switch heads. | [LeetCode 160](https://leetcode.com/problems/intersection-of-two-linked-lists/) |
| 9 | Add Two Numbers | Carry propagation, dummy head. | [LeetCode 2](https://leetcode.com/problems/add-two-numbers/) |
| 10 | Sort List | Merge sort on a linked list: `O(n log n)`, `O(1)` extra. | [LeetCode 148](https://leetcode.com/problems/sort-list/) |
| 11 | Copy List with Random Pointer | Interleave copies, then split. | [LeetCode 138](https://leetcode.com/problems/copy-list-with-random-pointer/) |
| 12 | LRU Cache | `unordered_map` + doubly linked list. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |

## Self-check before moving on

- [ ] I always check `fast && fast->next` before dereferencing.
- [ ] I `delete` every node I unlink (and nothing twice).
- [ ] I know the rule of three and why this class needs it.
- [ ] I use a dummy node whenever the head can change.
- [ ] I can explain why the cycle-entry proof works.
