import React from 'react';
import { Franchise, FranchiseList, Store } from '../service/pizzaService';
import Button from '../components/button';
import { TrashIcon } from '../icons';

interface Props {
  franchiseList: FranchiseList;
  closeFranchise: (franchise: Franchise) => void;
  closeStore: (franchise: Franchise, store: Store) => void;
  createFranchise: () => void;
  filterFranchises: (filter: string) => void;
  franchisePage: number;
  setFranchisePage: (page: number) => void;  
}

export default function FranchiseTable({ 
    franchiseList, 
    closeFranchise, 
    closeStore,
    createFranchise,
    filterFranchises,
    franchisePage,
    setFranchisePage
 }: Props) {
    const filterFranchiseRef = React.useRef<HTMLInputElement>(null);

    function onSubmitFilter() {
      filterFranchises(filterFranchiseRef.current?.value || '');
    }

  return (
    <>
        <div className="flex flex-col w-full">
            <h3 className="text-neutral-100 text-xl">Franchises</h3>
            <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                            {['Franchise', 'Franchisee', 'Store', 'Revenue', 'Action'].map((header) => (
                            <th key={header} className="px-6 py-3 text-center text-xs font-medium">
                                {header}
                            </th>
                            ))}
                        </tr>
                        </thead>
                        {franchiseList.franchises.map((franchise, findex) => (
                        <tbody key={findex} className="divide-y divide-gray-200">
                            <tr className="border-neutral-500 border-t-2">
                            <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">{franchise.name}</td>
                            <td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800" colSpan={3}>
                                {franchise.admins?.map((o) => o.name).join(', ')}
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button
                                type="button"
                                className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                onClick={() => closeFranchise(franchise)}
                                >
                                <TrashIcon />
                                Close
                                </button>
                            </td>
                            </tr>

                            {franchise.stores.map((store, sindex) => (
                            <tr key={sindex} className="bg-neutral-100">
                                <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800" colSpan={3}>
                                {store.name}
                                </td>
                                <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">{store.totalRevenue?.toLocaleString()} ₿</td>
                                <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button
                                    type="button"
                                    className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                    onClick={() => closeStore(franchise, store)}
                                >
                                    <TrashIcon />
                                    Close
                                </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        ))}
                        <tfoot>
                            <tr>
                                <td className="px-1 py-1" colSpan={5}>
                                    <div className="mb-4 flex justify-between">
                                        <div className="flex items-center">
                                            <input
                                            type="text"
                                            ref={filterFranchiseRef}
                                            name="filterFranchise"
                                            placeholder="Filter franchises"
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
                                                onClick={() => setFranchisePage(franchisePage - 1)}
                                                disabled={franchisePage <= 0}
                                            >
                                                «
                                            </button>
                                            <button
                                                className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                                onClick={() => setFranchisePage(franchisePage + 1)}
                                                disabled={franchiseList.more === false}
                                            >
                                                »
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="flex justify-between items-center">
                        <Button
                        className="w-36 text-xs sm:text-sm sm:w-64"
                        title="Add Franchise"
                        onPress={createFranchise}
                        />
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    </>
  );
}
