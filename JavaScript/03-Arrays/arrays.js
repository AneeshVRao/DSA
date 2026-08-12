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

/**
 * O(rows * cols) build, then every rectangle sum is O(1).
 *
 * `pre[r][c]` holds the sum of the whole rectangle from the top-left corner to
 * `(r, c)` EXCLUSIVE - so row 0 and column 0 stay zero and there are no
 * boundary special cases, exactly as in the 1-D version.
 *
 * **Building** (inclusion-exclusion, going in):
 *
 *     pre[r+1][c+1] = grid[r][c]
 *                   + pre[r][c+1]     // everything above
 *                   + pre[r+1][c]     // everything to the left
 *                   - pre[r][c]       // the overlap, added twice
 *
 * **Querying** (inclusion-exclusion, coming back out):
 *
 *     +-------+-------+
 *     |   A   |   B   |     want D
 *     +-------+-------+
 *     |   C   |   D   |     D = total - B - C + A
 *     +-------+-------+
 *
 * The `+ A` is the whole trick: the top strip and the left strip both contain
 * corner A, so subtracting both removes it twice and it has to be added back.
 * Forgetting that term is the standard bug - and it only shows up on a query
 * touching neither the top nor the left edge.
 *
 * Use it for many rectangle sums over a FIXED grid. If the grid changes, a 2-D
 * Fenwick tree (chapter 19) gives `O(log^2 n)` updates instead.
 *
 * Note `Array.from({length: n}, () => ...)` rather than `.fill([])` - `fill`
 * would store the SAME row array reference n times, and writing to one row
 * would write to all of them.
 */
export class PrefixSum2D {
  constructor(grid) {
    const rows = grid.length;
    const cols = rows ? grid[0].length : 0;
    // One extra row and column of zeros, so no index can go negative.
    this.pre = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.pre[r + 1][c + 1] =
          grid[r][c] +
          this.pre[r][c + 1] + // everything above
          this.pre[r + 1][c] - // everything to the left
          this.pre[r][c]; // overlap counted twice
      }
    }
  }

  /** Sum of the rectangle [top, bottom) x [left, right) - both exclusive. O(1). */
  rangeSum(top, left, bottom, right) {
    return (
      this.pre[bottom][right] -
      this.pre[top][right] - // strip above
      this.pre[bottom][left] + // strip to the left
      this.pre[top][left] // corner removed twice
    );
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
// ============================================================================
// Memory layout: why the same loop has two speeds
// ============================================================================
/**
 * Walk the grid the way it is stored: row by row.
 *
 * Memory is a flat line, and a 2-D grid has to be flattened onto it somehow.
 * ROW-MAJOR order (C, C++, Java, Go, JavaScript) stores row 0, then row 1, and
 * so on. Column-major (Fortran, MATLAB, R) does the opposite.
 *
 * The CPU never fetches one value. It fetches a CACHE LINE - typically 64
 * bytes - so walking along a row means every fetch delivers the next several
 * iterations for free. One miss, then several hits.
 */
export function sumRowMajor(grid) {
  let total = 0;
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) total += row[c];
  }
  return total;
}

/**
 * Walk ACROSS the storage order: column by column.
 *
 * Identical arithmetic, identical result, two lines swapped - and measurably
 * slower on the same data.
 *
 * Each step jumps a whole row ahead in memory. Once a row exceeds a cache line
 * (it usually does), every access is a fresh miss, and the bytes fetched are
 * evicted before their neighbours are ever used. The memory bandwidth spent is
 * the same; the useful fraction of it is not.
 *
 * This is the gap between an algorithm's COMPLEXITY - both loops are
 * `O(rows * cols)`, identically - and its CONSTANT FACTOR. Big-O deliberately
 * ignores what the hardware is doing, which is why it is necessary but never
 * sufficient.
 *
 * In JS the effect is muted compared with C: an array of arrays is an array of
 * POINTERS to separately allocated rows, so even the row-major walk chases a
 * pointer per row. A `Float64Array`/`Int32Array` with manual index arithmetic
 * (`flat[r * cols + c]`) is genuinely contiguous, and shows the full gap.
 */
export function sumColumnMajor(grid) {
  let total = 0;
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) total += grid[r][c];
  }
  return total;
}

/**
 * The classic broken 2-D initialisation. DO NOT use this.
 *
 *     new Array(rows).fill(new Array(cols).fill(0))
 *
 * The inner array is built ONCE, and `fill` copies that same REFERENCE into
 * every slot. Every row is the same object, so writing to `grid[0][0]` writes
 * to every row at once.
 *
 * It is silent: the shape is right, the values start right, and it only goes
 * wrong on the first write. Kept here purely so the demo can prove it.
 */
export function aliasedGrid(rows, cols) {
  return new Array(rows).fill(new Array(cols).fill(0)); // every row is ONE array
}

/** The correct version: `Array.from` runs its factory once per row. */
export function independentGrid(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

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

  // --- 2-D prefix sums ------------------------------------------------------
  const grid = [
    [3, 0, 1, 4],
    [5, 6, 3, 2],
    [1, 2, 0, 1],
  ];
  const gridSums = new PrefixSum2D(grid);
  assert.equal(gridSums.rangeSum(0, 0, 3, 4), 28); // the whole grid
  assert.equal(gridSums.rangeSum(1, 1, 3, 3), 11); // 6+3+2+0
  assert.equal(gridSums.rangeSum(0, 0, 1, 1), 3); // a single cell
  assert.equal(gridSums.rangeSum(2, 2, 2, 2), 0); // an empty rectangle

  // Deterministic PRNG so a failure is always reproducible.
  let seed = 3;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

  // Interior queries are the ones that catch a missing `+ corner` term, so
  // check every rectangle against a brute-force double loop.
  for (let trial = 0; trial < 40; trial++) {
    const rows = randInt(1, 8);
    const cols = randInt(1, 8);
    const cells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => randInt(-20, 20)),
    );
    const sums = new PrefixSum2D(cells);

    for (let top = 0; top <= rows; top++) {
      for (let bottom = top; bottom <= rows; bottom++) {
        for (let left = 0; left <= cols; left++) {
          for (let right = left; right <= cols; right++) {
            let expected = 0;
            for (let r = top; r < bottom; r++) {
              for (let c = left; c < right; c++) expected += cells[r][c];
            }
            assert.equal(sums.rangeSum(top, left, bottom, right), expected);
          }
        }
      }
    }
  }

  assert.equal(new PrefixSum2D([]).rangeSum(0, 0, 0, 0), 0); // no rows at all
  // --- Memory layout ----------------------------------------------------------
  {
    // The aliasing trap, demonstrated rather than described.
    const broken = aliasedGrid(3, 3);
    broken[0][0] = 9;
    assert.ok(broken[1][0] === 9 && broken[2][0] === 9); // all three rows changed
    assert.ok(broken[0] === broken[1]); // because they are one array

    const fine = independentGrid(3, 3);
    fine[0][0] = 9;
    assert.ok(fine[1][0] === 0 && fine[2][0] === 0); // only the one cell moved
    assert.ok(fine[0] !== fine[1]);

    // Row-major vs column-major: same complexity, same answer, different speed.
    const side = 2000;
    const layoutGrid = Array.from({ length: side }, (_, r) =>
      Int32Array.from({ length: side }, (_, c) => r + c),
    );

    const timeBestOf = (fn, repeats = 3) => {
      let best = Infinity;
      for (let i = 0; i < repeats; i++) {
        const start = performance.now();
        fn();
        best = Math.min(best, performance.now() - start);
      }
      return best;
    };

    const rowMs = timeBestOf(() => sumRowMajor(layoutGrid));
    const colMs = timeBestOf(() => sumColumnMajor(layoutGrid));

    // The part that is a FACT: both orders compute the same sum.
    let expected = 0;
    for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) expected += r + c;
    assert.equal(sumRowMajor(layoutGrid), expected);
    assert.equal(sumColumnMajor(layoutGrid), expected);

    // The part that is a MEASUREMENT: row-major is normally faster here. The
    // assertion is deliberately loose - a busy machine can distort any timing -
    // but the printed ratio below shows the real effect.
    assert.ok(rowMs < colMs * 1.5, "row-major should not be slower");

    console.log(`  row-major    ${rowMs.toFixed(1).padStart(7)} ms`);
    console.log(
      `  column-major ${colMs.toFixed(1).padStart(7)} ms` +
        `   <- ${(colMs / rowMs).toFixed(1)}x slower, same O(n^2)`,
    );
  }


  console.log("03-Arrays (JavaScript): all checks passed");
  console.log("  2-D prefix sums checked against brute force on every rectangle");
}

demo();
