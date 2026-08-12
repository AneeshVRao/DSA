# 03 - Arrays (Go)

> Go draws a hard line between an **array** (fixed size, a value) and a
> **slice** (a view onto an array, what you actually use).

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

## Run the code

```bash
go run arrays.go
```
