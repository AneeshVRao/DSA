# 01 - Basics and Syntax (Go)

> Go has a tiny feature set on purpose. That makes it excellent for DSA:
> there is usually exactly one way to write something.

**At a glance**

| | |
|---|---|
| **What it is** | The container costs and idioms every later chapter quietly assumes. |
| **Must know** | Index `O(1)`, insert-at-front `O(n)`, hash lookup `O(1)` average, sort `O(n log n)`. |
| **The one trap** | Reaching for a list where a hash set was needed - it turns `O(n)` into `O(n^2)`. |
| **Reach for it when** | Before anything else. Every later chapter is built on these costs. |

---

## Why this chapter exists

Go gives you slices, maps and goroutines, and almost nothing else. No generics
in the standard containers before 1.18, no built-in heap type (you implement
`heap.Interface`), no exceptions. This chapter covers the handful of rules that
make the rest of the repo readable.

---

## 1. Program shape

```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```

Every folder in this repo is its own `package main` with a `func main`, so you
can run any file directly:

```bash
go run basics.go
```

---

## 2. Declarations

```go
var x int = 5      // explicit
var y int          // zero value: 0 (no uninitialised memory in Go, ever)
z := 5             // short form, inside functions only
const Max = 1 << 20
```

Zero values matter: `0` for numbers, `""` for strings, `nil` for slices, maps,
pointers and interfaces, `false` for bools. A declared-but-unused variable is a
**compile error**, not a warning.

---

## 3. Slices: the one container you must understand

A slice is a 3-word header: `{pointer, len, cap}`. It *views* a backing array.

```go
s := []int{3, 1, 2}
s = append(s, 4)              // may reallocate; ALWAYS reassign the result
n := len(s)                   // O(1)
sub := s[1:3]                 // SHARES memory with s, no copy
buf := make([]int, 0, 100)    // len 0, cap 100 - avoids reallocation
grid := make([][]int, rows)   // 2-D: allocate each row
for i := range grid {
    grid[i] = make([]int, cols)
}
```

> **The classic Go bug:** `sub := s[1:3]; sub[0] = 99` also changes `s[1]`.
> To get an independent copy: `cp := append([]int(nil), s...)` or
> `cp := make([]int, len(s)); copy(cp, s)`.

`append` amortises to `O(1)`; growth roughly doubles capacity.

---

## 4. Maps

```go
m := map[string]int{}
m["a"]++                       // missing key reads as the zero value, so this works
v, ok := m["b"]                // ok is false when absent - the comma-ok idiom
delete(m, "a")
for k, v := range m { }        // ITERATION ORDER IS RANDOMISED by design
```

> Never rely on map order. If you need sorted keys, collect them into a slice
> and `sort.Strings` / `sort.Ints` it.

A `map[T]struct{}` is the idiomatic set - `struct{}` occupies zero bytes.

---

## 5. Structs, methods, pointers

```go
type Node struct {
    Val  int
    Next *Node       // exported fields start with a capital letter
}

func (n *Node) Push(v int) {   // pointer receiver: can mutate
    n.Next = &Node{Val: v}
}

func (n Node) String() string { // value receiver: gets a copy
    return fmt.Sprintf("Node(%d)", n.Val)
}
```

Rule of thumb: use a pointer receiver if the method mutates, or the struct is
big. Be consistent within a type.

---

## 6. Control flow

```go
for i := 0; i < n; i++ { }        // the only loop keyword
for i, v := range slice { }       // index, value
for k := range m { }              // keys only
for { break }                     // infinite

if v, ok := m[k]; ok { }          // statement-scoped variable

switch {                          // no fallthrough by default
case x > 10: ...
default: ...
}
```

> **Pre-Go 1.22 trap:** the loop variable was reused across iterations, so
> closures captured the last value. Go 1.22+ gives each iteration a fresh
> variable. Write for the modern behaviour but recognise the old bug.

---

## 7. Errors, not exceptions

```go
val, err := strconv.Atoi("12")
if err != nil {
    return 0, fmt.Errorf("bad input: %w", err)
}
panic("unreachable")   // reserve panic for genuinely impossible states
```

---

## 8. Standard library for DSA

| Need | Package |
|------|---------|
| sorting | `sort.Ints`, `sort.Slice(s, less)`, `sort.SearchInts` |
| heap / priority queue | `container/heap` (you implement the interface) |
| doubly linked list | `container/list` |
| string building | `strings.Builder` (never `+=` in a loop) |
| min/max/abs on ints | `min`/`max` builtins (Go 1.21+) |
| fast input | `bufio.Scanner` with a bigger buffer |

---

## 9. Gotchas that cost points

| Trap | Fix |
|------|-----|
| Forgetting `s = append(s, x)` | always reassign |
| Sub-slice aliasing | copy explicitly when you need independence |
| Integer division truncates | `7/2 == 3`, `-7/2 == -3` |
| `int` overflow is silent | use `int64` when values exceed 2 * 10^9 |
| Map iteration order is random | sort keys before printing |

---

## Run the code

```bash
go run basics.go
```

---

[All topics](../../README.md) · [02 Complexity ->](../02-Time-Space-Complexity/)
