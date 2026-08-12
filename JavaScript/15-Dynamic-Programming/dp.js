/**
 * 15 - Dynamic Programming: every classic family, memoised and tabulated,
 * with the space optimisations spelled out.
 *
 * Run:  node dp.js
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. The same problem three ways
// ============================================================================
/** O(2^n): the same subproblems are recomputed exponentially often. */
export function fibNaive(n) {
  return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}

/** Top-down: recursion + a Map cache. O(n) time and space. */
export function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

/** Bottom-up: fill the table in dependency order. O(n) time and space. */
export function fibTable(n) {
  if (n < 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

/** O(n) time, O(1) space: only the last two states are ever read. */
export function fibRolling(n) {
  if (n < 2) return n;
  let prev = 0;
  let curr = 1;
  for (let i = 1; i < n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}

// ============================================================================
// 2. Linear DP
// ============================================================================
/**
 * Ways to climb n stairs with 1 or 2 steps. O(n) time, O(1) space.
 * dp[i] = dp[i-1] + dp[i-2] - the last step was either a 1 or a 2.
 */
export function climbStairs(n) {
  if (n <= 2) return Math.max(n, 1);
  let prev = 1;
  let curr = 2;
  for (let i = 3; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}

/**
 * Max sum with no two adjacent elements. O(n) time, O(1) space.
 * skip = best without the previous house; take = best including it.
 */
export function houseRobber(values) {
  let skip = 0;
  let take = 0;
  for (const value of values) [skip, take] = [Math.max(skip, take), skip + value];
  return Math.max(skip, take);
}

/** Kadane is DP: dp[i] = best subarray ENDING at i. O(n) / O(1). */
export function maxSubarray(nums) {
  if (!nums.length) throw new RangeError("empty input");
  let best = nums[0];
  let current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend, or restart here
    best = Math.max(best, current);
  }
  return best;
}

// ============================================================================
// 3. Knapsack family
// ============================================================================
/**
 * Each item at most ONCE. dp[i][w] = best value from the first i items within
 * capacity w. O(n * W) time and space.
 */
export function knapsack01(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // skip item i-1
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);
      }
    }
  }
  return dp[n][capacity];
}

/**
 * Same answer in O(W) space.
 * The capacity loop MUST run downwards: upwards would read a cell that already
 * includes this item, letting it be used twice - silently turning 0/1 knapsack
 * into the unbounded version.
 */
export function knapsack01Optimized(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      // downwards!
      dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
    }
  }
  return dp[capacity];
}

/**
 * Fewest coins summing to amount, or -1.
 * Unbounded knapsack: the inner loop runs UPWARDS precisely because reuse is
 * allowed. O(coins * amount).
 */
export function coinChangeMin(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let value = coin; value <= amount; value++) {
      dp[value] = Math.min(dp[value], dp[value - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

/**
 * Number of COMBINATIONS summing to amount.
 * Coins outside, amounts inside: that order counts each combination once.
 * Swapping the loops would count permutations instead.
 */
export function coinChangeWays(coins, amount) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1; // one way to make 0: take nothing
  for (const coin of coins) {
    for (let value = coin; value <= amount; value++) dp[value] += dp[value - coin];
  }
  return dp[amount];
}

/**
 * Can nums be split into two equal-sum halves? O(n * sum) time, O(sum) space.
 * Subset sum in disguise - a boolean 0/1 knapsack, so downwards again.
 */
export function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false; // odd totals never split evenly
  const target = total / 2;

  const reachable = new Array(target + 1).fill(false);
  reachable[0] = true;
  for (const x of nums) {
    for (let value = target; value >= x; value--) {
      if (reachable[value - x]) reachable[value] = true;
    }
  }
  return reachable[target];
}

// ============================================================================
// 4. String DP
// ============================================================================
/**
 * LCS length. dp[i][j] = LCS of a.slice(0,i) and b.slice(0,j). O(n * m).
 * Row 0 and column 0 are 0 - an empty string shares nothing.
 */
export function longestCommonSubsequence(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Levenshtein distance. dp[i][j] = edits to turn a[:i] into b[:j].
 * Row 0 / column 0 are "delete everything" / "insert everything".
 */
export function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] // free match
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** dp[i] = "the first i characters are splittable into dictionary words". */
export function wordBreak(s, words) {
  const vocabulary = new Set(words);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let end = 1; end <= s.length; end++) {
    for (let start = 0; start < end; start++) {
      if (dp[start] && vocabulary.has(s.slice(start, end))) {
        dp[end] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

/**
 * Longest palindromic SUBSEQUENCE. Interval DP over s[i..j], filled by
 * INCREASING LENGTH so the shorter intervals it reads are already known.
 */
export function longestPalindromicSubsequence(s) {
  const n = s.length;
  if (n === 0) return 0;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = 1; // one character is a palindrome

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      dp[i][j] =
        s[i] === s[j]
          ? 2 + (length > 2 ? dp[i + 1][j - 1] : 0)
          : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
}

// ============================================================================
// 5. Sequence DP
// ============================================================================
/**
 * Longest strictly increasing subsequence. O(n^2).
 * dp[i] = LIS length ENDING at i - "ending at i" is what makes the recurrence
 * expressible at all.
 */
export function lisQuadratic(nums) {
  if (!nums.length) return 0;
  const dp = new Array(nums.length).fill(1);
  let best = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}

/**
 * Same answer in O(n log n).
 * tails[k] = the smallest possible tail of an increasing subsequence of
 * length k+1. Keeping every tail minimal keeps `tails` sorted, and its LENGTH
 * is the answer - the contents are not themselves a valid subsequence.
 */
export function lisBinarySearch(nums) {
  const tails = [];
  for (const x of nums) {
    // lower bound: first index with tails[i] >= x
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(x); // extends the longest run
    else tails[lo] = x; // a smaller tail for that length
  }
  return tails.length;
}

// ============================================================================
// 6. Grid DP
// ============================================================================
/**
 * Paths from top-left to bottom-right moving only right/down. O(r * c).
 * One row of state suffices: a cell reads the value above (the row being
 * overwritten) and to the left (already updated this pass).
 */
export function uniquePaths(rows, cols) {
  if (rows <= 0 || cols <= 0) return 0;
  const row = new Array(cols).fill(1);
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) row[c] += row[c - 1]; // above + left
  }
  return row[cols - 1];
}

/** Cheapest top-left to bottom-right path. O(r * c) time, O(c) space. */
export function minPathSum(grid) {
  if (!grid.length || !grid[0].length) return 0;
  const cols = grid[0].length;
  const row = new Array(cols).fill(0);
  row[0] = grid[0][0];
  for (let c = 1; c < cols; c++) row[c] = row[c - 1] + grid[0][c];

  for (let r = 1; r < grid.length; r++) {
    row[0] += grid[r][0]; // first column: only from above
    for (let c = 1; c < cols; c++) {
      row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];
    }
  }
  return row[cols - 1];
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// 7. Interval (partition) DP
// ============================================================================
/**
 * Fewest scalar multiplications to multiply a chain of matrices. O(n^3).
 *
 * Matrix `i` has shape `dimensions[i] x dimensions[i+1]`, so n matrices need
 * n+1 numbers. Multiplying a `p x q` by a `q x r` costs `p*q*r` scalar
 * multiplies. The product is ASSOCIATIVE but not commutative, so the
 * parenthesisation is free to choose - and the cost gap is enormous. For
 * 10x30, 30x5, 5x60:
 *
 *     ((AB)C) = 10*30*5 + 10*5*60  = 1500 + 3000  =  4500
 *     (A(BC)) = 30*5*60 + 10*30*60 = 9000 + 18000 = 27000
 *
 * This is the archetypal INTERVAL DP:
 *
 *     cost[i][j] = min over every split k in (i, j) of
 *                  cost[i][k] + cost[k][j] + (price of joining the halves)
 *
 * The subproblem is a CONTIGUOUS RANGE and the recurrence tries every cut. Two
 * things catch people out:
 *
 *   1. Iterate by INCREASING LENGTH, not by index. `cost[i][j]` depends on
 *      strictly shorter intervals, so they must exist first. A plain
 *      `for i / for j` double loop reads uninitialised cells.
 *   2. It is `O(n^3)`: `O(n^2)` intervals, each scanning `O(n)` split points.
 *
 * Same skeleton as `burstBalloons`, optimal BST construction, "minimum cost to
 * cut a stick" and polygon triangulation.
 */
export function matrixChainOrder(dimensions) {
  const n = dimensions.length - 1; // number of matrices
  if (n <= 1) return 0; // nothing to multiply

  const cost = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));

  for (let length = 2; length <= n; length++) {
    // INCREASING LENGTH
    for (let i = 0; i + length <= n; i++) {
      const j = i + length; // half-open [i, j)
      cost[i][j] = Infinity;
      for (let k = i + 1; k < j; k++) {
        // Left half yields a dimensions[i] x dimensions[k] matrix, right half
        // a dimensions[k] x dimensions[j]. Joining them costs the product of
        // the three dimensions.
        const candidate =
          cost[i][k] + cost[k][j] + dimensions[i] * dimensions[k] * dimensions[j];
        cost[i][j] = Math.min(cost[i][j], candidate);
      }
    }
  }
  return cost[0][n];
}

/**
 * Maximum coins from bursting balloons, each paying `left * self * right`.
 * O(n^3).
 *
 * The trap: bursting a balloon changes its neighbours, so "which do I burst
 * first?" leaves a subproblem that is no longer an interval - the recursion
 * does not close.
 *
 * Reverse the question. Instead of the FIRST balloon to burst, pick the LAST
 * one in each range. If k is last in the open interval `(i, j)`, everything
 * strictly inside was burst before it, so when k pops its neighbours are
 * exactly i and j - fixed by the interval. Now the two sides are independent:
 *
 *     best[i][j] = max over k in (i, j) of
 *                  best[i][k] + best[k][j] + padded[i]*padded[k]*padded[j]
 *
 * Padding with 1 at each end removes the boundary special case.
 *
 * "Think about the last one, not the first" is the most transferable idea in
 * interval DP.
 */
export function burstBalloons(balloons) {
  const padded = [1, ...balloons, 1];
  const n = padded.length;
  const best = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let length = 2; length < n; length++) {
    // open-interval length
    for (let i = 0; i + length < n; i++) {
      const j = i + length;
      for (let k = i + 1; k < j; k++) {
        // k is burst LAST in (i, j)
        best[i][j] = Math.max(
          best[i][j],
          best[i][k] + best[k][j] + padded[i] * padded[k] * padded[j],
        );
      }
    }
  }
  return best[0][n - 1];
}

/**
 * Cheapest order of cuts, each costing the length of the piece being cut.
 * O(m^3).
 *
 * The same skeleton with the ends padded in as fake cuts at 0 and `length`.
 * Sorting matters: the DP is over ADJACENT cut positions, which only form
 * intervals once the positions are in order.
 *
 * Note `sort((a, b) => a - b)` - the default `sort()` compares as STRINGS, so
 * `[2, 10]` would come back as `[10, 2]`.
 */
export function minCostToCutStick(length, cuts) {
  const points = [0, ...cuts, length].sort((a, b) => a - b);
  const m = points.length;
  const cost = Array.from({ length: m }, () => new Array(m).fill(0));

  for (let span = 2; span < m; span++) {
    for (let i = 0; i + span < m; i++) {
      const j = i + span;
      let bestSplit = Infinity;
      for (let k = i + 1; k < j; k++) {
        bestSplit = Math.min(bestSplit, cost[i][k] + cost[k][j]);
      }
      // The piece cut always spans points[i]..points[j] whichever cut comes
      // first, so that price is a constant here.
      cost[i][j] = points[j] - points[i] + bestSplit;
    }
  }
  return cost[0][m - 1];
}

// ============================================================================
// 8. Bitmask DP
// ============================================================================
/**
 * Shortest tour visiting every city once and returning. O(2^n * n^2).
 *
 * The Held-Karp algorithm, and the canonical BITMASK DP.
 *
 * The state must remember WHICH cities have been visited - not how many,
 * because which ones remain determines the rest of the cost. A set of cities is
 * a subset of n elements, so encode it as n bits of an integer:
 *
 *     best[mask][last] = cheapest route visiting exactly the cities in `mask`
 *                        and currently standing at `last`
 *
 * `2^n * n` states, each extended n ways: `O(2^n * n^2)`. Brute force over
 * permutations is `O(n!)` - for n = 20 that is 2.4e18 against 4e8. Still
 * exponential, but the difference between "never" and "a second".
 *
 * The bit operations that carry the method:
 *     mask | (1 << c)        add city c
 *     mask & (1 << c)        is c in the set?
 *     mask === (1 << n) - 1  are all n in the set?
 *
 * JS bitwise operators coerce to **signed 32-bit**, so `1 << 31` is negative
 * and `1 << 32` wraps to 1. That caps this at n <= 30 even before memory does -
 * not a real limit, since 2^30 states would never fit anyway.
 */
export function travellingSalesman(distance) {
  const n = distance.length;
  if (n <= 1) return 0;

  // Start at city 0 with only city 0 visited.
  const best = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
  best[1][0] = 0;

  for (let mask = 0; mask < 1 << n; mask++) {
    if (!(mask & 1)) continue; // every tour starts at city 0
    for (let last = 0; last < n; last++) {
      if (best[mask][last] === Infinity) continue; // unreachable state
      for (let city = 0; city < n; city++) {
        if (mask & (1 << city)) continue; // already visited
        const next = mask | (1 << city);
        best[next][city] = Math.min(
          best[next][city],
          best[mask][last] + distance[last][city],
        );
      }
    }
  }

  const full = (1 << n) - 1;
  let answer = Infinity;
  for (let last = 0; last < n; last++) {
    answer = Math.min(answer, best[full][last] + distance[last][0]);
  }
  return answer;
}

/**
 * Ways to assign n tasks to n people, each to exactly one. O(2^n * n).
 *
 * `compatible[person][task]` says whether that pairing is allowed.
 *
 * The trick that halves the state: process people in a FIXED order. If the mask
 * holds the tasks already assigned, then `popcount(mask)` is exactly how many
 * people have been served - so the person index is implied and never needs
 * storing. The state collapses from `(person, mask)` to just `mask`.
 *
 * Recognising when one dimension is recoverable from another is what makes
 * bitmask DP fit in memory.
 */
export function countPerfectMatchings(compatible) {
  const n = compatible.length;
  const ways = new Array(1 << n).fill(0);
  ways[0] = 1; // one way to assign nobody

  // Brian Kernighan's popcount - JS has no built-in.
  const popcount = (x) => {
    let count = 0;
    while (x) {
      x &= x - 1; // clears the lowest set bit
      count++;
    }
    return count;
  };

  for (let mask = 0; mask < 1 << n; mask++) {
    if (ways[mask] === 0) continue;
    const person = popcount(mask); // implied, never stored
    if (person === n) continue;
    for (let task = 0; task < n; task++) {
      if (!(mask & (1 << task)) && compatible[person][task]) {
        ways[mask | (1 << task)] += ways[mask];
      }
    }
  }
  return ways[(1 << n) - 1];
}

/**
 * Split into two groups with the smallest possible difference. O(n * sum).
 *
 * Included as the CONTRAST: this is not bitmask DP. The state only needs the
 * reachable sums, not which elements produced them - so a set of sums beats
 * `2^n` subsets by a wide margin. Reach for a bitmask only when the IDENTITY of
 * the chosen elements actually matters.
 */
export function subsetSumPartitionMinDifference(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  const reachable = new Uint8Array(total + 1);
  reachable[0] = 1;

  for (const value of nums) {
    for (let sum = total; sum >= value; sum--) {
      // DOWNWARD: 0/1, not unbounded
      if (reachable[sum - value]) reachable[sum] = 1;
    }
  }

  let best = total;
  for (let half = 0; half <= Math.floor(total / 2); half++) {
    if (reachable[half]) best = Math.min(best, total - 2 * half);
  }
  return best;
}

function demo() {
  for (let n = 0; n < 15; n++) {
    const expected = fibNaive(n);
    assert.equal(fibMemo(n), expected);
    assert.equal(fibTable(n), expected);
    assert.equal(fibRolling(n), expected);
  }
  // Beyond n = 78 the result exceeds Number.MAX_SAFE_INTEGER and silently
  // loses precision - a real JS limit worth knowing.
  assert.equal(fibRolling(78), 8944394323791464);
  assert.ok(fibRolling(79) > Number.MAX_SAFE_INTEGER);

  assert.equal(climbStairs(1), 1);
  assert.equal(climbStairs(2), 2);
  assert.equal(climbStairs(5), 8);
  assert.equal(climbStairs(45), 1836311903);

  assert.equal(houseRobber([1, 2, 3, 1]), 4); // houses 0 and 2
  assert.equal(houseRobber([2, 7, 9, 3, 1]), 12); // houses 0, 2 and 4
  assert.equal(houseRobber([]), 0);
  assert.equal(houseRobber([5]), 5);

  assert.equal(maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6);
  assert.equal(maxSubarray([-5, -2, -9]), -2);

  const weights = [1, 3, 4, 5];
  const values = [1, 4, 5, 7];
  assert.equal(knapsack01(weights, values, 7), 9); // weights 3 and 4
  assert.equal(knapsack01Optimized(weights, values, 7), 9);
  for (let capacity = 0; capacity <= 9; capacity++) {
    assert.equal(
      knapsack01(weights, values, capacity),
      knapsack01Optimized(weights, values, capacity),
    );
  }

  assert.equal(coinChangeMin([1, 2, 5], 11), 3); // 5 + 5 + 1
  assert.equal(coinChangeMin([2], 3), -1); // impossible
  assert.equal(coinChangeMin([1], 0), 0);
  assert.equal(coinChangeWays([1, 2, 5], 5), 4);
  assert.equal(coinChangeWays([2], 3), 0);

  assert.ok(canPartition([1, 5, 11, 5])); // 11 = 1 + 5 + 5
  assert.ok(!canPartition([1, 2, 3, 5]));
  assert.ok(!canPartition([1])); // odd total

  assert.equal(longestCommonSubsequence("abcde", "ace"), 3);
  assert.equal(longestCommonSubsequence("abc", "def"), 0);
  assert.equal(longestCommonSubsequence("", "abc"), 0);

  assert.equal(editDistance("horse", "ros"), 3);
  assert.equal(editDistance("intention", "execution"), 5);
  assert.equal(editDistance("", "abc"), 3);
  assert.equal(editDistance("same", "same"), 0);

  assert.ok(wordBreak("leetcode", ["leet", "code"]));
  assert.ok(!wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]));
  assert.ok(wordBreak("", ["a"])); // empty string is splittable

  assert.equal(longestPalindromicSubsequence("bbbab"), 4); // "bbbb"
  assert.equal(longestPalindromicSubsequence("cbbd"), 2); // "bb"
  assert.equal(longestPalindromicSubsequence(""), 0);

  assert.equal(lisQuadratic([10, 9, 2, 5, 3, 7, 101, 18]), 4); // 2,3,7,101
  assert.equal(lisBinarySearch([10, 9, 2, 5, 3, 7, 101, 18]), 4);
  assert.equal(lisQuadratic([7, 7, 7]), 1); // strictly increasing
  assert.equal(lisBinarySearch([7, 7, 7]), 1);
  assert.equal(lisQuadratic([]), 0);
  assert.equal(lisBinarySearch([]), 0);
  for (const c of [[1], [3, 1, 2], [1, 3, 6, 7, 9, 4, 10, 5, 6], [5, 4, 3, 2, 1]]) {
    assert.equal(lisQuadratic(c), lisBinarySearch(c));
  }

  assert.equal(uniquePaths(3, 7), 28);
  assert.equal(uniquePaths(1, 1), 1);
  assert.equal(uniquePaths(3, 2), 3);

  assert.equal(
    minPathSum([
      [1, 3, 1],
      [1, 5, 1],
      [4, 2, 1],
    ]),
    7, // 1,3,1,1,1
  );
  assert.equal(
    minPathSum([
      [1, 2, 3],
      [4, 5, 6],
    ]),
    12,
  );
  assert.equal(minPathSum([]), 0);

  // --- Interval DP ----------------------------------------------------------
  // 10x30, 30x5, 5x60: ((AB)C) costs 4500, (A(BC)) costs 27000.
  assert.equal(matrixChainOrder([10, 30, 5, 60]), 4500);
  assert.equal(matrixChainOrder([40, 20, 30, 10, 30]), 26000);
  assert.equal(matrixChainOrder([5, 10]), 0); // a single matrix
  assert.equal(matrixChainOrder([7]), 0); // no matrices at all

  assert.equal(burstBalloons([3, 1, 5, 8]), 167);
  assert.equal(burstBalloons([1, 5]), 10);
  assert.equal(burstBalloons([9]), 9);
  assert.equal(burstBalloons([]), 0);

  assert.equal(minCostToCutStick(7, [1, 3, 4, 5]), 16);
  assert.equal(minCostToCutStick(9, [5, 6, 1, 4, 2]), 22);

  // Deterministic PRNG so a failure is always reproducible.
  let seed = 15;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

  // Against plain memoised recursion - an independent route to the answer.
  const bruteChain = (dims) => {
    const memo = new Map();
    const solve = (i, j) => {
      if (j - i <= 1) return 0;
      const key = i * 100 + j;
      if (memo.has(key)) return memo.get(key);
      let best = Infinity;
      for (let k = i + 1; k < j; k++) {
        best = Math.min(best, solve(i, k) + solve(k, j) + dims[i] * dims[k] * dims[j]);
      }
      memo.set(key, best);
      return best;
    };
    return solve(0, dims.length - 1);
  };

  for (let trial = 0; trial < 60; trial++) {
    const dims = Array.from({ length: randInt(1, 7) }, () => randInt(1, 20));
    assert.equal(matrixChainOrder(dims), bruteChain(dims));
  }

  // Try every possible burst order - O(n!), so keep n tiny.
  const bruteBurst = (values) => {
    if (values.length === 0) return 0;
    let best = 0;
    for (let i = 0; i < values.length; i++) {
      const left = i > 0 ? values[i - 1] : 1;
      const right = i + 1 < values.length ? values[i + 1] : 1;
      const rest = [...values.slice(0, i), ...values.slice(i + 1)];
      best = Math.max(best, left * values[i] * right + bruteBurst(rest));
    }
    return best;
  };

  for (let trial = 0; trial < 40; trial++) {
    const values = Array.from({ length: randInt(0, 6) }, () => randInt(1, 9));
    assert.equal(burstBalloons(values), bruteBurst(values));
  }

  // --- Bitmask DP -----------------------------------------------------------
  // A square: 0-1-2-3-0 with unit sides and diagonals of 2.
  const square = [
    [0, 1, 2, 1],
    [1, 0, 1, 2],
    [2, 1, 0, 1],
    [1, 2, 1, 0],
  ];
  assert.equal(travellingSalesman(square), 4); // walk the perimeter
  assert.equal(travellingSalesman([[0]]), 0);
  assert.equal(
    travellingSalesman([
      [0, 5],
      [5, 0],
    ]),
    10, // there and back
  );

  const identity = Array.from({ length: 3 }, () => new Array(3).fill(true));
  assert.equal(countPerfectMatchings(identity), 6); // 3! assignments
  assert.equal(
    countPerfectMatchings([
      [true, false],
      [false, true],
    ]),
    1,
  );
  assert.equal(
    countPerfectMatchings([
      [true, true],
      [false, false],
    ]),
    0,
  );

  assert.equal(subsetSumPartitionMinDifference([1, 6, 11, 5]), 1);
  assert.equal(subsetSumPartitionMinDifference([3, 3]), 0);
  assert.equal(subsetSumPartitionMinDifference([10]), 10);

  // Every permutation of an array - the brute-force reference for both
  // bitmask DPs below.
  const permutations = (items) => {
    if (items.length <= 1) return [items];
    const result = [];
    for (let i = 0; i < items.length; i++) {
      const rest = [...items.slice(0, i), ...items.slice(i + 1)];
      for (const tail of permutations(rest)) result.push([items[i], ...tail]);
    }
    return result;
  };

  // Held-Karp against brute force over every permutation.
  for (let trial = 0; trial < 30; trial++) {
    const n = randInt(1, 7);
    const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        matrix[u][v] = matrix[v][u] = randInt(1, 30); // symmetric
      }
    }

    let expected = Infinity;
    const rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
    for (const tail of permutations(rest)) {
      const route = [0, ...tail];
      let total = matrix[route.at(-1)][0];
      for (let i = 0; i + 1 < n; i++) total += matrix[route[i]][route[i + 1]];
      expected = Math.min(expected, total);
    }
    assert.equal(travellingSalesman(matrix), expected);
  }

  // Perfect matchings against brute force over every permutation.
  for (let trial = 0; trial < 30; trial++) {
    const n = randInt(1, 6);
    const allowed = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => random() < 0.6),
    );

    const tasks = Array.from({ length: n }, (_, i) => i);
    const expected = permutations(tasks).filter((assignment) =>
      assignment.every((task, person) => allowed[person][task]),
    ).length;

    assert.equal(countPerfectMatchings(allowed), expected);
  }

  // Minimum partition difference against enumerating every subset.
  for (let trial = 0; trial < 30; trial++) {
    const nums = Array.from({ length: randInt(1, 10) }, () => randInt(1, 20));
    const total = nums.reduce((a, b) => a + b, 0);
    let bestDiff = total;
    for (let mask = 0; mask < 1 << nums.length; mask++) {
      let part = 0;
      for (let i = 0; i < nums.length; i++) if (mask >> i & 1) part += nums[i];
      bestDiff = Math.min(bestDiff, Math.abs(total - 2 * part));
    }
    assert.equal(subsetSumPartitionMinDifference(nums), bestDiff);
  }

  console.log("15-Dynamic-Programming (JavaScript): all checks passed");
  console.log(
    "  Interval DP checked against every parenthesisation and burst order,\n" +
      "  bitmask DP against every permutation",
  );
}

demo();
