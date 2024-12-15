export default abstract class Identifiable {
  private static idCounter: number = 0;

  private id: number;
  readonly uid: string;

  constructor() {
    this.id = Identifiable.idCounter++;
    this.uid = Identifiable.newId().toString();
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
