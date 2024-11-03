import { useState } from "react";
import Goal, { GoalProps } from "../../../model/Goal";
import Skill from "../../../model/Skill";
import { useWindow } from "../../App";
import { useStateUtil } from "../../util/state";
import Input from "../../components/Input";

export function GoalPopUpWrapper({ skill, goalt }: { skill?: Skill, goalt?: Goal }) {

  const ctx = useWindow();
  const [goal, setGoal] = useState<GoalProps>(goalt?.toJSON() ?? {});
  const change = useStateUtil(setGoal);


  if (skill === undefined) return null;


  function saveGoal() {
    setGoal(o => {
      if (goalt) {
        skill!.updateGoal(goalt.Id, new Goal(o.name, o.description, goalt.Progress, o.reward, o.metric, o.target, goalt.Completed));
        ctx.notification.notify(`Goal ${o.name} updated!`);
      }
      skill!.addGoal(new Goal(o.name, o.description, 0, o.reward, o.metric, o.target));
      ctx.notification.notify(`Goal ${o.name} created!`);
      return {};
    });
  }

  function addGoalPopUp() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div className="popup__add">
        <h1>{goalt ? "Edit Goal" : "Add Goal"} Goal</h1>
        <Input placeholder="Name" onChange={(e) => change('name', e.currentTarget.value)} value={goal.name} />
        <Input placeholder="Description" onChange={(e) => change('description', e.currentTarget.value)} value={goal.description} />
        <Input placeholder="Metric" onChange={(e) => change('metric', e.currentTarget.value)} value={goal.metric} />
        <Input placeholder="Goal" onChange={(e) => change('target', parseInt(e.currentTarget.value) ?? 0)} value={`${goal.target ?? 0}`} />
        <Input placeholder="Reward" onChange={(e) => change('reward', parseInt(e.currentTarget.value) ?? 0)} value={`${goal.reward ?? 0}`} />
      </div>,
      options: {
        onOkay: () => {
          saveGoal();
          ctx.popUp.close();
          return;
        },
        onCancel: () => {
          ctx.popUp.close();
          return;
        }
      }
    });
  }

  return (
    <button className={goalt ? "edit_goal" : "add_goal"} onClick={addGoalPopUp}>{goalt ? 'Edit Goal' : 'Add Goal'}</button>
  )

}

export function GoalDeletePopUp({ goal, skill }: { goal: Goal, skill?: Skill }) {
  const ctx = useWindow();

  if (skill === undefined) return null;

  function askToDelete() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div className="popup__delete">
        <h1>Delete Goal</h1>
        <p>Are you sure you want to delete this goal?</p>
      </div>,
      options: {
        onOkay: () => {
          skill!.removeGoal(goal);
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
    <button className="delete_goal" onClick={() => askToDelete()}>Delete Goal</button>
  )
}
