// 12 - Binary Search Tree: the full structure plus the problems whose
// solutions exist only because of the ordering invariant.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall bst.cpp -o bst && ./bst

#include <algorithm>
#include <cassert>
#include <climits>
#include <iostream>
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

    cout << "12-Binary-Search-Tree (C++): all checks passed\n";
    return 0;
}
