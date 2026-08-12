# 18 - Trie (Python)

> A hash map tells you whether a word exists. A trie tells you what could come
> next. That difference is worth a whole data structure.

**At a glance**

| | |
|---|---|
| **What it is** | A tree keyed on characters, so shared prefixes are stored exactly once. |
| **Must know** | Lookup is `O(length)` - **independent** of how many words are stored. |
| **The one trap** | Forgetting the end-of-word marker. Without it "car" and "card" are indistinguishable. |
| **Reach for it when** | Prefix queries, autocomplete, wildcard matching, maximum XOR pairs. |

---

## 1. The structure

A trie (prefix tree) stores strings by **sharing their prefixes**. Each edge is
a character; each path from the root is a prefix.

```
        (root)
        /    \
      c       d
      |       |
      a       o
     / \      |
    t   r     g*       "dog"
    *   *
  "cat" "car"
```

The `*` marks `is_end` - without it you could not tell "car" (a stored word)
from "ca" (merely a prefix on the way to one).

```python
class TrieNode:
    def __init__(self):
        self.children: dict[str, TrieNode] = {}
        self.is_end = False
```

A `dict` per node is flexible (any alphabet, sparse). A fixed
`[None] * 26` array is faster and simpler when the input is lowercase ASCII, at
the cost of 26 slots per node.

---

## 2. Costs

Let `L` be the word length, `n` the number of words, `A` the alphabet size.

| Operation | Trie | Hash set |
|-----------|------|----------|
| insert | `O(L)` | `O(L)` (hashing reads the whole key) |
| search exact | `O(L)` | `O(L)` average |
| **starts_with(prefix)** | **`O(L)`** | **`O(n * L)`** - must scan everything |
| all words with a prefix | `O(L + output)` | `O(n * L)` |
| sorted iteration | free (DFS in alphabetical order) | needs a sort |
| space | `O(total characters)`, shared prefixes | `O(total characters)` |

**The trie's whole reason to exist is that middle row.** Exact lookup is not
faster than a hash set - prefix queries are, by a factor of `n`.

Notice what is *absent* from the complexity column: `n`. Lookup time depends
only on the length of the key, not on how many keys are stored.

---

## 3. What tries are actually used for

- **Autocomplete / typeahead** - the canonical use.
- **Spell check** - walk the trie allowing a bounded number of edits.
- **IP routing tables** - longest-prefix match on binary tries.
- **Word games** - Boggle and "Word Search II" prune whole branches the moment
  a prefix does not exist, which is what makes them tractable.
- **Maximum XOR pair** - a **bitwise trie** over the 32 bits of each number
  turns an `O(n^2)` pairwise search into `O(32n)`.
- **T9 / phone keypads**, dictionary compression, and prefix-based sharding.

---

## 4. Deletion

The subtle operation. Removing a word means unmarking `is_end`, then pruning
nodes bottom-up **only while they have no children and are not the end of some
other word**. Deleting "car" from a trie that also holds "cart" must leave the
path intact.

The recursive form returns "may my parent delete me?", which makes the
condition easy to express.

---

## 5. Space, and when NOT to use a trie

Each node carries a dict (or 26 pointers) plus a flag - typically 50-200 bytes.
For 10^5 words averaging 10 characters that is tens of megabytes, versus a few
for a `set`. Use a trie when you need prefix operations; use a `set` when you
only need membership.

Compressed variants exist for exactly this reason:
- **Radix tree (Patricia trie)** - merges single-child chains into one edge.
- **DAWG / DAFSA** - also merges shared *suffixes*, making a graph.
- **Suffix tree / suffix automaton** - all suffixes of one string, for
  substring queries.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `Trie.insert` / `search` / `starts_with` | `O(L)` | `O(L)` per new word |
| `Trie.delete` | `O(L)` | `O(L)` stack |
| `Trie.words_with_prefix` | `O(L + output)` | `O(output)` |
| `Trie.longest_common_prefix` | `O(L)` | `O(1)` |
| `Trie.count_words` | `O(nodes)` | `O(height)` |
| `BitwiseTrie.max_xor` | `O(32)` per query | `O(32n)` |

## Run the code

```bash
python trie.py
```

---

[<- 17 Bit Manipulation](../17-Bit-Manipulation/) · [All topics](../../README.md) · [19 Advanced Topics ->](../19-Advanced-Topics/)
