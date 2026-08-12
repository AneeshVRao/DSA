/**
 * 11 - Trees: binary trees, all four traversals (recursive, iterative and
 * Morris), and the bottom-up recursion pattern that solves most tree problems.
 *
 * Run:  node trees.js
 */

import assert from "node:assert/strict";

// ============================================================================
// Node and construction
// ============================================================================
export class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Build from a level-order array where null marks a missing child - the
 * LeetCode input format, so tests read the same way there.
 */
export function buildTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let head = 0; // head index, never shift()
  let i = 1;
  while (head < queue.length && i < values.length) {
    const node = queue[head++];
    if (i < values.length) {
      if (values[i] !== null) {
        node.left = new TreeNode(values[i]);
        queue.push(node.left);
      }
      i++;
    }
    if (i < values.length) {
      if (values[i] !== null) {
        node.right = new TreeNode(values[i]);
        queue.push(node.right);
      }
      i++;
    }
  }
  return root;
}

// ============================================================================
// 1. Depth-first traversals - recursive
// ============================================================================
/** node, left, right. O(n) time, O(h) stack. Used to copy or serialise. */
export function preorder(root) {
  if (root === null) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

/** left, node, right. On a BST this emits values in SORTED order. */
export function inorder(root) {
  if (root === null) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

/** left, right, node. The shape of every bottom-up computation. */
export function postorder(root) {
  if (root === null) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
}

// ============================================================================
// 2. Depth-first traversals - iterative
// ============================================================================
/** Explicit stack. Push RIGHT first so the left child comes out first. */
export function preorderIterative(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}

/** Dive left pushing nodes; pop, visit, then turn right. */
export function inorderIterative(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      // as far left as possible
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}

/** Preorder as node-right-left, then reversed - far easier to get right. */
export function postorderIterative(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();
}

/**
 * Inorder in O(1) space - no stack, no recursion.
 *
 * Each node with a left child gets a temporary thread from its inorder
 * predecessor (rightmost node of the left subtree) back to itself. Following
 * that thread later returns us here; the thread is then removed, so the tree
 * ends exactly as it started.
 */
export function morrisInorder(root) {
  const out = [];
  let node = root;
  while (node) {
    if (!node.left) {
      out.push(node.val);
      node = node.right;
    } else {
      let predecessor = node.left;
      while (predecessor.right && predecessor.right !== node) {
        predecessor = predecessor.right;
      }
      if (!predecessor.right) {
        predecessor.right = node; // create the thread
        node = node.left;
      } else {
        predecessor.right = null; // thread used: undo it
        out.push(node.val);
        node = node.right;
      }
    }
  }
  return out;
}

// ============================================================================
// 3. Breadth-first traversal
// ============================================================================
/**
 * One inner array per level. O(n) time, O(w) space.
 * Capturing the level size before the inner loop is what separates levels,
 * and the head index keeps dequeuing O(1) (shift() would be O(n)).
 */
export function levelOrder(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const levelSize = queue.length - head;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  return levels;
}

export function zigzagLevelOrder(root) {
  return levelOrder(root).map((level, i) => (i % 2 === 0 ? level : [...level].reverse()));
}

/** What you see from the right: the last node of each level. */
export function rightSideView(root) {
  return levelOrder(root).map((level) => level.at(-1));
}

// ============================================================================
// 4. Bottom-up recursion
// ============================================================================
/** Edges on the longest downward path. Empty = -1, single node = 0. */
export function height(root) {
  if (root === null) return -1;
  return 1 + Math.max(height(root.left), height(root.right));
}

export function countNodes(root) {
  return root === null ? 0 : 1 + countNodes(root.left) + countNodes(root.right);
}

export function countLeaves(root) {
  if (root === null) return 0;
  if (!root.left && !root.right) return 1;
  return countLeaves(root.left) + countLeaves(root.right);
}

/**
 * Every node's subtree heights differ by at most 1. O(n), not O(n^2).
 * The trick: return the height AND the verdict from a single traversal.
 */
export function isBalanced(root) {
  const check = (node) => {
    if (node === null) return { ok: true, h: -1 };
    const left = check(node.left);
    if (!left.ok) return { ok: false, h: 0 }; // short-circuit
    const right = check(node.right);
    if (!right.ok) return { ok: false, h: 0 };
    return {
      ok: Math.abs(left.h - right.h) <= 1,
      h: 1 + Math.max(left.h, right.h),
    };
  };
  return check(root).ok;
}

/**
 * Longest path between any two nodes, in edges. O(n).
 * The path either bends at some node (leftH + rightH + 2) or lies wholly
 * inside one subtree - so track the best while computing heights.
 */
export function diameter(root) {
  let best = 0;
  const depth = (node) => {
    if (node === null) return -1;
    const left = depth(node.left);
    const right = depth(node.right);
    best = Math.max(best, left + right + 2);
    return 1 + Math.max(left, right);
  };
  depth(root);
  return best;
}

/**
 * Largest node-to-node path sum. A negative branch contributes nothing, so
 * clamp it to 0 - that single Math.max(0, ...) is what makes negatives work.
 */
export function maxPathSum(root) {
  if (root === null) throw new Error("empty tree has no path");
  let best = -Infinity;
  const gain = (node) => {
    if (node === null) return 0;
    const left = Math.max(gain(node.left), 0);
    const right = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + left + right); // path bending here
    return node.val + Math.max(left, right); // only ONE branch goes upward
  };
  gain(root);
  return best;
}

// ============================================================================
// 5. Structural operations
// ============================================================================
export function invert(root) {
  if (root === null) return null;
  [root.left, root.right] = [invert(root.right), invert(root.left)];
  return root;
}

export function isSameTree(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null || a.val !== b.val) return false;
  return isSameTree(a.left, b.left) && isSameTree(a.right, b.right);
}

/** Mirror comparison: OUTER against OUTER, inner against inner. */
export function isSymmetric(root) {
  const mirror = (a, b) => {
    if (a === null && b === null) return true;
    if (a === null || b === null || a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return root === null || mirror(root.left, root.right);
}

/**
 * Deepest node with both p and q below it. If they come back from different
 * subtrees, this node is the answer; otherwise it is further up.
 */
export function lowestCommonAncestor(root, p, q) {
  if (root === null || root.val === p || root.val === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // p and q split here
  return left ?? right;
}

// ============================================================================
// 6. Paths
// ============================================================================
export function hasPathSum(root, target) {
  if (root === null) return false;
  if (!root.left && !root.right) return root.val === target;
  const remaining = target - root.val;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}

/** Every root-to-leaf path. Classic backtracking: push, recurse, pop. */
export function allPaths(root) {
  const results = [];
  const path = [];
  const walk = (node) => {
    if (node === null) return;
    path.push(node.val); // choose
    if (!node.left && !node.right) {
      results.push([...path]); // COPY at the leaf
    } else {
      walk(node.left);
      walk(node.right);
    }
    path.pop(); // un-choose
  };
  walk(root);
  return results;
}

// ============================================================================
// 7. Serialisation
// ============================================================================
/** Preorder with explicit "#" for null - without markers it is ambiguous. */
export function serialize(root) {
  const parts = [];
  const walk = (node) => {
    if (node === null) {
      parts.push("#");
      return;
    }
    parts.push(String(node.val));
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  return parts.join(",");
}

export function deserialize(data) {
  const tokens = data.split(",");
  let i = 0;
  const build = () => {
    const token = tokens[i++];
    if (token === "#") return null;
    const node = new TreeNode(Number(token));
    node.left = build();
    node.right = build();
    return node;
  };
  return build();
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  //         1
  //       /   \
  //      2     3
  //     / \
  //    4   5
  const tree = buildTree([1, 2, 3, 4, 5]);

  assert.deepEqual(preorder(tree), [1, 2, 4, 5, 3]);
  assert.deepEqual(inorder(tree), [4, 2, 5, 1, 3]);
  assert.deepEqual(postorder(tree), [4, 5, 2, 3, 1]);

  // The iterative versions must agree with the recursive ones on every shape.
  for (const values of [[1, 2, 3, 4, 5], [1], [1, null, 2], [1, 2, null, 3], []]) {
    const t = buildTree(values);
    assert.deepEqual(preorderIterative(t), preorder(t));
    assert.deepEqual(inorderIterative(t), inorder(t));
    assert.deepEqual(postorderIterative(t), postorder(t));
    assert.deepEqual(morrisInorder(t), inorder(t));
    assert.deepEqual(inorder(t), inorder(t)); // Morris restored the tree
  }

  assert.deepEqual(levelOrder(tree), [[1], [2, 3], [4, 5]]);
  assert.deepEqual(zigzagLevelOrder(tree), [[1], [3, 2], [4, 5]]);
  assert.deepEqual(rightSideView(tree), [1, 3, 5]);
  assert.deepEqual(levelOrder(null), []);

  assert.equal(height(tree), 2);
  assert.equal(height(null), -1);
  assert.equal(height(buildTree([1])), 0);
  assert.equal(countNodes(tree), 5);
  assert.equal(countLeaves(tree), 3); // 4, 5, 3

  assert.ok(isBalanced(tree));
  assert.ok(isBalanced(null));
  assert.ok(!isBalanced(buildTree([1, 2, null, 3])));

  assert.equal(diameter(tree), 3); // 4 -> 2 -> 1 -> 3
  assert.equal(diameter(buildTree([1])), 0);

  assert.equal(maxPathSum(buildTree([1, 2, 3])), 6);
  assert.equal(maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])), 42);

  assert.deepEqual(levelOrder(invert(buildTree([1, 2, 3, 4, 5]))), [
    [1],
    [3, 2],
    [5, 4],
  ]);

  assert.ok(isSameTree(buildTree([1, 2]), buildTree([1, 2])));
  assert.ok(!isSameTree(buildTree([1, 2]), buildTree([1, null, 2])));
  assert.ok(isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])));
  assert.ok(!isSymmetric(buildTree([1, 2, 2, null, 3, null, 3])));

  assert.equal(lowestCommonAncestor(tree, 4, 5).val, 2);
  assert.equal(lowestCommonAncestor(tree, 4, 3).val, 1); // they split at root

  assert.ok(hasPathSum(tree, 7)); // 1 + 2 + 4
  assert.ok(!hasPathSum(tree, 100));
  assert.deepEqual(allPaths(tree), [
    [1, 2, 4],
    [1, 2, 5],
    [1, 3],
  ]);

  const encoded = serialize(tree);
  assert.equal(encoded, "1,2,4,#,#,5,#,#,3,#,#");
  assert.deepEqual(preorder(deserialize(encoded)), preorder(tree));
  assert.deepEqual(inorder(deserialize(encoded)), inorder(tree));
  assert.equal(serialize(deserialize(encoded)), encoded); // round trip
  assert.equal(deserialize(serialize(null)), null);

  console.log("11-Trees (JavaScript): all checks passed");
}

demo();
