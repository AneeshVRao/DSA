# Practice Problems - 05 Linked List (JavaScript)

Draw the pointers before typing. Nearly all of these are a dummy head, a
fast/slow pair, or a three-pointer reversal.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Reverse Linked List | Three pointers, `O(1)` space. | [LeetCode 206](https://leetcode.com/problems/reverse-linked-list/) |
| 2 | Middle of the Linked List | Fast/slow pointers. | [LeetCode 876](https://leetcode.com/problems/middle-of-the-linked-list/) |
| 3 | Linked List Cycle | Floyd's algorithm; compare with `===`. | [LeetCode 141](https://leetcode.com/problems/linked-list-cycle/) |
| 4 | Linked List Cycle II | Restart a pointer at the head after the meeting. | [LeetCode 142](https://leetcode.com/problems/linked-list-cycle-ii/) |
| 5 | Merge Two Sorted Lists | Dummy head + splice. | [LeetCode 21](https://leetcode.com/problems/merge-two-sorted-lists/) |
| 6 | Remove Nth Node From End of List | Gap of n, dummy head. | [LeetCode 19](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) |
| 7 | Palindrome Linked List | Middle + reverse half + compare. | [LeetCode 234](https://leetcode.com/problems/palindrome-linked-list/) |
| 8 | Intersection of Two Linked Lists | Two pointers that swap lists at the end. | [LeetCode 160](https://leetcode.com/problems/intersection-of-two-linked-lists/) |
| 9 | Remove Duplicates from Sorted List | Skip equal neighbours. | [LeetCode 83](https://leetcode.com/problems/remove-duplicates-from-sorted-list/) |
| 10 | Add Two Numbers | Carry propagation with a dummy head. | [LeetCode 2](https://leetcode.com/problems/add-two-numbers/) |
| 11 | Odd Even Linked List | Two chains, then join them. | [LeetCode 328](https://leetcode.com/problems/odd-even-linked-list/) |
| 12 | LRU Cache | `Map` + doubly linked list (or exploit `Map` ordering). | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |

## Self-check before moving on

- [ ] I save `curr.next` before overwriting it.
- [ ] I guard with `while (fast && fast.next)`.
- [ ] I use a dummy head whenever the head can change.
- [ ] I know why a linked list beats `Array.shift()` for queues.
- [ ] I can implement an LRU cache with a doubly linked list.
