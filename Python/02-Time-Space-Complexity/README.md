# 02 - Time and Space Complexity (Python)

> The skill that separates "it works" from "it works on the real input".

**At a glance**

| | |
|---|---|
| **What it is** | How to predict runtime **before** writing the code. |
| **Must know** | Drop constants, keep the dominant term. A recursion tree costs `branches^depth`. |
| **The one trap** | Counting only the data and forgetting the call stack and the copies. |
| **Reach for it when** | Every time you read a constraint line - `n <= 10^5` already names the algorithm. |

---

## 1. What Big-O actually says

Big-O describes how the **cost grows** as the input grows, ignoring constants
and lower-order terms. `3n + 100` and `n` are both `O(n)`, because when `n`
doubles, both roughly double.

- **O (Big-O)** - upper bound, the worst case. This is what we quote.
- **Omega** - lower bound, the best case.
- **Theta** - tight bound, when upper and lower match.

We drop constants (`O(2n) -> O(n)`) and keep only the dominant term
(`O(n^2 + n) -> O(n^2)`), because for large `n` the dominant term wins.

---

## 2. The complexity ladder

| Class | Name | n = 10 | n = 1,000 | n = 1,000,000 | Typical source |
|-------|------|--------|-----------|---------------|----------------|
| `O(1)` | constant | 1 | 1 | 1 | dict lookup, arithmetic |
| `O(log n)` | logarithmic | 3 | 10 | 20 | binary search, heap push |
| `O(n)` | linear | 10 | 10^3 | 10^6 | one pass over the data |
| `O(n log n)` | linearithmic | 33 | 10^4 | 2*10^7 | sorting, divide and conquer |
| `O(n^2)` | quadratic | 100 | 10^6 | 10^12 (dead) | nested loops over the input |
| `O(2^n)` | exponential | 1024 | dead | dead | naive subsets, naive recursion |
| `O(n!)` | factorial | 3.6M | dead | dead | permutations, brute-force TSP |

---

## 3. Reading complexity off code

```python
for x in nums:            # O(n)
    ...

for i in range(n):        # O(n^2) - nested over the same input
    for j in range(n):
        ...

while n > 1:              # O(log n) - the input halves each step
    n //= 2

for i in range(n):        # O(n log n) - linear loop, log work inside
    binary_search(sorted_nums, i)
```

**The rules:** sequential blocks add (`O(n) + O(n) = O(n)`); nested blocks
multiply (`O(n) * O(n) = O(n^2)`).

> **Hidden loops are the #1 mistake in Python.** `x in list`, `list.pop(0)`,
> `min(list)`, `sorted(list)` and slicing are all loops that do not *look* like
> loops. This is `O(n^2)`, not `O(n)`:
>
> ```python
> for x in nums:          # n iterations ...
>     if x in seen_list:  # ... each doing an O(n) scan
>         ...
> ```

---

## 4. Recursion: recursion trees and the Master Theorem

For `T(n) = a * T(n / b) + f(n)` (a subproblems of size n/b, plus f(n) work):

| Case | Result | Example |
|------|--------|---------|
| `f(n)` smaller than `n^(log_b a)` | `O(n^(log_b a))` | binary tree traversal |
| `f(n)` equal to `n^(log_b a)` | `O(n^(log_b a) * log n)` | merge sort: `2T(n/2) + O(n)` -> `O(n log n)` |
| `f(n)` larger | `O(f(n))` | dominant work at the top |

For non-uniform recursion, count nodes in the recursion tree:
naive Fibonacci branches twice per call and depth is `n`, so `O(2^n)`.
Memoise it and each of `n` states is computed once: `O(n)`.

---

## 5. Amortised analysis

`list.append` is *usually* `O(1)`, but occasionally the list reallocates and
copies everything, which is `O(n)`. Because the capacity grows geometrically,
those copies are rare enough that `n` appends cost `O(n)` in total - hence
**amortised** `O(1)`.

---

## 6. Space complexity

Count **extra** memory beyond the input:

- in-place two-pointer swap: `O(1)`
- a `set` of every element: `O(n)`
- a 2-D DP table: `O(n * m)`
- **the call stack:** recursion of depth `d` costs `O(d)` space, and Python's
  default limit is only 1000 frames

Rolling a DP array from 2-D to 1-D is the standard `O(n * m) -> O(m)` trick.

---

## 7. Python-specific constant factors

Big-O ignores constants; the judge does not. In CPython:

- Interpreted loops are roughly 50-100x slower than C. A hot `for` loop over
  10^7 items will time out where the same loop in C++ will not.
- Built-ins (`sum`, `sorted`, `any`, `Counter`) run in C. Prefer them.
- Attribute lookups (`self.data.append`) cost real time inside tight loops;
  bind them to a local first (`ap = out.append`).

**Rule of thumb for Python judges:** aim for under about 10^7 interpreted
operations per second.

---

## 8. Choosing a target from the constraints

The input limits tell you the intended complexity:

| n up to | Intended complexity |
|---------|--------------------|
| 10^18 | `O(log n)` or `O(1)` - math, binary search on the answer |
| 10^6 - 10^8 | `O(n)` or `O(n log n)` |
| 10^4 - 10^5 | `O(n log n)`, sometimes `O(n sqrt(n))` |
| 500 - 5,000 | `O(n^2)` |
| 100 - 500 | `O(n^3)` |
| 20 - 25 | `O(2^n)` - bitmask / subsets |
| 10 - 12 | `O(n!)` - permutations |

Read the constraints **before** designing the algorithm. They are a hint, not
decoration.

---

## Run the code

```bash
python complexity.py
```

The script counts operations (not wall-clock time) so the growth curves are
exact and reproducible.

---

[<- 01 Basics & Syntax](../01-Basics-and-Syntax/) · [All topics](../../README.md) · [03 Arrays ->](../03-Arrays/)
