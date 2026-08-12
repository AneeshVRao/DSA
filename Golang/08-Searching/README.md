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

## Ternary search - when the predicate is not monotone

Binary search needs a **monotone** predicate: "is this true from here on?".
Some problems do not have one. If the values **rise to a single peak and then
fall** - *unimodal* - there is no boundary to binary-search for, but the peak is
still findable in `O(log n)`.

```text
f
|        *
|      *   *
|    *       *
|  *           *
+-------------------- x
         ^ the peak
```

Cut the range at **two** points:

```text
if f(m1) < f(m2)   the peak is right of m1  ->  discard [low, m1]
else               the peak is left of m2   ->  discard [m2, high]
```

Each round keeps two thirds, so it is `O(log_1.5 n)` - about 1.7x the probes of
binary search, but binary search cannot be used here at all.

> **The trap:** a **plateau**. If `f(m1) == f(m2)` because the function is flat
> between them, the range never shrinks past the flat part. Ternary search needs
> *strict* unimodality.

**On reals**, run a fixed iteration count rather than testing convergence -
`while high - low > 1e-9` can spin forever once the values stop changing at
float resolution.

> **And do not expect 1e-15 accuracy.** Near a smooth minimum the function is
> locally quadratic, so being `d` away changes `f` by only `~c*d^2`. Once `d`
> reaches about `sqrt(machine epsilon)` ~ `1.5e-8` the two probes compare
> *equal* and the comparison is noise. That is a property of the problem, not
> of the loop count - a function with a kink (`|x - 2.5|`) converges far
> further, and the demo asserts both.

**Where it shows up:** maximising a profit curve, the closest point on a convex
path, "minimum time such that..." where the cost first falls then rises, and
optimisation problems phrased as "find the best k".

---

## Run the code

```bash
go run searching.go
```
