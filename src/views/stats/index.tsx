import {
    useNavigate
} from 'react-router-dom';
import mockData from '../../data/mockResults.json';
import { ResponsiveLine } from '@nivo/line';
import {
    Accuracy,
    GameResult,
} from '../../common/types';
import styles from './styles.module.scss';

function Stats() {
    const navigate = useNavigate();
    let data: GameResult[] = mockData;

    const TestLine = ({ data }: {data: GameResult[]}) => {
        // format data for nivo
        
        let formatted = data.map((d, idx) => {
            return {
                x: idx,
                y: d.rounds
            }
        })
        let finalLine = [{
            id: 'steven',
            data: formatted
        }]
        return (
            <ResponsiveLine
                data={finalLine}
                enableGridX={false}
                yScale={{
                    type: 'linear',
                    min: 40,
                    max: 'auto',
                }}
            ></ResponsiveLine>
        )
    }
    const goHome = () => {
        navigate('/');
    }
    return (
        <div>
            <button onClick={goHome}>Home</button>
            <h1>Last 30 games of A1</h1>
            <div className={styles.test}>
                <TestLine data={data}></TestLine>
            </div>
        </div>
    )
}

export default Stats