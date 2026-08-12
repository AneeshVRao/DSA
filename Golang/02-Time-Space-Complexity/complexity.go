// 02 - Time and Space Complexity: measured, not memorised.
//
// Each function returns its answer plus an operation count, so the growth
// curves are exact and machine independent.
//
// Run:  go run complexity.go
package main

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
	"strings"
	"time"
)

// ------------------------------------------------------------------- O(1) --
func constantFirst(nums []int) (int, int) {
	return nums[0], 1 // indexing ignores len(nums)
}

// --------------------------------------------------------------- O(log n) --
func binarySearch(sorted []int, target int) (idx, ops int) {
	lo, hi := 0, len(sorted)-1
	for lo <= hi {
		ops++
		mid := lo + (hi-lo)/2 // avoids overflow on huge indices
		switch {
		case sorted[mid] == target:
			return mid, ops
		case sorted[mid] < target:
			lo = mid + 1
		default:
			hi = mid - 1
		}
	}
	return -1, ops
}

// ------------------------------------------------------------------- O(n) --
func linearSum(nums []int) (total, ops int) {
	for _, x := range nums {
		total += x
		ops++
	}
	return total, ops
}

// ----------------------------------------------------------------- O(n^2) --
// Compare every pair. Correct, and unusable past a few thousand items.
func hasDuplicateQuadratic(nums []int) (bool, int) {
	ops := 0
	for i := 0; i < len(nums); i++ {
		for j := i + 1; j < len(nums); j++ {
			ops++
			if nums[i] == nums[j] {
				return true, ops
			}
		}
	}
	return false, ops
}

// Same answer in O(n) time and O(n) space - spend memory to buy time.
func hasDuplicateLinear(nums []int) (bool, int) {
	seen := make(map[int]struct{}, len(nums)) // pre-sized: fewer rehashes
	ops := 0
	for _, x := range nums {
		ops++
		if _, dup := seen[x]; dup {
			return true, ops
		}
		seen[x] = struct{}{}
	}
	return false, ops
}

// ------------------------------------------------------- O(2^n) vs O(n) ----

// Naive recursion recomputes subproblems. Total calls = 2*F(n+1) - 1.
func fibExponential(n int, calls *int) int {
	*calls++
	if n < 2 {
		return n
	}
	return fibExponential(n-1, calls) + fibExponential(n-2, calls)
}

// Bottom-up: each state computed once. O(n) time, O(1) space.
func fibLinear(n int) (val, ops int) {
	if n < 2 {
		return n, 1
	}
	prev, curr := 0, 1
	for i := 1; i < n; i++ {
		prev, curr = curr, prev+curr
		ops++
	}
	return curr, ops
}

// ------------------------------------------------------ allocation costs ---

// withoutReserve lets append grow the backing array on demand: about log2(n)
// reallocations, each copying everything built so far.
func withoutReserve(n int) (result []int, reallocations int) {
	out := []int{}
	lastCap := cap(out)
	for i := 0; i < n; i++ {
		out = append(out, i)
		if cap(out) != lastCap {
			reallocations++
			lastCap = cap(out)
		}
	}
	return out, reallocations
}

// withReserve pre-sizes the slice: one allocation, zero copies.
func withReserve(n int) (result []int, reallocations int) {
	out := make([]int, 0, n)
	lastCap := cap(out)
	for i := 0; i < n; i++ {
		out = append(out, i)
		if cap(out) != lastCap {
			reallocations++
			lastCap = cap(out)
		}
	}
	return out, reallocations
}

// ---------------------------------------------------------------- strings --

// concatQuadratic builds a string with +=. Strings are immutable, so every
// step allocates a new one and copies: O(n^2) bytes moved.
func concatQuadratic(parts []string) string {
	out := ""
	for _, p := range parts {
		out += p
	}
	return out
}

// concatLinear uses a growable buffer: O(n) total.
func concatLinear(parts []string) string {
	var sb strings.Builder
	for _, p := range parts {
		sb.WriteString(p)
	}
	return sb.String()
}

// ------------------------------------------------------------------ space --

// O(n) time and O(n) stack space - every pending frame is memory.
func sumRecursive(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	return nums[0] + sumRecursive(nums[1:])
}

// O(n) time, O(1) space.
func sumIterative(nums []int) int {
	total := 0
	for _, x := range nums {
		total += x
	}
	return total
}

// ------------------------------------------------------------ measurement --

func iotaSlice(n int) []int {
	s := make([]int, n)
	for i := range s {
		s[i] = i
	}
	return s
}

func growthTable() {
	fmt.Printf("\n%7s | %10s | %12s | %13s\n", "n", "O(n) ops", "O(n^2) ops", "O(log n) ops")
	fmt.Println(strings.Repeat("-", 50))
	for _, n := range []int{100, 200, 400, 800} {
		nums := iotaSlice(n) // all distinct: worst case for the dup check
		_, lin := linearSum(nums)
		_, quad := hasDuplicateQuadratic(nums)
		_, lg := binarySearch(nums, n-1)
		fmt.Printf("%7d | %10d | %12d | %13d\n", n, lin, quad, lg)
	}
}

func wallClockDemo() {
	parts := make([]string, 20000)
	for i := range parts {
		parts[i] = "x"
	}

	t0 := time.Now()
	a := concatQuadratic(parts)
	t1 := time.Now()
	b := concatLinear(parts)
	t2 := time.Now()

	assert(a == b, "both concatenations agree")
	fmt.Printf("\n+= concat       : %8.2f ms   O(n^2)\n", float64(t1.Sub(t0).Microseconds())/1000)
	fmt.Printf("strings.Builder : %8.2f ms   O(n)\n", float64(t2.Sub(t1).Microseconds())/1000)
}

// ------------------------------------------------------------------- demo --

// ============================================================================
// Empirical analysis - does the theory actually hold?
// ============================================================================

// MergeSortCounted sorts and reports its comparison count. O(n log n).
//
// The count is what makes this checkable. Wall-clock time depends on the
// machine, the Go version and whatever else is running; a COMPARISON COUNT is
// deterministic, so the theory can be asserted rather than eyeballed.
//
// Works on INDEX RANGES with one shared scratch buffer rather than building
// sub-slices: it allocates once instead of O(n log n) times, and keeps the hot
// loop reading straight down contiguous memory.
func MergeSortCounted(nums []int) ([]int, int) {
	out := append([]int(nil), nums...)
	scratch := make([]int, len(out))
	return out, mergeSortRange(out, scratch, 0, len(out))
}

func mergeSortRange(nums, scratch []int, lo, hi int) int {
	if hi-lo <= 1 {
		return 0
	}

	mid := lo + (hi-lo)/2
	comparisons := mergeSortRange(nums, scratch, lo, mid) +
		mergeSortRange(nums, scratch, mid, hi)

	i, j, k := lo, mid, lo
	for i < mid && j < hi {
		comparisons++
		if nums[i] <= nums[j] {
			scratch[k] = nums[i]
			i++
		} else {
			scratch[k] = nums[j]
			j++
		}
		k++
	}
	for i < mid {
		scratch[k] = nums[i]
		i, k = i+1, k+1
	}
	for j < hi {
		scratch[k] = nums[j]
		j, k = j+1, k+1
	}
	copy(nums[lo:hi], scratch[lo:hi])

	return comparisons
}

// InsertionSortCounted sorts and reports its comparison count.
//
// O(n^2) on reversed input, but O(n) on already-sorted input - the adaptive
// best case that makes it the base case inside every real hybrid sort.
func InsertionSortCounted(nums []int) ([]int, int) {
	out := append([]int(nil), nums...)
	comparisons := 0
	for i := 1; i < len(out); i++ {
		value := out[i]
		j := i - 1
		for j >= 0 {
			comparisons++
			if out[j] <= value {
				break
			}
			out[j+1] = out[j]
			j--
		}
		out[j+1] = value
	}
	return out, comparisons
}

// MeasureMs returns the best-of-N wall-clock milliseconds.
//
// MINIMUM, not mean. Timing noise is one-sided - a GC pause or a scheduler
// interrupt can only make a run slower, never faster - so the minimum is the
// closest estimate of the true cost. Averaging just folds the noise in.
func MeasureMs(fn func(), repeats int) float64 {
	best := math.Inf(1)
	for r := 0; r < repeats; r++ {
		start := time.Now()
		fn()
		elapsed := float64(time.Since(start).Nanoseconds()) / 1e6
		best = math.Min(best, elapsed)
	}
	return best
}

// GrowthRatios returns the ratio between consecutive measurements - the shape
// of the curve.
//
// Doubling n and watching the ratio identifies a complexity class from data
// alone:
//
//	O(1)        ratio -> 1
//	O(log n)    ratio -> 1   (grows by a constant, not a factor)
//	O(n)        ratio -> 2
//	O(n log n)  ratio -> slightly above 2, creeping up
//	O(n^2)      ratio -> 4
//
// The empirical counterpart to reading the exponent off a formula.
func GrowthRatios(counts []int) []float64 {
	ratios := make([]float64, 0, len(counts)-1)
	for i := 0; i+1 < len(counts); i++ {
		ratios = append(ratios, float64(counts[i+1])/float64(counts[i]))
	}
	return ratios
}

// BenchmarkTable measures the two classes side by side and prints the growth.
func BenchmarkTable() {
	sizes := []int{250, 500, 1000, 2000}
	var mergeCounts, insertionCounts []int

	fmt.Printf("\n%6s | %10s | %11s | %9s | %10s\n",
		"n", "merge ops", "insert ops", "merge ms", "insert ms")
	fmt.Println(strings.Repeat("-", 60))

	for _, n := range sizes {
		reversed := make([]int, n)
		for i := range reversed {
			reversed[i] = n - i
		}

		_, mergeOps := MergeSortCounted(reversed)
		_, insertionOps := InsertionSortCounted(reversed)
		mergeMs := MeasureMs(func() { MergeSortCounted(reversed) }, 3)
		insertionMs := MeasureMs(func() { InsertionSortCounted(reversed) }, 3)

		mergeCounts = append(mergeCounts, mergeOps)
		insertionCounts = append(insertionCounts, insertionOps)
		fmt.Printf("%6d | %10d | %11d | %9.2f | %10.2f\n",
			n, mergeOps, insertionOps, mergeMs, insertionMs)
	}

	fmt.Print("\n  merge ops     grow x")
	for _, r := range GrowthRatios(mergeCounts) {
		fmt.Printf("%.2f ", r)
	}
	fmt.Print(" -> just over 2: O(n log n)\n  insertion ops grow x")
	for _, r := range GrowthRatios(insertionCounts) {
		fmt.Printf("%.2f ", r)
	}
	fmt.Println(" -> 4: O(n^2)")
}

// equal compares two int slices element by element.
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

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func main() {
	_, ops := constantFirst([]int{9, 8, 7})
	assert(ops == 1, "O(1) indexing")

	idx, logOps := binarySearch(iotaSlice(1024), 999)
	assert(idx == 999 && logOps <= 11, "log2(1024) = 10 steps") // never 1024

	total, _ := linearSum([]int{1, 2, 3})
	assert(total == 6, "linearSum")

	distinct := iotaSlice(200)
	dupQ, opsQ := hasDuplicateQuadratic(distinct)
	dupL, opsL := hasDuplicateLinear(distinct)
	assert(!dupQ && !dupL, "no duplicates in 0..199")
	assert(opsQ == 200*199/2, "every pair compared")
	assert(opsL == 200, "one pass")
	assert(opsQ > 90*opsL, "the gap is the whole lesson")

	// Doubling n roughly quadruples the work of an O(n^2) algorithm.
	_, ops100 := hasDuplicateQuadratic(iotaSlice(100))
	_, ops200 := hasDuplicateQuadratic(iotaSlice(200))
	ratio := float64(ops200) / float64(ops100)
	assert(ratio > 3.8 && ratio < 4.2, "quadratic growth confirmed")

	calls := 0
	assert(fibExponential(20, &calls) == 6765, "fibExponential value")
	assert(calls == 21891, "2*F(21)-1 calls")
	val, steps := fibLinear(20)
	assert(val == 6765 && steps == 19, "linear, and not close")

	_, reallocs := withoutReserve(1000)
	_, none := withReserve(1000)
	assert(reallocs > 0, "append grows the backing array")
	assert(none == 0, "make(..., 0, n) pre-allocates once")

	assert(concatQuadratic([]string{"a", "b"}) == concatLinear([]string{"a", "b"}), "concat agree")
	assert(sumRecursive([]int{1, 2, 3}) == sumIterative([]int{1, 2, 3}), "sum agree")
	// --- Empirical analysis --------------------------------------------------
	// Sorting is correct in both cases - the point is what it COSTS.
	benchRng := rand.New(rand.NewSource(2))
	for trial := 0; trial < 30; trial++ {
		data := make([]int, benchRng.Intn(41))
		for i := range data {
			data[i] = benchRng.Intn(101) - 50
		}
		expected := append([]int(nil), data...)
		sort.Ints(expected)

		got, _ := MergeSortCounted(data)
		assert(equal(got, expected), "merge sort is correct")
		got, _ = InsertionSortCounted(data)
		assert(equal(got, expected), "insertion sort is correct")
	}

	// The counts are deterministic, so the theory is ASSERTABLE - unlike the
	// wall-clock numbers, which depend on the machine.
	benchSizes := []int{250, 500, 1000, 2000}
	var mergeCounts, insertionCounts []int
	for _, n := range benchSizes {
		reversed := make([]int, n)
		for i := range reversed {
			reversed[i] = n - i
		}
		_, mergeOps := MergeSortCounted(reversed)
		_, insertionOps := InsertionSortCounted(reversed)
		mergeCounts = append(mergeCounts, mergeOps)
		insertionCounts = append(insertionCounts, insertionOps)
	}

	// Insertion sort on reversed input is exactly the worst case: every one of
	// the i previous elements is compared, so the total is n(n-1)/2 precisely.
	for k, n := range benchSizes {
		assert(insertionCounts[k] == n*(n-1)/2, "insertion sort hits n(n-1)/2")
	}

	// Merge sort's comparison count sits in the tight n log n window.
	for k, n := range benchSizes {
		size := float64(n)
		assert(float64(mergeCounts[k]) <= size*math.Ceil(math.Log2(size)),
			"merge sort is at most n*ceil(log2 n)")
		assert(float64(mergeCounts[k]) >= size*math.Log2(size)/2,
			"merge sort is at least half of n log n")
	}

	// The growth ratios ARE the complexity class, read off the data.
	for _, ratio := range GrowthRatios(insertionCounts) {
		assert(ratio > 3.9 && ratio < 4.1, "quadratic: 4x per doubling")
	}
	for _, ratio := range GrowthRatios(mergeCounts) {
		assert(ratio > 2.0 && ratio < 2.5, "n log n: just over 2x per doubling")
	}

	// Quadratic must eventually lose, by a widening margin. This compares
	// OPERATION COUNTS, so it is a fact about the algorithms, not the CPU.
	last := len(benchSizes) - 1
	assert(float64(insertionCounts[0])/float64(mergeCounts[0]) <
		float64(insertionCounts[last])/float64(mergeCounts[last]),
		"the gap widens with n")
	assert(insertionCounts[last] > 100*mergeCounts[last], "and it is enormous")

	// The ADAPTIVE best case: already-sorted input is O(n).
	ascending := make([]int, 2000)
	for i := range ascending {
		ascending[i] = i
	}
	_, sortedOps := InsertionSortCounted(ascending)
	assert(sortedOps == 1999, "sorted input costs one comparison per element")

	fmt.Println("02-Time-Space-Complexity (Go): all checks passed")

	growthTable()
	wallClockDemo()
	BenchmarkTable()
}
