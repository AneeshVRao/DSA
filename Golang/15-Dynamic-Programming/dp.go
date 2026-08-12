// 15 - Dynamic Programming: every classic family, memoised and tabulated,
// with the space optimisations spelled out.
//
// Run:  go run dp.go
package main

import (
	"fmt"
	"math"
	"sort"
)

// ============================================================================
// 1. The same problem three ways
// ============================================================================

// FibNaive is O(2^n): the same subproblems are recomputed exponentially often.
func FibNaive(n int) int {
	if n < 2 {
		return n
	}
	return FibNaive(n-1) + FibNaive(n-2)
}

// FibMemo is top-down: recursion plus a cache. O(n) time and space.
// Note `var fib func(int) int` BEFORE the literal - a closure cannot reference
// itself inside its own definition.
func FibMemo(n int) int {
	memo := make([]int, n+1)
	for i := range memo {
		memo[i] = -1
	}
	var fib func(int) int
	fib = func(k int) int {
		if k < 2 {
			return k
		}
		if memo[k] != -1 {
			return memo[k]
		}
		memo[k] = fib(k-1) + fib(k-2)
		return memo[k]
	}
	return fib(n)
}

// FibTable is bottom-up: fill in dependency order. O(n) time and space.
func FibTable(n int) int {
	if n < 2 {
		return n
	}
	dp := make([]int, n+1) // zero-filled: dp[0] = 0 is already correct
	dp[1] = 1
	for i := 2; i <= n; i++ {
		dp[i] = dp[i-1] + dp[i-2]
	}
	return dp[n]
}

// FibRolling is O(n) time and O(1) space: only two states are ever read.
func FibRolling(n int) int {
	if n < 2 {
		return n
	}
	prev, curr := 0, 1
	for i := 1; i < n; i++ {
		prev, curr = curr, prev+curr
	}
	return curr
}

// ============================================================================
// 2. Linear DP
// ============================================================================

// ClimbStairs counts ways to climb with 1 or 2 steps: dp[i] = dp[i-1]+dp[i-2],
// because the last step was either a 1 or a 2. Fibonacci wearing a hat.
func ClimbStairs(n int) int {
	if n <= 2 {
		return max(n, 1)
	}
	prev, curr := 1, 2
	for i := 3; i <= n; i++ {
		prev, curr = curr, prev+curr
	}
	return curr
}

// HouseRobber returns the max sum with no two adjacent elements. O(n) / O(1).
// skip = best without the previous house; take = best including it.
func HouseRobber(values []int) int {
	skip, take := 0, 0
	for _, value := range values {
		skip, take = max(skip, take), skip+value
	}
	return max(skip, take)
}

// MaxSubarray is Kadane, which is DP: dp[i] = best subarray ENDING at i.
func MaxSubarray(nums []int) (int, error) {
	if len(nums) == 0 {
		return 0, fmt.Errorf("max subarray of an empty slice is undefined")
	}
	best, current := nums[0], nums[0]
	for _, x := range nums[1:] {
		current = max(x, current+x) // extend, or restart here
		best = max(best, current)
	}
	return best, nil
}

// ============================================================================
// 3. Knapsack family
// ============================================================================

// Knapsack01 uses each item at most ONCE.
// dp[i][w] = best value from the first i items within capacity w. O(n*W).
func Knapsack01(weights, values []int, capacity int) int {
	n := len(weights)
	dp := make([][]int, n+1)
	for i := range dp {
		dp[i] = make([]int, capacity+1) // no 2-D slice literal in Go
	}
	for i := 1; i <= n; i++ {
		for w := 0; w <= capacity; w++ {
			dp[i][w] = dp[i-1][w] // skip item i-1
			if weights[i-1] <= w {
				dp[i][w] = max(dp[i][w], values[i-1]+dp[i-1][w-weights[i-1]])
			}
		}
	}
	return dp[n][capacity]
}

// Knapsack01Optimized gives the same answer in O(W) space.
//
// The capacity loop MUST run downwards: upwards would read a cell that already
// includes this item, letting it be used twice - silently turning 0/1 knapsack
// into the unbounded version.
func Knapsack01Optimized(weights, values []int, capacity int) int {
	dp := make([]int, capacity+1)
	for i, weight := range weights {
		for w := capacity; w >= weight; w-- { // downwards!
			dp[w] = max(dp[w], values[i]+dp[w-weight])
		}
	}
	return dp[capacity]
}

// CoinChangeMin returns the fewest coins summing to amount, or -1.
// Unbounded knapsack: the inner loop runs UPWARDS because reuse is allowed.
func CoinChangeMin(coins []int, amount int) int {
	const inf = math.MaxInt / 2 // safe to add 1 to
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = inf
	}
	for _, coin := range coins {
		for value := coin; value <= amount; value++ { // upwards: reuse is OK
			dp[value] = min(dp[value], dp[value-coin]+1)
		}
	}
	if dp[amount] >= inf {
		return -1
	}
	return dp[amount]
}

// CoinChangeWays counts COMBINATIONS summing to amount.
// Coins outside, amounts inside: that order counts each combination once.
// Swapping the loops would count permutations ({1,2} and {2,1} separately).
func CoinChangeWays(coins []int, amount int) int {
	dp := make([]int, amount+1)
	dp[0] = 1 // one way to make 0: take nothing
	for _, coin := range coins {
		for value := coin; value <= amount; value++ {
			dp[value] += dp[value-coin]
		}
	}
	return dp[amount]
}

// CanPartition asks whether nums splits into two equal-sum halves.
// Subset sum in disguise - a boolean 0/1 knapsack, so downwards again.
func CanPartition(nums []int) bool {
	total := 0
	for _, x := range nums {
		total += x
	}
	if total%2 != 0 {
		return false // odd totals never split evenly
	}
	target := total / 2

	reachable := make([]bool, target+1)
	reachable[0] = true
	for _, x := range nums {
		for value := target; value >= x; value-- { // downwards
			if reachable[value-x] {
				reachable[value] = true
			}
		}
	}
	return reachable[target]
}

// ============================================================================
// 4. String DP
// ============================================================================

// LongestCommonSubsequence: dp[i][j] = LCS of a[:i] and b[:j]. O(n*m).
// Row 0 and column 0 stay 0 - an empty string shares nothing.
func LongestCommonSubsequence(a, b string) int {
	dp := make([][]int, len(a)+1)
	for i := range dp {
		dp[i] = make([]int, len(b)+1)
	}
	for i := 1; i <= len(a); i++ {
		for j := 1; j <= len(b); j++ {
			if a[i-1] == b[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
			} else {
				dp[i][j] = max(dp[i-1][j], dp[i][j-1])
			}
		}
	}
	return dp[len(a)][len(b)]
}

// EditDistance is Levenshtein: dp[i][j] = edits to turn a[:i] into b[:j].
// Row 0 and column 0 are "delete everything" / "insert everything".
func EditDistance(a, b string) int {
	dp := make([][]int, len(a)+1)
	for i := range dp {
		dp[i] = make([]int, len(b)+1)
		dp[i][0] = i
	}
	for j := 0; j <= len(b); j++ {
		dp[0][j] = j
	}

	for i := 1; i <= len(a); i++ {
		for j := 1; j <= len(b); j++ {
			if a[i-1] == b[j-1] {
				dp[i][j] = dp[i-1][j-1] // free match
			} else {
				dp[i][j] = 1 + min(dp[i-1][j], // delete
					min(dp[i][j-1], // insert
						dp[i-1][j-1])) // replace
			}
		}
	}
	return dp[len(a)][len(b)]
}

// WordBreak: dp[i] = "the first i bytes split into dictionary words".
func WordBreak(s string, words []string) bool {
	vocabulary := make(map[string]struct{}, len(words))
	for _, w := range words {
		vocabulary[w] = struct{}{}
	}
	dp := make([]bool, len(s)+1)
	dp[0] = true
	for end := 1; end <= len(s); end++ {
		for start := 0; start < end; start++ {
			if dp[start] {
				if _, ok := vocabulary[s[start:end]]; ok {
					dp[end] = true
					break
				}
			}
		}
	}
	return dp[len(s)]
}

// LongestPalindromicSubsequence is interval DP over s[i..j], filled by
// INCREASING LENGTH so the shorter intervals it reads are already known.
func LongestPalindromicSubsequence(s string) int {
	n := len(s)
	if n == 0 {
		return 0
	}
	dp := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int, n)
		dp[i][i] = 1 // a single character is a palindrome
	}

	for length := 2; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1
			switch {
			case s[i] == s[j] && length == 2:
				dp[i][j] = 2
			case s[i] == s[j]:
				dp[i][j] = 2 + dp[i+1][j-1]
			default:
				dp[i][j] = max(dp[i+1][j], dp[i][j-1])
			}
		}
	}
	return dp[0][n-1]
}

// ============================================================================
// 5. Sequence DP
// ============================================================================

// LISQuadratic: dp[i] = LIS length ENDING at i. Defining it as "ending at i"
// is what makes the recurrence expressible at all. O(n^2).
func LISQuadratic(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	dp := make([]int, len(nums))
	best := 1
	for i := range dp {
		dp[i] = 1
		for j := 0; j < i; j++ {
			if nums[j] < nums[i] {
				dp[i] = max(dp[i], dp[j]+1)
			}
		}
		best = max(best, dp[i])
	}
	return best
}

// LISBinarySearch is the O(n log n) version. tails[k] holds the smallest
// possible tail of an increasing subsequence of length k+1. Keeping every tail
// minimal keeps tails sorted, and its LENGTH is the answer - the contents are
// not themselves a valid subsequence.
func LISBinarySearch(nums []int) int {
	var tails []int
	for _, x := range nums {
		i := sort.SearchInts(tails, x) // first index with tails[i] >= x
		if i == len(tails) {
			tails = append(tails, x) // extends the longest run so far
		} else {
			tails[i] = x // a smaller tail for that length
		}
	}
	return len(tails)
}

// ============================================================================
// 6. Grid DP
// ============================================================================

// UniquePaths counts right/down paths. One row of state suffices: a cell reads
// the value above (the row being overwritten) and to the left (already
// updated this pass).
func UniquePaths(rows, cols int) int {
	if rows <= 0 || cols <= 0 {
		return 0
	}
	row := make([]int, cols)
	for i := range row {
		row[i] = 1
	}
	for r := 1; r < rows; r++ {
		for c := 1; c < cols; c++ {
			row[c] += row[c-1] // above + left
		}
	}
	return row[cols-1]
}

// MinPathSum finds the cheapest top-left to bottom-right path.
// O(r*c) time, O(c) space.
func MinPathSum(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 {
		return 0
	}
	cols := len(grid[0])
	row := make([]int, cols)
	row[0] = grid[0][0]
	for c := 1; c < cols; c++ {
		row[c] = row[c-1] + grid[0][c] // first row: only from the left
	}

	for r := 1; r < len(grid); r++ {
		row[0] += grid[r][0] // first column: only from above
		for c := 1; c < cols; c++ {
			row[c] = min(row[c], row[c-1]) + grid[r][c]
		}
	}
	return row[cols-1]
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
	for n := 0; n < 15; n++ {
		expected := FibNaive(n)
		assert(FibMemo(n) == expected, "memo matches naive")
		assert(FibTable(n) == expected, "table matches naive")
		assert(FibRolling(n) == expected, "rolling matches naive")
	}
	assert(FibMemo(90) == 2880067194370816120, "fib(90) fits in int64")

	assert(ClimbStairs(1) == 1 && ClimbStairs(2) == 2, "base cases")
	assert(ClimbStairs(5) == 8, "climb stairs")
	assert(ClimbStairs(45) == 1836311903, "large climb stairs")

	assert(HouseRobber([]int{1, 2, 3, 1}) == 4, "houses 0 and 2")
	assert(HouseRobber([]int{2, 7, 9, 3, 1}) == 12, "houses 0, 2 and 4")
	assert(HouseRobber(nil) == 0, "no houses")
	assert(HouseRobber([]int{5}) == 5, "one house")

	best, err := MaxSubarray([]int{-2, 1, -3, 4, -1, 2, 1, -5, 4})
	assert(best == 6 && err == nil, "kadane")
	best, _ = MaxSubarray([]int{-5, -2, -9})
	assert(best == -2, "kadane with all negatives")
	_, err = MaxSubarray(nil)
	assert(err != nil, "empty input is an error")

	weights, values := []int{1, 3, 4, 5}, []int{1, 4, 5, 7}
	assert(Knapsack01(weights, values, 7) == 9, "knapsack: weights 3 and 4")
	assert(Knapsack01Optimized(weights, values, 7) == 9, "optimised knapsack")
	for capacity := 0; capacity <= 9; capacity++ { // both versions must agree
		assert(Knapsack01(weights, values, capacity) ==
			Knapsack01Optimized(weights, values, capacity), "knapsack versions agree")
	}

	assert(CoinChangeMin([]int{1, 2, 5}, 11) == 3, "5 + 5 + 1")
	assert(CoinChangeMin([]int{2}, 3) == -1, "impossible amount")
	assert(CoinChangeMin([]int{1}, 0) == 0, "zero amount")
	assert(CoinChangeWays([]int{1, 2, 5}, 5) == 4, "combinations of 5")
	assert(CoinChangeWays([]int{2}, 3) == 0, "no combination")

	assert(CanPartition([]int{1, 5, 11, 5}), "11 = 1 + 5 + 5")
	assert(!CanPartition([]int{1, 2, 3, 5}), "cannot partition")
	assert(!CanPartition([]int{1}), "odd total")

	assert(LongestCommonSubsequence("abcde", "ace") == 3, "lcs")
	assert(LongestCommonSubsequence("abc", "def") == 0, "no common subsequence")
	assert(LongestCommonSubsequence("", "abc") == 0, "empty input")

	assert(EditDistance("horse", "ros") == 3, "edit distance")
	assert(EditDistance("intention", "execution") == 5, "edit distance 2")
	assert(EditDistance("", "abc") == 3, "insert everything")
	assert(EditDistance("same", "same") == 0, "identical strings")

	assert(WordBreak("leetcode", []string{"leet", "code"}), "word break")
	assert(!WordBreak("catsandog", []string{"cats", "dog", "sand", "and", "cat"}),
		"word break fails")
	assert(WordBreak("", []string{"a"}), "empty string is splittable")

	assert(LongestPalindromicSubsequence("bbbab") == 4, "bbbb")
	assert(LongestPalindromicSubsequence("cbbd") == 2, "bb")
	assert(LongestPalindromicSubsequence("") == 0, "empty string")

	assert(LISQuadratic([]int{10, 9, 2, 5, 3, 7, 101, 18}) == 4, "lis quadratic")
	assert(LISBinarySearch([]int{10, 9, 2, 5, 3, 7, 101, 18}) == 4, "lis n log n")
	assert(LISQuadratic([]int{7, 7, 7}) == 1, "strictly increasing")
	assert(LISBinarySearch([]int{7, 7, 7}) == 1, "strictly increasing, fast")
	assert(LISQuadratic(nil) == 0 && LISBinarySearch(nil) == 0, "empty input")
	for _, c := range [][]int{{1}, {3, 1, 2}, {1, 3, 6, 7, 9, 4, 10, 5, 6}, {5, 4, 3, 2, 1}} {
		assert(LISQuadratic(c) == LISBinarySearch(c), "both LIS versions agree")
	}

	assert(UniquePaths(3, 7) == 28, "unique paths")
	assert(UniquePaths(1, 1) == 1, "single cell")
	assert(UniquePaths(3, 2) == 3, "narrow grid")

	assert(MinPathSum([][]int{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}) == 7, "min path sum")
	assert(MinPathSum([][]int{{1, 2, 3}, {4, 5, 6}}) == 12, "min path sum 2")
	assert(MinPathSum(nil) == 0, "empty grid")

	fmt.Println("15-Dynamic-Programming (Go): all checks passed")
}
