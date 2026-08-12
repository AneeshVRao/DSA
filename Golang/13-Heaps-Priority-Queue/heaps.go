// 13 - Heaps and Priority Queue: a binary heap from scratch AND the idiomatic
// container/heap version, plus the four patterns priority queues exist for.
//
// Run:  go run heaps.go
package main

import (
	"container/heap"
	"fmt"
	"math/rand"
	"sort"
)

// ============================================================================
// 1. A binary min-heap from scratch
// ============================================================================

// MinHeap is a complete binary tree packed into a slice: no gaps, so the
// parent and child links are pure arithmetic.
//
//	parent(i) = (i-1)/2    left(i) = 2i+1    right(i) = 2i+2
type MinHeap struct{ data []int }

// NewMinHeap builds in O(n), not O(n log n): sift down from the last parent
// backwards. A node at height h costs O(h) and only n/2^(h+1) nodes sit that
// high, so the total telescopes to O(n). Most nodes are leaves and cost 0.
func NewMinHeap(items ...int) *MinHeap {
	h := &MinHeap{data: append([]int(nil), items...)}
	for i := len(h.data)/2 - 1; i >= 0; i-- {
		h.siftDown(i)
	}
	return h
}

func (h *MinHeap) Len() int { return len(h.data) }

// Peek returns the minimum in O(1) - the entire point of a heap.
func (h *MinHeap) Peek() (int, bool) {
	if len(h.data) == 0 {
		return 0, false
	}
	return h.data[0], true
}

// Push appends at the end, then sifts up. O(log n).
func (h *MinHeap) Push(v int) {
	h.data = append(h.data, v)
	h.siftUp(len(h.data) - 1)
}

// Pop removes the minimum. The LAST element moves to the root (keeping the
// tree complete) and then sinks into place. O(log n).
func (h *MinHeap) Pop() (int, bool) {
	if len(h.data) == 0 {
		return 0, false
	}
	smallest := h.data[0]
	last := len(h.data) - 1
	h.data[0] = h.data[last]
	h.data = h.data[:last]
	if len(h.data) > 0 {
		h.siftDown(0)
	}
	return smallest, true
}

func (h *MinHeap) siftUp(i int) { // swap up while the parent is larger
	for i > 0 {
		parent := (i - 1) / 2
		if h.data[parent] <= h.data[i] {
			return
		}
		h.data[parent], h.data[i] = h.data[i], h.data[parent]
		i = parent
	}
}

func (h *MinHeap) siftDown(i int) { // swap with the SMALLER child
	n := len(h.data)
	for {
		smallest, left, right := i, 2*i+1, 2*i+2
		if left < n && h.data[left] < h.data[smallest] {
			smallest = left
		}
		if right < n && h.data[right] < h.data[smallest] {
			smallest = right
		}
		if smallest == i {
			return
		}
		h.data[i], h.data[smallest] = h.data[smallest], h.data[i]
		i = smallest
	}
}

// IsValid checks the invariant at every node - used by the tests below.
func (h *MinHeap) IsValid() bool {
	for i := 1; i < len(h.data); i++ {
		if h.data[(i-1)/2] > h.data[i] {
			return false
		}
	}
	return true
}

// ============================================================================
// 2. The idiomatic container/heap version
// ============================================================================

// IntHeap implements heap.Interface. The package supplies the algorithms;
// this type supplies the storage and the ordering.
//
// Note the receivers: Push and Pop change the LENGTH, so they need pointers.
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // < = min-heap
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x any) { *h = append(*h, x.(int)) }

// Pop removes from the END: container/heap has already swapped the root there
// before calling this. Returning old[0] would silently break the heap.
func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// ============================================================================
// 3. Heapsort
// ============================================================================

// HeapSort is O(n) to build plus n pops of O(log n).
func HeapSort(nums []int) []int {
	h := NewMinHeap(nums...)
	out := make([]int, 0, len(nums))
	for {
		v, ok := h.Pop()
		if !ok {
			return out
		}
		out = append(out, v)
	}
}

// ============================================================================
// 4. Top k with a size-k heap
// ============================================================================

// KthLargest returns the kth largest value. O(n log k) time, O(k) space.
//
// Counter-intuitive but essential: for the k LARGEST values keep a MIN-heap
// of size k. Its root is the weakest survivor, so anything smaller is
// rejected in O(1) and the heap never grows past k.
func KthLargest(nums []int, k int) (int, error) {
	if k < 1 || k > len(nums) {
		return 0, fmt.Errorf("k=%d out of range [1,%d]", k, len(nums))
	}
	h := &IntHeap{}
	heap.Init(h)
	for _, x := range nums {
		heap.Push(h, x) // package function, NOT h.Push
		if h.Len() > k {
			heap.Pop(h) // evict the smallest survivor
		}
	}
	return (*h)[0], nil
}

type freqEntry struct {
	value, count int
}

type freqHeap []freqEntry

func (h freqHeap) Len() int           { return len(h) }
func (h freqHeap) Less(i, j int) bool { return h[i].count < h[j].count }
func (h freqHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *freqHeap) Push(x any)        { *h = append(*h, x.(freqEntry)) }
func (h *freqHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// TopKFrequent returns the k most frequent values, most frequent first.
// Same size-k heap trick, keyed on the count. O(n log k).
func TopKFrequent(nums []int, k int) []int {
	counts := make(map[int]int)
	for _, x := range nums {
		counts[x]++
	}

	h := &freqHeap{}
	heap.Init(h)
	for value, count := range counts {
		heap.Push(h, freqEntry{value: value, count: count})
		if h.Len() > k {
			heap.Pop(h)
		}
	}

	best := make([]freqEntry, 0, h.Len())
	for h.Len() > 0 {
		best = append(best, heap.Pop(h).(freqEntry))
	}
	// Heap order is not sorted order, and map iteration is random: sort for a
	// deterministic result.
	sort.Slice(best, func(i, j int) bool {
		if best[i].count != best[j].count {
			return best[i].count > best[j].count
		}
		return best[i].value < best[j].value
	})
	out := make([]int, 0, len(best))
	for _, e := range best {
		out = append(out, e.value)
	}
	return out
}

// ============================================================================
// 5. Merging k sorted slices
// ============================================================================

type mergeEntry struct {
	value, listIndex, elementIndex int
}

type mergeHeap []mergeEntry

func (h mergeHeap) Len() int           { return len(h) }
func (h mergeHeap) Less(i, j int) bool { return h[i].value < h[j].value }
func (h mergeHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *mergeHeap) Push(x any)        { *h = append(*h, x.(mergeEntry)) }
func (h *mergeHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// MergeKSorted merges k sorted slices in O(N log k) for N total elements:
// the heap holds at most one element per slice. Merging pairwise is O(N k).
func MergeKSorted(lists [][]int) []int {
	h := &mergeHeap{}
	total := 0
	for i, list := range lists {
		total += len(list)
		if len(list) > 0 {
			*h = append(*h, mergeEntry{value: list[0], listIndex: i})
		}
	}
	heap.Init(h) // O(k)

	out := make([]int, 0, total)
	for h.Len() > 0 {
		e := heap.Pop(h).(mergeEntry)
		out = append(out, e.value)
		if next := e.elementIndex + 1; next < len(lists[e.listIndex]) {
			heap.Push(h, mergeEntry{
				value:        lists[e.listIndex][next],
				listIndex:    e.listIndex,
				elementIndex: next,
			})
		}
	}
	return out
}

// ============================================================================
// 6. Two heaps for a running median
// ============================================================================

type maxIntHeap []int

func (h maxIntHeap) Len() int           { return len(h) }
func (h maxIntHeap) Less(i, j int) bool { return h[i] > h[j] } // > = max-heap
func (h maxIntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *maxIntHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *maxIntHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

// MedianFinder keeps the smaller half in a max-heap and the larger half in a
// min-heap. Every value enters `low` first and its maximum is handed to
// `high` - that push-then-pop is what keeps the halves correctly ORDERED
// rather than merely balanced. Add is O(log n), Median is O(1).
type MedianFinder struct {
	low  *maxIntHeap // smaller half
	high *IntHeap    // larger half
}

func NewMedianFinder() *MedianFinder {
	return &MedianFinder{low: &maxIntHeap{}, high: &IntHeap{}}
}

func (m *MedianFinder) Add(value int) {
	heap.Push(m.low, value)
	heap.Push(m.high, heap.Pop(m.low)) // hand the low half's max upward
	if m.high.Len() > m.low.Len() {    // rebalance so low >= high
		heap.Push(m.low, heap.Pop(m.high))
	}
}

func (m *MedianFinder) Median() (float64, bool) {
	if m.low.Len() == 0 {
		return 0, false
	}
	if m.low.Len() > m.high.Len() {
		return float64((*m.low)[0]), true
	}
	return float64((*m.low)[0]+(*m.high)[0]) / 2, true
}

// ============================================================================
// 7. Priority queue with tie-breaking
// ============================================================================

type task struct {
	priority, sequence int
	name               string
}

type taskHeap []task

func (h taskHeap) Len() int { return len(h) }

// The sequence tie-break makes the queue stable: equal priorities come out in
// insertion order instead of an arbitrary one.
func (h taskHeap) Less(i, j int) bool {
	if h[i].priority != h[j].priority {
		return h[i].priority < h[j].priority
	}
	return h[i].sequence < h[j].sequence
}
func (h taskHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h *taskHeap) Push(x any)   { *h = append(*h, x.(task)) }
func (h *taskHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}

type TaskQueue struct {
	heap    *taskHeap
	counter int
}

func NewTaskQueue() *TaskQueue { return &TaskQueue{heap: &taskHeap{}} }

func (q *TaskQueue) Add(priority int, name string) {
	heap.Push(q.heap, task{priority: priority, sequence: q.counter, name: name})
	q.counter++
}

func (q *TaskQueue) NextTask() (string, bool) {
	if q.heap.Len() == 0 {
		return "", false
	}
	return heap.Pop(q.heap).(task).name, true
}

func (q *TaskQueue) Len() int { return q.heap.Len() }

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
	h := NewMinHeap()
	for _, x := range []int{5, 3, 8, 1, 9, 2} {
		h.Push(x)
	}
	top, ok := h.Peek()
	assert(top == 1 && ok && h.Len() == 6, "peek")
	assert(h.IsValid(), "heap invariant holds")
	v, _ := h.Pop()
	assert(v == 1, "pop returns the minimum")
	v, _ = h.Pop()
	assert(v == 2, "pop again")
	assert(h.IsValid(), "invariant survives popping")
	_, ok = NewMinHeap().Pop()
	assert(!ok, "pop on empty reports false")

	built := NewMinHeap(9, 4, 7, 1, 8, 2, 6) // the O(n) bulk build
	assert(built.IsValid(), "bulk build produces a valid heap")
	top, _ = built.Peek()
	assert(top == 1, "bulk build finds the minimum")

	// Randomised: heapsort must agree with sort.Ints every time.
	rng := rand.New(rand.NewSource(13))
	for trial := 0; trial < 200; trial++ {
		data := make([]int, rng.Intn(41))
		for i := range data {
			data[i] = rng.Intn(201) - 100
		}
		expected := append([]int(nil), data...)
		sort.Ints(expected)
		got := HeapSort(data)
		if len(expected) == 0 {
			assert(len(got) == 0, "heapsort of empty input")
		} else {
			assert(equal(got, expected), "heapsort matches sort.Ints")
		}
	}

	k, err := KthLargest([]int{3, 2, 1, 5, 6, 4}, 2)
	assert(k == 5 && err == nil, "2nd largest")
	k, _ = KthLargest([]int{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4)
	assert(k == 4, "4th largest with duplicates")
	_, err = KthLargest([]int{1}, 5)
	assert(err != nil, "k out of range is an error")
	{
		data := []int{3, 2, 1, 5, 6, 4}
		descending := append([]int(nil), data...)
		sort.Sort(sort.Reverse(sort.IntSlice(descending)))
		for i := 1; i <= len(data); i++ {
			got, _ := KthLargest(data, i)
			assert(got == descending[i-1], "every k agrees with sorting")
		}
	}

	assert(equal(TopKFrequent([]int{1, 1, 1, 2, 2, 3}, 2), []int{1, 2}), "top k frequent")
	assert(equal(TopKFrequent([]int{1}, 1), []int{1}), "single element")

	assert(equal(MergeKSorted([][]int{{1, 4, 5}, {1, 3, 4}, {2, 6}}),
		[]int{1, 1, 2, 3, 4, 4, 5, 6}), "merge k sorted")
	assert(equal(MergeKSorted([][]int{{}, {1}}), []int{1}), "merge with an empty list")
	assert(len(MergeKSorted(nil)) == 0, "merge nothing")

	median := NewMedianFinder()
	median.Add(1)
	m, _ := median.Median()
	assert(m == 1.0, "median of one value")
	median.Add(2)
	m, _ = median.Median()
	assert(m == 1.5, "even count averages the middle two")
	median.Add(3)
	m, _ = median.Median()
	assert(m == 2.0, "odd count")
	for _, x := range []int{10, -5, 7, 0} {
		median.Add(x)
	}
	m, _ = median.Median()
	assert(m == 2.0, "sorted: -5 0 1 2 3 7 10")
	_, ok = NewMedianFinder().Median()
	assert(!ok, "median of an empty stream")

	tasks := NewTaskQueue()
	tasks.Add(2, "write tests")
	tasks.Add(1, "fix the bug")
	tasks.Add(1, "review the PR") // same priority as the previous
	name, _ := tasks.NextTask()
	assert(name == "fix the bug", "lower priority number runs first")
	name, _ = tasks.NextTask()
	assert(name == "review the PR", "ties break by insertion order")
	name, _ = tasks.NextTask()
	assert(name == "write tests", "last task")
	assert(tasks.Len() == 0, "queue drained")

	fmt.Println("13-Heaps-Priority-Queue (Go): all checks passed")
}
