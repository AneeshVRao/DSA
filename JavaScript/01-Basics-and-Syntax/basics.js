/**
 * 01 - Basics and Syntax: the JavaScript you need before any algorithm.
 *
 * Run:  node basics.js
 */

import assert from "node:assert/strict";

// ------------------------------------------------------------------ arrays --
export function arrayBasics() {
  const a = [3, 1, 2];
  a.push(4); // O(1) amortised
  const last = a.pop(); // O(1)
  a.push(last);

  return {
    values: a,
    firstTwo: a.slice(0, 2), // slice COPIES, does not mutate
    reversed: [...a].reverse(), // spread first, reverse() mutates
  };
}

/**
 * Array.prototype.sort compares STRINGS unless you pass a comparator.
 * [10, 9, 1].sort() === [1, 10, 9]. This bug survives small test cases and
 * dies on the judge.
 */
export function sortNumbers(nums) {
  return [...nums].sort((a, b) => a - b);
}

// --------------------------------------------------------------- Map / Set --
export function frequency(str) {
  const freq = new Map(); // keeps key type and insertion order
  for (const ch of str) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  return freq;
}

export function dedupe(nums) {
  return [...new Set(nums)]; // O(n), preserves first-seen order
}

/** `has` on a Set is O(1); indexOf/includes on an array is O(n). */
export function countKnown(nums, queries) {
  const seen = new Set(nums);
  return queries.filter((q) => seen.has(q)).length;
}

// -------------------------------------------------------------- 2-D arrays --
/**
 * `new Array(rows).fill(new Array(cols).fill(0))` stores the SAME row object
 * in every slot. Array.from with a factory builds a fresh row each time.
 */
export function makeGrid(rows, cols, fill = 0) {
  return Array.from({ length: rows }, () => new Array(cols).fill(fill));
}

// ------------------------------------------------------------- destructure --
export function destructuring() {
  const [first, ...rest] = [1, 2, 3];
  let a = 1;
  let b = 2;
  [a, b] = [b, a]; // swap without a temp
  const { val, next = null } = { val: 7 };
  return { first, rest, a, b, val, next };
}

// ------------------------------------------------------------------ classes --
export class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
  toString() {
    return `Node(${this.val})`;
  }
}

/** A stack over an array. `#items` is a real private field (ES2022). */
export class Stack {
  #items = [];

  push(x) {
    this.#items.push(x);
    return this; // chainable
  }
  pop() {
    return this.#items.pop();
  }
  peek() {
    return this.#items.at(-1); // .at(-1) beats [length - 1]
  }
  get size() {
    return this.#items.length;
  }
}

// ------------------------------------------------------------------ numbers --
export function numberTraps() {
  return {
    intDivision: Math.floor(7 / 2), // 3 - `/` is always float division
    truncated: (-7 / 2) | 0, // -3 - truncates toward zero, 32-bit only
    floatEquality: 0.1 + 0.2 === 0.3, // false
    closeEnough: Math.abs(0.1 + 0.2 - 0.3) < 1e-9, // true
    maxSafe: Number.MAX_SAFE_INTEGER, // 2^53 - 1
    big: 2n ** 64n, // BigInt: exact, arbitrary precision
  };
}

// ------------------------------------------------------------------ strings --
/** Strings are immutable; building with += in a loop can be O(n^2). */
export function buildString(parts) {
  return parts.join("");
}

// --------------------------------------------------------------------- demo --
function demo() {
  const ab = arrayBasics();
  assert.deepEqual(ab.values, [3, 1, 2, 4]);
  assert.deepEqual(ab.firstTwo, [3, 1]);
  assert.deepEqual(ab.reversed, [4, 2, 1, 3]);

  assert.deepEqual(sortNumbers([10, 9, 1]), [1, 9, 10]);
  assert.deepEqual([10, 9, 1].sort(), [1, 10, 9]); // the trap, proven

  const f = frequency("aab");
  assert.equal(f.get("a"), 2);
  assert.equal(f.get("b"), 1);

  assert.deepEqual(dedupe([1, 2, 2, 3, 1]), [1, 2, 3]);
  assert.equal(countKnown([1, 2, 3], [2, 2, 9]), 2);

  const grid = makeGrid(2, 3);
  grid[0][0] = 9;
  assert.deepEqual(grid, [
    [9, 0, 0],
    [0, 0, 0],
  ]); // rows must be independent

  const d = destructuring();
  assert.equal(d.first, 1);
  assert.deepEqual(d.rest, [2, 3]);
  assert.equal(d.a, 2);
  assert.equal(d.b, 1);
  assert.equal(d.val, 7);
  assert.equal(d.next, null);

  const n = new Node(1, new Node(2));
  assert.equal(n.next.val, 2);
  assert.equal(String(n), "Node(1)");

  const st = new Stack();
  st.push(1).push(2);
  assert.equal(st.peek(), 2);
  assert.equal(st.pop(), 2);
  assert.equal(st.size, 1);

  const nt = numberTraps();
  assert.equal(nt.intDivision, 3);
  assert.equal(nt.truncated, -3);
  assert.equal(nt.floatEquality, false);
  assert.equal(nt.closeEnough, true);
  assert.equal(nt.big, 18446744073709551616n);

  assert.equal(buildString(["a", "b", "c"]), "abc");

  console.log("01-Basics-and-Syntax (JavaScript): all checks passed");
}

demo();
