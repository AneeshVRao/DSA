"""
03 - Arrays: a dynamic array built from scratch, plus the five patterns that
solve most array problems.

Run:  python arrays.py
"""

from __future__ import annotations

import ctypes
import random
import time


# ============================================================================
# 1. A dynamic array from scratch (this is what `list` is underneath)
# ============================================================================
class DynamicArray:
    """Growable array over a fixed-size raw buffer.

    Doubling the capacity is what makes append amortised O(1): n appends
    perform at most 2n copies in total, so the cost per append is constant.
    """

    def __init__(self) -> None:
        self._n = 0                       # elements in use
        self._capacity = 1                # slots allocated
        self._buf = self._make_buffer(1)

    @staticmethod
    def _make_buffer(capacity: int):
        """A raw C array of `capacity` object pointers - no Python list."""
        return (capacity * ctypes.py_object)()

    def __len__(self) -> int:             # O(1): the count is stored
        return self._n

    def __getitem__(self, i: int):        # O(1): address arithmetic
        if not 0 <= i < self._n:
            raise IndexError("index out of range")
        return self._buf[i]

    def __setitem__(self, i: int, value) -> None:
        if not 0 <= i < self._n:
            raise IndexError("index out of range")
        self._buf[i] = value

    def append(self, value) -> None:      # O(1) amortised
        if self._n == self._capacity:
            self._resize(2 * self._capacity)
        self._buf[self._n] = value
        self._n += 1

    def insert(self, i: int, value) -> None:   # O(n): everything after i shifts
        if self._n == self._capacity:
            self._resize(2 * self._capacity)
        for j in range(self._n, i, -1):        # walk backwards, no overwrite
            self._buf[j] = self._buf[j - 1]
        self._buf[i] = value
        self._n += 1

    def pop(self, i: int | None = None):       # O(1) at the end, O(n) elsewhere
        if self._n == 0:
            raise IndexError("pop from empty array")
        if i is None:
            i = self._n - 1
        value = self._buf[i]
        for j in range(i, self._n - 1):
            self._buf[j] = self._buf[j + 1]
        self._n -= 1
        return value

    def _resize(self, capacity: int) -> None:  # O(n), and it is why we double
        new_buf = self._make_buffer(capacity)
        for i in range(self._n):
            new_buf[i] = self._buf[i]
        self._buf, self._capacity = new_buf, capacity

    def __iter__(self):
        for i in range(self._n):
            yield self._buf[i]

    def __repr__(self) -> str:
        return f"DynamicArray({list(self)})"


# ============================================================================
# 2. Two pointers from opposite ends
# ============================================================================
def two_sum_sorted(nums: list[int], target: int) -> tuple[int, int] | None:
    """Indices of the pair summing to target, in a SORTED array. O(n) / O(1).

    Sortedness is what makes the decision unambiguous: too small means the only
    way to grow the sum is to move `lo` right.
    """
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        total = nums[lo] + nums[hi]
        if total == target:
            return lo, hi
        if total < target:
            lo += 1
        else:
            hi -= 1
    return None


def is_palindrome(nums: list) -> bool:
    """Mirror the two-pointer walk inward. O(n) / O(1)."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        if nums[lo] != nums[hi]:
            return False
        lo, hi = lo + 1, hi - 1
    return True


# ============================================================================
# 3. Fast / slow pointers (in-place rewrite)
# ============================================================================
def move_zeros(nums: list[int]) -> list[int]:
    """Move every 0 to the end, keeping the order of the rest. O(n) / O(1).

    `slow` is where the next non-zero belongs; `fast` scans for one.
    """
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums


def remove_duplicates_sorted(nums: list[int]) -> int:
    """Dedup a sorted array in place; returns the new logical length. O(n)."""
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1


# ============================================================================
# 4. Kadane - maximum subarray sum
# ============================================================================
def max_subarray(nums: list[int]) -> int:
    """Largest sum of a contiguous subarray. O(n) / O(1).

    At each element the only question is: extend the running subarray, or
    start a new one here? If the running sum is negative it can only hurt.
    """
    if not nums:
        raise ValueError("max_subarray of an empty array is undefined")
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)     # start fresh, or extend
        best = max(best, current)
    return best


# ============================================================================
# 5. Prefix sums
# ============================================================================
class PrefixSum:
    """O(n) build, then every range sum is O(1).

    prefix[i] holds the sum of the first i elements, so prefix[0] == 0 and
    sum(nums[l:r]) == prefix[r] - prefix[l] with no special cases.
    """

    def __init__(self, nums: list[int]) -> None:
        self.prefix = [0] * (len(nums) + 1)
        for i, x in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + x

    def range_sum(self, left: int, right: int) -> int:
        """Sum of nums[left:right] - right is exclusive."""
        return self.prefix[right] - self.prefix[left]


class PrefixSum2D:
    """O(rows * cols) build, then every rectangle sum is O(1).

    prefix[r][c] holds the sum of the whole rectangle from the top-left corner
    to (r, c) exclusive - so row 0 and column 0 stay zero and there are no
    boundary special cases, exactly as in the 1-D version.

    BUILDING (inclusion-exclusion, going in):

        prefix[r+1][c+1] = grid[r][c]
                         + prefix[r][c+1]      # everything above
                         + prefix[r+1][c]      # everything to the left
                         - prefix[r][c]        # the overlap, added twice

    QUERYING (inclusion-exclusion, coming back out):

        +-------+-------+
        |   A   |   B   |     want D
        +-------+-------+
        |   C   |   D   |     D = total - B - C + A
        +-------+-------+

    The `+ A` is the whole trick: the top strip and the left strip both contain
    corner A, so subtracting both removes it twice and it has to be added back.
    Forgetting that term is the standard bug, and it only shows up when the
    query does not touch the top or left edge.

    Use it when many rectangle sums are needed over a FIXED grid. If the grid
    changes, a 2-D Fenwick tree (chapter 19) gives O(log^2 n) updates instead.
    """

    def __init__(self, grid: list[list[int]]) -> None:
        rows = len(grid)
        cols = len(grid[0]) if rows else 0
        # One extra row and column of zeros, so no index can go negative.
        self.prefix = [[0] * (cols + 1) for _ in range(rows + 1)]

        for r in range(rows):
            for c in range(cols):
                self.prefix[r + 1][c + 1] = (
                    grid[r][c]
                    + self.prefix[r][c + 1]     # everything above
                    + self.prefix[r + 1][c]     # everything to the left
                    - self.prefix[r][c]         # overlap counted twice
                )

    def range_sum(self, top: int, left: int, bottom: int, right: int) -> int:
        """Sum of the rectangle [top:bottom] x [left:right] - both exclusive."""
        return (
            self.prefix[bottom][right]
            - self.prefix[top][right]           # strip above
            - self.prefix[bottom][left]         # strip to the left
            + self.prefix[top][left]            # corner removed twice
        )


# ============================================================================
# 6. Sliding window
# ============================================================================
def max_sum_window(nums: list[int], k: int) -> int:
    """Largest sum of any k consecutive elements. O(n) / O(1).

    Slide instead of recomputing: add the entering element, drop the leaving
    one. Recomputing each window would be O(n*k).
    """
    if k <= 0 or k > len(nums):
        raise ValueError("k must be between 1 and len(nums)")
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best


def longest_unique_window(s: str) -> int:
    """Longest substring without repeats - a variable-size window. O(n)."""
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1      # jump past the previous occurrence
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best


# ============================================================================
# 7. In-place rotation and partitioning
# ============================================================================
def rotate(nums: list[int], k: int) -> list[int]:
    """Rotate right by k using three reversals. O(n) time, O(1) space.

    reverse all -> reverse the first k -> reverse the rest.
    """
    n = len(nums)
    if n == 0:
        return nums
    k %= n

    def reverse(lo: int, hi: int) -> None:
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo, hi = lo + 1, hi - 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums


def dutch_flag_sort(nums: list[int]) -> list[int]:
    """Sort an array of 0/1/2 in ONE pass. O(n) time, O(1) space.

    Three regions: [0, low) is 0s, [low, mid) is 1s, (high, end] is 2s.
    """
    low = mid = 0
    high = len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:                              # a 2: swap it to the back
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1                      # do NOT advance mid - value unknown
    return nums


# ============================================================================
# 8. Merging two sorted arrays
# ============================================================================
def merge_sorted(a: list[int], b: list[int]) -> list[int]:
    """The merge step of merge sort. O(n + m) time and space."""
    out: list[int] = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:                   # <= keeps it stable
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])                      # at most one of these is non-empty
    out.extend(b[j:])
    return out


# ============================================================================
# Memory layout: why the same loop has two speeds
# ============================================================================
def sum_row_major(grid: list[list[int]]) -> int:
    """Walk the grid the way it is stored: row by row.

    Memory is a flat line, and a 2-D grid has to be flattened onto it somehow.
    ROW-MAJOR order (C, C++, Python, Java, Go) stores row 0, then row 1, and so
    on. Column-major (Fortran, MATLAB, R, and numpy if you ask for it) does the
    opposite.

    The CPU never fetches one value. It fetches a CACHE LINE - typically 64
    bytes, so 8 or 16 adjacent elements. Walking along a row means every fetch
    delivers the next several iterations for free. One miss, then several hits.
    """
    total = 0
    for row in grid:
        for value in row:
            total += value
    return total


def sum_column_major(grid: list[list[int]]) -> int:
    """Walk ACROSS the storage order: column by column.

    Identical arithmetic, identical result, one line of difference - and it can
    be several times slower on the same data.

    Each step jumps a whole row ahead in memory. If a row is larger than a cache
    line (it usually is), every single access is a fresh miss, and the line
    fetched is thrown away before its other 7-15 values are ever used. The
    memory bandwidth spent is the same; the useful fraction of it is not.

    This is the difference between an algorithm's complexity - both loops are
    O(rows * cols), identically - and its CONSTANT FACTOR. Big-O deliberately
    ignores what the hardware is doing, which is why it is necessary but never
    sufficient.
    """
    total = 0
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    for c in range(cols):
        for r in range(rows):
            total += grid[r][c]
    return total


def aliased_grid(rows: int, cols: int) -> list[list[int]]:
    """The classic broken 2-D initialisation. DO NOT use this.

        [[0] * cols] * rows

    The inner list is built ONCE, and the outer multiply copies the REFERENCE
    to it `rows` times. Every row is the same object, so writing to grid[0][0]
    writes to every row at once.

    It is silent: the shape is right, the values start right, and it only goes
    wrong on the first write. Kept here purely so the demo can prove it.
    """
    return [[0] * cols] * rows                    # every row is the SAME list


def independent_grid(rows: int, cols: int) -> list[list[int]]:
    """The correct version: a comprehension builds a fresh row each time."""
    return [[0] * cols for _ in range(rows)]      # a NEW list per row


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    arr = DynamicArray()
    for x in range(5):
        arr.append(x)
    assert len(arr) == 5 and list(arr) == [0, 1, 2, 3, 4]
    arr.insert(0, 99)
    assert list(arr) == [99, 0, 1, 2, 3, 4]
    assert arr.pop(0) == 99 and arr.pop() == 4
    assert list(arr) == [0, 1, 2, 3]
    arr[0] = 7
    assert arr[0] == 7

    assert two_sum_sorted([1, 3, 5, 8], 11) == (1, 3)
    assert two_sum_sorted([1, 2], 99) is None
    assert is_palindrome([1, 2, 1]) and not is_palindrome([1, 2])

    assert move_zeros([0, 1, 0, 3]) == [1, 3, 0, 0]
    nums = [1, 1, 2, 2, 3]
    assert remove_duplicates_sorted(nums) == 3 and nums[:3] == [1, 2, 3]

    assert max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6   # [4,-1,2,1]
    assert max_subarray([-5, -2, -9]) == -2                     # all negative

    ps = PrefixSum([1, 2, 3, 4])
    assert ps.range_sum(0, 4) == 10 and ps.range_sum(1, 3) == 5
    assert ps.range_sum(2, 2) == 0                              # empty range

    assert max_sum_window([1, 5, 2, 9, 1], 2) == 11
    assert longest_unique_window("abcabcbb") == 3
    assert longest_unique_window("") == 0

    assert rotate([1, 2, 3, 4, 5], 2) == [4, 5, 1, 2, 3]
    assert rotate([1, 2, 3], 3) == [1, 2, 3]                    # full rotation

    assert dutch_flag_sort([2, 0, 2, 1, 1, 0]) == [0, 0, 1, 1, 2, 2]

    assert merge_sorted([1, 4], [2, 3, 5]) == [1, 2, 3, 4, 5]
    assert merge_sorted([], [1]) == [1]

    # --- 2-D prefix sums -----------------------------------------------------
    grid = [
        [3, 0, 1, 4],
        [5, 6, 3, 2],
        [1, 2, 0, 1],
    ]
    grid_sums = PrefixSum2D(grid)
    assert grid_sums.range_sum(0, 0, 3, 4) == 28          # the whole grid
    assert grid_sums.range_sum(1, 1, 3, 3) == 11          # 6+3+2+0
    assert grid_sums.range_sum(0, 0, 1, 1) == 3           # a single cell
    assert grid_sums.range_sum(2, 2, 2, 2) == 0           # an empty rectangle

    # Interior queries are the ones that catch a missing `+ corner` term, so
    # check every rectangle against a brute-force double loop.
    random.seed(3)
    for _ in range(40):
        rows, cols = random.randint(1, 8), random.randint(1, 8)
        cells = [[random.randint(-20, 20) for _ in range(cols)]
                 for _ in range(rows)]
        sums = PrefixSum2D(cells)

        for top in range(rows + 1):
            for bottom in range(top, rows + 1):
                for left in range(cols + 1):
                    for right in range(left, cols + 1):
                        expected = sum(cells[r][c]
                                       for r in range(top, bottom)
                                       for c in range(left, right))
                        assert sums.range_sum(top, left, bottom, right) == expected

    assert PrefixSum2D([]).range_sum(0, 0, 0, 0) == 0     # no rows at all

    # --- Memory layout -------------------------------------------------------
    # The aliasing trap, demonstrated rather than described.
    broken = aliased_grid(3, 3)
    broken[0][0] = 9
    assert broken[1][0] == 9 and broken[2][0] == 9   # all three rows changed
    assert broken[0] is broken[1]                    # because they are one list

    fine = independent_grid(3, 3)
    fine[0][0] = 9
    assert fine[1][0] == 0 and fine[2][0] == 0       # only the one cell moved
    assert fine[0] is not fine[1]

    # Row-major vs column-major: same complexity, same answer, different speed.
    size = 1200
    layout_grid = [[r + c for c in range(size)] for r in range(size)]

    def time_best_of(fn, repeats: int = 3) -> float:
        """Minimum, not mean: timing noise only ever makes a run SLOWER."""
        best = float("inf")
        for _ in range(repeats):
            start = time.perf_counter()
            fn()
            best = min(best, time.perf_counter() - start)
        return best

    row_time = time_best_of(lambda: sum_row_major(layout_grid))
    column_time = time_best_of(lambda: sum_column_major(layout_grid))

    # The part that is a FACT: both orders compute the same sum.
    expected_sum = sum(r + c for r in range(size) for c in range(size))
    assert sum_row_major(layout_grid) == expected_sum
    assert sum_column_major(layout_grid) == expected_sum

    # The part that is a MEASUREMENT: row-major is normally 1.5-3x faster here.
    # The assertion is deliberately loose - a busy machine can distort any
    # timing - but the printed ratio below shows the real effect.
    assert row_time < column_time * 1.5, "row-major should not be slower"

    print(f"  row-major    {row_time * 1000:7.1f} ms")
    print(f"  column-major {column_time * 1000:7.1f} ms"
          f"   <- {column_time / row_time:.1f}x slower, same O(n^2)")

    print("03-Arrays (Python): all checks passed")
    print("  2-D prefix sums checked against brute force on every rectangle")


if __name__ == "__main__":
    demo()
