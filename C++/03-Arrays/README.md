# 03 - Arrays (C++)

> C++ is where "array" is literal: a contiguous block of memory you can point
> into. Everything about its performance follows from that.

**At a glance**

| | |
|---|---|
| **What it is** | Contiguous memory. The structure everything else is built out of. |
| **Must know** | Index `O(1)`, insert/delete in the middle `O(n)`, append amortised `O(1)`. |
| **The one trap** | Mutating a list while iterating over it - indices shift underneath you. |
| **Reach for it when** | "Contiguous subarray", "in place", "two pointers", "sliding window". |

---

## 1. Three kinds of array

| Form | Declaration | Size | Lives on |
|------|-------------|------|----------|
| C array | `int a[100];` | fixed, compile time | stack (or static) |
| `std::array` | `array<int,100> a;` | fixed, compile time | stack, but with an STL interface |
| `std::vector` | `vector<int> v;` | dynamic | heap |

Use `vector` by default. Use `array` when the size is a constant and you want
stack allocation. Use a raw C array only for global lookup tables in contests
(`int dp[1000006];` - globals are zero-initialised and dodge the stack limit).

> A big local array (`int a[10'000'000];` inside `main`) overflows the stack.
> Either make it global or use a `vector`.

---

## 2. Memory layout and why it matters

```
addr:  0x100 0x104 0x108 0x10c
       +-----+-----+-----+-----+
       |  10 |  20 |  30 |  40 |     &a[i] == a + i * sizeof(int)
       +-----+-----+-----+-----+
```

Indexing is one multiply-add: `O(1)`. Inserting in the middle must shift the
tail: `O(n)`.

Contiguity also means **cache locality**. Scanning a `vector<int>` streams
whole cache lines; a `list<int>` of the same length chases pointers all over
the heap and can be 10x slower for the same `O(n)`.

---

## 3. vector costs

| Operation | Cost |
|-----------|------|
| `v[i]`, `v.front()`, `v.back()` | `O(1)` |
| `push_back` / `pop_back` | `O(1)` amortised |
| `insert(pos, x)` / `erase(pos)` | `O(n)` |
| `v.size()`, `v.empty()` | `O(1)` |
| `find(v.begin(), v.end(), x)` | `O(n)` |
| `sort(v.begin(), v.end())` | `O(n log n)` |

`push_back` doubles capacity when full, copying everything - amortised `O(1)`.
`v.reserve(n)` up front removes those copies entirely.

> `v[i]` does **no** bounds checking; reading out of range is undefined
> behaviour, not an exception. `v.at(i)` throws. Use `at` while debugging.

---

## 4. The five patterns

### a. Two pointers (opposite ends) - `O(n)`
Sorted input, find a pair / verify a palindrome.

### b. Fast/slow pointers - `O(n)`
In-place filtering: `slow` is the write cursor, `fast` is the read cursor.
This is exactly what `std::remove` does internally.

### c. Sliding window - `O(n)`
Contiguous subarray under a constraint. Each index enters and leaves once.

### d. Prefix sums - `O(n)` build, `O(1)` query
`pre[i+1] = pre[i] + a[i]`, then `sum(l..r) = pre[r+1] - pre[l]`.
Use `long long` for the prefix array - sums overflow `int` fast.

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
Max subarray sum: extend the running sum, or restart at the current element.

---

## 5. STL tools worth knowing

```cpp
sort(v.begin(), v.end());
reverse(v.begin(), v.end());
rotate(v.begin(), v.begin() + k, v.end());        // O(n) in-place rotation
v.erase(remove(v.begin(), v.end(), 0), v.end());  // erase-remove idiom
accumulate(v.begin(), v.end(), 0LL);              // 0LL prevents overflow
auto it = lower_bound(v.begin(), v.end(), x);     // first >= x (sorted only)
max_element(v.begin(), v.end());
partial_sum(v.begin(), v.end(), pre.begin());     // prefix sums in one call
```

The `erase-remove` idiom exists because `remove` only shifts survivors forward
and returns the new logical end; it cannot change the container's size.

---

## 6. Traps

- Iterators are invalidated by `push_back` if it reallocates. Re-acquire them.
- `v.size()` is **unsigned**: `for (int i = 0; i < v.size() - 1; i++)` loops
  forever when `v` is empty (`0 - 1` wraps to a huge number). Cast or guard.
- 2-D vectors: `vector<vector<int>> g(r, vector<int>(c))` - each row is a
  separate allocation, so it is not truly contiguous. For speed, use one flat
  `vector<int> g(r * c)` and index `g[i * c + j]`.
- `memset(arr, 1, n)` sets every **byte** to 1, not every int.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DynamicArray::push_back` | `O(1)` amortised | `O(n)` |
| `twoSumSorted` | `O(n)` | `O(1)` |
| `moveZeros` | `O(n)` | `O(1)` |
| `maxSubarray` | `O(n)` | `O(1)` |
| `PrefixSum::rangeSum` | `O(1)` after `O(n)` | `O(n)` |
| `maxSumWindow` | `O(n)` | `O(1)` |
| `rotateRight` | `O(n)` | `O(1)` |
| `dutchFlagSort` | `O(n)` | `O(1)` |
| `mergeSorted` | `O(n + m)` | `O(n + m)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall arrays.cpp -o arrays && ./arrays
```

---

[<- 02 Complexity](../02-Time-Space-Complexity/) · [All topics](../../README.md) · [04 Strings ->](../04-Strings/)
