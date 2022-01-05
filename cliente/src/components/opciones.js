import swal from 'sweetalert2';

const Opciones = ({ roomID }) => {
    return (
        <div className="row opciones justify-content-center">
            <div className="col-md-12">
                <div className="row menu justify-content-center align-items-center">
                    <button id="link" className="opcion" onClick={() => {
                        swal.fire({
                            title: "Codigo de reunion",
                            text: roomID
                        })
                    }}><i className="fas fa-link"></i></button>
                    <button id="microphone" className="opcion"><i className="fas fa-microphone" data-bs-placement="top" title="Tooltip on top"></i></button>
                    <button id="video" className="opcion"><i className="fas fa-video"></i></button>
                    <button id="shareScreen" className="opcion"><i className="fas fa-tv"></i></button>
                    <button id="personas" className="opcion"><i className="fas fa-user-friends"></i></button>
                    <button id="chat" className="opcion"><i className="fas fa-comment-dots"></i></button>
                    <a style={{ textDecoration: "none" }} href="/" className="opcion"><i
                        style={{ transform: "rotate(225deg)" }} className="fas fa-phone"></i></a>
                </div>
            </div>
        </div>
    );
}

export default Opciones;