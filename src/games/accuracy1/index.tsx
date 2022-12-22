import { useState, useEffect, useRef } from "react";
import Dartboard, { Segment } from "../../components/dartboard";
import styles from './styles.module.scss';


interface Target {
    id: string;
    remaining: number;
}
interface Tally {
    id: number;
}
const defaultTargets: Target[] = [
    {
        id: 's20',
        remaining: 1
    },
    {
        id: 's19',
        remaining: 2
    },
    {
        id: 's18',
        remaining: 1
    },
    {
        id: 's17',
        remaining: 5
    },
    {
        id: 's16',
        remaining: 5
    },
    {
        id: 's15',
        remaining: 5
    },
    {
        id: 's14',
        remaining: 5
    },
    {
        id: 's13',
        remaining: 5
    },
    {
        id: 'sB',
        remaining: 5
    }
];
const defaultTallies: {[key: string]: number} = {
    s20: 0,
    s19: 0,
    s18: 0,
    s17: 0,
    s16: 0,
    s15: 0,
    s14: 0,
    s13: 0,
    sB: 0,
}

function Accuracy1() {
    let targetQueue = useRef([...defaultTargets]);
    let [tallies, setTallies] = useState(defaultTallies)
    const [gameOver, setGameOver] = useState(false)
    const [currentTarget, setCurrentTarget] = useState<Target | null>();
    const [round, setRound] = useState<number>(1);
    const [dartsThrown, setDartsThrown] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);


    function handleHit(segment: Segment) {
        // do nothing if already thrown 3 darts in this round
        if (dartsThrown === 3) return;
        setDartsThrown(prev => prev + 1);

        // seperate case for bull since double and single are the same
        let hitId = segment.id;
        if (hitId === 'dB') hitId = 'sB'; // targets and tallies both use sB 
        if (hitId === currentTarget?.id) {
            setHitCount((prev) => prev + 1);
        }
    }
    function addTallyMark(targetId: string) {
        let newTallies = {...tallies};
        newTallies[targetId]++;
        setTallies(newTallies);
    }

    function nextRound() {
        // check current round to see if we need to update anything
        if (hitCount >= 2) {
            addTallyMark(currentTarget!.id);

            // we hit our target 2 times... decrement remaining and add back to queue
            if (currentTarget!.remaining > 1) {
                let updatedTarget = {
                    ...currentTarget,
                    remaining: currentTarget!.remaining - 1
                } as Target;
                targetQueue.current.push(updatedTarget);
            }
            // check for completion
            if (!targetQueue.current.length) {
                console.log('COMPLETE!')
                setGameOver(true);
                return;
            }
        } else {
            // didnt hit... add back to queue
            targetQueue.current.push(currentTarget!);
        }

        setRound(round => round + 1);
        setDartsThrown(0);
        // get next target
        let newTarget = targetQueue.current.shift();
        setCurrentTarget(newTarget);
        setHitCount(0);

    }

    function startGame() {
        let topTarget = targetQueue.current.shift();
        setCurrentTarget(topTarget);
    }
    function resetGame() {
        cleanup();
        startGame();
    }
    function cleanup() {
        setCurrentTarget(null);
        targetQueue.current = [...defaultTargets];
        setRound(1);
        setHitCount(0);
        setDartsThrown(0);
        setGameOver(false);
        setTallies(defaultTallies)
    }

    function manualHit() {
        // todo: we only really need the id here so adjust handleHit accordingly
        let segment: Segment = {
            id: currentTarget?.id as string,
            value: 0,
            multiplier: 0
        };
        handleHit(segment);
    }
    function manualMiss(){
        let segment: Segment = {
            id: 'notexist',
            value: 0,
            multiplier: 0,
        }
        handleHit(segment);
    }

    useEffect(() => {
        console.log('what')
        startGame();
        return () => {
            cleanup();
        }
    },[]);
    return (
        <div className={styles.container}>
            <div className={styles.game}>
                <button onClick={resetGame} className={styles.resetButton}>reset game</button>
                <div className={styles.roundInfo}>
                    <p>Round: {round}</p>
                    <p>hit: {hitCount} / 3</p>
                    <p>currentTarget: {currentTarget?.id}</p>
                </div>
                <div className={styles.dartboardContainer}>
                    <Dartboard onHit={handleHit}></Dartboard>
                </div>
                <div>
                    darts thrown: {dartsThrown}
                </div>
                <div className={styles.roundActions}>
                    <button onClick={manualHit}>HIT</button>
                    <button onClick={manualMiss}>MISS</button>
                    <button disabled className={styles.undoBtn}>UNDO</button>
                    <button onClick={nextRound} className={styles.nextRoundBtn}>next</button>
                </div>
            </div>
            <TallyBoard includeBull tallies={tallies}></TallyBoard>
            {gameOver ? <CompletedOverlay onReset={() => {
                resetGame();
            }} /> : null}
        </div>
    )

}

function CompletedOverlay({onReset}: {
    onReset?: () => void
}) {
    return (
        <div className={styles.overlay}>
            <div className={styles.completeMessage}>
                <p>COMPLETE! Good Job</p>
                <button onClick={onReset}>Play Again</button>
            </div>
        </div>
    )
}

interface TallyProps {
    tallies: typeof defaultTallies,
    includeBull?: boolean,
    autoScore?: boolean,
}
function TallyBoard({tallies, includeBull = false}: TallyProps) {
    return (
        <>
            <ul>
                <li>20: {tallies.s20}</li>
                <li>19: {tallies.s19}</li>
                <li>18: {tallies.s18}</li>
                <li>17: {tallies.s17}</li>
                <li>16: {tallies.s16}</li>
                <li>15: {tallies.s15}</li>
                <li>14: {tallies.s14}</li>
                <li>13: {tallies.s13}</li>
                {includeBull ? (<li>Bull: {tallies.sB} </li>) : null}
            </ul>
        </>
    )
}

export default Accuracy1;