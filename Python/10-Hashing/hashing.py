"""
10 - Hashing: a hash map built from scratch (separate chaining + resizing),
plus the six patterns that hashing exists to serve.

Run:  python hashing.py
"""

from __future__ import annotations

from collections import Counter, OrderedDict, defaultdict
from typing import Any, Iterator


# ============================================================================
# 1. A hash map from scratch (separate chaining)
# ============================================================================
class HashMap:
    """Dictionary built on an array of buckets, each holding a chain.

    Real CPython dicts use open addressing, but chaining is easier to reason
    about and shows every moving part: hashing, bucket indexing, collision
    handling, load factor and resizing.
    """

    _INITIAL_CAPACITY = 8
    _MAX_LOAD_FACTOR = 0.75      # resize past this, before chains get long

    def __init__(self) -> None:
        self._buckets: list[list[tuple[Any, Any]]] = [
            [] for _ in range(self._INITIAL_CAPACITY)
        ]
        self._size = 0

    # ------------------------------------------------------------- internals
    def _index(self, key: Any) -> int:
        """Map a key to a bucket. hash() can be negative, so mask it first."""
        return (hash(key) & 0x7FFFFFFF) % len(self._buckets)

    def _resize(self) -> None:
        """Double the capacity and REHASH everything. O(n).

        Rehashing is mandatory: the bucket index depends on the capacity, so
        every key belongs somewhere new after the table grows.
        """
        old_buckets = self._buckets
        self._buckets = [[] for _ in range(len(old_buckets) * 2)]
        self._size = 0
        for chain in old_buckets:
            for key, value in chain:
                self.put(key, value)

    @property
    def load_factor(self) -> float:
        return self._size / len(self._buckets)

    @property
    def capacity(self) -> int:
        return len(self._buckets)

    # ---------------------------------------------------------------- public
    def put(self, key: Any, value: Any) -> None:
        """O(1) average, amortised across the occasional resize."""
        chain = self._buckets[self._index(key)]
        for i, (existing_key, _) in enumerate(chain):
            if existing_key == key:            # equal keys must overwrite
                chain[i] = (key, value)
                return
        chain.append((key, value))
        self._size += 1
        if self.load_factor > self._MAX_LOAD_FACTOR:
            self._resize()

    def get(self, key: Any, default: Any = None) -> Any:
        """O(1) average; O(chain length) in the worst case."""
        for existing_key, value in self._buckets[self._index(key)]:
            if existing_key == key:
                return value
        return default

    def remove(self, key: Any) -> bool:
        """O(1) average. Returns whether the key was present."""
        chain = self._buckets[self._index(key)]
        for i, (existing_key, _) in enumerate(chain):
            if existing_key == key:
                chain.pop(i)
                self._size -= 1
                return True
        return False

    def __contains__(self, key: Any) -> bool:
        return any(k == key for k, _ in self._buckets[self._index(key)])

    def __len__(self) -> int:
        return self._size

    def __iter__(self) -> Iterator[tuple[Any, Any]]:
        for chain in self._buckets:
            yield from chain

    def keys(self) -> list[Any]:
        return [k for k, _ in self]

    def longest_chain(self) -> int:
        """Diagnostic: how badly is this table colliding?"""
        return max((len(chain) for chain in self._buckets), default=0)


class HashSet:
    """A set is a map whose values are ignored - so build it on one."""

    def __init__(self, items: list[Any] | None = None) -> None:
        self._map = HashMap()
        for item in items or []:
            self.add(item)

    def add(self, item: Any) -> None:
        self._map.put(item, True)

    def remove(self, item: Any) -> bool:
        return self._map.remove(item)

    def __contains__(self, item: Any) -> bool:
        return item in self._map

    def __len__(self) -> int:
        return len(self._map)


# ============================================================================
# 2. Frequency map
# ============================================================================
def char_frequency(s: str) -> dict[str, int]:
    """One pass, O(n). defaultdict avoids the "if key not in" boilerplate."""
    freq: dict[str, int] = defaultdict(int)
    for ch in s:
        freq[ch] += 1
    return dict(freq)


def first_unique_char(s: str) -> int:
    """Index of the first non-repeating character, or -1. Two passes, O(n)."""
    freq = Counter(s)
    for i, ch in enumerate(s):
        if freq[ch] == 1:
            return i
    return -1


# ============================================================================
# 3. Complement lookup
# ============================================================================
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Indices of the pair summing to target. O(n) time and space.

    The brute force asks "does x pair with any later element?" (O(n^2)).
    Hashing flips it: "has the complement already been seen?" - O(1) per check.
    """
    seen: dict[int, int] = {}                  # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:
            return seen[target - x], i
        seen[x] = i                            # store AFTER checking: no reuse
    return None


def contains_duplicate(nums: list[int]) -> bool:
    """O(n) with a set, versus O(n log n) by sorting."""
    seen: set[int] = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False


# ============================================================================
# 4. Grouping by a computed key
# ============================================================================
def group_anagrams(words: list[str]) -> list[list[str]]:
    """Group words that are anagrams. O(n * k log k) with a sorted-word key.

    Any function that maps equivalent items to the same value works as a key -
    that is the whole grouping pattern.
    """
    groups: dict[str, list[str]] = defaultdict(list)
    for word in words:
        groups["".join(sorted(word))].append(word)
    return list(groups.values())


# ============================================================================
# 5. Prefix sum + map
# ============================================================================
def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    """Number of contiguous subarrays summing to k. O(n) time and space.

    prefix[j] - prefix[i] == k means the subarray (i, j] sums to k. So at each
    j, count how many earlier prefixes equal prefix[j] - k.

    counts[0] = 1 seeds the empty prefix, which is what makes subarrays that
    start at index 0 count.
    """
    counts: dict[int, int] = defaultdict(int)
    counts[0] = 1
    prefix = total = 0
    for x in nums:
        prefix += x
        total += counts[prefix - k]
        counts[prefix] += 1
    return total


# ============================================================================
# 6. Seen set
# ============================================================================
def longest_consecutive(nums: list[int]) -> int:
    """Longest run of consecutive integers. O(n), NOT O(n log n).

    Only start counting at a number whose predecessor is absent - so each run
    is walked exactly once and the whole thing stays linear despite the inner
    while loop.
    """
    unique = set(nums)
    best = 0
    for x in unique:
        if x - 1 in unique:
            continue                           # not the start of a run
        length = 1
        while x + length in unique:
            length += 1
        best = max(best, length)
    return best


def intersection(a: list[int], b: list[int]) -> list[int]:
    """Common elements. O(n + m) with a set; O(n * m) with `in list`."""
    lookup = set(b)
    return sorted({x for x in a if x in lookup})


# ============================================================================
# 7. Hashing + ordering: an LRU cache
# ============================================================================
class LRUCache:
    """O(1) get and put with a capacity limit.

    Needs both a hash map (O(1) lookup) and an ordering structure (to know
    what is least recently used). OrderedDict is a dict plus a doubly linked
    list, which is exactly that combination.
    """

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._capacity = capacity
        self._data: OrderedDict[Any, Any] = OrderedDict()

    def get(self, key: Any) -> Any:
        if key not in self._data:
            return -1
        self._data.move_to_end(key)            # mark as most recently used
        return self._data[key]

    def put(self, key: Any, value: Any) -> None:
        if key in self._data:
            self._data.move_to_end(key)
        self._data[key] = value
        if len(self._data) > self._capacity:
            self._data.popitem(last=False)     # evict the least recent

    def keys_in_order(self) -> list[Any]:
        """Least recently used first."""
        return list(self._data.keys())


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    m = HashMap()
    m.put("cat", 1)
    m.put("dog", 2)
    m.put("cat", 9)                            # overwrite, not duplicate
    assert len(m) == 2 and m.get("cat") == 9
    assert m.get("missing") is None and m.get("missing", 0) == 0
    assert "dog" in m and "bird" not in m
    assert m.remove("dog") and not m.remove("dog")
    assert len(m) == 1

    # Resizing: insert enough keys to force at least one growth, and check
    # that every key survives the rehash.
    big = HashMap()
    for i in range(100):
        big.put(f"key{i}", i)
    assert len(big) == 100
    assert big.capacity > HashMap._INITIAL_CAPACITY      # it grew
    assert big.load_factor <= HashMap._MAX_LOAD_FACTOR   # and stayed healthy
    assert all(big.get(f"key{i}") == i for i in range(100))
    assert big.longest_chain() <= 5                      # collisions stay tame
    assert sorted(big.keys()) == sorted(f"key{i}" for i in range(100))

    # Tuples are hashable and work as compound keys; lists do not.
    coords = HashMap()
    coords.put((1, 2), "origin-ish")
    assert coords.get((1, 2)) == "origin-ish"

    s = HashSet([1, 2, 2, 3])
    assert len(s) == 3 and 2 in s and 9 not in s
    assert s.remove(2) and 2 not in s

    assert char_frequency("aab") == {"a": 2, "b": 1}
    assert first_unique_char("leetcode") == 0
    assert first_unique_char("aabb") == -1

    assert two_sum([2, 7, 11, 15], 9) == (0, 1)
    assert two_sum([3, 3], 6) == (0, 1)         # duplicates, distinct indices
    assert two_sum([1, 2], 99) is None
    assert contains_duplicate([1, 2, 3, 1])
    assert not contains_duplicate([1, 2, 3])

    groups = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    assert sorted(len(g) for g in groups) == [1, 2, 3]

    assert subarray_sum_equals_k([1, 1, 1], 2) == 2
    assert subarray_sum_equals_k([1, 2, 3], 3) == 2      # [1,2] and [3]
    assert subarray_sum_equals_k([1, -1, 0], 0) == 3     # negatives work too

    assert longest_consecutive([100, 4, 200, 1, 3, 2]) == 4    # 1,2,3,4
    assert longest_consecutive([]) == 0
    assert intersection([1, 2, 2, 1], [2, 2]) == [2]

    lru = LRUCache(2)
    lru.put("a", 1)
    lru.put("b", 2)
    assert lru.get("a") == 1                    # "a" is now the most recent
    lru.put("c", 3)                             # evicts "b", the least recent
    assert lru.get("b") == -1
    assert lru.keys_in_order() == ["a", "c"]

    print("10-Hashing (Python): all checks passed")


if __name__ == "__main__":
    demo()
