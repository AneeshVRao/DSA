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
// ============================================================================
// Indexed priority queue - a heap whose keys can be CHANGED
// ============================================================================
/**
 * A min-heap supporting change-priority and remove in O(log n).
 *
 * THE PROBLEM. A plain binary heap can only look at its root. To lower the
 * priority of an arbitrary item you would first have to FIND it - O(n) - which
 * defeats the point. So the standard workaround in Dijkstra is to push a
 * duplicate entry and skip stale ones on pop:
 *
 *     if (distance > best[node]) continue;   // stale entry, ignore it
 *
 * Correct, and usually fine, but the heap can grow to O(E) entries not O(V).
 *
 * THE FIX. Keep a second structure - a map from item to its current position
 * in the heap array - updated on every swap. Now any item is located in O(1)
 * and re-sifted in O(log n).
 *
 *     heap[i]         the item at heap position i
 *     position[item]  the heap position of that item   (the inverse map)
 *
 * Every swap must update BOTH. That is the entire implementation difficulty:
 * one forgotten position write and the map silently goes stale, which surfaces
 * much later as a wrong answer rather than a crash.
 *
 * WHERE IT PAYS OFF:
 *   - Dijkstra and Prim with decrease-key: the heap stays O(V) entries
 *   - A* with reopened nodes
 *   - schedulers where a queued job's priority is revised
 *   - LRU/LFU caches with an evictable score per key
 *
 * JS has no priority queue at all, so this is written from scratch like the
 * heap above - but with the position map that makes re-keying possible.
 */
export class IndexedPriorityQueue {
  #heap = []; // [priority, item]
  #position = new Map(); // item -> heap index

  get size() {
    return this.#heap.length;
  }

  has(item) {
    return this.#position.has(item);
  }

  /** The ONE place the two structures are kept in step. */
  #swap(i, j) {
    [this.#heap[i], this.#heap[j]] = [this.#heap[j], this.#heap[i]];
    this.#position.set(this.#heap[i][1], i);
    this.#position.set(this.#heap[j][1], j);
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#heap[i][0] >= this.#heap[parent][0]) break;
      this.#swap(i, parent);
      i = parent;
    }
  }

  #siftDown(i) {
    for (;;) {
      let smallest = i;
      for (const child of [2 * i + 1, 2 * i + 2]) {
        if (child < this.#heap.length && this.#heap[child][0] < this.#heap[smallest][0]) {
          smallest = child;
        }
      }
      if (smallest === i) return;
      this.#swap(i, smallest);
      i = smallest;
    }
  }

  /** Insert, or update if already present. O(log n). */
  push(item, priority) {
    if (this.#position.has(item)) {
      this.changePriority(item, priority);
      return;
    }
    this.#heap.push([priority, item]);
    this.#position.set(item, this.#heap.length - 1);
    this.#siftUp(this.#heap.length - 1);
  }

  /** Smallest `[priority, item]` without removing it. O(1). */
  peek() {
    if (this.#heap.length === 0) throw new RangeError("peek from an empty queue");
    return this.#heap[0];
  }

  /** Remove and return the smallest `[priority, item]`. O(log n). */
  pop() {
    if (this.#heap.length === 0) throw new RangeError("pop from an empty queue");
    return this.#removeAt(0);
  }

  /**
   * Re-key an item already in the queue. O(log n).
   *
   * Sift whichever way the change calls for - decrease-key moves the item up,
   * increase-key moves it down.
   */
  changePriority(item, priority) {
    if (!this.#position.has(item)) throw new RangeError(`${item} is not in the queue`);
    const i = this.#position.get(item);
    const old = this.#heap[i][0];
    this.#heap[i] = [priority, item];
    if (priority < old) this.#siftUp(i);
    else if (priority > old) this.#siftDown(i);
  }

  /** Remove an arbitrary item. O(log n) - impossible with a plain heap. */
  remove(item) {
    if (!this.#position.has(item)) throw new RangeError(`${item} is not in the queue`);
    return this.#removeAt(this.#position.get(item));
  }

  /** Swap the target with the last slot, drop it, then re-sift. */
  #removeAt(i) {
    const last = this.#heap.length - 1;
    this.#swap(i, last);
    const removed = this.#heap.pop();
    this.#position.delete(removed[1]);

    if (i < last) {
      // something was moved into position i
      this.#siftDown(i);
      this.#siftUp(i); // it may belong ABOVE its new parent
    }
    return removed;
  }

  /** Exposed for the self-check: the invariant must hold after every op. */
  isValid() {
    if (this.#position.size !== this.#heap.length) return false;
    for (let i = 0; i < this.#heap.length; i++) {
      const [priority, item] = this.#heap[i];
      if (this.#position.get(item) !== i) return false;
      if (i > 0 && this.#heap[(i - 1) >> 1][0] > priority) return false;
    }
    return true;
  }
}

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
  // --- Indexed priority queue -------------------------------------------------
  const ipq = new IndexedPriorityQueue();
  for (const [item, priority] of [
    ["a", 5],
    ["b", 3],
    ["c", 8],
    ["d", 1],
  ]) {
    ipq.push(item, priority);
  }

  assert.equal(ipq.size, 4);
  assert.ok(ipq.has("c") && !ipq.has("z"));
  assert.deepEqual(ipq.peek(), [1, "d"]);

  // The operation a plain heap cannot do: re-key an interior item.
  ipq.changePriority("c", 0); // 8 -> 0, must rise to the top
  assert.equal(ipq.peek()[1], "c");
  ipq.changePriority("c", 100); // and back down again
  assert.equal(ipq.peek()[1], "d");

  // Remove from the middle, also impossible with a plain heap.
  assert.deepEqual(ipq.remove("a"), [5, "a"]);
  assert.ok(!ipq.has("a"));
  assert.equal(ipq.size, 3);

  assert.equal(ipq.pop()[1], "d");
  assert.equal(ipq.pop()[1], "b");
  assert.equal(ipq.pop()[1], "c");
  assert.equal(ipq.size, 0);

  assert.throws(() => ipq.pop(), RangeError);
  assert.throws(() => ipq.peek(), RangeError);

  // push() on an existing item updates rather than duplicating.
  ipq.push("x", 5);
  ipq.push("x", 2);
  assert.equal(ipq.size, 1);
  assert.deepEqual(ipq.peek(), [2, "x"]);

  // Against a reference map, with the invariant re-verified after EVERY
  // operation - a stale index would otherwise stay silent until much later.
  let ipqSeed = 13;
  const ipqRandom = () => {
    ipqSeed = (ipqSeed * 1103515245 + 12345) & 0x7fffffff;
    return ipqSeed / 0x7fffffff;
  };

  for (let trial = 0; trial < 60; trial++) {
    const queue = new IndexedPriorityQueue();
    const reference = new Map();

    for (let step = 0; step < 120; step++) {
      const item = `item${Math.floor(ipqRandom() * 15)}`;
      const roll = ipqRandom();

      if (roll < 0.45) {
        const priority = Math.floor(ipqRandom() * 101);
        queue.push(item, priority);
        reference.set(item, priority);
      } else if (roll < 0.65 && reference.has(item)) {
        const priority = Math.floor(ipqRandom() * 101);
        queue.changePriority(item, priority);
        reference.set(item, priority);
      } else if (roll < 0.8 && reference.has(item)) {
        assert.equal(queue.remove(item)[0], reference.get(item));
        reference.delete(item);
      } else if (reference.size) {
        const lowest = Math.min(...reference.values());
        const [priority, popped] = queue.pop();
        assert.equal(priority, lowest); // the true minimum
        assert.equal(reference.get(popped), priority);
        reference.delete(popped);
      }

      assert.equal(queue.size, reference.size);
      assert.ok(queue.isValid()); // heap AND position map
    }
  }


  console.log("13-Heaps-Priority-Queue (JavaScript): all checks passed");
}

demo();
