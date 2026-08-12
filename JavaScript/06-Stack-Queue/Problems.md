# Practice Problems - 06 Stack and Queue (JavaScript)

Every queue problem here is a chance to prove you will not reach for
`shift()`.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Parentheses | Push openers, match on closers. | [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) |
| 2 | Min Stack | Store `[value, minSoFar]`. | [LeetCode 155](https://leetcode.com/problems/min-stack/) |
| 3 | Implement Queue using Stacks | Two arrays, amortised `O(1)`. | [LeetCode 232](https://leetcode.com/problems/implement-queue-using-stacks/) |
| 4 | Number of Recent Calls | Queue with a head index, not `shift()`. | [LeetCode 933](https://leetcode.com/problems/number-of-recent-calls/) |
| 5 | Next Greater Element I | Monotonic stack + `Map`. | [LeetCode 496](https://leetcode.com/problems/next-greater-element-i/) |
| 6 | Daily Temperatures | Monotonic stack of indices. | [LeetCode 739](https://leetcode.com/problems/daily-temperatures/) |
| 7 | Evaluate Reverse Polish Notation | Operand stack; `Math.trunc` for division. | [LeetCode 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/) |
| 8 | Simplify Path | Split on "/", pop on "..". | [LeetCode 71](https://leetcode.com/problems/simplify-path/) |
| 9 | Largest Rectangle in Histogram | Monotonic stack + sentinel. | [LeetCode 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) |
| 10 | Sliding Window Maximum | Monotonic deque. | [LeetCode 239](https://leetcode.com/problems/sliding-window-maximum/) |
| 11 | Design Circular Queue | Head + count, wrap with `%`. | [LeetCode 622](https://leetcode.com/problems/design-circular-queue/) |
| 12 | Decode String | Two stacks: repeat counts and partial strings. | [LeetCode 394](https://leetcode.com/problems/decode-string/) |

## Self-check before moving on

- [ ] I never use `shift()` as a dequeue.
- [ ] I know `pop()` on an empty array returns `undefined` silently.
- [ ] I can write a monotonic stack and explain the `O(n)` bound.
- [ ] I use `.at(-1)` to peek.
- [ ] I can build a circular queue without confusing full and empty.
