const request = require('supertest');
const app = require('./server.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateValidToken() {
    const user = { email: "test.user@gmail.com", uid: "mRcxx8F5QzfeREjRyul5mN4co8P2", password: "testtest" }
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    return token;
}

function generateInvalidToken() {
    const user = { email: "test.user@gmail.com", uid: "mRcxx8F5QzfeREjRyul5mN4co8P2", password: "testtest" }
    const token = jwt.sign(user, (process.env.ACCESS_TOKEN_SECRET + "x"))
    return token;
}


const userTestNft = [
    {
        Flags: 8,
        Issuer: 'r4Rc8uCVypCvJaLjdhFBp8KKHhGkL9AueM',
        NFTokenID: '00080000EB028075B74C69D19BB44FFCCE2A59367FE1E1020D792E0802C8276D',
        NFTokenTaxon: 0,
        URI: 'men/34.jpeg',
        nft_serial: 46671725
    }
];


// SIMPLE

describe('GET /ping', function () {
    it('responds with Ok', function (done) {
        request(app)
        .get('/ping')
        .expect(200)
            .end(function (err, res) {
            if (err) return done(err);
            if (res.text !== "Ok") {
                return done(new Error('Réponse incorrecte : ' + res.text));
            }
            done();
        });
    });
});

describe('GET /getMyAccountBalance', function () {
    this.timeout(5000);
    it('get account balance value', function (done) {
        const token = generateValidToken()
        request(app)
            .get('/getMyAccountBalance')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                if (isNaN((res.text))) { // check if can't be converted to int
                    return done(new Error('Réponse incorrecte : ' + res.text));
                }
                done();
            });
    });
    it('get error with invalid cred', function (done) {
        const token = generateInvalidToken()
        request(app)
            .get('/getMyAccountBalance')
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(function (err, res) {
                if (err) { return done(err); }
                done();
            });
    });
});

describe('GET /getUsers', function () {
    it('get all users', function (done) {
        const token = generateValidToken()
        request(app)
            .get('/getUsers')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                try {
                    var jsonTmp = JSON.stringify(res.body);
                    JSON.parse(jsonTmp);
                    return done();
                } catch (e) {
                    return done(new Error('Réponse incorrecte : ' + e + res.body));
                }
            });
    });
    it('get all users with error because of invalid cred', function (done) {
        const token = generateInvalidToken()
        request(app)
            .get('/getUsers')
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(function (err, res) {
                if (err) { return done(err); }
                done();
            });
    });
});

describe('POST /login', function () {
    this.timeout(10000);
    it('register correctly', function (done) {
        const postData = {
            username: 'testuser',
            email: 'test.user@gmail.com',
            uid: 'mRcxx8F5QzfeREjRyul5mN4co8P2',
            password: 'testtest'
        };
        request(app)
            .post('/login')
            .expect(200)
            .send(postData)
            .end(function (err, res) {
                if (err) return done(err);
                jwt.verify(res.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
                    if (err) return done(err)
                })
                done();
            });
    });
    it('login correctly', function (done) {
        const postData = {
            email: 'test.user@gmail.com',
            uid: 'mRcxx8F5QzfeREjRyul5mN4co8P2',
            password: 'testtest'
        };
        request(app)
            .post('/login')
            .expect(200)
            .send(postData)
            .end(function (err, res) {
                if (err) return done(err);
                jwt.verify(res.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
                    if (err) return done(err)
                })
                done();
            });
    });
    it('register Incorrectly without email', function (done) {
        const postData = {
            username: 'testuser',
            uid: 'mRcxx8F5QzfeREjRyul5mN4co8P2',
            password: 'testtest'
        };
        request(app)
            .post('/login')
            .expect(400)
            .send(postData)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('register Incorrectly without uid', function (done) {
        const postData = {
            username: 'testuser',
            email: 'test.user@gmail.com',
            password: 'testtest'
        };
        request(app)
            .post('/login')
            .expect(400)
            .send(postData)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('register Incorrectly without password', function (done) {
        const postData = {
            username: 'testuser',
            uid: 'mRcxx8F5QzfeREjRyul5mN4co8P2',
            email: 'test.user@gmail.com',
        };
        request(app)
            .post('/login')
            .expect(400)
            .send(postData)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
});

describe('POST only incorrectly /deployNft', function () {
    this.timeout(10000);
    
    it('deployNft Incorrectly empty imagePath', function (done) {
        const token = generateValidToken()
        const postData = {
        };
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .send(postData)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
    it('deployNft Incorrectly null imagePath', function (done) {
        const token = generateValidToken()
        const postData = {
            imagePath: null
        };
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .send(postData)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
    it('deployNft Incorrectly without Bearer', function (done) {
        const postData = {
        };
        request(app)
            .post('/deployNft')
            .expect(401)
            .send(postData)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
});

// COMPLICATED

describe('POST /deployNft /burnMyNft', function () {
    this.timeout(30000);
    var deployNftTransactionData;

    it('deploy -> burn nft', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;
                request(app)                    
                    .post('/burnMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg"
                    })
                    .end(async function (err) {
                        if (err) return done(err);
                        done();
                    });
            });
    });

    it('incorrect token for deploy -> burn nft', function (done) {
        const token = generateInvalidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;
                request(app)
                    .post('/burnMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(403)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg"
                    })
                    .end(async function (err) {
                        if (err) return done(err);
                        done();
                    });
            });
    });

    it('no token for deploy -> burn nft', function (done) {
        request(app)
            .post('/deployNft')
            .expect(401)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;
                request(app)
                    .post('/burnMyNft')
                    .expect(401)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg"
                    })
                    .end(async function (err) {
                        if (err) return done(err);
                        done();
                    });
            });
    });

    it('deploy -> incorrect token for burn nft', function (done) {
        const goodToken = generateValidToken()
        const badToken = generateInvalidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${goodToken}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;
                request(app)
                    .post('/burnMyNft')
                    .set('Authorization', `Bearer ${badToken}`)
                    .expect(403)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg"
                    })
                    .end(async function (err) {
                        if (err) {
                            request(app)
                                .post('/burnMyNft')
                                .set('Authorization', `Bearer ${goodToken}`)
                                .expect(200)
                                .send({
                                    NftId: deployNftTransactionData.NFTokenID,
                                    NftUri: "men/24.jpeg"
                                })
                                .end(async function (err) {
                                    if (err) return done(err)
                                    done();
                                });
                            return done(err)
                        };
                        done();
                    });
            });
    });

    it('deploy -> no token for burn nft', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;
                request(app)
                    .post('/burnMyNft')
                    .expect(401)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg"
                    })
                    .end(async function (err) {
                        if (err) {
                            request(app)
                                .post('/burnMyNft')
                                .set('Authorization', `Bearer ${token}`)
                                .expect(200)
                                .send({
                                    NftId: deployNftTransactionData.NFTokenID,
                                    NftUri: "men/24.jpeg"
                                })
                                .end(async function (err) {
                                    if (err) return done(err)
                                    done();
                                });
                            return done(err)
                        };
                        done();
                    });
            });
    });
});




describe('POST /deployNft /getmyNft -> check if here /burn ', function () {
    this.timeout(30000);
    var deployNftTransactionData;
    var myNftsData;

    it('deploy -> get -> check -> burn nft', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;

                request(app)
                    .get('/getMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) return done(err);
                        myNftsData = res.body;
                        if (!myNftsData.some(token => token.NFTokenID === deployNftTransactionData.NFTokenID))
                            return done(new Error("NFT deployed not found"));
                        request(app)
                            .post('/burnMyNft')
                            .set('Authorization', `Bearer ${token}`)
                            .expect(200)
                            .send({
                                NftId: deployNftTransactionData.NFTokenID,
                                NftUri: "men/24.jpeg"
                            })
                            .end(async function (err) {
                                if (err) return done(err);
                                done();
                            });
                    });
            });
    });
});
    

describe('POST /deployNft /getmyNft -> check if here /burn check if here', function () {
    this.timeout(30000);
    var deployNftTransactionData;
    var myNftsData;

    it('deploy -> get -> check -> burn nft -> check', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;

                request(app)
                    .get('/getMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) return done(err);
                        myNftsData = res.body;
                        if (!myNftsData.some(token => token.NFTokenID === deployNftTransactionData.NFTokenID))
                            return done(new Error("NFT deployed not found"));
                        request(app)
                            .post('/burnMyNft')
                            .set('Authorization', `Bearer ${token}`)
                            .expect(200)
                            .send({
                                NftId: deployNftTransactionData.NFTokenID,
                                NftUri: "men/24.jpeg"
                            })
                            .end(async function (err) {
                                if (err) return done(err);
                                request(app)
                                    .get('/getMyNft')
                                    .set('Authorization', `Bearer ${token}`)
                                    .expect(200)
                                    .end(function (err, res) {
                                        if (err) return done(err);
                                        myNftsData = res.body;
                                        if (myNftsData.some(token => token.NFTokenID === deployNftTransactionData.NFTokenID))
                                            return done(new Error("NFT deployed found but should be burnt"));
                                        done();
                                    });
                            });
                    });
            });
    });
});


describe('POST /deployNft /getmyNft -> check if here /burn check if here /burn same', function () {
    this.timeout(40000);
    var deployNftTransactionData;
    var myNftsData;

    it('deploy -> get -> check -> burn nft -> check', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;

                request(app)
                    .get('/getMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) return done(err);
                        myNftsData = res.body;
                        if (!myNftsData.some(token => token.NFTokenID === deployNftTransactionData.NFTokenID))
                            return done(new Error("NFT deployed not found"));
                        request(app)
                            .post('/burnMyNft')
                            .set('Authorization', `Bearer ${token}`)
                            .expect(200)
                            .send({
                                NftId: deployNftTransactionData.NFTokenID,
                                NftUri: "men/24.jpeg"
                            })
                            .end(async function (err) {
                                if (err) return done(err);
                                request(app)
                                    .get('/getMyNft')
                                    .set('Authorization', `Bearer ${token}`)
                                    .expect(200)
                                    .end(function (err, res) {
                                        if (err) return done(err);
                                        myNftsData = res.body;
                                        if (myNftsData.some(token => token.NFTokenID === deployNftTransactionData.NFTokenID))
                                            return done(new Error("NFT deployed found but should be burnt"));
                                        request(app)
                                            .post('/burnMyNft')
                                            .set('Authorization', `Bearer ${token}`)
                                            .expect(400)
                                            .send({
                                                NftId: deployNftTransactionData.NFTokenID,
                                                NftUri: "men/24.jpeg"
                                            })
                                            .end(async function (err, res) {
                                                if (err) return done(err);
                                                done();
                                            });
                                    });
                            });
                    });
            });
    });
});


describe('POST /deployNft /sellMyNft /burnMyNft', function () {
    this.timeout(30000);
    var deployNftTransactionData;

    it('deploy -> sell -> burn nft', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .send({
                imagePath: "men/24.jpeg"
            })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;

                request(app)
                    .post('/sellMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg",
                        Price: "2",
                        Email: "test.user@gmail.com"
                    })
                    .end(function (err) {
                        if (err) return done(err);

                        request(app)
                            .post('/burnMyNft')
                            .set('Authorization', `Bearer ${token}`)
                            .expect(200)
                            .send({
                                NftId: deployNftTransactionData.NFTokenID,
                                NftUri: "men/24.jpeg"
                            })
                            .end(function (err) {
                                if (err) return done(err);
                                done();
                            });
                    });
            });
    });
});

describe('POST /deployNft /sellMyNft /burnMyNft', function () {
    this.timeout(30000);
    var deployNftTransactionData;
    it('deploy -> sell -> burn nft with no token id', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;

                request(app)
                    .post('/sellMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        NftId: deployNftTransactionData.NFTokenID,
                        NftUri: "men/24.jpeg",
                        Price: "2",
                        Email: "test.user@gmail.com"
                    })
                    .expect(200)
                    .end(function (err) {
                        if (err) return done(err);

                        request(app)
                            .post('/burnMyNft')
                            .set('Authorization', `Bearer ${token}`)
                            .expect(400)
                            .send({
                                NftUri: "men/24.jpeg"
                            })
                            .end(function (err) {
                                if (err) {
                                    request(app)
                                        .post('/burnMyNft')
                                        .set('Authorization', `Bearer ${token}`)
                                        .expect(200)
                                        .send({
                                            NftId: deployNftTransactionData.NFTokenID,
                                            NftUri: "men/24.jpeg"
                                        })
                                        .end(function (err) {
                                            if (err) return done(err);
                                            done();
                                        });

                                    return done(err);
                                }
                                done();
                            });
                    });
            });
    });
});




describe('POST /deployNft /sellMyNft /burnMyNft', function () {
    this.timeout(30000);
    var deployNftTransactionData;
    it('deploy -> sell with no token id -> burn nft', function (done) {
        const token = generateValidToken()
        request(app)
            .post('/deployNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .send({
                imagePath: "men/24.jpeg"
            })
            .end(function (err, res) {
                if (err) return done(err);
                deployNftTransactionData = res.body;

                request(app)
                    .post('/sellMyNft')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(400)
                    .send({
                        NftUri: "men/24.jpeg",
                        Price: "2",
                        Email: "test.user@gmail.com"
                    })
                    .end(function (err) {
                        if (err) {
                            request(app)
                                .post('/burnMyNft')
                                .set('Authorization', `Bearer ${token}`)
                                .expect(200)
                                .send({
                                    NftId: deployNftTransactionData.NFTokenID,
                                    NftUri: "men/24.jpeg"
                                })
                                .end(function (err) {
                                    if (err) return done(err);
                                    done();
                                });

                            return done(err);
                        }
                        done();
                    });
            });
    });
});

describe('GET /getNftsOnSale', function () {
    this.timeout(5000);

    it('get all nfts on sale', function (done) {
        const token = generateValidToken()
        request(app)
            .get('/getNftsOnSale')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });

    it('get all nfts on sale with invalid cred', function (done) {
        const token = generateInvalidToken()
        request(app)
            .get('/getNftsOnSale')
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });

    it('get all nfts on sale with no cred', function (done) {
        request(app)
            .get('/getNftsOnSale')
            .expect(401)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
});

describe('GET /getNftsOnSaleOnlyId', function () {
    this.timeout(5000);

    it('get all nfts on sale only id', function (done) {
        const token = generateValidToken()
        request(app)
            .get('/getNftsOnSaleOnlyId')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('get all nfts on sale only id with invalid cred', function (done) {
        const token = generateInvalidToken()
        request(app)
            .get('/getNftsOnSaleOnlyId')
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });

    it('get all nfts on sale only id with no cred', function (done) {
        request(app)
            .get('/getNftsOnSaleOnlyId')
            .expect(401)
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
});


describe('GET /getMyNft', function () {
    this.timeout(5000);
    it('recuperation des nfts du compte test', function (done) {
        const token = generateValidToken()
        request(app)
            .get('/getMyNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                if (JSON.stringify(userTestNft) == JSON.stringify(res.body)) return done(new Error("récupération des nfts du user test incorrect"))
                done();
            });
    });
    it('get error with invalid cred', function (done) {
        const token = generateInvalidToken()
        request(app)
            .get('/getMyNft')
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('get error with no cred', function (done) {
        request(app)
            .get('/getMyNft')
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
});