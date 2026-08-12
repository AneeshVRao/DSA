// 02 - Time and Space Complexity: measured, not memorised.
//
// Each function returns its answer plus an operation count, so the growth
// curves are exact and machine independent.
//
// Run:  go run complexity.go
package main

import (
	"fmt"
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

	fmt.Println("02-Time-Space-Complexity (Go): all checks passed")

	growthTable()
	wallClockDemo()
}
