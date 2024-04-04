import React from 'react';
import homeIcon from "../assets/icon/homeIcon.png"
import myNftsIcon from "../assets/icon/myNftsIcon.png"
import nftOnSaleIcon from "../assets/icon/nftOnSaleIcon.png"
import { useNavigate } from 'react-router-dom'

function MenuIconsComponent({ myNfts, home, nftOnSale }) {
    const history = useNavigate()
    function redirect(e, destination) {
        e.preventDefault();
        history(destination)
    }

    return (
        <div className='flex justify-center items-center mt-8 space-x-8'>
            <img className="h-14 hover:scale-150 duration-500 ease-in-out cursor-pointer"
                src={myNftsIcon}
                alt="my Nfts Icon"
                style={myNfts ? { visibility: "visible" } : { visibility: "hidden" }}
                onClick={(e) => redirect(e, "/myNfts")}
            />
            <img className="h-14 hover:scale-150 duration-500 ease-in-out cursor-pointer"
                src={homeIcon}
                alt="home Icon"
                style={home ? { visibility: "visible" } : { visibility: "hidden" }}
                onClick={(e) => redirect(e, "/home")}
            />
            <img className="h-14 hover:scale-150 duration-500 ease-in-out cursor-pointer"
                src={nftOnSaleIcon}
                alt="nft On Sale Icon"
                style={nftOnSale ? { visibility: "visible" } : { visibility: "hidden" }}
                onClick={(e) => redirect(e, "/nftOnSale")}
            />
        </div>
    );
}

export default MenuIconsComponent;