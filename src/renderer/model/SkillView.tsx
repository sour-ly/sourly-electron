import Skill from "../../model/Skill";
import './styles/skillview.scss';
import GoalView from "./GoalView";
import { useWindow } from "../App";
import Input from "../components/Input";
import Goal, { GoalProps } from "../../model/Goal";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStateUtil } from "../util/state";
import ProgressBar from "../components/ProgressBar";
import toRomanNumerals from "../util/roman";
import { GoalPopUpWrapper } from "./popup/GoalPopup";
import { SkillDeletePopUp, SkillHelpMenu, SkillPopupWrapper } from "./popup/SkillPopup";
import { WelcomePageSlideOneContext, WelcomePageSlideTwoContext } from "../messagescreen/pages/WelcomePage";
import { absorb } from "../util/click";


const sort_goals_by_completion = (a: { Completed: boolean }, b: { Completed: boolean }) => {
  if (a.Completed && b.Completed) return 0;
  if (!a.Completed && b.Completed) return -1;
  if (a.Completed && !b.Completed) return 1;
  return 0;
}



//TODO debug why collapsable isn't listening to skill
export function SkillView({ skill, skills }: { skill: Skill, skills: Skill[] }) {

  const [collapsed, setCollapsed] = useState(false);
  const collapse_ref = useRef<HTMLDivElement>(null);
  const ctx = useWindow();
  const goalpop = GoalPopUpWrapper({ skill });
  const skillEdit = SkillPopupWrapper({ tskill: { ...skill.toJSON(), id: `${Number(skill.Id) ?? -1}` }, edit: true });
  const options = useRef(
    [
      { key: 'edit', element: skillEdit },
      { key: 'add', element: goalpop },
      { key: 'delete', element: useMemo(() => <SkillDeletePopUp skill={skill} />, [skill]) },
      { key: 'help', element: useMemo(() => <SkillHelpMenu />, []) }
    ]);

  useEffect(() => {
    const i = skill.on('levelUp', (args) => {
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
    if (skill.Goals.length === 0) return;
    setCollapsed(!collapsed);
  }

  return (
    <div className="skillview">
      <div className="skillview__title"
        onClick={() => toggle()}
      >
        <h1 onClick={absorb}>{skill.Name} {toRomanNumerals(skill.Level)}: {skill.CurrentExperience} EXP</h1>
        <ProgressBar max={skill.ExperienceRequired} value={skill.CurrentExperience} options={options.current} />
        {skill.Goals.length > 0 && collapsed && <span className="expand-message">Click to expand</span>}
      </div>
      <div className={`collapsible ${collapsed ? 'collapsed' : 'open'}`} ref={collapse_ref}>
        <div className="skillview__description">
        </div>
        <div className="skillview__goals">
          {skill.Goals.sort(sort_goals_by_completion).map((goal) => {
            return <GoalView key={goal.Id} skill_id={skill.Id} goal={goal} />
          })}
        </div>
      </div>
    </div>
  )
}
