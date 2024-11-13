import { MSCompatiableScreen } from "../MessageScreen"
import '../styles/pageslideone.scss';
import AddSkill from '../../../../assets/images/welcome-screen-add-skill.png';
import AddSkillPopUp from '../../../../assets/images/welcome-screen-add-skill-popup.png';
import AddGoal from '../../../../assets/images/welcome-screen-add-goal.png';
import AddGoalPopUp from '../../../../assets/images/welcome-screen-add-goal-popup.png';
import { version } from "../../../main/version";


function WelcomePageSlideOne() {
  return (
    <>
      <div className="messagescreen__content__main__body__section">
        <p style={{ fontWeight: 400 }}>Welcome to Sourly (alpha - v{version})</p>
        <p style={{ fontWeight: 300 }}>
          Sour-ly aims to be a multi-platform application that allows users to create, log, and track the progress on their skills through gamification. Sour-ly rewards users with EXP and levels up their skills (and themselves) as they progress. Skills can be anything from learning a new language, to improving your social skills, or even learning how to play an instrument. Skills are leveled up by assigning goals to them. Completing goals will reward the user and the skill with EXP.
        </p>
        <p>What You Can Expect Right Now:</p>
        <p style={{ fontWeight: 300 }}>
          You can expect to be able to create, manage, and track your skills. You can also create goals for your skills and track your progress on them. Tracking your progress will reward you and your skill with EXP. Collecting EXP will eventually level up your skill and yourself.
        </p>
        <p>What You Can Expect In The Future:</p>
        <p style={{ fontWeight: 300 }}>
          On top of the current features, you can expect to be able to create and join co-working virtual spaces, compete with other users, and partner up with other users to complete goals together. You can also expect to be able to collect items and be able to customize your working space and your profile.
        </p>
        <p>What We Need From You:</p>
        <p style={{ fontWeight: 300 }}>
          We need you to test the application and provide feedback. We need you to report bugs and suggest features. We need you to be patient with us as we work on the application. We need you to be open to change and open to new ideas. We need you to be a part of the community and help us grow.
        </p>
      </div>
    </>
  )
}

function WelcomePageSlideTwo() {
  return (
    <>
      <div className="messagescreen__content__main__body__section">
        <p style={{ fontWeight: 400 }}>How to use Sourly</p>
        <p style={{ fontWeight: 300 }}>Sourly is broken up into Skills and Goals. Each Skill has a goal and goals contain a reward, a target and a unit. Completing this goal will reward you and yourself EXP.</p>
        <p style={{ fontWeight: 300 }}>You, yes you, can level up (Just as we can in real life.) You level up by completing an assortment of goals and reaching mastery in various skills.</p>
        <p>Creating a Skill:</p>
        <img className="add-image" src={AddSkill} draggable={false} />
        <p style={{ fontWeight: 300 }}>To create a skill, click on the "Add Skill" button at the bottom of the Home Page. You will be prompted to enter a name for your skill. Once you have entered a name, click "Create".</p>
        <img className="add-image" src={AddSkillPopUp} draggable={false} />
        <p>Creating a Goal:</p>
        <img className="add-image" src={AddGoal} draggable={false} />
        <p style={{ fontWeight: 300 }}>To create a goal for a skill, click on the three dots stacked on top of each other and click on "Add Goal" </p>
        <img className="add-image" src={AddGoalPopUp} draggable={false} />
        <p style={{ fontWeight: 300 }}>You will be prompted to enter a name for your goal, a target, and a unit. Once you have entered all the information, click "Create".</p>
        <ul>
          <li>Name - The name of the goal</li>
          <li>Target - The target amount you want to reach</li>
          <li>Unit - The unit of measurement for the goal</li>
          <li>Metric - You can choose between a preset list of metrics with the dropdown, if you wanted to track something else, you can select "Other" and type in your own metric</li>
          <li>Goal - The amount or the finish line of the goal. This defines when the goal is complete.</li>
          <li>Reward - The reward for completing the goal. This is the amount of EXP you will receive for completing the goal.</li>
        </ul>
        <p>To see this screen again, click on the three dots stacked on top of each other and click on "Help".</p>
      </div>
    </>
  )
}

export const WelcomePageSlideOneContext: MSCompatiableScreen = {
  header: [{ text: "Welcome to ", color: "" }, { text: `Sourly (alpha)`, color: "red" }],
  body: <WelcomePageSlideOne />,
}

export const WelcomePageSlideTwoContext: MSCompatiableScreen = {
  header: [{ text: "How to use ", color: "" }, { text: `Sourly`, color: "red" }],
  body: <WelcomePageSlideTwo />,
}

