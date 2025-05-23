"use client";
export default function OpenNewTab() {
	return (
		<button
			className="btn btn-outline mt-4"
			onClick={() => window.open(".", "_blank")}
			type="button">
			Open in new tab/window
		</button>
	);
}
