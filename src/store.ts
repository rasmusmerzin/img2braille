export type Subscriber<T> = (value: T) => any;
export type Unsubscriber = () => void;
export type Getter<T> = () => T;
export type Setter<T> = (value: T) => T;
export type Updater<T> = (predicate: (value: T) => T) => T;
export type Stopper = () => void;
export type Starter<T> = (
  set: Setter<T>,
  update: Updater<T>,
  get: Getter<T>,
) => Stopper | void;

export interface Readable<T> {
  get: Getter<T>;
  subscribe: (listener: Subscriber<T>, immediate?: boolean) => Unsubscriber;
}

export interface Writable<T> extends Readable<T> {
  set: Setter<T>;
  update: Updater<T>;
}

export function readable<T>(value: T, start?: Starter<T>): Readable<T> {
  const store = writable(value, start);
  return {
    get: store.get,
    subscribe: store.subscribe,
  };
}

export function writable<T>(value: T, start?: Starter<T>): Writable<T> {
  const listeners = new Set<Subscriber<T>>();
  let stop: Stopper | void;
  function get(): T {
    if (isEmpty() && start) stop = start(set, update, get);
    const v = value;
    if (isEmpty() && stop) stop();
    return v;
  }
  function set(newValue: T): T {
    value = newValue;
    for (const listener of listeners) listener(value);
    return value;
  }
  function update(predicate: (value: T) => T): T {
    return set(predicate(value));
  }
  function subscribe(listener: Subscriber<T>, immediate = true): Unsubscriber {
    if (isEmpty() && start) stop = start(set, update, get);
    listeners.add(listener);
    if (immediate) listener(value);
    return function unsubscribe() {
      listeners.delete(listener);
      if (isEmpty() && stop) stop();
    };
  }
  function isEmpty() {
    return listeners.size === 0;
  }
  return { get, set, update, subscribe };
}

export function derived<I extends Readable<unknown>[], O>(
  stores: I,
  fn: (values: {
    [K in keyof I]: I[K] extends Readable<infer T> ? T : never;
  }) => O,
): Readable<O> {
  let values = stores.map((store) => store.get());
  return readable(fn(values as any), (set) => {
    values = stores.map((store) => store.get());
    set(fn(values as any));
    const unsubscribers = stores.map((store, i) =>
      store.subscribe((value) => {
        values[i] = value;
        set(fn(values as any));
      }, false),
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  });
}
