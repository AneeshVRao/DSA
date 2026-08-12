# 17 - Bit Manipulation (C++)

> C++ is where bits are literal. Fixed widths, real overflow, and compiler
> intrinsics that turn popcount into a single instruction.

**At a glance**

| | |
|---|---|
| **What it is** | Integers as sets, and a handful of `O(1)` tricks. |
| **Must know** | `n & (n-1)` clears the lowest set bit, `n & -n` isolates it, XOR cancels pairs. |
| **The one trap** | Signed shifts and fixed widths behave differently in every language. |
| **Reach for it when** | Subsets as masks, "appears once", parity, and state that must fit in one integer. |

---

## 1. The operators

| Operator | Name | Effect | Example (4-bit) |
|----------|------|--------|-----------------|
| `&` | AND | 1 only where both are 1 | `1100 & 1010 = 1000` |
| `\|` | OR | 1 where either is 1 | `1100 \| 1010 = 1110` |
| `^` | XOR | 1 where they DIFFER | `1100 ^ 1010 = 0110` |
| `~` | NOT | flips every bit | `~1100 = 0011` (4-bit) |
| `<<` | left shift | multiply by 2^k | `0011 << 2 = 1100` |
| `>>` | right shift | divide by 2^k | `1100 >> 2 = 0011` |

---

## 2. XOR is the interesting one

```
x ^ 0 = x           x ^ x = 0           x ^ y ^ x = y
```

Commutative, associative, self-inverse. XOR-ing a whole array cancels every
value appearing twice - `O(n)` time, `O(1)` space, no hash set.

---

## 3. The essential idioms

| Goal | Expression |
|------|-----------|
| Is bit i set? | `(n >> i) & 1` |
| Set bit i | `n \| (1 << i)` |
| Clear bit i | `n & ~(1 << i)` |
| Toggle bit i | `n ^ (1 << i)` |
| Clear the lowest set bit | `n & (n - 1)` |
| Isolate the lowest set bit | `n & -n` |
| Power of two? | `n > 0 && (n & (n - 1)) == 0` |
| Is n odd? | `n & 1` |

---

## 4. Compiler intrinsics (GCC/Clang)

```cpp
__builtin_popcount(x)        // set bits in an unsigned int
__builtin_popcountll(x)      // ... in an unsigned long long
__builtin_clz(x)             // leading zeros  (UNDEFINED for x == 0)
__builtin_ctz(x)             // trailing zeros (UNDEFINED for x == 0)
__builtin_parity(x)          // 1 if the popcount is odd
```

C++20 replaces these portably with `<bit>`: `std::popcount`,
`std::countl_zero`, `std::countr_zero`, `std::bit_width`, `std::has_single_bit`.

`31 - __builtin_clz(x)` is `floor(log2(x))` - a common way to size a sparse
table or segment tree.

---

## 5. Fixed width: the traps C++ actually punishes

```cpp
1 << 31           // UB: overflows a signed int. Use 1u << 31 or 1LL << 31.
1 << 40           // UB: shift >= width of int.
-1 >> 1           // implementation-defined before C++20 (arithmetic in practice)
x << -1           // UB
```

- Use `1LL << i` whenever `i` can reach 31 or beyond.
- Shifting by >= the type's width is undefined, not zero.
- `~0u` is `0xFFFFFFFF`; `~0` is `-1`.
- Mixing signed and unsigned in a comparison converts the signed operand -
  `-1 < 1u` is **false**.

---

## 6. Bitmasks as sets

```cpp
for (int mask = 0; mask < (1 << n); mask++)          // all 2^n subsets
    for (int i = 0; i < n; i++)
        if (mask & (1 << i)) { /* i is in this subset */ }

for (int sub = mask; sub; sub = (sub - 1) & mask)    // all submasks
```

| Set operation | Bit expression |
|---------------|----------------|
| add i | `mask \| (1 << i)` |
| remove i | `mask & ~(1 << i)` |
| contains i? | `mask & (1 << i)` |
| union / intersection | `a \| b` / `a & b` |
| size | `__builtin_popcount(mask)` |

`std::bitset<N>` gives you a fixed-size bit array with `count()`, `any()`,
`set()`, `flip()` and `to_string()` - and it packs 8 bits per byte, so
`bitset<10^9>` is 125 MB where `bool[10^9]` is 1 GB.

---

## 7. Complexity

| Function | Time | Space |
|----------|------|-------|
| `countSetBitsKernighan` | `O(popcount)` | `O(1)` |
| `isPowerOfTwo` | `O(1)` | `O(1)` |
| `singleNumber` | `O(n)` | **`O(1)`** |
| `missingNumber` | `O(n)` | `O(1)` |
| `subsetsBitmask` | `O(n * 2^n)` | `O(1)` extra |
| `reverseBits` | `O(32)` | `O(1)` |

## Gray code - one bit at a time

A **Gray code** orders the integers so that **consecutive values differ in
exactly one bit**. Plain binary does not: `3 -> 4` is `011 -> 100`, three bits
flipping at once.

```text
G(n) = n XOR (n >> 1)

n:  0  1  2  3  4  5  6  7
G:  0  1  3  2  6  7  5  4
b: 000 001 011 010 110 111 101 100
        ^   ^   ^   ^   ^   ^   ^     one bit changes each step
```

**Why one xor does it.** Adding 1 to `n` flips a trailing run of 1s to 0s and
the 0 above them to 1. Shifting right by one and xoring lines each bit up with
its neighbour, so the flipped run cancels and only the boundary survives -
exactly one changed bit.

**Inverting it** is a prefix-xor: each binary bit is the xor of all Gray bits at
or above it. Doubling the shift folds the whole prefix in `log(bits)` steps.

The sequence can also be built by **reflection**: take the `bits-1` sequence,
then append its *reverse* with the top bit set. That is why it is formally a
"reflected binary code", and unlike the xor trick it generalises to
non-power-of-two alphabets. The demo checks the two constructions against each
other.

**Why anyone cares:** rotary encoders and ADCs - a misread during a transition
gives a *neighbouring* value rather than a wild one, because only one bit is
ever in flux. Also Karnaugh maps, genetic-algorithm encodings, and generating
subsets so consecutive ones differ by a single element.

---

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall bits.cpp -o bits && ./bits
```

---

[<- 16 Greedy](../16-Greedy/) · [All topics](../../README.md) · [18 Trie ->](../18-Trie/)
