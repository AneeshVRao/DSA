/**
 * 09 - Sorting: every classic algorithm from scratch, each verified against
 * the built-in sort on randomised input.
 *
 * Run:  node sorting.js
 */

import assert from "node:assert/strict";

// A tiny seeded PRNG so the random test cases are reproducible.
function makeRandom(seed = 42) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
const random = makeRandom();
const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

// ============================================================================
// 1. Quadratic sorts
// ============================================================================
/**
 * Repeatedly swap adjacent out-of-order pairs. O(n^2), O(1) space, stable.
 * The `swapped` flag makes it adaptive: sorted input costs one O(n) pass.
 */
export function bubbleSort(nums) {
  const a = [...nums];
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - 1 - i; j++) {
      // tail already final
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // nothing moved: it is sorted
  }
  return a;
}

/**
 * O(n^2) comparisons always, but only n-1 swaps - the fewest of any sort.
 * NOT stable: a long-distance swap can jump equal elements over each other.
 */
export function selectionSort(nums) {
  const a = [...nums];
  for (let i = 0; i < a.length - 1; i++) {
    let smallest = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[smallest]) smallest = j;
    [a[i], a[smallest]] = [a[smallest], a[i]];
  }
  return a;
}

/**
 * Insert each element into the sorted prefix. O(n^2), O(n) best, stable.
 * V8 itself uses insertion sort for arrays of 22 or fewer elements.
 */
export function insertionSort(nums) {
  const a = [...nums];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      // strict >: equal elements stay put
      a[j + 1] = a[j]; // shift right
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}

// ============================================================================
// 2. Merge sort
// ============================================================================
/** Divide, sort each half, merge. O(n log n) always, O(n) space, stable. */
export function mergeSort(nums) {
  if (nums.length <= 1) return [...nums];
  const mid = nums.length >> 1;
  return merge(mergeSort(nums.slice(0, mid)), mergeSort(nums.slice(mid)));
}

/** Merge two sorted arrays. O(n + m). `<=` is what makes it stable. */
function merge(left, right) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    out.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

// ============================================================================
// 3. Quicksort
// ============================================================================
/**
 * Partition around a pivot, recurse on both sides. O(n log n) average.
 * A RANDOM pivot avoids the O(n^2) case on already-sorted input.
 */
export function quickSort(nums) {
  const a = [...nums];
  quickSortRange(a, 0, a.length - 1);
  return a;
}

function quickSortRange(a, lo, hi) {
  // Recurse into the smaller side, loop on the larger: caps depth at O(log n).
  while (lo < hi) {
    const p = partition(a, lo, hi);
    if (p - lo < hi - p) {
      quickSortRange(a, lo, p - 1);
      lo = p + 1;
    } else {
      quickSortRange(a, p + 1, hi);
      hi = p - 1;
    }
  }
}

/** Lomuto partition with a random pivot; returns the pivot's final index. */
function partition(a, lo, hi) {
  const r = randInt(lo, hi);
  [a[r], a[hi]] = [a[hi], a[r]]; // move the pivot out of the way
  const pivot = a[hi];

  let smaller = lo; // boundary of the "< pivot" region
  for (let i = lo; i < hi; i++) {
    if (a[i] < pivot) {
      [a[smaller], a[i]] = [a[i], a[smaller]];
      smaller++;
    }
  }
  [a[smaller], a[hi]] = [a[hi], a[smaller]];
  return smaller;
}

// ============================================================================
// 4. Heap sort
// ============================================================================
/**
 * Build a max-heap, then repeatedly swap the root to the end.
 * O(n log n) worst case AND O(1) space - the only classic sort with both.
 */
export function heapSort(nums) {
  const a = [...nums];
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, i, n); // build: O(n)
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]]; // largest to its final position
    siftDown(a, 0, end); // restore the heap on the prefix
  }
  return a;
}

/** Push a[root] down until the max-heap property holds. O(log n). */
function siftDown(a, root, size) {
  for (;;) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest === root) return;
    [a[root], a[largest]] = [a[largest], a[root]];
    root = largest;
  }
}

// ============================================================================
// 5. Non-comparison sorts
// ============================================================================
/**
 * O(n + k) for non-negative integers with a small range k. It never compares
 * two elements - values index directly into the count array, which is how it
 * beats the O(n log n) bound. The prefix-sum step makes it stable.
 */
export function countingSort(nums) {
  if (nums.length === 0) return [];
  if (Math.min(...nums) < 0) throw new RangeError("needs non-negative integers");

  const k = Math.max(...nums);
  const counts = new Array(k + 1).fill(0);
  for (const x of nums) counts[x]++;
  for (let i = 1; i <= k; i++) counts[i] += counts[i - 1]; // prefix sums

  const out = new Array(nums.length);
  for (let i = nums.length - 1; i >= 0; i--) {
    // reverse keeps it stable
    out[--counts[nums[i]]] = nums[i];
  }
  return out;
}

/**
 * LSD radix sort: a stable bucket pass per digit, least significant first.
 * O(d * (n + 10)). Correct ONLY because each pass preserves earlier order.
 */
export function radixSort(nums) {
  if (nums.length === 0) return [];
  if (Math.min(...nums) < 0) throw new RangeError("needs non-negative integers");

  let a = [...nums];
  const largest = Math.max(...a);
  for (let exp = 1; Math.floor(largest / exp) > 0; exp *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const x of a) buckets[Math.floor(x / exp) % 10].push(x);
    a = buckets.flat(); // concatenate in bucket order
  }
  return a;
}

// ============================================================================
// 6. Quickselect
// ============================================================================
/**
 * The kth smallest element (1-based). O(n) average.
 * Only one side is explored, so the work is n + n/2 + n/4 + ... = 2n.
 */
export function quickselect(nums, k) {
  if (k < 1 || k > nums.length) throw new RangeError("k out of range");
  const a = [...nums];
  let lo = 0;
  let hi = a.length - 1;
  const target = k - 1;
  for (;;) {
    if (lo === hi) return a[lo];
    const p = partition(a, lo, hi);
    if (p === target) return a[p];
    if (p < target) lo = p + 1;
    else hi = p - 1;
  }
}

// ============================================================================
// 7. Stability demonstration
// ============================================================================
/** Stable merge sort of [name, score] pairs by score only. */
export function stableSortPairs(pairs) {
  if (pairs.length <= 1) return [...pairs];
  const mid = pairs.length >> 1;
  const left = stableSortPairs(pairs.slice(0, mid));
  const right = stableSortPairs(pairs.slice(mid));

  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    // <= : the earlier (left) element wins ties
    out.push(left[i][1] <= right[j][1] ? left[i++] : right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const algorithms = {
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    merge: mergeSort,
    quick: quickSort,
    heap: heapSort,
    counting: countingSort,
    radix: radixSort,
  };

  const byValue = (a, b) => a - b;

  // Hand-picked edge cases every sort must survive.
  const edgeCases = [
    [],
    [1],
    [2, 1],
    [1, 1, 1, 1], // all equal
    [5, 4, 3, 2, 1], // reverse sorted (quicksort's trap)
    [1, 2, 3, 4, 5], // already sorted
    [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], // duplicates
    [0, 0, 10, 7, 0], // zeros
  ];
  for (const [name, fn] of Object.entries(algorithms)) {
    for (const original of edgeCases) {
      const input = [...original];
      const expected = [...original].sort(byValue);
      assert.deepEqual(fn(input), expected, `${name} failed on ${original}`);
      assert.deepEqual(input, original, `${name} mutated its input`);
    }
  }

  // 200 randomised arrays against the built-in sort.
  for (let trial = 0; trial < 200; trial++) {
    const data = Array.from({ length: randInt(0, 60) }, () => randInt(0, 500));
    const expected = [...data].sort(byValue);
    for (const [name, fn] of Object.entries(algorithms)) {
      assert.deepEqual(fn(data), expected, `${name} disagreed with sort()`);
    }
  }

  // Negatives: comparison sorts cope, counting/radix must refuse.
  const negatives = [3, -1, 4, -1, 5];
  const expectedNeg = [...negatives].sort(byValue);
  for (const name of ["bubble", "selection", "insertion", "merge", "quick", "heap"]) {
    assert.deepEqual(algorithms[name](negatives), expectedNeg);
  }
  assert.throws(() => countingSort(negatives), RangeError);
  assert.throws(() => radixSort(negatives), RangeError);

  // The classic built-in trap, demonstrated rather than described.
  assert.deepEqual([10, 9, 1].sort(), [1, 10, 9]); // lexicographic!
  assert.deepEqual([10, 9, 1].sort(byValue), [1, 9, 10]);

  // Stability: equal scores keep their input order.
  const pairs = [
    ["amy", 2],
    ["bob", 1],
    ["cat", 2],
    ["dan", 1],
  ];
  const expectedStable = [
    ["bob", 1],
    ["dan", 1],
    ["amy", 2],
    ["cat", 2],
  ];
  assert.deepEqual(stableSortPairs(pairs), expectedStable);
  // The built-in is stable too (guaranteed since ES2019), so it must agree.
  assert.deepEqual([...pairs].sort((a, b) => a[1] - b[1]), expectedStable);

  // Quickselect against the sorted reference.
  const data = [7, 10, 4, 3, 20, 15];
  const sorted = [...data].sort(byValue);
  for (let k = 1; k <= data.length; k++) {
    assert.equal(quickselect(data, k), sorted[k - 1]);
  }

  console.log("09-Sorting (JavaScript): all checks passed");
  console.log(
    `  ${Object.keys(algorithms).length} algorithms x ${edgeCases.length} edge cases` +
      " + 200 random arrays verified against the built-in sort",
  );
}

demo();
