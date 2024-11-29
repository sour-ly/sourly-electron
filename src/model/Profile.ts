import { APIMethods } from '../api/api';
import { Authentication } from '../api/auth';
import { Log } from '../log/log';
import { SourlyFlags } from '../renderer';
import IPC from '../renderer/ReactIPC';
import Skill, { SkillContainer, SkillEventMap } from './Skill';

type SkillEventMapOverride = {
  onUpdates: { profile: Profile; skills: Skill[] };
  profilelevelUp: { profile: Profile; level: number };
} & Omit<SkillEventMap, 'onUpdates'>;

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

  constructor(
    private name: string = 'User',
    level?: number,
    currentExperience?: number,
    skills?: Skill[],
    private version: string = '0.0.0',
    private flags: SourlyFlags = SourlyFlags.NULL,
  ) {
    super();
    this.level = level || 1;
    this.currentExperience = currentExperience || 0;
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
    this.skills = skills || [];
    console.log('Profile:constructor', this.serialize());

    //@TODO Move this some where else other than the constructor...

    //this block of code acts an example so please follow along for the absorb functionality.
    this.on('skillCreated', async ({ newSkill, absorb }) => {
      //if newSkill is null return
      if (!newSkill) return;
      //try to save the skills through the API abstraction layer (offline or online)
      const r = await APIMethods.saveSkills(newSkill.toJSON(), 'create');
      if (r) { // if the save was successful
        if (Authentication.getOfflineMode()) { // -- if offline mode is enabled - this is literally only for logs
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'saved skills to storage',
            this.serialize(),
          );
        } else { // -- this is for online mode
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'saved skills to online',
            this.serialize(),
          );
        }

      } else { // if the save was unsuccessful
        // need to refresh or retry
        Log.log(
          'Profile:onUpdates::saveSkills',
          1,
          'failed to save skills to storage',
          this.serialize(),
        );
        absorb(); // absorb the action so it doesn't actually get pushed to the frontend. Please see the Skill.ts file for the absorb function.
      }
    });
    this.on('skillAdded', ({ newSkill }) => {
      if (!newSkill) return;
      this.emitUpdates();
    });
    this.on('onUpdates', () => {
      console.log('Profile:onUpdates', this.serialize());
      APIMethods.saveProfile(this.serialize());
      if (Authentication.getOfflineMode()) {
        Log.log(
          'Profile:onUpdates',
          0,
          'saved profile to storage',
          this.serialize(),
        );
        APIMethods.saveSkills(this.serializeSkills());
      }
      // IPC.sendMessage('storage-save', { key: 'profile', value: this.serialize() });
    });
  }

  override addSkillListeners(skill: Skill) {
    super.addSkillListeners(skill);
    skill.on('levelUp', (arg) => {
      this.addExperience(arg.level * 1.5);
    });
    skill.on('experienceGained', (arg) => {
      this.addExperience(arg.experience * 0.6);
    });
    skill.on('goalAdded', goal => {
      //just handle the goalAdded event
      console.log('Profile:addSkillListeners::goalAdded', goal);
      this.emitUpdates();
    });
    /* Really limited to online stuff */
    skill.on('goalCreated', ({ newGoal, absorb }) => {
      APIMethods.addGoal(skill.Id, newGoal.toJSON()).then((r) => {
        if (r) {
          Log.log(
            'Profile:addSkillListeners::addGoal',
            0,
            'added goal to online',
            newGoal.toJSON(),
          );
        } else {
          Log.log(
            'Profile:addSkillListeners::addGoal',
            1,
            'failed to add goal to online',
            newGoal.toJSON(),
          );
          // absorb the action so it doesn't actually get pushed to the frontend
          absorb();
        }
      });
    });
    skill.on('goalRemoved', (goal) => {
      APIMethods.removeGoal(goal.Id).then((r) => {
        // TODO: remove goal from skill and have a fallback where it will retry or undo the action
        if (r) {
          Log.log(
            'Profile:addSkillListeners::removeGoal',
            0,
            'removed goal from online',
            goal.toJSON(),
          );
        } else {
          Log.log(
            'Profile:addSkillListeners::removeGoal',
            1,
            'failed to remove goal from online',
            goal.toJSON(),
          );
        }
      });
    });
    skill.on('goalProgressChanged', async ({ goal, amount, absorb }) => {
      if (Authentication.getOfflineMode()) {
        return;
      }
      if (amount < 0) {
        absorb();
      }
      const r = await APIMethods.incrementGoal(goal.Id);
      if (r === true) return;
      if (!("error" in r)) {
        Log.log(
          'Profile:addSkillListeners::incrementGoal',
          0,
          'incremented goal online',
          goal.toJSON(),
        );
      } else {
        Log.log(
          'Profile:addSkillListeners::incrementGoal',
          1,
          'failed to increment goal online - %s',
          r.error,
          goal.toJSON(),
        );
        absorb();
      }

    });
  }

  override emitUpdates() {
    if (this.flags & SourlyFlags.IGNORE) {
      console.log('Profile:emitUpdates::IGNORED', this.serialize(), this);
    } else {
      this.emit('onUpdates', { profile: this, skills: this.skills });
    }
  }

  public calculateMaxExperience() {
    return 100 * this.level + (this.level - 1) ** 2 * 5;
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
      this.addExperience(skill.getTotalExperience() * 0.6);
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

  set Skills(skills: Skill[]) {
    this.skills = [];
    for (const skill of skills) {
      this.addSkill(skill, false);
    }
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
    };
  }
}
