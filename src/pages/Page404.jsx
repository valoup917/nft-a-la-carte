import React from 'react';
import robot404 from "../assets/icon/404Icon.png";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './Home.css'
import MenuIconsComponent from "../components/MenuIcon.jsx"
import { useNavigate } from 'react-router-dom'

function Page404() {
  const history = useNavigate()
  return (
    <div>
      <MenuIconsComponent myNfts={true} home={true} nftOnSale={true} />
      <div className="fixed mt-10 left-0 top-0 flex h-full w-full items-center justify-center py-10">
        <div className="max-h-full w-full max-w-3xl overflow-y-auto sm:rounded-2xl bg-white">
          <div className="w-full">
            <div className="m-8 my-20 min-w-[100%] mx-auto">
              <div className="justify-center items-center flex mx-20">
                <div className="justify-center items-center flex space-x-20">
                  <img
                    src={robot404}
                    alt="Error 404 Icon"
                    className='h-80'
                  />
                  <h1 className="text-3xl font-extrabold text-center text-black justify-center items-center">
                    Vous êtes perdu ?
                  </h1>
                </div>
              </div>
            </div>
            <div className="px-20 flex mb-8">
              <button
                className="block w-full select-none mr-1 rounded-lg bg-black hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-300 shadow-md transition-all focus:opacity-[0.85]  active:opacity-[0.85]"
                type="button"
                data-ripple-light="true"
                style={{ fontFamily: "Oswald" }}
                onClick={(e) => { e.preventDefault(); history("/home"); }}
              >
                Rentrer à la maison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page404;