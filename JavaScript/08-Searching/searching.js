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

  console.log("08-Searching (JavaScript): all checks passed");
}

demo();
