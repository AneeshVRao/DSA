# 05 - Linked List (JavaScript)

> No manual memory management, but the same pointer discipline: lose a
> reference and the garbage collector eats the rest of your list.

## 1. The structure

```
head
 |
 v
+---+---+   +---+---+   +---+------+
| 1 | *-|-->| 2 | *-|-->| 3 | null |
+---+---+   +---+---+   +---+------+
```

```js
class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}
```

| Variant | Extra field | Buys you |
|---------|-------------|----------|
| Singly | `next` | minimal memory |
| Doubly | `prev` | `O(1)` delete given a node, backward traversal |
| Circular | last `next` -> head | round robin |

---

## 2. Array vs linked list in JS

| Operation | Array | Linked list |
|-----------|-------|-------------|
| index access | `O(1)` | `O(n)` |
| `unshift` / `shift` (front) | **`O(n)`** | **`O(1)`** |
| `push` / `pop` (back) | `O(1)` amortised | `O(1)` with a tail pointer |
| delete given a node | `O(n)` | `O(1)` (doubly) |
| memory | compact | one object per node |

This is the one place linked lists genuinely beat JS arrays: **queues**.
`arr.shift()` is `O(n)`, so draining a 100k-element queue with `shift` is
`O(n^2)`. A linked list (or a head index) makes it `O(n)`.

---

## 3. The patterns

### a. Dummy head
```js
const dummy = new Node(0, head);
// ... manipulate ...
return dummy.next;
```
Removes every "what if we delete the head" special case.

### b. Fast / slow pointers
- **Middle:** `fast` moves 2, `slow` moves 1.
- **Cycle (Floyd):** they meet inside the loop; restart one at the head and
  step both by 1 to find the entry node.
- **Nth from the end:** open a gap of n, then move both.

### c. Reversal (`O(1)` space)
```js
let prev = null;
let curr = head;
while (curr) {
  const next = curr.next;   // SAVE first
  curr.next = prev;
  prev = curr;
  curr = next;
}
return prev;
```

### d. Merge two sorted lists
Dummy head, compare, splice - no new nodes.

---

## 4. Iterating idiomatically

Give the class a generator so `for...of` and spread work:

```js
*[Symbol.iterator]() {
  let node = this.head;
  while (node) { yield node.val; node = node.next; }
}

[...list];               // [1, 2, 3]
for (const v of list) {} // clean traversal
```

---

## 5. Traps

- Overwriting `curr.next` before saving it loses the tail of the list.
- `while (fast.next.next)` throws on short lists - test `fast && fast.next`.
- Comparing nodes with `===` compares references, which is exactly what cycle
  detection needs; comparing values would be wrong.
- Forgetting to update `this.tail` after reversing or removing the last node.
- A cyclic list breaks `console.log`, `JSON.stringify` and any naive loop.

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

## Run the code

```bash
node linked_list.js
```
