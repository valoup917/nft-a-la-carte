import React, { useState, useEffect } from 'react';
import errorIcon1 from "../assets/icon/errorIcon1.png"
import errorIcon2 from "../assets/icon/errorIcon1.png"
import errorIcon3 from "../assets/icon/errorIcon1.png"

function ErrorModalComponent({ Error }) {
    const [errorImage, setErrorImage] = useState('');

    useEffect(() => {
        const errorIcons = [errorIcon1, errorIcon2, errorIcon3];
        const randomIndex = Math.floor(Math.random() * errorIcons.length);
        const selectedIcon = errorIcons[randomIndex];
        setErrorImage(selectedIcon);
    }, []);
    return (
        Error && (
            <div className="z-50 fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
                <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
                    <div className="m-8 max-w-[500px] mx-auto">
                        <div className="justify-center items-center flex">
                            <img
                                src={errorImage}
                                alt="Error Icon"
                                className='h-60 mr-6'
                            />
                            <h1 className="text-3xl font-extrabold text-center">
                            {Error}
                            </h1>
                        </div>
                        <div className="px-6 pt-2 flex">
                            <button
                                className="block w-full select-none mr-1 rounded-lg bg-black hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-300 shadow-md transition-all focus:opacity-[0.85]  active:opacity-[0.85]"
                                type="button"
                                data-ripple-light="true"
                                style={{ fontFamily: "Oswald" }}
                                onClick={(e) => { e.preventDefault();window.location.reload(); }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}

export default ErrorModalComponent;