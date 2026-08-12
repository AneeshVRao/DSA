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
// ============================================================================
// Euler tour - flattening a tree into an array
// ============================================================================
/**
 * The full walk: every node recorded on ENTRY and again after each child. O(n).
 *
 * A DFS that appends the current node every time control passes through it -
 * on the way in, and again after returning from each child. The result has
 * exactly 2n - 1 entries for an n-node tree.
 *
 * Why it matters: it turns a TREE problem into an ARRAY problem. The lowest
 * common ancestor of u and v is the SHALLOWEST node in the tour between any
 * occurrence of u and any occurrence of v - which makes LCA a range-minimum
 * query, answerable in O(1) with the sparse table from chapter 19.
 *
 *           1
 *          / .        tour: 1 2 4 2 5 2 1 3 1
 *         2   3       LCA(4, 5) = the shallowest node between them = 2
 *        / .
 *       4   5
 *
 * The three classic traversals are all projections of this one walk:
 *   preorder  - take each node at its FIRST appearance
 *   inorder   - take each node at its middle appearance (binary trees)
 *   postorder - take each node at its LAST appearance
 */
export function eulerTour(root) {
  const tour = [];
  if (root === null) return tour;

  const walk = (node) => {
    tour.push(node.val);
    for (const child of [node.left, node.right]) {
      if (child) {
        walk(child);
        tour.push(node.val); // record the node again on the way back
      }
    }
  };

  walk(root);
  return tour;
}

/**
 * Entry and exit timestamps per node. O(n).
 *
 * The other Euler tour, and the more useful one in practice. Stamp a counter
 * on the way in and on the way out. Then:
 *
 *     u is an ancestor of v   <=>   tin[u] <= tin[v] and tout[v] <= tout[u]
 *
 * An ancestor test in O(1), with no walking. Better still, a node's subtree
 * occupies the CONTIGUOUS range [tin, tout) of the entry order - so "sum over
 * a subtree" or "add x to a whole subtree" becomes a range query on a flat
 * array, which a Fenwick or segment tree handles in O(log n).
 *
 * This is the standard preprocessing for subtree queries, and half of
 * heavy-light decomposition.
 *
 * Iterative, to avoid blowing the stack on a degenerate (list-shaped) tree.
 *
 * Returns a `Map` of `value -> [tin, tout]`.
 */
export function eulerInOut(root) {
  const times = new Map();
  if (root === null) return times;

  let clock = 0;
  const entry = new Map();
  // [node, leaving?] - false means "arriving", true means "leaving".
  const stack = [[root, false]];

  while (stack.length) {
    const [node, leaving] = stack.pop();

    if (leaving) {
      times.set(node.val, [entry.get(node.val), clock]);
      continue;
    }

    entry.set(node.val, clock++);
    stack.push([node, true]); // schedule the exit stamp
    // Right first, so the left child comes off the stack first.
    for (const child of [node.right, node.left]) {
      if (child) stack.push([child, false]);
    }
  }
  return times;
}

// ============================================================================
// Expression trees - an AST for arithmetic
// ============================================================================
const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2 };

/**
 * A node in an expression tree: an operator with two children, or a leaf.
 *
 * An expression tree is the smallest interesting abstract syntax tree, and it
 * makes the three traversals mean something concrete rather than academic:
 *
 *           *
 *          / \             infix   (3 + 4) * 2     <- inorder
 *         +   2            postfix  3 4 + 2 *      <- postorder
 *        / \               prefix   * + 3 4 2      <- preorder
 *       3   4
 *
 * The tree carries precedence and grouping in its SHAPE, so postfix and prefix
 * need no brackets at all - the structure is unambiguous without them. Only
 * infix needs parentheses, because it throws that information away.
 *
 * This is what a compiler front-end builds, and evaluating it is a post-order
 * fold: children first, then combine.
 */
export class ExprNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }

  isOperator() {
    return Object.hasOwn(PRECEDENCE, this.value);
  }
}

/** Split on whitespace, brackets and operators. Multi-digit numbers survive. */
export function tokenizeExpression(expression) {
  return expression.match(/\d+\.?\d*|[-+*/()]/g) ?? [];
}

/**
 * Shunting-yard: infix to postfix in one pass. O(n).
 *
 * Numbers go straight to the output. Operators wait on a stack until something
 * of LOWER precedence arrives, at which point they are popped - which is
 * exactly what makes `*` bind tighter than `+` with no lookahead or recursion.
 *
 * Left associativity is the `>=` in the pop condition: for `8 - 3 - 2` the
 * first `-` is popped when the second arrives, giving `(8-3)-2 = 3` rather than
 * `8-(3-2) = 7`. Changing it to `>` would silently make subtraction
 * right-associative - a real bug, and an easy one to miss.
 *
 * Throws on malformed input. The bare algorithm does not validate at all - see
 * the comment in the body.
 */
export function infixToPostfix(tokens) {
  const output = [];
  const operators = [];

  // Shunting-yard on its own does NOT validate. Fed "+ 1 2" it happily emits
  // "1 2 +" and reports success, silently reinterpreting prefix input as infix.
  // Tracking what is expected next is what turns a garbled expression into an
  // error instead of a plausible wrong answer.
  let expectOperand = true;

  for (const token of tokens) {
    if (Object.hasOwn(PRECEDENCE, token)) {
      if (expectOperand) throw new SyntaxError(`operator ${token} where an operand was expected`);
      while (
        operators.length &&
        operators.at(-1) !== "(" &&
        PRECEDENCE[operators.at(-1)] >= PRECEDENCE[token]
      ) {
        output.push(operators.pop()); // >= : LEFT associative
      }
      operators.push(token);
      expectOperand = true;
    } else if (token === "(") {
      if (!expectOperand) throw new SyntaxError("'(' directly after an operand");
      operators.push(token);
    } else if (token === ")") {
      if (expectOperand) throw new SyntaxError("')' where an operand was expected");
      while (operators.length && operators.at(-1) !== "(") output.push(operators.pop());
      if (!operators.length) throw new SyntaxError("unbalanced parentheses");
      operators.pop(); // discard the "("
      // A closed group behaves as a completed operand.
    } else {
      if (!expectOperand) throw new SyntaxError(`two operands in a row near ${token}`);
      output.push(token); // a number
      expectOperand = false;
    }
  }

  if (expectOperand) throw new SyntaxError("expression ends with an operator");

  while (operators.length) {
    if (operators.at(-1) === "(") throw new SyntaxError("unbalanced parentheses");
    output.push(operators.pop());
  }
  return output;
}

/**
 * Build the tree from postfix in one stack pass. O(n).
 *
 * Postfix is the natural input: by the time an operator appears, both of its
 * operands are already complete subtrees sitting on the stack.
 *
 * The RIGHT operand pops FIRST - it was pushed last. Getting that backwards
 * still builds a valid-looking tree and still evaluates correctly for `+` and
 * `*`; it silently reverses `-` and `/`. A test using only commutative
 * operators would never catch it.
 */
export function buildFromPostfix(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (Object.hasOwn(PRECEDENCE, token)) {
      if (stack.length < 2) throw new SyntaxError(`operator ${token} has too few operands`);
      const right = stack.pop(); // RIGHT first
      const left = stack.pop();
      stack.push(new ExprNode(token, left, right));
    } else {
      stack.push(new ExprNode(token));
    }
  }

  if (stack.length !== 1) throw new SyntaxError("malformed expression");
  return stack[0];
}

/** Infix string to expression tree: tokenize, shunting-yard, then build. */
export function buildExpressionTree(expression) {
  return buildFromPostfix(infixToPostfix(tokenizeExpression(expression)));
}

/** Evaluate bottom-up. O(n) - a post-order fold. */
export function evaluateExpression(node) {
  if (!node.isOperator()) return Number(node.value);

  const left = evaluateExpression(node.left);
  const right = evaluateExpression(node.right);

  if (node.value === "+") return left + right;
  if (node.value === "-") return left - right;
  if (node.value === "*") return left * right;
  // JS would return Infinity rather than throwing - surface it explicitly.
  if (right === 0) throw new RangeError("division by zero in expression");
  return left / right;
}

/** PREorder: operator, left, right. No brackets needed - unambiguous. */
export function toPrefix(node) {
  if (!node.isOperator()) return [node.value];
  return [node.value, ...toPrefix(node.left), ...toPrefix(node.right)];
}

/** POSTorder: left, right, operator. What a stack machine executes. */
export function toPostfix(node) {
  if (!node.isOperator()) return [node.value];
  return [...toPostfix(node.left), ...toPostfix(node.right), node.value];
}

/**
 * INorder, fully parenthesised.
 *
 * Every operator gets brackets. Emitting infix without them would lose the
 * grouping the tree encodes - `* + 3 4 2` is unambiguous, `3 + 4 * 2` is not.
 */
export function toInfix(node) {
  if (!node.isOperator()) return node.value;
  return `(${toInfix(node.left)} ${node.value} ${toInfix(node.right)})`;
}

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
  // --- Euler tour -------------------------------------------------------------
  //        1
  //       / \
  //      2   3
  //     / \
  //    4   5
  const eulerTree = buildTree([1, 2, 3, 4, 5]);
  assert.deepEqual(eulerTour(eulerTree), [1, 2, 4, 2, 5, 2, 1, 3, 1]); // 2n-1
  assert.deepEqual(eulerTour(null), []);
  assert.deepEqual(eulerTour(new TreeNode(7)), [7]);

  const times = eulerInOut(eulerTree);
  assert.deepEqual(times.get(1), [0, 5]); // the root spans everything
  assert.deepEqual(times.get(4), [2, 3]); // leaves are width 1
  assert.deepEqual(times.get(5), [3, 4]);
  assert.equal(eulerInOut(null).size, 0);

  // The ancestor test the timestamps exist for.
  const isAncestor = (u, v) =>
    times.get(u)[0] <= times.get(v)[0] && times.get(v)[1] <= times.get(u)[1];
  assert.ok(isAncestor(1, 4) && isAncestor(2, 5));
  assert.ok(!isAncestor(3, 4) && !isAncestor(4, 2));
  assert.ok(isAncestor(3, 3)); // a node contains itself

  // Against brute force on random trees.
  let eulerSeed = 11;
  const eulerRandom = () => {
    eulerSeed = (eulerSeed * 1103515245 + 12345) & 0x7fffffff;
    return eulerSeed / 0x7fffffff;
  };

  let nextValue = 0;
  const randomTree = (size) => {
    if (size === 0) return null;
    const leftSize = Math.floor(eulerRandom() * size); // 0..size-1
    const node = new TreeNode(nextValue++);
    node.left = randomTree(leftSize);
    node.right = randomTree(size - 1 - leftSize);
    return node;
  };

  const subtreeValues = (node) =>
    node === null ? [] : [node.val, ...subtreeValues(node.left), ...subtreeValues(node.right)];

  for (let trial = 0; trial < 60; trial++) {
    const size = 1 + Math.floor(eulerRandom() * 40);
    const root = randomTree(size);

    assert.equal(eulerTour(root).length, 2 * size - 1);

    const stamps = eulerInOut(root);
    assert.equal(stamps.size, size);

    // Every subtree is a CONTIGUOUS timestamp range of its own size - the
    // property that turns subtree queries into range queries.
    const check = (node) => {
      if (node === null) return;
      const [tin, tout] = stamps.get(node.val);
      const members = subtreeValues(node);
      assert.equal(tout - tin, members.length);
      for (const other of members) {
        assert.ok(tin <= stamps.get(other)[0] && stamps.get(other)[0] < tout);
      }
      check(node.left);
      check(node.right);
    };
    check(root);
  }
  // --- Expression trees -------------------------------------------------------
  {
    const tree = buildExpressionTree("3 + 4 * 2");
    assert.equal(evaluateExpression(tree), 11); // * binds tighter than +
    assert.deepEqual(toPostfix(tree), ["3", "4", "2", "*", "+"]);
    assert.deepEqual(toPrefix(tree), ["+", "3", "*", "4", "2"]);
    assert.equal(toInfix(tree), "(3 + (4 * 2))");

    const bracketed = buildExpressionTree("(3 + 4) * 2");
    assert.equal(evaluateExpression(bracketed), 14); // brackets override it
    assert.deepEqual(toPostfix(bracketed), ["3", "4", "+", "2", "*"]);
    assert.deepEqual(toPrefix(bracketed), ["*", "+", "3", "4", "2"]);

    // Left associativity and operand order. Both are silent when wrong: right
    // for + and *, WRONG for - and /.
    for (const [text, expected] of [
      ["8 - 3 - 2", 3], // not 7
      ["16 / 4 / 2", 2], // not 8
      ["8 - 3", 5], // not -5
      ["42", 42], // a lone leaf
      ["2 * (3 + 4) - 5", 9],
    ]) {
      assert.equal(evaluateExpression(buildExpressionTree(text)), expected);
    }

    // Malformed input is rejected, not silently mis-parsed.
    for (const bad of ["(1 + 2", "1 + 2)", "1 +", "+ 1 2", "1 2"]) {
      assert.throws(() => buildExpressionTree(bad), SyntaxError);
    }
    assert.throws(() => evaluateExpression(buildExpressionTree("1 / 0")), RangeError);

    // Against an INDEPENDENT reference on random expressions: collapse every
    // `*` first, then add and subtract what is left. That directly encodes
    // "* binds tighter than +", so it tests precedence against a different
    // implementation rather than against itself. (Deliberately not eval() - it
    // is the wrong habit to demonstrate, and this is a stronger check anyway.)
    const referenceValue = (terms) => {
      const collapsed = [terms[0]];
      for (let i = 1; i < terms.length; i += 2) {
        if (terms[i] === "*") {
          collapsed[collapsed.length - 1] = String(
            Number(collapsed.at(-1)) * Number(terms[i + 1]),
          );
        } else {
          collapsed.push(terms[i], terms[i + 1]);
        }
      }
      let total = Number(collapsed[0]);
      for (let i = 1; i < collapsed.length; i += 2) {
        const value = Number(collapsed[i + 1]);
        total = collapsed[i] === "+" ? total + value : total - value;
      }
      return total;
    };

    let exprSeed = 11;
    const exprRandom = () => {
      exprSeed = (exprSeed * 1103515245 + 12345) & 0x7fffffff;
      return exprSeed / 0x7fffffff;
    };

    for (let trial = 0; trial < 200; trial++) {
      const terms = [String(1 + Math.floor(exprRandom() * 9))];
      const extra = 1 + Math.floor(exprRandom() * 5);
      for (let k = 0; k < extra; k++) {
        terms.push("+-*"[Math.floor(exprRandom() * 3)]);
        terms.push(String(1 + Math.floor(exprRandom() * 9)));
      }
      const text = terms.join(" ");

      const built = buildExpressionTree(text);
      assert.equal(evaluateExpression(built), referenceValue(terms));

      // postfix -> tree -> postfix must be a fixed point
      const again = buildFromPostfix(toPostfix(built));
      assert.equal(evaluateExpression(again), evaluateExpression(built));
      assert.deepEqual(toPostfix(again), toPostfix(built));

      // and the fully-bracketed infix must re-parse to the same value
      assert.equal(
        evaluateExpression(buildExpressionTree(toInfix(built))),
        evaluateExpression(built),
      );
    }
  }



  console.log("11-Trees (JavaScript): all checks passed");
}

demo();
