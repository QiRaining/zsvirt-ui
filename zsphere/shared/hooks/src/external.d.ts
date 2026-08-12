interface Window {
  g_main: {
    apolloClient: any;
  };
  g_action_subscribe: any;
}

declare module "rxjs" {
  export class Subject<T> {
    constructor();
    pipe<A>(op1: any): any;
    pipe<A, B>(op1: any, op2: any): any;
    pipe<A, B, C>(op1: any, op2: any, op3: any): any;
    subscribe(
      next?: (value: T) => void,
      error?: (error: any) => void,
      complete?: () => void,
    ): any;
  }
}

declare module "rxjs/operators" {
  export function filter<T>(
    predicate: (value: T, index: number) => boolean,
  ): any;
  export function filter<T>(predicate: (value: T) => boolean): any;
}
