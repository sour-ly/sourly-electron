import Skill from "../../model/Skill";
import './styles/skillview.scss';
import GoalView from "./GoalView";
import { useWindow } from "../App";
import Input from "../components/Input";
import Goal, { GoalProps } from "../../model/Goal";
import { useEffect, useState } from "react";
import { useStateUtil } from "../util/state";
import ProgressBar from "../components/ProgressBar";


const sort_goals_by_completion = (a: { Completed: boolean }, b: { Completed: boolean }) => {
  if (a.Completed && b.Completed) return 0;
  if (!a.Completed && b.Completed) return -1;
  if (a.Completed && !b.Completed) return 1;
  return 0;
}

function AddGoalWrapper({ skill }: { skill: Skill }) {

  const ctx = useWindow();
  const [goal, setGoal] = useState<GoalProps>({});
  const change = useStateUtil(setGoal);

  function saveGoal() {
    setGoal(o => {
      skill.addGoal(new Goal(o.name, o.description, 0, o.metric, o.target));
      return {};
    });
  }

  function addGoalPopUp() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div className="popup__add">
        <h1>Add Goal</h1>
        <Input placeholder="Name" onChange={(e) => change('name', e.currentTarget.value)} />
        <Input placeholder="Description" onChange={(e) => change('description', e.currentTarget.value)} />
        <Input placeholder="Metric" onChange={(e) => change('metric', e.currentTarget.value)} />
        <Input placeholder="Goal" onChange={(e) => change('target', parseInt(e.currentTarget.value))} />
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
    <button className="add_goal" onClick={addGoalPopUp}>Add Goal</button>
  )

}

export function SkillView({ skill }: { skill: Skill }) {

  return (
    <div className="skillview">
      <h1>{skill.Name}: {skill.CurrentExperience} EXP</h1>
      <div className="skillview__goals">
        {skill.Goals.sort(sort_goals_by_completion).map((goal) => {
          return <GoalView key={goal.Id} goal={goal} />
        })}
        <AddGoalWrapper skill={skill} />
      </div>
    </div>
  )
}
