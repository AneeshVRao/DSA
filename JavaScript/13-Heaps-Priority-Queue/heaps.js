/**
 * 13 - Heaps and Priority Queue: a comparator-driven binary heap from scratch
 * (JavaScript has none built in), plus the four patterns it exists for.
 *
 * Run:  node heaps.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. A binary heap from scratch
// ============================================================================
/**
 * A complete binary tree packed into an array - no gaps, so parent and child
 * links are pure arithmetic:
 *
 *   parent(i) = (i - 1) >> 1     left(i) = 2i + 1     right(i) = 2i + 2
 *
 * The comparator follows the Array.sort contract: compare(a, b) < 0 means
 * "a comes out first". That one parameter makes this a min-heap, a max-heap
 * or an object priority queue.
 */
export class Heap {
  #data;
  #compare;

  constructor(compare = (a, b) => a - b, items = []) {
    this.#compare = compare;
    this.#data = [...items];
    // Bulk build in O(n): sift down from the last parent backwards. A node at
    // height h costs O(h) and only n/2^(h+1) nodes sit that high, so the sum
    // telescopes to O(n). Pushing one at a time would be O(n log n).
    for (let i = (this.#data.length >> 1) - 1; i >= 0; i--) this.#siftDown(i);
  }

  get size() {
    return this.#data.length;
  }

  isEmpty() {
    return this.#data.length === 0;
  }

  /** O(1) - the entire point of a heap. */
  peek() {
    if (this.isEmpty()) throw new RangeError("peek at empty heap");
    return this.#data[0];
  }

  /** Append at the end, then sift up. O(log n). */
  push(value) {
    this.#data.push(value);
    this.#siftUp(this.#data.length - 1);
    return this;
  }

  /**
   * Remove and return the root. O(log n).
   * The LAST element moves to the root (keeping the tree complete) and sinks.
   */
  pop() {
    if (this.isEmpty()) throw new RangeError("pop from empty heap");
    const top = this.#data[0];
    const last = this.#data.pop();
    if (this.#data.length) {
      this.#data[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#compare(this.#data[parent], this.#data[i]) <= 0) return;
      [this.#data[parent], this.#data[i]] = [this.#data[i], this.#data[parent]];
      i = parent;
    }
  }

  #siftDown(i) {
    const n = this.#data.length;
    for (;;) {
      let best = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.#compare(this.#data[left], this.#data[best]) < 0) best = left;
      if (right < n && this.#compare(this.#data[right], this.#data[best]) < 0) best = right;
      if (best === i) return;
      [this.#data[i], this.#data[best]] = [this.#data[best], this.#data[i]];
      i = best;
    }
  }

  /** Used by the tests: verify the invariant at every node. */
  isValid() {
    for (let i = 1; i < this.#data.length; i++) {
      if (this.#compare(this.#data[(i - 1) >> 1], this.#data[i]) > 0) return false;
    }
    return true;
  }
}

// ============================================================================
// 2. Heapsort
// ============================================================================
/** O(n) to build, then n pops of O(log n). */
export function heapSort(nums) {
  const heap = new Heap((a, b) => a - b, nums);
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out;
}

// ============================================================================
// 3. Top k with a size-k heap
// ============================================================================
/**
 * The kth largest value. O(n log k) time, O(k) space.
 *
 * Counter-intuitive but essential: for the k LARGEST, keep a MIN-heap of size
 * k. Its root is the weakest survivor, so anything smaller is rejected in
 * O(1) and the heap never grows past k.
 */
export function kthLargest(nums, k) {
  if (k < 1 || k > nums.length) throw new RangeError("k out of range");
  const heap = new Heap((a, b) => a - b); // min-heap
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop(); // evict the smallest survivor
  }
  return heap.peek();
}

/** The k most frequent values - the same size-k trick, keyed on the count. */
export function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);

  const heap = new Heap((a, b) => a.count - b.count); // min-heap by count
  for (const [value, count] of counts) {
    heap.push({ value, count });
    if (heap.size > k) heap.pop();
  }

  const best = [];
  while (!heap.isEmpty()) best.push(heap.pop());
  return best.reverse().map((entry) => entry.value); // most frequent first
}

// ============================================================================
// 4. Merging k sorted arrays
// ============================================================================
/**
 * O(N log k) for N total elements: the heap holds at most one element per
 * array, so it stays size k. Merging pairwise would be O(N k).
 */
export function mergeKSorted(lists) {
  const heap = new Heap((a, b) => a.value - b.value);
  lists.forEach((list, listIndex) => {
    if (list.length) heap.push({ value: list[0], listIndex, elementIndex: 0 });
  });

  const out = [];
  while (!heap.isEmpty()) {
    const { value, listIndex, elementIndex } = heap.pop();
    out.push(value);
    const next = elementIndex + 1;
    if (next < lists[listIndex].length) {
      heap.push({ value: lists[listIndex][next], listIndex, elementIndex: next });
    }
  }
  return out;
}

// ============================================================================
// 5. Two heaps for a running median
// ============================================================================
/**
 * Median of a growing stream. add() is O(log n), median() is O(1).
 *
 * `low` is a max-heap holding the smaller half; `high` is a min-heap holding
 * the larger half. Every value enters `low` first and its maximum is handed
 * to `high` - that push-then-pop is what keeps the halves correctly ORDERED,
 * not merely balanced.
 */
export class MedianFinder {
  #low = new Heap((a, b) => b - a); // max-heap
  #high = new Heap((a, b) => a - b); // min-heap

  add(value) {
    this.#low.push(value);
    this.#high.push(this.#low.pop()); // hand the largest of the low half up
    if (this.#high.size > this.#low.size) this.#low.push(this.#high.pop());
  }

  median() {
    if (this.#low.isEmpty()) throw new RangeError("median of an empty stream");
    if (this.#low.size > this.#high.size) return this.#low.peek();
    return (this.#low.peek() + this.#high.peek()) / 2;
  }
}

// ============================================================================
// 6. Priority queue with tie-breaking
// ============================================================================
/**
 * Lower priority numbers run first. The counter is not decoration: on a tie
 * the comparator falls through to insertion order, making the queue stable
 * instead of arbitrary.
 */
export class TaskQueue {
  #heap = new Heap((a, b) => a.priority - b.priority || a.sequence - b.sequence);
  #counter = 0;

  add(priority, name) {
    this.#heap.push({ priority, sequence: this.#counter++, name });
  }

  nextTask() {
    if (this.#heap.isEmpty()) throw new RangeError("no tasks");
    return this.#heap.pop().name;
  }

  get size() {
    return this.#heap.size;
  }
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const heap = new Heap();
  for (const x of [5, 3, 8, 1, 9, 2]) heap.push(x);
  assert.equal(heap.peek(), 1);
  assert.equal(heap.size, 6);
  assert.ok(heap.isValid());
  assert.equal(heap.pop(), 1);
  assert.equal(heap.pop(), 2);
  assert.equal(heap.peek(), 3);
  assert.ok(heap.isValid());
  assert.throws(() => new Heap().pop(), RangeError);

  // The O(n) bulk build must produce a valid heap.
  const built = new Heap((a, b) => a - b, [9, 4, 7, 1, 8, 2, 6]);
  assert.ok(built.isValid());
  assert.equal(built.peek(), 1);

  // A max-heap is the same class with a flipped comparator.
  const maxHeap = new Heap((a, b) => b - a, [5, 3, 8, 1]);
  assert.equal(maxHeap.peek(), 8);
  assert.equal(maxHeap.pop(), 8);
  assert.equal(maxHeap.pop(), 5);

  // Randomised: heapsort must agree with the built-in sort every time.
  let seed = 13;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let trial = 0; trial < 200; trial++) {
    const n = Math.floor(rand() * 40);
    const data = Array.from({ length: n }, () => Math.floor(rand() * 200) - 100);
    assert.deepEqual(heapSort(data), [...data].sort((a, b) => a - b));
  }

  assert.equal(kthLargest([3, 2, 1, 5, 6, 4], 2), 5);
  assert.equal(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4);
  assert.equal(kthLargest([1], 1), 1);
  {
    const data = [3, 2, 1, 5, 6, 4];
    const descending = [...data].sort((a, b) => b - a);
    for (let k = 1; k <= data.length; k++) {
      assert.equal(kthLargest(data, k), descending[k - 1]);
    }
  }

  assert.deepEqual(topKFrequent([1, 1, 1, 2, 2, 3], 2), [1, 2]);
  assert.deepEqual(topKFrequent([1], 1), [1]);

  assert.deepEqual(
    mergeKSorted([
      [1, 4, 5],
      [1, 3, 4],
      [2, 6],
    ]),
    [1, 1, 2, 3, 4, 4, 5, 6],
  );
  assert.deepEqual(mergeKSorted([[], [1]]), [1]);
  assert.deepEqual(mergeKSorted([]), []);

  const median = new MedianFinder();
  median.add(1);
  assert.equal(median.median(), 1);
  median.add(2);
  assert.equal(median.median(), 1.5); // even count: average of the two
  median.add(3);
  assert.equal(median.median(), 2);
  for (const x of [10, -5, 7, 0]) median.add(x);
  assert.equal(median.median(), 2); // sorted: -5 0 1 2 3 7 10

  const tasks = new TaskQueue();
  tasks.add(2, "write tests");
  tasks.add(1, "fix the bug");
  tasks.add(1, "review the PR"); // same priority as the previous
  assert.equal(tasks.nextTask(), "fix the bug"); // lower number first
  assert.equal(tasks.nextTask(), "review the PR"); // tie broken by arrival
  assert.equal(tasks.nextTask(), "write tests");
  assert.equal(tasks.size, 0);

  console.log("13-Heaps-Priority-Queue (JavaScript): all checks passed");
}

demo();
