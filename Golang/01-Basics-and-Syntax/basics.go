// 01 - Basics and Syntax: the Go you need before any algorithm.
//
// Run:  go run basics.go
package main

import (
	"fmt"
	"sort"
	"strings"
)

// ------------------------------------------------------------------ slices --

// sliceBasics shows the append/len/cap trio. append may reallocate, so the
// result MUST be reassigned - the classic Go beginner bug is ignoring it.
func sliceBasics() []int {
	s := make([]int, 0, 4) // len 0, cap 4: no reallocation for 4 appends
	s = append(s, 3, 1, 2)
	sort.Ints(s)
	return s
}

// aliasing demonstrates that a sub-slice SHARES the backing array.
// Returns (original after mutation, independent copy).
func aliasing() ([]int, []int) {
	s := []int{1, 2, 3, 4}

	view := s[1:3] // shares memory with s
	view[0] = 99   // therefore s[1] becomes 99 too

	cp := append([]int(nil), s...) // the idiomatic deep-ish copy
	cp[0] = -1                     // does not touch s

	return s, cp
}

// makeGrid allocates each row separately: Go has no 2-D slice literal.
func makeGrid(rows, cols int) [][]int {
	grid := make([][]int, rows)
	for i := range grid {
		grid[i] = make([]int, cols) // zero-filled by definition
	}
	return grid
}

// -------------------------------------------------------------------- maps --

// frequency counts runes. Reading a missing key yields the zero value,
// so `m[r]++` needs no initialisation check.
func frequency(s string) map[rune]int {
	freq := make(map[rune]int)
	for _, r := range s { // range over a string yields runes, not bytes
		freq[r]++
	}
	return freq
}

// sortedKeys exists because map iteration order in Go is deliberately random.
// Anything deterministic must sort the keys first.
func sortedKeys(m map[string]int) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

// countKnown uses map[T]struct{} as a set - struct{} allocates zero bytes.
func countKnown(nums, queries []int) int {
	seen := make(map[int]struct{}, len(nums))
	for _, n := range nums {
		seen[n] = struct{}{}
	}
	count := 0
	for _, q := range queries {
		if _, ok := seen[q]; ok { // the comma-ok idiom
			count++
		}
	}
	return count
}

// ----------------------------------------------------------------- structs --

// Node is a singly linked list node. Capitalised fields are exported.
type Node struct {
	Val  int
	Next *Node
}

// Push uses a pointer receiver because it mutates the receiver.
func (n *Node) Push(v int) {
	n.Next = &Node{Val: v}
}

// String uses a value receiver and satisfies fmt.Stringer.
func (n Node) String() string {
	return fmt.Sprintf("Node(%d)", n.Val)
}

// ---------------------------------------------------------------- closures --

// counter returns a closure over its own local state - the Go replacement for
// instance variables in small helpers.
func counter() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

// ----------------------------------------------------------------- strings --

// buildString uses strings.Builder. Using `out += part` in a loop is O(n^2)
// because Go strings are immutable.
func buildString(parts []string) string {
	var sb strings.Builder
	for _, p := range parts {
		sb.WriteString(p)
	}
	return sb.String()
}

// ------------------------------------------------------------------- sort ---

type person struct {
	name  string
	score int
}

// sortPeople sorts by score descending, then name ascending.
func sortPeople(people []person) []person {
	out := append([]person(nil), people...)
	sort.Slice(out, func(i, j int) bool {
		if out[i].score != out[j].score {
			return out[i].score > out[j].score
		}
		return out[i].name < out[j].name
	})
	return out
}

// -------------------------------------------------------------------- demo --

// assert is a tiny helper so this file needs no test framework.
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
	assert(equal(sliceBasics(), []int{1, 2, 3}), "sliceBasics")

	orig, cp := aliasing()
	assert(equal(orig, []int{1, 99, 3, 4}), "sub-slices share memory")
	assert(cp[0] == -1 && orig[0] == 1, "append-copy is independent")

	grid := makeGrid(2, 3)
	grid[0][0] = 9
	assert(grid[1][0] == 0, "rows are independent allocations")

	freq := frequency("aab")
	assert(freq['a'] == 2 && freq['b'] == 1, "frequency")

	keys := sortedKeys(map[string]int{"b": 1, "a": 2})
	assert(keys[0] == "a" && keys[1] == "b", "sortedKeys")

	assert(countKnown([]int{1, 2, 3}, []int{2, 2, 9}) == 2, "countKnown")

	n := Node{Val: 1}
	n.Push(2)
	assert(n.Next.Val == 2, "Push")
	assert(n.String() == "Node(1)", "String")

	next := counter()
	assert(next() == 1 && next() == 2, "closure keeps state")

	assert(buildString([]string{"a", "b", "c"}) == "abc", "buildString")

	sorted := sortPeople([]person{{"bob", 5}, {"amy", 9}, {"cat", 5}})
	assert(sorted[0].name == "amy" && sorted[1].name == "bob", "sortPeople")

	// Integer division truncates toward zero (Python would floor to -4).
	assert(-7/2 == -3, "integer division truncates")

	fmt.Println("01-Basics-and-Syntax (Go): all checks passed")
}
