// 12 - Binary Search Tree: the full structure plus the problems whose
// solutions exist only because of the ordering invariant.
//
// Run:  go run bst.go
package main

import (
	"fmt"
	"math"
)

// ============================================================================
// Node
// ============================================================================

// TreeNode is a BST node. A nil *TreeNode is the empty tree.
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// ============================================================================
// 1. The BST itself
// ============================================================================

// BST keeps its size so Len is O(1). Every other operation is O(h).
type BST struct {
	root *TreeNode
	size int
}

func NewBST(values ...int) *BST {
	t := &BST{}
	for _, v := range values {
		t.Insert(v)
	}
	return t
}

func (t *BST) Root() *TreeNode { return t.root }
func (t *BST) Len() int        { return t.size }

// Insert adds a value unless it is already present. O(h).
// Iterative rather than recursive: sorted input builds a degenerate tree, and
// there is no reason to burn O(n) stack on it.
func (t *BST) Insert(val int) bool {
	if t.root == nil {
		t.root = &TreeNode{Val: val}
		t.size++
		return true
	}
	node := t.root
	for {
		switch {
		case val == node.Val:
			return false // no duplicates in this BST
		case val < node.Val:
			if node.Left == nil {
				node.Left = &TreeNode{Val: val}
				t.size++
				return true
			}
			node = node.Left
		default:
			if node.Right == nil {
				node.Right = &TreeNode{Val: val}
				t.size++
				return true
			}
			node = node.Right
		}
	}
}

// Search is O(h): each comparison discards an entire subtree.
func (t *BST) Search(val int) *TreeNode {
	node := t.root
	for node != nil {
		switch {
		case val == node.Val:
			return node
		case val < node.Val:
			node = node.Left
		default:
			node = node.Right
		}
	}
	return nil
}

func (t *BST) Contains(val int) bool { return t.Search(val) != nil }

// Min returns the leftmost value. O(h).
func (t *BST) Min() (int, bool) {
	if t.root == nil {
		return 0, false
	}
	node := t.root
	for node.Left != nil {
		node = node.Left
	}
	return node.Val, true
}

// Max returns the rightmost value. O(h).
func (t *BST) Max() (int, bool) {
	if t.root == nil {
		return 0, false
	}
	node := t.root
	for node.Right != nil {
		node = node.Right
	}
	return node.Val, true
}

func (t *BST) Delete(val int) bool {
	found := t.Contains(val)
	t.root = removeFrom(t.root, val)
	if found {
		t.size--
	}
	return found
}

func removeFrom(node *TreeNode, val int) *TreeNode {
	if node == nil {
		return nil
	}
	switch {
	case val < node.Val:
		node.Left = removeFrom(node.Left, val)
		return node
	case val > node.Val:
		node.Right = removeFrom(node.Right, val)
		return node
	}

	// Cases 1 and 2: zero or one child - splice the child up.
	if node.Left == nil {
		return node.Right
	}
	if node.Right == nil {
		return node.Left
	}

	// Case 3: two children. Copy the inorder successor's value here, then
	// delete the successor from the right subtree. It is the leftmost node
	// there, so it has at most one child - case 1 or 2 handles it at once.
	successor := node.Right
	for successor.Left != nil {
		successor = successor.Left
	}
	node.Val = successor.Val
	node.Right = removeFrom(node.Right, successor.Val)
	return node
}

// Inorder returns SORTED values - the defining property of a BST. O(n).
func (t *BST) Inorder() []int {
	var out []int
	var stack []*TreeNode
	node := t.root
	for node != nil || len(stack) > 0 {
		for node != nil {
			stack = append(stack, node)
			node = node.Left
		}
		node = stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		out = append(out, node.Val)
		node = node.Right
	}
	return out
}

func (t *BST) Height() int { return heightOf(t.root) }

func heightOf(node *TreeNode) int {
	if node == nil {
		return -1
	}
	return 1 + max(heightOf(node.Left), heightOf(node.Right))
}

// ============================================================================
// 2. Validation
// ============================================================================

// IsValidBST is O(n). Checking only parent-vs-child is the classic wrong
// answer: every node must fall inside the range inherited from ALL ancestors.
func IsValidBST(root *TreeNode) bool {
	var check func(node *TreeNode, low, high int) bool
	check = func(node *TreeNode, low, high int) bool {
		if node == nil {
			return true
		}
		if node.Val <= low || node.Val >= high {
			return false
		}
		return check(node.Left, low, node.Val) && check(node.Right, node.Val, high)
	}
	return check(root, math.MinInt64, math.MaxInt64)
}

// ============================================================================
// 3. Order statistics
// ============================================================================

// KthSmallest returns the kth smallest value (1-based). O(h + k): the
// iterative walk stops as soon as k is reached.
func KthSmallest(root *TreeNode, k int) (int, bool) {
	var stack []*TreeNode
	node := root
	count := 0
	for node != nil || len(stack) > 0 {
		for node != nil {
			stack = append(stack, node)
			node = node.Left
		}
		node = stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		count++
		if count == k {
			return node.Val, true
		}
		node = node.Right
	}
	return 0, false
}

// InorderSuccessor returns the smallest value strictly greater than target.
// O(h) with no parent pointers: each time we move LEFT, the node we left is
// a candidate.
func InorderSuccessor(root *TreeNode, target int) (int, bool) {
	successor, found := 0, false
	node := root
	for node != nil {
		if target < node.Val {
			successor, found = node.Val, true // may be beaten deeper left
			node = node.Left
		} else {
			node = node.Right // everything here is too small
		}
	}
	return successor, found
}

// ============================================================================
// 4. Searching with the invariant
// ============================================================================

// LCABst finds the lowest common ancestor in O(h) without searching both
// subtrees: the first node whose value lies between p and q IS the split point.
func LCABst(root *TreeNode, p, q int) (int, bool) {
	low, high := min(p, q), max(p, q)
	node := root
	for node != nil {
		switch {
		case node.Val > high:
			node = node.Left // both targets are smaller
		case node.Val < low:
			node = node.Right // both targets are larger
		default:
			return node.Val, true // low <= node.Val <= high: they split here
		}
	}
	return 0, false
}

// FloorValue returns the largest value <= target. O(h).
func FloorValue(root *TreeNode, target int) (int, bool) {
	best, found := 0, false
	node := root
	for node != nil {
		switch {
		case node.Val == target:
			return node.Val, true
		case node.Val < target:
			best, found = node.Val, true // valid, but a bigger one may exist
			node = node.Right
		default:
			node = node.Left
		}
	}
	return best, found
}

// CeilValue returns the smallest value >= target. O(h).
func CeilValue(root *TreeNode, target int) (int, bool) {
	best, found := 0, false
	node := root
	for node != nil {
		switch {
		case node.Val == target:
			return node.Val, true
		case node.Val > target:
			best, found = node.Val, true
			node = node.Left
		default:
			node = node.Right
		}
	}
	return best, found
}

// RangeSum sums values in [low, high]. The pruning is the point: a node below
// low makes its whole left subtree irrelevant, and vice versa.
func RangeSum(root *TreeNode, low, high int) int {
	if root == nil {
		return 0
	}
	if root.Val < low {
		return RangeSum(root.Right, low, high)
	}
	if root.Val > high {
		return RangeSum(root.Left, low, high)
	}
	return root.Val + RangeSum(root.Left, low, high) + RangeSum(root.Right, low, high)
}

// ============================================================================
// 5. Construction
// ============================================================================

// SortedArrayToBST builds a HEIGHT-BALANCED tree from sorted input. O(n).
// Inserting the same values one at a time would produce height n-1.
func SortedArrayToBST(values []int) *TreeNode {
	var build func(lo, hi int) *TreeNode
	build = func(lo, hi int) *TreeNode {
		if lo > hi {
			return nil
		}
		mid := lo + (hi-lo)/2
		return &TreeNode{
			Val:   values[mid],
			Left:  build(lo, mid-1),
			Right: build(mid+1, hi),
		}
	}
	return build(0, len(values)-1)
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
	//            8
	//          /   \
	//         3     10
	//        / \      \
	//       1   6      14
	//          / \     /
	//         4   7   13
	bst := NewBST(8, 3, 10, 1, 6, 14, 4, 7, 13)
	assert(bst.Len() == 9, "size")
	assert(equal(bst.Inorder(), []int{1, 3, 4, 6, 7, 8, 10, 13, 14}), "inorder is sorted")

	assert(!bst.Insert(8), "duplicates rejected")
	assert(bst.Len() == 9, "size unchanged after duplicate")
	assert(bst.Contains(6) && !bst.Contains(5), "contains")

	v, ok := bst.Min()
	assert(v == 1 && ok, "min")
	v, ok = bst.Max()
	assert(v == 14 && ok, "max")
	_, ok = NewBST().Min()
	assert(!ok, "min of empty tree")

	assert(IsValidBST(bst.Root()), "valid BST")
	// The classic invalid tree: 4 sits in the RIGHT subtree of 5.
	bad := &TreeNode{Val: 5,
		Left:  &TreeNode{Val: 1},
		Right: &TreeNode{Val: 7, Left: &TreeNode{Val: 4}}}
	assert(!IsValidBST(bad), "local checks are not enough")
	assert(IsValidBST(nil), "empty tree is valid")

	// Deletion, all three cases; the tree must stay valid and sorted.
	assert(bst.Delete(1), "delete a leaf")
	assert(equal(bst.Inorder(), []int{3, 4, 6, 7, 8, 10, 13, 14}), "after leaf delete")
	assert(bst.Delete(14), "delete a one-child node")
	assert(equal(bst.Inorder(), []int{3, 4, 6, 7, 8, 10, 13}), "after one-child delete")
	assert(bst.Delete(3), "delete a two-child node")
	assert(equal(bst.Inorder(), []int{4, 6, 7, 8, 10, 13}), "after two-child delete")
	assert(IsValidBST(bst.Root()) && bst.Len() == 6, "still a valid BST")
	assert(!bst.Delete(999), "deleting a missing value reports false")

	// Deleting through the root repeatedly must keep the tree valid.
	drain := NewBST(5, 3, 8, 2, 4, 7, 9)
	for _, value := range []int{5, 3, 8, 2, 4, 7, 9} {
		assert(drain.Delete(value), "drain delete")
		assert(IsValidBST(drain.Root()), "valid after each delete")
	}
	assert(len(drain.Inorder()) == 0 && drain.Len() == 0, "drained")

	fresh := NewBST(8, 3, 10, 1, 6, 14, 4, 7, 13)
	v, ok = KthSmallest(fresh.Root(), 1)
	assert(v == 1 && ok, "1st smallest")
	v, _ = KthSmallest(fresh.Root(), 5)
	assert(v == 7, "5th smallest")
	v, _ = KthSmallest(fresh.Root(), 9)
	assert(v == 14, "9th smallest")
	_, ok = KthSmallest(fresh.Root(), 99)
	assert(!ok, "k beyond the tree")

	v, ok = InorderSuccessor(fresh.Root(), 7)
	assert(v == 8 && ok, "successor")
	v, _ = InorderSuccessor(fresh.Root(), 5)
	assert(v == 6, "successor of an absent value")
	_, ok = InorderSuccessor(fresh.Root(), 14)
	assert(!ok, "no successor for the maximum")

	v, _ = LCABst(fresh.Root(), 1, 6)
	assert(v == 3, "LCA inside a subtree")
	v, _ = LCABst(fresh.Root(), 4, 13)
	assert(v == 8, "LCA at the root")
	v, _ = LCABst(fresh.Root(), 3, 4)
	assert(v == 3, "a node is its own ancestor")

	v, _ = FloorValue(fresh.Root(), 5)
	assert(v == 4, "floor")
	v, _ = FloorValue(fresh.Root(), 6)
	assert(v == 6, "floor with an exact match")
	_, ok = FloorValue(fresh.Root(), 0)
	assert(!ok, "no floor below the minimum")
	v, _ = CeilValue(fresh.Root(), 5)
	assert(v == 6, "ceiling")
	_, ok = CeilValue(fresh.Root(), 15)
	assert(!ok, "no ceiling above the maximum")

	assert(RangeSum(fresh.Root(), 6, 10) == 6+7+8+10, "range sum")
	assert(RangeSum(fresh.Root(), 100, 200) == 0, "empty range")

	// Balanced construction: 15 sorted values give height 3, not 14.
	values := make([]int, 15)
	for i := range values {
		values[i] = i + 1
	}
	balanced := SortedArrayToBST(values)
	assert(IsValidBST(balanced), "balanced tree is valid")
	assert(heightOf(balanced) == 3, "height log2(16)-1")
	assert(NewBST(values...).Height() == 14, "sorted inserts degenerate")

	fmt.Println("12-Binary-Search-Tree (Go): all checks passed")
}
