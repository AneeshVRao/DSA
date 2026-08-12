# 12 - Binary Search Tree (Go)

> Go's standard library has no ordered map at all. If you need sorted
> iteration, range queries or floor/ceiling, this is what you build.

## 1. The BST property

For **every** node:

```
all values in the LEFT subtree < node.Val < all values in the RIGHT subtree
```

```
            8
          /   \
         3     10
        / \      \
       1   6      14
          / \     /
         4   7   13
```

"Every" is the trap. This is **not** a BST, even though each parent looks
correct beside its own children:

```
        5
       / \
      1   7
         / \
        4   8      <- 4 < 5 but sits in the RIGHT subtree
```

Validation therefore passes an allowed `(low, high)` range down the tree.
Use `math.MinInt64` / `math.MaxInt64` as the initial sentinels.

---

## 2. Inorder = sorted

Inorder traversal emits ascending values in `O(n)` - sorted output, kth
smallest, successor/predecessor and validation all fall out of it.

---

## 3. Operations

| Operation | Balanced | Degenerate |
|-----------|----------|------------|
| search / insert / delete | `O(log n)` | `O(n)` |
| min / max | `O(log n)` | `O(n)` |
| inorder | `O(n)` | `O(n)` |

Everything is `O(h)`. Sorted input gives `h = n`. Go's stacks grow
dynamically so it will not crash, but the performance collapse is real.

---

## 4. Deletion: three cases

1. **Leaf** - return `nil` to the parent.
2. **One child** - return that child; the GC reclaims the node.
3. **Two children** - copy the **inorder successor's** value (smallest in the
   right subtree) into this node, then delete the successor from the right
   subtree, which resolves as case 1 or 2.

---

## 5. Go-specific notes

- A `nil *TreeNode` **is** the empty tree, so `if node == nil` covers every
  empty case with no extra checks.
- Return `(value, bool)` rather than a sentinel for "not found" - it is the
  idiom the standard library uses everywhere.
- No manual freeing: the garbage collector handles unlinked subtrees.
- For a production ordered map, reach for a third-party B-tree
  (`github.com/google/btree`) rather than hand-rolling a red-black tree.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `BST.Insert` / `Search` / `Delete` | `O(h)` | `O(h)` |
| `BST.Min` / `Max` | `O(h)` | `O(1)` |
| `BST.Inorder` | `O(n)` | `O(n)` |
| `IsValidBST` | `O(n)` | `O(h)` |
| `KthSmallest` | `O(h + k)` | `O(h)` |
| `LCABst` | `O(h)` | `O(1)` |
| `FloorValue` / `CeilValue` | `O(h)` | `O(1)` |
| `RangeSum` | `O(n)` worst, pruned in practice | `O(h)` |
| `SortedArrayToBST` | `O(n)` | `O(log n)` |

## Run the code

```bash
go run bst.go
```
