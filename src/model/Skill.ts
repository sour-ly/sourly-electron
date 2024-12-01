import { APIMethods } from '../api/api';
import { Authentication } from '../api/auth';
import { Eventful } from '../event/events';
import Identifiable from '../id/id';
import { Log } from '../log/log';
import IPC from '../renderer/ReactIPC';
import Goal, { GoalProps } from './Goal';

export type Metric =
  | 'units'
  | 'times'
  | '%'
  | 'pages'
  | 'chapters'
  | 'books'
  | 'articles'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years'
  | 'lbs'
  | 'kg'
  | 'miles'
  | 'meters'
  | 'other'
  | string;

type EventMap = {
  levelUp: { skill: Skill; level: number };
  experienceGained: { skill: Skill; experience: number } & Absorbable;
  experienceGainedFinal: { skill: Skill; experience: number };
  skillChanged: Skill;
  goalAdded: Goal;
  goalCreated: { newGoal: Goal } & Absorbable;
  goalCreatedFinal: { skills: Skill; newGoal: Goal };
  goalUpdated: Goal;
  goalProgressChanged: { amount: number; goal: Goal; } & Absorbable<{ progress: number, completed: boolean, target: number }>;
  goalProgressChangedFinal: { amount: number; goal: Goal };
  goalRemoved: Goal;
};

export type SkillProps = {
  id?: string;
  name?: string;
  level?: number;
  currentExperience?: number;
  goals?: GoalProps[];
};

export default class Skill extends Eventful<EventMap> {
  private experienceRequired: number;

  private goals: Goal[] = [];

  constructor(
    private name: string = 'Untitled',
    private level: number = 1,
    private currentExperience: number = 0,
    goals: Goal[] = [],
  ) {
    super();
    this.experienceRequired = this.calculateExperienceRequired(level);
    goals.forEach((goal) => {
      // why? because event listeners jackass
      this.addGoal(goal);
    });
    if (isNaN(this.currentExperience)) {
      this.currentExperience = 0;
    }
  }

  private calculateExperienceRequired(level: number) {
    // f = 50x^2 - 150x + 200 --> 50/3x^3 - 150/2z^2 + 200x
    return Math.floor(50 * level ** 2 - 150 * level + 200);
  }

  private listenToGoal(goal: Goal) {
    goal.on('completed', (goal) => {
      this.addExperience(goal.Reward);
    });
    goal.on('goalProgressChangedFinal', async (args) => {
      this.emit('goalProgressChangedFinal', args);
    });
    goal.on('goalProgressChanged', async (args) => {
      let absorbed = false;
      const p = new Promise((resolve) => {
        const fn = () => {
          if (absorbed) {
            resolve(false);
            return;
          }
          const { amount, goal, revertCompletion } = args;
          if (goal.Completed && !revertCompletion) {
          } else if (revertCompletion) {
            this.addExperience(-goal.Reward);
          } else this.addExperience(amount * (goal.Reward * 0.05));
          resolve(true);
        };
        this.emit('goalProgressChanged', {
          goal: args.goal, optimisticValue: args.optimisticValue, amount: args.amount, absorb: () => {
            absorbed = true;
            args.absorb();
          }
        }, fn);
      });
    });
  }

  private levelUp() {
    this.level++;
    this.experienceRequired = this.calculateExperienceRequired(this.level);
    this.emit('levelUp', { skill: this, level: this.level });
  }

  private levelDown() {
    // go down a level
    if (this.level <= 1) {
      return;
    }
    // go down a alevel
    this.level--;
    // reset the max experience
    this.experienceRequired = this.calculateExperienceRequired(this.level);
  }

  private async addExperience(experience: number) {
    if (isNaN(experience)) {
      Log.log('Skill:addExperience', 1, 'experience is NaN', experience);
      return;
    }

    let absorbed = false;

    const p = new Promise((resolve) => {
      const fn = () => {
        if (absorbed) {
          resolve(false);
          return;
        }
        this.currentExperience += experience;
        this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
        if (this.currentExperience >= this.experienceRequired) {
          // check if we need to level up still
          while (this.currentExperience >= this.experienceRequired) {
            this.currentExperience -= this.experienceRequired;
            this.levelUp();
          }
        } else if (this.currentExperience < 0) {
          // should give us the experience we need to get to the previous level
          this.levelDown();
          this.currentExperience = this.experienceRequired + this.currentExperience;
          // check if we need to go down another level
          while (this.currentExperience < 0) {
            if (this.level <= 1) {
              this.currentExperience = 0;
              break;
            }
            this.levelDown();
            this.currentExperience =
              this.experienceRequired + this.currentExperience;
          }
        }
        resolve(true);
        this.emit('experienceGainedFinal', { skill: this, experience });
      }
      this.emit('experienceGained', { skill: this, experience, absorb: () => { absorbed = true } }, fn);
    });

    return await p;
  }

  public get Name() {
    return this.name;
  }

  public get Level() {
    return this.level;
  }

  public get CurrentExperience() {
    return this.currentExperience;
  }

  public get Goals() {
    return this.goals;
  }

  public get ExperienceRequired() {
    return this.experienceRequired;
  }

  public get Progress() {
    return this.currentExperience / this.experienceRequired;
  }

  /* setters */

  public set Name(args: string) {
    this.name = args;
  }

  /* add goals -- this function is absorbable */
  public async addGoal(goal: Goal, create: boolean = false) {

    //have an outside variable to check if the event was absorbed
    let absorbed = false;

    //create a promise that will resolve if the event was absorbed
    const p = await new Promise((resolve) => {
      const fn = () => {
        if (absorbed) {
          resolve(false);
          return;
        }
        //push the goal and trigger the event
        this.goals.push(goal);
        this.listenToGoal(goal);
        this.emit('goalAdded', goal);
        if (create) {
          this.emit('goalCreatedFinal', { skills: this, newGoal: goal });
        }
        resolve(true);
      }
      if (create) {
        this.emit('goalCreated', {
          newGoal: goal,
          absorb: () => {
            //if the event is absorbed, then we do not push the goal
            absorbed = true;
          }
        }, fn);
      } else {
        fn();
        this.emit('goalAdded', goal);
      }
    });
    //allow this function to be awaited
    return p;
  }

  public removeGoal(goal: Goal) {
    const index = this.goals.indexOf(goal);
    if (index !== -1) {
      this.goals.splice(index, 1);
      this.emit('goalRemoved', goal);
    }
  }

  public updateGoal(goal_id: number, goal: Goal) {
    const index = this.goals.findIndex((goal) => goal.Id === goal_id);
    if (index !== -1) {
      this.goals[index] = goal;
      this.emit('goalUpdated', goal);
      this.listenToGoal(goal);
    }
  }

  /* get total xp */
  public getTotalExperience() {
    // take the integral of the formula for max experience
    // f = 50x^2 - 150x + 200 --> 50/3x^3 - 150/2z^2 + 200x
    return Math.floor(
      (50 / 3) * this.level ** 3 -
      (150 / 2) * this.level ** 2 +
      200 * this.level,
    );
  }

  /* Searialize */
  public toJSON() {
    return {
      id: this.Id,
      name: this.name,
      level: this.level,
      currentExperience: this.currentExperience,
      goals: this.goals.map((goal) => goal.toJSON()),
    };
  }
}

export type Absorbable<T = any> = {
  absorb: () => void;
  optimisticValue?: T;
};

export type SkillEventMap = {
  skillCreated: { newSkill: Skill } & Absorbable<SkillProps>;
  skillCreatedFinal: { skills: Skill[]; newSkill: Skill };
  skillAdded: { skills: Skill[]; newSkill: Skill };
  skillChanged: Skill;
  onUpdates: { skills: Skill[] };
  skillRemoved: { newSkill: Skill } & Absorbable<SkillProps>;
};

export abstract class SkillContainer<
  T extends SkillEventMap = SkillEventMap,
> extends Eventful<T> {
  protected skills: Skill[] = [];

  protected constructor() {
    super();
    if (this.skills.length > 0) {
      this.skills.forEach((skill) => {
        this.addSkillListeners(skill);
      });
    }
    this.on('skillCreated', ({ newSkill }) => {
      this.addSkillListeners(newSkill);
    });
    this.on('skillAdded', ({ newSkill }) => {
      this.emitUpdates();
      this.addSkillListeners(newSkill);
    });
    this.on('skillChanged', (skill) => {
      this.emitUpdates();
      this.addSkillListeners(skill);
    });
    this.on('onUpdates', ({ skills }) => {
      // IPC.sendMessage('storage-save', { key: 'skill', value: this.serializeSkills() });
    });
  }

  // this should be overriden
  protected emitUpdates() {
    this.emit('onUpdates', { skills: this.skills });
  }

  protected addSkillListeners(skill: Skill) {
    const listenToGoals = (goal: Goal) => {
      goal.on('goalProgressChanged', () => {
        this.emitUpdates();
      });
    };
    skill.on('goalAdded', (goal) => {
      listenToGoals(goal);
      this.emitUpdates();
    });
    skill.on('goalUpdated', (goal) => {
      listenToGoals(goal);
      this.emitUpdates();
    });
    skill.on('goalRemoved', (goal) => {
      this.emitUpdates();
    });
    skill.on('levelUp', (level) => {
      this.emitUpdates();
    });
    skill.on('experienceGained', (experience) => {
      this.emitUpdates();
    });

    skill.Goals.forEach(listenToGoals);
  }

  public get Skills() {
    return this.skills;
  }

  /* skill methods */

  //this function is absorable
  public async addSkill(skill: Skill, create: boolean = true) {
    const p = new Promise((resolve) => {
      // lets abstract this to the API
      let absorbed = false;
      // fn gets called after the event is emitted emit(obj, this function)
      const fn = () => {
        if (absorbed) {
          resolve(false);
        } else {
          this.skills.push(skill);
          resolve(true);
          this.emitUpdates();
        }
      };
      if (create) {
        //emit an event that can be absorbed
        this.emit(
          'skillCreated',
          {
            newSkill: skill,
            absorb: () => {
              absorbed = true;
            },
          },
          fn,
        );
      } else {
        fn();
        this.emit('skillAdded', { skills: this.skills, newSkill: skill });
      }
    });
    return p;
  }

  public addSkillFromJSON(skill: SkillProps) {
    const n_skill = SkillManager.castSkillFromJSON(skill);
    this.addSkill(n_skill, false);
  }

  public static castSkillFromJSON(skill: SkillProps) {
    const n_skill = new Skill(skill.name, skill.level, skill.currentExperience);
    n_skill.changeId(Number(skill.id ?? Identifiable.newId()));
    if (skill.goals) {
      for (const goal of skill.goals) {
        const n_goal = new Goal(
          goal.name,
          goal.description,
          goal.progress,
          goal.reward ?? 0,
          goal.metric,
          goal.target,
          goal.completed,
        );
        n_goal.changeId(Number(goal.id ?? Identifiable.newId()));
        n_skill.addGoal(n_goal, false);
      }
    }
    return n_skill;
  }

  public updateSkill(skill_id: number, new_skill: SkillProps) {
    const index = this.skills.findIndex((skill) => skill.Id === skill_id);
    if (index !== -1 && new_skill.name) {
      this.skills[index].Name = new_skill.name;
      this.emit('skillChanged', this.skills[index]);
      return true;
    }
    Log.log('skillManager:updateSkill', 1, 'skill not found', skill_id);
    return false;
  }

  public async removeSkill(skill: Skill) {
    const p = new Promise((resolve) => {
      let absorbed = false;
      const fn = () => {
        if (absorbed) {
          resolve(false);
          return;
        }
        const index = this.skills.indexOf(skill);
        if (index !== -1) {
          this.skills.splice(index, 1);
          this.emitUpdates();
        }
        resolve(true);
      };
      this.emit('skillRemoved', { newSkill: skill, absorb: () => { absorbed = true } }, fn);
    });
    return await p;
  }

  public getSkillById(id: number) {
    return this.skills.find((skill) => skill.Id === id);
  }

  protected serializeSkills() {
    return this.skills.map((skill) => skill.toJSON());
  }
}

export class SkillManager extends SkillContainer {
  private static instance: SkillManager | undefined;

  private constructor() {
    super();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SkillManager();
    }
    return this.instance;
  }
}
