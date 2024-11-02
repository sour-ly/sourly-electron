import './styles/goalview.scss';
import Goal from "../../model/Goal";
import ProgressBar from '../components/ProgressBar';
import { useWindow } from '../App';

export default function GoalView({ goal }: { goal: Goal, skill_id: string }) {

  const ctx = useWindow();

  function askToDelete() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div className="popup__delete">
        <h1>Delete Goal</h1>
        <p>Are you sure you want to delete this goal?</p>
      </div>,
      options: {
        onOkay: () => {
          ctx.popUp.close();
          return;
        },
        onCancel: () => {
          ctx.popUp.close();
          return;
        }
      }
    })
  }

  return (
    <div className={`goalview ${goal.Completed && 'done'}`}>
      <h2>{goal.Name}</h2>
      <p>{goal.Description}</p>
      <p className="metric">{goal.Current} / {goal.Target} {goal.Metric}</p>
      <ProgressBar max={goal.Target} value={goal.Current} />
      <button onClick={() => goal.incrementProgress(1)}>Log</button>
      <button onClick={() => askToDelete()}>Delete</button>
    </div>
  )
}
