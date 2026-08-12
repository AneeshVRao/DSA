# Practice Problems - 20 Math and Number Theory (C++)

The tell: **the input is a number, not a collection.** If `n` can be `10^18`, no
`O(n)` loop will finish - the answer has to come from divisibility, congruence
or a recurrence.

## GCD, LCM and Bezout
| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Greatest Common Divisor of Strings | The answer's length is `gcd(len(a), len(b))` - if a common divisor exists at all. | [LeetCode 1071](https://leetcode.com/problems/greatest-common-divisor-of-strings/) |
| 2 | Find Greatest Common Divisor of Array | Only min and max matter. | [LeetCode 1979](https://leetcode.com/problems/find-greatest-common-divisor-of-array/) |
| 3 | Water and Jug Problem | Bezout: `z` is reachable iff `gcd(x, y)` divides it. | [LeetCode 365](https://leetcode.com/problems/water-and-jug-problem/) |
| 4 | Check if Point Is Reachable | Every move preserves whether `gcd` is a power of two. | [LeetCode 2543](https://leetcode.com/problems/check-if-point-is-reachable/) |
| 5 | Nth Magical Number | Binary search on the answer; count with `lcm` and inclusion-exclusion. | [LeetCode 878](https://leetcode.com/problems/nth-magical-number/) |

## Modular exponentiation
| # | Problem | Hint | Link |
|---|---------|------|------|
| 6 | Pow(x, n) | Binary exponentiation; watch `n == -2^31`. | [LeetCode 50](https://leetcode.com/problems/powx-n/) |
| 7 | Count Good Numbers | `5^ceil(n/2) * 4^floor(n/2)` mod p - pure `mod_pow`. | [LeetCode 1922](https://leetcode.com/problems/count-good-numbers/) |
| 8 | Super Pow | The exponent arrives as a digit array; peel it one digit at a time. | [LeetCode 372](https://leetcode.com/problems/super-pow/) |
| 9 | Minimum Non-Zero Product of the Array Elements | Pair the extremes, then one `mod_pow`. Note `p-2` for the inverse. | [LeetCode 1969](https://leetcode.com/problems/minimum-non-zero-product-of-the-array-elements/) |

## Primes, sieves and factorisation
| # | Problem | Hint | Link |
|---|---------|------|------|
| 10 | Count Primes | Straight sieve; start crossing off at `p*p`. | [LeetCode 204](https://leetcode.com/problems/count-primes/) |
| 11 | Prime Arrangements | Sieve to count primes, then `p! * (n-p)!` mod `10^9+7`. | [LeetCode 1175](https://leetcode.com/problems/prime-arrangements/) |
| 12 | Distinct Prime Factors of Product of Array | Factorise each element into one shared set. | [LeetCode 2521](https://leetcode.com/problems/distinct-prime-factors-of-product-of-array/) |
| 13 | Smallest Value After Replacing With Sum of Prime Factors | Iterate to a fixed point; 4 is the trap. | [LeetCode 2507](https://leetcode.com/problems/smallest-value-after-replacing-with-sum-of-prime-factors/) |
| 14 | Sieve of Eratosthenes | The reference implementation. | [GfG](https://www.geeksforgeeks.org/problems/sieve-of-eratosthenes-1587115920/1) |

## Combinatorics mod p
| # | Problem | Hint | Link |
|---|---------|------|------|
| 15 | Unique Paths | It is `C(m+n-2, m-1)` - no DP needed. | [LeetCode 62](https://leetcode.com/problems/unique-paths/) |
| 16 | Number of Ways to Reach a Position After Exactly k Steps | `C(k, (k+d)/2)`, zero when the parity is wrong. | [LeetCode 2400](https://leetcode.com/problems/number-of-ways-to-reach-a-position-after-exactly-k-steps/) |
| 17 | Number of Music Playlists | Inclusion-exclusion with `nCr` mod p. | [LeetCode 920](https://leetcode.com/problems/number-of-music-playlists/) |

## Matrix exponentiation and totient
| # | Problem | Hint | Link |
|---|---------|------|------|
| 18 | Fibonacci Number | Solve it in `O(log n)` even though `O(n)` passes - that is the point. | [LeetCode 509](https://leetcode.com/problems/fibonacci-number/) |
| 19 | N-th Tribonacci Number | Same idea with a 3x3 companion matrix. | [LeetCode 1137](https://leetcode.com/problems/n-th-tribonacci-number/) |
| 20 | Euler's Totient Function | Factorise, then `n * prod(1 - 1/p)`. | [GfG](https://www.geeksforgeeks.org/problems/euler-totient-function4436/1) |
| 21 | Modular multiplicative inverse | Extended Euclid; handle the no-inverse case. | [GfG](https://www.geeksforgeeks.org/problems/modular-multiplicative-inverse1926/1) |

## Self-check before moving on

- [ ] I can prove why `gcd(a, b) == gcd(b, a mod b)`.
- [ ] I can write extended Euclid and explain what `x` and `y` mean.
- [ ] I know why division needs a modular inverse, and the two ways to get one.
- [ ] I know Fermat's little theorem requires a **prime** modulus.
- [ ] I can write the sieve from memory and say why it starts at `p*p`.
- [ ] I know when to reach for Miller-Rabin instead of trial division.
- [ ] I remember the leftover prime above `sqrt(n)` when factorising.
- [ ] I can derive `d(n)`, `sigma(n)` and `phi(n)` from a factorisation.
- [ ] I can set up the Fibonacci matrix and explain why squaring works.
- [ ] I know why inverse factorials are computed backwards from one inverse.
- [ ] I know `int64_t` wraps silently, and when I need `__int128`.
