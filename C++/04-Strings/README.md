# 04 - Strings (C++)

> `std::string` is a `vector<char>` with extra methods. That is genuinely all
> it is - and it means you already know its cost model.

## 1. std::string basics

```cpp
string s = "hello";
s += " world";              // amortised O(1) per char, like push_back
s.size(); s.length();       // identical, O(1)
s[i]; s.at(i);              // at() is bounds checked
s.substr(pos, len);         // COPIES - O(len)
s.find("lo");               // index, or string::npos
s.c_str();                  // NUL-terminated const char* for C APIs
```

Unlike Python, C++ strings are **mutable**: `s[0] = 'H'` works and is `O(1)`.
Appending is amortised `O(1)`, so building character by character is fine -
call `s.reserve(n)` first if you know the final size.

`string::npos` is `size_t(-1)`, the largest possible `size_t`. Always compare
`find(...) == string::npos`, never `< 0`.

---

## 2. char, bytes and Unicode

`char` is one **byte**. `std::string` is a byte sequence with no encoding
awareness, so a UTF-8 "é" occupies 2 chars and `s.size()` counts bytes, not
glyphs. For interview problems assume ASCII.

```cpp
'a' - 'a' == 0;  'z' - 'a' == 25;      // index into a 26-slot array
isalpha(c); isdigit(c); isalnum(c);    // <cctype>
tolower(c); toupper(c);
c - '0';                               // char digit -> int
to_string(42); stoi("42"); stoll("9999999999");
```

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| `s[i]`, `s.size()` | `O(1)` |
| `s += c` | `O(1)` amortised |
| `s + t` | `O(n + m)` - allocates |
| `s.substr(i, k)` | `O(k)` - allocates |
| `s.find(t)` | `O(n * m)` worst case |
| `s.insert` / `s.erase` (middle) | `O(n)` |
| `sort(s.begin(), s.end())` | `O(n log n)` |
| `string_view` construction | `O(1)` - **no copy** |

> C++17's `string_view` is a non-owning `{pointer, length}` pair. Passing
> `string_view` instead of `const string&` avoids a copy when the caller has a
> `const char*`, and `sv.substr()` is `O(1)`. Never return a `string_view` to
> a temporary - it dangles.

---

## 4. The patterns

### a. Two pointers - palindromes and reversal
Walk inward from both ends, skipping non-alphanumerics in place.

### b. Frequency counting - anagrams
`int count[26] = {0}` is faster than any map and is `O(1)` space.

### c. Sliding window - substrings
Expand `right`, contract `left` while the window is invalid.

### d. Building - compression
Append into one `string` with `reserve`; concatenation in a loop reallocates.

### e. Pattern matching - naive vs KMP
Naive is `O(n * m)`; KMP precomputes an LPS table so the text index never
moves backwards, giving `O(n + m)`.

---

## 5. Splitting and joining (no built-in split!)

```cpp
vector<string> split(const string& s, char delim) {
    vector<string> out;
    string token;
    istringstream stream(s);
    while (getline(stream, token, delim)) out.push_back(token);
    return out;
}
```

Reading whole lines: `getline(cin, line)`. Beware mixing `cin >> x` with
`getline` - the leftover newline needs `cin.ignore()`.

---

## 6. Traps

- `s.substr()` allocates; inside a loop that is a hidden `O(n^2)`.
- Comparing with `==` works for `std::string` but compares **pointers** for
  `char*`. Use `strcmp` or convert.
- `s.size()` is unsigned: `s.size() - 1` underflows on an empty string.
- `tolower` takes an `int` and misbehaves on negative `char` values; cast:
  `tolower((unsigned char)c)`.
- Returning `string_view` to a local `string` is a dangling reference.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `reverseString` | `O(n)` | `O(1)` in place |
| `isPalindrome` | `O(n)` | `O(1)` |
| `areAnagrams` | `O(n)` | `O(1)` |
| `firstUniqueChar` | `O(n)` | `O(1)` |
| `longestUniqueSubstring` | `O(n)` | `O(1)` |
| `compress` | `O(n)` | `O(n)` |
| `naiveSearch` | `O(n * m)` | `O(1)` |
| `kmpSearch` | `O(n + m)` | `O(m)` |
| `groupAnagrams` | `O(n * k)` | `O(n * k)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall strings.cpp -o strings && ./strings
```
