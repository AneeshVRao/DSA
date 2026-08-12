/**
 * 18 - Trie: a prefix tree with insert / search / prefix queries / deletion,
 * plus wildcard matching and a bitwise trie for maximum XOR.
 *
 * Run:  node trie.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. The node
// ============================================================================
/**
 * A Map of children keeps the alphabet open and avoids prototype keys - an
 * object literal would treat "constructor" and "__proto__" as pre-existing.
 * `isEnd` distinguishes a stored word from a mere prefix.
 */
export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

// ============================================================================
// 2. The trie
// ============================================================================
export class Trie {
  #root = new TrieNode();
  #size = 0;

  constructor(words = []) {
    for (const word of words) this.insert(word);
  }

  get root() {
    return this.#root;
  }

  get size() {
    return this.#size;
  }

  /** Add a word. O(L). Shared prefixes cost nothing extra. */
  insert(word) {
    let node = this.#root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    if (node.isEnd) return false; // already stored
    node.isEnd = true;
    this.#size++;
    return true;
  }

  /** Follow a prefix; return the node it ends at, or null. O(L). */
  #walk(prefix) {
    let node = this.#root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  /** Is this exact word stored? O(L). */
  search(word) {
    const node = this.#walk(word);
    return node !== null && node.isEnd;
  }

  /**
   * Does any stored word begin with this prefix? O(L).
   * THIS is why tries exist: a Set would need O(n * L) to answer it.
   */
  startsWith(prefix) {
    return this.#walk(prefix) !== null;
  }

  /**
   * Remove a word, pruning nodes that become useless. O(L).
   * The recursion returns "may my parent delete me?" - true only when this
   * node has no children left AND is not the end of another word. That is what
   * stops deleting "car" from breaking "cart".
   */
  delete(word) {
    if (!this.search(word)) return false;

    const prune = (node, depth) => {
      if (depth === word.length) {
        node.isEnd = false;
        return node.children.size === 0; // deletable only if it is a leaf
      }
      const ch = word[depth];
      const child = node.children.get(ch);
      if (!child || !prune(child, depth + 1)) return false;

      node.children.delete(ch); // the child became useless
      return node.children.size === 0 && !node.isEnd;
    };

    prune(this.#root, 0);
    this.#size--;
    return true;
  }

  /**
   * Every stored word starting with `prefix`, in alphabetical order.
   * O(L + output): walk to the prefix node once, then DFS below it.
   */
  wordsWithPrefix(prefix) {
    const start = this.#walk(prefix);
    if (!start) return [];

    const found = [];
    const collect = (node, path) => {
      if (node.isEnd) found.push(prefix + path);
      for (const ch of [...node.children.keys()].sort()) {
        collect(node.children.get(ch), path + ch);
      }
    };
    collect(start, "");
    return found;
  }

  /** The canonical trie application. */
  autocomplete(prefix, limit = 5) {
    return this.wordsWithPrefix(prefix).slice(0, limit);
  }

  /**
   * Longest prefix shared by ALL stored words. O(L).
   * Walk down while there is exactly one child and no word ends here - a
   * branch or a word ending means the shared prefix stops.
   */
  longestCommonPrefix() {
    let prefix = "";
    let node = this.#root;
    while (node.children.size === 1 && !node.isEnd) {
      const [ch] = node.children.keys();
      prefix += ch;
      node = node.children.get(ch);
    }
    return prefix;
  }

  /** Count stored words by walking the trie - cross-checks `size`. */
  countWords() {
    const walk = (node) => {
      let total = node.isEnd ? 1 : 0;
      for (const child of node.children.values()) total += walk(child);
      return total;
    };
    return walk(this.#root);
  }

  /** Total nodes - shows how much prefix sharing saves. */
  countNodes() {
    const walk = (node) => {
      let total = 1;
      for (const child of node.children.values()) total += walk(child);
      return total;
    };
    return walk(this.#root);
  }
}

// ============================================================================
// 3. Wildcard search - a trie with backtracking
// ============================================================================
/**
 * Supports "." as any single character (LeetCode 211). A Set cannot do this at
 * all; the trie turns it into a bounded DFS.
 */
export class WildcardTrie extends Trie {
  searchPattern(pattern) {
    const walk = (node, i) => {
      if (i === pattern.length) return node.isEnd;
      const ch = pattern[i];
      if (ch === ".") {
        for (const child of node.children.values()) {
          if (walk(child, i + 1)) return true;
        }
        return false;
      }
      const child = node.children.get(ch);
      return child !== undefined && walk(child, i + 1);
    };
    return walk(this.root, 0);
  }
}

// ============================================================================
// 4. Bitwise trie - maximum XOR pair
// ============================================================================
/**
 * A trie over the BITS of each number, most significant first.
 *
 * Turns "maximum XOR of any two numbers" from an O(n^2) pairwise scan into
 * O(32n): at each bit walk greedily toward the OPPOSITE bit, because a 1 in a
 * higher position beats everything below it.
 */
export class BitwiseTrie {
  static BITS = 32;
  #root = new Map();
  #empty = true;

  insert(number) {
    let node = this.#root;
    for (let i = BitwiseTrie.BITS - 1; i >= 0; i--) {
      const bit = (number >> i) & 1;
      if (!node.has(bit)) node.set(bit, new Map());
      node = node.get(bit);
    }
    this.#empty = false;
  }

  /** Largest XOR of `number` with any stored value. O(32). */
  maxXorWith(number) {
    if (this.#empty) return 0;
    let node = this.#root;
    let best = 0;
    for (let i = BitwiseTrie.BITS - 1; i >= 0; i--) {
      const bit = (number >> i) & 1;
      const wanted = bit ^ 1; // the opposite bit sets this position
      if (node.has(wanted)) {
        best |= 1 << i;
        node = node.get(wanted);
      } else {
        node = node.get(bit); // forced to match
      }
    }
    return best;
  }
}

/** Maximum XOR over all pairs. O(32n) instead of O(n^2). */
export function maxXorPair(numbers) {
  if (numbers.length < 2) return 0;
  const trie = new BitwiseTrie();
  trie.insert(numbers[0]);
  let best = 0;
  for (let i = 1; i < numbers.length; i++) {
    best = Math.max(best, trie.maxXorWith(numbers[i]));
    trie.insert(numbers[i]);
  }
  return best;
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const trie = new Trie(["cat", "car", "card", "care", "dog", "do"]);
  assert.equal(trie.size, 6);
  assert.equal(trie.countWords(), 6); // cross-check

  assert.ok(trie.search("cat"));
  assert.ok(!trie.search("ca")); // a prefix is not a word
  assert.ok(!trie.search("cats"));
  assert.ok(trie.startsWith("ca") && trie.startsWith("do"));
  assert.ok(!trie.startsWith("z"));

  assert.ok(!trie.insert("cat")); // already present
  assert.equal(trie.size, 6);

  assert.deepEqual(trie.wordsWithPrefix("car"), ["car", "card", "care"]);
  assert.deepEqual(trie.wordsWithPrefix("do"), ["do", "dog"]);
  assert.deepEqual(trie.wordsWithPrefix("z"), []);
  assert.deepEqual(trie.wordsWithPrefix(""), [
    "car",
    "card",
    "care",
    "cat",
    "do",
    "dog",
  ]);
  assert.deepEqual(trie.autocomplete("car", 2), ["car", "card"]);

  // Prefix sharing: 6 words of 20 characters need far fewer than 21 nodes.
  assert.ok(trie.countNodes() < 21);

  // Deleting a word that is a PREFIX of another must not break the longer one.
  assert.ok(trie.delete("car"));
  assert.ok(!trie.search("car"));
  assert.ok(trie.search("card") && trie.search("care")); // still intact
  assert.ok(trie.startsWith("car")); // the path is still needed
  assert.equal(trie.size, 5);
  assert.equal(trie.countWords(), 5);

  // Deleting a leaf really prunes the path.
  const nodesBefore = trie.countNodes();
  assert.ok(trie.delete("dog"));
  assert.ok(trie.countNodes() < nodesBefore); // the "g" node is gone
  assert.ok(trie.search("do")); // its prefix survives
  assert.ok(!trie.delete("dog")); // already gone
  assert.ok(!trie.delete("zzz")); // never existed

  assert.equal(new Trie(["flower", "flow", "flight"]).longestCommonPrefix(), "fl");
  assert.equal(new Trie(["dog", "car"]).longestCommonPrefix(), "");
  assert.equal(new Trie(["abc"]).longestCommonPrefix(), "abc");
  assert.equal(new Trie().longestCommonPrefix(), "");

  const wildcard = new WildcardTrie(["bad", "dad", "mad"]);
  assert.ok(wildcard.searchPattern("bad"));
  assert.ok(!wildcard.searchPattern("pad"));
  assert.ok(wildcard.searchPattern(".ad")); // any first character
  assert.ok(wildcard.searchPattern("b.."));
  assert.ok(wildcard.searchPattern("..."));
  assert.ok(!wildcard.searchPattern("....")); // length must match

  assert.equal(maxXorPair([3, 10, 5, 25, 2, 8]), 28); // 5 ^ 25
  assert.equal(maxXorPair([0]), 0);
  assert.equal(maxXorPair([14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]), 127);
  {
    // cross-check against brute force
    const sample = [3, 10, 5, 25, 2, 8];
    let brute = 0;
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j < sample.length; j++) {
        brute = Math.max(brute, sample[i] ^ sample[j]);
      }
    }
    assert.equal(maxXorPair(sample), brute);
  }

  console.log("18-Trie (JavaScript): all checks passed");
}

demo();
