# 07 - Recursion and Backtracking (Python)

> Recursion is a function that solves a smaller version of its own problem.
> Backtracking is recursion that undoes its choices.

**At a glance**

| | |
|---|---|
| **What it is** | Solve by shrinking. Backtracking adds choose -> explore -> **un-choose**. |
| **Must know** | Every recursion needs a base case that is actually reachable from the input. |
| **The one trap** | Forgetting to un-choose, so state leaks from one branch into the next. |
| **Reach for it when** | "All permutations / subsets / combinations", grid search, parsing. |

---

## 1. Anatomy of a recursive function

```python
def factorial(n):
    if n <= 1:          # BASE CASE - stops the recursion
        return 1
    return n * factorial(n - 1)   # RECURSIVE CASE - strictly smaller input
```

Three rules, all mandatory:

1. **A base case** that returns without recursing.
2. **Progress** - every call must move strictly closer to the base case.
3. **Trust** - assume the recursive call works ("the recursive leap of faith")
   and only verify that you combine its result correctly.

Miss #1 or #2 and you get `RecursionError: maximum recursion depth exceeded`.

---

## 2. The call stack is real memory

Each pending call keeps a frame alive. Recursion of depth `d` costs `O(d)`
space even if it allocates nothing else.

```python
import sys
sys.setrecursionlimit(10**6)   # Python's default is only 1000
```

Python has **no tail-call optimisation**, so a recursion of depth 10^6 will
blow the C stack even with a raised limit. Deep recursion must be rewritten
iteratively with an explicit stack.

---

## 3. Recursion trees and complexity

Draw the tree; count the nodes.

| Recursion | Tree shape | Complexity |
|-----------|-----------|------------|
| `f(n-1)` once | a chain of depth n | `O(n)` |
| `f(n/2)` once | depth log n | `O(log n)` |
| `f(n-1)` twice | binary tree, depth n | `O(2^n)` |
| `f(n/2)` twice + `O(n)` merge | depth log n, `O(n)` per level | `O(n log n)` |
| n branches, depth n | n-ary | `O(n!)` |

Naive Fibonacci is `O(2^n)` because it recomputes the same subproblems.
Memoising it caches each of the `n` states once: `O(n)`. That is the entire
idea behind chapter 15 (dynamic programming).

```python
from functools import lru_cache

@lru_cache(maxsize=None)      # or functools.cache in 3.9+
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

---

## 4. Backtracking: the universal template

```python
def backtrack(path, choices):
    if is_solution(path):
        results.append(path[:])       # COPY - path keeps mutating
        return
    for choice in choices:
        if not is_valid(choice, path):
            continue                  # PRUNE - skip whole subtrees
        path.append(choice)           # 1. choose
        backtrack(path, next_choices) # 2. explore
        path.pop()                    # 3. un-choose (this is the backtrack)
    return results
```

Every backtracking problem is this shape. What changes:

| Problem | Choices at each step | Prune when |
|---------|---------------------|------------|
| Subsets | include / exclude element i | never (all 2^n are valid) |
| Permutations | any unused element | element already used |
| Combination sum | any candidate from index i | running sum exceeds the target |
| N-Queens | any column in this row | column or diagonal attacked |
| Word search | 4 neighbouring cells | out of bounds, wrong letter, visited |

**Pruning is where the real speed comes from.** N-Queens has `8^8 = 16.7M` raw
placements but only 2057 nodes survive the attack checks.

---

## 5. Complexity of the classics

| Problem | Time | Space (excl. output) |
|---------|------|----------------------|
| Subsets | `O(n * 2^n)` | `O(n)` |
| Permutations | `O(n * n!)` | `O(n)` |
| Combination sum | `O(n^(target/min))` | `O(target/min)` |
| N-Queens | `O(n!)` with pruning | `O(n)` |
| Tower of Hanoi | `O(2^n)` | `O(n)` |
| Generate parentheses | `O(4^n / sqrt(n))` (Catalan) | `O(n)` |

The `n *` factor in subsets and permutations is the cost of copying each
completed path into the results.

---

## 6. Traps

- Appending `path` instead of `path[:]` - every result then aliases the same
  list, which ends up empty.
- Forgetting to `pop()` after the recursive call, so state leaks into siblings.
- Mutable default arguments: `def f(path=[])` shares one list across calls.
- Base case placed after the mutation, causing an extra level of recursion.
- Recursing on a slice (`nums[1:]`) copies `O(n)` per call - pass an index.

---

## 7. Run the code

```bash
python recursion.py
```

---

[<- 06 Stack & Queue](../06-Stack-Queue/) · [All topics](../../README.md) · [08 Searching ->](../08-Searching/)
