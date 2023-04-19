import { useState, useEffect, useRef } from "react";
import Dartboard, { 
    Segment,
    mappings as Mapping,
} from "../../components/dartboard";
import styles from './styles.module.scss';
import Dart from '../../components/dart';
import RestartAlt from "@mui/icons-material/RestartAlt";

interface Tally {
    id: number;
}

enum ThrowType {
    Hit = 'hit',
    Miss = 'miss',
}

interface ThrowStatus {
    [num: number]: ThrowType | null
    1: ThrowType | null;
    2: ThrowType | null;
    3: ThrowType | null;
}

const defaultTargetIds: string[] = [
    's20lrg', 's19lrg', 's18lrg', 's17lrg', 's16lrg', 's15lrg', 's14lrg', 's13lrg', 'sB'
];
const defaultThrowStatus: ThrowStatus = {1: null, 2: null, 3: null};

const defaultTallies: {[key: string]: number} = {
    s20lrg: 0,
    s19lrg: 0,
    s18lrg: 0,
    s17lrg: 0,
    s16lrg: 0,
    s15lrg: 0,
    s14lrg: 0,
    s13lrg: 0,
    sB: 0,
}

function Accuracy1() {
    let targetQueue = useRef([...defaultTargetIds]);
    let [tallies, setTallies] = useState(defaultTallies)
    const [gameOver, setGameOver] = useState(false)
    const [currentTarget, setCurrentTarget] = useState<string>('');
    const [round, setRound] = useState<number>(1);
    const [dartsThrown, setDartsThrown] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);
    const [currentTargetText, setCurrentTargetText] = useState<string | number>('');
    const [throwStatus, setThrowStatus] = useState<ThrowStatus>(defaultThrowStatus);
    const [highlight, setHighlight] = useState('');


    // hacky fix for callbacks in Dartboard component being called with original states always
    // instead of checking state directly, check a reference to it that is updated everytime state changes.... is there a better way to do this?
    let currentTargetRef = useRef(currentTarget);
    let dartsThrownRef = useRef(dartsThrown);
    let hitCountRef = useRef(hitCount);
    let talliesRef = useRef(tallies)
    useEffect(()=> {
        dartsThrownRef.current = dartsThrown;
        hitCountRef.current = hitCount;
        talliesRef.current = tallies;
    },[dartsThrown, hitCount, tallies])

    useEffect(() => {
        currentTargetRef.current = currentTarget;
        let segment = Mapping.find(segment => segment.id === currentTarget);
        let targetText = segment?.id === 'sB' ? 'B' : segment?.value;
        setCurrentTargetText(targetText);
        setHighlight(currentTarget);
    }, [currentTarget])

    function handleHit(segment: Segment) {
        // do nothing if already thrown 3 darts in this round
        if (dartsThrownRef.current === 3) return;
        setDartsThrown(prev => prev + 1);

        // seperate case for bull since double and single are the same
        let hitId = segment.id;
        if (hitId === 'dB') hitId = 'sB'; // targets and tallies both use sB 
        let throwNumber = dartsThrownRef.current + 1; // plus 1 because the state didnt update yet...
        if (hitId === currentTargetRef.current) {
            // its a hit
            setHitCount((prev) => prev + 1);
            setThrowStatus(prevThrowStatus => {
                let newStatus = {...prevThrowStatus};
                newStatus[throwNumber] = ThrowType.Hit;
                return newStatus;
            });
        } else {
            // its a miss
            setThrowStatus(prevThrowStatus => {
                let newStatus = {...prevThrowStatus};
                newStatus[throwNumber] = ThrowType.Miss;
                return newStatus;
            });
        }
    }
    function addTallyMark(targetId: string) {
        let newTallies = {...talliesRef.current};
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
            if (talliesRef.current[currentTargetRef.current] < 4) {
                targetQueue.current.push(currentTargetRef.current);
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
        setThrowStatus(defaultThrowStatus);

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
                <button onClick={resetGame} className={styles.resetButton}>
                    <RestartAlt fontSize="inherit"/>
                </button>
                <div className={styles.roundInfo}>
                    <p className={styles.round}>Round: {round}</p>
                    <p className={styles.currentTarget}>{currentTargetText}</p>
                    
                </div>
                <div className={styles.dartboardContainer}>
                    <Dartboard autoScore
                        onHit={handleHit}
                        onSkip={nextRound}
                        highlight={highlight}></Dartboard>
                </div>
                <div className={styles.dartsThrown}>
                    <div className={throwStatus[1] ? `${styles.throwStatus} ` + styles[throwStatus[1]]: styles.throwStatus}>
                        <Dart/>
                    </div>
                    <div className={throwStatus[2] ? `${styles.throwStatus} ` + styles[throwStatus[2]]: styles.throwStatus}>
                        <Dart/>
                    </div>
                    <div className={throwStatus[3] ? `${styles.throwStatus} ` + styles[throwStatus[3]]: styles.throwStatus}>
                        <Dart/>
                    </div>
                </div>
                <div className={styles.roundActions}>
                    <button onClick={manualHit}>HIT</button>
                    <button onClick={manualMiss}>MISS</button>
                    <button disabled className={styles.undoBtn}>UNDO</button>
                    <button onClick={nextRound} className={styles.nextRoundBtn}>NEXT</button>
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
            <ul className={styles.tallyList}>
                <li className={`${styles.tallyListItem} ${tallies.s20lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>20</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s20lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`20:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s19lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>19</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s19lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`19:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s18lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>18</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s18lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`18:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s17lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>17</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s17lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`17:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s16lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>16</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s16lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`16:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s15lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>15</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s15lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`15:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s14lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>14</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s14lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`14:${i}`}></div>)
                        })}
                    </div>
                </li>
                <li className={`${styles.tallyListItem} ${tallies.s13lrg === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>13</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.s13lrg).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`13:${i}`}></div>)
                        })}
                    </div>
                </li>
                {includeBull ? (<li className={`${styles.tallyListItem} ${tallies.sB === 5 ? styles.complete : null}`}>
                    <div className={styles.tallyTarget}>B</div>
                    <div className={styles.tallyMarks}>
                        {new Array(tallies.sB).fill('').map((v, i) => {
                            return (<div className={styles.tallyMark} key={`bull:${i}`}></div>)
                        })}
                    </div>
                </li>) : null}
            </ul>
        </>
    )
}

export default Accuracy1;