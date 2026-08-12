# 09 - Sorting (JavaScript)

> `Array.prototype.sort` has one famous trap and one useful guarantee. Both
> are worth knowing before you write a line.

## 1. The two things to know about the built-in

```js
[10, 9, 1].sort();                 // [1, 10, 9]  <- compares as STRINGS
[10, 9, 1].sort((a, b) => a - b);  // [1, 9, 10]
```

Without a comparator, elements are converted to strings and compared by UTF-16
code units. This is the single most common JS sorting bug.

**Stability is guaranteed** since ES2019 - every modern engine's `sort` is
stable, so sorting by one key then another works. V8 uses **TimSort** (the
same hybrid as Python) for arrays over 22 elements, and insertion sort below
that.

```js
arr.sort((a, b) => a - b);              // numbers ascending
arr.sort((a, b) => b - a);              // descending
arr.sort((a, b) => a.localeCompare(b)); // correct text ordering
people.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
arr.toSorted((a, b) => a - b);          // ES2023: returns a COPY
```

`sort` mutates and returns the same array. Use `[...arr].sort()` or
`toSorted()` when the original matters.

---

## 2. The three properties

- **Stable** - equal elements keep their relative order.
- **In place** - `O(1)` extra memory.
- **Adaptive** - faster on nearly sorted data.

---

## 3. The comparison sorts

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | yes |
| Selection | `O(n^2)` | `O(n^2)` | `O(n^2)` | `O(1)` | no |
| Insertion | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | yes |
| Merge | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | yes |
| Quick | `O(n log n)` | `O(n log n)` | **`O(n^2)`** | `O(log n)` | no |
| Heap | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | no |

No comparison sort beats `O(n log n)`: distinguishing `n!` orderings requires
a decision tree of depth `log2(n!) = O(n log n)`.

---

## 4. Non-comparison sorts

| Algorithm | Time | Space | Requires |
|-----------|------|-------|----------|
| Counting | `O(n + k)` | `O(n + k)` | small integer range |
| Radix | `O(d(n + b))` | `O(n + b)` | fixed-width keys |
| Bucket | `O(n)` average | `O(n)` | uniform distribution |

---

## 5. Choosing

| Situation | Use |
|-----------|-----|
| general purpose | the built-in with a comparator |
| stability | the built-in (guaranteed since ES2019) |
| kth element only | quickselect, `O(n)` average |
| top k only | a size-k heap, `O(n log k)` |
| small integer range | counting sort |
| large fixed-width integers | radix sort |
| nearly sorted | insertion sort or the built-in |

---

## 6. Traps

- `sort()` without a comparator on numbers.
- A comparator returning a boolean (`(a, b) => a > b`) - it must return a
  **number**: negative, zero or positive.
- Forgetting that `sort` mutates; use `toSorted` or spread.
- `sort` on a sparse array moves holes to the end.
- Comparing mixed types - `undefined` always sorts last, regardless of the
  comparator (it is never even passed to it).

---

## 7. Complexity of what is implemented here

| Function | Time | Space | Stable |
|----------|------|-------|--------|
| `bubbleSort` | `O(n^2)`, `O(n)` best | `O(1)` | yes |
| `selectionSort` | `O(n^2)` | `O(1)` | no |
| `insertionSort` | `O(n^2)`, `O(n)` best | `O(1)` | yes |
| `mergeSort` | `O(n log n)` | `O(n)` | yes |
| `quickSort` | `O(n log n)` avg | `O(log n)` | no |
| `heapSort` | `O(n log n)` | `O(1)` | no |
| `countingSort` | `O(n + k)` | `O(n + k)` | yes |
| `radixSort` | `O(d(n + 10))` | `O(n)` | yes |
| `quickselect` | `O(n)` avg | `O(1)` | n/a |

## Run the code

```bash
node sorting.js
```

Every algorithm is verified against the built-in sort on 200 random arrays.
