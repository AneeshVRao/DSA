# 11 - Trees (Python)

> A tree is a linked list that branches. Every recursive algorithm you learned
> in chapter 07 now has an obvious home.

**At a glance**

| | |
|---|---|
| **What it is** | Hierarchy - and the natural shape of recursion. |
| **Must know** | Four traversals. Most problems are one bottom-up post-order pass. |
| **The one trap** | Height conventions: edges (empty `= -1`) vs nodes (empty `= 0`). Mixing them is off-by-one. |
| **Reach for it when** | Hierarchical data, and anything saying "path", "depth", "ancestor" or "subtree". |

---

## 1. Vocabulary

```
            1          <- root (depth 0)
          /   \
         2     3       <- internal nodes
        / \     \
       4   5     6     <- leaves (no children)
```

| Term | Meaning |
|------|---------|
| Root | the single node with no parent |
| Leaf | a node with no children |
| Depth of a node | edges from the root down to it |
| Height of a node | edges on the longest path down to a leaf |
| Height of the tree | height of the root (a single node has height 0) |
| Subtree | any node plus all its descendants |
| Degree | number of children |

A tree with `n` nodes always has exactly `n - 1` edges and no cycles.

---

## 2. Shapes of binary trees

| Shape | Definition | Height |
|-------|-----------|--------|
| Full | every node has 0 or 2 children | varies |
| Complete | every level filled except possibly the last, filled left to right | `floor(log2 n)` |
| Perfect | all internal nodes have 2 children, all leaves at the same depth | `log2(n+1) - 1` |
| Balanced | left and right heights differ by at most 1 at every node | `O(log n)` |
| Degenerate | every node has one child | `n - 1` (it is a linked list) |

**Everything depends on height.** A balanced tree gives `O(log n)` operations;
a degenerate one gives `O(n)`. That single fact is why chapters 12 and 19
exist (BSTs and self-balancing trees).

A perfect tree of height `h` has `2^(h+1) - 1` nodes, and `n` nodes means
height `>= log2(n+1) - 1`.

---

## 3. The four traversals

```
        1
      /   \
     2     3
    / \
   4   5
```

| Traversal | Order | Result | Use |
|-----------|-------|--------|-----|
| Preorder | node, left, right | 1 2 4 5 3 | copy/serialise a tree |
| Inorder | left, node, right | 4 2 5 1 3 | **sorted output on a BST** |
| Postorder | left, right, node | 4 5 2 3 1 | delete a tree, compute sizes bottom-up |
| Level order | breadth first | 1 2 3 4 5 | shortest path, per-level work |

The first three are depth-first (`O(h)` space for the call stack); level order
is breadth-first and uses a queue (`O(w)` space, where `w` is the widest
level - up to `n/2`).

**Rule of thumb:** if the answer needs information from the children, compute
it bottom-up in a postorder-shaped recursion. That single idea solves height,
diameter, balance checking and most "hard" tree problems.

---

## 4. Recursive vs iterative

Recursion mirrors the structure and is almost always the right first answer.
Iterative versions matter when the tree can be deep (Python's recursion limit
is 1000):

- **Preorder:** push right then left onto a stack.
- **Inorder:** walk left pushing nodes, pop, visit, then go right.
- **Postorder:** do preorder as node-right-left and reverse the output.
- **Level order:** a queue, processing one level per outer iteration.

**Morris traversal** achieves inorder in `O(1)` space by temporarily rewiring
leaf pointers back to their successor - included below as the ultimate
"no stack, no recursion" trick.

---

## 5. Costs

| Operation | Balanced | Degenerate |
|-----------|----------|------------|
| traversal (any) | `O(n)` | `O(n)` |
| search (unordered tree) | `O(n)` | `O(n)` |
| height / diameter / balance check | `O(n)` | `O(n)` |
| recursion space | `O(log n)` | `O(n)` |

Traversal is always `O(n)`: every node is visited once. What changes is the
**space** used by the recursion stack.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `preorder` / `inorder` / `postorder` | `O(n)` | `O(h)` |
| `level_order` | `O(n)` | `O(w)` |
| `morris_inorder` | `O(n)` | **`O(1)`** |
| `height` / `count_nodes` / `count_leaves` | `O(n)` | `O(h)` |
| `is_balanced` | `O(n)` | `O(h)` |
| `diameter` | `O(n)` | `O(h)` |
| `invert` | `O(n)` | `O(h)` |
| `lowest_common_ancestor` | `O(n)` | `O(h)` |
| `has_path_sum` / `all_paths` | `O(n)` | `O(h)` |
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
python trees.py
```

---

[<- 10 Hashing](../10-Hashing/) · [All topics](../../README.md) · [12 Binary Search Tree ->](../12-Binary-Search-Tree/)
