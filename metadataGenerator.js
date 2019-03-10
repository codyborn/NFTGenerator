const path = require('path');
const storage = require('azure-storage');
const fs = require('fs');
const ipfsAPI = require('ipfs-api');
const ipfsClient = require("ipfs-http-client");
const express = require('express');
const app = express();

const blobSecret = fs.readFileSync("blob.secret").toString().trim();
process.env.AZURE_STORAGE_CONNECTION_STRING = blobSecret;
var queueSvc = storage.createQueueService();

var redemptionCodeContainer = "metadataurls";
var retryOperations = new storage.ExponentialRetryPolicyFilter();
var queueSvc = storage.createQueueService().withFilter(retryOperations);

async function uploadToIPFS (content) {
    //Connecting to the ipfs network via infura gateway
    const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

    //Addfile router for adding file a local file to the IPFS network without any local node
    var res = await app.get('/addfile');
    let bufferedContent = ipfs.types.Buffer.from(content);
    return await ipfs.add(bufferedContent);
}

async function main(){
    queueSvc.createQueueIfNotExists(redemptionCodeContainer, function(error, results, response){
        if(!error){
            for (var i = 0; i < 100; i++) {
                var metadata = {}
                metadata.description = "Non-fungible sticker";
                metadata.attributes = [];
                
                var stickerSelector = Math.random();
                if (stickerSelector < .1) { 
                    metadata.image = "https://imgur.com/5zp1W1D.png";
                    metadata.name = "Doge";
                }
                else if (stickerSelector < .5) { 
                    metadata.image = "https://imgur.com/RCXBZOP.png";
                    metadata.name = "Inception";
                }
                else if (stickerSelector < .8) { 
                    metadata.image = "https://imgur.com/rXWkIdO.png";
                    metadata.name = "Ethereum";
                }
                else if (stickerSelector < .95) { 
                    metadata.image = "https://imgur.com/COZfLDC.png";
                    metadata.name = "Holo";
                }
                else { 
                    metadata.image = "https://imgur.com/Ma21rem.png";
                    metadata.name = "Nyanicorn";
                }
                
                var stickerTypeSelector = Math.random();
                var stickerType;
                if (stickerTypeSelector < .1) {
                    stickerType = "scratch_and_sniff";
                }
                else if (stickerTypeSelector < .2) {
                    stickerType = "vinyl";
                }
                else if (stickerTypeSelector < .3) {
                    stickerType = "fuzzy";
                }
                else if (stickerTypeSelector < .4) {
                    stickerType = "holographic";
                }
                else if (stickerTypeSelector < .5) {
                    stickerType = "paper";
                }
                else if (stickerTypeSelector < .6) {
                    stickerType = "glow_in_the_dark";
                }
                else if (stickerTypeSelector < .7) {
                    stickerType = "matte";
                }
                else if (stickerTypeSelector < .8) {
                    stickerType = "patch";
                }
                else if (stickerTypeSelector < .9) {
                    stickerType = "puffy";
                }
                else {
                    stickerType = "temporary_tattoo";
                }
                
                metadata.attributes.push({trait_type:"type", value:stickerType});

                var stickiness = Math.floor((Math.random()*100)%50+50);
                metadata.attributes.push({display_type: "boost_percentage", trait_type:"stickiness", value:stickiness});
                
                metadata.attributes.push({display_type: "number", trait_type:"generation", value:0});
                
                uploadToIPFS(JSON.stringify(metadata)).then((ipfsURL) => {
                    var attendeeURL = "https://ipfs.io/ipfs/"+ipfsURL[0].path;
                    console.log(attendeeURL);
                    queueSvc.createMessage(redemptionCodeContainer, attendeeURL, function(error, results, response){
                        if(!error){
                            console.log("Added item");
                        }
                    });
                })
            }
        }
    });
}

main()
  .then(console.log)
  .catch(console.error)