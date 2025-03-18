import { expect, test } from "vitest";
import { readable, writable, derived } from "./store";

test("writable listens to changes", () => {
  const store = writable(0);
  let value = 0;
  store.subscribe((v) => {
    value = v;
  });
  store.update((v) => ++v);
  expect(value).toBe(1);
});

test("writable cleans up listeners", () => {
  const store = writable(0);
  let value = 0;
  const unsubscribe = store.subscribe((v) => {
    value = v;
  });
  unsubscribe();
  store.set(1);
  expect(value).toBe(0);
});

test("writable respects subscription immediate flag", () => {
  const store = writable(1);
  let value = 0;
  let unsubscribe = store.subscribe((v) => {
    value = v;
  });
  expect(value).toBe(1);
  unsubscribe();
  store.set(2);
  unsubscribe = store.subscribe((v) => {
    value = v;
  }, false);
  expect(value).toBe(1);
  store.set(2);
  expect(value).toBe(2);
});

test("readable starts and stops on subscribers", () => {
  let started = false;
  let stopped = false;
  const store = readable(0, () => {
    started = true;
    return () => {
      stopped = true;
    };
  });
  expect(started).toBe(false);
  const unsubscribe1 = store.subscribe(() => {});
  const unsubscribe2 = store.subscribe(() => {});
  expect(started).toBe(true);
  expect(stopped).toBe(false);
  unsubscribe1();
  expect(stopped).toBe(false);
  unsubscribe2();
  expect(stopped).toBe(true);
});

test("readable starts and stops for standalone get", () => {
  let started = false;
  let stopped = false;
  const store = readable(0, (set) => {
    started = true;
    set(1);
    return () => {
      stopped = true;
      set(0);
    };
  });
  expect(store.get()).toBe(1);
  expect(started).toBe(true);
  expect(stopped).toBe(true);
});

test("derived computes values", () => {
  const a = writable(0);
  const b = writable(0);
  const c = derived([a, b], ([a, b]) => a + b);
  let value = 0;
  c.subscribe((v) => {
    value = v;
  });
  a.set(3);
  expect(value).toBe(3);
  b.set(7);
  expect(value).toBe(10);
});
