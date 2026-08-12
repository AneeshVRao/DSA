/**
 * 10 - Hashing: a hash map built from scratch (separate chaining + resizing),
 * plus the patterns hashing exists to serve, and an LRU cache.
 *
 * Run:  node hashing.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. A hash map from scratch (separate chaining)
// ============================================================================
/**
 * A dictionary over an array of buckets, each holding a chain of entries.
 * V8's real Map uses a different layout, but chaining shows every moving part:
 * hashing, bucket indexing, collisions, load factor and resizing.
 */
export class HashMap {
  static #INITIAL_CAPACITY = 8;
  static #MAX_LOAD_FACTOR = 0.75;

  #buckets = Array.from({ length: HashMap.#INITIAL_CAPACITY }, () => []);
  #size = 0;

  /** A small string hash (djb2). Real implementations use far stronger ones. */
  #hash(key) {
    const s = typeof key === "string" ? key : String(key);
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = (h * 33) ^ s.charCodeAt(i); // ^ mixes; * 33 spreads
      h |= 0; // keep it a 32-bit int
    }
    return Math.abs(h) % this.#buckets.length;
  }

  /**
   * Double the capacity and REHASH everything. O(n).
   * Rehashing is mandatory: the bucket index depends on the capacity.
   */
  #resize() {
    const old = this.#buckets;
    this.#buckets = Array.from({ length: old.length * 2 }, () => []);
    this.#size = 0;
    for (const chain of old) for (const [k, v] of chain) this.set(k, v);
  }

  get size() {
    return this.#size;
  }

  get capacity() {
    return this.#buckets.length;
  }

  get loadFactor() {
    return this.#size / this.#buckets.length;
  }

  /** O(1) average, amortised across the occasional resize. */
  set(key, value) {
    const chain = this.#buckets[this.#hash(key)];
    for (const entry of chain) {
      if (entry[0] === key) {
        entry[1] = value; // equal keys overwrite
        return this;
      }
    }
    chain.push([key, value]);
    this.#size++;
    if (this.loadFactor > HashMap.#MAX_LOAD_FACTOR) this.#resize();
    return this;
  }

  /** O(1) average; O(chain length) worst case. */
  get(key) {
    for (const [k, v] of this.#buckets[this.#hash(key)]) if (k === key) return v;
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    const chain = this.#buckets[this.#hash(key)];
    const i = chain.findIndex(([k]) => k === key);
    if (i === -1) return false;
    chain.splice(i, 1);
    this.#size--;
    return true;
  }

  keys() {
    return this.#buckets.flat().map(([k]) => k);
  }

  /** Diagnostic: how badly is this table colliding? */
  longestChain() {
    return Math.max(...this.#buckets.map((c) => c.length));
  }
}

// ============================================================================
// 2. Frequency map
// ============================================================================
/** One pass, O(n). A Map keeps key types intact, unlike an object. */
export function charFrequency(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  return freq;
}

export function firstUniqueChar(s) {
  const freq = charFrequency(s);
  for (let i = 0; i < s.length; i++) if (freq.get(s[i]) === 1) return i;
  return -1;
}

// ============================================================================
// 3. Complement lookup
// ============================================================================
/**
 * Indices of the pair summing to target. O(n) time and space.
 * Brute force asks "does x pair with a later element?" (O(n^2)); hashing
 * flips it to "have I already seen the complement?" (O(1) per check).
 */
export function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
    seen.set(nums[i], i); // store AFTER checking, so nothing pairs with itself
  }
  return null;
}

export function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

// ============================================================================
// 4. Grouping by a computed key
// ============================================================================
/** Any function mapping equivalent items to one value works as a group key. */
export function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

// ============================================================================
// 5. Prefix sum + map
// ============================================================================
/**
 * Number of contiguous subarrays summing to k. O(n) time and space.
 *
 * prefix[j] - prefix[i] === k means the subarray (i, j] sums to k, so at each
 * j we count how many earlier prefixes equal prefix[j] - k. Seeding
 * counts(0) = 1 represents the empty prefix, which is what lets subarrays
 * starting at index 0 be counted.
 */
export function subarraySumEqualsK(nums, k) {
  const counts = new Map([[0, 1]]);
  let prefix = 0;
  let total = 0;
  for (const x of nums) {
    prefix += x;
    total += counts.get(prefix - k) ?? 0;
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
  }
  return total;
}

// ============================================================================
// 6. Seen set
// ============================================================================
/**
 * Longest run of consecutive integers. O(n), not O(n log n).
 * Only start counting at a value whose predecessor is absent, so each run is
 * walked exactly once despite the inner while loop.
 */
export function longestConsecutive(nums) {
  const unique = new Set(nums);
  let best = 0;
  for (const x of unique) {
    if (unique.has(x - 1)) continue; // not the start of a run
    let length = 1;
    while (unique.has(x + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}

/** O(n + m) with a Set; O(n * m) with includes(). */
export function intersection(a, b) {
  const lookup = new Set(b);
  return [...new Set(a.filter((x) => lookup.has(x)))].sort((x, y) => x - y);
}

// ============================================================================
// 7. Hashing + ordering: an LRU cache
// ============================================================================
/**
 * O(1) get and put with a capacity limit.
 *
 * JS Maps preserve insertion order and `keys().next()` yields the oldest key,
 * so a Map alone provides both the hash lookup and the recency order that an
 * LRU needs - delete-then-set is how you move a key to the newest position.
 */
export class LRUCache {
  #capacity;
  #data = new Map();

  constructor(capacity) {
    if (capacity <= 0) throw new RangeError("capacity must be positive");
    this.#capacity = capacity;
  }

  get(key) {
    if (!this.#data.has(key)) return -1;
    const value = this.#data.get(key);
    this.#data.delete(key);
    this.#data.set(key, value); // re-insert = most recently used
    return value;
  }

  put(key, value) {
    if (this.#data.has(key)) this.#data.delete(key);
    this.#data.set(key, value);
    if (this.#data.size > this.#capacity) {
      const oldest = this.#data.keys().next().value; // insertion order
      this.#data.delete(oldest);
    }
  }

  /** Least recently used first. */
  keysInOrder() {
    return [...this.#data.keys()];
  }
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const m = new HashMap();
  m.set("cat", 1).set("dog", 2).set("cat", 9); // last one overwrites
  assert.equal(m.size, 2);
  assert.equal(m.get("cat"), 9);
  assert.equal(m.get("missing"), undefined);
  assert.ok(m.has("dog") && !m.has("bird"));
  assert.ok(m.delete("dog"));
  assert.ok(!m.delete("dog"));
  assert.equal(m.size, 1);

  // Resizing: force at least one growth, then confirm nothing was lost.
  const big = new HashMap();
  for (let i = 0; i < 100; i++) big.set(`key${i}`, i);
  assert.equal(big.size, 100);
  assert.ok(big.capacity > 8); // it grew
  assert.ok(big.loadFactor <= 0.75); // and stayed healthy
  for (let i = 0; i < 100; i++) assert.equal(big.get(`key${i}`), i);
  assert.ok(big.longestChain() <= 6); // collisions stay tame
  assert.equal(big.keys().length, 100);

  assert.equal(charFrequency("aab").get("a"), 2);
  assert.equal(firstUniqueChar("leetcode"), 0);
  assert.equal(firstUniqueChar("aabb"), -1);

  assert.deepEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
  assert.deepEqual(twoSum([3, 3], 6), [0, 1]); // duplicate values
  assert.equal(twoSum([1, 2], 99), null);
  assert.ok(containsDuplicate([1, 2, 3, 1]));
  assert.ok(!containsDuplicate([1, 2, 3]));

  const groups = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  assert.deepEqual(
    groups.map((g) => g.length).sort(),
    [1, 2, 3],
  );

  assert.equal(subarraySumEqualsK([1, 1, 1], 2), 2);
  assert.equal(subarraySumEqualsK([1, 2, 3], 3), 2); // [1,2] and [3]
  assert.equal(subarraySumEqualsK([1, -1, 0], 0), 3); // negatives work

  assert.equal(longestConsecutive([100, 4, 200, 1, 3, 2]), 4); // 1,2,3,4
  assert.equal(longestConsecutive([]), 0);
  assert.deepEqual(intersection([1, 2, 2, 1], [2, 2]), [2]);

  // The object-key coercion trap, demonstrated rather than described.
  const obj = {};
  obj[1] = "a";
  obj["1"] = "b";
  assert.equal(obj[1], "b"); // same slot
  const map = new Map([
    [1, "a"],
    ["1", "b"],
  ]);
  assert.equal(map.get(1), "a"); // distinct keys

  const lru = new LRUCache(2);
  lru.put("a", 1);
  lru.put("b", 2);
  assert.equal(lru.get("a"), 1); // "a" becomes the most recent
  lru.put("c", 3); // evicts "b", the least recent
  assert.equal(lru.get("b"), -1);
  assert.deepEqual(lru.keysInOrder(), ["a", "c"]);

  console.log("10-Hashing (JavaScript): all checks passed");
}

demo();
