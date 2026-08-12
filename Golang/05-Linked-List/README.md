# 05 - Linked List (Go)

> Go has a garbage collector and no pointer arithmetic, so linked lists here
> are pure structure: `*Node` fields and `nil` checks.

**At a glance**

| | |
|---|---|
| **What it is** | Pointers instead of contiguity: cheap splicing, no random access. |
| **Must know** | Insert/delete `O(1)` **given the node**, but `O(n)` to find it first. |
| **The one trap** | Losing the tail - save `next` *before* rewiring a pointer. |
| **Reach for it when** | The problem hands you a head pointer, or `O(1)` splicing is the point. |

---

## 1. The structure

```
head
 |
 v
+---+---+   +---+---+   +---+-----+
| 1 | *-|-->| 2 | *-|-->| 3 | nil |
+---+---+   +---+---+   +---+-----+
```

```go
type Node struct {
    Val  int
    Next *Node
}
```

A `nil` pointer is the zero value, so an empty list needs no initialisation -
`var head *Node` is already a valid empty list.

| Variant | Extra field | Buys you |
|---------|-------------|----------|
| Singly | `Next` | minimal memory |
| Doubly | `Prev` | `O(1)` delete given a node, backward traversal |
| Circular | last `Next` -> head | round robin |

The standard library ships `container/list` (a doubly linked list with a
sentinel root). It is rarely the right choice - a slice usually wins on cache
locality - but it is worth reading once.

---

## 2. Slice vs linked list

| Operation | Slice | Linked list |
|-----------|-------|-------------|
| index access | `O(1)` | `O(n)` |
| insert/delete at front | `O(n)` | **`O(1)`** |
| append at back | `O(1)` amortised | `O(1)` with a tail pointer |
| delete given a node | `O(n)` | `O(1)` (doubly) |
| memory | compact, contiguous | one heap object per node |

---

## 3. The patterns

### a. Dummy head
```go
dummy := &Node{Next: head}
// ... manipulate ...
return dummy.Next
```
Removes every "what if the head is the one being deleted" branch.

### b. Fast / slow pointers
- **Middle:** `fast` moves 2, `slow` moves 1.
- **Cycle (Floyd):** they meet inside the loop; then restart one at the head
  and step both by 1 to find the entry.
- **Nth from the end:** open a gap of n, then advance both.

### c. Reversal (`O(1)` space)
```go
var prev *Node
curr := head
for curr != nil {
    next := curr.Next   // SAVE first
    curr.Next = prev
    prev, curr = curr, next
}
head = prev
```

Note `prev, curr = curr, next` - Go's multiple assignment evaluates the right
side first, so no temporary is needed.

### d. Merge two sorted lists
Dummy head, compare, splice. No allocation beyond the dummy.

---

## 4. Go specifics

- Comparing pointers with `==` compares identity - exactly what cycle detection
  needs.
- The garbage collector cleans up unlinked nodes; there is no `free`.
- Methods on `*List` (pointer receiver) are required whenever you reassign
  `l.head`, otherwise you mutate a copy of the struct.
- Implement `String() string` to get pretty printing from `fmt` for free - but
  guard against cycles or it will hang.

---

## 5. Traps

- Dereferencing a `nil` pointer panics. Always test `fast != nil && fast.Next != nil`.
- Value receivers silently operate on a copy: `func (l List) PushFront(...)`
  will not change the caller's list.
- Forgetting to update `tail` after reversing or deleting the last node.
- Returning `nil` vs an empty list: for linked lists `nil` **is** the empty
  list, which is convenient.

---

## 6. Complexity of what is implemented here

| Operation | Time | Space |
|-----------|------|-------|
| `PushFront` / `PushBack` | `O(1)` | `O(1)` |
| `InsertAt` / `DeleteAt` | `O(n)` | `O(1)` |
| `Search` | `O(n)` | `O(1)` |
| `Reverse` | `O(n)` | `O(1)` |
| `Middle` | `O(n)` | `O(1)` |
| `HasCycle` / `CycleStart` | `O(n)` | `O(1)` |
| `RemoveNthFromEnd` | `O(n)` | `O(1)` |
| `MergeSorted` | `O(n + m)` | `O(1)` |
| Doubly `DeleteNode` | `O(1)` | `O(1)` |

## Run the code

```bash
go run linked_list.go
```

---

[<- 04 Strings](../04-Strings/) · [All topics](../../README.md) · [06 Stack & Queue ->](../06-Stack-Queue/)
