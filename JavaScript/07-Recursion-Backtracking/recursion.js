/**
 * 07 - Recursion and Backtracking: from factorial to N-Queens, all on the same
 * choose / explore / un-choose skeleton.
 *
 * Run:  node recursion.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. Plain recursion
// ============================================================================
/** O(n) time, O(n) stack. The base case is what stops the descent. */
export function factorial(n) {
  if (n < 0) throw new RangeError("factorial is undefined for negatives");
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/** O(2^n): the same subproblems are recomputed exponentially often. */
export function fibNaive(n) {
  if (n < 2) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

/** O(n) time and space: each state is computed once and cached. */
export function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

/** Fast exponentiation: x^n = (x^(n/2))^2. O(log n) instead of O(n). */
export function power(base, exp) {
  if (exp < 0) return 1 / power(base, -exp);
  if (exp === 0) return 1;
  const half = power(base, Math.floor(exp / 2));
  return exp % 2 === 0 ? half * half : half * half * base;
}

/** Digit recursion: strip one digit per call. O(log n). */
export function sumDigits(n) {
  n = Math.abs(n);
  return n < 10 ? n : (n % 10) + sumDigits(Math.floor(n / 10));
}

/**
 * Tower of Hanoi. Exactly 2^n - 1 moves, and that bound is provably optimal.
 * To move n disks: move n-1 aside, move the biggest, move the n-1 back.
 */
export function hanoi(n, source = "A", target = "C", spare = "B") {
  if (n === 0) return [];
  return [
    ...hanoi(n - 1, source, spare, target),
    [source, target],
    ...hanoi(n - 1, spare, target, source),
  ];
}

// ============================================================================
// 2. Backtracking - subsets and permutations
// ============================================================================
/** All 2^n subsets. O(n * 2^n) - the n is the cost of copying each path. */
export function subsets(nums) {
  const results = [];
  const path = [];

  function backtrack(start) {
    results.push([...path]); // COPY: path keeps mutating
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // 1. choose
      backtrack(i + 1); // 2. explore (i+1: no reuse)
      path.pop(); // 3. un-choose
    }
  }

  backtrack(0);
  return results;
}

/** All n! orderings. O(n * n!). `used` is what prunes the tree. */
export function permutations(nums) {
  const results = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    if (path.length === nums.length) {
      results.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue; // prune: already placed
      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false; // undo BOTH pieces of state
    }
  }

  backtrack();
  return results;
}

/**
 * Every combination summing to target; candidates may be reused.
 * Sorting lets us break instead of continue once the remainder goes negative.
 */
export function combinationSum(candidates, target) {
  const ordered = [...candidates].sort((a, b) => a - b);
  const results = [];
  const path = [];

  function backtrack(start, remaining) {
    if (remaining === 0) {
      results.push([...path]);
      return;
    }
    for (let i = start; i < ordered.length; i++) {
      if (ordered[i] > remaining) break; // prune the whole tail
      path.push(ordered[i]);
      backtrack(i, remaining - ordered[i]); // i, not i+1: reuse allowed
      path.pop();
    }
  }

  backtrack(0, target);
  return results;
}

/**
 * All valid combinations of n pairs (Catalan(n) of them).
 * Two rules make every string valid by construction:
 *   open < n        -> we may still open
 *   close < open    -> we may only close what is already open
 */
export function generateParentheses(n) {
  const results = [];
  const path = [];

  function backtrack(open, close) {
    if (path.length === 2 * n) {
      results.push(path.join(""));
      return;
    }
    if (open < n) {
      path.push("(");
      backtrack(open + 1, close);
      path.pop();
    }
    if (close < open) {
      path.push(")");
      backtrack(open, close + 1);
      path.pop();
    }
  }

  backtrack(0, 0);
  return results;
}

// ============================================================================
// 3. Backtracking on a board
// ============================================================================
/**
 * N-Queens. One queen per row is baked into the recursion, so only the column
 * and the two diagonals need tracking: (r - c) and (r + c) must be unique.
 *
 * Pruning turns a raw 8^8 = 16.7M search into roughly 2k explored nodes.
 */
export function solveNQueens(n) {
  const results = [];
  const cols = new Set();
  const diag = new Set(); // r - c
  const anti = new Set(); // r + c
  const placement = []; // placement[row] = column

  function backtrack(row) {
    if (row === n) {
      results.push(
        placement.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)),
      );
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag.has(row - col) || anti.has(row + col)) continue;
      cols.add(col);
      diag.add(row - col);
      anti.add(row + col);
      placement.push(col);

      backtrack(row + 1);

      placement.pop();
      anti.delete(row + col);
      diag.delete(row - col);
      cols.delete(col);
    }
  }

  backtrack(0);
  return results;
}

/**
 * Does `word` exist along a path of adjacent cells? O(rows * cols * 4^len).
 * The visited mark is written into the board and restored - that restore IS
 * the backtrack step.
 */
export function wordSearch(board, word) {
  if (!word || !board.length || !board[0].length) return false;
  const rows = board.length;
  const cols = board[0].length;

  function backtrack(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[i]) return false; // prune

    const saved = board[r][c];
    board[r][c] = "#"; // mark visited
    const found =
      backtrack(r + 1, c, i + 1) ||
      backtrack(r - 1, c, i + 1) ||
      backtrack(r, c + 1, i + 1) ||
      backtrack(r, c - 1, i + 1);
    board[r][c] = saved; // restore
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }
  return false;
}

// ============================================================================
// 4. Turning recursion into iteration
// ============================================================================
/** Same result, O(1) stack. Any recursion can be rewritten this way. */
export function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Depth-first traversal with an explicit stack instead of the call stack -
 * the escape hatch when recursion depth would overflow V8's ~10k frames.
 */
export function dfsIterative(graph, start) {
  const visited = new Set();
  const order = [];
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    const neighbours = graph.get(node) ?? [];
    for (let i = neighbours.length - 1; i >= 0; i--) stack.push(neighbours[i]);
  }
  return order;
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  assert.equal(factorial(0), 1);
  assert.equal(factorial(5), 120);
  assert.equal(factorialIterative(5), factorial(5));

  assert.equal(fibNaive(10), 55);
  assert.equal(fibMemo(50), 12586269025); // instant thanks to the cache

  assert.equal(power(2, 10), 1024);
  assert.equal(power(2, 0), 1);
  assert.equal(power(2, -2), 0.25);
  assert.equal(sumDigits(9875), 29);

  const moves = hanoi(3);
  assert.equal(moves.length, 7); // 2^3 - 1, provably optimal
  assert.deepEqual(moves[0], ["A", "C"]);
  assert.deepEqual(moves.at(-1), ["A", "C"]);

  const subs = subsets([1, 2, 3]);
  assert.equal(subs.length, 8); // 2^3
  assert.ok(subs.some((s) => s.length === 0));
  assert.ok(subs.some((s) => s.join() === "1,2,3"));

  const perms = permutations([1, 2, 3]);
  assert.equal(perms.length, 6); // 3!
  assert.equal(new Set(perms.map((p) => p.join())).size, 6); // all distinct

  const combos = combinationSum([2, 3, 6, 7], 7).map((c) => c.join());
  assert.deepEqual(combos.sort(), ["2,2,3", "7"]);

  const parens = generateParentheses(3);
  assert.equal(parens.length, 5); // Catalan(3)
  assert.ok(parens.includes("((()))"));
  assert.ok(parens.includes("()()()"));

  assert.equal(solveNQueens(4).length, 2); // the two 4x4 solutions
  assert.equal(solveNQueens(8).length, 92); // the classic answer
  assert.equal(solveNQueens(1).length, 1);
  assert.equal(solveNQueens(3).length, 0); // no solution exists

  const board = [
    [..."ABCE"],
    [..."SFCS"],
    [..."ADEE"],
  ];
  assert.ok(wordSearch(board, "ABCCED"));
  assert.ok(wordSearch(board, "SEE"));
  assert.ok(!wordSearch(board, "ABCB")); // cannot reuse a cell
  assert.deepEqual(board[0], [..."ABCE"]); // board restored, not corrupted

  const graph = new Map([
    [1, [2, 3]],
    [2, [4]],
    [3, [4]],
    [4, []],
  ]);
  assert.deepEqual(dfsIterative(graph, 1), [1, 2, 4, 3]);

  console.log("07-Recursion-Backtracking (JavaScript): all checks passed");
}

demo();
