import React from 'react';

function LoadingModalComponent({ Text }) {
    return (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10 z-30">
            <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
                <div className="w-full">
                    <div className="m-8 my-20 max-w-[400px] mx-auto">
                        <div className="mb-8 justify-center items-center flex">
                            <svg fill='none' className="w-16 h-16 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
                                <path clipRule='evenodd'
                                    d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
                                    fill='currentColor' fillRule='evenodd' />
                            </svg>
                            <h1 className="text-3xl font-extrabold">
                                {Text}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingModalComponent;