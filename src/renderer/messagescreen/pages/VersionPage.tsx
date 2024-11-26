import { version } from "../../../main/version";
import { MSCompatiableScreen } from "../MessageScreen";

export function VersionPage() {
  return (
    <>
      <div className="messagescreen__content__main__body__section">
        <h2>Whats New?:</h2>
        <p>
          There was some bug fixes but the main focus of this update was to rehaul the UI of the application. The application now has a dark mode and has a more intuitive UI.
        </p>
        <p>
          Some of the remaining challenges is undoing Goals. This has become more out of the way for the user rather than being a straight up button.
        </p>
        <h3> TL;DR </h3>
        <ul>
          <li>Added Dark Mode</li>
          <li>Huge UI overhaul</li>
        </ul>
      </div>
      <div className="messagescreen__content__main__body__section">
        <h2>Fixes:</h2>
        <ul>
          <li>Fixed a weird overflow bug that happens on the Settings Page</li>
        </ul>
      </div>
      <div className="messagescreen__content__main__body__section">
        <h2>Next:</h2>
        <p>
          There are a few things that are planned for the next version of the application, such as:
        </p>
        <ul>
          <li>Marking Skills as "done" and giving the user EXP</li>
          <li>Very simple Achievement/Badge system</li>
          <li>Migrating to a new online {"<-->"} offline system</li>
          <li>Adding avatars to the application</li>
          <li>History</li>
        </ul>
        <p>Currently, version 0.1.0 is planned to be the last version of the application that will be offline. After that, the application will be migrated to a new online {"<-->"} offline system. </p>
        <p>There is no ETA for the next version, but it is planned to be released in the next few months.</p>
        <p>Thank you for using the application!</p>
      </div>
    </>
  );
}

export const VersionPageContext: MSCompatiableScreen = {
  header: [{ text: "New Version: ", color: "" }, { text: version, color: "red" }],
  body: <VersionPage />,
}
