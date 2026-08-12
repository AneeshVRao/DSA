# 12 - Binary Search Tree (Go)

> Go's standard library has no ordered map at all. If you need sorted
> iteration, range queries or floor/ceiling, this is what you build.

**At a glance**

| | |
|---|---|
| **What it is** | A tree with an ordering invariant, so an in-order walk comes out **sorted**. |
| **Must know** | Every operation is `O(h)`. `h = log n` only while the tree stays balanced. |
| **The one trap** | Validating by comparing parent to child. The bound must be inherited from *all* ancestors. |
| **Reach for it when** | Ordered lookups, floor/ceil, kth smallest, range queries. |

---

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

## 6. AVL - making `O(log n)` a guarantee

Everything above is `O(h)`. A plain BST only has `h = log n` if the data arrives
in a lucky order - insert `1, 2, 3, 4, 5` and every node becomes a right child,
`h = n`, and search degrades to a linked-list scan. **Sorted input is not a
pathological case, it is the most common one.**

An AVL tree fixes this with one rule, enforced at every node:

```text
balance = height(left) - height(right)   must be in {-1, 0, +1}
```

That single constraint forces `h <= 1.44 * log2(n)`.

> *Why:* let `N(h)` be the fewest nodes in an AVL tree of height `h`. Then
> `N(h) = 1 + N(h-1) + N(h-2)` - the Fibonacci recurrence - so `N(h)` grows
> exponentially in `h`, which means `h` grows logarithmically in `n`.

### The rotation

```text
      node                 pivot
     /    \                /     \
  pivot    C      ->      A      node
  /   \                          /    \
 A     B                        B      C
```

`B` moves from pivot's right to node's left. Every value in `B` is greater than
`pivot` and less than `node`, so it is **legal in either position** - that is
precisely why a rotation preserves the ordering. Three pointer writes, two
height updates, `O(1)`.

### The four cases

| Case | Condition | Fix |
|------|-----------|-----|
| **LL** | `balance > 1`, went left-left | rotate right |
| **RR** | `balance < -1`, went right-right | rotate left |
| **LR** | `balance > 1`, went left-right | rotate **left** on the child, then right on the node |
| **RL** | `balance < -1`, went right-left | rotate **right** on the child, then left on the node |

LR and RL are not new operations - they are the single rotations applied twice.
The first straightens the zig-zag into a straight line; the second is then the
simple case.

### Two details that are easy to get wrong

**Cache the height, never recompute it.** Recomputing a subtree height inside
the balance check makes every insert `O(n)`. Stored on the node, it updates in
`O(1)` as the recursion unwinds - and the test suite here checks that the cached
value is *honest*, because a stale height makes the balance a lie.

**Insert needs at most one rotation; delete may need `O(log n)`.** An insert
rotation restores the subtree's original height, so the fix stops there. A
delete can *shorten* a subtree, and that shortening propagates - so rebalancing
can cascade all the way to the root.

### AVL vs red-black

| | AVL | Red-black |
|---|-----|-----------|
| Balance | strict (`+/-1` height) | loose (`<= 2x` path length) |
| Lookups | faster | slower |
| Inserts/deletes | more rotations | fewer rotations |
| Used by | read-heavy database indexes | `std::map`, Java `TreeMap`, the Linux kernel |

---

## 7. Complexity of what is implemented here

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
| `AVLTree.Insert` / `Delete` | `O(log n)` **guaranteed** | `O(n)` |
| `AVLTree.Contains` | `O(log n)` **guaranteed** | `O(1)` |

## Run the code

```bash
go run bst.go
```

---

[<- 11 Trees](../11-Trees/) · [All topics](../../README.md) · [13 Heaps & Priority Queue ->](../13-Heaps-Priority-Queue/)
