import swal from 'sweetalert2';

const Opciones = ({ roomID }) => {
    return (
        <div className="row opciones justify-content-end">
            <div className="col-md-6">
                <div className="row menu justify-content-center align-items-center">
                    <button className="col-md-1 opcion"><i className="fas fa-microphone-slash"></i></button>
                    <a style={{ color: "black", textDecoration: "none" }} href="/" className="col-md-1 opcion"><i
                        style={{ transform: "rotate(225deg)" }} className="fas fa-phone"></i></a>
                    <button id="video" className="col-md-1 opcion"><i className="fas fa-video-slash"></i></button>
                </div>
            </div>
            <div className="col-md-3">
                <div className="row menu justify-content-center align-items-center">
                    <button id="chat" className="col-md-2 opcion"><i className="fas fa-comment-dots"></i></button>
                    <button id="personas" className="col-md-2 opcion"><i className="fas fa-user-friends"></i></button>
                    <button id="link" className="col-md-2 opcion" onClick={() => {
                        swal.fire({
                            title: "Codigo de reunion",
                            text: roomID
                        })
                    }}><i className="fas fa-link"></i></button>
                </div>
            </div>
        </div>
    );
}

export default Opciones;