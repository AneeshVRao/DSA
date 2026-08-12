# 17 - Bit Manipulation (JavaScript)

> JS numbers are 64-bit floats, but **every bitwise operator silently converts
> to 32-bit signed integers**. That one sentence explains every surprise in
> this chapter.

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
| `~` | NOT | flips every bit | `~5 === -6` |
| `<<` | left shift | multiply by 2^k | `3 << 2 === 12` |
| `>>` | arithmetic right shift | keeps the sign | `-8 >> 1 === -4` |
| `>>>` | logical right shift | fills with 0 | `-8 >>> 28 === 15` |

`>>>` is JavaScript-specific and the way to treat a value as **unsigned**.

---

## 2. The 32-bit conversion

```js
2 ** 31 | 0;          // -2147483648  <- wrapped to signed 32-bit
2 ** 32 | 0;          // 0            <- everything above 32 bits is gone
1 << 31;              // -2147483648  (the sign bit)
1 << 32;              // 1            <- shift counts are taken mod 32!
(1 << 31) >>> 0;      // 2147483648   <- read back as unsigned
Number.MAX_SAFE_INTEGER | 0;   // -1  <- silently destroyed
```

Rules that follow:

- Never use bitwise operators on values above 2^31 - 1.
- `x | 0` and `~~x` truncate to a 32-bit int - a fast `Math.trunc` for small
  values, and a silent corrupter for big ones.
- Use `>>> 0` to view a result as unsigned.
- For genuinely large integers use **`BigInt`**, which supports `&`, `|`, `^`,
  `<<`, `>>` with arbitrary precision (but no `>>>`).

---

## 3. XOR is the interesting one

```
x ^ 0 = x           x ^ x = 0           x ^ y ^ x = y
```

Commutative, associative, self-inverse. XOR-ing an array cancels every value
appearing twice - `O(n)` time, `O(1)` space, no `Set`.

---

## 4. The essential idioms

| Goal | Expression |
|------|-----------|
| Is bit i set? | `(n >> i) & 1` |
| Set bit i | `n \| (1 << i)` |
| Clear bit i | `n & ~(1 << i)` |
| Toggle bit i | `n ^ (1 << i)` |
| Clear the lowest set bit | `n & (n - 1)` |
| Isolate the lowest set bit | `n & -n` |
| Power of two? | `n > 0 && (n & (n - 1)) === 0` |
| Is n odd? | `n & 1` |
| Integer halving | `n >> 1` (only below 2^31) |

---

## 5. Bitmasks as sets

```js
for (let mask = 0; mask < 1 << n; mask++) {          // all 2^n subsets
  for (let i = 0; i < n; i++) if (mask & (1 << i)) { /* i is in */ }
}
for (let sub = mask; ; sub = (sub - 1) & mask) { ... }   // all submasks
```

Safe only while `n <= 30` - `1 << 31` is negative. Beyond that, use `BigInt`
or an array of flags.

---

## 6. Complexity

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

## Run the code

```bash
node bits.js
```

---

[<- 16 Greedy](../16-Greedy/) · [All topics](../../README.md) · [18 Trie ->](../18-Trie/)
