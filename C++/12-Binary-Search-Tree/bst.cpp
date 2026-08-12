// 12 - Binary Search Tree: the full structure plus the problems whose
// solutions exist only because of the ordering invariant.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall bst.cpp -o bst && ./bst

#include <algorithm>
#include <cassert>
#include <climits>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <numeric>
#include <random>
#include <set>
#include <vector>

using namespace std;

// ============================================================================
// Node
// ============================================================================
struct TreeNode {
    int val;
    TreeNode* left = nullptr;
    TreeNode* right = nullptr;
    explicit TreeNode(int v) : val(v) {}
};

void deleteTree(TreeNode* node) {          // postorder: children first
    if (!node) return;
    deleteTree(node->left);
    deleteTree(node->right);
    delete node;
}

// ============================================================================
// 1. The BST itself
// ============================================================================
class BST {
   public:
    BST() = default;
    explicit BST(const vector<int>& values) {
        for (int v : values) insert(v);
    }
    ~BST() { deleteTree(root_); }
    BST(const BST&) = delete;              // owns raw nodes: no copying
    BST& operator=(const BST&) = delete;

    TreeNode* root() const { return root_; }
    size_t size() const { return size_; }

    // Iterative on purpose: sorted input produces a degenerate tree, and a
    // recursive insert would then overflow the stack. O(h).
    bool insert(int val) {
        if (!root_) {
            root_ = new TreeNode(val);
            size_++;
            return true;
        }
        TreeNode* node = root_;
        while (true) {
            if (val == node->val) return false;      // no duplicates
            if (val < node->val) {
                if (!node->left) {
                    node->left = new TreeNode(val);
                    size_++;
                    return true;
                }
                node = node->left;
            } else {
                if (!node->right) {
                    node->right = new TreeNode(val);
                    size_++;
                    return true;
                }
                node = node->right;
            }
        }
    }

    // O(h): every comparison discards an entire subtree.
    TreeNode* search(int val) const {
        TreeNode* node = root_;
        while (node) {
            if (val == node->val) return node;
            node = (val < node->val) ? node->left : node->right;
        }
        return nullptr;
    }

    bool contains(int val) const { return search(val) != nullptr; }

    bool minValue(int& out) const {         // leftmost node
        if (!root_) return false;
        TreeNode* node = root_;
        while (node->left) node = node->left;
        out = node->val;
        return true;
    }

    bool maxValue(int& out) const {         // rightmost node
        if (!root_) return false;
        TreeNode* node = root_;
        while (node->right) node = node->right;
        out = node->val;
        return true;
    }

    bool remove(int val) {
        bool found = contains(val);
        root_ = removeFrom(root_, val);
        if (found) size_--;
        return found;
    }

    // Iterative inorder - SORTED output, the defining property of a BST.
    vector<int> inorder() const {
        vector<int> out;
        vector<TreeNode*> stack;
        TreeNode* node = root_;
        while (node || !stack.empty()) {
            while (node) {
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

    int height() const { return heightOf(root_); }

   private:
    static int heightOf(TreeNode* node) {
        if (!node) return -1;
        return 1 + max(heightOf(node->left), heightOf(node->right));
    }

    static TreeNode* removeFrom(TreeNode* node, int val) {
        if (!node) return nullptr;
        if (val < node->val) {
            node->left = removeFrom(node->left, val);
            return node;
        }
        if (val > node->val) {
            node->right = removeFrom(node->right, val);
            return node;
        }

        // Cases 1 and 2: zero or one child - splice the child up and free.
        if (!node->left) {
            TreeNode* child = node->right;
            delete node;
            return child;
        }
        if (!node->right) {
            TreeNode* child = node->left;
            delete node;
            return child;
        }

        // Case 3: two children. Copy the inorder successor's value here, then
        // delete the successor from the right subtree. It is the leftmost node
        // there, so it has at most one child - case 1 or 2 handles it.
        TreeNode* successor = node->right;
        while (successor->left) successor = successor->left;
        node->val = successor->val;
        node->right = removeFrom(node->right, successor->val);
        return node;
    }

    TreeNode* root_ = nullptr;
    size_t size_ = 0;
};

// ============================================================================
// 2. Validation
// ============================================================================
// Bounds are long long so a node holding INT_MIN or INT_MAX still works with
// the initial sentinels.
bool validate(TreeNode* node, long long low, long long high) {
    if (!node) return true;
    if (node->val <= low || node->val >= high) return false;
    return validate(node->left, low, node->val) &&
           validate(node->right, node->val, high);
}

bool isValidBST(TreeNode* root) {
    return validate(root, LLONG_MIN, LLONG_MAX);
}

// ============================================================================
// 3. Order statistics
// ============================================================================
// kth smallest (1-based). O(h + k): the iterative walk can stop early.
bool kthSmallest(TreeNode* root, int k, int& out) {
    vector<TreeNode*> stack;
    TreeNode* node = root;
    int count = 0;
    while (node || !stack.empty()) {
        while (node) {
            stack.push_back(node);
            node = node->left;
        }
        node = stack.back();
        stack.pop_back();
        if (++count == k) {
            out = node->val;
            return true;
        }
        node = node->right;
    }
    return false;
}

// Smallest value strictly greater than target. O(h), no parent pointers:
// every time we move LEFT, the node we left is a candidate.
bool inorderSuccessor(TreeNode* root, int target, int& out) {
    bool found = false;
    TreeNode* node = root;
    while (node) {
        if (target < node->val) {
            out = node->val;               // candidate; may be beaten deeper
            found = true;
            node = node->left;
        } else {
            node = node->right;            // everything here is too small
        }
    }
    return found;
}

// ============================================================================
// 4. Searching with the invariant
// ============================================================================
// The first node whose value lies between p and q IS the split point, so LCA
// is one descent - O(h) instead of the O(n) search a generic tree needs.
bool lcaBST(TreeNode* root, int p, int q, int& out) {
    int low = min(p, q), high = max(p, q);
    TreeNode* node = root;
    while (node) {
        if (node->val > high) node = node->left;
        else if (node->val < low) node = node->right;
        else {
            out = node->val;
            return true;
        }
    }
    return false;
}

// Largest value <= target. O(h), remembering candidates on the way down.
bool floorValue(TreeNode* root, int target, int& out) {
    bool found = false;
    TreeNode* node = root;
    while (node) {
        if (node->val == target) {
            out = node->val;
            return true;
        }
        if (node->val < target) {
            out = node->val;               // valid, but a bigger one may exist
            found = true;
            node = node->right;
        } else {
            node = node->left;
        }
    }
    return found;
}

// Smallest value >= target. O(h).
bool ceilValue(TreeNode* root, int target, int& out) {
    bool found = false;
    TreeNode* node = root;
    while (node) {
        if (node->val == target) {
            out = node->val;
            return true;
        }
        if (node->val > target) {
            out = node->val;
            found = true;
            node = node->left;
        } else {
            node = node->right;
        }
    }
    return found;
}

// Sum of values in [low, high]. Pruning is the point: a node below `low`
// makes its entire left subtree irrelevant, and vice versa.
long long rangeSum(TreeNode* root, int low, int high) {
    if (!root) return 0;
    if (root->val < low) return rangeSum(root->right, low, high);
    if (root->val > high) return rangeSum(root->left, low, high);
    return root->val + rangeSum(root->left, low, high) +
           rangeSum(root->right, low, high);
}

// ============================================================================
// 5. Construction
// ============================================================================
// Inserting a sorted array one value at a time gives height n-1. Taking the
// middle element as the root each time gives height floor(log2 n).
TreeNode* buildBalanced(const vector<int>& values, int lo, int hi) {
    if (lo > hi) return nullptr;
    int mid = lo + (hi - lo) / 2;
    TreeNode* node = new TreeNode(values[mid]);
    node->left = buildBalanced(values, lo, mid - 1);
    node->right = buildBalanced(values, mid + 1, hi);
    return node;
}

TreeNode* sortedArrayToBST(const vector<int>& values) {
    return buildBalanced(values, 0, int(values.size()) - 1);
}

int treeHeight(TreeNode* node) {
    if (!node) return -1;
    return 1 + max(treeHeight(node->left), treeHeight(node->right));
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// 6. AVL - a BST that keeps itself balanced
// ============================================================================

// A BST node that also caches its own subtree height.
//
// The height must be STORED, not computed. Recomputing it would make every
// insert O(n); cached, it updates in O(1) as the recursion unwinds.
struct AVLNode {
    int val;
    AVLNode* left = nullptr;
    AVLNode* right = nullptr;
    int height = 1;                      // a leaf has height 1

    explicit AVLNode(int v) : val(v) {}
};

// AVLTree is a self-balancing BST. Every operation is O(log n) GUARANTEED.
//
// THE PROBLEM IT SOLVES. A plain BST is O(log n) only if the data arrives in a
// lucky order. Insert 1, 2, 3, 4, 5 in order and every node becomes a right
// child - the tree degenerates into a linked list and search is O(n). Sorted
// input is not a pathological case, it is the single most common one.
//
// THE INVARIANT. For every node,
//
//     balance = height(left) - height(right)   is in {-1, 0, +1}
//
// That one constraint forces height <= 1.44 * log2(n). (Sketch: let N(h) be the
// fewest nodes in an AVL tree of height h. Then N(h) = 1 + N(h-1) + N(h-2) -
// the Fibonacci recurrence - so N(h) grows exponentially and h is logarithmic.)
//
// THE FOUR CASES. After an insert or delete one node may reach a balance of
// +/-2. Which rotation fixes it depends on WHERE the offending subtree sits:
//
//     LL  balance > 1,  went left-left    -> rotate right
//     RR  balance < -1, went right-right  -> rotate left
//     LR  balance > 1,  went left-right   -> rotate left on the child,
//                                            then right on the node
//     RL  balance < -1, went right-left   -> rotate right on the child,
//                                            then left on the node
//
// LR and RL are not new operations - they are the single rotations applied
// twice. The first straightens the zig-zag into a line; the second is then the
// simple case.
//
// A rotation is O(1): three pointer writes and two height updates. Only the
// LOWEST unbalanced node needs rotating on insert - one rotation restores the
// whole tree, because it also restores the subtree's original height. Delete is
// harder: it can SHORTEN a subtree, so rebalancing may cascade to the root, up
// to O(log n) rotations.
//
// AVL vs red-black: AVL is more strictly balanced (faster lookups), red-black
// rotates less on write (faster inserts). Which is why std::map, Java TreeMap
// and the Linux kernel all use red-black, while read-heavy database indexes
// lean AVL.
class AVLTree {
   public:
    AVLTree() = default;
    ~AVLTree() { destroy(root_); }

    // Rule of three: this class owns raw pointers, so a default copy would
    // double-free. Deleted rather than implemented - nothing here needs it.
    AVLTree(const AVLTree&) = delete;
    AVLTree& operator=(const AVLTree&) = delete;

    // Insert a value. O(log n) guaranteed. Returns false if already present.
    bool insert(int value) {
        bool inserted = false;
        root_ = insertInto(root_, value, inserted);
        if (inserted) size_++;
        return inserted;
    }

    // Delete a value. O(log n) guaranteed. Returns false if absent.
    //
    // The three BST delete cases are unchanged - what AVL adds is the rebalance
    // as the recursion unwinds. Unlike insert, deletion can shorten a subtree,
    // so one rotation may not be enough and the fixing can cascade.
    bool erase(int value) {
        bool removed = false;
        root_ = eraseFrom(root_, value, removed);
        if (removed) size_--;
        return removed;
    }

    // O(log n) guaranteed - the whole point of the structure.
    bool contains(int value) const {
        AVLNode* node = root_;
        while (node) {
            if (value == node->val) return true;
            node = value < node->val ? node->left : node->right;
        }
        return false;
    }

    // Sorted values. O(n).
    vector<int> inorder() const {
        vector<int> out;
        vector<AVLNode*> stack;
        AVLNode* node = root_;
        while (!stack.empty() || node) {
            while (node) {
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

    int height() const { return heightOf(root_); }
    size_t size() const { return size_; }

    // Verify the invariant everywhere - used by the tests, not by users.
    bool isBalanced() const { return checkBalanced(root_); }

   private:
    AVLNode* root_ = nullptr;
    size_t size_ = 0;

    // Height of a possibly-absent subtree. An empty tree has height 0.
    static int heightOf(AVLNode* node) { return node ? node->height : 0; }

    static void updateHeight(AVLNode* node) {
        node->height = 1 + max(heightOf(node->left), heightOf(node->right));
    }

    // Left height minus right height. Positive means left-heavy.
    static int balanceOf(AVLNode* node) {
        return node ? heightOf(node->left) - heightOf(node->right) : 0;
    }

    /* Left-heavy fix. O(1).  A block comment, because a // line ending in a
     * backslash is a line continuation and would swallow the next line.
     *
     *         node                 pivot
     *        /    \                /     \
     *     pivot    C      ->      A      node
     *     /   \                          /    \
     *    A     B                        B      C
     *
     * B moves from pivot's right to node's left. Every value in B is greater
     * than pivot and less than node, so it is legal in either position - which
     * is exactly why a rotation preserves the BST ordering.
     *
     * Update pivot's height AFTER node's: node is now pivot's child, so its
     * height has to be settled first.
     */
    static AVLNode* rotateRight(AVLNode* node) {
        AVLNode* pivot = node->left;
        node->left = pivot->right;
        pivot->right = node;

        updateHeight(node);                  // the lower node first
        updateHeight(pivot);
        return pivot;                        // the new subtree root
    }

    // Right-heavy fix - the exact mirror of rotateRight. O(1).
    static AVLNode* rotateLeft(AVLNode* node) {
        AVLNode* pivot = node->right;
        node->right = pivot->left;
        pivot->left = node;

        updateHeight(node);
        updateHeight(pivot);
        return pivot;
    }

    // Restore the invariant at one node. Returns the new subtree root.
    static AVLNode* rebalance(AVLNode* node) {
        updateHeight(node);
        int balance = balanceOf(node);

        if (balance > 1) {                         // left-heavy
            if (balanceOf(node->left) < 0) {       // LR: straighten first
                node->left = rotateLeft(node->left);
            }
            return rotateRight(node);              // LL
        }
        if (balance < -1) {                        // right-heavy
            if (balanceOf(node->right) > 0) {      // RL: straighten first
                node->right = rotateRight(node->right);
            }
            return rotateLeft(node);               // RR
        }
        return node;                               // already balanced
    }

    static AVLNode* insertInto(AVLNode* node, int value, bool& inserted) {
        if (!node) {
            inserted = true;
            return new AVLNode(value);
        }
        if (value < node->val) {
            node->left = insertInto(node->left, value, inserted);
        } else if (value > node->val) {
            node->right = insertInto(node->right, value, inserted);
        } else {
            return node;                     // duplicate: nothing changes
        }
        return rebalance(node);              // unwinding: fix on the way up
    }

    // Detach the leftmost node, rebalancing on the way back up. The detached
    // node is handed back through `removed` for the caller to reuse or delete.
    static AVLNode* eraseMin(AVLNode* node, AVLNode*& removed) {
        if (!node->left) {
            removed = node;
            return node->right;
        }
        node->left = eraseMin(node->left, removed);
        return rebalance(node);
    }

    static AVLNode* eraseFrom(AVLNode* node, int value, bool& removed) {
        if (!node) return nullptr;

        if (value < node->val) {
            node->left = eraseFrom(node->left, value, removed);
        } else if (value > node->val) {
            node->right = eraseFrom(node->right, value, removed);
        } else {
            removed = true;
            if (!node->left) {               // 0 or 1 child: splice it out
                AVLNode* child = node->right;
                delete node;
                return child;
            }
            if (!node->right) {
                AVLNode* child = node->left;
                delete node;
                return child;
            }

            // Two children: take the in-order successor's value, then remove
            // that successor node from the right subtree.
            AVLNode* successor = nullptr;
            node->right = eraseMin(node->right, successor);
            node->val = successor->val;
            delete successor;
        }
        return rebalance(node);
    }

    static bool checkBalanced(AVLNode* node) {
        if (!node) return true;
        if (abs(balanceOf(node)) > 1) return false;
        // The cached height must also be honest, or the balance is a lie.
        if (node->height != 1 + max(heightOf(node->left), heightOf(node->right))) {
            return false;
        }
        return checkBalanced(node->left) && checkBalanced(node->right);
    }

    static void destroy(AVLNode* node) {
        if (!node) return;
        destroy(node->left);
        destroy(node->right);
        delete node;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    /*           8         A block comment, because a // line ending in a
     *         /   \       backslash is a line continuation and would swallow
     *        3     10     the next line (-Wcomment).
     *       / \      \
     *      1   6      14
     *         / \     /
     *        4   7   13
     */
    BST bst({8, 3, 10, 1, 6, 14, 4, 7, 13});
    assert(bst.size() == 9);
    assert((bst.inorder() == vector<int>{1, 3, 4, 6, 7, 8, 10, 13, 14}));

    assert(!bst.insert(8));                  // duplicates rejected
    assert(bst.size() == 9);
    assert(bst.contains(6) && !bst.contains(5));

    int value = 0;
    assert(bst.minValue(value) && value == 1);
    assert(bst.maxValue(value) && value == 14);
    BST empty;
    assert(!empty.minValue(value));

    assert(isValidBST(bst.root()));
    // The classic invalid tree: 4 sits in the RIGHT subtree of 5.
    TreeNode* bad = new TreeNode(5);
    bad->left = new TreeNode(1);
    bad->right = new TreeNode(7);
    bad->right->left = new TreeNode(4);
    assert(!isValidBST(bad));
    deleteTree(bad);
    assert(isValidBST(nullptr));

    // Deletion, all three cases; the tree must stay valid and sorted.
    assert(bst.remove(1));                   // leaf
    assert((bst.inorder() == vector<int>{3, 4, 6, 7, 8, 10, 13, 14}));
    assert(bst.remove(14));                  // one child (13)
    assert((bst.inorder() == vector<int>{3, 4, 6, 7, 8, 10, 13}));
    assert(bst.remove(3));                   // two children
    assert((bst.inorder() == vector<int>{4, 6, 7, 8, 10, 13}));
    assert(isValidBST(bst.root()) && bst.size() == 6);
    assert(!bst.remove(999));

    // Draining the tree through the root each time must keep it valid.
    BST drain({5, 3, 8, 2, 4, 7, 9});
    for (int v : {5, 3, 8, 2, 4, 7, 9}) {
        assert(drain.remove(v));
        assert(isValidBST(drain.root()));
    }
    assert(drain.inorder().empty() && drain.size() == 0);

    BST fresh({8, 3, 10, 1, 6, 14, 4, 7, 13});
    assert(kthSmallest(fresh.root(), 1, value) && value == 1);
    assert(kthSmallest(fresh.root(), 5, value) && value == 7);
    assert(kthSmallest(fresh.root(), 9, value) && value == 14);
    assert(!kthSmallest(fresh.root(), 99, value));

    assert(inorderSuccessor(fresh.root(), 7, value) && value == 8);
    assert(inorderSuccessor(fresh.root(), 5, value) && value == 6);  // absent target
    assert(!inorderSuccessor(fresh.root(), 14, value));              // nothing bigger

    assert(lcaBST(fresh.root(), 1, 6, value) && value == 3);
    assert(lcaBST(fresh.root(), 4, 13, value) && value == 8);        // split at root
    assert(lcaBST(fresh.root(), 3, 4, value) && value == 3);         // self-ancestor

    assert(floorValue(fresh.root(), 5, value) && value == 4);
    assert(floorValue(fresh.root(), 6, value) && value == 6);        // exact
    assert(!floorValue(fresh.root(), 0, value));
    assert(ceilValue(fresh.root(), 5, value) && value == 6);
    assert(!ceilValue(fresh.root(), 15, value));

    assert(rangeSum(fresh.root(), 6, 10) == 6 + 7 + 8 + 10);
    assert(rangeSum(fresh.root(), 100, 200) == 0);

    // Balanced construction: 15 sorted values give height 3, not 14.
    vector<int> values(15);
    for (int i = 0; i < 15; i++) values[i] = i + 1;
    TreeNode* balanced = sortedArrayToBST(values);
    assert(isValidBST(balanced));
    assert(treeHeight(balanced) == 3);
    deleteTree(balanced);

    BST degenerate(values);                  // sorted input, inserted in order
    assert(degenerate.height() == 14);        // a linked list with extra pointers

    // The STL's balanced equivalent, for comparison.
    set<int> s{8, 3, 10, 1};
    assert(*s.begin() == 1 && *s.rbegin() == 10);
    assert(*s.lower_bound(4) == 8);           // first >= 4

    // --- AVL ------------------------------------------------------------------
    // The case a plain BST cannot survive: strictly increasing input.
    {
        AVLTree avl;
        for (int value = 1; value <= 31; value++) avl.insert(value);

        assert(avl.height() == 5);            // log2(32) - actually balanced
        assert(avl.size() == 31);
        vector<int> sortedValues(31);
        iota(sortedValues.begin(), sortedValues.end(), 1);
        assert(avl.inorder() == sortedValues);
        assert(avl.isBalanced());
    }

    // Each of the four rotation cases, in isolation.
    {
        AVLTree ll, rr, lr, rl;
        for (int v : {30, 20, 10}) ll.insert(v);      // left-left
        for (int v : {10, 20, 30}) rr.insert(v);      // right-right
        for (int v : {30, 10, 20}) lr.insert(v);      // left-right
        for (int v : {10, 30, 20}) rl.insert(v);      // right-left

        // All four must end up as the same balanced tree rooted at 20.
        vector<int> expected{10, 20, 30};
        for (const AVLTree* tree : {&ll, &rr, &lr, &rl}) {
            assert(tree->height() == 2);
            assert(tree->inorder() == expected);
            assert(tree->isBalanced());
        }
    }

    // Duplicates are rejected, and the size stays honest.
    {
        AVLTree dup;
        assert(dup.insert(5));
        assert(!dup.insert(5));
        assert(dup.size() == 1);
        assert(!dup.erase(99));               // absent
        assert(dup.erase(5) && dup.size() == 0);
        assert(dup.inorder().empty());
    }

    // Against std::set, with the invariant re-checked after EVERY operation -
    // a rotation bug that only shows up mid-sequence would be invisible to an
    // end-state-only test.
    {
        mt19937 rng(12);
        for (int trial = 0; trial < 60; trial++) {
            AVLTree tree;
            set<int> reference;

            for (int step = 0; step < 80; step++) {
                int value = int(rng() % 41);
                if (rng() % 100 < 65) {
                    bool changed = tree.insert(value);
                    assert(changed == (reference.count(value) == 0));
                    reference.insert(value);
                } else {
                    bool changed = tree.erase(value);
                    assert(changed == (reference.count(value) == 1));
                    reference.erase(value);
                }

                // An in-order walk that comes out sorted IS the BST invariant.
                assert(tree.inorder() == vector<int>(reference.begin(), reference.end()));
                assert(tree.isBalanced());    // still within +/-1 everywhere
                assert(tree.size() == reference.size());

                // The height bound AVL promises: h <= 1.44 * log2(n + 2)
                if (!reference.empty()) {
                    assert(tree.height() <= 1.44 * log2(double(reference.size() + 2)));
                }
            }
        }
    }

    cout << "12-Binary-Search-Tree (C++): all checks passed\n";
    cout << "  AVL invariant re-verified after every one of 4800 random "
            "insert/delete operations\n";
    return 0;
}
