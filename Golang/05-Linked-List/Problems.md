# Practice Problems - 05 Linked List (Go)

Draw the pointers first. Watch the two Go-specific hazards: nil dereference
panics, and value receivers that silently mutate a copy.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Reverse Linked List | Three pointers; `prev, curr = curr, next`. | [LeetCode 206](https://leetcode.com/problems/reverse-linked-list/) |
| 2 | Middle of the Linked List | Fast/slow pointers. | [LeetCode 876](https://leetcode.com/problems/middle-of-the-linked-list/) |
| 3 | Linked List Cycle | Floyd's algorithm; compare pointers with `==`. | [LeetCode 141](https://leetcode.com/problems/linked-list-cycle/) |
| 4 | Linked List Cycle II | Restart a walker at the head after the meeting. | [LeetCode 142](https://leetcode.com/problems/linked-list-cycle-ii/) |
| 5 | Merge Two Sorted Lists | Dummy node + splice. | [LeetCode 21](https://leetcode.com/problems/merge-two-sorted-lists/) |
| 6 | Remove Nth Node From End of List | Gap of n with a dummy head. | [LeetCode 19](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) |
| 7 | Palindrome Linked List | Middle + reverse half + compare. | [LeetCode 234](https://leetcode.com/problems/palindrome-linked-list/) |
| 8 | Intersection of Two Linked Lists | Two pointers switching lists. | [LeetCode 160](https://leetcode.com/problems/intersection-of-two-linked-lists/) |
| 9 | Remove Duplicates from Sorted List | Skip equal neighbours. | [LeetCode 83](https://leetcode.com/problems/remove-duplicates-from-sorted-list/) |
| 10 | Add Two Numbers | Carry propagation with a dummy head. | [LeetCode 2](https://leetcode.com/problems/add-two-numbers/) |
| 11 | Sort List | Merge sort on the list: `O(n log n)`. | [LeetCode 148](https://leetcode.com/problems/sort-list/) |
| 12 | LRU Cache | `map[int]*DNode` + doubly linked list. | [LeetCode 146](https://leetcode.com/problems/lru-cache/) |

## Self-check before moving on

- [ ] I always guard `fast != nil && fast.Next != nil`.
- [ ] I use pointer receivers on any method that reassigns head or tail.
- [ ] I use a dummy node whenever the head can change.
- [ ] I know `nil` is a perfectly good empty list.
- [ ] I can explain Floyd's cycle-entry proof.
