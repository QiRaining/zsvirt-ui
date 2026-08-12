import {
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from "zustand/vanilla";

import PubStore from "./pub-store";

export interface IUnit<
  T extends object = any,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
> {
  value: StoreApi<T>;
  pubStore: PubStore;
  fn: StateCreator<T, [], Mos>;
}
