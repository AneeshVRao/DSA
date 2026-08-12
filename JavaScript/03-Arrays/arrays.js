/**
 * 03 - Arrays: a dynamic array built from scratch, plus the five patterns that
 * solve most array problems.
 *
 * Run:  node arrays.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. A dynamic array from scratch
// ============================================================================
/**
 * Growable array over a fixed-size buffer. JS gives us no raw memory, so we
 * simulate a fixed buffer with a pre-filled array and manage the capacity by
 * hand - the point is the growth policy, not the storage.
 *
 * Doubling is what makes push amortised O(1): n pushes cost at most 2n copies.
 */
export class DynamicArray {
  #buf = new Array(1).fill(undefined);
  #size = 0;

  get length() {
    return this.#size; // O(1) - stored, never counted
  }

  get capacity() {
    return this.#buf.length;
  }

  get(i) {
    if (i < 0 || i >= this.#size) throw new RangeError("index out of range");
    return this.#buf[i]; // O(1)
  }

  set(i, value) {
    if (i < 0 || i >= this.#size) throw new RangeError("index out of range");
    this.#buf[i] = value;
  }

  push(value) {
    // O(1) amortised
    if (this.#size === this.#buf.length) this.#resize(this.#buf.length * 2);
    this.#buf[this.#size++] = value;
    return this.#size;
  }

  insert(i, value) {
    // O(n): everything from i onwards shifts right
    if (i < 0 || i > this.#size) throw new RangeError("index out of range");
    if (this.#size === this.#buf.length) this.#resize(this.#buf.length * 2);
    for (let j = this.#size; j > i; j--) this.#buf[j] = this.#buf[j - 1];
    this.#buf[i] = value;
    this.#size++;
  }

  removeAt(i) {
    // O(1) at the end, O(n) elsewhere
    if (i < 0 || i >= this.#size) throw new RangeError("index out of range");
    const value = this.#buf[i];
    for (let j = i; j < this.#size - 1; j++) this.#buf[j] = this.#buf[j + 1];
    this.#size--;
    return value;
  }

  #resize(newCapacity) {
    // O(n) - and the reason we double instead of adding one
    const fresh = new Array(newCapacity).fill(undefined);
    for (let i = 0; i < this.#size; i++) fresh[i] = this.#buf[i];
    this.#buf = fresh;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.#size; i++) yield this.#buf[i];
  }

  toArray() {
    return [...this];
  }
}

// ============================================================================
// 2. Two pointers from opposite ends
// ============================================================================
/**
 * Indices of the pair summing to target in a SORTED array. O(n) time, O(1) space.
 * Sortedness is what makes each move unambiguous.
 */
export function twoSumSorted(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    if (sum < target) lo++; // need a bigger sum
    else hi--; // need a smaller sum
  }
  return null;
}

export function isPalindrome(arr) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) if (arr[lo++] !== arr[hi--]) return false;
  return true;
}

// ============================================================================
// 3. Fast / slow pointers (in-place rewrite)
// ============================================================================
/** Move every 0 to the end, preserving the order of the rest. O(n) / O(1). */
export function moveZeros(nums) {
  let slow = 0; // where the next non-zero belongs
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      slow++;
    }
  }
  return nums;
}

/** Dedup a sorted array in place; returns the new logical length. O(n). */
export function removeDuplicatesSorted(nums) {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) nums[++slow] = nums[fast];
  }
  return slow + 1;
}

// ============================================================================
// 4. Kadane - maximum subarray sum
// ============================================================================
/**
 * Largest sum of a contiguous subarray. O(n) / O(1).
 * At each element: extend the running subarray, or start fresh here?
 */
export function maxSubarray(nums) {
  if (nums.length === 0) throw new Error("empty array");
  let best = nums[0];
  let current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}

// ============================================================================
// 5. Prefix sums
// ============================================================================
export class PrefixSum {
  /** O(n) build. pre[0] = 0 removes every special case from the query. */
  constructor(nums) {
    this.pre = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) this.pre[i + 1] = this.pre[i] + nums[i];
  }

  /** Sum of nums[left, right) - right is exclusive. O(1). */
  rangeSum(left, right) {
    return this.pre[right] - this.pre[left];
  }
}

// ============================================================================
// 6. Sliding window
// ============================================================================
/** Largest sum of k consecutive elements. O(n) / O(1). */
export function maxSumWindow(nums, k) {
  if (k <= 0 || k > nums.length) throw new RangeError("bad window size");
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  let best = window;
  for (let i = k; i < nums.length; i++) {
    window += nums[i] - nums[i - k]; // add the entrant, drop the leaver
    best = Math.max(best, window);
  }
  return best;
}

/** Longest substring with no repeated character - variable window. O(n). */
export function longestUniqueWindow(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1; // jump past the previous occurrence
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

// ============================================================================
// 7. In-place rotation and partitioning
// ============================================================================
/** Rotate right by k with three reversals. O(n) time, O(1) space. */
export function rotateRight(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k = ((k % n) + n) % n; // normalise, negatives included

  const reverse = (lo, hi) => {
    while (lo < hi) {
      [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
      lo++;
      hi--;
    }
  };

  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
  return nums;
}

/**
 * Sort an array of 0/1/2 in ONE pass. O(n) / O(1).
 * Invariant: [0,low) are 0s, [low,mid) are 1s, (high,end) are 2s.
 */
export function dutchFlagSort(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--; // do NOT advance mid: the swapped-in value is unexamined
    }
  }
  return nums;
}

// ============================================================================
// 8. Merging two sorted arrays
// ============================================================================
/** The merge step of merge sort. O(n + m) time and space. */
export function mergeSorted(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    out.push(a[i] <= b[j] ? a[i++] : b[j++]); // <= keeps it stable
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const arr = new DynamicArray();
  for (let i = 0; i < 5; i++) arr.push(i);
  assert.equal(arr.length, 5);
  assert.deepEqual(arr.toArray(), [0, 1, 2, 3, 4]);
  assert.ok(arr.capacity >= 5);
  arr.insert(0, 99);
  assert.deepEqual(arr.toArray(), [99, 0, 1, 2, 3, 4]);
  assert.equal(arr.removeAt(0), 99);
  arr.set(0, 7);
  assert.equal(arr.get(0), 7);
  assert.throws(() => arr.get(99), RangeError);

  assert.deepEqual(twoSumSorted([1, 3, 5, 8], 11), [1, 3]);
  assert.equal(twoSumSorted([1, 2], 99), null);
  assert.ok(isPalindrome([1, 2, 1]) && !isPalindrome([1, 2]));

  assert.deepEqual(moveZeros([0, 1, 0, 3]), [1, 3, 0, 0]);
  const dups = [1, 1, 2, 2, 3];
  assert.equal(removeDuplicatesSorted(dups), 3);
  assert.deepEqual(dups.slice(0, 3), [1, 2, 3]);

  assert.equal(maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6); // [4,-1,2,1]
  assert.equal(maxSubarray([-5, -2, -9]), -2); // all negative

  const ps = new PrefixSum([1, 2, 3, 4]);
  assert.equal(ps.rangeSum(0, 4), 10);
  assert.equal(ps.rangeSum(1, 3), 5);
  assert.equal(ps.rangeSum(2, 2), 0); // empty range

  assert.equal(maxSumWindow([1, 5, 2, 9, 1], 2), 11);
  assert.equal(longestUniqueWindow("abcabcbb"), 3);
  assert.equal(longestUniqueWindow(""), 0);

  assert.deepEqual(rotateRight([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);
  assert.deepEqual(rotateRight([1, 2, 3], 3), [1, 2, 3]); // full rotation

  assert.deepEqual(dutchFlagSort([2, 0, 2, 1, 1, 0]), [0, 0, 1, 1, 2, 2]);

  assert.deepEqual(mergeSorted([1, 4], [2, 3, 5]), [1, 2, 3, 4, 5]);
  assert.deepEqual(mergeSorted([], [1]), [1]);

  console.log("03-Arrays (JavaScript): all checks passed");
}

demo();
