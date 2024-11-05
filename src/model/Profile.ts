import Identifiable from "../id/id";
import Skill from "./Skill";

export class Profile extends Identifiable {

  private level: number = 0;
  private currentExperience: number = 0;
  private skills: Skill[] = [];

  constructor(level?: number, currentExperience?: number, skills?: Skill[]) {
    super();
    this.level = level || 0;
    this.currentExperience = currentExperience || 0;
    this.skills = skills || [];
  }

  public serialize() {
    return JSON.stringify(this);
  }

  get Level() {
    return this.level;
  }

  get CurrentExperience() {
    return this.currentExperience;
  }

  get Skills() {
    return this.skills;
  }

}
