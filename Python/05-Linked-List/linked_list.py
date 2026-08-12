"""
05 - Linked List: singly and doubly linked lists from scratch, plus the
pointer patterns interviewers actually ask about.

Run:  python linked_list.py
"""

from __future__ import annotations

from typing import Iterator, Optional


# ============================================================================
# Node
# ============================================================================
class Node:
    """__slots__ keeps each node to two fields - millions of these add up."""

    __slots__ = ("val", "next")

    def __init__(self, val: int, nxt: Optional["Node"] = None) -> None:
        self.val = val
        self.next = nxt

    def __repr__(self) -> str:
        return f"Node({self.val})"


# ============================================================================
# Singly linked list
# ============================================================================
class SinglyLinkedList:
    """Keeps a tail pointer so append is O(1) instead of O(n)."""

    def __init__(self, values: list[int] | None = None) -> None:
        self.head: Optional[Node] = None
        self.tail: Optional[Node] = None
        self.size = 0
        for v in values or []:
            self.push_back(v)

    # ---------------------------------------------------------------- basics
    def __len__(self) -> int:
        return self.size

    def __iter__(self) -> Iterator[int]:
        node = self.head
        while node:
            yield node.val
            node = node.next

    def __repr__(self) -> str:
        return " -> ".join(map(str, self)) or "(empty)"

    def to_list(self) -> list[int]:
        return list(self)

    # ------------------------------------------------------------- insertion
    def push_front(self, val: int) -> None:
        """O(1) - the operation arrays cannot do cheaply."""
        node = Node(val, self.head)
        self.head = node
        if self.tail is None:
            self.tail = node
        self.size += 1

    def push_back(self, val: int) -> None:
        """O(1) thanks to the tail pointer; O(n) without one."""
        node = Node(val)
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node
        self.size += 1

    def insert_at(self, index: int, val: int) -> None:
        """O(n): we must walk to the position first."""
        if not 0 <= index <= self.size:
            raise IndexError("index out of range")
        if index == 0:
            return self.push_front(val)
        if index == self.size:
            return self.push_back(val)
        prev = self._node_at(index - 1)
        assert prev is not None
        prev.next = Node(val, prev.next)
        self.size += 1

    # -------------------------------------------------------------- deletion
    def delete_at(self, index: int) -> int:
        """O(n). A dummy head would also work; here we branch explicitly."""
        if not 0 <= index < self.size:
            raise IndexError("index out of range")
        if index == 0:
            assert self.head is not None
            removed = self.head
            self.head = removed.next
            if self.head is None:
                self.tail = None
            self.size -= 1
            return removed.val

        prev = self._node_at(index - 1)
        assert prev is not None and prev.next is not None
        removed = prev.next
        prev.next = removed.next
        if removed is self.tail:
            self.tail = prev
        self.size -= 1
        return removed.val

    def remove_value(self, val: int) -> bool:
        """Remove the first node with this value. Dummy head kills the special
        case where the match is the head itself. O(n)."""
        dummy = Node(0, self.head)
        prev = dummy
        while prev.next:
            if prev.next.val == val:
                if prev.next is self.tail:
                    self.tail = prev if prev is not dummy else None
                prev.next = prev.next.next
                self.head = dummy.next
                self.size -= 1
                return True
            prev = prev.next
        return False

    # --------------------------------------------------------------- lookups
    def search(self, val: int) -> int:
        """Index of the first match, or -1. O(n) - no random access here."""
        for i, x in enumerate(self):
            if x == val:
                return i
        return -1

    def _node_at(self, index: int) -> Optional[Node]:
        node = self.head
        for _ in range(index):
            if node is None:
                return None
            node = node.next
        return node

    # ------------------------------------------------------------- reversal
    def reverse(self) -> None:
        """Iterative reversal in place. O(n) time, O(1) space.

        Save `next` BEFORE overwriting it, or the rest of the list is lost.
        """
        prev, curr = None, self.head
        self.tail = self.head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev, curr = curr, nxt
        self.head = prev

    def reverse_recursive(self) -> None:
        """Same result, O(n) stack space. Shown for the recursion practice."""

        def helper(node: Optional[Node]) -> Optional[Node]:
            if node is None or node.next is None:
                return node
            new_head = helper(node.next)
            node.next.next = node      # the node behind me now points to me
            node.next = None           # and I point to nothing (for now)
            return new_head

        self.tail = self.head
        self.head = helper(self.head)

    # ------------------------------------------------------- two-pointer set
    def middle(self) -> Optional[int]:
        """Value at the middle (second middle when even). O(n), one pass.

        fast moves twice per step, so when fast finishes, slow is halfway.
        """
        slow = fast = self.head
        while fast and fast.next:
            assert slow is not None
            slow = slow.next
            fast = fast.next.next
        return slow.val if slow else None

    def remove_nth_from_end(self, n: int) -> None:
        """One pass. The dummy head makes n == size (removing the head) work."""
        if not 1 <= n <= self.size:
            raise IndexError("n out of range")
        dummy = Node(0, self.head)
        fast: Optional[Node] = dummy
        slow: Node = dummy
        for _ in range(n):             # open a gap of n nodes
            assert fast is not None
            fast = fast.next
        while fast and fast.next:      # walk both until fast is last
            fast = fast.next
            slow = slow.next           # type: ignore[assignment]
        assert slow.next is not None
        if slow.next is self.tail:
            self.tail = slow if slow is not dummy else None
        slow.next = slow.next.next
        self.head = dummy.next
        self.size -= 1


# ============================================================================
# Cycle detection (Floyd's tortoise and hare)
# ============================================================================
def has_cycle(head: Optional[Node]) -> bool:
    """O(n) time, O(1) space. A set of seen nodes also works but costs O(n)."""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next        # type: ignore[union-attr]
        fast = fast.next.next
        if slow is fast:        # identity, not equality
            return True
    return False


def cycle_start(head: Optional[Node]) -> Optional[Node]:
    """First node of the cycle, or None.

    Why it works: let L be the distance from head to the cycle entry and C the
    cycle length. When the pointers meet, the meeting point is exactly L steps
    away from the entry (mod C). So walking one pointer from the head and one
    from the meeting point, both at speed 1, they collide at the entry.
    """
    slow = fast = head
    while fast and fast.next:
        slow = slow.next        # type: ignore[union-attr]
        fast = fast.next.next
        if slow is fast:
            walker = head
            while walker is not slow:
                walker = walker.next    # type: ignore[union-attr]
                slow = slow.next        # type: ignore[union-attr]
            return walker
    return None


# ============================================================================
# Merging
# ============================================================================
def merge_sorted(a: Optional[Node], b: Optional[Node]) -> Optional[Node]:
    """Merge two sorted lists by splicing nodes. O(n + m) time, O(1) space.

    No new nodes are allocated - only `next` pointers are rewritten.
    """
    dummy = Node(0)
    tail = dummy
    while a and b:
        if a.val <= b.val:      # <= keeps the merge stable
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b          # attach whatever remains, in one step
    return dummy.next


# ============================================================================
# Doubly linked list
# ============================================================================
class DNode:
    __slots__ = ("val", "prev", "next")

    def __init__(self, val: int) -> None:
        self.val = val
        self.prev: Optional["DNode"] = None
        self.next: Optional["DNode"] = None

    def __repr__(self) -> str:
        return f"DNode({self.val})"


class DoublyLinkedList:
    """The `prev` pointer buys O(1) deletion when you already hold the node.

    That is exactly what an LRU cache needs, and why `collections.deque` and
    every LRU implementation are built on this.
    """

    def __init__(self) -> None:
        self.head: Optional[DNode] = None
        self.tail: Optional[DNode] = None
        self.size = 0

    def push_back(self, val: int) -> DNode:
        node = DNode(val)
        if self.tail is None:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node
        self.size += 1
        return node

    def push_front(self, val: int) -> DNode:
        node = DNode(val)
        if self.head is None:
            self.head = self.tail = node
        else:
            node.next = self.head
            self.head.prev = node
            self.head = node
        self.size += 1
        return node

    def delete_node(self, node: DNode) -> None:
        """O(1) - no traversal needed, which the singly linked list cannot do."""
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next
        if node.next:
            node.next.prev = node.prev
        else:
            self.tail = node.prev
        node.prev = node.next = None
        self.size -= 1

    def to_list(self) -> list[int]:
        out, node = [], self.head
        while node:
            out.append(node.val)
            node = node.next
        return out

    def to_list_reverse(self) -> list[int]:
        out, node = [], self.tail
        while node:
            out.append(node.val)
            node = node.prev
        return out


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    ll = SinglyLinkedList([1, 2, 3])
    assert ll.to_list() == [1, 2, 3] and len(ll) == 3
    ll.push_front(0)
    ll.push_back(4)
    assert ll.to_list() == [0, 1, 2, 3, 4]
    assert ll.tail is not None and ll.tail.val == 4

    ll.insert_at(2, 99)
    assert ll.to_list() == [0, 1, 99, 2, 3, 4]
    assert ll.delete_at(2) == 99
    assert ll.to_list() == [0, 1, 2, 3, 4]

    assert ll.search(3) == 3 and ll.search(42) == -1

    assert ll.remove_value(0) and ll.to_list() == [1, 2, 3, 4]
    assert not ll.remove_value(42)

    ll.reverse()
    assert ll.to_list() == [4, 3, 2, 1]
    ll.reverse_recursive()
    assert ll.to_list() == [1, 2, 3, 4]
    assert ll.tail is not None and ll.tail.val == 4   # tail stays correct
    ll.push_back(5)
    assert ll.to_list() == [1, 2, 3, 4, 5]

    assert SinglyLinkedList([1, 2, 3]).middle() == 2
    assert SinglyLinkedList([1, 2, 3, 4]).middle() == 3   # second middle
    assert SinglyLinkedList().middle() is None

    nth = SinglyLinkedList([1, 2, 3, 4, 5])
    nth.remove_nth_from_end(2)
    assert nth.to_list() == [1, 2, 3, 5]
    nth.remove_nth_from_end(4)                            # removes the head
    assert nth.to_list() == [2, 3, 5]

    # Cycle detection: build 1 -> 2 -> 3 -> 4 -> back to 2
    n1, n2, n3, n4 = Node(1), Node(2), Node(3), Node(4)
    n1.next, n2.next, n3.next, n4.next = n2, n3, n4, n2
    assert has_cycle(n1) and cycle_start(n1) is n2
    straight = Node(1, Node(2))
    assert not has_cycle(straight) and cycle_start(straight) is None
    assert not has_cycle(None)

    a = SinglyLinkedList([1, 3, 5]).head
    b = SinglyLinkedList([2, 4]).head
    merged = merge_sorted(a, b)
    out = []
    while merged:
        out.append(merged.val)
        merged = merged.next
    assert out == [1, 2, 3, 4, 5]

    dll = DoublyLinkedList()
    dll.push_back(2)
    middle = dll.push_back(3)
    dll.push_back(4)
    dll.push_front(1)
    assert dll.to_list() == [1, 2, 3, 4]
    assert dll.to_list_reverse() == [4, 3, 2, 1]
    dll.delete_node(middle)                    # O(1), no search
    assert dll.to_list() == [1, 2, 4] and dll.size == 3
    assert dll.to_list_reverse() == [4, 2, 1]

    print("05-Linked-List (Python): all checks passed")


if __name__ == "__main__":
    demo()
