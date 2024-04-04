import React, { useEffect, useState } from 'react';
import nftAssets from "../assets/icon/nft.png";
import carousel1 from "../assets/pedro-pena-bastos/carousel.jpeg"
import carousel2 from "../assets/anne-sophie-pic/carousel.jpeg";
import carousel3 from "../assets/bernard-pacaud/carousel.jpeg";
import carousel4 from "../assets/frederic-anton/carousel.jpeg"
import carousel5 from "../assets/rogelio-garcia/carousel.jpeg"
import createNft from "../assets/rogelio-garcia/plates4.jpeg"
import chefCooking from "../assets/icon/chef-icon-1.png"
import chefMenWomen from "../assets/icon/chef-icon-3.png"
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import { useNavigate } from 'react-router-dom'
import './Home.css'
import Cookies from 'js-cookie';
import { getAuth } from 'firebase/auth'
import { app } from "../FirebaseConfig";
import MenuIconsComponent from "../components/MenuIcon.jsx"
import { jwtDecode } from "jwt-decode";
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { getMyAccountBalanceRequest } from "../requests/requests.js"
import ErrorModalComponent from "../components/ErrorModal"

function Home() {
  const [userInfo, setUserInfo] = useState(null)
  const [accountBalance, setAccountBalance] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null);

  const database = getAuth(app);
  const db = getFirestore();
  const history = useNavigate()

  const datas = [
    { id: 1, image: carousel1 },
    { id: 2, image: carousel2 },
    { id: 3, image: carousel3 },
    { id: 4, image: carousel4 },
    { id: 5, image: carousel5 }
  ]

  async function deconnection() {
    await database.signOut();
    Cookies.remove("jwt")
    history('/');
  }

  function createNftFunction(e) {
    e.preventDefault();
    history("/nft");
  }

  useEffect(() => {
    async function getUserInfo() {
      const userDocRef = doc(db, 'users', decodedToken.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      setUserInfo(userDocSnapshot.data())

      try {
        const accountBalanceTmp = await getMyAccountBalanceRequest(jwtToken);
        setAccountBalance(accountBalanceTmp);
      } catch (e) {
        console.log(e)
        setErrorMessage(e.data)
      }
    }

    const jwtToken = Cookies.get("jwt");
    const decodedToken = jwtDecode(jwtToken);
    getUserInfo()
  }, [db]);

  return (
    <div>
      {
        errorMessage &&
        <ErrorModalComponent Error={errorMessage} />
      }
      <MenuIconsComponent myNfts={true} home={false} nftOnSale={true} />
      <div className='text-center mt-8 text-white text-7xl font-bold'
        style={{ fontFamily: "Oswald" }}>
        <h1>
          NFT à la carte
        </h1>
      </div>
      <div className='flex justify-center items-center mt-16'>
        <div className='max-w-4xl rounded-carousel-container relative'>
          <img className='absolute z-10 w-72 -bottom-[12%] -right-[21%]' src={nftAssets} alt="" />
          <Carousel interval={3000} autoPlay={true} infiniteLoop
            showIndicators={false} showStatus={false} showArrows={false}
            showThumbs={false} transitionTime={600}>
            {datas.map((slide, index) => (
              <img src={slide.image} key={index} alt="" />
            ))}
          </Carousel>

        </div>
      </div>
      <div className='mt-44 flex text-white justify-center items-center'>
        <div className='text-left w-[62rem] relative'>
          <img className='absolute z-10 -top-[34%] -left-[18%] w-72' src={chefCooking} alt="" />
          <img className='absolute z-10 top-[28%] -right-[24%] w-72' src={chefMenWomen} alt="" />
          <h1 className='ml-28 text-7xl font-semibold'
            style={{ fontFamily: "Oswald" }}>
            Notre projet
          </h1>
          <p className='mt-10 text-2xl tracking-wide mr-16'
            style={{ fontFamily: "Oswald" }}>
            Un bon repas dans un restaurant étoilé Michelin avec un cuisinier hautement
            reconnu n'est qu'éphémère et le plaisir est bien trop vite envolé.
            <br />
            <br />
            Après ce repas, il ne nous reste plus qu'une digestion lente, des souvenirs dans
            la tête et des photos dans le téléphone, qui ne seront plus jamais touchées
            jusqu'à se faire supprimer par manque de place de stockage dans l'iphone...
            <br />
            <br />
            <span className='font-bold'> Et pourquoi pas transformer cette expérience en Real World Assets ? </span>
            <br />
            <br />
            Après un simple scan de votre ticket de caisse de votre restaurant étoilé
            michelin par notre IA, un NFT est généré d'une image unique de votre chef et du plat décrit
            dans votre ticket.
            <br />
            <br />
            Ces tokens apportent une dimension encore plus unique et luxueuse au repas
            et pourraient prendre beaucoup plus de valeur à la mort du chef ou à la
            fermeture du restaurant.
          </p>
        </div>
      </div>
      <div className='flex justify-center items-center mt-32 mb-20'>
        <div className='max-w-3xl rounded-carousel-container relative group cursor-pointer' onClick={(e) => createNftFunction(e)}>
          <img className='rounded-2xl transition-transform duration-[2000ms] ease-in-out group-hover:scale-110'
            src={createNft} alt="" />
          <div className='justify-center text-center absolute top-1/2 left-1/2 translate-y-[-50%] translate-x-[-50%]'>
            <h1 className='mt-[85%] text-6xl font-bold transition-transform duration-[2000ms] group-hover:scale-150 ease-in-out'
              style={{ fontFamily: "Oswald" }}>
              Créer mon NFT
            </h1>
          </div>
        </div>
      </div>
      {
        userInfo && accountBalance ?
      <div className="flex flex-col justify-center items-center my-18 mb-20">
        <div className="relative flex flex-col items-center rounded-[20px] max-w-[80%] min-w-[70%] mx-auto bg-gray-300 bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:!shadow-none p-3">
          <div className="mt-2 mb-2 w-full">
            <h1 className="px-4 text-2xl font-bold text-black">
              Mon Wallet XRP:
            </h1>
          </div>
            <div className="grid grid-cols-2 gap-1 px-2 w-full">
            <div className="flex flex-col items-start justify-center rounded-2xl bg-gray-300 bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
              <p className="text-sm text-gray-600">Adresse du compte:</p>
              <div className="text-base font-medium text-navy-700 break-words">
                    {userInfo.classicAddress}
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl bg-gray-300 bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
              <p className="text-sm text-gray-600">Public Key du compte:</p>
              <div className="text-base font-medium text-navy-700 break-words">
                    {userInfo.publicKey}
              </div>
            </div>

            <div className="flex flex-col items-start justify-center rounded-2xl bg-gray-300 bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
              <p className="text-sm text-gray-600">Solde du compte:</p>
              <p className="text-base font-medium text-navy-700">
                    {accountBalance} XRP
              </p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl bg-gray-300 bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
              <p className="text-sm text-gray-600">Adresse email:</p>
              <div className="text-base font-medium text-navy-700 break-words">
                    {userInfo.email}
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl bg-gray-300 bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
              <p className="text-sm text-gray-600">Username:</p>
              <p className="text-base font-medium text-navy-700">
                    {userInfo.username}
              </p>
            </div>
            </div>
          </div>
        </div>
        :
        null
      }
      <div className="flex items-center justify-center">
        <button onClick={deconnection} className="bg-[#e6b7c7] hover:scale-125 text-xl text-black font-bold py-4 px-8 rounded mb-8 ease-in-out duration-1000">
          Déconnexion
        </button>
      </div>
    </div>
  )
}

export default Home;