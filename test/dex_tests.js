const Dex = artifacts.require("Dex")
const Doge = artifacts.require("Doge")
const truffleAssert = require('truffle-assertions');

contract("Dex", accounts => {
    //The user must have ETH deposited such that deposited eth >= buy order value
    it("should throw an error if ETH balance is too low when creating BUY limit order", async () => {
        let dex = await Dex.deployed()
        //let doge = await Doge.deployed()

        await truffleAssert.reverts(
            dex.createLimitOrder(0, web3.utils.fromUtf8("DOGE"), 10, 1)
        )
    })
    //The user must have enough tokens deposited such that token balance >= sell order amount
    it("should throw an error if token balance is too low when creating SELL limit order", async () => {
        let dex = await Dex.deployed()
        let doge = await Doge.deployed()
        await truffleAssert.reverts(
            dex.createLimitOrder(1, web3.utils.fromUtf8("DOGE"), 10, 1)
        )
        await doge.approve(dex.address, 500);
        await dex.addToken(web3.utils.fromUtf8("DOGE"), doge.address, {from: accounts[0]})
        await dex.deposit(10, web3.utils.fromUtf8("DOGE"));
        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.fromUtf8("DOGE"), 10, 1)
        )
    })
    //The BUY order book should be ordered on price from highest to lowest starting at index 0
    it("The BUY order book should be ordered on price from highest to lowest starting at index 0", async () => {
        let dex = await Dex.deployed()
        let doge = await Doge.deployed()
        await doge.approve(dex.address, 500);
        await dex.depositEth({value: 3000});
        await dex.createLimitOrder(0, web3.utils.fromUtf8("DOGE"), 1, 300); 
        await dex.createLimitOrder(0, web3.utils.fromUtf8("DOGE"), 1, 100);
        await dex.createLimitOrder(0, web3.utils.fromUtf8("DOGE"), 1, 200);

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("DOGE"), 0);
        assert(orderbook.length > 0);
        console.log(orderbook);
        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price >= orderbook[i+1].price, "not right order in buy book")
        }
    })
    //The SELL order book should be ordered on price from lowest to highest starting at index 0
    it("The SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {
        let dex = await Dex.deployed()
        let doge = await Doge.deployed()
        await doge.approve(dex.address, 500);
        await dex.createLimitOrder(1, web3.utils.fromUtf8("DOGE"), 1, 300)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("DOGE"), 1, 100)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("DOGE"), 1, 200)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("DOGE"), 1);
        assert(orderbook.length > 0);

        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price <= orderbook[i+1].price, "not right order in sell book")
        }
    })

})