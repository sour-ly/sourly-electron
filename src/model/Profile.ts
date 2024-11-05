import Identifiable from "../id/id";
import { Log } from "../log/log";
import Skill, { SkillContainer } from "./Skill";

export class Profile extends SkillContainer {

  private level: number = 0;
  private currentExperience: number = 0;

  constructor(level?: number, currentExperience?: number, skills?: Skill[]) {
    super();
    this.level = level || 0;
    this.currentExperience = currentExperience || 0;
    this.skills = skills || [];
  }

  override addSkillListeners(skill: Skill) {
    super.addSkillListeners(skill);
    skill.on('levelUp', (arg) => {
      this.addExperience(arg.level * 25)
    });
    skill.on('experienceGained', (arg) => {
      this.addExperience(arg.experience * .6);
    });
  }

  public serialize() {
    return JSON.stringify(this);
  }

  private calculateMaxExperience() {
    return 100 * this.level + (Math.pow(this.level - 1, 2) * 5);
  }

  private addExperience(experience: number) {
    this.currentExperience += experience;
    if (this.currentExperience >= this.calculateMaxExperience()) {
      Log.log('Profile:addExperience', 0, 'leveling up', this.level);
      this.level++;
      this.currentExperience = 0;
    }
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
