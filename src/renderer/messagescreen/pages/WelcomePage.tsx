import { MSCompatiableScreen } from "../MessageScreen"

function WelcomePageSlideOne() {
  return (
    <>
      <div className="messagescreen__content__main__body__section">
        beep boop bop beep
      </div>
    </>
  )
}

export const WelcomePageSlideOneContext: MSCompatiableScreen = {
  header: [{ text: "Welcome to ", color: "" }, { text: `Sourly (alpha)`, color: "red" }],
  body: <WelcomePageSlideOne />,
}

