declare module 'yargs-parser' {
  const yargsParser: (args: string[]) => any
  export = yargsParser
}

declare module 'node-fetch' {
  const fetch: (url: string, options?: any) => Promise<any>
  export = fetch
}

declare module 'md5.js' {
  const MD5: {
    (input: string): string
    new (): any
  }
  export = MD5
}
