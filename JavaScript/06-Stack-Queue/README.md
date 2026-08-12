# 06 - Stack and Queue (JavaScript)

> JS gives you a perfect stack for free and a terrible queue for free. Knowing
> which is which is the point of this chapter.

## 1. Definitions

| | Stack | Queue |
|---|-------|-------|
| Order | LIFO | FIFO |
| Add | `push` (top) | `enqueue` (back) |
| Remove | `pop` (top) | `dequeue` (front) |
| Uses | undo, DFS, parsing | BFS, scheduling, buffering |

---

## 2. Stack: an array is already one

```js
const stack = [];
stack.push(x);     // O(1) amortised
stack.pop();       // O(1)
stack.at(-1);      // peek, O(1)
```

Nothing to build. `push`/`pop` operate on the cheap end of the array.

---

## 3. Queue: the array trap

```js
const q = [];
q.push(x);         // enqueue: O(1)
q.shift();         // dequeue: O(n)  <-- every element is reindexed
```

`shift()` is `O(n)`, so draining `n` items is `O(n^2)`. At n = 100k that is
seconds of wall clock (chapter 02 measured it).

Three correct fixes:

1. **Head index** - keep `head` and advance it instead of shifting. `O(1)` per
   op, at the cost of memory that is not reclaimed until you compact.
2. **Circular buffer** - fixed capacity, `head` and `count`, wrap with `%`.
3. **Linked list** - `head`/`tail` pointers, `O(1)` both ends, unbounded.

All three are implemented in `stack_queue.js`.

---

## 4. The patterns

### a. Matching / nesting
Push openers, pop on closers, empty stack at the end.

### b. Monotonic stack - `O(n)`
Keep the stack ordered; pop everything that violates the order before pushing.
Each element enters and leaves once. Used for next-greater, daily
temperatures, histogram rectangles, trapping rain water.

### c. Auxiliary storage - MinStack
Push `[value, minSoFar]` pairs for an `O(1)` minimum.

### d. Two stacks make a queue
Pour `inbox` into `outbox` only when `outbox` runs dry - amortised `O(1)`.

### e. Monotonic deque - sliding window maximum
Front holds the window maximum; drop expired indices from the front and
smaller values from the back.

---

## 5. Traps

- `shift()` in a loop - the single most common performance bug in JS DSA code.
- `pop()` on an empty array returns `undefined` rather than throwing, so a bug
  can slip through silently. Check `length` first.
- `stack[stack.length - 1]` vs `stack.at(-1)` - prefer `.at(-1)`.
- Storing values instead of **indices** in a monotonic stack when the problem
  needs distances.
- `delete arr[i]` leaves a hole and breaks `length` semantics. Never use it.

---

## 6. Complexity of what is implemented here

| Structure / function | Time | Space |
|----------------------|------|-------|
| `Stack` ops | `O(1)` | `O(n)` |
| `Queue` (head index) ops | `O(1)` amortised | `O(n)` |
| `CircularQueue` ops | `O(1)` | `O(capacity)` |
| `MinStack.min` | `O(1)` | `O(n)` |
| `QueueViaStacks.dequeue` | `O(1)` amortised | `O(n)` |
| `isBalanced` | `O(n)` | `O(n)` |
| `nextGreater` | `O(n)` | `O(n)` |
| `largestRectangle` | `O(n)` | `O(n)` |
| `slidingWindowMax` | `O(n)` | `O(k)` |

## Run the code

```bash
node stack_queue.js
```
