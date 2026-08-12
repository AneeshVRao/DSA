// 07 - Recursion and Backtracking: from factorial to N-Queens, all on the same
// choose / explore / un-choose skeleton.
//
// Run:  go run recursion.go
package main

import (
	"fmt"
	"sort"
	"strings"
)

// ============================================================================
// 1. Plain recursion
// ============================================================================

// Factorial is O(n) time and O(n) stack. int overflows past 20!.
func Factorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * Factorial(n-1)
}

// FibNaive is O(2^n): the same subproblems are recomputed exponentially often.
func FibNaive(n int) int {
	if n < 2 {
		return n
	}
	return FibNaive(n-1) + FibNaive(n-2)
}

// FibMemo is O(n) time and space: each state is computed exactly once.
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

// Power is fast exponentiation: x^n = (x^(n/2))^2. O(log n), not O(n).
func Power(base float64, exp int) float64 {
	if exp < 0 {
		return 1 / Power(base, -exp)
	}
	if exp == 0 {
		return 1
	}
	half := Power(base, exp/2)
	if exp%2 == 0 {
		return half * half
	}
	return half * half * base
}

// SumDigits strips one digit per call. O(log n).
func SumDigits(n int) int {
	if n < 0 {
		n = -n
	}
	if n < 10 {
		return n
	}
	return n%10 + SumDigits(n/10)
}

// Move is one Hanoi move: from -> to.
type Move struct{ From, To byte }

// Hanoi returns the optimal move sequence: exactly 2^n - 1 moves.
// To move n disks: move n-1 aside, move the biggest, move the n-1 back.
func Hanoi(n int, source, target, spare byte) []Move {
	if n == 0 {
		return nil
	}
	moves := Hanoi(n-1, source, spare, target)
	moves = append(moves, Move{From: source, To: target})
	return append(moves, Hanoi(n-1, spare, target, source)...)
}

// ============================================================================
// 2. Backtracking - subsets and permutations
// ============================================================================

// Subsets returns all 2^n subsets. O(n * 2^n) - the n is the copy cost.
// At each index the choice is binary: take it or skip it.
func Subsets(nums []int) [][]int {
	var results [][]int
	var path []int

	var backtrack func(start int)
	backtrack = func(start int) {
		// CLONE: appending `path` itself would store an aliasing header.
		results = append(results, append([]int(nil), path...))
		for i := start; i < len(nums); i++ {
			path = append(path, nums[i]) // 1. choose
			backtrack(i + 1)             // 2. explore (i+1: no reuse)
			path = path[:len(path)-1]    // 3. un-choose
		}
	}

	backtrack(0)
	return results
}

// Permutations returns all n! orderings. O(n * n!).
// `used` is what prunes: each element appears once per permutation.
func Permutations(nums []int) [][]int {
	var results [][]int
	path := make([]int, 0, len(nums))
	used := make([]bool, len(nums))

	var backtrack func()
	backtrack = func() {
		if len(path) == len(nums) {
			results = append(results, append([]int(nil), path...))
			return
		}
		for i, x := range nums {
			if used[i] {
				continue // prune: already placed
			}
			used[i] = true
			path = append(path, x)

			backtrack()

			path = path[:len(path)-1]
			used[i] = false // undo BOTH pieces of state
		}
	}

	backtrack()
	return results
}

// CombinationSum returns every combination summing to target; candidates may
// be reused. Sorting lets us break (not continue) once the remainder is too
// small - every later candidate is even bigger.
func CombinationSum(candidates []int, target int) [][]int {
	ordered := append([]int(nil), candidates...)
	sort.Ints(ordered)

	var results [][]int
	var path []int

	var backtrack func(start, remaining int)
	backtrack = func(start, remaining int) {
		if remaining == 0 {
			results = append(results, append([]int(nil), path...))
			return
		}
		for i := start; i < len(ordered); i++ {
			if ordered[i] > remaining {
				break // prune the entire remaining branch
			}
			path = append(path, ordered[i])
			backtrack(i, remaining-ordered[i]) // i, not i+1: reuse allowed
			path = path[:len(path)-1]
		}
	}

	backtrack(0, target)
	return results
}

// GenerateParentheses returns all valid combinations of n pairs (Catalan(n)).
// Two rules make every string valid by construction:
//
//	open < n      -> we may still open
//	close < open  -> we may only close what is already open
func GenerateParentheses(n int) []string {
	var results []string
	var sb []byte

	var backtrack func(open, close int)
	backtrack = func(open, close int) {
		if len(sb) == 2*n {
			results = append(results, string(sb))
			return
		}
		if open < n {
			sb = append(sb, '(')
			backtrack(open+1, close)
			sb = sb[:len(sb)-1]
		}
		if close < open {
			sb = append(sb, ')')
			backtrack(open, close+1)
			sb = sb[:len(sb)-1]
		}
	}

	backtrack(0, 0)
	return results
}

// ============================================================================
// 3. Backtracking on a board
// ============================================================================

// SolveNQueens places n queens so that none attack each other.
//
// One queen per row is baked into the recursion, so only the column and the
// two diagonals need tracking: a cell (r,c) sits on diagonal r-c and
// anti-diagonal r+c, and each must be unique.
//
// Pruning turns a raw 8^8 = 16.7M search into roughly 2k explored nodes.
func SolveNQueens(n int) [][]string {
	var results [][]string
	cols := make([]bool, n)
	diag := make([]bool, 2*n) // indexed r-c+n
	anti := make([]bool, 2*n) // indexed r+c
	placement := make([]int, 0, n)

	var backtrack func(row int)
	backtrack = func(row int) {
		if row == n {
			board := make([]string, 0, n)
			for _, c := range placement {
				board = append(board,
					strings.Repeat(".", c)+"Q"+strings.Repeat(".", n-c-1))
			}
			results = append(results, board)
			return
		}
		for col := 0; col < n; col++ {
			if cols[col] || diag[row-col+n] || anti[row+col] {
				continue // prune: attacked
			}
			cols[col], diag[row-col+n], anti[row+col] = true, true, true
			placement = append(placement, col)

			backtrack(row + 1)

			placement = placement[:len(placement)-1]
			cols[col], diag[row-col+n], anti[row+col] = false, false, false
		}
	}

	backtrack(0)
	return results
}

// WordSearch reports whether word can be traced through adjacent cells.
// O(rows * cols * 4^len). The visited mark is written into the board and
// restored afterwards - that restore IS the backtrack step.
func WordSearch(board [][]byte, word string) bool {
	if word == "" || len(board) == 0 || len(board[0]) == 0 {
		return false
	}
	rows, cols := len(board), len(board[0])

	var backtrack func(r, c, i int) bool
	backtrack = func(r, c, i int) bool {
		if i == len(word) {
			return true
		}
		if r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != word[i] {
			return false // prune: off board or wrong letter
		}
		saved := board[r][c]
		board[r][c] = '#' // mark visited
		found := backtrack(r+1, c, i+1) ||
			backtrack(r-1, c, i+1) ||
			backtrack(r, c+1, i+1) ||
			backtrack(r, c-1, i+1)
		board[r][c] = saved // restore
		return found
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if backtrack(r, c, 0) {
				return true
			}
		}
	}
	return false
}

// ============================================================================
// 4. Turning recursion into iteration
// ============================================================================

// FactorialIterative gives the same answer with O(1) stack.
func FactorialIterative(n int) int {
	result := 1
	for i := 2; i <= n; i++ {
		result *= i
	}
	return result
}

// DFSIterative traverses with an explicit stack instead of the call stack -
// the escape hatch when recursion depth would be a problem.
func DFSIterative(graph map[int][]int, start int) []int {
	visited := make(map[int]struct{})
	var order []int
	stack := []int{start}

	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if _, seen := visited[node]; seen {
			continue
		}
		visited[node] = struct{}{}
		order = append(order, node)

		neighbours := graph[node]
		for i := len(neighbours) - 1; i >= 0; i-- { // reversed: keeps DFS order
			stack = append(stack, neighbours[i])
		}
	}
	return order
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
	assert(Factorial(0) == 1 && Factorial(5) == 120, "factorial")
	assert(FactorialIterative(5) == Factorial(5), "iterative agrees")

	assert(FibNaive(10) == 55, "fib naive")
	assert(FibMemo(50) == 12586269025, "fib memo is instant")

	assert(Power(2, 10) == 1024, "power")
	assert(Power(2, 0) == 1, "power zero")
	assert(Power(2, -2) == 0.25, "negative exponent")
	assert(SumDigits(9875) == 29, "sum digits")

	moves := Hanoi(3, 'A', 'C', 'B')
	assert(len(moves) == 7, "hanoi takes 2^n - 1 moves")
	assert(moves[0] == Move{From: 'A', To: 'C'}, "first move")
	assert(moves[len(moves)-1] == Move{From: 'A', To: 'C'}, "last move")

	subs := Subsets([]int{1, 2, 3})
	assert(len(subs) == 8, "2^3 subsets")
	empty, full := 0, 0
	for _, s := range subs {
		if len(s) == 0 {
			empty++
		}
		if equal(s, []int{1, 2, 3}) {
			full++
		}
	}
	assert(empty == 1 && full == 1, "empty and full subsets present exactly once")

	perms := Permutations([]int{1, 2, 3})
	assert(len(perms) == 6, "3! permutations")
	seen := make(map[string]struct{})
	for _, p := range perms {
		seen[fmt.Sprint(p)] = struct{}{}
	}
	assert(len(seen) == 6, "all permutations distinct")

	combos := CombinationSum([]int{2, 3, 6, 7}, 7)
	assert(len(combos) == 2, "two combinations sum to 7")
	sort.Slice(combos, func(i, j int) bool { return len(combos[i]) > len(combos[j]) })
	assert(equal(combos[0], []int{2, 2, 3}) && equal(combos[1], []int{7}), "combination sum")

	parens := GenerateParentheses(3)
	assert(len(parens) == 5, "Catalan(3) = 5")
	found := false
	for _, p := range parens {
		if p == "((()))" {
			found = true
		}
	}
	assert(found, "fully nested form present")

	assert(len(SolveNQueens(4)) == 2, "two 4x4 solutions")
	assert(len(SolveNQueens(8)) == 92, "92 solutions for 8 queens")
	assert(len(SolveNQueens(1)) == 1, "trivial board")
	assert(len(SolveNQueens(3)) == 0, "3x3 has no solution")

	board := [][]byte{
		[]byte("ABCE"),
		[]byte("SFCS"),
		[]byte("ADEE"),
	}
	assert(WordSearch(board, "ABCCED"), "word found")
	assert(WordSearch(board, "SEE"), "second word found")
	assert(!WordSearch(board, "ABCB"), "cannot reuse a cell")
	assert(string(board[0]) == "ABCE", "board restored, not corrupted")

	graph := map[int][]int{1: {2, 3}, 2: {4}, 3: {4}, 4: {}}
	assert(equal(DFSIterative(graph, 1), []int{1, 2, 4, 3}), "iterative DFS")

	fmt.Println("07-Recursion-Backtracking (Go): all checks passed")
}
