// 09 - Sorting: every classic algorithm from scratch, each verified against
// sort.Ints on randomised input.
//
// Run:  go run sorting.go
package main

import (
	"fmt"
	"math/rand"
	"sort"
)

// One shared generator with a fixed seed keeps the random tests reproducible.
var rng = rand.New(rand.NewSource(42))

// clone keeps every sort non-destructive, so the tests can reuse inputs.
func clone(nums []int) []int {
	out := make([]int, len(nums))
	copy(out, nums)
	return out
}

// ============================================================================
// 1. Quadratic sorts
// ============================================================================

// BubbleSort repeatedly swaps adjacent out-of-order pairs.
// O(n^2), O(1) space, stable. The swapped flag makes it adaptive: an
// already-sorted slice costs a single O(n) pass.
func BubbleSort(nums []int) []int {
	a := clone(nums)
	for i := 0; i+1 < len(a); i++ {
		swapped := false
		for j := 0; j+1 < len(a)-i; j++ { // the tail is already final
			if a[j] > a[j+1] {
				a[j], a[j+1] = a[j+1], a[j]
				swapped = true
			}
		}
		if !swapped { // nothing moved: it is sorted
			break
		}
	}
	return a
}

// SelectionSort always does O(n^2) comparisons but only n-1 swaps - the fewest
// of any sort, which matters when writes are expensive.
// NOT stable: a long-distance swap can jump equal elements over each other.
func SelectionSort(nums []int) []int {
	a := clone(nums)
	for i := 0; i+1 < len(a); i++ {
		smallest := i
		for j := i + 1; j < len(a); j++ {
			if a[j] < a[smallest] {
				smallest = j
			}
		}
		a[i], a[smallest] = a[smallest], a[i]
	}
	return a
}

// InsertionSort inserts each element into the sorted prefix.
// O(n^2), O(n) best, stable - and the fallback every real sort uses for small
// ranges because its constant factor is tiny.
func InsertionSort(nums []int) []int {
	a := clone(nums)
	for i := 1; i < len(a); i++ {
		key := a[i]
		j := i - 1
		for j >= 0 && a[j] > key { // strict >: equal elements stay put
			a[j+1] = a[j] // shift right
			j--
		}
		a[j+1] = key
	}
	return a
}

// ============================================================================
// 2. Merge sort
// ============================================================================

// MergeSort is O(n log n) always, O(n) space, stable.
// T(n) = 2T(n/2) + O(n): log n levels, O(n) work per level.
func MergeSort(nums []int) []int {
	if len(nums) <= 1 {
		return clone(nums)
	}
	mid := len(nums) / 2
	return mergeSorted(MergeSort(nums[:mid]), MergeSort(nums[mid:]))
}

// mergeSorted merges two sorted slices. O(n+m). The <= is what makes the whole
// algorithm stable.
func mergeSorted(left, right []int) []int {
	out := make([]int, 0, len(left)+len(right))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] { // <= keeps equal elements in input order
			out = append(out, left[i])
			i++
		} else {
			out = append(out, right[j])
			j++
		}
	}
	out = append(out, left[i:]...)
	out = append(out, right[j:]...)
	return out
}

// ============================================================================
// 3. Quicksort
// ============================================================================

// QuickSort partitions around a pivot and recurses. O(n log n) average.
// The RANDOM pivot is what avoids the O(n^2) case on already-sorted input.
func QuickSort(nums []int) []int {
	a := clone(nums)
	quickSortRange(a, 0, len(a)-1)
	return a
}

func quickSortRange(a []int, lo, hi int) {
	// Recurse into the smaller side and loop on the larger one: that caps the
	// stack depth at O(log n) even with unbalanced partitions.
	for lo < hi {
		p := partition(a, lo, hi)
		if p-lo < hi-p {
			quickSortRange(a, lo, p-1)
			lo = p + 1
		} else {
			quickSortRange(a, p+1, hi)
			hi = p - 1
		}
	}
}

// partition is the Lomuto scheme with a random pivot. It returns the pivot's
// final index; everything left of it is smaller, everything right is >=.
func partition(a []int, lo, hi int) int {
	r := lo + rng.Intn(hi-lo+1)
	a[r], a[hi] = a[hi], a[r] // move the pivot out of the way
	pivot := a[hi]

	smaller := lo // boundary of the "< pivot" region
	for i := lo; i < hi; i++ {
		if a[i] < pivot {
			a[smaller], a[i] = a[i], a[smaller]
			smaller++
		}
	}
	a[smaller], a[hi] = a[hi], a[smaller] // pivot lands on the boundary
	return smaller
}

// ============================================================================
// 4. Heap sort
// ============================================================================

// HeapSort builds a max-heap, then repeatedly swaps the root to the end.
// O(n log n) worst case AND O(1) space - the only classic sort with both.
func HeapSort(nums []int) []int {
	a := clone(nums)
	n := len(a)
	for i := n/2 - 1; i >= 0; i-- { // build the heap bottom-up: O(n)
		siftDown(a, i, n)
	}
	for end := n - 1; end > 0; end-- {
		a[0], a[end] = a[end], a[0] // largest to its final position
		siftDown(a, 0, end)         // restore the heap on the prefix
	}
	return a
}

// siftDown pushes a[root] down until the max-heap property holds. O(log n).
func siftDown(a []int, root, size int) {
	for {
		largest := root
		left, right := 2*root+1, 2*root+2
		if left < size && a[left] > a[largest] {
			largest = left
		}
		if right < size && a[right] > a[largest] {
			largest = right
		}
		if largest == root {
			return
		}
		a[root], a[largest] = a[largest], a[root]
		root = largest
	}
}

// ============================================================================
// 5. Non-comparison sorts
// ============================================================================

// CountingSort is O(n + k) for non-negative integers with a small range k.
// It never compares two elements - values index directly into the count array,
// which is how it beats the O(n log n) comparison bound.
// The prefix-sum step is what makes it stable (and usable inside radix sort).
func CountingSort(nums []int) ([]int, error) {
	if len(nums) == 0 {
		return nil, nil
	}
	k := 0
	for _, x := range nums {
		if x < 0 {
			return nil, fmt.Errorf("counting sort needs non-negative integers, got %d", x)
		}
		k = max(k, x)
	}

	counts := make([]int, k+1)
	for _, x := range nums {
		counts[x]++
	}
	for i := 1; i <= k; i++ {
		counts[i] += counts[i-1] // prefix sums -> final positions
	}

	out := make([]int, len(nums))
	for i := len(nums) - 1; i >= 0; i-- { // reverse iteration keeps it stable
		counts[nums[i]]--
		out[counts[nums[i]]] = nums[i]
	}
	return out, nil
}

// RadixSort is LSD radix sort: a stable bucket pass per digit, least
// significant first. O(d * (n + 10)). Correct ONLY because each pass is stable.
func RadixSort(nums []int) ([]int, error) {
	if len(nums) == 0 {
		return nil, nil
	}
	largest := 0
	for _, x := range nums {
		if x < 0 {
			return nil, fmt.Errorf("radix sort handles non-negative integers only, got %d", x)
		}
		largest = max(largest, x)
	}

	a := clone(nums)
	for exp := 1; largest/exp > 0; exp *= 10 {
		buckets := make([][]int, 10)
		for _, x := range a {
			d := (x / exp) % 10
			buckets[d] = append(buckets[d], x)
		}
		a = a[:0]
		for _, bucket := range buckets { // concatenate in digit order
			a = append(a, bucket...)
		}
	}
	return a, nil
}

// ============================================================================
// 6. Quickselect
// ============================================================================

// QuickSelect returns the kth smallest element (k is 1-based).
// O(n) average: only ONE side is explored, so the total work is
// n + n/2 + n/4 + ... = 2n.
func QuickSelect(nums []int, k int) (int, error) {
	if k < 1 || k > len(nums) {
		return 0, fmt.Errorf("k=%d out of range [1,%d]", k, len(nums))
	}
	a := clone(nums)
	lo, hi, target := 0, len(a)-1, k-1
	for {
		if lo == hi {
			return a[lo], nil
		}
		p := partition(a, lo, hi)
		switch {
		case p == target:
			return a[p], nil
		case p < target:
			lo = p + 1
		default:
			hi = p - 1
		}
	}
}

// ============================================================================
// 7. Stability demonstration
// ============================================================================

type Person struct {
	Name  string
	Score int
}

// StableSortByScore is a merge sort on Score only: equal scores must keep
// their input order.
func StableSortByScore(people []Person) []Person {
	if len(people) <= 1 {
		return append([]Person(nil), people...)
	}
	mid := len(people) / 2
	left := StableSortByScore(people[:mid])
	right := StableSortByScore(people[mid:])

	out := make([]Person, 0, len(people))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i].Score <= right[j].Score { // <= : earlier element wins ties
			out = append(out, left[i])
			i++
		} else {
			out = append(out, right[j])
			j++
		}
	}
	out = append(out, left[i:]...)
	return append(out, right[j:]...)
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
	// Wrap the two error-returning sorts so every algorithm has one signature.
	algorithms := []struct {
		name string
		fn   func([]int) []int
	}{
		{"bubble", BubbleSort},
		{"selection", SelectionSort},
		{"insertion", InsertionSort},
		{"merge", MergeSort},
		{"quick", QuickSort},
		{"heap", HeapSort},
		{"counting", func(n []int) []int { out, _ := CountingSort(n); return out }},
		{"radix", func(n []int) []int { out, _ := RadixSort(n); return out }},
	}

	// Hand-picked edge cases every sort must survive.
	edgeCases := [][]int{
		{},
		{1},
		{2, 1},
		{1, 1, 1, 1},                      // all equal
		{5, 4, 3, 2, 1},                   // reverse sorted (quicksort's trap)
		{1, 2, 3, 4, 5},                   // already sorted
		{3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5}, // duplicates
		{0, 0, 10, 7, 0},                  // zeros
	}
	for _, algo := range algorithms {
		for _, original := range edgeCases {
			input := clone(original)
			expected := clone(original)
			sort.Ints(expected)
			got := algo.fn(input)
			if len(expected) == 0 {
				assert(len(got) == 0, algo.name+" on empty input")
			} else {
				assert(equal(got, expected), algo.name+" failed an edge case")
			}
			assert(equal(input, original), algo.name+" mutated its input")
		}
	}

	// 200 randomised slices against sort.Ints.
	for trial := 0; trial < 200; trial++ {
		data := make([]int, rng.Intn(61))
		for i := range data {
			data[i] = rng.Intn(501)
		}
		expected := clone(data)
		sort.Ints(expected)
		for _, algo := range algorithms {
			got := algo.fn(data)
			if len(expected) == 0 {
				assert(len(got) == 0, algo.name+" on empty input")
			} else {
				assert(equal(got, expected), algo.name+" disagreed with sort.Ints")
			}
		}
	}

	// Negatives: comparison sorts cope, counting/radix must report an error.
	negatives := []int{3, -1, 4, -1, 5}
	expectedNeg := clone(negatives)
	sort.Ints(expectedNeg)
	for _, algo := range algorithms[:6] { // the six comparison sorts
		assert(equal(algo.fn(negatives), expectedNeg), algo.name+" with negatives")
	}
	_, err := CountingSort(negatives)
	assert(err != nil, "counting sort must reject negatives")
	_, err = RadixSort(negatives)
	assert(err != nil, "radix sort must reject negatives")

	// Stability: equal scores keep their input order.
	people := []Person{{"amy", 2}, {"bob", 1}, {"cat", 2}, {"dan", 1}}
	stable := StableSortByScore(people)
	assert(stable[0].Name == "bob" && stable[1].Name == "dan" &&
		stable[2].Name == "amy" && stable[3].Name == "cat", "stability")

	// sort.SliceStable must agree; sort.Slice gives no such guarantee.
	viaStdlib := append([]Person(nil), people...)
	sort.SliceStable(viaStdlib, func(i, j int) bool {
		return viaStdlib[i].Score < viaStdlib[j].Score
	})
	for i := range stable {
		assert(stable[i] == viaStdlib[i], "matches sort.SliceStable")
	}

	// Quickselect against the sorted reference.
	data := []int{7, 10, 4, 3, 20, 15}
	sorted := clone(data)
	sort.Ints(sorted)
	for k := 1; k <= len(data); k++ {
		v, err := QuickSelect(data, k)
		assert(err == nil && v == sorted[k-1], "quickselect")
	}
	_, err = QuickSelect(data, 99)
	assert(err != nil, "k out of range is an error")

	fmt.Println("09-Sorting (Go): all checks passed")
	fmt.Printf("  %d algorithms x %d edge cases + 200 random slices verified against sort.Ints\n",
		len(algorithms), len(edgeCases))
}
