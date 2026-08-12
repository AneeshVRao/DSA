// 15 - Dynamic Programming: every classic family, memoised and tabulated,
// with the space optimisations spelled out.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall dp.cpp -o dp && ./dp

#include <algorithm>
#include <cassert>
#include <climits>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <unordered_set>
#include <vector>

using namespace std;

// ============================================================================
// 1. The same problem three ways
// ============================================================================

// O(2^n): the same subproblems are recomputed exponentially often.
long long fibNaive(int n) {
    return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}

// Top-down: recursion plus a cache. -1 marks "not computed" and can never be
// a real answer here. O(n) time and space.
long long fibMemo(int n, vector<long long>& memo) {
    if (n < 2) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
}

// Bottom-up: fill the table in dependency order. O(n) time and space.
long long fibTable(int n) {
    if (n < 2) return n;
    vector<long long> dp(n + 1, 0);
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

// O(n) time, O(1) space: only the last two states are ever read.
long long fibRolling(int n) {
    if (n < 2) return n;
    long long prev = 0, curr = 1;
    for (int i = 1; i < n; i++) {
        long long next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}

// ============================================================================
// 2. Linear DP
// ============================================================================

// Ways to climb n stairs with 1 or 2 steps: dp[i] = dp[i-1] + dp[i-2],
// because the last step was either a 1 or a 2. Fibonacci wearing a hat.
long long climbStairs(int n) {
    if (n <= 2) return max(n, 1);
    long long prev = 1, curr = 2;
    for (int i = 3; i <= n; i++) {
        long long next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}

// Max sum with no two adjacent elements. O(n) time, O(1) space.
// skip = best without the previous house, take = best including it.
long long houseRobber(const vector<int>& values) {
    long long skip = 0, take = 0;
    for (int value : values) {
        long long newSkip = max(skip, take);
        take = skip + value;
        skip = newSkip;
    }
    return max(skip, take);
}

// Kadane is DP: dp[i] = best subarray ENDING at i. O(n) / O(1).
long long maxSubarray(const vector<int>& nums) {
    if (nums.empty()) throw invalid_argument("empty input");
    long long best = nums[0], current = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        current = max<long long>(nums[i], current + nums[i]);
        best = max(best, current);
    }
    return best;
}

// ============================================================================
// 3. Knapsack family
// ============================================================================

// Each item at most ONCE. dp[i][w] = best value from the first i items within
// capacity w. O(n * W) time and space.
int knapsack01(const vector<int>& weights, const vector<int>& values, int capacity) {
    int n = int(weights.size());
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            dp[i][w] = dp[i - 1][w];                       // skip item i-1
            if (weights[i - 1] <= w)                       // or take it
                dp[i][w] = max(dp[i][w],
                               values[i - 1] + dp[i - 1][w - weights[i - 1]]);
        }
    }
    return dp[n][capacity];
}

// Same answer in O(W) space. The capacity loop MUST run downwards: upwards
// would read a cell that already includes this item, letting it be used twice
// and silently turning 0/1 knapsack into the unbounded version.
int knapsack01Optimized(const vector<int>& weights, const vector<int>& values,
                        int capacity) {
    vector<int> dp(capacity + 1, 0);
    for (size_t i = 0; i < weights.size(); i++)
        for (int w = capacity; w >= weights[i]; w--)       // downwards!
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]]);
    return dp[capacity];
}

// Fewest coins summing to amount, or -1. Unbounded knapsack, so the inner
// loop runs UPWARDS precisely because reuse is allowed.
int coinChangeMin(const vector<int>& coins, int amount) {
    const int INF = INT_MAX / 2;                           // safe to add 1 to
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int coin : coins)
        for (int value = coin; value <= amount; value++)   // upwards: reuse OK
            dp[value] = min(dp[value], dp[value - coin] + 1);
    return dp[amount] >= INF ? -1 : dp[amount];
}

// Number of COMBINATIONS summing to amount. Coins outside, amounts inside:
// that order counts each combination once. Swapping the loops would count
// permutations ({1,2} and {2,1} separately).
long long coinChangeWays(const vector<int>& coins, int amount) {
    vector<long long> dp(amount + 1, 0);
    dp[0] = 1;                                             // one way to make 0
    for (int coin : coins)
        for (int value = coin; value <= amount; value++)
            dp[value] += dp[value - coin];
    return dp[amount];
}

// Subset sum in disguise: is total/2 reachable? Boolean 0/1 knapsack, so the
// capacity loop runs downwards again.
bool canPartition(const vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2) return false;                           // odd never splits
    int target = total / 2;

    vector<char> reachable(target + 1, false);             // vector<char>: no
    reachable[0] = true;                                   // bit-packing games
    for (int x : nums)
        for (int value = target; value >= x; value--)      // downwards
            if (reachable[value - x]) reachable[value] = true;
    return reachable[target];
}

// ============================================================================
// 4. String DP
// ============================================================================

// LCS length. dp[i][j] = LCS of a[:i] and b[:j]. O(n * m).
int longestCommonSubsequence(const string& a, const string& b) {
    int n = int(a.size()), m = int(b.size());
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                           ? dp[i - 1][j - 1] + 1
                           : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[n][m];
}

// Levenshtein distance. dp[i][j] = edits to turn a[:i] into b[:j].
// Row 0 and column 0 are "delete everything" / "insert everything".
int editDistance(const string& a, const string& b) {
    int n = int(a.size()), m = int(b.size());
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 0; i <= n; i++) dp[i][0] = i;
    for (int j = 0; j <= m; j++) dp[0][j] = j;

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                           ? dp[i - 1][j - 1]                    // free match
                           : 1 + min({dp[i - 1][j],              // delete
                                      dp[i][j - 1],              // insert
                                      dp[i - 1][j - 1]});        // replace
    return dp[n][m];
}

// dp[i] = "the first i characters are splittable into dictionary words".
bool wordBreak(const string& s, const vector<string>& words) {
    unordered_set<string> vocabulary(words.begin(), words.end());
    vector<char> dp(s.size() + 1, false);
    dp[0] = true;
    for (size_t end = 1; end <= s.size(); end++) {
        for (size_t start = 0; start < end; start++) {
            if (dp[start] && vocabulary.count(s.substr(start, end - start))) {
                dp[end] = true;
                break;
            }
        }
    }
    return dp[s.size()];
}

// Longest palindromic SUBSEQUENCE. Interval DP: dp[i][j] over s[i..j], filled
// by INCREASING LENGTH so the shorter intervals it reads are already known.
int longestPalindromicSubsequence(const string& s) {
    int n = int(s.size());
    if (n == 0) return 0;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;              // one char: length 1

    for (int length = 2; length <= n; length++) {
        for (int i = 0; i + length - 1 < n; i++) {
            int j = i + length - 1;
            if (s[i] == s[j])
                dp[i][j] = 2 + (length > 2 ? dp[i + 1][j - 1] : 0);
            else
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);
        }
    }
    return dp[0][n - 1];
}

// ============================================================================
// 5. Sequence DP
// ============================================================================

// dp[i] = LIS length ENDING at i. Defining it as "ending at i" is what makes
// the recurrence expressible. O(n^2).
int lisQuadratic(const vector<int>& nums) {
    if (nums.empty()) return 0;
    vector<int> dp(nums.size(), 1);
    int best = 1;
    for (size_t i = 1; i < nums.size(); i++) {
        for (size_t j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
        best = max(best, dp[i]);
    }
    return best;
}

// O(n log n). tails[k] = the smallest possible tail of an increasing
// subsequence of length k+1. Keeping every tail minimal keeps `tails` sorted,
// and its LENGTH is the answer - the contents are not a real subsequence.
int lisBinarySearch(const vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);     // extends the longest run
        else *it = x;                                  // smaller tail, same length
    }
    return int(tails.size());
}

// ============================================================================
// 6. Grid DP
// ============================================================================

// Paths moving only right/down. One row of state suffices: a cell reads the
// value above (the row being overwritten) and to the left (already updated).
long long uniquePaths(int rows, int cols) {
    if (rows <= 0 || cols <= 0) return 0;
    vector<long long> row(cols, 1);
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++) row[c] += row[c - 1];   // above + left
    return row[cols - 1];
}

// Cheapest top-left to bottom-right path. O(r * c) time, O(c) space.
long long minPathSum(const vector<vector<int>>& grid) {
    if (grid.empty() || grid[0].empty()) return 0;
    int cols = int(grid[0].size());
    vector<long long> row(cols, 0);
    row[0] = grid[0][0];
    for (int c = 1; c < cols; c++) row[c] = row[c - 1] + grid[0][c];

    for (size_t r = 1; r < grid.size(); r++) {
        row[0] += grid[r][0];                          // first column: from above
        for (int c = 1; c < cols; c++)
            row[c] = min(row[c], row[c - 1]) + grid[r][c];
    }
    return row[cols - 1];
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// 7. Interval (partition) DP
// ============================================================================

// Fewest scalar multiplications to multiply a chain of matrices. O(n^3).
//
// Matrix i has shape dimensions[i] x dimensions[i+1], so n matrices need n+1
// numbers. Multiplying a p x q by a q x r costs p*q*r scalar multiplies. The
// product is ASSOCIATIVE but not commutative, so the parenthesisation is free
// to choose - and the cost difference is enormous. For 10x30, 30x5, 5x60:
//
//     ((AB)C) = 10*30*5 + 10*5*60  = 1500 + 3000  =  4500
//     (A(BC)) = 30*5*60 + 10*30*60 = 9000 + 18000 = 27000
//
// This is the archetypal INTERVAL DP:
//
//     cost[i][j] = min over every split k in (i, j) of
//                  cost[i][k] + cost[k][j] + (price of joining the halves)
//
// The subproblem is a CONTIGUOUS RANGE and the recurrence tries every cut. Two
// things catch people out:
//
//   1. Iterate by INCREASING LENGTH, not by index. cost[i][j] depends on
//      strictly shorter intervals, so they must exist first. A plain
//      `for i: for j:` double loop reads uninitialised cells.
//   2. It is O(n^3): O(n^2) intervals, each scanning O(n) split points.
//
// Same skeleton as burstBalloons, optimal BST construction, "minimum cost to
// cut a stick" and polygon triangulation.
long long matrixChainOrder(const vector<int>& dimensions) {
    int n = int(dimensions.size()) - 1;         // number of matrices
    if (n <= 1) return 0;                       // nothing to multiply

    vector<vector<long long>> cost(n + 1, vector<long long>(n + 1, 0));

    for (int length = 2; length <= n; length++) {     // INCREASING LENGTH
        for (int i = 0; i + length <= n; i++) {
            int j = i + length;                       // half-open [i, j)
            cost[i][j] = LLONG_MAX;
            for (int k = i + 1; k < j; k++) {         // every split point
                // Left half yields a dimensions[i] x dimensions[k] matrix,
                // right half a dimensions[k] x dimensions[j]. Joining them
                // costs the product of the three dimensions.
                long long candidate = cost[i][k] + cost[k][j]
                                      + 1LL * dimensions[i] * dimensions[k]
                                            * dimensions[j];
                cost[i][j] = min(cost[i][j], candidate);
            }
        }
    }
    return cost[0][n];
}

// Maximum coins from bursting balloons, each paying left*self*right. O(n^3).
//
// The trap: bursting a balloon changes its neighbours, so "which do I burst
// first?" leaves a subproblem that is no longer an interval - the recursion
// does not close.
//
// Reverse the question. Instead of the FIRST balloon to burst, pick the LAST
// one in each range. If k is last in the open interval (i, j), everything
// strictly inside was burst before it, so when k pops its neighbours are
// exactly i and j - fixed by the interval. Now the two sides are independent:
//
//     best[i][j] = max over k in (i, j) of
//                  best[i][k] + best[k][j] + padded[i]*padded[k]*padded[j]
//
// Padding with 1 at each end removes the boundary special case.
//
// "Think about the last one, not the first" is the most transferable idea in
// interval DP.
long long burstBalloons(const vector<int>& balloons) {
    vector<int> padded;
    padded.push_back(1);
    padded.insert(padded.end(), balloons.begin(), balloons.end());
    padded.push_back(1);

    int n = int(padded.size());
    vector<vector<long long>> best(n, vector<long long>(n, 0));

    for (int length = 2; length < n; length++) {      // open-interval length
        for (int i = 0; i + length < n; i++) {
            int j = i + length;
            for (int k = i + 1; k < j; k++) {         // k burst LAST in (i, j)
                best[i][j] = max(best[i][j],
                                 best[i][k] + best[k][j]
                                     + 1LL * padded[i] * padded[k] * padded[j]);
            }
        }
    }
    return best[0][n - 1];
}

// Cheapest order of cuts, each costing the length of the piece being cut.
// O(m^3).
//
// The same skeleton with the ends padded in as fake cuts at 0 and `length`.
// Sorting matters: the DP is over ADJACENT cut positions, which only form
// intervals once the positions are in order.
long long minCostToCutStick(int length, vector<int> cuts) {
    cuts.push_back(0);
    cuts.push_back(length);
    sort(cuts.begin(), cuts.end());

    int m = int(cuts.size());
    vector<vector<long long>> cost(m, vector<long long>(m, 0));

    for (int span = 2; span < m; span++) {
        for (int i = 0; i + span < m; i++) {
            int j = i + span;
            long long bestSplit = LLONG_MAX;
            for (int k = i + 1; k < j; k++) {
                bestSplit = min(bestSplit, cost[i][k] + cost[k][j]);
            }
            // The piece cut always spans cuts[i]..cuts[j] whichever cut comes
            // first, so that price is a constant here.
            cost[i][j] = cuts[j] - cuts[i] + bestSplit;
        }
    }
    return cost[0][m - 1];
}

// ============================================================================
// 8. Bitmask DP
// ============================================================================

// Shortest tour visiting every city once and returning. O(2^n * n^2).
//
// The Held-Karp algorithm, and the canonical BITMASK DP.
//
// The state must remember WHICH cities have been visited - not how many,
// because which ones remain determines the rest of the cost. A set of cities is
// a subset of n elements, so encode it as n bits of an integer:
//
//     best[mask][last] = cheapest route visiting exactly the cities in `mask`
//                        and currently standing at `last`
//
// 2^n * n states, each extended n ways: O(2^n * n^2). Brute force over
// permutations is O(n!) - for n = 20 that is 2.4e18 against 4e8. Still
// exponential, but the difference between "never" and "a second".
//
// The bit operations that carry the method:
//     mask | (1 << c)        add city c
//     mask & (1 << c)        is c in the set?
//     mask == (1 << n) - 1   are all n in the set?
//
// Every subset-flavoured problem has this shape: partition into k groups,
// assign n tasks to n workers, shortest superstring, count Hamiltonian paths.
// The ceiling is around n = 20-22 before 2^n stops fitting in memory.
long long travellingSalesman(const vector<vector<int>>& distance) {
    int n = int(distance.size());
    if (n <= 1) return 0;

    const long long UNREACHABLE = LLONG_MAX / 4;
    // Start at city 0 with only city 0 visited.
    vector<vector<long long>> best(1 << n, vector<long long>(n, UNREACHABLE));
    best[1][0] = 0;

    for (int mask = 0; mask < (1 << n); mask++) {
        if (!(mask & 1)) continue;              // every tour starts at city 0
        for (int last = 0; last < n; last++) {
            if (best[mask][last] == UNREACHABLE) continue;   // unreachable state
            for (int city = 0; city < n; city++) {
                if (mask & (1 << city)) continue;            // already visited
                int next = mask | (1 << city);
                best[next][city] = min(best[next][city],
                                       best[mask][last] + distance[last][city]);
            }
        }
    }

    int full = (1 << n) - 1;
    long long answer = UNREACHABLE;
    for (int last = 0; last < n; last++) {
        answer = min(answer, best[full][last] + distance[last][0]);
    }
    return answer;
}

// Ways to assign n tasks to n people, each to exactly one. O(2^n * n).
//
// compatible[person][task] says whether that pairing is allowed.
//
// The trick that halves the state: process people in a FIXED order. If the mask
// holds the tasks already assigned, then popcount(mask) is exactly how many
// people have been served - so the person index is implied and never needs
// storing. The state collapses from (person, mask) to just mask.
//
// __builtin_popcount is a single CPU instruction on any modern target.
// Recognising when one dimension is recoverable from another is what makes
// bitmask DP fit in memory.
long long countPerfectMatchings(const vector<vector<bool>>& compatible) {
    int n = int(compatible.size());
    vector<long long> ways(1 << n, 0);
    ways[0] = 1;                                // one way to assign nobody

    for (int mask = 0; mask < (1 << n); mask++) {
        if (ways[mask] == 0) continue;
        int person = __builtin_popcount(unsigned(mask));   // implied, not stored
        if (person == n) continue;
        for (int task = 0; task < n; task++) {
            if (!(mask & (1 << task)) && compatible[person][task]) {
                ways[mask | (1 << task)] += ways[mask];
            }
        }
    }
    return ways[(1 << n) - 1];
}

// Split into two groups with the smallest possible difference. O(n * sum).
//
// Included as the CONTRAST: this is not bitmask DP. The state only needs the
// reachable sums, not which elements produced them - so a set of sums beats
// 2^n subsets by a wide margin. Reach for a bitmask only when the IDENTITY of
// the chosen elements actually matters.
//
// (std::bitset would let the shift-and-or trick run 64 sums per word, but it
// needs a compile-time size; vector<char> keeps this readable.)
int subsetSumPartitionMinDifference(const vector<int>& nums) {
    int total = 0;
    for (int value : nums) total += value;

    vector<char> reachable(total + 1, 0);
    reachable[0] = 1;
    for (int value : nums) {
        for (int sum = total; sum >= value; sum--) {   // DOWNWARD: 0/1, not unbounded
            if (reachable[sum - value]) reachable[sum] = 1;
        }
    }

    int best = total;
    for (int half = 0; half <= total / 2; half++) {
        if (reachable[half]) best = min(best, total - 2 * half);
    }
    return best;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    for (int n = 0; n < 15; n++) {
        vector<long long> memo(n + 1, -1);
        long long expected = fibNaive(n);
        assert(fibMemo(n, memo) == expected);
        assert(fibTable(n) == expected);
        assert(fibRolling(n) == expected);
    }
    vector<long long> memo(91, -1);
    assert(fibMemo(90, memo) == 2880067194370816120LL);   // needs long long

    assert(climbStairs(1) == 1 && climbStairs(2) == 2);
    assert(climbStairs(5) == 8);
    assert(climbStairs(45) == 1836311903LL);

    assert(houseRobber({1, 2, 3, 1}) == 4);               // houses 0 and 2
    assert(houseRobber({2, 7, 9, 3, 1}) == 12);           // houses 0, 2 and 4
    assert(houseRobber({}) == 0);
    assert(houseRobber({5}) == 5);

    assert(maxSubarray({-2, 1, -3, 4, -1, 2, 1, -5, 4}) == 6);
    assert(maxSubarray({-5, -2, -9}) == -2);

    vector<int> weights{1, 3, 4, 5}, values{1, 4, 5, 7};
    assert(knapsack01(weights, values, 7) == 9);          // weights 3 and 4
    assert(knapsack01Optimized(weights, values, 7) == 9);
    for (int capacity = 0; capacity <= 9; capacity++)     // both must agree
        assert(knapsack01(weights, values, capacity) ==
               knapsack01Optimized(weights, values, capacity));

    assert(coinChangeMin({1, 2, 5}, 11) == 3);            // 5 + 5 + 1
    assert(coinChangeMin({2}, 3) == -1);                  // impossible
    assert(coinChangeMin({1}, 0) == 0);
    assert(coinChangeWays({1, 2, 5}, 5) == 4);
    assert(coinChangeWays({2}, 3) == 0);

    assert(canPartition({1, 5, 11, 5}));                  // 11 = 1 + 5 + 5
    assert(!canPartition({1, 2, 3, 5}));
    assert(!canPartition({1}));                           // odd total

    assert(longestCommonSubsequence("abcde", "ace") == 3);
    assert(longestCommonSubsequence("abc", "def") == 0);
    assert(longestCommonSubsequence("", "abc") == 0);

    assert(editDistance("horse", "ros") == 3);
    assert(editDistance("intention", "execution") == 5);
    assert(editDistance("", "abc") == 3);
    assert(editDistance("same", "same") == 0);

    assert(wordBreak("leetcode", {"leet", "code"}));
    assert(!wordBreak("catsandog", {"cats", "dog", "sand", "and", "cat"}));
    assert(wordBreak("", {"a"}));                         // empty is splittable

    assert(longestPalindromicSubsequence("bbbab") == 4);  // "bbbb"
    assert(longestPalindromicSubsequence("cbbd") == 2);   // "bb"
    assert(longestPalindromicSubsequence("") == 0);

    assert(lisQuadratic({10, 9, 2, 5, 3, 7, 101, 18}) == 4);   // 2,3,7,101
    assert(lisBinarySearch({10, 9, 2, 5, 3, 7, 101, 18}) == 4);
    assert(lisQuadratic({7, 7, 7}) == 1);                      // strictly increasing
    assert(lisBinarySearch({7, 7, 7}) == 1);
    assert(lisQuadratic({}) == 0 && lisBinarySearch({}) == 0);
    for (const vector<int>& c : vector<vector<int>>{
             {1}, {3, 1, 2}, {1, 3, 6, 7, 9, 4, 10, 5, 6}, {5, 4, 3, 2, 1}})
        assert(lisQuadratic(c) == lisBinarySearch(c));

    assert(uniquePaths(3, 7) == 28);
    assert(uniquePaths(1, 1) == 1);
    assert(uniquePaths(3, 2) == 3);

    assert(minPathSum({{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}) == 7);   // 1,3,1,1,1
    assert(minPathSum({{1, 2, 3}, {4, 5, 6}}) == 12);
    assert(minPathSum({}) == 0);

    // --- Interval DP ---------------------------------------------------------
    // 10x30, 30x5, 5x60: ((AB)C) costs 4500, (A(BC)) costs 27000.
    assert(matrixChainOrder({10, 30, 5, 60}) == 4500);
    assert(matrixChainOrder({40, 20, 30, 10, 30}) == 26000);
    assert(matrixChainOrder({5, 10}) == 0);        // a single matrix
    assert(matrixChainOrder({7}) == 0);            // no matrices at all

    assert(burstBalloons({3, 1, 5, 8}) == 167);
    assert(burstBalloons({1, 5}) == 10);
    assert(burstBalloons({9}) == 9);
    assert(burstBalloons({}) == 0);

    assert(minCostToCutStick(7, {1, 3, 4, 5}) == 16);
    assert(minCostToCutStick(9, {5, 6, 1, 4, 2}) == 22);

    // Against brute force over every parenthesisation / burst order.
    mt19937 rng(15);

    // Plain memoised recursion - an independent route to the same answer.
    function<long long(int, int)> bruteChain;
    vector<int> chainDims;
    vector<vector<long long>> chainMemo;
    bruteChain = [&](int i, int j) -> long long {
        if (j - i <= 1) return 0;
        if (chainMemo[i][j] >= 0) return chainMemo[i][j];
        long long best = LLONG_MAX;
        for (int k = i + 1; k < j; k++) {
            best = min(best, bruteChain(i, k) + bruteChain(k, j)
                                 + 1LL * chainDims[i] * chainDims[k] * chainDims[j]);
        }
        return chainMemo[i][j] = best;
    };

    for (int trial = 0; trial < 60; trial++) {
        int count = int(rng() % 7) + 1;
        chainDims.clear();
        for (int i = 0; i < count; i++) chainDims.push_back(int(rng() % 20) + 1);
        chainMemo.assign(chainDims.size(), vector<long long>(chainDims.size(), -1));
        assert(matrixChainOrder(chainDims)
               == bruteChain(0, int(chainDims.size()) - 1));
    }

    // Try every possible burst order - O(n!), so keep n tiny.
    function<long long(vector<int>)> bruteBurst = [&](vector<int> values) -> long long {
        if (values.empty()) return 0;
        long long best = 0;
        for (size_t i = 0; i < values.size(); i++) {
            long long left = i > 0 ? values[i - 1] : 1;
            long long right = i + 1 < values.size() ? values[i + 1] : 1;
            long long gain = left * values[i] * right;
            vector<int> rest = values;
            rest.erase(rest.begin() + long(i));
            best = max(best, gain + bruteBurst(rest));
        }
        return best;
    };

    for (int trial = 0; trial < 40; trial++) {
        vector<int> values;
        int count = int(rng() % 7);
        for (int i = 0; i < count; i++) values.push_back(int(rng() % 9) + 1);
        assert(burstBalloons(values) == bruteBurst(values));
    }

    // --- Bitmask DP -----------------------------------------------------------
    // A square: 0-1-2-3-0 with unit sides and diagonals of 2.
    vector<vector<int>> square{
        {0, 1, 2, 1},
        {1, 0, 1, 2},
        {2, 1, 0, 1},
        {1, 2, 1, 0},
    };
    assert(travellingSalesman(square) == 4);            // walk the perimeter
    assert(travellingSalesman({{0}}) == 0);
    assert(travellingSalesman({{0, 5}, {5, 0}}) == 10); // there and back

    vector<vector<bool>> identity(3, vector<bool>(3, true));
    assert(countPerfectMatchings(identity) == 6);       // 3! assignments
    assert(countPerfectMatchings({{true, false}, {false, true}}) == 1);
    assert(countPerfectMatchings({{true, true}, {false, false}}) == 0);

    assert(subsetSumPartitionMinDifference({1, 6, 11, 5}) == 1);
    assert(subsetSumPartitionMinDifference({3, 3}) == 0);
    assert(subsetSumPartitionMinDifference({10}) == 10);

    // Held-Karp against brute force over every permutation.
    for (int trial = 0; trial < 30; trial++) {
        int n = int(rng() % 7) + 1;
        vector<vector<int>> matrix(n, vector<int>(n, 0));
        for (int u = 0; u < n; u++) {
            for (int v = u + 1; v < n; v++) {
                matrix[u][v] = matrix[v][u] = int(rng() % 30) + 1;   // symmetric
            }
        }

        vector<int> route(n);
        for (int i = 0; i < n; i++) route[i] = i;
        long long expected = LLONG_MAX;
        do {  // city 0 is pinned first, so only the tail permutes
            long long total = 0;
            for (int i = 0; i + 1 < n; i++) total += matrix[route[i]][route[i + 1]];
            total += matrix[route[n - 1]][0];
            expected = min(expected, total);
        } while (next_permutation(route.begin() + 1, route.end()));

        assert(travellingSalesman(matrix) == expected);
    }

    // Perfect matchings against brute force over every permutation.
    for (int trial = 0; trial < 30; trial++) {
        int n = int(rng() % 6) + 1;
        vector<vector<bool>> allowed(n, vector<bool>(n));
        for (int p = 0; p < n; p++)
            for (int t = 0; t < n; t++) allowed[p][t] = (rng() % 10) < 6;

        vector<int> assignment(n);
        for (int i = 0; i < n; i++) assignment[i] = i;
        long long expected = 0;
        do {
            bool valid = true;
            for (int person = 0; person < n && valid; person++) {
                if (!allowed[person][assignment[person]]) valid = false;
            }
            if (valid) expected++;
        } while (next_permutation(assignment.begin(), assignment.end()));

        assert(countPerfectMatchings(allowed) == expected);
    }

    // Minimum partition difference against enumerating every subset.
    for (int trial = 0; trial < 30; trial++) {
        int n = int(rng() % 10) + 1;
        vector<int> nums(n);
        int total = 0;
        for (int i = 0; i < n; i++) {
            nums[i] = int(rng() % 20) + 1;
            total += nums[i];
        }

        int bestDiff = total;
        for (int mask = 0; mask < (1 << n); mask++) {
            int part = 0;
            for (int i = 0; i < n; i++)
                if (mask >> i & 1) part += nums[i];
            bestDiff = min(bestDiff, abs(total - 2 * part));
        }
        assert(subsetSumPartitionMinDifference(nums) == bestDiff);
    }

    cout << "15-Dynamic-Programming (C++): all checks passed\n";
    cout << "  Interval DP checked against every parenthesisation and burst order,\n";
    cout << "  bitmask DP against every permutation\n";
    return 0;
}
