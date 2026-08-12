# 04 - Strings (Python)

> A string is an immutable array of characters. Both halves of that sentence
> cost you something.

**At a glance**

| | |
|---|---|
| **What it is** | Arrays, plus immutability and character encoding. |
| **Must know** | Concatenating in a loop is `O(n^2)`; collect into a list and join once. |
| **The one trap** | Assuming one character is one byte. It is not, outside ASCII. |
| **Reach for it when** | Palindromes, anagrams, substring search, prefix/suffix work. |

---

## 1. Immutability

Every "modification" builds a brand new string:

```python
s = "abc"
s += "d"        # allocates a NEW 4-char string and copies the old 3
```

Do that in a loop over `n` characters and you copy 1 + 2 + ... + n characters:
`O(n^2)`. The fix is always the same - collect into a list, then join once:

```python
parts = []
for ch in text:
    parts.append(transform(ch))
result = "".join(parts)          # O(n) total
```

Immutability does buy you something: strings are hashable, so they work as
`dict` keys and `set` members.

---

## 2. What a Python string actually holds

Python 3 strings are sequences of **Unicode code points**, not bytes.

```python
len("café")   # 5 - 'e' plus a combining accent
"é" == "é"   # False - same glyph, different code points
ord("A"), chr(65)       # 65, 'A'
"abc".encode("utf-8")   # b'abc' - bytes, for I/O
```

For interview problems assume ASCII unless told otherwise; a
`[0] * 26` frequency array is then valid and faster than a dict.

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| `s[i]` | `O(1)` |
| `len(s)` | `O(1)` |
| `s + t` | `O(n + m)` - new allocation |
| `s[i:j]` | `O(j - i)` - copies |
| `"".join(parts)` | `O(total length)` |
| `s.find(t)` / `t in s` | `O(n * m)` worst case |
| `s.split()` / `s.replace()` | `O(n)` |
| `sorted(s)` | `O(n log n)` |
| `s.lower()`, `s.strip()` | `O(n)`, new string |

---

## 4. The patterns

### a. Two pointers - palindromes, reversal
Walk from both ends inward. Skipping non-alphanumerics inside the loop handles
"valid palindrome" style problems without building a cleaned copy.

### b. Frequency counting - anagrams
Two strings are anagrams iff their character counts match: `O(n)` with a
`Counter` or a 26-slot list, versus `O(n log n)` if you sort.

### c. Sliding window - substrings
"Longest substring with at most k distinct characters", "minimum window
substring": expand right, shrink left while the window is invalid.

### d. Building - run-length encoding, compression
Accumulate into a list, join at the end.

### e. Pattern matching - naive vs KMP
Naive is `O(n * m)`. KMP precomputes a failure table so the text pointer never
moves backwards: `O(n + m)`. The table entry `lps[i]` is the length of the
longest proper prefix of `pat[:i+1]` that is also a suffix of it.

### f. Rabin-Karp - the rolling hash

A different bargain from KMP. Hash the pattern once, slide a window over the
text keeping its hash in `O(1)` per step, and only compare characters when the
hashes agree.

```text
hash("abc") = (a*B^2 + b*B^1 + c*B^0) mod M

roll one step:  new = (old - leading * B^(m-1)) * B + trailing   (mod M)
```

Precomputing `B^(m-1)` is what makes the roll constant time.

> **The verification is not optional.** Two different strings can share a hash.
> On a hash match the characters must still be compared. A hash equality is a
> *cheap filter*, never a proof - skip that step and the function silently
> returns wrong answers.

Expected `O(n + m)`, worst case `O(n * m)` under engineered collisions. So why
use it when KMP is worst-case linear? Because the rolling hash **generalises**
where KMP does not:

| Task | Why Rabin-Karp |
|------|----------------|
| Search for many patterns at once | hash them all into one set, still one pass |
| 2-D pattern matching in a grid | roll horizontally, then vertically |
| **Longest duplicate substring** | binary search the length, hash every window |
| Plagiarism / rsync-style diffing | compare block fingerprints, not blocks |

The longest-duplicate-substring trick is worth knowing on its own: if a repeat
of length `L` exists then so does one of every shorter length, so the answer is
**binary-searchable** - `O(n log n)` overall.


---

## 5. String methods worth memorising

```python
s.strip() / lstrip() / rstrip()
s.split(",") / s.rsplit(",", 1) / s.splitlines()
",".join(parts)
s.startswith(p) / s.endswith(p)
s.find(t)       # -1 if missing
s.index(t)      # raises if missing
s.count(t)
s.replace(a, b)
s.isalnum() / isdigit() / isalpha() / isspace()
s.lower() / upper() / title() / swapcase()
s.zfill(5) / s.ljust(10, ".") / s.center(11)
f"{value:>8.2f}"   # formatting mini-language
```

---

## 6. Traps

- `s[::-1]` reverses but allocates a whole new string (`O(n)` space).
- `s.replace` returns a new string; it does **not** mutate `s`.
- Comparing case-insensitively: use `s.casefold() == t.casefold()`, which is
  stronger than `.lower()` for non-English text.
- `is` on strings sometimes "works" due to interning. It is not equality - use
  `==`.
- Slicing out of range does not raise: `"abc"[5:9] == ""`.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `reverse_string` | `O(n)` | `O(n)` (list) / `O(1)` in place |
| `is_palindrome` | `O(n)` | `O(1)` |
| `are_anagrams` | `O(n)` | `O(1)` - 26 slots |
| `first_unique_char` | `O(n)` | `O(1)` |
| `longest_unique_substring` | `O(n)` | `O(min(n, alphabet))` |
| `compress` (RLE) | `O(n)` | `O(n)` |
| `naive_search` | `O(n * m)` | `O(1)` |
| `kmp_search` | `O(n + m)` | `O(m)` |
| `rabin_karp_search` | `O(n + m)` expected | `O(1)` |
| `longest_duplicate_substring` | `O(n log n)` expected | `O(n)` |
| `group_anagrams` | `O(n * k)` | `O(n * k)` |

## Run the code

```bash
python strings.py
```

---

[<- 03 Arrays](../03-Arrays/) · [All topics](../../README.md) · [05 Linked List ->](../05-Linked-List/)
