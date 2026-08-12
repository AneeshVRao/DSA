# 06 - Stack and Queue (Go)

> Go ships no stack or queue type. A slice is both - and knowing which slice
> operation is cheap is the whole lesson.

## 1. Definitions

| | Stack | Queue |
|---|-------|-------|
| Order | LIFO | FIFO |
| Add | push (back) | enqueue (back) |
| Remove | pop (back) | dequeue (front) |
| Uses | DFS, undo, parsing | BFS, scheduling |

---

## 2. Stack: a slice, directly

```go
stack := []int{}
stack = append(stack, x)          // push, amortised O(1)
top := stack[len(stack)-1]        // peek, O(1)
stack = stack[:len(stack)-1]      // pop, O(1)
```

That is the idiomatic Go stack. No type needed - though wrapping it gives you
bounds checks and a clearer API, which is what `stack_queue.go` does.

---

## 3. Queue: the slicing trap

```go
queue = append(queue, x)    // enqueue, O(1)
front := queue[0]
queue = queue[1:]           // dequeue, O(1) time ... but
```

`queue[1:]` is `O(1)` because it only moves the slice header. **However**, the
backing array never shrinks: after a million enqueue/dequeue pairs, the
original array is still fully allocated and unreachable elements stay alive.
That is a slow memory leak.

Two robust options:

1. **Head index + compaction** - track `head`, and copy the live tail back to
   the front when the dead prefix dominates. Amortised `O(1)` with bounded
   memory.
2. **Circular buffer** - fixed capacity, `head` and `count`, wrap with `%`.

`container/list` also exists (a doubly linked list), but it allocates per node
and is usually slower than a slice-backed queue.

---

## 4. The patterns

### a. Matching / nesting
Push openers, pop and compare on closers, require an empty stack at the end.

### b. Monotonic stack - `O(n)`
Keep the stack ordered; pop everything that violates the order before pushing.
Each index is pushed and popped once. Used for next-greater, daily
temperatures, largest rectangle, trapping rain water.

### c. Auxiliary storage - MinStack
Push `struct{val, min int}` pairs for an `O(1)` minimum.

### d. Two stacks make a queue
Pour `in` into `out` only when `out` is empty: amortised `O(1)`.

### e. Monotonic deque - sliding window maximum
Front holds the maximum; drop expired indices from the front, smaller values
from the back.

---

## 5. Traps

- Indexing `s[len(s)-1]` on an empty slice panics. Check `len(s) > 0` first.
- `queue = queue[1:]` keeps the whole backing array alive (see above).
- Forgetting that `append` may reallocate - always reassign the result.
- In a monotonic stack, store indices when the answer needs a distance.
- A nil slice works fine as an empty stack: `var stack []int` needs no `make`.

---

## 6. Complexity of what is implemented here

| Structure / function | Time | Space |
|----------------------|------|-------|
| `Stack` ops | `O(1)` amortised | `O(n)` |
| `Queue` (head + compaction) | `O(1)` amortised | `O(n)` |
| `CircularQueue` ops | `O(1)` | `O(capacity)` |
| `MinStack.Min` | `O(1)` | `O(n)` |
| `QueueViaStacks.Dequeue` | `O(1)` amortised | `O(n)` |
| `IsBalanced` | `O(n)` | `O(n)` |
| `NextGreater` | `O(n)` | `O(n)` |
| `LargestRectangle` | `O(n)` | `O(n)` |
| `SlidingWindowMax` | `O(n)` | `O(k)` |

## Run the code

```bash
go run stack_queue.go
```
