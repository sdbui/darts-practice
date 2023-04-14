import styles from './styles.module.scss';
import Accuracy1 from './games/accuracy1';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  return (
    <div className={styles.App}>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App