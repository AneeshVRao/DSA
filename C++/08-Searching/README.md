# 08 - Searching (C++)

> The STL already has binary search - four ways. You still need to be able to
> write it, because the boundary variants are where the bugs live.

**At a glance**

| | |
|---|---|
| **What it is** | Discarding half the search space per step. |
| **Must know** | Binary search needs a **monotone predicate**, not merely sorted data. |
| **The one trap** | The `lo <= hi` vs `lo < hi` boundary. Pick one convention and never mix them. |
| **Reach for it when** | Sorted input, or anything phrased as "the smallest x such that ...". |

---

## 1. Linear search

`O(n)`, works on anything. `find(v.begin(), v.end(), x)` is the STL version.
Right choice for unsorted data searched once.

---

## 2. Binary search

Requires sorted (or monotonic) data. Halves the space each step: `log2(n)`
iterations - 20 for a million elements, 30 for a billion.

```cpp
int binarySearch(const vector<int>& a, int target) {
    int lo = 0, hi = int(a.size()) - 1;      // INCLUSIVE bounds
    while (lo <= hi) {                        // so <= here
        int mid = lo + (hi - lo) / 2;         // NOT (lo + hi) / 2 - overflow!
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

> **`(lo + hi) / 2` is a real bug in C++.** With `lo = hi = 2 * 10^9`, the sum
> overflows `int` and goes negative. This exact bug lived in the JDK's binary
> search for nine years. `lo + (hi - lo) / 2` cannot overflow.

Pick a convention and stick to it:

| Convention | Init | Loop | Update |
|------------|------|------|--------|
| inclusive `[lo, hi]` | `hi = n - 1` | `lo <= hi` | `mid + 1` / `mid - 1` |
| half-open `[lo, hi)` | `hi = n` | `lo < hi` | `mid + 1` / `mid` |

---

## 3. The STL family

```cpp
binary_search(v.begin(), v.end(), x);   // bool: is it present?
lower_bound(v.begin(), v.end(), x);     // iterator to first >= x
upper_bound(v.begin(), v.end(), x);     // iterator to first > x
equal_range(v.begin(), v.end(), x);     // both bounds in one call

int idx = int(lower_bound(v.begin(), v.end(), x) - v.begin());
int count = int(upper_bound(...) - lower_bound(...));
```

All are `O(log n)` on random-access iterators - but `O(n)` on `std::list`,
because the iterator cannot jump. `set::lower_bound` (the member function) is
`O(log n)`; `std::lower_bound(set.begin(), ...)` is `O(n)`. Use the member.

All four require the range to be sorted; on unsorted input they return
nonsense, not an error.

---

## 4. Boundary variants by hand

| Question | Answer |
|----------|--------|
| first `>= target` | lower bound |
| first `> target` | upper bound |
| first occurrence | `lower_bound` if the value matches |
| last occurrence | `upper_bound - 1` |
| count | `upper_bound - lower_bound` |

The key difference from plain binary search: **never return on a match** -
record the candidate and keep shrinking toward the side you want.

---

## 5. Binary search on the answer

If `feasible(x)` is monotonic (F F F T T T), binary search finds the boundary
with no array involved:

1. Bound the answer: `[lo, hi]`.
2. Write `feasible(x)`.
3. Confirm monotonicity.
4. Search for the smallest feasible x.

Classic: minimum ship capacity, Koko eating bananas, split array largest sum,
integer square root, aggressive cows. Use `long long` for the bounds when the
sum can exceed `2 * 10^9`.

---

## 6. Rotated arrays and matrices

- **Rotated:** at any `mid`, one half is sorted. Identify it, test whether the
  target lies inside, discard the other half. `O(log n)`.
- **Row-chained matrix:** flatten to `rows * cols` and map
  `mid -> (mid / cols, mid % cols)`. `O(log(r*c))`.
- **Row- and column-sorted matrix:** start top-right, move left or down.
  `O(rows + cols)`.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `linearSearch` | `O(n)` | `O(1)` |
| `binarySearch` | `O(log n)` | `O(1)` |
| `lowerBound` / `upperBound` | `O(log n)` | `O(1)` |
| `countOccurrences` | `O(log n)` | `O(1)` |
| `searchRotated` | `O(log n)` | `O(1)` |
| `findPeak` | `O(log n)` | `O(1)` |
| `integerSqrt` | `O(log n)` | `O(1)` |
| `searchMatrix` | `O(log(r*c))` | `O(1)` |
| `minShipCapacity` | `O(n log(sum))` | `O(1)` |

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

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall searching.cpp -o searching && ./searching
```

---

[<- 07 Recursion & Backtracking](../07-Recursion-Backtracking/) · [All topics](../../README.md) · [09 Sorting ->](../09-Sorting/)
