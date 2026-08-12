# 08 - Searching (JavaScript)

> JavaScript has no built-in binary search. You will write this loop by hand
> in every interview, so make it muscle memory.

## 1. Linear search

`O(n)`. `indexOf`, `includes`, `find` and `findIndex` are all linear scans.
Correct for unsorted data searched once.

---

## 2. Binary search

Requires sorted (or monotonic) data. Halves the space per step: 20 steps for a
million elements, 30 for a billion.

```js
function binarySearch(a, target) {
  let lo = 0;
  let hi = a.length - 1;            // INCLUSIVE bounds
  while (lo <= hi) {                // so <= here
    const mid = (lo + hi) >> 1;     // integer halving
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

> **`>> 1` truncates to 32 bits.** It is fine while `lo + hi < 2^31`, which
> covers every array JS can hold (max length is 2^32 - 1, but you will never
> have one). For "binary search on the answer" with large numeric ranges, use
> `Math.floor(lo + (hi - lo) / 2)` instead - bit shifts silently corrupt values
> above 2^31.

Pick a convention:

| Convention | Init | Loop | Update |
|------------|------|------|--------|
| inclusive `[lo, hi]` | `hi = n - 1` | `lo <= hi` | `mid + 1` / `mid - 1` |
| half-open `[lo, hi)` | `hi = n` | `lo < hi` | `mid + 1` / `mid` |

---

## 3. Boundary variants

| Question | Answer |
|----------|--------|
| first `>= target` | lower bound |
| first `> target` | upper bound |
| first occurrence | `lowerBound` if the value matches |
| last occurrence | `upperBound - 1` |
| count | `upperBound - lowerBound` |

The crucial difference from plain binary search: **do not return on a match**.
Record the candidate and keep shrinking toward the side you want.

---

## 4. Binary search on the answer

If `feasible(x)` is monotonic (false ... false, true ... true), binary search
finds the boundary with no array involved:

1. Bound the answer.
2. Write `feasible(x)`.
3. Confirm monotonicity.
4. Search for the smallest feasible x.

Classic: minimum ship capacity, Koko eating bananas, split array largest sum,
integer square root.

> With `Number.MAX_SAFE_INTEGER = 2^53 - 1`, be careful with huge ranges:
> `mid * mid` for `mid > 94906265` loses precision. Use `BigInt` or bound the
> range tighter.

---

## 5. Rotated arrays and matrices

- **Rotated:** at any `mid`, one half is sorted; test whether the target lies
  in it and discard the other. `O(log n)`.
- **Row-chained matrix:** flatten to `rows * cols`, map
  `mid -> [Math.floor(mid / cols), mid % cols]`. `O(log(r*c))`.
- **Row- and column-sorted matrix:** start top-right, move left or down.
  `O(rows + cols)`.

---

## 6. Traps

| Trap | Fix |
|------|-----|
| `sort()` before searching, without a comparator | `sort((a,b) => a-b)` |
| `>> 1` on values above 2^31 | `Math.floor((lo + hi) / 2)` |
| `while (lo < hi)` with inclusive bounds | misses the last element |
| `hi = mid` with inclusive bounds | infinite loop |
| binary searching unsorted data | silent garbage |

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

## Run the code

```bash
node searching.js
```
