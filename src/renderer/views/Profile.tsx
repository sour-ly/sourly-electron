import { useEffect, useState } from "react";
import { Profile } from "../../model/Profile";
import ProgressBar from "../components/ProgressBar";
import { profileobj } from "..";
import { useWindow } from "../App";
import ProductDetailCard from "../components/profile/ProfileDetailCard";

function ProfilePage() {

  const [profile_state, setProfile] = useState<Profile>(profileobj);
  const ctx = useWindow();

  useEffect(() => {
    const i = profileobj.on('onUpdates', (arg) => {
      setProfile(arg.profile);
    });

    return () => {
      if (i) {
        profileobj.off('onUpdates', i);
      }

    }
  }, [])



  return (
    <main>
      <h1>Profile</h1>
      <ProductDetailCard profile={profile_state} />
    </main>
  )
}

export default ProfilePage;
