// 20 - Math and Number Theory: GCD, modular arithmetic, sieves, factorisation
// and matrix exponentiation - each cross-checked against brute force.
//
// Run:  go run number_theory.go
package main

import (
	"fmt"
	"math/bits"
	"math/rand"
	"sort"
)

// ============================================================================
// 1. Euclidean algorithm - GCD and LCM
// ============================================================================

// GCD returns the greatest common divisor. O(log min(a, b)).
//
// Rests on one identity: gcd(a, b) == gcd(b, a mod b). Any d dividing a and b
// also divides a - qb (= a mod b), and any d dividing b and a mod b divides
// qb + (a mod b) = a - so both pairs have exactly the same set of common
// divisors, hence the same greatest one. The worst case is consecutive
// Fibonacci numbers (Lame's theorem), still O(log n).
//
// Go has no gcd in the standard library for plain ints (math/big has one for
// big.Int), so this gets written out by hand every time.
func GCD(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	if a < 0 {
		return -a
	}
	return a
}

// LCM returns the least common multiple. O(log min(a, b)).
//
// From a*b == gcd(a,b) * lcm(a,b). DIVIDE BEFORE MULTIPLYING - Go's int
// overflows silently and wraps, so a*b would be garbage long before the
// quotient form would.
func LCM(a, b int) int {
	if a == 0 || b == 0 {
		return 0
	}
	abs := func(x int) int {
		if x < 0 {
			return -x
		}
		return x
	}
	return abs(a) / GCD(a, b) * abs(b)
}

// ExtendedGCD returns (g, x, y) with a*x + b*y == g == gcd(a, b).
//
// Bezout's identity: the gcd is always expressible as an integer combination of
// the inputs. Plain Euclid throws that combination away; this version keeps it.
//
// Each row (r, s, t) maintains the invariant a*s + b*t == r. Start with
// (a, 1, 0) and (b, 0, 1) - both trivially true - and apply the same
// subtraction to all three columns. When r reaches 0, the previous row holds
// the gcd and its coefficients.
//
// This is what makes modular inverses computable for ANY modulus, not just
// primes.
func ExtendedGCD(a, b int) (g, x, y int) {
	oldR, r := a, b
	oldS, s := 1, 0
	oldT, t := 0, 1

	for r != 0 {
		q := oldR / r
		oldR, r = r, oldR-q*r
		oldS, s = s, oldS-q*s
		oldT, t = t, oldT-q*t
	}
	return oldR, oldS, oldT
}

// ============================================================================
// 2. Modular arithmetic
// ============================================================================

// mulMod returns (a * b) mod m without overflow.
//
// This is the tax Go pays that Python does not: a*b for values near 2^62 wraps
// silently and the result is meaningless. math/bits gives the full 128-bit
// product and a 128-by-64 division, so the intermediate never has to fit in 64
// bits.
//
// bits.Div64 panics when the high word is >= the divisor, hence the hi%m -
// which is safe because (hi mod m)*2^64 + lo is congruent to the true product.
func mulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	_, rem := bits.Div64(hi%m, lo, m)
	return rem
}

// ModPow returns base^exponent mod modulus in O(log exponent).
//
// Binary exponentiation. Write the exponent in binary: 13 = 1101b = 8 + 4 + 1,
// so x^13 == x^8 * x^4 * x^1. Walk the exponent's bits from the bottom,
// squaring a running base each step (x, x^2, x^4, x^8 ...) and multiplying it
// in whenever the bit is set. O(log e) multiplications instead of e of them.
//
// Reducing mod m at every step is what keeps the numbers bounded - without it
// x^e is astronomically large before any reduction happens.
func ModPow(base, exponent, modulus int) int {
	if modulus == 1 {
		return 0 // everything is congruent to 0 mod 1
	}

	m := uint64(modulus)
	b := uint64(((base % modulus) + modulus) % modulus)
	e := uint64(exponent)
	result := uint64(1)

	for e > 0 {
		if e&1 == 1 { // this bit of the exponent is set
			result = mulMod(result, b, m)
		}
		b = mulMod(b, b, m) // square for the next bit up
		e >>= 1
	}
	return int(result)
}

// ModInverse returns the x with a*x == 1 (mod m), or an error if none exists.
//
// Division does not exist in modular arithmetic - multiplying by the inverse
// replaces it. Needed for nCr mod p and any "answer mod 1e9+7" involving a
// quotient.
//
// Extended Euclid, so it works for ANY modulus, prime or not. From
// a*x + m*y == gcd(a, m) == 1, reducing mod m kills the m*y term and leaves
// a*x == 1 (mod m).
//
// Returns an error rather than a wrong number when gcd(a, m) != 1 - that is a
// real condition worth surfacing, and Go's multiple returns make it cheap.
func ModInverse(a, m int) (int, error) {
	g, x, _ := ExtendedGCD(((a%m)+m)%m, m)
	if g != 1 {
		return 0, fmt.Errorf("no inverse of %d mod %d: gcd is %d, not 1", a, m, g)
	}
	return ((x % m) + m) % m, nil // normalise a possibly-negative coefficient
}

// ModInverseFermat returns the inverse mod a PRIME p. O(log p).
//
// Fermat's little theorem: a^(p-1) == 1 (mod p) for prime p and a not divisible
// by p. Divide both sides by a: a^(p-2) == a^-1 (mod p).
//
// One line, but valid only for prime moduli. ModInverse is the general tool;
// this is the one everybody actually writes, because the modulus is nearly
// always 1e9+7.
func ModInverseFermat(a, p int) int {
	return ModPow(a, p-2, p)
}

// ============================================================================
// 3. Primality
// ============================================================================

// IsPrime tests primality by trial division. O(sqrt n).
//
// Two prunings make it fast enough for single queries:
//
//	Only test up to sqrt(n). If n == a*b with a <= b then a <= sqrt(n), so
//	any composite has a factor at or below its square root.
//
//	Only test 6k +/- 1. Every integer is one of 6k, 6k+1 ... 6k+5; the forms
//	6k, 6k+2, 6k+4 are even and 6k+3 divides by 3. After handling 2 and 3 by
//	hand, only two of every six candidates remain.
func IsPrime(n int) bool {
	if n < 2 {
		return false
	}
	if n < 4 {
		return true // 2 and 3
	}
	if n%2 == 0 || n%3 == 0 {
		return false
	}

	for i := 5; i*i <= n; i += 6 { // i*i beats sqrt(): no float rounding
		if n%i == 0 || n%(i+2) == 0 {
			return false
		}
	}
	return true
}

// IsPrimeMillerRabin is a deterministic primality test for every n < 3.3e24.
//
// Trial division is O(sqrt n) - hopeless for a 64-bit number. Miller-Rabin uses
// Fermat's theorem sharpened by the fact that the only square roots of 1 modulo
// a prime are +1 and -1.
//
// Write n-1 = d * 2^s with d odd. For a prime n and any base a, the sequence
//
//	a^d, a^2d, a^4d, ..., a^(2^s * d) == a^(n-1)
//
// must end at 1, and the first time it reaches 1 it has to arrive from -1. A
// composite that fails this for base a is proven composite; a is a WITNESS.
//
// A witness may exist but be missed by a bad base choice, so the test is
// probabilistic in general - but the first 12 primes as bases catch every
// composite below 3.3e24, making it fully deterministic across the 64-bit range.
func IsPrimeMillerRabin(n int) bool {
	bases := []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}

	if n < 2 {
		return false
	}
	for _, p := range bases {
		if n%p == 0 {
			return n == p // p is prime; any other multiple of it is not
		}
	}

	d, s := n-1, 0
	for d%2 == 0 { // strip factors of 2: n-1 == d * 2^s
		d /= 2
		s++
	}

	for _, a := range bases {
		x := uint64(ModPow(a, d, n))
		if x == 1 || x == uint64(n-1) {
			continue // this base says "probably prime"
		}

		witnessed := true
		for i := 0; i < s-1; i++ {
			x = mulMod(x, x, uint64(n))
			if x == uint64(n-1) {
				witnessed = false // reached -1, so no contradiction
				break
			}
		}
		if witnessed {
			return false // never hit -1: a proves n composite
		}
	}
	return true
}

// SieveOfEratosthenes returns all primes <= limit. O(n log log n), O(n) space.
//
// Trial-dividing every number is O(n sqrt n). The sieve inverts it: take each
// prime and cross off its multiples, so every composite is struck by its prime
// factors rather than searched for.
//
// Two standard optimisations, both here:
//
//	Start crossing off at p*p - 2p, 3p ... (p-1)p were already struck by the
//	smaller primes 2, 3 ... p-1.
//
//	Stop the outer loop at sqrt(limit) - beyond that p*p exceeds the limit.
//
// The n log log n comes from summing n/p over primes p <= n; that sum grows
// like log log n, which is below 4 for any n that fits in memory.
func SieveOfEratosthenes(limit int) []int {
	if limit < 2 {
		return []int{}
	}

	isComposite := make([]bool, limit+1)
	for p := 2; p*p <= limit; p++ {
		if !isComposite[p] {
			for multiple := p * p; multiple <= limit; multiple += p {
				isComposite[multiple] = true
			}
		}
	}

	primes := []int{}
	for i := 2; i <= limit; i++ {
		if !isComposite[i] {
			primes = append(primes, i)
		}
	}
	return primes
}

// SmallestPrimeFactors returns spf where spf[i] is the smallest prime dividing
// i. O(n log log n).
//
// A sieve that records WHICH prime crossed each number off instead of merely
// that something did. That one extra field turns factorisation from O(sqrt n)
// per query into O(log n) per query - see FactorizeFast.
//
// Worth precomputing when many numbers in a fixed range need factorising; not
// worth it for one large number.
func SmallestPrimeFactors(limit int) []int {
	spf := make([]int, limit+1)
	for i := range spf {
		spf[i] = i // "not yet crossed off" state
	}

	for p := 2; p*p <= limit; p++ {
		if spf[p] == p { // p is prime - nothing smaller divides it
			for multiple := p * p; multiple <= limit; multiple += p {
				if spf[multiple] == multiple {
					spf[multiple] = p // the first prime to reach it is the smallest
				}
			}
		}
	}
	return spf
}

// ============================================================================
// 4. Factorisation and divisor functions
// ============================================================================

// Factorize returns the prime factorisation as prime -> exponent. O(sqrt n).
//
// Divide out each candidate completely before moving on. That is what
// guarantees every factor found is prime: by the time i is tested, every prime
// below i has already been fully removed, so if i still divides n it cannot
// have a smaller prime factor.
//
// The trailing `if n > 1` is the case everyone forgets: after the loop, any
// remainder above 1 is a single prime larger than sqrt(original n). There can
// be at most one such factor - two would multiply past n.
func Factorize(n int) map[int]int {
	factors := map[int]int{}
	if n < 0 {
		n = -n
	}

	for _, candidate := range []int{2, 3} {
		for n%candidate == 0 {
			factors[candidate]++
			n /= candidate
		}
	}

	for i := 5; i*i <= n; i += 6 { // 6k +/- 1 again
		for _, candidate := range []int{i, i + 2} {
			for n%candidate == 0 {
				factors[candidate]++
				n /= candidate
			}
		}
	}

	if n > 1 {
		factors[n]++ // leftover prime above sqrt(n)
	}
	return factors
}

// FactorizeFast factorises using a precomputed spf table. O(log n).
//
// Each division by spf[n] at least halves n, so the loop runs at most log2(n)
// times - a 10^6-entry table answers a million queries in about the time one
// trial division would take.
func FactorizeFast(n int, spf []int) map[int]int {
	factors := map[int]int{}
	for n > 1 {
		p := spf[n]
		for n%p == 0 {
			factors[p]++
			n /= p
		}
	}
	return factors
}

// CountDivisors returns the number of positive divisors. O(sqrt n).
//
// If n == p1^a1 * p2^a2 ... then a divisor picks an exponent independently for
// each prime: 0..a1 for p1, 0..a2 for p2, and so on. Multiply the choices:
//
//	d(n) = (a1 + 1)(a2 + 1)...
//
// A perfect square is exactly a number with an ODD divisor count - every
// exponent is even, so every (ai + 1) is odd. That is the "bulb switcher" trick.
func CountDivisors(n int) int {
	total := 1
	for _, exponent := range Factorize(n) {
		total *= exponent + 1
	}
	return total
}

// SumDivisors returns the sum of positive divisors. O(sqrt n).
//
// Same independence argument, but each prime contributes a geometric series:
//
//	sigma(n) = product over p of (p^(a+1) - 1) / (p - 1)
//
// Expanding that product generates every divisor exactly once.
func SumDivisors(n int) int {
	total := 1
	for p, a := range Factorize(n) {
		power := 1
		for i := 0; i <= a; i++ {
			power *= p // p^(a+1)
		}
		total *= (power - 1) / (p - 1)
	}
	return total
}

// EulerTotient returns phi(n) - how many of 1..n are coprime to n. O(sqrt n).
//
// Start from n and remove, for each distinct prime p | n, the 1/p fraction of
// numbers that p divides:
//
//	phi(n) = n * product over distinct p|n of (1 - 1/p)
//
// That is inclusion-exclusion over the prime divisors, collapsed into a product
// because the conditions are independent.
//
// phi is what generalises Fermat's little theorem to composite moduli:
// a^phi(m) == 1 (mod m) whenever gcd(a, m) == 1 - the basis of RSA.
//
// Written as `result -= result / p` to stay in integer arithmetic throughout.
func EulerTotient(n int) int {
	result := n
	for p := range Factorize(n) {
		result -= result / p // exact: p divides result at this point
	}
	return result
}

// ============================================================================
// 5. Matrix exponentiation - linear recurrences in O(log n)
// ============================================================================

// Matrix is a dense 2-D integer matrix.
type Matrix [][]int

// MatrixMultiply is the standard O(n^3) product. mod == 0 means no reduction.
func MatrixMultiply(a, b Matrix, mod int) Matrix {
	n, m, p := len(a), len(b), len(b[0])
	result := make(Matrix, n)
	for i := range result {
		result[i] = make([]int, p)
	}

	for i := 0; i < n; i++ {
		for k := 0; k < m; k++ {
			if a[i][k] == 0 {
				continue // cheap skip; matters for sparse rows
			}
			for j := 0; j < p; j++ {
				if mod != 0 {
					term := mulMod(uint64(a[i][k]), uint64(b[k][j]), uint64(mod))
					result[i][j] = (result[i][j] + int(term)) % mod
				} else {
					result[i][j] += a[i][k] * b[k][j]
				}
			}
		}
	}
	return result
}

// MatrixPower raises a matrix to a power by binary exponentiation.
// O(n^3 log exponent).
//
// Identical structure to ModPow - squaring works for anything ASSOCIATIVE, and
// matrix multiplication is associative. Numbers were just the easy case.
func MatrixPower(matrix Matrix, exponent, mod int) Matrix {
	n := len(matrix)
	result := make(Matrix, n)
	for i := range result {
		result[i] = make([]int, n)
		result[i][i] = 1 // identity
	}

	for exponent > 0 {
		if exponent&1 == 1 {
			result = MatrixMultiply(result, matrix, mod)
		}
		matrix = MatrixMultiply(matrix, matrix, mod)
		exponent >>= 1
	}
	return result
}

// Fibonacci returns the nth Fibonacci number in O(log n) instead of O(n).
// mod == 0 means no reduction.
//
// The recurrence F(n) = F(n-1) + F(n-2) is a linear map, so one step is a
// matrix multiply:
//
//	| 1 1 | | F(n)   |   | F(n) + F(n-1) |   | F(n+1) |
//	| 1 0 | | F(n-1) | = | F(n)          | = | F(n)   |
//
// Applying it n times is that matrix raised to the nth power, and binary
// exponentiation gets there in log n multiplications. The top-right entry of
// M^n is F(n).
//
// The same trick handles ANY linear recurrence - build the companion matrix and
// an O(n) DP collapses to O(k^3 log n). That is how problems asking for F(10^18)
// mod p are meant to be solved.
func Fibonacci(n, mod int) int {
	if n <= 1 {
		if mod != 0 {
			return n % mod
		}
		return n
	}
	return MatrixPower(Matrix{{1, 1}, {1, 0}}, n, mod)[0][1]
}

// ============================================================================
// 6. Combinatorics mod a prime
// ============================================================================

// Binomial answers nCr mod a prime in O(1) after an O(n) precompute.
//
// Pascal's triangle costs O(n^2) memory. Instead precompute factorials and
// their modular inverses:
//
//	nCr = n! / (r!(n-r)!)  ->  fact[n] * invFact[r] * invFact[n-r] mod p
//
// The inverse factorials come from ONE modular inverse plus a backward pass,
// using invFact[i-1] == invFact[i] * i. Computing each inverse separately would
// cost an O(log p) exponentiation per entry.
//
// Requires a PRIME modulus (Fermat's theorem) and n < p, which is why the
// modulus is nearly always 1e9+7 - comfortably larger than any n in range.
type Binomial struct {
	mod     int
	fact    []int
	invFact []int
}

// NewBinomial precomputes factorial tables up to maxN. O(maxN).
func NewBinomial(maxN, mod int) *Binomial {
	b := &Binomial{
		mod:     mod,
		fact:    make([]int, maxN+1),
		invFact: make([]int, maxN+1),
	}

	b.fact[0] = 1
	for i := 1; i <= maxN; i++ {
		b.fact[i] = int(mulMod(uint64(b.fact[i-1]), uint64(i), uint64(mod)))
	}

	// One exponentiation for the largest, then walk down multiplying by i.
	b.invFact[maxN] = ModPow(b.fact[maxN], mod-2, mod)
	for i := maxN; i > 0; i-- {
		b.invFact[i-1] = int(mulMod(uint64(b.invFact[i]), uint64(i), uint64(mod)))
	}
	return b
}

// Choose returns nCr mod p. O(1).
func (b *Binomial) Choose(n, r int) int {
	if r < 0 || r > n {
		return 0 // not an error - it is genuinely zero
	}
	m := uint64(b.mod)
	return int(mulMod(mulMod(uint64(b.fact[n]), uint64(b.invFact[r]), m),
		uint64(b.invFact[n-r]), m))
}

// Permute returns nPr mod p. O(1).
func (b *Binomial) Permute(n, r int) int {
	if r < 0 || r > n {
		return 0
	}
	return int(mulMod(uint64(b.fact[n]), uint64(b.invFact[n-r]), uint64(b.mod)))
}

// ============================================================================
// Self-check
// ============================================================================

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func sortedKeys(m map[int]int) []int {
	keys := make([]int, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Ints(keys)
	return keys
}

func sameMap(a, b map[int]int) bool {
	if len(a) != len(b) {
		return false
	}
	for k, v := range a {
		if b[k] != v {
			return false
		}
	}
	return true
}

func main() {
	rng := rand.New(rand.NewSource(20))
	const MOD = 1000000007

	// --- GCD / LCM ----------------------------------------------------------
	assert(GCD(48, 18) == 6, "gcd(48,18)")
	assert(GCD(17, 5) == 1, "coprime")
	assert(GCD(0, 7) == 7, "gcd(0,n) == n")
	assert(LCM(4, 6) == 12, "lcm(4,6)")
	assert(LCM(0, 5) == 0, "lcm with zero")

	// Go has no math.Gcd, so check the defining properties: g divides both, and
	// dividing it out leaves a coprime pair (so g really is the GREATEST).
	for t := 0; t < 200; t++ {
		a, b := rng.Intn(1000000)+1, rng.Intn(1000000)+1
		g := GCD(a, b)
		assert(a%g == 0 && b%g == 0, "gcd divides both")
		assert(GCD(a/g, b/g) == 1, "quotients are coprime")
		assert(LCM(a, b) == a/g*b, "gcd*lcm == a*b")
	}

	// --- Extended Euclid: verify Bezout's identity directly -----------------
	for t := 0; t < 200; t++ {
		a, b := rng.Intn(1000000)+1, rng.Intn(1000000)+1
		g, x, y := ExtendedGCD(a, b)
		assert(g == GCD(a, b), "extended gcd agrees with plain")
		assert(a*x+b*y == g, "Bezout identity holds")
	}

	// --- Modular exponentiation ---------------------------------------------
	assert(ModPow(2, 10, 1000) == 24, "1024 mod 1000")
	assert(ModPow(3, 0, 7) == 1, "anything^0 == 1")
	assert(ModPow(5, 3, 1) == 0, "mod 1 collapses everything")

	// Against a naive O(e) loop.
	for t := 0; t < 200; t++ {
		b, e, m := rng.Intn(1000), rng.Intn(500), rng.Intn(10000)+1
		expected := 1 % m
		for i := 0; i < e; i++ {
			expected = expected * (b % m) % m
		}
		assert(ModPow(b, e, m) == expected, "modPow matches naive loop")
	}

	// --- Modular inverse ----------------------------------------------------
	for t := 0; t < 100; t++ {
		a := rng.Intn(1000000) + 1
		inv, err := ModInverse(a, MOD)
		assert(err == nil, "inverse exists mod a prime")
		assert(int(mulMod(uint64(a), uint64(inv), MOD)) == 1, "a * a^-1 == 1")
		assert(inv == ModInverseFermat(a, MOD), "both routes agree")
	}

	inv, err := ModInverse(3, 10)
	assert(err == nil && inv == 7, "3*7 == 21 == 1 mod 10")
	_, err = ModInverse(4, 10) // gcd(4, 10) == 2, no inverse
	assert(err != nil, "no inverse when gcd != 1")

	// --- Primality ----------------------------------------------------------
	small := []int{}
	for n := 2; n < 30; n++ {
		if IsPrime(n) {
			small = append(small, n)
		}
	}
	assert(fmt.Sprint(small) == "[2 3 5 7 11 13 17 19 23 29]", "primes below 30")
	assert(!IsPrime(1) && !IsPrime(0) && !IsPrime(-7), "non-primes")
	assert(IsPrime(104729), "the 10000th prime")

	primes := SieveOfEratosthenes(1000)
	assert(len(primes) == 168, "pi(1000) == 168")
	assert(primes[0] == 2 && primes[len(primes)-1] == 997, "sieve endpoints")
	assert(len(SieveOfEratosthenes(1)) == 0, "no primes below 2")

	// Sieve, trial division and Miller-Rabin must agree on every n up to 2000.
	primeSet := map[int]struct{}{}
	for _, p := range SieveOfEratosthenes(2000) {
		primeSet[p] = struct{}{}
	}
	for n := 0; n <= 2000; n++ {
		_, expected := primeSet[n]
		assert(IsPrime(n) == expected, "trial division matches sieve")
		assert(IsPrimeMillerRabin(n) == expected, "Miller-Rabin matches sieve")
	}

	// Miller-Rabin where trial division would be hopeless.
	assert(IsPrimeMillerRabin(1<<61-1), "Mersenne prime 2^61-1")
	assert(!IsPrimeMillerRabin(1<<61-3), "2^61-3 is composite")
	assert(!IsPrimeMillerRabin(3215031751), "strong pseudoprime to 2,3,5,7")

	// --- Smallest prime factors ---------------------------------------------
	spf := SmallestPrimeFactors(1000)
	assert(spf[2] == 2 && spf[15] == 3 && spf[49] == 7, "spf entries")
	for i := 2; i <= 1000; i++ {
		_, isP := primeSet[i]
		assert((spf[i] == i) == isP, "spf[i] == i exactly for primes")
	}

	// --- Factorisation ------------------------------------------------------
	assert(sameMap(Factorize(12), map[int]int{2: 2, 3: 1}), "12 == 2^2 * 3")
	assert(sameMap(Factorize(97), map[int]int{97: 1}), "97 is prime")
	assert(len(Factorize(1)) == 0, "1 has no prime factors")
	assert(sameMap(Factorize(1024), map[int]int{2: 10}), "1024 == 2^10")
	assert(sameMap(Factorize(999999937), map[int]int{999999937: 1}), "large prime")

	for n := 2; n < 1000; n++ { // both routes, and the product
		expected := Factorize(n)
		assert(sameMap(FactorizeFast(n, spf), expected), "spf route agrees")
		product := 1
		for _, p := range sortedKeys(expected) {
			assert(IsPrime(p), "every factor is prime")
			for i := 0; i < expected[p]; i++ {
				product *= p
			}
		}
		assert(product == n, "factors multiply back to n")
	}

	// --- Divisor functions, checked by brute force --------------------------
	for n := 1; n < 500; n++ {
		count, total, coprime := 0, 0, 0
		for d := 1; d <= n; d++ {
			if n%d == 0 {
				count++
				total += d
			}
			if GCD(d, n) == 1 {
				coprime++
			}
		}
		assert(CountDivisors(n) == count, "divisor count")
		assert(SumDivisors(n) == total, "divisor sum")
		assert(EulerTotient(n) == coprime, "totient counts coprimes")
	}

	assert(CountDivisors(36) == 9, "36 is a perfect square: odd divisor count")
	assert(SumDivisors(28) == 56, "28 is perfect: sigma == 2n")
	assert(EulerTotient(10) == 4, "phi(10) == |{1,3,7,9}|")

	// Euler's theorem, which totient exists to state.
	for t := 0; t < 50; t++ {
		m, a := rng.Intn(999)+2, rng.Intn(1000)+1
		if GCD(a, m) == 1 {
			assert(ModPow(a, EulerTotient(m), m) == 1, "a^phi(m) == 1 mod m")
		}
	}

	// --- Matrix exponentiation ----------------------------------------------
	product := MatrixMultiply(Matrix{{1, 2}, {3, 4}}, Matrix{{5, 6}, {7, 8}}, 0)
	assert(fmt.Sprint(product) == "[[19 22] [43 50]]", "matrix product")
	identity := MatrixPower(Matrix{{3, 7}, {2, 5}}, 0, 0)
	assert(fmt.Sprint(identity) == "[[1 0] [0 1]]", "M^0 is the identity")

	// Against the O(n) iterative Fibonacci. Stop at 90: F(93) overflows int64,
	// which is exactly why the modular version exists.
	a, b := 0, 1
	for n := 0; n <= 90; n++ {
		assert(Fibonacci(n, 0) == a, "matrix Fibonacci matches the DP")
		a, b = b, a+b
	}
	assert(Fibonacci(10, 0) == 55, "F(10) == 55")
	assert(Fibonacci(90, 0) == 2880067194370816120, "F(90)")

	// The modular path must agree with reducing the exact value.
	for n := 0; n <= 90; n++ {
		assert(Fibonacci(n, MOD) == Fibonacci(n, 0)%MOD, "modular path agrees")
	}

	// F(10^18) mod p - an O(n) DP would need 10^18 steps; this returns instantly
	// and still satisfies gcd(F(m), F(n)) == F(gcd(m, n)).
	huge := Fibonacci(1000000000000000000, MOD)
	assert(huge >= 0 && huge < MOD, "F(10^18) mod p is in range")
	assert(GCD(Fibonacci(24, 0), Fibonacci(36, 0)) == Fibonacci(GCD(24, 36), 0),
		"gcd(F(m), F(n)) == F(gcd(m, n))")

	// --- Binomial coefficients ----------------------------------------------
	binom := NewBinomial(1000, MOD)
	assert(binom.Choose(5, 2) == 10, "5C2")
	assert(binom.Choose(10, 0) == 1, "nC0 == 1")
	assert(binom.Choose(10, 11) == 0, "r > n is zero")
	assert(binom.Permute(5, 2) == 20, "5P2")

	// Against Pascal's triangle - an independent O(n^2) reference.
	pascal := make([][]int, 60)
	for n := 0; n < 60; n++ {
		pascal[n] = make([]int, 61)
		pascal[n][0] = 1
		for r := 1; r <= n; r++ {
			pascal[n][r] = (pascal[n-1][r-1] + pascal[n-1][r]) % MOD
		}
		for r := 0; r <= n; r++ {
			assert(binom.Choose(n, r) == pascal[n][r], "nCr matches Pascal")
		}
	}

	// Pascal's rule at a scale the O(n^2) table could not reach.
	for n := 1; n < 200; n++ {
		for r := 1; r < n; r++ {
			assert(binom.Choose(n, r) ==
				(binom.Choose(n-1, r-1)+binom.Choose(n-1, r))%MOD, "Pascal's rule")
		}
	}

	fmt.Println("20-Math-and-Number-Theory (Go): all checks passed")
	fmt.Println("  GCD/Bezout, ModPow, inverses, sieve, Miller-Rabin, factorisation,")
	fmt.Println("  totient and matrix exponentiation all cross-checked against brute force")
}
