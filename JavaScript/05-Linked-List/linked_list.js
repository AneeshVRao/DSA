/**
 * 05 - Linked List: singly and doubly linked lists from scratch, plus the
 * pointer patterns interviewers ask about.
 *
 * Run:  node linked_list.js
 */

import assert from "node:assert/strict";

// ============================================================================
// Node
// ============================================================================
export class Node {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// ============================================================================
// Singly linked list
// ============================================================================
export class SinglyLinkedList {
  #head = null;
  #tail = null;
  #size = 0;

  constructor(values = []) {
    for (const v of values) this.pushBack(v);
  }

  get head() {
    return this.#head;
  }
  get tail() {
    return this.#tail;
  }
  get size() {
    return this.#size;
  }

  /** Generator: makes for...of and [...list] work. */
  *[Symbol.iterator]() {
    let node = this.#head;
    while (node) {
      yield node.val;
      node = node.next;
    }
  }

  toArray() {
    return [...this];
  }

  toString() {
    return this.toArray().join(" -> ") || "(empty)";
  }

  // -------------------------------------------------------------- insertion
  /** O(1) - the operation arrays cannot do cheaply (unshift is O(n)). */
  pushFront(val) {
    this.#head = new Node(val, this.#head);
    if (!this.#tail) this.#tail = this.#head;
    this.#size++;
  }

  /** O(1) thanks to the tail pointer; O(n) without one. */
  pushBack(val) {
    const node = new Node(val);
    if (!this.#tail) {
      this.#head = this.#tail = node;
    } else {
      this.#tail.next = node;
      this.#tail = node;
    }
    this.#size++;
  }

  /** O(n): we have to walk to the position first. */
  insertAt(index, val) {
    if (index < 0 || index > this.#size) throw new RangeError("index out of range");
    if (index === 0) return this.pushFront(val);
    if (index === this.#size) return this.pushBack(val);
    const prev = this.#nodeAt(index - 1);
    prev.next = new Node(val, prev.next);
    this.#size++;
  }

  // --------------------------------------------------------------- deletion
  /** O(n). The dummy head removes the "deleting the head" special case. */
  deleteAt(index) {
    if (index < 0 || index >= this.#size) throw new RangeError("index out of range");
    const dummy = new Node(0, this.#head);
    let prev = dummy;
    for (let i = 0; i < index; i++) prev = prev.next;

    const target = prev.next;
    prev.next = target.next;
    if (target === this.#tail) this.#tail = prev === dummy ? null : prev;
    this.#head = dummy.next;
    this.#size--;
    return target.val;
  }

  removeValue(val) {
    const dummy = new Node(0, this.#head);
    for (let prev = dummy; prev.next; prev = prev.next) {
      if (prev.next.val === val) {
        const target = prev.next;
        prev.next = target.next;
        if (target === this.#tail) this.#tail = prev === dummy ? null : prev;
        this.#head = dummy.next;
        this.#size--;
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------- lookups
  /** Index of the first match, or -1. O(n) - no random access. */
  search(val) {
    let i = 0;
    for (let node = this.#head; node; node = node.next, i++) {
      if (node.val === val) return i;
    }
    return -1;
  }

  #nodeAt(index) {
    let node = this.#head;
    for (let i = 0; i < index && node; i++) node = node.next;
    return node;
  }

  // --------------------------------------------------------------- reversal
  /** Three pointers, one pass. O(n) time, O(1) space. */
  reverse() {
    let prev = null;
    let curr = this.#head;
    this.#tail = this.#head; // the old head becomes the tail
    while (curr) {
      const next = curr.next; // SAVE before destroying the link
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    this.#head = prev;
  }

  // ---------------------------------------------------------- two pointers -
  /** Middle value (the second middle when even). O(n), one pass. */
  middle() {
    let slow = this.#head;
    let fast = this.#head;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
    }
    return slow ? slow.val : null;
  }

  /** Remove the nth node from the end in one pass. */
  removeNthFromEnd(n) {
    if (n < 1 || n > this.#size) throw new RangeError("n out of range");
    const dummy = new Node(0, this.#head);
    let fast = dummy;
    let slow = dummy;
    for (let i = 0; i < n; i++) fast = fast.next; // open a gap of n
    while (fast.next) {
      fast = fast.next;
      slow = slow.next;
    }
    const target = slow.next;
    slow.next = target.next;
    if (target === this.#tail) this.#tail = slow === dummy ? null : slow;
    this.#head = dummy.next;
    this.#size--;
  }
}

// ============================================================================
// Cycle detection (Floyd's tortoise and hare)
// ============================================================================
/** O(n) time, O(1) space. A Set of visited nodes also works but costs O(n). */
export function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // reference identity, not value equality
  }
  return false;
}

/**
 * First node of the cycle, or null.
 *
 * When the pointers meet, the meeting point is exactly L steps from the cycle
 * entry (mod C), where L is the head-to-entry distance. So a walker starting
 * at the head and the slow pointer, both moving 1 step, collide at the entry.
 */
export function cycleStart(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let walker = head;
      while (walker !== slow) {
        walker = walker.next;
        slow = slow.next;
      }
      return walker;
    }
  }
  return null;
}

// ============================================================================
// Merging two sorted lists
// ============================================================================
/** Splices existing nodes - allocates nothing. O(n + m) time, O(1) space. */
export function mergeSorted(a, b) {
  const dummy = new Node(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      // <= keeps the merge stable
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b; // attach the remainder in one step
  return dummy.next;
}

// ============================================================================
// Doubly linked list
// ============================================================================
export class DNode {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

/**
 * The prev pointer buys O(1) deletion when you already hold the node - which
 * is exactly what an LRU cache needs.
 */
export class DoublyLinkedList {
  head = null;
  tail = null;
  size = 0;

  pushBack(val) {
    const node = new DNode(val);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
    return node;
  }

  pushFront(val) {
    const node = new DNode(val);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.size++;
    return node;
  }

  /** O(1): no traversal required. */
  deleteNode(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    node.prev = node.next = null;
    this.size--;
  }

  toArray() {
    const out = [];
    for (let n = this.head; n; n = n.next) out.push(n.val);
    return out;
  }

  toArrayReverse() {
    const out = [];
    for (let n = this.tail; n; n = n.prev) out.push(n.val);
    return out;
  }
}

// ============================================================================
// demo
// ============================================================================
function demo() {
  const ll = new SinglyLinkedList([1, 2, 3]);
  assert.deepEqual(ll.toArray(), [1, 2, 3]);
  assert.equal(ll.size, 3);
  ll.pushFront(0);
  ll.pushBack(4);
  assert.deepEqual(ll.toArray(), [0, 1, 2, 3, 4]);
  assert.equal(ll.tail.val, 4);

  ll.insertAt(2, 99);
  assert.deepEqual(ll.toArray(), [0, 1, 99, 2, 3, 4]);
  assert.equal(ll.deleteAt(2), 99);
  assert.deepEqual(ll.toArray(), [0, 1, 2, 3, 4]);

  assert.equal(ll.search(3), 3);
  assert.equal(ll.search(42), -1);

  assert.ok(ll.removeValue(0));
  assert.ok(!ll.removeValue(42));
  assert.deepEqual(ll.toArray(), [1, 2, 3, 4]);

  ll.reverse();
  assert.deepEqual(ll.toArray(), [4, 3, 2, 1]);
  ll.pushBack(0); // proves the tail pointer survived the reversal
  assert.deepEqual(ll.toArray(), [4, 3, 2, 1, 0]);
  assert.equal(ll.toString(), "4 -> 3 -> 2 -> 1 -> 0");

  assert.equal(new SinglyLinkedList([1, 2, 3]).middle(), 2);
  assert.equal(new SinglyLinkedList([1, 2, 3, 4]).middle(), 3); // second middle
  assert.equal(new SinglyLinkedList().middle(), null);

  const nth = new SinglyLinkedList([1, 2, 3, 4, 5]);
  nth.removeNthFromEnd(2);
  assert.deepEqual(nth.toArray(), [1, 2, 3, 5]);
  nth.removeNthFromEnd(4); // removes the head
  assert.deepEqual(nth.toArray(), [2, 3, 5]);

  // Cycle: 1 -> 2 -> 3 -> 4 -> back to 2
  const n1 = new Node(1);
  const n2 = new Node(2);
  const n3 = new Node(3);
  const n4 = new Node(4);
  n1.next = n2;
  n2.next = n3;
  n3.next = n4;
  n4.next = n2;
  assert.ok(hasCycle(n1));
  assert.equal(cycleStart(n1), n2);
  const straight = new Node(1, new Node(2));
  assert.ok(!hasCycle(straight));
  assert.equal(cycleStart(straight), null);
  assert.ok(!hasCycle(null));

  const merged = mergeSorted(
    new SinglyLinkedList([1, 3, 5]).head,
    new SinglyLinkedList([2, 4]).head,
  );
  const out = [];
  for (let n = merged; n; n = n.next) out.push(n.val);
  assert.deepEqual(out, [1, 2, 3, 4, 5]);

  const dll = new DoublyLinkedList();
  dll.pushBack(2);
  const middleNode = dll.pushBack(3);
  dll.pushBack(4);
  dll.pushFront(1);
  assert.deepEqual(dll.toArray(), [1, 2, 3, 4]);
  assert.deepEqual(dll.toArrayReverse(), [4, 3, 2, 1]);
  dll.deleteNode(middleNode); // O(1), no search
  assert.deepEqual(dll.toArray(), [1, 2, 4]);
  assert.deepEqual(dll.toArrayReverse(), [4, 2, 1]);
  assert.equal(dll.size, 3);

  console.log("05-Linked-List (JavaScript): all checks passed");
}

demo();
