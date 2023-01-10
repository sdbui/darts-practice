import { useState, useEffect, useRef } from "react";
import Dartboard, { Segment } from "../../components/dartboard";
import styles from './styles.module.scss';


interface Tally {
    id: number;
}

const defaultTargetIds: string[] = [
    's20', 's19', 's18', 's17', 's16', 's15', 's14', 's13', 'sB'
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
    // let targetQueue = useRef([...defaultTargets]);
    let targetQueue = useRef([...defaultTargetIds]);
    let [tallies, setTallies] = useState(defaultTallies)
    const [gameOver, setGameOver] = useState(false)
    const [currentTarget, setCurrentTarget] = useState<string>('');
    const [round, setRound] = useState<number>(1);
    const [dartsThrown, setDartsThrown] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);


    // hacky fix for callbacks in Dartboard component being called with original states always
    // instead of checking state directly, check a reference to it that is updated everytime state changes.... is there a better way to do this?
    let currentTargetRef = useRef(currentTarget);
    let dartsThrownRef = useRef(dartsThrown);
    let hitCountRef = useRef(hitCount);
    useEffect(()=> {
        currentTargetRef.current = currentTarget;
        dartsThrownRef.current = dartsThrown;
        hitCountRef.current = hitCount;
    },[currentTarget, dartsThrown, hitCount])

    function handleHit(segment: Segment) {
        // do nothing if already thrown 3 darts in this round
        if (dartsThrownRef.current === 3) return;
        setDartsThrown(prev => prev + 1);

        // seperate case for bull since double and single are the same
        let hitId = segment.id;
        if (hitId === 'dB') hitId = 'sB'; // targets and tallies both use sB 
        console.log('currentTarget in handleHit:', currentTargetRef?.current)
        if (hitId === currentTargetRef.current) {
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
        if (hitCountRef.current >= 2) {
            // we hit our target 2 times... decrement remaining and add back to queue
            addTallyMark(currentTargetRef.current);

            // talies wont be updated until next render... so if the current tallies is 4, that means it will be 5 next render.
            // therefore, don't add back to the targetQueue
            console.log('currentTarget in nextRound:', currentTargetRef.current)
            if (tallies[currentTargetRef.current] < 4) {
                targetQueue.current.push(currentTarget);
            }
            // check for completion
            if (!targetQueue.current.length) {
                console.log('COMPLETE!')
                setGameOver(true);
                return;
            }
        } else {
            // didnt hit... add back to queue
            targetQueue.current.push(currentTargetRef.current!);
        }

        setRound(round => round + 1);
        setDartsThrown(0);
        // get next target
        let newTarget = targetQueue.current.shift();
        setCurrentTarget(newTarget!);
        setHitCount(0);

    }

    function startGame() {
        let topTarget = targetQueue.current.shift();
        setCurrentTarget(topTarget!);
    }
    function resetGame() {
        cleanup();
        startGame();
    }
    function cleanup() {
        setCurrentTarget('');
        targetQueue.current = [...defaultTargetIds];
        setRound(1);
        setHitCount(0);
        setDartsThrown(0);
        setGameOver(false);
        setTallies(defaultTallies)
    }

    function manualHit() {
        // todo: we only really need the id here so adjust handleHit accordingly
        let segment: Segment = {
            id: currentTarget as string,
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
                    <p>currentTarget: {currentTarget}</p>
                    <p>hit: {hitCount} / 3</p>
                    
                </div>
                <div className={styles.dartboardContainer}>
                    <Dartboard autoScore
                        onHit={handleHit}
                        onSkip={nextRound}></Dartboard>
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
}
function TallyBoard({tallies, includeBull = false}: TallyProps) {
    return (
        <>
            <ul>
                <li className={styles.tallyListItem}>
                    <p>20:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s20).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>19:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s19).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>18:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s18).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>17:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s17).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>16:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s16).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>15:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s15).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>14:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s14).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={styles.tallyListItem}>
                    <p>13:</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s13).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>
                {includeBull ? (<li className={styles.tallyListItem}>
                    <p>Bull</p>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.sB).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20: ${i}`}></div>)
                        })}
                    </div>
                </li>) : null}
            </ul>
        </>
    )
}

export default Accuracy1;