# 10 - Hashing (Go)

> Go's `map` is a hash table with one deliberate design decision that trips
> everyone up: iteration order is **randomised on purpose**.

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
key --hash--> uint64 --low bits--> bucket
```

`O(1)` average insert, lookup and delete. Go's implementation uses buckets of
8 key/value slots with overflow buckets chained on - a hybrid of chaining and
open addressing that is very cache friendly.

---

## 2. The essentials

```go
m := make(map[string]int)      // or map[string]int{}
m := make(map[string]int, 100) // pre-sized: avoids rehashing during a bulk load

m["a"] = 1
v := m["a"]                    // missing key returns the ZERO VALUE, not an error
v, ok := m["b"]                // comma-ok: ok reports presence
delete(m, "a")
len(m)                         // O(1)

for k, v := range m { }        // ORDER IS RANDOMISED between runs
```

> `m[k]++` works on a missing key because the read yields 0. That is why Go
> frequency counters need no initialisation check.

A `nil` map reads fine (everything is the zero value) but **panics on write**:

```go
var m map[string]int   // nil
_ = m["x"]             // ok: 0
m["x"] = 1             // panic: assignment to entry in nil map
```

---

## 3. Randomised iteration order

Go deliberately randomises `range` order over maps so that code cannot depend
on it. If you need deterministic output, collect and sort the keys:

```go
keys := make([]string, 0, len(m))
for k := range m { keys = append(keys, k) }
sort.Strings(keys)
for _, k := range keys { fmt.Println(k, m[k]) }
```

---

## 4. Sets

Go has no set type. The idiom is a map with a zero-size value:

```go
seen := map[string]struct{}{}
seen["a"] = struct{}{}
_, ok := seen["a"]
```

`struct{}` occupies **0 bytes**, so this costs exactly the keys.
`map[string]bool` is also common and reads slightly better (`if seen[k]`), at
one byte per entry.

---

## 5. Key requirements

Map keys must be **comparable** with `==`:

| Usable as a key | Not usable |
|-----------------|-----------|
| all numeric types, `string`, `bool` | slices |
| pointers, channels | maps |
| interfaces (compared dynamically) | functions |
| **arrays** and structs of comparable types | structs containing any of the above |

Arrays being comparable is genuinely useful: `map[[26]int][]string` groups
anagrams with no string encoding at all. Slices are not comparable, so
`map[[]int]X` will not compile.

> An interface key holding an uncomparable dynamic type panics at runtime, not
> compile time.

---

## 6. The patterns

- **Frequency map** - `m[k]++`, no initialisation needed.
- **Complement lookup** - two sum: "have I seen `target - x`?"
- **Grouping by a computed key** - anagrams keyed by `[26]int`.
- **Seen set** - `map[T]struct{}`.
- **Prefix sum + map** - count subarrays summing to k in `O(n)`.
- **Index map** - value to position.

---

## 7. Complexity of what is implemented here

| Function / method | Average | Worst |
|-------------------|---------|-------|
| `HashMap.Put/Get/Delete` | `O(1)` | `O(n)` |
| `HashMap.resize` | `O(n)`, amortised `O(1)` per insert | `O(n)` |
| `TwoSum` | `O(n)` | `O(n)` |
| `GroupAnagrams` | `O(n * k)` | - |
| `SubarraySumEqualsK` | `O(n)` | - |
| `LongestConsecutive` | `O(n)` | - |
| `LRUCache.Get/Put` | `O(1)` | `O(1)` |

## Run the code

```bash
go run hashing.go
```

---

[<- 09 Sorting](../09-Sorting/) · [All topics](../../README.md) · [11 Trees ->](../11-Trees/)
