# 12 - Binary Search Tree (JavaScript)

> JavaScript has no built-in sorted map, so if you need ordered keys, range
> queries or floor/ceiling, you build this yourself.

## 1. The BST property

For **every** node:

```
all values in the LEFT subtree < node.val < all values in the RIGHT subtree
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

"Every" is what matters. This tree is **not** a BST even though each parent
looks fine next to its children:

```
        5
       / \
      1   7
         / \
        4   8      <- 4 < 5 but sits in the RIGHT subtree
```

So validation carries an allowed `(low, high)` range down the tree, narrowing
it at each step.

---

## 2. Inorder = sorted

An inorder traversal emits ascending values in `O(n)`. That single fact gives
you sorted output, kth smallest, successor/predecessor and validation.

---

## 3. Operations

| Operation | Balanced | Degenerate |
|-----------|----------|------------|
| search / insert / delete | `O(log n)` | `O(n)` |
| min / max | `O(log n)` | `O(n)` |
| inorder | `O(n)` | `O(n)` |

All `O(h)`. Sorted input gives `h = n`, and since Node overflows at ~10k
frames, a recursive insert over sorted data will actually crash. The
implementations here are **iterative** where it matters.

---

## 4. Deletion: three cases

1. **Leaf** - return `null` to the parent.
2. **One child** - return that child.
3. **Two children** - copy the **inorder successor's** value (smallest in the
   right subtree) into this node, then delete the successor from the right
   subtree, which resolves as case 1 or 2.

---

## 5. What JS gives you instead

| Need | JS answer |
|------|-----------|
| key lookup | `Map` - `O(1)`, unordered |
| sorted iteration | sort the keys - `O(n log n)` each time |
| ordered set with range queries | build a BST, or keep a sorted array + binary search |
| min/max repeatedly | a heap (chapter 13) |

A sorted array with binary search beats a BST for lookups (`O(log n)`) but
costs `O(n)` per insert. A BST is the right choice when inserts and ordered
queries are interleaved.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `BST.insert` / `search` / `delete` | `O(h)` | `O(h)` |
| `BST.min` / `max` | `O(h)` | `O(1)` |
| `BST.inorder` | `O(n)` | `O(n)` |
| `isValidBST` | `O(n)` | `O(h)` |
| `kthSmallest` | `O(h + k)` | `O(h)` |
| `lcaBST` | `O(h)` | `O(1)` |
| `floorValue` / `ceilValue` | `O(h)` | `O(1)` |
| `rangeSum` | `O(n)` worst, pruned in practice | `O(h)` |
| `sortedArrayToBST` | `O(n)` | `O(log n)` |

## Run the code

```bash
node bst.js
```
