// 03 - Arrays: a dynamic array built from scratch, plus the five patterns
// that solve most array problems.
//
// Run:  go run arrays.go
package main

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

// ============================================================================
// 1. A dynamic array from scratch (this is what a slice does underneath)
// ============================================================================

// DynamicArray manages its own capacity over a fixed-length backing array,
// so the growth policy is visible instead of hidden inside append.
//
// Doubling is what makes Push amortised O(1): n pushes cost at most 2n copies.
type DynamicArray struct {
	buf  []int // the backing store; len(buf) is the CAPACITY here
	size int   // how many slots are actually in use
}

func NewDynamicArray() *DynamicArray {
	return &DynamicArray{buf: make([]int, 1), size: 0}
}

func (d *DynamicArray) Len() int      { return d.size }     // O(1)
func (d *DynamicArray) Capacity() int { return len(d.buf) } // O(1)

// Get is O(1): one address computation.
func (d *DynamicArray) Get(i int) (int, error) {
	if i < 0 || i >= d.size {
		return 0, fmt.Errorf("index %d out of range [0,%d)", i, d.size)
	}
	return d.buf[i], nil
}

func (d *DynamicArray) Set(i, value int) error {
	if i < 0 || i >= d.size {
		return fmt.Errorf("index %d out of range [0,%d)", i, d.size)
	}
	d.buf[i] = value
	return nil
}

// Push appends in amortised O(1).
func (d *DynamicArray) Push(value int) {
	if d.size == len(d.buf) {
		d.resize(len(d.buf) * 2)
	}
	d.buf[d.size] = value
	d.size++
}

// Insert is O(n): every element from i onwards shifts right.
func (d *DynamicArray) Insert(i, value int) error {
	if i < 0 || i > d.size {
		return fmt.Errorf("index %d out of range [0,%d]", i, d.size)
	}
	if d.size == len(d.buf) {
		d.resize(len(d.buf) * 2)
	}
	for j := d.size; j > i; j-- { // walk backwards so nothing is overwritten
		d.buf[j] = d.buf[j-1]
	}
	d.buf[i] = value
	d.size++
	return nil
}

// RemoveAt is O(1) at the tail, O(n) anywhere else.
func (d *DynamicArray) RemoveAt(i int) (int, error) {
	if i < 0 || i >= d.size {
		return 0, fmt.Errorf("index %d out of range [0,%d)", i, d.size)
	}
	value := d.buf[i]
	copy(d.buf[i:], d.buf[i+1:d.size]) // copy is memmove: fast and safe
	d.size--
	return value, nil
}

// resize is O(n) - and exactly why we double rather than grow by one.
func (d *DynamicArray) resize(newCap int) {
	fresh := make([]int, newCap)
	copy(fresh, d.buf[:d.size])
	d.buf = fresh
}

// Slice returns an independent copy of the live elements.
func (d *DynamicArray) Slice() []int {
	out := make([]int, d.size)
	copy(out, d.buf[:d.size])
	return out
}

// ============================================================================
// 2. Two pointers from opposite ends
// ============================================================================

// TwoSumSorted returns the indices of the pair summing to target in a SORTED
// slice, or (-1, -1). O(n) time, O(1) space.
//
// Sortedness makes each move unambiguous: a sum that is too small can only be
// increased by advancing lo.
func TwoSumSorted(nums []int, target int) (int, int) {
	lo, hi := 0, len(nums)-1
	for lo < hi {
		switch sum := nums[lo] + nums[hi]; {
		case sum == target:
			return lo, hi
		case sum < target:
			lo++
		default:
			hi--
		}
	}
	return -1, -1
}

// IsPalindrome walks both ends inward. O(n) / O(1).
func IsPalindrome(nums []int) bool {
	for lo, hi := 0, len(nums)-1; lo < hi; lo, hi = lo+1, hi-1 {
		if nums[lo] != nums[hi] {
			return false
		}
	}
	return true
}

// ============================================================================
// 3. Fast / slow pointers (in-place rewrite)
// ============================================================================

// MoveZeros pushes every 0 to the end, keeping the order of the rest.
// O(n) / O(1). slow marks where the next non-zero belongs.
func MoveZeros(nums []int) []int {
	slow := 0
	for fast := range nums {
		if nums[fast] != 0 {
			nums[slow], nums[fast] = nums[fast], nums[slow]
			slow++
		}
	}
	return nums
}

// RemoveDuplicatesSorted dedups in place and returns the new logical length.
// The caller keeps nums[:n]. O(n) / O(1).
func RemoveDuplicatesSorted(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	slow := 0
	for fast := 1; fast < len(nums); fast++ {
		if nums[fast] != nums[slow] {
			slow++
			nums[slow] = nums[fast]
		}
	}
	return slow + 1
}

// ============================================================================
// 4. Kadane - maximum subarray sum
// ============================================================================

// MaxSubarray returns the largest sum of a contiguous subarray. O(n) / O(1).
// At each element: extend the running subarray, or restart here? A negative
// running sum can only hurt what follows.
func MaxSubarray(nums []int) (int, error) {
	if len(nums) == 0 {
		return 0, fmt.Errorf("max subarray of an empty slice is undefined")
	}
	best, current := nums[0], nums[0]
	for _, x := range nums[1:] {
		current = max(x, current+x) // Go 1.21 builtin
		best = max(best, current)
	}
	return best, nil
}

// ============================================================================
// 5. Prefix sums
// ============================================================================

// PrefixSum answers any range sum in O(1) after an O(n) build.
// pre[0] == 0 so RangeSum needs no special cases.
type PrefixSum struct{ pre []int }

func NewPrefixSum(nums []int) *PrefixSum {
	pre := make([]int, len(nums)+1)
	for i, x := range nums {
		pre[i+1] = pre[i] + x
	}
	return &PrefixSum{pre: pre}
}

// RangeSum returns the sum of nums[left:right] - right is exclusive.
func (p *PrefixSum) RangeSum(left, right int) int {
	return p.pre[right] - p.pre[left]
}

// PrefixSum2D answers any rectangle sum in O(1) after an O(rows*cols) build.
//
// pre[r][c] holds the sum of the whole rectangle from the top-left corner to
// (r, c) EXCLUSIVE - so row 0 and column 0 stay zero and there are no boundary
// special cases, exactly as in the 1-D version.
//
// BUILDING (inclusion-exclusion, going in):
//
//	pre[r+1][c+1] = grid[r][c]
//	              + pre[r][c+1]     // everything above
//	              + pre[r+1][c]     // everything to the left
//	              - pre[r][c]       // the overlap, added twice
//
// QUERYING (inclusion-exclusion, coming back out):
//
//	+-------+-------+
//	|   A   |   B   |     want D
//	+-------+-------+
//	|   C   |   D   |     D = total - B - C + A
//	+-------+-------+
//
// The `+ A` is the whole trick: the top strip and the left strip both contain
// corner A, so subtracting both removes it twice and it has to be added back.
// Forgetting that term is the standard bug - and it only shows up on a query
// that touches neither the top nor the left edge.
//
// Use it for many rectangle sums over a FIXED grid. If the grid changes, a 2-D
// Fenwick tree (chapter 19) gives O(log^2 n) updates instead.
type PrefixSum2D struct{ pre [][]int }

// NewPrefixSum2D builds the table. O(rows * cols).
func NewPrefixSum2D(grid [][]int) *PrefixSum2D {
	rows := len(grid)
	cols := 0
	if rows > 0 {
		cols = len(grid[0])
	}

	// One extra row and column of zeros, so no index can go negative.
	pre := make([][]int, rows+1)
	for i := range pre {
		pre[i] = make([]int, cols+1)
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			pre[r+1][c+1] = grid[r][c] +
				pre[r][c+1] + // everything above
				pre[r+1][c] - // everything to the left
				pre[r][c] // overlap counted twice
		}
	}
	return &PrefixSum2D{pre: pre}
}

// RangeSum returns the sum of the rectangle [top:bottom] x [left:right], both
// exclusive. O(1).
func (p *PrefixSum2D) RangeSum(top, left, bottom, right int) int {
	return p.pre[bottom][right] -
		p.pre[top][right] - // strip above
		p.pre[bottom][left] + // strip to the left
		p.pre[top][left] // corner removed twice
}

// ============================================================================
// 6. Sliding window
// ============================================================================

// MaxSumWindow returns the largest sum of k consecutive elements. O(n) / O(1).
// Slide rather than recompute: add the entrant, drop the leaver.
func MaxSumWindow(nums []int, k int) (int, error) {
	if k <= 0 || k > len(nums) {
		return 0, fmt.Errorf("k must be in [1,%d]", len(nums))
	}
	window := 0
	for _, x := range nums[:k] {
		window += x
	}
	best := window
	for i := k; i < len(nums); i++ {
		window += nums[i] - nums[i-k]
		best = max(best, window)
	}
	return best, nil
}

// LongestUniqueWindow returns the length of the longest substring with no
// repeated byte - a variable-size window. O(n).
func LongestUniqueWindow(s string) int {
	lastSeen := make(map[byte]int)
	left, best := 0, 0
	for right := 0; right < len(s); right++ {
		if idx, ok := lastSeen[s[right]]; ok && idx >= left {
			left = idx + 1 // jump past the previous occurrence
		}
		lastSeen[s[right]] = right
		best = max(best, right-left+1)
	}
	return best
}

// ============================================================================
// 7. In-place rotation and partitioning
// ============================================================================

// RotateRight rotates by k using three reversals. O(n) time, O(1) space.
func RotateRight(nums []int, k int) []int {
	n := len(nums)
	if n == 0 {
		return nums
	}
	k = ((k % n) + n) % n // normalise, negatives included

	reverse := func(lo, hi int) {
		for lo < hi {
			nums[lo], nums[hi] = nums[hi], nums[lo]
			lo, hi = lo+1, hi-1
		}
	}

	reverse(0, n-1)
	reverse(0, k-1)
	reverse(k, n-1)
	return nums
}

// DutchFlagSort sorts a slice of 0/1/2 in ONE pass. O(n) / O(1).
// Invariant: [0,low) are 0s, [low,mid) are 1s, (high,end) are 2s.
func DutchFlagSort(nums []int) []int {
	low, mid, high := 0, 0, len(nums)-1
	for mid <= high {
		switch nums[mid] {
		case 0:
			nums[low], nums[mid] = nums[mid], nums[low]
			low++
			mid++
		case 1:
			mid++
		default:
			nums[mid], nums[high] = nums[high], nums[mid]
			high-- // do NOT advance mid: the swapped-in value is unexamined
		}
	}
	return nums
}

// ============================================================================
// 8. Merging two sorted slices
// ============================================================================

// MergeSorted is the merge step of merge sort. O(n+m) time and space.
func MergeSorted(a, b []int) []int {
	out := make([]int, 0, len(a)+len(b)) // pre-sized: no regrowth
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] { // <= keeps the merge stable
			out = append(out, a[i])
			i++
		} else {
			out = append(out, b[j])
			j++
		}
	}
	out = append(out, a[i:]...) // at most one of these is non-empty
	out = append(out, b[j:]...)
	return out
}

// ============================================================================
// demo
// ============================================================================

// ============================================================================
// Memory layout: why the same loop has two speeds
// ============================================================================

// SumRowMajor walks the grid the way it is stored: row by row.
//
// Memory is a flat line, and a 2-D grid has to be flattened onto it somehow.
// ROW-MAJOR order (C, C++, Java, Go, Python) stores row 0, then row 1, and so
// on. Column-major (Fortran, MATLAB, R) does the opposite.
//
// The CPU never fetches one value. It fetches a CACHE LINE - 64 bytes on x86,
// so 8 int64s. Walking along a row means every fetch delivers the next seven
// iterations for free: one miss, then seven hits.
func SumRowMajor(flat []int, rows, cols int) int {
	total := 0
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			total += flat[r*cols+c]
		}
	}
	return total
}

// SumColumnMajor walks ACROSS the storage order: column by column.
//
// Identical arithmetic, identical result, two lines swapped - and several times
// slower on the same data.
//
// Each step jumps a whole row ahead in memory. Once a row exceeds a cache line
// (it usually does), every access is a fresh miss, and the 64 bytes fetched are
// evicted before the other values are ever used. The memory bandwidth spent is
// the same; the useful fraction of it is not.
//
// This is the gap between an algorithm's COMPLEXITY - both loops are
// O(rows * cols), identically - and its CONSTANT FACTOR. Big-O deliberately
// ignores what the hardware is doing, which is why it is necessary but never
// sufficient.
func SumColumnMajor(flat []int, rows, cols int) int {
	total := 0
	for c := 0; c < cols; c++ {
		for r := 0; r < rows; r++ {
			total += flat[r*cols+c]
		}
	}
	return total
}

// AliasedGrid is the classic broken 2-D initialisation. DO NOT use this.
//
// One backing row is allocated and the SAME slice header is copied into every
// outer slot. A slice header points at shared backing memory, so writing to
// grid[0][0] writes to every row at once.
//
// It is silent: the shape is right, the values start right, and it only goes
// wrong on the first write. Kept here purely so the demo can prove it.
func AliasedGrid(rows, cols int) [][]int {
	row := make([]int, cols)
	grid := make([][]int, rows)
	for i := range grid {
		grid[i] = row // every row shares ONE backing array
	}
	return grid
}

// IndependentGrid is the correct version: a fresh allocation per row.
//
// For a genuinely rectangular grid, prefer ONE flat slice plus index
// arithmetic (flat[r*cols+c]). A [][]int is a slice of slice HEADERS, each
// pointing at a separate allocation, so the rows are scattered and every access
// costs an extra indirection.
func IndependentGrid(rows, cols int) [][]int {
	grid := make([][]int, rows)
	for i := range grid {
		grid[i] = make([]int, cols) // a NEW backing array per row
	}
	return grid
}

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
	d := NewDynamicArray()
	for i := 0; i < 5; i++ {
		d.Push(i)
	}
	assert(d.Len() == 5 && d.Capacity() >= 5, "push grows the array")
	assert(equal(d.Slice(), []int{0, 1, 2, 3, 4}), "push order")
	assert(d.Insert(0, 99) == nil, "insert at head")
	assert(equal(d.Slice(), []int{99, 0, 1, 2, 3, 4}), "insert shifts right")
	v, err := d.RemoveAt(0)
	assert(v == 99 && err == nil, "removeAt returns the old value")
	_, err = d.Get(99)
	assert(err != nil, "out-of-range read is an error, not a panic")

	lo, hi := TwoSumSorted([]int{1, 3, 5, 8}, 11)
	assert(lo == 1 && hi == 3, "twoSumSorted")
	lo, _ = TwoSumSorted([]int{1, 2}, 99)
	assert(lo == -1, "twoSumSorted miss")
	assert(IsPalindrome([]int{1, 2, 1}) && !IsPalindrome([]int{1, 2}), "palindrome")

	assert(equal(MoveZeros([]int{0, 1, 0, 3}), []int{1, 3, 0, 0}), "moveZeros")

	dups := []int{1, 1, 2, 2, 3}
	n := RemoveDuplicatesSorted(dups)
	assert(n == 3 && equal(dups[:n], []int{1, 2, 3}), "dedup sorted")

	best, _ := MaxSubarray([]int{-2, 1, -3, 4, -1, 2, 1, -5, 4})
	assert(best == 6, "kadane picks [4,-1,2,1]")
	best, _ = MaxSubarray([]int{-5, -2, -9})
	assert(best == -2, "kadane with all negatives")
	_, err = MaxSubarray(nil)
	assert(err != nil, "empty input is an error")

	ps := NewPrefixSum([]int{1, 2, 3, 4})
	assert(ps.RangeSum(0, 4) == 10, "full range")
	assert(ps.RangeSum(1, 3) == 5, "inner range")
	assert(ps.RangeSum(2, 2) == 0, "empty range")

	w, _ := MaxSumWindow([]int{1, 5, 2, 9, 1}, 2)
	assert(w == 11, "fixed window")
	_, err = MaxSumWindow([]int{1}, 5)
	assert(err != nil, "window bigger than input is an error")
	assert(LongestUniqueWindow("abcabcbb") == 3, "variable window")
	assert(LongestUniqueWindow("") == 0, "empty string")

	assert(equal(RotateRight([]int{1, 2, 3, 4, 5}, 2), []int{4, 5, 1, 2, 3}), "rotate")
	assert(equal(RotateRight([]int{1, 2, 3}, 3), []int{1, 2, 3}), "full rotation")

	assert(equal(DutchFlagSort([]int{2, 0, 2, 1, 1, 0}), []int{0, 0, 1, 1, 2, 2}), "dutch flag")

	assert(equal(MergeSorted([]int{1, 4}, []int{2, 3, 5}), []int{1, 2, 3, 4, 5}), "merge")
	assert(equal(MergeSorted(nil, []int{1}), []int{1}), "merge with empty")

	// --- 2-D prefix sums ------------------------------------------------------
	grid := [][]int{
		{3, 0, 1, 4},
		{5, 6, 3, 2},
		{1, 2, 0, 1},
	}
	gridSums := NewPrefixSum2D(grid)
	assert(gridSums.RangeSum(0, 0, 3, 4) == 28, "the whole grid")
	assert(gridSums.RangeSum(1, 1, 3, 3) == 11, "interior rectangle 6+3+2+0")
	assert(gridSums.RangeSum(0, 0, 1, 1) == 3, "a single cell")
	assert(gridSums.RangeSum(2, 2, 2, 2) == 0, "an empty rectangle")

	// Interior queries are the ones that catch a missing `+ corner` term, so
	// check every rectangle against a brute-force double loop.
	rng := rand.New(rand.NewSource(3))
	for trial := 0; trial < 40; trial++ {
		rows, cols := rng.Intn(8)+1, rng.Intn(8)+1
		cells := make([][]int, rows)
		for r := range cells {
			cells[r] = make([]int, cols)
			for c := range cells[r] {
				cells[r][c] = rng.Intn(41) - 20
			}
		}

		sums := NewPrefixSum2D(cells)
		for top := 0; top <= rows; top++ {
			for bottom := top; bottom <= rows; bottom++ {
				for left := 0; left <= cols; left++ {
					for right := left; right <= cols; right++ {
						expected := 0
						for r := top; r < bottom; r++ {
							for c := left; c < right; c++ {
								expected += cells[r][c]
							}
						}
						assert(sums.RangeSum(top, left, bottom, right) == expected,
							"rectangle sum matches brute force")
					}
				}
			}
		}
	}

	assert(NewPrefixSum2D(nil).RangeSum(0, 0, 0, 0) == 0, "no rows at all")
	// --- Memory layout -------------------------------------------------------
	// The aliasing trap, demonstrated rather than described.
	broken := AliasedGrid(3, 3)
	broken[0][0] = 9
	assert(broken[1][0] == 9 && broken[2][0] == 9, "all three rows changed at once")
	assert(&broken[0][0] == &broken[1][0], "because they share one backing array")

	fine := IndependentGrid(3, 3)
	fine[0][0] = 9
	assert(fine[1][0] == 0 && fine[2][0] == 0, "only the one cell moved")
	assert(&fine[0][0] != &fine[1][0], "separate allocations")

	// Row-major vs column-major: same complexity, same answer, different speed.
	const side = 3000
	flat := make([]int, side*side)
	for r := 0; r < side; r++ {
		for c := 0; c < side; c++ {
			flat[r*side+c] = r + c
		}
	}

	timeBestOf := func(fn func() int) float64 {
		best := math.Inf(1)
		for i := 0; i < 3; i++ { // minimum: timing noise only ever adds
			start := time.Now()
			sink := fn()
			_ = sink
			best = math.Min(best, float64(time.Since(start).Nanoseconds())/1e6)
		}
		return best
	}

	rowMs := timeBestOf(func() int { return SumRowMajor(flat, side, side) })
	colMs := timeBestOf(func() int { return SumColumnMajor(flat, side, side) })

	// The part that is a FACT: both orders compute the same sum.
	expectedSum := 0
	for r := 0; r < side; r++ {
		for c := 0; c < side; c++ {
			expectedSum += r + c
		}
	}
	assert(SumRowMajor(flat, side, side) == expectedSum, "row-major sum")
	assert(SumColumnMajor(flat, side, side) == expectedSum, "column-major sum")

	// The part that is a MEASUREMENT: row-major is normally several times
	// faster. The assertion is deliberately loose - a busy machine can distort
	// any timing - but the printed ratio shows the real effect.
	assert(rowMs < colMs*1.5, "row-major should not be slower")

	fmt.Printf("  row-major    %7.1f ms\n", rowMs)
	fmt.Printf("  column-major %7.1f ms   <- %.1fx slower, same O(n^2)\n",
		colMs, colMs/rowMs)

	fmt.Println("03-Arrays (Go): all checks passed")
	fmt.Println("  2-D prefix sums checked against brute force on every rectangle")
}
