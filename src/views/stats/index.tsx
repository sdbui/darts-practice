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

import {
    line
} from 'd3-shape';
import {
    regressionLinear
} from 'd3-regression';

function Stats() {
    const navigate = useNavigate();
    let data: GameResult[] = mockData;

    const Line = ({ data }: {data: GameResult[]}) => {
        // format data for nivo
    
        let formatted = data.map((d, idx) => {
            return {
                x: idx,
                y: d.rounds
            }
        })

        // add some regression line data to this chart
        const RegressionLine = ({ xScale, yScale, points}) => {
            let linearRegressionGenerator = regressionLinear()
                .x(d => d.x)
                .y(d => d.y)
            let regression = linearRegressionGenerator(points);
            const lineGenerator = line()
                .x(d => d[0])
                .y(d => d[1]);

            // color the regression line
            /* 
                Note: SVG coords start from top left corner being 0,0
                so if a line trends upwards... its actually a negative slope, thats why "a" seems to be reversed.
            */
           let lineColor = regression.a > 0 ? 'green' : 'red';
            return (
                <path
                    d={lineGenerator(regression)}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3"
                ></path>
            )
        }
        
        let lineData = [{
            id: 'steven',
            data: formatted
        }]

        // TODO: Can opt to make look like scatterplot by removing 'lines' from layers
        return (
            <ResponsiveLine
                data={lineData}
                enableGridX={false}
                yScale={{
                    type: 'linear',
                    min: 40,
                    max: 'auto',
                }}
                layers={["grid", "axes", 'lines', RegressionLine, 'points', "markers", "legends"]}
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
                <Line data={data}></Line>
            </div>
        </div>
    )
}

export default Stats