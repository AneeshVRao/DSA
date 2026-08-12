// 07 - Recursion and Backtracking: from factorial to N-Queens, all on the same
// choose / explore / un-choose skeleton.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall recursion.cpp -o recursion && ./recursion

#include <algorithm>
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// ============================================================================
// 1. Plain recursion
// ============================================================================

// O(n) time, O(n) stack. long long overflows past 20!.
long long factorial(int n) {
    if (n < 0) throw invalid_argument("factorial of a negative");
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// O(2^n): the same subproblems are recomputed exponentially often.
long long fibNaive(int n) {
    if (n < 2) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// O(n) time and space: each state is computed once and cached.
long long fibMemo(int n, vector<long long>& memo) {
    if (n < 2) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
}

// Fast exponentiation: x^n = (x^(n/2))^2. O(log n) instead of O(n).
double power(double base, int exp) {
    if (exp < 0) return 1.0 / power(base, -exp);
    if (exp == 0) return 1.0;
    double half = power(base, exp / 2);
    return (exp % 2 == 0) ? half * half : half * half * base;
}

// Digit recursion: strip one digit per call. O(log n).
int sumDigits(int n) {
    n = abs(n);
    return n < 10 ? n : n % 10 + sumDigits(n / 10);
}

// Tower of Hanoi. Exactly 2^n - 1 moves, which is provably optimal.
// To move n disks: move n-1 aside, move the biggest, move the n-1 back.
void hanoi(int n, char source, char target, char spare,
           vector<pair<char, char>>& moves) {
    if (n == 0) return;
    hanoi(n - 1, source, spare, target, moves);
    moves.push_back({source, target});
    hanoi(n - 1, spare, target, source, moves);
}

// ============================================================================
// 2. Backtracking - subsets and permutations
// ============================================================================

// All 2^n subsets. O(n * 2^n) - the n is the cost of copying each path.
void subsetsHelper(const vector<int>& nums, int start, vector<int>& path,
                   vector<vector<int>>& results) {
    results.push_back(path);                  // a COPY of the current path
    for (size_t i = start; i < nums.size(); i++) {
        path.push_back(nums[i]);              // 1. choose
        subsetsHelper(nums, int(i) + 1, path, results);   // 2. explore
        path.pop_back();                      // 3. un-choose
    }
}

vector<vector<int>> subsets(const vector<int>& nums) {
    vector<vector<int>> results;
    vector<int> path;
    subsetsHelper(nums, 0, path, results);
    return results;
}

// All n! orderings. O(n * n!). `used` is what prunes the tree.
void permutationsHelper(const vector<int>& nums, vector<bool>& used,
                        vector<int>& path, vector<vector<int>>& results) {
    if (path.size() == nums.size()) {
        results.push_back(path);
        return;
    }
    for (size_t i = 0; i < nums.size(); i++) {
        if (used[i]) continue;                // prune: already placed
        used[i] = true;
        path.push_back(nums[i]);
        permutationsHelper(nums, used, path, results);
        path.pop_back();
        used[i] = false;                      // undo BOTH pieces of state
    }
}

vector<vector<int>> permutations(const vector<int>& nums) {
    vector<vector<int>> results;
    vector<int> path;
    vector<bool> used(nums.size(), false);
    permutationsHelper(nums, used, path, results);
    return results;
}

// Combinations summing to target, candidates reusable.
// Sorting lets us break (not continue) once the remainder goes negative.
void combinationSumHelper(const vector<int>& candidates, int start, int remaining,
                          vector<int>& path, vector<vector<int>>& results) {
    if (remaining == 0) {
        results.push_back(path);
        return;
    }
    for (size_t i = start; i < candidates.size(); i++) {
        if (candidates[i] > remaining) break;  // prune the whole tail
        path.push_back(candidates[i]);
        // i, not i+1: the same candidate may be reused
        combinationSumHelper(candidates, int(i), remaining - candidates[i], path,
                             results);
        path.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int> candidates, int target) {
    sort(candidates.begin(), candidates.end());   // enables the break above
    vector<vector<int>> results;
    vector<int> path;
    combinationSumHelper(candidates, 0, target, path, results);
    return results;
}

// All valid combinations of n pairs of parentheses (Catalan(n) of them).
// Two rules make every generated string valid by construction.
void parenthesesHelper(int n, int open, int close, string& path,
                       vector<string>& results) {
    if (int(path.size()) == 2 * n) {
        results.push_back(path);
        return;
    }
    if (open < n) {                          // we may still open
        path.push_back('(');
        parenthesesHelper(n, open + 1, close, path, results);
        path.pop_back();
    }
    if (close < open) {                      // we may only close what is open
        path.push_back(')');
        parenthesesHelper(n, open, close + 1, path, results);
        path.pop_back();
    }
}

vector<string> generateParentheses(int n) {
    vector<string> results;
    string path;
    parenthesesHelper(n, 0, 0, path, results);
    return results;
}

// ============================================================================
// 3. Backtracking on a board
// ============================================================================

// N-Queens. One queen per row is baked into the recursion, so only the column
// and the two diagonals need tracking: (r-c) and (r+c) must each be unique.
struct QueenState {
    int n;
    vector<bool> cols, diag, anti;    // diag indexed by r-c+n, anti by r+c
    vector<int> placement;
    vector<vector<string>> results;

    explicit QueenState(int size)
        : n(size), cols(size, false), diag(2 * size, false), anti(2 * size, false) {}

    void backtrack(int row) {
        if (row == n) {
            vector<string> board;
            board.reserve(n);
            for (int c : placement) board.push_back(string(c, '.') + "Q" +
                                                    string(n - c - 1, '.'));
            results.push_back(move(board));
            return;
        }
        for (int col = 0; col < n; col++) {
            if (cols[col] || diag[row - col + n] || anti[row + col]) continue;
            cols[col] = diag[row - col + n] = anti[row + col] = true;
            placement.push_back(col);

            backtrack(row + 1);

            placement.pop_back();
            cols[col] = diag[row - col + n] = anti[row + col] = false;
        }
    }
};

vector<vector<string>> solveNQueens(int n) {
    QueenState state(n);
    state.backtrack(0);
    return state.results;
}

// Word search on a grid. O(rows * cols * 4^len).
// The visited mark is written into the board and restored - that restore is
// the backtrack step.
bool wordSearchHelper(vector<vector<char>>& board, const string& word, int r,
                      int c, size_t i) {
    if (i == word.size()) return true;
    if (r < 0 || r >= int(board.size()) || c < 0 || c >= int(board[0].size()))
        return false;
    if (board[r][c] != word[i]) return false;

    char saved = board[r][c];
    board[r][c] = '#';                      // mark visited
    bool found = wordSearchHelper(board, word, r + 1, c, i + 1) ||
                 wordSearchHelper(board, word, r - 1, c, i + 1) ||
                 wordSearchHelper(board, word, r, c + 1, i + 1) ||
                 wordSearchHelper(board, word, r, c - 1, i + 1);
    board[r][c] = saved;                    // restore
    return found;
}

bool wordSearch(vector<vector<char>>& board, const string& word) {
    if (word.empty() || board.empty() || board[0].empty()) return false;
    for (int r = 0; r < int(board.size()); r++)
        for (int c = 0; c < int(board[0].size()); c++)
            if (wordSearchHelper(board, word, r, c, 0)) return true;
    return false;
}

// ============================================================================
// 4. Turning recursion into iteration
// ============================================================================
long long factorialIterative(int n) {       // O(1) stack
    long long result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}

// Depth-first traversal with an explicit stack - the escape hatch when the
// recursion depth would overflow the real one.
vector<int> dfsIterative(const unordered_map<int, vector<int>>& graph, int start) {
    vector<int> order;
    vector<bool> visited(100, false);
    vector<int> st{start};
    while (!st.empty()) {
        int node = st.back();
        st.pop_back();
        if (visited[node]) continue;
        visited[node] = true;
        order.push_back(node);
        auto it = graph.find(node);
        if (it != graph.end())
            for (auto rit = it->second.rbegin(); rit != it->second.rend(); ++rit)
                st.push_back(*rit);          // reversed: preserves DFS order
    }
    return order;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    assert(factorial(0) == 1 && factorial(5) == 120);
    assert(factorialIterative(5) == factorial(5));

    assert(fibNaive(10) == 55);
    vector<long long> memo(51, -1);
    assert(fibMemo(50, memo) == 12586269025LL);

    assert(power(2, 10) == 1024);
    assert(power(2, 0) == 1);
    assert(power(2, -2) == 0.25);
    assert(sumDigits(9875) == 29);

    vector<pair<char, char>> moves;
    hanoi(3, 'A', 'C', 'B', moves);
    assert(moves.size() == 7);               // 2^3 - 1
    assert(moves.front() == make_pair('A', 'C'));
    assert(moves.back() == make_pair('A', 'C'));

    auto subs = subsets({1, 2, 3});
    assert(subs.size() == 8);                // 2^3
    assert(count(subs.begin(), subs.end(), vector<int>{}) == 1);
    assert(count(subs.begin(), subs.end(), vector<int>{1, 2, 3}) == 1);

    auto perms = permutations({1, 2, 3});
    assert(perms.size() == 6);               // 3!
    sort(perms.begin(), perms.end());
    assert(unique(perms.begin(), perms.end()) == perms.end());  // all distinct

    auto combos = combinationSum({2, 3, 6, 7}, 7);
    sort(combos.begin(), combos.end());
    assert((combos == vector<vector<int>>{{2, 2, 3}, {7}}));

    auto parens = generateParentheses(3);
    assert(parens.size() == 5);              // Catalan(3)
    assert(count(parens.begin(), parens.end(), string("((()))")) == 1);

    assert(solveNQueens(4).size() == 2);
    assert(solveNQueens(8).size() == 92);    // the classic answer
    assert(solveNQueens(1).size() == 1);
    assert(solveNQueens(3).empty());         // no solution exists

    vector<vector<char>> board{{'A', 'B', 'C', 'E'},
                               {'S', 'F', 'C', 'S'},
                               {'A', 'D', 'E', 'E'}};
    assert(wordSearch(board, "ABCCED"));
    assert(wordSearch(board, "SEE"));
    assert(!wordSearch(board, "ABCB"));      // cannot reuse a cell
    assert(board[0][0] == 'A');              // board restored, not corrupted

    unordered_map<int, vector<int>> graph{{1, {2, 3}}, {2, {4}}, {3, {4}}, {4, {}}};
    assert((dfsIterative(graph, 1) == vector<int>{1, 2, 4, 3}));

    cout << "07-Recursion-Backtracking (C++): all checks passed\n";
    return 0;
}
