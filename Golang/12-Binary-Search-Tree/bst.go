// 12 - Binary Search Tree: the full structure plus the problems whose
// solutions exist only because of the ordering invariant.
//
// Run:  go run bst.go
package main

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
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

// ============================================================================
// 6. AVL - a BST that keeps itself balanced
// ============================================================================

// AVLNode is a BST node that also caches its own subtree height.
//
// The height must be STORED, not computed. Recomputing it would make every
// insert O(n); cached, it updates in O(1) as the recursion unwinds.
type AVLNode struct {
	Val    int
	Left   *AVLNode
	Right  *AVLNode
	Height int // a leaf has height 1
}

// AVLTree is a self-balancing BST. Every operation is O(log n) GUARANTEED.
//
// THE PROBLEM IT SOLVES. A plain BST is O(log n) only if the data arrives in a
// lucky order. Insert 1, 2, 3, 4, 5 in order and every node becomes a right
// child - the tree degenerates into a linked list and search is O(n). Sorted
// input is not a pathological case, it is the single most common one.
//
// THE INVARIANT. For every node,
//
//	balance = height(left) - height(right)   is in {-1, 0, +1}
//
// That one constraint forces height <= 1.44 * log2(n). (Sketch: let N(h) be the
// fewest nodes in an AVL tree of height h. Then N(h) = 1 + N(h-1) + N(h-2) -
// the Fibonacci recurrence - so N(h) grows exponentially and h is logarithmic.)
//
// THE FOUR CASES. After an insert or delete one node may reach a balance of
// +/-2. Which rotation fixes it depends on WHERE the offending subtree sits:
//
//	LL  balance > 1,  went left-left    -> rotate right
//	RR  balance < -1, went right-right  -> rotate left
//	LR  balance > 1,  went left-right   -> rotate left on the child, then
//	                                       right on the node
//	RL  balance < -1, went right-left   -> rotate right on the child, then
//	                                       left on the node
//
// LR and RL are not new operations - they are the single rotations applied
// twice. The first straightens the zig-zag into a line; the second is then the
// simple case.
//
// A rotation is O(1): three pointer writes and two height updates. Only the
// LOWEST unbalanced node needs rotating on insert - one rotation restores the
// whole tree, because it also restores the subtree's original height. Delete is
// harder: it can SHORTEN a subtree, so rebalancing may cascade to the root, up
// to O(log n) rotations.
//
// AVL vs red-black: AVL is more strictly balanced (faster lookups), red-black
// rotates less on write (faster inserts). Which is why C++ std::map, Java
// TreeMap and the Linux kernel all use red-black, while read-heavy database
// indexes lean AVL.
//
// Go's standard library has no ordered map either - the built-in map is a hash
// table with randomised iteration order - so ordered lookups mean bringing this
// yourself or sorting.
type AVLTree struct {
	root *AVLNode
	size int
}

// avlHeight returns the height of a possibly-nil subtree. Empty is height 0.
func avlHeight(node *AVLNode) int {
	if node == nil {
		return 0
	}
	return node.Height
}

func avlUpdateHeight(node *AVLNode) {
	node.Height = 1 + max(avlHeight(node.Left), avlHeight(node.Right))
}

// avlBalance is left height minus right height. Positive means left-heavy.
func avlBalance(node *AVLNode) int {
	if node == nil {
		return 0
	}
	return avlHeight(node.Left) - avlHeight(node.Right)
}

// avlRotateRight is the left-heavy fix. O(1).
//
//	     node                 pivot
//	    /    \                /     \
//	 pivot    C      ->      A      node
//	 /   \                          /    \
//	A     B                        B      C
//
// B moves from pivot's right to node's left. Every value in B is greater than
// pivot and less than node, so it is legal in either position - which is
// exactly why a rotation preserves the BST ordering.
//
// Update pivot's height AFTER node's: node is now pivot's child, so its height
// has to be settled first.
func avlRotateRight(node *AVLNode) *AVLNode {
	pivot := node.Left
	node.Left = pivot.Right
	pivot.Right = node

	avlUpdateHeight(node) // the lower node first
	avlUpdateHeight(pivot)
	return pivot // the new subtree root
}

// avlRotateLeft is the right-heavy fix - the exact mirror. O(1).
func avlRotateLeft(node *AVLNode) *AVLNode {
	pivot := node.Right
	node.Right = pivot.Left
	pivot.Left = node

	avlUpdateHeight(node)
	avlUpdateHeight(pivot)
	return pivot
}

// avlRebalance restores the invariant at one node, returning the new root.
func avlRebalance(node *AVLNode) *AVLNode {
	avlUpdateHeight(node)
	balance := avlBalance(node)

	if balance > 1 { // left-heavy
		if avlBalance(node.Left) < 0 { // LR: straighten the zig-zag first
			node.Left = avlRotateLeft(node.Left)
		}
		return avlRotateRight(node) // LL
	}
	if balance < -1 { // right-heavy
		if avlBalance(node.Right) > 0 { // RL: straighten first
			node.Right = avlRotateRight(node.Right)
		}
		return avlRotateLeft(node) // RR
	}
	return node // already balanced
}

// Insert adds a value. O(log n) guaranteed. Reports false if already present.
func (t *AVLTree) Insert(value int) bool {
	inserted := false

	var go_ func(node *AVLNode) *AVLNode
	go_ = func(node *AVLNode) *AVLNode {
		if node == nil {
			inserted = true
			return &AVLNode{Val: value, Height: 1}
		}
		switch {
		case value < node.Val:
			node.Left = go_(node.Left)
		case value > node.Val:
			node.Right = go_(node.Right)
		default:
			return node // duplicate: nothing changes
		}
		return avlRebalance(node) // unwinding: fix on the way up
	}

	t.root = go_(t.root)
	if inserted {
		t.size++
	}
	return inserted
}

// Delete removes a value. O(log n) guaranteed. Reports false if absent.
//
// The three BST delete cases are unchanged - what AVL adds is the rebalance as
// the recursion unwinds. Unlike insert, deletion can shorten a subtree, so one
// rotation may not be enough and the fixing can cascade to the root.
func (t *AVLTree) Delete(value int) bool {
	removed := false

	// Remove the leftmost node, rebalancing on the way back up.
	var deleteMin func(node *AVLNode) *AVLNode
	deleteMin = func(node *AVLNode) *AVLNode {
		if node.Left == nil {
			return node.Right
		}
		node.Left = deleteMin(node.Left)
		return avlRebalance(node)
	}

	var go_ func(node *AVLNode) *AVLNode
	go_ = func(node *AVLNode) *AVLNode {
		if node == nil {
			return nil
		}
		switch {
		case value < node.Val:
			node.Left = go_(node.Left)
		case value > node.Val:
			node.Right = go_(node.Right)
		default:
			removed = true
			if node.Left == nil { // 0 or 1 child: splice it out
				return node.Right
			}
			if node.Right == nil {
				return node.Left
			}
			// Two children: replace with the in-order successor (the smallest
			// value on the right), then delete that successor.
			successor := node.Right
			for successor.Left != nil {
				successor = successor.Left
			}
			node.Val = successor.Val
			node.Right = deleteMin(node.Right)
		}
		return avlRebalance(node)
	}

	t.root = go_(t.root)
	if removed {
		t.size--
	}
	return removed
}

// Contains is O(log n) guaranteed - the whole point of the structure.
func (t *AVLTree) Contains(value int) bool {
	node := t.root
	for node != nil {
		if value == node.Val {
			return true
		}
		if value < node.Val {
			node = node.Left
		} else {
			node = node.Right
		}
	}
	return false
}

// Inorder returns the values in sorted order. O(n).
func (t *AVLTree) Inorder() []int {
	out := []int{}
	stack := []*AVLNode{}
	node := t.root
	for len(stack) > 0 || node != nil {
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

// Size returns the number of stored values.
func (t *AVLTree) Size() int { return t.size }

// Height returns the tree height, counting NODES (an empty tree is 0).
func (t *AVLTree) Height() int { return avlHeight(t.root) }

// IsBalanced verifies the invariant everywhere - for the tests, not for users.
func (t *AVLTree) IsBalanced() bool {
	var check func(node *AVLNode) bool
	check = func(node *AVLNode) bool {
		if node == nil {
			return true
		}
		balance := avlBalance(node)
		if balance > 1 || balance < -1 {
			return false
		}
		// The cached height must also be honest, or the balance is a lie.
		if node.Height != 1+max(avlHeight(node.Left), avlHeight(node.Right)) {
			return false
		}
		return check(node.Left) && check(node.Right)
	}
	return check(t.root)
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

	// --- AVL ------------------------------------------------------------------
	// The case a plain BST cannot survive: strictly increasing input.
	avl := &AVLTree{}
	for value := 1; value <= 31; value++ {
		avl.Insert(value)
	}
	assert(avl.Height() == 5, "log2(32) - actually balanced")
	assert(avl.Size() == 31, "every value stored")
	assert(avl.IsBalanced(), "invariant holds after 31 sorted inserts")

	sorted := make([]int, 31)
	for i := range sorted {
		sorted[i] = i + 1
	}
	assert(equal(avl.Inorder(), sorted), "in-order walk is sorted")

	// Each of the four rotation cases, in isolation. All four must end up as
	// the same balanced tree rooted at 20.
	for _, order := range [][]int{
		{30, 20, 10}, // left-left
		{10, 20, 30}, // right-right
		{30, 10, 20}, // left-right
		{10, 30, 20}, // right-left
	} {
		tree := &AVLTree{}
		for _, value := range order {
			tree.Insert(value)
		}
		assert(tree.Height() == 2, "one rotation flattens three nodes")
		assert(equal(tree.Inorder(), []int{10, 20, 30}), "ordering survives")
		assert(tree.IsBalanced(), "balanced after rotation")
	}

	// Duplicates are rejected, and the size stays honest.
	dup := &AVLTree{}
	assert(dup.Insert(5), "first insert succeeds")
	assert(!dup.Insert(5), "duplicate is rejected")
	assert(dup.Size() == 1, "size counts distinct values")
	assert(!dup.Delete(99), "deleting an absent value reports false")
	assert(dup.Delete(5) && dup.Size() == 0, "delete empties the tree")
	assert(len(dup.Inorder()) == 0, "empty tree walks to nothing")

	// Against a sorted reference, with the invariant re-checked after EVERY
	// operation - a rotation bug that only shows up mid-sequence would be
	// invisible to an end-state-only test.
	avlRng := rand.New(rand.NewSource(12))
	for trial := 0; trial < 60; trial++ {
		tree := &AVLTree{}
		reference := map[int]struct{}{}

		for step := 0; step < 80; step++ {
			value := avlRng.Intn(41)
			_, present := reference[value]
			if avlRng.Float64() < 0.65 {
				assert(tree.Insert(value) == !present, "insert reports novelty")
				reference[value] = struct{}{}
			} else {
				assert(tree.Delete(value) == present, "delete reports presence")
				delete(reference, value)
			}

			expected := make([]int, 0, len(reference))
			for v := range reference {
				expected = append(expected, v)
			}
			sort.Ints(expected)

			// An in-order walk that comes out sorted IS the BST invariant.
			assert(equal(tree.Inorder(), expected), "still a sorted BST")
			assert(tree.IsBalanced(), "still within +/-1 everywhere")
			assert(tree.Size() == len(reference), "size stays honest")

			// The height bound AVL promises: h <= 1.44 * log2(n + 2)
			if len(reference) > 0 {
				bound := 1.44 * math.Log2(float64(len(reference)+2))
				assert(float64(tree.Height()) <= bound, "height bound holds")
			}
		}
	}

	fmt.Println("12-Binary-Search-Tree (Go): all checks passed")
	fmt.Println("  AVL invariant re-verified after every one of 4800 random " +
		"insert/delete operations")
}
