# 05 - Linked List (Python)

> An array trades insertion cost for random access. A linked list trades random
> access for insertion cost. That is the entire difference.

## 1. The structure

```
head
 |
 v
+---+---+   +---+---+   +---+------+
| 1 | *-|-->| 2 | *-|-->| 3 | None |
+---+---+   +---+---+   +---+------+
```

Each node holds a value and a reference to the next node. Nodes live anywhere
in memory - that is why there is no index arithmetic and no `O(1)` random
access.

| Variant | Extra field | Buys you |
|---------|-------------|----------|
| Singly | `next` | minimal memory |
| Doubly | `prev` | `O(1)` delete given a node, backwards traversal |
| Circular | last `next` -> head | round-robin, queues |

---

## 2. Array vs linked list

| Operation | Array (`list`) | Linked list |
|-----------|----------------|-------------|
| access by index | `O(1)` | `O(n)` |
| insert/delete at head | `O(n)` | **`O(1)`** |
| insert/delete at tail | `O(1)` amortised | `O(1)` with a tail pointer |
| insert/delete in middle (node known) | `O(n)` | **`O(1)`** (doubly) |
| search | `O(n)` | `O(n)` |
| memory per element | compact | + one pointer per node |
| cache locality | excellent | poor - pointer chasing |

**Real-world verdict:** in Python you will almost always use a `list` or a
`deque`. Linked lists matter because interviewers use them to test pointer
manipulation, and because they underpin LRU caches, adjacency lists and
`collections.deque` internals.

---

## 3. The patterns

### a. Dummy head node
Removes every "what if the list is empty / what if we delete the head" branch:

```python
dummy = Node(0, head)
prev = dummy
...
return dummy.next          # the possibly-new head
```

### b. Two pointers: fast and slow
- **Middle:** `fast` moves 2, `slow` moves 1. When `fast` hits the end, `slow`
  is at the middle.
- **Cycle detection (Floyd):** if there is a loop, `fast` eventually laps
  `slow`. Start both at the head; a meeting means a cycle. To find the entry
  point, move one pointer back to the head and advance both by 1 - they meet at
  the cycle start.
- **Nth from the end:** advance `fast` by n, then move both until `fast` ends.

### c. Reversal
Three pointers, one pass:

```python
prev, curr = None, head
while curr:
    nxt = curr.next    # save it FIRST - you are about to destroy the link
    curr.next = prev
    prev, curr = curr, nxt
return prev             # the new head
```

### d. Merge
Two sorted lists into one: dummy head, compare, splice, advance.

---

## 4. Traps

- Losing the rest of the list: always save `curr.next` before reassigning it.
- Forgetting to update `tail` (or `size`) after mutating.
- Off-by-one in "nth from the end" - use a dummy so `n == length` works.
- Infinite loops when a cycle exists: bound your traversal or detect first.
- `__repr__` on a cyclic list will hang. Guard it.

---

## 5. Complexity of what is implemented here

| Operation | Time | Space |
|-----------|------|-------|
| `push_front` / `push_back` (with tail) | `O(1)` | `O(1)` |
| `insert_at` / `delete_at` | `O(n)` | `O(1)` |
| `search` | `O(n)` | `O(1)` |
| `reverse` (iterative) | `O(n)` | `O(1)` |
| `reverse_recursive` | `O(n)` | `O(n)` stack |
| `middle` | `O(n)` | `O(1)` |
| `has_cycle` / `cycle_start` | `O(n)` | `O(1)` |
| `remove_nth_from_end` | `O(n)` | `O(1)` |
| `merge_sorted` | `O(n + m)` | `O(1)` |
| Doubly `delete_node` (node known) | `O(1)` | `O(1)` |

## Run the code

```bash
python linked_list.py
```
