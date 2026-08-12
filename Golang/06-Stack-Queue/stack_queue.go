// 06 - Stack and Queue: both from scratch, plus the monotonic-stack patterns
// that show up constantly in interviews.
//
// Run:  go run stack_queue.go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// ============================================================================
// 1. Stack (LIFO) over a slice
// ============================================================================

// Stack wraps the idiomatic Go stack (a slice) with bounds-checked methods.
type Stack struct{ items []int }

func (s *Stack) Push(v int) { s.items = append(s.items, v) } // amortised O(1)

func (s *Stack) Pop() (int, bool) { // O(1)
	if len(s.items) == 0 {
		return 0, false
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, true
}

func (s *Stack) Peek() (int, bool) {
	if len(s.items) == 0 {
		return 0, false
	}
	return s.items[len(s.items)-1], true
}

func (s *Stack) Len() int      { return len(s.items) }
func (s *Stack) IsEmpty() bool { return len(s.items) == 0 }

// ============================================================================
// 2. Queue with a head index and amortised compaction
// ============================================================================

// Queue avoids the classic `q = q[1:]` leak: that is O(1) but keeps the whole
// backing array alive forever. Copying the live tail back to the front when
// the dead prefix dominates keeps memory bounded and stays amortised O(1).
type Queue struct {
	items []int
	head  int
}

func (q *Queue) Enqueue(v int) { q.items = append(q.items, v) }

func (q *Queue) Dequeue() (int, bool) {
	if q.head >= len(q.items) {
		return 0, false
	}
	v := q.items[q.head]
	q.head++

	if q.head*2 >= len(q.items) { // more than half is dead space: compact
		n := copy(q.items, q.items[q.head:])
		q.items = q.items[:n]
		q.head = 0
	}
	return v, true
}

func (q *Queue) Front() (int, bool) {
	if q.head >= len(q.items) {
		return 0, false
	}
	return q.items[q.head], true
}

func (q *Queue) Len() int      { return len(q.items) - q.head }
func (q *Queue) IsEmpty() bool { return q.Len() == 0 }

func (q *Queue) Slice() []int {
	out := make([]int, q.Len())
	copy(out, q.items[q.head:])
	return out
}

// ============================================================================
// 3. Circular-buffer queue (fixed capacity)
// ============================================================================

// CircularQueue derives the write position from head and count, so no element
// is ever moved. count also disambiguates full from empty.
type CircularQueue struct {
	buf   []int
	head  int
	count int
}

func NewCircularQueue(capacity int) (*CircularQueue, error) {
	if capacity <= 0 {
		return nil, fmt.Errorf("capacity must be positive, got %d", capacity)
	}
	return &CircularQueue{buf: make([]int, capacity)}, nil
}

func (c *CircularQueue) Enqueue(v int) error {
	if c.IsFull() {
		return fmt.Errorf("queue is full")
	}
	c.buf[(c.head+c.count)%len(c.buf)] = v
	c.count++
	return nil
}

func (c *CircularQueue) Dequeue() (int, bool) {
	if c.IsEmpty() {
		return 0, false
	}
	v := c.buf[c.head]
	c.head = (c.head + 1) % len(c.buf)
	c.count--
	return v, true
}

func (c *CircularQueue) Front() (int, bool) {
	if c.IsEmpty() {
		return 0, false
	}
	return c.buf[c.head], true
}

func (c *CircularQueue) IsEmpty() bool { return c.count == 0 }
func (c *CircularQueue) IsFull() bool  { return c.count == len(c.buf) }
func (c *CircularQueue) Len() int      { return c.count }

func (c *CircularQueue) Slice() []int {
	out := make([]int, 0, c.count)
	for i := 0; i < c.count; i++ {
		out = append(out, c.buf[(c.head+i)%len(c.buf)])
	}
	return out
}

// ============================================================================
// 4. MinStack - O(1) minimum
// ============================================================================

type minEntry struct{ val, min int }

// MinStack stores the running minimum next to each value: O(n) extra space
// buys an O(1) query instead of an O(n) scan.
type MinStack struct{ items []minEntry }

func (m *MinStack) Push(v int) {
	currentMin := v
	if len(m.items) > 0 && m.items[len(m.items)-1].min < v {
		currentMin = m.items[len(m.items)-1].min
	}
	m.items = append(m.items, minEntry{val: v, min: currentMin})
}

func (m *MinStack) Pop() (int, bool) {
	if len(m.items) == 0 {
		return 0, false
	}
	v := m.items[len(m.items)-1].val
	m.items = m.items[:len(m.items)-1]
	return v, true
}

func (m *MinStack) Top() (int, bool) {
	if len(m.items) == 0 {
		return 0, false
	}
	return m.items[len(m.items)-1].val, true
}

func (m *MinStack) Min() (int, bool) {
	if len(m.items) == 0 {
		return 0, false
	}
	return m.items[len(m.items)-1].min, true
}

// ============================================================================
// 5. Queue built from two stacks
// ============================================================================

// QueueViaStacks: pouring in -> out reverses the order, so the oldest element
// ends up on top of out. Each element moves at most twice: amortised O(1).
type QueueViaStacks struct{ in, out Stack }

func (q *QueueViaStacks) Enqueue(v int) { q.in.Push(v) }

func (q *QueueViaStacks) Dequeue() (int, bool) {
	q.shift()
	return q.out.Pop()
}

func (q *QueueViaStacks) Front() (int, bool) {
	q.shift()
	return q.out.Peek()
}

func (q *QueueViaStacks) shift() {
	if q.out.IsEmpty() { // only pour when it has run dry
		for {
			v, ok := q.in.Pop()
			if !ok {
				break
			}
			q.out.Push(v)
		}
	}
}

func (q *QueueViaStacks) Len() int { return q.in.Len() + q.out.Len() }

// ============================================================================
// 6. Matching / nesting
// ============================================================================

// IsBalanced checks bracket nesting. A closer must match the most recent
// opener - which is exactly what a stack tracks. O(n) time and space.
func IsBalanced(s string) bool {
	pairs := map[byte]byte{')': '(', ']': '[', '}': '{'}
	var stack []byte
	for i := 0; i < len(s); i++ {
		c := s[i]
		switch c {
		case '(', '[', '{':
			stack = append(stack, c)
		case ')', ']', '}':
			if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 0 // leftovers mean unclosed openers
}

// ============================================================================
// 7. Monotonic stack
// ============================================================================

// NextGreater returns, for each element, the next strictly greater element to
// its right, or -1. O(n): every index is pushed once and popped at most once.
func NextGreater(nums []int) []int {
	result := make([]int, len(nums))
	for i := range result {
		result[i] = -1
	}
	var stack []int // indices; their values decrease
	for i, x := range nums {
		for len(stack) > 0 && nums[stack[len(stack)-1]] < x {
			result[stack[len(stack)-1]] = x
			stack = stack[:len(stack)-1]
		}
		stack = append(stack, i)
	}
	return result
}

// DailyTemperatures returns how many days to wait for a warmer day.
// The stack holds indices because the answer is a distance, not a value.
func DailyTemperatures(temps []int) []int {
	result := make([]int, len(temps))
	var stack []int
	for i, t := range temps {
		for len(stack) > 0 && temps[stack[len(stack)-1]] < t {
			j := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result[j] = i - j
		}
		stack = append(stack, i)
	}
	return result
}

// LargestRectangle solves the histogram problem in O(n) with a monotonic
// increasing stack. When a shorter bar arrives, every taller bar on the stack
// can no longer extend right, so its rectangle is finalised. The appended 0
// sentinel flushes the stack at the end.
func LargestRectangle(heights []int) int {
	h := append(append([]int(nil), heights...), 0) // copy + sentinel
	var stack []int
	best := 0
	for i := 0; i < len(h); i++ {
		for len(stack) > 0 && h[stack[len(stack)-1]] >= h[i] {
			height := h[stack[len(stack)-1]]
			stack = stack[:len(stack)-1]
			left := 0
			if len(stack) > 0 {
				left = stack[len(stack)-1] + 1
			}
			best = max(best, height*(i-left))
		}
		stack = append(stack, i)
	}
	return best
}

// ============================================================================
// 8. Simulation
// ============================================================================

// EvalRPN evaluates reverse Polish notation. Operands wait on the stack until
// an operator claims the last two - and their order matters for - and /.
func EvalRPN(tokens []string) (int, error) {
	var stack []int
	pop := func() int {
		v := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		return v
	}
	for _, token := range tokens {
		switch token {
		case "+", "-", "*", "/":
			if len(stack) < 2 {
				return 0, fmt.Errorf("malformed expression at %q", token)
			}
			b, a := pop(), pop()
			switch token {
			case "+":
				stack = append(stack, a+b)
			case "-":
				stack = append(stack, a-b)
			case "*":
				stack = append(stack, a*b)
			case "/":
				if b == 0 {
					return 0, fmt.Errorf("division by zero")
				}
				stack = append(stack, a/b) // Go truncates toward zero
			}
		default:
			n, err := strconv.Atoi(token)
			if err != nil {
				return 0, fmt.Errorf("bad token %q: %w", token, err)
			}
			stack = append(stack, n)
		}
	}
	if len(stack) != 1 {
		return 0, fmt.Errorf("malformed expression")
	}
	return stack[0], nil
}

// SimplifyPath canonicalises a Unix path: "/a/./b/../c" -> "/a/c". O(n).
func SimplifyPath(path string) string {
	var stack []string
	for _, part := range strings.Split(path, "/") {
		switch part {
		case "", ".":
			// skip empty segments and "."
		case "..":
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
			}
		default:
			stack = append(stack, part)
		}
	}
	return "/" + strings.Join(stack, "/")
}

// SlidingWindowMax returns the maximum of every window of size k. O(n) with a
// monotonic deque of indices: the front is always the window maximum.
func SlidingWindowMax(nums []int, k int) ([]int, error) {
	if k <= 0 || k > len(nums) {
		return nil, fmt.Errorf("k must be in [1,%d]", len(nums))
	}
	dq := make([]int, 0, len(nums)) // indices, values decreasing
	head := 0                       // head index instead of reslicing
	out := make([]int, 0, len(nums)-k+1)
	for i, x := range nums {
		for head < len(dq) && dq[head] <= i-k { // drop expired indices
			head++
		}
		for len(dq) > head && nums[dq[len(dq)-1]] <= x { // drop hopeless values
			dq = dq[:len(dq)-1]
		}
		dq = append(dq, i)
		if i >= k-1 {
			out = append(out, nums[dq[head]])
		}
	}
	return out, nil
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
	var s Stack
	s.Push(1)
	s.Push(2)
	top, _ := s.Peek()
	assert(top == 2 && s.Len() == 2, "stack peek")
	v, _ := s.Pop()
	assert(v == 2, "stack pop order")
	v, _ = s.Pop()
	assert(v == 1 && s.IsEmpty(), "stack drains")
	_, ok := s.Pop()
	assert(!ok, "pop on empty reports false")

	var q Queue
	q.Enqueue(1)
	q.Enqueue(2)
	q.Enqueue(3)
	f, _ := q.Front()
	assert(f == 1, "queue front")
	v, _ = q.Dequeue()
	assert(v == 1, "FIFO order")
	q.Enqueue(4)
	assert(equal(q.Slice(), []int{2, 3, 4}), "queue contents")
	// Drain 50k items: O(n) with compaction, not O(n^2).
	var big Queue
	for i := 0; i < 50000; i++ {
		big.Enqueue(i)
	}
	sum := 0
	for !big.IsEmpty() {
		x, _ := big.Dequeue()
		sum += x
	}
	assert(sum == 49999*50000/2, "queue drains correctly")

	cq, err := NewCircularQueue(3)
	assert(err == nil, "circular queue construction")
	assert(cq.Enqueue(1) == nil && cq.Enqueue(2) == nil && cq.Enqueue(3) == nil, "fill")
	assert(cq.IsFull() && equal(cq.Slice(), []int{1, 2, 3}), "full buffer")
	assert(cq.Enqueue(4) != nil, "enqueue on full is an error")
	v, _ = cq.Dequeue()
	assert(v == 1, "circular dequeue")
	assert(cq.Enqueue(4) == nil, "space freed")
	assert(equal(cq.Slice(), []int{2, 3, 4}), "wrapped correctly")

	var ms MinStack
	for _, x := range []int{5, 3, 7, 3} {
		ms.Push(x)
	}
	m, _ := ms.Min()
	assert(m == 3, "min tracked")
	ms.Pop()
	m, _ = ms.Min()
	assert(m == 3, "min after popping a duplicate")
	ms.Pop() // 7
	ms.Pop() // first 3
	m, _ = ms.Min()
	assert(m == 5, "min restored")

	var qs QueueViaStacks
	for _, x := range []int{1, 2, 3} {
		qs.Enqueue(x)
	}
	f, _ = qs.Front()
	assert(f == 1, "two-stack front")
	v, _ = qs.Dequeue()
	assert(v == 1, "two-stack FIFO")
	qs.Enqueue(4)
	a, _ := qs.Dequeue()
	b, _ := qs.Dequeue()
	c, _ := qs.Dequeue()
	assert(a == 2 && b == 3 && c == 4, "order preserved across a refill")

	assert(IsBalanced("({[]})"), "balanced")
	assert(IsBalanced(""), "empty is balanced")
	assert(!IsBalanced("(]"), "mismatched")
	assert(!IsBalanced("(("), "unclosed")

	assert(equal(NextGreater([]int{2, 1, 2, 4, 3}), []int{4, 2, 4, -1, -1}), "next greater")
	assert(equal(DailyTemperatures([]int{73, 74, 75, 71, 69, 72, 76, 73}),
		[]int{1, 1, 4, 2, 1, 1, 0, 0}), "daily temperatures")
	assert(LargestRectangle([]int{2, 1, 5, 6, 2, 3}) == 10, "histogram")
	assert(LargestRectangle([]int{2, 2}) == 4, "flat histogram")

	r, err := EvalRPN([]string{"2", "1", "+", "3", "*"})
	assert(r == 9 && err == nil, "RPN")
	r, _ = EvalRPN([]string{"4", "13", "5", "/", "+"})
	assert(r == 6, "RPN with division")
	_, err = EvalRPN([]string{"+"})
	assert(err != nil, "malformed RPN is an error")

	assert(SimplifyPath("/a/./b/../../c/") == "/c", "path simplification")
	assert(SimplifyPath("/../") == "/", "cannot go above root")

	w, err := SlidingWindowMax([]int{1, 3, -1, -3, 5, 3, 6, 7}, 3)
	assert(err == nil && equal(w, []int{3, 3, 5, 5, 6, 7}), "sliding window max")

	fmt.Println("06-Stack-Queue (Go): all checks passed")
}
