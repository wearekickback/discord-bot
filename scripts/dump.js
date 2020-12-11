const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
let url
console.log('KICKBACK_BOT_MONGO_URL', process.env.KICKBACK_BOT_MONGO_URL)
if(process.env.KICKBACK_BOT_MONGO_URL && process.env.KICKBACK_BOT_MONGO_URL.match(/^mongodb/)){
  console.log('KICKBACK_BOT_MONGO_URL is set')
  url = process.env.KICKBACK_BOT_MONGO_URL
}else{
  throw('Set KICKBACK_BOT_MONGO_URL')
}
const dbName = 'kickback-bot';

MongoClient.connect(url, (err, client) => {
  if(err) throw(err)
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  ['chatUsers', 'submissions'].map(collectionName => {
    const collection = db.collection(collectionName);
    collection.find({}).toArray(function(err, docs) {
      if(err) throw(err)
      let path = `./data/${collectionName}.json`
      console.log(`Dumping ${docs.length} records on ${collectionName} collection to ${path}`);
      fs.writeFileSync(path, JSON.stringify(docs))
    });  
  })

  client.close();
});