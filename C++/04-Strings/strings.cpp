// 04 - Strings: the patterns that solve string problems, including KMP.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall strings.cpp -o strings && ./strings

#include <algorithm>
#include <array>
#include <cassert>
#include <cctype>
#include <climits>
#include <iostream>
#include <random>
#include <set>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// ============================================================================
// 1. Reversal
// ============================================================================

// std::string is mutable, so this is O(n) time and O(1) extra space.
void reverseInPlace(string& s) {
    size_t lo = 0, hi = s.empty() ? 0 : s.size() - 1;
    while (lo < hi) swap(s[lo++], s[hi--]);
}

// ============================================================================
// 2. Two pointers - palindromes
// ============================================================================

// Ignores case and non-alphanumerics. O(n) time, O(1) space: filtering happens
// inside the loop instead of building a cleaned copy.
bool isPalindrome(const string& s) {
    int lo = 0, hi = int(s.size()) - 1;
    while (lo < hi) {
        while (lo < hi && !isalnum((unsigned char)s[lo])) lo++;
        while (lo < hi && !isalnum((unsigned char)s[hi])) hi--;
        if (tolower((unsigned char)s[lo]) != tolower((unsigned char)s[hi]))
            return false;
        lo++;
        hi--;
    }
    return true;
}

// ============================================================================
// 3. Frequency counting - anagrams
// ============================================================================

// O(n) time, O(1) space. Sorting both strings would be O(n log n).
bool areAnagrams(const string& a, const string& b) {
    if (a.size() != b.size()) return false;      // cheap reject
    array<int, 26> counts{};                      // {} zero-initialises
    for (size_t i = 0; i < a.size(); i++) {
        counts[a[i] - 'a']++;
        counts[b[i] - 'a']--;
    }
    return all_of(counts.begin(), counts.end(), [](int c) { return c == 0; });
}

// Group words that are anagrams of each other. O(n * k), k = word length.
// The 26-char count signature is a cheaper key than sorting each word.
vector<vector<string>> groupAnagrams(const vector<string>& words) {
    unordered_map<string, vector<string>> groups;
    for (const auto& word : words) {
        array<int, 26> counts{};
        for (char c : word) counts[c - 'a']++;
        string key;
        key.reserve(52);
        for (int c : counts) {
            key += to_string(c);
            key += '#';                            // separator: 1,11 != 11,1
        }
        groups[key].push_back(word);
    }
    vector<vector<string>> out;
    out.reserve(groups.size());
    for (auto& [key, group] : groups) out.push_back(move(group));
    return out;
}

// Index of the first non-repeating character, or -1. O(n) / O(1).
int firstUniqueChar(const string& s) {
    array<int, 26> freq{};
    for (char c : s) freq[c - 'a']++;
    for (size_t i = 0; i < s.size(); i++)
        if (freq[s[i] - 'a'] == 1) return int(i);
    return -1;
}

// ============================================================================
// 4. Sliding window
// ============================================================================

// Longest substring with no repeated character. O(n) time, O(1) space.
// `left` never moves backwards, so both pointers travel 2n steps in total.
int longestUniqueSubstring(const string& s) {
    array<int, 256> lastSeen;
    lastSeen.fill(-1);
    int left = 0, best = 0;
    for (int right = 0; right < int(s.size()); right++) {
        unsigned char c = s[right];
        if (lastSeen[c] >= left) left = lastSeen[c] + 1;
        lastSeen[c] = right;
        best = max(best, right - left + 1);
    }
    return best;
}

// Smallest window of s containing every character of t (with multiplicity).
// O(n + m): grow right until valid, then shrink left while it stays valid.
string minWindowSubstring(const string& s, const string& t) {
    if (s.empty() || t.empty()) return "";
    array<int, 256> need{};
    for (unsigned char c : t) need[c]++;

    int missing = int(t.size());        // counts duplicates
    int bestLen = INT_MAX, bestStart = 0, left = 0;

    for (int right = 0; right < int(s.size()); right++) {
        unsigned char c = s[right];
        if (need[c] > 0) missing--;
        need[c]--;                       // may go negative for surplus chars

        while (missing == 0) {           // valid window: try to shrink it
            if (right - left + 1 < bestLen) {
                bestLen = right - left + 1;
                bestStart = left;
            }
            unsigned char leaving = s[left];
            need[leaving]++;
            if (need[leaving] > 0) missing++;   // we removed a needed char
            left++;
        }
    }
    return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);
}

// ============================================================================
// 5. Building strings
// ============================================================================

// Run-length encoding: "aabcccccaaa" -> "a2b1c5a3". O(n) time and space.
// reserve() avoids repeated reallocation while appending.
string compress(const string& s) {
    if (s.empty()) return "";
    string out;
    out.reserve(s.size());
    char prev = s[0];
    int count = 1;
    for (size_t i = 1; i < s.size(); i++) {
        if (s[i] == prev) {
            count++;
        } else {
            out += prev;
            out += to_string(count);
            prev = s[i];
            count = 1;
        }
    }
    out += prev;
    out += to_string(count);
    return out;
}

// ============================================================================
// 6. Pattern matching
// ============================================================================

// Check every start position. O(n * m) worst case (e.g. "aaaa...a" / "aa...ab").
vector<int> naiveSearch(const string& text, const string& pattern) {
    vector<int> hits;
    if (pattern.empty() || pattern.size() > text.size()) return hits;
    for (size_t i = 0; i + pattern.size() <= text.size(); i++) {
        size_t j = 0;
        while (j < pattern.size() && text[i + j] == pattern[j]) j++;
        if (j == pattern.size()) hits.push_back(int(i));
    }
    return hits;
}

// lps[i] = length of the longest proper prefix of pattern[0..i] that is also a
// suffix of it. On a mismatch it tells us how much of the match is reusable,
// which is why the text index never has to move backwards. O(m).
vector<int> buildLPS(const string& pattern) {
    vector<int> lps(pattern.size(), 0);
    int len = 0;
    size_t i = 1;
    while (i < pattern.size()) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else if (len) {
            len = lps[len - 1];          // fall back, do NOT advance i
        } else {
            lps[i++] = 0;
        }
    }
    return lps;
}

// All start indices of pattern in text. O(n + m) time, O(m) space.
vector<int> kmpSearch(const string& text, const string& pattern) {
    vector<int> hits;
    if (pattern.empty() || pattern.size() > text.size()) return hits;
    vector<int> lps = buildLPS(pattern);
    size_t i = 0;
    int j = 0;
    while (i < text.size()) {
        if (text[i] == pattern[j]) {
            i++;
            j++;
            if (j == int(pattern.size())) {
                hits.push_back(int(i) - j);
                j = lps[j - 1];          // continue: overlapping matches count
            }
        } else if (j) {
            j = lps[j - 1];
        } else {
            i++;
        }
    }
    return hits;
}

// All start indices of pattern in text. O(n + m) expected, O(1) space.
//
// KMP avoids re-scanning by remembering prefix structure. Rabin-Karp takes a
// different route: HASH the pattern once, slide a window over the text keeping
// its hash in O(1) per step, and only compare characters when hashes agree.
//
// THE ROLLING HASH. Treat the window as a base-B number modulo a prime:
//
//     hash("abc") = (a * B^2 + b * B^1 + c * B^0) mod M
//
// Sliding one character right is three operations, not m:
//
//     new = (old - leading * B^(m-1)) * B + trailing        (all mod M)
//
// Removing the leading digit is why B^(m-1) is precomputed - recomputing it
// inside the loop would make the whole thing O(n log m).
//
// THE VERIFICATION IS NOT OPTIONAL. Different strings can share a hash. On a
// hash match the characters must still be compared, or the function silently
// returns wrong positions. Hash equality is a CHEAP FILTER, never a proof.
//
// C++ SPECIFIC: the subtraction can go negative and % on a negative left
// operand yields a negative result (unlike Python), so the value has to be
// nudged back into [0, M) explicitly. Forgetting that is the classic C-family
// bug in this algorithm.
//
// Expected O(n + m); worst case O(n * m) if an adversary engineers collisions.
// Worth it over KMP because the rolling hash generalises: many patterns at
// once, 2-D grid matching, longest duplicate substring, rsync-style diffing.
vector<int> rabinKarpSearch(const string& text, const string& pattern,
                            long long base = 256, long long modulus = 1000000007LL) {
    int n = int(text.size()), m = int(pattern.size());
    if (m == 0 || m > n) return {};

    // B^(m-1) mod M - the weight of the character leaving the window.
    long long highOrder = 1;
    for (int i = 0; i < m - 1; i++) highOrder = highOrder * base % modulus;

    long long patternHash = 0, windowHash = 0;
    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * base + (unsigned char)pattern[i]) % modulus;
        windowHash = (windowHash * base + (unsigned char)text[i]) % modulus;
    }

    vector<int> hits;
    for (int start = 0; start + m <= n; start++) {
        // Hash equality is only a filter - the compare() is the proof.
        if (windowHash == patternHash && text.compare(start, m, pattern) == 0) {
            hits.push_back(start);
        }

        if (start + m < n) {                  // roll the window one step right
            long long leaving = (unsigned char)text[start] % modulus * highOrder % modulus;
            windowHash = (windowHash - leaving) % modulus;
            if (windowHash < 0) windowHash += modulus;      // see the note above
            windowHash = (windowHash * base + (unsigned char)text[start + m]) % modulus;
        }
    }
    return hits;
}

// The longest substring appearing at least twice. O(n log n) expected.
//
// The payoff for having a rolling hash. The key observation is MONOTONICITY:
// if a duplicate of length L exists, so does one of every shorter length (any
// prefix of it). That makes the answer binary-searchable.
//
// For each candidate length, hash every window and look for a repeat - O(n)
// per check with a rolling hash, O(log n) checks.
//
// Hashes are stored with their positions so a collision is resolved by
// comparing the real substrings, keeping the result exact.
string longestDuplicateSubstring(const string& s) {
    int n = int(s.size());
    const long long base = 256, modulus = 1000000007LL;

    auto duplicateOfLength = [&](int length) -> string {
        if (length == 0) return "";
        long long highOrder = 1;
        for (int i = 0; i < length - 1; i++) highOrder = highOrder * base % modulus;

        unordered_map<long long, vector<int>> seen;
        long long windowHash = 0;
        for (int i = 0; i < length; i++) {
            windowHash = (windowHash * base + (unsigned char)s[i]) % modulus;
        }

        for (int start = 0; start + length <= n; start++) {
            for (int other : seen[windowHash]) {        // verify, never trust
                if (s.compare(other, length, s, start, length) == 0) {
                    return s.substr(start, length);
                }
            }
            seen[windowHash].push_back(start);

            if (start + length < n) {
                long long leaving =
                    (unsigned char)s[start] % modulus * highOrder % modulus;
                windowHash = (windowHash - leaving) % modulus;
                if (windowHash < 0) windowHash += modulus;
                windowHash = (windowHash * base + (unsigned char)s[start + length])
                             % modulus;
            }
        }
        return "";
    };

    string best;
    int low = 1, high = n - 1;
    while (low <= high) {                     // binary search on the LENGTH
        int mid = (low + high) / 2;
        string found = duplicateOfLength(mid);
        if (!found.empty()) {
            best = found;
            low = mid + 1;                    // try longer
        } else {
            high = mid - 1;                   // too long, try shorter
        }
    }
    return best;
}

// ============================================================================
// 7. Everyday transformations
// ============================================================================

// C++ has no built-in split. This is the idiomatic stringstream version.
vector<string> split(const string& s, char delim) {
    vector<string> out;
    string token;
    istringstream stream(s);
    while (getline(stream, token, delim))
        if (!token.empty()) out.push_back(token);
    return out;
}

string reverseWords(const string& sentence) {
    vector<string> words = split(sentence, ' ');
    string out;
    for (auto it = words.rbegin(); it != words.rend(); ++it) {
        if (!out.empty()) out += ' ';
        out += *it;
    }
    return out;
}

// Vertical scan: compare column by column, stop at the first mismatch.
string longestCommonPrefix(const vector<string>& words) {
    if (words.empty()) return "";
    for (size_t i = 0; i < words[0].size(); i++) {
        for (size_t w = 1; w < words.size(); w++)
            if (i >= words[w].size() || words[w][i] != words[0][i])
                return words[0].substr(0, i);
    }
    return words[0];
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s = "abc";
    reverseInPlace(s);
    assert(s == "cba");

    assert(isPalindrome("A man, a plan, a canal: Panama"));
    assert(isPalindrome(""));
    assert(!isPalindrome("race a car"));

    assert(areAnagrams("listen", "silent"));
    assert(!areAnagrams("rat", "car"));
    assert(!areAnagrams("a", "ab"));

    auto groups = groupAnagrams({"eat", "tea", "tan", "ate", "nat", "bat"});
    vector<size_t> sizes;
    for (const auto& g : groups) sizes.push_back(g.size());
    sort(sizes.begin(), sizes.end());
    assert((sizes == vector<size_t>{1, 2, 3}));

    assert(firstUniqueChar("leetcode") == 0);
    assert(firstUniqueChar("aabb") == -1);

    assert(longestUniqueSubstring("abcabcbb") == 3);
    assert(longestUniqueSubstring("bbbbb") == 1);
    assert(longestUniqueSubstring("") == 0);

    assert(minWindowSubstring("ADOBECODEBANC", "ABC") == "BANC");
    assert(minWindowSubstring("a", "aa") == "");

    assert(compress("aabcccccaaa") == "a2b1c5a3");
    assert(compress("") == "");

    string text = "ababcabcabababd", pat = "ababd";
    assert((naiveSearch(text, pat) == vector<int>{10}));
    assert((kmpSearch(text, pat) == vector<int>{10}));
    assert((buildLPS("aabaaac") == vector<int>{0, 1, 0, 1, 2, 2, 0}));
    assert((kmpSearch("aaaa", "aa") == vector<int>{0, 1, 2}));   // overlapping
    assert(kmpSearch("abc", "").empty());

    assert(reverseWords("  the   sky is blue  ") == "blue is sky the");

    assert(longestCommonPrefix({"flower", "flow", "flight"}) == "fl");
    assert(longestCommonPrefix({"dog", "car"}) == "");

    // --- Rabin-Karp -----------------------------------------------------------
    assert((rabinKarpSearch("abracadabra", "abra") == vector<int>{0, 7}));
    assert((rabinKarpSearch("aaaa", "aa") == vector<int>{0, 1, 2}));   // overlapping
    assert(rabinKarpSearch("abc", "d").empty());
    assert(rabinKarpSearch("abc", "").empty());          // empty pattern
    assert(rabinKarpSearch("ab", "abc").empty());        // pattern too long
    assert((rabinKarpSearch("aaa", "aaa") == vector<int>{0}));         // exact fit

    // Against naive search AND KMP, on a two-letter alphabet so that windows
    // collide constantly and the verification step actually gets exercised.
    mt19937 rng(4);
    auto randomString = [&rng](int length, const string& alphabet) {
        string out;
        for (int i = 0; i < length; i++) out += alphabet[rng() % alphabet.size()];
        return out;
    };

    for (int trial = 0; trial < 300; trial++) {
        string text = randomString(int(rng() % 41), "ab");
        string pattern = randomString(int(rng() % 5) + 1, "ab");
        vector<int> expected = naiveSearch(text, pattern);
        assert(rabinKarpSearch(text, pattern) == expected);
        assert(kmpSearch(text, pattern) == expected);
    }

    // A tiny modulus forces genuine hash collisions - the verification step is
    // the only thing keeping the answer correct here.
    for (int trial = 0; trial < 200; trial++) {
        string text = randomString(int(rng() % 31), "abc");
        string pattern = randomString(int(rng() % 4) + 1, "abc");
        assert(rabinKarpSearch(text, pattern, 4, 7) == naiveSearch(text, pattern));
    }

    assert(longestDuplicateSubstring("banana") == "ana");
    assert(longestDuplicateSubstring("abcd").empty());   // nothing repeats
    assert(longestDuplicateSubstring("aaaa") == "aaa");
    assert(longestDuplicateSubstring("").empty());

    // Against an O(n^3) brute force over every pair of substrings.
    for (int trial = 0; trial < 60; trial++) {
        string s = randomString(int(rng() % 19), "abc");
        size_t expectedLength = 0;
        for (size_t length = 1; length < s.size(); length++) {
            set<string> windows;
            size_t count = 0;
            for (size_t i = 0; i + length <= s.size(); i++, count++) {
                windows.insert(s.substr(i, length));
            }
            if (windows.size() < count) expectedLength = length;
        }
        assert(longestDuplicateSubstring(s).size() == expectedLength);
    }

    cout << "04-Strings (C++): all checks passed\n";
    cout << "  Rabin-Karp cross-checked against naive search and KMP, including\n";
    cout << "  with a deliberately tiny modulus that forces hash collisions\n";
    return 0;
}
