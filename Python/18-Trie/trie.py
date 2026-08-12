"""
18 - Trie: a prefix tree with insert / search / prefix queries / deletion,
plus autocomplete and a bitwise trie for maximum XOR.

Run:  python trie.py
"""

from __future__ import annotations

from typing import Iterable, Optional


# ============================================================================
# 1. The node
# ============================================================================
class TrieNode:
    """A dict of children keeps the alphabet open and the node sparse.

    `is_end` is what distinguishes a stored word from a mere prefix - without
    it you could not tell "car" (a word) from "ca" (on the way to one).
    """

    __slots__ = ("children", "is_end")

    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end = False


# ============================================================================
# 2. The trie
# ============================================================================
class Trie:
    """Prefix tree. Every operation costs O(L) in the KEY length - never O(n)
    in the number of stored words."""

    def __init__(self, words: Optional[Iterable[str]] = None) -> None:
        self.root = TrieNode()
        self._size = 0
        for word in words or []:
            self.insert(word)

    def __len__(self) -> int:
        return self._size

    # ------------------------------------------------------------- insertion
    def insert(self, word: str) -> bool:
        """Add a word. O(L). Returns False if it was already present.

        Shared prefixes cost nothing extra: only the new suffix allocates.
        """
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        if node.is_end:
            return False
        node.is_end = True
        self._size += 1
        return True

    # ---------------------------------------------------------------- lookup
    def _walk(self, prefix: str) -> Optional[TrieNode]:
        """Follow a prefix; return the node it ends at, or None. O(L)."""
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word: str) -> bool:
        """Is this exact word stored? O(L)."""
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix: str) -> bool:
        """Does any stored word begin with this prefix? O(L).

        THIS is why tries exist: a hash set would need O(n * L) to answer it.
        """
        return self._walk(prefix) is not None

    def __contains__(self, word: str) -> bool:
        return self.search(word)

    # -------------------------------------------------------------- deletion
    def delete(self, word: str) -> bool:
        """Remove a word, pruning nodes that become useless. O(L).

        The recursion returns "may my parent delete me?" - true only when this
        node has no children left AND is not the end of some other word. That
        is what stops deleting "car" from breaking "cart".
        """
        def prune(node: TrieNode, depth: int) -> bool:
            if depth == len(word):
                if not node.is_end:
                    return False            # the word was never stored
                node.is_end = False
                return not node.children    # deletable only if it is a leaf

            ch = word[depth]
            child = node.children.get(ch)
            if child is None:
                return False
            if not prune(child, depth + 1):
                return False

            del node.children[ch]           # the child became useless
            return not node.children and not node.is_end

        if not self.search(word):
            return False
        prune(self.root, 0)
        self._size -= 1
        return True

    # -------------------------------------------------------- prefix queries
    def words_with_prefix(self, prefix: str) -> list[str]:
        """Every stored word starting with `prefix`, in alphabetical order.

        O(L + output). Walk to the prefix node once, then DFS below it -
        sorting the children keys is what makes the output ordered.
        """
        node = self._walk(prefix)
        if node is None:
            return []

        found: list[str] = []

        def collect(current: TrieNode, path: str) -> None:
            if current.is_end:
                found.append(prefix + path)
            for ch in sorted(current.children):
                collect(current.children[ch], path + ch)

        collect(node, "")
        return found

    def autocomplete(self, prefix: str, limit: int = 5) -> list[str]:
        """The canonical trie application: the first `limit` completions."""
        return self.words_with_prefix(prefix)[:limit]

    def longest_common_prefix(self) -> str:
        """Longest prefix shared by ALL stored words. O(L).

        Walk down while there is exactly one child and no word ends here -
        a branch or a word ending means the shared prefix stops.
        """
        prefix: list[str] = []
        node = self.root
        while len(node.children) == 1 and not node.is_end:
            ch = next(iter(node.children))
            prefix.append(ch)
            node = node.children[ch]
        return "".join(prefix)

    def count_words(self) -> int:
        """Count stored words by walking the whole trie. O(nodes).

        Used by the tests to cross-check the maintained size counter.
        """
        def walk(node: TrieNode) -> int:
            return int(node.is_end) + sum(walk(child)
                                          for child in node.children.values())
        return walk(self.root)

    def count_nodes(self) -> int:
        """Total nodes - shows how much prefix sharing saves."""
        def walk(node: TrieNode) -> int:
            return 1 + sum(walk(child) for child in node.children.values())
        return walk(self.root)


# ============================================================================
# 3. Wildcard search - a trie with backtracking
# ============================================================================
class WildcardTrie(Trie):
    """Supports '.' as "any single character" - LeetCode 211.

    A hash set cannot do this at all; the trie turns it into a bounded DFS.
    """

    def search_pattern(self, pattern: str) -> bool:
        """O(L) with no wildcards; up to O(A^wildcards * L) with them."""
        def walk(node: TrieNode, index: int) -> bool:
            if index == len(pattern):
                return node.is_end
            ch = pattern[index]
            if ch == ".":
                return any(walk(child, index + 1)
                           for child in node.children.values())
            child = node.children.get(ch)
            return child is not None and walk(child, index + 1)

        return walk(self.root, 0)


# ============================================================================
# 4. Bitwise trie - maximum XOR pair
# ============================================================================
class BitwiseTrie:
    """A trie over the BITS of integers, most significant first.

    Turns "maximum XOR of any two numbers" from an O(n^2) pairwise scan into
    O(32n): at each bit, greedily walk toward the OPPOSITE bit, because a 1 in
    a higher position beats anything below it.
    """

    BITS = 32

    def __init__(self, numbers: Optional[Iterable[int]] = None) -> None:
        self.root: dict = {}
        for number in numbers or []:
            self.insert(number)

    def insert(self, number: int) -> None:
        """O(32) - constant per number."""
        node = self.root
        for i in range(self.BITS - 1, -1, -1):
            bit = (number >> i) & 1
            node = node.setdefault(bit, {})

    def max_xor_with(self, number: int) -> int:
        """Largest XOR of `number` with any stored value. O(32)."""
        if not self.root:
            raise ValueError("empty trie")
        node = self.root
        best = 0
        for i in range(self.BITS - 1, -1, -1):
            bit = (number >> i) & 1
            wanted = 1 - bit                     # the opposite bit sets this one
            if wanted in node:
                best |= 1 << i
                node = node[wanted]
            else:
                node = node[bit]                 # forced to match
        return best


def max_xor_pair(numbers: list[int]) -> int:
    """Maximum XOR over all pairs. O(32n) instead of O(n^2)."""
    if len(numbers) < 2:
        return 0
    trie = BitwiseTrie()
    trie.insert(numbers[0])
    best = 0
    for number in numbers[1:]:
        best = max(best, trie.max_xor_with(number))
        trie.insert(number)
    return best


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    trie = Trie(["cat", "car", "card", "care", "dog", "do"])
    assert len(trie) == 6
    assert trie.count_words() == 6                      # cross-check

    assert trie.search("cat") and "car" in trie
    assert not trie.search("ca")                        # a prefix is not a word
    assert not trie.search("cats")
    assert trie.starts_with("ca") and trie.starts_with("do")
    assert not trie.starts_with("z")

    assert not trie.insert("cat")                       # already present
    assert len(trie) == 6

    assert trie.words_with_prefix("car") == ["car", "card", "care"]
    assert trie.words_with_prefix("do") == ["do", "dog"]
    assert trie.words_with_prefix("z") == []
    assert trie.words_with_prefix("") == ["car", "card", "care", "cat", "do", "dog"]
    assert trie.autocomplete("car", limit=2) == ["car", "card"]

    # Prefix sharing: 6 words with 20 characters need far fewer than 21 nodes.
    assert trie.count_nodes() < 21

    # Deleting a word that is a PREFIX of another must not break the longer one.
    assert trie.delete("car")
    assert not trie.search("car")
    assert trie.search("card") and trie.search("care")   # still intact
    assert trie.starts_with("car")                       # path still needed
    assert len(trie) == 5 and trie.count_words() == 5

    # Deleting a leaf should actually prune the path.
    nodes_before = trie.count_nodes()
    assert trie.delete("dog")
    assert trie.count_nodes() < nodes_before             # the 'g' node is gone
    assert trie.search("do")                             # its prefix survives
    assert not trie.delete("dog")                        # already gone
    assert not trie.delete("zzz")                        # never existed

    assert Trie(["flower", "flow", "flight"]).longest_common_prefix() == "fl"
    assert Trie(["dog", "car"]).longest_common_prefix() == ""
    assert Trie(["abc"]).longest_common_prefix() == "abc"
    assert Trie().longest_common_prefix() == ""

    wildcard = WildcardTrie(["bad", "dad", "mad"])
    assert wildcard.search_pattern("bad")
    assert not wildcard.search_pattern("pad")
    assert wildcard.search_pattern(".ad")                # any first character
    assert wildcard.search_pattern("b..")
    assert wildcard.search_pattern("...")
    assert not wildcard.search_pattern("....")           # length must match

    assert max_xor_pair([3, 10, 5, 25, 2, 8]) == 28      # 5 ^ 25
    assert max_xor_pair([0]) == 0
    assert max_xor_pair([14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]) == 127
    # Cross-check against brute force on a small case.
    sample = [3, 10, 5, 25, 2, 8]
    brute = max(a ^ b for i, a in enumerate(sample) for b in sample[i + 1:])
    assert max_xor_pair(sample) == brute

    print("18-Trie (Python): all checks passed")


if __name__ == "__main__":
    demo()
