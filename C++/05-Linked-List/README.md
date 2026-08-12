# 05 - Linked List (C++)

> In C++ a linked list is where pointer discipline becomes visible: every
> `next` you overwrite without saving is a leak or a crash.

## 1. The structure

```
head
 |
 v
+---+---+   +---+---+   +---+---------+
| 1 | *-|-->| 2 | *-|-->| 3 | nullptr |
+---+---+   +---+---+   +---+---------+
```

```cpp
struct Node {
    int val;
    Node* next = nullptr;
    explicit Node(int v) : val(v) {}
};
```

| Variant | Extra field | Buys you |
|---------|-------------|----------|
| Singly | `next` | minimal memory |
| Doubly | `prev` | `O(1)` delete given a node, backward traversal |
| Circular | last `next` -> head | round robin |

The STL already ships `std::list` (doubly linked) and `std::forward_list`
(singly). You should still be able to write one - and in practice you should
usually use `vector` instead, because pointer chasing destroys cache locality.

---

## 2. Array vs linked list

| Operation | `vector` | linked list |
|-----------|----------|-------------|
| index access | `O(1)` | `O(n)` |
| insert/delete at front | `O(n)` | **`O(1)`** |
| insert/delete at back | `O(1)` amortised | `O(1)` with a tail pointer |
| insert/delete given an iterator/node | `O(n)` | **`O(1)`** (doubly) |
| memory overhead | none | 8-16 bytes per node |
| cache behaviour | streams | random access, misses |

---

## 3. Memory ownership (the part Python does not have)

Every `new Node` must be matched by a `delete`. In this chapter the list owns
its nodes and frees them in the destructor:

```cpp
~SinglyLinkedList() {
    while (head_) { Node* next = head_->next; delete head_; head_ = next; }
}
```

Because the class manages a raw resource, the **rule of three** applies: if you
write a destructor you almost certainly need a copy constructor and a copy
assignment operator too, or a shallow copy will double-free.

In modern production code you would use `unique_ptr<Node> next` and get all of
that for free - at the cost of recursive destruction blowing the stack on very
long lists.

---

## 4. The patterns

### a. Dummy head
```cpp
Node dummy(0);
dummy.next = head;
// ... manipulate ...
return dummy.next;
```
Kills every "what if we delete the head" branch.

### b. Fast / slow pointers
- **Middle:** `fast` moves 2, `slow` moves 1.
- **Cycle (Floyd):** they meet inside the loop. Restart one at the head and
  advance both by 1 to find the entry node.
- **Nth from the end:** open a gap of n, then move both.

### c. Reversal (three pointers, `O(1)` space)
```cpp
Node *prev = nullptr, *curr = head;
while (curr) {
    Node* next = curr->next;   // SAVE first
    curr->next = prev;
    prev = curr;
    curr = next;
}
head = prev;
```

### d. Merge two sorted lists
Dummy head, compare, splice - no allocation.

---

## 5. Traps

- Dereferencing `nullptr` is undefined behaviour, not an exception. Check
  `while (fast && fast->next)`.
- Deleting a node without unlinking it leaves a dangling pointer.
- Forgetting to update `tail_` after reversing or deleting the last node.
- Copying the list object shallowly (rule of three) - both copies then delete
  the same nodes.
- A cycle makes any naive traversal (including printing) loop forever.

---

## 6. Complexity of what is implemented here

| Operation | Time | Space |
|-----------|------|-------|
| `pushFront` / `pushBack` | `O(1)` | `O(1)` |
| `insertAt` / `deleteAt` | `O(n)` | `O(1)` |
| `search` | `O(n)` | `O(1)` |
| `reverse` | `O(n)` | `O(1)` |
| `middle` | `O(n)` | `O(1)` |
| `hasCycle` / `cycleStart` | `O(n)` | `O(1)` |
| `removeNthFromEnd` | `O(n)` | `O(1)` |
| `mergeSorted` | `O(n + m)` | `O(1)` |
| Doubly `deleteNode` | `O(1)` | `O(1)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall linked_list.cpp -o linked_list && ./linked_list
```
