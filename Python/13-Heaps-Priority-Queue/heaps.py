"""
13 - Heaps and Priority Queue: a binary heap from scratch, plus the four
patterns that priority queues exist for.

Run:  python heaps.py
"""

from __future__ import annotations

import heapq
import random
from collections import Counter
from typing import Iterable, Optional


# ============================================================================
# 1. A binary min-heap from scratch
# ============================================================================
class MinHeap:
    """A complete binary tree packed into a list.

    Because the tree is complete there are no gaps, so parent/child links are
    pure arithmetic - no nodes, no pointers, perfect cache locality:

        parent(i) = (i - 1) // 2      left(i) = 2i + 1      right(i) = 2i + 2
    """

    def __init__(self, items: Optional[Iterable[int]] = None) -> None:
        self._data: list[int] = list(items or [])
        if self._data:
            self._heapify()

    # ------------------------------------------------------------- internals
    def _heapify(self) -> None:
        """Build in O(n), not O(n log n).

        Sift down from the last parent backwards. A node at height h costs
        O(h), and only n/2^(h+1) nodes sit at height h, so the total telescopes
        to O(n). Most nodes are leaves and cost nothing at all.
        """
        for i in range(len(self._data) // 2 - 1, -1, -1):
            self._sift_down(i)

    def _sift_up(self, i: int) -> None:
        """Swap with the parent while it is larger. O(log n)."""
        while i > 0:
            parent = (i - 1) // 2
            if self._data[parent] <= self._data[i]:
                return
            self._data[parent], self._data[i] = self._data[i], self._data[parent]
            i = parent

    def _sift_down(self, i: int) -> None:
        """Swap with the SMALLER child while a child is smaller. O(log n)."""
        n = len(self._data)
        while True:
            smallest = i
            left, right = 2 * i + 1, 2 * i + 2
            if left < n and self._data[left] < self._data[smallest]:
                smallest = left
            if right < n and self._data[right] < self._data[smallest]:
                smallest = right
            if smallest == i:
                return
            self._data[i], self._data[smallest] = self._data[smallest], self._data[i]
            i = smallest

    # ---------------------------------------------------------------- public
    def push(self, value: int) -> None:
        """Append at the end, then sift up. O(log n)."""
        self._data.append(value)
        self._sift_up(len(self._data) - 1)

    def pop(self) -> int:
        """Remove and return the minimum. O(log n).

        Move the LAST element to the root (keeping the tree complete), then
        sift it down into place.
        """
        if not self._data:
            raise IndexError("pop from empty heap")
        smallest = self._data[0]
        last = self._data.pop()
        if self._data:
            self._data[0] = last
            self._sift_down(0)
        return smallest

    def peek(self) -> int:
        """The minimum, in O(1) - the whole point of a heap."""
        if not self._data:
            raise IndexError("peek at empty heap")
        return self._data[0]

    def __len__(self) -> int:
        return len(self._data)

    def is_valid(self) -> bool:
        """Check the heap invariant everywhere - used by the tests below."""
        return all(
            self._data[(i - 1) // 2] <= self._data[i] for i in range(1, len(self._data))
        )

    def to_sorted_list(self) -> list[int]:
        """Drain the heap: repeated pop yields ascending order. O(n log n)."""
        clone = MinHeap(self._data)
        return [clone.pop() for _ in range(len(clone))]


class MaxHeap:
    """A max-heap built by negating values - the standard trick when the
    library only offers a min-heap (as Python's heapq does)."""

    def __init__(self, items: Optional[Iterable[int]] = None) -> None:
        self._heap = MinHeap(-x for x in (items or []))

    def push(self, value: int) -> None:
        self._heap.push(-value)

    def pop(self) -> int:
        return -self._heap.pop()

    def peek(self) -> int:
        return -self._heap.peek()

    def __len__(self) -> int:
        return len(self._heap)


# ============================================================================
# 2. Heapsort
# ============================================================================
def heap_sort(nums: list[int]) -> list[int]:
    """O(n log n) guaranteed: O(n) to build, then n pops of O(log n)."""
    heap = MinHeap(nums)
    return [heap.pop() for _ in range(len(heap))]


# ============================================================================
# 3. Top k - a heap of size k, not n
# ============================================================================
def kth_largest(nums: list[int], k: int) -> int:
    """The kth largest value. O(n log k) time, O(k) space.

    Counter-intuitive but essential: for the k LARGEST, keep a MIN-heap of
    size k. Its root is the weakest survivor, so anything smaller is rejected
    in O(1) and the heap never grows beyond k.
    """
    if not 1 <= k <= len(nums):
        raise ValueError("k out of range")
    heap: list[int] = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)          # evict the smallest survivor
    return heap[0]


def top_k_frequent(nums: list[int], k: int) -> list[int]:
    """The k most frequent values. O(n log k).

    Same size-k heap trick, keyed on the count.
    """
    counts = Counter(nums)
    heap: list[tuple[int, int]] = []     # (count, value)
    for value, count in counts.items():
        heapq.heappush(heap, (count, value))
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted((value for _, value in heap),
                  key=lambda v: -counts[v])


# ============================================================================
# 4. Merging k sorted sequences
# ============================================================================
def merge_k_sorted(lists: list[list[int]]) -> list[int]:
    """Merge k sorted lists. O(N log k) for N total elements.

    The heap holds at most one element per list, so it stays size k. Merging
    pairwise instead would be O(N k); concatenating and sorting is O(N log N).

    The index tuple (value, list_index, element_index) is also the tie-break,
    which keeps the comparison from ever reaching a non-comparable payload.
    """
    heap: list[tuple[int, int, int]] = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))

    out: list[int] = []
    while heap:
        value, list_index, element_index = heapq.heappop(heap)
        out.append(value)
        next_index = element_index + 1
        if next_index < len(lists[list_index]):
            heapq.heappush(heap, (lists[list_index][next_index], list_index, next_index))
    return out


# ============================================================================
# 5. Two heaps for a running median
# ============================================================================
class MedianFinder:
    """Median of a growing stream. add() is O(log n), median() is O(1).

    Two heaps split the data at the median:
      - `low`  is a MAX-heap (negated) holding the smaller half
      - `high` is a MIN-heap holding the larger half

    Every value passes through `low` first, then its largest is handed to
    `high` - that push-then-pop is what keeps the two halves correctly ordered
    rather than merely balanced.
    """

    def __init__(self) -> None:
        self._low: list[int] = []        # max-heap via negation
        self._high: list[int] = []       # min-heap

    def add(self, value: int) -> None:
        heapq.heappush(self._low, -value)
        heapq.heappush(self._high, -heapq.heappop(self._low))   # hand over the max
        if len(self._high) > len(self._low):                    # rebalance
            heapq.heappush(self._low, -heapq.heappop(self._high))

    def median(self) -> float:
        if not self._low:
            raise ValueError("median of an empty stream")
        if len(self._low) > len(self._high):
            return float(-self._low[0])
        return (-self._low[0] + self._high[0]) / 2


# ============================================================================
# 6. Priority queue with tie-breaking
# ============================================================================
class TaskQueue:
    """Priority queue where lower numbers run first.

    The counter is not decoration: on a priority tie, tuple comparison moves
    to the next element, and comparing two task strings would be arbitrary
    (or a TypeError for non-comparable payloads). A monotonic counter makes
    ties resolve by insertion order - a stable priority queue.
    """

    def __init__(self) -> None:
        self._heap: list[tuple[int, int, str]] = []
        self._counter = 0

    def add(self, priority: int, task: str) -> None:
        heapq.heappush(self._heap, (priority, self._counter, task))
        self._counter += 1

    def next_task(self) -> str:
        if not self._heap:
            raise IndexError("no tasks")
        return heapq.heappop(self._heap)[2]

    def __len__(self) -> int:
        return len(self._heap)


# ============================================================================
# Indexed priority queue - a heap whose keys can be CHANGED
# ============================================================================
class IndexedPriorityQueue:
    """A min-heap supporting change_priority and remove in O(log n).

    THE PROBLEM. A plain binary heap can only look at its root. To lower the
    priority of some arbitrary item you would first have to FIND it - O(n) -
    which defeats the point. So the standard workaround in Dijkstra is to push
    a duplicate entry and skip stale ones on pop:

        if distance > best[node]: continue     # stale entry, ignore it

    That is correct and usually fine, but the heap can grow to O(E) entries
    instead of O(V).

    THE FIX. Keep a second structure - a map from item to its current position
    in the heap array - updated on every swap. Now any item can be located in
    O(1) and re-sifted in O(log n).

        heap[i]        the item at heap position i
        position[item] the heap position of that item  (the inverse map)

    Every swap must update BOTH. That is the entire implementation difficulty:
    one forgotten position write and the map silently goes stale, which shows
    up much later as a wrong answer rather than a crash.

    WHERE IT PAYS OFF:
      - Dijkstra and Prim with decrease-key: heap size stays O(V), and the
        bound becomes a true O(E + V log V) with a Fibonacci heap (O(E log V)
        here, but with far fewer entries)
      - A* with reopened nodes
      - task schedulers where a queued job's priority is revised
      - LRU/LFU caches with an evictable score per key

    Items must be hashable and unique - they are dictionary keys here.
    """

    def __init__(self) -> None:
        self.heap: list[tuple[float, object]] = []       # (priority, item)
        self.position: dict[object, int] = {}            # item -> heap index

    def __len__(self) -> int:
        return len(self.heap)

    def __contains__(self, item: object) -> bool:
        return item in self.position

    def _swap(self, i: int, j: int) -> None:
        """The ONE place the two structures are kept in step."""
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
        self.position[self.heap[i][1]] = i
        self.position[self.heap[j][1]] = j

    def _sift_up(self, i: int) -> None:
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[i][0] >= self.heap[parent][0]:
                break
            self._swap(i, parent)
            i = parent

    def _sift_down(self, i: int) -> None:
        n = len(self.heap)
        while True:
            smallest = i
            for child in (2 * i + 1, 2 * i + 2):
                if child < n and self.heap[child][0] < self.heap[smallest][0]:
                    smallest = child
            if smallest == i:
                return
            self._swap(i, smallest)
            i = smallest

    def push(self, item: object, priority: float) -> None:
        """Insert, or update if already present. O(log n)."""
        if item in self.position:
            self.change_priority(item, priority)
            return
        self.heap.append((priority, item))
        self.position[item] = len(self.heap) - 1
        self._sift_up(len(self.heap) - 1)

    def peek(self) -> tuple[float, object]:
        """Smallest (priority, item) without removing it. O(1)."""
        if not self.heap:
            raise IndexError("peek from an empty priority queue")
        return self.heap[0]

    def pop(self) -> tuple[float, object]:
        """Remove and return the smallest (priority, item). O(log n)."""
        if not self.heap:
            raise IndexError("pop from an empty priority queue")
        return self._remove_at(0)

    def change_priority(self, item: object, priority: float) -> None:
        """Re-key an item already in the queue. O(log n).

        Sift in whichever direction the change calls for - decrease-key moves
        the item up, increase-key moves it down. Doing both unconditionally is
        harmless (one is a no-op) but the comparison makes the intent explicit.
        """
        if item not in self.position:
            raise KeyError(f"{item!r} is not in the queue")
        i = self.position[item]
        old = self.heap[i][0]
        self.heap[i] = (priority, item)
        if priority < old:
            self._sift_up(i)
        elif priority > old:
            self._sift_down(i)

    def remove(self, item: object) -> tuple[float, object]:
        """Remove an arbitrary item. O(log n) - impossible with a plain heap."""
        if item not in self.position:
            raise KeyError(f"{item!r} is not in the queue")
        return self._remove_at(self.position[item])

    def _remove_at(self, i: int) -> tuple[float, object]:
        """Swap the target with the last slot, drop it, then re-sift."""
        last = len(self.heap) - 1
        self._swap(i, last)
        removed = self.heap.pop()
        del self.position[removed[1]]

        if i < last:                     # something was moved into position i
            self._sift_down(i)
            self._sift_up(i)             # it may belong ABOVE its new parent
        return removed


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    heap = MinHeap()
    for x in [5, 3, 8, 1, 9, 2]:
        heap.push(x)
    assert heap.peek() == 1 and len(heap) == 6
    assert heap.is_valid()
    assert heap.to_sorted_list() == [1, 2, 3, 5, 8, 9]
    assert heap.pop() == 1 and heap.pop() == 2
    assert heap.peek() == 3 and heap.is_valid()

    try:
        MinHeap().pop()
        raise AssertionError("expected IndexError")
    except IndexError:
        pass

    # Batch build is O(n) and must produce a valid heap.
    built = MinHeap([9, 4, 7, 1, 8, 2, 6])
    assert built.is_valid() and built.peek() == 1
    assert built.to_sorted_list() == [1, 2, 4, 6, 7, 8, 9]

    max_heap = MaxHeap([5, 3, 8, 1])
    assert max_heap.peek() == 8
    assert max_heap.pop() == 8 and max_heap.pop() == 5

    # Randomised: heapsort must agree with sorted() every time.
    random.seed(13)
    for _ in range(200):
        data = [random.randint(-100, 100) for _ in range(random.randint(0, 40))]
        assert heap_sort(data) == sorted(data)

    assert kth_largest([3, 2, 1, 5, 6, 4], 2) == 5
    assert kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4
    assert kth_largest([1], 1) == 1
    for k in range(1, 7):
        data = [3, 2, 1, 5, 6, 4]
        assert kth_largest(data, k) == sorted(data, reverse=True)[k - 1]

    assert top_k_frequent([1, 1, 1, 2, 2, 3], 2) == [1, 2]
    assert top_k_frequent([1], 1) == [1]

    assert merge_k_sorted([[1, 4, 5], [1, 3, 4], [2, 6]]) == [1, 1, 2, 3, 4, 4, 5, 6]
    assert merge_k_sorted([[], [1]]) == [1]
    assert merge_k_sorted([]) == []

    median = MedianFinder()
    median.add(1)
    assert median.median() == 1.0
    median.add(2)
    assert median.median() == 1.5                 # even count: average of two
    median.add(3)
    assert median.median() == 2.0
    for x in [10, -5, 7, 0]:
        median.add(x)
    assert median.median() == sorted([1, 2, 3, 10, -5, 7, 0])[3]

    tasks = TaskQueue()
    tasks.add(2, "write tests")
    tasks.add(1, "fix the bug")
    tasks.add(1, "review the PR")                 # same priority as the last
    assert tasks.next_task() == "fix the bug"     # lower number first
    assert tasks.next_task() == "review the PR"   # tie broken by arrival order
    assert tasks.next_task() == "write tests"
    assert len(tasks) == 0

    # --- Indexed priority queue ----------------------------------------------
    ipq = IndexedPriorityQueue()
    for item, priority in [("a", 5), ("b", 3), ("c", 8), ("d", 1)]:
        ipq.push(item, priority)

    assert len(ipq) == 4
    assert "c" in ipq and "z" not in ipq
    assert ipq.peek() == (1, "d")

    # The operation a plain heap cannot do: re-key an interior item.
    ipq.change_priority("c", 0)                  # 8 -> 0, must rise to the top
    assert ipq.peek() == (0, "c")
    ipq.change_priority("c", 100)                # and back down again
    assert ipq.peek() == (1, "d")

    # Remove from the middle, also impossible with a plain heap.
    assert ipq.remove("a") == (5, "a")
    assert "a" not in ipq and len(ipq) == 3

    assert ipq.pop() == (1, "d")
    assert ipq.pop() == (3, "b")
    assert ipq.pop() == (100, "c")
    assert len(ipq) == 0

    for empty_call in (ipq.pop, ipq.peek):
        try:
            empty_call()
            raise AssertionError("expected IndexError")
        except IndexError:
            pass

    # push() on an existing item updates rather than duplicating.
    ipq.push("x", 5)
    ipq.push("x", 2)
    assert len(ipq) == 1 and ipq.peek() == (2, "x")

    # Against a sorted list, with the position map re-verified after EVERY
    # operation - a stale index would otherwise stay silent until much later.
    random.seed(13)
    for _ in range(60):
        queue = IndexedPriorityQueue()
        reference: dict[str, float] = {}

        for _ in range(120):
            item = f"item{random.randrange(15)}"
            roll = random.random()

            if roll < 0.45:
                priority = random.randint(0, 100)
                queue.push(item, priority)
                reference[item] = priority
            elif roll < 0.65 and item in reference:
                priority = random.randint(0, 100)
                queue.change_priority(item, priority)
                reference[item] = priority
            elif roll < 0.8 and item in reference:
                assert queue.remove(item) == (reference.pop(item), item)
            elif reference:
                lowest = min(reference.values())
                priority, popped = queue.pop()
                assert priority == lowest             # the true minimum
                assert reference.pop(popped) == priority

            assert len(queue) == len(reference)

            # The heap property, and the position map matching the array.
            for i, (priority, item_at) in enumerate(queue.heap):
                assert queue.position[item_at] == i
                assert reference[item_at] == priority
                parent = (i - 1) // 2
                if i > 0:
                    assert queue.heap[parent][0] <= priority

    print("13-Heaps-Priority-Queue (Python): all checks passed")


if __name__ == "__main__":
    demo()
