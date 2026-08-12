# 08 - Searching (Python)

> Binary search is the highest value-per-line algorithm you will ever learn -
> and the one people most reliably get wrong.

## 1. Linear search

Check every element: `O(n)`, works on **any** sequence, sorted or not. It is
the right answer when the data is unsorted and you search it once (sorting
first costs `O(n log n)`, which only pays off across many queries).

---

## 2. Binary search

Requires a **sorted** (or otherwise monotonic) sequence. Each step halves the
search space, so `n -> n/2 -> n/4 -> ... -> 1` takes `log2(n)` steps.

| n | steps |
|---|-------|
| 1,000 | 10 |
| 1,000,000 | 20 |
| 1,000,000,000 | 30 |

```python
def binary_search(a, target):
    lo, hi = 0, len(a) - 1        # INCLUSIVE bounds
    while lo <= hi:               # so the loop must use <=
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1          # +1 and -1 guarantee progress
        else:
            hi = mid - 1
    return -1
```

**Pick one convention and never mix them:**

| Convention | Init | Loop | Update |
|------------|------|------|--------|
| inclusive `[lo, hi]` | `hi = n - 1` | `while lo <= hi` | `mid + 1` / `mid - 1` |
| half-open `[lo, hi)` | `hi = n` | `while lo < hi` | `mid + 1` / `mid` |

Mixing them is what produces infinite loops and off-by-ones.

> In C++/Java, `(lo + hi) / 2` can overflow; write `lo + (hi - lo) // 2`.
> Python's ints are unbounded so it cannot overflow here - but the habit is
> worth keeping.

---

## 3. The four boundary variants

Plain binary search finds *an* occurrence. Real problems want boundaries:

| Question | Answer |
|----------|--------|
| first index with `a[i] >= target` | **lower bound** (`bisect_left`) |
| first index with `a[i] > target` | **upper bound** (`bisect_right`) |
| first occurrence of target | `lower_bound` if `a[lb] == target` |
| last occurrence of target | `upper_bound - 1` |
| count of target | `upper_bound - lower_bound` |

Python ships these as `bisect.bisect_left` / `bisect.bisect_right`. Know both
the library call and the hand-rolled loop.

The key change from plain binary search: **do not return early on a match** -
record it and keep shrinking toward the side you want.

---

## 4. Binary search on the answer

The most powerful generalisation. If you can write a **monotonic predicate**
`feasible(x)` - false, false, ..., false, true, true, ... - then binary search
finds the boundary even when there is no array at all.

```
feasible:  F  F  F  F  T  T  T
                     ^ the answer
```

Recipe:

1. Identify the answer's range `[lo, hi]`.
2. Write `feasible(x)`: can we achieve the goal with x?
3. Verify it is monotonic (if x works, does x+1 always work?).
4. Binary search for the smallest feasible x.

Classic instances: minimum ship capacity, Koko eating bananas, split array
largest sum, integer square root, allocating minimum pages.

---

## 5. Rotated and 2-D searches

**Rotated sorted array:** at any `mid`, at least one half is sorted. Check
which, decide whether the target lies inside it, discard the other half.
Still `O(log n)`.

**2-D matrix, rows sorted and each row starts after the previous ends:** treat
it as one flat array of length `rows * cols` and map
`index -> (index // cols, index % cols)`.

**2-D matrix, rows and columns sorted independently:** start at the top-right
corner; move left when too large, down when too small. `O(rows + cols)`.

---

## 6. Traps

| Trap | Fix |
|------|-----|
| `while lo < hi` with inclusive bounds | misses the final element |
| `hi = mid` with inclusive bounds | infinite loop when `lo == hi` |
| binary searching unsorted data | garbage output, no error |
| returning on the first match when you need the first *occurrence* | keep shrinking |
| forgetting duplicates exist | use lower/upper bound |

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `linear_search` | `O(n)` | `O(1)` |
| `binary_search` | `O(log n)` | `O(1)` |
| `binary_search_recursive` | `O(log n)` | `O(log n)` stack |
| `lower_bound` / `upper_bound` | `O(log n)` | `O(1)` |
| `count_occurrences` | `O(log n)` | `O(1)` |
| `search_rotated` | `O(log n)` | `O(1)` |
| `find_peak` | `O(log n)` | `O(1)` |
| `integer_sqrt` | `O(log n)` | `O(1)` |
| `search_matrix` | `O(log(r*c))` | `O(1)` |
| `min_ship_capacity` | `O(n log(sum))` | `O(1)` |

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
python searching.py
```
