import { Navigate } from 'react-router-dom';
import userStore from '../store/userStore';
import { ChangeEventHandler, useState } from 'react';
import { getGroups } from '../api/api.ts';

const neighborhoodList = [
	'Quilmes',
	'Bernal',
	'Don Bosco',
	'Ezpeleta',
	'Avellaneda',
	'Lomas de Zamora',
	'Berazategui',
	'Wilde',
];

function Neighborhood() {
	const { neighborhood, setNeighborhood } = userStore();
	const [neighborhoodState, setNeighborhoodState] = useState<string>('');

	const handleOnChange: ChangeEventHandler<HTMLSelectElement> = e => {
		setNeighborhoodState(e.target.value);
	};

	const handleOnClick = () => {
		setNeighborhood(neighborhoodState);
	};

	getGroups()
		.then(res => console.log('Processed response from get groups:', res))
		.catch(err => console.log('Error from get groups:', err));

	if (neighborhood) return <Navigate to="/" />;

	return (
		<section className="min-h-[calc(100vh-112px)] flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<h1 className="font-bold text-2xl">Select your Neighborhood</h1>
				<div className="flex items-center gap-2">
					<select
						onChange={handleOnChange}
						className=" h-12 py-3 px-4 pe-9 block w-full border-[1px] text-zinc-300  bg-zinc-800 border-zinc-500 rounded-lg text-sm focus:border-zinc-300 focus:ring-zinc-500 disabled:opacity-50 disabled:pointer-events-none "
					>
						{neighborhoodList.map(neighborhood => (
							<option key={neighborhood} value={neighborhood}>
								{neighborhood}
							</option>
						))}
					</select>
					<button
						onClick={handleOnClick}
						className="px-3 py-2 bg-red-500 font-extrabold rounded h-12"
					>
						go
					</button>
				</div>
			</div>
		</section>
	);
}
export default Neighborhood;
