import { useEffect, useState } from "react";
import { Profile } from "../../model/Profile";
import ProgressBar from "../components/ProgressBar";
import { profileobj } from "..";
import { useWindow } from "../App";

function ProfilePage() {

  const [profile_state, setProfile] = useState<Profile>(profileobj);
  const ctx = useWindow();

  useEffect(() => {
    const i = profileobj.on('onUpdates', (arg) => {
      setProfile(arg.profile);
    });
    const z = profileobj.on('onUpdates', (arg) => {
      ctx.notification.notify(`You have leveled up to level ${arg.profile.Level}`);
    });
    return () => {
      if (i) {
        profileobj.off('onUpdates', i);
      }
      if (z) {
        profileobj.off('onUpdates', z);
      }
    }
  }, [])



  return (
    <main>
      <h1>Profile</h1>
      <p>Level: {profile_state.Level}</p>
      <p>Experience: {profile_state.CurrentExperience}</p>
      <ProgressBar max={profile_state.calculateMaxExperience()} value={profile_state.CurrentExperience} />
    </main>
  )
}

export default ProfilePage;
