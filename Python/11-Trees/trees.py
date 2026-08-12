"""
11 - Trees: binary trees, all four traversals (recursive, iterative and
Morris), and the bottom-up recursion pattern that solves most tree problems.

Run:  python trees.py
"""

from __future__ import annotations

from collections import deque
from typing import Optional, Sequence


# ============================================================================
# Node and construction
# ============================================================================
class TreeNode:
    __slots__ = ("val", "left", "right")

    def __init__(self, val: int,
                 left: Optional["TreeNode"] = None,
                 right: Optional["TreeNode"] = None) -> None:
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self) -> str:
        return f"TreeNode({self.val})"


def build_tree(values: Sequence[int | None]) -> Optional[TreeNode]:
    """Build a tree from a level-order list where None marks a missing child.

    This is the LeetCode input format, so tests read the same way there.
    """
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])          # type: ignore[arg-type]
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values):
            if values[i] is not None:
                node.left = TreeNode(values[i])     # type: ignore[arg-type]
                queue.append(node.left)
            i += 1
        if i < len(values):
            if values[i] is not None:
                node.right = TreeNode(values[i])    # type: ignore[arg-type]
                queue.append(node.right)
            i += 1
    return root


# ============================================================================
# 1. Depth-first traversals - recursive
# ============================================================================
def preorder(root: Optional[TreeNode]) -> list[int]:
    """node, left, right. O(n) time, O(h) stack. Used to copy/serialise."""
    if root is None:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)


def inorder(root: Optional[TreeNode]) -> list[int]:
    """left, node, right. On a BST this emits values in SORTED order."""
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)


def postorder(root: Optional[TreeNode]) -> list[int]:
    """left, right, node. The shape of every bottom-up computation."""
    if root is None:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]


# ============================================================================
# 2. Depth-first traversals - iterative
# ============================================================================
def preorder_iterative(root: Optional[TreeNode]) -> list[int]:
    """Explicit stack. Push RIGHT first so left is processed first."""
    if root is None:
        return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return out


def inorder_iterative(root: Optional[TreeNode]) -> list[int]:
    """Walk left pushing nodes; pop, visit, then turn right."""
    out: list[int] = []
    stack: list[TreeNode] = []
    node = root
    while node or stack:
        while node:                      # dive as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()               # the leftmost unvisited node
        out.append(node.val)
        node = node.right                # now handle its right subtree
    return out


def postorder_iterative(root: Optional[TreeNode]) -> list[int]:
    """Do preorder as node-right-left, then reverse: left-right-node.

    Far easier to get right than the two-stack or last-visited variants.
    """
    if root is None:
        return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return out[::-1]


def morris_inorder(root: Optional[TreeNode]) -> list[int]:
    """Inorder traversal in O(1) space - no stack, no recursion.

    For each node with a left child, find its inorder predecessor (rightmost
    node of the left subtree) and temporarily point that predecessor's right
    pointer back at the node. Following it later returns us to the node, and
    the thread is then removed. The tree is left exactly as it was found.
    """
    out: list[int] = []
    node = root
    while node:
        if node.left is None:
            out.append(node.val)
            node = node.right
        else:
            predecessor = node.left
            while predecessor.right and predecessor.right is not node:
                predecessor = predecessor.right

            if predecessor.right is None:
                predecessor.right = node          # create the thread
                node = node.left
            else:
                predecessor.right = None          # thread already used: undo it
                out.append(node.val)
                node = node.right
    return out


# ============================================================================
# 3. Breadth-first traversal
# ============================================================================
def level_order(root: Optional[TreeNode]) -> list[list[int]]:
    """One inner list per level. O(n) time, O(w) space (w = widest level).

    Capturing len(queue) BEFORE the inner loop is what separates the levels.
    """
    if root is None:
        return []
    levels: list[list[int]] = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        level: list[int] = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels


def zigzag_level_order(root: Optional[TreeNode]) -> list[list[int]]:
    """Alternate direction per level - reverse the list, not the traversal."""
    levels = level_order(root)
    return [level if i % 2 == 0 else level[::-1] for i, level in enumerate(levels)]


def right_side_view(root: Optional[TreeNode]) -> list[int]:
    """What you see standing to the right: the last node of each level."""
    return [level[-1] for level in level_order(root)]


# ============================================================================
# 4. Bottom-up recursion - the pattern that solves most tree problems
# ============================================================================
def height(root: Optional[TreeNode]) -> int:
    """Edges on the longest downward path. Empty tree = -1, single node = 0."""
    if root is None:
        return -1
    return 1 + max(height(root.left), height(root.right))


def count_nodes(root: Optional[TreeNode]) -> int:
    if root is None:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)


def count_leaves(root: Optional[TreeNode]) -> int:
    if root is None:
        return 0
    if root.left is None and root.right is None:
        return 1
    return count_leaves(root.left) + count_leaves(root.right)


def is_balanced(root: Optional[TreeNode]) -> bool:
    """Every node's subtree heights differ by at most 1. O(n), not O(n^2).

    The trick: return the height AND the verdict from one traversal. Calling
    height() inside a recursion would recompute it at every node - O(n^2).
    """
    def check(node: Optional[TreeNode]) -> tuple[bool, int]:
        if node is None:
            return True, -1
        left_ok, left_h = check(node.left)
        if not left_ok:
            return False, 0                  # short-circuit: stop early
        right_ok, right_h = check(node.right)
        if not right_ok:
            return False, 0
        return abs(left_h - right_h) <= 1, 1 + max(left_h, right_h)

    return check(root)[0]


def diameter(root: Optional[TreeNode]) -> int:
    """Longest path between any two nodes, in edges. O(n).

    The path either passes through a node (left height + right height + 2) or
    lies entirely in one subtree. Track the best while computing heights.
    """
    best = 0

    def depth(node: Optional[TreeNode]) -> int:
        nonlocal best
        if node is None:
            return -1
        left = depth(node.left)
        right = depth(node.right)
        best = max(best, left + right + 2)   # path through this node
        return 1 + max(left, right)

    depth(root)
    return best


def max_path_sum(root: Optional[TreeNode]) -> int:
    """Largest sum of any node-to-node path. O(n).

    A negative branch contributes nothing, so clamp it to 0 - that single
    max(0, ...) is what makes this work with negative values.
    """
    if root is None:
        raise ValueError("empty tree has no path")
    best = float("-inf")

    def gain(node: Optional[TreeNode]) -> int:
        nonlocal best
        if node is None:
            return 0
        left = max(gain(node.left), 0)       # drop negative branches
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right)   # path through this node
        return node.val + max(left, right)   # only ONE branch can go upward

    gain(root)
    return int(best)


# ============================================================================
# 5. Structural operations
# ============================================================================
def invert(root: Optional[TreeNode]) -> Optional[TreeNode]:
    """Mirror the tree in place. O(n)."""
    if root is None:
        return None
    root.left, root.right = invert(root.right), invert(root.left)
    return root


def is_same_tree(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
    if a is None and b is None:
        return True
    if a is None or b is None or a.val != b.val:
        return False
    return is_same_tree(a.left, b.left) and is_same_tree(a.right, b.right)


def is_symmetric(root: Optional[TreeNode]) -> bool:
    """A tree that mirrors itself - compare OUTER with OUTER, inner with inner."""
    def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)

    return root is None or mirror(root.left, root.right)


def lowest_common_ancestor(root: Optional[TreeNode], p: int, q: int) -> Optional[TreeNode]:
    """Deepest node having both p and q as descendants. O(n).

    If p and q are found in different subtrees, this node is the LCA. If both
    come back from the same side, the answer is up there.
    """
    if root is None or root.val == p or root.val == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root                          # p and q split here
    return left or right


# ============================================================================
# 6. Paths
# ============================================================================
def has_path_sum(root: Optional[TreeNode], target: int) -> bool:
    """Is there a root-to-LEAF path summing to target? O(n)."""
    if root is None:
        return False
    if root.left is None and root.right is None:
        return root.val == target
    remaining = target - root.val
    return has_path_sum(root.left, remaining) or has_path_sum(root.right, remaining)


def all_paths(root: Optional[TreeNode]) -> list[list[int]]:
    """Every root-to-leaf path. Classic backtracking: append, recurse, pop."""
    results: list[list[int]] = []
    path: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        path.append(node.val)                       # choose
        if node.left is None and node.right is None:
            results.append(path[:])                 # COPY at the leaf
        else:
            walk(node.left)
            walk(node.right)
        path.pop()                                  # un-choose

    walk(root)
    return results


# ============================================================================
# 7. Serialisation
# ============================================================================
def serialize(root: Optional[TreeNode]) -> str:
    """Preorder with explicit '#' for null - that is what makes it reversible.

    Without null markers, a preorder string alone does not determine the tree.
    """
    parts: list[str] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            parts.append("#")
            return
        parts.append(str(node.val))
        walk(node.left)
        walk(node.right)

    walk(root)
    return ",".join(parts)


def deserialize(data: str) -> Optional[TreeNode]:
    """Rebuild from serialize(). O(n) - the iterator consumes tokens in order."""
    tokens = iter(data.split(","))

    def build() -> Optional[TreeNode]:
        token = next(tokens)
        if token == "#":
            return None
        node = TreeNode(int(token))
        node.left = build()
        node.right = build()
        return node

    return build()


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    #         1
    #       /   \
    #      2     3
    #     / \
    #    4   5
    tree = build_tree([1, 2, 3, 4, 5])

    assert preorder(tree) == [1, 2, 4, 5, 3]
    assert inorder(tree) == [4, 2, 5, 1, 3]
    assert postorder(tree) == [4, 5, 2, 3, 1]

    # Iterative versions must agree with the recursive ones, on every tree.
    for values in ([1, 2, 3, 4, 5], [1], [1, None, 2], [1, 2, None, 3], []):
        t = build_tree(values)
        assert preorder_iterative(t) == preorder(t)
        assert inorder_iterative(t) == inorder(t)
        assert postorder_iterative(t) == postorder(t)
        assert morris_inorder(t) == inorder(t)
        # Morris rewires pointers temporarily; prove it restored the tree.
        assert inorder(t) == inorder(t)

    assert level_order(tree) == [[1], [2, 3], [4, 5]]
    assert zigzag_level_order(tree) == [[1], [3, 2], [4, 5]]
    assert right_side_view(tree) == [1, 3, 5]
    assert level_order(None) == []

    assert height(tree) == 2 and height(None) == -1
    assert height(build_tree([1])) == 0
    assert count_nodes(tree) == 5
    assert count_leaves(tree) == 3            # 4, 5, 3

    assert is_balanced(tree)
    assert is_balanced(None)
    # 1 -> 2 -> 3 chained left: heights 2 and -1 differ by more than 1
    assert not is_balanced(build_tree([1, 2, None, 3]))

    assert diameter(tree) == 3                # 4 -> 2 -> 1 -> 3
    assert diameter(build_tree([1])) == 0

    assert max_path_sum(build_tree([1, 2, 3])) == 6
    assert max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])) == 42

    inverted = invert(build_tree([1, 2, 3, 4, 5]))
    assert level_order(inverted) == [[1], [3, 2], [5, 4]]

    assert is_same_tree(build_tree([1, 2]), build_tree([1, 2]))
    assert not is_same_tree(build_tree([1, 2]), build_tree([1, None, 2]))
    assert is_symmetric(build_tree([1, 2, 2, 3, 4, 4, 3]))
    assert not is_symmetric(build_tree([1, 2, 2, None, 3, None, 3]))

    lca = lowest_common_ancestor(tree, 4, 5)
    assert lca is not None and lca.val == 2
    lca = lowest_common_ancestor(tree, 4, 3)
    assert lca is not None and lca.val == 1   # they split at the root

    assert has_path_sum(tree, 7)              # 1 + 2 + 4
    assert not has_path_sum(tree, 100)
    assert all_paths(tree) == [[1, 2, 4], [1, 2, 5], [1, 3]]

    encoded = serialize(tree)
    assert encoded == "1,2,4,#,#,5,#,#,3,#,#"
    assert preorder(deserialize(encoded)) == preorder(tree)
    assert inorder(deserialize(encoded)) == inorder(tree)
    assert serialize(deserialize(encoded)) == encoded      # round trip
    assert deserialize(serialize(None)) is None

    print("11-Trees (Python): all checks passed")


if __name__ == "__main__":
    demo()
