import './styles/goalview.scss';
import Goal from "../../model/Goal";
import ProgressBar from '../components/ProgressBar';
import { useWindow } from '../App';
import { SkillManager } from '../../model/Skill';
import { GoalDeletePopUp, GoalPopUpWrapper } from './popup/GoalPopup';
import { Options } from '../components/OptionDropdown';
import { profileobj } from '..';
import { absorb } from '../util/click';


export default function GoalView({ goal, skill_id }: { goal: Goal, skill_id: number }) {

  const ctx = useWindow();
  const goalpop = GoalPopUpWrapper({ goalt: goal, skill: profileobj.getSkillById(skill_id) });

  const options = [
    { key: 'edit', element: goalpop },
    { key: 'delete', element: <GoalDeletePopUp goal={goal} skill={profileobj.getSkillById(skill_id)} /> }
  ] as Options

  return (
    <div className={`goalview ${goal.Completed && 'done'} card`} onClick={absorb}>
      <h2>{goal.Name} </h2>
      <p>{goal.Description.trim().length === 0 ? 'No Description' : goal.Description}</p>
      <ProgressBar max={goal.Target} value={goal.Current} />
      <div className="goalview__footer">
        {goal.Completed ? <p>Completed</p> : <p>{goal.Current} / {goal.Target} {goal.Metric}</p>}
      </div>
    </div>
  )
}
