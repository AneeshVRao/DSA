# 09 - Sorting (C++)

> `std::sort` is one of the fastest sorts ever shipped. Knowing what is inside
> it is what lets you reason about the cases where it is the wrong tool.

**At a glance**

| | |
|---|---|
| **What it is** | The `O(n log n)` barrier, and the two ways of getting under it. |
| **Must know** | Comparison sorts cannot beat `O(n log n)`. Counting and radix can, by not comparing. |
| **The one trap** | Assuming your language's sort is stable. Some are, some are not. |
| **Reach for it when** | Sorting is usually the *preprocessing* step for greedy, two pointers or intervals. |

---

## 1. The three properties that matter

- **Stable** - equal elements keep their relative order (`stable_sort`, not
  `sort`).
- **In place** - `O(1)` or `O(log n)` extra memory.
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

No comparison sort can beat `O(n log n)`: distinguishing `n!` orderings needs
a decision tree of depth `log2(n!) = O(n log n)`.

---

## 3. What the STL actually does

| Call | Algorithm | Guarantee |
|------|-----------|-----------|
| `sort` | **introsort** = quicksort + heapsort fallback + insertion sort for small ranges | `O(n log n)` worst case, not stable |
| `stable_sort` | merge sort (adaptive, uses a temp buffer) | `O(n log n)`, stable |
| `partial_sort` | heap-based | `O(n log k)` for the top k |
| `nth_element` | **quickselect** | `O(n)` average |
| `sort_heap` / `make_heap` | heap sort | `O(n log n)` |

Introsort exists precisely because quicksort has an `O(n^2)` case: it counts
recursion depth and switches to heapsort past `2 * log2(n)`. That is how you
get quicksort's speed with heapsort's guarantee.

```cpp
sort(v.begin(), v.end());
sort(v.begin(), v.end(), greater<int>());              // descending
sort(v.begin(), v.end(), [](const P& a, const P& b) {  // custom
    if (a.score != b.score) return a.score > b.score;  // score desc
    return a.name < b.name;                            // then name asc
});
stable_sort(v.begin(), v.end(), byScore);              // ties keep input order
nth_element(v.begin(), v.begin() + k, v.end());        // kth element, O(n)
partial_sort(v.begin(), v.begin() + k, v.end());       // top k sorted
```

> **The comparator must be a strict weak ordering.** Writing `<=` instead of
> `<` makes `sort` read out of bounds - a real, hard-to-debug crash, not just a
> wrong order. Rule: return `true` only when `a` must come strictly before `b`.

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
| general purpose | `std::sort` |
| stability required | `std::stable_sort` |
| kth element only | `nth_element` (`O(n)`) |
| top k only | `partial_sort` (`O(n log k)`) |
| memory-constrained, worst-case bound | heap sort |
| small integer range | counting sort |
| linked list | merge sort |

---

## 6. Complexity of what is implemented here

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

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall sorting.cpp -o sorting && ./sorting
```

Every algorithm is verified against `std::sort` on 200 random vectors.

---

[<- 08 Searching](../08-Searching/) · [All topics](../../README.md) · [10 Hashing ->](../10-Hashing/)
