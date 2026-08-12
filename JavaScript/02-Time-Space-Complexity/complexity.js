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
// ============================================================================
// Empirical analysis - does the theory actually hold?
// ============================================================================
/**
 * Merge sort that reports its comparison count. O(n log n).
 *
 * The count is what makes this checkable. Wall-clock time depends on the
 * machine, the JIT's warm-up state and whatever else is running; a COMPARISON
 * COUNT is deterministic, so the theory can be asserted rather than eyeballed.
 */
export function mergeSortCounted(nums) {
  if (nums.length <= 1) return [nums.slice(), 0];

  const mid = nums.length >> 1;
  const [left, leftOps] = mergeSortCounted(nums.slice(0, mid));
  const [right, rightOps] = mergeSortCounted(nums.slice(mid));

  const merged = [];
  let comparisons = 0;
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    comparisons++;
    if (left[i] <= right[j]) merged.push(left[i++]);
    else merged.push(right[j++]);
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);

  return [merged, comparisons + leftOps + rightOps];
}

/**
 * Insertion sort that reports its comparison count.
 *
 * O(n^2) on reversed input, but O(n) on already-sorted input - the adaptive
 * best case that makes it the base case inside every real hybrid sort,
 * including V8's own.
 */
export function insertionSortCounted(nums) {
  const out = nums.slice();
  let comparisons = 0;
  for (let i = 1; i < out.length; i++) {
    const value = out[i];
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      if (out[j] <= value) break;
      out[j + 1] = out[j];
      j--;
    }
    out[j + 1] = value;
  }
  return [out, comparisons];
}

/**
 * Best-of-N wall-clock milliseconds.
 *
 * MINIMUM, not mean. Timing noise is one-sided - a GC pause or a scheduler
 * interrupt can only make a run slower, never faster - so the minimum is the
 * closest estimate of the true cost. Averaging just folds the noise in.
 *
 * `performance.now()` rather than `Date.now()`: the latter has millisecond
 * resolution, which is far too coarse for anything that finishes quickly.
 */
export function measureMs(fn, repeats = 3) {
  let best = Infinity;
  for (let r = 0; r < repeats; r++) {
    const start = performance.now();
    fn();
    best = Math.min(best, performance.now() - start);
  }
  return best;
}

/**
 * Ratio between consecutive measurements. The shape of the curve.
 *
 * Doubling n and watching the ratio identifies a complexity class from data
 * alone:
 *
 *     O(1)        ratio -> 1
 *     O(log n)    ratio -> 1   (grows by a constant, not a factor)
 *     O(n)        ratio -> 2
 *     O(n log n)  ratio -> slightly above 2, creeping up
 *     O(n^2)      ratio -> 4
 *
 * The empirical counterpart to reading the exponent off a formula.
 */
export function growthRatios(counts) {
  return counts.slice(1).map((value, i) => value / counts[i]);
}

/** Measure the two classes side by side, and print the growth. */
export function benchmarkTable() {
  const sizes = [250, 500, 1000, 2000];
  const rows = [];

  for (const n of sizes) {
    const reversedInput = Array.from({ length: n }, (_, i) => n - i);
    const mergeOps = mergeSortCounted(reversedInput)[1];
    const insertionOps = insertionSortCounted(reversedInput)[1];
    const mergeMs = measureMs(() => mergeSortCounted(reversedInput));
    const insertionMs = measureMs(() => insertionSortCounted(reversedInput));
    rows.push([n, mergeOps, insertionOps, mergeMs, insertionMs]);
  }

  console.log(
    `\n${"n".padStart(6)} | ${"merge ops".padStart(10)} | ${"insert ops".padStart(11)}` +
      ` | ${"merge ms".padStart(9)} | ${"insert ms".padStart(10)}`,
  );
  console.log("-".repeat(60));
  for (const [n, mergeOps, insertionOps, mergeMs, insertionMs] of rows) {
    console.log(
      `${String(n).padStart(6)} | ${String(mergeOps).padStart(10)} |` +
        ` ${String(insertionOps).padStart(11)} | ${mergeMs.toFixed(2).padStart(9)} |` +
        ` ${insertionMs.toFixed(2).padStart(10)}`,
    );
  }

  const mergeGrowth = growthRatios(rows.map((r) => r[1])).map((r) => r.toFixed(2));
  const insertionGrowth = growthRatios(rows.map((r) => r[2])).map((r) => r.toFixed(2));
  console.log(`\n  merge ops     grow x${mergeGrowth}  -> just over 2: O(n log n)`);
  console.log(`  insertion ops grow x${insertionGrowth}  -> 4: O(n^2)`);
}

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
  // --- Empirical analysis -----------------------------------------------------
  // Sorting is correct in both cases - the point is what it COSTS.
  {
    let benchSeed = 2;
    const benchRandom = () => {
      benchSeed = (benchSeed * 1103515245 + 12345) & 0x7fffffff;
      return benchSeed / 0x7fffffff;
    };

    for (let trial = 0; trial < 30; trial++) {
      const data = Array.from({ length: Math.floor(benchRandom() * 41) }, () =>
        Math.floor(benchRandom() * 101) - 50,
      );
      const expected = data.slice().sort((a, b) => a - b);
      assert.deepEqual(mergeSortCounted(data)[0], expected);
      assert.deepEqual(insertionSortCounted(data)[0], expected);
    }

    // The counts are deterministic, so the theory is ASSERTABLE - unlike the
    // wall-clock numbers, which depend on the machine and the JIT.
    const sizes = [250, 500, 1000, 2000];
    const mergeCounts = sizes.map(
      (n) => mergeSortCounted(Array.from({ length: n }, (_, i) => n - i))[1],
    );
    const insertionCounts = sizes.map(
      (n) => insertionSortCounted(Array.from({ length: n }, (_, i) => n - i))[1],
    );

    // Insertion sort on reversed input is exactly the worst case: every one of
    // the i previous elements is compared, so the total is n(n-1)/2 precisely.
    sizes.forEach((n, k) => assert.equal(insertionCounts[k], (n * (n - 1)) / 2));

    // Merge sort's comparison count sits in the tight n log n window.
    sizes.forEach((n, k) => {
      assert.ok(mergeCounts[k] <= n * Math.ceil(Math.log2(n)));
      assert.ok(mergeCounts[k] >= (n * Math.log2(n)) / 2);
    });

    // The growth ratios ARE the complexity class, read off the data.
    for (const ratio of growthRatios(insertionCounts)) assert.ok(ratio > 3.9 && ratio < 4.1);
    for (const ratio of growthRatios(mergeCounts)) assert.ok(ratio > 2.0 && ratio < 2.5);

    // Quadratic must eventually lose, by a widening margin. This compares
    // OPERATION COUNTS, so it is a fact about the algorithms, not the hardware.
    assert.ok(
      insertionCounts[0] / mergeCounts[0] < insertionCounts.at(-1) / mergeCounts.at(-1),
    );
    assert.ok(insertionCounts.at(-1) > 100 * mergeCounts.at(-1));

    // The ADAPTIVE best case: already-sorted input is O(n).
    const ascending = Array.from({ length: 2000 }, (_, i) => i);
    assert.equal(insertionSortCounted(ascending)[1], 1999);
  }


  console.log("02-Time-Space-Complexity (JavaScript): all checks passed");
}

demo();
growthTable();
wallClockDemo();
benchmarkTable();
