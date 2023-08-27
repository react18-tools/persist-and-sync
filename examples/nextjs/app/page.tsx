import NotSyncedCounter from "./NotSyncedCounter";
import OpenNewTab from "./OpenNewTab";
import SyncedCounter from "./SyncedCounter";
import styles from "./page.module.css";

export default function Page(): JSX.Element {
	return (
		<div className={styles.container}>
			<header>
				<h1>Zustand Persist and Sync Next.js Example</h1>
			</header>
			<SyncedCounter />
			<NotSyncedCounter />
			<OpenNewTab />
		</div>
	);
}
