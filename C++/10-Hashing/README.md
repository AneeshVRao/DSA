# 10 - Hashing (C++)

> `unordered_map` is `O(1)` average and `O(n)` worst case. Knowing when the
> worst case bites - and when `map` is the better answer - is the chapter.

**At a glance**

| | |
|---|---|
| **What it is** | `O(1)` average lookup, bought with memory. |
| **Must know** | Chaining vs open addressing, load factor, and why rehashing stays amortised `O(1)`. |
| **The one trap** | `O(1)` is an **average**. Bad or adversarial hashes degrade it to `O(n)`. |
| **Reach for it when** | "Have I seen this before", frequency counts, complement lookup, grouping. |

---

## 1. The idea

```
key --hash<K>()--> size_t --% bucket_count--> bucket index
```

One hash computation plus one array index: **`O(1)` average** insert, lookup
and delete.

---

## 2. map vs unordered_map

| | `map` | `unordered_map` |
|---|-------|-----------------|
| Structure | red-black tree | hash table |
| Lookup | `O(log n)` guaranteed | `O(1)` average, `O(n)` worst |
| Order | sorted by key | unspecified |
| Key requirement | `operator<` | `std::hash` + `operator==` |
| Range queries | yes (`lower_bound`) | no |
| Memory | lower | higher |
| Iterator stability | never invalidated by insert | invalidated by rehash |

Use `map` when you need order or range queries, or when worst-case latency
matters. Use `unordered_map` for pure lookup speed.

> On small n (under ~100) `map` frequently **beats** `unordered_map` in
> practice: no hashing, better cache locality.

---

## 3. Collisions, load factor and rehashing

The C++ standard mandates **separate chaining** (`unordered_map` must have
buckets with local iterators), so each bucket is effectively a linked list.

```cpp
m.load_factor();          // size / bucket_count
m.max_load_factor();      // default 1.0
m.bucket_count();
m.reserve(n);             // pre-size to avoid rehashing entirely
m.rehash(n);
```

Exceeding `max_load_factor` triggers a rehash: `O(n)`, all iterators
invalidated (pointers and references to elements stay valid). Calling
`reserve(expected_size)` before a bulk insert is the single easiest speed win.

---

## 4. Custom keys

`std::hash` has no specialisation for `pair` or `vector`, so this does not
compile:

```cpp
unordered_map<pair<int,int>, int> m;   // ERROR: no hash for pair
```

Three ways out:

```cpp
// 1. Encode into a single integer (fastest when the range is known)
unordered_map<long long, int> m;
m[1LL * r * COLS + c] = v;

// 2. Provide a hash functor
struct PairHash {
    size_t operator()(const pair<int,int>& p) const {
        return hash<long long>()(1LL * p.first * 1000003 + p.second);
    }
};
unordered_map<pair<int,int>, int, PairHash> m;

// 3. Use map<pair<int,int>, int> - pair already has operator<
```

> Never combine hashes with plain XOR (`h1 ^ h2`): `(a,b)` and `(b,a)` then
> collide. Use a multiplier, or boost's `hash_combine` formula.

---

## 5. Hash flooding

Competitive judges sometimes include anti-hash tests that force every key into
one bucket, turning `unordered_map` into `O(n)` per operation. The standard
defence is to mix in a random, time-based constant:

```cpp
struct SafeHash {
    static uint64_t splitmix64(uint64_t x) {
        x += 0x9e3779b97f4a7c15ULL;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9ULL;
        x = (x ^ (x >> 27)) * 0x94d049bb133111ebULL;
        return x ^ (x >> 31);
    }
    size_t operator()(uint64_t x) const {
        static const uint64_t SEED =
            chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + SEED);
    }
};
```

---

## 6. The patterns

- **Frequency map** - count in one pass.
- **Complement lookup** - two sum: "have I seen `target - x`?"
- **Grouping by a computed key** - anagrams.
- **Seen set** - dedup, membership, cycle detection.
- **Prefix sum + map** - count subarrays summing to k, in `O(n)`.
- **Index map** - value to position, for later positional questions.

---

## 7. Complexity of what is implemented here

| Function / method | Average | Worst |
|-------------------|---------|-------|
| `HashMap::put/get/remove` | `O(1)` | `O(n)` |
| `HashMap::resize` | `O(n)`, amortised `O(1)` per insert | `O(n)` |
| `twoSum` | `O(n)` | `O(n)` |
| `groupAnagrams` | `O(n * k log k)` | - |
| `subarraySumEqualsK` | `O(n)` | - |
| `longestConsecutive` | `O(n)` | - |
| `LRUCache::get/put` | `O(1)` | `O(1)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall hashing.cpp -o hashing && ./hashing
```

---

[<- 09 Sorting](../09-Sorting/) · [All topics](../../README.md) · [11 Trees ->](../11-Trees/)
