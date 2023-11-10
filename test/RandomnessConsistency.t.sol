// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "../lib/forge-std/src/Test.sol";
import { FullcountTestBase } from "./Fullcount.t.sol";

/**
 * These tests check that the "fullcount randomness inspect" tool generates the same random numbers from
 * nonces as the Fullcount smart contract.
 *
 * Test names are as follows:
 * test_<nonce1>_<nonce2>_<denominator>_<expected_output>
 *
 * The expected output for this test would be generated using:
 * $ fullcount randomness inspect -n <nonce1> -N <nonce2> -d <denominator>
 */
contract RandomnessConsistencyTest is FullcountTestBase {
    /**
     * $ fullcount randomness inspect -n 1 -N 2 -d 10000
     * Nonce 1: 1, Nonce 2: 2, Denominator: 10000
     * Random sample: 9136
     */
    function test_1_2_10000_9136() public {
        assertEq(game.randomSample(1, 2, 10_000), 9136);
    }

    /**
     * $ fullcount randomness inspect -n 1 -N 2 -d 1
     * Nonce 1: 1, Nonce 2: 2, Denominator: 1
     * Random sample: 0
     */
    function test_1_2_1_0() public {
        assertEq(game.randomSample(1, 2, 1), 0);
    }

    /**
     * $ fullcount randomness inspect -n 29384923 -N 984543 -d 10000
     * Nonce 1: 29384923, Nonce 2: 29384923, Denominator: 10000
     * Random sample: 365
     */
    function test_29384923_984543_10000_365() public {
        assertEq(game.randomSample(29_384_923, 984_543, 10_000), 365);
    }

    /**
     * $ fullcount randomness inspect -n 29384923 -N 984543 -d 123984239
     * Nonce 1: 29384923, Nonce 2: 29384923, Denominator: 123984239
     * Random sample: 72037728
     */
    function test_29384923_984543_123984239_72037728() public {
        assertEq(game.randomSample(29_384_923, 984_543, 123_984_239), 72_037_728);
    }

    /**
     * $ fullcount randomness inspect -n 287349237429034239084 -N 239480239842390842390482390 -d 10000
     * Nonce 1: 287349237429034239084, Nonce 2: 287349237429034239084, Denominator: 10000
     * Random sample: 7575
     */
    function test_287349237429034239084_239480239842390842390482390_10000_7575() public {
        assertEq(game.randomSample(287_349_237_429_034_239_084, 239_480_239_842_390_842_390_482_390, 10_000), 7575);
    }

    // Correspsonds to distance 0 outcome tests
    function test_2_277_10000_4457() public {
        assertEq(game.randomSample(2, 277, 10_000), 4457);  
    }

    function test_3_2245_10000_4458() public {
        assertEq(game.randomSample(3, 2245, 10_000), 4458);  
    }

    function test_4_1260_10000_5866() public {
        assertEq(game.randomSample(4, 1260, 10_000), 5866);  
    }

    function test_5_1904_10000_6999() public {
        assertEq(game.randomSample(5, 1904, 10_000), 6999);  
    }

    function test_6_18702_10000_7000() public {
        assertEq(game.randomSample(6, 18702, 10_000), 7000);  
    }

    /**
    * $ fullcount randomness inspect -n 10 -N 13750 -d 10000
    * Nonce 1: 10, Nonce 2: 10, Denominator: 10000
    * Random sample: 499
    */
    function test_10_13750_10000_499() public {
        assertEq(game.randomSample(10, 13750, 10000), 499);
    }

}
