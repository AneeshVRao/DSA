"""
12 - Binary Search Tree: the full structure plus the problems whose solutions
exist only because of the ordering invariant.

Run:  python bst.py
"""

from __future__ import annotations

import bisect
import math
import random
from typing import Optional, Sequence


# ============================================================================
# Node
# ============================================================================
class TreeNode:
    __slots__ = ("val", "left", "right")

    def __init__(self, val: int) -> None:
        self.val = val
        self.left: Optional["TreeNode"] = None
        self.right: Optional["TreeNode"] = None

    def __repr__(self) -> str:
        return f"TreeNode({self.val})"


# ============================================================================
# 1. The BST itself
# ============================================================================
class BST:
    """Every operation is O(h). Balanced h = log n; sorted input gives h = n."""

    def __init__(self, values: Sequence[int] = ()) -> None:
        self.root: Optional[TreeNode] = None
        self._size = 0
        for v in values:
            self.insert(v)

    def __len__(self) -> int:
        return self._size

    # ------------------------------------------------------------- insertion
    def insert(self, val: int) -> bool:
        """Insert unless the value is already present. O(h).

        Iterative rather than recursive so it cannot blow the stack on a
        degenerate tree - which is exactly what sorted input produces.
        """
        if self.root is None:
            self.root = TreeNode(val)
            self._size += 1
            return True

        node = self.root
        while True:
            if val == node.val:
                return False                     # no duplicates in this BST
            if val < node.val:
                if node.left is None:
                    node.left = TreeNode(val)
                    self._size += 1
                    return True
                node = node.left
            else:
                if node.right is None:
                    node.right = TreeNode(val)
                    self._size += 1
                    return True
                node = node.right

    # ---------------------------------------------------------------- search
    def search(self, val: int) -> Optional[TreeNode]:
        """O(h). Each comparison discards an entire subtree."""
        node = self.root
        while node:
            if val == node.val:
                return node
            node = node.left if val < node.val else node.right
        return None

    def __contains__(self, val: int) -> bool:
        return self.search(val) is not None

    # -------------------------------------------------------------- min /max
    def min_value(self) -> Optional[int]:
        """Leftmost node. O(h)."""
        if self.root is None:
            return None
        node = self.root
        while node.left:
            node = node.left
        return node.val

    def max_value(self) -> Optional[int]:
        """Rightmost node. O(h)."""
        if self.root is None:
            return None
        node = self.root
        while node.right:
            node = node.right
        return node.val

    # -------------------------------------------------------------- deletion
    def delete(self, val: int) -> bool:
        """Remove a value. O(h). Three cases - see the README."""
        found = self.search(val) is not None
        self.root = self._delete(self.root, val)
        if found:
            self._size -= 1
        return found

    @staticmethod
    def _delete(node: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if node is None:
            return None
        if val < node.val:
            node.left = BST._delete(node.left, val)
            return node
        if val > node.val:
            node.right = BST._delete(node.right, val)
            return node

        # Found it. Case 1 and 2: zero or one child - splice the child up.
        if node.left is None:
            return node.right
        if node.right is None:
            return node.left

        # Case 3: two children. Copy the inorder successor's value here, then
        # delete the successor from the right subtree. The successor is the
        # leftmost node of that subtree, so it has at most one child - which
        # means the recursion below hits case 1 or 2 immediately.
        successor = node.right
        while successor.left:
            successor = successor.left
        node.val = successor.val
        node.right = BST._delete(node.right, successor.val)
        return node

    # ------------------------------------------------------------ traversals
    def inorder(self) -> list[int]:
        """SORTED output - the defining property of a BST. O(n)."""
        out: list[int] = []
        stack: list[TreeNode] = []
        node = self.root
        while node or stack:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            out.append(node.val)
            node = node.right
        return out

    def height(self) -> int:
        """Edges on the longest root-to-leaf path. Empty tree = -1."""
        def h(node: Optional[TreeNode]) -> int:
            return -1 if node is None else 1 + max(h(node.left), h(node.right))
        return h(self.root)


# ============================================================================
# 2. Validation
# ============================================================================
def is_valid_bst(root: Optional[TreeNode]) -> bool:
    """O(n). Checking only parent-vs-child is the classic wrong answer.

    Every node must fall inside the range inherited from ALL its ancestors,
    so the bounds narrow on the way down.
    """
    def check(node: Optional[TreeNode], low: float, high: float) -> bool:
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return (check(node.left, low, node.val) and
                check(node.right, node.val, high))

    return check(root, float("-inf"), float("inf"))


# ============================================================================
# 3. Order statistics
# ============================================================================
def kth_smallest(root: Optional[TreeNode], k: int) -> Optional[int]:
    """kth smallest value (1-based). O(h + k) - stop as soon as k is reached.

    Uses the iterative inorder walk so it can break early; the recursive
    version would have to visit everything or thread a flag through.
    """
    stack: list[TreeNode] = []
    node = root
    count = 0
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        count += 1
        if count == k:
            return node.val
        node = node.right
    return None


def inorder_successor(root: Optional[TreeNode], target: int) -> Optional[int]:
    """Smallest value strictly greater than target. O(h), no parent pointers.

    Walk down; every time we move LEFT, the node we left is a candidate.
    """
    successor: Optional[int] = None
    node = root
    while node:
        if target < node.val:
            successor = node.val          # candidate: might be beaten deeper
            node = node.left
        else:
            node = node.right             # everything here is too small
    return successor


# ============================================================================
# 4. Searching with the invariant
# ============================================================================
def lca_bst(root: Optional[TreeNode], p: int, q: int) -> Optional[int]:
    """LCA in O(h) with no recursion into both subtrees.

    The first node whose value sits between p and q IS the split point - in a
    generic tree this would take a full O(n) search.
    """
    node = root
    low, high = min(p, q), max(p, q)
    while node:
        if node.val > high:
            node = node.left              # both targets are smaller
        elif node.val < low:
            node = node.right             # both targets are larger
        else:
            return node.val               # low <= node.val <= high: split here
    return None


def floor_value(root: Optional[TreeNode], target: int) -> Optional[int]:
    """Largest value <= target. O(h). One descent, remembering candidates."""
    best: Optional[int] = None
    node = root
    while node:
        if node.val == target:
            return node.val
        if node.val < target:
            best = node.val               # valid, but a bigger one may exist
            node = node.right
        else:
            node = node.left
    return best


def ceil_value(root: Optional[TreeNode], target: int) -> Optional[int]:
    """Smallest value >= target. O(h)."""
    best: Optional[int] = None
    node = root
    while node:
        if node.val == target:
            return node.val
        if node.val > target:
            best = node.val
            node = node.left
        else:
            node = node.right
    return best


def range_sum(root: Optional[TreeNode], low: int, high: int) -> int:
    """Sum of values in [low, high]. Pruning is what makes this fast.

    If a node is below `low`, its whole LEFT subtree is irrelevant; if it is
    above `high`, its whole RIGHT subtree is. A generic tree would need O(n).
    """
    if root is None:
        return 0
    if root.val < low:
        return range_sum(root.right, low, high)      # prune the left subtree
    if root.val > high:
        return range_sum(root.left, low, high)       # prune the right subtree
    return (root.val
            + range_sum(root.left, low, high)
            + range_sum(root.right, low, high))


# ============================================================================
# 5. Construction
# ============================================================================
def sorted_array_to_bst(values: Sequence[int]) -> Optional[TreeNode]:
    """Build a HEIGHT-BALANCED BST from sorted input. O(n).

    Inserting a sorted array one value at a time produces a linked list
    (height n-1). Taking the middle element as the root each time guarantees
    height floor(log2 n).
    """
    def build(lo: int, hi: int) -> Optional[TreeNode]:
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        node = TreeNode(values[mid])
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node

    return build(0, len(values) - 1)


def tree_height(root: Optional[TreeNode]) -> int:
    if root is None:
        return -1
    return 1 + max(tree_height(root.left), tree_height(root.right))


# ============================================================================
# demo
# ============================================================================
# ============================================================================
# 6. AVL - a BST that keeps itself balanced
# ============================================================================
class AVLNode:
    """A BST node that also caches its own subtree height.

    The height has to be STORED, not computed. Recomputing it would make every
    insert O(n); cached, it updates in O(1) as the recursion unwinds.
    """

    __slots__ = ("val", "left", "right", "height")

    def __init__(self, val: int) -> None:
        self.val = val
        self.left: Optional[AVLNode] = None
        self.right: Optional[AVLNode] = None
        self.height = 1                       # a leaf has height 1


class AVLTree:
    """A self-balancing BST. Every operation is O(log n) GUARANTEED.

    THE PROBLEM IT SOLVES. A plain BST is O(log n) only if the data arrives in
    a lucky order. Insert 1, 2, 3, 4, 5 in order and every node becomes a right
    child - the tree degenerates into a linked list and search is O(n). Sorted
    input is not a pathological case, it is the single most common one.

    THE INVARIANT. For every node,

        balance = height(left) - height(right)   is in {-1, 0, +1}

    That single constraint forces height <= 1.44 * log2(n). (Proof sketch: let
    N(h) be the fewest nodes in an AVL tree of height h. Then
    N(h) = 1 + N(h-1) + N(h-2) - the Fibonacci recurrence - so N(h) grows
    exponentially and h is logarithmic in n.)

    THE FOUR CASES. After an insert or delete, one node may reach a balance of
    +/-2. Which rotation fixes it depends on WHERE the offending subtree sits:

        LL  balance > 1,  went left-left    -> rotate right
        RR  balance < -1, went right-right  -> rotate left
        LR  balance > 1,  went left-right   -> rotate left on the child,
                                               then right on the node
        RL  balance < -1, went right-left   -> rotate right on the child,
                                               then left on the node

    LR and RL are not new operations - they are the single rotations applied
    twice. The first one turns the zig-zag into a straight line, and the second
    is then the simple case.

    A rotation is O(1): three pointer writes and two height updates. Only the
    LOWEST unbalanced node needs rotating on insert - one rotation restores the
    whole tree, because it also restores the subtree's original height. Delete
    is the harder case: it can shorten a subtree, so rebalancing may cascade all
    the way to the root, up to O(log n) rotations.

    AVL vs red-black: AVL is more strictly balanced (faster lookups), red-black
    rotates less on write (faster inserts). Which is why C++ std::map, Java
    TreeMap and the Linux kernel all use red-black, while database indexes that
    are read far more than written tend toward AVL.
    """

    def __init__(self) -> None:
        self.root: Optional[AVLNode] = None
        self.size = 0

    # --- the two primitives -------------------------------------------------
    @staticmethod
    def _height(node: Optional[AVLNode]) -> int:
        """Height of a possibly-absent subtree. An empty tree has height 0."""
        return node.height if node else 0

    @classmethod
    def _update_height(cls, node: AVLNode) -> None:
        node.height = 1 + max(cls._height(node.left), cls._height(node.right))

    @classmethod
    def _balance(cls, node: Optional[AVLNode]) -> int:
        """Left height minus right height. Positive means left-heavy."""
        if node is None:
            return 0
        return cls._height(node.left) - cls._height(node.right)

    @classmethod
    def _rotate_right(cls, node: AVLNode) -> AVLNode:
        """Left-heavy fix. O(1).

                node                pivot
               /    \\              /     \\
            pivot    C     ->     A      node
            /   \\                        /    \\
           A     B                      B      C

        B moves from pivot's right to node's left. Every value in B is greater
        than pivot and less than node, so it is legal in either position - which
        is exactly why rotation preserves the BST ordering.

        Update pivot's height AFTER node's: node is now pivot's child, so its
        height must be settled first.
        """
        pivot = node.left
        assert pivot is not None              # the caller checked the balance
        node.left = pivot.right
        pivot.right = node

        cls._update_height(node)              # the lower node first
        cls._update_height(pivot)
        return pivot                          # the new subtree root

    @classmethod
    def _rotate_left(cls, node: AVLNode) -> AVLNode:
        """Right-heavy fix - the exact mirror of _rotate_right. O(1)."""
        pivot = node.right
        assert pivot is not None
        node.right = pivot.left
        pivot.left = node

        cls._update_height(node)
        cls._update_height(pivot)
        return pivot

    @classmethod
    def _rebalance(cls, node: AVLNode) -> AVLNode:
        """Restore the invariant at one node. Returns the new subtree root."""
        cls._update_height(node)
        balance = cls._balance(node)

        if balance > 1:                       # left-heavy
            if cls._balance(node.left) < 0:   # LR: straighten the zig-zag first
                assert node.left is not None
                node.left = cls._rotate_left(node.left)
            return cls._rotate_right(node)    # LL

        if balance < -1:                      # right-heavy
            if cls._balance(node.right) > 0:  # RL: straighten first
                assert node.right is not None
                node.right = cls._rotate_right(node.right)
            return cls._rotate_left(node)     # RR

        return node                           # already balanced

    # --- the public operations ----------------------------------------------
    def insert(self, value: int) -> bool:
        """Insert a value. O(log n) guaranteed. False if already present."""
        inserted = False

        def go(node: Optional[AVLNode]) -> AVLNode:
            nonlocal inserted
            if node is None:
                inserted = True
                return AVLNode(value)
            if value < node.val:
                node.left = go(node.left)
            elif value > node.val:
                node.right = go(node.right)
            else:
                return node                   # duplicate: nothing changes
            return self._rebalance(node)      # unwinding: fix on the way up

        self.root = go(self.root)
        if inserted:
            self.size += 1
        return inserted

    def delete(self, value: int) -> bool:
        """Delete a value. O(log n) guaranteed. False if absent.

        The three BST delete cases are unchanged - what AVL adds is the
        _rebalance call as the recursion unwinds. Unlike insert, deletion can
        shorten a subtree, so a single rotation may not be enough and the fixing
        can cascade all the way to the root.
        """
        removed = False

        def go(node: Optional[AVLNode]) -> Optional[AVLNode]:
            nonlocal removed
            if node is None:
                return None

            if value < node.val:
                node.left = go(node.left)
            elif value > node.val:
                node.right = go(node.right)
            else:
                removed = True
                if node.left is None:         # 0 or 1 child: splice it out
                    return node.right
                if node.right is None:
                    return node.left

                # Two children: replace with the in-order successor (the
                # smallest value on the right), then delete that successor.
                successor = node.right
                while successor.left is not None:
                    successor = successor.left
                node.val = successor.val
                node.right = go_delete_min(node.right)

            return self._rebalance(node)

        def go_delete_min(node: Optional[AVLNode]) -> Optional[AVLNode]:
            """Remove the leftmost node, rebalancing on the way back up."""
            if node is None:
                return None
            if node.left is None:
                return node.right
            node.left = go_delete_min(node.left)
            return self._rebalance(node)

        self.root = go(self.root)
        if removed:
            self.size -= 1
        return removed

    def contains(self, value: int) -> bool:
        """O(log n) guaranteed - the whole point of the structure."""
        node = self.root
        while node is not None:
            if value == node.val:
                return True
            node = node.left if value < node.val else node.right
        return False

    def inorder(self) -> list[int]:
        """Sorted values. O(n)."""
        out: list[int] = []
        stack: list[AVLNode] = []
        node = self.root
        while stack or node:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            out.append(node.val)
            node = node.right
        return out

    def height(self) -> int:
        return self._height(self.root)

    def is_balanced(self) -> bool:
        """Verify the invariant everywhere - used by the tests, not by users."""

        def check(node: Optional[AVLNode]) -> bool:
            if node is None:
                return True
            if abs(self._balance(node)) > 1:
                return False
            # The cached height must also be honest, or the balance is a lie.
            expected = 1 + max(self._height(node.left), self._height(node.right))
            if node.height != expected:
                return False
            return check(node.left) and check(node.right)

        return check(self.root)


# ============================================================================
def demo() -> None:
    #            8
    #          /   \
    #         3     10
    #        / \      \
    #       1   6      14
    #          / \     /
    #         4   7   13
    bst = BST([8, 3, 10, 1, 6, 14, 4, 7, 13])
    assert len(bst) == 9
    assert bst.inorder() == [1, 3, 4, 6, 7, 8, 10, 13, 14]      # sorted

    assert not bst.insert(8)                     # duplicates are rejected
    assert len(bst) == 9

    assert 6 in bst and 5 not in bst
    node = bst.search(6)
    assert node is not None and node.val == 6

    assert bst.min_value() == 1 and bst.max_value() == 14
    assert BST().min_value() is None

    assert is_valid_bst(bst.root)
    # The classic invalid tree: 4 is in the RIGHT subtree of 5 but is smaller.
    bad = TreeNode(5)
    bad.left = TreeNode(1)
    bad.right = TreeNode(7)
    bad.right.left = TreeNode(4)
    assert not is_valid_bst(bad)
    assert is_valid_bst(None) and is_valid_bst(TreeNode(1))

    # Deletion, all three cases, checking the BST stays valid and sorted.
    assert bst.delete(1)                          # leaf
    assert bst.inorder() == [3, 4, 6, 7, 8, 10, 13, 14]
    assert bst.delete(14)                         # one child (13 on the left)
    assert bst.inorder() == [3, 4, 6, 7, 8, 10, 13]
    assert bst.delete(3)                          # two children
    assert bst.inorder() == [4, 6, 7, 8, 10, 13]
    assert is_valid_bst(bst.root)
    assert len(bst) == 6
    assert not bst.delete(999)                    # missing value

    # Deleting the root repeatedly must keep the tree valid.
    drain = BST([5, 3, 8, 2, 4, 7, 9])
    for value in [5, 3, 8, 2, 4, 7, 9]:
        assert drain.delete(value)
        assert is_valid_bst(drain.root)
    assert drain.inorder() == [] and len(drain) == 0

    fresh = BST([8, 3, 10, 1, 6, 14, 4, 7, 13])
    assert kth_smallest(fresh.root, 1) == 1
    assert kth_smallest(fresh.root, 5) == 7
    assert kth_smallest(fresh.root, 9) == 14
    assert kth_smallest(fresh.root, 99) is None

    assert inorder_successor(fresh.root, 7) == 8
    assert inorder_successor(fresh.root, 5) == 6      # target need not exist
    assert inorder_successor(fresh.root, 14) is None  # nothing bigger

    assert lca_bst(fresh.root, 1, 6) == 3
    assert lca_bst(fresh.root, 4, 13) == 8            # they split at the root
    assert lca_bst(fresh.root, 3, 4) == 3             # an ancestor of itself

    assert floor_value(fresh.root, 5) == 4
    assert floor_value(fresh.root, 6) == 6            # exact match
    assert floor_value(fresh.root, 0) is None
    assert ceil_value(fresh.root, 5) == 6
    assert ceil_value(fresh.root, 15) is None

    assert range_sum(fresh.root, 6, 10) == 6 + 7 + 8 + 10
    assert range_sum(fresh.root, 0, 100) == sum(fresh.inorder())
    assert range_sum(fresh.root, 100, 200) == 0

    # Balanced construction: 15 sorted values give height 3, not 14.
    values = list(range(1, 16))
    balanced = sorted_array_to_bst(values)
    assert is_valid_bst(balanced)
    assert tree_height(balanced) == 3                 # log2(16) - 1
    assert BST(values).height() == 14                 # the degenerate case

    # --- AVL -----------------------------------------------------------------
    # The case a plain BST cannot survive: strictly increasing input.
    plain = BST()
    avl = AVLTree()
    for value in range(1, 32):
        plain.insert(value)
        avl.insert(value)

    # Mind the two conventions: tree_height counts EDGES (empty == -1), while
    # AVL caches NODE counts (empty == 0, leaf == 1). Both are standard; mixing
    # them up is a classic off-by-one.
    assert tree_height(plain.root) == 30        # a linked list wearing a hat
    assert avl.height() == 5                    # log2(32) - actually balanced
    assert avl.inorder() == list(range(1, 32))
    assert avl.is_balanced()

    # Each of the four rotation cases, in isolation.
    ll = AVLTree()
    for value in (30, 20, 10):                  # left-left
        ll.insert(value)
    assert ll.root is not None and ll.root.val == 20 and ll.height() == 2

    rr = AVLTree()
    for value in (10, 20, 30):                  # right-right
        rr.insert(value)
    assert rr.root is not None and rr.root.val == 20 and rr.height() == 2

    lr = AVLTree()
    for value in (30, 10, 20):                  # left-right
        lr.insert(value)
    assert lr.root is not None and lr.root.val == 20 and lr.height() == 2

    rl = AVLTree()
    for value in (10, 30, 20):                  # right-left
        rl.insert(value)
    assert rl.root is not None and rl.root.val == 20 and rl.height() == 2

    # Duplicates are rejected, and the size stays honest.
    dup = AVLTree()
    assert dup.insert(5) and not dup.insert(5)
    assert dup.size == 1
    assert not dup.delete(99)                   # absent
    assert dup.delete(5) and dup.size == 0
    assert dup.root is None and dup.inorder() == []

    # Against a sorted list, with the invariant re-checked after EVERY
    # operation - a rotation bug that only shows up mid-sequence would be
    # invisible to an end-state-only test.
    random.seed(12)
    for _ in range(60):
        tree = AVLTree()
        reference: list[int] = []

        for _ in range(80):
            value = random.randint(0, 40)
            if random.random() < 0.65:
                changed = tree.insert(value)
                assert changed == (value not in reference)
                if changed:
                    bisect.insort(reference, value)
            else:
                changed = tree.delete(value)
                assert changed == (value in reference)
                if changed:
                    reference.remove(value)

            # An in-order walk that comes out sorted IS the BST invariant.
            assert tree.inorder() == reference
            assert tree.is_balanced()            # still within +/-1 everywhere
            assert tree.size == len(reference)

            # The height bound AVL promises: h <= 1.44 * log2(n + 2)
            if reference:
                assert tree.height() <= 1.44 * math.log2(len(reference) + 2)

    print("12-Binary-Search-Tree (Python): all checks passed")
    print("  AVL invariant re-verified after every one of 4800 random "
          "insert/delete operations")


if __name__ == "__main__":
    demo()
