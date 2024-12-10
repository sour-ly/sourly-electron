import { useEffect, useState } from 'react';
import { ProfileSkeleton } from '../../model/Profile';
import { profileobj } from '..';
import ProductDetailCard from '../components/profile/ProfileDetailCard';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { APIMethods } from '../../api/api';
import { Log } from '../../log/log';

//we are going to grab the profile id rather than using the profileobj
function ProfilePage() {
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile_state, setProfile] = useState<ProfileSkeleton>();
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (!uid) {
      setProfile(profileobj.serialize());
      const i = profileobj.on('onUpdates', (arg) => {
        setProfile(arg.profile.serialize());
      });
      return () => {
        if (i) {
          profileobj.off('onUpdates', i);
        }
      };
    } else {
      //handle the case wherdasde we are given a uid
      APIMethods.getProfile(uid).then((profile) => {
        if (!profile) {
          navigator('/profile');
          return;
        }
        if ("currentExp" in profile) {
          //@ts-ignore we are going to set the current experience to the currentExp
          setProfile({ ...profile, currentExperience: profile.currentExp });
        }
      }).catch((e) => {
        Log.log(e, 1, 'ProfilePage');
        navigator('/profile');
      });

      return (() => {
        setProfile(undefined);
      });
    }
  }, []);

  if (!profile_state) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      <h1 style={{ marginBottom: '1rem' }}>{!uid || uid === `${profileobj.Id}` ? 'Your' : `${profile_state.name}'s`} Profile</h1>
      <ProductDetailCard profile_obj={profile_state} editable={!uid || uid === `${profileobj.Id}`} />
    </main>
  );
}

export default ProfilePage;
