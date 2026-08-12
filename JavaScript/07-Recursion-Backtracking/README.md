# 07 - Recursion and Backtracking (JavaScript)

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

```js
function factorial(n) {
  if (n <= 1) return 1;             // BASE CASE
  return n * factorial(n - 1);      // RECURSIVE CASE, strictly smaller
}
```

Three mandatory ingredients: a base case, guaranteed progress toward it, and
correct use of the sub-result. Miss any and you get
`RangeError: Maximum call stack size exceeded`.

---

## 2. Node's stack limit

Node overflows at roughly **10,000-15,000 frames** (V8 default, about 1 MB).
That is far shallower than most people expect:

- Recursing over a 10^5-element linked list: **crashes**.
- Recursion depth `log n` or over a balanced tree: fine.

There is no tail-call optimisation in V8 (the ES6 spec has it; no major engine
shipped it). Deep recursion must become a loop with an explicit array stack.

You can raise the limit with `node --stack-size=10000`, but that is a bandaid,
not a solution.

---

## 3. Recursion trees

| Recursion | Complexity |
|-----------|------------|
| one call on `n-1` | `O(n)` |
| one call on `n/2` | `O(log n)` |
| two calls on `n-1` | `O(2^n)` |
| two calls on `n/2` + `O(n)` work | `O(n log n)` |
| n branches, depth n | `O(n!)` |

Naive Fibonacci is `O(2^n)`. Memoising with a `Map` makes it `O(n)` - that
transformation is exactly what chapter 15 generalises.

```js
const memo = new Map();
function fib(n) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);
  return result;
}
```

---

## 4. The backtracking template

```js
function backtrack(path, state) {
  if (isSolution(path)) {
    results.push([...path]);       // SPREAD to copy - path keeps mutating
    return;
  }
  for (const choice of choices(state)) {
    if (!isValid(choice, state)) continue;   // PRUNE
    path.push(choice);             // 1. choose
    backtrack(path, state);        // 2. explore
    path.pop();                    // 3. un-choose
  }
}
```

| Problem | Choices | Prune when |
|---------|---------|-----------|
| Subsets | take / skip index i | never |
| Permutations | any unused element | `used[i]` |
| Combination sum | candidates from index i | remainder < candidate |
| N-Queens | any column in this row | column or diagonal attacked |
| Word search | 4 neighbours | off grid, wrong letter, visited |

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

- `results.push(path)` without spreading - every result aliases the same array
  and ends up empty.
- Forgetting `path.pop()`, so state leaks into sibling branches.
- Closures over a loop variable declared with `var` (use `let`/`const`).
- Recursing on `nums.slice(1)` - an `O(n)` copy per node. Pass an index.
- `Set` mutation without a matching `delete` in the undo step.

---

## 7. Run the code

```bash
node recursion.js
```

---

[<- 06 Stack & Queue](../06-Stack-Queue/) · [All topics](../../README.md) · [08 Searching ->](../08-Searching/)
