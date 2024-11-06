import { useEffect, useState } from "react";
import { Profile } from "../../model/Profile";
import ProgressBar from "../components/ProgressBar";
import { profileobj } from "..";

function ProfilePage() {

  const [profile_state, setProfile] = useState<Profile>(profileobj);

  useEffect(() => {
    profileobj.on('onUpdates', (arg) => {
      setProfile(arg.profile);
    });
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
