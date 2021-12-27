import imagen from '../imagenes/Logo.png';
import { Link } from "react-router-dom";
import pdf from '../manual.pdf';

function Navegacion() {
    return (
        <nav className="navbar navbar-dark bg-transparent">
            <div className="container-fluid">
                <div className="row justify-content-start col-md-1 col-sm-2 col-3">
                    <Link to="/">
                        <img src={imagen} className="col-md-12 col-sm-12 col-12" alt="vision" />
                    </Link>
                </div>
                <div className="justify-content-end">
                    <Link to="/">
                        <button style={{ color: "white" }} type="button" className="btn btn-transparent">Inicio</button>
                    </Link>
                    <Link to={pdf} target="_blank">
                        <button style={{ color: "white" }} type="button" className="btn btn-transparent">Ayuda</button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navegacion;