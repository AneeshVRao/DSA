// 10 - Hashing: a hash map built from scratch (separate chaining + rehashing),
// plus the patterns hashing exists to serve, and an LRU cache.
//
// Run:  go run hashing.go
package main

import (
	"container/list"
	"fmt"
	"sort"
)

// ============================================================================
// 1. A hash map from scratch (separate chaining)
// ============================================================================

type entry struct {
	key   string
	value int
}

// HashMap is a string -> int dictionary over an array of buckets, each holding
// a chain. Go's real map uses 8-slot buckets with overflow chaining, but the
// moving parts are the same: hash, index, collide, load factor, resize.
type HashMap struct {
	buckets [][]entry
	size    int
}

const (
	initialCapacity = 8
	maxLoadFactor   = 0.75
)

func NewHashMap() *HashMap {
	return &HashMap{buckets: make([][]entry, initialCapacity)}
}

// fnv1a is a small, well-distributed string hash. Go's runtime uses a
// randomly seeded hash instead, which is what defends against hash flooding.
func fnv1a(s string) uint64 {
	const (
		offset = 14695981039346656037
		prime  = 1099511628211
	)
	h := uint64(offset)
	for i := 0; i < len(s); i++ {
		h ^= uint64(s[i])
		h *= prime
	}
	return h
}

func (m *HashMap) indexFor(key string) int {
	return int(fnv1a(key) % uint64(len(m.buckets)))
}

func (m *HashMap) Len() int            { return m.size }
func (m *HashMap) Capacity() int       { return len(m.buckets) }
func (m *HashMap) LoadFactor() float64 { return float64(m.size) / float64(len(m.buckets)) }

// Put is O(1) average, amortised across the occasional resize.
func (m *HashMap) Put(key string, value int) {
	i := m.indexFor(key)
	for j := range m.buckets[i] {
		if m.buckets[i][j].key == key { // equal keys overwrite
			m.buckets[i][j].value = value
			return
		}
	}
	m.buckets[i] = append(m.buckets[i], entry{key: key, value: value})
	m.size++
	if m.LoadFactor() > maxLoadFactor {
		m.resize()
	}
}

// Get returns (value, found). O(1) average, O(chain) worst case.
func (m *HashMap) Get(key string) (int, bool) {
	for _, e := range m.buckets[m.indexFor(key)] {
		if e.key == key {
			return e.value, true
		}
	}
	return 0, false
}

func (m *HashMap) Delete(key string) bool {
	i := m.indexFor(key)
	for j, e := range m.buckets[i] {
		if e.key == key {
			// Remove index j while preserving the rest of the chain.
			m.buckets[i] = append(m.buckets[i][:j], m.buckets[i][j+1:]...)
			m.size--
			return true
		}
	}
	return false
}

// resize doubles the capacity and REHASHES everything: the bucket index
// depends on the capacity, so every key belongs somewhere new. O(n).
func (m *HashMap) resize() {
	old := m.buckets
	m.buckets = make([][]entry, len(old)*2)
	m.size = 0
	for _, chain := range old {
		for _, e := range chain {
			m.Put(e.key, e.value)
		}
	}
}

func (m *HashMap) Keys() []string {
	keys := make([]string, 0, m.size)
	for _, chain := range m.buckets {
		for _, e := range chain {
			keys = append(keys, e.key)
		}
	}
	return keys
}

// LongestChain is a diagnostic: how badly is this table colliding?
func (m *HashMap) LongestChain() int {
	worst := 0
	for _, chain := range m.buckets {
		worst = max(worst, len(chain))
	}
	return worst
}

// ============================================================================
// 2. Frequency map
// ============================================================================

// CharFrequency counts bytes. m[c]++ works on a missing key because the read
// returns the zero value - no initialisation check needed.
func CharFrequency(s string) map[byte]int {
	freq := make(map[byte]int, len(s))
	for i := 0; i < len(s); i++ {
		freq[s[i]]++
	}
	return freq
}

func FirstUniqueChar(s string) int {
	freq := CharFrequency(s)
	for i := 0; i < len(s); i++ {
		if freq[s[i]] == 1 {
			return i
		}
	}
	return -1
}

// SortedKeys exists because Go randomises map iteration order on purpose.
// Anything deterministic must sort first.
func SortedKeys(m map[string]int) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

// ============================================================================
// 3. Complement lookup
// ============================================================================

// TwoSum returns the indices of the pair summing to target, or (-1,-1).
// Brute force asks "does x pair with a later element?" - O(n^2). Hashing
// flips it to "have I already seen the complement?" - O(1) per check.
func TwoSum(nums []int, target int) (int, int) {
	seen := make(map[int]int, len(nums)) // value -> index
	for i, x := range nums {
		if j, ok := seen[target-x]; ok {
			return j, i
		}
		seen[x] = i // store AFTER checking, so nothing pairs with itself
	}
	return -1, -1
}

// ContainsDuplicate uses map[T]struct{} - the idiomatic Go set, 0 bytes per value.
func ContainsDuplicate(nums []int) bool {
	seen := make(map[int]struct{}, len(nums))
	for _, x := range nums {
		if _, dup := seen[x]; dup {
			return true
		}
		seen[x] = struct{}{}
	}
	return false
}

// ============================================================================
// 4. Grouping by a computed key
// ============================================================================

// GroupAnagrams keys on a [26]int count array. Arrays ARE comparable in Go,
// so they can be map keys directly - no string encoding needed. Slices cannot.
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

// ============================================================================
// 5. Prefix sum + map
// ============================================================================

// SubarraySumEqualsK counts contiguous subarrays summing to k. O(n).
//
// prefix[j] - prefix[i] == k means the subarray (i, j] sums to k, so at each j
// we count earlier prefixes equal to prefix[j] - k. counts[0] = 1 seeds the
// empty prefix, which is what lets subarrays starting at index 0 count.
func SubarraySumEqualsK(nums []int, k int) int {
	counts := map[int]int{0: 1}
	prefix, total := 0, 0
	for _, x := range nums {
		prefix += x
		total += counts[prefix-k] // missing key reads as 0
		counts[prefix]++
	}
	return total
}

// ============================================================================
// 6. Seen set
// ============================================================================

// LongestConsecutive is O(n), not O(n log n): a run is only counted from its
// smallest member, so each run is walked exactly once.
func LongestConsecutive(nums []int) int {
	unique := make(map[int]struct{}, len(nums))
	for _, x := range nums {
		unique[x] = struct{}{}
	}
	best := 0
	for x := range unique {
		if _, hasPrev := unique[x-1]; hasPrev {
			continue // not the start of a run
		}
		length := 1
		for {
			if _, ok := unique[x+length]; !ok {
				break
			}
			length++
		}
		best = max(best, length)
	}
	return best
}

func Intersection(a, b []int) []int {
	lookup := make(map[int]struct{}, len(b))
	for _, x := range b {
		lookup[x] = struct{}{}
	}
	found := make(map[int]struct{})
	for _, x := range a {
		if _, ok := lookup[x]; ok {
			found[x] = struct{}{}
		}
	}
	out := make([]int, 0, len(found))
	for x := range found {
		out = append(out, x)
	}
	sort.Ints(out) // map order is random: sort for a deterministic result
	return out
}

// ============================================================================
// 7. Hashing + ordering: an LRU cache
// ============================================================================

// LRUCache needs BOTH a hash map (O(1) lookup) and a doubly linked list
// (recency order). container/list provides O(1) MoveToFront, and the map
// stores *list.Element pointers into it.
type LRUCache struct {
	capacity int
	order    *list.List            // front = most recently used
	index    map[int]*list.Element // key -> node holding a pair
}

type lruPair struct{ key, value int }

func NewLRUCache(capacity int) (*LRUCache, error) {
	if capacity <= 0 {
		return nil, fmt.Errorf("capacity must be positive, got %d", capacity)
	}
	return &LRUCache{
		capacity: capacity,
		order:    list.New(),
		index:    make(map[int]*list.Element, capacity),
	}, nil
}

func (c *LRUCache) Get(key int) int {
	el, ok := c.index[key]
	if !ok {
		return -1
	}
	c.order.MoveToFront(el) // mark as most recently used
	return el.Value.(*lruPair).value
}

func (c *LRUCache) Put(key, value int) {
	if el, ok := c.index[key]; ok {
		el.Value.(*lruPair).value = value
		c.order.MoveToFront(el)
		return
	}
	if len(c.index) == c.capacity {
		oldest := c.order.Back() // least recently used
		c.order.Remove(oldest)
		delete(c.index, oldest.Value.(*lruPair).key)
	}
	c.index[key] = c.order.PushFront(&lruPair{key: key, value: value})
}

// KeysMostRecentFirst is deterministic because it walks the list, not the map.
func (c *LRUCache) KeysMostRecentFirst() []int {
	out := make([]int, 0, len(c.index))
	for el := c.order.Front(); el != nil; el = el.Next() {
		out = append(out, el.Value.(*lruPair).key)
	}
	return out
}

// ============================================================================
// demo
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func equal(a, b []int) bool {
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
	m := NewHashMap()
	m.Put("cat", 1)
	m.Put("dog", 2)
	m.Put("cat", 9) // overwrite, not duplicate
	assert(m.Len() == 2, "size after overwrite")
	v, ok := m.Get("cat")
	assert(v == 9 && ok, "get returns the newest value")
	_, ok = m.Get("missing")
	assert(!ok, "missing key reports false")
	assert(m.Delete("dog") && !m.Delete("dog"), "delete is idempotent-reporting")
	assert(m.Len() == 1, "size after delete")

	// Resizing: force at least one growth and confirm nothing was lost.
	big := NewHashMap()
	for i := 0; i < 100; i++ {
		big.Put(fmt.Sprintf("key%d", i), i)
	}
	assert(big.Len() == 100, "all keys stored")
	assert(big.Capacity() > initialCapacity, "table grew")
	assert(big.LoadFactor() <= maxLoadFactor, "load factor stayed healthy")
	for i := 0; i < 100; i++ {
		v, ok := big.Get(fmt.Sprintf("key%d", i))
		assert(ok && v == i, "every key survived the rehash")
	}
	assert(big.LongestChain() <= 5, "collisions stay tame")
	assert(len(big.Keys()) == 100, "keys listing")

	assert(CharFrequency("aab")['a'] == 2, "frequency")
	assert(FirstUniqueChar("leetcode") == 0, "first unique")
	assert(FirstUniqueChar("aabb") == -1, "no unique char")
	assert(equalStrings(SortedKeys(map[string]int{"b": 1, "a": 2}), []string{"a", "b"}),
		"sorted keys are deterministic")

	i, j := TwoSum([]int{2, 7, 11, 15}, 9)
	assert(i == 0 && j == 1, "two sum")
	i, j = TwoSum([]int{3, 3}, 6)
	assert(i == 0 && j == 1, "two sum with duplicate values")
	i, _ = TwoSum([]int{1, 2}, 99)
	assert(i == -1, "two sum miss")
	assert(ContainsDuplicate([]int{1, 2, 3, 1}), "duplicate found")
	assert(!ContainsDuplicate([]int{1, 2, 3}), "no duplicate")

	groups := GroupAnagrams([]string{"eat", "tea", "tan", "ate", "nat", "bat"})
	sizes := make([]int, 0, len(groups))
	for _, g := range groups {
		sizes = append(sizes, len(g))
	}
	sort.Ints(sizes)
	assert(equal(sizes, []int{1, 2, 3}), "anagram group sizes")

	assert(SubarraySumEqualsK([]int{1, 1, 1}, 2) == 2, "subarray sum")
	assert(SubarraySumEqualsK([]int{1, 2, 3}, 3) == 2, "subarray sum 2")
	assert(SubarraySumEqualsK([]int{1, -1, 0}, 0) == 3, "negatives work")

	assert(LongestConsecutive([]int{100, 4, 200, 1, 3, 2}) == 4, "consecutive run")
	assert(LongestConsecutive(nil) == 0, "empty input")
	assert(equal(Intersection([]int{1, 2, 2, 1}, []int{2, 2}), []int{2}), "intersection")

	lru, err := NewLRUCache(2)
	assert(err == nil, "cache construction")
	lru.Put(1, 100)
	lru.Put(2, 200)
	assert(lru.Get(1) == 100, "hit")
	lru.Put(3, 300) // evicts key 2, the least recently used
	assert(lru.Get(2) == -1, "evicted")
	assert(equal(lru.KeysMostRecentFirst(), []int{3, 1}), "recency order")
	_, err = NewLRUCache(0)
	assert(err != nil, "zero capacity is an error")

	fmt.Println("10-Hashing (Go): all checks passed")
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
