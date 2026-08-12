# 01 - Basics and Syntax (JavaScript)

> Modern ES6+ JavaScript, aimed squarely at data structures and algorithms.

## Why this chapter exists

JavaScript has no built-in heap, no built-in sorted map, and a `sort()` that
compares numbers **as strings** by default. Knowing which primitives exist and
which you must build is half the battle.

---

## 1. Declarations

```js
const x = 5;      // cannot be REASSIGNED (contents of objects can still change)
let i = 0;        // block scoped, reassignable
// var                 -> function scoped and hoisted. Do not use.
```

Default to `const`; downgrade to `let` only when you actually reassign.

---

## 2. Arrays are your workhorse

```js
const a = [3, 1, 2];
a.push(4);            // O(1) amortised, append
a.pop();              // O(1), remove last
a.shift();            // O(n) - removes first, reindexes everything
a.unshift(0);         // O(n) - inserts first
a.slice(1, 3);        // COPY of [1, 3)      - non-destructive
a.splice(1, 2);       // REMOVES 2 items at index 1 - destructive
```

> `shift`/`unshift` are `O(n)`. For a queue, keep a `head` pointer into the
> array and move it, or use a linked list. Never `shift()` in a hot loop.

### The sort trap

```js
[10, 9, 1].sort();                 // [1, 10, 9]   <- lexicographic!
[10, 9, 1].sort((a, b) => a - b);  // [1, 9, 10]   <- always pass a comparator
```

`sort` mutates in place and returns the same array. Copy first with
`[...a].sort(...)` if you need the original.

---

## 3. Iteration and functional methods

```js
for (const x of arr) { }             // values
for (const [i, x] of arr.entries()) {}  // index + value
for (const k in obj) { }             // KEYS of an object (avoid on arrays)

arr.map(x => x * 2);                 // transform
arr.filter(x => x > 0);              // select
arr.reduce((acc, x) => acc + x, 0);  // fold
arr.some(x => x < 0);                // any
arr.every(x => x < 0);               // all
arr.find(x => x > 2);                // first match, or undefined
arr.findIndex(x => x > 2);           // index, or -1
```

Use `for` loops in hot paths (they avoid a function call per element), and
functional methods when clarity wins.

---

## 4. Map and Set beat plain objects

| Need | Use | Why |
|------|-----|-----|
| frequency map with any key type | `Map` | keys keep type and insertion order |
| membership / dedup | `Set` | `O(1)` `has`, `[...new Set(a)]` dedups |
| string-keyed record | object literal | JSON-friendly |

```js
const seen = new Set([1, 2, 2]);      // Set(2) {1, 2}
seen.has(1);                          // O(1)

const freq = new Map();
for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
for (const [key, count] of freq) { }
```

> Object keys are coerced to strings: `obj[1]` and `obj["1"]` are the same slot.
> `Map` does not do that.

---

## 5. Destructuring, spread, defaults

```js
const [first, ...rest] = [1, 2, 3];
const { val, next = null } = node;
[a, b] = [b, a];                       // swap
const copy = [...arr];                 // shallow copy
const merged = { ...base, extra: 1 };
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
```

> **Trap:** `new Array(rows).fill([])` puts the *same* array in every slot.
> Use `Array.from` with a factory, as above.

---

## 6. Classes

```js
class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
  toString() { return `Node(${this.val})`; }
}

class Stack {
  #items = [];                 // truly private field
  push(x) { this.#items.push(x); return this; }
  pop()   { return this.#items.pop(); }
  get size() { return this.#items.length; }
}
```

---

## 7. Numbers

```js
Math.floor(7 / 2);        // 3   - / always produces a float
(7 / 2) | 0;              // 3   - fast truncation, 32-bit only
Number.MAX_SAFE_INTEGER;  // 2^53 - 1 = 9007199254740991
10n ** 20n;               // BigInt for exact big arithmetic
0.1 + 0.2 === 0.3;        // false - floats
```

> Bitwise operators coerce to **32-bit signed** integers. `1 << 31` is negative.

---

## 8. Gotchas that cost points

| Trap | Fix |
|------|-----|
| `sort()` without a comparator | always pass `(a, b) => a - b` |
| `shift()` inside a loop | head pointer, or `deque`-style structure |
| `==` does type coercion | always use `===` and `!==` |
| `NaN !== NaN` | test with `Number.isNaN(x)` |
| No built-in priority queue | implement a binary heap (chapter 13) |

---

## Run the code

```bash
node basics.js
```
