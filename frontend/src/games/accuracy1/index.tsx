import { useState, useEffect, useRef } from "react";
import Dartboard, { 
    Segment,
    mappings as Mapping,
} from "../../components/dartboard";
import styles from './styles.module.scss';
import Dart from '../../components/dart';
import RestartAlt from "@mui/icons-material/RestartAlt";
import Home from '@mui/icons-material/Home';
import Insights from '@mui/icons-material/Insights';
import StatsService from '../../views/stats/stats-service';
import { useNavigate } from 'react-router-dom';

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

interface SegmentAccuracy {
    thrown: number;
    hit: number;
}

interface GameAccuracy {
    [segment: string]: SegmentAccuracy;
    overall: SegmentAccuracy;
    s13lrg: SegmentAccuracy;
    s14lrg: SegmentAccuracy;
    s15lrg: SegmentAccuracy;
    s16lrg: SegmentAccuracy;
    s17lrg: SegmentAccuracy;
    s18lrg: SegmentAccuracy;
    s19lrg: SegmentAccuracy;
    s20lrg: SegmentAccuracy;
    sB: SegmentAccuracy;
}

const defaultAccuracy: GameAccuracy = {
    overall: { hit: 0, thrown: 0 },
    s13lrg: { hit: 0, thrown: 0 },
    s14lrg: { hit: 0, thrown: 0 },
    s15lrg: { hit: 0, thrown: 0 },
    s16lrg: { hit: 0, thrown: 0 },
    s17lrg: { hit: 0, thrown: 0 },
    s18lrg: { hit: 0, thrown: 0 },
    s19lrg: { hit: 0, thrown: 0 },
    s20lrg: { hit: 0, thrown: 0 },
    sB: { hit: 0, thrown: 0 }
}

function Accuracy1() {
    const navigate = useNavigate();
    let targetQueue = useRef(JSON.parse(localStorage.getItem('targetQueue') || 'null') || [...defaultTargetIds]);
    let [tallies, setTallies] = useState(JSON.parse(localStorage.getItem('tallies') || 'null') || {...defaultTallies});
    const [gameOver, setGameOver] = useState(false)
    const [currentTarget, setCurrentTarget] = useState<string>(localStorage.getItem('currentTarget') || ''); 
    const [round, setRound] = useState<number>(parseInt(localStorage.getItem('round') || '1'));
    const [dartsThrown, setDartsThrown] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);
    const [currentTargetText, setCurrentTargetText] = useState<string | number>('');
    const [throwStatus, setThrowStatus] = useState<ThrowStatus>(defaultThrowStatus);
    const [highlight, setHighlight] = useState('');
    let [accuracy, setAccuracy] = useState(JSON.parse(localStorage.getItem('accuracy') || 'null') || JSON.parse(JSON.stringify(defaultAccuracy)));
    const [boardType, setBoardType] = useState<'soft' | 'steel'>('soft');


    // hacky fix for callbacks in Dartboard component being called with original states always
    // instead of checking state directly, check a reference to it that is updated everytime state changes.... is there a better way to do this?
    let currentTargetRef = useRef(currentTarget);
    let dartsThrownRef = useRef(dartsThrown);
    let hitCountRef = useRef(hitCount);
    let talliesRef = useRef(tallies);
    let roundRef = useRef(round);
    let accuracyRef = useRef(accuracy);
    useEffect(()=> {
        dartsThrownRef.current = dartsThrown;
        hitCountRef.current = hitCount;
        talliesRef.current = tallies;
        roundRef.current = round;
        accuracyRef.current = accuracy;

        localStorage.setItem('tallies', JSON.stringify(tallies));
        localStorage.setItem('round', `${round}`);
        localStorage.setItem('accuracy', JSON.stringify(accuracy));
    },[dartsThrown, hitCount, tallies, round, accuracy]);

    useEffect(() => {
        currentTargetRef.current = currentTarget;
        localStorage.setItem('currentTarget', currentTarget);
        localStorage.setItem('targetQueue', JSON.stringify(targetQueue.current));
        let segment = Mapping.find(segment => segment.id === currentTarget);
        let targetText = segment?.id === 'sB' ? 'B' : (segment?.value || '');
        setCurrentTargetText(targetText);
        setHighlight(currentTarget);
    }, [currentTarget]);

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

    function updateAccuracy(targetId: string, hit: number) {
        let newAccuracy = JSON.parse(JSON.stringify(accuracyRef.current));
        newAccuracy[targetId].thrown+=3;
        newAccuracy[targetId].hit +=hit;
        newAccuracy.overall.hit +=hit;
        newAccuracy.overall.thrown +=3;
        setAccuracy(newAccuracy);
        return newAccuracy;
    }

    function nextRound() {
        // check current round to see if we need to update anything
        let acc = updateAccuracy(currentTargetRef.current, hitCountRef.current);
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
                console.log('COMPLETE!');
                StatsService.addResult({
                    rounds: roundRef.current,
                    accuracy: acc,
                    board: boardType,
                });

                setGameOver(true);
                localStorage.clear();
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
        localStorage.clear();
        cleanup();
        startGame();
    }
    function cleanup() {
        setCurrentTarget('');
        targetQueue.current = [...defaultTargetIds];
        setAccuracy(JSON.parse(JSON.stringify(defaultAccuracy)));
        setRound(1);
        setHitCount(0);
        setDartsThrown(0);
        setGameOver(false);
        setTallies({...defaultTallies});
        setThrowStatus(defaultThrowStatus);
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
        if (!localStorage.getItem('currentTarget')) {
            startGame();
        }
        return () => {
            // don't cleanup if there is anything in localStorage
            if (!localStorage.getItem('currentTarget')) {
                cleanup();
            }
        }
    },[]);

    function goHome() {
        navigate('/');
    }
    function goStats() {
        navigate('/stats');
    }

    function toggleBoardType() {
        setBoardType(currentType => {
            return currentType === 'soft' ? 'steel' : 'soft'
        });
    }

    function debugCompletion() {
        const almostComplete = {
            s20lrg: 4,
            s19lrg: 4,
            s18lrg: 4,
            s17lrg: 4,
            s16lrg: 4,
            s15lrg: 4,
            s14lrg: 4,
            s13lrg: 4,
            sB: 4
        }
        setTallies(almostComplete);
    }

    return (
        <div className={styles.container}>
            <div className={styles.game}>
                {/* <button onClick={debugCompletion}>mockcomplete</button> */}
                <div className={styles.boardTypeToggle}>
                    <span>Steel Tip</span>
                    <input type="checkbox" id="board-type" onChange={toggleBoardType}></input>
                    <label htmlFor="board-type"></label>
                </div>
                <div className={styles.gameActions}>
                    <div onClick={resetGame} className={styles.action}>
                        <RestartAlt fontSize="inherit"/>
                    </div>
                    <div onClick={goHome} className={styles.action}>
                        <Home fontSize="inherit"/>
                    </div>
                    <div onClick={goStats} className={styles.action}>
                        <Insights fontSize="inherit"/>
                    </div>
                </div>
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
                    <button onClick={manualMiss} className={styles.missBtn}>MISS</button>
                    <button disabled className={styles.undoBtn}>UNDO</button>
                    <button onClick={nextRound} className={styles.nextRoundBtn}>NEXT</button>
                </div>
            </div>
            <TallyBoard includeBull tallies={tallies}></TallyBoard>
            {gameOver ? <CompletedOverlay rounds={roundRef.current} onReset={() => {
                resetGame();
            }} accuracy={accuracyRef.current} /> : null}
        </div>
    )

}

function CompletedOverlay({onReset, rounds, accuracy}: {
    onReset?: () => void,
    rounds: number,
    accuracy: GameAccuracy
}) {
    return (
        <div className={styles.overlay}>
            <div className={styles.completeMessage}>
                <h1>Complete! Good Job</h1>
                <p>You took <strong>{rounds}</strong> rounds to finish</p>
                <section>
                    <AccuracyBreakdown accuracy={accuracy}/>
                </section>
                <button onClick={onReset}>Play Again</button>
            </div>
        </div>
    )
}

function AccuracyBreakdown({accuracy}: {accuracy: GameAccuracy}) {

    const format = (num: number) => {
        return (num * 100).toFixed(2);
    }

    return (
        <div className={styles.accuracyBreakdown}>
            <div className={styles.segmentAccuracy}>
                <div className={styles.segmentName}>overall</div>
                <div>{format(accuracy.overall.hit / accuracy.overall.thrown)}</div>
            </div>
            <div className={styles.segmentList}>
            {Object.keys(accuracy).map((key,idx) => {
                if (key === 'overall') return null;
                let segment = Mapping.find(x => x.id === key);
                return (
                    <div key={idx} className={styles.segmentAccuracy}>
                        <div className={styles.segmentName}>{segment?.value === 25 ? 'B' : segment?.value ? segment?.value : key}</div>
                        <div className={styles.segmentPercent}>{format(accuracy[key].hit / accuracy[key].thrown)}</div>
                    </div>
                )
            })}
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