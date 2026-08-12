class Bus {
  private eventMap: Map<string, Array<Function>>;

  constructor() {
    this.eventMap = new Map();
  }

  emit(type: string, ...args: any[]) {
    if (this.eventMap.has(type)) {
      const listenerList = this.eventMap.get(type);
      listenerList!.forEach((listener) => {
        listener.apply(this, args);
      });
    }
  }

  addListener(type: string, cb: Function) {
    const listenerList = this.eventMap.get(type) || [];
    listenerList.push(cb);
    if (!this.eventMap.has(type)) {
      this.eventMap.set(type, listenerList);
    }
  }

  removeListener(type: string, cb?: Function) {
    if (!cb) {
      this.eventMap.delete(type);
    } else {
      const listenerList = this.eventMap.get(type) || [];
      const targetIndex = listenerList.findIndex((cv) => cv === cb);
      if (targetIndex > -1) {
        listenerList.splice(targetIndex, 1);
      }
    }
  }
}

if (typeof window !== "undefined") {
  window.bus = window.bus ? window.bus : new Bus();
}

export const bus = typeof window !== "undefined" ? window.bus : new Bus();

declare global {
  interface Window {
    bus: Bus;
  }
}
