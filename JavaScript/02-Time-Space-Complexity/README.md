# 02 - Time and Space Complexity (JavaScript)

> JIT-compiled JavaScript is fast until you hand it a shape it cannot optimise.
> Asymptotics still decide the outcome.

## 1. What Big-O actually says

Big-O describes how cost **grows** with input size, ignoring constants and
lower-order terms. `3n + 100` is `O(n)`: double the input, roughly double the
work.

- **O** - worst-case upper bound (what we quote).
- **Omega** - best case. **Theta** - tight bound.

Sequential blocks add. Nested blocks multiply.

---

## 2. The complexity ladder

| Class | n = 10 | n = 1,000 | n = 10^6 | Typical source |
|-------|--------|-----------|----------|----------------|
| `O(1)` | 1 | 1 | 1 | array index, `Map.get` |
| `O(log n)` | 3 | 10 | 20 | binary search |
| `O(n)` | 10 | 10^3 | 10^6 | one pass, `map`/`filter` |
| `O(n log n)` | 33 | 10^4 | 2*10^7 | `Array.prototype.sort` |
| `O(n^2)` | 100 | 10^6 | 10^12 | nested loops, `includes` in a loop |
| `O(2^n)` | 1024 | dead | dead | naive subsets |
| `O(n!)` | 3.6*10^6 | dead | dead | permutations |

Rough budget in Node: about **10^7 - 10^8** simple operations per second.

---

## 3. JavaScript methods and their real cost

| Call | Cost | Note |
|------|------|------|
| `push` / `pop` | `O(1)` amortised | ends of the array are cheap |
| `shift` / `unshift` | **`O(n)`** | every element is reindexed |
| `splice(i, k)` | `O(n)` | shifts the tail |
| `slice(i, j)` | `O(j - i)` | allocates a copy |
| `includes` / `indexOf` | **`O(n)`** | use a `Set` instead |
| `concat` / spread `[...a, ...b]` | `O(n + m)` | allocates |
| `sort` | `O(n log n)` | mutates in place |
| `Set.has` / `Map.get` | `O(1)` average | the fix for the two above |
| `delete obj[key]` | `O(1)` but deoptimises | prefer `Map` for dynamic keys |

> **The classic accidental `O(n^2)`:**
>
> ```js
> for (const x of a) if (b.includes(x)) out.push(x);   // O(n * m)
> const set = new Set(b);
> for (const x of a) if (set.has(x)) out.push(x);      // O(n + m)
> ```

Another one: `arr.shift()` inside a `while` loop to drain a queue. Use a head
index instead.

---

## 4. Recursion

For `T(n) = a*T(n/b) + f(n)`: merge sort is `2T(n/2) + O(n) = O(n log n)`;
binary search is `T(n/2) + O(1) = O(log n)`; naive Fibonacci branches twice with
depth n, so `O(2^n)`.

Every pending call is a stack frame. Node's default stack overflows at roughly
10,000-15,000 frames, so deep recursion over 10^5 elements **must** be
rewritten iteratively (or with an explicit stack array).

---

## 5. Amortised analysis

`push` occasionally triggers a resize and copy (`O(n)`), but capacity grows
geometrically, so `n` pushes total `O(n)` - **amortised `O(1)`**.

---

## 6. Space complexity

Count extra memory beyond the input:

| Pattern | Space |
|---------|-------|
| two pointers, a few counters | `O(1)` |
| `new Set(nums)` | `O(n)` |
| `map`/`filter`/`slice` chains | `O(n)` per intermediate array |
| memo object for n states | `O(n)` |
| recursion of depth d | `O(d)` stack |

Chaining `nums.filter(...).map(...).slice(...)` allocates three arrays.
Readable and usually fine - but in a hot path, fuse it into one loop.

---

## 7. Numbers are a hidden cost

- All numbers are IEEE-754 doubles. Integers are exact only up to
  `Number.MAX_SAFE_INTEGER` (2^53 - 1).
- Bitwise operators truncate to **32-bit signed** ints - `1 << 31` is negative.
- `BigInt` is exact but noticeably slower; use it only when you must.

---

## 8. Choosing a target from the constraints

| n up to | Intended complexity |
|---------|--------------------|
| 10^18 | `O(log n)` / `O(1)` |
| 10^6 | `O(n)` or `O(n log n)` |
| 10^4 | `O(n^2)` |
| 500 | `O(n^3)` |
| 20-25 | `O(2^n)` |
| 10-12 | `O(n!)` |

---

## Run the code

```bash
node complexity.js
```

It counts operations rather than timing, so the growth curves are exact.
