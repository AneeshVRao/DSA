<div align="center">

# DSA — From Zero to Advanced

**One curriculum. Nineteen topics. Four languages. Every line runnable.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](Python/)
[![C++](https://img.shields.io/badge/C%2B%2B-17-00599C?style=flat-square&logo=cplusplus&logoColor=white)](C%2B%2B/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](JavaScript/)
[![Go](https://img.shields.io/badge/Go-1.21%2B-00ADD8?style=flat-square&logo=go&logoColor=white)](Golang/)

[![Topics](https://img.shields.io/badge/topics-20-6f42c1?style=flat-square)](#-topic-index)
[![Implementations](https://img.shields.io/badge/implementations-80-blue?style=flat-square)](#-topic-index)
[![Practice problems](https://img.shields.io/badge/practice%20problems-900%2B-orange?style=flat-square)](#-how-to-use-this-repo)
[![Self-verifying](https://img.shields.io/badge/tests-self--verifying-brightgreen?style=flat-square)](#-how-to-use-this-repo)
[![Stars](https://img.shields.io/github/stars/AneeshVRao/DSA?style=flat-square&color=yellow)](https://github.com/AneeshVRao/DSA/stargazers)

</div>

---

## What this is

A complete data-structures-and-algorithms course that starts at "what is a
list" and ends at lazy-propagated segment trees — written **four times**, once
in each language, in that language's own idioms.

Every topic folder holds three things:

| File | What it is |
|------|-----------|
| `README.md` | The concept from scratch: theory, when to use it, the patterns, and a complexity table |
| `<topic>.py` / `.cpp` / `.js` / `.go` | A from-scratch implementation, heavily commented, that **runs and checks itself** |
| `Problems.md` | 8–16 curated practice problems with a one-line hint and a LeetCode/GfG link |

**Nothing here is pseudocode.** Run any file and it executes an assertion suite
and prints `all checks passed`. Sorting is verified against each language's own
`sort` on 200 random arrays; segment trees and Fenwick trees are cross-checked
against brute force on hundreds of random operations; N-Queens is checked
against the known answer of 92 solutions for n=8.

### Why four languages?

Because the *language* teaches you half the lesson. The same chapter shows you
that `list.pop(0)` is `O(n)` in Python, that `Array.shift()` is the same trap in
JavaScript, that `q = q[1:]` in Go is `O(1)` but leaks the backing array, and
that C++ makes you free the memory yourself. Reading one topic four times is a
genuinely different experience from reading it once.

---

Every chapter README opens with an **At a glance** box — what the topic is, the
one thing you must know, the one trap, and when to reach for it. That is the
part to re-read the night before an interview; the sections below it are the
full notes.

---

## 🗂 Folder tree

```
DSA/
├── Python/                    ├── JavaScript/
│   ├── 01-Basics-and-Syntax/  │   ├── 01-Basics-and-Syntax/
│   │   ├── README.md          │   │   ├── README.md
│   │   ├── basics.py          │   │   ├── basics.js
│   │   └── Problems.md        │   │   └── Problems.md
│   ├── 02-Time-Space-Comp../  │   ├── ...
│   └── ... 20 topics          │   └── package.json
│                              │
├── C++/                       ├── Golang/
│   ├── 01-Basics-and-Syntax/  │   ├── 01-Basics-and-Syntax/
│   └── ... 20 topics          │   ├── ... 20 topics
│                              │   └── go.mod
└── README.md  ← you are here
```

---

## 📚 Topic index

Each row links to that topic's full write-up in each language.

| # | Topic | What you learn | Python | C++ | JS | Go |
|---|-------|----------------|:------:|:---:|:--:|:--:|
| 01 | **Basics & Syntax** | The 20% of the language used in 95% of problems | [→](Python/01-Basics-and-Syntax/) | [→](C%2B%2B/01-Basics-and-Syntax/) | [→](JavaScript/01-Basics-and-Syntax/) | [→](Golang/01-Basics-and-Syntax/) |
| 02 | **Time & Space Complexity** | Big-O by *measuring* operations, not memorising | [→](Python/02-Time-Space-Complexity/) | [→](C%2B%2B/02-Time-Space-Complexity/) | [→](JavaScript/02-Time-Space-Complexity/) | [→](Golang/02-Time-Space-Complexity/) |
| 03 | **Arrays** | Dynamic array from scratch + the 5 core patterns | [→](Python/03-Arrays/) | [→](C%2B%2B/03-Arrays/) | [→](JavaScript/03-Arrays/) | [→](Golang/03-Arrays/) |
| 04 | **Strings** | Palindromes, anagrams, windows, RLE, KMP | [→](Python/04-Strings/) | [→](C%2B%2B/04-Strings/) | [→](JavaScript/04-Strings/) | [→](Golang/04-Strings/) |
| 05 | **Linked List** | Singly + doubly, Floyd's cycle detection, merging | [→](Python/05-Linked-List/) | [→](C%2B%2B/05-Linked-List/) | [→](JavaScript/05-Linked-List/) | [→](Golang/05-Linked-List/) |
| 06 | **Stack & Queue** | Circular buffers, MinStack, monotonic stacks | [→](Python/06-Stack-Queue/) | [→](C%2B%2B/06-Stack-Queue/) | [→](JavaScript/06-Stack-Queue/) | [→](Golang/06-Stack-Queue/) |
| 07 | **Recursion & Backtracking** | choose / explore / un-choose, N-Queens, pruning | [→](Python/07-Recursion-Backtracking/) | [→](C%2B%2B/07-Recursion-Backtracking/) | [→](JavaScript/07-Recursion-Backtracking/) | [→](Golang/07-Recursion-Backtracking/) |
| 08 | **Searching** | Binary search, boundaries, search-on-the-answer | [→](Python/08-Searching/) | [→](C%2B%2B/08-Searching/) | [→](JavaScript/08-Searching/) | [→](Golang/08-Searching/) |
| 09 | **Sorting** | 8 algorithms, stability, quickselect | [→](Python/09-Sorting/) | [→](C%2B%2B/09-Sorting/) | [→](JavaScript/09-Sorting/) | [→](Golang/09-Sorting/) |
| 10 | **Hashing** | Hash map from scratch: chaining, load factor, rehash | [→](Python/10-Hashing/) | [→](C%2B%2B/10-Hashing/) | [→](JavaScript/10-Hashing/) | [→](Golang/10-Hashing/) |
| 11 | **Trees** | 4 traversals (incl. Morris `O(1)`), bottom-up recursion | [→](Python/11-Trees/) | [→](C%2B%2B/11-Trees/) | [→](JavaScript/11-Trees/) | [→](Golang/11-Trees/) |
| 12 | **Binary Search Tree** | 3-case deletion, validation, AVL rotations | [→](Python/12-Binary-Search-Tree/) | [→](C%2B%2B/12-Binary-Search-Tree/) | [→](JavaScript/12-Binary-Search-Tree/) | [→](Golang/12-Binary-Search-Tree/) |
| 13 | **Heaps & Priority Queue** | Binary heap, top-k, merge-k, two-heap median, indexed PQ | [→](Python/13-Heaps-Priority-Queue/) | [→](C%2B%2B/13-Heaps-Priority-Queue/) | [→](JavaScript/13-Heaps-Priority-Queue/) | [→](Golang/13-Heaps-Priority-Queue/) |
| 14 | **Graphs** | BFS/DFS, topological sort, Dijkstra, Floyd-Warshall, SCC | [→](Python/14-Graphs/) | [→](C%2B%2B/14-Graphs/) | [→](JavaScript/14-Graphs/) | [→](Golang/14-Graphs/) |
| 15 | **Dynamic Programming** | Memo vs tabulation, every family, interval + bitmask + digit + game | [→](Python/15-Dynamic-Programming/) | [→](C%2B%2B/15-Dynamic-Programming/) | [→](JavaScript/15-Dynamic-Programming/) | [→](Golang/15-Dynamic-Programming/) |
| 16 | **Greedy** | Sort keys, exchange arguments, and where greedy breaks | [→](Python/16-Greedy/) | [→](C%2B%2B/16-Greedy/) | [→](JavaScript/16-Greedy/) | [→](Golang/16-Greedy/) |
| 17 | **Bit Manipulation** | XOR tricks, `n & (n-1)`, bitmasks as sets, Gray code | [→](Python/17-Bit-Manipulation/) | [→](C%2B%2B/17-Bit-Manipulation/) | [→](JavaScript/17-Bit-Manipulation/) | [→](Golang/17-Bit-Manipulation/) |
| 18 | **Trie** | Prefix tree, autocomplete, wildcards, bitwise trie | [→](Python/18-Trie/) | [→](C%2B%2B/18-Trie/) | [→](JavaScript/18-Trie/) | [→](Golang/18-Trie/) |
| 19 | **Advanced Topics** | Union-Find, Fenwick, segment tree + lazy, sparse table | [→](Python/19-Advanced-Topics/) | [→](C%2B%2B/19-Advanced-Topics/) | [→](JavaScript/19-Advanced-Topics/) | [→](Golang/19-Advanced-Topics/) |
| 20 | **Math & Number Theory** | GCD/Bezout, modular arithmetic, sieves, matrix exponentiation | [→](Python/20-Math-and-Number-Theory/) | [→](C%2B%2B/20-Math-and-Number-Theory/) | [→](JavaScript/20-Math-and-Number-Theory/) | [→](Golang/20-Math-and-Number-Theory/) |

---

## 🎯 Scope — what is in, and what is deliberately out

This repo targets **software engineering and AI engineering interviews**. That
is a real boundary, not an accident, so it is worth stating plainly.

**Covered to interview depth** — every topic in the index above, each with the
theory, a from-scratch implementation in four languages, and a curated problem
set. Chapters 14 (Graphs), 15 (DP) and 20 (Math) are where the difficulty
actually lives, and all three are thorough.

**Deliberately not covered.** These are real algorithms, but they appear in
ICPC and Codeforces Div. 1 far more than in hiring loops. Reading the theory is
worthwhile; writing 30 more files was not:

| Area | Left out |
|------|----------|
| Graphs | max-flow (Dinic, Edmonds-Karp), bipartite matching, Hungarian algorithm, A* |
| Strings | Boyer-Moore, suffix arrays / automata, Aho-Corasick, Manacher |
| Trees | red-black and splay trees, heavy-light decomposition, B-trees |
| Structures | skip lists, treaps, ternary search tries, sqrt decomposition |
| Geometry | convex hull, closest pair, sweep-line - the whole area |
| Theory | matroids (the formal proof of *why* greedy works) |

**Recently closed** — all five now implemented and verified in every language:
digit DP and game-theory DP with alpha-beta (ch. 15), expression trees with
shunting-yard (ch. 11), empirical benchmarking (ch. 02), and row-major vs
column-major cache locality (ch. 03).

No known gaps remain inside chapters 01–20. What is left is the "deliberately
not covered" table above — and that is a scope decision, not an oversight.

---

## 🚀 How to use this repo

### Run anything

```bash
python  Python/09-Sorting/sorting.py
node    JavaScript/09-Sorting/sorting.js
go run  ./Golang/09-Sorting                       # from inside Golang/
g++ -std=c++17 -O2 -Wall C++/09-Sorting/sorting.cpp -o sorting && ./sorting
```

Each prints its own verification summary, for example:

```
09-Sorting (Python): all checks passed
  9 algorithms x 8 edge cases + 200 random arrays verified against sorted()
```

No test runner, no dependencies, no setup. Every file is standalone.

### The loop that actually works

1. **Read the `README.md`** for the topic. Stop at the complexity table and
   make sure it makes sense before continuing.
2. **Read the code top to bottom.** The comments explain *why*, not *what* —
   why the capacity loop runs downwards, why `visited` is marked on enqueue,
   why the pivot is random.
3. **Delete a function and rewrite it** from the docstring alone. Run the file;
   the assertions tell you immediately whether you got it right.
4. **Open `Problems.md`** and solve 3–5 problems. Do them in pattern order, not
   difficulty order.
5. **Tick the self-check list** at the bottom of `Problems.md`. If you cannot
   tick every box, go back to step 2.
6. **Do the same topic in a second language.** This is where the ideas
   separate from the syntax.

### Suggested pace

| If you have | Do this |
|-------------|---------|
| 1 hour a day, 10 weeks | Two topics a week, one language |
| An interview in 2 weeks | 01–03, then 08, 10, 11, 14, 15 — plus `Problems.md` only |
| A semester | All 19 in one language, then repeat the hard half in a second |
| Total beginner | 01 → 02 → 03 → 04 → 05 → 06 → 07, in order, no skipping |

### Prerequisites

| Language | Needs | Notes |
|----------|-------|-------|
| Python | 3.10+ | Standard library only |
| C++ | C++17 (g++ / clang++) | Standard library only |
| JavaScript | Node 18+ | ESM; `package.json` sets `"type": "module"` |
| Go | 1.21+ | Uses the `min`/`max` builtins; `go.mod` at `Golang/` |

---

## 🗺 Roadmap — track your progress

Copy this into an issue, or edit it in place and commit as you go.

### Foundations
- [ ] 01 — Basics & Syntax
- [ ] 02 — Time & Space Complexity
- [ ] 03 — Arrays
- [ ] 04 — Strings

### Linear structures
- [ ] 05 — Linked List
- [ ] 06 — Stack & Queue

### Core techniques
- [ ] 07 — Recursion & Backtracking
- [ ] 08 — Searching
- [ ] 09 — Sorting
- [ ] 10 — Hashing

### Hierarchical structures
- [ ] 11 — Trees
- [ ] 12 — Binary Search Tree
- [ ] 13 — Heaps & Priority Queue

### The hard half
- [ ] 14 — Graphs
- [ ] 15 — Dynamic Programming
- [ ] 16 — Greedy

### Specialised
- [ ] 17 — Bit Manipulation
- [ ] 18 — Trie
- [ ] 19 — Advanced Topics (Union-Find, Fenwick, Segment Tree, Sparse Table)
- [ ] 20 — Math & Number Theory (GCD, sieves, modular arithmetic)

### Second pass
- [ ] Repeat 07, 11, 14, 15 in a second language
- [ ] Solve every `Problems.md` marked *hard*
- [ ] Implement a heap, a trie and a segment tree from a blank file

---

## 📊 What is actually in here

| | Count |
|---|-------|
| Topics | 20 |
| Languages | 4 |
| Concept guides (`README.md`) | 80 |
| Runnable implementations | 80 |
| Problem sets (`Problems.md`) | 80 |
| Curated practice problems | 1200+ |
| Lines of commented code | ~40,000 |

---

## 🧭 Cheat sheet: which structure?

| The problem says | Reach for | Chapter |
|------------------|-----------|---------|
| "contiguous subarray / substring" | sliding window | [03](Python/03-Arrays/), [04](Python/04-Strings/) |
| "sorted array, find a pair" | two pointers | [03](Python/03-Arrays/) |
| "many range-sum queries" | prefix sums | [03](Python/03-Arrays/) |
| "have I seen this before?" | hash set / map | [10](Python/10-Hashing/) |
| "most recent", "matching", "next greater" | stack | [06](Python/06-Stack-Queue/) |
| "in arrival order", "level by level" | queue / BFS | [06](Python/06-Stack-Queue/), [14](Python/14-Graphs/) |
| "kth largest", "top k", "median of a stream" | heap | [13](Python/13-Heaps-Priority-Queue/) |
| "minimum X such that ..." | binary search on the answer | [08](Python/08-Searching/) |
| "all combinations / permutations" | backtracking | [07](Python/07-Recursion-Backtracking/) |
| "count the ways", "minimum cost to ..." | dynamic programming | [15](Python/15-Dynamic-Programming/) |
| "shortest path" | BFS (unweighted) / Dijkstra | [14](Python/14-Graphs/) |
| "dependency order", "course schedule" | topological sort | [14](Python/14-Graphs/) |
| "prefix", "autocomplete", "dictionary" | trie | [18](Python/18-Trie/) |
| "merge these groups", "connected?" | union-find | [19](Python/19-Advanced-Topics/) |
| "range query WITH updates" | Fenwick / segment tree | [19](Python/19-Advanced-Topics/) |
| "range min/max", data never changes | sparse table | [19](Python/19-Advanced-Topics/) |
| "answer modulo 1e9+7" | modular arithmetic, inverse factorials | [20](Python/20-Math-and-Number-Theory/) |
| "nth term, n up to 1e18" | matrix exponentiation | [20](Python/20-Math-and-Number-Theory/) |
| "all primes up to n" / "factorise many" | sieve, smallest-prime-factor | [20](Python/20-Math-and-Number-Theory/) |
| "shortest path between EVERY pair" | Floyd-Warshall | [14](Python/14-Graphs/) |
| "which nodes can reach each other" | Kosaraju / Tarjan SCC | [14](Python/14-Graphs/) |
| "choose where to split a range" | interval DP | [15](Python/15-Dynamic-Programming/) |
| "which subset, not how many" | bitmask DP | [15](Python/15-Dynamic-Programming/) |
| "count numbers up to N with ..." | digit DP (the `tight` flag) | [15](Python/15-Dynamic-Programming/) |
| "both players play optimally" | game DP / negamax + alpha-beta | [15](Python/15-Dynamic-Programming/) |
| "evaluate / parse an expression" | expression tree + shunting-yard | [11](Python/11-Trees/) |
| "why is it slow when Big-O says fast?" | cache locality, constant factors | [03](Python/03-Arrays/) · [02](Python/02-Time-Space-Complexity/) |
| "guaranteed O(log n), any input order" | AVL tree | [12](Python/12-Binary-Search-Tree/) |
| "change a queued item's priority" | indexed priority queue | [13](Python/13-Heaps-Priority-Queue/) |
| "constant space, find the odd one out" | XOR | [17](Python/17-Bit-Manipulation/) |

---

## 🤝 Contributing

Corrections and additional problems are welcome. Two rules:

1. **Code must run and assert.** If you add a function, add checks for it —
   including the edge cases (empty input, single element, duplicates).
2. **Comments explain *why*.** `// increment i` adds nothing;
   `// downwards, or the item gets reused` is the whole point.

---

<div align="center">

**Learning is a loop: read → rewrite → solve → repeat.**

If this helped, a ⭐ costs you nothing and helps someone else find it.

</div>
