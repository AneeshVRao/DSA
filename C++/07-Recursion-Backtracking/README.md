# 07 - Recursion and Backtracking (C++)

> Recursion solves a smaller copy of the same problem. Backtracking is
> recursion that undoes its choices before trying the next one.

**At a glance**

| | |
|---|---|
| **What it is** | Solve by shrinking. Backtracking adds choose -> explore -> **un-choose**. |
| **Must know** | Every recursion needs a base case that is actually reachable from the input. |
| **The one trap** | Forgetting to un-choose, so state leaks from one branch into the next. |
| **Reach for it when** | "All permutations / subsets / combinations", grid search, parsing. |

---

## 1. Anatomy

```cpp
long long factorial(int n) {
    if (n <= 1) return 1;              // BASE CASE
    return n * factorial(n - 1);       // RECURSIVE CASE, strictly smaller
}
```

Three mandatory ingredients: a base case, guaranteed progress toward it, and
correct combination of the sub-result. Miss any and you get a stack overflow -
which in C++ is a segfault, not an exception.

---

## 2. The stack is a hard limit

Typical stack size is 1-8 MB. Each frame holds parameters, locals and the
return address, so a frame with a `vector` by value can be 50+ bytes.

- Recursion depth 10^5 with small frames: usually fine.
- Depth 10^6: expect a crash. Rewrite iteratively with an explicit
  `vector<State>` stack.

**Pass by const reference, mutate shared state**, and prefer indices over
sub-vectors:

```cpp
void backtrack(const vector<int>& nums, int start, vector<int>& path);  // good
void backtrack(vector<int> nums, vector<int> path);                     // copies
```

GCC may turn simple tail recursion into a loop at `-O2`, but never rely on it.

---

## 3. Recursion trees

| Recursion | Complexity |
|-----------|------------|
| one call on `n-1` | `O(n)` |
| one call on `n/2` | `O(log n)` |
| two calls on `n-1` | `O(2^n)` |
| two calls on `n/2` + `O(n)` work | `O(n log n)` |
| n branches, depth n | `O(n!)` |

Naive Fibonacci is `O(2^n)`; memoising with a `vector<long long>` makes it
`O(n)`. That transformation is exactly chapter 15.

---

## 4. The backtracking template

```cpp
void backtrack(State& state, vector<Result>& results) {
    if (isSolution(state)) { results.push_back(state.snapshot()); return; }
    for (auto& choice : choices(state)) {
        if (!isValid(choice, state)) continue;   // PRUNE
        apply(choice, state);        // 1. choose
        backtrack(state, results);   // 2. explore
        undo(choice, state);         // 3. un-choose
    }
}
```

| Problem | Choices | Prune when |
|---------|---------|-----------|
| Subsets | take / skip index i | never |
| Permutations | any unused element | `used[i]` |
| Combination sum | candidates from index i | remainder < candidate |
| N-Queens | any column in this row | column or diagonal attacked |
| Word search | 4 neighbours | off board, wrong letter, visited |

Pruning is the difference between `8^8` raw placements and ~2000 explored
nodes in 8-Queens.

---

## 5. Complexity of the classics

| Problem | Time | Space (excl. output) |
|---------|------|----------------------|
| Subsets | `O(n * 2^n)` | `O(n)` |
| Permutations | `O(n * n!)` | `O(n)` |
| Combination sum | exponential in `target/min` | `O(target/min)` |
| N-Queens | `O(n!)` with pruning | `O(n)` |
| Tower of Hanoi | `O(2^n)` | `O(n)` |
| Generate parentheses | Catalan(n) | `O(n)` |

---

## 6. Traps

- Passing `vector` by value into the recursion - an `O(n)` copy per node.
- Forgetting to undo *every* piece of state (column set **and** both diagonals).
- Pushing a reference to the mutating path instead of a copy.
- Integer overflow in `factorial` past 20 - use `long long`, and even that caps
  at 20!.
- Infinite recursion from a base case that is never exactly hit (e.g. `n == 0`
  when n can go negative).

---

## 7. Compile and run

```bash
g++ -std=c++17 -O2 -Wall recursion.cpp -o recursion && ./recursion
```

---

[<- 06 Stack & Queue](../06-Stack-Queue/) · [All topics](../../README.md) · [08 Searching ->](../08-Searching/)
