import { useState } from 'react';
import Input from '../../components/Input';
import { Profile } from '../../../model/Profile';
import { useWindow } from '../../App';
import Pencil from '../../../../assets/ui/pencil.svg';

type EditUsernameProps = {
  value: string;
  change: (value: string) => void;
};

export function EditUsername({ value, change }: EditUsernameProps) {
  return (
    <div>
      <Input
        style={{ marginTop: '.6rem' }}
        value={value}
        onChange={(e) => change(e.currentTarget.value)}
        placeholder="Username"
      />
    </div>
  );
}

export function EditUsernameWrapper({ profile }: { profile: Profile }) {
  const [username, setUsername] = useState(profile.Name);
  const window = useWindow();

  function openUsernameEdit() {
    window.popUp.open({
      type: 'save',
      title: 'Change Username',
      content: () => <EditUsername value={username} change={setUsername} />,
      options: {
        onOkay: () => {
          setUsername((e) => {
            profile.Name = e;
            return e;
          });
          window.popUp.close();
        },
        onCancel: () => {
          window.popUp.close();
        },
      },
    });
  }

  return (
    <img className="edit" src={Pencil} alt="edit" onClick={openUsernameEdit} />
  );
}
