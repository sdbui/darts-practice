import {
    useNavigate
} from 'react-router-dom';
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
import Home from '@mui/icons-material/Home';
import VideogameAssetOutlined from '@mui/icons-material/VideogameAssetOutlined';

import StatsService from './stats-service';
import { useLoaderData } from 'react-router-dom';

function Stats() {
    const { results } = useLoaderData() as any;
    const navigate = useNavigate();
    let data: GameResult[] = results;

    const Line = ({ data }: {data: GameResult[]}) => {
        // format data for nivo
    
        let formatted = data.map((d, idx) => {
            return {
                x: idx,
                y: d.rounds
            }
        })

        // add some regression line data to this chart
        const RegressionLine = ({ xScale, yScale, points}: {xScale: any, yScale: any, points: any}) => {
            let linearRegressionGenerator = regressionLinear()
                .x((d: any) => d.x)
                .y((d: any) => d.y)
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
                    d={lineGenerator(regression) as any}
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
        
        // moving this out here as it can get quite large
        const nivoTheme = {
            textColor: '#ddd',
            axis: {
                domain: {
                    line: {
                        stroke: '#ddd'
                    }
                }
            }
        }
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
                margin={{top: 50, right: 50, bottom: 50, left: 50}}
                lineWidth={2}
                theme={nivoTheme}
                axisBottom={null}
            ></ResponsiveLine>
        )
    }
    const goHome = () => {
        navigate('/');
    }
    const goPractice = () => {
        navigate('/accuracy1')
    }
    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <div onClick={goHome}>
                    <Home fontSize="inherit"/>
                </div>
                <div onClick={goPractice}>
                    <VideogameAssetOutlined fontSize="inherit"/>
                </div>
            </div>
            <p className={styles.title}>Latest results of A1</p>
            <div className={styles.test}>
                <Line data={data}></Line>
            </div>
        </div>
    )
}

const statsLoader = async () => {
    let results = await StatsService.getLatestResults();
    return {
        results
    }
}

export {
    statsLoader
}
export default Stats