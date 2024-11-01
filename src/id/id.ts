export default abstract class Identifiable {
  private static idCounter: number = 0;
  private id: number;

  constructor() {
    this.id = Identifiable.idCounter++;
  }

  public get Id() {
    return this.id;
  }
}
