"""
15 - Dynamic Programming: every classic family, in both memoised and tabulated
form, with the space optimisations spelled out.

Run:  python dp.py
"""

from __future__ import annotations

import bisect
from functools import lru_cache


# ============================================================================
# 1. The same problem three ways
# ============================================================================
def fib_naive(n: int) -> int:
    """O(2^n): the same subproblems are recomputed exponentially often."""
    return n if n < 2 else fib_naive(n - 1) + fib_naive(n - 2)


@lru_cache(maxsize=None)
def fib_memo(n: int) -> int:
    """Top-down: recursion + a cache. O(n) time and space. One decorator."""
    return n if n < 2 else fib_memo(n - 1) + fib_memo(n - 2)


def fib_table(n: int) -> int:
    """Bottom-up: fill a table in dependency order. O(n) time and space."""
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


def fib_rolling(n: int) -> int:
    """O(n) time, O(1) space: only the last two states are ever read."""
    if n < 2:
        return n
    prev, curr = 0, 1
    for _ in range(n - 1):
        prev, curr = curr, prev + curr
    return curr


# ============================================================================
# 2. Linear DP
# ============================================================================
def climb_stairs(n: int) -> int:
    """Ways to climb n stairs taking 1 or 2 steps. O(n) time, O(1) space.

    dp[i] = dp[i-1] + dp[i-2] - the last step was either a 1 or a 2. It is
    Fibonacci wearing a hat.
    """
    if n <= 2:
        return max(n, 1)
    prev, curr = 1, 2
    for _ in range(3, n + 1):
        prev, curr = curr, prev + curr
    return curr


def house_robber(values: list[int]) -> int:
    """Max sum with no two adjacent elements. O(n) time, O(1) space.

    dp[i] = max(skip this house: dp[i-1],
                rob this house:  dp[i-2] + values[i])
    """
    skip, take = 0, 0                    # best without / with the previous house
    for value in values:
        skip, take = max(skip, take), skip + value
    return max(skip, take)


def max_subarray(nums: list[int]) -> int:
    """Kadane is DP: dp[i] = best subarray ENDING at i. O(n) / O(1)."""
    if not nums:
        raise ValueError("empty input")
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)    # extend, or start fresh here
        best = max(best, current)
    return best


# ============================================================================
# 3. Knapsack family
# ============================================================================
def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
    """Each item may be used at most ONCE. O(n * W) time and space.

    dp[i][w] = best value using the first i items within capacity w.
    """
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]                       # skip item i-1
            if weights[i - 1] <= w:                       # or take it
                dp[i][w] = max(dp[i][w],
                               values[i - 1] + dp[i - 1][w - weights[i - 1]])
    return dp[n][capacity]


def knapsack_01_optimized(weights: list[int], values: list[int], capacity: int) -> int:
    """Same answer in O(W) space.

    The capacity loop MUST run downwards. Going upwards would read a cell that
    already includes this item, letting it be used twice - which silently
    turns 0/1 knapsack into the unbounded version.
    """
    dp = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for w in range(capacity, weight - 1, -1):        # downwards!
            dp[w] = max(dp[w], value + dp[w - weight])
    return dp[capacity]


def coin_change_min(coins: list[int], amount: int) -> int:
    """Fewest coins summing to amount, or -1. O(len(coins) * amount).

    Unbounded knapsack: the inner loop runs UPWARDS precisely because reusing
    a coin is allowed.
    """
    INF = float("inf")
    dp = [0] + [INF] * amount
    for coin in coins:
        for value in range(coin, amount + 1):            # upwards: reuse is OK
            dp[value] = min(dp[value], dp[value - coin] + 1)
    return -1 if dp[amount] == INF else int(dp[amount])


def coin_change_ways(coins: list[int], amount: int) -> int:
    """Number of COMBINATIONS summing to amount. O(len(coins) * amount).

    Coins outside, amounts inside: that ordering counts each combination once.
    Swapping the loops would count permutations instead ({1,2} and {2,1}).
    """
    dp = [1] + [0] * amount              # one way to make 0: take nothing
    for coin in coins:
        for value in range(coin, amount + 1):
            dp[value] += dp[value - coin]
    return dp[amount]


def can_partition(nums: list[int]) -> bool:
    """Can nums be split into two equal-sum halves? O(n * sum) time, O(sum) space.

    Subset sum in disguise: is `total // 2` reachable? A boolean 0/1 knapsack,
    so the capacity loop runs downwards again.
    """
    total = sum(nums)
    if total % 2:
        return False                     # odd totals can never split evenly
    target = total // 2
    reachable = [True] + [False] * target
    for x in nums:
        for value in range(target, x - 1, -1):           # downwards
            reachable[value] = reachable[value] or reachable[value - x]
    return reachable[target]


# ============================================================================
# 4. String DP
# ============================================================================
def longest_common_subsequence(a: str, b: str) -> int:
    """LCS length. O(n * m) time and space.

    dp[i][j] = LCS of a[:i] and b[:j].
      match:    dp[i-1][j-1] + 1
      mismatch: max(dp[i-1][j], dp[i][j-1])
    Row 0 and column 0 are 0 - an empty string shares nothing.
    """
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]


def edit_distance(a: str, b: str) -> int:
    """Levenshtein distance. O(n * m).

    dp[i][j] = edits to turn a[:i] into b[:j].
      match:    dp[i-1][j-1]        (free)
      else 1 + min(delete  dp[i-1][j],
                   insert  dp[i][j-1],
                   replace dp[i-1][j-1])
    """
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i                     # delete every character
    for j in range(m + 1):
        dp[0][j] = j                     # insert every character

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[n][m]


def word_break(s: str, words: list[str]) -> bool:
    """Can s be split into dictionary words? O(n^2 * word length).

    dp[i] = "the first i characters are splittable".
    """
    vocabulary = set(words)
    dp = [True] + [False] * len(s)
    for end in range(1, len(s) + 1):
        for start in range(end):
            if dp[start] and s[start:end] in vocabulary:
                dp[end] = True
                break
    return dp[len(s)]


def longest_palindromic_subsequence(s: str) -> int:
    """LPS length. O(n^2).

    Equivalent to LCS(s, reversed(s)), but the interval formulation is the one
    that generalises: dp[i][j] over the substring s[i..j], filled by INCREASING
    LENGTH so the shorter intervals it depends on are already known.
    """
    n = len(s)
    if n == 0:
        return 0
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1                     # a single character is a palindrome
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = 2 + (dp[i + 1][j - 1] if length > 2 else 0)
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]


# ============================================================================
# 5. Sequence DP
# ============================================================================
def lis_quadratic(nums: list[int]) -> int:
    """Longest strictly increasing subsequence. O(n^2).

    dp[i] = LIS length ENDING at i. Defining it as "ending at i" is what makes
    the recurrence expressible - "best in the first i" would not be enough.
    """
    if not nums:
        return 0
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)


def lis_binary_search(nums: list[int]) -> int:
    """Same answer in O(n log n).

    `tails[k]` holds the smallest possible tail of an increasing subsequence
    of length k+1. Replacing the first element >= x keeps every tail minimal,
    which keeps `tails` sorted and its LENGTH equal to the answer.

    Note: `tails` is not itself a valid subsequence - only its length matters.
    """
    tails: list[int] = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)              # x extends the longest run so far
        else:
            tails[i] = x                 # a smaller tail for that length
    return len(tails)


# ============================================================================
# 6. Grid DP
# ============================================================================
def unique_paths(rows: int, cols: int) -> int:
    """Paths from top-left to bottom-right moving only right/down. O(r * c).

    dp[r][c] = dp[r-1][c] + dp[r][c-1]. One row of state is enough, because a
    cell only reads the value above (the row being overwritten) and to the
    left (already updated this pass).
    """
    if rows <= 0 or cols <= 0:
        return 0
    row = [1] * cols
    for _ in range(1, rows):
        for c in range(1, cols):
            row[c] += row[c - 1]         # above + left
    return row[cols - 1]


def min_path_sum(grid: list[list[int]]) -> int:
    """Cheapest top-left to bottom-right path. O(r * c) time, O(c) space."""
    if not grid or not grid[0]:
        return 0
    cols = len(grid[0])
    row = [0] * cols
    row[0] = grid[0][0]
    for c in range(1, cols):
        row[c] = row[c - 1] + grid[0][c]         # first row: only from the left

    for r in range(1, len(grid)):
        row[0] += grid[r][0]                     # first column: only from above
        for c in range(1, cols):
            row[c] = min(row[c], row[c - 1]) + grid[r][c]
    return row[cols - 1]


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    for n in range(0, 15):
        assert fib_naive(n) == fib_memo(n) == fib_table(n) == fib_rolling(n)
    assert fib_memo(90) == 2880067194370816120        # instant, thanks to the cache

    assert climb_stairs(1) == 1 and climb_stairs(2) == 2
    assert climb_stairs(5) == 8
    assert climb_stairs(45) == 1836311903

    assert house_robber([1, 2, 3, 1]) == 4            # houses 0 and 2
    assert house_robber([2, 7, 9, 3, 1]) == 12        # houses 0, 2 and 4
    assert house_robber([]) == 0
    assert house_robber([5]) == 5

    assert max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
    assert max_subarray([-5, -2, -9]) == -2

    weights, values = [1, 3, 4, 5], [1, 4, 5, 7]
    assert knapsack_01(weights, values, 7) == 9       # items of weight 3 and 4
    assert knapsack_01_optimized(weights, values, 7) == 9
    for capacity in range(0, 10):                     # both versions must agree
        assert (knapsack_01(weights, values, capacity)
                == knapsack_01_optimized(weights, values, capacity))

    assert coin_change_min([1, 2, 5], 11) == 3        # 5 + 5 + 1
    assert coin_change_min([2], 3) == -1              # impossible
    assert coin_change_min([1], 0) == 0
    assert coin_change_ways([1, 2, 5], 5) == 4        # 5, 2+2+1, 2+1+1+1, 1*5
    assert coin_change_ways([2], 3) == 0

    assert can_partition([1, 5, 11, 5])               # 11 = 1 + 5 + 5
    assert not can_partition([1, 2, 3, 5])
    assert not can_partition([1])                     # odd total

    assert longest_common_subsequence("abcde", "ace") == 3
    assert longest_common_subsequence("abc", "def") == 0
    assert longest_common_subsequence("", "abc") == 0

    assert edit_distance("horse", "ros") == 3
    assert edit_distance("intention", "execution") == 5
    assert edit_distance("", "abc") == 3
    assert edit_distance("same", "same") == 0

    assert word_break("leetcode", ["leet", "code"])
    assert not word_break("catsandog", ["cats", "dog", "sand", "and", "cat"])
    assert word_break("", ["a"])                      # empty string is splittable

    assert longest_palindromic_subsequence("bbbab") == 4      # "bbbb"
    assert longest_palindromic_subsequence("cbbd") == 2       # "bb"
    assert longest_palindromic_subsequence("") == 0

    assert lis_quadratic([10, 9, 2, 5, 3, 7, 101, 18]) == 4   # 2,3,7,101
    assert lis_binary_search([10, 9, 2, 5, 3, 7, 101, 18]) == 4
    assert lis_quadratic([7, 7, 7]) == 1                      # strictly increasing
    assert lis_binary_search([7, 7, 7]) == 1
    assert lis_quadratic([]) == 0 and lis_binary_search([]) == 0
    # The two implementations must agree everywhere.
    for case in ([1], [3, 1, 2], [1, 3, 6, 7, 9, 4, 10, 5, 6], [5, 4, 3, 2, 1]):
        assert lis_quadratic(case) == lis_binary_search(case)

    assert unique_paths(3, 7) == 28
    assert unique_paths(1, 1) == 1
    assert unique_paths(3, 2) == 3

    assert min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == 7   # 1,3,1,1,1
    assert min_path_sum([[1, 2, 3], [4, 5, 6]]) == 12
    assert min_path_sum([]) == 0

    print("15-Dynamic-Programming (Python): all checks passed")


if __name__ == "__main__":
    demo()
