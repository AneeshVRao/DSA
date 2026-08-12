# Practice Problems - 06 Stack and Queue (C++)

"Most recent", "matching", "next greater" -> stack. "In arrival order",
"level by level" -> queue.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Parentheses | Push openers, match on closers. | [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) |
| 2 | Min Stack | Store `pair<value, min>`. | [LeetCode 155](https://leetcode.com/problems/min-stack/) |
| 3 | Implement Queue using Stacks | Two stacks, amortised `O(1)`. | [LeetCode 232](https://leetcode.com/problems/implement-queue-using-stacks/) |
| 4 | Implement Stack using Queues | One queue plus rotation. | [LeetCode 225](https://leetcode.com/problems/implement-stack-using-queues/) |
| 5 | Next Greater Element I | Monotonic stack + `unordered_map`. | [LeetCode 496](https://leetcode.com/problems/next-greater-element-i/) |
| 6 | Daily Temperatures | Monotonic stack of indices. | [LeetCode 739](https://leetcode.com/problems/daily-temperatures/) |
| 7 | Evaluate Reverse Polish Notation | Operand stack; watch operand order. | [LeetCode 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/) |
| 8 | Largest Rectangle in Histogram | Monotonic increasing stack + sentinel. | [LeetCode 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) |
| 9 | Trapping Rain Water | Monotonic stack, or two pointers. | [LeetCode 42](https://leetcode.com/problems/trapping-rain-water/) |
| 10 | Sliding Window Maximum | Monotonic `deque`. | [LeetCode 239](https://leetcode.com/problems/sliding-window-maximum/) |
| 11 | Design Circular Queue | Head index + count, wrap with `%`. | [LeetCode 622](https://leetcode.com/problems/design-circular-queue/) |
| 12 | Asteroid Collision | Stack simulation with sign logic. | [LeetCode 735](https://leetcode.com/problems/asteroid-collision/) |

## Self-check before moving on

- [ ] I read `top()`/`front()` **before** calling `pop()`.
- [ ] I never call `top()` on an empty adaptor (it is undefined behaviour).
- [ ] I can write a monotonic stack and justify its `O(n)` bound.
- [ ] I know why `queue<int>` has no iterators.
- [ ] I can implement a circular queue without confusing full and empty.
