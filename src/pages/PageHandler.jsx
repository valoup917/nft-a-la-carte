import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage"
import Home from "./Home"
import Nft from "./Nft"
import NftGeneration from "./NftGeneration"
import MyNfts from "./MyNfts"
import NftsToSell from "./SellsNfts"
import Page404 from "./Page404"

function PageHandler(){
    return (
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" element={<LoginPage/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/nft" element={<Nft/>}/>
                    <Route path="/nftGeneration" element={<NftGeneration />} />
                    <Route path="/myNfts" element={<MyNfts />} />
                    <Route path="/nftOnSale" element={<NftsToSell />} />
                    <Route path="*" element={<Page404 />} />
                </Routes>        
            </div> 
        </BrowserRouter>
    )
}

export default PageHandler;