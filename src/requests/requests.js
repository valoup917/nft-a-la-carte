import axios from "axios";

const URL = "https://JeSuisLeDevQu'ilVousFaut.com/"

export const getMyAccountBalanceRequest = async (jwt) => {
  try {
    const response = await axios.get(
      URL + "getMyAccountBalance",
      {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const buyNftRequest = async (jwt, NftId, OfferId) => {
  try {
    const response = await axios.post(
      URL + "buyNft",
      {
        NftId: NftId,
        OfferId: OfferId,
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const sellMyNftRequest = async (jwt, NftId, NftUri, Price, Email) => {
  try {
    const response = await axios.post(
      URL + "sellMyNft",
      {
        Price: Price,
        NftUri: NftUri,
        NftId: NftId,
        Email: Email
      }, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const burnMyNftRequest = async (jwt, NftId, NftUri) => {
  try {
    const response = await axios.post(
      URL + "burnMyNft",
      {
        NftId: NftId,
        NftUri: NftUri,
      }, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const getNftsOnSaleRequest = async (jwt) => {
  const { data } = await axios.get(URL + "getNftsOnSale", {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return data;
}

export const getNftsOnSaleOnlyIdRequest = async (jwt) => {
  const { data } = await axios.get(URL + "getNftsOnSaleOnlyId", {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return data;
}

export const getMyNftsRequest = async (jwt) => {
  try {
    const response = await axios.get(
      URL + "getMyNft",
    {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const deployNftRequest = async (jwt, imagePath) => {
  try {
    const response = await axios.post(
      URL + "deployNft",
      {
        imagePath: imagePath,
      }, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const loginRequest = async(username, email, uid, password) => {
  try {
    const response = await axios.post(
      URL + "login",
      {
        username: username,
        email: email,
        uid: uid,
        password: password
      }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    );
    const jwt = response.data.accessToken;
    return jwt
  } catch (error) {
    throw error.response;
  }
}

export const getRequest = async (jwt) => {
  console.log(URL)
      const {data} = await axios.get(URL + "getUsers", {
        headers: {
            Authorization: `Bearer ${jwt}`
        }
    });
    return data;
}