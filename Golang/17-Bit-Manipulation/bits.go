// 17 - Bit Manipulation: the idioms, the XOR tricks, bitmasks as sets, and
// Go's own operators (^ for NOT, &^ for AND NOT).
//
// Run:  go run bits.go
package main

import (
	"fmt"
	"math/bits"
	"sort"
)

// ============================================================================
// 1. Single-bit operations
// ============================================================================

func GetBit(n, i int) int    { return (n >> i) & 1 }
func SetBit(n, i int) int    { return n | (1 << i) }
func ToggleBit(n, i int) int { return n ^ (1 << i) } // XOR 1 flips, XOR 0 keeps

// ClearBit uses Go's AND NOT operator. `n &^ x` clears exactly the bits set in
// x - no other mainstream language has this as a single operator.
func ClearBit(n, i int) int { return n &^ (1 << i) }

// LowestSetBit isolates the lowest set bit. Works because -n is ^n + 1 in
// two's complement: every bit above the lowest set bit is inverted, so only
// that one survives. This is the core of the Fenwick tree in chapter 19.
func LowestSetBit(n int) int { return n & -n }

// ClearLowestSetBit removes the lowest set bit: n-1 flips it to 0 and sets
// everything below it to 1, so the AND clears exactly that bit.
func ClearLowestSetBit(n int) int { return n & (n - 1) }

// ============================================================================
// 2. Counting
// ============================================================================

// CountSetBitsNaive checks every bit. O(width).
func CountSetBitsNaive(n uint) int {
	count := 0
	for n != 0 {
		count += int(n & 1)
		n >>= 1
	}
	return count
}

// CountSetBitsKernighan runs once per SET bit, not per bit. On 0b10000000
// that is 1 iteration instead of 8.
func CountSetBitsKernighan(n uint) int {
	count := 0
	for n != 0 {
		n &= n - 1 // clear the lowest set bit
		count++
	}
	return count
}

// CountBitsUpTo returns set-bit counts for 0..n in O(n) total - a tiny DP over
// bits: dropping the last bit gives a smaller, already-computed number.
func CountBitsUpTo(n int) []int {
	counts := make([]int, n+1)
	for i := 1; i <= n; i++ {
		counts[i] = counts[i>>1] + (i & 1)
	}
	return counts
}

// ============================================================================
// 3. Powers of two
// ============================================================================

// IsPowerOfTwo: a power of two has exactly ONE set bit, so n&(n-1) clears it.
func IsPowerOfTwo(n int) bool { return n > 0 && n&(n-1) == 0 }

// NextPowerOfTwo returns the smallest power of two >= n.
// bits.Len(x) is 1 + floor(log2(x)), which makes this O(1).
func NextPowerOfTwo(n int) int {
	if n <= 1 {
		return 1
	}
	return 1 << bits.Len(uint(n-1))
}

// ============================================================================
// 4. XOR tricks
// ============================================================================

// SingleNumber finds the one value that appears once when all others appear
// twice. O(n) time, O(1) SPACE - a map would solve it too, in O(n) space.
func SingleNumber(nums []int) int {
	result := 0
	for _, x := range nums {
		result ^= x // pairs cancel in any order
	}
	return result
}

// SingleNumberTwoUniques handles exactly two values appearing once.
// XOR everything to get a ^ b; any set bit there is a bit where a and b
// DIFFER, so partitioning the slice on that bit separates them.
func SingleNumberTwoUniques(nums []int) (int, int) {
	xorAll := 0
	for _, x := range nums {
		xorAll ^= x
	}

	distinguishing := xorAll & -xorAll // a bit where they differ
	a, b := 0, 0
	for _, x := range nums {
		if x&distinguishing != 0 {
			a ^= x
		} else {
			b ^= x
		}
	}
	if a < b {
		return a, b
	}
	return b, a
}

// MissingNumber finds the value missing from 0..n. O(n) time, O(1) space.
// XOR the indices with the values: everything present cancels. Immune to the
// overflow the sum formula can cause.
func MissingNumber(nums []int) int {
	result := len(nums)
	for i, x := range nums {
		result ^= i ^ x
	}
	return result
}

// SwapWithoutTemp is the classic XOR swap - a party trick (multiple assignment
// is clearer) that demonstrates XOR being its own inverse.
func SwapWithoutTemp(a, b int) (int, int) {
	a ^= b
	b ^= a // b = (a^b)^b = a
	a ^= b // a = (a^b)^a = b
	return a, b
}

// ============================================================================
// 5. Fixed-width work
// ============================================================================

// ReverseBits reverses a 32-bit value. O(32).
// (math/bits.Reverse32 does this in one instruction - see the demo.)
func ReverseBits(n uint32) uint32 {
	var result uint32
	for i := 0; i < 32; i++ {
		result = (result << 1) | (n & 1)
		n >>= 1
	}
	return result
}

// AddWithoutPlus adds using only bitwise operations.
// a ^ b adds without carrying; (a & b) << 1 is the carry. Repeat until the
// carry is zero. uint avoids any signed-overflow question.
func AddWithoutPlus(a, b int) int {
	x, y := uint(a), uint(b)
	for y != 0 {
		carry := (x & y) << 1
		x ^= y
		y = carry
	}
	return int(x)
}

// ============================================================================
// 6. Bitmasks as sets
// ============================================================================

// SubsetsBitmask enumerates all 2^n subsets using each integer as a membership
// mask. O(n * 2^n) - the same as chapter 07's backtracking, with no recursion
// and no explicit undo step.
func SubsetsBitmask(items []int) [][]int {
	n := len(items)
	out := make([][]int, 0, 1<<n)
	for mask := 0; mask < 1<<n; mask++ {
		var subset []int
		for i := 0; i < n; i++ {
			if mask&(1<<i) != 0 {
				subset = append(subset, items[i])
			}
		}
		out = append(out, subset)
	}
	return out
}

// Submasks returns every submask of mask, including 0.
// sub = (sub - 1) & mask jumps straight to the next submask instead of walking
// every integer - the standard trick in bitmask DP.
func Submasks(mask int) []int {
	var out []int
	for sub := mask; ; sub = (sub - 1) & mask {
		out = append(out, sub)
		if sub == 0 {
			break
		}
	}
	return out
}

// HammingDistance counts the bits that differ: XOR marks them, then count.
func HammingDistance(a, b int) int { return CountSetBitsKernighan(uint(a ^ b)) }

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
	n := 0b1010 // 10
	assert(GetBit(n, 1) == 1 && GetBit(n, 0) == 0, "get bit")
	assert(SetBit(n, 0) == 0b1011, "set bit")
	assert(ClearBit(n, 1) == 0b1000, "clear bit with &^")
	assert(ToggleBit(n, 3) == 0b0010, "toggle bit")
	assert(ToggleBit(ToggleBit(n, 3), 3) == n, "toggling twice is identity")

	assert(LowestSetBit(0b1100) == 0b100, "lowest set bit")
	assert(LowestSetBit(0b1000) == 0b1000, "already a single bit")
	assert(ClearLowestSetBit(0b1100) == 0b1000, "clear lowest set bit")
	assert(ClearLowestSetBit(1) == 0, "clearing the only bit")

	for value := uint(0); value < 300; value++ {
		expected := bits.OnesCount(value) // the standard library reference
		assert(CountSetBitsNaive(value) == expected, "naive popcount")
		assert(CountSetBitsKernighan(value) == expected, "kernighan popcount")
	}
	assert(equal(CountBitsUpTo(5), []int{0, 1, 1, 2, 1, 2}), "counting bits DP")
	assert(CountBitsUpTo(16)[16] == 1, "16 has one set bit")

	assert(IsPowerOfTwo(1) && IsPowerOfTwo(1024), "powers of two")
	assert(!IsPowerOfTwo(0) && !IsPowerOfTwo(6), "not powers of two")
	assert(!IsPowerOfTwo(-8), "negatives never qualify")
	assert(NextPowerOfTwo(1) == 1, "next power of two: 1")
	assert(NextPowerOfTwo(5) == 8, "next power of two: 5 -> 8")
	assert(NextPowerOfTwo(16) == 16, "already a power of two")

	assert(SingleNumber([]int{4, 1, 2, 1, 2}) == 4, "single number")
	assert(SingleNumber([]int{1}) == 1, "single element")
	assert(SingleNumber([]int{-1, -1, 7}) == 7, "negatives work too")

	a, b := SingleNumberTwoUniques([]int{1, 2, 1, 3, 2, 5})
	assert(a == 3 && b == 5, "two uniques")
	a, b = SingleNumberTwoUniques([]int{9, 4})
	assert(a == 4 && b == 9, "two uniques, sorted")

	assert(MissingNumber([]int{3, 0, 1}) == 2, "missing number")
	assert(MissingNumber([]int{0}) == 1, "missing the last")
	assert(MissingNumber([]int{9, 6, 4, 2, 3, 5, 7, 0, 1}) == 8, "missing 8")

	x, y := SwapWithoutTemp(3, 5)
	assert(x == 5 && y == 3, "xor swap")

	assert(ReverseBits(1) == 1<<31, "reverse bits")
	assert(ReverseBits(1<<31) == 1, "reverse back")
	assert(ReverseBits(0) == 0, "reverse zero")
	assert(ReverseBits(ReverseBits(0b1011)) == 0b1011, "self-inverse")
	assert(ReverseBits(0b1011) == bits.Reverse32(0b1011), "matches math/bits")

	assert(AddWithoutPlus(3, 5) == 8, "bitwise addition")
	assert(AddWithoutPlus(-3, 5) == 2, "with a negative")
	assert(AddWithoutPlus(-7, -8) == -15, "both negative")
	assert(AddWithoutPlus(0, 0) == 0, "zero")

	subs := SubsetsBitmask([]int{1, 2, 3})
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
	assert(empty == 1 && full == 1, "empty and full subsets present once each")

	allSubmasks := Submasks(0b1010)
	sort.Ints(allSubmasks)
	assert(equal(allSubmasks, []int{0b0000, 0b0010, 0b1000, 0b1010}), "submasks")
	for _, sub := range allSubmasks {
		assert(sub&0b1010 == sub, "every submask is a subset of the mask")
	}

	assert(HammingDistance(1, 4) == 2, "0001 vs 0100")
	assert(HammingDistance(3, 3) == 0, "identical values")

	// Go-specific behaviour worth knowing.
	assert(^5 == -6, "unary ^ is NOT in Go")
	assert(0b1100&^0b1000 == 0b0100, "&^ clears bits in one operation")
	assert(bits.TrailingZeros64(0) == 64, "defined for zero, unlike C's ctz")
	assert(bits.Len(uint(255)) == 8, "bit length")
	assert(1<<40 > 0, "int is 64-bit: no 32-bit wraparound")

	fmt.Println("17-Bit-Manipulation (Go): all checks passed")
}
