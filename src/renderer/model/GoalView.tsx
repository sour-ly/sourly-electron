import './styles/goalview.scss';
import Goal from "../../model/Goal";
import ProgressBar from '../components/ProgressBar';
import { useWindow } from '../App';
import { SkillManager } from '../../model/Skill';
import { GoalDeletePopUp, GoalPopUpWrapper } from './popup/GoalPopup';

export default function GoalView({ goal, skill_id }: { goal: Goal, skill_id: number }) {

  const ctx = useWindow();

  return (
    <div className={`goalview ${goal.Completed && 'done'}`}>
      <h2>{goal.Name} </h2>
      <p>{goal.Description}</p>
      <p className="metric">{goal.Current} / {goal.Target} {goal.Metric}</p>
      <ProgressBar max={goal.Target} value={goal.Current} />
      <button onClick={() => goal.incrementProgress(1)}>Log</button>
      <GoalPopUpWrapper skill={SkillManager.getInstance().getSkillById(skill_id)} goalt={goal} />
      <GoalDeletePopUp goal={goal} skill={SkillManager.getInstance().getSkillById(skill_id)} />
    </div>
  )
}
