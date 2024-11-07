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

type LevelMap = {
  [key: number]: string;
}

const levelMap: LevelMap = {
  1: 'Beginner',
  10: 'Intermediate',
  20: 'Advanced',
  30: 'Master',
  35: 'Wise',
  40: 'Grandmaster',
  50: 'Legendary',
  60: 'Mythical',
  70: 'Godly',
  90: 'Transcendent',
  100: 'Omnipotent',
  125: 'Infinite',
  150: 'Eternal',
  200: 'Incomprehensible',
  250: 'Unfathomable',
  350: 'Ineffable',
  1000: 'Cheater'
}

//return the level text based on the level, if the level is not in the map, return the highest level
//this returns the closest level text to the level
export function getLevelText(level: number): string {
  let keys = Object.keys(levelMap).map(Number);
  let key = keys.reduce((prev, curr) => Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev);
  return levelMap[key];
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
            <span>Level {profile.Level} : {getLevelText(profile.Level)}</span>
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
