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

  console.log("15-Dynamic-Programming (JavaScript): all checks passed");
}

demo();
