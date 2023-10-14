"use client";
export default function OpenNewTab(): JSX.Element {
	return (
		<button
			className="btn btn-outline mt-4"
			onClick={() => window.open(".", "_blank")}
			type="button">
			Open in new tab/window
		</button>
	);
}
