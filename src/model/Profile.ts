import { APIMethods } from '../api/api';
import { Authentication } from '../api/auth';
import { Log } from '../log/log';
import { profileobj, SourlyFlags } from '../renderer';
import IPC from '../renderer/ReactIPC';
import Goal, { GoalProps } from './Goal';
import Skill, { SkillContainer, SkillEventMap, SkillProps } from './Skill';

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


namespace ProfileEvents {
  export namespace Absorbable {
    export async function skillCreated({ newSkill }: { newSkill: Skill }) {
      if (!newSkill || Authentication.getOfflineMode()) return false;
      const r = await APIMethods.saveSkills(newSkill.toJSON(), 'create');
      if (r == true) return false;
      else if (r === false) {
        return true;
      }
      if (!("error" in r)) {
        if (Authentication.getOfflineMode()) {
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'saved skills to storage'
          );
        } else {
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'saved skills to online',
          );
          newSkill.changeId(r.id);
        }
        return false;
      } else {
        Log.log(
          'Profile:onUpdates::saveSkills',
          1,
          'failed to save skills to storage'
        );
        return true;
      }
    }

    export async function skillChanged({ skill, newSkill }: { skill: Skill, newSkill: SkillProps }) {
      if (!newSkill) return true;
      const r = await APIMethods.saveSkills({ id: skill.Id, name: newSkill.name }, 'update');
      if (r == true) return false;
      if (!("error" in r)) {
        if (Authentication.getOfflineMode()) {
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'updated skills in storage',
          );
        } else {
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'updated skills in online',
          );
        }
        return false;
      } else {
        Log.log(
          'Profile:onUpdates::saveSkills',
          1,
          'failed to update skills in storage',
        );
        return true;
      }
    }

    export async function skillRemoved({ newSkill }: { newSkill: Skill }) {
      if (!newSkill) return true;
      const r = await APIMethods.saveSkills(newSkill.toJSON(), 'delete');
      if (r == true) return false;
      if (r) {
        if (Authentication.getOfflineMode()) {
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'removed skills from storage',
          );
        } else {
          Log.log(
            'Profile:onUpdates::saveSkills',
            0,
            'removed skills from online',
          );
        }
        return false;
      } else {
        Log.log(
          'Profile:onUpdates::saveSkills',
          1,
          'failed to remove skills from storage',
        );
        return true;
      }
    }

    /* GOAL STUFF */
    export async function goalCreated(skill: Skill, { newGoal }: { newGoal: Goal }) {
      return await APIMethods.addGoal(skill.Id, newGoal.toJSON()).then((r) => {
        if (r === true) return false;
        if ("error" in r) {
          Log.log(
            'Profile:addSkillListeners::addGoal',
            1,
            'failed to add goal to online - %s',
            r.error,
          );
          return true;
        }
        if (r) {
          Log.log(
            'Profile:addSkillListeners::addGoal',
            0,
            'added goal to online',
            newGoal.toJSON(),
          );
          newGoal.changeId(r.skill.goals.slice(-1)[0].id);
        } else {
          Log.log(
            'Profile:addSkillListeners::addGoal',
            1,
            'failed to add goal to online',
            newGoal.toJSON(),
          );
          // absorb the action so it doesn't actually get pushed to the frontend
          return true;
        }
        return false;
      });
    }

    export async function goalUpdated(skill: Skill, { goal, newGoal }: { goal: Goal; newGoal: GoalProps }) {
      return await APIMethods.updateGoal(Number(newGoal.id) ?? 0, skill.Id, newGoal).then((r) => {
        if (r === true) return false;
        if ("error" in r) {
          Log.log(
            'Profile:addSkillListeners::updateGoal',
            1,
            'failed to update goal online - %s',
            r.error,
          );
          return true;
        }
        if (r) {
          Log.log(
            'Profile:addSkillListeners::updateGoal',
            0,
            'updated goal online',
            newGoal,
          );
        } else {
          Log.log(
            'Profile:addSkillListeners::updateGoal',
            1,
            'failed to update goal online',
            newGoal,
          );
          // absorb the action so it doesn't actually get pushed to the frontend
          return true;
        }
        return false;
      });
    }

    export async function goalProgressChanged(skill: Skill, { goal, amount }: { goal: Goal; amount: number }) {
      return await APIMethods.incrementGoal(goal.Id, skill.Id).then((r) => {
        if (r === true) return false;
        if ("error" in r) {
          Log.log(
            'Profile:addSkillListeners::incrementGoal',
            1,
            'failed to increment goal online - %s',
            r.error,
          );
          return true;
        }
        if (r) {
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
            'failed to increment goal online',
            goal.toJSON(),
          );
          // absorb the action so it doesn't actually get pushed to the frontend
          return true;
        }
        return false;
      });
    }

    export async function goalRemoved(skill: Skill, goal: Goal) {
      return await APIMethods.removeGoal(goal.Id, skill.Id).then((r) => {
        if (r === true) return false;
        if ("error" in r) {
          Log.log(
            'Profile:addSkillListeners::removeGoal',
            1,
            'failed to remove goal online - %s',
            r.error,
          );
          return true;
        }
        if (r) {
          Log.log(
            'Profile:addSkillListeners::removeGoal',
            0,
            'removed goal online',
            goal.toJSON(),
          );
        } else {
          Log.log(
            'Profile:addSkillListeners::removeGoal',
            1,
            'failed to remove goal online',
            goal.toJSON(),
          );
          // absorb the action so it doesn't actually get pushed to the frontend
          return true;
        }
        return false;
      });
    }
  }

  export namespace Normal {
    export async function skillAdded(profile: Profile, { newSkill }: { newSkill: Skill }) {
      if (!newSkill) return;
      profile.emitUpdates();
    }

    export async function onUpdates(profile: Profile) {
      if (Authentication.getOfflineMode()) {
        Log.log(
          'Profile:onUpdates',
          0,
          'saved profile to storage',
          profile,
        );
        APIMethods.saveProfile(profile.serialize());
        APIMethods.saveSkills(profile.serializeSkills());
      }
      // IPC.sendMessage('storage-save', { key: 'profile', value: profile.serialize() });
    }

    export async function experienceGained(profile: Profile) {
      if (Authentication.getOfflineMode()) {
        await APIMethods.saveSkills(profile.serializeSkills(), "update");
      }
      return;
    }

  }

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
    this.absorbableOn('skillCreated', ProfileEvents.Absorbable.skillCreated);
    this.absorbableOn('skillChanged', ProfileEvents.Absorbable.skillChanged);
    this.absorbableOn('skillRemoved', ProfileEvents.Absorbable.skillRemoved);

    //skill added
    this.on('skillAdded', ProfileEvents.Normal.skillAdded.bind(null, this));
    this.on('onUpdates', ProfileEvents.Normal.onUpdates.bind(null, this));
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
      console.log('Profile:addSkillListeners::goalAdded', goal)
      this.emitUpdates();
    });
    /* Really limited to online stuff */
    //goalCreated
    skill.absorbableOn('goalCreated', ProfileEvents.Absorbable.goalCreated.bind(null, skill))
    //goalRemoved
    skill.absorbableOn('goalRemoved', ProfileEvents.Absorbable.goalRemoved.bind(null, skill));
    //goalUpdated
    skill.absorbableOn('goalUpdated', ProfileEvents.Absorbable.goalUpdated.bind(null, skill));
    skill.listenToGoalAbsorb('goalProgressChanged', ProfileEvents.Absorbable.goalProgressChanged.bind(null, skill));
    skill.on('experienceGained', ProfileEvents.Normal.experienceGained.bind(null, this));
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

  set NameEventless(name: string) {
    this.name = name;
  }

  set Version(version: string) {
    this.version = version;
    this.emitUpdates();
  }

  set VersionEventless(version: string) {
    this.version = version;
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

  set FlagsEventless(flags: SourlyFlags) {
    this.flags = flags;
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
