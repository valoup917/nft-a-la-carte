import React, { useEffect, useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Cookies from 'js-cookie';
import { getNftsOnSaleRequest, buyNftRequest } from "../requests/requests"
import { jwtDecode } from "jwt-decode";
import MenuIconsComponent from "../components/MenuIcon.jsx"
import LoadingModalComponent from "../components/LoadingModal"
import ErrorModalComponent from "../components/ErrorModal"

function NftsToSell() {
  const [userUid, setUserUid] = useState(null);
  const [imageSrcs, setImageSrcs] = useState({});
  const [nftDeployementData, setNftDeployementData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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

  async function buyNft(e, NftId, OfferId) {
    e.preventDefault();
    setLoading("Confirmation d'achat du NFT sur le XRP Ledger...");

    const jwt = Cookies.get("jwt");


    try {
      const data = await buyNftRequest(jwt, NftId, OfferId);
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

    async function getNftsOnSale() {
      setLoading("chargement des nfts en vente")

      const jwt = Cookies.get("jwt");
      const nftsOnSale = await getNftsOnSaleRequest(jwt);

      setNftDeployementData(nftsOnSale);
      console.log(nftsOnSale)
      console.log(Object.keys(nftsOnSale).length)
      if (nftsOnSale === null) {
        setImageSrcs(null);
        setLoading(null);
        return;
      }

      const tmpImagesArray = [];

      for (let key in nftsOnSale) {
        tmpImagesArray.push(await importImage(nftsOnSale[key].Uri));
      }
      console.log(tmpImagesArray)
      setImageSrcs(tmpImagesArray)
      setLoading(null);
    }
    getNftsOnSale()

    const jwt = Cookies.get("jwt");
    const decodedToken = jwtDecode(jwt);
    setUserUid(decodedToken.uid)
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
      <MenuIconsComponent myNfts={true} home={true} nftOnSale={false} />
      <h1 className='mt-14 text-white text-center text-6xl'
        style={{ fontFamily: "Oswald" }}>
        NFTs en vente
      </h1>
      <div className='flex flex-col mb-20'>
        {
          nftDeployementData && Object.keys(nftDeployementData).length > 0 ?

            Object.entries(nftDeployementData).map(([key, value], index) => (

              <div className='flex mt-32' key={key}>
                <div className="ml-16 relative flex w-full max-w-[26rem] flex-col rounded-xl bg-[#c8b8fa] bg-clip-border text-gray-700 shadow-lg" style={userUid === value.UserSellingUid ? { backgroundColor: "#e6b7c7" } : null}>
                  <div className="relative m-4 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40">
                    {
                      imageSrcs ?
                        <img className='' src={imageSrcs[index]} alt={`chef ${index}`} />
                        :
                        null
                    }
                  </div>
                  {
                    userUid !== value.UserSellingUid ?
                      <div className="px-6 pb-6 pt-2 flex">
                        <button
                          className="block w-full select-none mr-1 rounded-lg bg-white hover:bg-black hover:text-white py-3 px-7 text-center align-middle font-sans text-lg font-bold uppercase duration-300 text-gray-900 shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                          type="button"
                          data-ripple-light="true"
                          style={{ fontFamily: "Oswald" }}
                          onClick={(e) => buyNft(e, key, value.OfferId)}
                        >
                          Acheter
                        </button>
                      </div>
                      :
                      null
                  }
                </div>

                <div className="ml-16 mr-16 w-full">
                  <div className="rounded-[20px] mx-auto bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:!shadow-none p-3">
                    <div className="mt-2 mb-2 w-full">
                      <h1 className="px-4 text-2xl font-bold text-black">
                        Informations de vente:
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-1 px-2 w-full">

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-sm text-gray-600">Prix:</p>
                        <div className="text-base font-medium text-navy-700 break-words">
                          {((value.Price).toString()).slice(0, -6)} XRP
                        </div>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-sm text-gray-600">NFT ID:</p>
                        <div className="text-base font-medium text-navy-700 break-words">
                          {key}
                        </div>
                      </div>

                      {
                        userUid !== value.UserSellingUid ?
                          <div>
                            <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                              <p className="text-sm text-gray-600">Adresse mail du vendeur:</p>
                              <div className="text-base font-medium text-navy-700 break-words">
                                {value.Email}
                              </div>
                            </div>

                            <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                              <p className="text-sm text-gray-600">Adresse XRP du vendeur:</p>
                              <div className="text-base font-medium text-navy-700 break-words">
                                {value.WalletAdress}
                              </div>
                            </div>
                          </div>
                          :
                          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <p className="text-sm text-gray-600">Information vendeur:</p>
                            <div className="text-base font-medium text-navy-700 break-words">
                              Ceci est votre NFT
                            </div>
                          </div>
                      }


                    </div>
                  </div>
                </div>
              </div>
            ))
            :
            <div className='flex justify-center mt-20'>
              <h1 className='text-red-500 text-2xl'>
                Aucun NFT en vente pour le moment
              </h1>
            </div>
        }
      </div>
    </div>
  )
}

export default NftsToSell;