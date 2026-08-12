# 17 - Bit Manipulation (Python)

> Every integer is already a set of flags, a subset, or a tiny array. Bit
> tricks are what happen when you notice.

## 1. The operators

| Operator | Name | Effect | Example (4-bit) |
|----------|------|--------|-----------------|
| `&` | AND | 1 only where both are 1 | `1100 & 1010 = 1000` |
| `\|` | OR | 1 where either is 1 | `1100 \| 1010 = 1110` |
| `^` | XOR | 1 where they DIFFER | `1100 ^ 1010 = 0110` |
| `~` | NOT | flips every bit | `~1100 = ...0011` |
| `<<` | left shift | multiply by 2^k | `0011 << 2 = 1100` |
| `>>` | right shift | floor-divide by 2^k | `1100 >> 2 = 0011` |

---

## 2. XOR is the interesting one

```
x ^ 0 = x           x ^ x = 0           x ^ y ^ x = y
```

XOR is commutative and associative, and every value is its own inverse. So
XOR-ing a whole list cancels every value that appears **twice** and leaves the
one that appears once - in `O(n)` time and `O(1)` space, with no hash set.

That single fact solves "single number", "missing number", "find the
duplicate" and half of the classic bit puzzles.

---

## 3. The essential idioms

| Goal | Expression |
|------|-----------|
| Is bit i set? | `(n >> i) & 1` |
| Set bit i | `n \| (1 << i)` |
| Clear bit i | `n & ~(1 << i)` |
| Toggle bit i | `n ^ (1 << i)` |
| Clear the LOWEST set bit | `n & (n - 1)` |
| Isolate the lowest set bit | `n & -n` |
| Is n a power of two? | `n > 0 and n & (n - 1) == 0` |
| Multiply / divide by 2 | `n << 1` / `n >> 1` |
| Is n odd? | `n & 1` |
| Number of set bits | `bin(n).count("1")` or `int.bit_count()` (3.10+) |

**`n & (n - 1)`** deserves its own line. Subtracting 1 flips the lowest set bit
to 0 and everything below it to 1, so the AND clears exactly that bit. Looping
on it (Brian Kernighan's algorithm) counts set bits in `O(set bits)` instead of
`O(32)`.

**`n & -n`** isolates the lowest set bit, because `-n` is `~n + 1` in two's
complement. It is the core of the Fenwick tree in chapter 19.

---

## 4. Two's complement

Negative numbers are stored as `~x + 1`:

```
 5 = 0000 0101
-5 = 1111 1011      (invert 5, add 1)
```

Consequences: there is one more negative value than positive; `-INT_MIN`
overflows in fixed-width languages; and the sign bit propagates on an
arithmetic right shift.

**Python is different:** its integers are arbitrary precision with an
infinite sign extension, so `~5 == -6` and there is no overflow ever. To
emulate 32-bit behaviour, mask explicitly:

```python
n & 0xFFFFFFFF                 # keep 32 bits
(n & 0xFFFFFFFF) - (1 << 32) if n & 0x80000000 else n   # reinterpret as signed
```

This matters on LeetCode: problems written for Java/C++ semantics need those
masks in Python.

---

## 5. Bitmasks as sets

An integer is a subset of `{0, 1, ..., 30}`:

```python
for mask in range(1 << n):          # all 2^n subsets
    subset = [items[i] for i in range(n) if mask & (1 << i)]
```

| Set operation | Bit expression |
|---------------|----------------|
| add element i | `mask \| (1 << i)` |
| remove element i | `mask & ~(1 << i)` |
| contains i? | `mask & (1 << i)` |
| union / intersection | `a \| b` / `a & b` |
| difference | `a & ~b` |
| size | `bin(mask).count("1")` |
| iterate submasks | `sub = (sub - 1) & mask` |

This is the foundation of **bitmask DP** (travelling salesman, assignment
problems) where the state is "which items have been used".

---

## 6. Complexity

Every operation here is `O(1)` on machine words, or `O(bits)` when looping.
Bit tricks rarely change the complexity class - they change the constant
factor and the space:

| Function | Time | Space |
|----------|------|-------|
| `count_set_bits_kernighan` | `O(set bits)` | `O(1)` |
| `is_power_of_two` | `O(1)` | `O(1)` |
| `single_number` | `O(n)` | **`O(1)`** (a hash set would be `O(n)`) |
| `missing_number` | `O(n)` | `O(1)` |
| `subsets_bitmask` | `O(n * 2^n)` | `O(1)` extra |
| `reverse_bits` | `O(32)` | `O(1)` |

## Run the code

```bash
python bits.py
```
