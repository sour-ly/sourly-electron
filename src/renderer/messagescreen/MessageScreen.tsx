import './styles/messagescreen.scss';

//this component is the main entry point for the messagescreen component, in this component various flags would be sent to a switch statement that would display the user with information.
//Such an example of this is a new version of the application, or a new feature that has been added to the application.
export function MessageScreen() {

  return (
    <div className="messagescreen">
      <div className="messagescreen__content">
        <div className="messagescreen__navigation messagescreen__navigation__left">
        </div>
        <div className="messagescreen__navigation messagescreen__navigation__right">
        </div>
        <div className="messagescreen__content__main">
          <div className="messagescreen__content__main__header">
          </div>
          <div className="messagescreen__content__main__body">
          </div>
        </div>
      </div>
    </div>
  )
}
