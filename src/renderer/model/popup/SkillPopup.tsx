import { useState } from "react";
//import Goal, { GoalProps } from "../../../model/Goal";
import Skill, { SkillManager, SkillProps } from "../../../model/Skill";
import { useWindow } from "../../App";
import { useStateUtil } from "../../util/state";
import Input from "../../components/Input";

export function SkillPopupWrapper() {
  const [skill, setSkill] = useState<SkillProps>({});
  const change = useStateUtil(setSkill);
  const ctx = useWindow();


  function saveSkill() {
    setSkill(o => {
      SkillManager.getInstance().addSkill(new Skill(o.name));
      return {};
    });
  }


  function addSkillPopUp() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div>
        <h1>Add Skill</h1>
        <Input placeholder="Name" onChange={(e) => change('name', e.currentTarget.value)} />
      </div>,
      options: {
        onOkay: () => {
          saveSkill();
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
    <button className="add_skill" onClick={addSkillPopUp}>Add Skill</button>
  )
}

export function SkillDeletePopUp({ skill }: { skill: Skill }) {
  const ctx = useWindow();

  function deleteSkillPopUp() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div>
        <h1>Delete Skill</h1>
        <p>Are you sure you want to delete this skill?</p>
      </div>,
      options: {
        onOkay: () => {
          SkillManager.getInstance().removeSkill(skill);
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
    <button className="delete_skill" onClick={deleteSkillPopUp}>Delete Skill</button>
  )
}

