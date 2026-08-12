"""
02 - Time and Space Complexity: measured, not memorised.

Each function returns (answer, operations). Counting operations instead of
timing makes the growth curves exact and reproducible on any machine.

Run:  python complexity.py
"""

from __future__ import annotations

import time


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

    print("02-Time-Space-Complexity (Python): all checks passed\n")


if __name__ == "__main__":
    demo()
    growth_table()
    wall_clock_demo()
