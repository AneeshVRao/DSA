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

## 6. Complexity of what is implemented here

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

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall bst.cpp -o bst && ./bst
```
