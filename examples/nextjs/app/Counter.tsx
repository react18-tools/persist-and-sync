"use client";
import { useMyStore } from "../store";
import styles from "./page.module.css";

interface CounterProps {
	synced?: boolean;
}

export default function Counter({ synced = false }: CounterProps): JSX.Element {
	const [count, setCount] = useMyStore(state =>
		synced ? [state.count, state.setCount] : [state._count, state.set_Count],
	);
	return (
		<div className={styles.card}>
			<h2>{synced ? "" : "Not "}Synced Counter:</h2>
			<button
				onClick={() => {
					setCount(count + 1);
				}}
				type="button">
				{synced ? "💖" : "🖤"} {count}
			</button>
		</div>
	);
}
