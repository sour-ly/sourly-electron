import './styles/goalview.scss';
import Goal from "../../model/Goal";
import ProgressBar from '../components/ProgressBar';

export default function GoalView({ goal }: { goal: Goal }) {
  return (
    <div className={`goalview ${goal.Completed && 'done'}`}>
      <h2>{goal.Name}</h2>
      <p>{goal.Description}</p>
      <p className="metric">{goal.Current} / {goal.Target} {goal.Metric}</p>
      <ProgressBar max={goal.Target} value={goal.Current} />
      <button onClick={() => goal.incrementProgress(1)}>Increment</button>
    </div>
  )
}
