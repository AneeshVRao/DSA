"""
08 - Searching: binary search and every variant that actually shows up -
boundaries, rotated arrays, matrices, and binary search on the answer.

Run:  python searching.py
"""

from __future__ import annotations

import bisect


# ============================================================================
# 1. Linear search
# ============================================================================
def linear_search(nums: list[int], target: int) -> int:
    """O(n). The right choice for unsorted data searched only once."""
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1


# ============================================================================
# 2. Binary search
# ============================================================================
def binary_search(nums: list[int], target: int) -> int:
    """Index of target in a SORTED list, or -1. O(log n) time, O(1) space.

    Inclusive bounds [lo, hi], so the loop condition must be <= and the
    updates must be mid +/- 1 - that pairing is what guarantees progress.
    """
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2       # overflow-proof habit from C++
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def binary_search_recursive(nums: list[int], target: int,
                            lo: int = 0, hi: int | None = None) -> int:
    """Same algorithm, O(log n) stack instead of O(1).

    Note the index bounds rather than slicing - `nums[mid+1:]` would copy and
    turn this into O(n log n).
    """
    if hi is None:
        hi = len(nums) - 1
    if lo > hi:
        return -1
    mid = lo + (hi - lo) // 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        return binary_search_recursive(nums, target, mid + 1, hi)
    return binary_search_recursive(nums, target, lo, mid - 1)


# ============================================================================
# 3. Boundary variants
# ============================================================================
def lower_bound(nums: list[int], target: int) -> int:
    """First index with nums[i] >= target (insertion point). O(log n).

    Half-open bounds [lo, hi): the loop uses < and hi = mid, never mid - 1.
    Never returns early - it keeps squeezing until the boundary is exact.
    """
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(nums: list[int], target: int) -> int:
    """First index with nums[i] > target. O(log n)."""
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def first_occurrence(nums: list[int], target: int) -> int:
    """Leftmost index of target, or -1."""
    i = lower_bound(nums, target)
    return i if i < len(nums) and nums[i] == target else -1


def last_occurrence(nums: list[int], target: int) -> int:
    """Rightmost index of target, or -1."""
    i = upper_bound(nums, target) - 1
    return i if i >= 0 and nums[i] == target else -1


def count_occurrences(nums: list[int], target: int) -> int:
    """How many times target appears. O(log n) instead of O(n) counting."""
    return upper_bound(nums, target) - lower_bound(nums, target)


# ============================================================================
# 4. Rotated arrays
# ============================================================================
def search_rotated(nums: list[int], target: int) -> int:
    """Search a sorted array that was rotated at an unknown pivot. O(log n).

    Key insight: at any mid, at least ONE half is properly sorted. Work out
    which, test whether the target lies inside it, and discard the other half.
    """
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid

        if nums[lo] <= nums[mid]:               # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                   # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


def find_min_rotated(nums: list[int]) -> int:
    """Smallest element of a rotated sorted array. O(log n).

    Compare against the RIGHT end: if nums[mid] > nums[hi] the minimum must be
    to the right of mid, otherwise mid itself could still be it.
    """
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid                            # mid stays a candidate
    return nums[lo]


def find_peak(nums: list[int]) -> int:
    """Index of any element greater than both neighbours. O(log n).

    Works on unsorted input: whichever side goes uphill is guaranteed to
    contain a peak, because the ends count as -infinity.
    """
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1                        # uphill to the right
        else:
            hi = mid                            # mid could be the peak
    return lo


# ============================================================================
# 5. Matrices
# ============================================================================
def search_matrix(matrix: list[list[int]], target: int) -> bool:
    """Rows sorted, and each row starts after the previous row ends.

    Treat it as one flat sorted array of length rows*cols. O(log(rows*cols)).
    """
    if not matrix or not matrix[0]:
        return False
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        value = matrix[mid // cols][mid % cols]     # flat index -> (r, c)
        if value == target:
            return True
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False


def search_matrix_staircase(matrix: list[list[int]], target: int) -> bool:
    """Rows AND columns sorted, but rows do not chain. O(rows + cols).

    Start at the top-right corner: it is the largest in its row and the
    smallest in its column, so every comparison eliminates a whole row or
    column.
    """
    if not matrix or not matrix[0]:
        return False
    r, c = 0, len(matrix[0]) - 1
    while r < len(matrix) and c >= 0:
        if matrix[r][c] == target:
            return True
        if matrix[r][c] > target:
            c -= 1                              # this column is too big
        else:
            r += 1                              # this row is too small
    return False


# ============================================================================
# 6. Binary search on the answer
# ============================================================================
def integer_sqrt(n: int) -> int:
    """Largest x with x*x <= n. O(log n).

    The predicate "x*x <= n" is monotonic: true up to the answer, false after.
    """
    if n < 0:
        raise ValueError("negative input")
    lo, hi, best = 0, n, 0
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if mid * mid <= n:
            best = mid                          # feasible: record and go right
            lo = mid + 1
        else:
            hi = mid - 1
    return best


def min_ship_capacity(weights: list[int], days: int) -> int:
    """Smallest ship capacity that delivers all packages within `days` days.

    There is no array to search - we binary search the ANSWER between
    max(weights) (a ship must hold the heaviest package) and sum(weights)
    (one giant trip). `can_ship` is monotonic: a bigger ship is never worse.

    O(n log(sum)).
    """
    if days <= 0 or not weights:
        raise ValueError("bad input")

    def can_ship(capacity: int) -> bool:
        used, load = 1, 0
        for w in weights:
            if load + w > capacity:
                used += 1                       # start a new day
                load = 0
            load += w
        return used <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if can_ship(mid):
            hi = mid                            # feasible: try smaller
        else:
            lo = mid + 1
    return lo


def koko_eating_speed(piles: list[int], hours: int) -> int:
    """Minimum bananas-per-hour to finish all piles within `hours`.

    Same shape as min_ship_capacity: monotonic predicate, binary search the
    answer. O(n log(max_pile)).
    """
    def hours_needed(speed: int) -> int:
        return sum((p + speed - 1) // speed for p in piles)   # ceil division

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if hours_needed(mid) <= hours:
            hi = mid
        else:
            lo = mid + 1
    return lo


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    nums = [1, 3, 5, 7, 9, 11]
    assert linear_search(nums, 7) == 3 and linear_search(nums, 8) == -1

    assert binary_search(nums, 1) == 0            # first element
    assert binary_search(nums, 11) == 5           # last element
    assert binary_search(nums, 7) == 3
    assert binary_search(nums, 8) == -1
    assert binary_search([], 1) == -1             # empty input
    assert binary_search_recursive(nums, 9) == 4

    dups = [1, 2, 2, 2, 3, 5]
    assert lower_bound(dups, 2) == 1 and upper_bound(dups, 2) == 4
    assert lower_bound(dups, 4) == 5              # insertion point, no match
    assert upper_bound(dups, 5) == 6              # past the end
    assert first_occurrence(dups, 2) == 1
    assert last_occurrence(dups, 2) == 3
    assert first_occurrence(dups, 4) == -1
    assert count_occurrences(dups, 2) == 3
    assert count_occurrences(dups, 9) == 0
    # Agrees with the standard library, which is the real correctness check.
    assert lower_bound(dups, 2) == bisect.bisect_left(dups, 2)
    assert upper_bound(dups, 2) == bisect.bisect_right(dups, 2)

    rotated = [4, 5, 6, 7, 0, 1, 2]
    assert search_rotated(rotated, 0) == 4
    assert search_rotated(rotated, 5) == 1
    assert search_rotated(rotated, 3) == -1
    assert find_min_rotated(rotated) == 0
    assert find_min_rotated([3, 4, 5, 1, 2]) == 1
    assert find_min_rotated([1, 2, 3]) == 1       # not actually rotated

    peak = find_peak([1, 2, 3, 1])
    assert peak == 2
    peak2 = find_peak([1, 2, 1, 3, 5, 6, 4])
    assert peak2 in (1, 5)                        # either peak is valid

    matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]
    assert search_matrix(matrix, 3) and search_matrix(matrix, 60)
    assert not search_matrix(matrix, 13)

    staircase = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
    assert search_matrix_staircase(staircase, 5)
    assert not search_matrix_staircase(staircase, 10)

    assert integer_sqrt(0) == 0
    assert integer_sqrt(8) == 2                   # floor of 2.83
    assert integer_sqrt(16) == 4
    assert integer_sqrt(10**12) == 10**6

    assert min_ship_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) == 15
    assert min_ship_capacity([3, 2, 2, 4, 1, 4], 3) == 6
    assert koko_eating_speed([3, 6, 7, 11], 8) == 4
    assert koko_eating_speed([30, 11, 23, 4, 20], 5) == 30

    print("08-Searching (Python): all checks passed")


if __name__ == "__main__":
    demo()
