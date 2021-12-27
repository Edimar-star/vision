import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateRoom from './views/CreateRoom'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<CreateRoom />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;