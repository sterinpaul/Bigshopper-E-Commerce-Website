const {MongoClient} = require('mongodb')
const state = {db:null}

module.exports.connect = function(done){
    const dbname = process.env.DATABASE_NAME
    const url = process.env.MONGODB_ATLAS_URL;
  try{
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(client=>{
      state.db = client.db(dbname);
      done();
    })
  }catch(error){
    done(error);
  }
}

module.exports.get = function(){
    return state.db
}