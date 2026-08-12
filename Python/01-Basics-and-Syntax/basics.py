"""
01 - Basics and Syntax: the Python you need before any algorithm.

Every function below is small, self-contained and asserted in demo().
Run:  python basics.py
"""

from collections import Counter, defaultdict, deque
import bisect
import heapq


# ---------------------------------------------------------------- collections
def collection_basics() -> dict:
    """The four core containers and the operations that matter."""
    lst = [3, 1, 2]
    lst.append(4)           # O(1) amortised
    lst.sort()              # in place, O(n log n), Timsort (stable)

    tup = (1, 2)            # immutable -> hashable -> usable as a dict key
    st = {1, 2, 2, 3}       # duplicates collapse
    dct = {"a": 1}
    dct.setdefault("b", 0)  # insert only if the key is missing

    return {"list": lst, "tuple": tup, "set": st, "dict": dct}


def membership_cost(nums: list[int], queries: list[int]) -> int:
    """`in` on a list is O(n); on a set it is O(1). Same answer, different class.

    This is the highest-value habit in this file.
    """
    seen = set(nums)                              # one O(n) pass ...
    return sum(1 for q in queries if q in seen)   # ... then O(1) per query


# -------------------------------------------------------------------- slicing
def slicing_tour(a: list[int]) -> tuple:
    """Slices are COPIES: O(k) time and space. Never slice inside recursion."""
    return a[:3], a[-2:], a[::-1], a[1:6:2]


# ------------------------------------------------------------- comprehensions
def make_grid(rows: int, cols: int, fill: int = 0) -> list[list[int]]:
    """Correct 2-D initialisation.

    `[[fill] * cols] * rows` would alias one single row `rows` times - a bug
    that surfaces only after you mutate grid[0][0] and watch every row change.
    """
    return [[fill] * cols for _ in range(rows)]


def transform(nums: list[int]) -> list[int]:
    """Filter + map in one readable expression."""
    return [x * x for x in nums if x % 2 == 0]


# ------------------------------------------------------------------ functions
def append_safely(value: int, acc: list[int] | None = None) -> list[int]:
    """Mutable default arguments are evaluated ONCE, at definition time.

    `def f(acc=[])` shares that one list across every call. `None` is the fix.
    """
    if acc is None:
        acc = []
    acc.append(value)
    return acc


def sort_by_multiple_keys(people: list[tuple[str, int]]) -> list[tuple[str, int]]:
    """Score descending, then name ascending - negate the numeric key."""
    return sorted(people, key=lambda p: (-p[1], p[0]))


# -------------------------------------------------------------------- classes
class Node:
    """A linked-list node. __slots__ trades flexibility for memory and speed."""

    __slots__ = ("val", "next")

    def __init__(self, val: int, nxt: "Node | None" = None) -> None:
        self.val = val
        self.next = nxt

    def __repr__(self) -> str:          # readable prints while debugging
        return f"Node({self.val})"


# --------------------------------------------------------------------- stdlib
def stdlib_tour(s: str, nums: list[int]) -> dict:
    """The imports that carry most interview solutions."""
    dq = deque([2, 3])
    dq.appendleft(1)                   # O(1) - a list would be O(n)
    dq.pop()

    graph = defaultdict(list)          # no `if key not in graph` boilerplate
    graph[0].append(1)

    freq = Counter(s)                  # frequency map, one line

    heap = list(nums)
    heapq.heapify(heap)                # O(n)
    smallest = heapq.heappop(heap)     # O(log n)

    ordered = sorted(nums)
    pos = bisect.bisect_left(ordered, 3)   # binary search, O(log n)

    return {
        "deque": list(dq),
        "graph": dict(graph),
        "most_common": freq.most_common(1)[0],
        "smallest": smallest,
        "bisect_pos": pos,
    }


def build_string(parts: list[str]) -> str:
    """Strings are immutable: `s += x` in a loop is O(n^2). join is O(n)."""
    return "".join(parts)


# ----------------------------------------------------------------------- demo
def demo() -> None:
    c = collection_basics()
    assert c["list"] == [1, 2, 3, 4]
    assert c["set"] == {1, 2, 3}
    assert c["dict"] == {"a": 1, "b": 0}

    assert membership_cost([1, 2, 3], [2, 2, 9]) == 2

    head, tail, rev, step = slicing_tour([0, 1, 2, 3, 4, 5, 6])
    assert head == [0, 1, 2] and tail == [5, 6]
    assert rev == [6, 5, 4, 3, 2, 1, 0] and step == [1, 3, 5]

    grid = make_grid(2, 3)
    grid[0][0] = 9
    assert grid == [[9, 0, 0], [0, 0, 0]], "rows must not be aliased"

    assert transform([1, 2, 3, 4]) == [4, 16]

    assert append_safely(1) == [1] and append_safely(1) == [1]  # no leakage

    assert sort_by_multiple_keys([("bob", 5), ("amy", 9), ("cat", 5)]) == [
        ("amy", 9), ("bob", 5), ("cat", 5),
    ]

    n = Node(1, Node(2))
    assert n.next is not None and n.next.val == 2 and repr(n) == "Node(1)"

    out = stdlib_tour("mississippi", [5, 1, 4])
    assert out["deque"] == [1, 2]
    assert out["graph"] == {0: [1]}
    assert out["most_common"][0] == "i"     # 4 i's beats 4 s's on tie-break order
    assert out["smallest"] == 1
    assert out["bisect_pos"] == 1

    assert build_string(["a", "b", "c"]) == "abc"

    print("01-Basics-and-Syntax (Python): all checks passed")


if __name__ == "__main__":
    demo()
