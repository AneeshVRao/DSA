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

  console.log("04-Strings (JavaScript): all checks passed");
}

demo();
