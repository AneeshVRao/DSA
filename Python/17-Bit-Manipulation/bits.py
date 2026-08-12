"""
17 - Bit Manipulation: the idioms, the XOR tricks, and bitmasks as sets.

Run:  python bits.py
"""

from __future__ import annotations


# ============================================================================
# 1. Single-bit operations
# ============================================================================
def get_bit(n: int, i: int) -> int:
    """Value of bit i (0 = least significant). O(1)."""
    return (n >> i) & 1


def set_bit(n: int, i: int) -> int:
    """Turn bit i on. O(1)."""
    return n | (1 << i)


def clear_bit(n: int, i: int) -> int:
    """Turn bit i off. O(1)."""
    return n & ~(1 << i)


def toggle_bit(n: int, i: int) -> int:
    """Flip bit i. XOR with 1 flips, XOR with 0 leaves alone."""
    return n ^ (1 << i)


def lowest_set_bit(n: int) -> int:
    """Isolate the lowest set bit. O(1).

    Works because -n is ~n + 1 in two's complement: every bit above the lowest
    set bit is inverted, so only that bit survives the AND. This is the core
    of the Fenwick tree in chapter 19.
    """
    return n & -n


def clear_lowest_set_bit(n: int) -> int:
    """Clear the lowest set bit. O(1).

    n - 1 flips the lowest set bit to 0 and sets everything below it to 1, so
    the AND clears exactly that one bit.
    """
    return n & (n - 1)


# ============================================================================
# 2. Counting
# ============================================================================
def count_set_bits_naive(n: int) -> int:
    """Check every bit. O(number of bits)."""
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count


def count_set_bits_kernighan(n: int) -> int:
    """Brian Kernighan: loop once per SET bit, not once per bit. O(popcount).

    On 0b10000000 this does one iteration instead of eight.
    """
    count = 0
    while n:
        n &= n - 1                       # clear the lowest set bit
        count += 1
    return count


def count_bits_up_to(n: int) -> list[int]:
    """Set-bit counts for 0..n in O(n) total - a tiny DP over bits.

    count[i] = count[i >> 1] + (i & 1): dropping the last bit gives a smaller,
    already-computed number.
    """
    counts = [0] * (n + 1)
    for i in range(1, n + 1):
        counts[i] = counts[i >> 1] + (i & 1)
    return counts


# ============================================================================
# 3. Powers of two
# ============================================================================
def is_power_of_two(n: int) -> bool:
    """A power of two has exactly ONE set bit, so n & (n-1) clears it to 0."""
    return n > 0 and (n & (n - 1)) == 0


def next_power_of_two(n: int) -> int:
    """Smallest power of two >= n. O(1) with bit_length."""
    if n <= 1:
        return 1
    return 1 << (n - 1).bit_length()


# ============================================================================
# 4. XOR tricks
# ============================================================================
def single_number(nums: list[int]) -> int:
    """Every value appears twice except one. O(n) time, O(1) SPACE.

    x ^ x == 0 and x ^ 0 == x, and XOR is commutative, so every pair cancels
    regardless of order. A hash set solves this too - in O(n) space.
    """
    result = 0
    for x in nums:
        result ^= x
    return result


def single_number_two_uniques(nums: list[int]) -> tuple[int, int]:
    """Exactly two values appear once; everything else twice. O(n) / O(1).

    XOR everything: the result is a ^ b for the two singles. Any set bit in it
    is a bit where a and b DIFFER, so partitioning the list by that bit puts a
    and b in different buckets - and each bucket then has a single unique.
    """
    xor_all = 0
    for x in nums:
        xor_all ^= x

    distinguishing_bit = xor_all & -xor_all      # any bit where they differ
    a = b = 0
    for x in nums:
        if x & distinguishing_bit:
            a ^= x
        else:
            b ^= x
    return (a, b) if a < b else (b, a)


def missing_number(nums: list[int]) -> int:
    """One number missing from 0..n. O(n) time, O(1) space.

    XOR the indices with the values: everything present cancels, leaving the
    missing one. Immune to the overflow that the sum formula can cause in
    fixed-width languages.
    """
    result = len(nums)
    for i, x in enumerate(nums):
        result ^= i ^ x
    return result


def swap_without_temp(a: int, b: int) -> tuple[int, int]:
    """The classic XOR swap. A party trick - tuple unpacking is clearer and
    faster - but it shows that XOR is its own inverse."""
    a ^= b
    b ^= a                               # b = (a^b)^b = a
    a ^= b                               # a = (a^b)^a = b
    return a, b


# ============================================================================
# 5. 32-bit emulation
# ============================================================================
MASK32 = 0xFFFFFFFF


def reverse_bits(n: int) -> int:
    """Reverse the bits of a 32-bit unsigned integer. O(32).

    Python has no fixed width, so the loop count must be explicit.
    """
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result & MASK32


def add_without_plus(a: int, b: int) -> int:
    """Addition using only bitwise operations. O(bits).

    a ^ b adds without carrying; (a & b) << 1 is the carry. Repeat until the
    carry is zero.

    The masking is what makes this work in Python: its integers are infinitely
    sign-extended, so a negative carry would loop forever without the & MASK32,
    and the result must be reinterpreted as signed at the end.
    """
    while b:
        carry = (a & b) << 1
        a = (a ^ b) & MASK32
        b = carry & MASK32
    return a if a <= 0x7FFFFFFF else a - (1 << 32)      # back to signed


# ============================================================================
# 6. Bitmasks as sets
# ============================================================================
def subsets_bitmask(items: list[int]) -> list[list[int]]:
    """All 2^n subsets, using each integer 0..2^n-1 as a membership mask.

    O(n * 2^n) - the same as the backtracking version in chapter 07, but with
    no recursion and no explicit undo step.
    """
    n = len(items)
    out: list[list[int]] = []
    for mask in range(1 << n):
        out.append([items[i] for i in range(n) if mask & (1 << i)])
    return out


def submasks(mask: int) -> list[int]:
    """Every submask of `mask`, including 0. O(number of submasks).

    sub = (sub - 1) & mask skips straight to the next submask instead of
    walking all 2^32 integers - the standard trick in bitmask DP.
    """
    out = [mask]
    sub = (mask - 1) & mask
    while sub:
        out.append(sub)
        sub = (sub - 1) & mask
    out.append(0)
    return out


def hamming_distance(a: int, b: int) -> int:
    """Bits that differ. XOR marks the differences; then count them."""
    return count_set_bits_kernighan(a ^ b)


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    n = 0b1010                                   # 10
    assert get_bit(n, 1) == 1 and get_bit(n, 0) == 0
    assert set_bit(n, 0) == 0b1011
    assert clear_bit(n, 1) == 0b1000
    assert toggle_bit(n, 3) == 0b0010
    assert toggle_bit(toggle_bit(n, 3), 3) == n  # toggling twice is identity

    assert lowest_set_bit(0b1100) == 0b100
    assert lowest_set_bit(0b1000) == 0b1000
    assert clear_lowest_set_bit(0b1100) == 0b1000
    assert clear_lowest_set_bit(0b1) == 0

    for value in range(0, 300):
        expected = bin(value).count("1")
        assert count_set_bits_naive(value) == expected
        assert count_set_bits_kernighan(value) == expected
    assert count_bits_up_to(5) == [0, 1, 1, 2, 1, 2]
    assert count_bits_up_to(16)[16] == 1

    assert is_power_of_two(1) and is_power_of_two(1024)
    assert not is_power_of_two(0) and not is_power_of_two(6)
    assert not is_power_of_two(-8)               # negatives are never powers
    assert next_power_of_two(1) == 1
    assert next_power_of_two(5) == 8
    assert next_power_of_two(16) == 16

    assert single_number([4, 1, 2, 1, 2]) == 4
    assert single_number([1]) == 1
    assert single_number([-1, -1, 7]) == 7       # negatives work too

    assert single_number_two_uniques([1, 2, 1, 3, 2, 5]) == (3, 5)
    assert single_number_two_uniques([9, 4]) == (4, 9)

    assert missing_number([3, 0, 1]) == 2
    assert missing_number([0]) == 1
    assert missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]) == 8

    assert swap_without_temp(3, 5) == (5, 3)

    assert reverse_bits(0b1) == 1 << 31
    assert reverse_bits(1 << 31) == 1
    assert reverse_bits(0) == 0
    assert reverse_bits(reverse_bits(0b1011)) == 0b1011      # self-inverse

    assert add_without_plus(3, 5) == 8
    assert add_without_plus(-3, 5) == 2          # the masking earns its keep
    assert add_without_plus(-7, -8) == -15
    assert add_without_plus(0, 0) == 0

    subs = subsets_bitmask([1, 2, 3])
    assert len(subs) == 8                        # 2^3
    assert [] in subs and [1, 2, 3] in subs and [2, 3] in subs

    all_submasks = submasks(0b1010)
    assert sorted(all_submasks) == [0b0000, 0b0010, 0b1000, 0b1010]
    # Every submask really is a subset of the original mask.
    assert all((sub & 0b1010) == sub for sub in all_submasks)

    assert hamming_distance(1, 4) == 2           # 0001 vs 0100
    assert hamming_distance(3, 3) == 0

    print("17-Bit-Manipulation (Python): all checks passed")


if __name__ == "__main__":
    demo()
