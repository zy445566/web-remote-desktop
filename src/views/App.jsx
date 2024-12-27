import styles from "./index.module.css";
import RemoteScreen from './RemoteScreen/index';

const App = () => {
    return (
        <div className={styles.app}>
            <RemoteScreen />
        </div>
    );
};

export default App;
