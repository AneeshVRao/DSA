/**
 * 17 - Bit Manipulation: the idioms, the XOR tricks, bitmasks as sets, and
 * JavaScript's 32-bit conversion rules.
 *
 * Run:  node bits.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. Single-bit operations
// ============================================================================
export const getBit = (n, i) => (n >> i) & 1;
export const setBit = (n, i) => n | (1 << i);
export const clearBit = (n, i) => n & ~(1 << i);
export const toggleBit = (n, i) => n ^ (1 << i); // XOR 1 flips, XOR 0 keeps

/**
 * Isolate the lowest set bit. Works because -n is ~n + 1 in two's complement:
 * every bit above the lowest set bit is inverted, so only that one survives.
 * This is the core of the Fenwick tree in chapter 19.
 */
export const lowestSetBit = (n) => n & -n;

/**
 * Clear the lowest set bit: n - 1 flips it to 0 and sets everything below it
 * to 1, so the AND removes exactly that bit.
 */
export const clearLowestSetBit = (n) => n & (n - 1);

// ============================================================================
// 2. Counting
// ============================================================================
/** Check every bit. O(32). `>>>` keeps negatives from looping forever. */
export function countSetBitsNaive(n) {
  let count = 0;
  let value = n >>> 0; // treat as unsigned
  while (value) {
    count += value & 1;
    value >>>= 1;
  }
  return count;
}

/**
 * Brian Kernighan: one iteration per SET bit, not per bit.
 * On 0b10000000 that is 1 iteration instead of 8.
 */
export function countSetBitsKernighan(n) {
  let count = 0;
  let value = n >>> 0;
  while (value) {
    value &= value - 1; // clear the lowest set bit
    count++;
  }
  return count;
}

/**
 * Set-bit counts for 0..n in O(n) total - a tiny DP over bits.
 * count[i] = count[i >> 1] + (i & 1): dropping the last bit gives a smaller,
 * already-computed number.
 */
export function countBitsUpTo(n) {
  const counts = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) counts[i] = counts[i >> 1] + (i & 1);
  return counts;
}

// ============================================================================
// 3. Powers of two
// ============================================================================
/** A power of two has exactly ONE set bit, so n & (n-1) clears it to 0. */
export const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;

/** Smallest power of two >= n. */
export function nextPowerOfTwo(n) {
  if (n <= 1) return 1;
  let power = 1;
  while (power < n) power *= 2; // *2 not <<1: stays correct past 2^30
  return power;
}

// ============================================================================
// 4. XOR tricks
// ============================================================================
/**
 * Every value appears twice except one. O(n) time, O(1) SPACE.
 * x ^ x === 0 and x ^ 0 === x, and XOR is commutative, so pairs cancel in any
 * order. A Set solves this too - in O(n) space.
 */
export function singleNumber(nums) {
  let result = 0;
  for (const x of nums) result ^= x;
  return result;
}

/**
 * Exactly two values appear once; everything else twice. O(n) / O(1).
 * XOR everything to get a ^ b; any set bit in that is a bit where a and b
 * DIFFER, so partitioning the array on that bit separates them.
 */
export function singleNumberTwoUniques(nums) {
  let xorAll = 0;
  for (const x of nums) xorAll ^= x;

  const distinguishing = xorAll & -xorAll; // a bit where they differ
  let a = 0;
  let b = 0;
  for (const x of nums) {
    if (x & distinguishing) a ^= x;
    else b ^= x;
  }
  return a < b ? [a, b] : [b, a];
}

/**
 * One number missing from 0..n. O(n) time, O(1) space.
 * XOR the indices with the values: everything present cancels. Immune to the
 * overflow that the sum formula can cause.
 */
export function missingNumber(nums) {
  let result = nums.length;
  for (let i = 0; i < nums.length; i++) result ^= i ^ nums[i];
  return result;
}

/** The classic XOR swap - a party trick that shows XOR is its own inverse. */
export function swapWithoutTemp(a, b) {
  a ^= b;
  b ^= a; // b = (a^b)^b = a
  a ^= b; // a = (a^b)^a = b
  return [a, b];
}

// ============================================================================
// 5. 32-bit work
// ============================================================================
/**
 * Reverse the bits of a 32-bit unsigned integer. O(32).
 * The final `>>> 0` is what turns the signed result back into an unsigned one.
 */
export function reverseBits(n) {
  let result = 0;
  let value = n >>> 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (value & 1);
    value >>>= 1;
  }
  return result >>> 0;
}

/**
 * Addition using only bitwise operations.
 * a ^ b adds without carrying; (a & b) << 1 is the carry. Repeat until the
 * carry is zero - and the whole thing stays inside 32 bits automatically.
 */
export function addWithoutPlus(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a ^= b;
    b = carry;
  }
  return a;
}

// ============================================================================
// 6. Bitmasks as sets
// ============================================================================
/**
 * All 2^n subsets, using each integer 0..2^n-1 as a membership mask.
 * O(n * 2^n) - the same as chapter 07's backtracking, with no recursion and no
 * explicit undo step. Safe while n <= 30.
 */
export function subsetsBitmask(items) {
  const n = items.length;
  const out = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) subset.push(items[i]);
    out.push(subset);
  }
  return out;
}

/**
 * Every submask of `mask`, including 0.
 * sub = (sub - 1) & mask jumps straight to the next submask instead of walking
 * every integer - the standard trick in bitmask DP.
 */
export function submasks(mask) {
  const out = [];
  for (let sub = mask; ; sub = (sub - 1) & mask) {
    out.push(sub);
    if (sub === 0) break;
  }
  return out;
}

/** Bits that differ: XOR marks them, then count. */
export const hammingDistance = (a, b) => countSetBitsKernighan(a ^ b);

// ============================================================================
// demo
// ============================================================================
function demo() {
  const n = 0b1010; // 10
  assert.equal(getBit(n, 1), 1);
  assert.equal(getBit(n, 0), 0);
  assert.equal(setBit(n, 0), 0b1011);
  assert.equal(clearBit(n, 1), 0b1000);
  assert.equal(toggleBit(n, 3), 0b0010);
  assert.equal(toggleBit(toggleBit(n, 3), 3), n); // toggling twice = identity

  assert.equal(lowestSetBit(0b1100), 0b100);
  assert.equal(lowestSetBit(0b1000), 0b1000);
  assert.equal(clearLowestSetBit(0b1100), 0b1000);
  assert.equal(clearLowestSetBit(1), 0);

  for (let value = 0; value < 300; value++) {
    const expected = value.toString(2).split("").filter((c) => c === "1").length;
    assert.equal(countSetBitsNaive(value), expected);
    assert.equal(countSetBitsKernighan(value), expected);
  }
  assert.deepEqual(countBitsUpTo(5), [0, 1, 1, 2, 1, 2]);
  assert.equal(countBitsUpTo(16)[16], 1);

  assert.ok(isPowerOfTwo(1) && isPowerOfTwo(1024));
  assert.ok(!isPowerOfTwo(0) && !isPowerOfTwo(6));
  assert.ok(!isPowerOfTwo(-8)); // negatives never qualify
  assert.equal(nextPowerOfTwo(1), 1);
  assert.equal(nextPowerOfTwo(5), 8);
  assert.equal(nextPowerOfTwo(16), 16);

  assert.equal(singleNumber([4, 1, 2, 1, 2]), 4);
  assert.equal(singleNumber([1]), 1);
  assert.equal(singleNumber([-1, -1, 7]), 7); // negatives work too

  assert.deepEqual(singleNumberTwoUniques([1, 2, 1, 3, 2, 5]), [3, 5]);
  assert.deepEqual(singleNumberTwoUniques([9, 4]), [4, 9]);

  assert.equal(missingNumber([3, 0, 1]), 2);
  assert.equal(missingNumber([0]), 1);
  assert.equal(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);

  assert.deepEqual(swapWithoutTemp(3, 5), [5, 3]);

  assert.equal(reverseBits(1), 2 ** 31);
  assert.equal(reverseBits(2 ** 31), 1);
  assert.equal(reverseBits(0), 0);
  assert.equal(reverseBits(reverseBits(0b1011)), 0b1011); // self-inverse

  assert.equal(addWithoutPlus(3, 5), 8);
  assert.equal(addWithoutPlus(-3, 5), 2);
  assert.equal(addWithoutPlus(-7, -8), -15);
  assert.equal(addWithoutPlus(0, 0), 0);

  const subs = subsetsBitmask([1, 2, 3]);
  assert.equal(subs.length, 8); // 2^3
  assert.ok(subs.some((s) => s.length === 0));
  assert.ok(subs.some((s) => s.join() === "1,2,3"));

  const allSubmasks = submasks(0b1010);
  assert.deepEqual([...allSubmasks].sort((a, b) => a - b), [0b0000, 0b0010, 0b1000, 0b1010]);
  for (const sub of allSubmasks) assert.equal(sub & 0b1010, sub); // really submasks

  assert.equal(hammingDistance(1, 4), 2); // 0001 vs 0100
  assert.equal(hammingDistance(3, 3), 0);

  // The 32-bit conversion, demonstrated rather than described.
  assert.equal(2 ** 31 | 0, -(2 ** 31)); // wraps to signed
  assert.equal(2 ** 32 | 0, 0); // everything above 32 bits is gone
  assert.equal(1 << 31, -(2 ** 31)); // the sign bit
  assert.equal(1 << 32, 1); // shift counts are taken mod 32
  assert.equal((1 << 31) >>> 0, 2 ** 31); // read back as unsigned
  assert.equal(Number.MAX_SAFE_INTEGER | 0, -1); // silently destroyed
  assert.equal(-8 >> 1, -4); // arithmetic shift keeps the sign
  assert.equal(-8 >>> 28, 15); // logical shift fills with zeros
  // BigInt keeps full precision where 32-bit operators cannot.
  assert.equal((1n << 40n) & (1n << 40n), 1n << 40n);

  console.log("17-Bit-Manipulation (JavaScript): all checks passed");
}

demo();
