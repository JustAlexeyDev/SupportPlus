import './Header.css';
import { Link } from "react-router";

import SearchComponent from "../SearchComponent/SearchComponent";

const Header = () => {
    return(
        <div className='Header'>
            <Link>
                <img alt="logo"/>
            </Link>

            <SearchComponent />

            <Link>
                Support Button
            </Link>

            <Link>All services</Link>
        </div>
    );
}
export default Header;