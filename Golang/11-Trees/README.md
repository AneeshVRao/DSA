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

## Run the code

```bash
go run trees.go
```
