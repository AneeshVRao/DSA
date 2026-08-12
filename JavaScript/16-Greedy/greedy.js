/**
 * 16 - Greedy: the classic greedy algorithms, the sort key that makes each one
 * work, and a runnable demonstration of where greedy breaks.
 *
 * Run:  node greedy.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 0. A minimal min-heap (JS has none) - Huffman and stick-merging need it
// ============================================================================
class MinHeap {
  #data = [];
  #compare;

  constructor(compare = (a, b) => a - b, items = []) {
    this.#compare = compare;
    this.#data = [...items];
    for (let i = (this.#data.length >> 1) - 1; i >= 0; i--) this.#siftDown(i);
  }

  get size() {
    return this.#data.length;
  }

  push(value) {
    this.#data.push(value);
    let i = this.#data.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#compare(this.#data[parent], this.#data[i]) <= 0) break;
      [this.#data[parent], this.#data[i]] = [this.#data[i], this.#data[parent]];
      i = parent;
    }
  }

  pop() {
    const top = this.#data[0];
    const last = this.#data.pop();
    if (this.#data.length) {
      this.#data[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  #siftDown(i) {
    const n = this.#data.length;
    for (;;) {
      let best = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.#compare(this.#data[l], this.#data[best]) < 0) best = l;
      if (r < n && this.#compare(this.#data[r], this.#data[best]) < 0) best = r;
      if (best === i) return;
      [this.#data[i], this.#data[best]] = [this.#data[best], this.#data[i]];
      i = best;
    }
  }
}

// ============================================================================
// 1. Sort by END time - activity selection
// ============================================================================
/**
 * Maximum number of non-overlapping activities. O(n log n).
 *
 * Sort by END time: finishing as early as possible leaves the most room for
 * what follows. The exchange argument proves it - swapping any later-ending
 * choice for the earliest-ending one never loses an activity. Sorting by
 * start time or duration both fail.
 */
export function activitySelection(intervals) {
  const chosen = [];
  let lastEnd = -Infinity;
  for (const [start, end] of [...intervals].sort((a, b) => a[1] - b[1])) {
    if (start >= lastEnd) {
      chosen.push([start, end]);
      lastEnd = end;
    }
  }
  return chosen;
}

/** The complement: keep as many as possible, remove the rest. */
export function eraseOverlapIntervals(intervals) {
  return intervals.length - activitySelection(intervals).length;
}

// ============================================================================
// 2. Sort by START time - merging
// ============================================================================
/**
 * Merge all overlapping intervals. O(n log n).
 * Sorting by START is what makes overlapping intervals adjacent, so a single
 * sweep suffices.
 */
export function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const ordered = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [ordered[0].slice()];
  for (const [start, end] of ordered.slice(1)) {
    const last = merged.at(-1);
    if (start <= last[1]) last[1] = Math.max(last[1], end); // overlap: extend
    else merged.push([start, end]);
  }
  return merged;
}

/**
 * Minimum platforms so no train waits. O(n log n).
 * Sort arrivals and departures INDEPENDENTLY: which train is which does not
 * matter, only how many are present at once.
 */
export function minPlatforms(arrivals, departures) {
  if (!arrivals.length) return 0;
  const inbound = [...arrivals].sort((a, b) => a - b);
  const outbound = [...departures].sort((a, b) => a - b);

  let platforms = 0;
  let best = 0;
  let i = 0;
  let j = 0;
  while (i < inbound.length) {
    if (inbound[i] <= outbound[j]) {
      platforms++; // a train arrives first
      best = Math.max(best, platforms);
      i++;
    } else {
      platforms--; // one leaves first
      j++;
    }
  }
  return best;
}

// ============================================================================
// 3. Sort by RATIO - fractional knapsack
// ============================================================================
/**
 * Maximum value when items can be split. O(n log n).
 *
 * Greedy works HERE but not for 0/1 knapsack: fractions let you fill the
 * capacity exactly, so best-value-per-weight-first can never be beaten.
 * Without fractions a high-ratio item can waste space - which is exactly why
 * chapter 15 needs a DP table.
 */
export function fractionalKnapsack(weights, values, capacity) {
  const items = weights
    .map((weight, i) => [weight, values[i]])
    .sort((a, b) => b[1] / b[0] - a[1] / a[0]); // by ratio, descending

  let total = 0;
  for (const [weight, value] of items) {
    if (capacity <= 0) break;
    const take = Math.min(weight, capacity); // whole item, or a slice
    total += value * (take / weight);
    capacity -= take;
  }
  return total;
}

// ============================================================================
// 4. Running frontier - one pass, no sorting
// ============================================================================
/**
 * Can you reach the last index? O(n) time, O(1) space.
 * Track only the furthest reachable index; standing beyond it means the gap
 * is unbridgeable.
 */
export function canJump(nums) {
  let furthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > furthest) return false; // stranded
    furthest = Math.max(furthest, i + nums[i]);
  }
  return true;
}

/**
 * Fewest jumps to the last index. O(n) time, O(1) space.
 * A BFS over the array without a queue: `currentEnd` marks the end of the
 * current level, and reaching it means one more jump was needed.
 */
export function minJumps(nums) {
  if (nums.length <= 1) return 0;
  let jumps = 0;
  let currentEnd = 0;
  let furthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    furthest = Math.max(furthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++; // the level is exhausted
      currentEnd = furthest;
      if (currentEnd >= nums.length - 1) break;
    }
  }
  return jumps;
}

/**
 * Starting station for a full circuit, or -1. O(n) time, O(1) space.
 *
 * Two facts make one pass enough:
 *   1. total gas < total cost means no answer exists;
 *   2. if the tank goes negative at station i, no station between the current
 *      start and i can work either - so restart at i + 1.
 */
export function gasStation(gas, cost) {
  const totalGas = gas.reduce((a, b) => a + b, 0);
  const totalCost = cost.reduce((a, b) => a + b, 0);
  if (totalGas < totalCost) return -1;

  let start = 0;
  let tank = 0;
  for (let i = 0; i < gas.length; i++) {
    tank += gas[i] - cost[i];
    if (tank < 0) {
      start = i + 1; // everything before i fails too
      tank = 0;
    }
  }
  return start;
}

// ============================================================================
// 5. Always take the extreme - Huffman coding
// ============================================================================
/**
 * Optimal prefix-free codes. O(n log n).
 *
 * Repeatedly merge the two LEAST frequent nodes: rare symbols end up deepest
 * in the tree and get the longest codes. Provably optimal (Huffman, 1952).
 * The symbol tie-break keeps the output deterministic.
 */
export function huffmanCodes(frequencies) {
  const entries = [...Object.entries(frequencies)];
  if (entries.length === 0) return {};
  if (entries.length === 1) return { [entries[0][0]]: "0" }; // still needs a bit

  const heap = new MinHeap(
    (a, b) => a.weight - b.weight || (a.tag < b.tag ? -1 : 1),
    entries.map(([symbol, weight]) => ({ weight, tag: symbol, symbol })),
  );

  while (heap.size > 1) {
    const left = heap.pop();
    const right = heap.pop();
    heap.push({
      weight: left.weight + right.weight,
      tag: left.tag < right.tag ? left.tag : right.tag,
      left,
      right,
    });
  }

  const codes = {};
  const assign = (node, prefix) => {
    if (node.symbol !== undefined) {
      codes[node.symbol] = prefix;
      return;
    }
    assign(node.left, prefix + "0");
    assign(node.right, prefix + "1");
  };
  assign(heap.pop(), "");
  return codes;
}

/**
 * Minimum total cost to merge all sticks. O(n log n).
 * Always merge the two cheapest: every merge cost is paid again by every later
 * merge containing it, so the smallest values must be merged earliest.
 */
export function connectSticks(lengths) {
  if (lengths.length <= 1) return 0;
  const heap = new MinHeap((a, b) => a - b, lengths);
  let total = 0;
  while (heap.size > 1) {
    const cost = heap.pop() + heap.pop();
    total += cost;
    heap.push(cost);
  }
  return total;
}

// ============================================================================
// 6. Where greedy BREAKS
// ============================================================================
/**
 * Take the largest coin that fits, repeatedly.
 * Correct for canonical systems like [1,5,10,25]; WRONG in general - the demo
 * proves it with [1,3,4] and 6. Returns null when it cannot make the amount.
 */
export function coinChangeGreedy(coins, amount) {
  let remaining = amount;
  let used = 0;
  for (const coin of [...coins].sort((a, b) => b - a)) {
    used += Math.floor(remaining / coin);
    remaining %= coin;
  }
  return remaining === 0 ? used : null;
}

/** The correct answer for any coin system. O(coins * amount). */
export function coinChangeDp(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let value = coin; value <= amount; value++) {
      dp[value] = Math.min(dp[value], dp[value - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? null : dp[amount];
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const activities = [
    [1, 4],
    [3, 5],
    [0, 6],
    [5, 7],
    [3, 9],
    [5, 9],
    [6, 10],
    [8, 11],
  ];
  const chosen = activitySelection(activities);
  assert.deepEqual(chosen, [
    [1, 4],
    [5, 7],
    [8, 11],
  ]);
  for (let i = 0; i + 1 < chosen.length; i++) {
    assert.ok(chosen[i][1] <= chosen[i + 1][0]); // really disjoint
  }
  assert.deepEqual(activitySelection([]), []);

  // Sorting by START instead of END gives a worse answer - the sort key IS the
  // algorithm. Earliest-start takes [0,6] and blocks [1,4] and [5,7].
  {
    const naive = [];
    let lastEnd = -Infinity;
    for (const [start, end] of [...activities].sort((a, b) => a[0] - b[0])) {
      if (start >= lastEnd) {
        naive.push([start, end]);
        lastEnd = end;
      }
    }
    assert.ok(naive.length < chosen.length);
  }

  assert.equal(
    eraseOverlapIntervals([
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 3],
    ]),
    1,
  );
  assert.equal(eraseOverlapIntervals([]), 0);

  assert.deepEqual(
    mergeIntervals([
      [1, 3],
      [2, 6],
      [8, 10],
      [15, 18],
    ]),
    [
      [1, 6],
      [8, 10],
      [15, 18],
    ],
  );
  assert.deepEqual(
    mergeIntervals([
      [1, 4],
      [4, 5],
    ]),
    [[1, 5]],
  ); // touching intervals merge
  assert.deepEqual(mergeIntervals([]), []);

  assert.equal(
    minPlatforms([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]),
    3,
  );
  assert.equal(minPlatforms([100], [200]), 1);
  assert.equal(minPlatforms([], []), 0);

  const total = fractionalKnapsack([10, 20, 30], [60, 100, 120], 50);
  assert.ok(Math.abs(total - 240) < 1e-9); // 10 + 20 + two thirds of 30
  assert.equal(fractionalKnapsack([10], [60], 5), 30); // half an item

  assert.ok(canJump([2, 3, 1, 1, 4]));
  assert.ok(!canJump([3, 2, 1, 0, 4])); // the 0 at index 3 strands you
  assert.ok(canJump([0])); // already at the end

  assert.equal(minJumps([2, 3, 1, 1, 4]), 2); // 0 -> 1 -> 4
  assert.equal(minJumps([2, 3, 0, 1, 4]), 2);
  assert.equal(minJumps([0]), 0);

  assert.equal(gasStation([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), 3);
  assert.equal(gasStation([2, 3, 4], [3, 4, 3]), -1); // not enough gas
  assert.equal(gasStation([5], [4]), 0);

  const codes = huffmanCodes({ a: 45, b: 13, c: 12, d: 16, e: 9, f: 5 });
  assert.equal(Object.keys(codes).length, 6);
  // Prefix-free: no code is a prefix of another. That is what makes the
  // encoding decodable without separators.
  for (const x of Object.values(codes)) {
    for (const y of Object.values(codes)) {
      assert.ok(x === y || !y.startsWith(x));
    }
  }
  const shortest = Math.min(...Object.values(codes).map((c) => c.length));
  assert.equal(codes.a.length, shortest); // most frequent gets the shortest
  assert.ok(codes.a.length < codes.f.length);
  assert.deepEqual(huffmanCodes({ z: 1 }), { z: "0" });
  assert.deepEqual(huffmanCodes({}), {});

  assert.equal(connectSticks([2, 4, 3]), 14); // (2+3)=5, then (5+4)=9
  assert.equal(connectSticks([1, 8, 3, 5]), 30);
  assert.equal(connectSticks([5]), 0);

  // Greedy is optimal on a canonical coin system ...
  assert.equal(coinChangeGreedy([1, 5, 10, 25], 63), 6); // 25,25,10,1,1,1
  assert.equal(coinChangeDp([1, 5, 10, 25], 63), 6);
  // ... and WRONG on this one. This is the whole reason DP exists.
  assert.equal(coinChangeGreedy([1, 3, 4], 6), 3); // 4 + 1 + 1
  assert.equal(coinChangeDp([1, 3, 4], 6), 2); // 3 + 3
  assert.ok(coinChangeGreedy([1, 3, 4], 6) > coinChangeDp([1, 3, 4], 6));
  assert.equal(coinChangeGreedy([5], 3), null);
  assert.equal(coinChangeDp([5], 3), null);

  console.log("16-Greedy (JavaScript): all checks passed");
}

demo();
