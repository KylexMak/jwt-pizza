import React from 'react';
import View from './view';
import { useLocation, useNavigate } from 'react-router-dom';
import NotFound from './notFound';
import { pizzaService } from '../service/service';
import { Franchise, FranchiseList, Role, Store, User, UserList } from '../service/pizzaService';
import FranchiseTable from './franchiseTable';
import UsersTable from './usersTable';

interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const navigate = useNavigate();
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({ franchises: [], more: false });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const [usersList, setUsers] = React.useState<UserList>({ users: [], more: false });
  const [userPage, setUserPage] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      setFranchiseList(await pizzaService.getFranchises(franchisePage, 3, '*'));
    })();
  }, [props.user, franchisePage]);

  React.useEffect(() => {
    (async () => {
      setUsers(await pizzaService.listAllUsers(userPage, 10, '*'));
    })();
  }, [props.user, userPage]);

  function createFranchise() {
    navigate('/admin-dashboard/create-franchise');
  }

  async function closeFranchise(franchise: Franchise) {
    navigate('/admin-dashboard/close-franchise', { state: { franchise: franchise } });
  }

  async function closeStore(franchise: Franchise, store: Store) {
    navigate('/admin-dashboard/close-store', { state: { franchise: franchise, store: store } });
  }

  async function filterFranchises(filter: string) {
    setFranchiseList(await pizzaService.getFranchises(franchisePage, 10, `*${filter}*`));
  }

  async function filterNames(filter: string) {
    setUsers(await pizzaService.listAllUsers(userPage, 10, `*${filter}*`));
  }

  async function deleteUser(user: User) {
    navigate('/admin-dashboard/delete-user', { state: { user: user } });
  }

  let response = <NotFound />;
  if (Role.isRole(props.user, Role.Admin)) {
    response = (
      <View title="Mama Ricci's kitchen">
        <div className="flex flex-row gap-8">
          <div className='flex-1'>
            <FranchiseTable 
            franchiseList={franchiseList} 
            closeFranchise={closeFranchise} 
            closeStore={closeStore}
            createFranchise={createFranchise}
            filterFranchises={filterFranchises}
            franchisePage={franchisePage}
            setFranchisePage={setFranchisePage}
              />     
          </div>
          <div className='flex-1'>
            <UsersTable
              userList={usersList}
              deleteUser={deleteUser}
              filterNames={filterNames}
              userPage={userPage}
              setUserPage={setUserPage}
              />
          </div>
        </div>
      </View>
    );
  }

  return response;
}
