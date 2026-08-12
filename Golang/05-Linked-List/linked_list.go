// 05 - Linked List: singly and doubly linked lists from scratch, plus the
// pointer patterns interviewers ask about.
//
// Run:  go run linked_list.go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// ============================================================================
// Node
// ============================================================================

// Node is a singly linked list node. A nil *Node is a valid empty list.
type Node struct {
	Val  int
	Next *Node
}

// ============================================================================
// Singly linked list
// ============================================================================

// SinglyLinkedList keeps a tail pointer so PushBack stays O(1).
// Every method uses a pointer receiver because they reassign head/tail/size.
type SinglyLinkedList struct {
	head *Node
	tail *Node
	size int
}

func NewSinglyLinkedList(values ...int) *SinglyLinkedList {
	l := &SinglyLinkedList{}
	for _, v := range values {
		l.PushBack(v)
	}
	return l
}

func (l *SinglyLinkedList) Len() int    { return l.size }
func (l *SinglyLinkedList) Head() *Node { return l.head }
func (l *SinglyLinkedList) Tail() *Node { return l.tail }

// String implements fmt.Stringer. Safe only on acyclic lists.
func (l *SinglyLinkedList) String() string {
	if l.head == nil {
		return "(empty)"
	}
	var sb strings.Builder
	for n := l.head; n != nil; n = n.Next {
		if n != l.head {
			sb.WriteString(" -> ")
		}
		sb.WriteString(strconv.Itoa(n.Val))
	}
	return sb.String()
}

func (l *SinglyLinkedList) Slice() []int {
	out := make([]int, 0, l.size)
	for n := l.head; n != nil; n = n.Next {
		out = append(out, n.Val)
	}
	return out
}

// ------------------------------------------------------------------ insert --

// PushFront is O(1) - the operation slices cannot do cheaply.
func (l *SinglyLinkedList) PushFront(val int) {
	l.head = &Node{Val: val, Next: l.head}
	if l.tail == nil {
		l.tail = l.head
	}
	l.size++
}

// PushBack is O(1) because of the tail pointer; O(n) without one.
func (l *SinglyLinkedList) PushBack(val int) {
	node := &Node{Val: val}
	if l.tail == nil {
		l.head, l.tail = node, node
	} else {
		l.tail.Next = node
		l.tail = node
	}
	l.size++
}

// InsertAt is O(n): the position has to be walked to.
func (l *SinglyLinkedList) InsertAt(index, val int) error {
	if index < 0 || index > l.size {
		return fmt.Errorf("index %d out of range [0,%d]", index, l.size)
	}
	switch index {
	case 0:
		l.PushFront(val)
	case l.size:
		l.PushBack(val)
	default:
		prev := l.nodeAt(index - 1)
		prev.Next = &Node{Val: val, Next: prev.Next}
		l.size++
	}
	return nil
}

// ------------------------------------------------------------------ delete --

// DeleteAt removes by index. The dummy head removes the "deleting the head"
// special case. O(n).
func (l *SinglyLinkedList) DeleteAt(index int) (int, error) {
	if index < 0 || index >= l.size {
		return 0, fmt.Errorf("index %d out of range [0,%d)", index, l.size)
	}
	dummy := &Node{Next: l.head}
	prev := dummy
	for i := 0; i < index; i++ {
		prev = prev.Next
	}
	target := prev.Next
	prev.Next = target.Next
	if target == l.tail {
		if prev == dummy {
			l.tail = nil
		} else {
			l.tail = prev
		}
	}
	l.head = dummy.Next
	l.size--
	return target.Val, nil
}

// RemoveValue deletes the first node holding val. O(n).
func (l *SinglyLinkedList) RemoveValue(val int) bool {
	dummy := &Node{Next: l.head}
	for prev := dummy; prev.Next != nil; prev = prev.Next {
		if prev.Next.Val == val {
			target := prev.Next
			prev.Next = target.Next
			if target == l.tail {
				if prev == dummy {
					l.tail = nil
				} else {
					l.tail = prev
				}
			}
			l.head = dummy.Next
			l.size--
			return true
		}
	}
	return false
}

// ----------------------------------------------------------------- lookups --

// Search returns the index of the first match, or -1. O(n): no random access.
func (l *SinglyLinkedList) Search(val int) int {
	i := 0
	for n := l.head; n != nil; n, i = n.Next, i+1 {
		if n.Val == val {
			return i
		}
	}
	return -1
}

func (l *SinglyLinkedList) nodeAt(index int) *Node {
	n := l.head
	for i := 0; i < index && n != nil; i++ {
		n = n.Next
	}
	return n
}

// ---------------------------------------------------------------- reversal --

// Reverse flips the list in place with three pointers. O(n) time, O(1) space.
func (l *SinglyLinkedList) Reverse() {
	var prev *Node
	curr := l.head
	l.tail = l.head // the old head becomes the new tail
	for curr != nil {
		next := curr.Next // SAVE before destroying the link
		curr.Next = prev
		prev, curr = curr, next
	}
	l.head = prev
}

// ------------------------------------------------------------ two pointers --

// Middle returns the middle value (the second middle when the length is even).
// O(n) in one pass: fast moves twice per step of slow.
func (l *SinglyLinkedList) Middle() (int, bool) {
	slow, fast := l.head, l.head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
	}
	if slow == nil {
		return 0, false
	}
	return slow.Val, true
}

// RemoveNthFromEnd removes the nth node counted from the end, in one pass.
func (l *SinglyLinkedList) RemoveNthFromEnd(n int) error {
	if n < 1 || n > l.size {
		return fmt.Errorf("n=%d out of range [1,%d]", n, l.size)
	}
	dummy := &Node{Next: l.head}
	fast, slow := dummy, dummy
	for i := 0; i < n; i++ { // open a gap of n nodes
		fast = fast.Next
	}
	for fast.Next != nil { // walk both until fast is the last node
		fast, slow = fast.Next, slow.Next
	}
	target := slow.Next
	slow.Next = target.Next
	if target == l.tail {
		if slow == dummy {
			l.tail = nil
		} else {
			l.tail = slow
		}
	}
	l.head = dummy.Next
	l.size--
	return nil
}

// ============================================================================
// Cycle detection (Floyd's tortoise and hare)
// ============================================================================

// HasCycle runs in O(n) time and O(1) space. A map of visited nodes also works
// but costs O(n) memory.
func HasCycle(head *Node) bool {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast { // pointer identity, not value equality
			return true
		}
	}
	return false
}

// CycleStart returns the first node of the cycle, or nil.
//
// When the pointers meet, the meeting point is exactly L steps from the cycle
// entry (mod C), where L is the head-to-entry distance. So a walker from the
// head and the slow pointer, both at speed 1, collide at the entry.
func CycleStart(head *Node) *Node {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast {
			walker := head
			for walker != slow {
				walker = walker.Next
				slow = slow.Next
			}
			return walker
		}
	}
	return nil
}

// ============================================================================
// Merging two sorted lists
// ============================================================================

// MergeSorted splices existing nodes - it allocates only the dummy.
// O(n+m) time, O(1) space.
func MergeSorted(a, b *Node) *Node {
	dummy := &Node{}
	tail := dummy
	for a != nil && b != nil {
		if a.Val <= b.Val { // <= keeps the merge stable
			tail.Next, a = a, a.Next
		} else {
			tail.Next, b = b, b.Next
		}
		tail = tail.Next
	}
	if a != nil { // attach whatever remains, in one step
		tail.Next = a
	} else {
		tail.Next = b
	}
	return dummy.Next
}

// ============================================================================
// Doubly linked list
// ============================================================================

type DNode struct {
	Val  int
	Prev *DNode
	Next *DNode
}

// DoublyLinkedList: the Prev pointer buys O(1) deletion when the node is
// already in hand - exactly what an LRU cache needs.
type DoublyLinkedList struct {
	head *DNode
	tail *DNode
	size int
}

func (d *DoublyLinkedList) Len() int { return d.size }

func (d *DoublyLinkedList) PushBack(val int) *DNode {
	node := &DNode{Val: val}
	if d.tail == nil {
		d.head, d.tail = node, node
	} else {
		node.Prev = d.tail
		d.tail.Next = node
		d.tail = node
	}
	d.size++
	return node
}

func (d *DoublyLinkedList) PushFront(val int) *DNode {
	node := &DNode{Val: val}
	if d.head == nil {
		d.head, d.tail = node, node
	} else {
		node.Next = d.head
		d.head.Prev = node
		d.head = node
	}
	d.size++
	return node
}

// DeleteNode is O(1): no traversal needed.
func (d *DoublyLinkedList) DeleteNode(node *DNode) {
	if node.Prev != nil {
		node.Prev.Next = node.Next
	} else {
		d.head = node.Next
	}
	if node.Next != nil {
		node.Next.Prev = node.Prev
	} else {
		d.tail = node.Prev
	}
	node.Prev, node.Next = nil, nil
	d.size--
}

func (d *DoublyLinkedList) Slice() []int {
	out := make([]int, 0, d.size)
	for n := d.head; n != nil; n = n.Next {
		out = append(out, n.Val)
	}
	return out
}

func (d *DoublyLinkedList) SliceReverse() []int {
	out := make([]int, 0, d.size)
	for n := d.tail; n != nil; n = n.Prev {
		out = append(out, n.Val)
	}
	return out
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
	l := NewSinglyLinkedList(1, 2, 3)
	assert(equal(l.Slice(), []int{1, 2, 3}) && l.Len() == 3, "construction")
	l.PushFront(0)
	l.PushBack(4)
	assert(equal(l.Slice(), []int{0, 1, 2, 3, 4}), "push front/back")
	assert(l.Tail().Val == 4, "tail pointer")

	assert(l.InsertAt(2, 99) == nil, "insert")
	assert(equal(l.Slice(), []int{0, 1, 99, 2, 3, 4}), "insert shifts")
	v, err := l.DeleteAt(2)
	assert(v == 99 && err == nil, "delete returns value")
	assert(equal(l.Slice(), []int{0, 1, 2, 3, 4}), "delete")

	assert(l.Search(3) == 3 && l.Search(42) == -1, "search")

	assert(l.RemoveValue(0) && !l.RemoveValue(42), "removeValue")
	assert(equal(l.Slice(), []int{1, 2, 3, 4}), "after removeValue")

	l.Reverse()
	assert(equal(l.Slice(), []int{4, 3, 2, 1}), "reverse")
	l.PushBack(0) // proves tail survived the reversal
	assert(equal(l.Slice(), []int{4, 3, 2, 1, 0}), "tail after reverse")
	assert(l.String() == "4 -> 3 -> 2 -> 1 -> 0", "String()")

	mid, ok := NewSinglyLinkedList(1, 2, 3).Middle()
	assert(mid == 2 && ok, "middle of odd length")
	mid, _ = NewSinglyLinkedList(1, 2, 3, 4).Middle()
	assert(mid == 3, "second middle of even length")
	_, ok = NewSinglyLinkedList().Middle()
	assert(!ok, "middle of empty list")

	nth := NewSinglyLinkedList(1, 2, 3, 4, 5)
	assert(nth.RemoveNthFromEnd(2) == nil, "remove 2nd from end")
	assert(equal(nth.Slice(), []int{1, 2, 3, 5}), "after removal")
	assert(nth.RemoveNthFromEnd(4) == nil, "remove the head")
	assert(equal(nth.Slice(), []int{2, 3, 5}), "after head removal")
	assert(nth.RemoveNthFromEnd(99) != nil, "out of range is an error")

	// Cycle: 1 -> 2 -> 3 -> 4 -> back to 2
	n1 := &Node{Val: 1}
	n2 := &Node{Val: 2}
	n3 := &Node{Val: 3}
	n4 := &Node{Val: 4}
	n1.Next, n2.Next, n3.Next, n4.Next = n2, n3, n4, n2
	assert(HasCycle(n1) && CycleStart(n1) == n2, "cycle detection")
	straight := &Node{Val: 1, Next: &Node{Val: 2}}
	assert(!HasCycle(straight) && CycleStart(straight) == nil, "no cycle")
	assert(!HasCycle(nil), "nil list has no cycle")

	merged := MergeSorted(
		NewSinglyLinkedList(1, 3, 5).Head(),
		NewSinglyLinkedList(2, 4).Head(),
	)
	var out []int
	for n := merged; n != nil; n = n.Next {
		out = append(out, n.Val)
	}
	assert(equal(out, []int{1, 2, 3, 4, 5}), "merge sorted")

	var d DoublyLinkedList
	d.PushBack(2)
	middleNode := d.PushBack(3)
	d.PushBack(4)
	d.PushFront(1)
	assert(equal(d.Slice(), []int{1, 2, 3, 4}), "doubly forward")
	assert(equal(d.SliceReverse(), []int{4, 3, 2, 1}), "doubly backward")
	d.DeleteNode(middleNode) // O(1), no search
	assert(equal(d.Slice(), []int{1, 2, 4}) && d.Len() == 3, "O(1) delete")
	assert(equal(d.SliceReverse(), []int{4, 2, 1}), "backward after delete")

	fmt.Println("05-Linked-List (Go): all checks passed")
}
