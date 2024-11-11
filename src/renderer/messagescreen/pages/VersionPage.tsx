import { MSCompatiableScreen } from "../MessageScreen";

export function VersionPage() {
  return (
    <>
      <div className="messagescreen__content__main__body__section">
        <h2>Whats New?:</h2>
        <p>
          This is the seventh version of the application (alpha), this version is a minor update that adds a few things, and fixes a few things.
        </p>
        <p>
          The first thing was to add... well this page. This page serves as a way to show the user what has changed and what has been added to the application. I think this is a good way to keep the user informed about what is going on with the application.
        </p>
        <p>
          This page could contain a lot of information, such as images, videos, gifs, and other things that could be used to show the user content. This is also planned to be used as a way to show the user how to use the application, and how to use the features of the applic
        </p>
        <h3> TL;DR </h3>
        <ul>
          <li>Added a <code>MessageScreen</code> component to the application</li>
          <li>Added a new page to show the user what has changed</li>
          <li>Added a new page to show the user how to use the application</li>
          <li>Added a new page to show the user how to use the features of the application</li>
          <li>Added a "flags" feature to the application based on the users <code>storage.json</code></li>
        </ul>
      </div>
      <div className="messagescreen__content__main__body__section">
        <h2>Fixes:</h2>
        <ul>
          <li>Fixed a notification bug that would show the notification way too many times if the user flip-flopped between the pages</li>
          <li>Fixed a bug that would not save the users data if they switched between the pages</li>
        </ul>

      </div>
      <div className="messagescreen__content__main__body__section">
        <h2>Next:</h2>
        <p>
          There are a few things that are planned for the next version of the application, such as:
        </p>
        <ul>
          <li>Undoing Goals and the EXP given to the user</li>
          <li>Marking Skills as "done" and giving the user EXP</li>
          <li>Adding a better settings page</li>
          <li>Very simple Achievement/Badge system</li>
          <li>Migrating to a new online {"<-->"} offline system</li>
          <li>Adding avatars to the application</li>
          <li>Adding a way to change the theme of the application</li>
          <li>History</li>
        </ul>
      </div>
    </>
  );
}

export const VersionPageContext: MSCompatiableScreen = {
  header: [{ text: "New Version: ", color: "" }, { text: "0.0.7", color: "red" }],
  body: <VersionPage />,
}
