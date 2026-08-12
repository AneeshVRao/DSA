// 11 - Trees: binary trees, all four traversals (recursive, iterative and
// Morris), and the bottom-up recursion pattern that solves most tree problems.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall trees.cpp -o trees && ./trees

#include <algorithm>
#include <cassert>
#include <cctype>
#include <climits>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <map>
#include <optional>
#include <queue>
#include <random>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

using namespace std;

// ============================================================================
// Node and construction
// ============================================================================
struct TreeNode {
    int val;
    TreeNode* left = nullptr;
    TreeNode* right = nullptr;
    explicit TreeNode(int v) : val(v) {}
};

// Build from a level-order list where nullopt marks a missing child - the
// LeetCode input format, so tests read the same way there.
TreeNode* buildTree(const vector<optional<int>>& values) {
    if (values.empty() || !values[0]) return nullptr;
    TreeNode* root = new TreeNode(*values[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < values.size()) {
        TreeNode* node = q.front();
        q.pop();
        if (i < values.size()) {
            if (values[i]) {
                node->left = new TreeNode(*values[i]);
                q.push(node->left);
            }
            i++;
        }
        if (i < values.size()) {
            if (values[i]) {
                node->right = new TreeNode(*values[i]);
                q.push(node->right);
            }
            i++;
        }
    }
    return root;
}

// Postorder is the ONLY correct order here: free the children before the
// parent, or the pointers to them are gone.
void deleteTree(TreeNode* root) {
    if (!root) return;
    deleteTree(root->left);
    deleteTree(root->right);
    delete root;
}

// ============================================================================
// 1. Depth-first traversals - recursive
// ============================================================================
void preorderHelper(TreeNode* node, vector<int>& out) {
    if (!node) return;
    out.push_back(node->val);          // node
    preorderHelper(node->left, out);   // left
    preorderHelper(node->right, out);  // right
}

vector<int> preorder(TreeNode* root) {
    vector<int> out;
    preorderHelper(root, out);
    return out;
}

void inorderHelper(TreeNode* node, vector<int>& out) {
    if (!node) return;
    inorderHelper(node->left, out);
    out.push_back(node->val);          // on a BST this comes out SORTED
    inorderHelper(node->right, out);
}

vector<int> inorder(TreeNode* root) {
    vector<int> out;
    inorderHelper(root, out);
    return out;
}

void postorderHelper(TreeNode* node, vector<int>& out) {
    if (!node) return;
    postorderHelper(node->left, out);
    postorderHelper(node->right, out);
    out.push_back(node->val);          // the shape of every bottom-up computation
}

vector<int> postorder(TreeNode* root) {
    vector<int> out;
    postorderHelper(root, out);
    return out;
}

// ============================================================================
// 2. Depth-first traversals - iterative
// ============================================================================
// Push RIGHT first so the left child is processed first.
vector<int> preorderIterative(TreeNode* root) {
    vector<int> out;
    if (!root) return out;
    vector<TreeNode*> stack{root};
    while (!stack.empty()) {
        TreeNode* node = stack.back();
        stack.pop_back();
        out.push_back(node->val);
        if (node->right) stack.push_back(node->right);
        if (node->left) stack.push_back(node->left);
    }
    return out;
}

// Dive left pushing nodes; pop, visit, then turn right.
vector<int> inorderIterative(TreeNode* root) {
    vector<int> out;
    vector<TreeNode*> stack;
    TreeNode* node = root;
    while (node || !stack.empty()) {
        while (node) {                 // as far left as possible
            stack.push_back(node);
            node = node->left;
        }
        node = stack.back();
        stack.pop_back();
        out.push_back(node->val);
        node = node->right;
    }
    return out;
}

// Preorder as node-right-left, then reversed - much easier to get right than
// the two-stack or last-visited-pointer variants.
vector<int> postorderIterative(TreeNode* root) {
    vector<int> out;
    if (!root) return out;
    vector<TreeNode*> stack{root};
    while (!stack.empty()) {
        TreeNode* node = stack.back();
        stack.pop_back();
        out.push_back(node->val);
        if (node->left) stack.push_back(node->left);
        if (node->right) stack.push_back(node->right);
    }
    reverse(out.begin(), out.end());
    return out;
}

// Inorder in O(1) space. Each node with a left child gets a temporary thread
// from its inorder predecessor back to itself; following the thread returns
// us here, and it is then removed - the tree ends exactly as it started.
vector<int> morrisInorder(TreeNode* root) {
    vector<int> out;
    TreeNode* node = root;
    while (node) {
        if (!node->left) {
            out.push_back(node->val);
            node = node->right;
        } else {
            TreeNode* predecessor = node->left;
            while (predecessor->right && predecessor->right != node)
                predecessor = predecessor->right;

            if (!predecessor->right) {
                predecessor->right = node;      // create the thread
                node = node->left;
            } else {
                predecessor->right = nullptr;   // thread used: undo it
                out.push_back(node->val);
                node = node->right;
            }
        }
    }
    return out;
}

// ============================================================================
// 3. Breadth-first traversal
// ============================================================================
// Capturing the level size BEFORE the inner loop is what separates the levels.
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> levels;
    if (!root) return levels;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        size_t levelSize = q.size();
        vector<int> level;
        level.reserve(levelSize);
        for (size_t i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        levels.push_back(move(level));
    }
    return levels;
}

vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
    auto levels = levelOrder(root);
    for (size_t i = 1; i < levels.size(); i += 2)
        reverse(levels[i].begin(), levels[i].end());
    return levels;
}

vector<int> rightSideView(TreeNode* root) {
    vector<int> out;
    for (const auto& level : levelOrder(root)) out.push_back(level.back());
    return out;
}

// ============================================================================
// 4. Bottom-up recursion
// ============================================================================
// Empty tree = -1, single node = 0 (height counts EDGES).
int height(TreeNode* root) {
    if (!root) return -1;
    return 1 + max(height(root->left), height(root->right));
}

int countNodes(TreeNode* root) {
    return root ? 1 + countNodes(root->left) + countNodes(root->right) : 0;
}

int countLeaves(TreeNode* root) {
    if (!root) return 0;
    if (!root->left && !root->right) return 1;
    return countLeaves(root->left) + countLeaves(root->right);
}

// Returns the height, or -2 as a sentinel meaning "already unbalanced".
// Returning the height AND the verdict from one pass keeps this O(n);
// calling height() at every node would be O(n^2).
int balancedHeight(TreeNode* node) {
    if (!node) return -1;
    int left = balancedHeight(node->left);
    if (left == -2) return -2;                      // short-circuit
    int right = balancedHeight(node->right);
    if (right == -2) return -2;
    if (abs(left - right) > 1) return -2;
    return 1 + max(left, right);
}

bool isBalanced(TreeNode* root) { return balancedHeight(root) != -2; }

// Longest path between any two nodes, in edges. The path either bends at some
// node (left height + right height + 2) or lies inside one subtree.
int diameterHelper(TreeNode* node, int& best) {
    if (!node) return -1;
    int left = diameterHelper(node->left, best);
    int right = diameterHelper(node->right, best);
    best = max(best, left + right + 2);             // path through this node
    return 1 + max(left, right);
}

int diameter(TreeNode* root) {
    int best = 0;
    diameterHelper(root, best);
    return best;
}

// Largest node-to-node path sum. A negative branch contributes nothing, so
// clamp it to 0 - that single max(0, ...) is what makes negatives work.
int maxPathSumHelper(TreeNode* node, int& best) {
    if (!node) return 0;
    int left = max(maxPathSumHelper(node->left, best), 0);
    int right = max(maxPathSumHelper(node->right, best), 0);
    best = max(best, node->val + left + right);     // path bending here
    return node->val + max(left, right);            // only ONE branch goes up
}

int maxPathSum(TreeNode* root) {
    int best = INT_MIN;
    maxPathSumHelper(root, best);
    return best;
}

// ============================================================================
// 5. Structural operations
// ============================================================================
TreeNode* invert(TreeNode* root) {
    if (!root) return nullptr;
    TreeNode* left = invert(root->left);
    root->left = invert(root->right);
    root->right = left;
    return root;
}

bool isSameTree(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return isSameTree(a->left, b->left) && isSameTree(a->right, b->right);
}

// Mirror comparison: OUTER against OUTER, inner against inner.
bool isMirror(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return isMirror(a->left, b->right) && isMirror(a->right, b->left);
}

bool isSymmetric(TreeNode* root) {
    return !root || isMirror(root->left, root->right);
}

// Deepest node with both p and q below it. If they come back from different
// sides, this node is the answer; otherwise the answer is further up.
TreeNode* lowestCommonAncestor(TreeNode* root, int p, int q) {
    if (!root || root->val == p || root->val == q) return root;
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if (left && right) return root;                 // p and q split here
    return left ? left : right;
}

// ============================================================================
// 6. Paths
// ============================================================================
bool hasPathSum(TreeNode* root, int target) {
    if (!root) return false;
    if (!root->left && !root->right) return root->val == target;
    int remaining = target - root->val;
    return hasPathSum(root->left, remaining) || hasPathSum(root->right, remaining);
}

// Classic backtracking: push, recurse, pop.
void allPathsHelper(TreeNode* node, vector<int>& path, vector<vector<int>>& out) {
    if (!node) return;
    path.push_back(node->val);                      // choose
    if (!node->left && !node->right) {
        out.push_back(path);                        // COPY at the leaf
    } else {
        allPathsHelper(node->left, path, out);
        allPathsHelper(node->right, path, out);
    }
    path.pop_back();                                // un-choose
}

vector<vector<int>> allPaths(TreeNode* root) {
    vector<vector<int>> out;
    vector<int> path;
    allPathsHelper(root, path, out);
    return out;
}

// ============================================================================
// 7. Serialisation
// ============================================================================
// Preorder with explicit '#' for null - without null markers a preorder
// string does not determine the tree.
void serializeHelper(TreeNode* node, string& out) {
    if (!node) {
        out += "#,";
        return;
    }
    out += to_string(node->val) + ",";
    serializeHelper(node->left, out);
    serializeHelper(node->right, out);
}

string serialize(TreeNode* root) {
    string out;
    serializeHelper(root, out);
    if (!out.empty()) out.pop_back();               // drop the trailing comma
    return out;
}

TreeNode* deserializeHelper(istringstream& stream) {
    string token;
    if (!getline(stream, token, ',')) return nullptr;
    if (token == "#") return nullptr;
    TreeNode* node = new TreeNode(stoi(token));
    node->left = deserializeHelper(stream);
    node->right = deserializeHelper(stream);
    return node;
}

TreeNode* deserialize(const string& data) {
    istringstream stream(data);
    return deserializeHelper(stream);
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// Euler tour - flattening a tree into an array
// ============================================================================

// The full walk: every node recorded on ENTRY and again after each child. O(n).
//
// A DFS that appends the current node every time control passes through it -
// on the way in, and again after returning from each child. The result has
// exactly 2n - 1 entries for an n-node tree.
//
// Why it matters: it turns a TREE problem into an ARRAY problem. The lowest
// common ancestor of u and v is the SHALLOWEST node in the tour between any
// occurrence of u and any occurrence of v - which makes LCA a range-minimum
// query, answerable in O(1) with the sparse table from chapter 19.
//
//           1
//          / .        tour: 1 2 4 2 5 2 1 3 1
//         2   3       LCA(4, 5) = the shallowest node between them = 2
//        / .
//       4   5
//
// The three classic traversals are all projections of this one walk:
//   preorder  - take each node at its FIRST appearance
//   inorder   - take each node at its middle appearance (binary trees)
//   postorder - take each node at its LAST appearance
void eulerTourHelper(TreeNode* node, vector<int>& tour) {
    tour.push_back(node->val);
    for (TreeNode* child : {node->left, node->right}) {
        if (child) {
            eulerTourHelper(child, tour);
            tour.push_back(node->val);   // record the node again on the way back
        }
    }
}

vector<int> eulerTour(TreeNode* root) {
    vector<int> tour;
    if (root) eulerTourHelper(root, tour);
    return tour;
}

// Entry and exit timestamps per node. O(n).
//
// The other Euler tour, and the more useful one in practice. Stamp a counter
// on the way in and on the way out. Then:
//
//     u is an ancestor of v   <=>   tin[u] <= tin[v] and tout[v] <= tout[u]
//
// An ancestor test in O(1), with no walking. Better still, a node's subtree
// occupies the CONTIGUOUS range [tin, tout) of the entry order - so "sum over
// a subtree" or "add x to a whole subtree" becomes a range query on a flat
// array, which a Fenwick or segment tree handles in O(log n).
//
// This is the standard preprocessing for subtree queries, and half of
// heavy-light decomposition.
//
// Iterative, to avoid blowing the stack on a degenerate (list-shaped) tree.
map<int, pair<int, int>> eulerInOut(TreeNode* root) {
    map<int, pair<int, int>> times;
    if (!root) return times;

    int clock = 0;
    map<int, int> entry;
    // (node, leaving?) - false means "arriving", true means "leaving".
    vector<pair<TreeNode*, bool>> stack{{root, false}};

    while (!stack.empty()) {
        auto [node, leaving] = stack.back();
        stack.pop_back();

        if (leaving) {
            times[node->val] = {entry[node->val], clock};
            continue;
        }

        entry[node->val] = clock++;
        stack.push_back({node, true});           // schedule the exit stamp
        // Right first, so the left child comes off the stack first.
        for (TreeNode* child : {node->right, node->left}) {
            if (child) stack.push_back({child, false});
        }
    }
    return times;
}

// ============================================================================
// Expression trees - an AST for arithmetic
// ============================================================================

const map<string, int> PRECEDENCE{{"+", 1}, {"-", 1}, {"*", 2}, {"/", 2}};

bool isOperator(const string& token) { return PRECEDENCE.count(token) > 0; }

// A node in an expression tree: an operator with two children, or a leaf.
//
// An expression tree is the smallest interesting abstract syntax tree, and it
// makes the three traversals mean something concrete:
//
//     Tree for (3 + 4) * 2:      infix   (3 + 4) * 2    <- inorder
//                                postfix  3 4 + 2 *     <- postorder
//                                prefix   * + 3 4 2     <- preorder
//
// The tree carries precedence and grouping in its SHAPE, so postfix and prefix
// need no brackets at all - the structure is unambiguous without them. Only
// infix needs parentheses, because it throws that information away.
//
// This is what a compiler front-end builds, and evaluating it is a post-order
// fold: children first, then combine.
struct ExprNode {
    string value;
    ExprNode* left = nullptr;
    ExprNode* right = nullptr;

    explicit ExprNode(string v) : value(std::move(v)) {}
    bool isOperator() const { return PRECEDENCE.count(value) > 0; }
};

void deleteExprTree(ExprNode* node) {
    if (!node) return;
    deleteExprTree(node->left);
    deleteExprTree(node->right);
    delete node;
}

// Split into numbers, operators and brackets. Multi-digit numbers survive.
vector<string> tokenizeExpression(const string& expression) {
    vector<string> tokens;
    size_t i = 0;
    while (i < expression.size()) {
        char c = expression[i];
        if (isspace(static_cast<unsigned char>(c))) { i++; continue; }
        if (isdigit(static_cast<unsigned char>(c))) {
            size_t start = i;
            while (i < expression.size() &&
                   (isdigit(static_cast<unsigned char>(expression[i])) ||
                    expression[i] == '.')) {
                i++;
            }
            tokens.push_back(expression.substr(start, i - start));
        } else {
            tokens.push_back(string(1, c));
            i++;
        }
    }
    return tokens;
}

// Shunting-yard: infix to postfix in one pass. O(n).
//
// Numbers go straight to the output. Operators wait on a stack until something
// of LOWER precedence arrives, at which point they are popped - which is
// exactly what makes `*` bind tighter than `+` with no lookahead or recursion.
//
// Left associativity is the `>=` in the pop condition: for `8 - 3 - 2` the
// first `-` is popped when the second arrives, giving `(8-3)-2 = 3` rather than
// `8-(3-2) = 7`. Changing it to `>` would silently make subtraction
// right-associative - a real bug, and an easy one to miss.
//
// Throws invalid_argument on malformed input. The bare algorithm does not
// validate at all - see the comment in the body.
vector<string> infixToPostfix(const vector<string>& tokens) {
    vector<string> output;
    vector<string> operators;

    // Shunting-yard on its own does NOT validate. Fed "+ 1 2" it happily emits
    // "1 2 +" and reports success, silently reinterpreting prefix input as
    // infix. Tracking what is expected next is what turns a garbled expression
    // into an error instead of a plausible wrong answer.
    bool expectOperand = true;

    for (const string& token : tokens) {
        if (isOperator(token)) {
            if (expectOperand) throw invalid_argument("operator where an operand was expected");
            while (!operators.empty() && operators.back() != "(" &&
                   PRECEDENCE.at(operators.back()) >= PRECEDENCE.at(token)) {
                output.push_back(operators.back());   // >= : LEFT associative
                operators.pop_back();
            }
            operators.push_back(token);
            expectOperand = true;

        } else if (token == "(") {
            if (!expectOperand) throw invalid_argument("'(' directly after an operand");
            operators.push_back(token);

        } else if (token == ")") {
            if (expectOperand) throw invalid_argument("')' where an operand was expected");
            while (!operators.empty() && operators.back() != "(") {
                output.push_back(operators.back());
                operators.pop_back();
            }
            if (operators.empty()) throw invalid_argument("unbalanced parentheses");
            operators.pop_back();                     // discard the "("
            // A closed group behaves as a completed operand.

        } else {
            if (!expectOperand) throw invalid_argument("two operands in a row");
            output.push_back(token);                  // a number
            expectOperand = false;
        }
    }

    if (expectOperand) throw invalid_argument("expression ends with an operator");

    while (!operators.empty()) {
        if (operators.back() == "(") throw invalid_argument("unbalanced parentheses");
        output.push_back(operators.back());
        operators.pop_back();
    }
    return output;
}

// Build the tree from postfix in one stack pass. O(n).
//
// Postfix is the natural input: by the time an operator appears, both of its
// operands are already complete subtrees sitting on the stack.
//
// The RIGHT operand pops FIRST - it was pushed last. Getting that backwards
// still builds a valid-looking tree and still evaluates correctly for `+` and
// `*`; it silently reverses `-` and `/`. A test using only commutative
// operators would never catch it.
ExprNode* buildFromPostfix(const vector<string>& tokens) {
    vector<ExprNode*> stack;

    auto cleanup = [&stack]() {
        for (ExprNode* node : stack) deleteExprTree(node);
        stack.clear();
    };

    for (const string& token : tokens) {
        if (isOperator(token)) {
            if (stack.size() < 2) {
                cleanup();
                throw invalid_argument("operator with too few operands");
            }
            ExprNode* right = stack.back(); stack.pop_back();   // RIGHT first
            ExprNode* left = stack.back(); stack.pop_back();
            ExprNode* node = new ExprNode(token);
            node->left = left;
            node->right = right;
            stack.push_back(node);
        } else {
            stack.push_back(new ExprNode(token));
        }
    }

    if (stack.size() != 1) {
        cleanup();
        throw invalid_argument("malformed expression");
    }
    return stack[0];
}

// Infix string to expression tree: tokenize, shunting-yard, then build.
ExprNode* buildExpressionTree(const string& expression) {
    return buildFromPostfix(infixToPostfix(tokenizeExpression(expression)));
}

// Evaluate bottom-up. O(n) - a post-order fold.
double evaluateExpression(const ExprNode* node) {
    if (!node->isOperator()) return stod(node->value);

    double left = evaluateExpression(node->left);
    double right = evaluateExpression(node->right);

    if (node->value == "+") return left + right;
    if (node->value == "-") return left - right;
    if (node->value == "*") return left * right;
    if (right == 0) throw invalid_argument("division by zero in expression");
    return left / right;
}

// PREorder: operator, left, right. No brackets needed - unambiguous.
vector<string> toPrefix(const ExprNode* node) {
    if (!node->isOperator()) return {node->value};
    vector<string> out{node->value};
    for (const string& t : toPrefix(node->left)) out.push_back(t);
    for (const string& t : toPrefix(node->right)) out.push_back(t);
    return out;
}

// POSTorder: left, right, operator. What a stack machine executes.
vector<string> toPostfix(const ExprNode* node) {
    if (!node->isOperator()) return {node->value};
    vector<string> out;
    for (const string& t : toPostfix(node->left)) out.push_back(t);
    for (const string& t : toPostfix(node->right)) out.push_back(t);
    out.push_back(node->value);
    return out;
}

// INorder, fully parenthesised.
//
// Every operator gets brackets. Emitting infix without them would lose the
// grouping the tree encodes - `* + 3 4 2` is unambiguous, `3 + 4 * 2` is not.
string toInfix(const ExprNode* node) {
    if (!node->isOperator()) return node->value;
    return "(" + toInfix(node->left) + " " + node->value + " " +
           toInfix(node->right) + ")";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    /*        1          A block comment, because a // line ending in a
     *      /   \        backslash is a line continuation and would swallow
     *     2     3       the next line (-Wcomment).
     *    / \
     *   4   5
     */
    TreeNode* tree = buildTree({1, 2, 3, 4, 5});

    assert((preorder(tree) == vector<int>{1, 2, 4, 5, 3}));
    assert((inorder(tree) == vector<int>{4, 2, 5, 1, 3}));
    assert((postorder(tree) == vector<int>{4, 5, 2, 3, 1}));

    // The iterative versions must agree with the recursive ones on every shape.
    vector<vector<optional<int>>> shapes{
        {1, 2, 3, 4, 5}, {1}, {1, nullopt, 2}, {1, 2, nullopt, 3}, {},
    };
    for (const auto& shape : shapes) {
        TreeNode* t = buildTree(shape);
        assert(preorderIterative(t) == preorder(t));
        assert(inorderIterative(t) == inorder(t));
        assert(postorderIterative(t) == postorder(t));
        assert(morrisInorder(t) == inorder(t));
        assert(inorder(t) == inorder(t));   // Morris restored the tree
        deleteTree(t);
    }

    assert((levelOrder(tree) == vector<vector<int>>{{1}, {2, 3}, {4, 5}}));
    assert((zigzagLevelOrder(tree) == vector<vector<int>>{{1}, {3, 2}, {4, 5}}));
    assert((rightSideView(tree) == vector<int>{1, 3, 5}));
    assert(levelOrder(nullptr).empty());

    assert(height(tree) == 2 && height(nullptr) == -1);
    assert(countNodes(tree) == 5);
    assert(countLeaves(tree) == 3);         // 4, 5, 3

    assert(isBalanced(tree) && isBalanced(nullptr));
    TreeNode* skewed = buildTree({1, 2, nullopt, 3});
    assert(!isBalanced(skewed));
    deleteTree(skewed);

    assert(diameter(tree) == 3);            // 4 -> 2 -> 1 -> 3
    TreeNode* single = buildTree({1});
    assert(diameter(single) == 0);
    deleteTree(single);

    TreeNode* small = buildTree({1, 2, 3});
    assert(maxPathSum(small) == 6);
    deleteTree(small);
    TreeNode* negative = buildTree({-10, 9, 20, nullopt, nullopt, 15, 7});
    assert(maxPathSum(negative) == 42);
    deleteTree(negative);

    TreeNode* toInvert = buildTree({1, 2, 3, 4, 5});
    assert((levelOrder(invert(toInvert)) ==
            vector<vector<int>>{{1}, {3, 2}, {5, 4}}));
    deleteTree(toInvert);

    TreeNode* a = buildTree({1, 2});
    TreeNode* b = buildTree({1, 2});
    TreeNode* c = buildTree({1, nullopt, 2});
    assert(isSameTree(a, b) && !isSameTree(a, c));
    deleteTree(a);
    deleteTree(b);
    deleteTree(c);

    TreeNode* sym = buildTree({1, 2, 2, 3, 4, 4, 3});
    TreeNode* asym = buildTree({1, 2, 2, nullopt, 3, nullopt, 3});
    assert(isSymmetric(sym) && !isSymmetric(asym));
    deleteTree(sym);
    deleteTree(asym);

    assert(lowestCommonAncestor(tree, 4, 5)->val == 2);
    assert(lowestCommonAncestor(tree, 4, 3)->val == 1);   // they split at root

    assert(hasPathSum(tree, 7));            // 1 + 2 + 4
    assert(!hasPathSum(tree, 100));
    assert((allPaths(tree) ==
            vector<vector<int>>{{1, 2, 4}, {1, 2, 5}, {1, 3}}));

    string encoded = serialize(tree);
    assert(encoded == "1,2,4,#,#,5,#,#,3,#,#");
    TreeNode* rebuilt = deserialize(encoded);
    assert(preorder(rebuilt) == preorder(tree));
    assert(inorder(rebuilt) == inorder(tree));
    assert(serialize(rebuilt) == encoded);  // round trip
    deleteTree(rebuilt);
    assert(deserialize(serialize(nullptr)) == nullptr);

    deleteTree(tree);
    // --- Euler tour -----------------------------------------------------------
    /*        1        A block comment: a // line ending in a backslash is
     *       /   \      a line continuation and would swallow the next
     *      2     3     line (-Wcomment).
     *     /  \
     *    4    5
     */
    TreeNode* eulerTree = buildTree({1, 2, 3, 4, 5});
    assert((eulerTour(eulerTree) == vector<int>{1, 2, 4, 2, 5, 2, 1, 3, 1}));  // 2n-1
    assert(eulerTour(nullptr).empty());

    TreeNode lone(7);
    assert((eulerTour(&lone) == vector<int>{7}));

    map<int, pair<int, int>> times = eulerInOut(eulerTree);
    assert((times[1] == pair<int, int>{0, 5}));      // the root spans everything
    assert((times[4] == pair<int, int>{2, 3}));      // leaves are width 1
    assert((times[5] == pair<int, int>{3, 4}));
    assert(eulerInOut(nullptr).empty());

    // The ancestor test the timestamps exist for.
    auto isAncestor = [&times](int u, int v) {
        return times[u].first <= times[v].first && times[v].second <= times[u].second;
    };
    assert(isAncestor(1, 4) && isAncestor(2, 5));
    assert(!isAncestor(3, 4) && !isAncestor(4, 2));
    assert(isAncestor(3, 3));                        // a node contains itself

    // Against brute force on random trees.
    mt19937 eulerRng(11);
    int nextValue = 0;
    function<TreeNode*(int)> randomTree = [&](int size) -> TreeNode* {
        if (size == 0) return nullptr;
        int leftSize = int(eulerRng() % unsigned(size));      // 0..size-1
        TreeNode* node = new TreeNode(nextValue++);
        node->left = randomTree(leftSize);
        node->right = randomTree(size - 1 - leftSize);
        return node;
    };

    function<void(TreeNode*, vector<int>&)> subtreeValues =
        [&](TreeNode* node, vector<int>& out) {
            if (!node) return;
            out.push_back(node->val);
            subtreeValues(node->left, out);
            subtreeValues(node->right, out);
        };

    for (int trial = 0; trial < 60; trial++) {
        int size = int(eulerRng() % 40) + 1;
        TreeNode* root = randomTree(size);

        assert(eulerTour(root).size() == size_t(2 * size - 1));

        map<int, pair<int, int>> stamps = eulerInOut(root);
        assert(stamps.size() == size_t(size));

        // Every subtree is a CONTIGUOUS timestamp range of its own size - the
        // property that turns subtree queries into range queries.
        function<void(TreeNode*)> check = [&](TreeNode* node) {
            if (!node) return;
            auto [tin, tout] = stamps[node->val];
            vector<int> members;
            subtreeValues(node, members);
            assert(tout - tin == int(members.size()));
            for (int other : members) {
                assert(tin <= stamps[other].first && stamps[other].first < tout);
            }
            check(node->left);
            check(node->right);
        };
        check(root);
        deleteTree(root);
    }
    // --- Expression trees -----------------------------------------------------
    {
        ExprNode* tree = buildExpressionTree("3 + 4 * 2");
        assert(evaluateExpression(tree) == 11.0);          // * binds tighter
        assert((toPostfix(tree) == vector<string>{"3", "4", "2", "*", "+"}));
        assert((toPrefix(tree) == vector<string>{"+", "3", "*", "4", "2"}));
        assert(toInfix(tree) == "(3 + (4 * 2))");
        deleteExprTree(tree);

        ExprNode* bracketed = buildExpressionTree("(3 + 4) * 2");
        assert(evaluateExpression(bracketed) == 14.0);     // brackets override
        assert((toPostfix(bracketed) == vector<string>{"3", "4", "+", "2", "*"}));
        assert((toPrefix(bracketed) == vector<string>{"*", "+", "3", "4", "2"}));
        deleteExprTree(bracketed);

        // Left associativity and operand order. Both are silent when wrong:
        // right for + and *, WRONG for - and /.
        for (auto [text, expected] : vector<pair<string, double>>{
                 {"8 - 3 - 2", 3.0},        // not 7
                 {"16 / 4 / 2", 2.0},       // not 8
                 {"8 - 3", 5.0},            // not -5
                 {"42", 42.0},              // a lone leaf
                 {"2 * (3 + 4) - 5", 9.0},
             }) {
            ExprNode* node = buildExpressionTree(text);
            assert(evaluateExpression(node) == expected);
            deleteExprTree(node);
        }

        // Malformed input is rejected, not silently mis-parsed.
        // const char*, not const string&: a string reference would bind to a
        // temporary built from each literal (-Wrange-loop-construct).
        for (const char* bad : {"(1 + 2", "1 + 2)", "1 +", "+ 1 2", "1 2"}) {
            bool threw = false;
            try {
                deleteExprTree(buildExpressionTree(bad));
            } catch (const invalid_argument&) {
                threw = true;
            }
            assert(threw);
        }

        bool dividedByZero = false;
        try {
            ExprNode* node = buildExpressionTree("1 / 0");
            evaluateExpression(node);
            deleteExprTree(node);
        } catch (const invalid_argument&) {
            dividedByZero = true;
        }
        assert(dividedByZero);

        // Against an INDEPENDENT reference on random expressions: collapse
        // every `*` first, then add and subtract what is left. That directly
        // encodes "* binds tighter than +", so it tests precedence against a
        // different implementation rather than against itself.
        mt19937 exprRng(11);
        for (int trial = 0; trial < 200; trial++) {
            vector<string> terms{to_string(exprRng() % 9 + 1)};
            int extra = int(exprRng() % 5) + 1;
            for (int k = 0; k < extra; k++) {
                terms.push_back(string(1, "+-*"[exprRng() % 3]));
                terms.push_back(to_string(exprRng() % 9 + 1));
            }

            vector<string> collapsed{terms[0]};
            for (size_t k = 1; k < terms.size(); k += 2) {
                if (terms[k] == "*") {
                    collapsed.back() = to_string(stoll(collapsed.back()) *
                                                 stoll(terms[k + 1]));
                } else {
                    collapsed.push_back(terms[k]);
                    collapsed.push_back(terms[k + 1]);
                }
            }
            double reference = stod(collapsed[0]);
            for (size_t k = 1; k < collapsed.size(); k += 2) {
                double value = stod(collapsed[k + 1]);
                reference = collapsed[k] == "+" ? reference + value : reference - value;
            }

            string text;
            for (const string& t : terms) text += t + " ";

            ExprNode* built = buildExpressionTree(text);
            assert(evaluateExpression(built) == reference);

            // postfix -> tree -> postfix must be a fixed point
            ExprNode* again = buildFromPostfix(toPostfix(built));
            assert(evaluateExpression(again) == evaluateExpression(built));
            assert(toPostfix(again) == toPostfix(built));

            // and the fully-bracketed infix must re-parse to the same value
            ExprNode* reparsed = buildExpressionTree(toInfix(built));
            assert(evaluateExpression(reparsed) == evaluateExpression(built));

            deleteExprTree(built);
            deleteExprTree(again);
            deleteExprTree(reparsed);
        }
    }


    cout << "11-Trees (C++): all checks passed\n";
    return 0;
}
