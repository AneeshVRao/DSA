// 06 - Stack and Queue: both from scratch, plus the monotonic-stack patterns
// that show up constantly in interviews.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall stack_queue.cpp -o stack_queue && ./stack_queue

#include <cassert>
#include <deque>
#include <functional>
#include <iostream>
#include <stack>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// ============================================================================
// 1. Stack over a vector (LIFO)
// ============================================================================
template <typename T>
class ArrayStack {
   public:
    void push(const T& value) { data_.push_back(value); }   // amortised O(1)

    T pop() {                                                // O(1)
        if (data_.empty()) throw out_of_range("pop from empty stack");
        T value = data_.back();
        data_.pop_back();
        return value;
    }

    const T& top() const {
        if (data_.empty()) throw out_of_range("top of empty stack");
        return data_.back();
    }

    bool empty() const { return data_.empty(); }
    size_t size() const { return data_.size(); }

   private:
    vector<T> data_;
};

// ============================================================================
// 2. Circular-buffer queue (FIFO)
// ============================================================================
// head_ is where the next dequeue happens; the write position is derived as
// (head_ + count_) % capacity. Nothing is ever shifted, so both ends are O(1).
// A separate count_ distinguishes full from empty, which head == tail cannot.
template <typename T>
class CircularQueue {
   public:
    explicit CircularQueue(size_t capacity)
        : buf_(capacity), capacity_(capacity) {
        if (capacity == 0) throw invalid_argument("capacity must be positive");
    }

    void enqueue(const T& value) {
        if (full()) throw overflow_error("queue is full");
        buf_[(head_ + count_) % capacity_] = value;
        count_++;
    }

    T dequeue() {
        if (empty()) throw out_of_range("dequeue from empty queue");
        T value = buf_[head_];
        head_ = (head_ + 1) % capacity_;
        count_--;
        return value;
    }

    const T& front() const {
        if (empty()) throw out_of_range("front of empty queue");
        return buf_[head_];
    }

    bool empty() const { return count_ == 0; }
    bool full() const { return count_ == capacity_; }
    size_t size() const { return count_; }

    vector<T> toVector() const {
        vector<T> out;
        out.reserve(count_);
        for (size_t i = 0; i < count_; i++)
            out.push_back(buf_[(head_ + i) % capacity_]);
        return out;
    }

   private:
    vector<T> buf_;
    size_t capacity_;
    size_t head_ = 0;
    size_t count_ = 0;
};

// ============================================================================
// 3. MinStack - O(1) minimum
// ============================================================================
// Storing (value, min_so_far) pairs trades O(n) space for an O(1) query;
// scanning for the minimum on demand would be O(n) per call.
class MinStack {
   public:
    void push(int val) {
        int currentMin = data_.empty() ? val : min(val, data_.back().second);
        data_.push_back({val, currentMin});
    }

    int pop() {
        if (data_.empty()) throw out_of_range("pop from empty stack");
        int value = data_.back().first;
        data_.pop_back();
        return value;
    }

    int top() const { return data_.back().first; }
    int getMin() const { return data_.back().second; }
    bool empty() const { return data_.empty(); }

   private:
    vector<pair<int, int>> data_;
};

// ============================================================================
// 4. Queue built from two stacks
// ============================================================================
// Pouring `in_` into `out_` reverses the order, so the oldest element ends up
// on top of `out_`. Each element moves at most twice: amortised O(1).
class QueueViaStacks {
   public:
    void push(int value) { in_.push(value); }

    int pop() {
        shift();
        if (out_.empty()) throw out_of_range("pop from empty queue");
        int value = out_.top();
        out_.pop();
        return value;
    }

    int front() {
        shift();
        if (out_.empty()) throw out_of_range("front of empty queue");
        return out_.top();
    }

    size_t size() const { return in_.size() + out_.size(); }

   private:
    void shift() {
        if (out_.empty()) {              // only pour when it has run dry
            while (!in_.empty()) {
                out_.push(in_.top());
                in_.pop();
            }
        }
    }

    stack<int> in_, out_;
};

// ============================================================================
// 5. Matching / nesting
// ============================================================================
// A closer must match the most recent opener - exactly what a stack tracks.
bool isBalanced(const string& s) {
    unordered_map<char, char> pairs{{')', '('}, {']', '['}, {'}', '{'}};
    vector<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push_back(c);
        } else if (pairs.count(c)) {
            if (st.empty() || st.back() != pairs[c]) return false;
            st.pop_back();
        }
    }
    return st.empty();                   // leftovers mean unclosed openers
}

// ============================================================================
// 6. Monotonic stack
// ============================================================================
// Next strictly greater element to the right, or -1. O(n): every index is
// pushed once and popped at most once.
vector<int> nextGreater(const vector<int>& nums) {
    vector<int> result(nums.size(), -1);
    vector<int> st;                      // indices; their values decrease
    for (size_t i = 0; i < nums.size(); i++) {
        while (!st.empty() && nums[st.back()] < nums[i]) {
            result[st.back()] = nums[i]; // nums[i] is the answer for that index
            st.pop_back();
        }
        st.push_back(int(i));
    }
    return result;
}

// Days to wait for a warmer temperature. Same pattern, distances instead of
// values - which is why the stack holds indices.
vector<int> dailyTemperatures(const vector<int>& temps) {
    vector<int> result(temps.size(), 0);
    vector<int> st;
    for (int i = 0; i < int(temps.size()); i++) {
        while (!st.empty() && temps[st.back()] < temps[i]) {
            result[st.back()] = i - st.back();
            st.pop_back();
        }
        st.push_back(i);
    }
    return result;
}

// Largest rectangle in a histogram. O(n) with a monotonic increasing stack.
// When a shorter bar arrives, every taller bar on the stack can no longer
// extend right, so its maximal rectangle is finalised. The trailing 0 sentinel
// flushes whatever remains.
long long largestRectangle(vector<int> heights) {
    heights.push_back(0);                // sentinel
    vector<int> st;
    long long best = 0;
    for (int i = 0; i < int(heights.size()); i++) {
        while (!st.empty() && heights[st.back()] >= heights[i]) {
            long long height = heights[st.back()];
            st.pop_back();
            long long left = st.empty() ? 0 : st.back() + 1;
            best = max(best, height * (i - left));
        }
        st.push_back(i);
    }
    return best;
}

// ============================================================================
// 7. Simulation
// ============================================================================
// Reverse Polish notation. Operands wait on the stack until an operator claims
// the last two - and the order of those two matters for - and /.
int evalRPN(const vector<string>& tokens) {
    vector<int> st;
    for (const string& token : tokens) {
        if (token == "+" || token == "-" || token == "*" || token == "/") {
            int b = st.back(); st.pop_back();
            int a = st.back(); st.pop_back();
            if (token == "+") st.push_back(a + b);
            else if (token == "-") st.push_back(a - b);
            else if (token == "*") st.push_back(a * b);
            else st.push_back(a / b);    // C++ division truncates toward zero
        } else {
            st.push_back(stoi(token));
        }
    }
    return st.back();
}

// Maximum of every window of size k. O(n) with a monotonic deque: the front is
// always the window maximum, and any value smaller than the arriving one can
// never win again.
vector<int> slidingWindowMax(const vector<int>& nums, size_t k) {
    if (k == 0 || k > nums.size()) throw invalid_argument("bad window size");
    deque<size_t> dq;                    // indices, values decreasing
    vector<int> out;
    out.reserve(nums.size() - k + 1);
    for (size_t i = 0; i < nums.size(); i++) {
        while (!dq.empty() && dq.front() + k <= i) dq.pop_front();  // expired
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i + 1 >= k) out.push_back(nums[dq.front()]);
    }
    return out;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ArrayStack<int> st;
    st.push(1);
    st.push(2);
    assert(st.top() == 2 && st.size() == 2);
    assert(st.pop() == 2 && st.pop() == 1 && st.empty());
    bool threw = false;
    try { st.pop(); } catch (const out_of_range&) { threw = true; }
    assert(threw);

    CircularQueue<int> q(3);
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    assert(q.full() && (q.toVector() == vector<int>{1, 2, 3}));
    assert(q.dequeue() == 1);
    q.enqueue(4);                        // wraps around the buffer
    assert((q.toVector() == vector<int>{2, 3, 4}));
    assert(q.front() == 2 && q.size() == 3);

    MinStack ms;
    for (int v : {5, 3, 7, 3}) ms.push(v);
    assert(ms.getMin() == 3 && ms.top() == 3);
    ms.pop();
    assert(ms.getMin() == 3);
    ms.pop();                            // removes 7
    ms.pop();                            // removes the first 3
    assert(ms.getMin() == 5);

    QueueViaStacks qs;
    for (int v : {1, 2, 3}) qs.push(v);
    assert(qs.front() == 1 && qs.pop() == 1);
    qs.push(4);
    assert(qs.pop() == 2 && qs.pop() == 3 && qs.pop() == 4);

    assert(isBalanced("({[]})"));
    assert(isBalanced(""));
    assert(!isBalanced("(]"));
    assert(!isBalanced("(("));

    assert((nextGreater({2, 1, 2, 4, 3}) == vector<int>{4, 2, 4, -1, -1}));
    assert((dailyTemperatures({73, 74, 75, 71, 69, 72, 76, 73}) ==
            vector<int>{1, 1, 4, 2, 1, 1, 0, 0}));
    assert(largestRectangle({2, 1, 5, 6, 2, 3}) == 10);
    assert(largestRectangle({2, 2}) == 4);

    assert(evalRPN({"2", "1", "+", "3", "*"}) == 9);
    assert(evalRPN({"4", "13", "5", "/", "+"}) == 6);

    assert((slidingWindowMax({1, 3, -1, -3, 5, 3, 6, 7}, 3) ==
            vector<int>{3, 3, 5, 5, 6, 7}));

    cout << "06-Stack-Queue (C++): all checks passed\n";
    return 0;
}
