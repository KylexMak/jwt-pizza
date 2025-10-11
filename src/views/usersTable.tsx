import React from 'react';
import { User, UserList } from '../service/pizzaService';
import { TrashIcon } from '../icons';

interface Props {
  userList: UserList;
  deleteUser: (user: User) => void;
  filterNames: (filter: string) => void;
  userPage: number;
  setUserPage: (page: number) => void;
}

export default function UsersTable({ 
    userList, 
    deleteUser,
    filterNames,
    userPage,
    setUserPage }: Props) {
    const filterNameRef = React.useRef<HTMLInputElement>(null);

    function onSubmitFilter() {
        filterNames(filterNameRef.current?.value || '');
    }
    return (
        <div className="flex flex-col w-full">
            <h3 className="text-neutral-100 text-xl">Users</h3>
            <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                            <tr>
                                {['Name', 'Email', 'Role', 'Action'].map((header) => (
                                <th key={header} scope="col" className="px-6 py-3 text-center text-xs font-medium">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            {userList.users.map((user, findex) => (
                            <tbody key={findex} className="divide-y divide-gray-200">
                                <tr className="border-neutral-500 border-t-2">
                                    <td className="text-start px-2 whitespace-nowrap text-l font-mono text-gray-600">{user.name}</td>
                                    <td className="text-start px-2 whitespace-nowrap text-l font-mono text-gray-600">{user.email}</td>
                                    <td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800">
                                        {user.roles?.map(o => o.role).join(', ')}
                                    </td>
                                    <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                        <button
                                        type="button"
                                        className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                        onClick={() => deleteUser(user)}>
                                        <TrashIcon />
                                        Delete
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                            ))}
                            <tfoot>
                                <tr>
                                    <td className="px-1 py-1" colSpan={5}>
                                        <div className="mb-4 flex justify-between">
                                            <div className="flex items-center">
                                                <input
                                                type="text"
                                                ref={filterNameRef}
                                                name="filterNames"
                                                placeholder="Filter names"
                                                className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                                                />
                                                <button
                                                type="submit"
                                                className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                                onClick={onSubmitFilter}
                                                >
                                                Submit
                                                </button>
                                            </div>
                                            <div>
                                                <button
                                                    className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                                    onClick={() => setUserPage(userPage - 1)}
                                                    disabled={userPage <= 0}
                                                >
                                                    «
                                                </button>
                                                <button
                                                    className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                                    onClick={() => setUserPage(userPage + 1)}
                                                    disabled={userList.more === false}
                                                >
                                                    »
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    );
}