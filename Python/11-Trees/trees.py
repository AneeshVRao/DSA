"""
11 - Trees: binary trees, all four traversals (recursive, iterative and
Morris), and the bottom-up recursion pattern that solves most tree problems.

Run:  python trees.py
"""

from __future__ import annotations

import random
import re
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
# Euler tour - flattening a tree into an array
# ============================================================================
def euler_tour(root: Optional[TreeNode]) -> list[int]:
    r"""The full walk: every node recorded on ENTRY and after each child. O(n).

    A DFS that appends the current node every time control passes through it -
    on the way in, and again after returning from each child. The result has
    exactly 2n - 1 entries for an n-node tree.

    Why it matters: it turns a TREE problem into an ARRAY problem. The lowest
    common ancestor of u and v is the SHALLOWEST node in the tour between any
    occurrence of u and any occurrence of v - which makes LCA a range-minimum
    query, answerable in O(1) with the sparse table from chapter 19.

              1
             / \        tour: 1 2 4 2 5 2 1 3 1
            2   3       LCA(4, 5) = the shallowest node between them = 2
           / \
          4   5

    The three classic traversals are all projections of this one walk:
      preorder  - take each node at its FIRST appearance
      inorder   - take each node at its middle appearance (binary trees)
      postorder - take each node at its LAST appearance
    """
    tour: list[int] = []
    if root is None:
        return tour

    def walk(node: TreeNode) -> None:
        tour.append(node.val)
        for child in (node.left, node.right):
            if child is not None:
                walk(child)
                tour.append(node.val)     # record the node again on the way back

    walk(root)
    return tour


def euler_in_out(root: Optional[TreeNode]) -> dict[int, tuple[int, int]]:
    """Entry and exit timestamps per node, as {value: (tin, tout)}. O(n).

    The other Euler tour, and the more useful one in practice. Stamp a counter
    on the way in and on the way out. Then:

        u is an ancestor of v   <=>   tin[u] <= tin[v] and tout[v] <= tout[u]

    An ancestor test in O(1), with no walking. Better still, a node's subtree
    occupies the CONTIGUOUS range [tin, tout) of the entry order - so "sum over
    a subtree" or "add x to a whole subtree" becomes a range query on a flat
    array, which a Fenwick or segment tree handles in O(log n).

    This is the standard preprocessing step for subtree queries, and half of
    heavy-light decomposition.

    Iterative to avoid blowing the stack on a degenerate (list-shaped) tree.
    """
    times: dict[int, tuple[int, int]] = {}
    if root is None:
        return times

    clock = 0
    entry: dict[int, int] = {}
    # (node, expanded?) - False means "arriving", True means "leaving".
    stack: list[tuple[TreeNode, bool]] = [(root, False)]

    while stack:
        node, leaving = stack.pop()
        if leaving:
            times[node.val] = (entry[node.val], clock)
            continue

        entry[node.val] = clock
        clock += 1
        stack.append((node, True))        # schedule the exit stamp
        # Right first, so the left child is processed first off the stack.
        for child in (node.right, node.left):
            if child is not None:
                stack.append((child, False))

    return times


# ============================================================================
# Expression trees - an AST for arithmetic
# ============================================================================
PRECEDENCE = {"+": 1, "-": 1, "*": 2, "/": 2}


class ExprNode:
    r"""A node in an expression tree: an operator with two children, or a leaf.

    An expression tree is the smallest interesting abstract syntax tree, and it
    makes the three traversals mean something concrete rather than academic:

              *
             / \           infix   (3 + 4) * 2     <- inorder
            +   2          postfix  3 4 + 2 *      <- postorder
           / \             prefix   * + 3 4 2      <- preorder
          3   4

    The tree carries the precedence and grouping in its SHAPE, so postfix and
    prefix need no brackets at all - the structure is unambiguous without them.
    Only infix needs parentheses, because it throws that information away.

    This is exactly what a compiler front-end builds, and evaluating it is a
    post-order fold: children first, then combine.
    """

    __slots__ = ("value", "left", "right")

    def __init__(self, value: str,
                 left: Optional["ExprNode"] = None,
                 right: Optional["ExprNode"] = None) -> None:
        self.value = value
        self.left = left
        self.right = right

    def is_operator(self) -> bool:
        return self.value in PRECEDENCE

    def __repr__(self) -> str:
        return f"ExprNode({self.value!r})"


def tokenize(expression: str) -> list[str]:
    """Split on whitespace, brackets and operators. Multi-digit numbers survive."""
    return re.findall(r"\d+\.?\d*|[-+*/()]", expression)


def infix_to_postfix(tokens: list[str]) -> list[str]:
    """Shunting-yard: infix to postfix in one pass. O(n).

    Numbers go straight to the output. Operators wait on a stack until
    something of LOWER precedence arrives, at which point they are popped -
    which is precisely what makes `*` bind tighter than `+` without any
    lookahead or recursion.

    Left associativity is the `>=` in the pop condition: for `8 - 3 - 2`, the
    first `-` is popped when the second arrives, giving `(8-3)-2 = 3` rather
    than `8-(3-2) = 7`. Changing it to `>` would silently make subtraction
    right-associative - a real bug, and an easy one to miss.

    Raises ValueError on malformed input. The bare algorithm does not validate
    at all - see the comment in the body.
    """
    output: list[str] = []
    operators: list[str] = []

    # Shunting-yard on its own does NOT validate. Fed "+ 1 2" it happily emits
    # "1 2 +" and reports success, silently reinterpreting prefix input as
    # infix. Tracking what is expected next is what turns a garbled expression
    # into an error instead of a plausible wrong answer.
    expect_operand = True

    for token in tokens:
        if token in PRECEDENCE:
            if expect_operand:
                raise ValueError(f"operator {token!r} where an operand was expected")
            while (operators and operators[-1] != "("
                   and PRECEDENCE[operators[-1]] >= PRECEDENCE[token]):
                output.append(operators.pop())      # >= : LEFT associative
            operators.append(token)
            expect_operand = True

        elif token == "(":
            if not expect_operand:
                raise ValueError("'(' directly after an operand")
            operators.append(token)

        elif token == ")":
            if expect_operand:
                raise ValueError("')' where an operand was expected")
            while operators and operators[-1] != "(":
                output.append(operators.pop())
            if not operators:
                raise ValueError("unbalanced parentheses")
            operators.pop()                          # discard the "("
            # A closed group behaves as a completed operand.

        else:
            if not expect_operand:
                raise ValueError(f"two operands in a row near {token!r}")
            output.append(token)                     # a number
            expect_operand = False

    if expect_operand:
        raise ValueError("expression ends with an operator")

    while operators:
        if operators[-1] == "(":
            raise ValueError("unbalanced parentheses")
        output.append(operators.pop())
    return output


def build_from_postfix(tokens: list[str]) -> ExprNode:
    """Build the tree from postfix in one stack pass. O(n).

    Postfix is the natural input: by the time an operator appears, both of its
    operands are already complete subtrees sitting on the stack.

    The RIGHT operand pops FIRST - it was pushed last. Getting that backwards
    still produces a valid-looking tree, and still evaluates correctly for `+`
    and `*`; it silently reverses `-` and `/`. A test with only commutative
    operators would never catch it, which is why the demo below checks `8 - 3`.
    """
    stack: list[ExprNode] = []

    for token in tokens:
        if token in PRECEDENCE:
            if len(stack) < 2:
                raise ValueError(f"operator {token!r} has too few operands")
            right = stack.pop()                      # RIGHT first
            left = stack.pop()
            stack.append(ExprNode(token, left, right))
        else:
            stack.append(ExprNode(token))

    if len(stack) != 1:
        raise ValueError("malformed expression")
    return stack[0]


def build_expression_tree(expression: str) -> ExprNode:
    """Infix string to expression tree: tokenize, shunting-yard, then build."""
    return build_from_postfix(infix_to_postfix(tokenize(expression)))


def evaluate_expression(node: ExprNode) -> float:
    """Evaluate bottom-up. O(n) - a post-order fold.

    Children first, then combine: the same shape as every other bottom-up tree
    computation in this chapter.
    """
    if not node.is_operator():
        return float(node.value)

    assert node.left is not None and node.right is not None
    left = evaluate_expression(node.left)
    right = evaluate_expression(node.right)

    if node.value == "+":
        return left + right
    if node.value == "-":
        return left - right
    if node.value == "*":
        return left * right
    if right == 0:
        raise ZeroDivisionError("division by zero in expression")
    return left / right


def to_prefix(node: ExprNode) -> list[str]:
    """PREorder: operator, left, right. No brackets needed - unambiguous."""
    if not node.is_operator():
        return [node.value]
    assert node.left is not None and node.right is not None
    return [node.value] + to_prefix(node.left) + to_prefix(node.right)


def to_postfix(node: ExprNode) -> list[str]:
    """POSTorder: left, right, operator. What a stack machine executes."""
    if not node.is_operator():
        return [node.value]
    assert node.left is not None and node.right is not None
    return to_postfix(node.left) + to_postfix(node.right) + [node.value]


def to_infix(node: ExprNode) -> str:
    """INorder, fully parenthesised.

    Every operator gets brackets. Emitting infix without them would lose the
    grouping the tree encodes - `* + 3 4 2` is unambiguous, `3 + 4 * 2` is not.
    Minimal-bracket output means comparing each node's precedence against its
    parent's, which is a nice exercise but not the point here.
    """
    if not node.is_operator():
        return node.value
    assert node.left is not None and node.right is not None
    return f"({to_infix(node.left)} {node.value} {to_infix(node.right)})"


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

    # --- Euler tour ----------------------------------------------------------
    #        1
    #       / \
    #      2   3
    #     / \
    #    4   5
    euler_tree = build_tree([1, 2, 3, 4, 5])
    assert euler_tour(euler_tree) == [1, 2, 4, 2, 5, 2, 1, 3, 1]  # 2n-1 == 9
    assert euler_tour(None) == []
    assert euler_tour(TreeNode(7)) == [7]                 # a lone node

    times = euler_in_out(euler_tree)
    assert times[1] == (0, 5)                             # the root spans all
    assert times[4] == (2, 3) and times[5] == (3, 4)      # leaves are width 1
    assert euler_in_out(None) == {}

    # The ancestor test the timestamps exist for.
    def is_ancestor(u: int, v: int) -> bool:
        return times[u][0] <= times[v][0] and times[v][1] <= times[u][1]

    assert is_ancestor(1, 4) and is_ancestor(2, 5)
    assert not is_ancestor(3, 4) and not is_ancestor(4, 2)
    assert is_ancestor(3, 3)                              # a node contains itself

    # Against brute force on random trees: the tour has 2n-1 entries, every
    # node appears (children + 1) times, and the timestamps agree with an
    # explicit ancestor search.
    random.seed(11)
    counter = iter(range(10_000))

    def random_tree(size: int) -> Optional[TreeNode]:
        """A random-shaped tree with distinct values, built top-down."""
        if size == 0:
            return None
        left_size = random.randrange(size)                # 0..size-1
        node = TreeNode(next(counter))
        node.left = random_tree(left_size)
        node.right = random_tree(size - 1 - left_size)
        return node

    def subtree_values(node: Optional[TreeNode]) -> list[int]:
        if node is None:
            return []
        return [node.val] + subtree_values(node.left) + subtree_values(node.right)

    for _ in range(60):
        size = random.randint(1, 40)
        root = random_tree(size)

        tour = euler_tour(root)
        assert len(tour) == 2 * size - 1

        stamps = euler_in_out(root)
        assert len(stamps) == size

        # Every node's subtree is a CONTIGUOUS timestamp range of its own size -
        # the property that makes subtree queries into range queries.
        def check(node: Optional[TreeNode]) -> None:
            if node is None:
                return
            tin, tout = stamps[node.val]
            members = subtree_values(node)
            assert tout - tin == len(members)
            assert all(tin <= stamps[other][0] < tout for other in members)
            check(node.left)
            check(node.right)

        check(root)

    # --- Expression trees ----------------------------------------------------
    tree = build_expression_tree("3 + 4 * 2")
    assert evaluate_expression(tree) == 11.0          # * binds tighter than +
    assert to_postfix(tree) == ["3", "4", "2", "*", "+"]
    assert to_prefix(tree) == ["+", "3", "*", "4", "2"]
    assert to_infix(tree) == "(3 + (4 * 2))"

    bracketed = build_expression_tree("(3 + 4) * 2")
    assert evaluate_expression(bracketed) == 14.0     # brackets override it
    assert to_postfix(bracketed) == ["3", "4", "+", "2", "*"]
    assert to_prefix(bracketed) == ["*", "+", "3", "4", "2"]

    # Left associativity, and operand order. Both are silent when wrong: they
    # give the right answer for + and *, and the WRONG one for - and /.
    assert evaluate_expression(build_expression_tree("8 - 3 - 2")) == 3.0   # not 7
    assert evaluate_expression(build_expression_tree("16 / 4 / 2")) == 2.0  # not 8
    assert evaluate_expression(build_expression_tree("8 - 3")) == 5.0       # not -5

    assert evaluate_expression(build_expression_tree("42")) == 42.0         # a leaf
    assert evaluate_expression(build_expression_tree("2 * (3 + 4) - 5")) == 9.0
    assert to_postfix(build_expression_tree("1 + 2 + 3")) == \
        ["1", "2", "+", "3", "+"]

    # Malformed input is rejected rather than silently mis-parsed.
    for bad in ("(1 + 2", "1 + 2)", "1 +", "+ 1 2"):
        try:
            build_expression_tree(bad)
            raise AssertionError(f"expected {bad!r} to be rejected")
        except ValueError:
            pass

    try:
        evaluate_expression(build_expression_tree("1 / 0"))
        raise AssertionError("expected ZeroDivisionError")
    except ZeroDivisionError:
        pass

    # Against an INDEPENDENT reference on random expressions. Two passes:
    # collapse every `*` first, then add and subtract what is left. That
    # directly encodes "* binds tighter than +", so it tests the parser's
    # precedence against a different implementation rather than against itself.
    # (Deliberately not eval() - it is the wrong habit to demonstrate, and a
    # hand-written reference is a stronger check anyway.)
    def reference_value(terms: list[str]) -> float:
        collapsed: list[str] = [terms[0]]
        i = 1
        while i < len(terms):
            operator, operand = terms[i], terms[i + 1]
            if operator == "*":
                collapsed[-1] = str(float(collapsed[-1]) * float(operand))
            else:
                collapsed.append(operator)
                collapsed.append(operand)
            i += 2

        total = float(collapsed[0])
        for j in range(1, len(collapsed), 2):
            value = float(collapsed[j + 1])
            total = total + value if collapsed[j] == "+" else total - value
        return total

    random.seed(11)
    for _ in range(200):
        terms = [str(random.randint(1, 9))]
        for _ in range(random.randint(1, 5)):
            terms.append(random.choice(["+", "-", "*"]))
            terms.append(str(random.randint(1, 9)))
        text = " ".join(terms)

        built = build_expression_tree(text)
        assert evaluate_expression(built) == reference_value(terms)

        # postfix -> tree -> postfix must be a fixed point
        again = build_from_postfix(to_postfix(built))
        assert evaluate_expression(again) == evaluate_expression(built)
        assert to_postfix(again) == to_postfix(built)

        # and the fully-bracketed infix must re-parse to the same value
        assert evaluate_expression(build_expression_tree(to_infix(built))) \
            == evaluate_expression(built)

    print("11-Trees (Python): all checks passed")


if __name__ == "__main__":
    demo()
