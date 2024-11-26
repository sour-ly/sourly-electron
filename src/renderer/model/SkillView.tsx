import Skill from "../../model/Skill";
import './styles/skillview.scss';
import GoalView from "./GoalView";
import { useWindow } from "../App";
import { useEffect, useMemo, useRef, useState } from "react";
import ProgressBar from "../components/ProgressBar";
import toRomanNumerals from "../util/roman";
import { GoalPopUpWrapper } from "./popup/GoalPopup";
import { SkillDeletePopUp, SkillHelpMenu, SkillPopupWrapper } from "./popup/SkillPopup";
import { absorb } from "../util/click";
import OptionDropdown from "../components/OptionDropdown";
import { Button } from "../components/Button";
import { truncateDecimal } from "../util/truncate";


const sort_goals_by_completion = (a: { Completed: boolean }, b: { Completed: boolean }) => {
  if (a.Completed && b.Completed) return 0;
  if (!a.Completed && b.Completed) return -1;
  if (a.Completed && !b.Completed) return 1;
  return 0;
}



//TODO debug why collapsable isn't listening to skill
export function SkillView({ skill, skills }: { skill: Skill, skills: Skill[] }) {

  const [collapsed, setCollapsed] = useState(true);
  const collapse_ref = useRef<HTMLDivElement>(null);
  const ctx = useWindow();
  const skillEdit = SkillPopupWrapper({ tskill: { ...skill.toJSON(), id: `${Number(skill.Id) ?? -1}` }, edit: true });
  const options = useRef(
    [
      { key: 'edit', element: skillEdit },
      { key: 'delete', element: useMemo(() => <SkillDeletePopUp skill={skill} />, [skill]) },
      { key: 'help', element: useMemo(() => <SkillHelpMenu />, []) }
    ]);

  useEffect(() => {
    const i = skill.on('levelUp', (args) => {
      ctx.notification.notify({ message: `You have leveled up ${skill.Name} to level ${args.level}`, event: 'confetti' });
    });

    return () => {
      skill.off('levelUp', i);
    }
  }, [])

  useEffect(() => {
    //set --collapsible-height to the height of the collapsible div
    function setHeight() {
      if (collapse_ref.current) {
        collapse_ref.current.style.setProperty('--collapsible-height', `${collapse_ref.current.scrollHeight + 50}px`);
      }
    }
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => {
      window.removeEventListener('resize', setHeight);
    }
  }, [collapsed, skills])

  function toggle() {
    setCollapsed(!collapsed);
  }

  return (
    <div className="skillview card"

      onClick={() => toggle()}
    >
      <div className="skillview__title"
      >
        <div className="skillview__icon">
        </div>
        <div className="skillview__title__header">
          <h1 onClick={absorb}>{skill.Name} {toRomanNumerals(skill.Level)}: {truncateDecimal(skill.CurrentExperience, 1)} EXP</h1>
          <OptionDropdown options={options.current} className="skillview__dot_container" />
        </div>
        <ProgressBar max={skill.ExperienceRequired} value={skill.CurrentExperience} />
        {/*skill.Goals.length > 0 && collapsed && <span className="expand-message">Click to expand</span>*/}
      </div>
      <div className={`collapsible ${collapsed ? 'collapsed' : 'open'}`} ref={collapse_ref}>
        <div className="skillview__description">
        </div>
        <div className="skillview__goals scrollbar horizontal slight">
          <div className="skillview__goals__container">
            {skill.Goals.sort(sort_goals_by_completion).map((goal) => {
              return <GoalView key={goal.Id} skill_id={skill.Id} goal={goal} />
            })}
          </div>
        </div>
        <div className="skillview__footer">
          <GoalPopUpWrapper skill={skill} />
        </div>
      </div>
    </div>
  )
}
