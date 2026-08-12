"""
04 - Strings: the patterns that solve string problems, including KMP.

Run:  python strings.py
"""

from __future__ import annotations

import random
from collections import Counter, defaultdict


# ============================================================================
# 1. Reversal
# ============================================================================
def reverse_string(s: str) -> str:
    """O(n) time and space. Strings are immutable, so a copy is unavoidable."""
    return s[::-1]


def reverse_in_place(chars: list[str]) -> list[str]:
    """The interview version: a mutable list, two pointers, O(1) extra space."""
    lo, hi = 0, len(chars) - 1
    while lo < hi:
        chars[lo], chars[hi] = chars[hi], chars[lo]
        lo, hi = lo + 1, hi - 1
    return chars


# ============================================================================
# 2. Two pointers - palindromes
# ============================================================================
def is_palindrome(s: str) -> bool:
    """Ignores case and non-alphanumerics. O(n) time, O(1) space.

    Filtering inside the loop avoids building a cleaned copy of the string.
    """
    lo, hi = 0, len(s) - 1
    while lo < hi:
        while lo < hi and not s[lo].isalnum():
            lo += 1
        while lo < hi and not s[hi].isalnum():
            hi -= 1
        if s[lo].lower() != s[hi].lower():
            return False
        lo, hi = lo + 1, hi - 1
    return True


# ============================================================================
# 3. Frequency counting - anagrams
# ============================================================================
def are_anagrams(a: str, b: str) -> bool:
    """O(n) time, O(1) space (26 buckets). Sorting would be O(n log n)."""
    if len(a) != len(b):
        return False                      # cheap reject before any counting
    counts = [0] * 26
    for ca, cb in zip(a, b):
        counts[ord(ca) - ord("a")] += 1
        counts[ord(cb) - ord("a")] -= 1
    return all(c == 0 for c in counts)


def group_anagrams(words: list[str]) -> list[list[str]]:
    """Group words that are anagrams of each other. O(n * k) with k = word length.

    The key is the 26-length count tuple - hashable, and cheaper than sorting
    each word.
    """
    groups: dict[tuple, list[str]] = defaultdict(list)
    for word in words:
        counts = [0] * 26
        for ch in word:
            counts[ord(ch) - ord("a")] += 1
        groups[tuple(counts)].append(word)
    return list(groups.values())


def first_unique_char(s: str) -> int:
    """Index of the first non-repeating character, or -1. O(n) / O(1)."""
    freq = Counter(s)
    for i, ch in enumerate(s):
        if freq[ch] == 1:
            return i
    return -1


# ============================================================================
# 4. Sliding window
# ============================================================================
def longest_unique_substring(s: str) -> int:
    """Length of the longest substring without repeating characters. O(n).

    `left` never moves backwards, so both pointers together travel 2n steps.
    """
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best


def min_window_substring(s: str, t: str) -> str:
    """Smallest window of s containing every character of t (with multiplicity).

    O(n + m) time. Grow right until valid, then shrink left while it stays
    valid, recording the best window seen.
    """
    if not s or not t:
        return ""
    need = Counter(t)
    missing = len(t)                      # counts duplicates, unlike len(need)
    best = (float("inf"), 0, 0)
    left = 0

    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1                     # may go negative for surplus chars

        while missing == 0:               # window is valid: try to shrink it
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:         # we just removed a needed character
                missing += 1
            left += 1

    return "" if best[0] == float("inf") else s[best[1]:best[2] + 1]


# ============================================================================
# 5. Building strings
# ============================================================================
def compress(s: str) -> str:
    """Run-length encoding: 'aabcccccaaa' -> 'a2b1c5a3'. O(n) time and space.

    Accumulate into a list and join once; `out += ...` would be O(n^2).
    """
    if not s:
        return ""
    parts: list[str] = []
    prev, count = s[0], 1
    for ch in s[1:]:
        if ch == prev:
            count += 1
        else:
            parts.append(f"{prev}{count}")
            prev, count = ch, 1
    parts.append(f"{prev}{count}")
    return "".join(parts)


# ============================================================================
# 6. Pattern matching
# ============================================================================
def naive_search(text: str, pattern: str) -> list[int]:
    """Every start position, checked character by character. O(n * m) worst case."""
    if not pattern:
        return []
    hits = []
    for i in range(len(text) - len(pattern) + 1):
        if text[i:i + len(pattern)] == pattern:
            hits.append(i)
    return hits


def build_lps(pattern: str) -> list[int]:
    """Longest proper Prefix that is also a Suffix, per position. O(m).

    lps[i] answers: if a mismatch happens after matching pattern[:i+1], how
    much of that match is still usable? That is what lets KMP avoid ever
    moving the text pointer backwards.
    """
    lps = [0] * len(pattern)
    length = 0                            # length of the current match
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]      # fall back, but do not advance i
        else:
            lps[i] = 0
            i += 1
    return lps


def kmp_search(text: str, pattern: str) -> list[int]:
    """All start indices of pattern in text. O(n + m) time, O(m) space."""
    if not pattern or len(pattern) > len(text):
        return []
    lps = build_lps(pattern)
    hits: list[int] = []
    i = j = 0                             # i indexes text, j indexes pattern
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1
            j += 1
            if j == len(pattern):
                hits.append(i - j)
                j = lps[j - 1]            # keep going for overlapping matches
        elif j:
            j = lps[j - 1]                # reuse the known prefix
        else:
            i += 1
    return hits


def rabin_karp_search(text: str, pattern: str,
                      base: int = 256, modulus: int = 1_000_000_007) -> list[int]:
    """All start indices of pattern in text. O(n + m) expected, O(1) space.

    KMP avoids re-scanning by remembering prefix structure. Rabin-Karp takes a
    completely different route: HASH the pattern once, then slide a window over
    the text maintaining its hash in O(1) per step, and only compare characters
    when the hashes agree.

    THE ROLLING HASH. Treat the window as a base-B number modulo a prime:

        hash("abc") = (a * B^2 + b * B^1 + c * B^0) mod M

    Sliding one character right is three operations, not m:

        new = (old - leading * B^(m-1)) * B + trailing     (all mod M)

    Removing the leading digit is why B^(m-1) is precomputed - recomputing it
    inside the loop would make the whole thing O(n log m).

    THE VERIFICATION IS NOT OPTIONAL. Different strings can share a hash. On a
    match the characters must still be compared, or the function silently
    returns wrong positions. A hash equality is a CHEAP FILTER, never a proof:

        if window_hash == pattern_hash and text[i:i+m] == pattern:
                                           ^^^^^^^^^^^^^^^^^^^^^ this half

    Expected O(n + m); worst case O(n * m) if an adversary engineers collisions
    for every window. A large random-ish prime modulus makes that vanishingly
    unlikely in practice.

    WHY BOTHER when KMP is worst-case linear? Because the rolling hash
    generalises where KMP does not:
      - searching for MANY patterns at once (hash them all into a set)
      - 2-D pattern matching in a grid
      - "longest duplicate substring" - binary search the length, hash every
        window of that length, look for a repeat
      - detecting repeated blocks, plagiarism, rsync-style diffing
    """
    n, m = len(text), len(pattern)
    if not pattern or m > n:
        return []

    # B^(m-1) mod M - the weight of the character leaving the window.
    high_order = pow(base, m - 1, modulus)

    pattern_hash = 0
    window_hash = 0
    for i in range(m):                        # hash the pattern and the first window
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % modulus
        window_hash = (window_hash * base + ord(text[i])) % modulus

    hits: list[int] = []
    for start in range(n - m + 1):
        # Hash equality is only a filter - the slice comparison is the proof.
        if window_hash == pattern_hash and text[start:start + m] == pattern:
            hits.append(start)

        if start + m < n:                     # roll the window one step right
            window_hash = (
                (window_hash - ord(text[start]) * high_order) * base
                + ord(text[start + m])
            ) % modulus
            # Python's % always returns a non-negative result, so no fix-up is
            # needed here. C, C++, Go and JavaScript all need one.

    return hits


def longest_duplicate_substring(s: str) -> str:
    """The longest substring appearing at least twice. O(n log n) expected.

    The payoff for having a rolling hash. The key observation is MONOTONICITY:
    if a duplicate of length L exists, so does one of every length below L
    (any prefix of it). That makes the answer binary-searchable.

    For each candidate length, hash every window of that length and look for a
    repeat - O(n) per check with a rolling hash, O(log n) checks.

    Hashes are stored with their positions so a collision can be resolved by
    comparing the actual substrings, keeping the result exact.
    """
    n = len(s)
    base, modulus = 256, 1_000_000_007

    def duplicate_of_length(length: int) -> str:
        if length == 0:
            return ""
        high_order = pow(base, length - 1, modulus)
        seen: dict[int, list[int]] = {}

        window_hash = 0
        for i in range(length):
            window_hash = (window_hash * base + ord(s[i])) % modulus

        for start in range(n - length + 1):
            for other in seen.get(window_hash, ()):     # verify, never trust
                if s[other:other + length] == s[start:start + length]:
                    return s[start:start + length]
            seen.setdefault(window_hash, []).append(start)

            if start + length < n:
                window_hash = (
                    (window_hash - ord(s[start]) * high_order) * base
                    + ord(s[start + length])
                ) % modulus
        return ""

    best = ""
    low, high = 1, n - 1
    while low <= high:                        # binary search on the LENGTH
        mid = (low + high) // 2
        found = duplicate_of_length(mid)
        if found:
            best = found
            low = mid + 1                     # try longer
        else:
            high = mid - 1                    # too long, try shorter
    return best


# ============================================================================
# 7. Everyday transformations
# ============================================================================
def reverse_words(sentence: str) -> str:
    """'the sky is blue' -> 'blue is sky the'. split() handles extra spaces."""
    return " ".join(reversed(sentence.split()))


def longest_common_prefix(words: list[str]) -> str:
    """O(total characters). Vertical scan, stops at the first mismatch."""
    if not words:
        return ""
    for i, ch in enumerate(words[0]):
        for other in words[1:]:
            if i >= len(other) or other[i] != ch:
                return words[0][:i]
    return words[0]


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    assert reverse_string("abc") == "cba"
    assert reverse_in_place(list("abcd")) == list("dcba")

    assert is_palindrome("A man, a plan, a canal: Panama")
    assert is_palindrome("")
    assert not is_palindrome("race a car")

    assert are_anagrams("listen", "silent")
    assert not are_anagrams("rat", "car")
    assert not are_anagrams("a", "ab")

    groups = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    assert sorted(len(g) for g in groups) == [1, 2, 3]

    assert first_unique_char("leetcode") == 0
    assert first_unique_char("aabb") == -1

    assert longest_unique_substring("abcabcbb") == 3
    assert longest_unique_substring("bbbbb") == 1
    assert longest_unique_substring("") == 0

    assert min_window_substring("ADOBECODEBANC", "ABC") == "BANC"
    assert min_window_substring("a", "aa") == ""

    assert compress("aabcccccaaa") == "a2b1c5a3"
    assert compress("") == ""

    text, pat = "ababcabcabababd", "ababd"
    assert naive_search(text, pat) == kmp_search(text, pat) == [10]
    assert build_lps("aabaaac") == [0, 1, 0, 1, 2, 2, 0]
    assert kmp_search("aaaa", "aa") == [0, 1, 2]     # overlapping matches
    assert kmp_search("abc", "") == []

    assert reverse_words("  the   sky is blue  ") == "blue is sky the"

    assert longest_common_prefix(["flower", "flow", "flight"]) == "fl"
    assert longest_common_prefix(["dog", "car"]) == ""

    # --- Rabin-Karp ----------------------------------------------------------
    assert rabin_karp_search("abracadabra", "abra") == [0, 7]
    assert rabin_karp_search("aaaa", "aa") == [0, 1, 2]     # overlapping
    assert rabin_karp_search("abc", "d") == []
    assert rabin_karp_search("abc", "") == []               # empty pattern
    assert rabin_karp_search("ab", "abc") == []             # pattern too long
    assert rabin_karp_search("aaa", "aaa") == [0]           # exact fit

    # Against naive search AND KMP, on a two-letter alphabet so that windows
    # collide constantly and the verification step actually gets exercised.
    random.seed(4)
    for _ in range(300):
        text = "".join(random.choice("ab") for _ in range(random.randint(0, 40)))
        pattern = "".join(random.choice("ab") for _ in range(random.randint(1, 5)))
        expected = naive_search(text, pattern)
        assert rabin_karp_search(text, pattern) == expected
        assert kmp_search(text, pattern) == expected

    # A tiny modulus forces genuine hash collisions - the verification step is
    # the only thing keeping the answer correct here.
    for _ in range(200):
        text = "".join(random.choice("abc") for _ in range(random.randint(0, 30)))
        pattern = "".join(random.choice("abc") for _ in range(random.randint(1, 4)))
        assert (rabin_karp_search(text, pattern, base=4, modulus=7)
                == naive_search(text, pattern))

    assert longest_duplicate_substring("banana") == "ana"
    assert longest_duplicate_substring("abcd") == ""        # nothing repeats
    assert longest_duplicate_substring("aaaa") == "aaa"
    assert longest_duplicate_substring("") == ""

    # Against an O(n^3) brute force over every pair of substrings.
    for _ in range(60):
        s = "".join(random.choice("abc") for _ in range(random.randint(0, 18)))
        expected_length = 0
        for length in range(1, len(s)):
            windows = [s[i:i + length] for i in range(len(s) - length + 1)]
            if len(set(windows)) < len(windows):
                expected_length = length
        assert len(longest_duplicate_substring(s)) == expected_length

    print("04-Strings (Python): all checks passed")
    print("  Rabin-Karp cross-checked against naive search and KMP, including")
    print("  with a deliberately tiny modulus that forces hash collisions")


if __name__ == "__main__":
    demo()
