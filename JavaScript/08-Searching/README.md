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

## Run the code

```bash
node searching.js
```
