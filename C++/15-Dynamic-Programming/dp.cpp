// 15 - Dynamic Programming: every classic family, memoised and tabulated,
// with the space optimisations spelled out.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall dp.cpp -o dp && ./dp

#include <algorithm>
#include <cassert>
#include <climits>
#include <iostream>
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

    cout << "15-Dynamic-Programming (C++): all checks passed\n";
    return 0;
}
