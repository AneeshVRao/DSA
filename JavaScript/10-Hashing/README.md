# 10 - Hashing (JavaScript)

> JS gives you three hash-ish containers - objects, `Map` and `Set` - and they
> are not interchangeable.

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
key --hash--> integer --% capacity--> bucket index
```

One hash plus one index: `O(1)` average insert, lookup and delete. V8
implements `Map` and `Set` with hash tables and `Object` with hidden classes
plus a dictionary fallback.

---

## 2. Object vs Map

| | `{}` object | `Map` |
|---|-------------|-------|
| Key types | strings and symbols only | **anything**, including objects |
| Key coercion | `obj[1]` and `obj["1"]` are the same slot | `1` and `"1"` are distinct |
| Iteration order | integer-like keys first, then insertion order | insertion order, always |
| Size | `Object.keys(o).length` - `O(n)` | `map.size` - `O(1)` |
| Prototype pollution | `obj["toString"]` exists by default | no prototype |
| Frequent add/delete | deoptimises into dictionary mode | designed for it |

**Use `Map` for dynamic keys.** Use an object literal for fixed-shape records
and JSON.

```js
const m = new Map();
m.set("a", 1).set("b", 2);        // set returns the map: chainable
m.get("a");                       // 1, or undefined
m.has("a");                       // true
m.delete("a");
for (const [k, v] of m) { }       // insertion order
[...m.keys()], [...m.values()], [...m.entries()];
```

> `Object.create(null)` gives a prototype-less object if you must use one as a
> dictionary - otherwise a key named `"constructor"` or `"__proto__"` will
> surprise you.

---

## 3. Set

```js
const s = new Set([1, 2, 2]);     // Set(2) {1, 2}
s.has(1);                         // O(1) - unlike arr.includes, which is O(n)
s.add(3); s.delete(1); s.size;
[...new Set(arr)];                // dedupe, first-seen order preserved
```

Equality is SameValueZero: `NaN` equals `NaN` (unlike `===`), but `0` and
`-0` are the same, and objects compare by reference.

---

## 4. Costs

| Operation | Average | Worst |
|-----------|---------|-------|
| `map.get/set/delete` | `O(1)` | `O(n)` |
| `set.has/add/delete` | `O(1)` | `O(n)` |
| `arr.includes/indexOf` | `O(n)` | `O(n)` |
| `Object.keys(obj)` | `O(n)` | `O(n)` |

The classic accidental `O(n^2)`:

```js
for (const x of a) if (b.includes(x)) ...     // O(n * m)
const set = new Set(b);
for (const x of a) if (set.has(x)) ...        // O(n + m)
```

---

## 5. Object keys are stringified

```js
const obj = {};
obj[1] = "a";
obj["1"] = "b";
obj[1];              // "b" - same slot!

const map = new Map();
map.set(1, "a").set("1", "b");
map.get(1);          // "a" - different keys
```

For compound keys with a plain object you must serialise: `${r},${c}` or
`r * cols + c`. A `Map` can key on the numeric encoding directly - but note
that a `Map` still cannot key on an *array literal*, because two arrays with
the same contents are different objects.

---

## 6. The patterns

- **Frequency map** - `Map` of counts in one pass.
- **Complement lookup** - two sum: "have I seen `target - x`?"
- **Grouping by a computed key** - anagrams.
- **Seen set** - dedup, membership, cycle detection.
- **Prefix sum + map** - count subarrays summing to k in `O(n)`.
- **Index map** - value to position.

---

## 7. Complexity of what is implemented here

| Function / method | Average | Worst |
|-------------------|---------|-------|
| `HashMap.set/get/delete` | `O(1)` | `O(n)` |
| `HashMap.#resize` | `O(n)`, amortised `O(1)` per insert | `O(n)` |
| `twoSum` | `O(n)` | `O(n)` |
| `groupAnagrams` | `O(n * k log k)` | - |
| `subarraySumEqualsK` | `O(n)` | - |
| `longestConsecutive` | `O(n)` | - |
| `LRUCache.get/put` | `O(1)` | `O(1)` |

## Run the code

```bash
node hashing.js
```

---

[<- 09 Sorting](../09-Sorting/) · [All topics](../../README.md) · [11 Trees ->](../11-Trees/)
