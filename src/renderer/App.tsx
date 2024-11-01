import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.scss';
import Skill, { SkillManager, SkillProps } from '../model/Skill';
import React, { useEffect, useState } from 'react';
import { SkillView } from './model/SkillView';
import Goal from '../model/Goal';
import PopUp, { _popup_types, PopUpWindow } from './popup/Popup';
import { useStateUtil } from './util/state';

export type WindowContextType = {
  popUp: WindowPopUp;
}

export type WindowPopUp = {
  open: (ctx: PopUpWindow<_popup_types>) => boolean; //return true, if successful, return false if failure (like the window is already open)
  close: () => boolean; //force a close, i can't really see why I would need to do this but this could prove to be useful
  state: boolean;
}

type PopUpStates = {
  open: boolean,
  context: PopUpWindow | null
}

const WindowContext = React.createContext<WindowContextType | undefined>(undefined);

//simple hook to use the window context
export const useWindow = () => {
  const ctx = React.useContext(WindowContext);
  if (!ctx) throw new Error('useWindow must be used within a WindowProvider');
  return React.useContext(WindowContext) as WindowContextType
};

function AddSkillWrapper() {
  const [skill, setSkill] = useState<SkillProps>({});
  const change = useStateUtil(setSkill);
  const ctx = useWindow();


  function saveSkill() {
    setSkill(o => {
      SkillManager.getInstance().addSkill(new Skill(o.name, 0, 0));
      return o;
    });
  }


  function addSkillPopUp() {
    ctx.popUp.open({
      type: 'confirm',
      content: <div>
        <h1>Add Skill</h1>
        <input type="text" placeholder="Name" onChange={(e) => change('name', e.currentTarget.value)} />
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


function Hello() {

  const [skills, setSkills] = useState<Skill[]>(SkillManager.getInstance().Skills);

  useEffect(() => {
    const i = SkillManager.getInstance().on('onUpdates', (skill) => {
      setSkills(_ => {
        return [...skill.skills];
      })
    });
    const skill = new Skill('Coding', 1, 100);
    skill.addGoal(new Goal('Learn React', "React is a JavaScript library for building user interfaces.", 0, "Hours", 10));


    SkillManager.getInstance().addSkill(skill);
    return () => {
      SkillManager.getInstance().off('onUpdates', i);
    }
  }, [])

  return (

    <main>
      {skills.map((skill) => {
        return (
          <SkillView key={skill.Id} skill={skill} />
        )
      })}
      <AddSkillWrapper />
    </main>
  );
}

export default function App() {

  const [ctx_popup, setPopUpContext] = React.useState<PopUpStates>({ open: false, context: null });

  return (
    <WindowContext.Provider value={{ popUp: { open: (ctx) => { setPopUpContext({ open: true, context: ctx }); return true; }, close: () => { setPopUpContext({ open: false, context: null }); return true; }, state: ctx_popup.open } }}>
      <PopUp open={ctx_popup.open} context={ctx_popup.context} />
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
        </Routes>
      </Router>
    </WindowContext.Provider>
  );
}
