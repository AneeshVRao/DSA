"""
15 - Dynamic Programming: every classic family, in both memoised and tabulated
form, with the space optimisations spelled out.

Run:  python dp.py
"""

from __future__ import annotations

import bisect
import random
from functools import lru_cache
from itertools import permutations


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
# 7. Interval (partition) DP
# ============================================================================
def matrix_chain_order(dimensions: list[int]) -> int:
    """Fewest scalar multiplications to multiply a chain of matrices. O(n^3).

    Matrix i has shape dimensions[i] x dimensions[i+1], so n matrices need
    n+1 numbers. Multiplying a p x q by a q x r costs p*q*r scalar multiplies.
    Matrix product is ASSOCIATIVE but not commutative: the order of the
    parenthesisation is free to choose, and the cost difference is enormous.
    For 10x30, 30x5, 5x60:
        ((AB)C) = 10*30*5 + 10*5*60  = 1500 + 3000  =  4500
        (A(BC)) = 30*5*60 + 10*30*60 = 9000 + 18000 = 27000
    Six times the work for the same answer.

    This is the archetypal INTERVAL DP. The shape:

        cost[i][j] = min over every split point k in (i, j) of
                     cost[i][k] + cost[k][j] + (price of joining the two halves)

    The subproblem is a CONTIGUOUS RANGE, and the recurrence tries every way to
    cut it in two. Two consequences that catch people out:

      1. Iterate by INCREASING LENGTH, not by index. cost[i][j] depends on
         strictly shorter intervals, so they must all exist first. A plain
         `for i: for j:` double loop reads uninitialised cells.
      2. It is O(n^3): O(n^2) intervals, each scanning O(n) split points.

    Same skeleton as burst_balloons below, optimal BST construction, "minimum
    cost to cut a stick" and polygon triangulation. Once you see "choose where
    to split a range", it is this.
    """
    n = len(dimensions) - 1                      # number of matrices
    if n <= 1:
        return 0                                 # nothing to multiply

    cost = [[0] * (n + 1) for _ in range(n + 1)]

    for length in range(2, n + 1):               # INCREASING LENGTH - see above
        for i in range(n - length + 1):
            j = i + length                       # half-open interval [i, j)
            # Left half yields a dimensions[i] x dimensions[k] matrix, right
            # half a dimensions[k] x dimensions[j]. Joining them costs the
            # product of the three dimensions.
            cost[i][j] = min(
                cost[i][k] + cost[k][j]
                + dimensions[i] * dimensions[k] * dimensions[j]
                for k in range(i + 1, j)         # every split point
            )

    return cost[0][n]


def burst_balloons(balloons: list[int]) -> int:
    """Maximum coins from bursting balloons, each paying left*self*right. O(n^3).

    The trap: bursting a balloon changes its neighbours, so "which do I burst
    first?" gives a subproblem that is no longer an interval - the recursion
    does not close.

    The fix is to reverse the question. Instead of the first balloon to burst,
    pick the LAST one in each range. If k is last in the open interval (i, j),
    then everything strictly inside was burst before it, so when k pops its
    neighbours are exactly i and j - which are fixed by the interval. Now the
    two sides are independent and the recursion closes:

        best[i][j] = max over k in (i, j) of
                     best[i][k] + best[k][j] + padded[i]*padded[k]*padded[j]

    Padding with 1 at each end removes the boundary special-case (an absent
    neighbour multiplies by 1).

    "Think about the last one, not the first" is the single most transferable
    idea in interval DP.
    """
    padded = [1] + balloons + [1]
    n = len(padded)
    best = [[0] * n for _ in range(n)]

    for length in range(2, n):                   # length of the open interval
        for i in range(n - length):
            j = i + length
            for k in range(i + 1, j):            # k is burst LAST in (i, j)
                best[i][j] = max(
                    best[i][j],
                    best[i][k] + best[k][j] + padded[i] * padded[k] * padded[j],
                )

    return best[0][n - 1]


def min_cost_to_cut_stick(length: int, cuts: list[int]) -> int:
    """Cheapest order of cuts, each costing the length of the piece cut. O(m^3).

    Identical skeleton with the ends padded in as fake cuts at 0 and `length`.
    Sorting matters: the DP is over ADJACENT cut positions, which only form
    intervals once the positions are in order.
    """
    points = sorted([0] + cuts + [length])
    m = len(points)
    cost = [[0] * m for _ in range(m)]

    for span in range(2, m):
        for i in range(m - span):
            j = i + span
            # The piece being cut always spans points[i]..points[j], whichever
            # cut is made first - so that price is a constant here.
            cost[i][j] = points[j] - points[i] + min(
                cost[i][k] + cost[k][j] for k in range(i + 1, j)
            )

    return cost[0][m - 1]


# ============================================================================
# 8. Bitmask DP
# ============================================================================
def travelling_salesman(distance: list[list[int]]) -> int:
    """Shortest tour visiting every city once and returning. O(2^n * n^2).

    The Held-Karp algorithm, and the canonical BITMASK DP.

    The state has to remember WHICH cities have been visited - not how many,
    because which ones are left determines the remaining cost. A set of visited
    cities is a subset of n elements, so encode it as n bits of an integer:

        best[mask][last] = cheapest route that has visited exactly the cities
                           in `mask` and is currently standing at `last`

    2^n * n states, each extended by n choices, giving O(2^n * n^2). Brute force
    over permutations is O(n!) - for n = 20 that is 2.4e18 versus 4e8. Still
    exponential, but the difference between "never" and "a second".

    Bit operations that carry the whole method:
        mask | (1 << c)     add city c to the set
        mask & (1 << c)     is city c in the set?
        mask == (1 << n) - 1  are all n cities in the set?

    Every subset-flavoured problem is this shape: partition into k groups,
    assign n tasks to n workers, shortest superstring, count Hamiltonian paths.
    The ceiling is around n = 20-22 before 2^n stops fitting in memory.
    """
    n = len(distance)
    if n <= 1:
        return 0

    # An int sentinel, not float("inf"): every value in this table is an int,
    # and mixing the two makes the whole table a float table.
    UNREACHABLE = sum(map(max, distance)) * n + 1
    # Start at city 0 with only city 0 visited.
    best = [[UNREACHABLE] * n for _ in range(1 << n)]
    best[1][0] = 0

    for mask in range(1 << n):
        if not mask & 1:
            continue                             # every tour starts at city 0
        for last in range(n):
            if best[mask][last] == UNREACHABLE:
                continue                         # state unreachable
            for city in range(n):
                if mask & (1 << city):
                    continue                     # already visited
                nxt = mask | (1 << city)
                candidate = best[mask][last] + distance[last][city]
                if candidate < best[nxt][city]:
                    best[nxt][city] = candidate

    full = (1 << n) - 1
    return min(best[full][last] + distance[last][0] for last in range(n))


def count_perfect_matchings(compatible: list[list[bool]]) -> int:
    """Ways to assign n tasks to n people, each to exactly one. O(2^n * n).

    compatible[person][task] says whether that pairing is allowed.

    The trick that halves the state: process people in a FIXED order. If the
    mask holds the tasks already assigned, then popcount(mask) is exactly how
    many people have been served - so the person index is implied and never
    needs storing. The state collapses from (person, mask) to just mask.

    Recognising when one dimension is recoverable from another is what makes
    bitmask DP fit in memory.
    """
    n = len(compatible)
    ways = [0] * (1 << n)
    ways[0] = 1                                  # one way to assign nobody

    for mask in range(1 << n):
        if not ways[mask]:
            continue
        person = bin(mask).count("1")            # implied by the popcount
        if person == n:
            continue
        for task in range(n):
            if not mask & (1 << task) and compatible[person][task]:
                ways[mask | (1 << task)] += ways[mask]

    return ways[(1 << n) - 1]


def subset_sum_partition_min_difference(nums: list[int]) -> int:
    """Split into two groups with the smallest possible difference. O(n * sum).

    Included here as the contrast: this is NOT bitmask DP. The state only needs
    the reachable sums, not which elements produced them - so a set of sums
    beats 2^n subsets by a wide margin. Reach for a bitmask only when the
    IDENTITY of the chosen elements actually matters.
    """
    total = sum(nums)
    reachable = 1                                # bit s set == sum s reachable
    for value in nums:
        reachable |= reachable << value          # Python ints as a bitset

    best = total
    for half in range(total // 2 + 1):
        if reachable >> half & 1:
            best = min(best, total - 2 * half)
    return best


# ============================================================================
# 9. Digit DP - counting numbers, not iterating them
# ============================================================================
def count_with_digit_sum_at_most(limit: int, max_digit_sum: int) -> int:
    """How many x in [0, limit] have a digit sum <= max_digit_sum. O(digits * sum * 2).

    The tell for digit DP: the ANSWER IS A COUNT OVER A RANGE, and the range is
    far too large to iterate - `limit` can be 10^18. So build the numbers one
    digit at a time and count the branches instead of walking them.

    THE STATE:

        pos    which digit position we are filling, left to right
        tight  are we still exactly on the prefix of `limit`?
        total  digit sum accumulated so far

    THE `tight` FLAG IS THE WHOLE TECHNIQUE. While every digit so far has
    matched `limit` exactly, the next digit is capped at limit[pos]. The moment
    one smaller digit is placed, the prefix is already below `limit` and every
    later digit is free to be 0-9 - and that subtree is shared by an enormous
    number of values, which is what makes memoisation pay.

    Without tight there is nothing to memoise: the answer would depend on the
    entire prefix. With it, the prefix collapses to a single bit.

    The digits are a plain string, and leading zeros need no special handling
    here because a leading zero adds 0 to the digit sum. Problems that count
    "numbers with no leading zeros" need a third `started` flag.
    """
    if limit < 0:
        return 0
    digits = str(limit)

    @lru_cache(maxsize=None)
    def go(pos: int, tight: bool, total: int) -> int:
        if total > max_digit_sum:
            return 0                          # prune: sums only ever grow
        if pos == len(digits):
            return 1                          # a complete, valid number

        # Capped by limit's digit only while still on its prefix.
        highest = int(digits[pos]) if tight else 9
        count = 0
        for digit in range(highest + 1):
            count += go(pos + 1, tight and digit == highest, total + digit)
        return count

    result = go(0, True, 0)
    go.cache_clear()                          # the cache is limit-specific
    return result


def count_in_range_with_digit_sum(low: int, high: int, max_digit_sum: int) -> int:
    """Same count over [low, high]. The standard prefix-subtraction trick.

        f(low, high) = f(0, high) - f(0, low - 1)

    Digit DP naturally counts from 0, so a two-sided range is answered by two
    one-sided calls. The `low - 1` is the part people get wrong - using `low`
    excludes a value that should be counted.
    """
    if low > high:
        return 0
    return (count_with_digit_sum_at_most(high, max_digit_sum)
            - count_with_digit_sum_at_most(low - 1, max_digit_sum))


def count_without_digit(limit: int, forbidden: int) -> int:
    """How many x in [0, limit] contain no occurrence of `forbidden`. O(digits).

    The same `tight` skeleton - but this constraint needs a THIRD state bit,
    and the reason is the classic digit-DP trap.

    LEADING ZEROS ARE NOT DIGITS. Every candidate is built to the full width of
    `limit`, so 7 is constructed as "007" when limit has three digits. The
    digit-sum version above does not care, because those zeros add 0 to the sum.
    Here they are fatal: with `forbidden = 0` the padding alone would reject
    every short number, and `count_without_digit(50, 0)` would return 36
    instead of 45.

    So carry `started` - has a significant digit been placed yet? A zero before
    the number has started is padding and is exempt; once started, every digit
    is real and the filter applies.

        started == False  ->  still in the padding, 0 is not a real digit
        started == True   ->  a genuine digit position, apply the constraint

    The base case needs care too: if nothing ever started, the value IS zero,
    whose representation is the single character "0" - so it survives only when
    0 is not the forbidden digit.

    Any digit-DP problem phrased over the DIGITS THEMSELVES (no forbidden digit,
    no two equal adjacent digits, strictly increasing digits) needs this flag.
    Problems phrased over an aggregate (sum, remainder) usually do not.
    """
    if limit < 0:
        return 0
    digits = str(limit)

    @lru_cache(maxsize=None)
    def go(pos: int, tight: bool, started: bool) -> int:
        if pos == len(digits):
            if started:
                return 1
            # Nothing was ever placed: the value is 0, written "0".
            return 0 if forbidden == 0 else 1

        highest = int(digits[pos]) if tight else 9
        count = 0
        for digit in range(highest + 1):
            now_started = started or digit != 0
            if now_started and digit == forbidden:
                continue                      # a REAL digit, and it is banned
            count += go(pos + 1, tight and digit == highest, now_started)
        return count

    result = go(0, True, False)
    go.cache_clear()
    return result


# ============================================================================
# 10. Game theory DP - minimax, memoisation and alpha-beta
# ============================================================================
def stone_game_margin(values: list[int]) -> int:
    """First player's final margin when both play optimally. O(n^2).

    Two players alternately take a stone from EITHER END of the row. Both play
    perfectly. What is (my total - their total) at the end?

    THE TRICK THAT COLLAPSES IT. Do not track two scores and whose turn it is.
    Track a single number - the MARGIN from the perspective of whoever is about
    to move:

        best[i][j] = the best achievable (my points - their points) on [i, j]

    Taking values[i] scores values[i] and then hands the opponent a position
    worth best[i+1][j] *to them*, which counts against me:

        best[i][j] = max(values[i] - best[i+1][j],
                         values[j] - best[i][j-1])

    That single minus sign is the whole of minimax. There is no separate
    "minimising player" branch, because the opponent's best margin is exactly
    the negative of mine - the game is zero-sum and this is the NEGAMAX form.

    O(n^2) states, O(1) each. The naive tree is O(2^n).
    """
    n = len(values)
    if n == 0:
        return 0

    # best[i][j] over the inclusive range [i, j], filled by increasing length.
    best = [[0] * n for _ in range(n)]
    for i in range(n):
        best[i][i] = values[i]                # one stone left: take it

    for length in range(2, n + 1):            # INCREASING LENGTH, as always
        for i in range(n - length + 1):
            j = i + length - 1
            best[i][j] = max(values[i] - best[i + 1][j],
                             values[j] - best[i][j - 1])
    return best[0][n - 1]


def minimax_explicit(values: list[int], use_alpha_beta: bool) -> tuple[int, int]:
    """The same answer by explicit tree search. Returns (margin, nodes visited).

    Written out as an actual search rather than a table, because that is the
    form alpha-beta applies to - and the node counter is what makes the pruning
    measurable instead of merely claimed.

    ALPHA-BETA. Carry two bounds down the tree:

        alpha  the best margin the side to move can already guarantee here
        beta   the most the parent will ever allow this node to be worth

    If alpha >= beta at a node, the parent already has a better option
    elsewhere and will never choose this branch - so the rest of it need not be
    examined. The exact value is irrelevant once it is known to be too good to
    be allowed, which is why the cutoff is safe and the answer is unchanged.

    Pruning changes nothing about correctness and everything about cost: with
    good move ordering it takes the branching factor from b to roughly sqrt(b),
    the difference between searching 6 plies and 12.

    THE WINDOW HAS TO BE SHIFTED, NOT JUST NEGATED. The textbook negamax line
    is `-search(child, -beta, -alpha)`, which is correct only when a node's
    value is exactly the negation of its child's. Here it is

        value = face - child          (face = the stone just taken)

    so the window has to be transformed through that expression too. Solving
    `alpha < face - child < beta` for the child gives

        child window = (face - beta, face - alpha)

    and `face` differs per branch, so each child gets its own window. Passing
    the plain `(-beta, -alpha)` prunes branches that were still live and
    silently returns a wrong margin on some inputs - it only shows up when the
    pruned search is compared against the unpruned one, which is exactly what
    the demo does.
    """
    nodes = 0

    def search(i: int, j: int, alpha: int, beta: int) -> int:
        nonlocal nodes
        nodes += 1
        if i > j:
            return 0

        best_margin = -(10 ** 9)
        for take_left in (True, False):
            # The stone taken on this branch, and the range left behind.
            face = values[i] if take_left else values[j]
            lo, hi = (i + 1, j) if take_left else (i, j - 1)

            # Window shifted through `face - child` - see the docstring.
            child = search(lo, hi, face - beta, face - alpha)
            gain = face - child

            best_margin = max(best_margin, gain)
            alpha = max(alpha, best_margin)
            if use_alpha_beta and alpha >= beta:
                break                          # cutoff: the parent won't come here
        return best_margin

    margin = search(0, len(values) - 1, -(10 ** 9), 10 ** 9)
    return margin, nodes


def can_first_player_win(values: list[int]) -> bool:
    """Does the first player win outright? A margin above zero says yes."""
    return stone_game_margin(values) > 0


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

    # --- Interval DP ---------------------------------------------------------
    # 10x30, 30x5, 5x60: ((AB)C) costs 4500, (A(BC)) costs 27000.
    assert matrix_chain_order([10, 30, 5, 60]) == 4500
    assert matrix_chain_order([40, 20, 30, 10, 30]) == 26000
    assert matrix_chain_order([5, 10]) == 0            # a single matrix
    assert matrix_chain_order([7]) == 0                # no matrices at all

    assert burst_balloons([3, 1, 5, 8]) == 167
    assert burst_balloons([1, 5]) == 10
    assert burst_balloons([9]) == 9
    assert burst_balloons([]) == 0

    assert min_cost_to_cut_stick(7, [1, 3, 4, 5]) == 16
    assert min_cost_to_cut_stick(9, [5, 6, 1, 4, 2]) == 22

    # Against brute force over every parenthesisation / burst order.
    random.seed(15)

    def brute_matrix_chain(dims: list[int]) -> int:
        @lru_cache(maxsize=None)
        def solve(i: int, j: int) -> int:
            if j - i <= 1:
                return 0
            return min(solve(i, k) + solve(k, j) + dims[i] * dims[k] * dims[j]
                       for k in range(i + 1, j))
        return solve(0, len(dims) - 1)

    def brute_burst(values: tuple[int, ...]) -> int:
        """Try every possible burst order - O(n!), so keep n tiny."""
        if not values:
            return 0
        best = 0
        for i in range(len(values)):
            left = values[i - 1] if i > 0 else 1
            right = values[i + 1] if i + 1 < len(values) else 1
            gain = left * values[i] * right
            rest = values[:i] + values[i + 1:]
            best = max(best, gain + brute_burst(rest))
        return best

    for _ in range(60):
        dims = [random.randint(1, 20) for _ in range(random.randint(1, 7))]
        assert matrix_chain_order(dims) == brute_matrix_chain(dims)

    for _ in range(40):
        values = [random.randint(1, 9) for _ in range(random.randint(0, 6))]
        assert burst_balloons(values) == brute_burst(tuple(values))

    # --- Bitmask DP ----------------------------------------------------------
    # A square: 0-1-2-3-0 with unit sides and diagonals of 2.
    square = [
        [0, 1, 2, 1],
        [1, 0, 1, 2],
        [2, 1, 0, 1],
        [1, 2, 1, 0],
    ]
    assert travelling_salesman(square) == 4        # walk the perimeter
    assert travelling_salesman([[0]]) == 0
    assert travelling_salesman([[0, 5], [5, 0]]) == 10   # there and back

    identity = [[True] * 3 for _ in range(3)]
    assert count_perfect_matchings(identity) == 6       # 3! total assignments
    assert count_perfect_matchings([[True, False], [False, True]]) == 1
    assert count_perfect_matchings([[True, True], [False, False]]) == 0

    assert subset_sum_partition_min_difference([1, 6, 11, 5]) == 1
    assert subset_sum_partition_min_difference([3, 3]) == 0
    assert subset_sum_partition_min_difference([10]) == 10

    # Held-Karp against brute force over every permutation.
    for _ in range(30):
        n = random.randint(1, 7)
        matrix = [[0] * n for _ in range(n)]
        for u in range(n):
            for v in range(u + 1, n):
                w = random.randint(1, 30)
                matrix[u][v] = matrix[v][u] = w     # symmetric

        expected = min(
            (sum(matrix[route[i]][route[i + 1]] for i in range(len(route) - 1))
             + matrix[route[-1]][0]
             for route in [(0,) + p for p in permutations(range(1, n))]),
            default=0,
        )
        assert travelling_salesman(matrix) == expected

    # Perfect matchings against brute force over every permutation.
    for _ in range(30):
        n = random.randint(1, 6)
        allowed = [[random.random() < 0.6 for _ in range(n)] for _ in range(n)]
        expected = sum(
            1 for assignment in permutations(range(n))
            if all(allowed[person][task] for person, task in enumerate(assignment))
        )
        assert count_perfect_matchings(allowed) == expected

    # Minimum partition difference against enumerating every subset.
    for _ in range(30):
        nums = [random.randint(1, 20) for _ in range(random.randint(1, 10))]
        total = sum(nums)
        best_diff = total
        for mask in range(1 << len(nums)):
            part = sum(v for i, v in enumerate(nums) if mask >> i & 1)
            best_diff = min(best_diff, abs(total - 2 * part))
        assert subset_sum_partition_min_difference(nums) == best_diff

    # --- Digit DP ------------------------------------------------------------
    assert count_with_digit_sum_at_most(0, 0) == 1          # just 0 itself
    assert count_with_digit_sum_at_most(9, 5) == 6          # 0,1,2,3,4,5
    assert count_with_digit_sum_at_most(20, 2) == 6         # 0,1,2,10,11,20
    assert count_with_digit_sum_at_most(-1, 5) == 0         # empty range
    assert count_with_digit_sum_at_most(100, 100) == 101    # every value fits

    # Against brute force over the whole range.
    for limit in range(0, 400):
        for cap in (0, 1, 5, 9, 15):
            expected = sum(1 for x in range(limit + 1)
                           if sum(int(c) for c in str(x)) <= cap)
            assert count_with_digit_sum_at_most(limit, cap) == expected

    assert count_in_range_with_digit_sum(10, 20, 2) == 3    # 10, 11, 20
    assert count_in_range_with_digit_sum(5, 5, 5) == 1      # inclusive both ends
    assert count_in_range_with_digit_sum(20, 10, 5) == 0    # inverted

    for _ in range(200):
        low = random.randint(0, 300)
        high = random.randint(low, 500)
        cap = random.randint(0, 20)
        expected = sum(1 for x in range(low, high + 1)
                       if sum(int(c) for c in str(x)) <= cap)
        assert count_in_range_with_digit_sum(low, high, cap) == expected

    assert count_without_digit(9, 4) == 9                   # 0-9 minus the 4
    assert count_without_digit(50, 0) == 45
    for limit in range(0, 500):
        for forbidden in (0, 4, 7):
            expected = sum(1 for x in range(limit + 1)
                           if str(forbidden) not in str(x))
            assert count_without_digit(limit, forbidden) == expected

    # The point of the whole technique: a range no loop could ever walk.
    huge = count_with_digit_sum_at_most(10 ** 18, 20)
    assert huge > 0                                          # returns instantly

    # --- Game theory DP ------------------------------------------------------
    assert stone_game_margin([1, 5, 2]) == -2      # every move loses ground
    assert stone_game_margin([5, 3, 4, 5]) == 1
    assert stone_game_margin([10]) == 10           # take the only stone
    assert stone_game_margin([]) == 0
    assert stone_game_margin([2, 2]) == 0          # symmetric: a draw

    assert can_first_player_win([5, 3, 4, 5])
    assert not can_first_player_win([1, 5, 2])

    # The table, the plain search and the pruned search must all agree.
    strictly_fewer = 0
    trials = 0
    for _ in range(60):
        n = random.randint(4, 12)
        stones = [random.randint(1, 20) for _ in range(n)]

        table = stone_game_margin(stones)
        plain, plain_nodes = minimax_explicit(stones, use_alpha_beta=False)
        pruned, pruned_nodes = minimax_explicit(stones, use_alpha_beta=True)

        assert plain == table                      # search agrees with the DP
        assert pruned == table                     # pruning changes NOTHING

        # Pruning can never COST nodes - that part is a guarantee.
        assert pruned_nodes <= plain_nodes
        trials += 1
        strictly_fewer += pruned_nodes < plain_nodes

    # How much it saves is input-dependent, so the claim is statistical rather
    # than absolute: on a two-branch game with fixed move ordering there are
    # positions where nothing can be cut. It should still win almost always.
    assert strictly_fewer >= 0.9 * trials

    # Brute force over every play sequence, for small inputs.
    def brute_margin(remaining: tuple[int, ...]) -> int:
        if not remaining:
            return 0
        return max(remaining[0] - brute_margin(remaining[1:]),
                   remaining[-1] - brute_margin(remaining[:-1]))

    for _ in range(40):
        stones = [random.randint(1, 9) for _ in range(random.randint(0, 9))]
        assert stone_game_margin(stones) == brute_margin(tuple(stones))

    # A deterministic case large enough that pruning definitely bites.
    ordered = list(range(1, 17))
    _, unpruned_nodes = minimax_explicit(ordered, use_alpha_beta=False)
    _, alphabeta_nodes = minimax_explicit(ordered, use_alpha_beta=True)
    assert alphabeta_nodes < unpruned_nodes
    # The unpruned search really is the full binary tree: n levels of choices
    # plus the empty-range leaves, so 2^(n+1) - 1 nodes.
    assert unpruned_nodes == 2 ** (len(ordered) + 1) - 1

    print(f"  minimax visited {unpruned_nodes} nodes, "
          f"alpha-beta {alphabeta_nodes} "
          f"({100 - 100 * alphabeta_nodes // unpruned_nodes}% pruned)")
    print("  and the O(n^2) table answers the same question in "
          f"{len(ordered) ** 2} cells")

    print("15-Dynamic-Programming (Python): all checks passed")
    print("  Interval DP checked against every parenthesisation and burst order,")
    print("  bitmask DP against every permutation")


if __name__ == "__main__":
    demo()
