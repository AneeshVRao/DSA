"""
16 - Greedy: the classic greedy algorithms, the sort key that makes each one
work, and a runnable demonstration of where greedy breaks.

Run:  python greedy.py
"""

from __future__ import annotations

import heapq
from typing import Optional


# ============================================================================
# 1. Sort by END time - activity selection
# ============================================================================
def activity_selection(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """Maximum number of non-overlapping activities. O(n log n).

    Sort by END time. Finishing as early as possible leaves the most room for
    everything after it - that is the greedy choice property, and the exchange
    argument proves it: swapping any later-ending choice for the earliest-ending
    one never loses an activity.

    Sorting by START time or by duration both fail; try it.
    """
    if not intervals:
        return []
    chosen: list[tuple[int, int]] = []
    last_end = float("-inf")
    for start, end in sorted(intervals, key=lambda x: x[1]):
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen


def erase_overlap_intervals(intervals: list[tuple[int, int]]) -> int:
    """Fewest removals to make the rest non-overlapping. O(n log n).

    The complement of activity selection: keep as many as possible, remove
    the rest.
    """
    if not intervals:
        return 0
    return len(intervals) - len(activity_selection(intervals))


# ============================================================================
# 2. Sort by START time - merging
# ============================================================================
def merge_intervals(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """Merge all overlapping intervals. O(n log n).

    Sorting by START is what makes overlapping intervals adjacent, so a single
    sweep suffices.
    """
    if not intervals:
        return []
    ordered = sorted(intervals)
    merged = [ordered[0]]
    for start, end in ordered[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:                       # overlap: extend
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged


def min_platforms(arrivals: list[int], departures: list[int]) -> int:
    """Minimum platforms so no train waits. O(n log n).

    Sort arrivals and departures INDEPENDENTLY: we do not care which train is
    which, only how many are present at once. Sweep both, adding a platform on
    an arrival and freeing one on a departure.
    """
    if not arrivals:
        return 0
    arrivals = sorted(arrivals)
    departures = sorted(departures)

    platforms = best = 0
    i = j = 0
    while i < len(arrivals):
        if arrivals[i] <= departures[j]:            # a train arrives first
            platforms += 1
            best = max(best, platforms)
            i += 1
        else:                                       # one leaves first
            platforms -= 1
            j += 1
    return best


# ============================================================================
# 3. Sort by RATIO - fractional knapsack
# ============================================================================
def fractional_knapsack(weights: list[int], values: list[int],
                        capacity: float) -> float:
    """Maximum value when items can be split. O(n log n).

    Greedy works HERE but not for 0/1 knapsack. The difference: fractions let
    you fill the capacity exactly, so taking the best value-per-weight first
    can never be beaten. Without fractions, a high-ratio item can waste space
    and greedy breaks - which is why chapter 15 needs a DP table.
    """
    items = sorted(zip(weights, values), key=lambda item: item[1] / item[0],
                   reverse=True)
    total = 0.0
    for weight, value in items:
        if capacity <= 0:
            break
        take = min(weight, capacity)                # whole item, or a slice
        total += value * (take / weight)
        capacity -= take
    return total


# ============================================================================
# 4. Running frontier - one pass, no sorting
# ============================================================================
def can_jump(nums: list[int]) -> bool:
    """Can you reach the last index? O(n) time, O(1) space.

    Track only the furthest index reachable so far. If the loop ever stands
    beyond that frontier, the gap is unbridgeable.
    """
    furthest = 0
    for i, jump in enumerate(nums):
        if i > furthest:
            return False                            # stranded
        furthest = max(furthest, i + jump)
    return True


def min_jumps(nums: list[int]) -> int:
    """Fewest jumps to the last index. O(n) time, O(1) space.

    A BFS over the array without a queue: `current_end` marks the end of the
    current "level", and reaching it means one more jump was needed.
    """
    if len(nums) <= 1:
        return 0
    jumps = 0
    current_end = furthest = 0
    for i in range(len(nums) - 1):
        furthest = max(furthest, i + nums[i])
        if i == current_end:                        # level exhausted
            jumps += 1
            current_end = furthest
            if current_end >= len(nums) - 1:
                break
    return jumps


def gas_station(gas: list[int], cost: list[int]) -> int:
    """Starting station for a full circuit, or -1. O(n) time, O(1) space.

    Two facts make one pass enough:
      1. If total gas < total cost, no answer exists.
      2. If the tank goes negative at station i, no station between the
         current start and i can work either - so restart at i + 1.
    """
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1                           # everything before i fails
            tank = 0
    return start


# ============================================================================
# 5. Always take the extreme - Huffman coding
# ============================================================================
def huffman_codes(frequencies: dict[str, int]) -> dict[str, str]:
    """Optimal prefix-free codes. O(n log n) with a heap.

    Repeatedly merge the two LEAST frequent nodes: rare symbols end up deepest
    in the tree and therefore get the longest codes. The greedy choice is
    provably optimal (Huffman 1952).

    The counter in the heap tuple breaks ties deterministically - without it,
    Python would try to compare the node payloads.
    """
    if not frequencies:
        return {}
    if len(frequencies) == 1:                       # one symbol still needs a bit
        return {next(iter(frequencies)): "0"}

    counter = 0
    # (weight, tie-breaker, tree) where tree is a symbol or a (left, right) pair
    heap: list[tuple[int, int, object]] = []
    for symbol, weight in sorted(frequencies.items()):
        heapq.heappush(heap, (weight, counter, symbol))
        counter += 1

    while len(heap) > 1:
        weight_a, _, left = heapq.heappop(heap)
        weight_b, _, right = heapq.heappop(heap)
        heapq.heappush(heap, (weight_a + weight_b, counter, (left, right)))
        counter += 1

    codes: dict[str, str] = {}

    def assign(node: object, prefix: str) -> None:
        if isinstance(node, tuple):
            assign(node[0], prefix + "0")
            assign(node[1], prefix + "1")
        else:
            codes[str(node)] = prefix

    assign(heap[0][2], "")
    return codes


def connect_sticks(lengths: list[int]) -> int:
    """Minimum total cost to merge all sticks. O(n log n).

    Always merge the two cheapest: every merge cost is paid again by every
    later merge containing it, so the smallest values must be merged earliest.
    """
    if len(lengths) <= 1:
        return 0
    heap = list(lengths)
    heapq.heapify(heap)
    total = 0
    while len(heap) > 1:
        cost = heapq.heappop(heap) + heapq.heappop(heap)
        total += cost
        heapq.heappush(heap, cost)
    return total


# ============================================================================
# 6. Where greedy BREAKS
# ============================================================================
def coin_change_greedy(coins: list[int], amount: int) -> Optional[int]:
    """Take the largest coin that fits, repeatedly. O(n log n).

    Correct for canonical systems like [1, 5, 10, 25]. WRONG in general - the
    demo below proves it with [1, 3, 4] and target 6.
    """
    remaining = amount
    used = 0
    for coin in sorted(coins, reverse=True):
        take = remaining // coin
        used += take
        remaining -= take * coin
    return used if remaining == 0 else None


def coin_change_dp(coins: list[int], amount: int) -> Optional[int]:
    """The correct answer for any coin system. O(len(coins) * amount)."""
    INF = float("inf")
    dp = [0] + [INF] * amount
    for coin in coins:
        for value in range(coin, amount + 1):
            dp[value] = min(dp[value], dp[value - coin] + 1)
    return None if dp[amount] == INF else int(dp[amount])


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    activities = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11)]
    chosen = activity_selection(activities)
    assert chosen == [(1, 4), (5, 7), (8, 11)]
    # The chosen set really is non-overlapping.
    assert all(chosen[i][1] <= chosen[i + 1][0] for i in range(len(chosen) - 1))
    assert activity_selection([]) == []

    # Sorting by START instead of END gives a worse answer - the sort key IS
    # the algorithm. Earliest-start would take (0,6) and block (1,4) and (5,7).
    by_start = sorted(activities)
    naive: list[tuple[int, int]] = []
    last_end = float("-inf")
    for start, end in by_start:
        if start >= last_end:
            naive.append((start, end))
            last_end = end
    assert len(naive) < len(chosen)

    assert erase_overlap_intervals([(1, 2), (2, 3), (3, 4), (1, 3)]) == 1
    assert erase_overlap_intervals([(1, 2), (1, 2), (1, 2)]) == 2
    assert erase_overlap_intervals([]) == 0

    assert merge_intervals([(1, 3), (2, 6), (8, 10), (15, 18)]) == [
        (1, 6), (8, 10), (15, 18)
    ]
    assert merge_intervals([(1, 4), (4, 5)]) == [(1, 5)]      # touching merges
    assert merge_intervals([]) == []

    assert min_platforms([900, 940, 950, 1100, 1500, 1800],
                         [910, 1200, 1120, 1130, 1900, 2000]) == 3
    assert min_platforms([100], [200]) == 1
    assert min_platforms([], []) == 0

    total = fractional_knapsack([10, 20, 30], [60, 100, 120], 50)
    assert abs(total - 240.0) < 1e-9         # all of 10 and 20, two thirds of 30
    assert fractional_knapsack([10], [60], 5) == 30.0          # half an item

    assert can_jump([2, 3, 1, 1, 4])
    assert not can_jump([3, 2, 1, 0, 4])     # the 0 at index 3 strands you
    assert can_jump([0])                     # already at the end

    assert min_jumps([2, 3, 1, 1, 4]) == 2   # 0 -> 1 -> 4
    assert min_jumps([2, 3, 0, 1, 4]) == 2
    assert min_jumps([0]) == 0

    assert gas_station([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]) == 3
    assert gas_station([2, 3, 4], [3, 4, 3]) == -1             # not enough gas
    assert gas_station([5], [4]) == 0

    codes = huffman_codes({"a": 45, "b": 13, "c": 12, "d": 16, "e": 9, "f": 5})
    assert len(codes) == 6
    # Prefix-free: no code is a prefix of another - that is what makes it
    # decodable without separators.
    for x in codes.values():
        for y in codes.values():
            assert x == y or not y.startswith(x)
    # The most frequent symbol gets the shortest code.
    assert len(codes["a"]) <= min(len(c) for c in codes.values())
    assert len(codes["a"]) < len(codes["f"])
    assert huffman_codes({"z": 1}) == {"z": "0"}
    assert huffman_codes({}) == {}

    assert connect_sticks([2, 4, 3]) == 14           # (2+3)=5, (5+4)=9 -> 14
    assert connect_sticks([1, 8, 3, 5]) == 30
    assert connect_sticks([5]) == 0

    # Greedy is optimal on a canonical coin system ...
    assert coin_change_greedy([1, 5, 10, 25], 63) == 6        # 25,25,10,1,1,1
    assert coin_change_dp([1, 5, 10, 25], 63) == 6
    # ... and WRONG on this one. This is the whole reason DP exists.
    assert coin_change_greedy([1, 3, 4], 6) == 3              # 4 + 1 + 1
    assert coin_change_dp([1, 3, 4], 6) == 2                  # 3 + 3
    greedy_coins = coin_change_greedy([1, 3, 4], 6)
    dp_coins = coin_change_dp([1, 3, 4], 6)
    assert greedy_coins is not None and dp_coins is not None
    assert greedy_coins > dp_coins            # greedy is strictly worse here
    assert coin_change_greedy([5], 3) is None
    assert coin_change_dp([5], 3) is None

    print("16-Greedy (Python): all checks passed")


if __name__ == "__main__":
    demo()
