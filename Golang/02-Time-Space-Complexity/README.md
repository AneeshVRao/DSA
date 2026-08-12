# 02 - Time and Space Complexity (Go)

> Go compiles to native code, so its constant factor is close to C++. The
> asymptotics are still what decides whether you pass.

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
| `O(1)` | 1 | 1 | 1 | slice index, map lookup |
| `O(log n)` | 3 | 10 | 20 | binary search, heap ops |
| `O(n)` | 10 | 10^3 | 10^6 | one `range` pass |
| `O(n log n)` | 33 | 10^4 | 2*10^7 | `sort.Slice` |
| `O(n^2)` | 100 | 10^6 | 10^12 | nested loops |
| `O(2^n)` | 1024 | dead | dead | subset enumeration |
| `O(n!)` | 3.6*10^6 | dead | dead | permutations |

Budget: roughly **10^8** simple operations per second.

---

## 3. Go-specific costs

| Looks free | Actually |
|------------|----------|
| `append` without `make(..., 0, n)` | `O(log n)` reallocations, each copying |
| passing a big **array** `[1000]int` | copied by value; slices are not |
| `s = s[1:]` to pop the front | `O(1)`, but the original array stays alive (leak) |
| `for i, v := range bigStructs` | `v` is a **copy** of each element |
| string `+=` in a loop | `O(n^2)`; use `strings.Builder` |
| `map` lookup | `O(1)` average, with a real hashing constant |
| `interface{}` boxing | allocation + pointer chase |

`copy(dst, src)` is the fast, explicit way to duplicate a slice.

### The reallocation you can avoid

```go
out := make([]int, 0, len(nums))   // one allocation, zero copies
for _, x := range nums {
    out = append(out, x*2)
}
```

Without the capacity hint, `append` grows the backing array about
`log2(n)` times, copying everything each time - still amortised `O(1)`, but
with a fatter constant.

---

## 4. Recursion

For `T(n) = a*T(n/b) + f(n)`: merge sort `2T(n/2) + O(n) = O(n log n)`;
binary search `T(n/2) + O(1) = O(log n)`; naive Fibonacci `O(2^n)`.

Go grows goroutine stacks dynamically (starting at 8 KB, up to 1 GB by
default), so deep recursion is far safer here than in Node or Python - but a
runaway recursion still ends in `stack overflow`.

---

## 5. Amortised analysis

`append` occasionally reallocates and copies, but capacity grows geometrically,
so `n` appends total `O(n)` - **amortised `O(1)`**.

---

## 6. Space complexity

Count extra memory beyond the input:

| Pattern | Space |
|---------|-------|
| two pointers / a few counters | `O(1)` |
| `map[int]struct{}` over n items | `O(n)` (and `struct{}` costs 0 bytes per value) |
| 2-D DP `[][]int` | `O(n*m)` |
| recursion of depth d | `O(d)` stack |

> **Go-specific leak:** a small sub-slice keeps the *entire* backing array
> alive. If you slice 10 elements out of a 10^7 element array and hold onto
> them, all 10^7 stay in memory. `copy` into a fresh slice to release it.

---

## 7. Measuring for real

Go ships a benchmark tool - no third-party library needed:

```go
func BenchmarkFoo(b *testing.B) {
    for i := 0; i < b.N; i++ { Foo(input) }
}
```

```bash
go test -bench=. -benchmem
```

`-benchmem` reports allocations per operation, which is usually the constant
factor you are hunting.

---

## 8. Choosing a target from the constraints

| n up to | Intended complexity |
|---------|--------------------|
| 10^18 | `O(log n)` / `O(1)` |
| 10^7 - 10^8 | `O(n)` |
| 10^5 - 10^6 | `O(n log n)` |
| 5,000 | `O(n^2)` |
| 500 | `O(n^3)` |
| 20-25 | `O(2^n)` |
| 10-12 | `O(n!)` |

---

## Run the code

```bash
go run complexity.go
```

---

[<- 01 Basics & Syntax](../01-Basics-and-Syntax/) · [All topics](../../README.md) · [03 Arrays ->](../03-Arrays/)
