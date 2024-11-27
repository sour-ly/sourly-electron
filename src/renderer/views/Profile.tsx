import { useEffect, useState } from 'react';
import { ProfileSkeleton } from '../../model/Profile';
import { profileobj } from '..';
import ProductDetailCard from '../components/profile/ProfileDetailCard';

function ProfilePage() {
  const [profile_state, setProfile] = useState<ProfileSkeleton>(
    profileobj.serialize(),
  );

  useEffect(() => {
    const i = profileobj.on('onUpdates', (arg) => {
      setProfile(arg.profile.serialize());
    });
    return () => {
      if (i) {
        profileobj.off('onUpdates', i);
      }
    };
  }, []);

  return (
    <main>
      <h1 style={{ marginBottom: '1rem' }}>Profile</h1>
      <ProductDetailCard profile_obj={profile_state} />
    </main>
  );
}

export default ProfilePage;
