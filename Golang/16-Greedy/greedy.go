// 16 - Greedy: the classic greedy algorithms, the sort key that makes each one
// work, and a runnable demonstration of where greedy breaks.
//
// Run:  go run greedy.go
package main

import (
	"container/heap"
	"fmt"
	"math"
	"sort"
)

// Interval is [start, end].
type Interval [2]int

// ============================================================================
// 1. Sort by END time - activity selection
// ============================================================================

// ActivitySelection returns the largest set of non-overlapping activities.
// O(n log n).
//
// Sort by END time: finishing as early as possible leaves the most room for
// what follows. The exchange argument proves it - swapping any later-ending
// choice for the earliest-ending one never loses an activity. Sorting by start
// time or by duration both fail.
func ActivitySelection(intervals []Interval) []Interval {
	ordered := append([]Interval(nil), intervals...)
	sort.Slice(ordered, func(i, j int) bool { return ordered[i][1] < ordered[j][1] })

	var chosen []Interval
	lastEnd := math.MinInt
	for _, iv := range ordered {
		if iv[0] >= lastEnd {
			chosen = append(chosen, iv)
			lastEnd = iv[1]
		}
	}
	return chosen
}

// EraseOverlapIntervals is the complement: keep as many as possible, remove
// the rest.
func EraseOverlapIntervals(intervals []Interval) int {
	return len(intervals) - len(ActivitySelection(intervals))
}

// ============================================================================
// 2. Sort by START time - merging
// ============================================================================

// MergeIntervals merges all overlapping intervals. O(n log n).
// Sorting by START is what makes overlapping intervals adjacent, so one sweep
// is enough.
func MergeIntervals(intervals []Interval) []Interval {
	if len(intervals) == 0 {
		return nil
	}
	ordered := append([]Interval(nil), intervals...)
	sort.Slice(ordered, func(i, j int) bool {
		if ordered[i][0] != ordered[j][0] {
			return ordered[i][0] < ordered[j][0]
		}
		return ordered[i][1] < ordered[j][1]
	})

	merged := []Interval{ordered[0]}
	for _, iv := range ordered[1:] {
		last := &merged[len(merged)-1]
		if iv[0] <= last[1] { // overlap: extend
			last[1] = max(last[1], iv[1])
		} else {
			merged = append(merged, iv)
		}
	}
	return merged
}

// MinPlatforms returns the fewest platforms so no train waits. O(n log n).
// Sort arrivals and departures INDEPENDENTLY: which train is which does not
// matter, only how many are present at once.
func MinPlatforms(arrivals, departures []int) int {
	if len(arrivals) == 0 {
		return 0
	}
	inbound := append([]int(nil), arrivals...)
	outbound := append([]int(nil), departures...)
	sort.Ints(inbound)
	sort.Ints(outbound)

	platforms, best, i, j := 0, 0, 0, 0
	for i < len(inbound) {
		if inbound[i] <= outbound[j] { // an arrival comes first
			platforms++
			best = max(best, platforms)
			i++
		} else { // a departure comes first
			platforms--
			j++
		}
	}
	return best
}

// ============================================================================
// 3. Sort by RATIO - fractional knapsack
// ============================================================================

// FractionalKnapsack returns the maximum value when items can be split.
//
// Greedy works HERE but not for 0/1 knapsack: fractions let you fill the
// capacity exactly, so best-value-per-weight-first can never be beaten.
// Without fractions a high-ratio item can waste space and greedy breaks -
// which is exactly why chapter 15 needs a DP table.
func FractionalKnapsack(weights, values []int, capacity float64) float64 {
	type item struct{ weight, value int }
	items := make([]item, len(weights))
	for i := range weights {
		items[i] = item{weight: weights[i], value: values[i]}
	}
	sort.Slice(items, func(i, j int) bool {
		return float64(items[i].value)/float64(items[i].weight) >
			float64(items[j].value)/float64(items[j].weight)
	})

	total := 0.0
	for _, it := range items {
		if capacity <= 0 {
			break
		}
		take := math.Min(float64(it.weight), capacity) // whole item, or a slice
		total += float64(it.value) * (take / float64(it.weight))
		capacity -= take
	}
	return total
}

// ============================================================================
// 4. Running frontier - one pass, no sorting
// ============================================================================

// CanJump reports whether the last index is reachable. O(n) / O(1).
// Track only the furthest reachable index; standing beyond it means the gap is
// unbridgeable.
func CanJump(nums []int) bool {
	furthest := 0
	for i, jump := range nums {
		if i > furthest {
			return false // stranded
		}
		furthest = max(furthest, i+jump)
	}
	return true
}

// MinJumps returns the fewest jumps to the last index. O(n) / O(1).
// A BFS over the array without a queue: currentEnd marks the end of the
// current level, and reaching it means one more jump was needed.
func MinJumps(nums []int) int {
	if len(nums) <= 1 {
		return 0
	}
	jumps, currentEnd, furthest := 0, 0, 0
	for i := 0; i < len(nums)-1; i++ {
		furthest = max(furthest, i+nums[i])
		if i == currentEnd { // the level is exhausted
			jumps++
			currentEnd = furthest
			if currentEnd >= len(nums)-1 {
				break
			}
		}
	}
	return jumps
}

// GasStation returns a starting station for a full circuit, or -1.
//
// Two facts make one pass enough:
//  1. total gas < total cost means no answer exists;
//  2. if the tank goes negative at station i, no station between the current
//     start and i can work either - so restart at i+1.
func GasStation(gas, cost []int) int {
	totalGas, totalCost := 0, 0
	for i := range gas {
		totalGas += gas[i]
		totalCost += cost[i]
	}
	if totalGas < totalCost {
		return -1
	}

	start, tank := 0, 0
	for i := range gas {
		tank += gas[i] - cost[i]
		if tank < 0 {
			start = i + 1 // everything before i fails too
			tank = 0
		}
	}
	return start
}

// ============================================================================
// 5. Always take the extreme - Huffman coding
// ============================================================================

type huffNode struct {
	weight      int
	tag         byte // smallest symbol below: makes ties deterministic
	symbol      byte
	isLeaf      bool
	left, right *huffNode
}

type huffHeap []*huffNode

func (h huffHeap) Len() int { return len(h) }
func (h huffHeap) Less(i, j int) bool {
	if h[i].weight != h[j].weight {
		return h[i].weight < h[j].weight
	}
	return h[i].tag < h[j].tag
}
func (h huffHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h *huffHeap) Push(x any)   { *h = append(*h, x.(*huffNode)) }
func (h *huffHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// HuffmanCodes builds optimal prefix-free codes. O(n log n).
// Repeatedly merge the two LEAST frequent nodes: rare symbols end up deepest
// in the tree and get the longest codes. Provably optimal (Huffman, 1952).
func HuffmanCodes(frequencies map[byte]int) map[byte]string {
	codes := make(map[byte]string)
	if len(frequencies) == 0 {
		return codes
	}
	if len(frequencies) == 1 {
		for symbol := range frequencies {
			codes[symbol] = "0" // one symbol still needs a bit
		}
		return codes
	}

	h := &huffHeap{}
	for symbol, weight := range frequencies {
		*h = append(*h, &huffNode{weight: weight, tag: symbol, symbol: symbol, isLeaf: true})
	}
	heap.Init(h)

	for h.Len() > 1 {
		left := heap.Pop(h).(*huffNode)
		right := heap.Pop(h).(*huffNode)
		merged := &huffNode{
			weight: left.weight + right.weight,
			tag:    min(left.tag, right.tag),
			left:   left,
			right:  right,
		}
		heap.Push(h, merged)
	}

	var assign func(node *huffNode, prefix string)
	assign = func(node *huffNode, prefix string) {
		if node.isLeaf {
			codes[node.symbol] = prefix
			return
		}
		assign(node.left, prefix+"0")
		assign(node.right, prefix+"1")
	}
	assign(heap.Pop(h).(*huffNode), "")
	return codes
}

// ConnectSticks returns the minimum total cost to merge all sticks.
// Always merge the two cheapest: every merge cost is paid again by every later
// merge containing it, so the smallest values must be merged earliest.
func ConnectSticks(lengths []int) int {
	if len(lengths) <= 1 {
		return 0
	}
	h := &IntHeap{}
	*h = append(*h, lengths...)
	heap.Init(h)

	total := 0
	for h.Len() > 1 {
		cost := heap.Pop(h).(int) + heap.Pop(h).(int)
		total += cost
		heap.Push(h, cost)
	}
	return total
}

// IntHeap is a min-heap of ints (see chapter 13).
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// ============================================================================
// 6. Where greedy BREAKS
// ============================================================================

// CoinChangeGreedy takes the largest coin that fits, repeatedly.
// Correct for canonical systems such as {1,5,10,25}; WRONG in general - the
// demo proves it with {1,3,4} and 6. Returns -1 when it cannot make the amount.
func CoinChangeGreedy(coins []int, amount int) int {
	ordered := append([]int(nil), coins...)
	sort.Sort(sort.Reverse(sort.IntSlice(ordered)))

	used := 0
	for _, coin := range ordered {
		used += amount / coin
		amount %= coin
	}
	if amount != 0 {
		return -1
	}
	return used
}

// CoinChangeDp is the correct answer for any coin system. O(coins * amount).
func CoinChangeDp(coins []int, amount int) int {
	const inf = math.MaxInt / 2
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = inf
	}
	for _, coin := range coins {
		for value := coin; value <= amount; value++ {
			dp[value] = min(dp[value], dp[value-coin]+1)
		}
	}
	if dp[amount] >= inf {
		return -1
	}
	return dp[amount]
}

// ============================================================================
// demo
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func equalIntervals(a, b []Interval) bool {
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
	activities := []Interval{{1, 4}, {3, 5}, {0, 6}, {5, 7},
		{3, 9}, {5, 9}, {6, 10}, {8, 11}}
	chosen := ActivitySelection(activities)
	assert(equalIntervals(chosen, []Interval{{1, 4}, {5, 7}, {8, 11}}), "activity selection")
	for i := 0; i+1 < len(chosen); i++ {
		assert(chosen[i][1] <= chosen[i+1][0], "chosen activities are disjoint")
	}
	assert(ActivitySelection(nil) == nil, "no activities")

	// Sorting by START instead of END gives a worse answer - the sort key IS
	// the algorithm. Earliest-start takes {0,6} and blocks {1,4} and {5,7}.
	byStart := append([]Interval(nil), activities...)
	sort.Slice(byStart, func(i, j int) bool { return byStart[i][0] < byStart[j][0] })
	var naive []Interval
	lastEnd := math.MinInt
	for _, iv := range byStart {
		if iv[0] >= lastEnd {
			naive = append(naive, iv)
			lastEnd = iv[1]
		}
	}
	assert(len(naive) < len(chosen), "sorting by start is strictly worse")

	assert(EraseOverlapIntervals([]Interval{{1, 2}, {2, 3}, {3, 4}, {1, 3}}) == 1,
		"one removal needed")
	assert(EraseOverlapIntervals(nil) == 0, "nothing to remove")

	assert(equalIntervals(
		MergeIntervals([]Interval{{1, 3}, {2, 6}, {8, 10}, {15, 18}}),
		[]Interval{{1, 6}, {8, 10}, {15, 18}}), "merge intervals")
	assert(equalIntervals(MergeIntervals([]Interval{{1, 4}, {4, 5}}),
		[]Interval{{1, 5}}), "touching intervals merge")
	assert(MergeIntervals(nil) == nil, "merge nothing")

	assert(MinPlatforms([]int{900, 940, 950, 1100, 1500, 1800},
		[]int{910, 1200, 1120, 1130, 1900, 2000}) == 3, "min platforms")
	assert(MinPlatforms([]int{100}, []int{200}) == 1, "one train")
	assert(MinPlatforms(nil, nil) == 0, "no trains")

	total := FractionalKnapsack([]int{10, 20, 30}, []int{60, 100, 120}, 50)
	assert(math.Abs(total-240) < 1e-9, "fractional knapsack")
	assert(FractionalKnapsack([]int{10}, []int{60}, 5) == 30, "half an item")

	assert(CanJump([]int{2, 3, 1, 1, 4}), "reachable")
	assert(!CanJump([]int{3, 2, 1, 0, 4}), "the 0 at index 3 strands you")
	assert(CanJump([]int{0}), "already at the end")

	assert(MinJumps([]int{2, 3, 1, 1, 4}) == 2, "two jumps")
	assert(MinJumps([]int{2, 3, 0, 1, 4}) == 2, "two jumps again")
	assert(MinJumps([]int{0}) == 0, "no jump needed")

	assert(GasStation([]int{1, 2, 3, 4, 5}, []int{3, 4, 5, 1, 2}) == 3, "gas station")
	assert(GasStation([]int{2, 3, 4}, []int{3, 4, 3}) == -1, "not enough gas")
	assert(GasStation([]int{5}, []int{4}) == 0, "single station")

	codes := HuffmanCodes(map[byte]int{'a': 45, 'b': 13, 'c': 12, 'd': 16, 'e': 9, 'f': 5})
	assert(len(codes) == 6, "one code per symbol")
	// Prefix-free: no code is a prefix of another. That is what makes the
	// encoding decodable without separators.
	for s1, c1 := range codes {
		for s2, c2 := range codes {
			if s1 != s2 {
				assert(len(c2) < len(c1) || c2[:len(c1)] != c1, "prefix-free")
			}
		}
	}
	for _, code := range codes { // most frequent gets one of the shortest codes
		assert(len(codes['a']) <= len(code), "frequent symbols get short codes")
	}
	assert(len(codes['a']) < len(codes['f']), "rare symbols get long codes")
	assert(HuffmanCodes(map[byte]int{'z': 1})['z'] == "0", "single symbol")
	assert(len(HuffmanCodes(nil)) == 0, "no symbols")

	assert(ConnectSticks([]int{2, 4, 3}) == 14, "(2+3)=5 then (5+4)=9")
	assert(ConnectSticks([]int{1, 8, 3, 5}) == 30, "connect sticks")
	assert(ConnectSticks([]int{5}) == 0, "nothing to merge")

	// Greedy is optimal on a canonical coin system ...
	assert(CoinChangeGreedy([]int{1, 5, 10, 25}, 63) == 6, "greedy on US coins")
	assert(CoinChangeDp([]int{1, 5, 10, 25}, 63) == 6, "dp agrees")
	// ... and WRONG on this one. This is the whole reason DP exists.
	assert(CoinChangeGreedy([]int{1, 3, 4}, 6) == 3, "greedy: 4 + 1 + 1")
	assert(CoinChangeDp([]int{1, 3, 4}, 6) == 2, "dp: 3 + 3")
	assert(CoinChangeGreedy([]int{1, 3, 4}, 6) > CoinChangeDp([]int{1, 3, 4}, 6),
		"greedy is strictly worse here")
	assert(CoinChangeGreedy([]int{5}, 3) == -1, "impossible amount")
	assert(CoinChangeDp([]int{5}, 3) == -1, "dp agrees it is impossible")

	fmt.Println("16-Greedy (Go): all checks passed")
}
