# 02 - Time and Space Complexity (JavaScript)

> JIT-compiled JavaScript is fast until you hand it a shape it cannot optimise.
> Asymptotics still decide the outcome.

**At a glance**

| | |
|---|---|
| **What it is** | How to predict runtime **before** writing the code. |
| **Must know** | Drop constants, keep the dominant term. A recursion tree costs `branches^depth`. |
| **The one trap** | Counting only the data and forgetting the call stack and the copies. |
| **Reach for it when** | Every time you read a constraint line - `n <= 10^5` already names the algorithm. |

---

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

## Empirical analysis - checking the theory against a clock

Big-O is a prediction. Measuring is how you find out whether it was the right
one - and, just as often, that the constant factor mattered more than the
exponent.

### Count operations, not milliseconds

Wall-clock time depends on the machine, the compiler, the JIT's warm-up state
and whatever else is running. An **operation count** does not. So the counted
version of each algorithm is what the assertions check; the timings are printed
alongside as context.

That distinction is worth internalising: this chapter *asserts*
`insertion sort on reversed input = n(n-1)/2 comparisons, exactly` and merely
*reports* "it took 200ms".

### Reading the class off the data

Double `n` and watch the ratio:

| Ratio as `n` doubles | Class |
|---|---|
| ~1 | `O(1)` or `O(log n)` |
| ~2 | `O(n)` |
| just over 2, creeping up | `O(n log n)` |
| ~4 | `O(n^2)` |
| ~8 | `O(n^3)` |

The demo prints exactly this, and asserts it: insertion sort's counts grow
`x4.01, x4.00, x4.00`, merge sort's `x2.25, x2.22, x2.20`. You can identify a
complexity class from measurements alone, without seeing the code.

### Timing methodology

Two things that separate a benchmark from a guess:

**Take the MINIMUM, never the mean.** Timing noise is one-sided - a scheduler
interrupt or a GC pause can only make a run *slower*, never faster. The minimum
of several runs is the closest estimate of the true cost; averaging just folds
the noise in.

**Use a monotonic high-resolution clock** - `perf_counter`, `steady_clock`,
`performance.now()`, `time.Now`. A wall clock can be adjusted mid-measurement,
and millisecond resolution is far too coarse for anything that finishes quickly.

> **The adaptive best case is worth seeing measured.** Insertion sort is `O(n^2)`
> on reversed input and `O(n)` on already-sorted input - exactly 1999
> comparisons for 2000 sorted elements. That is precisely why real hybrid sorts
> (Timsort, introsort) fall back to it on short or nearly-ordered runs.

---

## Run the code

```bash
node complexity.js
```

It counts operations rather than timing, so the growth curves are exact.

---

[<- 01 Basics & Syntax](../01-Basics-and-Syntax/) · [All topics](../../README.md) · [03 Arrays ->](../03-Arrays/)
