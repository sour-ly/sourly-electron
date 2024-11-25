import { APIMethods } from "../api/api";
import { Authentication } from "../api/auth";
import { Log } from "../log/log";
import { SourlyFlags } from "../renderer";
import IPC from "../renderer/ReactIPC";
import Skill, { SkillContainer, SkillEventMap } from "./Skill";

type SkillEventMapOverride = {
  'onUpdates': { profile: Profile, skills: Skill[] };
  'profilelevelUp': { profile: Profile, level: number };

} & Omit<SkillEventMap, 'onUpdates'>

export interface ProfileSkeleton {
  name: string;
  level: number;
  currentExperience: number;
  version: string;
  flags: SourlyFlags;
}

export class Profile extends SkillContainer<SkillEventMapOverride> {

  private level: number = 1;
  private currentExperience: number = 0;

  constructor(private name: string = "User", level?: number, currentExperience?: number, skills?: Skill[], private version: string = "0.0.0", private flags: SourlyFlags = SourlyFlags.NULL) {
    super();
    this.level = level || 1;
    this.currentExperience = currentExperience || 0;
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
    this.skills = skills || [];
    console.log('Profile:constructor', this.serialize());
    this.on('skillCreated', ({ newSkill }) => {
      if (!newSkill) return;
      APIMethods.saveSkills(newSkill.toJSON(), 'create').then((r) => {
        if (r) {
          if (Authentication.getOfflineMode()) {
            Log.log('Profile:onUpdates::saveSkills', 0, 'saved skills to storage', this.serialize());
          } else {
            Log.log('Profile:onUpdates::saveSkills', 0, 'saved skills to online', this.serialize());
          }
        } else {
          //need to refresh or retry
          Log.log('Profile:onUpdates::saveSkills', 1, 'failed to save skills to storage', this.serialize());
        }
      });
    });
    this.on('skillAdded', ({ newSkill }) => {
      if (!newSkill) return;
      /*
      APIMethods.saveSkills(newSkill.toJSON(), 'create').then((r) => {
        if (r) {
          if (Authentication.getOfflineMode()) {
            Log.log('Profile:onUpdates::saveSkills', 0, 'saved skills to storage', this.serialize());
          } else {
            Log.log('Profile:onUpdates::saveSkills', 0, 'saved skills to online', this.serialize());
          }
        } else {
          //need to refresh or retry
          Log.log('Profile:onUpdates::saveSkills', 1, 'failed to save skills to storage', this.serialize());
        }
      });
      */
    });
    this.on('onUpdates', () => {
      console.log('Profile:onUpdates', this.serialize());
      APIMethods.saveProfile(this.serialize());
      if (Authentication.getOfflineMode()) {
        Log.log('Profile:onUpdates', 0, 'saved profile to storage', this.serialize());
        APIMethods.saveSkills(this.serializeSkills());
      }

      //IPC.sendMessage('storage-save', { key: 'profile', value: this.serialize() });
    });

  }

  override addSkillListeners(skill: Skill) {
    super.addSkillListeners(skill);
    skill.on('levelUp', (arg) => {
      this.addExperience(arg.level * 1.5)
    });
    skill.on('experienceGained', (arg) => {
      this.addExperience(arg.experience * .6);
    });
  }

  override emitUpdates() {
    if ((this.flags & SourlyFlags.IGNORE)) {
      console.log('Profile:emitUpdates', this.serialize(), this);
    } else {
      this.emit('onUpdates', { profile: this, skills: this.skills });
    }
  }

  public calculateMaxExperience() {
    return 100 * this.level + (Math.pow(this.level - 1, 2) * 5);
  }

  private addExperience(experience: number) {
    this.currentExperience += experience;
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
    while (this.currentExperience >= this.calculateMaxExperience()) {
      Log.log('Profile:addExperience', 0, 'leveling up', this.level);
      this.emit('profilelevelUp', { profile: this, level: this.level + 1 });
      this.level++;
      this.currentExperience -= this.calculateMaxExperience();
    }
    if (this.currentExperience < 0) {
      this.currentExperience = Math.abs(this.currentExperience);
    }
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
  }

  public adjustProfileToSkills() {
    for (const skill of this.skills) {
      this.addExperience(skill.getTotalExperience() * .6);
      this.addExperience(skill.Level * 1.5);
    }
  }


  get Name() {
    return this.name;
  }

  get Version() {
    return this.version;
  }

  // this setter will be used to update the profile name, but do not ever call it directly when the API comes out
  set Name(name: string) {
    this.name = name;
    this.emitUpdates();
  }

  set Version(version: string) {
    this.version = version;
    this.emitUpdates();
  }

  set Level(level: number) {
    this.level = level;
  }

  set CurrentExperience(currentExperience: number) {
    this.currentExperience = currentExperience;
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

  get Flags() {
    return this.flags;
  }

  set Flags(flags: SourlyFlags) {
    this.flags = flags;
    this.emitUpdates();
  }

  public serialize() {
    return {
      name: this.name,
      level: this.level,
      currentExperience: this.currentExperience,
      version: this.version,
      flags: this.flags,
    }
  }

}
