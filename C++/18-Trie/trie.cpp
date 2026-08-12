// 18 - Trie: a prefix tree with insert / search / prefix queries / deletion,
// plus wildcard matching and a bitwise trie for maximum XOR.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall trie.cpp -o trie && ./trie

#include <algorithm>
#include <cassert>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

// ============================================================================
// 1. The node
// ============================================================================
// A fixed array of 26 children: O(1) lookup with no hashing, and alphabetical
// iteration for free. isEnd is what distinguishes a stored word from a mere
// prefix - without it "car" (a word) and "ca" (on the way to one) look alike.
struct TrieNode {
    TrieNode* children[26] = {};
    bool isEnd = false;

    ~TrieNode() {                       // postorder teardown: children first
        for (TrieNode* child : children) delete child;
    }
};

// ============================================================================
// 2. The trie
// ============================================================================
class Trie {
   public:
    Trie() : root_(new TrieNode()) {}
    explicit Trie(const vector<string>& words) : root_(new TrieNode()) {
        for (const string& word : words) insert(word);
    }
    ~Trie() { delete root_; }
    Trie(const Trie&) = delete;                 // owns raw nodes: no copying
    Trie& operator=(const Trie&) = delete;

    size_t size() const { return size_; }

    // O(L). Shared prefixes cost nothing extra - only the new suffix allocates.
    bool insert(const string& word) {
        TrieNode* node = root_;
        for (char c : word) {
            int i = c - 'a';
            if (!node->children[i]) node->children[i] = new TrieNode();
            node = node->children[i];
        }
        if (node->isEnd) return false;          // already stored
        node->isEnd = true;
        size_++;
        return true;
    }

    // Is this exact word stored? O(L).
    bool search(const string& word) const {
        const TrieNode* node = walk(word);
        return node && node->isEnd;
    }

    // Does any stored word begin with this prefix? O(L).
    // THIS is why tries exist: a hash set needs O(n * L) to answer it.
    bool startsWith(const string& prefix) const { return walk(prefix) != nullptr; }

    // Remove a word, pruning nodes that become useless. O(L).
    // The recursion returns "may my parent delete me?" - true only when this
    // node has no children left AND is not the end of another word. That is
    // what stops deleting "car" from breaking "cart".
    bool remove(const string& word) {
        if (!search(word)) return false;
        prune(root_, word, 0);
        size_--;
        return true;
    }

    // Every stored word starting with `prefix`, alphabetically.
    // O(L + output): walk to the prefix node once, then DFS below it.
    vector<string> wordsWithPrefix(const string& prefix) const {
        vector<string> found;
        const TrieNode* node = walk(prefix);
        if (!node) return found;
        string path;
        collect(node, prefix, path, found);
        return found;
    }

    vector<string> autocomplete(const string& prefix, size_t limit = 5) const {
        vector<string> all = wordsWithPrefix(prefix);
        if (all.size() > limit) all.resize(limit);
        return all;
    }

    // Longest prefix shared by ALL stored words. O(L).
    // Walk down while there is exactly one child and no word ends here.
    string longestCommonPrefix() const {
        string prefix;
        const TrieNode* node = root_;
        while (!node->isEnd) {
            int onlyChild = -1;
            int childCount = 0;
            for (int i = 0; i < 26; i++)
                if (node->children[i]) {
                    childCount++;
                    onlyChild = i;
                }
            if (childCount != 1) break;         // a branch ends the shared part
            prefix += char('a' + onlyChild);
            node = node->children[onlyChild];
        }
        return prefix;
    }

    size_t countWords() const { return countWordsFrom(root_); }
    size_t countNodes() const { return countNodesFrom(root_); }

   protected:
    const TrieNode* walk(const string& prefix) const {
        const TrieNode* node = root_;
        for (char c : prefix) {
            node = node->children[c - 'a'];
            if (!node) return nullptr;
        }
        return node;
    }

    TrieNode* root_;

   private:
    static bool prune(TrieNode* node, const string& word, size_t depth) {
        if (depth == word.size()) {
            if (!node->isEnd) return false;
            node->isEnd = false;
            return isLeaf(node);                // deletable only if it is a leaf
        }
        int i = word[depth] - 'a';
        TrieNode* child = node->children[i];
        if (!child || !prune(child, word, depth + 1)) return false;

        delete child;                           // the child became useless
        node->children[i] = nullptr;
        return isLeaf(node) && !node->isEnd;
    }

    static bool isLeaf(const TrieNode* node) {
        for (const TrieNode* child : node->children)
            if (child) return false;
        return true;
    }

    static void collect(const TrieNode* node, const string& prefix, string& path,
                        vector<string>& found) {
        if (node->isEnd) found.push_back(prefix + path);
        for (int i = 0; i < 26; i++) {          // ascending: sorted output
            if (!node->children[i]) continue;
            path.push_back(char('a' + i));
            collect(node->children[i], prefix, path, found);
            path.pop_back();
        }
    }

    static size_t countWordsFrom(const TrieNode* node) {
        size_t total = node->isEnd ? 1 : 0;
        for (const TrieNode* child : node->children)
            if (child) total += countWordsFrom(child);
        return total;
    }

    static size_t countNodesFrom(const TrieNode* node) {
        size_t total = 1;
        for (const TrieNode* child : node->children)
            if (child) total += countNodesFrom(child);
        return total;
    }

    size_t size_ = 0;
};

// ============================================================================
// 3. Wildcard search - a trie with backtracking
// ============================================================================
// Supports '.' as "any single character" (LeetCode 211). A hash set cannot do
// this at all; the trie turns it into a bounded DFS.
class WildcardTrie : public Trie {
   public:
    using Trie::Trie;

    bool searchPattern(const string& pattern) const {
        return matches(root_, pattern, 0);
    }

   private:
    static bool matches(const TrieNode* node, const string& pattern, size_t i) {
        if (!node) return false;
        if (i == pattern.size()) return node->isEnd;

        if (pattern[i] == '.') {                // try every child
            for (const TrieNode* child : node->children)
                if (child && matches(child, pattern, i + 1)) return true;
            return false;
        }
        return matches(node->children[pattern[i] - 'a'], pattern, i + 1);
    }
};

// ============================================================================
// 4. Bitwise trie - maximum XOR pair
// ============================================================================
// A trie over the BITS of each number, most significant first. Turns "maximum
// XOR of any two numbers" from an O(n^2) scan into O(32n): at each bit, walk
// greedily toward the OPPOSITE bit, because a 1 in a higher position beats
// everything below it.
struct BitNode {
    BitNode* children[2] = {};
    ~BitNode() {
        delete children[0];
        delete children[1];
    }
};

class BitwiseTrie {
   public:
    BitwiseTrie() : root_(new BitNode()) {}
    ~BitwiseTrie() { delete root_; }
    BitwiseTrie(const BitwiseTrie&) = delete;
    BitwiseTrie& operator=(const BitwiseTrie&) = delete;

    void insert(int number) {                   // O(32): constant per number
        BitNode* node = root_;
        for (int i = 31; i >= 0; i--) {
            int bit = (number >> i) & 1;
            if (!node->children[bit]) node->children[bit] = new BitNode();
            node = node->children[bit];
        }
        empty_ = false;
    }

    // Largest XOR of `number` with any stored value. O(32).
    int maxXorWith(int number) const {
        if (empty_) return 0;
        const BitNode* node = root_;
        int best = 0;
        for (int i = 31; i >= 0; i--) {
            int bit = (number >> i) & 1;
            int wanted = bit ^ 1;               // the opposite bit sets this one
            if (node->children[wanted]) {
                best |= 1 << i;
                node = node->children[wanted];
            } else {
                node = node->children[bit];     // forced to match
            }
        }
        return best;
    }

   private:
    BitNode* root_;
    bool empty_ = true;
};

// Maximum XOR over all pairs. O(32n) instead of O(n^2).
int maxXorPair(const vector<int>& numbers) {
    if (numbers.size() < 2) return 0;
    BitwiseTrie trie;
    trie.insert(numbers[0]);
    int best = 0;
    for (size_t i = 1; i < numbers.size(); i++) {
        best = max(best, trie.maxXorWith(numbers[i]));
        trie.insert(numbers[i]);
    }
    return best;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Trie trie({"cat", "car", "card", "care", "dog", "do"});
    assert(trie.size() == 6);
    assert(trie.countWords() == 6);                     // cross-check

    assert(trie.search("cat") && trie.search("car"));
    assert(!trie.search("ca"));                          // a prefix is not a word
    assert(!trie.search("cats"));
    assert(trie.startsWith("ca") && trie.startsWith("do"));
    assert(!trie.startsWith("z"));

    assert(!trie.insert("cat"));                         // already present
    assert(trie.size() == 6);

    assert((trie.wordsWithPrefix("car") == vector<string>{"car", "card", "care"}));
    assert((trie.wordsWithPrefix("do") == vector<string>{"do", "dog"}));
    assert(trie.wordsWithPrefix("z").empty());
    assert((trie.autocomplete("car", 2) == vector<string>{"car", "card"}));

    // Prefix sharing: 6 words of 20 characters need far fewer than 21 nodes.
    assert(trie.countNodes() < 21);

    // Deleting a word that is a PREFIX of another must not break the longer one.
    assert(trie.remove("car"));
    assert(!trie.search("car"));
    assert(trie.search("card") && trie.search("care"));  // still intact
    assert(trie.startsWith("car"));                      // path still needed
    assert(trie.size() == 5 && trie.countWords() == 5);

    // Deleting a leaf really prunes the path.
    size_t nodesBefore = trie.countNodes();
    assert(trie.remove("dog"));
    assert(trie.countNodes() < nodesBefore);             // the 'g' node is gone
    assert(trie.search("do"));                           // its prefix survives
    assert(!trie.remove("dog"));                         // already gone
    assert(!trie.remove("zzz"));                         // never existed

    assert(Trie({"flower", "flow", "flight"}).longestCommonPrefix() == "fl");
    assert(Trie({"dog", "car"}).longestCommonPrefix() == "");
    assert(Trie({"abc"}).longestCommonPrefix() == "abc");
    assert(Trie().longestCommonPrefix() == "");

    WildcardTrie wildcard({"bad", "dad", "mad"});
    assert(wildcard.searchPattern("bad"));
    assert(!wildcard.searchPattern("pad"));
    assert(wildcard.searchPattern(".ad"));               // any first character
    assert(wildcard.searchPattern("b.."));
    assert(wildcard.searchPattern("..."));
    assert(!wildcard.searchPattern("...."));             // length must match

    assert(maxXorPair({3, 10, 5, 25, 2, 8}) == 28);      // 5 ^ 25
    assert(maxXorPair({0}) == 0);
    assert(maxXorPair({14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70}) == 127);
    {   // cross-check against brute force
        vector<int> sample{3, 10, 5, 25, 2, 8};
        int brute = 0;
        for (size_t i = 0; i < sample.size(); i++)
            for (size_t j = i + 1; j < sample.size(); j++)
                brute = max(brute, sample[i] ^ sample[j]);
        assert(maxXorPair(sample) == brute);
    }

    cout << "18-Trie (C++): all checks passed\n";
    return 0;
}
