# 17 - Bit Manipulation (Go)

> Go gives you fixed widths, an explicit `math/bits` package, and one operator
> nobody else has: `&^`.

## 1. The operators

| Operator | Name | Effect | Example (4-bit) |
|----------|------|--------|-----------------|
| `&` | AND | 1 only where both are 1 | `1100 & 1010 = 1000` |
| `\|` | OR | 1 where either is 1 | `1100 \| 1010 = 1110` |
| `^` | XOR (binary) | 1 where they DIFFER | `1100 ^ 1010 = 0110` |
| `^` | NOT (unary) | flips every bit | `^5 == -6` |
| `&^` | AND NOT | clear the bits set in the right operand | `1100 &^ 1000 = 0100` |
| `<<` | left shift | multiply by 2^k | `3 << 2 = 12` |
| `>>` | right shift | divide by 2^k (arithmetic on signed) | `12 >> 2 = 3` |

Two Go peculiarities:

- **Unary `^x` is NOT**, not `~` (which does not exist in Go).
- **`&^` (AND NOT)** clears bits in one operation: `n &^ (1 << i)` is the
  idiomatic "clear bit i", instead of `n & ^(1 << i)`.

---

## 2. XOR is the interesting one

```
x ^ 0 = x           x ^ x = 0           x ^ y ^ x = y
```

Commutative, associative, self-inverse. XOR-ing a slice cancels every value
that appears twice - `O(n)` time, `O(1)` space, no map.

---

## 3. The essential idioms

| Goal | Expression |
|------|-----------|
| Is bit i set? | `(n >> i) & 1` |
| Set bit i | `n \| (1 << i)` |
| Clear bit i | `n &^ (1 << i)` |
| Toggle bit i | `n ^ (1 << i)` |
| Clear the lowest set bit | `n & (n - 1)` |
| Isolate the lowest set bit | `n & -n` |
| Power of two? | `n > 0 && n&(n-1) == 0` |
| Is n odd? | `n & 1` |

---

## 4. math/bits

Go ships the intrinsics as a real package, so there is no reason to hand-roll
them in production:

```go
bits.OnesCount(uint(x))        // popcount
bits.OnesCount64(x)
bits.LeadingZeros64(x)
bits.TrailingZeros64(x)        // 64 for x == 0 - defined, unlike C's __builtin_ctz
bits.Len(uint(x))              // bit length: 1 + floor(log2(x)), 0 for x == 0
bits.Reverse32(x)              // reverse all bits
bits.RotateLeft32(x, k)
```

These compile to single CPU instructions where available.

---

## 5. Fixed width and shifts

- `int` is 64-bit on mainstream platforms, so `1 << 40` is fine (unlike JS).
- Shifting by more than the width gives **0** in Go (defined behaviour, not
  UB as in C++).
- Shift counts may be signed since Go 1.13, but a **negative** shift count
  panics at runtime.
- Right-shifting a signed negative value is arithmetic (sign-extending); use
  `uint` when you want a logical shift.

---

## 6. Bitmasks as sets

```go
for mask := 0; mask < 1<<n; mask++ {              // all 2^n subsets
    for i := 0; i < n; i++ {
        if mask&(1<<i) != 0 { /* i is in this subset */ }
    }
}
for sub := mask; ; sub = (sub - 1) & mask { ... } // all submasks
```

| Set operation | Bit expression |
|---------------|----------------|
| add i | `mask \| (1 << i)` |
| remove i | `mask &^ (1 << i)` |
| contains i? | `mask & (1 << i) != 0` |
| union / intersection | `a \| b` / `a & b` |
| difference | `a &^ b` |
| size | `bits.OnesCount(uint(mask))` |

---

## 7. Complexity

| Function | Time | Space |
|----------|------|-------|
| `CountSetBitsKernighan` | `O(popcount)` | `O(1)` |
| `IsPowerOfTwo` | `O(1)` | `O(1)` |
| `SingleNumber` | `O(n)` | **`O(1)`** |
| `MissingNumber` | `O(n)` | `O(1)` |
| `SubsetsBitmask` | `O(n * 2^n)` | `O(1)` extra |
| `ReverseBits` | `O(32)` | `O(1)` |

## Run the code

```bash
go run bits.go
```
