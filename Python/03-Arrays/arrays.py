"""
03 - Arrays: a dynamic array built from scratch, plus the five patterns that
solve most array problems.

Run:  python arrays.py
"""

from __future__ import annotations

import ctypes


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

    print("03-Arrays (Python): all checks passed")


if __name__ == "__main__":
    demo()
