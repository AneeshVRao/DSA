# 12 - Binary Search Tree (Python)

> One invariant turns a tree into a searchable, sorted structure. One missing
> invariant turns it back into a linked list.

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
all values in the LEFT subtree  <  node.val  <  all values in the RIGHT subtree
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

Note the word *every*. Checking only the immediate children is the classic
wrong answer:

```
        5
       / \
      1   7          <- 7 > 5, fine locally ...
         / \
        4   8        <- ... but 4 < 5 and it is in the RIGHT subtree. NOT a BST.
```

Validation therefore has to carry an allowed `(low, high)` range down the
tree, narrowing it at each step.

---

## 2. Why it matters: inorder = sorted

An inorder traversal of a BST emits values in ascending order, in `O(n)`.
That single fact gives you:

- sorted output for free,
- the kth smallest element by counting during an inorder walk,
- "is this a valid BST?" by checking the inorder sequence is increasing,
- successor and predecessor as neighbours in that sequence.

---

## 3. Operations

| Operation | Balanced | Degenerate | How |
|-----------|----------|------------|-----|
| search | `O(log n)` | `O(n)` | go left if smaller, right if larger |
| insert | `O(log n)` | `O(n)` | search, then attach at the empty spot |
| delete | `O(log n)` | `O(n)` | three cases (below) |
| min / max | `O(log n)` | `O(n)` | leftmost / rightmost node |
| inorder | `O(n)` | `O(n)` | left, node, right |

Every operation is `O(h)`. Balanced means `h = log n`; **inserting sorted data
gives `h = n`** and the whole structure degenerates into a linked list. That
is what AVL and red-black trees (chapter 19) exist to prevent.

---

## 4. Deletion: the only interesting case

1. **Leaf** - just remove it.
2. **One child** - splice the child into the parent's slot.
3. **Two children** - replace the value with its **inorder successor** (the
   smallest value in the right subtree), then delete that successor from the
   right subtree. The successor has at most one child by construction, so this
   recursion terminates immediately.

Using the inorder **predecessor** (largest in the left subtree) is equally
valid; pick one and be consistent.

---

## 5. BST-specific problems and the shortcuts they allow

| Problem | Shortcut the BST property gives |
|---------|--------------------------------|
| Lowest common ancestor | The first node between p and q **is** the LCA - no full search |
| kth smallest | Inorder walk, stop after k nodes |
| Validate | Range check, not a subtree scan |
| Floor / ceiling | One descent, remembering the best candidate |
| Range sum | Prune whole subtrees that cannot contain the range |
| Sorted array to balanced BST | Middle element becomes the root, recurse |

Each of these is `O(h)` or better *because* of the ordering. Solving them with
a generic tree traversal is the tell that you have not used the invariant.

---

## 6. When to use a BST at all

| Need | Structure |
|------|-----------|
| pure key lookup | hash map (`O(1)`) - faster |
| sorted iteration | **BST** |
| range queries, floor/ceiling, successor | **BST** |
| min/max repeatedly with insertions | heap (chapter 13) |
| ordered map in practice | C++ `map`, Java `TreeMap`, Python `sortedcontainers` |

Python's standard library has no balanced BST. In practice you use a `dict`
plus `sorted()`, the `bisect` module over a sorted list, or the third-party
`sortedcontainers` package.

---

## 7. AVL - making `O(log n)` a guarantee

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

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `BST.insert` / `search` / `delete` | `O(h)` | `O(h)` |
| `BST.min_value` / `max_value` | `O(h)` | `O(1)` |
| `BST.inorder` | `O(n)` | `O(n)` |
| `is_valid_bst` | `O(n)` | `O(h)` |
| `kth_smallest` | `O(h + k)` | `O(h)` |
| `lca_bst` | `O(h)` | `O(1)` |
| `floor_value` / `ceil_value` | `O(h)` | `O(1)` |
| `range_sum` | `O(n)` worst, pruned in practice | `O(h)` |
| `sorted_array_to_bst` | `O(n)` | `O(log n)` |
| `inorder_successor` | `O(h)` | `O(1)` |
| `AVLTree.insert` / `delete` | `O(log n)` **guaranteed** | `O(n)` |
| `AVLTree.contains` | `O(log n)` **guaranteed** | `O(1)` |

## Run the code

```bash
python bst.py
```

---

[<- 11 Trees](../11-Trees/) · [All topics](../../README.md) · [13 Heaps & Priority Queue ->](../13-Heaps-Priority-Queue/)
