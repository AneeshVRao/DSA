/**
 * 08 - Searching: binary search and every variant that actually shows up -
 * boundaries, rotated arrays, matrices, and binary search on the answer.
 *
 * Run:  node searching.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. Linear search
// ============================================================================
/** O(n). The right choice for unsorted data searched once. */
export function linearSearch(nums, target) {
  for (let i = 0; i < nums.length; i++) if (nums[i] === target) return i;
  return -1;
}

// ============================================================================
// 2. Binary search
// ============================================================================
/**
 * Index of target in a SORTED array, or -1. O(log n) time, O(1) space.
 * Inclusive bounds [lo, hi] pair with `<=` and `mid +/- 1`. Mixing that with
 * the half-open convention is what produces infinite loops.
 */
export function binarySearch(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

/** Same algorithm with index bounds - slicing would copy and cost O(n log n). */
export function binarySearchRecursive(nums, target, lo = 0, hi = nums.length - 1) {
  if (lo > hi) return -1;
  const mid = (lo + hi) >> 1;
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) return binarySearchRecursive(nums, target, mid + 1, hi);
  return binarySearchRecursive(nums, target, lo, mid - 1);
}

// ============================================================================
// 3. Boundary variants
// ============================================================================
/**
 * First index with nums[i] >= target (the insertion point). O(log n).
 * Half-open bounds [lo, hi): loop on `<`, and `hi = mid` (never mid - 1).
 * It never returns early - it squeezes until the boundary is exact.
 */
export function lowerBound(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** First index with nums[i] > target. O(log n). */
export function upperBound(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function firstOccurrence(nums, target) {
  const i = lowerBound(nums, target);
  return i < nums.length && nums[i] === target ? i : -1;
}

export function lastOccurrence(nums, target) {
  const i = upperBound(nums, target) - 1;
  return i >= 0 && nums[i] === target ? i : -1;
}

/** O(log n) instead of an O(n) count. */
export function countOccurrences(nums, target) {
  return upperBound(nums, target) - lowerBound(nums, target);
}

// ============================================================================
// 4. Rotated arrays
// ============================================================================
/**
 * Search a sorted array rotated at an unknown pivot. O(log n).
 * At any mid, at least one half is properly sorted: identify it, test whether
 * the target lies inside, and discard the other half.
 */
export function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {
      // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

/** Smallest element of a rotated sorted array. Compare against nums[hi]. */
export function findMinRotated(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid; // mid stays a candidate
  }
  return nums[lo];
}

/**
 * Index of any element greater than both neighbours. O(log n).
 * Works on unsorted input: the uphill side always contains a peak because the
 * ends count as -Infinity.
 */
export function findPeak(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// ============================================================================
// 5. Matrices
// ============================================================================
/** Rows sorted and chained: treat it as one flat array. O(log(rows*cols)). */
export function searchMatrix(matrix, target) {
  if (!matrix.length || !matrix[0].length) return false;
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

/**
 * Rows AND columns sorted, rows not chained. Start at the top-right corner:
 * largest in its row, smallest in its column, so each comparison drops a whole
 * row or column. O(rows + cols).
 */
export function searchMatrixStaircase(matrix, target) {
  if (!matrix.length || !matrix[0].length) return false;
  let r = 0;
  let c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    if (matrix[r][c] === target) return true;
    if (matrix[r][c] > target) c--;
    else r++;
  }
  return false;
}

// ============================================================================
// 6. Binary search on the answer
// ============================================================================
/**
 * Largest x with x*x <= n. O(log n).
 * Math.floor instead of >> 1: the range can exceed 2^31 and bit shifts would
 * silently truncate.
 */
export function integerSqrt(n) {
  if (n < 0) throw new RangeError("negative input");
  let lo = 0;
  let hi = n;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    if (mid * mid <= n) {
      best = mid; // feasible: record it, then look right
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

/**
 * Smallest ship capacity that delivers every package within `days` days.
 *
 * Nothing is being searched in an array - the ANSWER is searched, between
 * max(weights) (must fit the heaviest package) and sum(weights) (one trip).
 * canShip is monotonic: a bigger ship is never worse. O(n log(sum)).
 */
export function minShipCapacity(weights, days) {
  if (days <= 0 || weights.length === 0) throw new RangeError("bad input");

  const canShip = (capacity) => {
    let used = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > capacity) {
        used++; // start a new day
        load = 0;
      }
      load += w;
    }
    return used <= days;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    if (canShip(mid)) hi = mid; // feasible: try smaller
    else lo = mid + 1;
  }
  return lo;
}

/** Minimum bananas-per-hour to finish all piles within `hours`. */
export function kokoEatingSpeed(piles, hours) {
  const hoursNeeded = (speed) =>
    piles.reduce((total, p) => total + Math.ceil(p / speed), 0);

  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    if (hoursNeeded(mid) <= hours) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// Ternary search - the extremum of a UNIMODAL function
// ============================================================================
/**
 * Index of the maximum of a UNIMODAL function on [low, high]. O(log n).
 *
 * Binary search needs a MONOTONIC predicate - "is this true from here on?".
 * Ternary search needs something weaker but different: UNIMODALITY. The values
 * rise to a single peak and then fall (or fall to a trough and rise).
 *
 *     f
 *     |        *
 *     |      *   *
 *     |    *       *
 *     |  *           *
 *     +-------------------- x
 *              ^ the peak
 *
 * Cut the range at TWO points instead of one:
 *
 *     if f(m1) < f(m2)  the peak is right of m1  -> discard [low, m1]
 *     else              the peak is left of m2   -> discard [m2, high]
 *
 * Each round keeps two thirds, so it is O(log_1.5 n) - about 1.7x more
 * evaluations than binary search, but binary search cannot be used here at
 * all: "is f increasing at x?" is not monotone when the function has a peak.
 *
 * THE TRAP: on a PLATEAU (f(m1) == f(m2) with equal values between) the range
 * never shrinks past the flat part. Strictly unimodal input, or another method.
 *
 * This integer version narrows to a window of three and scans it, which
 * sidesteps the off-by-one that plagues the "while low < high" form.
 */
export function ternarySearchMax(low, high, f) {
  while (high - low > 2) {
    const third = Math.floor((high - low) / 3);
    const m1 = low + third;
    const m2 = high - third;
    if (f(m1) < f(m2)) {
      low = m1 + 1; // the peak cannot be at or left of m1
    } else {
      high = m2 - 1; // the peak cannot be at or right of m2
    }
  }

  let best = low;
  for (let x = low + 1; x <= high; x++) {
    // at most three candidates remain
    if (f(x) > f(best)) best = x;
  }
  return best;
}

/**
 * Argument minimising a unimodal CONTINUOUS function. O(iterations).
 *
 * On reals there is no "adjacent" value to stop at, so the loop runs a FIXED
 * number of rounds rather than testing convergence. Each round keeps two
 * thirds, so 200 rounds shrink the interval by (2/3)^200 - astronomically
 * below any double's precision, and it cannot spin forever on a plateau.
 *
 * ACCURACY, AND WHY MORE ITERATIONS DO NOT HELP. Near a smooth minimum the
 * function is locally quadratic: f(x) ~ f(x*) + c(x - x*)^2. A distance d from
 * the true minimum changes f by only ~c*d^2, so once d reaches about
 * sqrt(machine epsilon) ~ 1.5e-8 the two probes compare EQUAL and the
 * comparison becomes noise. Expect ~1e-8 accuracy in x, never 1e-15 - that is
 * a property of the problem, not of the loop count.
 */
export function ternarySearchMinFloat(low, high, f, iterations = 200) {
  for (let i = 0; i < iterations; i++) {
    const m1 = low + (high - low) / 3;
    const m2 = high - (high - low) / 3;
    if (f(m1) < f(m2)) {
      high = m2; // the minimum is left of m2
    } else {
      low = m1; // the minimum is right of m1
    }
  }
  return (low + high) / 2;
}

function demo() {
  const nums = [1, 3, 5, 7, 9, 11];
  assert.equal(linearSearch(nums, 7), 3);
  assert.equal(linearSearch(nums, 8), -1);

  assert.equal(binarySearch(nums, 1), 0); // first element
  assert.equal(binarySearch(nums, 11), 5); // last element
  assert.equal(binarySearch(nums, 7), 3);
  assert.equal(binarySearch(nums, 8), -1);
  assert.equal(binarySearch([], 1), -1); // empty input
  assert.equal(binarySearchRecursive(nums, 9), 4);

  const dups = [1, 2, 2, 2, 3, 5];
  assert.equal(lowerBound(dups, 2), 1);
  assert.equal(upperBound(dups, 2), 4);
  assert.equal(lowerBound(dups, 4), 5); // insertion point, no match
  assert.equal(upperBound(dups, 5), 6); // past the end
  assert.equal(firstOccurrence(dups, 2), 1);
  assert.equal(lastOccurrence(dups, 2), 3);
  assert.equal(firstOccurrence(dups, 4), -1);
  assert.equal(countOccurrences(dups, 2), 3);
  assert.equal(countOccurrences(dups, 9), 0);

  const rotated = [4, 5, 6, 7, 0, 1, 2];
  assert.equal(searchRotated(rotated, 0), 4);
  assert.equal(searchRotated(rotated, 5), 1);
  assert.equal(searchRotated(rotated, 3), -1);
  assert.equal(findMinRotated(rotated), 0);
  assert.equal(findMinRotated([3, 4, 5, 1, 2]), 1);
  assert.equal(findMinRotated([1, 2, 3]), 1); // not actually rotated

  assert.equal(findPeak([1, 2, 3, 1]), 2);
  assert.ok([1, 5].includes(findPeak([1, 2, 1, 3, 5, 6, 4]))); // either is valid

  const matrix = [
    [1, 3, 5, 7],
    [10, 11, 16, 20],
    [23, 30, 34, 60],
  ];
  assert.ok(searchMatrix(matrix, 3));
  assert.ok(searchMatrix(matrix, 60));
  assert.ok(!searchMatrix(matrix, 13));

  const staircase = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ];
  assert.ok(searchMatrixStaircase(staircase, 5));
  assert.ok(!searchMatrixStaircase(staircase, 10));

  assert.equal(integerSqrt(0), 0);
  assert.equal(integerSqrt(8), 2); // floor of 2.83
  assert.equal(integerSqrt(16), 4);
  assert.equal(integerSqrt(1e12), 1e6);

  assert.equal(minShipCapacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), 15);
  assert.equal(minShipCapacity([3, 2, 2, 4, 1, 4], 3), 6);
  assert.equal(kokoEatingSpeed([3, 6, 7, 11], 8), 4);
  assert.equal(kokoEatingSpeed([30, 11, 23, 4, 20], 5), 30);
  // --- Ternary search ---------------------------------------------------------
  // A discrete parabola peaking at x = 7.
  const peak = (x) => -((x - 7) ** 2) + 100;
  assert.equal(ternarySearchMax(0, 20, peak), 7);
  assert.equal(ternarySearchMax(7, 7, peak), 7); // a single point
  assert.equal(ternarySearchMax(0, 7, peak), 7); // peak at the boundary
  assert.equal(ternarySearchMax(7, 20, peak), 7);

  // Strictly increasing and strictly decreasing are both unimodal.
  assert.equal(ternarySearchMax(0, 10, (x) => x), 10);
  assert.equal(ternarySearchMax(0, 10, (x) => -x), 0);

  // Against brute force on random strictly-unimodal functions.
  let ternarySeed = 8;
  const ternaryRandom = () => {
    ternarySeed = (ternarySeed * 1103515245 + 12345) & 0x7fffffff;
    return ternarySeed / 0x7fffffff;
  };

  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + Math.floor(ternaryRandom() * 60);
    const apex = Math.floor(ternaryRandom() * n);
    const scale = 1 + Math.floor(ternaryRandom() * 5);
    const shape = (x) => -scale * (x - apex) ** 2;

    assert.equal(ternarySearchMax(0, n - 1, shape), apex);

    let brute = 0; // brute force agrees
    for (let x = 1; x < n; x++) if (shape(x) > shape(brute)) brute = x;
    assert.equal(brute, apex);
  }

  // Continuous: minimise (x - 2.5)^2 + 1. 1e-6, not 1e-15 - a quadratic is flat
  // at its minimum, so the probes stop differing at sqrt(epsilon).
  const found = ternarySearchMinFloat(-10, 10, (x) => (x - 2.5) ** 2 + 1);
  assert.ok(Math.abs(found - 2.5) < 1e-6);

  // A function whose slope does NOT vanish converges much further - the same
  // point from the other side.
  const kinked = ternarySearchMinFloat(-10, 10, (x) => Math.abs(x - 2.5));
  assert.ok(Math.abs(kinked - 2.5) < 1e-12);


  console.log("08-Searching (JavaScript): all checks passed");
}

demo();
