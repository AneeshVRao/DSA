/**
 * 04 - Strings: the patterns that solve string problems, including KMP.
 *
 * Run:  node strings.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. Reversal
// ============================================================================
/** Spread iterates by CODE POINT, so this survives emoji. O(n) time and space. */
export function reverseString(s) {
  return [...s].reverse().join("");
}

/** The interview version: a mutable array of chars, two pointers, O(1) extra. */
export function reverseInPlace(chars) {
  let lo = 0;
  let hi = chars.length - 1;
  while (lo < hi) {
    [chars[lo], chars[hi]] = [chars[hi], chars[lo]];
    lo++;
    hi--;
  }
  return chars;
}

// ============================================================================
// 2. Two pointers - palindromes
// ============================================================================
/**
 * Ignores case and non-alphanumerics. O(n) time, O(1) space - filtering happens
 * inside the loop instead of allocating a cleaned copy.
 */
export function isPalindrome(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let lo = 0;
  let hi = s.length - 1;
  while (lo < hi) {
    while (lo < hi && !isAlnum(s[lo])) lo++;
    while (lo < hi && !isAlnum(s[hi])) hi--;
    if (s[lo].toLowerCase() !== s[hi].toLowerCase()) return false;
    lo++;
    hi--;
  }
  return true;
}

// ============================================================================
// 3. Frequency counting - anagrams
// ============================================================================
const CODE_A = "a".charCodeAt(0);

/** O(n) time, O(1) space (26 buckets). Sorting would be O(n log n). */
export function areAnagrams(a, b) {
  if (a.length !== b.length) return false; // cheap reject
  const counts = new Array(26).fill(0);
  for (let i = 0; i < a.length; i++) {
    counts[a.charCodeAt(i) - CODE_A]++;
    counts[b.charCodeAt(i) - CODE_A]--;
  }
  return counts.every((c) => c === 0);
}

/** Group anagrams together. O(n * k) with k = word length. */
export function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const counts = new Array(26).fill(0);
    for (let i = 0; i < word.length; i++) counts[word.charCodeAt(i) - CODE_A]++;
    const key = counts.join("#"); // "#" separator: 1,11 must not equal 11,1
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

/** Index of the first non-repeating character, or -1. O(n). */
export function firstUniqueChar(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) if (freq.get(s[i]) === 1) return i;
  return -1;
}

// ============================================================================
// 4. Sliding window
// ============================================================================
/**
 * Longest substring with no repeated character. O(n).
 * `left` never moves backwards, so both pointers travel 2n steps in total.
 */
export function longestUniqueSubstring(s) {
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

/**
 * Smallest window of s containing every character of t (with multiplicity).
 * O(n + m): grow right until valid, then shrink left while it stays valid.
 */
export function minWindowSubstring(s, t) {
  if (!s || !t) return "";
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);

  let missing = t.length; // counts duplicates, unlike need.size
  let bestLen = Infinity;
  let bestStart = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if ((need.get(ch) ?? 0) > 0) missing--;
    need.set(ch, (need.get(ch) ?? 0) - 1); // may go negative for surplus

    while (missing === 0) {
      // valid window: shrink from the left
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const leaving = s[left];
      need.set(leaving, need.get(leaving) + 1);
      if (need.get(leaving) > 0) missing++; // we removed a needed character
      left++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}

// ============================================================================
// 5. Building strings
// ============================================================================
/** Run-length encoding: "aabcccccaaa" -> "a2b1c5a3". O(n) time and space. */
export function compress(s) {
  if (!s) return "";
  const parts = []; // push + join, never += in a loop
  let prev = s[0];
  let count = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === prev) {
      count++;
    } else {
      parts.push(prev, String(count));
      prev = s[i];
      count = 1;
    }
  }
  parts.push(prev, String(count));
  return parts.join("");
}

// ============================================================================
// 6. Pattern matching
// ============================================================================
/** Check every start position. O(n * m) worst case. */
export function naiveSearch(text, pattern) {
  const hits = [];
  if (!pattern || pattern.length > text.length) return hits;
  for (let i = 0; i + pattern.length <= text.length; i++) {
    let j = 0;
    while (j < pattern.length && text[i + j] === pattern[j]) j++;
    if (j === pattern.length) hits.push(i);
  }
  return hits;
}

/**
 * lps[i] = length of the longest proper prefix of pattern[0..i] that is also a
 * suffix of it. On a mismatch it says how much of the match is still usable,
 * which is why KMP never moves the text pointer backwards. O(m).
 */
export function buildLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len > 0) {
      len = lps[len - 1]; // fall back, do NOT advance i
    } else {
      lps[i++] = 0;
    }
  }
  return lps;
}

/** All start indices of pattern in text. O(n + m) time, O(m) space. */
export function kmpSearch(text, pattern) {
  const hits = [];
  if (!pattern || pattern.length > text.length) return hits;
  const lps = buildLPS(pattern);
  let i = 0;
  let j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        hits.push(i - j);
        j = lps[j - 1]; // keep going: overlapping matches count
      }
    } else if (j > 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return hits;
}

/**
 * All start indices of `pattern` in `text`. O(n + m) expected, O(1) space.
 *
 * KMP avoids re-scanning by remembering prefix structure. Rabin-Karp takes a
 * different route: HASH the pattern once, slide a window over the text keeping
 * its hash in `O(1)` per step, and only compare characters when hashes agree.
 *
 * **The rolling hash.** Treat the window as a base-B number modulo a prime:
 *
 *     hash("abc") = (a * B^2 + b * B^1 + c * B^0) mod M
 *
 * Sliding one character right is three operations, not m:
 *
 *     new = (old - leading * B^(m-1)) * B + trailing        (all mod M)
 *
 * Removing the leading digit is why `B^(m-1)` is precomputed - recomputing it
 * inside the loop would make the whole thing `O(n log m)`.
 *
 * **The verification is not optional.** Different strings can share a hash. On
 * a hash match the characters must still be compared, or the function silently
 * returns wrong positions. Hash equality is a CHEAP FILTER, never a proof.
 *
 * **JavaScript specific, twice over:**
 *   - `%` on a negative left operand returns a negative result (it is
 *     remainder, not modulo), so the subtraction needs a `+ modulus` fix-up.
 *   - `hash * base` with a 1e9 modulus reaches ~2.6e11, and rolling that into
 *     the next step exceeds `Number.MAX_SAFE_INTEGER`. **BigInt** keeps it
 *     exact. A smaller modulus would fit in a Number but collide far more.
 *
 * Expected `O(n + m)`; worst case `O(n * m)` if an adversary engineers
 * collisions. Worth it over KMP because the rolling hash generalises: many
 * patterns at once, 2-D grid matching, longest duplicate substring, rsync.
 */
export function rabinKarpSearch(text, pattern, base = 256n, modulus = 1000000007n) {
  const n = text.length;
  const m = pattern.length;
  if (m === 0 || m > n) return [];

  base = BigInt(base);
  modulus = BigInt(modulus);

  // B^(m-1) mod M - the weight of the character leaving the window.
  let highOrder = 1n;
  for (let i = 0; i < m - 1; i++) highOrder = (highOrder * base) % modulus;

  let patternHash = 0n;
  let windowHash = 0n;
  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * base + BigInt(pattern.charCodeAt(i))) % modulus;
    windowHash = (windowHash * base + BigInt(text.charCodeAt(i))) % modulus;
  }

  const hits = [];
  for (let start = 0; start + m <= n; start++) {
    // Hash equality is only a filter - the slice comparison is the proof.
    if (windowHash === patternHash && text.slice(start, start + m) === pattern) {
      hits.push(start);
    }

    if (start + m < n) {
      // roll the window one step right
      const leaving = (BigInt(text.charCodeAt(start)) * highOrder) % modulus;
      windowHash = (windowHash - leaving) % modulus;
      if (windowHash < 0n) windowHash += modulus; // % is remainder, not modulo
      windowHash = (windowHash * base + BigInt(text.charCodeAt(start + m))) % modulus;
    }
  }
  return hits;
}

/**
 * The longest substring appearing at least twice. O(n log n) expected.
 *
 * The payoff for having a rolling hash. The key observation is MONOTONICITY:
 * if a duplicate of length L exists, so does one of every shorter length (any
 * prefix of it). That makes the answer binary-searchable.
 *
 * For each candidate length, hash every window and look for a repeat - `O(n)`
 * per check with a rolling hash, `O(log n)` checks.
 *
 * Hashes are stored with their positions so a collision is resolved by
 * comparing the real substrings, keeping the result exact.
 */
export function longestDuplicateSubstring(s) {
  const n = s.length;
  const base = 256n;
  const modulus = 1000000007n;

  const duplicateOfLength = (length) => {
    if (length === 0) return "";
    let highOrder = 1n;
    for (let i = 0; i < length - 1; i++) highOrder = (highOrder * base) % modulus;

    const seen = new Map();
    let windowHash = 0n;
    for (let i = 0; i < length; i++) {
      windowHash = (windowHash * base + BigInt(s.charCodeAt(i))) % modulus;
    }

    for (let start = 0; start + length <= n; start++) {
      for (const other of seen.get(windowHash) ?? []) {
        // verify, never trust
        if (s.slice(other, other + length) === s.slice(start, start + length)) {
          return s.slice(start, start + length);
        }
      }
      if (!seen.has(windowHash)) seen.set(windowHash, []);
      seen.get(windowHash).push(start);

      if (start + length < n) {
        const leaving = (BigInt(s.charCodeAt(start)) * highOrder) % modulus;
        windowHash = (windowHash - leaving) % modulus;
        if (windowHash < 0n) windowHash += modulus;
        windowHash =
          (windowHash * base + BigInt(s.charCodeAt(start + length))) % modulus;
      }
    }
    return "";
  };

  let best = "";
  let low = 1;
  let high = n - 1;
  while (low <= high) {
    // binary search on the LENGTH
    const mid = Math.floor((low + high) / 2);
    const found = duplicateOfLength(mid);
    if (found) {
      best = found;
      low = mid + 1; // try longer
    } else {
      high = mid - 1; // too long, try shorter
    }
  }
  return best;
}

// ============================================================================
// 7. Everyday transformations
// ============================================================================
/** split(/\s+/) collapses runs of whitespace; filter drops empties. */
export function reverseWords(sentence) {
  return sentence.trim().split(/\s+/).reverse().join(" ");
}

/** Vertical scan: compare column by column. O(total characters). */
export function longestCommonPrefix(words) {
  if (words.length === 0) return "";
  for (let i = 0; i < words[0].length; i++) {
    for (let w = 1; w < words.length; w++) {
      if (i >= words[w].length || words[w][i] !== words[0][i]) {
        return words[0].slice(0, i);
      }
    }
  }
  return words[0];
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  assert.equal(reverseString("abc"), "cba");
  assert.equal(reverseString("ab😀"), "😀ba"); // survives surrogate pairs
  assert.deepEqual(reverseInPlace([..."abcd"]), [..."dcba"]);

  assert.ok(isPalindrome("A man, a plan, a canal: Panama"));
  assert.ok(isPalindrome(""));
  assert.ok(!isPalindrome("race a car"));

  assert.ok(areAnagrams("listen", "silent"));
  assert.ok(!areAnagrams("rat", "car"));
  assert.ok(!areAnagrams("a", "ab"));

  const groups = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  assert.deepEqual(
    groups.map((g) => g.length).sort(),
    [1, 2, 3],
  );

  assert.equal(firstUniqueChar("leetcode"), 0);
  assert.equal(firstUniqueChar("aabb"), -1);

  assert.equal(longestUniqueSubstring("abcabcbb"), 3);
  assert.equal(longestUniqueSubstring("bbbbb"), 1);
  assert.equal(longestUniqueSubstring(""), 0);

  assert.equal(minWindowSubstring("ADOBECODEBANC", "ABC"), "BANC");
  assert.equal(minWindowSubstring("a", "aa"), "");

  assert.equal(compress("aabcccccaaa"), "a2b1c5a3");
  assert.equal(compress(""), "");

  const text = "ababcabcabababd";
  const pat = "ababd";
  assert.deepEqual(naiveSearch(text, pat), [10]);
  assert.deepEqual(kmpSearch(text, pat), [10]);
  assert.deepEqual(buildLPS("aabaaac"), [0, 1, 0, 1, 2, 2, 0]);
  assert.deepEqual(kmpSearch("aaaa", "aa"), [0, 1, 2]); // overlapping
  assert.deepEqual(kmpSearch("abc", ""), []);

  assert.equal(reverseWords("  the   sky is blue  "), "blue is sky the");

  assert.equal(longestCommonPrefix(["flower", "flow", "flight"]), "fl");
  assert.equal(longestCommonPrefix(["dog", "car"]), "");

  // --- Rabin-Karp -----------------------------------------------------------
  assert.deepEqual(rabinKarpSearch("abracadabra", "abra"), [0, 7]);
  assert.deepEqual(rabinKarpSearch("aaaa", "aa"), [0, 1, 2]); // overlapping
  assert.deepEqual(rabinKarpSearch("abc", "d"), []);
  assert.deepEqual(rabinKarpSearch("abc", ""), []); // empty pattern
  assert.deepEqual(rabinKarpSearch("ab", "abc"), []); // pattern too long
  assert.deepEqual(rabinKarpSearch("aaa", "aaa"), [0]); // exact fit

  // Deterministic PRNG so a failure is always reproducible.
  let seed = 4;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
  const randomString = (length, alphabet) =>
    Array.from({ length }, () => alphabet[randInt(0, alphabet.length - 1)]).join("");

  // Against naive search AND KMP, on a two-letter alphabet so that windows
  // collide constantly and the verification step actually gets exercised.
  for (let trial = 0; trial < 300; trial++) {
    const text = randomString(randInt(0, 40), "ab");
    const pattern = randomString(randInt(1, 5), "ab");
    const expected = naiveSearch(text, pattern);
    assert.deepEqual(rabinKarpSearch(text, pattern), expected);
    assert.deepEqual(kmpSearch(text, pattern), expected);
  }

  // A tiny modulus forces genuine hash collisions - the verification step is
  // the only thing keeping the answer correct here.
  for (let trial = 0; trial < 200; trial++) {
    const text = randomString(randInt(0, 30), "abc");
    const pattern = randomString(randInt(1, 4), "abc");
    assert.deepEqual(
      rabinKarpSearch(text, pattern, 4n, 7n),
      naiveSearch(text, pattern),
    );
  }

  assert.equal(longestDuplicateSubstring("banana"), "ana");
  assert.equal(longestDuplicateSubstring("abcd"), ""); // nothing repeats
  assert.equal(longestDuplicateSubstring("aaaa"), "aaa");
  assert.equal(longestDuplicateSubstring(""), "");

  // Against an O(n^3) brute force over every pair of substrings.
  for (let trial = 0; trial < 60; trial++) {
    const s = randomString(randInt(0, 18), "abc");
    let expectedLength = 0;
    for (let length = 1; length < s.length; length++) {
      const windows = [];
      for (let i = 0; i + length <= s.length; i++) windows.push(s.slice(i, i + length));
      if (new Set(windows).size < windows.length) expectedLength = length;
    }
    assert.equal(longestDuplicateSubstring(s).length, expectedLength);
  }

  console.log("04-Strings (JavaScript): all checks passed");
  console.log(
    "  Rabin-Karp cross-checked against naive search and KMP, including\n" +
      "  with a deliberately tiny modulus that forces hash collisions",
  );
}

demo();
