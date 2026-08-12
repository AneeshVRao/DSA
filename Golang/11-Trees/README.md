# 11 - Trees (Go)

> A tree is a linked list that branches. Go's dynamically growing stacks make
> recursion here far safer than in Node or Python.

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

Everything depends on height - which is why chapters 12 and 19 exist.

---

## 3. The node type

```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}
```

A `nil` pointer **is** the empty tree, so recursion needs no separate empty
case - `if node == nil { return ... }` covers it. The garbage collector frees
discarded subtrees, so there is no explicit teardown to write.

---

## 4. The four traversals

| Traversal | Order | On the tree above | Use |
|-----------|-------|-------------------|-----|
| Preorder | node, left, right | 1 2 4 5 3 | copy / serialise |
| Inorder | left, node, right | 4 2 5 1 3 | **sorted output on a BST** |
| Postorder | left, right, node | 4 5 2 3 1 | bottom-up computation |
| Level order | breadth first | 1 2 3 4 5 | shortest path, per-level work |

DFS costs `O(h)` stack; BFS costs `O(w)` for the queue.

**The pattern:** if the answer depends on the children, compute it bottom-up
and return *both* the value the parent needs and the answer being accumulated.
Go's multiple return values make this especially clean:

```go
func check(node *TreeNode) (balanced bool, height int)
```

That is the idiomatic way to avoid the `O(n^2)` of calling `Height()` inside
another recursion.

---

## 5. Iterative equivalents

- **Preorder:** slice as a stack, push right then left.
- **Inorder:** dive left pushing, pop, visit, go right.
- **Postorder:** preorder as node-right-left, then reverse.
- **Level order:** a slice queue with a head index (`q = q[1:]` works but
  keeps the whole backing array alive).
- **Morris inorder:** `O(1)` space via temporary threads.

---

## 6. Costs

| Operation | Balanced | Degenerate |
|-----------|----------|------------|
| any traversal | `O(n)` | `O(n)` |
| height / diameter / balance | `O(n)` | `O(n)` |
| recursion space | `O(log n)` | `O(n)` |

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `Preorder` / `Inorder` / `Postorder` | `O(n)` | `O(h)` |
| `LevelOrder` | `O(n)` | `O(w)` |
| `MorrisInorder` | `O(n)` | **`O(1)`** |
| `Height` / `CountNodes` / `CountLeaves` | `O(n)` | `O(h)` |
| `IsBalanced` | `O(n)` | `O(h)` |
| `Diameter` | `O(n)` | `O(h)` |
| `LowestCommonAncestor` | `O(n)` | `O(h)` |
| `Serialize` / `Deserialize` | `O(n)` | `O(n)` |

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
go run trees.go
```
