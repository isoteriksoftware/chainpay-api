const bip39 = require("bip39");
const hdkey = require("hdkey");
const ethUtil = require("ethereumjs-util");
const ethTx = require("ethereumjs-tx");
const express = require("express");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

let pathId = 0;
const mnemonic = bip39.generateMnemonic();
console.log(mnemonic);

app.get("/api/merchant-address", (req, res) => {
  const response = {};
  let address;

  (async () => {
    try {
      const seed = await bip39.mnemonicToSeed(mnemonic);
      console.log("Seed: " + seed);

      const rootNode = hdkey.fromMasterSeed(seed);
      const masterPrivateKey = rootNode.privateKey.toString("hex");
      console.log("Master private key: " + masterPrivateKey);

      const masterPublicKey = rootNode.publicKey.toString("hex");
      console.log("Master public key: " + masterPublicKey);

      const path = `m/44'/60'/0'/0/${pathId}`;
      console.log("Root node: " + rootNode);

      const addressNode = rootNode.derive(path);
      console.log("path: " + path);

      const publicKey = ethUtil.privateToPublic(addressNode.privateKey);
      console.log("Public key: " + publicKey.toString("hex"));

      const pubToAddress = ethUtil.publicToAddress(publicKey).toString("hex");
      console.log("Public key to address: " + pubToAddress);

      address = ethUtil.toChecksumAddress(pubToAddress);
      console.log("Address with check sum: " + address);

      response.address = address;
      res.json(response);

      if (pathId < 100) pathId++;
      else pathId = 0;
    } catch (e) {
      console.log(e);
    }
  })();
});

const server = app.listen(process.env.PORT || 5000, () => {
  const port = server.address().port;
  console.log(`Server running on port: ${port}`);
});
