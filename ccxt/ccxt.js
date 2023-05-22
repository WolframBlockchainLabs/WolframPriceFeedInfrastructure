import ccxt from "ccxt";
import pg from "pg";
const { Client } = pg;

// const clientNew = {
//     username: 'postgres',
//     password: 'password',
//     database: 'ccdb',
//     host: 'db',
//     port: 5432};

const client = new Client({
  user: "postgres",
  password: "password",
  database: "ccdb",
  dialect: "postgres",
  host: "localhost",
  port: 5432,
});
client.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

const fetchData = async () => {
  try {
    const binance = new ccxt.binance();
    const binanceInfo = await binance.loadMarkets();
    const result = await binance.fetchOrderBook("BTC/EUR");  
    console.log(result.bids);

    try {
        const query = `INSERT INTO "OrderBooks" ("marketId", "bids", "asks") VALUES ($1, $2, $3)`
        const values = [1, [123], [5]];
        console.log('before insert');
        await client.query(query, values) 
    } catch (error) {
        console.log(error);
    }


    

  } catch (error){
    console.log(error);
  }
};
fetchData()

// console.log(JSON.stringify(data));


// async function cctxRun() {
//     // const kraken = new ccxt.kraken();
//     const binance = new ccxt.binance();
//     // const gemini = new ccxt.gemini();

//     // const krakenInfo = await kraken.loadMarkets();
//     const binanceInfo = await binance.loadMarkets();
//     // const geminiInfo = await gemini.loadMarkets();

//     // console.log(binanceInfo);
//     // const forOrderBook = await kraken.fetchOrderBook('ETH/BTC');

//     // const forOrderBooKBinance = await binance.fetchOrderBook('BTC/EUR')
//     // const forTrades = await kraken.fetchTrades('ETH/BTC', 1684157191904 );

//     // const forTradesBinance = await binance.fetchTrades('ETH/BTC')
//     // const forTicker = await kraken.fetchTicker('ETH/BTC')
//     // const forTickerBinance = await binance.fetchTicker('ETH/BTC')
//     // const forOrderBookGemini = await gemini.fetchOrderBook('ETH/BTC')
//     // const forTradeGemini = await gemini.fetchTrades('ETH/BTC', 1)
//     // const forGeminiTicker = await gemini.fetchTicker('ETH/BTC')
//     //   const forTickers = await kraken.fetchTickers()
//     //   const forStatus = await kraken.fetchStatus()
//     //   const forFetchOHLCV  = await kraken.fetchOHLCV('1INCH/EUR')

//     //   console.log(forFetchOHLCV);

//     // fs.writeFileSync("krakOrder.json", JSON.stringify(forOrderBook));
//     // fs.writeFileSync("krakTrades2.json", JSON.stringify(forTrades));
//     // fs.writeFileSync("krakTicker.json", JSON.stringify(forTicker));
//     // fs.writeFileSync("binanceOrderBook1.json", JSON.stringify(forOrderBooKBinance));
//     // fs.writeFileSync("binance.json", JSON.stringify(binance));
//     // fs.writeFileSync("binanceTrades.json", JSON.stringify(forTradesBinance));
//     // fs.writeFileSync("binanceTicker.json", JSON.stringify(forTickerBinance));
//     // fs.writeFileSync("GeminiInfo.json", JSON.stringify(geminiInfo));
//     // fs.writeFileSync("GeminiOrderBook1.json", JSON.stringify(forOrderBookGemini));
//     // fs.writeFileSync("GeminiTrades.json", JSON.stringify(forTradeGemini));
//     // fs.writeFileSync("GeminiTicker.json", JSON.stringify(forGeminiTicker));

//     // const data = await Promise.all(symbols.forEach(async symbol=>{
//     //     await kraken.fetchOrderBook(symbol)
//     //     // console.log(symbol);
//     // }))

//     // console.log(data);

//     // fs.writeFileSync('123.json', JSON.stringify(krakenInfo));
// }

// cctxRun();
