# 06 - Stack and Queue (Python)

> Two containers, one difference: which end you take from. That single choice
> decides whether you get DFS or BFS, undo or scheduling.

## 1. Definitions

| | Stack | Queue |
|---|-------|-------|
| Order | LIFO - last in, first out | FIFO - first in, first out |
| Add | `push` (top) | `enqueue` (back) |
| Remove | `pop` (top) | `dequeue` (front) |
| Peek | top element | front element |
| Real-world | undo, call stack, backtracking | printer queue, BFS, task scheduling |

```
Stack:  push(3)         Queue:  enqueue(3)
        +---+                   front -> [1][2][3] <- back
        | 3 | <- top             dequeue takes 1
        | 2 |
        | 1 |
        +---+
```

All four core operations are `O(1)` in a correct implementation. Getting that
`O(1)` on the queue is the interesting part.

---

## 2. Implementing them in Python

### Stack - just use a list
```python
stack = []
stack.append(x)     # push, O(1) amortised
stack.pop()         # pop,  O(1)
stack[-1]           # peek, O(1)
```

### Queue - never use a list
```python
from collections import deque
q = deque()
q.append(x)         # enqueue, O(1)
q.popleft()         # dequeue, O(1)
```

`list.pop(0)` is **`O(n)`** because every remaining element shifts left.
Draining a 100k-element queue that way is `O(n^2)`. `deque` is a doubly linked
list of fixed-size blocks, so both ends are `O(1)`.

### Circular buffer - the array-based queue
A fixed array plus `head` and `tail` indices that wrap with `% capacity`. This
is how a bounded queue is implemented when you cannot afford dynamic
allocation, and it is a common interview question ("design a circular queue").

---

## 3. The patterns

### a. Matching / nesting - parentheses, HTML tags, expression parsing
Push openers, pop on closers, check the match. Empty stack at the end means
balanced.

### b. Monotonic stack - "next greater element", histograms
Keep the stack sorted (increasing or decreasing). Before pushing, pop
everything that violates the order - each popped element has just found its
answer. Every element is pushed and popped at most once, so it is `O(n)`
despite the inner `while`.

```python
stack = []                         # holds indices, values decreasing
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] < x:
        result[stack.pop()] = x    # x is the next greater for that index
    stack.append(i)
```

### c. Auxiliary stack - MinStack
To make `min()` `O(1)`, push the running minimum alongside each value.

### d. Two stacks make a queue
Push onto `inbox`. To dequeue, if `outbox` is empty, pour everything from
`inbox` into it - the order reverses, so the oldest ends up on top. Each
element moves at most twice: **amortised `O(1)`**.

### e. Simulation - RPN evaluation, path simplification
Postfix expressions, `cd ..` path resolution, string decoding.

---

## 4. Traps

- Popping an empty stack: `IndexError`. Always check truthiness first.
- Using `list.pop(0)` as a queue - the classic accidental `O(n^2)`.
- In a monotonic stack, storing values when you need **indices** (for
  distances or widths).
- Off-by-one in a circular buffer: distinguish "full" from "empty" with a
  count, or by leaving one slot unused.

---

## 5. Complexity of what is implemented here

| Structure / function | Time | Space |
|----------------------|------|-------|
| `Stack.push/pop/peek` | `O(1)` | `O(n)` |
| `CircularQueue.enqueue/dequeue` | `O(1)` | `O(capacity)` |
| `MinStack.min` | `O(1)` | `O(n)` |
| `QueueViaStacks.dequeue` | `O(1)` amortised | `O(n)` |
| `is_balanced` | `O(n)` | `O(n)` |
| `next_greater` | `O(n)` | `O(n)` |
| `eval_rpn` | `O(n)` | `O(n)` |
| `daily_temperatures` | `O(n)` | `O(n)` |
| `largest_rectangle` | `O(n)` | `O(n)` |

## Run the code

```bash
python stack_queue.py
```
