// 20 - Math and Number Theory: GCD, modular arithmetic, sieves, factorisation
// and matrix exponentiation - each cross-checked against brute force.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall number_theory.cpp -o number_theory && ./number_theory

#include <cassert>
#include <cstdint>
#include <iostream>
#include <map>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;

using ll = int64_t;

// ============================================================================
// 1. Euclidean algorithm - GCD and LCM
// ============================================================================

// Greatest common divisor. O(log min(a, b)).
//
// Rests on one identity: gcd(a, b) == gcd(b, a mod b). Any d dividing a and b
// also divides a - qb (= a mod b), and any d dividing b and a mod b divides
// qb + (a mod b) = a - so both pairs have exactly the same common divisors.
// The worst case is consecutive Fibonacci numbers (Lame's theorem), still
// O(log n).
//
// C++17 has std::gcd in <numeric>; the demo checks against it.
ll gcdOf(ll a, ll b) {
    while (b != 0) {
        ll temp = a % b;
        a = b;
        b = temp;
    }
    return a < 0 ? -a : a;
}

// Least common multiple. O(log min(a, b)).
//
// From a*b == gcd(a,b) * lcm(a,b). DIVIDE BEFORE MULTIPLYING - unlike Python,
// int64 overflows silently, and a*b overflows long before the quotient would.
ll lcmOf(ll a, ll b) {
    if (a == 0 || b == 0) return 0;
    ll g = gcdOf(a, b);
    return (a < 0 ? -a : a) / g * (b < 0 ? -b : b);
}

struct Bezout {
    ll g, x, y;  // a*x + b*y == g == gcd(a, b)
};

// Extended Euclid. Returns the gcd together with Bezout coefficients.
//
// Bezout's identity: the gcd is always an integer combination of the inputs.
// Each row (r, s, t) keeps the invariant a*s + b*t == r. Start with (a, 1, 0)
// and (b, 0, 1) - both trivially true - and apply the same subtraction to all
// three columns. When r reaches 0 the previous row holds the answer.
//
// This is what makes modular inverses computable for ANY modulus.
Bezout extendedGcd(ll a, ll b) {
    ll oldR = a, r = b;
    ll oldS = 1, s = 0;
    ll oldT = 0, t = 1;

    while (r != 0) {
        ll q = oldR / r;
        ll tmp = oldR - q * r; oldR = r; r = tmp;
        tmp = oldS - q * s;    oldS = s; s = tmp;
        tmp = oldT - q * t;    oldT = t; t = tmp;
    }
    return {oldR, oldS, oldT};
}

// ============================================================================
// 2. Modular arithmetic
// ============================================================================

// (a * b) mod m without overflow, via the 128-bit intermediate.
//
// This is the C++ tax Python never pays: a*b for two values near 2^62 wraps
// around silently and the result is garbage. __int128 is a GCC/Clang extension
// (not standard C++, but universally available on 64-bit targets).
ll mulMod(ll a, ll b, ll m) {
    return static_cast<ll>((static_cast<__int128>(a) * b) % m);
}

// base^exponent mod modulus in O(log exponent). Binary exponentiation.
//
// Write the exponent in binary: 13 = 1101b = 8 + 4 + 1, so x^13 = x^8 * x^4 * x.
// Walk the bits from the bottom, squaring a running base each step
// (x, x^2, x^4, x^8 ...) and multiplying it in whenever the bit is set.
// O(log e) multiplications instead of e.
//
// Reducing mod m at every step is what keeps the numbers bounded.
ll modPow(ll base, ll exponent, ll modulus) {
    if (modulus == 1) return 0;  // everything is congruent to 0 mod 1

    ll result = 1;
    base %= modulus;
    if (base < 0) base += modulus;

    while (exponent > 0) {
        if (exponent & 1) result = mulMod(result, base, modulus);
        base = mulMod(base, base, modulus);  // square for the next bit up
        exponent >>= 1;
    }
    return result;
}

// Modular multiplicative inverse: the x with a*x == 1 (mod m).
//
// Division does not exist in modular arithmetic; multiplying by the inverse
// replaces it. Works for ANY modulus because it uses extended Euclid: from
// a*x + m*y == 1, reducing mod m kills m*y and leaves a*x == 1.
//
// Throws when gcd(a, m) != 1 - no inverse exists, and silently returning a
// wrong number would be worse than failing.
ll modInverse(ll a, ll m) {
    Bezout b = extendedGcd(((a % m) + m) % m, m);
    if (b.g != 1) {
        throw invalid_argument("no modular inverse: gcd is not 1");
    }
    return ((b.x % m) + m) % m;  // normalise a possibly-negative x
}

// Inverse mod a PRIME p, via Fermat's little theorem. O(log p).
//
// Fermat: a^(p-1) == 1 (mod p) for prime p, a not divisible by p. Divide both
// sides by a: a^(p-2) == a^-1. One line, but prime moduli only.
ll modInverseFermat(ll a, ll p) {
    if (a % p == 0) throw invalid_argument("a is divisible by p");
    return modPow(a, p - 2, p);
}

// ============================================================================
// 3. Primality
// ============================================================================

// Trial division in O(sqrt n).
//
// Two prunings: test only up to sqrt(n) (if n == a*b with a <= b then
// a <= sqrt(n)), and test only 6k +/- 1 (the forms 6k, 6k+2, 6k+4 are even and
// 6k+3 is divisible by 3, so after handling 2 and 3 by hand only two of every
// six candidates survive).
bool isPrime(ll n) {
    if (n < 2) return false;
    if (n < 4) return true;                    // 2 and 3
    if (n % 2 == 0 || n % 3 == 0) return false;

    for (ll i = 5; i * i <= n; i += 6) {       // i*i beats sqrt(): no float error
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

// Deterministic Miller-Rabin for every n < 3.3e24. O(k log^3 n).
//
// Trial division is O(sqrt n) - hopeless for a 64-bit number. Miller-Rabin
// uses Fermat's theorem sharpened by the fact that the only square roots of 1
// modulo a prime are +1 and -1.
//
// Write n-1 = d * 2^s with d odd. For prime n and any base a, the sequence
//     a^d, a^2d, a^4d, ..., a^(2^s * d) == a^(n-1)
// must end at 1, and the first time it reaches 1 it has to arrive from -1.
// A composite failing this for base a is proven composite; a is a WITNESS.
//
// The first 12 primes as bases catch every composite below 3.3e24, which makes
// the test fully deterministic across the entire 64-bit range.
bool isPrimeMillerRabin(ll n) {
    static const ll bases[] = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37};

    if (n < 2) return false;
    for (ll p : bases) {
        if (n % p == 0) return n == p;  // p is prime; any other multiple is not
    }

    ll d = n - 1;
    int s = 0;
    while (d % 2 == 0) { d /= 2; ++s; }  // strip 2s: n-1 == d * 2^s

    for (ll a : bases) {
        ll x = modPow(a, d, n);
        if (x == 1 || x == n - 1) continue;  // this base says "probably prime"

        bool witnessed = true;
        for (int i = 0; i < s - 1; ++i) {
            x = mulMod(x, x, n);
            if (x == n - 1) { witnessed = false; break; }  // reached -1, no contradiction
        }
        if (witnessed) return false;  // never hit -1: a proves n composite
    }
    return true;
}

// All primes <= limit in O(n log log n) time, O(n) space.
//
// Trial-dividing everything is O(n sqrt n). The sieve inverts it: take each
// prime and cross off its multiples, so composites are struck by their factors
// rather than searched for.
//
// Start crossing off at p*p (2p, 3p ... were already struck by smaller primes)
// and stop the outer loop at sqrt(limit).
//
// vector<char> rather than vector<bool>: the bool specialisation packs bits and
// is measurably slower to write, and this loop is write-heavy.
vector<int> sieveOfEratosthenes(int limit) {
    if (limit < 2) return {};

    vector<char> isComposite(limit + 1, 0);
    for (long long p = 2; p * p <= limit; ++p) {
        if (!isComposite[p]) {
            for (long long multiple = p * p; multiple <= limit; multiple += p) {
                isComposite[multiple] = 1;
            }
        }
    }

    vector<int> primes;
    for (int i = 2; i <= limit; ++i) {
        if (!isComposite[i]) primes.push_back(i);
    }
    return primes;
}

// spf[i] == smallest prime dividing i. O(n log log n).
//
// A sieve that records WHICH prime crossed each number off. That extra field
// turns factorisation from O(sqrt n) per query into O(log n) per query.
vector<int> smallestPrimeFactors(int limit) {
    vector<int> spf(limit + 1);
    for (int i = 0; i <= limit; ++i) spf[i] = i;  // "not yet crossed" state

    for (long long p = 2; p * p <= limit; ++p) {
        if (spf[p] == p) {  // p is prime - nothing smaller divides it
            for (long long multiple = p * p; multiple <= limit; multiple += p) {
                if (spf[multiple] == multiple) spf[multiple] = static_cast<int>(p);
            }
        }
    }
    return spf;
}

// ============================================================================
// 4. Factorisation and divisor functions
// ============================================================================

// Prime factorisation as {prime: exponent}. O(sqrt n).
//
// Divide out each candidate completely before moving on - that is what makes
// every factor found prime: by the time i is tested, every prime below i has
// been fully removed, so if i still divides n it has no smaller prime factor.
//
// The trailing `if (n > 1)` is the case everyone forgets: any remainder above 1
// is a single prime larger than sqrt(original n). There can be at most one -
// two would multiply past n.
map<ll, int> factorize(ll n) {
    map<ll, int> factors;
    if (n < 0) n = -n;

    for (ll candidate : {2, 3}) {
        while (n % candidate == 0) { ++factors[candidate]; n /= candidate; }
    }

    for (ll i = 5; i * i <= n; i += 6) {  // 6k +/- 1 again
        for (ll candidate : {i, i + 2}) {
            while (n % candidate == 0) { ++factors[candidate]; n /= candidate; }
        }
    }

    if (n > 1) ++factors[n];  // leftover prime above sqrt(n)
    return factors;
}

// Factorise with a precomputed spf table. O(log n).
//
// Each division by spf[n] at least halves n, so at most log2(n) iterations.
map<ll, int> factorizeFast(int n, const vector<int>& spf) {
    map<ll, int> factors;
    while (n > 1) {
        int p = spf[n];
        while (n % p == 0) { ++factors[p]; n /= p; }
    }
    return factors;
}

// Number of positive divisors. O(sqrt n).
//
// If n == p1^a1 * p2^a2 ... a divisor picks an exponent independently for each
// prime: 0..a1, 0..a2, ... Multiply the choices: d(n) = (a1+1)(a2+1)...
//
// A perfect square is exactly a number with an ODD divisor count - every
// exponent is even, so every (ai+1) is odd. That is the "bulb switcher" trick.
ll countDivisors(ll n) {
    ll total = 1;
    for (const auto& [prime, exponent] : factorize(n)) {
        (void)prime;
        total *= exponent + 1;
    }
    return total;
}

// Sum of positive divisors. O(sqrt n).
//
// Same independence argument, but each prime contributes a geometric series:
//     sigma(n) = product over p of (p^(a+1) - 1) / (p - 1)
ll sumDivisors(ll n) {
    ll total = 1;
    for (const auto& [p, a] : factorize(n)) {
        ll power = 1;
        for (int i = 0; i <= a; ++i) power *= p;  // p^(a+1)
        total *= (power - 1) / (p - 1);
    }
    return total;
}

// phi(n) - how many of 1..n are coprime to n. O(sqrt n).
//
// Start from n and remove, for each distinct prime p | n, the 1/p fraction that
// p divides: phi(n) = n * product over distinct p|n of (1 - 1/p). That is
// inclusion-exclusion over the prime divisors, collapsed into a product.
//
// phi generalises Fermat to composite moduli: a^phi(m) == 1 (mod m) whenever
// gcd(a, m) == 1 - the basis of RSA.
//
// Written as `result -= result / p` to stay in integer arithmetic throughout.
ll eulerTotient(ll n) {
    ll result = n;
    for (const auto& [p, exponent] : factorize(n)) {
        (void)exponent;
        result -= result / p;  // exact: p divides result at this point
    }
    return result;
}

// ============================================================================
// 5. Matrix exponentiation - linear recurrences in O(log n)
// ============================================================================
using Matrix = vector<vector<ll>>;

// Standard O(n^3) product. mod == 0 means "no reduction".
Matrix matrixMultiply(const Matrix& a, const Matrix& b, ll mod = 0) {
    size_t n = a.size(), m = b.size(), p = b[0].size();
    Matrix result(n, vector<ll>(p, 0));

    for (size_t i = 0; i < n; ++i) {
        for (size_t k = 0; k < m; ++k) {
            if (a[i][k] == 0) continue;  // cheap skip; matters for sparse rows
            for (size_t j = 0; j < p; ++j) {
                if (mod) {
                    result[i][j] = (result[i][j] + mulMod(a[i][k], b[k][j], mod)) % mod;
                } else {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
    }
    return result;
}

// matrix^exponent by binary exponentiation. O(n^3 log exponent).
//
// Identical structure to modPow - squaring works for anything ASSOCIATIVE, and
// matrix multiplication is associative. Numbers were just the easy case.
Matrix matrixPower(Matrix matrix, ll exponent, ll mod = 0) {
    size_t n = matrix.size();
    Matrix result(n, vector<ll>(n, 0));
    for (size_t i = 0; i < n; ++i) result[i][i] = 1;  // identity

    while (exponent > 0) {
        if (exponent & 1) result = matrixMultiply(result, matrix, mod);
        matrix = matrixMultiply(matrix, matrix, mod);
        exponent >>= 1;
    }
    return result;
}

// The nth Fibonacci number in O(log n) instead of O(n).
//
// F(n) = F(n-1) + F(n-2) is a linear map, so one step is a matrix multiply:
//
//     | 1 1 | | F(n)   |   | F(n) + F(n-1) |   | F(n+1) |
//     | 1 0 | | F(n-1) | = | F(n)          | = | F(n)   |
//
// Applying it n times is that matrix to the nth power. Top-right entry of M^n
// is F(n).
//
// The same trick handles ANY linear recurrence: build the companion matrix and
// an O(n) DP collapses to O(k^3 log n). That is how "F(10^18) mod p" is meant
// to be solved.
ll fibonacci(ll n, ll mod = 0) {
    if (n <= 1) return mod ? n % mod : n;
    return matrixPower({{1, 1}, {1, 0}}, n, mod)[0][1];
}

// ============================================================================
// 6. Combinatorics mod a prime
// ============================================================================

// nCr mod a prime, O(n) precompute then O(1) per query.
//
// Pascal's triangle costs O(n^2) memory. Instead precompute factorials and
// their modular inverses:
//     nCr = n! / (r!(n-r)!)  ->  fact[n] * invFact[r] * invFact[n-r] mod p
//
// The inverse factorials come from ONE modular inverse plus a backward pass
// using invFact[i-1] == invFact[i] * i. Inverting each entry separately would
// cost an O(log p) exponentiation apiece.
//
// Requires a PRIME modulus (Fermat) and n < p - which is why the modulus is
// nearly always 1e9+7.
class Binomial {
public:
    explicit Binomial(int maxN, ll mod = 1000000007LL) : mod_(mod) {
        fact_.resize(maxN + 1);
        invFact_.resize(maxN + 1);

        fact_[0] = 1;
        for (int i = 1; i <= maxN; ++i) fact_[i] = mulMod(fact_[i - 1], i, mod);

        // One exponentiation for the largest, then walk down multiplying by i.
        invFact_[maxN] = modPow(fact_[maxN], mod - 2, mod);
        for (int i = maxN; i > 0; --i) invFact_[i - 1] = mulMod(invFact_[i], i, mod);
    }

    // nCr mod p. O(1).
    ll choose(int n, int r) const {
        if (r < 0 || r > n) return 0;  // not an error - genuinely zero
        return mulMod(mulMod(fact_[n], invFact_[r], mod_), invFact_[n - r], mod_);
    }

    // nPr mod p. O(1).
    ll permute(int n, int r) const {
        if (r < 0 || r > n) return 0;
        return mulMod(fact_[n], invFact_[n - r], mod_);
    }

private:
    ll mod_;
    vector<ll> fact_, invFact_;
};

// ============================================================================
// Self-check
// ============================================================================
int main() {
    mt19937_64 rng(20);
    const ll MOD = 1000000007LL;

    // --- GCD / LCM ----------------------------------------------------------
    assert(gcdOf(48, 18) == 6);
    assert(gcdOf(17, 5) == 1);                 // coprime
    assert(gcdOf(0, 7) == 7);                  // gcd(0, n) == n
    assert(lcmOf(4, 6) == 12);
    assert(lcmOf(0, 5) == 0);

    for (int t = 0; t < 200; ++t) {            // against the standard library
        ll a = rng() % 1000000, b = rng() % 1000000;
        assert(gcdOf(a, b) == std::gcd(a, b));
        if (a && b) assert(lcmOf(a, b) == std::lcm(a, b));
    }

    // --- Extended Euclid: verify Bezout's identity directly -----------------
    for (int t = 0; t < 200; ++t) {
        ll a = rng() % 1000000 + 1, b = rng() % 1000000 + 1;
        Bezout r = extendedGcd(a, b);
        assert(r.g == std::gcd(a, b));
        assert(a * r.x + b * r.y == r.g);      // the identity itself
    }

    // --- Modular exponentiation ---------------------------------------------
    assert(modPow(2, 10, 1000) == 24);         // 1024 mod 1000
    assert(modPow(3, 0, 7) == 1);              // anything^0 == 1
    assert(modPow(5, 3, 1) == 0);              // mod 1 collapses everything

    // Against a naive O(e) loop.
    for (int t = 0; t < 200; ++t) {
        ll b = rng() % 1000, e = rng() % 500, m = rng() % 10000 + 1;
        ll expected = 1 % m;
        for (ll i = 0; i < e; ++i) expected = expected * (b % m) % m;
        assert(modPow(b, e, m) == expected);
    }

    // --- Modular inverse ----------------------------------------------------
    for (int t = 0; t < 100; ++t) {
        ll a = rng() % 1000000 + 1;
        ll inv = modInverse(a, MOD);
        assert(mulMod(a, inv, MOD) == 1);
        assert(inv == modInverseFermat(a, MOD));   // both routes agree
    }

    assert(modInverse(3, 10) == 7);            // 3*7 == 21 == 1 mod 10
    bool threw = false;
    try {
        modInverse(4, 10);                     // gcd(4, 10) == 2, no inverse
    } catch (const invalid_argument&) {
        threw = true;
    }
    assert(threw);

    // --- Primality ----------------------------------------------------------
    vector<int> small;
    for (int n = 2; n < 30; ++n) if (isPrime(n)) small.push_back(n);
    assert((small == vector<int>{2, 3, 5, 7, 11, 13, 17, 19, 23, 29}));
    assert(!isPrime(1) && !isPrime(0) && !isPrime(-7));
    assert(isPrime(104729));                   // the 10000th prime

    vector<int> primes = sieveOfEratosthenes(1000);
    assert(primes.size() == 168);              // pi(1000) == 168
    assert(primes.front() == 2 && primes.back() == 997);
    assert(sieveOfEratosthenes(1).empty());

    // Sieve, trial division and Miller-Rabin must agree on every n up to 2000.
    vector<char> isPrimeTable(2001, 0);
    for (int p : sieveOfEratosthenes(2000)) isPrimeTable[p] = 1;
    for (int n = 0; n <= 2000; ++n) {
        assert(isPrime(n) == static_cast<bool>(isPrimeTable[n]));
        assert(isPrimeMillerRabin(n) == static_cast<bool>(isPrimeTable[n]));
    }

    // Miller-Rabin where trial division would be hopeless.
    assert(isPrimeMillerRabin((1LL << 61) - 1));      // Mersenne prime
    assert(!isPrimeMillerRabin((1LL << 61) - 3));
    assert(!isPrimeMillerRabin(3215031751LL));        // strong pseudoprime to 2,3,5,7

    // --- Smallest prime factors ---------------------------------------------
    vector<int> spf = smallestPrimeFactors(1000);
    assert(spf[2] == 2 && spf[15] == 3 && spf[49] == 7);
    for (int i = 2; i <= 1000; ++i) {
        assert((spf[i] == i) == static_cast<bool>(isPrimeTable[i]));
    }

    // --- Factorisation ------------------------------------------------------
    assert((factorize(12) == map<ll, int>{{2, 2}, {3, 1}}));
    assert((factorize(97) == map<ll, int>{{97, 1}}));  // prime
    assert(factorize(1).empty());
    assert((factorize(1024) == map<ll, int>{{2, 10}}));
    assert((factorize(999999937LL) == map<ll, int>{{999999937LL, 1}}));  // big prime

    for (int n = 2; n < 1000; ++n) {           // both routes, and the product
        map<ll, int> expected = factorize(n);
        assert(factorizeFast(n, spf) == expected);
        ll product = 1;
        for (const auto& [p, e] : expected) {
            assert(isPrime(p));                // every factor really is prime
            for (int i = 0; i < e; ++i) product *= p;
        }
        assert(product == n);                  // and they multiply back
    }

    // --- Divisor functions, checked by brute force --------------------------
    for (int n = 1; n < 500; ++n) {
        ll count = 0, total = 0, coprime = 0;
        for (int d = 1; d <= n; ++d) {
            if (n % d == 0) { ++count; total += d; }
            if (std::gcd(d, n) == 1) ++coprime;
        }
        assert(countDivisors(n) == count);
        assert(sumDivisors(n) == total);
        assert(eulerTotient(n) == coprime);
    }

    assert(countDivisors(36) == 9);            // 36 == 6^2, a perfect square
    assert(sumDivisors(28) == 56);             // perfect number: sigma == 2n
    assert(eulerTotient(10) == 4);             // 1, 3, 7, 9

    // Euler's theorem, which totient exists to state.
    for (int t = 0; t < 50; ++t) {
        ll m = rng() % 999 + 2, a = rng() % 1000 + 1;
        if (std::gcd(a, m) == 1) assert(modPow(a, eulerTotient(m), m) == 1);
    }

    // --- Matrix exponentiation ----------------------------------------------
    assert((matrixMultiply({{1, 2}, {3, 4}}, {{5, 6}, {7, 8}})
            == Matrix{{19, 22}, {43, 50}}));
    assert((matrixPower({{1, 1}, {1, 0}}, 1) == Matrix{{1, 1}, {1, 0}}));
    assert((matrixPower({{3, 7}, {2, 5}}, 0) == Matrix{{1, 0}, {0, 1}}));  // identity

    // Against the O(n) iterative Fibonacci. Stop at 90: F(93) overflows int64,
    // which is exactly why the modular version exists.
    ll a = 0, b = 1;
    for (int n = 0; n <= 90; ++n) {
        assert(fibonacci(n) == a);
        ll next = a + b;
        a = b;
        b = next;
    }
    assert(fibonacci(10) == 55);
    assert(fibonacci(90) == 2880067194370816120LL);

    // The modular path must agree with reducing the exact value.
    for (int n = 0; n <= 90; ++n) assert(fibonacci(n, MOD) == fibonacci(n) % MOD);

    // F(10^18) mod p - an O(n) DP would need 10^18 steps; this returns
    // instantly and still satisfies gcd(F(m), F(n)) == F(gcd(m, n)).
    ll huge = fibonacci(1000000000000000000LL, MOD);
    assert(huge >= 0 && huge < MOD);
    assert(std::gcd(fibonacci(24), fibonacci(36)) == fibonacci(std::gcd(24, 36)));

    // --- Binomial coefficients ----------------------------------------------
    Binomial binom(1000);
    assert(binom.choose(5, 2) == 10);
    assert(binom.choose(10, 0) == 1);
    assert(binom.choose(10, 11) == 0);         // r > n
    assert(binom.permute(5, 2) == 20);

    // Against Pascal's triangle - an independent O(n^2) reference.
    vector<vector<ll>> pascal(60, vector<ll>(60, 0));
    for (int n = 0; n < 60; ++n) {
        pascal[n][0] = 1;
        for (int r = 1; r <= n; ++r) {
            pascal[n][r] = (pascal[n - 1][r - 1] + pascal[n - 1][r]) % MOD;
        }
        for (int r = 0; r <= n; ++r) assert(binom.choose(n, r) == pascal[n][r]);
    }

    // Pascal's rule at a scale the O(n^2) table could not reach.
    for (int n = 1; n < 200; ++n) {
        for (int r = 1; r < n; ++r) {
            assert(binom.choose(n, r)
                   == (binom.choose(n - 1, r - 1) + binom.choose(n - 1, r)) % MOD);
        }
    }

    cout << "20-Math-and-Number-Theory (C++): all checks passed\n";
    cout << "  GCD/Bezout, modPow, inverses, sieve, Miller-Rabin, factorisation,\n";
    cout << "  totient and matrix exponentiation all cross-checked against brute force\n";
    return 0;
}
