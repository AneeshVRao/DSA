# 12 - Binary Search Tree (C++)

> `std::map` and `std::set` *are* balanced BSTs (red-black trees). This chapter
> builds the unbalanced version so you understand what they are protecting you
> from.

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

"Every" is the operative word. Checking only immediate children accepts this
invalid tree:

```
        5
       / \
      1   7
         / \
        4   8      <- 4 < 5 but sits in the RIGHT subtree
```

Validation must therefore carry an allowed `(low, high)` range down the tree.
Use `long long` bounds (or `optional<int>`) so that a node holding `INT_MIN`
does not break the initial sentinel.

---

## 2. Inorder = sorted

An inorder traversal emits ascending values in `O(n)`. That gives you sorted
output, kth smallest, successor/predecessor and a validity check for free.

---

## 3. Operations

| Operation | Balanced | Degenerate |
|-----------|----------|------------|
| search / insert / delete | `O(log n)` | `O(n)` |
| min / max | `O(log n)` | `O(n)` |
| inorder | `O(n)` | `O(n)` |

Everything is `O(h)`. **Inserting sorted data gives `h = n`** - a linked list
with extra pointers. Red-black trees (what `std::map` uses) rotate on insert
to keep `h = O(log n)`.

---

## 4. Deletion: three cases

1. **Leaf** - delete it, return `nullptr` to the parent.
2. **One child** - return that child to the parent, delete the node.
3. **Two children** - copy the **inorder successor's** value (smallest in the
   right subtree) into this node, then delete the successor from the right
   subtree. The successor has at most one child, so that recursion resolves in
   case 1 or 2 immediately.

Every node you unlink must be `delete`d - the classic leak in hand-written
BSTs.

---

## 5. The STL versions

```cpp
set<int> s;                     // sorted, unique, O(log n), red-black tree
map<string,int> m;              // sorted key -> value
multiset<int> ms;               // duplicates allowed

s.insert(x); s.erase(x); s.count(x);
auto it = s.lower_bound(x);     // first >= x   (member: O(log n))
auto it = s.upper_bound(x);     // first > x
if (it != s.begin()) { --it; }  // floor: step back from lower_bound
*s.begin();  *s.rbegin();       // min, max in O(1)
```

> Always use the **member** `lower_bound`, not `std::lower_bound(s.begin(), ...)`:
> the free function needs random-access iterators to be `O(log n)` and
> degrades to `O(n)` on a tree.

Iterating a `set` is inorder, so it comes out sorted by definition.

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
| `BST::insert` / `search` / `remove` | `O(h)` | `O(h)` |
| `BST::minValue` / `maxValue` | `O(h)` | `O(1)` |
| `BST::inorder` | `O(n)` | `O(n)` |
| `isValidBST` | `O(n)` | `O(h)` |
| `kthSmallest` | `O(h + k)` | `O(h)` |
| `lcaBST` | `O(h)` | `O(1)` |
| `floorValue` / `ceilValue` | `O(h)` | `O(1)` |
| `rangeSum` | `O(n)` worst, pruned in practice | `O(h)` |
| `sortedArrayToBST` | `O(n)` | `O(log n)` |
| `AVLTree::insert` / `erase` | `O(log n)` **guaranteed** | `O(n)` |
| `AVLTree::contains` | `O(log n)` **guaranteed** | `O(1)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall bst.cpp -o bst && ./bst
```
