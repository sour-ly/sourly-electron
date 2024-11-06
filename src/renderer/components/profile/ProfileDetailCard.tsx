import '../styles/profile/profiledetailcard.scss';
import pfpimage from '../../../../assets/ui/pfp.jpg';
import ProgressBar from '../ProgressBar';
import { Profile } from '../../../model/Profile';

function ProfilePicture() {
  return (
    <div className="profile-picture">
      <img src={pfpimage} alt="profile picture" />
    </div>
  )
}

type ProductDetailCard = {
  profile: Profile;
}

function ProductDetailCard({ profile }: ProductDetailCard) {
  return (
    <div className="profile-detail-card">
      <div className="profile-detail-card__header">
        <ProfilePicture />
        <div className="profile-detail-card__header__info">
          <h2>Username</h2>
          <div className="profile-detail-card__header__info__level">
            <span>Level {profile.Level} : Master</span>
          </div>
          <div className="profile-detail-card__header__info__progress">
            <ProgressBar max={profile.calculateMaxExperience()} value={profile.CurrentExperience} />
            <span>{profile.CurrentExperience} XP / {profile.calculateMaxExperience()} XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailCard;
