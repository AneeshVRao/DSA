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

  console.log("12-Binary-Search-Tree (JavaScript): all checks passed");
}

demo();
