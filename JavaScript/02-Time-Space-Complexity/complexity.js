/**
 * 02 - Time and Space Complexity: measured, not memorised.
 *
 * Every function returns { value, ops } so growth is exact and reproducible
 * instead of depending on machine speed.
 *
 * Run:  node complexity.js
 */

import assert from "node:assert/strict";

// -------------------------------------------------------------------- O(1) --
export function constantFirst(nums) {
  return { value: nums[0], ops: 1 }; // indexing ignores array length
}

// ---------------------------------------------------------------- O(log n) --
export function binarySearch(sorted, target) {
  let lo = 0;
  let hi = sorted.length - 1;
  let ops = 0;
  while (lo <= hi) {
    ops++;
    const mid = (lo + hi) >> 1; // >> 1 is integer halving
    if (sorted[mid] === target) return { value: mid, ops };
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return { value: -1, ops };
}

// -------------------------------------------------------------------- O(n) --
export function linearSum(nums) {
  let total = 0;
  let ops = 0;
  for (const x of nums) {
    total += x;
    ops++;
  }
  return { value: total, ops };
}

// ------------------------------------------------------------------ O(n^2) --
/** Compare every pair. Correct, and unusable past a few thousand items. */
export function hasDuplicateQuadratic(nums) {
  let ops = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      ops++;
      if (nums[i] === nums[j]) return { value: true, ops };
    }
  }
  return { value: false, ops };
}

/** Same answer with a Set: O(n) time, O(n) space - memory buys time. */
export function hasDuplicateLinear(nums) {
  const seen = new Set();
  let ops = 0;
  for (const x of nums) {
    ops++;
    if (seen.has(x)) return { value: true, ops }; // O(1), unlike includes()
    seen.add(x);
  }
  return { value: false, ops };
}

// ------------------------------------------------- includes() vs Set.has() --
/** The most common accidental O(n*m) in JavaScript. */
export function intersectSlow(a, b) {
  let ops = 0;
  const out = [];
  for (const x of a) {
    ops += b.length; // includes() scans the whole array
    if (b.includes(x)) out.push(x);
  }
  return { value: out, ops };
}

export function intersectFast(a, b) {
  const set = new Set(b); // one O(m) pass
  let ops = b.length;
  const out = [];
  for (const x of a) {
    ops++;
    if (set.has(x)) out.push(x);
  }
  return { value: out, ops };
}

// ------------------------------------------------------- O(2^n) vs O(n) -----
/** Naive recursion recomputes subproblems: total calls = 2*F(n+1) - 1. */
export function fibExponential(n, counter = { calls: 0 }) {
  counter.calls++;
  if (n < 2) return { value: n, ops: counter.calls };
  const a = fibExponential(n - 1, counter).value;
  const b = fibExponential(n - 2, counter).value;
  return { value: a + b, ops: counter.calls };
}

/** Bottom-up: each state computed once. O(n) time, O(1) space. */
export function fibLinear(n) {
  if (n < 2) return { value: n, ops: 1 };
  let prev = 0;
  let curr = 1;
  let ops = 0;
  for (let i = 1; i < n; i++) {
    [prev, curr] = [curr, prev + curr];
    ops++;
  }
  return { value: curr, ops };
}

// ------------------------------------------------------- shift() vs index ---
/** Draining a queue with shift() is O(n^2): each shift reindexes the array. */
export function drainWithShift(n) {
  const q = Array.from({ length: n }, (_, i) => i);
  let ops = 0;
  let sum = 0;
  while (q.length) {
    ops += q.length; // shift() moves every remaining element
    sum += q.shift();
  }
  return { value: sum, ops };
}

/** A head pointer makes it O(n). Same queue semantics, no reindexing. */
export function drainWithHead(n) {
  const q = Array.from({ length: n }, (_, i) => i);
  let head = 0;
  let ops = 0;
  let sum = 0;
  while (head < q.length) {
    ops++;
    sum += q[head++];
  }
  return { value: sum, ops };
}

// ---------------------------------------------------------------- space -----
/** O(n) time and O(n) STACK space - Node overflows around 10k frames. */
export function sumRecursive(nums, i = 0) {
  if (i === nums.length) return 0;
  return nums[i] + sumRecursive(nums, i + 1);
}

/** O(n) time, O(1) space. */
export function sumIterative(nums) {
  let total = 0;
  for (const x of nums) total += x;
  return total;
}

// ---------------------------------------------------------- measurement -----
function growthTable() {
  console.log("\n      n |  O(n) ops | O(n^2) ops | O(log n) ops");
  console.log("-".repeat(50));
  for (const n of [100, 200, 400, 800]) {
    const nums = Array.from({ length: n }, (_, i) => i); // distinct: worst case
    const lin = linearSum(nums).ops;
    const quad = hasDuplicateQuadratic(nums).ops;
    const log = binarySearch(nums, n - 1).ops;
    console.log(
      `${String(n).padStart(7)} | ${String(lin).padStart(9)} | ${String(quad).padStart(10)} | ${String(log).padStart(12)}`,
    );
  }
}

function wallClockDemo() {
  const n = 20000;
  const t0 = performance.now();
  drainWithShift(n);
  const t1 = performance.now();
  drainWithHead(n);
  const t2 = performance.now();
  console.log(`\nshift() queue : ${(t1 - t0).toFixed(1)} ms   O(n^2)`);
  console.log(`head pointer  : ${(t2 - t1).toFixed(1)} ms   O(n)`);
}

// ---------------------------------------------------------------- demo ------
function demo() {
  assert.equal(constantFirst([9, 8, 7]).ops, 1);

  const bs = binarySearch(
    Array.from({ length: 1024 }, (_, i) => i),
    999,
  );
  assert.equal(bs.value, 999);
  assert.ok(bs.ops <= 11); // log2(1024) = 10

  assert.equal(linearSum([1, 2, 3]).value, 6);

  const distinct = Array.from({ length: 200 }, (_, i) => i);
  const q = hasDuplicateQuadratic(distinct);
  const l = hasDuplicateLinear(distinct);
  assert.equal(q.value, false);
  assert.equal(l.value, false);
  assert.equal(q.ops, (200 * 199) / 2); // every pair compared
  assert.equal(l.ops, 200); // one pass
  assert.ok(q.ops > 90 * l.ops); // the gap is the whole lesson

  // Doubling n roughly quadruples the work of an O(n^2) algorithm.
  const ratio =
    hasDuplicateQuadratic(Array.from({ length: 200 }, (_, i) => i)).ops /
    hasDuplicateQuadratic(Array.from({ length: 100 }, (_, i) => i)).ops;
  assert.ok(ratio > 3.8 && ratio < 4.2);

  const a = [1, 2, 3];
  const b = [2, 3, 4];
  assert.deepEqual(intersectSlow(a, b).value, [2, 3]);
  assert.deepEqual(intersectFast(a, b).value, [2, 3]);
  assert.ok(intersectFast(a, b).ops < intersectSlow(a, b).ops);

  assert.equal(fibExponential(20).value, 6765);
  assert.equal(fibExponential(20).ops, 21891); // = 2*F(21) - 1
  assert.equal(fibLinear(20).value, 6765);
  assert.equal(fibLinear(20).ops, 19); // linear, and not close

  assert.equal(drainWithShift(100).value, drainWithHead(100).value);
  assert.equal(drainWithShift(100).ops, 5050); // 100 + 99 + ... = O(n^2)
  assert.equal(drainWithHead(100).ops, 100); // O(n)

  assert.equal(sumRecursive([1, 2, 3]), sumIterative([1, 2, 3]));

  console.log("02-Time-Space-Complexity (JavaScript): all checks passed");
}

demo();
growthTable();
wallClockDemo();
