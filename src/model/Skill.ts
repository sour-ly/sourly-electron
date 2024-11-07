import { Eventful } from '../event/events';
import { Log } from '../log/log';
import IPC from '../renderer/ReactIPC';
import Goal, { GoalProps } from './Goal';


export type Metric = 'units' | 'times' | '%' | 'pages' | 'chapters' | 'books' | 'articles' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' | 'lbs' | 'kg' | 'miles' | 'meters' | 'other' | string;

type EventMap = {
  'levelUp': { skill: Skill, level: number };
  'experienceGained': { skill: Skill, experience: number };
  'skillChanged': Skill;
  'goalAdded': Goal;
  'goalUpdated': Goal;
  'goalRemoved': Goal;
}

export type SkillProps = {
  id?: string;
  name?: string;
  level?: number;
  currentExperience?: number;
  goals?: GoalProps[];
}

export default class Skill extends Eventful<EventMap> {

  private experienceRequired: number;
  private goals: Goal[] = [];

  constructor(private name: string = "Untitled", private level: number = 1, private currentExperience: number = 0, goals: Goal[] = []) {
    super();
    this.experienceRequired = this.calculateExperienceRequired(level);
    goals.forEach(goal => {
      //why? because event listeners jackass
      this.addGoal(goal);
    });
    if (isNaN(this.currentExperience)) {
      this.currentExperience = 0;
    }
  }

  private calculateExperienceRequired(level: number) {
    //f = 50x^2 - 150x + 200 --> 50/3x^3 - 150/2z^2 + 200x
    return Math.floor(50 * Math.pow(level, 2) - 150 * level + 200);
  }

  private listenToGoal(goal: Goal) {
    goal.on('completed', (goal) => {
      this.addExperience(goal.Reward);
    });
    goal.on('goalProgressChanged', (args) => {
      const { amount, goal } = args;
      if (amount > 0) {
        this.addExperience(amount * (goal.Reward * .05));
      }
    });
  }


  private levelUp() {
    this.level++;
    this.currentExperience = 0;
    this.experienceRequired = this.calculateExperienceRequired(this.level);
    this.emit('levelUp', { skill: this, level: this.level });
  }

  private addExperience(experience: number) {
    if (isNaN(experience)) {
      Log.log('Skill:addExperience', 1, 'experience is NaN', experience);
      return;
    }
    this.currentExperience += experience;
    this.currentExperience = Math.floor(this.currentExperience * 1000) / 1000;
    if (this.currentExperience >= this.experienceRequired) {
      this.levelUp();
    }
    this.emit('experienceGained', { skill: this, experience: experience });
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

  /* add goals */
  public addGoal(goal: Goal) {
    this.goals.push(goal);
    this.listenToGoal(goal);
    this.emit('goalAdded', goal);
  }

  public removeGoal(goal: Goal) {
    const index = this.goals.indexOf(goal);
    if (index !== -1) {
      this.goals.splice(index, 1);
      this.emit('goalRemoved', goal);
    }
  }

  public updateGoal(goal_id: number, goal: Goal) {
    const index = this.goals.findIndex(goal => goal.Id === goal_id);
    if (index !== -1) {
      this.goals[index] = goal;
      this.emit('goalUpdated', goal);
      this.listenToGoal(goal);
    }
  }

  /* get total xp */
  public getTotalExperience() {
    //take the integral of the formula for max experience
    //f = 50x^2 - 150x + 200 --> 50/3x^3 - 150/2z^2 + 200x
    return Math.floor((50 / 3) * Math.pow(this.level, 3) - (150 / 2) * Math.pow(this.level, 2) + 200 * this.level);
  }

  /* Searialize */
  public toJSON() {
    return {
      name: this.name,
      level: this.level,
      currentExperience: this.currentExperience,
      goals: this.goals.map(goal => goal.toJSON())
    }
  }

}

export type SkillEventMap = {
  'skillAdded': { skills: Skill[], newSkill: Skill };
  'skillChanged': Skill;
  'onUpdates': { skills: Skill[] };
  'skillRemoved': Skill;
}

export abstract class SkillContainer<T extends SkillEventMap = SkillEventMap> extends Eventful<T> {
  protected skills: Skill[] = [];

  protected constructor() {
    super();
    this.skills.forEach(skill => {
      this.addSkillListeners(skill);
    });
    this.on('skillAdded', ({ newSkill }) => {
      this.emitUpdates();
      this.addSkillListeners(newSkill);
    });
    this.on('skillChanged', (skill) => {
      this.emitUpdates();
      this.addSkillListeners(skill);
    });
    this.on('skillRemoved', (skill) => {
      this.emitUpdates();
    });
    this.on('onUpdates', ({ skills }) => {
      IPC.sendMessage('storage-save', { key: 'skill', value: this.serializeSkills() });
      Log.log('skillManager:onUpdates', 0, 'saved skills to storage', this.serializeSkills());
    });
  }

  //this should be overriden
  protected emitUpdates() {
    this.emit('onUpdates', { skills: this.skills });
  }

  protected addSkillListeners(skill: Skill) {
    const listenToGoals = (goal: Goal) => {
      goal.on('goalProgressChanged', () => {
        this.emitUpdates();
      });
    }
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

  public addSkill(skill: Skill) {
    this.skills.push(skill);
    this.emit('skillAdded', { skills: this.skills, newSkill: skill });
  }

  public addSkillFromJSON(skill: SkillProps) {
    const n_skill = (new Skill(skill.name, skill.level, skill.currentExperience));
    if (skill.goals) {
      for (const goal of skill.goals) {
        n_skill.addGoal(new Goal(goal.name, goal.description, goal.progress, goal.reward ?? 0, goal.metric, goal.target, goal.completed));
      }
    }
    this.addSkill(n_skill);
  }

  public updateSkill(skill_id: number, new_skill: SkillProps) {
    const index = this.skills.findIndex(skill => skill.Id === skill_id);
    if (index !== -1 && new_skill.name) {
      this.skills[index].Name = new_skill.name;
      this.emit('skillChanged', this.skills[index]);
      return true;
    } else {
      Log.log('skillManager:updateSkill', 1, 'skill not found', skill_id);
      return false;
    }
  }

  public removeSkill(skill: Skill) {
    const index = this.skills.indexOf(skill);
    if (index !== -1) {
      this.skills.splice(index, 1);
      this.emit('skillRemoved', skill);
    }
  }

  public getSkillById(id: number) {
    return this.skills.find(skill => skill.Id === id);
  }

  private serializeSkills() {
    return this.skills.map(skill => skill.toJSON());
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
