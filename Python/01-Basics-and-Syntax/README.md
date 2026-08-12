# 01 - Basics and Syntax (Python)

> The 20% of Python you use in 95% of DSA problems.

## Why this chapter exists

You cannot reason about algorithms while also fighting the language. This chapter
gets Python out of your way: the built-in types, their **real** costs, and the
idioms interviewers expect to see.

---

## 1. The four collections you actually need

| Type | Literal | Ordered | Mutable | Duplicates | Main use in DSA |
|------|---------|---------|---------|------------|-----------------|
| `list` | `[1, 2, 3]` | yes | yes | yes | arrays, stacks, dynamic buffers |
| `tuple` | `(1, 2)` | yes | **no** | yes | hashable records, dict keys, coordinates |
| `set` | `{1, 2}` | no | yes | **no** | membership tests, dedup, visited sets |
| `dict` | `{"a": 1}` | insertion | yes | keys unique | frequency maps, adjacency lists, memo |

### Cost cheat-sheet (CPython)

| Operation | list | dict / set |
|-----------|------|------------|
| index / key lookup | `O(1)` | `O(1)` average |
| `append` / `add` | `O(1)` amortised | `O(1)` average |
| `insert(0, x)` / `pop(0)` | **`O(n)`** | n/a |
| `x in coll` | **`O(n)`** | `O(1)` average |
| `len()` | `O(1)` | `O(1)` |
| sort | `O(n log n)` | n/a |

> **The single most common beginner bug:** using `x in my_list` inside a loop.
> That is `O(n^2)`. Convert to a `set` first and it becomes `O(n)`.
>
> Need `O(1)` pops from the *front*? Use `collections.deque`, never a list.

---

## 2. Slicing

```python
a[start:stop:step]   # stop is EXCLUSIVE
a[:k]                # first k
a[-k:]               # last k
a[::-1]              # reversed copy
```

Slicing **copies** - `a[:]` is `O(n)` time and `O(n)` space. Inside a recursion
that copy is what silently turns your `O(n log n)` into `O(n^2)`. Pass
`(lo, hi)` index bounds instead.

---

## 3. Comprehensions

Prefer them over `for` + `append`: shorter, faster (no repeated attribute lookup),
and idiomatic.

```python
squares = [x * x for x in range(10)]
evens   = [x for x in nums if x % 2 == 0]
grid    = [[0] * cols for _ in range(rows)]   # correct 2-D init
pairs   = {k: v for k, v in items if v}
```

> **Trap:** `[[0] * cols] * rows` creates `rows` references to the *same* row.
> Mutating one mutates all. Always use the comprehension form above.

---

## 4. Functions, unpacking, sorting keys

```python
def solve(nums, *, reverse=False):        # keyword-only argument
    return sorted(nums, reverse=reverse)

a, b = b, a                               # swap, no temp
first, *rest = [1, 2, 3]                  # star unpacking

people.sort(key=lambda p: (-p.score, p.name))   # score desc, then name asc
```

> **Trap:** never write `def f(acc=[])`. The default list is created **once** and
> shared across every call. Use `acc=None` then `if acc is None: acc = []`.

---

## 5. Classes for data structures

```python
class Node:
    __slots__ = ("val", "next")     # less memory, faster attribute access

    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

    def __repr__(self):             # makes debugging painless
        return f"Node({self.val})"
```

Use `@dataclass` when you want `__init__` / `__eq__` / `__repr__` for free.

---

## 6. The standard library that wins interviews

```python
from collections import deque, defaultdict, Counter
import heapq, bisect, math, itertools

deque()                  # O(1) push/pop at both ends
defaultdict(list)        # adjacency lists without key checks
Counter(s)               # frequency map in one line
heapq.heappush(h, x)     # min-heap; push -x to fake a max-heap
bisect.bisect_left(a, x) # binary search over a sorted list
math.inf, -math.inf      # sentinels for min / max scans
```

---

## 7. Gotchas that cost points

| Trap | Fix |
|------|-----|
| `-7 // 2 == -4` (it floors) | use `int(-7 / 2)` or `math.trunc` to truncate |
| `0.1 + 0.2 != 0.3` | compare with `math.isclose`, or stay in integers |
| Default recursion limit is 1000 | `sys.setrecursionlimit(10**6)` or go iterative |
| Strings are immutable | build a `list`, then `"".join(parts)` - `O(n)` not `O(n^2)` |
| `is` vs `==` | `is` compares identity; use `==` for values |

---

## 8. Fast I/O (only for judges like Codeforces)

```python
import sys
input = sys.stdin.readline
data = sys.stdin.buffer.read().split()
```

---

## What to take away

Nothing here is an algorithm - but every line you write later inherits these
constants. Knowing that `list.pop(0)` is `O(n)` is worth more than memorising
ten sorting algorithms.

## Run the code

```bash
python basics.py
```
