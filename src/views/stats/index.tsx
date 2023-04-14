import {
    useNavigate
} from 'react-router-dom';

function Stats() {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
    }

    return (
        <div>
            <p>stats todo</p>
            <button onClick={goHome}>Home</button>
        </div>
    )
}

export default Stats