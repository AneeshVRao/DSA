# 02 - Time and Space Complexity (C++)

> C++ buys you a constant factor of roughly 50x over Python. It does not buy
> you a better asymptotic class - and the judge tests the class.

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

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall complexity.cpp -o complexity && ./complexity
```

The program counts operations rather than timing, so the growth is exact and
identical on every machine.
