# 10 - Hashing (Python)

> A hash table turns "search" into "compute an address". That is how `O(n)`
> lookups become `O(1)`.

## 1. The idea

```
key --hash()--> integer --% capacity--> bucket index
"cat" -->  8374652  -->  8374652 % 8  -->  bucket 4
```

Insert, look up and delete all cost one hash computation plus one array index:
**`O(1)` average**. The catch is what happens when two keys land in the same
bucket.

---

## 2. Collisions

Two different keys can hash to the same bucket (guaranteed once you have more
keys than buckets - the pigeonhole principle). Two standard fixes:

**Separate chaining** - each bucket holds a list of entries. Simple, degrades
gracefully, and the version implemented in `hashing.py`.

```
bucket 4: [("cat", 1)] -> [("act", 9)]
```

**Open addressing** - one entry per bucket; on a collision, probe for another
slot (linear, quadratic, or double hashing). Better cache locality, but
deletion needs tombstones. **This is what CPython actually uses**, with a
sophisticated probe sequence.

---

## 3. Load factor and resizing

`load factor = entries / buckets`

As it climbs, chains get longer and performance decays toward `O(n)`. Every
implementation resizes (usually doubling) past a threshold - CPython grows
when the table is 2/3 full.

Resizing is `O(n)` because every key must be **rehashed** into the new bucket
array. It happens rarely enough that inserts stay **amortised `O(1)`**, just
like `list.append`.

---

## 4. Costs

| Operation | Average | Worst case |
|-----------|---------|------------|
| insert | `O(1)` | `O(n)` (all keys collide) |
| lookup | `O(1)` | `O(n)` |
| delete | `O(1)` | `O(n)` |
| iterate | `O(n)` | `O(n)` |

The `O(n)` worst case is real: with a known hash function an attacker can
craft colliding keys (a "hash flooding" DoS). Python randomises string hashes
per process to defend against it - which is also why `hash("abc")` differs
between runs.

---

## 5. What can be a key

Only **hashable** objects: immutable, with `__hash__` and `__eq__` that agree.

```python
d[(1, 2)] = "ok"      # tuple: fine
d[[1, 2]] = "boom"    # list: TypeError, unhashable
d[frozenset({1})]     # fine; set() is not
```

The contract: **equal objects must have equal hashes.** If you define
`__eq__` on a class without `__hash__`, Python makes it unhashable on
purpose - because the default identity hash would break the invariant.

---

## 6. The patterns

### a. Frequency map
Count occurrences in one pass: `Counter(s)` or `defaultdict(int)`.

### b. Complement lookup - two sum
Instead of checking all pairs (`O(n^2)`), ask "have I already seen
`target - x`?" - `O(n)`.

### c. Grouping by a computed key
Anagram grouping: the key is the sorted word (or its character-count tuple).

### d. Seen set - dedup, cycle detection, "have I been here"
`O(1)` membership instead of `O(n)` scans.

### e. Prefix sum + map
"Count subarrays summing to k": store how many times each prefix sum has
occurred; at index `i`, the answer is `count[prefix - k]`. Turns `O(n^2)` into
`O(n)`.

### f. Index map
Store `value -> index` for later positional questions (longest substring
without repeats, first unique character).

---

## 7. Hashing vs sorting

| | Hashing | Sorting |
|---|---------|---------|
| lookup | `O(1)` average | `O(log n)` |
| build | `O(n)` | `O(n log n)` |
| ordered output | no | yes |
| range queries | no | yes |
| worst case | `O(n)` | `O(n log n)` |
| memory | higher | lower |

Use hashing for membership and counting; sorting when you need order or
ranges.

---

## 8. Complexity of what is implemented here

| Function / method | Average | Worst |
|-------------------|---------|-------|
| `HashMap.put/get/remove` | `O(1)` | `O(n)` |
| `HashMap._resize` | `O(n)`, amortised `O(1)` per insert | `O(n)` |
| `two_sum` | `O(n)` | `O(n)` |
| `group_anagrams` | `O(n * k)` | - |
| `subarray_sum_equals_k` | `O(n)` | - |
| `longest_consecutive` | `O(n)` | - |
| `LRUCache.get/put` | `O(1)` | `O(1)` |

## Run the code

```bash
python hashing.py
```
