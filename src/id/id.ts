export default abstract class Identifiable {
  private static idCounter: number = 0;

  private id: number;

  constructor() {
    this.id = Identifiable.idCounter++;
  }

  public get Id() {
    return this.id;
  }

  public changeId(newId: number) {
    this.id = newId;
    Identifiable.idCounter = Math.max(Identifiable.idCounter--, newId + 1);
  }

  public static newId() {
    return Identifiable.idCounter++;
  }
}
