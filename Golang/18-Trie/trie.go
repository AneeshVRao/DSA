// 18 - Trie: a prefix tree with insert / search / prefix queries / deletion,
// plus wildcard matching and a bitwise trie for maximum XOR.
//
// Run:  go run trie.go
package main

import (
	"fmt"
	"strings"
)

// ============================================================================
// 1. The node
// ============================================================================

// TrieNode uses a fixed array of children: O(1) lookup with no hashing, and
// alphabetical iteration for free - which matters in Go, where map iteration
// order is randomised and autocomplete output must be deterministic.
//
// isEnd is what distinguishes a stored word from a mere prefix.
type TrieNode struct {
	children [26]*TrieNode
	isEnd    bool
}

func (n *TrieNode) isLeaf() bool {
	for _, child := range n.children {
		if child != nil {
			return false
		}
	}
	return true
}

// ============================================================================
// 2. The trie
// ============================================================================

// Trie stores lowercase ASCII words. Every operation costs O(L) in the KEY
// length - never O(n) in the number of stored words.
type Trie struct {
	root *TrieNode
	size int
}

func NewTrie(words ...string) *Trie {
	t := &Trie{root: &TrieNode{}}
	for _, w := range words {
		t.Insert(w)
	}
	return t
}

func (t *Trie) Len() int { return t.size }

// Insert adds a word in O(L). Shared prefixes cost nothing extra: only the new
// suffix allocates. Returns false if the word was already present.
func (t *Trie) Insert(word string) bool {
	node := t.root
	for i := 0; i < len(word); i++ {
		c := word[i] - 'a'
		if node.children[c] == nil {
			node.children[c] = &TrieNode{}
		}
		node = node.children[c]
	}
	if node.isEnd {
		return false
	}
	node.isEnd = true
	t.size++
	return true
}

// walk follows a prefix and returns the node it ends at, or nil. O(L).
func (t *Trie) walk(prefix string) *TrieNode {
	node := t.root
	for i := 0; i < len(prefix); i++ {
		node = node.children[prefix[i]-'a']
		if node == nil {
			return nil
		}
	}
	return node
}

// Search reports whether this exact word is stored. O(L).
func (t *Trie) Search(word string) bool {
	node := t.walk(word)
	return node != nil && node.isEnd
}

// HasPrefix reports whether any stored word begins with this prefix. O(L).
// THIS is why tries exist: a map would need O(n * L) to answer it.
func (t *Trie) HasPrefix(prefix string) bool { return t.walk(prefix) != nil }

// Delete removes a word, pruning nodes that become useless. O(L).
//
// The recursion returns "may my parent delete me?" - true only when this node
// has no children left AND is not the end of another word. That is what stops
// deleting "car" from breaking "cart".
func (t *Trie) Delete(word string) bool {
	if !t.Search(word) {
		return false
	}

	var prune func(node *TrieNode, depth int) bool
	prune = func(node *TrieNode, depth int) bool {
		if depth == len(word) {
			node.isEnd = false
			return node.isLeaf() // deletable only if it is a leaf
		}
		c := word[depth] - 'a'
		child := node.children[c]
		if child == nil || !prune(child, depth+1) {
			return false
		}
		node.children[c] = nil // the child became useless; the GC frees it
		return node.isLeaf() && !node.isEnd
	}

	prune(t.root, 0)
	t.size--
	return true
}

// WordsWithPrefix returns every stored word starting with prefix, in
// alphabetical order. O(L + output): walk to the prefix node, then DFS below.
func (t *Trie) WordsWithPrefix(prefix string) []string {
	start := t.walk(prefix)
	if start == nil {
		return nil
	}

	var found []string
	var collect func(node *TrieNode, path []byte)
	collect = func(node *TrieNode, path []byte) {
		if node.isEnd {
			found = append(found, prefix+string(path))
		}
		for i := 0; i < 26; i++ { // ascending: the output is sorted
			if node.children[i] == nil {
				continue
			}
			collect(node.children[i], append(path, byte('a'+i)))
		}
	}

	collect(start, nil)
	return found
}

// Autocomplete is the canonical trie application.
func (t *Trie) Autocomplete(prefix string, limit int) []string {
	all := t.WordsWithPrefix(prefix)
	if len(all) > limit {
		all = all[:limit]
	}
	return all
}

// LongestCommonPrefix returns the longest prefix shared by ALL stored words.
// Walk down while there is exactly one child and no word ends here. O(L).
func (t *Trie) LongestCommonPrefix() string {
	var sb strings.Builder
	node := t.root
	for !node.isEnd {
		onlyChild, childCount := -1, 0
		for i, child := range node.children {
			if child != nil {
				childCount++
				onlyChild = i
			}
		}
		if childCount != 1 {
			break // a branch ends the shared prefix
		}
		sb.WriteByte(byte('a' + onlyChild))
		node = node.children[onlyChild]
	}
	return sb.String()
}

// CountWords walks the whole trie - used to cross-check the size counter.
func (t *Trie) CountWords() int {
	var walk func(*TrieNode) int
	walk = func(node *TrieNode) int {
		total := 0
		if node.isEnd {
			total = 1
		}
		for _, child := range node.children {
			if child != nil {
				total += walk(child)
			}
		}
		return total
	}
	return walk(t.root)
}

// CountNodes shows how much prefix sharing saves.
func (t *Trie) CountNodes() int {
	var walk func(*TrieNode) int
	walk = func(node *TrieNode) int {
		total := 1
		for _, child := range node.children {
			if child != nil {
				total += walk(child)
			}
		}
		return total
	}
	return walk(t.root)
}

// SearchPattern supports '.' as any single character (LeetCode 211).
// A map cannot answer this at all; the trie turns it into a bounded DFS.
func (t *Trie) SearchPattern(pattern string) bool {
	var match func(node *TrieNode, i int) bool
	match = func(node *TrieNode, i int) bool {
		if node == nil {
			return false
		}
		if i == len(pattern) {
			return node.isEnd
		}
		if pattern[i] == '.' { // try every child
			for _, child := range node.children {
				if child != nil && match(child, i+1) {
					return true
				}
			}
			return false
		}
		return match(node.children[pattern[i]-'a'], i+1)
	}
	return match(t.root, 0)
}

// ============================================================================
// 3. Bitwise trie - maximum XOR pair
// ============================================================================

// BitNode is a node of a trie over the BITS of an integer.
type BitNode struct{ children [2]*BitNode }

// BitwiseTrie stores numbers most-significant-bit first. It turns "maximum XOR
// of any two numbers" from an O(n^2) pairwise scan into O(32n): at each bit,
// walk greedily toward the OPPOSITE bit, because a 1 in a higher position
// beats everything below it.
type BitwiseTrie struct {
	root  *BitNode
	empty bool
}

const trieBits = 32

func NewBitwiseTrie() *BitwiseTrie {
	return &BitwiseTrie{root: &BitNode{}, empty: true}
}

// Insert is O(32) - constant per number.
func (b *BitwiseTrie) Insert(number int) {
	node := b.root
	for i := trieBits - 1; i >= 0; i-- {
		bit := (number >> i) & 1
		if node.children[bit] == nil {
			node.children[bit] = &BitNode{}
		}
		node = node.children[bit]
	}
	b.empty = false
}

// MaxXorWith returns the largest XOR of number with any stored value. O(32).
func (b *BitwiseTrie) MaxXorWith(number int) int {
	if b.empty {
		return 0
	}
	node, best := b.root, 0
	for i := trieBits - 1; i >= 0; i-- {
		bit := (number >> i) & 1
		wanted := bit ^ 1 // the opposite bit sets this position
		if node.children[wanted] != nil {
			best |= 1 << i
			node = node.children[wanted]
		} else {
			node = node.children[bit] // forced to match
		}
	}
	return best
}

// MaxXorPair returns the maximum XOR over all pairs. O(32n) instead of O(n^2).
func MaxXorPair(numbers []int) int {
	if len(numbers) < 2 {
		return 0
	}
	trie := NewBitwiseTrie()
	trie.Insert(numbers[0])
	best := 0
	for _, number := range numbers[1:] {
		best = max(best, trie.MaxXorWith(number))
		trie.Insert(number)
	}
	return best
}

// ============================================================================
// demo
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func equalStrings(a, b []string) bool {
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
	trie := NewTrie("cat", "car", "card", "care", "dog", "do")
	assert(trie.Len() == 6, "size")
	assert(trie.CountWords() == 6, "size cross-check")

	assert(trie.Search("cat") && trie.Search("car"), "search")
	assert(!trie.Search("ca"), "a prefix is not a word")
	assert(!trie.Search("cats"), "longer than any stored word")
	assert(trie.HasPrefix("ca") && trie.HasPrefix("do"), "prefix search")
	assert(!trie.HasPrefix("z"), "missing prefix")

	assert(!trie.Insert("cat"), "duplicate insert reports false")
	assert(trie.Len() == 6, "size unchanged")

	assert(equalStrings(trie.WordsWithPrefix("car"), []string{"car", "card", "care"}),
		"words with prefix, sorted")
	assert(equalStrings(trie.WordsWithPrefix("do"), []string{"do", "dog"}), "do prefix")
	assert(trie.WordsWithPrefix("z") == nil, "no matches")
	assert(equalStrings(trie.Autocomplete("car", 2), []string{"car", "card"}),
		"autocomplete respects the limit")

	// Prefix sharing: 6 words of 20 characters need far fewer than 21 nodes.
	assert(trie.CountNodes() < 21, "prefix sharing saves nodes")

	// Deleting a word that is a PREFIX of another must not break the longer one.
	assert(trie.Delete("car"), "delete a prefix word")
	assert(!trie.Search("car"), "car is gone")
	assert(trie.Search("card") && trie.Search("care"), "longer words survive")
	assert(trie.HasPrefix("car"), "the path is still needed")
	assert(trie.Len() == 5 && trie.CountWords() == 5, "size after delete")

	// Deleting a leaf really prunes the path.
	nodesBefore := trie.CountNodes()
	assert(trie.Delete("dog"), "delete a leaf word")
	assert(trie.CountNodes() < nodesBefore, "the 'g' node was pruned")
	assert(trie.Search("do"), "its prefix survives")
	assert(!trie.Delete("dog"), "already gone")
	assert(!trie.Delete("zzz"), "never existed")

	assert(NewTrie("flower", "flow", "flight").LongestCommonPrefix() == "fl", "LCP")
	assert(NewTrie("dog", "car").LongestCommonPrefix() == "", "no common prefix")
	assert(NewTrie("abc").LongestCommonPrefix() == "abc", "single word")
	assert(NewTrie().LongestCommonPrefix() == "", "empty trie")

	wildcard := NewTrie("bad", "dad", "mad")
	assert(wildcard.SearchPattern("bad"), "exact pattern")
	assert(!wildcard.SearchPattern("pad"), "missing word")
	assert(wildcard.SearchPattern(".ad"), "any first character")
	assert(wildcard.SearchPattern("b.."), "trailing wildcards")
	assert(wildcard.SearchPattern("..."), "all wildcards")
	assert(!wildcard.SearchPattern("...."), "length must match")

	assert(MaxXorPair([]int{3, 10, 5, 25, 2, 8}) == 28, "5 ^ 25")
	assert(MaxXorPair([]int{0}) == 0, "single number")
	assert(MaxXorPair([]int{14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70}) == 127,
		"larger case")
	// Cross-check against brute force.
	sample := []int{3, 10, 5, 25, 2, 8}
	brute := 0
	for i := range sample {
		for j := i + 1; j < len(sample); j++ {
			brute = max(brute, sample[i]^sample[j])
		}
	}
	assert(MaxXorPair(sample) == brute, "matches brute force")

	fmt.Println("18-Trie (Go): all checks passed")
}
