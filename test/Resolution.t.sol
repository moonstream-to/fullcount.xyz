// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "../lib/forge-std/src/Test.sol";
import { FullcountTestBase } from "./Fullcount.t.sol";
import { Fullcount } from "../src/Fullcount.sol";
import {
    PlayerType,
    Session,
    Pitch,
    Swing,
    PitchSpeed,
    SwingType,
    VerticalLocation,
    HorizontalLocation,
    Outcome
} from "../src/data.sol";

/**
 * These tests were generated using the "fullcount codegen outcome-tests" command.
 * WARNING: Do not put manually written tests in this contract.
 */
contract ResolutionTest is FullcountTestBase {
    uint256 SessionID;
    address PitcherNFTAddress;
    uint256 PitcherTokenID;
    address BatterNFTAddress;
    uint256 BatterTokenID;

    function setUp() public virtual override {
        super.setUp();

        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher, false);

        vm.stopPrank();

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        SessionID = sessionID;
        PitcherNFTAddress = address(characterNFTs);
        PitcherTokenID = tokenID;
        BatterNFTAddress = address(otherCharacterNFTs);
        BatterTokenID = otherTokenID;
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 1 --pitch-hor 0 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_53636414796787111351049665755288371011221745379470127565060084802567310083887_Fast_HighStrike_InsideBall_2449_Contact_HighBall_OutsideStrike_Strike(
    )
        public
    {
        //  Nonces 53636414796787111351049665755288371011221745379470127565060084802567310083887 and 2449 generate
        // random number 0 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            53_636_414_796_787_111_351_049_665_755_288_371_011_221_745_379_470_127_565_060_084_802_567_310_083_887,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2449, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Strike, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Strike));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 1 --pitch-hor 0 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_53636414796787111351049665755288371011221745379470127565060084802567310083887_Fast_HighStrike_InsideBall_7457_Contact_HighBall_OutsideStrike_Strike(
    )
        public
    {
        //  Nonces 53636414796787111351049665755288371011221745379470127565060084802567310083887 and 7457 generate
        // random number 3499 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            53_636_414_796_787_111_351_049_665_755_288_371_011_221_745_379_470_127_565_060_084_802_567_310_083_887,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(7457, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Strike, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Strike));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 1 --pitch-hor 0 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_53636414796787111351049665755288371011221745379470127565060084802567310083887_Fast_HighStrike_InsideBall_8639_Contact_HighBall_OutsideStrike_Strike(
    )
        public
    {
        //  Nonces 53636414796787111351049665755288371011221745379470127565060084802567310083887 and 8639 generate
        // random number 6999 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            53_636_414_796_787_111_351_049_665_755_288_371_011_221_745_379_470_127_565_060_084_802_567_310_083_887,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(8639, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Strike, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Strike));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 1 --pitch-vert 0 --pitch-hor 3 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_76272677889733487807869088975394561199007238211299295369669345782657832457462_Slow_HighBall_OutsideStrike_6060_Contact_HighBall_OutsideStrike_Foul(
    )
        public
    {
        //  Nonces 76272677889733487807869088975394561199007238211299295369669345782657832457462 and 6060 generate
        // random number 0 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            76_272_677_889_733_487_807_869_088_975_394_561_199_007_238_211_299_295_369_669_345_782_657_832_457_462,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(6060, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Foul, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Foul));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 1 --pitch-vert 0 --pitch-hor 3 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_76272677889733487807869088975394561199007238211299295369669345782657832457462_Slow_HighBall_OutsideStrike_5027_Contact_HighBall_OutsideStrike_Foul(
    )
        public
    {
        //  Nonces 76272677889733487807869088975394561199007238211299295369669345782657832457462 and 5027 generate
        // random number 1249 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            76_272_677_889_733_487_807_869_088_975_394_561_199_007_238_211_299_295_369_669_345_782_657_832_457_462,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5027, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Foul, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Foul));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 1 --pitch-vert 0 --pitch-hor 3 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_76272677889733487807869088975394561199007238211299295369669345782657832457462_Slow_HighBall_OutsideStrike_6004_Contact_HighBall_OutsideStrike_Foul(
    )
        public
    {
        //  Nonces 76272677889733487807869088975394561199007238211299295369669345782657832457462 and 6004 generate
        // random number 2499 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            76_272_677_889_733_487_807_869_088_975_394_561_199_007_238_211_299_295_369_669_345_782_657_832_457_462,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(6004, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Foul, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Foul));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 1 --pitch-vert 4 --pitch-hor 4 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_33362354671537370654190716892156555408700188156617020216245752358008161499558_Slow_LowBall_OutsideBall_24524_Power_Middle_OutsideStrike_Single(
    )
        public
    {
        //  Nonces 33362354671537370654190716892156555408700188156617020216245752358008161499558 and 24524 generate
        // random number 7000 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            33_362_354_671_537_370_654_190_716_892_156_555_408_700_188_156_617_020_216_245_752_358_008_161_499_558,
            PitchSpeed.Slow,
            VerticalLocation.LowBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(24_524, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Single, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Single));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 1 --pitch-vert 4 --pitch-hor 4 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_33362354671537370654190716892156555408700188156617020216245752358008161499558_Slow_LowBall_OutsideBall_2623_Power_Middle_OutsideStrike_Single(
    )
        public
    {
        //  Nonces 33362354671537370654190716892156555408700188156617020216245752358008161499558 and 2623 generate
        // random number 8499 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            33_362_354_671_537_370_654_190_716_892_156_555_408_700_188_156_617_020_216_245_752_358_008_161_499_558,
            PitchSpeed.Slow,
            VerticalLocation.LowBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2623, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Single, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Single));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 1 --pitch-vert 4 --pitch-hor 4 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_33362354671537370654190716892156555408700188156617020216245752358008161499558_Slow_LowBall_OutsideBall_5469_Power_Middle_OutsideStrike_Single(
    )
        public
    {
        //  Nonces 33362354671537370654190716892156555408700188156617020216245752358008161499558 and 5469 generate
        // random number 7749 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            33_362_354_671_537_370_654_190_716_892_156_555_408_700_188_156_617_020_216_245_752_358_008_161_499_558,
            PitchSpeed.Slow,
            VerticalLocation.LowBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5469, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Single, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Single));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 0 --pitch-vert 2 --pitch-hor 2 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_115501419915073027201528450984807047638958490173387813223494386604734350200751_Fast_Middle_Middle_222_Contact_HighBall_OutsideStrike_Double(
    )
        public
    {
        //  Nonces 115501419915073027201528450984807047638958490173387813223494386604734350200751 and 222 generate
        // random number 8624 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            115_501_419_915_073_027_201_528_450_984_807_047_638_958_490_173_387_813_223_494_386_604_734_350_200_751,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(222, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Double, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Double));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 0 --pitch-vert 2 --pitch-hor 2 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_115501419915073027201528450984807047638958490173387813223494386604734350200751_Fast_Middle_Middle_4574_Contact_HighBall_OutsideStrike_Double(
    )
        public
    {
        //  Nonces 115501419915073027201528450984807047638958490173387813223494386604734350200751 and 4574 generate
        // random number 8500 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            115_501_419_915_073_027_201_528_450_984_807_047_638_958_490_173_387_813_223_494_386_604_734_350_200_751,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(4574, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Double, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Double));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 0 --pitch-vert 2 --pitch-hor 2 --swing-type 0
     * --swing-vert 0 --swing-hor 3
     */
    function test_115501419915073027201528450984807047638958490173387813223494386604734350200751_Fast_Middle_Middle_28812_Contact_HighBall_OutsideStrike_Double(
    )
        public
    {
        //  Nonces 115501419915073027201528450984807047638958490173387813223494386604734350200751 and 28812 generate
        // random number 8749 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            115_501_419_915_073_027_201_528_450_984_807_047_638_958_490_173_387_813_223_494_386_604_734_350_200_751,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(28_812, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Double, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Double));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 1 --pitch-vert 2 --pitch-hor 4 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_30878253991008052489834351670334743750262955920015606602786415223606657291215_Slow_Middle_OutsideBall_543_Power_Middle_OutsideStrike_Triple(
    )
        public
    {
        //  Nonces 30878253991008052489834351670334743750262955920015606602786415223606657291215 and 543 generate random
        // number 7000 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            30_878_253_991_008_052_489_834_351_670_334_743_750_262_955_920_015_606_602_786_415_223_606_657_291_215,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(543, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Triple, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Triple));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 1 --pitch-vert 2 --pitch-hor 4 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_30878253991008052489834351670334743750262955920015606602786415223606657291215_Slow_Middle_OutsideBall_17257_Power_Middle_OutsideStrike_Triple(
    )
        public
    {
        //  Nonces 30878253991008052489834351670334743750262955920015606602786415223606657291215 and 17257 generate
        // random number 7249 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            30_878_253_991_008_052_489_834_351_670_334_743_750_262_955_920_015_606_602_786_415_223_606_657_291_215,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(17_257, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Triple, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Triple));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 1 --pitch-vert 2 --pitch-hor 4 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_30878253991008052489834351670334743750262955920015606602786415223606657291215_Slow_Middle_OutsideBall_11518_Power_Middle_OutsideStrike_Triple(
    )
        public
    {
        //  Nonces 30878253991008052489834351670334743750262955920015606602786415223606657291215 and 11518 generate
        // random number 7499 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            30_878_253_991_008_052_489_834_351_670_334_743_750_262_955_920_015_606_602_786_415_223_606_657_291_215,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(11_518, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Triple, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Triple));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 3 --swing-hor 1
     */
    function test_80491828288466500398500201838979874564536822010908142391208468039821070678148_Fast_Middle_InsideStrike_6323_Power_LowStrike_InsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 80491828288466500398500201838979874564536822010908142391208468039821070678148 and 6323 generate
        // random number 9499 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            80_491_828_288_466_500_398_500_201_838_979_874_564_536_822_010_908_142_391_208_468_039_821_070_678_148,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(6323, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.InsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.HomeRun, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.HomeRun));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 3 --swing-hor 1
     */
    function test_80491828288466500398500201838979874564536822010908142391208468039821070678148_Fast_Middle_InsideStrike_32155_Power_LowStrike_InsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 80491828288466500398500201838979874564536822010908142391208468039821070678148 and 32155 generate
        // random number 8700 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            80_491_828_288_466_500_398_500_201_838_979_874_564_536_822_010_908_142_391_208_468_039_821_070_678_148,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(32_155, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.InsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.HomeRun, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.HomeRun));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 3 --swing-hor 1
     */
    function test_80491828288466500398500201838979874564536822010908142391208468039821070678148_Fast_Middle_InsideStrike_101_Power_LowStrike_InsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 80491828288466500398500201838979874564536822010908142391208468039821070678148 and 101 generate random
        // number 9099 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            80_491_828_288_466_500_398_500_201_838_979_874_564_536_822_010_908_142_391_208_468_039_821_070_678_148,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(101, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.InsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.HomeRun, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.HomeRun));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 1 --pitch-vert 0 --pitch-hor 4 --swing-type 0
     * --swing-vert 1 --swing-hor 3
     */
    function test_26552784285933202465540785509845637871737540752676713985038719979779669496190_Slow_HighBall_OutsideBall_9442_Contact_HighStrike_OutsideStrike_InPlayOut(
    )
        public
    {
        //  Nonces 26552784285933202465540785509845637871737540752676713985038719979779669496190 and 9442 generate
        // random number 9374 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            26_552_784_285_933_202_465_540_785_509_845_637_871_737_540_752_676_713_985_038_719_979_779_669_496_190,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(9442, SwingType.Contact, VerticalLocation.HighStrike, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.InPlayOut, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.InPlayOut));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 1 --pitch-vert 0 --pitch-hor 4 --swing-type 0
     * --swing-vert 1 --swing-hor 3
     */
    function test_26552784285933202465540785509845637871737540752676713985038719979779669496190_Slow_HighBall_OutsideBall_1374_Contact_HighStrike_OutsideStrike_InPlayOut(
    )
        public
    {
        //  Nonces 26552784285933202465540785509845637871737540752676713985038719979779669496190 and 1374 generate
        // random number 8750 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            26_552_784_285_933_202_465_540_785_509_845_637_871_737_540_752_676_713_985_038_719_979_779_669_496_190,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(1374, SwingType.Contact, VerticalLocation.HighStrike, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.InPlayOut, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.InPlayOut));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 1 --pitch-vert 0 --pitch-hor 4 --swing-type 0
     * --swing-vert 1 --swing-hor 3
     */
    function test_26552784285933202465540785509845637871737540752676713985038719979779669496190_Slow_HighBall_OutsideBall_27290_Contact_HighStrike_OutsideStrike_InPlayOut(
    )
        public
    {
        //  Nonces 26552784285933202465540785509845637871737540752676713985038719979779669496190 and 27290 generate
        // random number 9999 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            26_552_784_285_933_202_465_540_785_509_845_637_871_737_540_752_676_713_985_038_719_979_779_669_496_190,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(27_290, SwingType.Contact, VerticalLocation.HighStrike, HorizontalLocation.OutsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.InPlayOut, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.InPlayOut));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }
}
