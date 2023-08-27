"use client";
import { useMyStore } from "../store";
import styles from "./page.module.css";

export default function SyncedCounter() {
	const [count, setCount] = useMyStore(state => [state.count, state.setCount]);
	return (
		<div className={styles.card}>
			<h2>Synced Counter:</h2>
			<button onClick={() => setCount(count + 1)}>💖 {count}</button>
		</div>
	);
}
