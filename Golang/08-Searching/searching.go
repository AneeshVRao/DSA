// 08 - Searching: binary search and every variant that actually shows up -
// boundaries, rotated arrays, matrices, and binary search on the answer.
//
// Run:  go run searching.go
package main

import (
	"fmt"
	"sort"
)

// ============================================================================
// 1. Linear search
// ============================================================================

// LinearSearch is O(n) and works on unsorted data.
func LinearSearch(nums []int, target int) int {
	for i, x := range nums {
		if x == target {
			return i
		}
	}
	return -1
}

// ============================================================================
// 2. Binary search
// ============================================================================

// BinarySearch returns the index of target in a SORTED slice, or -1.
// O(log n) time, O(1) space.
//
// Inclusive bounds [lo, hi] pair with `<=` and `mid +/- 1`. Mixing that with
// the half-open convention is what causes infinite loops.
func BinarySearch(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		mid := lo + (hi-lo)/2 // overflow-proof habit
		switch {
		case nums[mid] == target:
			return mid
		case nums[mid] < target:
			lo = mid + 1
		default:
			hi = mid - 1
		}
	}
	return -1
}

// BinarySearchRecursive uses index bounds rather than sub-slices. Sub-slicing
// is O(1) in Go, but indices keep the intent (and the code) obvious.
func BinarySearchRecursive(nums []int, target, lo, hi int) int {
	if lo > hi {
		return -1
	}
	mid := lo + (hi-lo)/2
	switch {
	case nums[mid] == target:
		return mid
	case nums[mid] < target:
		return BinarySearchRecursive(nums, target, mid+1, hi)
	default:
		return BinarySearchRecursive(nums, target, lo, mid-1)
	}
}

// ============================================================================
// 3. Boundary variants
// ============================================================================

// LowerBound returns the first index with nums[i] >= target (insertion point).
// Half-open bounds [lo, hi): loop on `<`, and hi = mid, never mid-1.
// It never returns early - it squeezes until the boundary is exact.
func LowerBound(nums []int, target int) int {
	lo, hi := 0, len(nums)
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] < target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

// UpperBound returns the first index with nums[i] > target.
func UpperBound(nums []int, target int) int {
	lo, hi := 0, len(nums)
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] <= target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

func FirstOccurrence(nums []int, target int) int {
	i := LowerBound(nums, target)
	if i < len(nums) && nums[i] == target {
		return i
	}
	return -1
}

func LastOccurrence(nums []int, target int) int {
	i := UpperBound(nums, target) - 1
	if i >= 0 && nums[i] == target {
		return i
	}
	return -1
}

// CountOccurrences is O(log n) rather than an O(n) count.
func CountOccurrences(nums []int, target int) int {
	return UpperBound(nums, target) - LowerBound(nums, target)
}

// ============================================================================
// 4. Rotated arrays
// ============================================================================

// SearchRotated searches a sorted slice rotated at an unknown pivot. O(log n).
// At any mid, at least ONE half is properly sorted: work out which, test
// whether the target lies inside it, and discard the other half.
func SearchRotated(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if nums[mid] == target {
			return mid
		}
		if nums[lo] <= nums[mid] { // left half sorted
			if nums[lo] <= target && target < nums[mid] {
				hi = mid - 1
			} else {
				lo = mid + 1
			}
		} else { // right half sorted
			if nums[mid] < target && target <= nums[hi] {
				lo = mid + 1
			} else {
				hi = mid - 1
			}
		}
	}
	return -1
}

// FindMinRotated returns the smallest element of a rotated sorted slice.
// Compare against the RIGHT end: nums[mid] > nums[hi] puts the minimum
// strictly to the right of mid.
func FindMinRotated(nums []int) int {
	lo, hi := 0, len(nums)-1
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] > nums[hi] {
			lo = mid + 1
		} else {
			hi = mid // mid stays a candidate
		}
	}
	return nums[lo]
}

// FindPeak returns the index of any element greater than both neighbours.
// Works on UNSORTED input: the uphill side always contains a peak because the
// ends count as -infinity.
func FindPeak(nums []int) int {
	lo, hi := 0, len(nums)-1
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] < nums[mid+1] {
			lo = mid + 1 // uphill to the right
		} else {
			hi = mid
		}
	}
	return lo
}

// ============================================================================
// 5. Matrices
// ============================================================================

// SearchMatrix handles rows that are sorted AND chained (each row starts after
// the previous one ends): treat it as one flat array. O(log(rows*cols)).
func SearchMatrix(matrix [][]int, target int) bool {
	if len(matrix) == 0 || len(matrix[0]) == 0 {
		return false
	}
	rows, cols := len(matrix), len(matrix[0])
	lo, hi := 0, rows*cols-1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		value := matrix[mid/cols][mid%cols] // flat index -> (r, c)
		switch {
		case value == target:
			return true
		case value < target:
			lo = mid + 1
		default:
			hi = mid - 1
		}
	}
	return false
}

// SearchMatrixStaircase handles rows and columns each sorted, without chaining.
// The top-right corner is the largest in its row and smallest in its column,
// so every comparison eliminates a whole row or column. O(rows + cols).
func SearchMatrixStaircase(matrix [][]int, target int) bool {
	if len(matrix) == 0 || len(matrix[0]) == 0 {
		return false
	}
	r, c := 0, len(matrix[0])-1
	for r < len(matrix) && c >= 0 {
		switch {
		case matrix[r][c] == target:
			return true
		case matrix[r][c] > target:
			c-- // this column is too big
		default:
			r++ // this row is too small
		}
	}
	return false
}

// ============================================================================
// 6. Binary search on the answer
// ============================================================================

// IntegerSqrt returns the largest x with x*x <= n. O(log n).
// The predicate "x*x <= n" is monotonic: true up to the answer, false after.
func IntegerSqrt(n int) (int, error) {
	if n < 0 {
		return 0, fmt.Errorf("negative input %d", n)
	}
	lo, hi, best := 0, n, 0
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if mid == 0 || mid <= n/mid { // mid*mid <= n without overflow
			best = mid // feasible: record it, then look right
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return best, nil
}

// MinShipCapacity returns the smallest ship capacity that delivers every
// package within `days` days.
//
// Nothing in an array is being searched - the ANSWER is, between max(weights)
// (the ship must fit the heaviest package) and sum(weights) (one giant trip).
// canShip is monotonic: a bigger ship is never worse. O(n log(sum)).
func MinShipCapacity(weights []int, days int) (int, error) {
	if days <= 0 || len(weights) == 0 {
		return 0, fmt.Errorf("bad input")
	}

	canShip := func(capacity int) bool {
		used, load := 1, 0
		for _, w := range weights {
			if load+w > capacity {
				used++ // start a new day
				load = 0
			}
			load += w
		}
		return used <= days
	}

	lo, sum := 0, 0
	for _, w := range weights {
		lo = max(lo, w)
		sum += w
	}

	// sort.Search finds the smallest k in [0, sum-lo) where the predicate holds.
	return lo + sort.Search(sum-lo, func(k int) bool { return canShip(lo + k) }), nil
}

// KokoEatingSpeed returns the minimum bananas-per-hour to finish every pile
// within `hours`. Same shape: monotonic predicate, binary search the answer.
func KokoEatingSpeed(piles []int, hours int) int {
	hoursNeeded := func(speed int) int {
		total := 0
		for _, p := range piles {
			total += (p + speed - 1) / speed // ceil division
		}
		return total
	}

	highest := 0
	for _, p := range piles {
		highest = max(highest, p)
	}
	// Speeds run 1..highest; sort.Search works on [0, highest) so shift by 1.
	return 1 + sort.Search(highest-1, func(k int) bool {
		return hoursNeeded(k+1) <= hours
	})
}

// ============================================================================
// demo
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func main() {
	nums := []int{1, 3, 5, 7, 9, 11}
	assert(LinearSearch(nums, 7) == 3 && LinearSearch(nums, 8) == -1, "linear search")

	assert(BinarySearch(nums, 1) == 0, "first element")
	assert(BinarySearch(nums, 11) == 5, "last element")
	assert(BinarySearch(nums, 7) == 3, "middle element")
	assert(BinarySearch(nums, 8) == -1, "missing element")
	assert(BinarySearch(nil, 1) == -1, "empty slice")
	assert(BinarySearchRecursive(nums, 9, 0, len(nums)-1) == 4, "recursive")

	dups := []int{1, 2, 2, 2, 3, 5}
	assert(LowerBound(dups, 2) == 1 && UpperBound(dups, 2) == 4, "bounds")
	assert(LowerBound(dups, 4) == 5, "insertion point with no match")
	assert(UpperBound(dups, 5) == 6, "past the end")
	assert(FirstOccurrence(dups, 2) == 1 && LastOccurrence(dups, 2) == 3, "occurrences")
	assert(FirstOccurrence(dups, 4) == -1, "missing value")
	assert(CountOccurrences(dups, 2) == 3 && CountOccurrences(dups, 9) == 0, "count")
	// Agreement with the standard library is the real correctness check.
	assert(LowerBound(dups, 2) == sort.SearchInts(dups, 2), "matches sort.SearchInts")

	rotated := []int{4, 5, 6, 7, 0, 1, 2}
	assert(SearchRotated(rotated, 0) == 4, "rotated search")
	assert(SearchRotated(rotated, 5) == 1, "rotated search left half")
	assert(SearchRotated(rotated, 3) == -1, "rotated miss")
	assert(FindMinRotated(rotated) == 0, "rotated minimum")
	assert(FindMinRotated([]int{3, 4, 5, 1, 2}) == 1, "rotated minimum 2")
	assert(FindMinRotated([]int{1, 2, 3}) == 1, "not actually rotated")

	assert(FindPeak([]int{1, 2, 3, 1}) == 2, "peak")
	p := FindPeak([]int{1, 2, 1, 3, 5, 6, 4})
	assert(p == 1 || p == 5, "either peak is valid")

	matrix := [][]int{{1, 3, 5, 7}, {10, 11, 16, 20}, {23, 30, 34, 60}}
	assert(SearchMatrix(matrix, 3) && SearchMatrix(matrix, 60), "matrix hits")
	assert(!SearchMatrix(matrix, 13), "matrix miss")

	staircase := [][]int{{1, 4, 7}, {2, 5, 8}, {3, 6, 9}}
	assert(SearchMatrixStaircase(staircase, 5), "staircase hit")
	assert(!SearchMatrixStaircase(staircase, 10), "staircase miss")

	r, err := IntegerSqrt(0)
	assert(r == 0 && err == nil, "sqrt 0")
	r, _ = IntegerSqrt(8)
	assert(r == 2, "sqrt floors")
	r, _ = IntegerSqrt(16)
	assert(r == 4, "exact sqrt")
	r, _ = IntegerSqrt(1000000000000)
	assert(r == 1000000, "large sqrt")
	_, err = IntegerSqrt(-1)
	assert(err != nil, "negative input is an error")

	c, err := MinShipCapacity([]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5)
	assert(c == 15 && err == nil, "ship capacity")
	c, _ = MinShipCapacity([]int{3, 2, 2, 4, 1, 4}, 3)
	assert(c == 6, "ship capacity 2")
	_, err = MinShipCapacity(nil, 3)
	assert(err != nil, "empty input is an error")

	assert(KokoEatingSpeed([]int{3, 6, 7, 11}, 8) == 4, "koko")
	assert(KokoEatingSpeed([]int{30, 11, 23, 4, 20}, 5) == 30, "koko 2")

	fmt.Println("08-Searching (Go): all checks passed")
}
