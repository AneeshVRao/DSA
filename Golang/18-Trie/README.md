# 18 - Trie (Go)

> A map tells you whether a word exists. A trie tells you what could come next.
> That difference is worth a whole data structure.

## 1. The structure

A trie stores strings by **sharing prefixes**. Each edge is a character; each
root-to-node path is a prefix.

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

`IsEnd` distinguishes a stored word from a mere prefix - without it "car"
(a word) and "ca" (on the way to one) look identical.

```go
type TrieNode struct {
    children [26]*TrieNode      // fixed array: fast, ordered, 26 pointers
    isEnd    bool
}

type TrieNode struct {
    children map[rune]*TrieNode // map: any alphabet, sparse, unordered
    isEnd    bool
}
```

| Children storage | Lookup | Memory per node | Ordered iteration |
|------------------|--------|-----------------|-------------------|
| `[26]*TrieNode` | `O(1)`, no hashing | 208 bytes, mostly nil | yes, free |
| `map[rune]*TrieNode` | `O(1)` average | proportional to real children | no (random order) |

This chapter uses the array: lowercase ASCII, and the alphabetical iteration
comes free - which matters, because Go randomises map iteration order and
autocomplete output must be deterministic.

---

## 2. Costs

Let `L` be the word length and `n` the number of words.

| Operation | Trie | `map[string]struct{}` |
|-----------|------|----------------------|
| insert | `O(L)` | `O(L)` |
| search exact | `O(L)` | `O(L)` average |
| **HasPrefix(prefix)** | **`O(L)`** | **`O(n * L)`** |
| all words with a prefix | `O(L + output)` | `O(n * L)` |
| sorted iteration | free with the array form | needs a sort |

**That middle row is the entire reason tries exist.** Exact lookup is no
faster than a map; prefix queries are faster by a factor of `n`.

Note what is absent from the trie column: `n`. Lookup depends only on key
length.

---

## 3. Deletion

Unmark `isEnd`, then prune bottom-up **only while a node has no children and
is not the end of another word**. Deleting "car" from a trie that also holds
"cart" must leave the path intact. The recursion returns "may my parent delete
me?", which makes the condition natural. Go's GC reclaims the pruned nodes.

---

## 4. What tries are used for

- **Autocomplete / typeahead** - the canonical case.
- **Word Search II** - prune a grid branch the moment its prefix is absent.
- **IP routing** - longest-prefix match on binary tries.
- **Maximum XOR pair** - a **bitwise trie** over 32 bits turns `O(n^2)` into
  `O(32n)`.
- Spell check, T9, command completion.

Compressed variants: **radix tree** (merges single-child chains; Go's own
`net/http` ServeMux-style routers use this idea), **DAWG**, **suffix tree**.

---

## 5. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `Trie.Insert` / `Search` / `HasPrefix` | `O(L)` | `O(L)` per new word |
| `Trie.Delete` | `O(L)` | `O(L)` stack |
| `Trie.WordsWithPrefix` | `O(L + output)` | `O(output)` |
| `Trie.LongestCommonPrefix` | `O(L)` | `O(1)` |
| `BitwiseTrie.MaxXorWith` | `O(32)` | `O(32n)` |

## Run the code

```bash
go run trie.go
```
