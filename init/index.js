const mongoose = require('mongoose') 
const initData = require('./data.js')
const Listing = require('../models/listing.js')



main().then((res) =>{
    console.log("connect to DB");
}).catch((err) =>{
    console.log("not connected to DB");
})

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  
}
const initDB = async () => {
    await Listing.deleteMany({});
    
    const romanUserId = "68b6dd91994393e4d74d358a"; // should exist in Users collection
    const initDataWithOwner = initData.data.map(obj => ({
        ...obj,
        owner: mongoose.Types.ObjectId(romanUserId) // convert string to ObjectId
    }));

    await Listing.insertMany(initDataWithOwner);
    console.log("Data was saved with correct owner ObjectId");
}

initDB();

