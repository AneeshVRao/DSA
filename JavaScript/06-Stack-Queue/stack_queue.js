/**
 * 06 - Stack and Queue: both from scratch (including a queue that is not
 * accidentally O(n^2)), plus the monotonic-stack patterns.
 *
 * Run:  node stack_queue.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. Stack (LIFO) - an array with the right vocabulary
// ============================================================================
export class Stack {
  #items = [];

  push(item) {
    this.#items.push(item); // O(1) amortised
    return this;
  }

  pop() {
    if (this.isEmpty()) throw new RangeError("pop from empty stack");
    return this.#items.pop(); // O(1)
  }

  peek() {
    if (this.isEmpty()) throw new RangeError("peek at empty stack");
    return this.#items.at(-1);
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  get size() {
    return this.#items.length;
  }
}

// ============================================================================
// 2. Queue with a head index (the fix for shift())
// ============================================================================
/**
 * enqueue and dequeue are both O(1). Instead of shifting every element left
 * (which is what Array.shift does), we move a head pointer forward and
 * compact the array only when the dead prefix dominates.
 */
export class Queue {
  #items = [];
  #head = 0;

  enqueue(item) {
    this.#items.push(item);
    return this;
  }

  dequeue() {
    if (this.isEmpty()) throw new RangeError("dequeue from empty queue");
    const item = this.#items[this.#head];
    this.#items[this.#head] = undefined; // release the reference for the GC
    this.#head++;

    // Amortised compaction: only when more than half the array is dead space.
    if (this.#head * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }
    return item;
  }

  front() {
    if (this.isEmpty()) throw new RangeError("front of empty queue");
    return this.#items[this.#head];
  }

  isEmpty() {
    return this.size === 0;
  }

  get size() {
    return this.#items.length - this.#head;
  }

  toArray() {
    return this.#items.slice(this.#head);
  }
}

// ============================================================================
// 3. Circular buffer queue (fixed capacity, zero allocation after construction)
// ============================================================================
export class CircularQueue {
  #buf;
  #capacity;
  #head = 0;
  #count = 0;

  constructor(capacity) {
    if (capacity <= 0) throw new RangeError("capacity must be positive");
    this.#buf = new Array(capacity).fill(undefined);
    this.#capacity = capacity;
  }

  enqueue(item) {
    if (this.isFull()) throw new RangeError("queue is full");
    // The write position is derived, so nothing is ever shifted.
    this.#buf[(this.#head + this.#count) % this.#capacity] = item;
    this.#count++;
  }

  dequeue() {
    if (this.isEmpty()) throw new RangeError("dequeue from empty queue");
    const item = this.#buf[this.#head];
    this.#buf[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.#capacity;
    this.#count--;
    return item;
  }

  front() {
    if (this.isEmpty()) throw new RangeError("front of empty queue");
    return this.#buf[this.#head];
  }

  isEmpty() {
    return this.#count === 0;
  }

  isFull() {
    return this.#count === this.#capacity;
  }

  get size() {
    return this.#count;
  }

  toArray() {
    return Array.from(
      { length: this.#count },
      (_, i) => this.#buf[(this.#head + i) % this.#capacity],
    );
  }
}

// ============================================================================
// 4. MinStack - O(1) minimum
// ============================================================================
/** Store [value, minSoFar] pairs: O(n) space buys an O(1) query. */
export class MinStack {
  #items = [];

  push(val) {
    const currentMin = this.#items.length === 0 ? val : Math.min(val, this.min());
    this.#items.push([val, currentMin]);
  }

  pop() {
    if (this.#items.length === 0) throw new RangeError("pop from empty stack");
    return this.#items.pop()[0];
  }

  top() {
    return this.#items.at(-1)[0];
  }

  min() {
    return this.#items.at(-1)[1];
  }

  get size() {
    return this.#items.length;
  }
}

// ============================================================================
// 5. Queue built from two stacks
// ============================================================================
/**
 * Pouring inbox into outbox reverses the order, so the oldest element lands on
 * top of outbox. Each element moves at most twice: amortised O(1).
 */
export class QueueViaStacks {
  #inbox = [];
  #outbox = [];

  enqueue(item) {
    this.#inbox.push(item);
  }

  dequeue() {
    this.#shift();
    if (this.#outbox.length === 0) throw new RangeError("dequeue from empty queue");
    return this.#outbox.pop();
  }

  front() {
    this.#shift();
    if (this.#outbox.length === 0) throw new RangeError("front of empty queue");
    return this.#outbox.at(-1);
  }

  #shift() {
    if (this.#outbox.length === 0) {
      while (this.#inbox.length) this.#outbox.push(this.#inbox.pop());
    }
  }

  get size() {
    return this.#inbox.length + this.#outbox.length;
  }
}

// ============================================================================
// 6. Matching / nesting
// ============================================================================
/** A closer must match the most recent opener. O(n) time and space. */
export function isBalanced(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false; // undefined !== opener
    }
  }
  return stack.length === 0; // leftovers mean unclosed openers
}

// ============================================================================
// 7. Monotonic stack
// ============================================================================
/** Next strictly greater element to the right, or -1. O(n). */
export function nextGreater(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = []; // indices; their values decrease
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack.at(-1)] < nums[i]) {
      result[stack.pop()] = nums[i]; // nums[i] answers that index
    }
    stack.push(i);
  }
  return result;
}

/** Days to wait for a warmer temperature - the stack must hold indices. */
export function dailyTemperatures(temps) {
  const result = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack.at(-1)] < temps[i]) {
      const j = stack.pop();
      result[j] = i - j;
    }
    stack.push(i);
  }
  return result;
}

/**
 * Largest rectangle in a histogram. O(n) with a monotonic increasing stack.
 * A shorter bar means every taller bar on the stack is finished; the trailing
 * 0 sentinel flushes the rest.
 */
export function largestRectangle(heights) {
  const h = [...heights, 0]; // sentinel
  const stack = [];
  let best = 0;
  for (let i = 0; i < h.length; i++) {
    while (stack.length && h[stack.at(-1)] >= h[i]) {
      const height = h[stack.pop()];
      const left = stack.length ? stack.at(-1) + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return best;
}

// ============================================================================
// 8. Simulation
// ============================================================================
/** Reverse Polish notation. Operand order matters for - and /. */
export function evalRPN(tokens) {
  const stack = [];
  const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.trunc(a / b), // truncate toward zero, not floor
  };
  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop();
}

/** Unix path canonicalisation: "/a/./b/../c" -> "/a/c". O(n). */
export function simplifyPath(path) {
  const stack = [];
  for (const part of path.split("/")) {
    if (part === "..") stack.pop();
    else if (part && part !== ".") stack.push(part);
  }
  return "/" + stack.join("/");
}

/**
 * Maximum of every window of size k. O(n) with a monotonic deque of indices:
 * the front is always the window maximum.
 */
export function slidingWindowMax(nums, k) {
  if (k <= 0 || k > nums.length) throw new RangeError("bad window size");
  const dq = []; // indices, values decreasing; used as a deque
  const out = [];
  let head = 0; // head index instead of shift()
  for (let i = 0; i < nums.length; i++) {
    while (head < dq.length && dq[head] <= i - k) head++; // expired
    while (dq.length > head && nums[dq.at(-1)] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const st = new Stack();
  st.push(1).push(2);
  assert.equal(st.peek(), 2);
  assert.equal(st.size, 2);
  assert.equal(st.pop(), 2);
  assert.equal(st.pop(), 1);
  assert.ok(st.isEmpty());
  assert.throws(() => st.pop(), RangeError);

  const q = new Queue();
  q.enqueue(1).enqueue(2).enqueue(3);
  assert.equal(q.front(), 1);
  assert.equal(q.dequeue(), 1);
  q.enqueue(4);
  assert.deepEqual(q.toArray(), [2, 3, 4]);
  assert.equal(q.size, 3);
  // Drain a big queue: O(n) with the head index, O(n^2) with shift().
  const big = new Queue();
  for (let i = 0; i < 50000; i++) big.enqueue(i);
  let sum = 0;
  while (!big.isEmpty()) sum += big.dequeue();
  assert.equal(sum, (49999 * 50000) / 2);

  const cq = new CircularQueue(3);
  cq.enqueue(1);
  cq.enqueue(2);
  cq.enqueue(3);
  assert.ok(cq.isFull());
  assert.deepEqual(cq.toArray(), [1, 2, 3]);
  assert.equal(cq.dequeue(), 1);
  cq.enqueue(4); // wraps around
  assert.deepEqual(cq.toArray(), [2, 3, 4]);
  assert.throws(() => cq.enqueue(5), RangeError);

  const ms = new MinStack();
  for (const v of [5, 3, 7, 3]) ms.push(v);
  assert.equal(ms.min(), 3);
  assert.equal(ms.top(), 3);
  ms.pop();
  assert.equal(ms.min(), 3);
  ms.pop(); // removes 7
  ms.pop(); // removes the first 3
  assert.equal(ms.min(), 5);

  const qs = new QueueViaStacks();
  for (const v of [1, 2, 3]) qs.enqueue(v);
  assert.equal(qs.front(), 1);
  assert.equal(qs.dequeue(), 1);
  qs.enqueue(4);
  assert.deepEqual([qs.dequeue(), qs.dequeue(), qs.dequeue()], [2, 3, 4]);

  assert.ok(isBalanced("({[]})"));
  assert.ok(isBalanced(""));
  assert.ok(!isBalanced("(]"));
  assert.ok(!isBalanced("(("));

  assert.deepEqual(nextGreater([2, 1, 2, 4, 3]), [4, 2, 4, -1, -1]);
  assert.deepEqual(
    dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]),
    [1, 1, 4, 2, 1, 1, 0, 0],
  );
  assert.equal(largestRectangle([2, 1, 5, 6, 2, 3]), 10);
  assert.equal(largestRectangle([2, 2]), 4);

  assert.equal(evalRPN(["2", "1", "+", "3", "*"]), 9);
  assert.equal(evalRPN(["4", "13", "5", "/", "+"]), 6);

  assert.equal(simplifyPath("/a/./b/../../c/"), "/c");
  assert.equal(simplifyPath("/../"), "/");

  assert.deepEqual(slidingWindowMax([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);

  console.log("06-Stack-Queue (JavaScript): all checks passed");
}

demo();
