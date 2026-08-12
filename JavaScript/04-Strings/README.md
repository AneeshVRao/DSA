# 04 - Strings (JavaScript)

> JS strings are immutable UTF-16 sequences. Both of those words are a source
> of bugs.

## 1. Immutability

```js
let s = "abc";
s[0] = "X";      // silently does nothing
s += "d";        // allocates a NEW string
```

Building character by character in a loop is `O(n^2)` in the worst case.
Collect into an array and `join("")` once - `O(n)`.

Modern engines optimise `+=` with rope structures, so it is often fast in
practice, but `join` is the answer that is always right.

---

## 2. UTF-16: the encoding trap

A JS string is a sequence of 16-bit code units, not characters.

```js
"abc".length;        // 3
"😀".length;         // 2  <- one emoji, two code units (a surrogate pair)
[..."😀"].length;    // 1  <- spread iterates by CODE POINT
"😀".charCodeAt(0);  // 55357 - half a character
"😀".codePointAt(0); // 128512 - the real code point
```

Rules of thumb:
- `s[i]` and `.length` work on **code units**.
- Spread (`[...s]`), `for...of` and `Array.from(s)` iterate **code points**.
- Reversing with `s.split("").reverse().join("")` **breaks emoji**. Use
  `[...s].reverse().join("")` when non-BMP characters are possible.

For interview problems (ASCII input) either form is fine.

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| `s[i]`, `s.length` | `O(1)` |
| `s + t` | `O(n + m)` |
| `s.slice(i, j)` / `substring` | `O(j - i)` |
| `s.split("")` | `O(n)` + allocation |
| `arr.join("")` | `O(total)` |
| `s.includes(t)` / `indexOf` | `O(n * m)` worst case |
| `s.replace` / `replaceAll` | `O(n)` |
| `[...s].sort()` | `O(n log n)` |

---

## 4. The patterns

### a. Two pointers - palindromes, reversal
Walk inward from both ends, skipping characters that do not count.

### b. Frequency counting - anagrams
A `Map`, or a 26-slot array indexed by `ch.charCodeAt(0) - 97`. The array form
is faster and `O(1)` space.

### c. Sliding window - substrings
Expand `right`, shrink `left` while the window is invalid.

### d. Building - compression
Push into an array, `join("")` at the end.

### e. Pattern matching - naive vs KMP
Naive is `O(n * m)`; KMP is `O(n + m)` using the LPS table.

---

## 5. Methods worth memorising

```js
s.trim() / trimStart() / trimEnd()
s.split(",") / s.split(/\s+/)
s.at(-1)                        // last char, ES2022
s.padStart(5, "0") / padEnd()
s.repeat(3)
s.replaceAll("a", "b")          // ES2021, no regex needed
s.localeCompare(t)              // correct sorting for real text
s.match(/\d+/g) / s.matchAll(re)
s.normalize("NFC")              // canonicalise accents before comparing
```

---

## 6. Traps

- `"10" > "9"` is `false` - string comparison is lexicographic.
- `+"12"`, `Number("12")`, `parseInt("12px")` all differ. Know which you want.
- `"a" == 97` does coercion nonsense; always use `===`.
- `s.replace("a", "b")` replaces only the **first** match without a `/g` regex.
- `split("").reverse().join("")` corrupts emoji and combining marks.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `reverseString` | `O(n)` | `O(n)` |
| `isPalindrome` | `O(n)` | `O(1)` |
| `areAnagrams` | `O(n)` | `O(1)` |
| `firstUniqueChar` | `O(n)` | `O(1)` |
| `longestUniqueSubstring` | `O(n)` | `O(min(n, alphabet))` |
| `compress` | `O(n)` | `O(n)` |
| `naiveSearch` | `O(n * m)` | `O(1)` |
| `kmpSearch` | `O(n + m)` | `O(m)` |
| `groupAnagrams` | `O(n * k)` | `O(n * k)` |

## Run the code

```bash
node strings.js
```
