"use client";
import { useMyStore } from "../store";
import styles from "./page.module.css";

export default function NotSyncedCounter() {
	const [_count, set_Count] = useMyStore(state => [state._count, state.set_Count]);
	return (
		<div className={styles.card}>
			<h2>Not Synced Counter:</h2>
			<button onClick={() => set_Count(_count + 1)}>🖤 {_count}</button>
		</div>
	);
}
