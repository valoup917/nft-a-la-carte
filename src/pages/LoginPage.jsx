import React, { useEffect, useState } from 'react';
import coverPicture from "../assets/loginPicture.jpeg";
import { loginRequest } from "../requests/requests";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'
import { app } from "../FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, getAuth } from 'firebase/auth'
import { getFirestore, setDoc, getDoc, deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import { jwtDecode } from "jwt-decode";
import LoadingModalComponent from "../components/LoadingModal"
import ErrorModalComponent from "../components/ErrorModal"

function RegisterAndLogin() {
  const [login, setLogin] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(null);

  const database = getAuth(app);
  const db = getFirestore();

  const history = useNavigate()

  const deleteDummyDocument = async () => {
    try {
      const dummyDocRef = doc(db, 'users', 'dummy');
      await deleteDoc(dummyDocRef);
    } catch (error) {
      console.error("Erreur lors de la suppression du document 'dummy' :", error.message);
    }
  };

  const createUsersCollection = async () => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const usersCollectionSnapshot = await getDocs(usersCollectionRef);

      if (usersCollectionSnapshot.empty)
        await setDoc(doc(db, 'users', 'dummy'), {});
    } catch (error) {
      console.error("Erreur lors de la création de la collection 'users' :", error.message);
    }
  };

  const createUserDocument = async (uid, userData) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        await setDoc(userDocRef, userData);
        deleteDummyDocument();
      }
    } catch (error) {
      console.error("Erreur lors de la création du document utilisateur :", error.message);
    }
  };


  async function LoginFunction(e) {
    e.preventDefault()
    
    const username = e.target.username?.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    if (username !== undefined) {
      setLoading("Création de votre wallet XRP...");
      //register

      try {
        const userCredential = await createUserWithEmailAndPassword(database, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });

        await createUsersCollection();

        await createUserDocument(user.uid, {
          username: username,
          email: email,
          publicKey: null,
          privateKey: null,
          classicAddress: null,
          seed: null,
          xrpLedgerWalletConnection: false
        });

        const jwt = await loginRequest(username, email, user.uid, password);
        Cookies.set("jwt", jwt, { expires: 7, secure: true });
        history('/home')
      } catch (error) {
        console.log(error);
        if (error?.code) {
          setAlertMessage("Error :" + error.code);
        } else {
          setAlertMessage(error.data);
        }
      }
    } else {
      setLoading("Récuperation de votre wallet XRP...");
      // login
      try {
        const data = await signInWithEmailAndPassword(database, email, password);
        const jwt = await loginRequest(username, email, data.user.uid, password);
        Cookies.set("jwt", jwt, { expires: 7, secure: true });
        history('/home')
      } catch (error) {
        console.log(error);
        if (error?.code) {
          setAlertMessage("Error :" + error.code);
        } else {
          setAlertMessage(error.data);
        }
      }
    }
    setLoading(null);
  }

  useEffect(() => {
    async function connection() {
      const decodedToken = jwtDecode(jwtToken);
      await signInWithEmailAndPassword(database, decodedToken.email, decodedToken.password);
      setLoading("Création de votre wallet XRP...")
      history('/home')
    }

    const jwtToken = Cookies.get("jwt");
    if (jwtToken != null && typeof jwtToken !== "undefined") {
      setLoading(null)
      connection()
    }
  }, [database, history]);

  return (
    <div className='overflow-hidden'>
      {
        loading &&
        <LoadingModalComponent Text={loading} />
      }
      {
        alertMessage &&
        <ErrorModalComponent Error={alertMessage}/>
      }
      <div className="flex h-screen w-full items-center justify-end pr-32 bg-gray-900 bg-cover bg-no-repeat" style={{ backgroundImage: `url(${coverPicture})` }}>
        <div className="rounded-xl bg-gray-800 bg-opacity-50 px-10 py-8 shadow-lg backdrop-blur-md max-sm:px-10">
          <div className="text-white">
            <div className="mb-8 flex flex-col items-center p-4">
              <h1 className="mb-6 text-6xl" style={{ fontFamily: "Oswald", fontWeight: "500" }}>NFT à la Carte</h1>
              <div className="flex space-x-8">
                <div onClick={() => setLogin(false)} className="text-1xl text-[#b5b4ca] hover:text-white ease-in-out duration-300">S'enregistrer</div>
                <div onClick={() => setLogin(true)} className="text-1xl text-[#b5b4ca] hover:text-white ease-in-out duration-300">S'authentifier</div>
              </div>
            </div>
            <form onSubmit={(e) => LoginFunction(e)} className='align-center'>
              {
                login ? (
                  <div className='text-center mb-4'>
                    Connecte toi
                  </div>
                ) :
                  (
                    <div>
                      <div className='text-center mb-4'>
                        Créer ton compte
                      </div>
                      <div className="mb-4 text-lg flex justify-center">
                        <input className="rounded-3xl border-none bg-[#3f481fa1] bg-opacity-50 px-10 py-2 text-center text-inherit placeholder-gray-500 shadow-lg outline-none backdrop-blur-md" type="text" name="username" placeholder="Username" />
                      </div>
                    </div>
                  )
              }
              <div className="mb-4 text-lg flex justify-center">
                <input className="rounded-3xl border-none bg-[#3f481fa1] bg-opacity-50 px-10 py-2 text-center text-inherit placeholder-gray-500 shadow-lg outline-none backdrop-blur-md" type="email" name="email" placeholder="Email" />
              </div>
              <div className="mb-4 text-lg flex justify-center">
                <input className="rounded-3xl border-none bg-[#3f481fa1] bg-opacity-50 px-10 py-2 text-center text-inherit placeholder-gray-500 shadow-lg outline-none backdrop-blur-md" type="Password" name="password" placeholder="Mot de passe" />
              </div>
              <div className="mt-8 flex justify-center text-lg text-black">
                <button type="submit" className="rounded-3xl bg-[#f1f1f1e8] bg-opacity-50 px-10 py-2 text-black shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-[#ffffff]">{login ? "S'authentifier" : "S'enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterAndLogin;