import icon from "../../Assets/Icons/icon.png"
import {
    Phone,
    ScanFace,
    CircleArrowRight
} from "lucide-react";

import { Link } from "react-router";

const FirstLogin = () => {
    return (
        <div className="Auth--Container">
            <div className="Auth--Content">
                <img className="Auth--Content--logo" width={200} src={icon} alt="icon" />

                <div className="Auth--Container__Block">
                    <Link
                        to="/login/phone"  
                        className="second--button--type1 second--button--accent">
                        <Phone />
                        <p>Войти по номеру телефона</p>
                    </Link>

                    <div className="Auth--Container__Block--JCSB">
                        <Link
                            to="/loginviaface"  
                            className="second--button--type1">
                            <ScanFace />
                            <p>Войти по лицу</p>
                        </Link>
                        <Link
                            to="/login/username" 
                            className="second--button--type1">
                            <CircleArrowRight />
                            <p>Войти по логину</p>
                        </Link>
                    </div>

                    <div className="Footer--Content--Text--Center">
                        <Link>Не могу войти</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default FirstLogin;