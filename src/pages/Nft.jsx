import React, { useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Tesseract from 'tesseract.js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'
import MenuIconsComponent from "../components/MenuIcon.jsx"
import ErrorModalComponent from "../components/ErrorModal.jsx"
import LoadingModalComponent from "../components/LoadingModal"
import { getFirestore, getDoc, updateDoc, doc } from 'firebase/firestore';

function Nft(){
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const history = useNavigate()
  const db = getFirestore();

    const chefs = [
      "anne-sophie pic",
      "bernard pacaud",
      "frederic anton",
      "pedro-bena bastos",
      "rogelio garcia"
    ];

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (!file) {
      setError("Ticket de caisse déjà utilisé")
      return;
    }

    setLoading("Notre IA travail...")
    const { data } = await Tesseract.recognize(
      file,
      'fra'
    );
    const imageText = data.text;

    const nftTicketsDocRef = doc(db, "nft", "tickets");
    const nftTicketsDocSnapshot = await getDoc(nftTicketsDocRef);
    var allTicketsTextsTmp = nftTicketsDocSnapshot.data().allTickets;

    if (allTicketsTextsTmp.includes(imageText)) {
      setLoading(null)
      setError("Ticket de caisse déjà utilisé")
      return;
    }
    
    allTicketsTextsTmp.push(imageText);
    await updateDoc(nftTicketsDocRef, { allTickets: allTicketsTextsTmp });

    chefs.forEach(mot => {
      if (imageText.toLowerCase().includes(mot)) {
        setLoading(null)
        Cookies.set("NftChefGenration", mot, { expires: 7, secure: true });
        Cookies.set("Uploaded", false, { expires: 7, secure: true });
        history("/NftGeneration")
        return;
      }
    });

    setLoading(null)
    
  };

    return (
      <div>
        <ErrorModalComponent Error={error} />
        {
          loading &&
          <LoadingModalComponent Text={loading} />
        }
        <MenuIconsComponent myNfts={true} home={true} nftOnSale={true} />

        <h1 className='mt-20 text-white text-center text-6xl'
        style={{fontFamily: "Oswald"}}>
          Créer ton NFT !
        </h1>

        <div className="mt-20 flex items-center justify-center font-sans">
          <label htmlFor="file-upload" className="mx-auto cursor-pointer flex w-full max-w-3xl h-[50vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e6b7c7] bg-[#171519] p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#e6b7c7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h2 className="mt-4 text-xl font-medium text-white tracking-wide">Ticket de caisse</h2>
            <p className="mt-2 text-gray-200 tracking-wide"> Téléchargez ou glissez votre image PNG, JPG. </p>
            <input onChange={(e) => handleFileUpload(e)} id="file-upload" type="file" className="hidden"/>
          </label>
        </div>
      
      </div>
    )
}

export default Nft;