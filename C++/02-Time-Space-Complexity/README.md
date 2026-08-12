# 02 - Time and Space Complexity (C++)

> C++ buys you a constant factor of roughly 50x over Python. It does not buy
> you a better asymptotic class - and the judge tests the class.

**At a glance**

| | |
|---|---|
| **What it is** | How to predict runtime **before** writing the code. |
| **Must know** | Drop constants, keep the dominant term. A recursion tree costs `branches^depth`. |
| **The one trap** | Counting only the data and forgetting the call stack and the copies. |
| **Reach for it when** | Every time you read a constraint line - `n <= 10^5` already names the algorithm. |

---

## 1. What Big-O actually says

Big-O describes how cost **grows** with input size, dropping constants and
lower-order terms. `3n + 100` is `O(n)`: double `n`, roughly double the work.

- **O** - worst-case upper bound (what we quote).
- **Omega** - best case. **Theta** - tight bound.

Sequential work adds; nested work multiplies.

---

## 2. The complexity ladder

| Class | n = 10 | n = 1,000 | n = 10^6 | Typical source |
|-------|--------|-----------|----------|----------------|
| `O(1)` | 1 | 1 | 1 | array index, hash lookup |
| `O(log n)` | 3 | 10 | 20 | binary search, `set` insert |
| `O(n)` | 10 | 10^3 | 10^6 | one pass |
| `O(n log n)` | 33 | 10^4 | 2*10^7 | `sort` |
| `O(n^2)` | 100 | 10^6 | 10^12 | nested loops |
| `O(2^n)` | 1024 | dead | dead | subset enumeration |
| `O(n!)` | 3.6*10^6 | dead | dead | permutations |

---

## 3. The 10^8 rule

A modern judge executes roughly **10^8 simple C++ operations per second**.
Multiply your complexity by the constraint and compare:

| n | `O(n^2)` | Verdict |
|---|----------|---------|
| 10^3 | 10^6 | instant |
| 10^4 | 10^8 | borderline, about 1s |
| 10^5 | 10^10 | TLE, guaranteed |

So `n <= 10^5` means you need `O(n log n)` or better. Read the constraints
first; they tell you the intended solution.

---

## 4. Hidden costs specific to C++

| Looks free | Actually |
|------------|----------|
| `for (auto row : grid)` | **copies** every row - `O(n)` per iteration |
| passing `vector<int> v` by value | full copy on every call |
| `s = s + t` inside a loop | new allocation each time; use `+=` with `reserve` |
| `v.insert(v.begin(), x)` | `O(n)` - shifts everything |
| `map` lookup | `O(log n)`, not `O(1)` - that is `unordered_map` |
| `endl` | flushes the stream every call; use `"\n"` |
| `unordered_map` worst case | `O(n)` per op under adversarial hashing |

Cache locality is a real constant factor: a `vector` scan can be an order of
magnitude faster than a `list` traversal of the same length, even though both
are `O(n)`.

---

## 5. Recursion and the Master Theorem

For `T(n) = a*T(n/b) + f(n)`:

- merge sort: `2T(n/2) + O(n)` -> `O(n log n)`
- binary search: `T(n/2) + O(1)` -> `O(log n)`
- naive Fibonacci: two branches, depth n -> `O(2^n)`

Every pending call frame is memory: recursion of depth `d` costs `O(d)` stack.
Typical stack limits are a few MB, so depth 10^6 with big frames will segfault
where an iterative version would not.

---

## 6. Amortised analysis

`vector::push_back` occasionally reallocates and copies (`O(n)`), but capacity
grows geometrically, so `n` push_backs total `O(n)` - **amortised `O(1)`**.
Calling `reserve(n)` up front removes even those copies.

---

## 7. Space complexity

Count extra memory beyond the input:

| Structure | Space |
|-----------|-------|
| a few scalars / two pointers | `O(1)` |
| `vector<int>` of size n | `O(n)` (4n bytes) |
| `vector<vector<int>>` n x m | `O(n*m)` |
| recursion depth d | `O(d)` stack |

Memory limits are usually 256 MB, which is about 64 million `int`s. A
`bool[10^9]` will not fit; a `bitset<10^9>` (125 MB) will.

---

## 8. Choosing a target from the constraints

| n up to | Intended complexity |
|---------|--------------------|
| 10^18 | `O(log n)` / `O(1)` |
| 10^7 - 10^8 | `O(n)` |
| 10^5 - 10^6 | `O(n log n)` |
| 5,000 | `O(n^2)` |
| 500 | `O(n^3)` |
| 20-25 | `O(2^n)` bitmask |
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

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall complexity.cpp -o complexity && ./complexity
```

The program counts operations rather than timing, so the growth is exact and
identical on every machine.

---

[<- 01 Basics & Syntax](../01-Basics-and-Syntax/) · [All topics](../../README.md) · [03 Arrays ->](../03-Arrays/)
