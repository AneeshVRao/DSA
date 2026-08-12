# 09 - Sorting (Go)

> Go's `sort` package makes the stable/unstable distinction explicit in the
> function name. That is a good habit to copy into your own thinking.

**At a glance**

| | |
|---|---|
| **What it is** | The `O(n log n)` barrier, and the two ways of getting under it. |
| **Must know** | Comparison sorts cannot beat `O(n log n)`. Counting and radix can, by not comparing. |
| **The one trap** | Assuming your language's sort is stable. Some are, some are not. |
| **Reach for it when** | Sorting is usually the *preprocessing* step for greedy, two pointers or intervals. |

---

## 1. The three properties

- **Stable** - equal elements keep their relative order.
- **In place** - `O(1)` extra memory.
- **Adaptive** - faster on nearly sorted input.

---

## 2. The comparison sorts

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | yes |
| Selection | `O(n^2)` | `O(n^2)` | `O(n^2)` | `O(1)` | no |
| Insertion | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | yes |
| Merge | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | yes |
| Quick | `O(n log n)` | `O(n log n)` | **`O(n^2)`** | `O(log n)` | no |
| Heap | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | no |

No comparison sort beats `O(n log n)`: distinguishing `n!` orderings needs a
decision tree of depth `log2(n!) = O(n log n)`.

---

## 3. What Go's standard library does

```go
sort.Ints(nums)                  // in place, not stable
sort.Strings(strs)
sort.Float64s(vals)

sort.Slice(people, func(i, j int) bool {      // NOT stable
    return people[i].Score > people[j].Score
})
sort.SliceStable(people, less)                // stable

sort.IsSorted(sort.IntSlice(nums))

// Go 1.21+ generics:
slices.Sort(nums)                             // faster: no interface calls
slices.SortFunc(people, func(a, b Person) int { return a.Score - b.Score })
slices.SortStableFunc(people, cmpFn)
slices.IsSorted(nums)
```

`sort.Slice` uses **pattern-defeating quicksort (pdqsort)** since Go 1.19:
quicksort with median-of-three pivots, a heapsort fallback for bad patterns,
and insertion sort for small ranges - so the worst case is `O(n log n)`.

> The `less` function must be a **strict** ordering: return `true` only when
> `i` must come before `j`. Returning `true` for equal elements breaks the
> invariants.

`slices.Sort` (generics) is measurably faster than `sort.Slice` because it
avoids reflection and interface dispatch. Prefer it on Go 1.21+.

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
| general purpose | `slices.Sort` / `sort.Ints` |
| stability required | `sort.SliceStable` |
| kth element only | quickselect, `O(n)` average |
| memory tight, worst case matters | heap sort |
| small integer range | counting sort |
| linked list | merge sort |

---

## 6. Complexity of what is implemented here

| Function | Time | Space | Stable |
|----------|------|-------|--------|
| `BubbleSort` | `O(n^2)`, `O(n)` best | `O(1)` | yes |
| `SelectionSort` | `O(n^2)` | `O(1)` | no |
| `InsertionSort` | `O(n^2)`, `O(n)` best | `O(1)` | yes |
| `MergeSort` | `O(n log n)` | `O(n)` | yes |
| `QuickSort` | `O(n log n)` avg | `O(log n)` | no |
| `HeapSort` | `O(n log n)` | `O(1)` | no |
| `CountingSort` | `O(n + k)` | `O(n + k)` | yes |
| `RadixSort` | `O(d(n + 10))` | `O(n)` | yes |
| `QuickSelect` | `O(n)` avg | `O(1)` | n/a |

## Run the code

```bash
go run sorting.go
```

Every algorithm is verified against `sort.Ints` on 200 random slices.

---

[<- 08 Searching](../08-Searching/) · [All topics](../../README.md) · [10 Hashing ->](../10-Hashing/)
