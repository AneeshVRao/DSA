"""
20 - Math and Number Theory: GCD, modular arithmetic, sieves, factorisation
and matrix exponentiation - each cross-checked against brute force.

Run:  python number_theory.py
"""

from __future__ import annotations

import math
import random


# ============================================================================
# 1. Euclidean algorithm - GCD and LCM
# ============================================================================
def gcd(a: int, b: int) -> int:
    """Greatest common divisor. O(log min(a, b)).

    The whole algorithm rests on one identity:

        gcd(a, b) == gcd(b, a mod b)

    Why it holds: any d dividing both a and b also divides a - qb (= a mod b),
    and any d dividing b and a mod b also divides qb + (a mod b) = a. So the
    two pairs have *exactly* the same set of common divisors, hence the same
    greatest one. Each step shrinks the numbers, and b hits 0 in O(log) steps
    (the worst case is consecutive Fibonacci numbers - Lame's theorem).
    """
    while b:
        a, b = b, a % b
    return abs(a)


def lcm(a: int, b: int) -> int:
    """Least common multiple. O(log min(a, b)).

    From a*b == gcd(a, b) * lcm(a, b). Divide BEFORE multiplying in languages
    with fixed-width ints, or a*b overflows for large inputs. Python's ints are
    arbitrary precision so the order is cosmetic here - it is not in C++/Go/JS.
    """
    if a == 0 or b == 0:
        return 0
    return abs(a) // gcd(a, b) * abs(b)


def extended_gcd(a: int, b: int) -> tuple[int, int, int]:
    """Return (g, x, y) with a*x + b*y == g == gcd(a, b).

    Bezout's identity: the gcd is always expressible as an integer combination
    of the two inputs. Plain Euclid throws away the combination; this version
    carries it along.

    Each row (r, s, t) satisfies the invariant  a*s + b*t == r.  Start with
    (a, 1, 0) and (b, 0, 1) - both trivially true - and apply the same
    subtraction to all three columns. When r hits 0 the previous row holds the
    gcd and its coefficients.

    This is what makes modular inverses computable for any modulus, prime or
    not - see mod_inverse below.
    """
    old_r, r = a, b
    old_s, s = 1, 0
    old_t, t = 0, 1

    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
        old_t, t = t, old_t - q * t

    return old_r, old_s, old_t


# ============================================================================
# 2. Modular arithmetic
# ============================================================================
def mod_pow(base: int, exponent: int, modulus: int) -> int:
    """base**exponent mod modulus in O(log exponent). Binary exponentiation.

    Write the exponent in binary: 13 = 1101b = 8 + 4 + 1, so

        x^13 == x^8 * x^4 * x^1

    Walk the exponent's bits from the bottom, squaring a running base each
    step (x, x^2, x^4, x^8 ...) and multiplying it in whenever the bit is set.
    O(log e) multiplications instead of e of them.

    Taking the modulus at every step is what keeps the numbers small - without
    it, x^e is astronomically large before any reduction happens.

    (Python has this built in as pow(b, e, m) - the demo checks against it.
    Writing it out matters because most languages do not.)
    """
    if modulus == 1:
        return 0                      # everything is congruent to 0 mod 1

    result = 1
    base %= modulus
    while exponent > 0:
        if exponent & 1:              # this bit of the exponent is set
            result = result * base % modulus
        base = base * base % modulus  # square for the next bit up
        exponent >>= 1
    return result


def mod_inverse(a: int, m: int) -> int:
    """Modular multiplicative inverse: the x with a*x == 1 (mod m).

    Division does not exist in modular arithmetic - multiplying by the inverse
    replaces it. Needed constantly for nCr mod p, probability mod p, and any
    "answer mod 1e9+7" problem involving a quotient.

    Uses extended Euclid, so it works for ANY modulus, not just primes. From
    a*x + m*y == gcd(a, m) == 1, reducing mod m kills the m*y term and leaves
    a*x == 1 (mod m).

    Raises ValueError when gcd(a, m) != 1 - no inverse exists then, and that is
    a real condition worth surfacing rather than returning a wrong number.
    """
    g, x, _ = extended_gcd(a % m, m)
    if g != 1:
        raise ValueError(f"{a} has no inverse mod {m} (gcd is {g}, not 1)")
    return x % m                      # % m turns a possibly-negative x positive


def mod_inverse_fermat(a: int, p: int) -> int:
    """Inverse mod a PRIME p, via Fermat's little theorem. O(log p).

    Fermat: a^(p-1) == 1 (mod p) for prime p and a not divisible by p.
    Divide both sides by a:  a^(p-2) == a^-1 (mod p).

    One line, but only valid for prime moduli. mod_inverse (extended Euclid) is
    the general tool; this is the one everybody actually writes in contests
    because the modulus is nearly always 1e9+7.
    """
    if a % p == 0:
        raise ValueError(f"{a} is divisible by {p}, no inverse exists")
    return mod_pow(a, p - 2, p)


# ============================================================================
# 3. Primality
# ============================================================================
def is_prime(n: int) -> bool:
    """Trial division in O(sqrt n).

    Two prunings make it fast enough for single queries:

    1. Only test up to sqrt(n). If n == a*b with a <= b, then a <= sqrt(n) - so
       any composite has a factor at or below its square root.
    2. Only test 6k +/- 1. Every integer is one of 6k, 6k+1, ..., 6k+5; the
       forms 6k, 6k+2, 6k+4 are even and 6k+3 is divisible by 3. After handling
       2 and 3 by hand, only two of every six candidates remain - a 3x speedup.
    """
    if n < 2:
        return False
    if n < 4:
        return True                   # 2 and 3
    if n % 2 == 0 or n % 3 == 0:
        return False

    i = 5
    while i * i <= n:                 # i*i beats sqrt(n): no float rounding
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


def is_prime_miller_rabin(n: int) -> bool:
    """Deterministic Miller-Rabin for every n < 3.3e24. O(k log^3 n).

    Trial division is O(sqrt n) - hopeless for a 64-bit number. Miller-Rabin
    tests instead, using Fermat's theorem sharpened by the fact that the only
    square roots of 1 mod a prime are +1 and -1.

    Write n-1 = d * 2^s with d odd. For a prime n and any base a, the sequence
        a^d, a^2d, a^4d, ..., a^(2^s * d) == a^(n-1)
    must end at 1, and the first time it reaches 1 it has to arrive from -1.
    A composite that fails to do this for base a is proven composite; a is
    then called a WITNESS.

    A witness might exist but be missed by a bad base choice - so the test is
    probabilistic in general. But the first 12 primes as bases are known to
    catch every composite below 3.3e24, which makes it fully deterministic in
    any range a 64-bit integer can reach.
    """
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p             # p itself is prime, any other multiple is not

    d, s = n - 1, 0
    while d % 2 == 0:                 # strip factors of 2: n-1 == d * 2^s
        d //= 2
        s += 1

    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        x = mod_pow(a, d, n)
        if x == 1 or x == n - 1:
            continue                  # this base says "probably prime"
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break                 # reached -1, so no contradiction
        else:
            return False              # never hit -1: a is a witness, n composite
    return True


def sieve_of_eratosthenes(limit: int) -> list[int]:
    """All primes <= limit in O(n log log n) time, O(n) space.

    Trial-dividing every number is O(n sqrt n). The sieve flips it around: take
    each prime and cross off its multiples, so every composite is struck by its
    prime factors rather than searched for.

    Two standard optimisations are both in here:
      - start crossing off at p*p, since 2p, 3p ... (p-1)p were already struck
        by the smaller primes 2, 3 ... p-1
      - stop the outer loop at sqrt(limit) - beyond that, p*p exceeds the limit
        and there is nothing left to cross off

    The n log log n comes from summing n/p over primes p <= n; that sum grows
    like log log n, which is essentially a constant (below 4 for any real n).
    """
    if limit < 2:
        return []

    is_composite = bytearray(limit + 1)     # bytearray: 1 byte/entry, not 28
    is_composite[0] = is_composite[1] = 1

    p = 2
    while p * p <= limit:
        if not is_composite[p]:
            # Slice assignment strikes the whole arithmetic progression in C,
            # which is far faster than a Python-level loop.
            is_composite[p * p::p] = b"\x01" * len(range(p * p, limit + 1, p))
        p += 1

    return [i for i in range(2, limit + 1) if not is_composite[i]]


def smallest_prime_factors(limit: int) -> list[int]:
    """spf[i] == the smallest prime dividing i, for i <= limit. O(n log log n).

    A sieve that records WHICH prime crossed each number off instead of just
    the fact that something did. That single extra byte turns factorisation
    from O(sqrt n) per query into O(log n) per query - see factorize_fast.

    Worth precomputing whenever many numbers in a fixed range get factorised;
    not worth it for one large number (use factorize instead).
    """
    spf = list(range(limit + 1))       # spf[i] = i is the "not yet crossed" state
    p = 2
    while p * p <= limit:
        if spf[p] == p:                # p is prime - nothing smaller divides it
            for multiple in range(p * p, limit + 1, p):
                if spf[multiple] == multiple:
                    spf[multiple] = p  # first prime to reach it is the smallest
        p += 1
    return spf


# ============================================================================
# 4. Factorisation and divisor functions
# ============================================================================
def factorize(n: int) -> dict[int, int]:
    """Prime factorisation as {prime: exponent}. O(sqrt n).

    Divide out each candidate factor completely before moving on. That is what
    guarantees every factor found is prime: by the time i is tested, every
    prime below i has already been fully removed, so if i still divides n it
    cannot have any smaller prime factor.

    The trailing `if n > 1` is the case everyone forgets: after the loop, any
    remainder above 1 is a single prime larger than sqrt(original n). There can
    be at most one such factor - two would multiply past n.
    """
    factors: dict[int, int] = {}
    n = abs(n)

    for candidate in (2, 3):
        while n % candidate == 0:
            factors[candidate] = factors.get(candidate, 0) + 1
            n //= candidate

    i = 5
    while i * i <= n:                  # 6k +/- 1 again
        for candidate in (i, i + 2):
            while n % candidate == 0:
                factors[candidate] = factors.get(candidate, 0) + 1
                n //= candidate
        i += 6

    if n > 1:
        factors[n] = factors.get(n, 0) + 1   # leftover prime above sqrt(n)
    return factors


def factorize_fast(n: int, spf: list[int]) -> dict[int, int]:
    """Factorise using a precomputed smallest-prime-factor table. O(log n).

    Each division by spf[n] at least halves n, so the loop runs at most log2(n)
    times - a 10^6-element table answers a million queries in about as long as
    one trial division would take.
    """
    factors: dict[int, int] = {}
    while n > 1:
        p = spf[n]
        while n % p == 0:
            factors[p] = factors.get(p, 0) + 1
            n //= p
    return factors


def count_divisors(n: int) -> int:
    """Number of positive divisors. O(sqrt n).

    If n == p1^a1 * p2^a2 * ... then a divisor picks an exponent independently
    for each prime: 0..a1 for p1, 0..a2 for p2, and so on. Multiply the choices:

        d(n) = (a1 + 1)(a2 + 1)...

    A perfect square is exactly a number with an odd divisor count - every
    exponent is even, so every (ai + 1) is odd. That is the trick behind the
    classic "bulb switcher" problem.
    """
    total = 1
    for exponent in factorize(n).values():
        total *= exponent + 1
    return total


def sum_divisors(n: int) -> int:
    """Sum of positive divisors. O(sqrt n).

    Same independence argument, but each prime contributes a geometric series:

        sigma(n) = prod over p of (p^(a+1) - 1) / (p - 1)

    Expanding that product generates every divisor exactly once.
    """
    total = 1
    for p, a in factorize(n).items():
        total *= (p ** (a + 1) - 1) // (p - 1)
    return total


def euler_totient(n: int) -> int:
    """phi(n) - how many of 1..n are coprime to n. O(sqrt n).

    Start from n and remove, for each distinct prime p | n, the 1/p fraction of
    numbers that p divides:

        phi(n) = n * prod over distinct p|n of (1 - 1/p)

    (That is inclusion-exclusion over the prime divisors, collapsed into a
    product because the conditions are independent.)

    phi is what generalises Fermat's little theorem to composite moduli:
    a^phi(m) == 1 (mod m) whenever gcd(a, m) == 1 - the basis of RSA.

    Written as `result -= result // p` to stay in integers throughout.
    """
    result = n
    for p in factorize(n):
        result -= result // p          # exact: p divides result at this point
    return result


# ============================================================================
# 5. Matrix exponentiation - linear recurrences in O(log n)
# ============================================================================
Matrix = list[list[int]]


def matrix_multiply(a: Matrix, b: Matrix, mod: int | None = None) -> Matrix:
    """Standard O(n^3) matrix product, optionally mod a modulus."""
    n, m, p = len(a), len(b), len(b[0])
    result = [[0] * p for _ in range(n)]

    for i in range(n):
        for k in range(m):
            if a[i][k] == 0:           # cheap skip; matters for sparse rows
                continue
            for j in range(p):
                result[i][j] += a[i][k] * b[k][j]
                if mod is not None:
                    result[i][j] %= mod
    return result


def matrix_power(matrix: Matrix, exponent: int, mod: int | None = None) -> Matrix:
    """matrix**exponent by binary exponentiation. O(n^3 log exponent).

    Identical structure to mod_pow - squaring works for anything associative,
    and matrix multiplication is associative. Numbers were just the easy case.
    """
    n = len(matrix)
    result = [[1 if i == j else 0 for j in range(n)] for i in range(n)]  # identity

    while exponent > 0:
        if exponent & 1:
            result = matrix_multiply(result, matrix, mod)
        matrix = matrix_multiply(matrix, matrix, mod)
        exponent >>= 1
    return result


def fibonacci(n: int, mod: int | None = None) -> int:
    """The nth Fibonacci number in O(log n) instead of O(n).

    The recurrence F(n) = F(n-1) + F(n-2) is a linear map, so one step is a
    matrix multiply:

        | 1 1 | | F(n)   |   | F(n) + F(n-1) |   | F(n+1) |
        | 1 0 | | F(n-1) | = | F(n)          | = | F(n)   |

    Applying it n times is that matrix raised to the nth power, and binary
    exponentiation gets there in log n multiplications. Top-left entry of
    M^n is F(n+1); top-right is F(n).

    The same trick handles ANY linear recurrence - build the companion matrix
    and the O(n) DP collapses to O(k^3 log n). That is how problems asking for
    F(10^18) mod p are meant to be solved.
    """
    if n <= 1:
        return n if mod is None else n % mod
    return matrix_power([[1, 1], [1, 0]], n, mod)[0][1]


# ============================================================================
# 6. Combinatorics mod a prime
# ============================================================================
class Binomial:
    """nCr mod a prime, O(n) precompute then O(1) per query.

    Pascal's triangle is O(n^2) memory. Instead precompute factorials and their
    modular inverses:

        nCr = n! / (r! (n-r)!)  ->  fact[n] * inv_fact[r] * inv_fact[n-r] mod p

    The inverse factorials come from ONE modular inverse plus a backward pass,
    using inv_fact[i-1] == inv_fact[i] * i. Computing each inverse separately
    would cost an O(log p) exponentiation per entry.

    Requires a PRIME modulus (Fermat's theorem) and n < p, which is why the
    modulus is nearly always 1e9+7 - comfortably larger than any n in range.
    """

    def __init__(self, max_n: int, mod: int = 1_000_000_007) -> None:
        self.mod = mod
        self.fact = [1] * (max_n + 1)
        self.inv_fact = [1] * (max_n + 1)

        for i in range(1, max_n + 1):
            self.fact[i] = self.fact[i - 1] * i % mod

        # One exponentiation for the largest, then walk down multiplying by i.
        self.inv_fact[max_n] = mod_pow(self.fact[max_n], mod - 2, mod)
        for i in range(max_n, 0, -1):
            self.inv_fact[i - 1] = self.inv_fact[i] * i % mod

    def choose(self, n: int, r: int) -> int:
        """nCr mod p. O(1)."""
        if r < 0 or r > n:
            return 0                   # not an error - it is genuinely zero
        return self.fact[n] * self.inv_fact[r] % self.mod * self.inv_fact[n - r] % self.mod

    def permute(self, n: int, r: int) -> int:
        """nPr mod p. O(1)."""
        if r < 0 or r > n:
            return 0
        return self.fact[n] * self.inv_fact[n - r] % self.mod


# ============================================================================
# Self-check
# ============================================================================
def demo() -> None:
    random.seed(20)

    # --- GCD / LCM -----------------------------------------------------------
    assert gcd(48, 18) == 6
    assert gcd(17, 5) == 1                    # coprime
    assert gcd(0, 7) == 7                     # gcd(0, n) == n
    assert lcm(4, 6) == 12
    assert lcm(0, 5) == 0

    for _ in range(200):                      # against the standard library
        a, b = random.randint(0, 10**6), random.randint(0, 10**6)
        assert gcd(a, b) == math.gcd(a, b)
        assert lcm(a, b) == math.lcm(a, b)

    # --- Extended Euclid: verify Bezout's identity directly ------------------
    for _ in range(200):
        a, b = random.randint(1, 10**6), random.randint(1, 10**6)
        g, x, y = extended_gcd(a, b)
        assert g == math.gcd(a, b)
        assert a * x + b * y == g              # the identity itself

    # --- Modular exponentiation ---------------------------------------------
    assert mod_pow(2, 10, 1000) == 24          # 1024 mod 1000
    assert mod_pow(3, 0, 7) == 1               # anything^0 == 1
    assert mod_pow(5, 3, 1) == 0               # mod 1 collapses everything

    for _ in range(200):
        b, e, m = (random.randint(0, 10**6),
                   random.randint(0, 10**4),
                   random.randint(1, 10**9))
        assert mod_pow(b, e, m) == pow(b, e, m)

    # --- Modular inverse ----------------------------------------------------
    MOD = 1_000_000_007
    for _ in range(100):
        a = random.randint(1, 10**6)
        inv = mod_inverse(a, MOD)
        assert a * inv % MOD == 1
        assert inv == mod_inverse_fermat(a, MOD)   # both routes agree

    assert mod_inverse(3, 10) == 7                 # 3*7 == 21 == 1 mod 10
    try:
        mod_inverse(4, 10)                         # gcd(4, 10) == 2, no inverse
        raise AssertionError("expected ValueError")
    except ValueError:
        pass

    # --- Primality ----------------------------------------------------------
    assert [n for n in range(2, 30) if is_prime(n)] == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    assert not is_prime(1) and not is_prime(0) and not is_prime(-7)
    assert is_prime(104729)                        # the 10000th prime

    primes = sieve_of_eratosthenes(1000)
    assert len(primes) == 168                      # pi(1000) == 168
    assert primes[:5] == [2, 3, 5, 7, 11]
    assert primes[-1] == 997
    assert sieve_of_eratosthenes(1) == []

    # Sieve, trial division and Miller-Rabin must agree on every n up to 2000.
    prime_set = set(sieve_of_eratosthenes(2000))
    for n in range(2001):
        expected = n in prime_set
        assert is_prime(n) == expected
        assert is_prime_miller_rabin(n) == expected

    # Miller-Rabin where trial division would be hopeless.
    assert is_prime_miller_rabin(2**61 - 1)        # Mersenne prime
    assert not is_prime_miller_rabin(2**61 - 3)
    assert not is_prime_miller_rabin(3215031751)   # strong pseudoprime to 2,3,5,7

    # --- Smallest prime factors ---------------------------------------------
    spf = smallest_prime_factors(1000)
    assert spf[2] == 2 and spf[15] == 3 and spf[49] == 7
    assert [i for i in range(2, 1000) if spf[i] == i] == [p for p in primes if p < 1000]

    # --- Factorisation ------------------------------------------------------
    assert factorize(12) == {2: 2, 3: 1}
    assert factorize(97) == {97: 1}                # prime
    assert factorize(1) == {}
    assert factorize(2**10) == {2: 10}
    assert factorize(999999937) == {999999937: 1}  # large prime above sqrt

    for n in range(2, 1000):                       # both routes, and the product
        expected = factorize(n)
        assert factorize_fast(n, spf) == expected
        product = 1
        for p, e in expected.items():
            assert is_prime(p)                     # every factor really is prime
            product *= p ** e
        assert product == n                        # and they multiply back

    # --- Divisor functions, checked by brute force --------------------------
    for n in range(1, 500):
        divisors = [d for d in range(1, n + 1) if n % d == 0]
        assert count_divisors(n) == len(divisors)
        assert sum_divisors(n) == sum(divisors)
        assert euler_totient(n) == sum(1 for k in range(1, n + 1) if math.gcd(k, n) == 1)

    assert count_divisors(36) == 9                 # 36 == 6^2, a perfect square
    assert sum_divisors(28) == 56                  # perfect number: sigma == 2n
    assert euler_totient(10) == 4                  # 1, 3, 7, 9

    # Euler's theorem, which totient exists to state.
    for _ in range(50):
        m = random.randint(2, 1000)
        a = random.randint(1, 1000)
        if math.gcd(a, m) == 1:
            assert mod_pow(a, euler_totient(m), m) == 1

    # --- Matrix exponentiation ----------------------------------------------
    assert matrix_multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]]) == [[19, 22], [43, 50]]
    assert matrix_power([[1, 1], [1, 0]], 1) == [[1, 1], [1, 0]]
    assert matrix_power([[3, 7], [2, 5]], 0) == [[1, 0], [0, 1]]     # identity

    # Against the O(n) iterative Fibonacci.
    a, b = 0, 1
    for n in range(200):
        assert fibonacci(n) == a
        a, b = b, a + b

    assert fibonacci(10) == 55
    assert fibonacci(100) == 354224848179261915075

    # The modular path must agree with "compute exactly, then reduce".
    for n in range(200):
        assert fibonacci(n, MOD) == fibonacci(n) % MOD

    # F(10^18) mod p - the point of the whole technique. An O(n) DP would need
    # 10^18 steps; this returns instantly and still satisfies the structural
    # identity gcd(F(m), F(n)) == F(gcd(m, n)).
    assert 0 <= fibonacci(10**18, MOD) < MOD
    assert math.gcd(fibonacci(24), fibonacci(36)) == fibonacci(math.gcd(24, 36))

    # --- Binomial coefficients ----------------------------------------------
    binom = Binomial(1000)
    assert binom.choose(5, 2) == 10
    assert binom.choose(10, 0) == 1
    assert binom.choose(10, 11) == 0               # r > n
    assert binom.permute(5, 2) == 20

    for n in range(60):                            # against math.comb / math.perm
        for r in range(n + 1):
            assert binom.choose(n, r) == math.comb(n, r) % MOD
            assert binom.permute(n, r) == math.perm(n, r) % MOD

    # Pascal's rule, as an independent structural check.
    for n in range(1, 200):
        for r in range(1, n):
            assert binom.choose(n, r) == (binom.choose(n - 1, r - 1)
                                          + binom.choose(n - 1, r)) % MOD

    print("20-Math-and-Number-Theory (Python): all checks passed")
    print("  GCD/Bezout, mod_pow, inverses, sieve, Miller-Rabin, factorisation,")
    print("  totient and matrix exponentiation all cross-checked against brute force")


if __name__ == "__main__":
    demo()
