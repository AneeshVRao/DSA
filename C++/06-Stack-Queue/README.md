# 06 - Stack and Queue (C++)

> The STL gives you both as **container adaptors** - thin wrappers that
> restrict a real container to one access pattern.

## 1. Definitions

| | Stack | Queue |
|---|-------|-------|
| Order | LIFO | FIFO |
| Add | `push` (top) | `push` (back) |
| Remove | `pop` (top) | `pop` (front) |
| Inspect | `top()` | `front()`, `back()` |
| Uses | undo, DFS, expression parsing | BFS, scheduling, buffering |

All operations are `O(1)`.

---

## 2. The STL adaptors

```cpp
#include <stack>
#include <queue>
#include <deque>

stack<int> st;          // backed by deque by default
st.push(1); st.top(); st.pop();     // pop() returns void!

queue<int> q;           // backed by deque
q.push(1); q.front(); q.back(); q.pop();

deque<int> dq;          // double-ended: O(1) at both ends, plus indexing
dq.push_front(0); dq.push_back(2); dq[1];

priority_queue<int> pq; // a heap, not a queue - see chapter 13
```

> **The C++ gotcha:** `pop()` returns `void`. You must read `top()`/`front()`
> *before* popping. This is deliberate - returning by value could throw after
> the element was already removed, losing it.

```cpp
int x = st.top();   // read
st.pop();           // then remove
```

`stack<int, vector<int>>` swaps the backing container to a `vector` - faster
in practice because it is contiguous.

---

## 3. Implementing them yourself

- **Stack over a vector:** `push_back` / `pop_back`, both amortised `O(1)`.
- **Queue over a circular buffer:** a fixed `vector` plus `head` and `count`,
  wrapping with `% capacity`. Shifting elements would be `O(n)`; wrapping is
  `O(1)`.

A naive queue over a `vector` using `erase(begin())` is `O(n)` per dequeue -
the same trap as `list.pop(0)` in Python.

---

## 4. The patterns

### a. Matching / nesting
Push openers, pop and compare on closers, require an empty stack at the end.

### b. Monotonic stack - `O(n)`
Keep the stack ordered; before pushing, pop every element that violates the
order - each popped element has just found its answer. Every index enters and
leaves once, so the nested `while` is amortised constant.

Used for: next greater element, daily temperatures, largest rectangle in a
histogram, trapping rain water.

### c. Auxiliary storage - MinStack
Push `(value, min_so_far)` pairs so `min()` is `O(1)`.

### d. Two stacks make a queue
`in` receives pushes; when `out` is empty, pour `in` into it - the order flips.
Amortised `O(1)`.

### e. Monotonic deque - sliding window maximum
The front always holds the window's maximum; pop from the back anything
smaller than the arriving element.

---

## 5. Traps

- Calling `top()`/`front()` on an empty adaptor is **undefined behaviour**, not
  an exception. Always check `empty()` first.
- Forgetting that `pop()` returns nothing.
- `priority_queue` is a max-heap by default; use `greater<int>` for a min-heap.
- In a monotonic stack, store indices when you need widths or distances.
- `queue` has no iterators - you cannot loop over it without draining it.

---

## 6. Complexity of what is implemented here

| Structure / function | Time | Space |
|----------------------|------|-------|
| `ArrayStack` ops | `O(1)` amortised | `O(n)` |
| `CircularQueue` ops | `O(1)` | `O(capacity)` |
| `MinStack::getMin` | `O(1)` | `O(n)` |
| `QueueViaStacks::pop` | `O(1)` amortised | `O(n)` |
| `isBalanced` | `O(n)` | `O(n)` |
| `nextGreater` | `O(n)` | `O(n)` |
| `dailyTemperatures` | `O(n)` | `O(n)` |
| `largestRectangle` | `O(n)` | `O(n)` |
| `slidingWindowMax` | `O(n)` | `O(k)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall stack_queue.cpp -o stack_queue && ./stack_queue
```
