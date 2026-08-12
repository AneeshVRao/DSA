# 03 - Arrays (Python)

> An array is a block of contiguous memory. That single fact explains every one
> of its costs.

**At a glance**

| | |
|---|---|
| **What it is** | Contiguous memory. The structure everything else is built out of. |
| **Must know** | Index `O(1)`, insert/delete in the middle `O(n)`, append amortised `O(1)`. |
| **The one trap** | Mutating a list while iterating over it - indices shift underneath you. |
| **Reach for it when** | "Contiguous subarray", "in place", "two pointers", "sliding window". |

---

## 1. What an array is

Elements sit next to each other in memory, so the address of index `i` is
`base + i * item_size`. That arithmetic is one CPU instruction, which is why
indexing is `O(1)` regardless of size.

The price: inserting or deleting anywhere except the end must **shift**
everything after it, which is `O(n)`.

```
index:   0     1     2     3
       +-----+-----+-----+-----+
       | 10  | 20  | 30  | 40  |
       +-----+-----+-----+-----+
insert 15 at index 1 -> 20, 30, 40 all shift right
```

In Python, `list` is a **dynamic array** of pointers. It over-allocates, so
`append` is amortised `O(1)`; when capacity runs out it allocates a bigger
block and copies. (`array.array` and `numpy` store raw values contiguously and
are far more memory-compact, but `list` is what interviews expect.)

---

## 2. Costs

| Operation | Cost | Why |
|-----------|------|-----|
| `a[i]` read/write | `O(1)` | address arithmetic |
| `append` | `O(1)` amortised | over-allocation |
| `pop()` (end) | `O(1)` | nothing shifts |
| `insert(i, x)` / `pop(i)` | `O(n)` | shift the tail |
| `pop(0)` | `O(n)` | shift everything |
| `x in a` | `O(n)` | linear scan |
| `a[i:j]` | `O(j - i)` | copies |
| `sort()` | `O(n log n)` | Timsort |
| `len(a)` | `O(1)` | stored, not counted |

---

## 3. The five patterns that solve most array problems

### a. Two pointers (opposite ends) - `O(n)`

Sorted input, looking for a pair or a palindrome.

```python
lo, hi = 0, len(a) - 1
while lo < hi:
    s = a[lo] + a[hi]
    if s == target: return lo, hi
    if s < target:  lo += 1      # need a bigger sum
    else:           hi -= 1      # need a smaller sum
```

### b. Fast/slow pointers (same direction) - `O(n)`

In-place filtering, dedup, "move zeros": `slow` marks where the next kept
element goes, `fast` scans ahead.

### c. Sliding window - `O(n)`

Contiguous subarray with a constraint. Grow `right`; shrink `left` while the
window is invalid. Each index enters and leaves at most once, so it is linear
despite the nested `while`.

### d. Prefix sums - `O(n)` build, `O(1)` per query

`prefix[i] = a[0] + ... + a[i-1]`, then `sum(a[l:r]) = prefix[r] - prefix[l]`.
Turns "sum of many ranges" from `O(n)` per query into `O(1)`.

The 2-D version answers any **rectangle** sum in `O(1)` after an
`O(rows*cols)` build, by inclusion-exclusion:

```text
+-------+-------+
|   A   |   B   |    want D
+-------+-------+
|   C   |   D   |    D = total - B - C + A
+-------+-------+
```

The `+ A` is the whole trick - the top strip and the left strip both contain
corner A, so subtracting both removes it twice. **Forgetting that term is the
standard bug**, and it only shows up on a query that touches neither the top nor
the left edge, so a careless test suite will miss it.

Use it over a FIXED grid. If the grid changes, a 2-D Fenwick tree (chapter 19)
gives `O(log^2 n)` updates instead.

### e. Kadane - `O(n)`

Maximum subarray sum: at each element decide "extend the previous best, or
start fresh here".

---

## 4. Choosing the pattern

| The problem says | Reach for |
|------------------|-----------|
| sorted array, find a pair | two pointers |
| remove/move elements in place | fast/slow pointers |
| "contiguous subarray/substring" | sliding window |
| many range-sum queries | prefix sums |
| "maximum sum subarray" | Kadane |
| "find the duplicate/missing number" | hashing, XOR, or cyclic sort |
| rotate / reverse in place | three reversals |

---

## 5. Traps

- `a[:]` copies - `O(n)` time **and** space. Passing `nums[1:]` into a
  recursion is the usual cause of an accidental `O(n^2)`.
- `[[0] * cols] * rows` aliases one row. Use a comprehension.
- Removing while iterating skips elements. Build a new list, or iterate
  backwards.
- Empty-array edge cases: `max([])` raises; guard first.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DynamicArray.append` | `O(1)` amortised | `O(n)` total |
| `two_sum_sorted` | `O(n)` | `O(1)` |
| `move_zeros` | `O(n)` | `O(1)` |
| `max_subarray` (Kadane) | `O(n)` | `O(1)` |
| `PrefixSum.range_sum` | `O(1)` after `O(n)` build | `O(n)` |
| `max_sum_window` | `O(n)` | `O(1)` |
| `rotate` | `O(n)` | `O(1)` |
| `dutch_flag_sort` | `O(n)` | `O(1)` |
| `merge_sorted` | `O(n + m)` | `O(n + m)` |

## Memory layout - why the same loop has two speeds

Two loops. Same complexity, same answer, one line different:

```text
for r: for c: total += grid[r][c]     <- row-major:    3-15x faster
for c: for r: total += grid[r][c]     <- column-major
```

Memory is a flat line, and a 2-D grid has to be flattened onto it somehow.
**Row-major** order (C, C++, Java, Go, Python, JavaScript) stores row 0, then
row 1, and so on. Column-major (Fortran, MATLAB, R) does the opposite.

The CPU never fetches one value - it fetches a **cache line**, typically 64
bytes. Walking along a row means every fetch delivers the next 8-15 iterations
for free: one miss, then a run of hits. Walking down a column jumps a whole row
each step, so every access is a fresh miss and the other 15 values in each line
are evicted unused. Same memory bandwidth spent; a fraction of it useful.

> This is the gap between **complexity** and **constant factor**. Both loops are
> `O(rows * cols)`, identically. Big-O deliberately ignores what the hardware is
> doing - which is why it is necessary but never sufficient.

Measured in this chapter: **~3x in Python, ~9x in Go, ~15x in C++.** The
interpreter overhead in Python partly masks the effect; the closer you get to
the metal, the more it dominates.

### The aliasing trap

```text
Python  [[0] * cols] * rows                          <- every row is ONE list
JS      new Array(rows).fill(new Array(cols))        <- every row is ONE array
Go      for i := range grid { grid[i] = row }        <- one backing array
```

The inner container is built **once** and its reference copied. Writing to
`grid[0][0]` writes to every row at once.

It is silent: the shape is right, the values start right, and it only goes wrong
on the first write. Build rows with a comprehension / `Array.from` / a fresh
`make` per row instead. The demo proves both behaviours rather than describing
them.

---

## Run the code

```bash
python arrays.py
```

---

[<- 02 Complexity](../02-Time-Space-Complexity/) · [All topics](../../README.md) · [04 Strings ->](../04-Strings/)
