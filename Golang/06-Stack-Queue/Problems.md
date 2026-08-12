# Practice Problems - 06 Stack and Queue (Go)

A slice is your stack. For queues, decide between a head index and a circular
buffer before you start typing.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Valid Parentheses | `[]byte` stack, map closers to openers. | [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) |
| 2 | Min Stack | Push a `struct{val, min int}`. | [LeetCode 155](https://leetcode.com/problems/min-stack/) |
| 3 | Implement Queue using Stacks | Two slices, amortised `O(1)`. | [LeetCode 232](https://leetcode.com/problems/implement-queue-using-stacks/) |
| 4 | Implement Stack using Queues | One queue plus rotation. | [LeetCode 225](https://leetcode.com/problems/implement-stack-using-queues/) |
| 5 | Next Greater Element I | Monotonic stack + `map[int]int`. | [LeetCode 496](https://leetcode.com/problems/next-greater-element-i/) |
| 6 | Daily Temperatures | Monotonic stack of indices. | [LeetCode 739](https://leetcode.com/problems/daily-temperatures/) |
| 7 | Evaluate Reverse Polish Notation | `strconv.Atoi` + operand stack. | [LeetCode 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/) |
| 8 | Simplify Path | `strings.Split` then push/pop. | [LeetCode 71](https://leetcode.com/problems/simplify-path/) |
| 9 | Largest Rectangle in Histogram | Monotonic stack + sentinel. | [LeetCode 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) |
| 10 | Sliding Window Maximum | Monotonic deque of indices. | [LeetCode 239](https://leetcode.com/problems/sliding-window-maximum/) |
| 11 | Design Circular Queue | Head + count, wrap with `%`. | [LeetCode 622](https://leetcode.com/problems/design-circular-queue/) |
| 12 | Asteroid Collision | Stack simulation with signs. | [LeetCode 735](https://leetcode.com/problems/asteroid-collision/) |

## Self-check before moving on

- [ ] I check `len(s) > 0` before indexing `s[len(s)-1]`.
- [ ] I know `q = q[1:]` keeps the whole backing array alive.
- [ ] I return `(value, bool)` instead of panicking on empty containers.
- [ ] I can write a monotonic stack and justify `O(n)`.
- [ ] I use a nil slice as an empty stack without calling `make`.
