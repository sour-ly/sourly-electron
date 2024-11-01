import { Eventful } from '../event/events';
import Goal from './Goal';



type EventMap = {
  'levelUp': number;
  'experienceGained': number;
  'skillChanged': Skill;
  'goalAdded': Goal;
  'goalRemoved': Goal;
}

export type SkillProps = {
  name?: string;
  level?: number;
  currentExperience?: number;
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
  }

  private calculateExperienceRequired(level: number) {
    return Math.floor(50 * Math.pow(level, 2) - 150 * level + 200);
  }

  private listenToGoal(goal: Goal) {
    goal.on('completed', (goal) => {
      this.addExperience(25);
    });
  }


  private levelUp() {
    this.level++;
    this.currentExperience = 0;
    this.experienceRequired = this.calculateExperienceRequired(this.level);
    this.emit('levelUp', this.level);
  }

  private addExperience(experience: number) {
    this.currentExperience += experience;
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

  public addSkill(skill: Skill) {
    this.skills.push(skill);
    this.emit('skillAdded', { skills: this.skills, newSkill: skill });
  }

  public removeSkill(skill: Skill) {
    const index = this.skills.indexOf(skill);
    if (index !== -1) {
      this.skills.splice(index, 1);
      this.emit('skillRemoved', skill);
    }
  }

}
