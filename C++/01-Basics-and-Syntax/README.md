# 01 - Basics and Syntax (C++)

> C++ is the fastest language for competitive programming and the most
> unforgiving one. This chapter is the safety rail.

**At a glance**

| | |
|---|---|
| **What it is** | The container costs and idioms every later chapter quietly assumes. |
| **Must know** | Index `O(1)`, insert-at-front `O(n)`, hash lookup `O(1)` average, sort `O(n log n)`. |
| **The one trap** | Reaching for a list where a hash set was needed - it turns `O(n)` into `O(n^2)`. |
| **Reach for it when** | Before anything else. Every later chapter is built on these costs. |

---

## Why this chapter exists

C++ gives you raw memory access *and* a world-class standard library. DSA work
means knowing which containers exist, what they cost, and which C++ footguns
(overflow, uninitialised memory, integer division) silently produce wrong
answers instead of crashes.

---

## 1. The competitive-programming skeleton

```cpp
#include <bits/stdc++.h>   // GCC-only convenience header; pulls in all of STL
using namespace std;

int main() {
    ios::sync_with_stdio(false);   // decouple C and C++ streams
    cin.tie(nullptr);              // do not flush cout before every cin
    // ... solve ...
    return 0;
}
```

Those two lines in `main` routinely turn a TLE into an accepted solution when
reading 10^6 integers. In production code, include real headers
(`<vector>`, `<string>`, ...) instead of `bits/stdc++.h`.

---

## 2. Types and the overflow trap

| Type | Bits | Range (approx) |
|------|------|----------------|
| `int` | 32 | +/- 2.1 * 10^9 |
| `long long` | 64 | +/- 9.2 * 10^18 |
| `double` | 64 | ~15 significant digits |

```cpp
int a = 100000, b = 100000;
long long bad  = a * b;              // OVERFLOW: multiplied as int, then widened
long long good = 1LL * a * b;        // promote BEFORE multiplying
```

> If any intermediate value can exceed 2 * 10^9, use `long long` everywhere.
> Integer division truncates toward zero: `-7 / 2 == -3`, and `-7 % 2 == -1`.

---

## 3. The containers that matter

| Container | Backing | Lookup | Insert | Notes |
|-----------|---------|--------|--------|-------|
| `vector<T>` | dynamic array | `O(1)` index | `O(1)` amortised push_back | your default |
| `array<T,N>` | fixed stack array | `O(1)` | n/a | size known at compile time |
| `string` | dynamic char array | `O(1)` | `O(1)` amortised | has `substr`, `find` |
| `deque<T>` | chunked array | `O(1)` | `O(1)` both ends | sliding windows |
| `list<T>` | doubly linked | `O(n)` | `O(1)` at iterator | rarely worth it |
| `map<K,V>` | red-black tree | `O(log n)` | `O(log n)` | **sorted** keys |
| `unordered_map<K,V>` | hash table | `O(1)` avg | `O(1)` avg | no order, worst case `O(n)` |
| `set` / `unordered_set` | same as maps | same | same | membership, dedup |
| `priority_queue<T>` | binary heap | `O(1)` top | `O(log n)` | **max**-heap by default |

```cpp
vector<int> v{3, 1, 2};
v.push_back(4);
sort(v.begin(), v.end());            // or sort(v) with C++20 ranges
vector<vector<int>> grid(rows, vector<int>(cols, 0));   // 2-D, zero filled

map<string,int> ordered;             // iterate in sorted key order
unordered_map<string,int> fast;      // faster, unordered
priority_queue<int, vector<int>, greater<int>> minHeap;  // min-heap
```

---

## 4. References vs copies

This is the #1 accidental `O(n^2)`:

```cpp
for (auto row : grid)  { ... }   // COPIES every row
for (auto& row : grid) { ... }   // no copy, can mutate
for (const auto& row : grid) { ... }  // no copy, read only  <- prefer this
```

Pass big containers as `const vector<int>&`, never by value.

---

## 5. Algorithms you should never hand-roll

```cpp
sort(v.begin(), v.end());
sort(v.begin(), v.end(), [](int a, int b){ return a > b; });   // descending
reverse(v.begin(), v.end());
bool found = binary_search(v.begin(), v.end(), x);   // v must be sorted
auto it = lower_bound(v.begin(), v.end(), x);        // first >= x
int idx = it - v.begin();
int mx = *max_element(v.begin(), v.end());
long long total = accumulate(v.begin(), v.end(), 0LL);   // 0LL avoids overflow
v.erase(unique(v.begin(), v.end()), v.end());        // dedup a SORTED vector
```

---

## 6. Structs, classes and modern syntax

```cpp
struct Node {                       // struct = class with public default
    int val;
    Node* next = nullptr;
    explicit Node(int v) : val(v) {}    // member init list, not assignment
};

auto square = [](int x) { return x * x; };     // lambda
auto [q, r] = div(7, 2);                       // structured bindings (C++17)
for (auto& [key, count] : freq) { ... }        // iterate a map cleanly
```

Prefer `nullptr` over `NULL`, `using` over `typedef`, and smart pointers
(`unique_ptr`) over `new`/`delete` in real code. In contest code raw pointers
are fine because the process exits immediately.

---

## 7. Gotchas that cost points

| Trap | Fix |
|------|-----|
| Uninitialised locals hold garbage | always initialise: `int x = 0;` |
| `v[i]` does **no** bounds checking | use `v.at(i)` while debugging |
| Iterator invalidated after `push_back` | re-acquire iterators after growth |
| Comparing `size()` (unsigned) with a negative `int` | cast: `(int)v.size()` |
| `endl` flushes every time | use `"\n"` in loops |

---

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall basics.cpp -o basics && ./basics
```

---

[All topics](../../README.md) · [02 Complexity ->](../02-Time-Space-Complexity/)
