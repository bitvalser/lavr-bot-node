export class JsonSerialize {
  public static getJsonState(item: any): object {
    return Object.getOwnPropertyNames(item).reduce(
      (acc, key) => ({
        ...acc,
        [key]: item[key],
      }),
      {}
    );
  }

  public static fromJsonState<T>(newable: { new (...args: any[]): T }, data: any): T {
    const newItem = new newable();
    Object.keys(data).forEach((key) => {
      (newItem as any)[key] = data[key];
    });
    return newItem;
  }
}
