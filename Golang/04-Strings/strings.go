// 04 - Strings: the patterns that solve string problems, including KMP.
//
// Run:  go run strings.go
package main

import (
	"fmt"
	"math/rand"
	"sort"
	"strconv"
	"strings"
	"unicode"
)

// ============================================================================
// 1. Reversal
// ============================================================================

// ReverseASCII works byte by byte. O(n) time, one allocation.
// Correct only while every character is a single byte.
func ReverseASCII(s string) string {
	b := []byte(s)
	for lo, hi := 0, len(b)-1; lo < hi; lo, hi = lo+1, hi-1 {
		b[lo], b[hi] = b[hi], b[lo]
	}
	return string(b)
}

// ReverseUnicode reverses whole runes, so multi-byte characters survive.
func ReverseUnicode(s string) string {
	r := []rune(s) // O(n) decode
	for lo, hi := 0, len(r)-1; lo < hi; lo, hi = lo+1, hi-1 {
		r[lo], r[hi] = r[hi], r[lo]
	}
	return string(r)
}

// ============================================================================
// 2. Two pointers - palindromes
// ============================================================================

// IsPalindrome ignores case and non-alphanumerics. O(n) time, O(1) space:
// filtering happens in the loop rather than building a cleaned copy.
func IsPalindrome(s string) bool {
	r := []rune(strings.ToLower(s))
	lo, hi := 0, len(r)-1
	for lo < hi {
		for lo < hi && !unicode.IsLetter(r[lo]) && !unicode.IsDigit(r[lo]) {
			lo++
		}
		for lo < hi && !unicode.IsLetter(r[hi]) && !unicode.IsDigit(r[hi]) {
			hi--
		}
		if r[lo] != r[hi] {
			return false
		}
		lo, hi = lo+1, hi-1
	}
	return true
}

// ============================================================================
// 3. Frequency counting - anagrams
// ============================================================================

// AreAnagrams counts lowercase letters. O(n) time, O(1) space.
// Fixed-size arrays are comparable in Go, so one == settles it.
func AreAnagrams(a, b string) bool {
	if len(a) != len(b) {
		return false // cheap reject before counting
	}
	var ca, cb [26]int
	for i := 0; i < len(a); i++ {
		ca[a[i]-'a']++
		cb[b[i]-'a']++
	}
	return ca == cb
}

// GroupAnagrams groups words that are anagrams of each other. O(n*k).
// The count array is the map key - arrays are comparable, so no encoding needed.
func GroupAnagrams(words []string) [][]string {
	groups := make(map[[26]int][]string)
	for _, w := range words {
		var key [26]int
		for i := 0; i < len(w); i++ {
			key[w[i]-'a']++
		}
		groups[key] = append(groups[key], w)
	}
	out := make([][]string, 0, len(groups))
	for _, g := range groups {
		out = append(out, g)
	}
	return out
}

// FirstUniqueChar returns the index of the first non-repeating byte, or -1.
func FirstUniqueChar(s string) int {
	var freq [26]int
	for i := 0; i < len(s); i++ {
		freq[s[i]-'a']++
	}
	for i := 0; i < len(s); i++ {
		if freq[s[i]-'a'] == 1 {
			return i
		}
	}
	return -1
}

// ============================================================================
// 4. Sliding window
// ============================================================================

// LongestUniqueSubstring returns the length of the longest substring with no
// repeated byte. O(n) time, O(1) space - left never moves backwards.
func LongestUniqueSubstring(s string) int {
	var lastSeen [256]int
	for i := range lastSeen {
		lastSeen[i] = -1
	}
	left, best := 0, 0
	for right := 0; right < len(s); right++ {
		c := s[right]
		if lastSeen[c] >= left {
			left = lastSeen[c] + 1 // jump past the earlier occurrence
		}
		lastSeen[c] = right
		best = max(best, right-left+1)
	}
	return best
}

// MinWindowSubstring returns the smallest window of s containing every byte of
// t (with multiplicity). O(n+m): grow right until valid, then shrink left.
func MinWindowSubstring(s, t string) string {
	if s == "" || t == "" {
		return ""
	}
	var need [256]int
	for i := 0; i < len(t); i++ {
		need[t[i]]++
	}

	missing := len(t) // counts duplicates
	bestLen, bestStart, left := -1, 0, 0

	for right := 0; right < len(s); right++ {
		if need[s[right]] > 0 {
			missing--
		}
		need[s[right]]-- // may go negative for surplus characters

		for missing == 0 { // valid window: shrink it from the left
			if bestLen == -1 || right-left+1 < bestLen {
				bestLen, bestStart = right-left+1, left
			}
			leaving := s[left]
			need[leaving]++
			if need[leaving] > 0 {
				missing++ // we just removed a needed character
			}
			left++
		}
	}
	if bestLen == -1 {
		return ""
	}
	return s[bestStart : bestStart+bestLen]
}

// ============================================================================
// 5. Building strings
// ============================================================================

// Compress is run-length encoding: "aabcccccaaa" -> "a2b1c5a3". O(n).
// strings.Builder keeps it linear; out += ... would be O(n^2).
func Compress(s string) string {
	if s == "" {
		return ""
	}
	var sb strings.Builder
	sb.Grow(len(s))
	prev, count := s[0], 1
	for i := 1; i < len(s); i++ {
		if s[i] == prev {
			count++
			continue
		}
		sb.WriteByte(prev)
		sb.WriteString(strconv.Itoa(count))
		prev, count = s[i], 1
	}
	sb.WriteByte(prev)
	sb.WriteString(strconv.Itoa(count))
	return sb.String()
}

// ============================================================================
// 6. Pattern matching
// ============================================================================

// NaiveSearch checks every start position. O(n*m) worst case.
func NaiveSearch(text, pattern string) []int {
	var hits []int
	if pattern == "" || len(pattern) > len(text) {
		return hits
	}
	for i := 0; i+len(pattern) <= len(text); i++ {
		j := 0
		for j < len(pattern) && text[i+j] == pattern[j] {
			j++
		}
		if j == len(pattern) {
			hits = append(hits, i)
		}
	}
	return hits
}

// BuildLPS returns, for each position, the length of the longest proper prefix
// of pattern[:i+1] that is also a suffix of it. On a mismatch it tells KMP how
// much of the current match is still usable, so the text index never rewinds.
func BuildLPS(pattern string) []int {
	lps := make([]int, len(pattern))
	length, i := 0, 1
	for i < len(pattern) {
		switch {
		case pattern[i] == pattern[length]:
			length++
			lps[i] = length
			i++
		case length > 0:
			length = lps[length-1] // fall back, do NOT advance i
		default:
			lps[i] = 0
			i++
		}
	}
	return lps
}

// KMPSearch returns every start index of pattern in text. O(n+m) time, O(m) space.
func KMPSearch(text, pattern string) []int {
	var hits []int
	if pattern == "" || len(pattern) > len(text) {
		return hits
	}
	lps := BuildLPS(pattern)
	i, j := 0, 0
	for i < len(text) {
		switch {
		case text[i] == pattern[j]:
			i++
			j++
			if j == len(pattern) {
				hits = append(hits, i-j)
				j = lps[j-1] // keep going: overlapping matches count
			}
		case j > 0:
			j = lps[j-1]
		default:
			i++
		}
	}
	return hits
}

// RabinKarpSearch returns every start index of pattern in text.
// O(n + m) expected, O(1) space.
//
// KMP avoids re-scanning by remembering prefix structure. Rabin-Karp takes a
// different route: HASH the pattern once, slide a window over the text keeping
// its hash in O(1) per step, and only compare characters when hashes agree.
//
// THE ROLLING HASH. Treat the window as a base-B number modulo a prime:
//
//	hash("abc") = (a * B^2 + b * B^1 + c * B^0) mod M
//
// Sliding one character right is three operations, not m:
//
//	new = (old - leading * B^(m-1)) * B + trailing        (all mod M)
//
// Removing the leading digit is why B^(m-1) is precomputed - recomputing it
// inside the loop would make the whole thing O(n log m).
//
// THE VERIFICATION IS NOT OPTIONAL. Different strings can share a hash. On a
// hash match the bytes must still be compared, or the function silently
// returns wrong positions. Hash equality is a CHEAP FILTER, never a proof.
//
// GO SPECIFIC: Go's % follows the sign of the DIVIDEND, so a negative left
// operand gives a negative result (unlike Python). The subtraction therefore
// needs an explicit fix-up back into [0, M).
//
// Expected O(n + m); worst case O(n * m) if an adversary engineers collisions.
// Worth it over KMP because the rolling hash generalises: many patterns at
// once, 2-D grid matching, longest duplicate substring, rsync-style diffing.
func RabinKarpSearch(text, pattern string, base, modulus int) []int {
	n, m := len(text), len(pattern)
	if m == 0 || m > n {
		return nil
	}

	// B^(m-1) mod M - the weight of the byte leaving the window.
	highOrder := 1
	for i := 0; i < m-1; i++ {
		highOrder = highOrder * base % modulus
	}

	patternHash, windowHash := 0, 0
	for i := 0; i < m; i++ {
		patternHash = (patternHash*base + int(pattern[i])) % modulus
		windowHash = (windowHash*base + int(text[i])) % modulus
	}

	var hits []int
	for start := 0; start+m <= n; start++ {
		// Hash equality is only a filter - the slice comparison is the proof.
		if windowHash == patternHash && text[start:start+m] == pattern {
			hits = append(hits, start)
		}

		if start+m < n { // roll the window one step right
			leaving := int(text[start]) % modulus * highOrder % modulus
			windowHash = (windowHash - leaving) % modulus
			if windowHash < 0 {
				windowHash += modulus // % follows the dividend's sign
			}
			windowHash = (windowHash*base + int(text[start+m])) % modulus
		}
	}
	return hits
}

// LongestDuplicateSubstring returns the longest substring appearing at least
// twice. O(n log n) expected.
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
func LongestDuplicateSubstring(s string) string {
	n := len(s)
	const base, modulus = 256, 1000000007

	duplicateOfLength := func(length int) string {
		if length == 0 {
			return ""
		}
		highOrder := 1
		for i := 0; i < length-1; i++ {
			highOrder = highOrder * base % modulus
		}

		seen := map[int][]int{}
		windowHash := 0
		for i := 0; i < length; i++ {
			windowHash = (windowHash*base + int(s[i])) % modulus
		}

		for start := 0; start+length <= n; start++ {
			for _, other := range seen[windowHash] { // verify, never trust
				if s[other:other+length] == s[start:start+length] {
					return s[start : start+length]
				}
			}
			seen[windowHash] = append(seen[windowHash], start)

			if start+length < n {
				leaving := int(s[start]) % modulus * highOrder % modulus
				windowHash = (windowHash - leaving) % modulus
				if windowHash < 0 {
					windowHash += modulus
				}
				windowHash = (windowHash*base + int(s[start+length])) % modulus
			}
		}
		return ""
	}

	best := ""
	low, high := 1, n-1
	for low <= high { // binary search on the LENGTH
		mid := (low + high) / 2
		if found := duplicateOfLength(mid); found != "" {
			best = found
			low = mid + 1 // try longer
		} else {
			high = mid - 1 // too long, try shorter
		}
	}
	return best
}

// ============================================================================
// 7. Everyday transformations
// ============================================================================

// ReverseWords uses strings.Fields, which collapses runs of whitespace.
func ReverseWords(sentence string) string {
	words := strings.Fields(sentence)
	for lo, hi := 0, len(words)-1; lo < hi; lo, hi = lo+1, hi-1 {
		words[lo], words[hi] = words[hi], words[lo]
	}
	return strings.Join(words, " ")
}

// LongestCommonPrefix scans column by column. O(total bytes).
func LongestCommonPrefix(words []string) string {
	if len(words) == 0 {
		return ""
	}
	for i := 0; i < len(words[0]); i++ {
		for _, w := range words[1:] {
			if i >= len(w) || w[i] != words[0][i] {
				return words[0][:i]
			}
		}
	}
	return words[0]
}

// ============================================================================
// demo
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func equalInts(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func main() {
	assert(ReverseASCII("abc") == "cba", "ReverseASCII")
	assert(ReverseUnicode("héllo") == "olléh", "ReverseUnicode keeps runes intact")

	assert(IsPalindrome("A man, a plan, a canal: Panama"), "palindrome")
	assert(IsPalindrome(""), "empty is a palindrome")
	assert(!IsPalindrome("race a car"), "not a palindrome")

	assert(AreAnagrams("listen", "silent"), "anagram")
	assert(!AreAnagrams("rat", "car"), "not anagrams")
	assert(!AreAnagrams("a", "ab"), "different lengths")

	groups := GroupAnagrams([]string{"eat", "tea", "tan", "ate", "nat", "bat"})
	sizes := make([]int, 0, len(groups))
	for _, g := range groups {
		sizes = append(sizes, len(g))
	}
	sort.Ints(sizes)
	assert(equalInts(sizes, []int{1, 2, 3}), "anagram group sizes")

	assert(FirstUniqueChar("leetcode") == 0, "first unique")
	assert(FirstUniqueChar("aabb") == -1, "no unique char")

	assert(LongestUniqueSubstring("abcabcbb") == 3, "window abc")
	assert(LongestUniqueSubstring("bbbbb") == 1, "window b")
	assert(LongestUniqueSubstring("") == 0, "empty window")

	assert(MinWindowSubstring("ADOBECODEBANC", "ABC") == "BANC", "min window")
	assert(MinWindowSubstring("a", "aa") == "", "impossible window")

	assert(Compress("aabcccccaaa") == "a2b1c5a3", "RLE")
	assert(Compress("") == "", "RLE of empty")

	text, pat := "ababcabcabababd", "ababd"
	assert(equalInts(NaiveSearch(text, pat), []int{10}), "naive search")
	assert(equalInts(KMPSearch(text, pat), []int{10}), "kmp search")
	assert(equalInts(BuildLPS("aabaaac"), []int{0, 1, 0, 1, 2, 2, 0}), "lps table")
	assert(equalInts(KMPSearch("aaaa", "aa"), []int{0, 1, 2}), "overlapping matches")
	assert(len(KMPSearch("abc", "")) == 0, "empty pattern")

	assert(ReverseWords("  the   sky is blue  ") == "blue is sky the", "reverse words")

	assert(LongestCommonPrefix([]string{"flower", "flow", "flight"}) == "fl", "LCP")
	assert(LongestCommonPrefix([]string{"dog", "car"}) == "", "no LCP")

	// --- Rabin-Karp -----------------------------------------------------------
	const base, mod = 256, 1000000007
	assert(equalInts(RabinKarpSearch("abracadabra", "abra", base, mod), []int{0, 7}),
		"rabin-karp finds both occurrences")
	assert(equalInts(RabinKarpSearch("aaaa", "aa", base, mod), []int{0, 1, 2}),
		"overlapping matches")
	assert(len(RabinKarpSearch("abc", "d", base, mod)) == 0, "no match")
	assert(len(RabinKarpSearch("abc", "", base, mod)) == 0, "empty pattern")
	assert(len(RabinKarpSearch("ab", "abc", base, mod)) == 0, "pattern too long")
	assert(equalInts(RabinKarpSearch("aaa", "aaa", base, mod), []int{0}), "exact fit")

	// Against naive search AND KMP, on a two-letter alphabet so that windows
	// collide constantly and the verification step actually gets exercised.
	rng := rand.New(rand.NewSource(4))
	randomString := func(length int, alphabet string) string {
		out := make([]byte, length)
		for i := range out {
			out[i] = alphabet[rng.Intn(len(alphabet))]
		}
		return string(out)
	}

	for trial := 0; trial < 300; trial++ {
		text := randomString(rng.Intn(41), "ab")
		pattern := randomString(rng.Intn(5)+1, "ab")
		expected := NaiveSearch(text, pattern)
		assert(equalInts(RabinKarpSearch(text, pattern, base, mod), expected),
			"rabin-karp matches naive search")
		assert(equalInts(KMPSearch(text, pattern), expected),
			"kmp matches naive search")
	}

	// A tiny modulus forces genuine hash collisions - the verification step is
	// the only thing keeping the answer correct here.
	for trial := 0; trial < 200; trial++ {
		text := randomString(rng.Intn(31), "abc")
		pattern := randomString(rng.Intn(4)+1, "abc")
		assert(equalInts(RabinKarpSearch(text, pattern, 4, 7),
			NaiveSearch(text, pattern)), "verification survives collisions")
	}

	assert(LongestDuplicateSubstring("banana") == "ana", "longest duplicate")
	assert(LongestDuplicateSubstring("abcd") == "", "nothing repeats")
	assert(LongestDuplicateSubstring("aaaa") == "aaa", "overlapping duplicate")
	assert(LongestDuplicateSubstring("") == "", "empty string")

	// Against an O(n^3) brute force over every pair of substrings.
	for trial := 0; trial < 60; trial++ {
		s := randomString(rng.Intn(19), "abc")
		expectedLength := 0
		for length := 1; length < len(s); length++ {
			windows := map[string]struct{}{}
			count := 0
			for i := 0; i+length <= len(s); i++ {
				windows[s[i:i+length]] = struct{}{}
				count++
			}
			if len(windows) < count {
				expectedLength = length
			}
		}
		assert(len(LongestDuplicateSubstring(s)) == expectedLength,
			"longest duplicate matches brute force")
	}

	fmt.Println("04-Strings (Go): all checks passed")
	fmt.Println("  Rabin-Karp cross-checked against naive search and KMP, including")
	fmt.Println("  with a deliberately tiny modulus that forces hash collisions")
}
