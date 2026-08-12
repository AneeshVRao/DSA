# 18 - Trie (C++)

> A hash map tells you whether a word exists. A trie tells you what could come
> next - and in C++ you get to choose exactly how the children are stored.

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

`isEnd` distinguishes a stored word from a mere prefix - without it "car"
(a word) and "ca" (on the way to one) look identical.

```cpp
struct TrieNode {
    TrieNode* children[26] = {};     // fixed array: fast, 26 pointers per node
    bool isEnd = false;
};

struct TrieNode {                     // or a map: any alphabet, sparse
    unordered_map<char, TrieNode*> children;
    bool isEnd = false;
};
```

| Children storage | Lookup | Memory per node | Ordered iteration |
|------------------|--------|-----------------|-------------------|
| `TrieNode*[26]` | `O(1)`, no hashing | 208 bytes, mostly null | yes, free |
| `unordered_map` | `O(1)` average | proportional to real children | no |
| `map` | `O(log A)` | proportional | yes |

For lowercase ASCII the fixed array wins on speed; for large or unknown
alphabets the map wins on memory. This chapter uses the array.

---

## 2. Costs

Let `L` be the word length, `n` the number of words.

| Operation | Trie | `unordered_set<string>` |
|-----------|------|-------------------------|
| insert | `O(L)` | `O(L)` |
| search exact | `O(L)` | `O(L)` average |
| **startsWith(prefix)** | **`O(L)`** | **`O(n * L)`** |
| all words with a prefix | `O(L + output)` | `O(n * L)` |
| sorted iteration | free | needs a sort |

**That middle row is the entire reason tries exist.** Exact lookup is no
faster than a hash set; prefix queries are faster by a factor of `n`.

Note what is absent from the trie column: `n`. Lookup depends only on key
length.

---

## 3. Memory ownership

Every `new TrieNode` needs a matching `delete`, and the destructor must free
the whole subtree recursively (a postorder walk - children before parent).
Skipping this leaks the entire structure, which for 10^5 words is tens of MB.

`unique_ptr<TrieNode> children[26]` removes the manual teardown, at the cost
of a recursive destructor that could overflow the stack on pathological input.

---

## 4. Deletion

Unmark `isEnd`, then prune bottom-up **only while a node has no children and
is not the end of another word**. Deleting "car" from a trie that also holds
"cart" must leave the path intact. The recursion returns "may my parent delete
me?", which makes the condition natural to write.

---

## 5. What tries are used for

- **Autocomplete** - the canonical case.
- **Word Search II** - prune a grid branch the moment its prefix is absent.
- **IP routing** - longest-prefix match on binary tries.
- **Maximum XOR pair** - a **bitwise trie** over 32 bits turns `O(n^2)` into
  `O(32n)`.
- Spell check, T9, dictionary compression.

Compressed variants: **radix tree** (merges single-child chains),
**DAWG** (also merges suffixes), **suffix tree/automaton** (all suffixes of one
string).

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `Trie::insert` / `search` / `startsWith` | `O(L)` | `O(L)` per new word |
| `Trie::remove` | `O(L)` | `O(L)` stack |
| `Trie::wordsWithPrefix` | `O(L + output)` | `O(output)` |
| `Trie::longestCommonPrefix` | `O(L)` | `O(1)` |
| `BitwiseTrie::maxXorWith` | `O(32)` | `O(32n)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall trie.cpp -o trie && ./trie
```
