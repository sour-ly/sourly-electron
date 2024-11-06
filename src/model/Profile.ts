import { Log } from "../log/log";
import IPC from "../renderer/ReactIPC";
import Skill, { SkillContainer, SkillEventMap } from "./Skill";

type SkillEventMapOverride = {
  'onUpdates': { profile: Profile, skills: Skill[] };
  'profilelevelUp': { profile: Profile, level: number };

} & Omit<SkillEventMap, 'onUpdates'>

export class Profile extends SkillContainer<SkillEventMapOverride> {

  private level: number = 0;
  private currentExperience: number = 0;

  constructor(private name: string = "User", level?: number, currentExperience?: number, skills?: Skill[]) {
    super();
    this.level = level || 0;
    this.currentExperience = currentExperience || 0;
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
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
    this.on('onUpdates', () => {
      IPC.sendMessage('storage-save', { key: 'profile', value: this.serialize() });
    });
  }

  override emitUpdates() {
    this.emit('onUpdates', { profile: this, skills: this.skills });
  }


  public serialize() {
    return JSON.stringify({ level: this.level, currentExperience: this.currentExperience });
  }

  public calculateMaxExperience() {
    return 100 * this.level + (Math.pow(this.level - 1, 2) * 5);
  }

  private addExperience(experience: number) {
    this.currentExperience += experience;
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
    if (this.currentExperience >= this.calculateMaxExperience()) {
      Log.log('Profile:addExperience', 0, 'leveling up', this.level);
      this.emit('profilelevelUp', { profile: this, level: this.level + 1 });
      this.level++;
      this.currentExperience = 0;
    }
  }

  public adjustProfileToSkills() {
    for (const skill of this.skills) {
      this.addExperience(skill.CurrentExperience * .6);
      this.addExperience(skill.Level * 25);
    }
  }


  get Name() {
    return this.name;
  }

  // this setter will be used to update the profile name, but do not ever call it directly when the API comes out
  set Name(name: string) {
    this.name = name;
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
