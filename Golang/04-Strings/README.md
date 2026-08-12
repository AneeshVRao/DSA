# 04 - Strings (Go)

> In Go a `string` is an immutable **byte** slice with a length. Indexing gives
> you a byte; ranging gives you a rune. That distinction is the whole chapter.

## 1. Bytes vs runes

```go
s := "héllo"
len(s)            // 6 - BYTES, because é is 2 bytes in UTF-8
s[1]              // 195 - a byte, half of é
[]rune(s)         // ['h','é','l','l','o'] - 5 runes, O(n) conversion
utf8.RuneCountInString(s)   // 5 - without allocating

for i, r := range s {       // i jumps 0,1,3,4,5 - r is a rune (int32)
    fmt.Println(i, string(r))
}
```

| You want | Use |
|----------|-----|
| ASCII work, speed | `[]byte(s)` and `s[i]` |
| real characters | `[]rune(s)` or `for range` |
| character count | `utf8.RuneCountInString(s)` |

For interview problems with ASCII input, `s[i]` is correct and fastest.

---

## 2. Immutability and building

```go
s[0] = 'H'                 // COMPILE ERROR: strings are immutable
b := []byte(s); b[0] = 'H'; s = string(b)   // 2 copies, O(n)

var sb strings.Builder     // the right way to build
sb.Grow(n)                 // pre-allocate if the size is known
sb.WriteString("chunk")
sb.WriteByte('c')
result := sb.String()      // O(1): no final copy, it hands over the buffer
```

`out += part` in a loop is `O(n^2)`. `strings.Builder` is `O(n)`.

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| `s[i]`, `len(s)` | `O(1)` |
| `s[i:j]` | `O(1)` - **shares memory**, no copy |
| `s + t` | `O(n + m)` |
| `[]byte(s)` / `string(b)` | `O(n)` - allocates and copies |
| `strings.Contains` / `Index` | `O(n * m)` worst case |
| `strings.Split` / `Join` | `O(n)` |
| `sb.WriteString` | `O(1)` amortised |

> Slicing a string is free because the result shares the same immutable bytes -
> the opposite of Python, where slicing copies.

---

## 4. The patterns

### a. Two pointers - palindromes, reversal
On `[]byte` for ASCII; on `[]rune` when the input may be Unicode.

### b. Frequency counting - anagrams
`var count [26]int` - a fixed array, comparable with `==` in one expression:
`return countA == countB`.

### c. Sliding window - substrings
Expand `right`, shrink `left` while invalid.

### d. Building - compression
`strings.Builder` every time.

### e. Pattern matching - naive vs KMP
Naive `O(n*m)`; KMP `O(n+m)` with the LPS table. (`strings.Index` uses a tuned
Rabin-Karp / Boyer-Moore hybrid internally.)

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

## 5. The strings package

```go
strings.Contains(s, sub)      strings.HasPrefix(s, p)
strings.Index(s, sub)         strings.LastIndex(s, sub)
strings.Split(s, ",")         strings.Fields(s)      // splits on any whitespace
strings.Join(parts, ", ")     strings.Repeat("ab", 3)
strings.ToLower(s)            strings.TrimSpace(s)
strings.ReplaceAll(s, a, b)   strings.EqualFold(a, b) // case-insensitive ==
strconv.Itoa(42)              strconv.Atoi("42")
```

`strings.Fields` is what you want for word splitting - it collapses runs of
whitespace, unlike `Split(s, " ")`.

---

## 6. Traps

- `len(s)` is bytes. A test with "é" will fail a solution that assumed runes.
- `string(65)` is `"A"`, not `"65"`. Use `strconv.Itoa(65)`.
- Comparing case-insensitively: `strings.EqualFold(a, b)` beats lowering both.
- Concatenating in a loop without `strings.Builder` is the classic Go
  performance bug.
- `for i := 0; i < len(s); i++` iterates bytes; `for i, r := range s` iterates
  runes with byte offsets. Do not mix them up.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `ReverseASCII` / `ReverseUnicode` | `O(n)` | `O(n)` |
| `IsPalindrome` | `O(n)` | `O(1)` |
| `AreAnagrams` | `O(n)` | `O(1)` |
| `FirstUniqueChar` | `O(n)` | `O(1)` |
| `LongestUniqueSubstring` | `O(n)` | `O(1)` |
| `Compress` | `O(n)` | `O(n)` |
| `NaiveSearch` | `O(n * m)` | `O(1)` |
| `KMPSearch` | `O(n + m)` | `O(m)` |
| `RabinKarpSearch` | `O(n + m)` expected | `O(1)` |
| `LongestDuplicateSubstring` | `O(n log n)` expected | `O(n)` |
| `GroupAnagrams` | `O(n * k)` | `O(n * k)` |

## Run the code

```bash
go run strings.go
```
