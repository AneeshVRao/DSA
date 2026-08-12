# 03 - Arrays (JavaScript)

> A JS array is not really an array. It is an object with integer-ish keys that
> V8 *usually* optimises into a real contiguous buffer. Knowing when it stops
> doing that is the whole performance story.

**At a glance**

| | |
|---|---|
| **What it is** | Contiguous memory. The structure everything else is built out of. |
| **Must know** | Index `O(1)`, insert/delete in the middle `O(n)`, append amortised `O(1)`. |
| **The one trap** | Mutating a list while iterating over it - indices shift underneath you. |
| **Reach for it when** | "Contiguous subarray", "in place", "two pointers", "sliding window". |

---

## 1. How V8 stores arrays

V8 keeps two representations:

- **Packed elements** - a real contiguous block. Fast.
- **Dictionary (sparse) mode** - a hash map of index -> value. Much slower.

You fall into dictionary mode by creating holes:

```js
const a = [1, 2, 3];
a[1000] = 4;        // 996 holes -> sparse
delete a[0];        // creates a hole - use splice() instead
new Array(5);       // holey from birth; prefer new Array(5).fill(0)
```

Keep arrays **packed** and monomorphic (all numbers, or all strings) and V8
treats them like C arrays.

---

## 2. Costs

| Operation | Cost | Note |
|-----------|------|------|
| `a[i]` | `O(1)` | on packed arrays |
| `push` / `pop` | `O(1)` amortised | the cheap end |
| `shift` / `unshift` | **`O(n)`** | reindexes everything |
| `splice(i, k)` | `O(n)` | shifts the tail |
| `slice(i, j)` | `O(j - i)` | allocates a copy |
| `concat` / `[...a, ...b]` | `O(n + m)` | allocates |
| `includes` / `indexOf` | **`O(n)`** | use a `Set` |
| `sort` | `O(n log n)` | in place, comparator required for numbers |
| `length` | `O(1)` | but assigning to it truncates |

---

## 3. The five patterns

### a. Two pointers (opposite ends) - `O(n)`
Sorted input; pair sums, palindromes, container-with-most-water.

### b. Fast/slow pointers - `O(n)`
In-place filtering. `slow` is the write index, `fast` is the read index.

### c. Sliding window - `O(n)`
Contiguous subarray under a constraint. Grow right, shrink left while invalid.

### d. Prefix sums - `O(n)` build, `O(1)` query
`pre[i + 1] = pre[i] + a[i]`, then `sum(l, r) = pre[r] - pre[l]`.

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
Max subarray sum: extend the running total or restart at this element.

---

## 4. Creating arrays correctly

```js
new Array(5).fill(0);                                  // [0,0,0,0,0]
Array.from({ length: 5 }, (_, i) => i * i);            // [0,1,4,9,16]
Array.from({ length: rows }, () => new Array(cols).fill(0));   // 2-D, safe
new Array(rows).fill(new Array(cols).fill(0));         // BUG: one shared row
```

`Array.from` with a factory function is the only 2-D form you should use.

---

## 5. Copying

```js
const shallow = [...a];              // or a.slice()
const deep = structuredClone(grid);  // deep copy, no JSON round-trip needed
```

`[...grid]` copies the outer array but keeps the same row references. Mutating
`copy[0][0]` still changes the original.

---

## 6. Useful built-ins

```js
a.at(-1);                       // last element, no length arithmetic
a.flat(Infinity);               // fully flatten nested arrays
a.fill(0, 2, 5);                // fill a range in place
Array.from(new Set(a));         // dedupe, order preserved
a.findLast(x => x > 3);         // ES2023
a.toSorted((x, y) => x - y);    // ES2023: sorted COPY, does not mutate
```

---

## 7. Traps

- `sort()` without a comparator sorts by string: `[10, 9].sort()` is `[10, 9]`.
- `delete a[i]` leaves a hole and does not change `length`. Use `splice`.
- `[1,2,3].map(parseInt)` gives `[1, NaN, NaN]` - `map` passes the index as
  `parseInt`'s radix. Use `map(Number)`.
- `arr.length = 2` truncates in place.
- Comparing arrays with `===` compares references, never contents.

---

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DynamicArray.push` | `O(1)` amortised | `O(n)` |
| `twoSumSorted` | `O(n)` | `O(1)` |
| `moveZeros` | `O(n)` | `O(1)` |
| `maxSubarray` | `O(n)` | `O(1)` |
| `PrefixSum.rangeSum` | `O(1)` after `O(n)` | `O(n)` |
| `maxSumWindow` | `O(n)` | `O(1)` |
| `rotateRight` | `O(n)` | `O(1)` |
| `dutchFlagSort` | `O(n)` | `O(1)` |
| `mergeSorted` | `O(n + m)` | `O(n + m)` |

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
node arrays.js
```

---

[<- 02 Complexity](../02-Time-Space-Complexity/) · [All topics](../../README.md) · [04 Strings ->](../04-Strings/)
