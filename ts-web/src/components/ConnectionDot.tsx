type ConnectionState = "online" | "connecting" | "offline";

export default function ConnectionDot({ state }: { state: ConnectionState }) {
	return (
		<span
			aria-hidden
			className="relative inline-flex size-2 shrink-0 self-center items-center justify-center leading-none align-middle"
		>
			{/* ring: same box as the dot, positioned with inset — never with translate */}
			{state === "online" && (
				<span className="absolute inset-0 rounded-full bg-green-400/75 animate-ping" />
			)}

			{/* dot: also absolute, so it's exactly the wrapper's box */}
			<span
				className={`absolute inset-0 rounded-full transition-colors ${
					state === "online"
						? "bg-green-500"
						: state === "connecting"
							? "bg-yellow-500 animate-pulse"
							: "bg-red-500"
				}`}
			/>
		</span>
	);
}