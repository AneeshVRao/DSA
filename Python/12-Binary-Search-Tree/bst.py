"""
12 - Binary Search Tree: the full structure plus the problems whose solutions
exist only because of the ordering invariant.

Run:  python bst.py
"""

from __future__ import annotations

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

    print("12-Binary-Search-Tree (Python): all checks passed")


if __name__ == "__main__":
    demo()
