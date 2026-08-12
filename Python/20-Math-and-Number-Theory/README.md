# 20 - Math and Number Theory (Python)

> The topic that separates "I can code" from "I can compute". Every other module
> manipulates data; this one manipulates *numbers too large to store*.

The tell is always the same: **the input is a number, not a collection.** When
`n` can be `10^18`, no `O(n)` loop will ever finish - so the answer has to come
from structure (divisibility, congruence, recurrence) rather than iteration.

---

**At a glance**

| | |
|---|---|
| **What it is** | The chapter where the input is a **number**, not a collection. |
| **Must know** | gcd `O(log n)`, binary exponentiation `O(log e)`, and division needs a *modular inverse*. |
| **The one trap** | Forgetting the leftover prime above `sqrt(n)` when factorising. |
| **Reach for it when** | "Answer modulo 1e9+7", primes, divisors, and any `n` up to `10^18`. |

---

## 1. The Euclidean algorithm

The oldest non-trivial algorithm still in use - Euclid, ~300 BC.

```
gcd(a, b) == gcd(b, a mod b)
```

**Why it holds.** Any `d` dividing both `a` and `b` also divides `a - qb`
(which is `a mod b`). Conversely any `d` dividing `b` and `a mod b` divides
`qb + (a mod b) = a`. So the pair `(a, b)` and the pair `(b, a mod b)` have
*exactly the same set of common divisors* - and therefore the same greatest one.
Recursing must terminate because the second argument strictly decreases.

**Complexity: `O(log min(a, b))`.** Two steps at least halve the larger value.
The worst case is consecutive Fibonacci numbers - Lame's theorem, and the reason
`gcd(F(n+1), F(n))` takes exactly `n` steps.

```text
gcd(48, 18):  48 = 2*18 + 12  ->  18 = 1*12 + 6  ->  12 = 2*6 + 0  ->  6
```

`lcm(a, b) = a*b / gcd(a, b)`, because a prime appearing `x` times in `a` and
`y` times in `b` appears `min(x,y)` times in the gcd and `max(x,y)` times in the
lcm - and `min + max == x + y`.

---

## 2. Extended Euclid and Bezout's identity

**Bezout:** for any `a, b` there exist integers `x, y` with

```
a*x + b*y == gcd(a, b)
```

Plain Euclid computes the gcd and throws the coefficients away. The extended
version carries them along: keep a row `(r, s, t)` satisfying the invariant
`a*s + b*t == r`, start from `(a, 1, 0)` and `(b, 0, 1)` - both trivially true -
and apply the same subtraction to all three columns each step.

This is not a curiosity. It is the *only* general way to compute a modular
inverse, and it solves linear Diophantine equations (`ax + by = c` has an
integer solution exactly when `gcd(a,b)` divides `c`).

---

## 3. Modular arithmetic

Answers are asked "modulo `10^9 + 7`" because the true answer would have
millions of digits. The modulus is prime and just under `2^30`, so a product of
two residues fits in 64 bits.

Addition, subtraction and multiplication all distribute over `mod`:

```
(a + b) mod m == ((a mod m) + (b mod m)) mod m
```

**Division does not.** There is no `/` in modular arithmetic. Instead you
multiply by the **modular inverse** - the `x` with `a*x == 1 (mod m)`.

### Binary exponentiation - `O(log e)`

Write the exponent in binary. `13 = 1101b = 8 + 4 + 1`, so `x^13 = x^8 * x^4 * x`.
Walk the bits from the bottom, squaring a running base (`x, x^2, x^4, x^8, ...`)
and multiplying it into the result whenever the bit is set.

This works for **anything associative** - which is why the identical loop
reappears for matrices in section 7.

### Two ways to invert

| Method | Requires | Cost |
|--------|----------|------|
| Extended Euclid | `gcd(a, m) == 1` (any modulus) | `O(log m)` |
| Fermat: `a^(p-2)` | `m` **prime** | `O(log p)` |

Fermat's little theorem says `a^(p-1) == 1 (mod p)` for prime `p`. Divide both
sides by `a` and you get `a^(p-2) == a^-1`. One line - and since the modulus is
almost always `10^9+7`, it is the one everybody writes.

Euler generalises it to composite moduli: `a^phi(m) == 1 (mod m)` whenever
`gcd(a, m) == 1`. That is the theorem RSA rests on.

---

## 4. Primality

| Method | Cost | Use when |
|--------|------|----------|
| Trial division | `O(sqrt n)` | one query, `n` up to ~`10^12` |
| Sieve of Eratosthenes | `O(n log log n)` | **all** primes up to `n` |
| Miller-Rabin | `O(k log^3 n)` | one query, `n` up to `2^64` |

**Trial division** needs only two prunings: stop at `sqrt(n)` (if `n = a*b` with
`a <= b` then `a <= sqrt(n)`), and test only `6k ± 1` (everything else is
divisible by 2 or 3).

**The sieve** inverts the problem. Instead of asking "does anything divide `n`?"
for each `n`, it takes each prime and crosses off its multiples - so composites
are *struck by their factors* rather than searched for. Start crossing off at
`p*p`, because `2p, 3p, ..., (p-1)p` were already struck by smaller primes.

The `log log n` comes from summing `n/p` over primes `p <= n`; that sum grows
like `log log n`, which is below 4 for any `n` that fits in memory.

**Miller-Rabin** is Fermat's test plus one extra fact: modulo a prime, the only
square roots of 1 are `+1` and `-1`. Write `n - 1 = d * 2^s` with `d` odd. For a
prime `n`, the sequence `a^d, a^2d, a^4d, ..., a^(n-1)` must end at 1 and must
*arrive at 1 from -1*. A composite failing that for base `a` is proven composite,
and `a` is called a **witness**. Using the first 12 primes as bases catches every
composite below `3.3 * 10^24` - deterministic across the whole 64-bit range.

### The smallest-prime-factor sieve

A sieve that records *which* prime crossed each number off, not just that one
did. That single extra field drops factorisation from `O(sqrt n)` per query to
`O(log n)` per query - the right structure whenever many numbers in a fixed
range need factorising.

---

## 5. Factorisation and the divisor functions

Trial division works if you divide each candidate out **completely** before
moving on. That is what guarantees every factor found is prime: by the time `i`
is tested, all primes below `i` are gone, so if `i` still divides `n` it has no
smaller prime factor.

> The bug everyone writes: forgetting the leftover. After the loop, any
> remainder above 1 is a prime **larger than `sqrt(n)`**. There is at most one -
> two would multiply past `n`.

Once you have `n = p1^a1 * p2^a2 * ...`, three classic functions fall out of the
same independence argument - a divisor chooses each exponent freely:

| Function | Formula | Meaning |
|----------|---------|---------|
| `d(n)` | `prod (ai + 1)` | count of divisors |
| `sigma(n)` | `prod (p^(ai+1) - 1)/(p - 1)` | sum of divisors |
| `phi(n)` | `n * prod (1 - 1/p)` | count of integers coprime to `n` |

Two facts worth memorising: **`d(n)` is odd exactly when `n` is a perfect
square** (that is the entire "bulb switcher" problem), and `phi` is what makes
Euler's theorem - and RSA - work.

---

## 6. Matrix exponentiation

Any **linear recurrence** can be written as a matrix, and a matrix can be raised
to a power by the same binary exponentiation used for numbers - because squaring
only needs associativity.

```
| 1 1 | | F(n)   |   | F(n) + F(n-1) |   | F(n+1) |
| 1 0 | | F(n-1) | = | F(n)          | = | F(n)   |
```

So `F(n)` is an entry of `M^n`, computable in `O(log n)` instead of `O(n)`. That
is the difference between "impossible" and "instant" when the problem asks for
`F(10^18) mod p`.

Generalises to any `k`-term recurrence via its companion matrix:
`O(k^3 log n)`.

---

## 7. Combinatorics mod a prime

`nCr = n! / (r! (n-r)!)` - but that division has to become multiplication by an
inverse. Precompute factorials and inverse factorials once:

```
nCr = fact[n] * inv_fact[r] * inv_fact[n-r]   mod p
```

The trick is getting the inverse factorials cheaply: compute **one** inverse
(of `fact[max]`) and walk backwards using `inv_fact[i-1] = inv_fact[i] * i`.
`O(n)` precompute, `O(1)` per query. Inverting each entry separately would cost
an `O(log p)` exponentiation apiece.

Requires a prime modulus and `n < p` - both satisfied by `10^9 + 7`.

---

## Complexity summary

| Operation | Time | Space |
|-----------|------|-------|
| `gcd`, `lcm`, `extended_gcd` | `O(log min(a,b))` | `O(1)` |
| `mod_pow` | `O(log e)` | `O(1)` |
| `mod_inverse` | `O(log m)` | `O(1)` |
| `is_prime` (trial division) | `O(sqrt n)` | `O(1)` |
| `is_prime_miller_rabin` | `O(k log^3 n)` | `O(1)` |
| Sieve of Eratosthenes | `O(n log log n)` | `O(n)` |
| `factorize` | `O(sqrt n)` | `O(log n)` |
| `factorize_fast` (with spf) | `O(log n)` | `O(n)` precompute |
| `count_divisors`, `sum_divisors`, `euler_totient` | `O(sqrt n)` | `O(log n)` |
| `matrix_power` (k x k) | `O(k^3 log n)` | `O(k^2)` |
| `Binomial.choose` | `O(1)` after `O(n)` | `O(n)` |

---

## Python specifics

**Integers are arbitrary precision.** This is the single biggest difference from
C++, Go and JavaScript. `2**1000` is exact; there is no overflow, ever. Several
defensive habits the other three languages force - dividing before multiplying
in `lcm`, using a 128-bit intermediate for `a*b mod m` - are *cosmetic* in
Python. They are written that way here anyway, because the habit is what
transfers.

**`pow(base, exp, mod)` is built in** and implemented in C. Always use it in
real code; `mod_pow` in this module exists so you can write it in the languages
that lack it. Same story for `math.gcd`, `math.lcm`, `math.comb`, `math.perm` -
the demo cross-checks against all of them.

**`bytearray` for sieves.** A `list[bool]` costs 8 bytes per pointer plus the
objects; a `bytearray` is one byte per entry. And slice assignment strikes a
whole arithmetic progression in C:

```python
is_composite[p*p::p] = b"\x01" * len(range(p*p, limit+1, p))
```

That single line replaces the inner loop and runs perhaps 20x faster.

**`//` not `/`.** True division returns a float and silently loses precision
above `2^53`. In this module every division is integer division.

**Recursion.** `extended_gcd` is written iteratively - the recursive form is
prettier but Python's default recursion limit is 1000 and function calls are
expensive.

---

## The tells

| Problem says | Reach for |
|--------------|-----------|
| "modulo 10^9+7" | `mod_pow`, inverse factorials |
| "count divisors / sum of divisors" | factorise, then the product formulas |
| "how many are coprime to n" | Euler's totient |
| "is it prime" with `n` up to `10^18` | Miller-Rabin |
| "all primes up to n" | sieve |
| "factorise many numbers" | smallest-prime-factor sieve |
| "nth term, n up to 10^18" | matrix exponentiation |
| "count paths / arrangements mod p" | `nCr` with inverse factorials |
| "smallest x with ax = b (mod m)" | extended Euclid |
| "lcm/gcd of a whole array" | fold pairwise - both are associative |

---

## Files

| File | Contents |
|------|----------|
| `number_theory.py` | All of the above, self-verifying |
| `Problems.md` | Curated practice set |

```bash
python number_theory.py
```

Every function is cross-checked against brute force or the standard library -
`gcd` against `math.gcd`, `mod_pow` against `pow`, the sieve against trial
division against Miller-Rabin on every `n` up to 2000, `nCr` against
`math.comb` and against Pascal's rule.

---

[<- 19 Advanced Topics](../19-Advanced-Topics/) · [All topics](../../README.md)
