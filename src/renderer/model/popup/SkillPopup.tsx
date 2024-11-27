import { ButtonHTMLAttributes, DetailedHTMLProps, useEffect, useState } from "react";
//import Goal, { GoalProps } from "../../../model/Goal";
import Skill, { SkillManager, SkillProps } from "../../../model/Skill";
import Plus from "../../../../assets/ui/plus.svg";
import { useWindow } from "../../App";
import { useStateUtil } from "../../util/state";
import Input from "../../components/Input";
import { ButtonProps } from "../../popup/Popup";
import { profileobj } from "../..";
import { WelcomePageSlideTwoContext } from "../../messagescreen/pages/WelcomePage";
import { Button } from "../../components/Button";

export function SkillPopupWrapper({ tskill, edit, ...props }: { tskill: SkillProps, edit?: boolean } & ButtonProps) {
  const [skill, setSkill] = useState<SkillProps>(tskill);
  const change = useStateUtil(setSkill);
  const ctx = useWindow();

  function saveSkill() {
    setSkill((o) => {
      console.log('saveSkill', o);
      if (edit) {
        if (profileobj.updateSkill(Number(tskill.id ?? -1), { ...o }))
          ctx.notification.notify(`Skill "${tskill.name}" is now "${o.name}" !`);
      } else {
        (async () => {
          const r = await profileobj.addSkill(new Skill(o.name));
          if (r)
            ctx.notification.notify(`Skill ${o.name} created!`);
        })();
      }
      return {};
    });
  }


  function addSkillPopUp() {
    props.onClick && props.onClick();
    ctx.popUp.open({
      type: 'save',
      title: edit && 'Edit Skill' || 'Add Skill',
      content: () => (<div>
        <Input placeholder="Name" onChange={(e) => change('name', e.currentTarget.value)} value={skill.name} />
      </div>),
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
    edit &&
    (<button className="add_skill" onClick={addSkillPopUp}>{edit && "Edit" || "Add"} Skill</button>) ||
    (
      <Button onClick={addSkillPopUp} type="outline"><img src={Plus} alt="plus" /> <span>{edit && 'Edit' || 'Add'} Skill</span></Button>
    )
  )
}

export function SkillDeletePopUp({ skill, ...props }: { skill: Skill } & ButtonProps) {
  const ctx = useWindow();

  function deleteSkillPopUp() {
    props.onClick && props.onClick();
    ctx.popUp.open({
      type: 'confirm',
      title: "Are you sure?",
      content: () =>
      (<div>
        <p>Are you sure you want to delete this skill?</p>
      </div>),
      options: {
        onOkay: () => {
          profileobj.removeSkill(skill);
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
    <button {...props} className={"delete_skill " + props.className} onClick={deleteSkillPopUp}>Delete Skill</button>
  )
}


/* I know this isnt a popup but its close enough */

export function SkillHelpMenu(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  const ctx = useWindow();


  function helpMenu() {
    ctx.msgScreen.open(WelcomePageSlideTwoContext);
  }

  return (
    <button {...props} className={"help_skill " + props.className} onClick={helpMenu}>Help</button>
  )
}
