# Practice Problems - 06 Stack and Queue (Python)

If the problem mentions "most recent", "matching", "next greater" or
"undo", it is a stack. If it mentions "in order of arrival" or "level by
level", it is a queue.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Parentheses | Push openers, match on closers. | [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) |
| 2 | Min Stack | Store `(value, min_so_far)` pairs. | [LeetCode 155](https://leetcode.com/problems/min-stack/) |
| 3 | Implement Queue using Stacks | Two stacks, amortised `O(1)`. | [LeetCode 232](https://leetcode.com/problems/implement-queue-using-stacks/) |
| 4 | Implement Stack using Queues | One queue, rotate after each push. | [LeetCode 225](https://leetcode.com/problems/implement-stack-using-queues/) |
| 5 | Next Greater Element I | Monotonic decreasing stack + dict. | [LeetCode 496](https://leetcode.com/problems/next-greater-element-i/) |
| 6 | Daily Temperatures | Monotonic stack of **indices**. | [LeetCode 739](https://leetcode.com/problems/daily-temperatures/) |
| 7 | Evaluate Reverse Polish Notation | Operand stack; mind the operand order. | [LeetCode 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/) |
| 8 | Simplify Path | Split on "/", push and pop on "..". | [LeetCode 71](https://leetcode.com/problems/simplify-path/) |
| 9 | Largest Rectangle in Histogram | Monotonic increasing stack + sentinel. | [LeetCode 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) |
| 10 | Sliding Window Maximum | Monotonic `deque`. | [LeetCode 239](https://leetcode.com/problems/sliding-window-maximum/) |
| 11 | Design Circular Queue | Head index + count, wrap with `%`. | [LeetCode 622](https://leetcode.com/problems/design-circular-queue/) |
| 12 | Decode String | Two stacks: counts and partial strings. | [LeetCode 394](https://leetcode.com/problems/decode-string/) |

## Self-check before moving on

- [ ] I use `collections.deque` for queues, never `list.pop(0)`.
- [ ] I can write a monotonic stack and explain why it is `O(n)`.
- [ ] I know why the monotonic stack stores indices, not values.
- [ ] I can implement a queue from two stacks and justify "amortised".
- [ ] I can handle the empty-stack edge case without crashing.
