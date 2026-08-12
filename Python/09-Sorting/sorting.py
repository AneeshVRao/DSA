"""
09 - Sorting: every classic algorithm from scratch, each verified against
Python's own sorted() on randomised input.

Run:  python sorting.py
"""

from __future__ import annotations

import random


# ============================================================================
# 1. Quadratic sorts
# ============================================================================
def bubble_sort(nums: list[int]) -> list[int]:
    """Repeatedly swap adjacent out-of-order pairs. O(n^2), O(1) space, stable.

    The `swapped` flag makes it adaptive: an already-sorted array costs one
    O(n) pass. After pass i, the last i elements are final.
    """
    a = nums[:]
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):        # the tail is already in place
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                   # nothing moved: it is sorted
            break
    return a


def selection_sort(nums: list[int]) -> list[int]:
    """Select the minimum of the unsorted tail and swap it into place.

    O(n^2) comparisons always, but only n-1 swaps - the fewest of any sort,
    which matters when writes are expensive (flash memory).

    NOT stable: the long-distance swap can jump an equal element over another.
    """
    a = nums[:]
    for i in range(len(a) - 1):
        smallest = i
        for j in range(i + 1, len(a)):
            if a[j] < a[smallest]:
                smallest = j
        a[i], a[smallest] = a[smallest], a[i]
    return a


def insertion_sort(nums: list[int]) -> list[int]:
    """Insert each element into the sorted prefix. O(n^2), O(n) best, stable.

    This is what every real sort switches to for small subarrays - its
    constant factor is tiny and it is adaptive.
    """
    a = nums[:]
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:      # strict >: equal elements stay put
            a[j + 1] = a[j]               # shift right
            j -= 1
        a[j + 1] = key
    return a


# ============================================================================
# 2. Merge sort
# ============================================================================
def merge_sort(nums: list[int]) -> list[int]:
    """Divide, sort each half, merge. O(n log n) always, O(n) space, stable.

    The recurrence is T(n) = 2T(n/2) + O(n): log n levels, O(n) work per level.
    """
    if len(nums) <= 1:
        return nums[:]
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    return _merge(left, right)


def _merge(left: list[int], right: list[int]) -> list[int]:
    """Merge two sorted lists. O(n + m). `<=` is what makes it stable."""
    out: list[int] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:           # <= keeps equal elements in order
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out


# ============================================================================
# 3. Quicksort
# ============================================================================
def quick_sort(nums: list[int]) -> list[int]:
    """Partition around a pivot, recurse on both sides. O(n log n) average.

    A RANDOM pivot is what avoids the O(n^2) worst case on sorted input -
    with a fixed pivot, sorted data degenerates to one element per partition.
    """
    a = nums[:]
    _quick_sort_range(a, 0, len(a) - 1)
    return a


def _quick_sort_range(a: list[int], lo: int, hi: int) -> None:
    while lo < hi:
        pivot_index = _partition(a, lo, hi)
        # Recurse into the SMALLER side and loop on the larger one: that caps
        # stack depth at O(log n) even when partitions are unbalanced.
        if pivot_index - lo < hi - pivot_index:
            _quick_sort_range(a, lo, pivot_index - 1)
            lo = pivot_index + 1
        else:
            _quick_sort_range(a, pivot_index + 1, hi)
            hi = pivot_index - 1


def _partition(a: list[int], lo: int, hi: int) -> int:
    """Lomuto partition with a random pivot. Returns the pivot's final index."""
    rand = random.randint(lo, hi)
    a[rand], a[hi] = a[hi], a[rand]       # move the pivot out of the way
    pivot = a[hi]

    smaller = lo                          # boundary of the "< pivot" region
    for i in range(lo, hi):
        if a[i] < pivot:
            a[smaller], a[i] = a[i], a[smaller]
            smaller += 1
    a[smaller], a[hi] = a[hi], a[smaller]  # put the pivot at the boundary
    return smaller


def quick_sort_3way(nums: list[int]) -> list[int]:
    """Three-way partition: handles many duplicate keys in O(n) per level.

    Splits into < pivot, == pivot, > pivot, so an array of all-equal values
    sorts in a single pass instead of degenerating.
    """
    if len(nums) <= 1:
        return nums[:]
    pivot = random.choice(nums)
    less = [x for x in nums if x < pivot]
    equal = [x for x in nums if x == pivot]
    greater = [x for x in nums if x > pivot]
    return quick_sort_3way(less) + equal + quick_sort_3way(greater)


# ============================================================================
# 4. Heap sort
# ============================================================================
def heap_sort(nums: list[int]) -> list[int]:
    """Build a max-heap, then repeatedly swap the root to the end.

    O(n log n) worst case AND O(1) space - the only classic sort with both.
    Not stable, and slower than quicksort in practice (poor cache locality).
    """
    a = nums[:]
    n = len(a)

    for i in range(n // 2 - 1, -1, -1):   # heapify bottom-up: O(n), not O(n log n)
        _sift_down(a, i, n)

    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]       # largest goes to its final position
        _sift_down(a, 0, end)             # restore the heap on the prefix
    return a


def _sift_down(a: list[int], root: int, size: int) -> None:
    """Push a[root] down until the max-heap property holds. O(log n)."""
    while True:
        largest = root
        left, right = 2 * root + 1, 2 * root + 2
        if left < size and a[left] > a[largest]:
            largest = left
        if right < size and a[right] > a[largest]:
            largest = right
        if largest == root:
            return
        a[root], a[largest] = a[largest], a[root]
        root = largest


# ============================================================================
# 5. Non-comparison sorts
# ============================================================================
def counting_sort(nums: list[int]) -> list[int]:
    """O(n + k) for non-negative integers with a small range k.

    Beats the O(n log n) comparison lower bound because it never compares two
    elements - it uses the values themselves as indices.

    The prefix-sum step is what makes it stable, and stability is what lets
    radix sort use it as a subroutine.
    """
    if not nums:
        return []
    if min(nums) < 0:
        raise ValueError("counting sort needs non-negative integers")

    k = max(nums)
    counts = [0] * (k + 1)
    for x in nums:
        counts[x] += 1
    for i in range(1, k + 1):             # prefix sums -> final positions
        counts[i] += counts[i - 1]

    out = [0] * len(nums)
    for x in reversed(nums):              # reversed keeps it stable
        counts[x] -= 1
        out[counts[x]] = x
    return out


def radix_sort(nums: list[int]) -> list[int]:
    """LSD radix sort: counting-sort by each digit, least significant first.

    O(d * (n + 10)) where d is the number of digits. Correct only because the
    per-digit sort is STABLE - earlier digits' order survives later passes.
    """
    if not nums:
        return []
    if min(nums) < 0:
        raise ValueError("this radix sort handles non-negative integers only")

    a = nums[:]
    exp = 1
    largest = max(a)
    while largest // exp > 0:
        buckets: list[list[int]] = [[] for _ in range(10)]
        for x in a:
            buckets[(x // exp) % 10].append(x)
        a = [x for bucket in buckets for x in bucket]   # concatenate in order
        exp *= 10
    return a


# ============================================================================
# 6. Quickselect - sorting's useful cousin
# ============================================================================
def quickselect(nums: list[int], k: int) -> int:
    """The kth smallest element (k is 1-based). O(n) average, O(n^2) worst.

    Only recurse into the side that contains k - that is what turns
    O(n log n) into O(n): n + n/2 + n/4 + ... = 2n.
    """
    if not 1 <= k <= len(nums):
        raise ValueError("k out of range")
    a = nums[:]
    lo, hi, target = 0, len(a) - 1, k - 1
    while True:
        if lo == hi:
            return a[lo]
        p = _partition(a, lo, hi)
        if p == target:
            return a[p]
        if p < target:
            lo = p + 1
        else:
            hi = p - 1


# ============================================================================
# 7. Stability demonstration
# ============================================================================
def stable_sort_pairs(pairs: list[tuple[str, int]]) -> list[tuple[str, int]]:
    """Sort (name, score) by score only, using a stable merge sort.

    Equal scores must keep their input order - that is the whole point.
    """
    if len(pairs) <= 1:
        return pairs[:]
    mid = len(pairs) // 2
    left = stable_sort_pairs(pairs[:mid])
    right = stable_sort_pairs(pairs[mid:])

    out: list[tuple[str, int]] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i][1] <= right[j][1]:     # <= : left (earlier) wins ties
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    algorithms = {
        "bubble": bubble_sort,
        "selection": selection_sort,
        "insertion": insertion_sort,
        "merge": merge_sort,
        "quick": quick_sort,
        "quick3way": quick_sort_3way,
        "heap": heap_sort,
        "counting": counting_sort,
        "radix": radix_sort,
    }

    # Hand-picked edge cases every sort must survive.
    edge_cases = [
        [],
        [1],
        [2, 1],
        [1, 1, 1, 1],                       # all equal
        [5, 4, 3, 2, 1],                    # reverse sorted (quicksort's trap)
        [1, 2, 3, 4, 5],                    # already sorted
        [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],  # duplicates
        [0, 0, 10, 7, 0],                   # zeros
    ]
    for name, fn in algorithms.items():
        for case in edge_cases:
            assert fn(case) == sorted(case), f"{name} failed on {case}"
            assert case == case, "input must not be mutated"

    # 200 randomised arrays against the reference implementation.
    random.seed(42)
    for _ in range(200):
        data = [random.randint(0, 500) for _ in range(random.randint(0, 60))]
        expected = sorted(data)
        for name, fn in algorithms.items():
            assert fn(data) == expected, f"{name} disagreed with sorted()"

    # Negative numbers: comparison sorts handle them, counting/radix must not.
    negatives = [3, -1, 4, -1, 5]
    for name in ("bubble", "selection", "insertion", "merge", "quick", "heap"):
        assert algorithms[name](negatives) == sorted(negatives)
    for name in ("counting", "radix"):
        try:
            algorithms[name](negatives)
            raise AssertionError(f"{name} should reject negatives")
        except ValueError:
            pass

    # Stability: equal scores keep their input order.
    pairs = [("amy", 2), ("bob", 1), ("cat", 2), ("dan", 1)]
    assert stable_sort_pairs(pairs) == [("bob", 1), ("dan", 1), ("amy", 2), ("cat", 2)]
    # Python's own sort is stable too, so it must agree.
    assert stable_sort_pairs(pairs) == sorted(pairs, key=lambda p: p[1])

    # Quickselect against the sorted reference.
    data = [7, 10, 4, 3, 20, 15]
    for k in range(1, len(data) + 1):
        assert quickselect(data, k) == sorted(data)[k - 1]

    print("09-Sorting (Python): all checks passed")
    print(f"  {len(algorithms)} algorithms x {len(edge_cases)} edge cases "
          f"+ 200 random arrays verified against sorted()")


if __name__ == "__main__":
    demo()
