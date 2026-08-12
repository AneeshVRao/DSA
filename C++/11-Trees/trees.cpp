// 11 - Trees: binary trees, all four traversals (recursive, iterative and
// Morris), and the bottom-up recursion pattern that solves most tree problems.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall trees.cpp -o trees && ./trees

#include <algorithm>
#include <cassert>
#include <climits>
#include <cstdlib>
#include <iostream>
#include <optional>
#include <queue>
#include <functional>
#include <map>
#include <random>
#include <sstream>
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

    cout << "11-Trees (C++): all checks passed\n";
    return 0;
}
