const mongoClient = require('mongodb').MongoClient
const state = {db:null}

module.exports.connect = function(done){
    const url = 'mongodb://localhost:27017';
    // const url = 'mongodb+srv://ac-blgxrb6-shard-00-00.nwgruhr.mongodb.net:27017,ac-blgxrb6-shard-00-01.nwgruhr.mongodb.net:27017,ac-blgxrb6-shard-00-02.nwgruhr.mongodb.net:27017/bigshopper?replicaSet=atlas-1dghxu-shard-0" --ssl --authenticationDatabase admin --username sterin --password Sterin%40123'
    const dbname = 'bigshopper';

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
    })
    
}

module.exports.get = function(){
    return state.db
}


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://sterin:Sterin%40123@bigshopper.nwgruhr.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("bigshopper").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
