// 15 - Dynamic Programming: every classic family, memoised and tabulated,
// with the space optimisations spelled out.
//
// Run:  go run dp.go
package main

import (
	"fmt"
	"math"
	"math/bits"
	"math/rand"
	"sort"
	"strconv"
	"strings"
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

// ============================================================================
// 9. Digit DP - counting numbers, not iterating them
// ============================================================================

// CountWithDigitSumAtMost counts x in [0, limit] whose digit sum is at most
// maxDigitSum. O(digits * sum * 2).
//
// The tell for digit DP: the ANSWER IS A COUNT OVER A RANGE, and the range is
// far too large to iterate - limit can be 10^18. So build the numbers one digit
// at a time and count the branches instead of walking them.
//
// THE STATE:
//
//	pos    which digit position is being filled, left to right
//	tight  are we still exactly on the prefix of limit?
//	total  digit sum accumulated so far
//
// THE `tight` FLAG IS THE WHOLE TECHNIQUE. While every digit so far has matched
// limit exactly, the next digit is capped at limit[pos]. The moment one smaller
// digit is placed, the prefix is already below limit and every later digit is
// free to be 0-9 - and that subtree is shared by an enormous number of values,
// which is what makes memoisation pay.
//
// Without tight there is nothing to memoise: the answer would depend on the
// entire prefix. With it, the prefix collapses to a single bit.
//
// Leading zeros need no special handling here because a leading zero adds 0 to
// the digit sum. Constraints on the DIGITS THEMSELVES do - see
// CountWithoutDigit.
func CountWithDigitSumAtMost(limit int, maxDigitSum int) int {
	if limit < 0 {
		return 0
	}

	digits := strconv.Itoa(limit)
	type state struct {
		pos   int
		tight bool
		total int
	}
	memo := map[state]int{}

	var go_ func(pos int, tight bool, total int) int
	go_ = func(pos int, tight bool, total int) int {
		if total > maxDigitSum {
			return 0 // prune: sums only ever grow
		}
		if pos == len(digits) {
			return 1 // a complete, valid number
		}

		key := state{pos, tight, total}
		if cached, ok := memo[key]; ok {
			return cached
		}

		// Capped by limit's digit only while still on its prefix.
		highest := 9
		if tight {
			highest = int(digits[pos] - '0')
		}

		count := 0
		for digit := 0; digit <= highest; digit++ {
			count += go_(pos+1, tight && digit == highest, total+digit)
		}
		memo[key] = count
		return count
	}

	return go_(0, true, 0)
}

// CountInRangeWithDigitSum counts over [low, high]. Prefix subtraction.
//
//	f(low, high) = f(0, high) - f(0, low-1)
//
// Digit DP naturally counts from 0, so a two-sided range is two one-sided
// calls. The `low - 1` is the part people get wrong - using low drops a value
// that should be counted.
func CountInRangeWithDigitSum(low, high, maxDigitSum int) int {
	if low > high {
		return 0
	}
	return CountWithDigitSumAtMost(high, maxDigitSum) -
		CountWithDigitSumAtMost(low-1, maxDigitSum)
}

// CountWithoutDigit counts x in [0, limit] containing no occurrence of
// forbidden. O(digits).
//
// The same `tight` skeleton - but this constraint needs a THIRD state bit, and
// the reason is the classic digit-DP trap.
//
// LEADING ZEROS ARE NOT DIGITS. Every candidate is built to the full width of
// limit, so 7 is constructed as "007" when limit has three digits. The
// digit-sum version above does not care, because those zeros add 0 to the sum.
// Here they are fatal: with forbidden == 0 the padding alone would reject every
// short number, and CountWithoutDigit(50, 0) would return 36 rather than 45.
//
// So carry `started` - has a significant digit been placed yet? A zero before
// the number has started is padding and exempt; once started, every digit is
// real and the filter applies.
//
// The base case needs care too: if nothing ever started, the value IS zero,
// written "0" - so it survives only when 0 is not the forbidden digit.
func CountWithoutDigit(limit, forbidden int) int {
	if limit < 0 {
		return 0
	}

	digits := strconv.Itoa(limit)
	type state struct {
		pos            int
		tight, started bool
	}
	memo := map[state]int{}

	var go_ func(pos int, tight, started bool) int
	go_ = func(pos int, tight, started bool) int {
		if pos == len(digits) {
			if started {
				return 1
			}
			// Nothing was ever placed: the value is 0, written "0".
			if forbidden == 0 {
				return 0
			}
			return 1
		}

		key := state{pos, tight, started}
		if cached, ok := memo[key]; ok {
			return cached
		}

		highest := 9
		if tight {
			highest = int(digits[pos] - '0')
		}

		count := 0
		for digit := 0; digit <= highest; digit++ {
			nowStarted := started || digit != 0
			if nowStarted && digit == forbidden {
				continue // a REAL digit, and it is banned
			}
			count += go_(pos+1, tight && digit == highest, nowStarted)
		}
		memo[key] = count
		return count
	}

	return go_(0, true, false)
}

// ============================================================================
// 10. Game theory DP - minimax, memoisation and alpha-beta
// ============================================================================

// StoneGameMargin returns the first player's final margin under optimal play.
// O(n^2).
//
// Two players alternately take a stone from EITHER END of the row. Both play
// perfectly. What is (my total - their total) at the end?
//
// THE TRICK THAT COLLAPSES IT. Do not track two scores and whose turn it is.
// Track a single number - the MARGIN from the perspective of whoever is about
// to move:
//
//	best[i][j] = the best achievable (my points - their points) on [i, j]
//
// Taking values[i] scores values[i] and then hands the opponent a position
// worth best[i+1][j] *to them*, which counts against me:
//
//	best[i][j] = max(values[i] - best[i+1][j],
//	                 values[j] - best[i][j-1])
//
// That single minus sign is the whole of minimax. There is no separate
// "minimising player" branch, because the opponent's best margin is exactly the
// negative of mine - the game is zero-sum, and this is the NEGAMAX form.
//
// O(n^2) states, O(1) each. The naive tree is O(2^n).
func StoneGameMargin(values []int) int {
	n := len(values)
	if n == 0 {
		return 0
	}

	best := make([][]int, n)
	for i := range best {
		best[i] = make([]int, n)
		best[i][i] = values[i] // one stone left: take it
	}

	for length := 2; length <= n; length++ { // INCREASING LENGTH, as always
		for i := 0; i+length <= n; i++ {
			j := i + length - 1
			best[i][j] = max(values[i]-best[i+1][j], values[j]-best[i][j-1])
		}
	}
	return best[0][n-1]
}

// MinimaxExplicit returns the same answer by explicit tree search, together
// with the number of nodes visited.
//
// Written as an actual search rather than a table, because that is the form
// alpha-beta applies to - and the node counter is what makes the pruning
// measurable instead of merely claimed.
//
// ALPHA-BETA. Carry two bounds down the tree:
//
//	alpha  the best margin the side to move can already guarantee here
//	beta   the most the parent will ever allow this node to be worth
//
// If alpha >= beta, the parent already has a better option elsewhere and will
// never choose this branch, so the rest of it need not be examined. The exact
// value is irrelevant once it is known to be too good to be allowed, which is
// why the cutoff is safe and the answer unchanged.
//
// THE WINDOW HAS TO BE SHIFTED, NOT JUST NEGATED. The textbook negamax line is
// `-search(child, -beta, -alpha)`, correct only when a node's value is exactly
// the negation of its child's. Here it is
//
//	value = face - child          (face = the stone just taken)
//
// so the window must be transformed through that expression too. Solving
// `alpha < face - child < beta` for the child gives
//
//	child window = (face - beta, face - alpha)
//
// and face differs per branch, so each child gets its own window. Passing the
// plain (-beta, -alpha) prunes branches that were still live and silently
// returns a wrong margin on some inputs.
func MinimaxExplicit(values []int, useAlphaBeta bool) (int, int) {
	nodes := 0
	const infMargin = 1000000000

	var search func(i, j, alpha, beta int) int
	search = func(i, j, alpha, beta int) int {
		nodes++
		if i > j {
			return 0
		}

		bestMargin := -infMargin
		for _, takeLeft := range []bool{true, false} {
			// The stone taken on this branch, and the range left behind.
			face, lo, hi := values[j], i, j-1
			if takeLeft {
				face, lo, hi = values[i], i+1, j
			}

			// Window shifted through `face - child` - see above.
			child := search(lo, hi, face-beta, face-alpha)
			gain := face - child

			bestMargin = max(bestMargin, gain)
			alpha = max(alpha, bestMargin)
			if useAlphaBeta && alpha >= beta {
				break // cutoff: the parent will never come here
			}
		}
		return bestMargin
	}

	margin := search(0, len(values)-1, -infMargin, infMargin)
	return margin, nodes
}

// CanFirstPlayerWin reports whether the first player wins outright.
func CanFirstPlayerWin(values []int) bool { return StoneGameMargin(values) > 0 }

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

// ============================================================================
// 7. Interval (partition) DP
// ============================================================================

// MatrixChainOrder returns the fewest scalar multiplications needed to multiply
// a chain of matrices. O(n^3).
//
// Matrix i has shape dimensions[i] x dimensions[i+1], so n matrices need n+1
// numbers. Multiplying a p x q by a q x r costs p*q*r scalar multiplies. The
// product is ASSOCIATIVE but not commutative, so the parenthesisation is free
// to choose - and the cost gap is enormous. For 10x30, 30x5, 5x60:
//
//	((AB)C) = 10*30*5 + 10*5*60  = 1500 + 3000  =  4500
//	(A(BC)) = 30*5*60 + 10*30*60 = 9000 + 18000 = 27000
//
// This is the archetypal INTERVAL DP:
//
//	cost[i][j] = min over every split k in (i, j) of
//	             cost[i][k] + cost[k][j] + (price of joining the halves)
//
// The subproblem is a CONTIGUOUS RANGE and the recurrence tries every cut. Two
// things catch people out:
//
//  1. Iterate by INCREASING LENGTH, not by index. cost[i][j] depends on
//     strictly shorter intervals, so they must exist first. A plain
//     `for i / for j` double loop reads uninitialised cells.
//  2. It is O(n^3): O(n^2) intervals, each scanning O(n) split points.
//
// Same skeleton as BurstBalloons, optimal BST construction, "minimum cost to
// cut a stick" and polygon triangulation.
func MatrixChainOrder(dimensions []int) int {
	n := len(dimensions) - 1 // number of matrices
	if n <= 1 {
		return 0 // nothing to multiply
	}

	cost := make([][]int, n+1)
	for i := range cost {
		cost[i] = make([]int, n+1)
	}

	for length := 2; length <= n; length++ { // INCREASING LENGTH
		for i := 0; i+length <= n; i++ {
			j := i + length // half-open [i, j)
			cost[i][j] = math.MaxInt64 / 4
			for k := i + 1; k < j; k++ { // every split point
				// Left half yields a dimensions[i] x dimensions[k] matrix,
				// right half a dimensions[k] x dimensions[j]. Joining them
				// costs the product of the three dimensions.
				candidate := cost[i][k] + cost[k][j] +
					dimensions[i]*dimensions[k]*dimensions[j]
				cost[i][j] = min(cost[i][j], candidate)
			}
		}
	}
	return cost[0][n]
}

// BurstBalloons returns the maximum coins from bursting every balloon, each
// paying left*self*right. O(n^3).
//
// The trap: bursting a balloon changes its neighbours, so "which do I burst
// first?" leaves a subproblem that is no longer an interval - the recursion
// does not close.
//
// Reverse the question. Instead of the FIRST balloon to burst, pick the LAST
// one in each range. If k is last in the open interval (i, j), everything
// strictly inside was burst before it, so when k pops its neighbours are
// exactly i and j - fixed by the interval. Now the two sides are independent:
//
//	best[i][j] = max over k in (i, j) of
//	             best[i][k] + best[k][j] + padded[i]*padded[k]*padded[j]
//
// Padding with 1 at each end removes the boundary special case.
//
// "Think about the last one, not the first" is the most transferable idea in
// interval DP.
func BurstBalloons(balloons []int) int {
	padded := make([]int, 0, len(balloons)+2)
	padded = append(padded, 1)
	padded = append(padded, balloons...)
	padded = append(padded, 1)

	n := len(padded)
	best := make([][]int, n)
	for i := range best {
		best[i] = make([]int, n)
	}

	for length := 2; length < n; length++ { // open-interval length
		for i := 0; i+length < n; i++ {
			j := i + length
			for k := i + 1; k < j; k++ { // k is burst LAST in (i, j)
				best[i][j] = max(best[i][j],
					best[i][k]+best[k][j]+padded[i]*padded[k]*padded[j])
			}
		}
	}
	return best[0][n-1]
}

// MinCostToCutStick returns the cheapest order of cuts, each costing the length
// of the piece being cut. O(m^3).
//
// The same skeleton with the ends padded in as fake cuts at 0 and length.
// Sorting matters: the DP is over ADJACENT cut positions, which only form
// intervals once the positions are in order.
func MinCostToCutStick(length int, cuts []int) int {
	points := make([]int, 0, len(cuts)+2)
	points = append(points, 0)
	points = append(points, cuts...)
	points = append(points, length)
	sort.Ints(points)

	m := len(points)
	cost := make([][]int, m)
	for i := range cost {
		cost[i] = make([]int, m)
	}

	for span := 2; span < m; span++ {
		for i := 0; i+span < m; i++ {
			j := i + span
			bestSplit := math.MaxInt64 / 4
			for k := i + 1; k < j; k++ {
				bestSplit = min(bestSplit, cost[i][k]+cost[k][j])
			}
			// The piece cut always spans points[i]..points[j] whichever cut
			// comes first, so that price is a constant here.
			cost[i][j] = points[j] - points[i] + bestSplit
		}
	}
	return cost[0][m-1]
}

// ============================================================================
// 8. Bitmask DP
// ============================================================================

// TravellingSalesman returns the shortest tour visiting every city once and
// returning to the start. O(2^n * n^2).
//
// The Held-Karp algorithm, and the canonical BITMASK DP.
//
// The state must remember WHICH cities have been visited - not how many,
// because which ones remain determines the rest of the cost. A set of cities is
// a subset of n elements, so encode it as n bits of an integer:
//
//	best[mask][last] = cheapest route visiting exactly the cities in mask
//	                   and currently standing at last
//
// 2^n * n states, each extended n ways: O(2^n * n^2). Brute force over
// permutations is O(n!) - for n = 20 that is 2.4e18 against 4e8. Still
// exponential, but the difference between "never" and "a second".
//
// The bit operations that carry the method:
//
//	mask | (1 << c)       add city c
//	mask & (1 << c)       is c in the set?
//	mask == (1 << n) - 1  are all n in the set?
//
// Every subset-flavoured problem has this shape: partition into k groups,
// assign n tasks to n workers, shortest superstring, count Hamiltonian paths.
// The ceiling is around n = 20-22 before 2^n stops fitting in memory.
func TravellingSalesman(distance [][]int) int {
	n := len(distance)
	if n <= 1 {
		return 0
	}

	const unreachable = math.MaxInt64 / 4
	// Start at city 0 with only city 0 visited.
	best := make([][]int, 1<<n)
	for mask := range best {
		best[mask] = make([]int, n)
		for last := range best[mask] {
			best[mask][last] = unreachable
		}
	}
	best[1][0] = 0

	for mask := 0; mask < 1<<n; mask++ {
		if mask&1 == 0 {
			continue // every tour starts at city 0
		}
		for last := 0; last < n; last++ {
			if best[mask][last] == unreachable {
				continue // unreachable state
			}
			for city := 0; city < n; city++ {
				if mask&(1<<city) != 0 {
					continue // already visited
				}
				next := mask | (1 << city)
				best[next][city] = min(best[next][city],
					best[mask][last]+distance[last][city])
			}
		}
	}

	full := (1 << n) - 1
	answer := unreachable
	for last := 0; last < n; last++ {
		answer = min(answer, best[full][last]+distance[last][0])
	}
	return answer
}

// CountPerfectMatchings counts the ways to assign n tasks to n people, each to
// exactly one. O(2^n * n).
//
// compatible[person][task] says whether that pairing is allowed.
//
// The trick that halves the state: process people in a FIXED order. If the mask
// holds the tasks already assigned, then popcount(mask) is exactly how many
// people have been served - so the person index is implied and never needs
// storing. The state collapses from (person, mask) to just mask.
//
// bits.OnesCount is a single CPU instruction on any modern target. Recognising
// when one dimension is recoverable from another is what makes bitmask DP fit
// in memory.
func CountPerfectMatchings(compatible [][]bool) int {
	n := len(compatible)
	ways := make([]int, 1<<n)
	ways[0] = 1 // one way to assign nobody

	for mask := 0; mask < 1<<n; mask++ {
		if ways[mask] == 0 {
			continue
		}
		person := bits.OnesCount(uint(mask)) // implied, never stored
		if person == n {
			continue
		}
		for task := 0; task < n; task++ {
			if mask&(1<<task) == 0 && compatible[person][task] {
				ways[mask|(1<<task)] += ways[mask]
			}
		}
	}
	return ways[(1<<n)-1]
}

// SubsetSumPartitionMinDifference splits the input into two groups with the
// smallest possible difference. O(n * sum).
//
// Included as the CONTRAST: this is not bitmask DP. The state only needs the
// reachable sums, not which elements produced them - so a set of sums beats
// 2^n subsets by a wide margin. Reach for a bitmask only when the IDENTITY of
// the chosen elements actually matters.
func SubsetSumPartitionMinDifference(nums []int) int {
	total := 0
	for _, value := range nums {
		total += value
	}

	reachable := make([]bool, total+1)
	reachable[0] = true
	for _, value := range nums {
		for sum := total; sum >= value; sum-- { // DOWNWARD: 0/1, not unbounded
			if reachable[sum-value] {
				reachable[sum] = true
			}
		}
	}

	best := total
	for half := 0; half <= total/2; half++ {
		if reachable[half] {
			best = min(best, total-2*half)
		}
	}
	return best
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

	// --- Interval DP ---------------------------------------------------------
	// 10x30, 30x5, 5x60: ((AB)C) costs 4500, (A(BC)) costs 27000.
	assert(MatrixChainOrder([]int{10, 30, 5, 60}) == 4500, "matrix chain")
	assert(MatrixChainOrder([]int{40, 20, 30, 10, 30}) == 26000, "matrix chain 2")
	assert(MatrixChainOrder([]int{5, 10}) == 0, "a single matrix")
	assert(MatrixChainOrder([]int{7}) == 0, "no matrices at all")

	assert(BurstBalloons([]int{3, 1, 5, 8}) == 167, "burst balloons")
	assert(BurstBalloons([]int{1, 5}) == 10, "two balloons")
	assert(BurstBalloons([]int{9}) == 9, "one balloon")
	assert(BurstBalloons(nil) == 0, "no balloons")

	assert(MinCostToCutStick(7, []int{1, 3, 4, 5}) == 16, "cut stick")
	assert(MinCostToCutStick(9, []int{5, 6, 1, 4, 2}) == 22, "cut stick 2")

	// Against plain memoised recursion - an independent route to the answer.
	rng := rand.New(rand.NewSource(15))
	bruteChain := func(dims []int) int {
		memo := map[[2]int]int{}
		var solve func(i, j int) int
		solve = func(i, j int) int {
			if j-i <= 1 {
				return 0
			}
			if cached, ok := memo[[2]int{i, j}]; ok {
				return cached
			}
			best := math.MaxInt64 / 4
			for k := i + 1; k < j; k++ {
				best = min(best, solve(i, k)+solve(k, j)+dims[i]*dims[k]*dims[j])
			}
			memo[[2]int{i, j}] = best
			return best
		}
		return solve(0, len(dims)-1)
	}

	for trial := 0; trial < 60; trial++ {
		dims := make([]int, rng.Intn(7)+1)
		for i := range dims {
			dims[i] = rng.Intn(20) + 1
		}
		assert(MatrixChainOrder(dims) == bruteChain(dims), "chain matches brute force")
	}

	// Try every possible burst order - O(n!), so keep n tiny.
	var bruteBurst func(values []int) int
	bruteBurst = func(values []int) int {
		if len(values) == 0 {
			return 0
		}
		best := 0
		for i := range values {
			left, right := 1, 1
			if i > 0 {
				left = values[i-1]
			}
			if i+1 < len(values) {
				right = values[i+1]
			}
			rest := make([]int, 0, len(values)-1)
			rest = append(rest, values[:i]...)
			rest = append(rest, values[i+1:]...)
			best = max(best, left*values[i]*right+bruteBurst(rest))
		}
		return best
	}

	for trial := 0; trial < 40; trial++ {
		values := make([]int, rng.Intn(7))
		for i := range values {
			values[i] = rng.Intn(9) + 1
		}
		assert(BurstBalloons(values) == bruteBurst(values), "burst matches brute force")
	}

	// --- Bitmask DP -----------------------------------------------------------
	// A square: 0-1-2-3-0 with unit sides and diagonals of 2.
	square := [][]int{
		{0, 1, 2, 1},
		{1, 0, 1, 2},
		{2, 1, 0, 1},
		{1, 2, 1, 0},
	}
	assert(TravellingSalesman(square) == 4, "walk the perimeter")
	assert(TravellingSalesman([][]int{{0}}) == 0, "one city")
	assert(TravellingSalesman([][]int{{0, 5}, {5, 0}}) == 10, "there and back")

	identityMatch := [][]bool{{true, true, true}, {true, true, true}, {true, true, true}}
	assert(CountPerfectMatchings(identityMatch) == 6, "3! assignments")
	assert(CountPerfectMatchings([][]bool{{true, false}, {false, true}}) == 1, "forced")
	assert(CountPerfectMatchings([][]bool{{true, true}, {false, false}}) == 0, "impossible")

	assert(SubsetSumPartitionMinDifference([]int{1, 6, 11, 5}) == 1, "min difference")
	assert(SubsetSumPartitionMinDifference([]int{3, 3}) == 0, "even split")
	assert(SubsetSumPartitionMinDifference([]int{10}) == 10, "single element")

	// Every permutation of a slice - the brute-force reference for both
	// bitmask DPs below.
	var permutations func(items []int) [][]int
	permutations = func(items []int) [][]int {
		if len(items) <= 1 {
			return [][]int{append([]int(nil), items...)}
		}
		var result [][]int
		for i := range items {
			rest := make([]int, 0, len(items)-1)
			rest = append(rest, items[:i]...)
			rest = append(rest, items[i+1:]...)
			for _, tail := range permutations(rest) {
				result = append(result, append([]int{items[i]}, tail...))
			}
		}
		return result
	}

	// Held-Karp against brute force over every permutation.
	for trial := 0; trial < 30; trial++ {
		n := rng.Intn(7) + 1
		matrix := make([][]int, n)
		for i := range matrix {
			matrix[i] = make([]int, n)
		}
		for u := 0; u < n; u++ {
			for v := u + 1; v < n; v++ {
				w := rng.Intn(30) + 1
				matrix[u][v], matrix[v][u] = w, w // symmetric
			}
		}

		rest := make([]int, 0, n-1)
		for i := 1; i < n; i++ {
			rest = append(rest, i)
		}
		expected := math.MaxInt64 / 4
		for _, tail := range permutations(rest) {
			route := append([]int{0}, tail...)
			total := matrix[route[n-1]][0]
			for i := 0; i+1 < n; i++ {
				total += matrix[route[i]][route[i+1]]
			}
			expected = min(expected, total)
		}
		assert(TravellingSalesman(matrix) == expected, "Held-Karp matches brute force")
	}

	// Perfect matchings against brute force over every permutation.
	for trial := 0; trial < 30; trial++ {
		n := rng.Intn(6) + 1
		allowed := make([][]bool, n)
		for p := range allowed {
			allowed[p] = make([]bool, n)
			for t := range allowed[p] {
				allowed[p][t] = rng.Float64() < 0.6
			}
		}

		tasks := make([]int, n)
		for i := range tasks {
			tasks[i] = i
		}
		expected := 0
		for _, assignment := range permutations(tasks) {
			valid := true
			for person, task := range assignment {
				if !allowed[person][task] {
					valid = false
					break
				}
			}
			if valid {
				expected++
			}
		}
		assert(CountPerfectMatchings(allowed) == expected, "matchings match brute force")
	}

	// Minimum partition difference against enumerating every subset.
	for trial := 0; trial < 30; trial++ {
		nums := make([]int, rng.Intn(10)+1)
		total := 0
		for i := range nums {
			nums[i] = rng.Intn(20) + 1
			total += nums[i]
		}

		bestDiff := total
		for mask := 0; mask < 1<<len(nums); mask++ {
			part := 0
			for i := range nums {
				if mask>>i&1 == 1 {
					part += nums[i]
				}
			}
			diff := total - 2*part
			if diff < 0 {
				diff = -diff
			}
			bestDiff = min(bestDiff, diff)
		}
		assert(SubsetSumPartitionMinDifference(nums) == bestDiff, "partition difference")
	}
	// --- Digit DP ------------------------------------------------------------
	assert(CountWithDigitSumAtMost(0, 0) == 1, "just 0 itself")
	assert(CountWithDigitSumAtMost(9, 5) == 6, "0,1,2,3,4,5")
	assert(CountWithDigitSumAtMost(20, 2) == 6, "0,1,2,10,11,20")
	assert(CountWithDigitSumAtMost(-1, 5) == 0, "empty range")
	assert(CountWithDigitSumAtMost(100, 100) == 101, "every value fits")

	// Against brute force over the whole range.
	digitSum := func(x int) int {
		sum := 0
		for ; x > 0; x /= 10 {
			sum += x % 10
		}
		return sum
	}
	for limit := 0; limit < 400; limit++ {
		for _, cap := range []int{0, 1, 5, 9, 15} {
			expected := 0
			for x := 0; x <= limit; x++ {
				if digitSum(x) <= cap {
					expected++
				}
			}
			assert(CountWithDigitSumAtMost(limit, cap) == expected,
				"digit-sum count matches brute force")
		}
	}

	assert(CountInRangeWithDigitSum(10, 20, 2) == 3, "10, 11, 20")
	assert(CountInRangeWithDigitSum(5, 5, 5) == 1, "inclusive at both ends")
	assert(CountInRangeWithDigitSum(20, 10, 5) == 0, "inverted range")

	assert(CountWithoutDigit(9, 4) == 9, "0-9 minus the 4")
	assert(CountWithoutDigit(50, 0) == 45, "the leading-zero trap")
	for limit := 0; limit < 500; limit++ {
		for _, forbidden := range []int{0, 4, 7} {
			expected := 0
			for x := 0; x <= limit; x++ {
				if !strings.ContainsRune(strconv.Itoa(x), rune('0'+forbidden)) {
					expected++
				}
			}
			assert(CountWithoutDigit(limit, forbidden) == expected,
				"forbidden-digit count matches brute force")
		}
	}

	// The point of the whole technique: a range no loop could ever walk.
	assert(CountWithDigitSumAtMost(1000000000000000000, 20) > 0, "10^18, instantly")

	// --- Game theory DP ------------------------------------------------------
	assert(StoneGameMargin([]int{1, 5, 2}) == -2, "every move loses ground")
	assert(StoneGameMargin([]int{5, 3, 4, 5}) == 1, "a one-point win")
	assert(StoneGameMargin([]int{10}) == 10, "take the only stone")
	assert(StoneGameMargin(nil) == 0, "no stones")
	assert(StoneGameMargin([]int{2, 2}) == 0, "symmetric: a draw")

	assert(CanFirstPlayerWin([]int{5, 3, 4, 5}), "first player wins")
	assert(!CanFirstPlayerWin([]int{1, 5, 2}), "first player loses")

	gameRng := rand.New(rand.NewSource(13))
	strictlyFewer, trials := 0, 0
	for t := 0; t < 60; t++ {
		n := gameRng.Intn(9) + 4
		stones := make([]int, n)
		for i := range stones {
			stones[i] = gameRng.Intn(20) + 1
		}

		table := StoneGameMargin(stones)
		plain, plainNodes := MinimaxExplicit(stones, false)
		pruned, prunedNodes := MinimaxExplicit(stones, true)

		assert(plain == table, "search agrees with the DP table")
		assert(pruned == table, "pruning changes NOTHING about the answer")

		// Pruning can never COST nodes - that part is a guarantee.
		assert(prunedNodes <= plainNodes, "alpha-beta never visits more")
		trials++
		if prunedNodes < plainNodes {
			strictlyFewer++
		}
	}
	// How much it saves is input-dependent, so the claim is statistical: on a
	// two-branch game with fixed move ordering there are positions where
	// nothing can be cut. It should still win almost always.
	assert(float64(strictlyFewer) >= 0.9*float64(trials), "pruning usually bites")

	// Brute force over every play sequence, for small inputs.
	var bruteMargin func(remaining []int) int
	bruteMargin = func(remaining []int) int {
		if len(remaining) == 0 {
			return 0
		}
		return max(remaining[0]-bruteMargin(remaining[1:]),
			remaining[len(remaining)-1]-bruteMargin(remaining[:len(remaining)-1]))
	}
	for t := 0; t < 40; t++ {
		stones := make([]int, gameRng.Intn(10))
		for i := range stones {
			stones[i] = gameRng.Intn(9) + 1
		}
		assert(StoneGameMargin(stones) == bruteMargin(stones),
			"the table matches exhaustive play")
	}

	// A deterministic case large enough that pruning definitely bites.
	ordered := make([]int, 16)
	for i := range ordered {
		ordered[i] = i + 1
	}
	_, unprunedNodes := MinimaxExplicit(ordered, false)
	_, alphaBetaNodes := MinimaxExplicit(ordered, true)
	assert(alphaBetaNodes < unprunedNodes, "pruning bites at n=16")
	// n levels of choices plus the empty-range leaves: 2^(n+1) - 1 nodes.
	assert(unprunedNodes == 1<<(len(ordered)+1)-1, "the unpruned tree is full")

	fmt.Printf("  minimax visited %d nodes, alpha-beta %d (%d%% pruned)\n",
		unprunedNodes, alphaBetaNodes, 100-100*alphaBetaNodes/unprunedNodes)

	fmt.Println("15-Dynamic-Programming (Go): all checks passed")
	fmt.Println("  Interval DP checked against every parenthesisation and burst order,")
	fmt.Println("  bitmask DP against every permutation")
}
