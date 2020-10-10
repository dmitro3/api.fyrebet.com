const express = require("express");
const router = express.Router();
const User = require('./dbo/user');
const roll = require('./classes/provablyfair')
const { Validator } = require('node-input-validator'); // Input validation
const FortuneWheel = require('./games/fortune-wheel');
const Errors = require('./errors');
const crypto = require("crypto-js");
const dispatcher = require("./dispatcher");


const ratesActions = require("./actions/rates");

const UserRouter = require("./routers/user");
const ChatRouter = require('./routers/chat');

const bootstrapChat = require("./sql/bootstrapper")


UserRouter.map(([method, route, func]) => {
  router[method](route, func);
});
ChatRouter.map(([method, route, func]) => {
  router[method](route, func);
});



router.get("/init", async (req, res) => {
  await bootstrapChat.createDefaultChatRooms();
  res.send({ response: "OK" }).status(200);
});


router.get("/", (req, res) => {
  console.log('Request.')
  res.send({ response: "Server is up." }).status(200);
});


router.post("/is-email-registered", async (req, res) => {
  let email = req.params.email;

  if (email && await User.emailExists(email)) {
    res.send(true).status(302);
  }
  res.send(false).status(404);
});

const debug = true;



router.get('/rates', async (req, res) => {
  // FortuneWheel.socket.emit("SUCCESS", Errors.ERR_INSUFFICIENT_BALANCE)
  res.send(
    await ratesActions.getRates()
  );
});

router.get('/testt/:nonce', async (req, res) => {
  //let data = FortuneWheel.newRound();



  let rollsSum = 0;
  let floorSums = 0;
  let houseWins = 0;

  for (let i = 0; i < 100000; i++) {

    // Really secret seed
    let secret = '.' + Date.now().toString().split("").reverse().join("") + "." + Date.now().toString() + i.toString() + ".x";
    let hashedSecret = crypto.SHA256(secret).toString(crypto.enc.Hex);
    let draw = roll(hashedSecret, i);

    let wheelRoll = draw * 54 / 100;
    let wheelFloorRool = Math.floor(wheelRoll);
    rollsSum += wheelRoll;
    floorSums += wheelFloorRool;

    if (grayPositionms.includes(wheelFloorRool)) {
      // house wins 3k from red,blue,gold but paysout 1k to gray
      houseWins += 2000;
    }
    if (redPositions.includes(wheelFloorRool)) {
      // house wins 3k from gray,blue,gold but paysout 2k to red
      houseWins += 1000;
    }
    if (bluePositions.includes(wheelFloorRool)) {
      // house wins 3k from gray,red,gold but paysout 4k to blue
      houseWins -= 1000;
    }
    if (wheelFloorRool === 0) {
      // house wins 3k from gray,red,blue but paysout 49k to gold
      houseWins -= 46000;
    }
  }
  res.send(houseWins.toString());
});

router.get('/createbots', async (req, res) => {
  // const usernames = [{ "username": "playboy20" }, { "username": "luckycunt" }, { "username": "robywilliams0" }, { "username": "itizwatitiz" }, { "username": "patrick" }, { "username": "imyourbroooo" }, { "username": "martin10" }, { "username": "cryptoftw" }, { "username": "joshuakalips" }, { "username": "miko" }, { "username": "theshark81" }, { "username": "isellmywife" }, { "username": "prokid" }, { "username": "TryME" }, { "username": "kidster" }, { "username": "flusha" }, { "username": "startbet01" }, { "username": "CoolBiceps" }, { "username": "troublediplomas" }, { "username": "clipman" }, { "username": "tedHandy" }, { "username": "jackdawpurr" }, { "username": "bloodTrapper" }, { "username": "spaghettiuforgeti" }, { "username": "CONESHEGS" }, { "username": "SwearGILL" }, { "username": "TafBlueTail" }, { "username": "RememberDaGiggle" }, { "username": "lovelycuntxD" }, { "username": "cometome" }, { "username": "SINGLEcrib" }, { "username": "sportsfeature" }, { "username": "gacruxpowa" }, { "username": "mechanist" }, { "username": "mcdonaldwoofer" }, { "username": "gangstapranksta" }, { "username": "Jerry" }, { "username": "plotconfined" }];
  // usernames.map((item) => {
  //   User.createUser({
  //     username: item.username,
  //     email: item.username + "@mail.com",
  //     password: item.username + "@mails.com",
  //     isBot: true,
  //   })
  // });
});

router.get('/provably-fair/:nonce', async (req, res) => {
  var clientSeed = "suckdicksss"; //dont forget to exclude the dash and the nonce!
  var serverSeed = "your sssss`erver seed";

  //bet made with seed pair (excluding current bet)
  var nonce = req.params.nonce;
  let sums = 0;

  for (let i = 0; i < 10000; i++) {
    sums += roll(serverSeed, clientSeed + '-' + i);
  }

  res.send((sums / 10000).toString());
})





router.get('/rates', async (req, res) => {
  // FortuneWheel.socket.emit("SUCCESS", Errors.ERR_INSUFFICIENT_BALANCE)
  res.send(
    await ratesActions.getRates()
  );
});


router.post('/', (req, res) => {
  res.send({ response: 'true' })
})


module.exports = router;