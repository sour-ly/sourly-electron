import { useCallback, useEffect, useRef, useState } from "react";
import Goal, { GoalProps } from "../../../model/Goal";
import Skill, { Metric } from "../../../model/Skill";
import { useWindow } from "../../App";
import { useStateUtil } from "../../util/state";
import Input from "../../components/Input";
import { ButtonProps } from "../../popup/Popup";
import { Dropdown } from "../../components/Dropdown";
import { Button } from "../../components/Button";
import Plus from "../../../../assets/ui/plus.svg";


const MetricOptions: Metric[] = [
  'units',
  'times',
  '%',
  'pages',
  'chapters',
  'books',
  'articles',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
  'lbs',
  'kg',
  'miles',
  'meters',
  'other'
];

function isPredefinedMetric(metric: string) {
  return MetricOptions.includes(metric.toLowerCase());
}

function Capitalize(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1, str.length)}`;
}

//TODO PLEASE CHANGE THIS ALL

function AddPage({ goal, change, edit }: { goal: GoalProps, change: (key: any, value: any) => void, edit?: boolean }) {


  const [goal_copy, setGoalCopy] = useState<GoalProps>(goal);
  const [dropdown_state, setDropdownState] = useState<'predefined' | 'other'>('predefined');
  const setGoal = useStateUtil(setGoalCopy);

  useEffect(() => {
    setGoalCopy(goal);
  }, [goal]);

  useEffect(() => {
    Object.keys(goal_copy).forEach((key) => {
      if (goal_copy[key as keyof GoalProps] === undefined) {
        change(key as keyof GoalProps, '');
      } else {
        change(key as keyof GoalProps, goal_copy[key as keyof GoalProps]);
      }
    });
  }, [goal_copy]);



  return (
    <div className="popup__add">
      <Input placeholder="Name" onChange={(e) => setGoal('name', e.currentTarget.value)} value={goal_copy.name} />
      <Input placeholder="Description" onChange={(e) => setGoal('description', e.currentTarget.value)} value={goal_copy.description} />
      <Dropdown
        name="Metric"
        options={MetricOptions.map((e: string) => ({ key: e, value: `${e.at(0)?.toUpperCase()}${e.slice(1, e.length)}` }))}
        onChange={(e) => { if (e === 'Other') setDropdownState('other'); else setDropdownState('predefined'); setGoal('metric', Capitalize(e)) }}
        value={isPredefinedMetric(goal_copy.metric?.toLowerCase() ?? '') ? Capitalize(goal_copy.metric ?? '') : 'Other'}
      />
      {dropdown_state === 'other' ?
        <Input placeholder="Metric" onChange={(e) => setGoal('metric', e.currentTarget.value)} value={goal_copy.metric} /> : <></>}
      <Input placeholder="Goal" onChange={(e) => setGoal('target', parseInt(e.currentTarget.value) ?? 0)} value={`${goal_copy.target ?? 0}`} />
      <Input placeholder="Reward" onChange={(e) => setGoal('reward', parseInt(e.currentTarget.value) ?? 0)} value={`${goal_copy.reward ?? 0}`} />
    </div>
  )

}

export function GoalPopUpWrapper({ skill, goalt, ...props }: { skill?: Skill, goalt?: Goal } & ButtonProps) {

  const ctx = useWindow();
  const [goal, setGoal] = useState<GoalProps>(goalt?.toJSON() ?? { metric: 'Units' });
  const change = useStateUtil(setGoal);

  if (skill === undefined) return <> </>;

  const saveGoal = useCallback(() => {
    props.onClick && props.onClick();
    setGoal(o => {
      if (goalt) {
        skill!.updateGoal(goalt.Id, new Goal(o.name, o.description, goalt.Progress, o.reward, o.metric, o.target, goalt.Completed));
        ctx.notification.notify(`Goal ${o.name} updated!`);
      } else {
        skill!.addGoal(new Goal(o.name, o.description, 0, o.reward, o.metric, o.target));
        ctx.notification.notify(`Goal ${o.name} created!`);
      }
      return {};
    });
  }, []);




  function addGoalPopUp() {
    const addPage = (<AddPage goal={goal} change={change} edit={goalt !== undefined} />);
    //props.onClick && props.onClick();
    ctx.popUp.open({
      type: 'save',
      title: goalt ? 'Edit Goal' : 'Add Goal',
      content: () => addPage,
      options: {
        onOkay: () => {
          setGoal(o => {
            return o;
          });
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

  return goalt && (
    <button {...props} className={"add_goal " + props.className} onClick={addGoalPopUp}>{goalt && 'Edit' || 'Add'} Goal</button>
  ) ||
    (<Button onClick={addGoalPopUp} type="outline"><img src={Plus} alt="plus" /> <span>{goalt && 'Edit' || 'Add'} Goal</span></Button>)

}

export function GoalDeletePopUp({ goal, skill, ...props }: { goal: Goal, skill?: Skill } & ButtonProps) {
  const ctx = useWindow();

  if (skill === undefined) return null;

  function askToDelete() {
    props.onClick && props.onClick();
    ctx.popUp.open({
      type: 'confirm',
      content: () =>
      (<div className="popup__delete">
        <h1>Delete Goal</h1>
        <p>Are you sure you want to delete this goal?</p>
      </div>),
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
    <button {...props} className={"delete_goal " + props.className} onClick={() => askToDelete()}>Delete Goal</button>
  )
}
