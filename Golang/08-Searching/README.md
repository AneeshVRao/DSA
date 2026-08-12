# 08 - Searching (Go)

> Go ships `sort.SearchInts` and the wonderfully general `sort.Search`. Learn
> both, and learn to write the loop by hand.

## 1. Linear search

`O(n)`, works on anything. `slices.Index` (Go 1.21+) is the built-in.

---

## 2. Binary search

Requires sorted (or monotonic) data. `log2(n)` steps: 20 for a million, 30 for
a billion.

```go
func BinarySearch(nums []int, target int) int {
    lo, hi := 0, len(nums)-1          // INCLUSIVE bounds
    for lo <= hi {                    // so <= here
        mid := lo + (hi-lo)/2         // overflow-proof
        switch {
        case nums[mid] == target:
            return mid
        case nums[mid] < target:
            lo = mid + 1
        default:
            hi = mid - 1
        }
    }
    return -1
}
```

Two conventions, never mixed:

| Convention | Init | Loop | Update |
|------------|------|------|--------|
| inclusive `[lo, hi]` | `hi = n - 1` | `lo <= hi` | `mid + 1` / `mid - 1` |
| half-open `[lo, hi)` | `hi = n` | `lo < hi` | `mid + 1` / `mid` |

`int` is 64-bit on mainstream platforms, so `(lo+hi)/2` will not realistically
overflow - but `lo + (hi-lo)/2` costs nothing and travels well.

---

## 3. The standard library

```go
sort.SearchInts(nums, x)      // lower bound: first index with nums[i] >= x
sort.SearchStrings(strs, s)
sort.Search(n, func(i int) bool { return ... })   // the general form
slices.BinarySearch(nums, x)  // Go 1.21+: returns (index, found)
```

`sort.Search` is the one to internalise. It returns the **smallest index in
`[0, n)` for which the predicate is true**, assuming the predicate is
monotonic (false ... false, true ... true). That is a lower bound *and*
"binary search on the answer" in a single primitive:

```go
// lower bound
i := sort.Search(len(nums), func(i int) bool { return nums[i] >= target })

// upper bound
j := sort.Search(len(nums), func(i int) bool { return nums[i] > target })

// smallest feasible capacity - no array at all
cap := lo + sort.Search(hi-lo, func(k int) bool { return canShip(lo + k) })
```

---

## 4. Boundary variants

| Question | Answer |
|----------|--------|
| first `>= target` | lower bound (`sort.SearchInts`) |
| first `> target` | upper bound |
| first occurrence | lower bound, if the value matches |
| last occurrence | upper bound - 1 |
| count | upper - lower |

---

## 5. Binary search on the answer

If `feasible(x)` is monotonic, binary search the answer range directly:
minimum ship capacity, Koko eating bananas, split array largest sum, integer
square root. Bound the range, write the predicate, confirm monotonicity.

---

## 6. Rotated arrays and matrices

- **Rotated:** at any `mid`, one half is sorted; test whether the target lies
  inside and discard the other. `O(log n)`.
- **Row-chained matrix:** flatten to `rows*cols`, map `mid -> (mid/cols, mid%cols)`.
- **Row- and column-sorted matrix:** start top-right, move left or down.
  `O(rows + cols)`.

---

## 7. Traps

| Trap | Fix |
|------|-----|
| `sort.SearchInts` on an unsorted slice | silent garbage |
| assuming `sort.SearchInts` reports "found" | it returns an insertion point; check `nums[i] == x` |
| mixing loop conventions | infinite loop or off-by-one |
| non-monotonic predicate in `sort.Search` | undefined result |

---

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `LinearSearch` | `O(n)` | `O(1)` |
| `BinarySearch` | `O(log n)` | `O(1)` |
| `LowerBound` / `UpperBound` | `O(log n)` | `O(1)` |
| `CountOccurrences` | `O(log n)` | `O(1)` |
| `SearchRotated` | `O(log n)` | `O(1)` |
| `FindPeak` | `O(log n)` | `O(1)` |
| `IntegerSqrt` | `O(log n)` | `O(1)` |
| `SearchMatrix` | `O(log(r*c))` | `O(1)` |
| `MinShipCapacity` | `O(n log(sum))` | `O(1)` |

## Run the code

```bash
go run searching.go
```
