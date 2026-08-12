export class ApplicationContext {
  private map = new Map()
  private static instance: ApplicationContext

  public set(k, v) {
    this.map.set(k, v)
  }

  public delete(k) {
    this.map.delete(k)
  }

  public get(k) {
    return this.map.get(k)
  }

  public getAll() {
    return this.map
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ApplicationContext()
    }
    return this.instance
  }
}
