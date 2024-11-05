import { useEffect, useState } from "react";
import Skill, { SkillManager } from "../../model/Skill";
import { SkillPopupWrapper } from "../model/popup/SkillPopup";
import { SkillView } from "../model/SkillView";
import { profile } from "..";

function Home() {

  const [skills, setSkills] = useState<Skill[]>(profile.Skills);

  useEffect(() => {
    const i = profile.on('onUpdates', (skill) => {
      setSkills(_ => {
        return [...skill.skills];
      })
    });
    return () => {
      profile.off('onUpdates', i);
    }
  }, [])

  return (
    <main className="home">
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

export default Home;
