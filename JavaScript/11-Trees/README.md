# 11 - Trees (JavaScript)

> A tree is a linked list that branches. Recursion finally has an obvious home
> - just watch Node's shallow stack.

## 1. Vocabulary

```
            1          <- root (depth 0)
          /   \
         2     3
        / \
       4   5           <- leaves
```

| Term | Meaning |
|------|---------|
| Root | the node with no parent |
| Leaf | a node with no children |
| Depth | edges from the root down to a node |
| Height | edges on the longest path down to a leaf |
| Subtree | a node plus all its descendants |

`n` nodes, `n - 1` edges, no cycles.

---

## 2. Shapes

| Shape | Definition | Height |
|-------|-----------|--------|
| Full | 0 or 2 children per node | varies |
| Complete | all levels full except the last, filled left to right | `floor(log2 n)` |
| Perfect | all leaves at the same depth | `log2(n+1) - 1` |
| Balanced | subtree heights differ by <= 1 everywhere | `O(log n)` |
| Degenerate | one child per node | `n - 1` (a linked list) |

Everything depends on height: balanced is `O(log n)`, degenerate is `O(n)`.

---

## 3. The four traversals

| Traversal | Order | On the tree above | Use |
|-----------|-------|-------------------|-----|
| Preorder | node, left, right | 1 2 4 5 3 | copy / serialise |
| Inorder | left, node, right | 4 2 5 1 3 | **sorted output on a BST** |
| Postorder | left, right, node | 4 5 2 3 1 | bottom-up computation |
| Level order | breadth first | 1 2 3 4 5 | shortest path, per-level work |

DFS costs `O(h)` stack; BFS costs `O(w)` queue space (`w` up to `n/2`).

**The pattern that solves most tree problems:** if the answer needs
information from the children, compute it bottom-up and return *both* the
value the parent needs and the answer you are accumulating. Calling
`height()` inside another recursion instead is the classic `O(n^2)` mistake.

---

## 4. Node's stack limit matters here

V8 overflows at roughly **10,000-15,000 frames**. A balanced tree of 10^6
nodes has depth 20 - fine. A degenerate tree of 10^5 nodes has depth 10^5 -
`RangeError`. For untrusted shapes, use the iterative traversals:

- **Preorder:** stack, push right then left.
- **Inorder:** dive left pushing, pop, visit, go right.
- **Postorder:** preorder as node-right-left, then `reverse()`.
- **Level order:** a queue with a head index (never `shift()`).
- **Morris inorder:** `O(1)` space via temporary threads.

> Use a **head index** for the BFS queue. `queue.shift()` is `O(n)`, which
> silently turns an `O(n)` traversal into `O(n^2)`.

---

## 5. Costs

| Operation | Balanced | Degenerate |
|-----------|----------|------------|
| any traversal | `O(n)` | `O(n)` |
| height / diameter / balance | `O(n)` | `O(n)` |
| recursion space | `O(log n)` | `O(n)` - overflows |

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `preorder` / `inorder` / `postorder` | `O(n)` | `O(h)` |
| `levelOrder` | `O(n)` | `O(w)` |
| `morrisInorder` | `O(n)` | **`O(1)`** |
| `height` / `countNodes` / `countLeaves` | `O(n)` | `O(h)` |
| `isBalanced` | `O(n)` | `O(h)` |
| `diameter` | `O(n)` | `O(h)` |
| `lowestCommonAncestor` | `O(n)` | `O(h)` |
| `serialize` / `deserialize` | `O(n)` | `O(n)` |

## Euler tour - turning a tree into an array

Most hard tree problems get easier once the tree is **flattened**, because array
problems have `O(1)` and `O(log n)` tools that trees do not.

### The full walk - `2n - 1` entries

Record the current node every time control passes through it: on the way in, and
again after returning from each child.

```text
      1
     / \        tour: 1 2 4 2 5 2 1 3 1
    2   3       LCA(4, 5) = the shallowest node between them = 2
   / \
  4   5
```

The **lowest common ancestor** of `u` and `v` is the shallowest node in the tour
between any occurrence of each - which turns LCA into a **range-minimum query**,
answerable in `O(1)` with the sparse table from chapter 19.

All three classic traversals are projections of this one walk: preorder takes
each node at its **first** appearance, postorder at its **last**, inorder at its
middle one.

### The in/out timestamps - the version you will actually use

Stamp a counter on the way in and on the way out. Then:

```text
u is an ancestor of v   <=>   tin[u] <= tin[v] and tout[v] <= tout[u]
```

An ancestor test in `O(1)` with no walking. Better still, a node's subtree
occupies a **contiguous range** `[tin, tout)` of the entry order - so "sum over
this subtree" or "add x to this whole subtree" becomes a *range query on a flat
array*, which a Fenwick or segment tree answers in `O(log n)`.

That single observation is the standard preprocessing step for subtree queries,
and half of heavy-light decomposition.

---

## Run the code

```bash
node trees.js
```
