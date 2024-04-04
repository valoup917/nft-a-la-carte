import React, { useEffect, useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Cookies from 'js-cookie';
import { getMyNftsRequest, burnMyNftRequest, sellMyNftRequest, getNftsOnSaleOnlyIdRequest } from "../requests/requests"
import { jwtDecode } from "jwt-decode";
import MenuIconsComponent from "../components/MenuIcon.jsx"
import LoadingModalComponent from "../components/LoadingModal"
import ErrorModalComponent from "../components/ErrorModal"

function NftGeneration() {
  const [imageSrcs, setImageSrcs] = useState([]);
  const [nftDeployementData, setNftDeployementData] = useState(null);
  const [nftOnSale, setNftOnSale] = useState(null);
  const [loading, setLoading] = useState(null);
  const [settingPriceNftId, setSettingPriceNftId] = useState(null);
  const [settingPriceNftUri, setSettingPriceNftUri] = useState(null);
  const [priceValue, setPriceValue] = useState('0');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (e) => {
    setPriceValue(e.target.value);
  };

  async function importImage(imagePath) {
    const parts = imagePath.split('/');
    const firstWord = parts[0];

    console.log(imagePath)

    if (firstWord === 'women' || firstWord === 'men') {
      var { default: image } = await import("../assets/iaGeneration/" + imagePath)
      return image;
    } else
      return null;
  }

  async function burnMyNft(e, NftId, NftUri) {
    e.preventDefault();
    setLoading("Destruction de votre NFT...");

    const jwt = Cookies.get("jwt");

    try {
      const data = await burnMyNftRequest(jwt, NftId, NftUri)
      setLoading(null);
      console.log(data);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setLoading(null);
      setErrorMessage(error.data)
    }
  }

  async function sellMyNft(e) {
    e.preventDefault();
    setLoading("Mise en vente de votre NFT sur le XRP Ledger...")
    const NftId = settingPriceNftId;
    const NftUri = settingPriceNftUri;
    const NftPrice = (document.getElementById("nftPrice").value + "000000")
    setSettingPriceNftUri(null);
    setSettingPriceNftId(null);

    const jwt = Cookies.get("jwt");
    const decodedToken = jwtDecode(jwt);


    try {
      const data = await sellMyNftRequest(jwt, NftId, NftUri, NftPrice, decodedToken.email)
      setLoading(null);
      console.log(data);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setLoading(null);
      setErrorMessage(error.data)
    }
  }

  useEffect(() => {

    async function getMyNfts() {
      setLoading("Récuperation de vos NFT sur le XRP Ledger...")

      const jwt = Cookies.get("jwt");
      
      try {
        const nftDeployementDataTmp = await getMyNftsRequest(jwt);
        setNftDeployementData(nftDeployementDataTmp);

        var tmpImagesArray = []
        for (let i = 0; i < nftDeployementDataTmp.length; i++) {
          console.log(nftDeployementDataTmp[i].URI)
          tmpImagesArray.push(await importImage(nftDeployementDataTmp[i].URI))
        }
        setImageSrcs(tmpImagesArray)

      } catch (error) {
        // fill error message and add error component
        setErrorMessage(error.data)
        console.log(error)
        if (error === null) {
          setImageSrcs(null);
          setLoading(null);
        }
      }


      const nftsOnSale = await getNftsOnSaleOnlyIdRequest(jwt);
      setNftOnSale(nftsOnSale)

      setLoading(null);
    }
    getMyNfts()
  }, []);

  return (
    <div>
      {settingPriceNftId && settingPriceNftUri && (
        <div className="z-20 fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto sm:rounded-2xl bg-white">
            <div className="w-full flex justify-center items-center flex-col">
              <div className="m-14">
                <div className="">
                  <h1 className="mb-4 text-3xl font-extrabold">Fixe le prix de ton nft: </h1>
                  <div className="w-full mt-3 text-center">
                    <input onChange={handleInputChange} id="nftPrice" type="text" className="mt-2 p-2 border border-gray-300 text-center rounded-md w-full focus:outline-none focus:ring focus:border-blue-500" placeholder="100" />
                    <h2 className='mt-8 text-sm'> Prix de vente: <span className='font-bold'> {priceValue} XRP </span></h2>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <button onClick={(e) => sellMyNft(e)} className="p-3 px-10 bg-[#e6b7c7] rounded-full text-black w-full font-semibold hover:bg-black hover:text-white duration-150 ease-in-out">Envoyer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        errorMessage &&
        <ErrorModalComponent Error={errorMessage} />
      }
      {
        loading &&
        <LoadingModalComponent Text={loading} />
      }
      <MenuIconsComponent myNfts={false} home={true} nftOnSale={true} />
      <h1 className='mt-14 text-white text-center text-6xl'
        style={{ fontFamily: "Oswald" }}>
        Mes NFTs
      </h1>
      <div className='flex flex-col mb-20'>
        {
          nftDeployementData && nftDeployementData.length > 0 ?
            nftDeployementData.map((data, index) => (
              <div className='flex mt-16' key={index}>
                <div className="ml-16 relative flex w-full max-w-[26rem] flex-col rounded-xl bg-[#e6b7c7] bg-clip-border text-gray-700 shadow-lg">
                  <div className="relative mx-4 mt-4 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40">
                    {
                      imageSrcs ?
                        <img className='' src={imageSrcs[index]} alt={`chef ${index}`} />
                        :
                        null
                    }
                  </div>
                  <div className="p-6 flex">
                    {
                      nftOnSale && nftOnSale.includes(data.NFTokenID) ?
                        null
                        :
                        <button
                          className="block w-full select-none mr-1 rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                          type="button"
                          data-ripple-light="true"
                          style={{ fontFamily: "Oswald" }}
                          onClick={() => { setSettingPriceNftId(data.NFTokenID); setSettingPriceNftUri(data.URI) }}
                        >
                          Vendre
                        </button>
                    }
                    <button
                      className="block w-full select-none ml-1 rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button"
                      data-ripple-light="true"
                      style={{ fontFamily: "Oswald" }}
                      onClick={(e) => burnMyNft(e, data.NFTokenID, data.URI)}
                    >
                      Détruire
                    </button>
                  </div>
                </div>

                <div className="ml-16 mr-16 w-full">
                  <div className="rounded-[20px] mx-auto bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:!shadow-none p-3">
                    <div className="mt-2 mb-2 w-full">
                      <h1 className="px-4 text-2xl font-bold text-black">
                        Informations de transaction:
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-1 px-2 w-full">

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-sm text-gray-600">NFT ID:</p>
                        <div className="text-base font-medium text-navy-700 break-words">
                          {data.NFTokenID}
                        </div>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-sm text-gray-600">Numéro de série:</p>
                        <div className="text-base font-medium text-navy-700 break-words">
                          {data.nft_serial}
                        </div>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-sm text-gray-600">Flag du NFT:</p>
                        <div className="text-base font-medium text-navy-700 break-words">
                          {data.Flags}
                        </div>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-sm text-gray-600">Statut du NFT:</p>
                        {
                          nftOnSale && nftOnSale.includes(data.NFTokenID) ?
                            <div className="text-base font-medium text-navy-700 break-words">
                              En vente
                            </div>
                            :
                            <div className="text-base font-medium text-navy-700 break-words">
                              Personnel
                            </div>
                        }
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))
            :
            <div className='flex justify-center mt-20'>
              <h1 className='text-red-500 text-2xl'>
                Aucun NFT en votre possession
              </h1>
            </div>
        }
      </div>
    </div>
  )
}

export default NftGeneration;