import { Eventful } from '../event/events';
import { Log } from '../log/log';
import IPC from '../renderer/ReactIPC';
import Goal, { GoalProps } from './Goal';



type EventMap = {
  'levelUp': number;
  'experienceGained': number;
  'skillChanged': Skill;
  'goalAdded': Goal;
  'goalUpdated': Goal;
  'goalRemoved': Goal;
}

export type SkillProps = {
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
    this.emit('levelUp', this.level);
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
    this.emit('experienceGained', experience);
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

type SkillEventMap = {
  'skillAdded': { skills: Skill[], newSkill: Skill };
  'onUpdates': { skills: Skill[] };
  'skillRemoved': Skill;
}

export class SkillManager extends Eventful<SkillEventMap> {
  private skills: Skill[] = [];
  private static instance: SkillManager | undefined;

  private constructor() {
    super();
    this.skills.forEach(skill => {
      this.addSkillListeners(skill);
    });
    this.on('skillAdded', ({ newSkill }) => {
      this.emit('onUpdates', { skills: this.skills });
      this.addSkillListeners(newSkill);
    });
    this.on('skillRemoved', (skill) => {
      this.emit('onUpdates', { skills: this.skills });
    });
    this.on('onUpdates', ({ skills }) => {
      IPC.sendMessage('storage-save', { key: 'skill', value: this.serializeSkills() });
      Log.log('skillManager:onUpdates', 0, 'saved skills to storage', this.serializeSkills());
    });
  }

  private addSkillListeners(skill: Skill) {

    const listenToGoals = (goal: Goal) => {
      goal.on('goalProgressChanged', () => {
        this.emit('onUpdates', { skills: this.skills });
      });
    }
    skill.on('goalAdded', (goal) => {
      listenToGoals(goal);
      this.emit('onUpdates', { skills: this.skills });
    });
    skill.on('goalUpdated', (goal) => {
      listenToGoals(goal);
      this.emit('onUpdates', { skills: this.skills });
    });
    skill.on('goalRemoved', (goal) => {
      this.emit('onUpdates', { skills: this.skills });
    });
    skill.on('levelUp', (level) => {
      this.emit('onUpdates', { skills: this.skills });
    });
    skill.on('experienceGained', (experience) => {
      this.emit('onUpdates', { skills: this.skills });
    });

    skill.Goals.forEach(listenToGoals);
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SkillManager();
    }
    return this.instance;
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
