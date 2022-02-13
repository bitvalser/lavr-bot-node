export class TestsDataService {
  private static instance: TestsDataService;
  private sessions: {
    [user: string]: string;
  } = {};

  public static getInstance(): TestsDataService {
    if (!TestsDataService.instance) {
      TestsDataService.instance = new TestsDataService();
    }
    return TestsDataService.instance;
  }

  public addSession(user: string, test: string): boolean {
    if (this.sessions[user]) {
      return false;
    }
    this.sessions[user] = test;
    return true;
  }

  public getSession(user: string): string {
    return this.sessions[user];
  }

  public removeSession(user: string): void {
    delete this.sessions[user];
  }
}
