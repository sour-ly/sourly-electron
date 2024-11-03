import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.scss';
import Skill, { SkillManager, SkillProps } from '../model/Skill';
import React, { useEffect, useRef, useState } from 'react';
import { SkillView } from './model/SkillView';
import Goal from '../model/Goal';
import PopUp, { _popup_types, PopUpWindow } from './popup/Popup';
import { useStateUtil } from './util/state';
import { SkillPopupWrapper } from './model/popup/SkillPopup';
import { version } from '../main/version';
import NotificationBanner, { INotifcation } from './notification/notification';
import { Anchor } from './components/anchor';
import { environment } from '.';

export type WindowContextType = {
  popUp: WindowPopUp;
  notification: Omit<Omit<INotifcation, 'Element'>, 'notification'>;
}

export type WindowPopUp = {
  open: (ctx: PopUpWindow<_popup_types>) => boolean; //return true, if successful, return false if failure (like the window is already open)
  close: () => boolean; //force a close, i can't really see why I would need to do this but this could prove to be useful
  state: boolean;
  update: () => void; //sync the current popup with the new context
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
    <main>
      {skills.length === 0 && <h1>No Skills Yet!</h1>}
      {skills.map((skill) => {
        return (
          <SkillView key={skill.Id} skill={skill} skills={skills} />
        )
      })}
      <SkillPopupWrapper />
    </main>
  );
}

export default function App() {

  const [ctx_open, setCtxOpen] = useState(false);
  const [ctx_content, setCtxContent] = useState<PopUpWindow | null>(null);
  const [update, setUpdate] = useState<boolean>(false);
  const Notification = NotificationBanner();

  useEffect(() => {
    window.document.title = `Sourly v${version}`;
  }, []);


  function setPopUpContext(ctx: PopUpStates) {
    setCtxOpen(ctx.open);
    setCtxContent(ctx.context);
  }

  function openPopUp(ctx: PopUpWindow) {
    const element = React.cloneElement(ctx.content as JSX.Element);
    setPopUpContext({ open: true, context: { ...ctx, content: element } });
  }


  return (
    <WindowContext.Provider value={{ notification: { notify: (s: string) => { Notification.notify(s); } }, popUp: { open: (ctx) => { openPopUp(ctx); return true; }, close: () => { setPopUpContext({ open: false, context: null }); return true; }, state: ctx_open, update: () => setUpdate(!update) } }}>

      <div>
        <PopUp open={ctx_open} context={ctx_content} />
        <Notification.Element notification={Notification.notification} />
        <div className="version">{environment.mode === 'development' && 'd.'}v{environment.version}</div>
        <Router>
          <Routes>
            <Route path="/" element={<Hello />} />
          </Routes>
        </Router>
        <div className="feedback" style={{ borderTop: '1px solid black', paddingTop: '10px', marginTop: '25px' }}>
          Please leave feedback on <Anchor href="https://forms.gle/TQHj89A2EwuxytaMA" text={"Google Forms"} />
        </div>
      </div>
    </WindowContext.Provider>
  );
}
