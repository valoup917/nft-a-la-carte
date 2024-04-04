const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const jwt = require('jsonwebtoken');
const xrpl = require('xrpl');
const winston = require('winston');
require('firebase/firestore');
require('dotenv').config();

const serviceAccount = require('./nft-a-la-carte-firebase-adminsdk.json');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(), // Affichage des logs dans la console
    //new winston.transports.File({ filename: 'logfile.log' }) // Enregistrement des logs dans un fichier
  ]
});



app.use(express.json());
app.use(cors());

const port = process.env.PORT;
const client = new xrpl.Client(process.env.CLIENT)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/*
  ?  /ping       check si le serveur est up ou down
*/
app.get("/ping", async (req, res) => {
  res.send("Ok")
})

/*
  ?  /getMyAccountBalance       Pour récuperer les NFT d'un user sur le XRP Ledger
*/
app.get("/getMyAccountBalance", authenticateToken, async (req, res) => {

  const uid = req.user.uid;
  const standby_wallet = await getWalletFromUid(uid);

  // Transaction pour récuperer la balance du compte
  try {
    await client.connect()
    const accountBalance = (await client.getXrpBalance(standby_wallet.address))
    await client.disconnect()

    res.send(`${accountBalance}`)
  } catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors de la récuperation du Wallet XRP")
  }
})

/*
  ?  getWalletFromUid       Pour récuperer l'adresse XRP du compte qui achete le NFT
  ! uid                     uid du user associé au wallet
*/
async function getWalletFromUid(uid) {
  const userDocRef = admin.firestore().collection('users').doc(uid);
  const userDocSnapshot = await userDocRef.get();
  const userData = userDocSnapshot.data()

  const standby_wallet = await xrpl.Wallet.fromSeed(userData.seed)

  return standby_wallet;
}

/*
  ?  /buyNft       Pour acheter un nft
  ! NftId          Id du NFT à acheter
  ! OfferId        Id de l'offre à accepter
*/
app.post("/buyNft", authenticateToken, async (req, res) => {

  const { NftId, OfferId } = req.body;
  const uid = req.user.uid;

  const standby_wallet = await getWalletFromUid(uid);

  // Transaction pour accepter l'offre de vente sur le XRP
  const transactionBlob = {
    "TransactionType": "NFTokenAcceptOffer",
    "Account": standby_wallet.classicAddress,   // Adresse du compte de l'acheteur
    "NFTokenSellOffer": OfferId,
  }
  try {
    if (!NftId || !OfferId)
      throw "missing field"
    await client.connect()
    const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet })
    await client.disconnect()
    
    if (tx.result.meta.TransactionResult === "tesSUCCESS") { // Si transaction acceptée
      const nftDocRefToSell = admin.firestore().collection("nft").doc("toSell");
      const updateData = {};
      // supprimer dans la table toSell le NFT à vendre car il à été vendu
      updateData[NftId] = admin.firestore.FieldValue.delete();
      await nftDocRefToSell.update(updateData)
      logger.info(`Nft ${NftId} acheté par ${uid}`)
      res.send(tx.result)
    } else {
      logger.error("Error /buyNft")
      logger.error(tx.result)
      res.status(400).send("Erreur lors de l'achat du NFT")
    }
  }
  catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors de l'achat du NFT")
  }
})

/*
  ?  /sellMyNft       Pour vendre son nft
  ! NftId          Id du NFT à mettre en vente
  ! NftUri         Le lien du NFT sur ipfs
  ! Price          Le prix de mise en vente
  ! Email          Le mail du user qui le met en vente
*/
app.post("/sellMyNft", authenticateToken, async (req, res) => {

  const { NftId, NftUri, Price, Email } = req.body;
  const uid = req.user.uid;

  const standby_wallet = await getWalletFromUid(uid);

  // Transaction pour créer l'offre de vente sur le XRP
  let transactionBlob = {
    "TransactionType": "NFTokenCreateOffer",
    "Account": standby_wallet.classicAddress,
    "NFTokenID": NftId,
    "Amount": Price,
    "Flags": parseInt(1), // 1 car par défault pour la vente c'est 1
  }
  
  try {
    if (!NftId || !NftUri || !Price || !Email)
      throw "missing field"
    await client.connect()
    const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet })
    await client.disconnect()
    
    if (tx.result.meta.TransactionResult === "tesSUCCESS") {
      // ajout dans la table toSell le NFT tout juste mis en vente
      const data = {
        [NftId]: {
          Price: parseInt(Price),
          Uri: NftUri,
          WalletAdress: standby_wallet.classicAddress,
          UserSellingUid: uid,
          Email: Email,
          OfferId: tx.result.meta.offer_id
        }
      };
      const nftDocRef = admin.firestore().collection("nft").doc("toSell");
      await nftDocRef.update(data);
      logger.info(`Nft ${NftId} vendu par ${uid}`)
      res.send(tx.result)
    } else {
      logger.error("Error /sellMyNft")
      logger.error(tx.result)
      res.status(400).send("Erreur lors de la vente du NFT")
    }
  }
  catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors de la vente du NFT")
  }
})

/*
  ?  /burnMyNft       Pour détruire un NFT
  ! NftId          Id du NFT à mettre en vente
  ! NftUri         Le lien du NFT sur ipfs
*/
app.post("/burnMyNft", authenticateToken, async (req, res) => {
  const { NftId, NftUri } = req.body;
  const uid = req.user.uid;

  const standby_wallet = await getWalletFromUid(uid);

  // Transaction pour detruire le NFT sur le XRP
  const transactionBlob = {
    "TransactionType": "NFTokenBurn",
    "Account": standby_wallet.classicAddress,
    "NFTokenID": NftId
  }
  try {
    if (!NftId || !NftUri)
    throw "missing field"
    await client.connect()
    const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet })
    await client.disconnect()


    if (tx.result.meta.TransactionResult === "tesSUCCESS") {
      // suppression dans la table des images déjà utilisé par l'IA
      const nftDocRefAlreadyUsed = admin.firestore().collection("nft").doc("alreadyUsed");
      let imagePaths = (await nftDocRefAlreadyUsed.get()).data().imagePaths || [];
      const index = imagePaths.indexOf(NftUri);
      if (index !== -1) {
        imagePaths.splice(index, 1);
        nftDocRefAlreadyUsed.update({ imagePaths: imagePaths });
      }
      // suppression dans la table des vente des NFT si existe
      const nftDocRefToSell = admin.firestore().collection("nft").doc("toSell");
      const updateData = {};
      updateData[NftId] = admin.firestore.FieldValue.delete();
      await nftDocRefToSell.update(updateData)
      logger.info(`Nft ${NftId} detrui par ${uid}`)
      res.send(tx.result)
    } else {
      logger.error("Error /burnMyNft")
      logger.error(tx.result)
      res.status(400).send("Erreur lors de la destruction du NFT")
    }
  } catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors de la destruction du NFT")
  }
})

/*
  ?  /getNftsOnSale       Pour récuperer tout les NFT en vente en db
*/
app.get("/getNftsOnSale", authenticateToken, async (req, res) => {

  const nftDocRefToSell = admin.firestore().collection("nft").doc("toSell");
  const nftDocSnapshot = await nftDocRefToSell.get();
  const nftData = nftDocSnapshot.data()
  delete nftData.securityDeletion; // supprime le champ securityDeletion présent en db

  res.send(nftData)
})

/*
  ?  /getNftsOnSaleOnlyId       Pour récuperer seulement les ID de tout les NFT en vente en db
*/
app.get("/getNftsOnSaleOnlyId", authenticateToken, async (req, res) => {

  const nftDocRefToSell = admin.firestore().collection("nft").doc("toSell");
  const nftDocSnapshot = await nftDocRefToSell.get();
  const nftData = nftDocSnapshot.data()
  delete nftData.securityDeletion;

  const keysAsArray = Object.keys(nftData)

  res.send(keysAsArray)
})

/*
  ?  /getMyNft       Pour récuperer les NFT d'un user sur le XRP Ledger
*/
app.get("/getMyNft", authenticateToken, async (req, res) => {

  const uid = req.user.uid;

  const standby_wallet = await getWalletFromUid(uid);

  // Transaction pour récuperer les NFT sur le XRP
  try {
    await client.connect() 
    const myNfts = await client.request({
      method: "account_nfts",
      account: standby_wallet.classicAddress
    })
    await client.disconnect()

    var resultGetNft = myNfts.result.account_nfts
    // conversion des URI des NFT      HEX -> STRING
    for (let i = 0; i < resultGetNft.length; i++) {
      resultGetNft[i].URI = xrpl.convertHexToString(resultGetNft[i].URI)
    }

    res.send(resultGetNft)
  } catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors de la récuperation des NFTs")
  }

})

/*
  ?  /deployNft       Deploie le NFT sur le XRP Ledger
  ! imagePath         Le lien du NFT sur ipfs
*/
app.post('/deployNft', authenticateToken, async (req, res) => {

  const { imagePath } = req.body;
  const uid = req.user.uid;

  const standby_wallet = await getWalletFromUid(uid);

  // Transaction pour déployer le NFT sur le XRP
  try {
    if (!imagePath)
      throw "missing field"
    await client.connect()
    const transactionJson = {
      "TransactionType": "NFTokenMint",
      "Account": standby_wallet.classicAddress,
      "URI": xrpl.convertStringToHex(imagePath), // token url deployed on ipfs
      "Flags": parseInt(8), // 8 to trade to anyone
      "TransferFee": parseInt(0), // transfer fee
      "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
    }
    const tx = await client.submitAndWait(transactionJson, { wallet: standby_wallet })
    const value = (await client.getXrpBalance(standby_wallet.address))
    await client.disconnect()

    // mettre en db dans la base nft image arleady used pour que l'ia genere pas deux fois la mm
    const nftDocRef = admin.firestore().collection('nft').doc("alreadyUsed");
    const nftDocSnapshot = await nftDocRef.get();
    const allPaths = nftDocSnapshot.data().imagePaths;
    allPaths.push(imagePath);
    await nftDocRef.update({ imagePaths: allPaths })

    // objet pour renvoyer coté front et afficher les datas de transaction
    const transactionData = {
      Account: tx.result.Account,
      AccountPublicKey: tx.result.SigningPubKey,
      Flags: tx.result.Flags,
      TransactionFee: tx.result.Fee,
      TransferFee: tx.result.TransferFee,
      NFTokenID: tx.result.meta.nftoken_id,
      Balance: value,
      NftSerial: tx.result.Sequence,
      Hash: tx.result.hash
    }
    res.send(transactionData);
  }
  catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors du déploiement du NFT")
  }
});

/*
  ?  /login        Creation wallet wrp, connection wallet etc
  ! username          username du user, vide si connection et non enregistrement
  ! email             email du user
  ! uid               uid du user généré par firebase front end part
  ! password          password du user
*/
app.post('/login', async (req, res) => {
  const { username, email, uid, password } = req.body;

  try {
    if (!email || !uid || !password)
      throw "missing field"
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDocSnapshot = await userDocRef.get();
    const userData = userDocSnapshot.data()
    
    // si enregistrement pour premiere fois ou si connection mais xrp wallet vide
    if (typeof username !== "undefined" || (typeof username === "undefined" && userData.xrpLedgerWalletConnection === false)) {

      // Creation d'un wallet XRP et remplissage de 10000 XRP
      await client.connect()
      const fund_result = await client.fundWallet()
      await client.disconnect()
      
      // enregistrement en db des infos du wallet user
      const test_wallet = fund_result.wallet
      await userDocRef.update({ publicKey: test_wallet.publicKey });
      await userDocRef.update({ privateKey: test_wallet.privateKey });
      await userDocRef.update({ classicAddress: test_wallet.classicAddress });
      await userDocRef.update({ seed: test_wallet.seed });
      await userDocRef.update({ xrpLedgerWalletConnection: true });
    }
    
    // creation d'un jwt
    const user = { email: email, uid: uid, password: password }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken });
  } catch (e) {
    logger.error(e)
    await client.disconnect()
    res.status(400).send("Erreur lors de la connection au XRP Ledger")
  }
});

/*
  ?  authenticateToken        Fonction check jwt
*/
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    logger.error("token null")
    return res.status(401).send("Unauthorized")
  }
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).send(("Invalid token"))
    req.user = user
    next()
  })
}

/*
  ?  /getUsers        Récupère tout les users en db
*/
app.get('/getUsers', authenticateToken, async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore().collection('users').get();

    const usersData = [];
    usersSnapshot.forEach((doc) => {
      if (req.user.email !== doc.data().email)
        usersData.push({ id: doc.id, ...doc.data() });
    });

    res.json(usersData);
  } catch (error) {
    logger.error('Error getting user info:', error);
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  logger.info(`Serveur en écoute sur http://localhost:` + port);
});

module.exports = app;