# 03 - Arrays (Go)

> Go draws a hard line between an **array** (fixed size, a value) and a
> **slice** (a view onto an array, what you actually use).

**At a glance**

| | |
|---|---|
| **What it is** | Contiguous memory. The structure everything else is built out of. |
| **Must know** | Index `O(1)`, insert/delete in the middle `O(n)`, append amortised `O(1)`. |
| **The one trap** | Mutating a list while iterating over it - indices shift underneath you. |
| **Reach for it when** | "Contiguous subarray", "in place", "two pointers", "sliding window". |

---

## 1. Arrays vs slices

```go
var a [5]int          // ARRAY: size is part of the type, copied on assignment
s := []int{1, 2, 3}   // SLICE: a 3-word header {ptr, len, cap}
```

| | Array `[5]int` | Slice `[]int` |
|---|---|---|
| size | fixed at compile time | dynamic |
| assignment | **copies all elements** | copies the 3-word header only |
| passed to a function | by value (a full copy) | by reference to the same backing array |
| comparable with `==` | yes | no (only against `nil`) |

Arrays are useful as fixed lookup tables (`var count [26]int`) precisely
because they are comparable and copyable.

---

## 2. The slice header

```
s := []int{10, 20, 30, 40, 50}
sub := s[1:3]

s   -> {ptr: &backing[0], len: 5, cap: 5}
sub -> {ptr: &backing[1], len: 2, cap: 4}     // cap runs to the END of backing

backing: [10][20][30][40][50]
               ^--sub--^
```

Two consequences you must internalise:

1. `sub[0] = 99` also changes `s[1]` - they share memory.
2. `append(sub, x)` writes into `backing[3]`, silently clobbering `s[3]`,
   because `sub` still has spare capacity.

To get independence: `cp := make([]int, len(s)); copy(cp, s)` or
`cp := append([]int(nil), s...)`. Since Go 1.21, `slices.Clone(s)` does it too.

> **Memory leak:** holding a 3-element sub-slice of a 10-million element array
> keeps all 10 million alive. Copy out what you need.

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| `s[i]` | `O(1)` |
| `len` / `cap` | `O(1)` |
| `append` (spare capacity) | `O(1)` |
| `append` (full) | `O(n)` copy, amortised `O(1)` |
| `copy(dst, src)` | `O(min(len))`, uses `memmove` |
| insert / delete in the middle | `O(n)` |
| `s = s[1:]` (pop front) | `O(1)` - but leaks the backing array |
| `sort.Ints` | `O(n log n)` |

```go
out := make([]int, 0, len(nums))   // pre-size: one allocation, zero copies
```

---

## 4. The five patterns

### a. Two pointers (opposite ends) - `O(n)`
Sorted input; pair sums, palindromes.

### b. Fast/slow pointers - `O(n)`
In-place filtering; `slow` is the write cursor.

### c. Sliding window - `O(n)`
Contiguous subarray under a constraint.

### d. Prefix sums - `O(n)` build, `O(1)` query
Watch for overflow: use `int64` if values are large (`int` is 64-bit on
mainstream platforms, but be explicit when it matters).

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
Max subarray sum.

---

## 5. Idiomatic slice surgery

```go
s = append(s, x)                          // push
x, s = s[len(s)-1], s[:len(s)-1]          // pop
s = append(s[:i], s[i+1:]...)             // delete index i, O(n)
s = append(s[:i], append([]int{v}, s[i:]...)...)   // insert at i, O(n)
```

Go 1.21+ ships `slices`: `slices.Contains`, `slices.Index`, `slices.Sort`,
`slices.Reverse`, `slices.Clone`, `slices.Equal`. Use them - but know what
they do underneath, which is what `arrays.go` shows.

---

## 6. Traps

- Forgetting to reassign: `append(s, x)` alone does nothing observable.
- `for i, v := range s` gives you a **copy** in `v`; write `s[i]` to mutate.
- A `nil` slice is fine to `append` to and has `len == 0`. Prefer it over
  `[]int{}` for empty returns.
- Sub-slice aliasing (see above) - the single most common Go array bug.
- Multi-dimensional slices need a loop per row; there is no 2-D literal.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DynamicArray.Push` | `O(1)` amortised | `O(n)` |
| `TwoSumSorted` | `O(n)` | `O(1)` |
| `MoveZeros` | `O(n)` | `O(1)` |
| `MaxSubarray` | `O(n)` | `O(1)` |
| `PrefixSum.RangeSum` | `O(1)` after `O(n)` | `O(n)` |
| `MaxSumWindow` | `O(n)` | `O(1)` |
| `RotateRight` | `O(n)` | `O(1)` |
| `DutchFlagSort` | `O(n)` | `O(1)` |
| `MergeSorted` | `O(n + m)` | `O(n + m)` |

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
go run arrays.go
```

---

[<- 02 Complexity](../02-Time-Space-Complexity/) · [All topics](../../README.md) · [04 Strings ->](../04-Strings/)
