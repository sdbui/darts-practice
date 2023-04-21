import dartboardSVG from './imgs/dartboard.svg';
import styles from './styles.module.scss';
import mappings from './data/mapping.json';
import granboardMap from './data/granboard.json';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import { useState, useEffect } from 'react';

type Segment = {
    id: string;
    value: number;
    multiplier: number;
};


function Dartboard ({ onHit, autoScore = false, onSkip = ()=>{}, highlight = null }: {
    onHit?: (e: Segment)=>void,
    autoScore?: boolean,
    onSkip?: ()=>void,
    highlight?: string | null,
}) {
    const [connected, setConnected] = useState(false);

    const [myHighlight, setMyHighlight] = useState(null);

    useEffect(() => {
        // remove all pulse classes if any
        let prevPulses = document.querySelectorAll(`.${styles.pulse}`);
        for (let node of prevPulses) {
            node.classList.remove(styles.pulse)
        }
        if (!highlight) return;
        let targetSegment = document.querySelector(`#${highlight}`);
        targetSegment?.classList.add(styles.pulse);
        // add 'pulse' class to target segment
    }, [highlight]);

    function handleClick(e: any) {
        let id = e.target.id;
        if (id === 'areas') return; // hit the wire... ignore
        let segment = mappings.find(seg => seg.id === id)
        onHit?.(segment as Segment);
    }

    // if autoScore is present... enable bluetooth capability for granboard3
    // TODO: need to set up a keybind -> segment map if using dartslive200s (also have to make sure it is calibrated correctly)
    if (autoScore) {
        // this doesnt work. Bluetooth api requires a user gesture (click) in order to work
        // connectBT();
    }

    async function connectBT() {
        // services/characteristic uuids all were found using chrome's bluetooth tool chrome://bluetooth-internals/#devices
        // could they be different for other boards??? maybe.
        let device = await window.navigator.bluetooth.requestDevice({
            filters: [{name: 'GRANBOARD'}],
            optionalServices: ['442f1570-8a00-9a28-cbe1-e1d4212d53eb'],
        });
        let server = await device.gatt.connect();
        let service = await server.getPrimaryService('442f1570-8a00-9a28-cbe1-e1d4212d53eb')
        let characteristic1 = await service.getCharacteristic('442f1571-8a00-9a28-cbe1-e1d4212d53eb');
        await characteristic1.startNotifications();
        characteristic1.addEventListener('characteristicvaluechanged', onCharacteristicValueChange);
        function onCharacteristicValueChange(e) {
            let val = e.target.value.getUint32();
            if (val === 1195521851) return //ignoring initial connection event ?
            if (val === 1112821312) {
                // this is the red button on the dartboard
                // do we want to send it as a segment or call a different handler?
                return onSkip();
            }
            let segment = mappings.find(seg => seg.id === granboardMap[val]);
            onHit?.(segment as Segment);
        }
        setConnected(true);
    }

    return (
        <div className={styles.container}>  
            {autoScore ? (
                <div onClick={connectBT} className={`${styles.autoScoreBtn} ${connected ? styles.connected : null}`}>
                {/* <button onClick={connectBT} className={styles.autoScoreBtn}> */}
                    <BluetoothIcon 
                        fontSize='inherit'/>
                </div>
            ) : null}
            <svg id="svg2" viewBox="-250 -250 500 500" version="1.0">
            <defs id="defs6">
                <line id="refwire" y2="167.4" y1="16.2" stroke="#c0c0c0" x2="26.52" x1="2.566"/>
                <path id="SLICE" strokeWidth="0" d="m0 0l15.64 98.77c-10.362 1.64-20.918 1.64-31.28 0l15.64-98.77z"/>
                <use id="double" href="#SLICE" transform="scale(1.695)" height="500" width="500" y="0" x="0"/>
                <use id="outer" href="#SLICE" transform="scale(1.605)" height="500" width="500" y="0" x="0"/>
                <use id="triple" href="#SLICE" transform="scale(1.065)" height="500" width="500" y="0" x="0"/>
                <use id="inner" href="#SLICE" transform="scale(.975)" height="500" width="500" y="0" x="0"/>
            </defs>
            <g id="g14" transform="matrix(1.104 0 0 -1.104 -1.3036 -.48743)">
                <circle id="circle16" cy="0" cx="0" r="226"/>
                <g id="dartboard" onClick={handleClick}>
                <g id="g20">
                    <use id="d20" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000" />
                    <use id="s20lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t20" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s20sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g5" transform="rotate(18)">
                    <use id="d5" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s5lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t5" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s5sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g12" transform="rotate(36)">
                    <use id="d12" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s12lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t12" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s12sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g9" transform="rotate(54)">
                    <use id="d9" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s9lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t9" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s9sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g14" transform="rotate(72.001)">
                    <use id="d14" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s14lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t14" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s14sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g11" transform="rotate(90)">
                    <use id="d11" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s11lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t11" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s11sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g8" transform="rotate(108)">
                    <use id="d8" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s8lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t8" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s8sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g16" transform="rotate(126)">
                    <use id="d16" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s16lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t16" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s16sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g7" transform="rotate(144)">
                    <use id="d7" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s7lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t7" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s7sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g19" transform="rotate(162)">
                    <use id="d19" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s19lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t19" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s19sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g3" transform="scale(-1)">
                    <use id="d3" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s3lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t3" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s3sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g17" transform="rotate(198)">
                    <use id="d17" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s17lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t17" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s17sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g2" transform="rotate(216)">
                    <use id="d2" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s2lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t2" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s2sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g15" transform="rotate(234)">
                    <use id="d15" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s15lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t15" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s15sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g10" transform="rotate(252)">
                    <use id="d10" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s10lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t10" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s10sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g6" transform="rotate(-90)">
                    <use id="d6" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s6lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t6" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s6sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g13" transform="rotate(-72.001)">
                    <use id="d13" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s13lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t13" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s13sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g4" transform="rotate(-54)">
                    <use id="d4" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s4lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t4" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s4sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <g id="g18" transform="rotate(-36)">
                    <use id="d18" href="#double" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s18lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#000000"/>
                    <use id="t18" href="#triple" height="500" width="500" y="0" x="0" fill="#ff0000"/>
                    <use id="s18sml" href="#inner" height="500" width="500" y="0" x="0" fill="#000000"/>
                </g>
                <g id="g1" transform="rotate(-18)">
                    <use id="d1" href="#double" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s1lrg" href="#outer" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                    <use id="t1" href="#triple" height="500" width="500" y="0" x="0" fill="#008000"/>
                    <use id="s1sml" href="#inner" height="500" width="500" y="0" x="0" fill="#ffffff"/>
                </g>
                <circle id="sB" strokeWidth="0" cy="0" cx="0" r="16.4" fill="#008000"/>
                <circle id="dB" strokeWidth="0" cy="0" cx="0" r="6.85" fill="#f00"/>
                <g id="grid">
                    <use id="use224" href="#refwire" height="500" width="500" y="0" x="0"/>
                    <use id="use226" href="#refwire" transform="rotate(18)" height="500" width="500" y="0" x="0"/>
                    <use id="use228" href="#refwire" transform="rotate(36)" height="500" width="500" y="0" x="0"/>
                    <use id="use230" href="#refwire" transform="rotate(54)" height="500" width="500" y="0" x="0"/>
                    <use id="use232" href="#refwire" transform="rotate(72.001)" height="500" width="500" y="0" x="0"/>
                    <use id="use234" href="#refwire" transform="rotate(90)" height="500" width="500" y="0" x="0"/>
                    <use id="use236" href="#refwire" transform="rotate(108)" height="500" width="500" y="0" x="0"/>
                    <use id="use238" href="#refwire" transform="rotate(126)" height="500" width="500" y="0" x="0"/>
                    <use id="use240" href="#refwire" transform="rotate(144)" height="500" width="500" y="0" x="0"/>
                    <use id="use242" href="#refwire" transform="rotate(162)" height="500" width="500" y="0" x="0"/>
                    <use id="use244" href="#refwire" transform="scale(-1)" height="500" width="500" y="0" x="0"/>
                    <use id="use246" href="#refwire" transform="rotate(198)" height="500" width="500" y="0" x="0"/>
                    <use id="use248" href="#refwire" transform="rotate(216)" height="500" width="500" y="0" x="0"/>
                    <use id="use250" href="#refwire" transform="rotate(234)" height="500" width="500" y="0" x="0"/>
                    <use id="use252" href="#refwire" transform="rotate(252)" height="500" width="500" y="0" x="0"/>
                    <use id="use254" href="#refwire" transform="rotate(-90)" height="500" width="500" y="0" x="0"/>
                    <use id="use256" href="#refwire" transform="rotate(-72.001)" height="500" width="500" y="0" x="0"/>
                    <use id="use258" href="#refwire" transform="rotate(-54)" height="500" width="500" y="0" x="0"/>
                    <use id="use260" href="#refwire" transform="rotate(-36)" height="500" width="500" y="0" x="0"/>
                    <use id="use262" href="#refwire" transform="rotate(-18)" height="500" width="500" y="0" x="0"/>
                    <circle id="circle264" cx="0" cy="0" stroke="#c0c0c0" r="169.5" fill="none"/>
                    <circle id="circle266" cx="0" cy="0" stroke="#c0c0c0" r="160.5" fill="none"/>
                    <circle id="circle268" cx="0" cy="0" stroke="#c0c0c0" r="106.5" fill="none"/>
                    <circle id="circle270" cx="0" cy="0" stroke="#c0c0c0" r="97.5" fill="none"/>
                    <circle id="circle272" cx="0" cy="0" stroke="#c0c0c0" r="16.4" fill="none"/>
                    <circle id="circle274" cx="0" cy="0" stroke="#c0c0c0" r="6.85" fill="none"/>
                </g>
                </g>
            </g>
            <g id="numbers" pointerEvents="none" fill="#c0c0c0" transform="translate(26.452 47.674)">
                <path id="text277" d="m206.43-47.773c0-1.467-0.5-2.631-1.51-3.494-1-0.851-2.37-1.277-4.12-1.277-1.74 0-3.11 0.426-4.13 1.277-1 0.863-1.5 2.027-1.5 3.494 0 1.466 0.5 2.625 1.5 3.477 1.02 0.862 2.39 1.293 4.13 1.293 1.75 0 3.12-0.431 4.12-1.293 1.01-0.852 1.51-2.011 1.51-3.477m10.23 6.485h-2.97c0.39-0.82 0.68-1.65 0.89-2.491 0.2-0.83 0.3-1.655 0.3-2.474 0-2.157-0.72-3.806-2.18-4.949-1.45-1.132-3.65-1.779-6.6-1.941 0.94 0.636 1.66 1.434 2.15 2.394 0.51 0.959 0.76 2.016 0.76 3.17 0 2.425-0.73 4.339-2.21 5.741-1.47 1.412-3.47 2.118-6 2.118-2.48 0-4.47-0.733-5.97-2.199s-2.25-3.418-2.25-5.854c0-2.793 1.07-4.928 3.21-6.405s5.25-2.215 9.31-2.215c3.82 0 6.86 0.905 9.12 2.717 2.28 1.811 3.41 4.242 3.41 7.293 0 0.82-0.08 1.645-0.24 2.475-0.16 0.841-0.4 1.714-0.73 2.62"/>
                <path id="text279" d="m179.63-133.33l1.65 5.07 17.52-5.69-2.9-5.16 2.83-0.92 2.89 5.13 1.01 3.11-20.35 6.61 1.65 5.07-2.61 0.85-4.3-13.22 2.61-0.85m19.15 25.69c0.16 1.59-0.12 2.97-0.86 4.12-0.73 1.17-1.83 2-3.31 2.47-2.26 0.74-4.27 0.53-6.02-0.62-1.74-1.16-3.08-3.17-4.02-6.04-0.31-0.97-0.54-1.99-0.67-3.08-0.15-1.08-0.21-2.22-0.18-3.43l3-0.97c-0.23 1.02-0.3 2.09-0.22 3.19 0.07 1.11 0.29 2.23 0.66 3.34 0.63 1.95 1.5 3.31 2.6 4.07 1.1 0.78 2.38 0.93 3.85 0.45 1.35-0.44 2.25-1.26 2.7-2.46 0.46-1.19 0.42-2.63-0.13-4.32l-0.87-2.68 2.55-0.83 0.91 2.8c0.5 1.53 1.18 2.6 2.05 3.21 0.88 0.61 1.89 0.73 3.04 0.36 1.18-0.39 1.95-1.1 2.3-2.14 0.36-1.04 0.29-2.34-0.21-3.9-0.28-0.85-0.67-1.73-1.17-2.65-0.5-0.91-1.13-1.89-1.9-2.93l2.76-0.9c0.72 1.07 1.32 2.1 1.82 3.07 0.5 0.98 0.9 1.93 1.19 2.84 0.77 2.36 0.84 4.4 0.21 6.12-0.62 1.72-1.85 2.88-3.67 3.47-1.27 0.42-2.47 0.4-3.59-0.04-1.1-0.44-2.05-1.28-2.82-2.52"/>
                <path id="text281" d="m169.29-188.85l-15.27 0.91 4.84 6.67 10.43-7.58m1.8-2.36l2.42 3.32-12.74 9.25 2.03 2.79-2.2 1.59-2.02-2.78-4.61 3.34-1.91-2.63 4.61-3.34-6.41-8.82 2.55-1.85 18.28-0.87"/>
                <path id="text283" d="m89.936-238.99l4.318 3.14 10.826-14.9-5.38-2.47 1.75-2.41 5.35 2.45 2.65 1.92-12.579 17.31 4.319 3.14-1.618 2.22-11.252-8.17 1.616-2.23m27.324 9.08c-1.25-0.91-2.49-1.29-3.7-1.15-1.2 0.16-2.23 0.82-3.09 2-0.85 1.18-1.17 2.36-0.94 3.55 0.24 1.2 0.98 2.25 2.24 3.17 1.25 0.91 2.49 1.29 3.7 1.15 1.22-0.16 2.25-0.82 3.1-1.99 0.86-1.18 1.17-2.36 0.93-3.56-0.23-1.19-0.97-2.25-2.24-3.17m-1.82-3.04c-0.93-1.1-1.44-2.28-1.51-3.51-0.06-1.24 0.31-2.41 1.12-3.53 1.14-1.56 2.59-2.39 4.35-2.49 1.78-0.1 3.64 0.56 5.57 1.96 1.95 1.42 3.14 2.98 3.59 4.69s0.11 3.35-1.03 4.91c-0.81 1.12-1.81 1.83-3.01 2.15s-2.46 0.21-3.78-0.33c1.05 1.22 1.62 2.52 1.7 3.9 0.09 1.38-0.32 2.7-1.23 3.94-1.37 1.9-3.01 2.93-4.9 3.1s-3.91-0.52-6.06-2.09c-2.16-1.57-3.45-3.28-3.87-5.13s0.06-3.72 1.44-5.61c0.9-1.25 2.03-2.04 3.37-2.39 1.34-0.34 2.76-0.2 4.25 0.43m2.06-4.88c-0.73 1.01-0.99 2.03-0.78 3.05 0.23 1.03 0.91 1.96 2.05 2.79s2.23 1.19 3.28 1.08c1.06-0.09 1.95-0.65 2.69-1.66 0.73-1.01 0.98-2.04 0.75-3.07s-0.9-1.96-2.04-2.78c-1.14-0.83-2.24-1.2-3.29-1.09-1.04 0.11-1.92 0.67-2.66 1.68"/>
                <path id="text285" d="m35.237-262.76l5.075 1.65 5.693-17.52-5.882-0.68 0.92-2.83 5.85 0.67 3.107 1.01-6.611 20.35 5.075 1.65-0.849 2.62-13.228-4.3 0.85-2.62"/>
                <path id="text287" d="m-42.456-271.72h11.401v2.75h-15.331v-2.75c1.24-1.28 2.927-3 5.062-5.16 2.145-2.16 3.493-3.56 4.043-4.19 1.046-1.17 1.774-2.16 2.183-2.97 0.421-0.82 0.631-1.62 0.631-2.41 0-1.28-0.453-2.33-1.358-3.14-0.895-0.81-2.065-1.21-3.51-1.21-1.024 0-2.108 0.18-3.251 0.53-1.132 0.36-2.345 0.9-3.638 1.62v-3.3c1.315-0.53 2.544-0.93 3.687-1.2s2.189-0.4 3.137-0.4c2.502 0 4.496 0.62 5.984 1.87 1.488 1.26 2.232 2.93 2.232 5.02 0 0.99-0.189 1.93-0.566 2.83-0.367 0.88-1.04 1.93-2.022 3.14-0.269 0.31-1.126 1.21-2.571 2.71-1.445 1.49-3.482 3.58-6.113 6.26m25.196-19.24c-1.681 0-2.948 0.83-3.8 2.49-0.841 1.65-1.261 4.13-1.261 7.45 0 3.31 0.42 5.8 1.261 7.46 0.852 1.65 2.119 2.47 3.8 2.47 1.693 0 2.96-0.82 3.801-2.47 0.852-1.66 1.278-4.15 1.278-7.46 0-3.32-0.426-5.8-1.278-7.45-0.841-1.66-2.108-2.49-3.801-2.49m0-2.59c2.707 0 4.771 1.07 6.195 3.22 1.4335 2.13 2.1505 5.24 2.1505 9.31s-0.717 7.17-2.1505 9.32c-1.424 2.13-3.488 3.2-6.195 3.2-2.706 0-4.776-1.07-6.21-3.2-1.423-2.15-2.134-5.25-2.134-9.32s0.711-7.18 2.134-9.31c1.434-2.15 3.504-3.22 6.21-3.22"/>
                <path id="text289" d="m-110.08-278.97l12.198-3.96 0.849 2.61-9.347 3.04 1.82 5.63c0.41-0.3 0.82-0.56 1.25-0.78 0.42-0.23 0.86-0.42 1.31-0.56 2.566-0.84 4.824-0.79 6.778 0.12 1.953 0.92 3.32 2.58 4.099 4.98 0.803 2.47 0.659 4.65-0.433 6.52-1.095 1.86-3.042 3.25-5.841 4.16-0.964 0.31-1.975 0.55-3.033 0.71-1.05 0.16-2.16 0.25-3.33 0.27l-1.02-3.12c1.09 0.2 2.17 0.26 3.23 0.19s2.144-0.29 3.242-0.65c1.774-0.57 3.027-1.5 3.759-2.77 0.733-1.26 0.839-2.7 0.319-4.3-0.519-1.6-1.449-2.7-2.788-3.29-1.338-0.6-2.895-0.61-4.672-0.03-0.83 0.27-1.63 0.63-2.4 1.08-0.76 0.45-1.51 1.01-2.24 1.68l-3.75-11.53"/>
                <path id="text291" d="m-172.84-219.08l4.31-3.14-10.82-14.9-4.02 4.36-1.75-2.41 3.99-4.34 2.64-1.92 12.58 17.31 4.32-3.13 1.61 2.22-11.25 8.17-1.61-2.22m18.82-13.68l9.23-6.7 1.61 2.22-12.4 9.02-1.62-2.23c0.25-1.77 0.61-4.15 1.07-7.15 0.46-3.01 0.73-4.93 0.81-5.76 0.15-1.57 0.16-2.8 0.01-3.69-0.14-0.91-0.44-1.69-0.9-2.32-0.76-1.04-1.74-1.62-2.95-1.74-1.2-0.13-2.38 0.23-3.55 1.08-0.83 0.6-1.6 1.38-2.31 2.34-0.71 0.95-1.38 2.1-2 3.45l-1.94-2.67c0.76-1.2 1.52-2.25 2.28-3.14 0.77-0.89 1.54-1.61 2.3-2.17 2.03-1.47 4.01-2.14 5.95-2s3.52 1.05 4.75 2.75c0.58 0.8 0.98 1.67 1.2 2.62 0.23 0.93 0.3 2.17 0.21 3.73-0.03 0.41-0.19 1.64-0.48 3.7s-0.72 4.94-1.27 8.66"/>
                <path id="text293" d="m-210.84-172.68l-2.41-1.75c0.8-0.44 1.53-0.93 2.19-1.49s1.23-1.17 1.7-1.83c1.27-1.74 1.65-3.49 1.15-5.26-0.51-1.78-1.91-3.6-4.2-5.47 0.38 1.05 0.49 2.11 0.33 3.18-0.17 1.07-0.59 2.07-1.28 3.01-1.41 1.96-3.13 3.08-5.14 3.36s-4.04-0.33-6.09-1.82c-2-1.46-3.18-3.22-3.53-5.29s0.19-4.09 1.62-6.06c1.64-2.26 3.76-3.35 6.36-3.27 2.6 0.06 5.54 1.28 8.84 3.68 3.08 2.24 5.01 4.76 5.78 7.56 0.77 2.79 0.26 5.41-1.53 7.88-0.48 0.67-1.03 1.29-1.66 1.88-0.62 0.58-1.33 1.14-2.13 1.69m-4.46-11.28c0.86-1.19 1.14-2.42 0.83-3.7s-1.16-2.44-2.58-3.47c-1.4-1.02-2.76-1.47-4.08-1.37s-2.41 0.74-3.28 1.92c-0.86 1.19-1.13 2.43-0.82 3.72 0.31 1.28 1.17 2.43 2.57 3.45 1.42 1.03 2.78 1.49 4.09 1.39 1.32-0.11 2.41-0.75 3.27-1.94"/>
                <path id="text295" d="m-245.6-101.16l1.65-5.07-17.52-5.69-0.68 5.88-2.83-0.92 0.67-5.85 1.01-3.11 20.35 6.61 1.65-5.07 2.61 0.85-4.29 13.22-2.62-0.85m-8.54-33.72l9.71 11.83 2.54-7.85-12.25-3.98m-2.98-0.07l1.27-3.9 14.97 4.86 1.06-3.28 2.59 0.84-1.07 3.28 5.42 1.76-1.01 3.09-5.41-1.76-3.37 10.37-3-0.98-11.45-14.28"/>
                <path id="text297" d="m-251.31-31.245v-5.337h-18.42l1.16 5.806h-2.97l-1.17-5.774v-3.267h21.4v-5.337h2.75v13.909h-2.75m0-21.024v-5.337h-18.42l1.16 5.806h-2.97l-1.17-5.774v-3.267h21.4v-5.337h2.75v13.909h-2.75"/>
                <path id="text299" d="m-247.86 23.336c-0.48-1.476-1.25-2.512-2.31-3.106-1.07-0.585-2.29-0.652-3.68-0.202-1.38 0.45-2.33 1.223-2.85 2.321-0.51 1.107-0.53 2.399-0.05 3.876s1.26 2.512 2.32 3.107c1.08 0.591 2.3 0.663 3.68 0.217 1.38-0.45 2.33-1.229 2.84-2.336 0.52-1.098 0.54-2.39 0.05-3.877m0.32-3.536c-0.11-1.44 0.17-2.682 0.84-3.727 0.68-1.035 1.67-1.766 2.98-2.192 1.84-0.597 3.5-0.417 4.99 0.539 1.49 0.966 2.61 2.587 3.35 4.863 0.74 2.287 0.79 4.255 0.15 5.903-0.65 1.649-1.89 2.772-3.72 3.368-1.31 0.427-2.55 0.414-3.7-0.038-1.16-0.442-2.11-1.271-2.87-2.487 0.14 1.61-0.16 2.996-0.91 4.156-0.74 1.171-1.85 1.994-3.31 2.471-2.23 0.723-4.16 0.595-5.79-0.382-1.63-0.967-2.85-2.717-3.68-5.249-0.82-2.533-0.86-4.675-0.11-6.425 0.75-1.74 2.24-2.971 4.46-3.694 1.47-0.477 2.84-0.46 4.13 0.051s2.35 1.459 3.19 2.843m4.53-2.733c-1.19 0.387-1.99 1.057-2.42 2.012-0.42 0.965-0.42 2.119 0.02 3.463 0.43 1.333 1.1 2.265 2.01 2.797 0.92 0.542 1.97 0.62 3.16 0.234 1.19-0.387 1.99-1.068 2.41-2.043 0.43-0.965 0.42-2.114-0.01-3.447-0.44-1.343-1.11-2.281-2.02-2.813-0.91-0.522-1.96-0.589-3.15-0.203"/>
                <path id="text301" d="m-231.99 79.277l3.13 4.317 14.91-10.827-4.36-4.012 2.41-1.75 4.33 3.987 1.92 2.643-17.31 12.576 3.14 4.318-2.22 1.616-8.18-11.252 2.23-1.616m24.96 16.285c-0.86-1.187-1.95-1.834-3.27-1.942-1.31-0.1-2.67 0.363-4.09 1.39-1.4 1.02-2.26 2.173-2.58 3.458-0.31 1.287-0.03 2.522 0.83 3.712 0.87 1.18 1.95 1.83 3.27 1.93s2.69-0.36 4.09-1.38c1.42-1.03 2.27-2.18 2.58-3.471 0.31-1.279 0.03-2.511-0.83-3.697m12.09-0.771l-2.4 1.749c-0.17-0.891-0.42-1.737-0.75-2.538-0.32-0.792-0.72-1.519-1.2-2.182-1.27-1.745-2.83-2.651-4.68-2.72-1.84-0.061-4 0.709-6.48 2.308 1.14-0.037 2.19 0.187 3.15 0.672 0.97 0.479 1.8 1.184 2.48 2.118 1.42 1.962 1.95 3.945 1.58 5.942-0.36 2.01-1.56 3.76-3.61 5.25-2 1.45-4.04 2.03-6.12 1.72-2.07-0.3-3.83-1.44-5.26-3.41-1.64-2.26-2.03-4.615-1.17-7.065 0.87-2.456 2.94-4.878 6.23-7.268 3.09-2.243 6.08-3.297 8.98-3.163 2.9 0.128 5.25 1.427 7.05 3.895 0.48 0.663 0.9 1.378 1.25 2.145 0.37 0.775 0.68 1.624 0.95 2.547"/>
                <path id="text303" d="m-162.66 124.2l12.56 9.13-0.82 1.13-20.47 13.25-2.76-2 19.25-12.47-9.38-6.81 1.62-2.23"/>
                <path id="text305" d="m-118.05 175l5.07 1.65 5.7-17.52-5.88-0.69 0.92-2.83 5.85 0.68 3.1 1.01-6.61 20.35 5.08 1.64-0.85 2.62-13.23-4.3 0.85-2.61m18.854 8.49l0.919-2.83c0.659 0.62 1.357 1.16 2.094 1.61 0.736 0.46 1.489 0.81 2.258 1.06 2.051 0.67 3.838 0.49 5.361-0.54 1.537-1.03 2.838-2.92 3.905-5.68-0.881 0.68-1.855 1.12-2.92 1.29-1.066 0.18-2.153 0.08-3.26-0.28-2.297-0.74-3.892-2.03-4.786-3.85-0.88-1.82-0.928-3.94-0.145-6.35 0.766-2.36 2.078-4.03 3.936-5 1.857-0.97 3.945-1.08 6.262-0.33 2.656 0.87 4.349 2.54 5.081 5.04 0.745 2.48 0.488 5.67-0.771 9.54-1.177 3.62-2.977 6.23-5.403 7.84-2.412 1.59-5.069 1.92-7.971 0.98-0.779-0.25-1.544-0.59-2.294-1-0.749-0.42-1.505-0.92-2.266-1.5m9.346-7.73c1.395 0.45 2.652 0.33 3.772-0.36 1.13-0.68 1.965-1.86 2.505-3.52 0.536-1.65 0.549-3.09 0.039-4.31-0.497-1.22-1.443-2.06-2.838-2.52-1.394-0.45-2.658-0.33-3.792 0.37-1.12 0.69-1.948 1.86-2.484 3.51-0.54 1.66-0.56 3.1-0.059 4.32 0.51 1.22 1.463 2.06 2.857 2.51"/>
                <path id="text307" d="m-24.828 181.71c1.563 0.33 2.781 1.03 3.655 2.08 0.884 1.06 1.326 2.37 1.326 3.92 0 2.38-0.82 4.22-2.458 5.53-1.639 1.3-3.968 1.96-6.987 1.96-1.013 0-2.059-0.11-3.137-0.31-1.068-0.2-2.173-0.49-3.316-0.89v-3.15c0.906 0.52 1.898 0.92 2.976 1.19s2.205 0.41 3.38 0.41c2.049 0 3.607-0.41 4.674-1.22 1.078-0.81 1.617-1.98 1.617-3.52 0-1.43-0.501-2.54-1.504-3.33-0.992-0.81-2.377-1.22-4.156-1.22h-2.814v-2.68h2.943c1.607 0 2.836-0.32 3.688-0.96 0.851-0.64 1.277-1.57 1.277-2.78 0-1.24-0.442-2.19-1.326-2.84-0.873-0.67-2.129-1.01-3.768-1.01-0.895 0-1.855 0.1-2.879 0.3-1.024 0.19-2.151 0.49-3.38 0.9v-2.91c1.24-0.35 2.399-0.6 3.477-0.78 1.089-0.17 2.113-0.26 3.073-0.26 2.48 0 4.442 0.57 5.887 1.7 1.444 1.12 2.167 2.64 2.167 4.56 0 1.34-0.383 2.47-1.148 3.4-0.766 0.92-1.855 1.55-3.267 1.91"/>
                <path id="text309" d="m30.332 185.46l5.076-1.65-5.692-17.52-5.162 2.91-0.92-2.83 5.132-2.9 3.107-1.01 6.611 20.35 5.076-1.65 0.85 2.62-13.228 4.3-0.85-2.62m12.061-26.41l14.766-4.8 0.43 1.32-1.305 24.35-3.246 1.05 1.233-22.89-11.028 3.58-0.85-2.61"/>
                <path id="text311" d="m110.03 148.56l9.23-6.7 1.61 2.22-12.4 9.01-1.62-2.22c0.25-1.77 0.61-4.15 1.07-7.15 0.46-3.02 0.73-4.94 0.8-5.77 0.16-1.56 0.17-2.79 0.02-3.69-0.14-0.91-0.44-1.68-0.9-2.32-0.76-1.04-1.74-1.62-2.95-1.74-1.2-0.13-2.38 0.24-3.55 1.08-0.83 0.61-1.6 1.39-2.316 2.35-0.706 0.95-1.371 2.1-1.993 3.44l-1.939-2.66c0.753-1.21 1.513-2.25 2.279-3.14 0.767-0.89 1.534-1.61 2.301-2.17 2.028-1.47 4.008-2.14 5.948-2 1.93 0.14 3.52 1.05 4.75 2.74 0.58 0.81 0.98 1.68 1.2 2.63 0.23 0.93 0.3 2.17 0.21 3.72-0.03 0.41-0.19 1.65-0.48 3.71-0.3 2.05-0.72 4.94-1.27 8.66"/>
                <path id="text313" d="m156.56 106.7l3.14-4.32-14.91-10.825-2.47 5.382-2.4-1.749 2.45-5.355 1.92-2.643 17.31 12.576 3.13-4.318 2.23 1.616-8.18 11.256-2.22-1.62m-5.27-29.153l7.54-10.376 2.23 1.616-5.78 7.955 4.78 3.48c0.15-0.479 0.34-0.933 0.55-1.361 0.21-0.434 0.46-0.844 0.74-1.227 1.58-2.181 3.43-3.474 5.55-3.879s4.2 0.133 6.24 1.616c2.11 1.528 3.27 3.37 3.48 5.528 0.21 2.151-0.55 4.417-2.28 6.798-0.59 0.82-1.27 1.607-2.03 2.36-0.76 0.745-1.6 1.469-2.54 2.174l-2.66-1.93c1-0.474 1.91-1.054 2.73-1.74 0.82-0.685 1.56-1.494 2.24-2.427 1.1-1.509 1.57-2.993 1.42-4.45-0.16-1.458-0.92-2.681-2.28-3.67-1.36-0.988-2.75-1.331-4.19-1.026-1.43 0.304-2.7 1.211-3.79 2.72-0.52 0.706-0.95 1.47-1.31 2.29-0.35 0.812-0.62 1.705-0.82 2.678l-9.82-7.129"/>
                <path id="text315" d="m195.39 42.165l1.65-5.076-17.52-5.692-0.68 5.881-2.83-0.919 0.67-5.851 1.01-3.107 20.35 6.612 1.65-5.076 2.62 0.85-4.3 13.227-2.62-0.849m-9.82-32.049c-0.52 1.6-0.12 3.061 1.19 4.384 1.31 1.31 3.55 2.478 6.71 3.504 3.14 1.023 5.64 1.391 7.48 1.104 1.83-0.3 3-1.25 3.52-2.85 0.53-1.61 0.13-3.069-1.18-4.379-1.31-1.323-3.54-2.4961-6.69-3.519-3.16-1.0261-5.65-1.3891-7.49-1.0888-1.84 0.2868-3.02 1.2351-3.54 2.8448m-2.46-0.7995c0.84-2.5737 2.49-4.2058 4.97-4.8964 2.48-0.704 5.65-0.4264 9.53 0.833 3.86 1.2561 6.6 2.8975 8.19 4.9239 1.59 2.014 1.97 4.307 1.13 6.881-0.83 2.573-2.49 4.212-4.96 4.916-2.48 0.691-5.65 0.408-9.52-0.848-3.87-1.259-6.61-2.895-8.2-4.909-1.6-2.026-1.98-4.327-1.14-6.9005"/>
            </g>
            </svg>

        </div>

    )
}

export default Dartboard;
export { mappings };
export type {
    Segment,
}


/**
 * used this to calibrate the granboard... maybe can add a calibration step if user needs it?
 * 
        let ids = ['sB', 'dB', 's20lrg','s19lrg','s18lrg','s17lrg','s16lrg','s15lrg','s14lrg','s13lrg','s12lrg','s11lrg','s10lrg','s9lrg','s8lrg','s7lrg','s6lrg','s5lrg','s4lrg','s3lrg','s2lrg','s1lrg','d20','d19','d18','d17','d16','d15','d14','d13','d12','d11','d10','d9','d8','d7','d6','d5','d4','d3','d2','d1','t20','t19','t18','t17','t16','t15','t14','t13','t12','t11','t10','t9','t8','t7','t6','t5','t4','t3','t2','t1', 's20sml','s19sml','s18sml','s17sml','s16sml','s15sml','s14sml','s13sml','s12sml','s11sml','s10sml','s9sml','s8sml','s7sml','s6sml','s5sml','s4sml','s3sml','s2sml','s1sml']
        let calibration = {};
        while (ids.length) {
            let top = ids.pop();

            console.log('hit button for: ',top);
            let code = await new Promise((res, rej) => {
                characteristic1.addEventListener('characteristicvaluechanged', (e) => {
                    let val = e.target.value.getUint32();
                    res(val)
                }, {once: true})
            })
            if (code === 1195521851) {
                ids.push(top);
                continue;
            } else {
                calibration[code] = top;
            }
        }
        console.log(calibration)
 * 
 * 
 */