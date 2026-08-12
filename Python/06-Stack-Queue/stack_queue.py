"""
06 - Stack and Queue: both structures from scratch, plus the monotonic-stack
patterns that show up constantly in interviews.

Run:  python stack_queue.py
"""

from __future__ import annotations

from collections import deque
from typing import Any


# ============================================================================
# 1. Stack (LIFO)
# ============================================================================
class Stack:
    """A list is already a perfect stack; this wraps it in the vocabulary.

    push/pop/peek are all O(1).
    """

    def __init__(self) -> None:
        self._items: list[Any] = []

    def push(self, item: Any) -> None:
        self._items.append(item)

    def pop(self) -> Any:
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self) -> Any:
        if not self._items:
            raise IndexError("peek at empty stack")
        return self._items[-1]

    def is_empty(self) -> bool:
        return not self._items

    def __len__(self) -> int:
        return len(self._items)

    def __repr__(self) -> str:
        return f"Stack({self._items})  <- top"


# ============================================================================
# 2. Queue (FIFO) - circular buffer over a fixed array
# ============================================================================
class CircularQueue:
    """Fixed-capacity FIFO queue with O(1) enqueue and dequeue.

    head is where the next dequeue happens; tail is where the next enqueue
    goes. Both wrap with % capacity, so no element is ever shifted.

    A separate `count` distinguishes full from empty - otherwise head == tail
    would be ambiguous.
    """

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._buf: list[Any] = [None] * capacity
        self._capacity = capacity
        self._head = 0
        self._count = 0

    def enqueue(self, item: Any) -> None:
        if self.is_full():
            raise OverflowError("queue is full")
        tail = (self._head + self._count) % self._capacity
        self._buf[tail] = item
        self._count += 1

    def dequeue(self) -> Any:
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        item = self._buf[self._head]
        self._buf[self._head] = None           # release the reference
        self._head = (self._head + 1) % self._capacity
        self._count -= 1
        return item

    def front(self) -> Any:
        if self.is_empty():
            raise IndexError("front of empty queue")
        return self._buf[self._head]

    def is_empty(self) -> bool:
        return self._count == 0

    def is_full(self) -> bool:
        return self._count == self._capacity

    def __len__(self) -> int:
        return self._count

    def to_list(self) -> list[Any]:
        return [self._buf[(self._head + i) % self._capacity]
                for i in range(self._count)]


# ============================================================================
# 3. MinStack - O(1) minimum
# ============================================================================
class MinStack:
    """Stack that also reports its minimum in O(1).

    Trick: store (value, min_so_far) pairs. The extra O(n) space buys the O(1)
    query - scanning for the min on demand would be O(n) per call.
    """

    def __init__(self) -> None:
        self._stack: list[tuple[int, int]] = []

    def push(self, val: int) -> None:
        current_min = val if not self._stack else min(val, self._stack[-1][1])
        self._stack.append((val, current_min))

    def pop(self) -> int:
        if not self._stack:
            raise IndexError("pop from empty stack")
        return self._stack.pop()[0]

    def top(self) -> int:
        return self._stack[-1][0]

    def min(self) -> int:
        return self._stack[-1][1]

    def __len__(self) -> int:
        return len(self._stack)


# ============================================================================
# 4. Queue built from two stacks
# ============================================================================
class QueueViaStacks:
    """FIFO using two LIFOs. Amortised O(1) per operation.

    Pouring `inbox` into `outbox` reverses the order, so the oldest element
    ends up on top of `outbox`. Each element is moved at most twice in its
    lifetime, which is what makes the average constant.
    """

    def __init__(self) -> None:
        self._inbox: list[Any] = []
        self._outbox: list[Any] = []

    def enqueue(self, item: Any) -> None:
        self._inbox.append(item)               # always O(1)

    def dequeue(self) -> Any:
        self._shift()
        if not self._outbox:
            raise IndexError("dequeue from empty queue")
        return self._outbox.pop()

    def front(self) -> Any:
        self._shift()
        if not self._outbox:
            raise IndexError("front of empty queue")
        return self._outbox[-1]

    def _shift(self) -> None:
        if not self._outbox:                   # only pour when it runs dry
            while self._inbox:
                self._outbox.append(self._inbox.pop())

    def __len__(self) -> int:
        return len(self._inbox) + len(self._outbox)


# ============================================================================
# 5. Matching / nesting
# ============================================================================
def is_balanced(s: str) -> bool:
    """Valid parentheses. O(n) time, O(n) space.

    A closer must match the most recent opener - that "most recent" is exactly
    what a stack gives you.
    """
    pairs = {")": "(", "]": "[", "}": "{"}
    stack: list[str] = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack                           # leftovers mean unclosed openers


# ============================================================================
# 6. Monotonic stack
# ============================================================================
def next_greater(nums: list[int]) -> list[int]:
    """For each element, the next strictly greater element to its right, or -1.

    O(n): each index is pushed once and popped at most once, so the inner
    while loop is amortised constant.
    """
    result = [-1] * len(nums)
    stack: list[int] = []                      # indices, values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x            # x is the answer for that index
        stack.append(i)
    return result


def daily_temperatures(temps: list[int]) -> list[int]:
    """Days to wait for a warmer temperature. Same pattern, distances instead.

    This is why the stack holds INDICES: we need i - j, not the value.
    """
    result = [0] * len(temps)
    stack: list[int] = []
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result


def largest_rectangle(heights: list[int]) -> int:
    """Largest rectangle in a histogram. O(n) with a monotonic increasing stack.

    When a bar shorter than the stack top arrives, the popped bar can no longer
    extend right - so its maximal rectangle is finalised here. The sentinel 0
    at the end flushes whatever is left on the stack.
    """
    stack: list[int] = []                      # indices, heights increasing
    best = 0
    for i, h in enumerate(heights + [0]):      # sentinel forces a full flush
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] + 1 if stack else 0
            best = max(best, height * (i - left))
        stack.append(i)
    return best


# ============================================================================
# 7. Simulation
# ============================================================================
def eval_rpn(tokens: list[str]) -> int:
    """Evaluate reverse Polish notation. O(n) time and space.

    Operands wait on the stack until an operator claims the last two.
    """
    stack: list[int] = []
    ops = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: int(a / b),          # truncates toward zero
    }
    for token in tokens:
        if token in ops:
            b = stack.pop()
            a = stack.pop()                    # order matters for - and /
            stack.append(ops[token](a, b))
        else:
            stack.append(int(token))
    return stack.pop()


def simplify_path(path: str) -> str:
    """Unix path canonicalisation: '/a/./b/../c' -> '/a/c'. O(n)."""
    stack: list[str] = []
    for part in path.split("/"):
        if part == "..":
            if stack:
                stack.pop()                    # go up one directory
        elif part and part != ".":
            stack.append(part)
    return "/" + "/".join(stack)


def sliding_window_max(nums: list[int], k: int) -> list[int]:
    """Maximum of every window of size k. O(n) with a monotonic deque.

    The deque holds indices whose values decrease. The front is always the
    window maximum; anything smaller arriving from the right makes older,
    smaller values permanently useless.
    """
    if k <= 0 or k > len(nums):
        raise ValueError("bad window size")
    dq: deque[int] = deque()
    out: list[int] = []
    for i, x in enumerate(nums):
        while dq and dq[0] <= i - k:           # drop indices that left the window
            dq.popleft()
        while dq and nums[dq[-1]] <= x:        # drop values that can never win
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    st = Stack()
    st.push(1)
    st.push(2)
    assert st.peek() == 2 and len(st) == 2
    assert st.pop() == 2 and st.pop() == 1 and st.is_empty()
    try:
        st.pop()
        raise AssertionError("expected IndexError")
    except IndexError:
        pass

    q = CircularQueue(3)
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    assert q.is_full() and q.to_list() == [1, 2, 3]
    assert q.dequeue() == 1
    q.enqueue(4)                               # wraps around the buffer
    assert q.to_list() == [2, 3, 4]
    assert q.front() == 2 and len(q) == 3

    ms = MinStack()
    for v in (5, 3, 7, 3):
        ms.push(v)
    assert ms.min() == 3 and ms.top() == 3
    ms.pop()
    assert ms.min() == 3
    ms.pop()                                   # removes the 7
    ms.pop()                                   # removes the first 3
    assert ms.min() == 5

    qs = QueueViaStacks()
    for v in (1, 2, 3):
        qs.enqueue(v)
    assert qs.front() == 1 and qs.dequeue() == 1
    qs.enqueue(4)
    assert [qs.dequeue() for _ in range(3)] == [2, 3, 4]

    assert is_balanced("({[]})")
    assert is_balanced("")
    assert not is_balanced("(]")
    assert not is_balanced("((")

    assert next_greater([2, 1, 2, 4, 3]) == [4, 2, 4, -1, -1]
    assert daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0]
    assert largest_rectangle([2, 1, 5, 6, 2, 3]) == 10
    assert largest_rectangle([2, 2]) == 4

    assert eval_rpn(["2", "1", "+", "3", "*"]) == 9
    assert eval_rpn(["4", "13", "5", "/", "+"]) == 6

    assert simplify_path("/a/./b/../../c/") == "/c"
    assert simplify_path("/../") == "/"

    assert sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]

    print("06-Stack-Queue (Python): all checks passed")


if __name__ == "__main__":
    demo()
