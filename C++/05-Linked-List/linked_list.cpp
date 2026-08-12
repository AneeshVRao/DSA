// 05 - Linked List: singly and doubly linked lists from scratch, plus the
// pointer patterns interviewers ask about.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall linked_list.cpp -o linked_list && ./linked_list

#include <cassert>
#include <initializer_list>
#include <iostream>
#include <stdexcept>
#include <vector>

using namespace std;

// ============================================================================
// Node
// ============================================================================
struct Node {
    int val;
    Node* next = nullptr;
    explicit Node(int v) : val(v) {}
};

// ============================================================================
// Singly linked list (owns its nodes)
// ============================================================================
class SinglyLinkedList {
   public:
    SinglyLinkedList() = default;

    SinglyLinkedList(initializer_list<int> values) {
        for (int v : values) pushBack(v);
    }

    // The list allocates nodes, so it must free them. Iteratively - a
    // recursive destructor would blow the stack on a long list.
    ~SinglyLinkedList() { clear(); }

    // Rule of three: a class with a destructor that frees memory needs copy
    // semantics too, or two copies will delete the same nodes.
    SinglyLinkedList(const SinglyLinkedList& other) {
        for (Node* n = other.head_; n; n = n->next) pushBack(n->val);
    }

    SinglyLinkedList& operator=(const SinglyLinkedList& other) {
        if (this != &other) {
            clear();
            for (Node* n = other.head_; n; n = n->next) pushBack(n->val);
        }
        return *this;
    }

    void clear() {
        while (head_) {
            Node* next = head_->next;
            delete head_;
            head_ = next;
        }
        tail_ = nullptr;
        size_ = 0;
    }

    size_t size() const { return size_; }
    bool empty() const { return size_ == 0; }
    Node* head() const { return head_; }
    Node* tail() const { return tail_; }

    // ------------------------------------------------------------ insertion
    void pushFront(int val) {           // O(1) - what vectors cannot do cheaply
        Node* node = new Node(val);
        node->next = head_;
        head_ = node;
        if (!tail_) tail_ = node;
        size_++;
    }

    void pushBack(int val) {            // O(1) thanks to the tail pointer
        Node* node = new Node(val);
        if (!tail_) {
            head_ = tail_ = node;
        } else {
            tail_->next = node;
            tail_ = node;
        }
        size_++;
    }

    void insertAt(size_t index, int val) {   // O(n): we must walk there first
        if (index > size_) throw out_of_range("index out of range");
        if (index == 0) return pushFront(val);
        if (index == size_) return pushBack(val);
        Node* prev = nodeAt(index - 1);
        Node* node = new Node(val);
        node->next = prev->next;
        prev->next = node;
        size_++;
    }

    // ------------------------------------------------------------- deletion
    int deleteAt(size_t index) {        // O(n)
        if (index >= size_) throw out_of_range("index out of range");
        Node dummy(0);
        dummy.next = head_;
        Node* prev = &dummy;
        for (size_t i = 0; i < index; i++) prev = prev->next;

        Node* target = prev->next;
        int value = target->val;
        prev->next = target->next;
        if (target == tail_) tail_ = (prev == &dummy) ? nullptr : prev;
        delete target;                  // free it, then fix the head
        head_ = dummy.next;
        size_--;
        return value;
    }

    bool removeValue(int val) {         // O(n), dummy head handles head matches
        Node dummy(0);
        dummy.next = head_;
        for (Node* prev = &dummy; prev->next; prev = prev->next) {
            if (prev->next->val == val) {
                Node* target = prev->next;
                prev->next = target->next;
                if (target == tail_) tail_ = (prev == &dummy) ? nullptr : prev;
                delete target;
                head_ = dummy.next;
                size_--;
                return true;
            }
        }
        return false;
    }

    // -------------------------------------------------------------- lookups
    int search(int val) const {         // index or -1; O(n), no random access
        int i = 0;
        for (Node* n = head_; n; n = n->next, i++)
            if (n->val == val) return i;
        return -1;
    }

    // ------------------------------------------------------------- reversal
    // Three pointers, one pass. O(n) time, O(1) space.
    void reverse() {
        Node* prev = nullptr;
        Node* curr = head_;
        tail_ = head_;                  // the old head becomes the tail
        while (curr) {
            Node* next = curr->next;    // SAVE before destroying the link
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        head_ = prev;
    }

    // -------------------------------------------------------- two pointers -
    // Middle value (the second middle when the length is even). O(n), one pass.
    bool middle(int& out) const {
        Node* slow = head_;
        Node* fast = head_;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        if (!slow) return false;
        out = slow->val;
        return true;
    }

    // Remove the nth node counted from the end, in one pass.
    void removeNthFromEnd(size_t n) {
        if (n == 0 || n > size_) throw out_of_range("n out of range");
        Node dummy(0);
        dummy.next = head_;
        Node* fast = &dummy;
        Node* slow = &dummy;
        for (size_t i = 0; i < n; i++) fast = fast->next;   // open a gap of n
        while (fast->next) {
            fast = fast->next;
            slow = slow->next;
        }
        Node* target = slow->next;
        slow->next = target->next;
        if (target == tail_) tail_ = (slow == &dummy) ? nullptr : slow;
        delete target;
        head_ = dummy.next;
        size_--;
    }

    vector<int> toVector() const {
        vector<int> out;
        out.reserve(size_);
        for (Node* n = head_; n; n = n->next) out.push_back(n->val);
        return out;
    }

   private:
    Node* nodeAt(size_t index) const {
        Node* n = head_;
        for (size_t i = 0; i < index && n; i++) n = n->next;
        return n;
    }

    Node* head_ = nullptr;
    Node* tail_ = nullptr;
    size_t size_ = 0;
};

// ============================================================================
// Cycle detection (Floyd's tortoise and hare) - works on raw nodes
// ============================================================================
bool hasCycle(Node* head) {             // O(n) time, O(1) space
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;  // pointer identity, not value equality
    }
    return false;
}

// First node of the cycle, or nullptr.
// When they meet, the meeting point is exactly L steps from the entry (mod C),
// where L is head-to-entry distance. So a walker from the head and the slow
// pointer, both at speed 1, collide precisely at the entry.
Node* cycleStart(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            Node* walker = head;
            while (walker != slow) {
                walker = walker->next;
                slow = slow->next;
            }
            return walker;
        }
    }
    return nullptr;
}

// ============================================================================
// Merging two sorted lists (splices nodes, allocates nothing)
// ============================================================================
Node* mergeSorted(Node* a, Node* b) {   // O(n + m) time, O(1) space
    Node dummy(0);
    Node* tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) {         // <= keeps the merge stable
            tail->next = a;
            a = a->next;
        } else {
            tail->next = b;
            b = b->next;
        }
        tail = tail->next;
    }
    tail->next = a ? a : b;             // attach the remainder in one step
    return dummy.next;
}

// ============================================================================
// Doubly linked list
// ============================================================================
struct DNode {
    int val;
    DNode* prev = nullptr;
    DNode* next = nullptr;
    explicit DNode(int v) : val(v) {}
};

// The prev pointer buys O(1) deletion when you already hold the node - exactly
// what an LRU cache needs.
class DoublyLinkedList {
   public:
    DoublyLinkedList() = default;
    ~DoublyLinkedList() {
        while (head_) {
            DNode* next = head_->next;
            delete head_;
            head_ = next;
        }
    }
    DoublyLinkedList(const DoublyLinkedList&) = delete;             // no copies
    DoublyLinkedList& operator=(const DoublyLinkedList&) = delete;

    DNode* pushBack(int val) {
        DNode* node = new DNode(val);
        if (!tail_) {
            head_ = tail_ = node;
        } else {
            node->prev = tail_;
            tail_->next = node;
            tail_ = node;
        }
        size_++;
        return node;
    }

    DNode* pushFront(int val) {
        DNode* node = new DNode(val);
        if (!head_) {
            head_ = tail_ = node;
        } else {
            node->next = head_;
            head_->prev = node;
            head_ = node;
        }
        size_++;
        return node;
    }

    void deleteNode(DNode* node) {      // O(1): no traversal required
        if (node->prev) node->prev->next = node->next;
        else head_ = node->next;
        if (node->next) node->next->prev = node->prev;
        else tail_ = node->prev;
        delete node;
        size_--;
    }

    size_t size() const { return size_; }

    vector<int> toVector() const {
        vector<int> out;
        for (DNode* n = head_; n; n = n->next) out.push_back(n->val);
        return out;
    }

    vector<int> toVectorReverse() const {
        vector<int> out;
        for (DNode* n = tail_; n; n = n->prev) out.push_back(n->val);
        return out;
    }

   private:
    DNode* head_ = nullptr;
    DNode* tail_ = nullptr;
    size_t size_ = 0;
};

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    SinglyLinkedList ll{1, 2, 3};
    assert((ll.toVector() == vector<int>{1, 2, 3}) && ll.size() == 3);
    ll.pushFront(0);
    ll.pushBack(4);
    assert((ll.toVector() == vector<int>{0, 1, 2, 3, 4}));
    assert(ll.tail()->val == 4);

    ll.insertAt(2, 99);
    assert((ll.toVector() == vector<int>{0, 1, 99, 2, 3, 4}));
    assert(ll.deleteAt(2) == 99);
    assert((ll.toVector() == vector<int>{0, 1, 2, 3, 4}));

    assert(ll.search(3) == 3 && ll.search(42) == -1);

    assert(ll.removeValue(0) && !ll.removeValue(42));
    assert((ll.toVector() == vector<int>{1, 2, 3, 4}));

    ll.reverse();
    assert((ll.toVector() == vector<int>{4, 3, 2, 1}));
    ll.pushBack(0);                          // proves tail_ survived reversal
    assert((ll.toVector() == vector<int>{4, 3, 2, 1, 0}));

    SinglyLinkedList copyOfLl = ll;          // deep copy (rule of three)
    copyOfLl.pushBack(7);
    assert(copyOfLl.size() == ll.size() + 1);

    int mid = -1;
    assert(SinglyLinkedList{1, 2, 3}.middle(mid) && mid == 2);
    assert(SinglyLinkedList{1, 2, 3, 4}.middle(mid) && mid == 3);  // 2nd middle
    assert(!SinglyLinkedList{}.middle(mid));

    SinglyLinkedList nth{1, 2, 3, 4, 5};
    nth.removeNthFromEnd(2);
    assert((nth.toVector() == vector<int>{1, 2, 3, 5}));
    nth.removeNthFromEnd(4);                 // removes the head
    assert((nth.toVector() == vector<int>{2, 3, 5}));

    // Cycle: 1 -> 2 -> 3 -> 4 -> back to 2
    Node n1(1), n2(2), n3(3), n4(4);
    n1.next = &n2;
    n2.next = &n3;
    n3.next = &n4;
    n4.next = &n2;
    assert(hasCycle(&n1) && cycleStart(&n1) == &n2);
    Node s1(1), s2(2);
    s1.next = &s2;
    assert(!hasCycle(&s1) && cycleStart(&s1) == nullptr);
    assert(!hasCycle(nullptr));

    // Merge two sorted chains (stack-allocated nodes, no ownership involved)
    Node a1(1), a3(3), a5(5), b2(2), b4(4);
    a1.next = &a3;
    a3.next = &a5;
    b2.next = &b4;
    vector<int> merged;
    for (Node* n = mergeSorted(&a1, &b2); n; n = n->next) merged.push_back(n->val);
    assert((merged == vector<int>{1, 2, 3, 4, 5}));

    DoublyLinkedList dll;
    dll.pushBack(2);
    DNode* middleNode = dll.pushBack(3);
    dll.pushBack(4);
    dll.pushFront(1);
    assert((dll.toVector() == vector<int>{1, 2, 3, 4}));
    assert((dll.toVectorReverse() == vector<int>{4, 3, 2, 1}));
    dll.deleteNode(middleNode);              // O(1), no search
    assert((dll.toVector() == vector<int>{1, 2, 4}) && dll.size() == 3);
    assert((dll.toVectorReverse() == vector<int>{4, 2, 1}));

    cout << "05-Linked-List (C++): all checks passed\n";
    return 0;
}
