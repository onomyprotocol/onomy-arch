import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";

import {deployContracts, sortValidators} from "../test-utils";
import {examplePowers} from "../test-utils/pure";

chai.use(solidity);
const {expect} = chai;


async function runNormalTest(opts: {}) {


    // Prep and deploy contract
    // ========================
    const signers = await ethers.getSigners();
    const gravityId = ethers.utils.formatBytes32String("foo");
    // This is the power distribution on the Cosmos hub as of 7/14/2020
    let powers = examplePowers();
    let validators = sortValidators(signers.slice(0, powers.length));

    const {
        gravity,
        testERC20,
    } = await deployContracts(gravityId, validators, powers);


    // Transfer out to Cosmos, locking coins
    // =====================================
    await testERC20.functions.approve(gravity.address, 1000);
    await expect(gravity.functions.sendToCosmos(
        testERC20.address,
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000
    )).to.emit(gravity, 'SendToCosmosEvent').withArgs(
        testERC20.address,
        await signers[0].getAddress(),
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000,
        2
    );

    expect((await testERC20.functions.balanceOf(gravity.address))[0]).to.equal(1000);
    expect((await gravity.functions.state_lastEventNonce())[0]).to.equal(2);


    // Do it again
    // =====================================
    await testERC20.functions.approve(gravity.address, 1000);
    await expect(gravity.functions.sendToCosmos(
        testERC20.address,
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000
    )).to.emit(gravity, 'SendToCosmosEvent').withArgs(
        testERC20.address,
        await signers[0].getAddress(),
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000,
        3
    );

    expect((await testERC20.functions.balanceOf(gravity.address))[0]).to.equal(2000);
    expect((await gravity.functions.state_lastEventNonce())[0]).to.equal(3);
}

async function runSendAndBurnBnomTest(opts: {}) {

    // Prep and deploy contract
    // ========================
    const signers = await ethers.getSigners();
    const gravityId = ethers.utils.formatBytes32String("foo");
    // This is the power distribution on the Cosmos hub as of 7/14/2020
    let powers = examplePowers();
    let validators = sortValidators(signers.slice(0, powers.length));
    const {
        gravity,
        testERC20BNOM,
    } = await deployContracts(gravityId, validators, powers);

    // Transfer out to Cosmos, locking coins
    // =====================================
    await testERC20BNOM.functions.approve(gravity.address, 1000);
    await expect(gravity.functions.sendToCosmos(
        testERC20BNOM.address,
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000
    )).to.emit(gravity, 'SendToCosmosEvent').withArgs(
        testERC20BNOM.address,
        await signers[0].getAddress(),
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000,
        2
    );

    expect((await testERC20BNOM.functions.balanceOf(gravity.address))[0]).to.equal(0);
    expect((await gravity.functions.state_lastEventNonce())[0]).to.equal(2);

    // Do it again
    // =====================================
    await testERC20BNOM.functions.approve(gravity.address, 1000);
    await expect(gravity.functions.sendToCosmos(
        testERC20BNOM.address,
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000
    )).to.emit(gravity, 'SendToCosmosEvent').withArgs(
        testERC20BNOM.address,
        await signers[0].getAddress(),
        ethers.utils.formatBytes32String("myCosmosAddress"),
        1000,
        3
    );

    expect((await testERC20BNOM.functions.balanceOf(gravity.address))[0]).to.equal(0);
    expect((await gravity.functions.state_lastEventNonce())[0]).to.equal(3);
}

describe("sendToCosmos tests", function () {
    it("normal sendToCosmos", async function () {
        await runNormalTest({})
    });
    it("sendToCosmos and burn bnom", async function () {
        await runSendAndBurnBnomTest({})
    });
});