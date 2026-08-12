/**
 * 20 - Math and Number Theory: GCD, modular arithmetic, sieves, factorisation
 * and matrix exponentiation - each cross-checked against brute force.
 *
 * Run:  node number_theory.js
 *
 * THE JAVASCRIPT TRAP, up front: every Number is a float64, so integers are
 * exact only up to 2^53 - 1 (Number.MAX_SAFE_INTEGER, about 9.007e15). Modular
 * arithmetic multiplies two values that can each approach the modulus, so with
 * the usual 1e9+7 the product reaches 1e18 - a hundred times past the safe
 * limit, and it fails SILENTLY with a wrong-but-plausible answer.
 *
 * So everything that multiplies under a modulus below uses BigInt. Plain
 * Numbers are kept for the parts that stay small (gcd, sieve, factorisation),
 * because BigInt is roughly an order of magnitude slower.
 */

import assert from "node:assert";

// ============================================================================
// 1. Euclidean algorithm - GCD and LCM
// ============================================================================

/**
 * Greatest common divisor. O(log min(a, b)).
 *
 * Rests on one identity: gcd(a, b) === gcd(b, a mod b). Any d dividing a and b
 * also divides a - qb (= a mod b), and any d dividing b and a mod b divides
 * qb + (a mod b) = a - so both pairs have exactly the same common divisors,
 * hence the same greatest one. Worst case is consecutive Fibonacci numbers
 * (Lame's theorem), still O(log n).
 */
export function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

/**
 * Least common multiple. O(log min(a, b)).
 *
 * From a*b === gcd(a,b) * lcm(a,b). DIVIDE BEFORE MULTIPLYING: a*b silently
 * loses precision past 2^53, while the quotient form stays exact much longer.
 */
export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return (Math.abs(a) / gcd(a, b)) * Math.abs(b);
}

/**
 * Extended Euclid. Returns [g, x, y] with a*x + b*y === g === gcd(a, b).
 *
 * Bezout's identity: the gcd is always an integer combination of the inputs.
 * Plain Euclid throws the combination away; this version carries it along.
 *
 * Each row (r, s, t) keeps the invariant a*s + b*t === r. Start with (a, 1, 0)
 * and (b, 0, 1) - both trivially true - and apply the same subtraction to all
 * three columns. When r hits 0 the previous row holds the gcd and coefficients.
 *
 * This is what makes modular inverses computable for ANY modulus, not just
 * primes.
 */
export function extendedGcd(a, b) {
  let [oldR, r] = [a, b];
  let [oldS, s] = [1, 0];
  let [oldT, t] = [0, 1];

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }
  return [oldR, oldS, oldT];
}

// ============================================================================
// 2. Modular arithmetic  (BigInt - see the header note)
// ============================================================================

/**
 * base**exponent mod modulus in O(log exponent). Binary exponentiation.
 *
 * Write the exponent in binary: 13 = 0b1101 = 8 + 4 + 1, so x^13 = x^8*x^4*x.
 * Walk the bits from the bottom, squaring a running base each step
 * (x, x^2, x^4, x^8 ...) and multiplying it in whenever the bit is set.
 * O(log e) multiplications instead of e of them.
 *
 * Reducing mod m at every step is what keeps the numbers bounded - without it
 * x^e is astronomically large before any reduction happens.
 *
 * BigInt throughout: `result * base` would overflow float64 for any realistic
 * modulus. Note `exponent >> 1n` - BigInt shifts need BigInt operands.
 */
export function modPow(base, exponent, modulus) {
  base = BigInt(base);
  exponent = BigInt(exponent);
  modulus = BigInt(modulus);

  if (modulus === 1n) return 0n; // everything is congruent to 0 mod 1

  let result = 1n;
  base %= modulus;
  if (base < 0n) base += modulus;

  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus; // this bit is set
    base = (base * base) % modulus; // square for the next bit up
    exponent >>= 1n;
  }
  return result;
}

/**
 * Modular multiplicative inverse: the x with a*x === 1 (mod m).
 *
 * Division does not exist in modular arithmetic - multiplying by the inverse
 * replaces it. Needed for nCr mod p and any "answer mod 1e9+7" involving a
 * quotient.
 *
 * Extended Euclid, so it works for ANY modulus. From a*x + m*y === 1, reducing
 * mod m kills the m*y term and leaves a*x === 1 (mod m).
 *
 * Throws when gcd(a, m) !== 1: no inverse exists, and returning a wrong number
 * quietly would be worse than failing loudly.
 */
export function modInverse(a, m) {
  a = BigInt(a);
  m = BigInt(m);

  let [oldR, r] = [((a % m) + m) % m, m];
  let [oldS, s] = [1n, 0n];

  while (r !== 0n) {
    const q = oldR / r; // BigInt division truncates - exactly what we want
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }

  if (oldR !== 1n) throw new Error(`${a} has no inverse mod ${m} (gcd is ${oldR})`);
  return ((oldS % m) + m) % m; // normalise a possibly-negative coefficient
}

/**
 * Inverse mod a PRIME p, via Fermat's little theorem. O(log p).
 *
 * Fermat: a^(p-1) === 1 (mod p) for prime p and a not divisible by p. Divide
 * both sides by a: a^(p-2) === a^-1 (mod p). One line, prime moduli only.
 */
export function modInverseFermat(a, p) {
  if (BigInt(a) % BigInt(p) === 0n) throw new Error("a is divisible by p");
  return modPow(a, BigInt(p) - 2n, p);
}

// ============================================================================
// 3. Primality
// ============================================================================

/**
 * Trial division in O(sqrt n).
 *
 * Two prunings: test only up to sqrt(n) (if n === a*b with a <= b then
 * a <= sqrt(n), so any composite has a factor at or below its square root),
 * and test only 6k +/- 1 (6k, 6k+2, 6k+4 are even and 6k+3 divides by 3, so
 * after handling 2 and 3 by hand only two of every six candidates survive).
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true; // 2 and 3
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    // i*i rather than Math.sqrt(n): no floating-point rounding at the boundary
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Deterministic Miller-Rabin for every n < 3.3e24. O(k log^3 n).
 *
 * Trial division is O(sqrt n) - hopeless for a 64-bit number. Miller-Rabin
 * uses Fermat's theorem sharpened by the fact that the only square roots of 1
 * modulo a prime are +1 and -1.
 *
 * Write n-1 = d * 2^s with d odd. For prime n and any base a the sequence
 *     a^d, a^2d, a^4d, ..., a^(2^s * d) === a^(n-1)
 * must end at 1, and the first time it reaches 1 it has to arrive from -1.
 * A composite failing this for base a is proven composite; a is a WITNESS.
 *
 * A witness can exist but be missed by a bad base, so the test is probabilistic
 * in general - but the first 12 primes as bases catch every composite below
 * 3.3e24, making it deterministic over the whole 64-bit range.
 *
 * BigInt, because squaring x mod n needs exact products well past 2^53.
 */
export function isPrimeMillerRabin(n) {
  const value = BigInt(n);
  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];

  if (value < 2n) return false;
  for (const p of bases) {
    if (value % p === 0n) return value === p; // p is prime, other multiples are not
  }

  let d = value - 1n;
  let s = 0;
  while (d % 2n === 0n) {
    d /= 2n; // strip factors of 2: n-1 === d * 2^s
    s += 1;
  }

  for (const a of bases) {
    let x = modPow(a, d, value);
    if (x === 1n || x === value - 1n) continue; // this base says "probably prime"

    let witnessed = true;
    for (let i = 0; i < s - 1; i++) {
      x = (x * x) % value;
      if (x === value - 1n) {
        witnessed = false; // reached -1, no contradiction
        break;
      }
    }
    if (witnessed) return false; // never hit -1: a proves n composite
  }
  return true;
}

/**
 * All primes <= limit in O(n log log n) time, O(n) space.
 *
 * Trial-dividing everything is O(n sqrt n). The sieve inverts it: take each
 * prime and cross off its multiples, so composites are struck by their prime
 * factors rather than searched for.
 *
 * Start crossing off at p*p - 2p, 3p ... (p-1)p were already struck by the
 * smaller primes - and stop the outer loop at sqrt(limit).
 *
 * Uint8Array rather than a plain Array: one byte per entry instead of a boxed
 * value, and no risk of the engine deoptimising to a dictionary-mode object.
 */
export function sieveOfEratosthenes(limit) {
  if (limit < 2) return [];

  const isComposite = new Uint8Array(limit + 1);
  for (let p = 2; p * p <= limit; p++) {
    if (!isComposite[p]) {
      for (let multiple = p * p; multiple <= limit; multiple += p) {
        isComposite[multiple] = 1;
      }
    }
  }

  const primes = [];
  for (let i = 2; i <= limit; i++) if (!isComposite[i]) primes.push(i);
  return primes;
}

/**
 * spf[i] === the smallest prime dividing i. O(n log log n).
 *
 * A sieve that records WHICH prime crossed each number off, not merely that
 * something did. That extra field turns factorisation from O(sqrt n) per query
 * into O(log n) per query - worth it whenever many numbers in a fixed range
 * need factorising.
 */
export function smallestPrimeFactors(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 0; i <= limit; i++) spf[i] = i; // "not yet crossed" state

  for (let p = 2; p * p <= limit; p++) {
    if (spf[p] === p) {
      // p is prime - nothing smaller divides it
      for (let multiple = p * p; multiple <= limit; multiple += p) {
        if (spf[multiple] === multiple) spf[multiple] = p; // first prime wins
      }
    }
  }
  return spf;
}

// ============================================================================
// 4. Factorisation and divisor functions
// ============================================================================

/**
 * Prime factorisation as a Map of prime -> exponent. O(sqrt n).
 *
 * Divide out each candidate completely before moving on. That is what makes
 * every factor found prime: by the time i is tested, every prime below i has
 * been fully removed, so if i still divides n it has no smaller prime factor.
 *
 * The trailing `if (n > 1)` is the case everyone forgets - any remainder above
 * 1 is a single prime larger than sqrt(original n). There can be at most one;
 * two would multiply past n.
 *
 * A Map, not an object: object keys are coerced to strings, so `factors[2]`
 * and `factors["2"]` are the same entry and the keys come back as strings.
 */
export function factorize(n) {
  const factors = new Map();
  n = Math.abs(n);

  const add = (p) => factors.set(p, (factors.get(p) ?? 0) + 1);

  for (const candidate of [2, 3]) {
    while (n % candidate === 0) {
      add(candidate);
      n /= candidate;
    }
  }

  for (let i = 5; i * i <= n; i += 6) {
    // 6k +/- 1 again
    for (const candidate of [i, i + 2]) {
      while (n % candidate === 0) {
        add(candidate);
        n /= candidate;
      }
    }
  }

  if (n > 1) add(n); // leftover prime above sqrt(n)
  return factors;
}

/**
 * Factorise using a precomputed smallest-prime-factor table. O(log n).
 *
 * Each division by spf[n] at least halves n, so the loop runs at most log2(n)
 * times.
 */
export function factorizeFast(n, spf) {
  const factors = new Map();
  while (n > 1) {
    const p = spf[n];
    while (n % p === 0) {
      factors.set(p, (factors.get(p) ?? 0) + 1);
      n /= p;
    }
  }
  return factors;
}

/**
 * Number of positive divisors. O(sqrt n).
 *
 * If n === p1^a1 * p2^a2 ... a divisor picks an exponent independently for each
 * prime: 0..a1 for p1, 0..a2 for p2 ... Multiply the choices:
 *     d(n) = (a1 + 1)(a2 + 1)...
 *
 * A perfect square is exactly a number with an ODD divisor count - every
 * exponent is even, so every (ai + 1) is odd. That is the "bulb switcher" trick.
 */
export function countDivisors(n) {
  let total = 1;
  for (const exponent of factorize(n).values()) total *= exponent + 1;
  return total;
}

/**
 * Sum of positive divisors. O(sqrt n).
 *
 * Same independence argument, but each prime contributes a geometric series:
 *     sigma(n) = product over p of (p^(a+1) - 1) / (p - 1)
 * Expanding that product generates every divisor exactly once.
 */
export function sumDivisors(n) {
  let total = 1;
  for (const [p, a] of factorize(n)) {
    total *= (p ** (a + 1) - 1) / (p - 1);
  }
  return total;
}

/**
 * phi(n) - how many of 1..n are coprime to n. O(sqrt n).
 *
 * Start from n and remove, for each distinct prime p | n, the 1/p fraction of
 * numbers p divides:
 *     phi(n) = n * product over distinct p|n of (1 - 1/p)
 * That is inclusion-exclusion over the prime divisors, collapsed into a product
 * because the conditions are independent.
 *
 * phi generalises Fermat to composite moduli: a^phi(m) === 1 (mod m) whenever
 * gcd(a, m) === 1 - the basis of RSA.
 *
 * Written as `result -= result / p` so it stays in exact integers.
 */
export function eulerTotient(n) {
  let result = n;
  for (const p of factorize(n).keys()) result -= result / p; // exact: p | result here
  return result;
}

// ============================================================================
// 5. Matrix exponentiation - linear recurrences in O(log n)
// ============================================================================

/**
 * Standard O(n^3) product on BigInt matrices. `mod` of 0n means no reduction.
 */
export function matrixMultiply(a, b, mod = 0n) {
  const n = a.length;
  const m = b.length;
  const p = b[0].length;
  const result = Array.from({ length: n }, () => new Array(p).fill(0n));

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < m; k++) {
      if (a[i][k] === 0n) continue; // cheap skip; matters for sparse rows
      for (let j = 0; j < p; j++) {
        result[i][j] += a[i][k] * b[k][j];
        if (mod) result[i][j] %= mod;
      }
    }
  }
  return result;
}

/**
 * matrix**exponent by binary exponentiation. O(n^3 log exponent).
 *
 * Identical structure to modPow - squaring works for anything ASSOCIATIVE, and
 * matrix multiplication is associative. Numbers were just the easy case.
 */
export function matrixPower(matrix, exponent, mod = 0n) {
  exponent = BigInt(exponent);
  const n = matrix.length;
  let result = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1n : 0n)),
  ); // identity

  while (exponent > 0n) {
    if (exponent & 1n) result = matrixMultiply(result, matrix, mod);
    matrix = matrixMultiply(matrix, matrix, mod); // square for the next bit up
    exponent >>= 1n;
  }
  return result;
}

/**
 * The nth Fibonacci number in O(log n) instead of O(n). Returns a BigInt.
 *
 * F(n) = F(n-1) + F(n-2) is a linear map, so one step is a matrix multiply:
 *
 *     | 1 1 | | F(n)   |   | F(n) + F(n-1) |   | F(n+1) |
 *     | 1 0 | | F(n-1) | = | F(n)          | = | F(n)   |
 *
 * Applying it n times is that matrix to the nth power, reached in log n
 * multiplications. The top-right entry of M^n is F(n).
 *
 * The same trick handles ANY linear recurrence - build the companion matrix and
 * an O(n) DP collapses to O(k^3 log n). That is how "F(10^18) mod p" is meant
 * to be solved.
 *
 * BigInt is doubly necessary here: F(79) already exceeds MAX_SAFE_INTEGER, so
 * even the non-modular version would go silently wrong as a Number.
 */
export function fibonacci(n, mod = 0n) {
  n = BigInt(n);
  if (n <= 1n) return mod ? n % mod : n;
  return matrixPower(
    [
      [1n, 1n],
      [1n, 0n],
    ],
    n,
    mod,
  )[0][1];
}

// ============================================================================
// 6. Combinatorics mod a prime
// ============================================================================

/**
 * nCr mod a prime, O(n) precompute then O(1) per query.
 *
 * Pascal's triangle costs O(n^2) memory. Instead precompute factorials and
 * their modular inverses:
 *     nCr = n! / (r!(n-r)!)  ->  fact[n] * invFact[r] * invFact[n-r] mod p
 *
 * The inverse factorials come from ONE modular inverse plus a backward pass
 * using invFact[i-1] === invFact[i] * i. Inverting each entry separately would
 * cost an O(log p) exponentiation apiece.
 *
 * Requires a PRIME modulus (Fermat's theorem) and n < p - which is why the
 * modulus is nearly always 1e9+7, comfortably larger than any n in range.
 */
export class Binomial {
  #mod;
  #fact;
  #invFact;

  constructor(maxN, mod = 1000000007n) {
    this.#mod = BigInt(mod);
    this.#fact = new Array(maxN + 1).fill(1n);
    this.#invFact = new Array(maxN + 1).fill(1n);

    for (let i = 1; i <= maxN; i++) {
      this.#fact[i] = (this.#fact[i - 1] * BigInt(i)) % this.#mod;
    }

    // One exponentiation for the largest, then walk down multiplying by i.
    this.#invFact[maxN] = modPow(this.#fact[maxN], this.#mod - 2n, this.#mod);
    for (let i = maxN; i > 0; i--) {
      this.#invFact[i - 1] = (this.#invFact[i] * BigInt(i)) % this.#mod;
    }
  }

  /** nCr mod p. O(1). */
  choose(n, r) {
    if (r < 0 || r > n) return 0n; // not an error - genuinely zero
    return (
      (((this.#fact[n] * this.#invFact[r]) % this.#mod) * this.#invFact[n - r]) %
      this.#mod
    );
  }

  /** nPr mod p. O(1). */
  permute(n, r) {
    if (r < 0 || r > n) return 0n;
    return (this.#fact[n] * this.#invFact[n - r]) % this.#mod;
  }
}

// ============================================================================
// Self-check
// ============================================================================
function demo() {
  // Deterministic PRNG so a failure is always reproducible.
  let seed = 20;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

  const MOD = 1000000007n;

  // --- GCD / LCM ------------------------------------------------------------
  assert.equal(gcd(48, 18), 6);
  assert.equal(gcd(17, 5), 1); // coprime
  assert.equal(gcd(0, 7), 7); // gcd(0, n) === n
  assert.equal(lcm(4, 6), 12);
  assert.equal(lcm(0, 5), 0);

  // No Math.gcd in JS, so check the defining properties instead: g divides
  // both, and dividing it out leaves a coprime pair (so g really is greatest).
  for (let t = 0; t < 200; t++) {
    const a = randInt(1, 1000000);
    const b = randInt(1, 1000000);
    const g = gcd(a, b);
    assert.equal(a % g, 0);
    assert.equal(b % g, 0);
    assert.equal(gcd(a / g, b / g), 1);
    assert.equal(lcm(a, b), (a / g) * b);
  }

  // --- Extended Euclid: verify Bezout's identity directly -------------------
  for (let t = 0; t < 200; t++) {
    const a = randInt(1, 1000000);
    const b = randInt(1, 1000000);
    const [g, x, y] = extendedGcd(a, b);
    assert.equal(g, gcd(a, b));
    assert.equal(a * x + b * y, g); // the identity itself
  }

  // --- Modular exponentiation -----------------------------------------------
  assert.equal(modPow(2, 10, 1000), 24n); // 1024 mod 1000
  assert.equal(modPow(3, 0, 7), 1n); // anything^0 === 1
  assert.equal(modPow(5, 3, 1), 0n); // mod 1 collapses everything

  // Against a naive O(e) loop.
  for (let t = 0; t < 200; t++) {
    const b = BigInt(randInt(0, 1000));
    const e = randInt(0, 500);
    const m = BigInt(randInt(1, 10000));
    let expected = 1n % m;
    for (let i = 0; i < e; i++) expected = (expected * (b % m)) % m;
    assert.equal(modPow(b, e, m), expected);
  }

  // --- Modular inverse ------------------------------------------------------
  for (let t = 0; t < 100; t++) {
    const a = BigInt(randInt(1, 1000000));
    const inv = modInverse(a, MOD);
    assert.equal((a * inv) % MOD, 1n);
    assert.equal(inv, modInverseFermat(a, MOD)); // both routes agree
  }

  assert.equal(modInverse(3, 10), 7n); // 3*7 === 21 === 1 mod 10
  assert.throws(() => modInverse(4, 10)); // gcd(4, 10) === 2, no inverse

  // --- Primality ------------------------------------------------------------
  const small = [];
  for (let n = 2; n < 30; n++) if (isPrime(n)) small.push(n);
  assert.deepEqual(small, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  assert.ok(!isPrime(1) && !isPrime(0) && !isPrime(-7));
  assert.ok(isPrime(104729)); // the 10000th prime

  const primes = sieveOfEratosthenes(1000);
  assert.equal(primes.length, 168); // pi(1000) === 168
  assert.equal(primes[0], 2);
  assert.equal(primes.at(-1), 997);
  assert.deepEqual(sieveOfEratosthenes(1), []);

  // Sieve, trial division and Miller-Rabin must agree on every n up to 2000.
  const primeSet = new Set(sieveOfEratosthenes(2000));
  for (let n = 0; n <= 2000; n++) {
    const expected = primeSet.has(n);
    assert.equal(isPrime(n), expected);
    assert.equal(isPrimeMillerRabin(n), expected);
  }

  // Miller-Rabin where trial division would be hopeless.
  assert.ok(isPrimeMillerRabin(2n ** 61n - 1n)); // Mersenne prime
  assert.ok(!isPrimeMillerRabin(2n ** 61n - 3n));
  assert.ok(!isPrimeMillerRabin(3215031751n)); // strong pseudoprime to 2,3,5,7

  // --- Smallest prime factors -----------------------------------------------
  const spf = smallestPrimeFactors(1000);
  assert.ok(spf[2] === 2 && spf[15] === 3 && spf[49] === 7);
  for (let i = 2; i <= 1000; i++) assert.equal(spf[i] === i, primeSet.has(i));

  // --- Factorisation --------------------------------------------------------
  assert.deepEqual([...factorize(12)], [
    [2, 2],
    [3, 1],
  ]);
  assert.deepEqual([...factorize(97)], [[97, 1]]); // prime
  assert.equal(factorize(1).size, 0);
  assert.deepEqual([...factorize(1024)], [[2, 10]]);
  assert.deepEqual([...factorize(999999937)], [[999999937, 1]]); // big prime

  for (let n = 2; n < 1000; n++) {
    // both routes, and the product
    const expected = factorize(n);
    assert.deepEqual([...factorizeFast(n, spf)], [...expected]);
    let product = 1;
    for (const [p, e] of expected) {
      assert.ok(isPrime(p)); // every factor really is prime
      product *= p ** e;
    }
    assert.equal(product, n); // and they multiply back
  }

  // --- Divisor functions, checked by brute force ----------------------------
  for (let n = 1; n < 500; n++) {
    let count = 0;
    let total = 0;
    let coprime = 0;
    for (let d = 1; d <= n; d++) {
      if (n % d === 0) {
        count++;
        total += d;
      }
      if (gcd(d, n) === 1) coprime++;
    }
    assert.equal(countDivisors(n), count);
    assert.equal(sumDivisors(n), total);
    assert.equal(eulerTotient(n), coprime);
  }

  assert.equal(countDivisors(36), 9); // 36 === 6^2, a perfect square
  assert.equal(sumDivisors(28), 56); // perfect number: sigma === 2n
  assert.equal(eulerTotient(10), 4); // 1, 3, 7, 9

  // Euler's theorem, which totient exists to state.
  for (let t = 0; t < 50; t++) {
    const m = randInt(2, 1000);
    const a = randInt(1, 1000);
    if (gcd(a, m) === 1) assert.equal(modPow(a, eulerTotient(m), m), 1n);
  }

  // --- Matrix exponentiation ------------------------------------------------
  assert.deepEqual(
    matrixMultiply(
      [
        [1n, 2n],
        [3n, 4n],
      ],
      [
        [5n, 6n],
        [7n, 8n],
      ],
    ),
    [
      [19n, 22n],
      [43n, 50n],
    ],
  );
  assert.deepEqual(
    matrixPower(
      [
        [3n, 7n],
        [2n, 5n],
      ],
      0,
    ),
    [
      [1n, 0n],
      [0n, 1n],
    ],
  ); // identity

  // Against the O(n) iterative Fibonacci, in BigInt so it stays exact.
  let a = 0n;
  let b = 1n;
  for (let n = 0; n < 200; n++) {
    assert.equal(fibonacci(n), a);
    [a, b] = [b, a + b];
  }
  assert.equal(fibonacci(10), 55n);
  assert.equal(fibonacci(100), 354224848179261915075n);

  // The modular path must agree with "compute exactly, then reduce".
  for (let n = 0; n < 200; n++) assert.equal(fibonacci(n, MOD), fibonacci(n) % MOD);

  // F(10^18) mod p - an O(n) DP would need 10^18 steps; this returns instantly
  // and still satisfies gcd(F(m), F(n)) === F(gcd(m, n)).
  const huge = fibonacci(10n ** 18n, MOD);
  assert.ok(huge >= 0n && huge < MOD);
  assert.equal(gcd(Number(fibonacci(24)), Number(fibonacci(36))), Number(fibonacci(12)));

  // --- Binomial coefficients ------------------------------------------------
  const binom = new Binomial(1000);
  assert.equal(binom.choose(5, 2), 10n);
  assert.equal(binom.choose(10, 0), 1n);
  assert.equal(binom.choose(10, 11), 0n); // r > n
  assert.equal(binom.permute(5, 2), 20n);

  // Against Pascal's triangle - an independent O(n^2) reference.
  const pascal = Array.from({ length: 60 }, () => new Array(60).fill(0n));
  for (let n = 0; n < 60; n++) {
    pascal[n][0] = 1n;
    for (let r = 1; r <= n; r++) {
      pascal[n][r] = (pascal[n - 1][r - 1] + pascal[n - 1][r]) % MOD;
    }
    for (let r = 0; r <= n; r++) assert.equal(binom.choose(n, r), pascal[n][r]);
  }

  // Pascal's rule at a scale the O(n^2) table could not reach.
  for (let n = 1; n < 200; n++) {
    for (let r = 1; r < n; r++) {
      assert.equal(
        binom.choose(n, r),
        (binom.choose(n - 1, r - 1) + binom.choose(n - 1, r)) % MOD,
      );
    }
  }

  console.log("20-Math-and-Number-Theory (JavaScript): all checks passed");
  console.log(
    "  GCD/Bezout, modPow, inverses, sieve, Miller-Rabin, factorisation,\n" +
      "  totient and matrix exponentiation all cross-checked against brute force",
  );
}

demo();
