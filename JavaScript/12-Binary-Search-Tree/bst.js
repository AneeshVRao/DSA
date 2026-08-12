/**
 * 12 - Binary Search Tree: the full structure plus the problems whose
 * solutions exist only because of the ordering invariant.
 *
 * Run:  node bst.js
 */

import assert from "node:assert/strict";

// ============================================================================
// Node
// ============================================================================
export class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// ============================================================================
// 1. The BST itself
// ============================================================================
export class BST {
  #root = null;
  #size = 0;

  constructor(values = []) {
    for (const v of values) this.insert(v);
  }

  get root() {
    return this.#root;
  }

  get size() {
    return this.#size;
  }

  /**
   * Insert unless already present. O(h).
   * Iterative on purpose: sorted input builds a degenerate tree, and a
   * recursive insert would overflow V8's ~10k frame stack.
   */
  insert(val) {
    if (this.#root === null) {
      this.#root = new TreeNode(val);
      this.#size++;
      return true;
    }
    let node = this.#root;
    for (;;) {
      if (val === node.val) return false; // no duplicates
      if (val < node.val) {
        if (node.left === null) {
          node.left = new TreeNode(val);
          this.#size++;
          return true;
        }
        node = node.left;
      } else {
        if (node.right === null) {
          node.right = new TreeNode(val);
          this.#size++;
          return true;
        }
        node = node.right;
      }
    }
  }

  /** O(h): every comparison discards an entire subtree. */
  search(val) {
    let node = this.#root;
    while (node) {
      if (val === node.val) return node;
      node = val < node.val ? node.left : node.right;
    }
    return null;
  }

  has(val) {
    return this.search(val) !== null;
  }

  /** Leftmost node. O(h). */
  min() {
    if (!this.#root) return null;
    let node = this.#root;
    while (node.left) node = node.left;
    return node.val;
  }

  /** Rightmost node. O(h). */
  max() {
    if (!this.#root) return null;
    let node = this.#root;
    while (node.right) node = node.right;
    return node.val;
  }

  delete(val) {
    const found = this.has(val);
    this.#root = BST.#removeFrom(this.#root, val);
    if (found) this.#size--;
    return found;
  }

  static #removeFrom(node, val) {
    if (node === null) return null;
    if (val < node.val) {
      node.left = BST.#removeFrom(node.left, val);
      return node;
    }
    if (val > node.val) {
      node.right = BST.#removeFrom(node.right, val);
      return node;
    }

    // Cases 1 and 2: zero or one child - splice the child up.
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;

    // Case 3: two children. Copy the inorder successor's value here, then
    // delete the successor from the right subtree. It is the leftmost node
    // there, so it has at most one child - case 1 or 2 handles it at once.
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.val = successor.val;
    node.right = BST.#removeFrom(node.right, successor.val);
    return node;
  }

  /** Iterative inorder: SORTED output, the defining property of a BST. */
  inorder() {
    const out = [];
    const stack = [];
    let node = this.#root;
    while (node || stack.length) {
      while (node) {
        stack.push(node);
        node = node.left;
      }
      node = stack.pop();
      out.push(node.val);
      node = node.right;
    }
    return out;
  }

  height() {
    const h = (node) => (node === null ? -1 : 1 + Math.max(h(node.left), h(node.right)));
    return h(this.#root);
  }
}

// ============================================================================
// 2. Validation
// ============================================================================
/**
 * O(n). Checking only parent-vs-child is the classic wrong answer: every node
 * must fall inside the range inherited from ALL its ancestors.
 */
export function isValidBST(root) {
  const check = (node, low, high) => {
    if (node === null) return true;
    if (node.val <= low || node.val >= high) return false;
    return check(node.left, low, node.val) && check(node.right, node.val, high);
  };
  return check(root, -Infinity, Infinity);
}

// ============================================================================
// 3. Order statistics
// ============================================================================
/** kth smallest (1-based). O(h + k) - the iterative walk stops early. */
export function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  let count = 0;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (++count === k) return node.val;
    node = node.right;
  }
  return null;
}

/**
 * Smallest value strictly greater than target. O(h), no parent pointers:
 * every time we move LEFT, the node we just left is a candidate.
 */
export function inorderSuccessor(root, target) {
  let successor = null;
  let node = root;
  while (node) {
    if (target < node.val) {
      successor = node.val; // candidate; may be beaten deeper left
      node = node.left;
    } else {
      node = node.right; // everything here is too small
    }
  }
  return successor;
}

// ============================================================================
// 4. Searching with the invariant
// ============================================================================
/**
 * LCA in O(h) with no recursion into both subtrees: the first node whose
 * value lies between p and q IS the split point.
 */
export function lcaBST(root, p, q) {
  const low = Math.min(p, q);
  const high = Math.max(p, q);
  let node = root;
  while (node) {
    if (node.val > high) node = node.left;
    else if (node.val < low) node = node.right;
    else return node.val; // low <= node.val <= high
  }
  return null;
}

/** Largest value <= target. O(h). */
export function floorValue(root, target) {
  let best = null;
  let node = root;
  while (node) {
    if (node.val === target) return node.val;
    if (node.val < target) {
      best = node.val; // valid, but a bigger candidate may exist
      node = node.right;
    } else {
      node = node.left;
    }
  }
  return best;
}

/** Smallest value >= target. O(h). */
export function ceilValue(root, target) {
  let best = null;
  let node = root;
  while (node) {
    if (node.val === target) return node.val;
    if (node.val > target) {
      best = node.val;
      node = node.left;
    } else {
      node = node.right;
    }
  }
  return best;
}

/**
 * Sum of values in [low, high]. The pruning is the point: a node below `low`
 * makes its whole left subtree irrelevant, and vice versa.
 */
export function rangeSum(root, low, high) {
  if (root === null) return 0;
  if (root.val < low) return rangeSum(root.right, low, high);
  if (root.val > high) return rangeSum(root.left, low, high);
  return root.val + rangeSum(root.left, low, high) + rangeSum(root.right, low, high);
}

// ============================================================================
// 5. Construction
// ============================================================================
/**
 * Build a HEIGHT-BALANCED BST from sorted input. O(n).
 * Inserting sorted values one at a time gives height n-1; taking the middle
 * element as the root each time gives floor(log2 n).
 */
export function sortedArrayToBST(values) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    const node = new TreeNode(values[mid]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, values.length - 1);
}

export function treeHeight(root) {
  if (root === null) return -1;
  return 1 + Math.max(treeHeight(root.left), treeHeight(root.right));
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// 6. AVL - a BST that keeps itself balanced
// ============================================================================
/**
 * A BST node that also caches its own subtree height.
 *
 * The height must be STORED, not computed. Recomputing it would make every
 * insert `O(n)`; cached, it updates in `O(1)` as the recursion unwinds.
 */
class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1; // a leaf has height 1
  }
}

/**
 * A self-balancing BST. Every operation is `O(log n)` GUARANTEED.
 *
 * **The problem it solves.** A plain BST is `O(log n)` only if the data arrives
 * in a lucky order. Insert 1, 2, 3, 4, 5 in order and every node becomes a
 * right child - the tree degenerates into a linked list and search is `O(n)`.
 * Sorted input is not a pathological case, it is the single most common one.
 *
 * **The invariant.** For every node,
 *
 *     balance = height(left) - height(right)   is in {-1, 0, +1}
 *
 * That one constraint forces `height <= 1.44 * log2(n)`. (Sketch: let `N(h)` be
 * the fewest nodes in an AVL tree of height h. Then `N(h) = 1 + N(h-1) + N(h-2)`
 * - the Fibonacci recurrence - so `N(h)` grows exponentially and h is
 * logarithmic in n.)
 *
 * **The four cases.** After an insert or delete one node may reach a balance of
 * +/-2. Which rotation fixes it depends on WHERE the offending subtree sits:
 *
 *     LL  balance > 1,  went left-left    -> rotate right
 *     RR  balance < -1, went right-right  -> rotate left
 *     LR  balance > 1,  went left-right   -> rotate left on the child,
 *                                            then right on the node
 *     RL  balance < -1, went right-left   -> rotate right on the child,
 *                                            then left on the node
 *
 * LR and RL are not new operations - they are the single rotations applied
 * twice. The first straightens the zig-zag into a line; the second is then the
 * simple case.
 *
 * A rotation is `O(1)`: three pointer writes and two height updates. Only the
 * LOWEST unbalanced node needs rotating on insert - one rotation restores the
 * whole tree, because it also restores the subtree's original height. Delete is
 * harder: it can SHORTEN a subtree, so rebalancing may cascade to the root, up
 * to `O(log n)` rotations.
 *
 * AVL vs red-black: AVL is more strictly balanced (faster lookups), red-black
 * rotates less on write (faster inserts). Which is why C++ `std::map`, Java
 * `TreeMap` and the Linux kernel all use red-black, while read-heavy database
 * indexes lean AVL.
 *
 * JavaScript has no ordered map at all - `Map` preserves *insertion* order, not
 * sort order - so if you need `floor`, `ceil` or an ordered range scan, this is
 * the structure you have to bring yourself.
 */
export class AVLTree {
  #root = null;
  #size = 0;

  // --- the two primitives ---------------------------------------------------
  /** Height of a possibly-absent subtree. An empty tree has height 0. */
  static #heightOf(node) {
    return node ? node.height : 0;
  }

  static #updateHeight(node) {
    node.height = 1 + Math.max(AVLTree.#heightOf(node.left), AVLTree.#heightOf(node.right));
  }

  /** Left height minus right height. Positive means left-heavy. */
  static #balanceOf(node) {
    return node ? AVLTree.#heightOf(node.left) - AVLTree.#heightOf(node.right) : 0;
  }

  /**
   * Left-heavy fix. O(1).
   *
   *         node                 pivot
   *        /    \                /     \
   *     pivot    C      ->      A      node
   *     /   \                          /    \
   *    A     B                        B      C
   *
   * B moves from pivot's right to node's left. Every value in B is greater than
   * pivot and less than node, so it is legal in either position - which is
   * exactly why a rotation preserves the BST ordering.
   *
   * Update pivot's height AFTER node's: node is now pivot's child, so its
   * height has to be settled first.
   */
  static #rotateRight(node) {
    const pivot = node.left;
    node.left = pivot.right;
    pivot.right = node;

    AVLTree.#updateHeight(node); // the lower node first
    AVLTree.#updateHeight(pivot);
    return pivot; // the new subtree root
  }

  /** Right-heavy fix - the exact mirror of #rotateRight. O(1). */
  static #rotateLeft(node) {
    const pivot = node.right;
    node.right = pivot.left;
    pivot.left = node;

    AVLTree.#updateHeight(node);
    AVLTree.#updateHeight(pivot);
    return pivot;
  }

  /** Restore the invariant at one node. Returns the new subtree root. */
  static #rebalance(node) {
    AVLTree.#updateHeight(node);
    const balance = AVLTree.#balanceOf(node);

    if (balance > 1) {
      // left-heavy
      if (AVLTree.#balanceOf(node.left) < 0) {
        node.left = AVLTree.#rotateLeft(node.left); // LR: straighten first
      }
      return AVLTree.#rotateRight(node); // LL
    }
    if (balance < -1) {
      // right-heavy
      if (AVLTree.#balanceOf(node.right) > 0) {
        node.right = AVLTree.#rotateRight(node.right); // RL: straighten first
      }
      return AVLTree.#rotateLeft(node); // RR
    }
    return node; // already balanced
  }

  // --- the public operations ------------------------------------------------
  /** Insert a value. O(log n) guaranteed. Returns false if already present. */
  insert(value) {
    let inserted = false;

    const go = (node) => {
      if (node === null) {
        inserted = true;
        return new AVLNode(value);
      }
      if (value < node.val) node.left = go(node.left);
      else if (value > node.val) node.right = go(node.right);
      else return node; // duplicate: nothing changes
      return AVLTree.#rebalance(node); // unwinding: fix on the way up
    };

    this.#root = go(this.#root);
    if (inserted) this.#size++;
    return inserted;
  }

  /**
   * Delete a value. O(log n) guaranteed. Returns false if absent.
   *
   * The three BST delete cases are unchanged - what AVL adds is the rebalance
   * as the recursion unwinds. Unlike insert, deletion can shorten a subtree, so
   * one rotation may not be enough and the fixing can cascade.
   */
  delete(value) {
    let removed = false;

    /** Remove the leftmost node, rebalancing on the way back up. */
    const deleteMin = (node) => {
      if (node.left === null) return node.right;
      node.left = deleteMin(node.left);
      return AVLTree.#rebalance(node);
    };

    const go = (node) => {
      if (node === null) return null;

      if (value < node.val) {
        node.left = go(node.left);
      } else if (value > node.val) {
        node.right = go(node.right);
      } else {
        removed = true;
        if (node.left === null) return node.right; // 0 or 1 child: splice out
        if (node.right === null) return node.left;

        // Two children: replace with the in-order successor (the smallest
        // value on the right), then delete that successor.
        let successor = node.right;
        while (successor.left !== null) successor = successor.left;
        node.val = successor.val;
        node.right = deleteMin(node.right);
      }
      return AVLTree.#rebalance(node);
    };

    this.#root = go(this.#root);
    if (removed) this.#size--;
    return removed;
  }

  /** O(log n) guaranteed - the whole point of the structure. */
  contains(value) {
    let node = this.#root;
    while (node !== null) {
      if (value === node.val) return true;
      node = value < node.val ? node.left : node.right;
    }
    return false;
  }

  /** Sorted values. O(n). */
  inorder() {
    const out = [];
    const stack = [];
    let node = this.#root;
    while (stack.length || node) {
      while (node) {
        stack.push(node);
        node = node.left;
      }
      node = stack.pop();
      out.push(node.val);
      node = node.right;
    }
    return out;
  }

  get size() {
    return this.#size;
  }

  height() {
    return AVLTree.#heightOf(this.#root);
  }

  /** Verify the invariant everywhere - used by the tests, not by users. */
  isBalanced() {
    const check = (node) => {
      if (node === null) return true;
      if (Math.abs(AVLTree.#balanceOf(node)) > 1) return false;
      // The cached height must also be honest, or the balance is a lie.
      const expected =
        1 + Math.max(AVLTree.#heightOf(node.left), AVLTree.#heightOf(node.right));
      if (node.height !== expected) return false;
      return check(node.left) && check(node.right);
    };
    return check(this.#root);
  }
}

function demo() {
  //            8
  //          /   \
  //         3     10
  //        / \      \
  //       1   6      14
  //          / \     /
  //         4   7   13
  const bst = new BST([8, 3, 10, 1, 6, 14, 4, 7, 13]);
  assert.equal(bst.size, 9);
  assert.deepEqual(bst.inorder(), [1, 3, 4, 6, 7, 8, 10, 13, 14]); // sorted

  assert.ok(!bst.insert(8)); // duplicates rejected
  assert.equal(bst.size, 9);
  assert.ok(bst.has(6) && !bst.has(5));
  assert.equal(bst.search(6).val, 6);

  assert.equal(bst.min(), 1);
  assert.equal(bst.max(), 14);
  assert.equal(new BST().min(), null);

  assert.ok(isValidBST(bst.root));
  // The classic invalid tree: 4 sits in the RIGHT subtree of 5.
  const bad = new TreeNode(5);
  bad.left = new TreeNode(1);
  bad.right = new TreeNode(7);
  bad.right.left = new TreeNode(4);
  assert.ok(!isValidBST(bad));
  assert.ok(isValidBST(null));

  // Deletion, all three cases; the tree must stay valid and sorted.
  assert.ok(bst.delete(1)); // leaf
  assert.deepEqual(bst.inorder(), [3, 4, 6, 7, 8, 10, 13, 14]);
  assert.ok(bst.delete(14)); // one child (13)
  assert.deepEqual(bst.inorder(), [3, 4, 6, 7, 8, 10, 13]);
  assert.ok(bst.delete(3)); // two children
  assert.deepEqual(bst.inorder(), [4, 6, 7, 8, 10, 13]);
  assert.ok(isValidBST(bst.root));
  assert.equal(bst.size, 6);
  assert.ok(!bst.delete(999));

  // Deleting through the root repeatedly must keep the tree valid.
  const drain = new BST([5, 3, 8, 2, 4, 7, 9]);
  for (const v of [5, 3, 8, 2, 4, 7, 9]) {
    assert.ok(drain.delete(v));
    assert.ok(isValidBST(drain.root));
  }
  assert.deepEqual(drain.inorder(), []);
  assert.equal(drain.size, 0);

  const fresh = new BST([8, 3, 10, 1, 6, 14, 4, 7, 13]);
  assert.equal(kthSmallest(fresh.root, 1), 1);
  assert.equal(kthSmallest(fresh.root, 5), 7);
  assert.equal(kthSmallest(fresh.root, 9), 14);
  assert.equal(kthSmallest(fresh.root, 99), null);

  assert.equal(inorderSuccessor(fresh.root, 7), 8);
  assert.equal(inorderSuccessor(fresh.root, 5), 6); // target need not exist
  assert.equal(inorderSuccessor(fresh.root, 14), null);

  assert.equal(lcaBST(fresh.root, 1, 6), 3);
  assert.equal(lcaBST(fresh.root, 4, 13), 8); // they split at the root
  assert.equal(lcaBST(fresh.root, 3, 4), 3); // an ancestor of itself

  assert.equal(floorValue(fresh.root, 5), 4);
  assert.equal(floorValue(fresh.root, 6), 6); // exact match
  assert.equal(floorValue(fresh.root, 0), null);
  assert.equal(ceilValue(fresh.root, 5), 6);
  assert.equal(ceilValue(fresh.root, 15), null);

  assert.equal(rangeSum(fresh.root, 6, 10), 6 + 7 + 8 + 10);
  assert.equal(
    rangeSum(fresh.root, 0, 100),
    fresh.inorder().reduce((a, b) => a + b, 0),
  );
  assert.equal(rangeSum(fresh.root, 100, 200), 0);

  // Balanced construction: 15 sorted values give height 3, not 14.
  const values = Array.from({ length: 15 }, (_, i) => i + 1);
  const balanced = sortedArrayToBST(values);
  assert.ok(isValidBST(balanced));
  assert.equal(treeHeight(balanced), 3);
  assert.equal(new BST(values).height(), 14); // the degenerate case

  // --- AVL ------------------------------------------------------------------
  // The case a plain BST cannot survive: strictly increasing input.
  const avl = new AVLTree();
  for (let value = 1; value <= 31; value++) avl.insert(value);

  assert.equal(avl.height(), 5); // log2(32) - actually balanced
  assert.equal(avl.size, 31);
  assert.deepEqual(
    avl.inorder(),
    Array.from({ length: 31 }, (_, i) => i + 1),
  );
  assert.ok(avl.isBalanced());

  // Each of the four rotation cases, in isolation. All four must end up as the
  // same balanced tree rooted at 20.
  for (const order of [
    [30, 20, 10], // left-left
    [10, 20, 30], // right-right
    [30, 10, 20], // left-right
    [10, 30, 20], // right-left
  ]) {
    const tree = new AVLTree();
    for (const value of order) tree.insert(value);
    assert.equal(tree.height(), 2);
    assert.deepEqual(tree.inorder(), [10, 20, 30]);
    assert.ok(tree.isBalanced());
  }

  // Duplicates are rejected, and the size stays honest.
  const dup = new AVLTree();
  assert.ok(dup.insert(5));
  assert.ok(!dup.insert(5));
  assert.equal(dup.size, 1);
  assert.ok(!dup.delete(99)); // absent
  assert.ok(dup.delete(5));
  assert.equal(dup.size, 0);
  assert.deepEqual(dup.inorder(), []);

  // Deterministic PRNG so a failure is always reproducible.
  let seed = 12;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Against a sorted Set, with the invariant re-checked after EVERY operation -
  // a rotation bug that only shows up mid-sequence would be invisible to an
  // end-state-only test.
  for (let trial = 0; trial < 60; trial++) {
    const tree = new AVLTree();
    const reference = new Set();

    for (let step = 0; step < 80; step++) {
      const value = Math.floor(random() * 41);
      if (random() < 0.65) {
        assert.equal(tree.insert(value), !reference.has(value));
        reference.add(value);
      } else {
        assert.equal(tree.delete(value), reference.has(value));
        reference.delete(value);
      }

      // An in-order walk that comes out sorted IS the BST invariant.
      const expected = [...reference].sort((a, b) => a - b);
      assert.deepEqual(tree.inorder(), expected);
      assert.ok(tree.isBalanced()); // still within +/-1 everywhere
      assert.equal(tree.size, reference.size);

      // The height bound AVL promises: h <= 1.44 * log2(n + 2)
      if (reference.size) {
        assert.ok(tree.height() <= 1.44 * Math.log2(reference.size + 2));
      }
    }
  }

  console.log("12-Binary-Search-Tree (JavaScript): all checks passed");
  console.log(
    "  AVL invariant re-verified after every one of 4800 random " +
      "insert/delete operations",
  );
}

demo();
