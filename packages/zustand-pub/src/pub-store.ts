import {
  createStore,
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from "zustand/vanilla";

import IframeListener from "./iframe-listener";

interface IUnit<
  T extends object = any,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
> {
  value: StoreApi<T>;
  pubStore: PubStore;
  fn: StateCreator<T, [], Mos>;
}

declare global {
  interface Window {
    [key: symbol]: { [key: string]: IUnit };
  }
}

class PubStore {
  private storeSymbol: symbol;
  private target: { [p: string]: IUnit } | undefined;
  private w: Window | undefined;
  constructor(symbolKey: string) {
    if (!symbolKey) {
      throw new Error("Missing key of PubStore");
    }
    this.storeSymbol = Symbol.for(symbolKey);
    if (typeof window !== "undefined") {
      this.w = window;
      this.target = this.w ? this.w[this.storeSymbol] : undefined;
    }

    new IframeListener(symbolKey);

    if (this.target) {
      const keys = Object.keys(this.target);
      return this.target[keys[0]].pubStore;
    }
  }

  defineStore<
    T extends object,
    Mos extends [StoreMutatorIdentifier, unknown][] = [],
  >(key: string, fn: StateCreator<T, [], Mos>) {
    if (!key) {
      return createStore(fn);
    }

    let Store: StoreApi<T>;
    if (this.target && this.target[key] && this.target[key].value) {
      const oldStore = this.target[key].value;
      const newFnValue = fn(oldStore.setState, oldStore.getState, oldStore);
      oldStore.setState((state: any) => ({
        ...newFnValue,
        ...state,
      }));
      Store = oldStore;
    } else {
      Store = createStore(fn);
    }

    if (typeof window !== "undefined") {
      //@ts-ignore
      this.w![this.storeSymbol] = {
        ...(this.w![this.storeSymbol] || {}),
        [key]: {
          value: Store,
          pubStore: this,
          fn,
        },
      };
      this.target = this.w![this.storeSymbol];
    }

    return Store;
  }

  getStore<T extends object>(key: string): StoreApi<T> {
    //@ts-ignore
    const res = this.target && this.target[key] && this.target[key].value;
    //@ts-ignore
    return res || this.defineStore<T>(key, () => ({}));
  }
}

export default PubStore;
