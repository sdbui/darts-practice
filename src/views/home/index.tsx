import { 
  useNavigate,
  Link,
} from 'react-router-dom';
import styles from './styles.module.scss';

function Home() {
    return (
      <div className={styles.home}>
        <Link to="/accuracy1" className={styles.link}>
          <button>Practice</button>
        </Link>
        <Link to="/stats" className={styles.link}>
          <button>Stats</button>
        </Link>
      </div>
    )
}

export default Home;