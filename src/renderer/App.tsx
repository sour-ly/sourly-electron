import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.scss';
import Skill, { SkillManager, SkillProps } from '../model/Skill';
import React, { useEffect, useState } from 'react';
import { SkillView } from './model/SkillView';
import Goal from '../model/Goal';
import PopUp, { _popup_types, PopUpWindow } from './popup/Popup';
import { useStateUtil } from './util/state';
import { SkillPopupWrapper } from './model/popup/SkillPopup';

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


function Hello() {

  const [skills, setSkills] = useState<Skill[]>(SkillManager.getInstance().Skills);

  useEffect(() => {
    const i = SkillManager.getInstance().on('onUpdates', (skill) => {
      setSkills(_ => {
        return [...skill.skills];
      })
    });
    return () => {
      SkillManager.getInstance().off('onUpdates', i);
    }
  }, [])

  return (
    <>
      {skills.length === 0 && <h1>No Skills Yet!</h1>}
      {skills.map((skill) => {
        return (
          <SkillView key={skill.Id} skill={skill} />
        )
      })}
      <SkillPopupWrapper />
    </>
  );
}

export default function App() {

  const [ctx_popup, setPopUpContext] = React.useState<PopUpStates>({ open: false, context: null });

  return (
    <WindowContext.Provider value={{ popUp: { open: (ctx) => { setPopUpContext({ open: true, context: ctx }); return true; }, close: () => { setPopUpContext({ open: false, context: null }); return true; }, state: ctx_popup.open } }}>
      <main>
        <PopUp open={ctx_popup.open} context={ctx_popup.context} />
        <div className="version">v{"0.0.2"}</div>
        <Router>
          <Routes>
            <Route path="/" element={<Hello />} />
          </Routes>
        </Router>
        <div className="feedback" style={{ borderTop: '1px solid black', paddingTop: '10px', marginTop: '25px' }}>
          Please leave feedback on <a href="https://forms.gle/TQHj89A2EwuxytaMA">Google Forms</a>
        </div>
      </main>
    </WindowContext.Provider>
  );
}
