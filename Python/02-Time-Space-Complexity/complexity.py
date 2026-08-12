"""
02 - Time and Space Complexity: measured, not memorised.

Each function returns (answer, operations). Counting operations instead of
timing makes the growth curves exact and reproducible on any machine.

Run:  python complexity.py
"""

from __future__ import annotations

import math
import random
import time
from typing import Callable


# ------------------------------------------------------------------- O(1) ---
def constant_first(nums: list[int]) -> tuple[int, int]:
    """Indexing does not care how big the list is."""
    return nums[0], 1


# ---------------------------------------------------------------- O(log n) --
def binary_search(sorted_nums: list[int], target: int) -> tuple[int, int]:
    """Each step halves the search space -> about log2(n) steps."""
    lo, hi, ops = 0, len(sorted_nums) - 1, 0
    while lo <= hi:
        ops += 1
        mid = (lo + hi) // 2
        if sorted_nums[mid] == target:
            return mid, ops
        if sorted_nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, ops


# ------------------------------------------------------------------- O(n) ---
def linear_sum(nums: list[int]) -> tuple[int, int]:
    """One pass: cost grows in lockstep with the input."""
    total, ops = 0, 0
    for x in nums:
        total += x
        ops += 1
    return total, ops


# ----------------------------------------------------------------- O(n^2) ---
def has_duplicate_quadratic(nums: list[int]) -> tuple[bool, int]:
    """Compare every pair. Correct, and unusable past a few thousand items."""
    ops = 0
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            ops += 1
            if nums[i] == nums[j]:
                return True, ops
    return False, ops


def has_duplicate_linear(nums: list[int]) -> tuple[bool, int]:
    """Same answer with a set: O(n) time, O(n) space.

    This is the core trade in algorithms - spend memory to buy time.
    """
    seen: set[int] = set()
    ops = 0
    for x in nums:
        ops += 1
        if x in seen:          # O(1) average, unlike `x in list`
            return True, ops
        seen.add(x)
    return False, ops


# ------------------------------------------------------------- O(n log n) ---
def sort_then_scan(nums: list[int]) -> tuple[int, int]:
    """Sorting dominates: O(n log n) beats the O(n) scan that follows it."""
    ordered = sorted(nums)
    n = len(ordered)
    approx_sort_ops = max(1, int(n * (n.bit_length())))   # ~ n log n
    best = 0
    for i in range(1, n):
        best = max(best, ordered[i] - ordered[i - 1])
    return best, approx_sort_ops + n


# ------------------------------------------------------------- O(2^n) -> O(n)
def fib_exponential(n: int, counter: list[int] | None = None) -> tuple[int, int]:
    """Naive recursion recomputes the same subproblems over and over.

    The recursion tree branches twice per call with depth n -> O(2^n).
    """
    if counter is None:
        counter = [0]
    counter[0] += 1
    if n < 2:
        return n, counter[0]
    a, _ = fib_exponential(n - 1, counter)
    b, _ = fib_exponential(n - 2, counter)
    return a + b, counter[0]


def fib_linear(n: int) -> tuple[int, int]:
    """Bottom-up: each of the n states is computed exactly once.

    O(n) time, O(1) space - we only ever keep the last two values.
    """
    ops = 0
    prev, curr = 0, 1
    if n < 2:
        return n, 1
    for _ in range(n - 1):
        ops += 1
        prev, curr = curr, prev + curr
    return curr, ops


# ------------------------------------------------------- amortised O(1) -----
def amortised_append(n: int) -> tuple[int, int]:
    """n appends cost O(n) in total even though some individual ones resize.

    Capacity grows geometrically, so the expensive copies are rare.
    """
    out: list[int] = []
    for i in range(n):
        out.append(i)
    return len(out), n


# ------------------------------------------------------------ space usage ---
def sum_recursive(nums: list[int], i: int = 0) -> int:
    """O(n) TIME and O(n) SPACE - every pending frame sits on the call stack."""
    if i == len(nums):
        return 0
    return nums[i] + sum_recursive(nums, i + 1)


def sum_iterative(nums: list[int]) -> int:
    """Same O(n) time, but O(1) space. Prefer this when depth can be large."""
    total = 0
    for x in nums:
        total += x
    return total


# ------------------------------------------------------------ measurement ---
def growth_table() -> None:
    """Show how each class actually grows as n doubles."""
    print(f"{'n':>7} | {'O(n) ops':>9} | {'O(n^2) ops':>11} | {'O(log n) ops':>12}")
    print("-" * 50)
    for n in (100, 200, 400, 800):
        nums = list(range(n))                      # all distinct: worst case
        _, lin = linear_sum(nums)
        _, quad = has_duplicate_quadratic(nums)
        _, log = binary_search(nums, n - 1)
        print(f"{n:>7} | {lin:>9} | {quad:>11} | {log:>12}")


def wall_clock_demo() -> None:
    """Constants matter too: same O(n), very different real speed."""
    nums = list(range(200_000))

    t0 = time.perf_counter()
    total_py = 0
    for x in nums:                 # interpreted loop
        total_py += x
    t1 = time.perf_counter()
    total_c = sum(nums)            # the same loop, running in C
    t2 = time.perf_counter()

    assert total_py == total_c
    print(f"\npython loop: {(t1 - t0) * 1000:6.1f} ms")
    print(f"builtin sum: {(t2 - t1) * 1000:6.1f} ms  <- same O(n), smaller constant")


# ============================================================================
# Empirical analysis - does the theory actually hold?
# ============================================================================
def merge_sort_counted(nums: list[int]) -> tuple[list[int], int]:
    """Merge sort that reports its comparison count. O(n log n).

    The count is what makes this checkable. Wall-clock time depends on the
    machine, the interpreter and whatever else is running; a COMPARISON COUNT
    is deterministic, so the theory can be asserted rather than eyeballed.
    """
    if len(nums) <= 1:
        return nums[:], 0

    mid = len(nums) // 2
    left, left_ops = merge_sort_counted(nums[:mid])
    right, right_ops = merge_sort_counted(nums[mid:])

    merged: list[int] = []
    comparisons = 0
    i = j = 0
    while i < len(left) and j < len(right):
        comparisons += 1
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])

    return merged, comparisons + left_ops + right_ops


def insertion_sort_counted(nums: list[int]) -> tuple[list[int], int]:
    """Insertion sort that reports its comparison count.

    O(n^2) on reversed input, but O(n) on already-sorted input - the adaptive
    best case that makes it the base case inside Timsort.
    """
    out = nums[:]
    comparisons = 0
    for i in range(1, len(out)):
        value = out[i]
        j = i - 1
        while j >= 0:
            comparisons += 1
            if out[j] <= value:
                break
            out[j + 1] = out[j]
            j -= 1
        out[j + 1] = value
    return out, comparisons


def measure(fn: Callable[[], object], repeats: int = 3) -> float:
    """Best-of-N wall-clock seconds.

    MINIMUM, not mean. Timing noise is one-sided - a scheduler interrupt or a
    GC pause can only make a run slower, never faster - so the minimum is the
    closest estimate of the true cost. Averaging just folds in the noise.
    """
    best = float("inf")
    for _ in range(repeats):
        start = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - start)
    return best


def growth_ratios(counts: list[int]) -> list[float]:
    """Ratio between consecutive measurements. The shape of the curve.

    Doubling n and watching the ratio is how you identify a complexity class
    from data alone:

        O(1)        ratio -> 1
        O(log n)    ratio -> 1 (grows by a constant, not a factor)
        O(n)        ratio -> 2
        O(n log n)  ratio -> slightly above 2, creeping up
        O(n^2)      ratio -> 4
        O(2^n)      ratio -> 2^(n) - explodes

    This is the empirical counterpart to reading the exponent off the formula.
    """
    return [counts[i + 1] / counts[i] for i in range(len(counts) - 1)]


def benchmark_table() -> None:
    """Measure the three classes side by side, and print the growth."""
    sizes = [250, 500, 1000, 2000]
    rows: list[tuple[int, int, int, float, float]] = []

    for n in sizes:
        reversed_input = list(range(n, 0, -1))         # worst case for both
        _, merge_ops = merge_sort_counted(reversed_input)
        _, insertion_ops = insertion_sort_counted(reversed_input)
        merge_time = measure(lambda: merge_sort_counted(reversed_input))
        insertion_time = measure(lambda: insertion_sort_counted(reversed_input))
        rows.append((n, merge_ops, insertion_ops, merge_time, insertion_time))

    print(f"\n{'n':>6} | {'merge ops':>10} | {'insert ops':>11} "
          f"| {'merge ms':>9} | {'insert ms':>10}")
    print("-" * 60)
    for n, merge_ops, insertion_ops, merge_time, insertion_time in rows:
        print(f"{n:>6} | {merge_ops:>10} | {insertion_ops:>11} "
              f"| {merge_time * 1000:>9.2f} | {insertion_time * 1000:>10.2f}")

    merge_growth = growth_ratios([r[1] for r in rows])
    insertion_growth = growth_ratios([r[2] for r in rows])
    print(f"\n  merge ops     grow x{[f'{r:.2f}' for r in merge_growth]}  "
          f"-> just over 2: O(n log n)")
    print(f"  insertion ops grow x{[f'{r:.2f}' for r in insertion_growth]}  "
          f"-> 4: O(n^2)")


# ----------------------------------------------------------------------- demo
def demo() -> None:
    assert constant_first([9, 8, 7]) == (9, 1)

    # log2(1024) = 10, so a 1024-element search never exceeds 11 steps.
    idx, ops = binary_search(list(range(1024)), 999)
    assert idx == 999 and ops <= 11

    assert linear_sum([1, 2, 3]) == (6, 3)

    # Quadratic vs linear: same answer, wildly different work.
    nums = list(range(200))
    dup_q, ops_q = has_duplicate_quadratic(nums)
    dup_l, ops_l = has_duplicate_linear(nums)
    assert dup_q is False and dup_l is False
    assert ops_q == 200 * 199 // 2          # every pair compared
    assert ops_l == 200                     # one pass
    assert ops_q > 90 * ops_l               # the gap is the whole lesson

    # Doubling n roughly quadruples the work of an O(n^2) algorithm.
    _, ops_100 = has_duplicate_quadratic(list(range(100)))
    _, ops_200 = has_duplicate_quadratic(list(range(200)))
    assert 3.8 < ops_200 / ops_100 < 4.2

    best, _ = sort_then_scan([1, 9, 3])
    assert best == 6

    f_exp, calls = fib_exponential(20)
    f_lin, steps = fib_linear(20)
    assert f_exp == f_lin == 6765
    assert calls == 21891                   # = 2*fib(21) - 1, exponential blow-up
    assert steps == 19                      # linear, and it is not close

    assert amortised_append(1000) == (1000, 1000)

    assert sum_recursive([1, 2, 3]) == sum_iterative([1, 2, 3]) == 6

    # --- Empirical analysis --------------------------------------------------
    # Sorting is correct in both cases - the point is what it COSTS.
    random.seed(2)
    for _ in range(30):
        data = [random.randint(-50, 50) for _ in range(random.randint(0, 40))]
        expected = sorted(data)
        assert merge_sort_counted(data)[0] == expected
        assert insertion_sort_counted(data)[0] == expected

    # The counts are deterministic, so the theory is ASSERTABLE - unlike the
    # wall-clock numbers printed below, which depend on the machine.
    sizes = [250, 500, 1000, 2000]
    merge_counts = [merge_sort_counted(list(range(n, 0, -1)))[1] for n in sizes]
    insertion_counts = [insertion_sort_counted(list(range(n, 0, -1)))[1]
                        for n in sizes]

    # Insertion sort on reversed input is exactly the worst case: every one of
    # the i previous elements is compared, so the total is n(n-1)/2 precisely.
    for n, count in zip(sizes, insertion_counts):
        assert count == n * (n - 1) // 2

    # Merge sort's comparison count is bounded by n*ceil(log2 n) and at least
    # half that - the tight window that says "n log n" and nothing else.
    for n, count in zip(sizes, merge_counts):
        upper = n * math.ceil(math.log2(n))
        assert n * math.log2(n) / 2 <= count <= upper

    # The growth ratios ARE the complexity class, read off the data.
    for ratio in growth_ratios(insertion_counts):
        assert 3.9 < ratio < 4.1                 # quadratic: 4x per doubling
    for ratio in growth_ratios(merge_counts):
        assert 2.0 < ratio < 2.5                 # n log n: just over 2x

    # Quadratic must eventually lose, and by a widening margin. This compares
    # OPERATION COUNTS, so it is a fact about the algorithms, not the hardware.
    assert insertion_counts[0] / merge_counts[0] < insertion_counts[-1] / merge_counts[-1]
    assert insertion_counts[-1] > 100 * merge_counts[-1]

    # Insertion sort's ADAPTIVE best case: already-sorted input is O(n), which
    # is exactly why Timsort uses it on short runs.
    _, sorted_ops = insertion_sort_counted(list(range(2000)))
    assert sorted_ops == 1999                     # one comparison per element

    print("02-Time-Space-Complexity (Python): all checks passed\n")


if __name__ == "__main__":
    demo()
    growth_table()
    wall_clock_demo()
    benchmark_table()
