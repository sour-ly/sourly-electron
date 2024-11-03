import Skill from "../../model/Skill";
import './styles/skillview.scss';
import GoalView from "./GoalView";
import { useWindow } from "../App";
import Input from "../components/Input";
import Goal, { GoalProps } from "../../model/Goal";
import { useEffect, useState } from "react";
import { useStateUtil } from "../util/state";
import ProgressBar from "../components/ProgressBar";
import toRomanNumerals from "../util/roman";
import { GoalPopUpWrapper } from "./popup/GoalPopup";
import { SkillDeletePopUp } from "./popup/SkillPopup";


const sort_goals_by_completion = (a: { Completed: boolean }, b: { Completed: boolean }) => {
  if (a.Completed && b.Completed) return 0;
  if (!a.Completed && b.Completed) return -1;
  if (a.Completed && !b.Completed) return 1;
  return 0;
}



export function SkillView({ skill }: { skill: Skill }) {

  const ctx = useWindow();

  useEffect(() => {
    const i = skill.on('levelUp', (arg) => {
      ctx.notification.notify(`You have leveled up ${skill.Name} to level ${toRomanNumerals(skill.Level)}`);
    });

    return () => {
      skill.off('levelUp', i);
    }
  }, [])

  return (
    <div className="skillview">
      <div className="skillview__title">
        <h1>{skill.Name} {toRomanNumerals(skill.Level)}: {skill.CurrentExperience} EXP</h1>
        <ProgressBar max={skill.ExperienceRequired} value={skill.CurrentExperience} />
      </div>
      <SkillDeletePopUp skill={skill} />
      <div className="skillview__goals">
        {skill.Goals.sort(sort_goals_by_completion).map((goal) => {
          return <GoalView key={goal.Id} skill_id={skill.Id} goal={goal} />
        })}
        <GoalPopUpWrapper skill={skill} />
      </div>
    </div>
  )
}
