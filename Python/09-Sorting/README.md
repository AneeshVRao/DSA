# 09 - Sorting (Python)

> You will almost never write a sort in production. You will constantly be
> asked to explain one - and the *properties* (stable? in place? worst case?)
> decide real design choices.

## 1. The three properties that matter

- **Stable** - equal elements keep their original relative order. Essential
  when you sort by one key after another (sort by name, then by score, and the
  names stay ordered within each score).
- **In place** - `O(1)` extra memory beyond the input.
- **Adaptive** - faster on data that is already nearly sorted.

---

## 2. The comparison sorts

| Algorithm | Best | Average | Worst | Space | Stable | Notes |
|-----------|------|---------|-------|-------|--------|-------|
| Bubble | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | yes | teaching only |
| Selection | `O(n^2)` | `O(n^2)` | `O(n^2)` | `O(1)` | no | minimum number of swaps (`n-1`) |
| Insertion | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | yes | excellent on tiny or nearly sorted input |
| Merge | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | yes | predictable; the choice for linked lists |
| Quick | `O(n log n)` | `O(n log n)` | **`O(n^2)`** | `O(log n)` | no | fastest in practice |
| Heap | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | no | worst-case guarantee, in place |

**No comparison sort can beat `O(n log n)`.** There are `n!` possible
orderings, a binary decision tree distinguishing them needs depth
`log2(n!) = O(n log n)`, and each comparison is one level.

---

## 3. Beating n log n: non-comparison sorts

These exploit the *structure* of the keys instead of comparing them:

| Algorithm | Time | Space | Requires |
|-----------|------|-------|----------|
| Counting sort | `O(n + k)` | `O(n + k)` | small integer range `k` |
| Radix sort | `O(d * (n + b))` | `O(n + b)` | fixed-width keys, `d` digits |
| Bucket sort | `O(n)` average | `O(n)` | uniformly distributed input |

Counting sort on values 0-100 is genuinely linear. On values up to 10^9 it
needs a 10^9-slot array - useless. Know the constraint.

---

## 4. What Python actually does

`sorted()` and `list.sort()` use **Timsort**: a hybrid of merge sort and
insertion sort that detects existing sorted runs.

- Stable, `O(n log n)` worst case, `O(n)` on already-sorted input.
- `list.sort()` sorts in place and returns `None`; `sorted()` returns a new
  list and accepts any iterable.

```python
sorted(nums)
sorted(nums, reverse=True)
sorted(people, key=lambda p: (-p.score, p.name))   # score desc, name asc
sorted(words, key=str.lower)                       # case-insensitive
```

The `key` function is called exactly **once per element** (decorate-sort-
undecorate), so an expensive key is fine. A `cmp`-style comparator needs
`functools.cmp_to_key` and is much slower.

Because Timsort is stable, sorting twice works:
`data.sort(key=name)` then `data.sort(key=score)` gives score-major,
name-minor order.

---

## 5. Choosing an algorithm

| Situation | Use |
|-----------|-----|
| general purpose | the built-in (Timsort) |
| memory is tight, worst case matters | heap sort |
| stability required | merge sort / Timsort |
| nearly sorted data | insertion sort or Timsort |
| tiny arrays (n < 16) | insertion sort - it beats everything |
| small integer range | counting sort |
| fixed-width keys, huge n | radix sort |
| linked list | merge sort (no random access needed) |
| "kth largest", not full order | quickselect - `O(n)` average |

---

## 6. Quicksort details worth knowing

- **Partitioning schemes:** Lomuto (simpler, more swaps) vs Hoare (fewer
  swaps, trickier boundaries).
- **The `O(n^2)` case:** already-sorted input with a first/last-element pivot.
  Fix with a **random** or median-of-three pivot.
- **Dutch flag partition (3-way)** handles many duplicate keys in `O(n)`.
- **Quickselect** reuses the partition step to find the kth element in `O(n)`
  average without sorting everything.

---

## 7. Complexity of what is implemented here

| Function | Time | Space | Stable |
|----------|------|-------|--------|
| `bubble_sort` | `O(n^2)`, `O(n)` best | `O(1)` | yes |
| `selection_sort` | `O(n^2)` | `O(1)` | no |
| `insertion_sort` | `O(n^2)`, `O(n)` best | `O(1)` | yes |
| `merge_sort` | `O(n log n)` | `O(n)` | yes |
| `quick_sort` | `O(n log n)` avg | `O(log n)` | no |
| `heap_sort` | `O(n log n)` | `O(1)` | no |
| `counting_sort` | `O(n + k)` | `O(n + k)` | yes |
| `radix_sort` | `O(d(n + 10))` | `O(n)` | yes |
| `quickselect` | `O(n)` avg | `O(1)` | n/a |

## Run the code

```bash
python sorting.py
```

Every algorithm is verified against `sorted()` on 200 random arrays, and the
stable ones are checked for stability explicitly.
