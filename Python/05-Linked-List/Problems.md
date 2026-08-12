# Practice Problems - 05 Linked List (Python)

Almost every one of these is solved by a dummy head, a fast/slow pair, or a
three-pointer reversal. Draw the pointers before you type.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Reverse Linked List | Three pointers: prev, curr, next. | [LeetCode 206](https://leetcode.com/problems/reverse-linked-list/) |
| 2 | Middle of the Linked List | Fast/slow pointers. | [LeetCode 876](https://leetcode.com/problems/middle-of-the-linked-list/) |
| 3 | Linked List Cycle | Floyd's tortoise and hare. | [LeetCode 141](https://leetcode.com/problems/linked-list-cycle/) |
| 4 | Linked List Cycle II | After they meet, restart one pointer at the head. | [LeetCode 142](https://leetcode.com/problems/linked-list-cycle-ii/) |
| 5 | Merge Two Sorted Lists | Dummy head + splice. | [LeetCode 21](https://leetcode.com/problems/merge-two-sorted-lists/) |
| 6 | Remove Nth Node From End of List | Gap of n, then walk both. | [LeetCode 19](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) |
| 7 | Palindrome Linked List | Find the middle, reverse the second half, compare. | [LeetCode 234](https://leetcode.com/problems/palindrome-linked-list/) |
| 8 | Intersection of Two Linked Lists | Swap heads at the end; both walk `a + b`. | [LeetCode 160](https://leetcode.com/problems/intersection-of-two-linked-lists/) |
| 9 | Remove Duplicates from Sorted List | One pointer, skip equal neighbours. | [LeetCode 83](https://leetcode.com/problems/remove-duplicates-from-sorted-list/) |
| 10 | Add Two Numbers | Digit-wise addition with a carry. | [LeetCode 2](https://leetcode.com/problems/add-two-numbers/) |
| 11 | Reorder List | Middle + reverse + interleave. | [LeetCode 143](https://leetcode.com/problems/reorder-list/) |
| 12 | LRU Cache | Doubly linked list + dict. The classic. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |

## Self-check before moving on

- [ ] I use a dummy head whenever the head itself might change.
- [ ] I always save `curr.next` before overwriting it.
- [ ] I can write Floyd's cycle detection and explain the entry-point proof.
- [ ] I can reverse a list iteratively (`O(1)` space) and recursively.
- [ ] I know why an LRU cache needs a **doubly** linked list.
