import { useState } from 'react'

import styles from './styles.module.scss';
import Dartboard from './components/dartboard';
import { Segment } from './components/dartboard';

import Accuracy1 from './games/accuracy1';

function App() {
  // const [count, setCount] = useState(0)
  const [lastHit, setLastHit] = useState<Segment>();

  function handleHit(segment: Segment): void {
    setLastHit(segment);
  }

  return (
    <div className={styles.App}>
      <Accuracy1></Accuracy1>

      {/* <Dartboard onHit={handleHit}/>
      {lastHit ? (
        <>
          <p>Last Segment Hit: {lastHit?.id}</p>
          <p>Value: {lastHit.value * lastHit.multiplier}</p>
        </>
      ) : null} */}
    </div>
  )
}

export default App



{/* <div className="App">
<div>
  <a href="https://vitejs.dev" target="_blank">
    <img src="/vite.svg" className="logo" alt="Vite logo" />
  </a>
  <a href="https://reactjs.org" target="_blank">
    <img src={reactLogo} className="logo react" alt="React logo" />
  </a>
</div>
<h1>Vite + React</h1>
<div className="card">
  <button onClick={() => setCount((count) => count + 1)}>
    count is {count}
  </button>
  <p>
    Edit <code>src/App.tsx</code> and save to test HMR
  </p>
</div>
<p className="read-the-docs">
  Click on the Vite and React logos to learn more
</p>
</div> */}
