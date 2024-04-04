import React, { useEffect, useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Cookies from 'js-cookie';
import nftAssets from "../assets/icon/nft.png";
import { deployNftRequest } from "../requests/requests"
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'
import MenuIconsComponent from "../components/MenuIcon.jsx"
import LoadingModalComponent from "../components/LoadingModal"
import ErrorModalComponent from "../components/ErrorModal"

function NftGeneration() {
  const [chef, setChef] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [nftDeployementData, setNftDeployementData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [nftAlreadyInUsed, setNftAlreadyInUsed] = useState([])
  const [errorMessage, setErrorMessage] = useState(null);

  const history = useNavigate()
  const db = getFirestore();

  const nbrOfPictureGenerateByAI = { "anne-sophie pic": 25, "bernard pacaud": 34, "frederic anton": 34, "pedro-bena bastos": 34, "rogelio garcia": 34 }

  function generateRandomNumber(x) {
    return Math.floor(Math.random() * x) + 1;
  }

  function capitalizeFirstLetter(string) {
    if (string === null)
      return null
    const words = string.split(' ');
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capitalizedWords.join(' ');
  }

  async function importImage(baseNbr, nbr) {
    try {
      if (baseNbr === 34) {
        if (nftAlreadyInUsed.includes(`men/${nbr}.jpeg`) && nftAlreadyInUsed.length < 33) {
          //nft picture already in used
          importImage(importImage, generateRandomNumber(baseNbr));
        }
        var { default: image } = (await import(`../assets/iaGeneration/men/${nbr}.jpeg`));
        setImagePath(`men/${nbr}.jpeg`)
        Cookies.set("nftPath", `men/${nbr}.jpeg`);
      }
      else {
        if (nftAlreadyInUsed.includes(`women/${nbr}.jpeg`) && nftAlreadyInUsed.length < 25) {
          //nft picture already in used
          importImage(importImage, generateRandomNumber(baseNbr));
        }
        var { default: image } = (await import(`../assets/iaGeneration/women/${nbr}.jpeg`)).default;
        setImagePath(`women/${nbr}.jpeg`)
        Cookies.set("nftPath", `women/${nbr}.jpeg`);
      }
      setImageSrc(image);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image :', error);
    }
  };

  async function generateNft(e) {
    e.preventDefault();
    console.log("laaaaaaa")
    const baseNbrTmp = nbrOfPictureGenerateByAI[chef]
    const nbrTmp = generateRandomNumber(baseNbrTmp)
    importImage(baseNbrTmp, nbrTmp)
  }

  async function uploadNft(e) {
    e.preventDefault();

    setLoading("Déploiement de votre NFT sur le XRP Ledger...")
    const jwt = Cookies.get("jwt");
    
    try {
      const nftDeployementDataTmp = await deployNftRequest(jwt, imagePath);
      setLoading(null);
      setNftDeployementData(nftDeployementDataTmp);
      Cookies.set("Uploaded", true, { expires: 7, secure: true });
    } catch (error) {
      console.error(error);
      setLoading(null);
      setErrorMessage(error.data)
    }
  }

  function redirect(e, path) {
    e.preventDefault();
    history(path);
  }

  useEffect(() => {

    const isNftUploaded = Cookies.get("Uploaded");
    if (isNftUploaded === "true")
      history("/home");

    async function checkNftAlreadyGenerated() {
      const nftAlreadyGenerated = Cookies.get("nftPath");
      const chefTmp = Cookies.get("NftChefGenration");
      setChef(chefTmp)
      if (typeof nftAlreadyGenerated !== "undefined") {
        var { default: image } = await import("../assets/iaGeneration/" + nftAlreadyGenerated);
        setImagePath(nftAlreadyGenerated)
        setImageSrc(image);
      } else {
        const baseNbrTmp = nbrOfPictureGenerateByAI[chefTmp]
        const nbrTmp = generateRandomNumber(baseNbrTmp)
        importImage(baseNbrTmp, nbrTmp)
      }

      const userDocRef = doc(db, "nft", "alreadyUsed");
      const userDocSnapshot = await getDoc(userDocRef);
      var allPaths = userDocSnapshot.data().imagePaths;
      setNftAlreadyInUsed(allPaths)
    }

    checkNftAlreadyGenerated();

    return () => {
      Cookies.remove("nftPath")
      Cookies.remove("NftChefGenration")
    }
  }, []);

  return (
    <div>
      {
        errorMessage &&
        <ErrorModalComponent Error={errorMessage} />
      }
      {
        loading &&
        <LoadingModalComponent Text={loading} />
      }
      <MenuIconsComponent myNfts={true} home={true} nftOnSale={true} />
      <h1 className='mt-14 text-white text-center text-6xl'
        style={{ fontFamily: "Oswald" }}>
        Voici votre NFT du chef <span> {chef ? capitalizeFirstLetter(chef) : ""} </span>
      </h1>
      <div className='flex justify-center items-center'>
        <img className='absolute right-52 bottom-4 z-10 w-72 top-[27%] -right-[21%] z-10' src={nftAssets} alt="" />
        <div className="mt-16 relative flex w-full max-w-[26rem] flex-col rounded-xl bg-[#e6b7c7] bg-clip-border text-gray-700 shadow-lg">
          <div className="relative mx-4 mt-4 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40">
            {
              imageSrc ?
                <img className='' src={imageSrc} alt={`chef ${imageSrc}`} />
                :
                <svg fill='none' className="w-16 h-16 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
                  <path clipRule='evenodd'
                    d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
                    fill='currentColor' fillRule='evenodd' />
                </svg>
            }
            <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
          </div>
          <div className="px-6">
            <h3 className="block text-center font-sans text-4xl  leading-snug tracking-normal text-gray-900 antialiased"
              style={{ fontFamily: "Oswald" }}>
              {chef ? capitalizeFirstLetter(chef) : ""}
            </h3>
          </div>
          {
            nftDeployementData ?
              null
              :
              <div className="p-6 flex">
                <button
                  className="block w-full select-none mr-1 rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                  data-ripple-light="true"
                  style={{ fontFamily: "Oswald" }}
                  onClick={(e) => uploadNft(e)}
                >
                  Obtenir
                </button>
                <button
                  className="block w-full select-none ml-1 rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                  data-ripple-light="true"
                  style={{ fontFamily: "Oswald" }}
                  onClick={(e) => generateNft(e)}
                >
                  Regénerer
                </button>
              </div>
          }
        </div>
      </div>
      {
        nftDeployementData ?
          <div className='flex items-center justify-center mt-12'>
            <div className='flex p-4 max-w-[85%] min-w-[70%] space-x-8'>
              <button
                className="block w-full select-none rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                data-ripple-light="true"
                style={{ fontFamily: "Oswald" }}
                onClick={(e) => redirect(e, '/MyNfts')}
              >
                Mes NFTs
              </button>
              <button
                className="block w-full select-none rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                data-ripple-light="true"
                style={{ fontFamily: "Oswald" }}
                onClick={(e) => redirect(e, '/home')}
              >
                Home
              </button>
              <button
                className="block w-full select-none rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                data-ripple-light="true"
                style={{ fontFamily: "Oswald" }}
                onClick={(e) => redirect(e, '/nft')}
              >
                Créer un autre nft
              </button>
            </div>
          </div>
          :
          null
      }
      {
        nftDeployementData ?
          <div className="flex flex-col justify-center items-center my-12">
            <div className="relative flex flex-col items-center rounded-[20px] max-w-[85%] min-w-[70%] mx-auto bg-[#e8c2ce] bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:!shadow-none p-3">
              <div className="mt-2 mb-2 w-full">
                <h1 className="px-4 text-2xl font-bold text-black">
                  Informations de transaction:
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-1 px-2 w-full">

                <div className="flex flex-col items-start justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Adresse du compte:</p>
                  <div className="text-base font-medium text-navy-700 break-words">
                    {nftDeployementData.Account}
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Public Key du compte:</p>
                  <div className="text-base font-medium text-navy-700 break-words">
                    {nftDeployementData.AccountPublicKey}
                  </div>
                </div>

                <div className="flex flex-col items-start justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Solde du compte:</p>
                  <p className="text-base font-medium text-navy-700">
                    {nftDeployementData.Balance} XRP
                  </p>
                </div>

                <div className="flex flex-col justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Hash de transaction:</p>
                  <div className="text-base font-medium text-navy-700 break-words">
                    {nftDeployementData.Hash}
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Flag du NFT:</p>
                  <p className="text-base font-medium text-navy-700">
                    {nftDeployementData.Flags}
                  </p>
                </div>

                <div className="flex flex-col justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">NFT ID:</p>
                  <div className="text-base font-medium text-navy-700 break-words">
                    {nftDeployementData.NFTokenID}
                  </div>
                </div>

                <div className="flex flex-col items-start justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Numéro de série:</p>
                  <p className="text-base font-medium text-navy-700">
                    {nftDeployementData.NftSerial}
                  </p>
                </div>

                <div className="flex flex-col items-start justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Frais de transaction:</p>
                  <p className="text-base font-medium text-navy-700">
                    0.000{nftDeployementData.TransactionFee} XRP
                  </p>
                </div>

                <div className="flex flex-col items-start justify-center rounded-2xl bg-[#e8c2ce] bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                  <p className="text-sm text-gray-600">Frais de transfert:</p>
                  <p className="text-base font-medium text-navy-700">
                    0.000{nftDeployementData.TransferFee} XRP
                  </p>
                </div>
              </div>
            </div>
          </div>
          :
          null
      }
    </div>
  )
}

export default NftGeneration;