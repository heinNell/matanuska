import { useWialon } from "@/context/WialonProvider";

const WialonMapDashboard = () => {
	const {
		loggedIn,
		initializing,
		error,
		units,
		login,
		token
	} = useWialon();

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Wialon Map Dashboard</h1>
			<div className="mb-2">
				{initializing && <span className="text-blue-600">Initializing Wialon session...</span>}
				{!initializing && error && (
					<span className="text-red-600">Error: {error.message}</span>
				)}
				{!initializing && !error && loggedIn && (
					<span className="text-green-700">Wialon session active. Units loaded: {units.length}</span>
				)}
				{!initializing && !error && !loggedIn && (
					<span className="text-yellow-700">Not logged in. <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={() => login(token || undefined)}>Login</button></span>
				)}
			</div>
						{/* Simple map UI: show units as a list and a placeholder map */}
						{!initializing && !error && loggedIn && units.length > 0 && (
							<div className="mt-6">
								<h2 className="text-lg font-semibold mb-2">Tracked Units</h2>
								<ul className="mb-4">
									{units.map((unit) => (
										<li key={unit.id} className="mb-1">
											<span className="font-mono text-blue-900">{unit.id}</span>: {unit.name}
										</li>
									))}
								</ul>
								<div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
									<span className="text-gray-500">[Map placeholder: Integrate Wialon map or use Google/Leaflet here]</span>
								</div>
							</div>
						)}
		</div>
	);
};

export default WialonMapDashboard;
