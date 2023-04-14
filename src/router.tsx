import {
    createBrowserRouter
} from 'react-router-dom';
import Accuracy1 from './games/accuracy1';
import Home from './views/home';
import Stats from './views/stats'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
    },
    {
        path: '/accuracy1',
        element: <Accuracy1></Accuracy1>,
    },
    {
        path: '/stats',
        element: <Stats/>
    }
]); 

export default router;