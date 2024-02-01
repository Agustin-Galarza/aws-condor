import { Navigate } from 'react-router-dom';
import userStore from '../store/userStore';
import { useState } from 'react';
import { Group, getGroups } from '../api/api.ts';
import { Button } from '@/components/ui/button.tsx';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label.tsx';
import { useQuery } from '@tanstack/react-query';

function Neighborhood() {
	const { neighborhood, setNeighborhood } = userStore();
	const [neighborhoodState, setNeighborhoodState] = useState<string>('');

	const handleOnClick = () => {
		setNeighborhood(neighborhoodState);
	};

	if (neighborhood) return <Navigate to="/" />;

	const { data: neighborhoodList, isLoading } = useQuery({
		queryKey: ['neighborhoods'],
		queryFn: async () => {
			const res = await getGroups();
			console.log('Processed response from get groups:', res);
			return res.data.map((group: Group) => group.name);
		},
	});

	return (
		<section className="min-h-[calc(100vh-112px)] max-w-sm mx-auto flex items-center justify-center">
			<div className="flex flex-col gap-6 w-full">
				<div className="flex flex-col gap-2  w-full">
					<h1 className="text-primary font-bold text-2xl">Welcome to Condor</h1>
					<p className="text-sm text-muted-foreground">
						Find the newest report on your neighborhood.
					</p>
				</div>

				<div className="flex flex-col gap-2 w-full">
					<Label className="text-primary">Choose your neighborhood</Label>
					<div className="flex w-full gap-2">
						<Select onValueChange={value => setNeighborhoodState(value)}>
							<SelectTrigger className="w-full text-primary">
								<SelectValue placeholder="Neighborhood" />
							</SelectTrigger>
							<SelectContent className="w-full">
								{isLoading || neighborhoodList == undefined
									? 'Loading content, please wait'
									: neighborhoodList.map(neighborhood => (
											<SelectItem value={neighborhood} key={neighborhood}>
												{neighborhood}
											</SelectItem>
									  ))}
							</SelectContent>
						</Select>
						<Button onClick={handleOnClick} className="font-extrabold rounded">
							GO
						</Button>
					</div>
				</div>

				<div className="border-blue-500/50 border-[1px] bg-blue-500/20 p-4 py-2 rounded-md ">
					<h3 className="font-semibold text-lg text-blue-400">Be carefull!</h3>
					<p className="text-sm text-blue-400">
						After the selection of your neighborhood, you will not be able to
						change it.
					</p>
				</div>
			</div>
		</section>
	);
}
export default Neighborhood;
