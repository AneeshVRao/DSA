# 18 - Trie (JavaScript)

> A `Set` tells you whether a word exists. A trie tells you what could come
> next. That difference is worth a whole data structure.

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

```js
class TrieNode {
  constructor() {
    this.children = new Map();   // char -> TrieNode
    this.isEnd = false;
  }
}
```

Use a `Map`, not an object literal: no prototype keys to worry about
(`"constructor"` is a real word in some dictionaries), `size` is `O(1)`, and
iteration order is insertion order.

---

## 2. Costs

Let `L` be the word length and `n` the number of words.

| Operation | Trie | `Set` |
|-----------|------|-------|
| insert | `O(L)` | `O(L)` |
| search exact | `O(L)` | `O(L)` average |
| **startsWith(prefix)** | **`O(L)`** | **`O(n * L)`** |
| all words with a prefix | `O(L + output)` | `O(n * L)` |
| sorted iteration | DFS in sorted child order | needs a sort |

**That middle row is the whole point.** Exact lookup is no faster than a
`Set`; prefix queries are faster by a factor of `n`.

Notice what is missing from the trie column: `n`. Lookup depends only on the
key length.

---

## 3. Deletion

Unmark `isEnd`, then prune bottom-up **only while a node has no children and
is not the end of another word**. Deleting "car" from a trie that also holds
"cart" must leave the path intact. The recursion returns "may my parent delete
me?", which makes that condition natural to express.

---

## 4. What tries are used for

- **Autocomplete / typeahead** - the canonical case, and very common in
  frontend interviews.
- **Word Search II** - prune a grid branch the moment its prefix is absent.
- **Spell check**, T9, command palettes, routing tables.
- **Maximum XOR pair** - a **bitwise trie** over 32 bits turns `O(n^2)` into
  `O(32n)`.

Compressed variants: **radix tree** (merges single-child chains), **DAWG**
(also merges suffixes), **suffix tree/automaton** (all suffixes of one string).

---

## 5. Memory

Each node is an object plus a `Map` - roughly 100+ bytes even when it holds one
child. For 10^5 words that is real memory. Use a trie when you need prefix
operations; use a `Set` when you only need membership.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `Trie.insert` / `search` / `startsWith` | `O(L)` | `O(L)` per new word |
| `Trie.delete` | `O(L)` | `O(L)` stack |
| `Trie.wordsWithPrefix` | `O(L + output)` | `O(output)` |
| `Trie.longestCommonPrefix` | `O(L)` | `O(1)` |
| `BitwiseTrie.maxXorWith` | `O(32)` | `O(32n)` |

## Run the code

```bash
node trie.js
```
