// 11 - Trees: binary trees, all four traversals (recursive, iterative and
// Morris), and the bottom-up recursion pattern that solves most tree problems.
//
// Run:  go run trees.go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// ============================================================================
// Node and construction
// ============================================================================

// TreeNode is a binary tree node. A nil *TreeNode IS the empty tree, so no
// separate empty case is ever needed.
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// Null marks a missing child in the level-order input format below.
// (Using a sentinel keeps the test data as readable as LeetCode's.)
const Null = -1 << 62

// BuildTree constructs a tree from a level-order slice where Null means
// "no child here".
func BuildTree(values []int) *TreeNode {
	if len(values) == 0 || values[0] == Null {
		return nil
	}
	root := &TreeNode{Val: values[0]}
	queue := []*TreeNode{root}
	head, i := 0, 1
	for head < len(queue) && i < len(values) {
		node := queue[head]
		head++
		if i < len(values) {
			if values[i] != Null {
				node.Left = &TreeNode{Val: values[i]}
				queue = append(queue, node.Left)
			}
			i++
		}
		if i < len(values) {
			if values[i] != Null {
				node.Right = &TreeNode{Val: values[i]}
				queue = append(queue, node.Right)
			}
			i++
		}
	}
	return root
}

// ============================================================================
// 1. Depth-first traversals - recursive
// ============================================================================

// Preorder visits node, left, right. O(n) time, O(h) stack.
func Preorder(root *TreeNode) []int {
	if root == nil {
		return nil
	}
	out := []int{root.Val}
	out = append(out, Preorder(root.Left)...)
	return append(out, Preorder(root.Right)...)
}

// Inorder visits left, node, right. On a BST this comes out SORTED.
func Inorder(root *TreeNode) []int {
	if root == nil {
		return nil
	}
	out := Inorder(root.Left)
	out = append(out, root.Val)
	return append(out, Inorder(root.Right)...)
}

// Postorder visits left, right, node - the shape of bottom-up computation.
func Postorder(root *TreeNode) []int {
	if root == nil {
		return nil
	}
	out := Postorder(root.Left)
	out = append(out, Postorder(root.Right)...)
	return append(out, root.Val)
}

// ============================================================================
// 2. Depth-first traversals - iterative
// ============================================================================

// PreorderIterative pushes RIGHT first so the left child is processed first.
func PreorderIterative(root *TreeNode) []int {
	if root == nil {
		return nil
	}
	var out []int
	stack := []*TreeNode{root}
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		out = append(out, node.Val)
		if node.Right != nil {
			stack = append(stack, node.Right)
		}
		if node.Left != nil {
			stack = append(stack, node.Left)
		}
	}
	return out
}

// InorderIterative dives left pushing nodes, pops, visits, then turns right.
func InorderIterative(root *TreeNode) []int {
	var out []int
	var stack []*TreeNode
	node := root
	for node != nil || len(stack) > 0 {
		for node != nil { // as far left as possible
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

// PostorderIterative does preorder as node-right-left, then reverses it -
// much easier to get right than the two-stack variant.
func PostorderIterative(root *TreeNode) []int {
	if root == nil {
		return nil
	}
	var out []int
	stack := []*TreeNode{root}
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		out = append(out, node.Val)
		if node.Left != nil {
			stack = append(stack, node.Left)
		}
		if node.Right != nil {
			stack = append(stack, node.Right)
		}
	}
	for lo, hi := 0, len(out)-1; lo < hi; lo, hi = lo+1, hi-1 {
		out[lo], out[hi] = out[hi], out[lo]
	}
	return out
}

// MorrisInorder produces inorder in O(1) space - no stack, no recursion.
//
// Each node with a left child gets a temporary thread from its inorder
// predecessor (rightmost node of the left subtree) back to itself. Following
// that thread returns us here; it is then removed, so the tree is left
// exactly as it was found.
func MorrisInorder(root *TreeNode) []int {
	var out []int
	node := root
	for node != nil {
		if node.Left == nil {
			out = append(out, node.Val)
			node = node.Right
			continue
		}
		predecessor := node.Left
		for predecessor.Right != nil && predecessor.Right != node {
			predecessor = predecessor.Right
		}
		if predecessor.Right == nil {
			predecessor.Right = node // create the thread
			node = node.Left
		} else {
			predecessor.Right = nil // thread used: undo it
			out = append(out, node.Val)
			node = node.Right
		}
	}
	return out
}

// ============================================================================
// 3. Breadth-first traversal
// ============================================================================

// LevelOrder returns one slice per level. O(n) time, O(w) space.
// Capturing the level size before the inner loop is what separates levels.
func LevelOrder(root *TreeNode) [][]int {
	if root == nil {
		return nil
	}
	var levels [][]int
	queue := []*TreeNode{root}
	head := 0
	for head < len(queue) {
		levelSize := len(queue) - head
		level := make([]int, 0, levelSize)
		for i := 0; i < levelSize; i++ {
			node := queue[head]
			head++
			level = append(level, node.Val)
			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}
		levels = append(levels, level)
	}
	return levels
}

func ZigzagLevelOrder(root *TreeNode) [][]int {
	levels := LevelOrder(root)
	for i := 1; i < len(levels); i += 2 {
		for lo, hi := 0, len(levels[i])-1; lo < hi; lo, hi = lo+1, hi-1 {
			levels[i][lo], levels[i][hi] = levels[i][hi], levels[i][lo]
		}
	}
	return levels
}

// RightSideView is what you see standing to the right: the last node per level.
func RightSideView(root *TreeNode) []int {
	var out []int
	for _, level := range LevelOrder(root) {
		out = append(out, level[len(level)-1])
	}
	return out
}

// ============================================================================
// 4. Bottom-up recursion
// ============================================================================

// Height counts EDGES: empty tree -1, single node 0.
func Height(root *TreeNode) int {
	if root == nil {
		return -1
	}
	return 1 + max(Height(root.Left), Height(root.Right))
}

func CountNodes(root *TreeNode) int {
	if root == nil {
		return 0
	}
	return 1 + CountNodes(root.Left) + CountNodes(root.Right)
}

func CountLeaves(root *TreeNode) int {
	if root == nil {
		return 0
	}
	if root.Left == nil && root.Right == nil {
		return 1
	}
	return CountLeaves(root.Left) + CountLeaves(root.Right)
}

// IsBalanced checks that every node's subtree heights differ by at most 1.
// O(n), not O(n^2): Go's multiple returns let one pass carry both the height
// and the verdict, instead of calling Height() at every node.
func IsBalanced(root *TreeNode) bool {
	var check func(*TreeNode) (bool, int)
	check = func(node *TreeNode) (bool, int) {
		if node == nil {
			return true, -1
		}
		leftOK, leftH := check(node.Left)
		if !leftOK {
			return false, 0 // short-circuit
		}
		rightOK, rightH := check(node.Right)
		if !rightOK {
			return false, 0
		}
		diff := leftH - rightH
		if diff < 0 {
			diff = -diff
		}
		return diff <= 1, 1 + max(leftH, rightH)
	}
	ok, _ := check(root)
	return ok
}

// Diameter is the longest path between any two nodes, in edges. O(n).
// The path either bends at some node (leftH + rightH + 2) or lies wholly
// within one subtree - so track the best while computing heights.
func Diameter(root *TreeNode) int {
	best := 0
	var depth func(*TreeNode) int
	depth = func(node *TreeNode) int {
		if node == nil {
			return -1
		}
		left, right := depth(node.Left), depth(node.Right)
		best = max(best, left+right+2)
		return 1 + max(left, right)
	}
	depth(root)
	return best
}

// MaxPathSum returns the largest node-to-node path sum. A negative branch
// contributes nothing, so clamp it to 0 - that is what makes negatives work.
func MaxPathSum(root *TreeNode) (int, error) {
	if root == nil {
		return 0, fmt.Errorf("empty tree has no path")
	}
	best := root.Val
	var gain func(*TreeNode) int
	gain = func(node *TreeNode) int {
		if node == nil {
			return 0
		}
		left := max(gain(node.Left), 0)
		right := max(gain(node.Right), 0)
		best = max(best, node.Val+left+right) // path bending here
		return node.Val + max(left, right)    // only ONE branch goes upward
	}
	gain(root)
	return best, nil
}

// ============================================================================
// 5. Structural operations
// ============================================================================

func Invert(root *TreeNode) *TreeNode {
	if root == nil {
		return nil
	}
	root.Left, root.Right = Invert(root.Right), Invert(root.Left)
	return root
}

func IsSameTree(a, b *TreeNode) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil || a.Val != b.Val {
		return false
	}
	return IsSameTree(a.Left, b.Left) && IsSameTree(a.Right, b.Right)
}

// IsSymmetric compares OUTER against OUTER and inner against inner.
func IsSymmetric(root *TreeNode) bool {
	var mirror func(a, b *TreeNode) bool
	mirror = func(a, b *TreeNode) bool {
		if a == nil && b == nil {
			return true
		}
		if a == nil || b == nil || a.Val != b.Val {
			return false
		}
		return mirror(a.Left, b.Right) && mirror(a.Right, b.Left)
	}
	return root == nil || mirror(root.Left, root.Right)
}

// LowestCommonAncestor returns the deepest node having both p and q below it.
// If they come back from different subtrees, this node is the answer.
func LowestCommonAncestor(root *TreeNode, p, q int) *TreeNode {
	if root == nil || root.Val == p || root.Val == q {
		return root
	}
	left := LowestCommonAncestor(root.Left, p, q)
	right := LowestCommonAncestor(root.Right, p, q)
	if left != nil && right != nil {
		return root // p and q split here
	}
	if left != nil {
		return left
	}
	return right
}

// ============================================================================
// 6. Paths
// ============================================================================

func HasPathSum(root *TreeNode, target int) bool {
	if root == nil {
		return false
	}
	if root.Left == nil && root.Right == nil {
		return root.Val == target
	}
	remaining := target - root.Val
	return HasPathSum(root.Left, remaining) || HasPathSum(root.Right, remaining)
}

// AllPaths returns every root-to-leaf path. Backtracking: append, recurse, pop.
func AllPaths(root *TreeNode) [][]int {
	var results [][]int
	var path []int

	var walk func(*TreeNode)
	walk = func(node *TreeNode) {
		if node == nil {
			return
		}
		path = append(path, node.Val) // choose
		if node.Left == nil && node.Right == nil {
			results = append(results, append([]int(nil), path...)) // CLONE
		} else {
			walk(node.Left)
			walk(node.Right)
		}
		path = path[:len(path)-1] // un-choose
	}

	walk(root)
	return results
}

// ============================================================================
// 7. Serialisation
// ============================================================================

// Serialize emits preorder with explicit "#" for nil. Without null markers a
// preorder string does not determine the tree.
func Serialize(root *TreeNode) string {
	var sb strings.Builder
	var walk func(*TreeNode)
	walk = func(node *TreeNode) {
		if sb.Len() > 0 {
			sb.WriteByte(',')
		}
		if node == nil {
			sb.WriteByte('#')
			return
		}
		sb.WriteString(strconv.Itoa(node.Val))
		walk(node.Left)
		walk(node.Right)
	}
	walk(root)
	return sb.String()
}

func Deserialize(data string) *TreeNode {
	tokens := strings.Split(data, ",")
	i := 0
	var build func() *TreeNode
	build = func() *TreeNode {
		if i >= len(tokens) || tokens[i] == "#" {
			i++
			return nil
		}
		val, err := strconv.Atoi(tokens[i])
		i++
		if err != nil {
			return nil
		}
		node := &TreeNode{Val: val}
		node.Left = build()
		node.Right = build()
		return node
	}
	return build()
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

func equal2D(a, b [][]int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if !equal(a[i], b[i]) {
			return false
		}
	}
	return true
}

func main() {
	//         1
	//       /   \
	//      2     3
	//     / \
	//    4   5
	tree := BuildTree([]int{1, 2, 3, 4, 5})

	assert(equal(Preorder(tree), []int{1, 2, 4, 5, 3}), "preorder")
	assert(equal(Inorder(tree), []int{4, 2, 5, 1, 3}), "inorder")
	assert(equal(Postorder(tree), []int{4, 5, 2, 3, 1}), "postorder")

	// The iterative versions must agree with the recursive ones everywhere.
	shapes := [][]int{
		{1, 2, 3, 4, 5},
		{1},
		{1, Null, 2},
		{1, 2, Null, 3},
		{},
	}
	for _, shape := range shapes {
		t := BuildTree(shape)
		assert(equal(PreorderIterative(t), Preorder(t)), "iterative preorder")
		assert(equal(InorderIterative(t), Inorder(t)), "iterative inorder")
		assert(equal(PostorderIterative(t), Postorder(t)), "iterative postorder")
		assert(equal(MorrisInorder(t), Inorder(t)), "morris inorder")
		assert(equal(Inorder(t), Inorder(t)), "morris restored the tree")
	}

	assert(equal2D(LevelOrder(tree), [][]int{{1}, {2, 3}, {4, 5}}), "level order")
	assert(equal2D(ZigzagLevelOrder(tree), [][]int{{1}, {3, 2}, {4, 5}}), "zigzag")
	assert(equal(RightSideView(tree), []int{1, 3, 5}), "right side view")
	assert(LevelOrder(nil) == nil, "level order of nil")

	assert(Height(tree) == 2 && Height(nil) == -1, "height")
	assert(Height(BuildTree([]int{1})) == 0, "single node height")
	assert(CountNodes(tree) == 5, "node count")
	assert(CountLeaves(tree) == 3, "leaf count")

	assert(IsBalanced(tree) && IsBalanced(nil), "balanced")
	assert(!IsBalanced(BuildTree([]int{1, 2, Null, 3})), "unbalanced")

	assert(Diameter(tree) == 3, "diameter 4->2->1->3")
	assert(Diameter(BuildTree([]int{1})) == 0, "single node diameter")

	sum, err := MaxPathSum(BuildTree([]int{1, 2, 3}))
	assert(sum == 6 && err == nil, "max path sum")
	sum, _ = MaxPathSum(BuildTree([]int{-10, 9, 20, Null, Null, 15, 7}))
	assert(sum == 42, "max path sum with negatives")
	_, err = MaxPathSum(nil)
	assert(err != nil, "empty tree is an error")

	inverted := Invert(BuildTree([]int{1, 2, 3, 4, 5}))
	assert(equal2D(LevelOrder(inverted), [][]int{{1}, {3, 2}, {5, 4}}), "invert")

	assert(IsSameTree(BuildTree([]int{1, 2}), BuildTree([]int{1, 2})), "same tree")
	assert(!IsSameTree(BuildTree([]int{1, 2}), BuildTree([]int{1, Null, 2})), "different")
	assert(IsSymmetric(BuildTree([]int{1, 2, 2, 3, 4, 4, 3})), "symmetric")
	assert(!IsSymmetric(BuildTree([]int{1, 2, 2, Null, 3, Null, 3})), "asymmetric")

	assert(LowestCommonAncestor(tree, 4, 5).Val == 2, "LCA in one subtree")
	assert(LowestCommonAncestor(tree, 4, 3).Val == 1, "LCA at the root")

	assert(HasPathSum(tree, 7), "path 1+2+4")
	assert(!HasPathSum(tree, 100), "no such path")
	assert(equal2D(AllPaths(tree), [][]int{{1, 2, 4}, {1, 2, 5}, {1, 3}}), "all paths")

	encoded := Serialize(tree)
	assert(encoded == "1,2,4,#,#,5,#,#,3,#,#", "serialisation format")
	rebuilt := Deserialize(encoded)
	assert(equal(Preorder(rebuilt), Preorder(tree)), "round trip preorder")
	assert(equal(Inorder(rebuilt), Inorder(tree)), "round trip inorder")
	assert(Serialize(rebuilt) == encoded, "round trip is stable")
	assert(Deserialize(Serialize(nil)) == nil, "nil round trip")

	fmt.Println("11-Trees (Go): all checks passed")
}
