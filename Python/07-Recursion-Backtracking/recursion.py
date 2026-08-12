"""
07 - Recursion and Backtracking: from factorial to N-Queens, all on the same
choose / explore / un-choose skeleton.

Run:  python recursion.py
"""

from __future__ import annotations

from functools import lru_cache


# ============================================================================
# 1. Plain recursion
# ============================================================================
def factorial(n: int) -> int:
    """O(n) time, O(n) stack. The base case is what stops the descent."""
    if n < 0:
        raise ValueError("factorial is undefined for negatives")
    if n <= 1:
        return 1
    return n * factorial(n - 1)


def fib_naive(n: int) -> int:
    """O(2^n): the same subproblems are recomputed exponentially often."""
    if n < 2:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)


@lru_cache(maxsize=None)
def fib_memo(n: int) -> int:
    """O(n) time and space. One decorator turns the tree into a chain."""
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)


def power(base: float, exp: int) -> float:
    """Fast exponentiation: O(log n) instead of O(n).

    x^n = (x^(n/2))^2 for even n. Each level halves the exponent.
    """
    if exp < 0:
        return 1 / power(base, -exp)
    if exp == 0:
        return 1.0
    half = power(base, exp // 2)
    return half * half if exp % 2 == 0 else half * half * base


def reverse_string(s: str) -> str:
    """Recursion on strings. O(n^2) because slicing copies - shown as a
    cautionary example, not as the way to reverse a string."""
    if len(s) <= 1:
        return s
    return reverse_string(s[1:]) + s[0]


def sum_digits(n: int) -> int:
    """Digit recursion: strip one digit per call. O(log n)."""
    n = abs(n)
    return n if n < 10 else n % 10 + sum_digits(n // 10)


def hanoi(n: int, source: str = "A", target: str = "C", spare: str = "B") -> list[tuple[str, str]]:
    """Tower of Hanoi. Exactly 2^n - 1 moves, and that bound is optimal.

    The insight: to move n disks, move n-1 out of the way, move the big one,
    then move the n-1 back on top. Two recursive calls -> O(2^n).
    """
    if n == 0:
        return []
    return (
        hanoi(n - 1, source, spare, target)
        + [(source, target)]
        + hanoi(n - 1, spare, target, source)
    )


# ============================================================================
# 2. Backtracking - subsets and permutations
# ============================================================================
def subsets(nums: list[int]) -> list[list[int]]:
    """All 2^n subsets. O(n * 2^n) time - the n is the cost of copying.

    At each index the choice is binary: take it or skip it.
    """
    results: list[list[int]] = []
    path: list[int] = []

    def backtrack(start: int) -> None:
        results.append(path[:])            # COPY: path keeps mutating
        for i in range(start, len(nums)):
            path.append(nums[i])           # choose
            backtrack(i + 1)               # explore (i+1: no reuse)
            path.pop()                     # un-choose

    backtrack(0)
    return results


def permutations(nums: list[int]) -> list[list[int]]:
    """All n! orderings. O(n * n!).

    `used` is what prunes: each element may appear once per permutation.
    """
    results: list[list[int]] = []
    path: list[int] = []
    used = [False] * len(nums)

    def backtrack() -> None:
        if len(path) == len(nums):
            results.append(path[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue                   # prune: already placed
            used[i] = True
            path.append(x)
            backtrack()
            path.pop()
            used[i] = False                # un-choose BOTH pieces of state

    backtrack()
    return results


def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    """Every combination summing to target; candidates may be reused.

    Sorting lets us `break` instead of `continue` once the remainder goes
    negative - every later candidate is even bigger.
    """
    results: list[list[int]] = []
    path: list[int] = []
    ordered = sorted(candidates)

    def backtrack(start: int, remaining: int) -> None:
        if remaining == 0:
            results.append(path[:])
            return
        for i in range(start, len(ordered)):
            if ordered[i] > remaining:
                break                      # prune the entire remaining branch
            path.append(ordered[i])
            backtrack(i, remaining - ordered[i])   # i, not i+1: reuse allowed
            path.pop()

    backtrack(0, target)
    return results


def generate_parentheses(n: int) -> list[str]:
    """All valid combinations of n pairs. Catalan(n) results.

    Two rules make every generated string valid by construction:
    open  < n         -> we may still open
    close < open      -> we may only close what is already open
    """
    results: list[str] = []
    path: list[str] = []

    def backtrack(open_count: int, close_count: int) -> None:
        if len(path) == 2 * n:
            results.append("".join(path))
            return
        if open_count < n:
            path.append("(")
            backtrack(open_count + 1, close_count)
            path.pop()
        if close_count < open_count:
            path.append(")")
            backtrack(open_count, close_count + 1)
            path.pop()

    backtrack(0, 0)
    return results


# ============================================================================
# 3. Backtracking on a board
# ============================================================================
def solve_n_queens(n: int) -> list[list[str]]:
    """Place n queens so none attack each other.

    One queen per row is baked in, so only the column and the two diagonals
    need tracking. A cell (r, c) sits on diagonal r - c and anti-diagonal
    r + c, and each of those must be unique.

    Pruning turns a raw 8^8 = 16.7M search into ~2k explored nodes.
    """
    results: list[list[str]] = []
    cols: set[int] = set()
    diag: set[int] = set()        # r - c
    anti: set[int] = set()        # r + c
    placement: list[int] = []     # placement[row] = column

    def backtrack(row: int) -> None:
        if row == n:
            results.append(
                ["." * c + "Q" + "." * (n - c - 1) for c in placement]
            )
            return
        for col in range(n):
            if col in cols or (row - col) in diag or (row + col) in anti:
                continue                   # prune: attacked
            cols.add(col)
            diag.add(row - col)
            anti.add(row + col)
            placement.append(col)

            backtrack(row + 1)

            placement.pop()
            anti.discard(row + col)
            diag.discard(row - col)
            cols.discard(col)

    backtrack(0)
    return results


def word_search(board: list[list[str]], word: str) -> bool:
    """Does `word` exist along a path of adjacent cells? O(rows * cols * 4^len).

    The visited mark is written into the board and restored afterwards - that
    restore IS the backtrack step.
    """
    if not word or not board or not board[0]:
        return False
    rows, cols = len(board), len(board[0])

    def backtrack(r: int, c: int, i: int) -> bool:
        if i == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:
            return False                   # prune: off-board or wrong letter

        board[r][c] = "#"                  # mark visited
        found = (
            backtrack(r + 1, c, i + 1)
            or backtrack(r - 1, c, i + 1)
            or backtrack(r, c + 1, i + 1)
            or backtrack(r, c - 1, i + 1)
        )
        board[r][c] = word[i]              # restore - the backtrack
        return found

    return any(
        backtrack(r, c, 0) for r in range(rows) for c in range(cols)
    )


# ============================================================================
# 4. Turning recursion into iteration
# ============================================================================
def factorial_iterative(n: int) -> int:
    """Same result, O(1) stack. Any recursion can be rewritten this way."""
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


def dfs_iterative(graph: dict[int, list[int]], start: int) -> list[int]:
    """Depth-first traversal with an explicit stack instead of the call stack.

    This is the escape hatch when the recursion depth would overflow.
    """
    visited: set[int] = set()
    order: list[int] = []
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        stack.extend(reversed(graph.get(node, [])))   # reversed: keep DFS order
    return order


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    assert factorial(0) == 1 and factorial(5) == 120
    assert factorial_iterative(5) == factorial(5)

    assert fib_naive(10) == 55
    assert fib_memo(50) == 12586269025          # instant thanks to the cache

    assert power(2, 10) == 1024
    assert power(2, 0) == 1
    assert abs(power(2, -2) - 0.25) < 1e-9

    assert reverse_string("abc") == "cba"
    assert sum_digits(9875) == 29

    moves = hanoi(3)
    assert len(moves) == 7                       # 2^3 - 1, provably optimal
    assert moves[0] == ("A", "C") and moves[-1] == ("A", "C")

    subs = subsets([1, 2, 3])
    assert len(subs) == 8                        # 2^3
    assert [] in subs and [1, 2, 3] in subs and [2, 3] in subs

    perms = permutations([1, 2, 3])
    assert len(perms) == 6                       # 3!
    assert [1, 2, 3] in perms and [3, 2, 1] in perms
    assert len({tuple(p) for p in perms}) == 6   # all distinct

    combos = combination_sum([2, 3, 6, 7], 7)
    assert sorted(combos) == [[2, 2, 3], [7]]

    parens = generate_parentheses(3)
    assert len(parens) == 5                      # Catalan(3)
    assert "((()))" in parens and "()()()" in parens

    queens = solve_n_queens(4)
    assert len(queens) == 2                      # the two 4x4 solutions
    assert queens[0][0].count("Q") == 1
    assert len(solve_n_queens(8)) == 92          # the classic answer
    assert len(solve_n_queens(1)) == 1
    assert len(solve_n_queens(3)) == 0           # no solution exists

    board = [list("ABCE"), list("SFCS"), list("ADEE")]
    assert word_search(board, "ABCCED")
    assert word_search(board, "SEE")
    assert not word_search(board, "ABCB")        # cannot reuse a cell
    assert board[0] == list("ABCE")              # board restored, not corrupted

    graph = {1: [2, 3], 2: [4], 3: [4], 4: []}
    assert dfs_iterative(graph, 1) == [1, 2, 4, 3]

    print("07-Recursion-Backtracking (Python): all checks passed")


if __name__ == "__main__":
    demo()
