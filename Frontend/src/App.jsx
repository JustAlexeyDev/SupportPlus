import { Route, Routes } from "react-router";

// import pages
import Home from "./Pages/Home/Home";

const App = () => {
    return(
        <div>
            <Routes>
                <Route path={"Home" || ""} element={<Home />}/>
                <Route path="/*" element={<Home />}/>
            </Routes>
        </div>
    );
}
export default App;