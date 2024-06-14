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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 0 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_65686237749379525263138999652126209949201934271010366394849630801988942131313_Fast_HighBall_InsideStrike_2930_Power_Middle_Middle_Strike(
    )
        public
    {
        //  Nonces 65686237749379525263138999652126209949201934271010366394849630801988942131313 and 2930 generate
        // random number 0 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            65_686_237_749_379_525_263_138_999_652_126_209_949_201_934_271_010_366_394_849_630_801_988_942_131_313,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2930, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 0 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_65686237749379525263138999652126209949201934271010366394849630801988942131313_Fast_HighBall_InsideStrike_23804_Power_Middle_Middle_Strike(
    )
        public
    {
        //  Nonces 65686237749379525263138999652126209949201934271010366394849630801988942131313 and 23804 generate
        // random number 4999 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            65_686_237_749_379_525_263_138_999_652_126_209_949_201_934_271_010_366_394_849_630_801_988_942_131_313,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(23_804, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 0 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_65686237749379525263138999652126209949201934271010366394849630801988942131313_Fast_HighBall_InsideStrike_4683_Power_Middle_Middle_Strike(
    )
        public
    {
        //  Nonces 65686237749379525263138999652126209949201934271010366394849630801988942131313 and 4683 generate
        // random number 9999 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            65_686_237_749_379_525_263_138_999_652_126_209_949_201_934_271_010_366_394_849_630_801_988_942_131_313,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(4683, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_99040106910354088664340605326131809105991529673177939176246891022451497110668_Fast_Middle_InsideStrike_2627_Power_Middle_Middle_Foul(
    )
        public
    {
        //  Nonces 99040106910354088664340605326131809105991529673177939176246891022451497110668 and 2627 generate
        // random number 0 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            99_040_106_910_354_088_664_340_605_326_131_809_105_991_529_673_177_939_176_246_891_022_451_497_110_668,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2627, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_99040106910354088664340605326131809105991529673177939176246891022451497110668_Fast_Middle_InsideStrike_6054_Power_Middle_Middle_Foul(
    )
        public
    {
        //  Nonces 99040106910354088664340605326131809105991529673177939176246891022451497110668 and 6054 generate
        // random number 1999 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            99_040_106_910_354_088_664_340_605_326_131_809_105_991_529_673_177_939_176_246_891_022_451_497_110_668,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(6054, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_99040106910354088664340605326131809105991529673177939176246891022451497110668_Fast_Middle_InsideStrike_15938_Power_Middle_Middle_Foul(
    )
        public
    {
        //  Nonces 99040106910354088664340605326131809105991529673177939176246891022451497110668 and 15938 generate
        // random number 3999 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            99_040_106_910_354_088_664_340_605_326_131_809_105_991_529_673_177_939_176_246_891_022_451_497_110_668,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(15_938, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 3 --pitch-hor 4 --swing-type 1
     * --swing-vert 3 --swing-hor 3
     */
    function test_32061386110044083800252479881904741175752556045021122783415455594732640393917_Fast_LowStrike_OutsideBall_8309_Power_LowStrike_OutsideStrike_Single(
    )
        public
    {
        //  Nonces 32061386110044083800252479881904741175752556045021122783415455594732640393917 and 8309 generate
        // random number 4000 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            32_061_386_110_044_083_800_252_479_881_904_741_175_752_556_045_021_122_783_415_455_594_732_640_393_917,
            PitchSpeed.Fast,
            VerticalLocation.LowStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(8309, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 3 --pitch-hor 4 --swing-type 1
     * --swing-vert 3 --swing-hor 3
     */
    function test_32061386110044083800252479881904741175752556045021122783415455594732640393917_Fast_LowStrike_OutsideBall_49935_Power_LowStrike_OutsideStrike_Single(
    )
        public
    {
        //  Nonces 32061386110044083800252479881904741175752556045021122783415455594732640393917 and 49935 generate
        // random number 5849 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            32_061_386_110_044_083_800_252_479_881_904_741_175_752_556_045_021_122_783_415_455_594_732_640_393_917,
            PitchSpeed.Fast,
            VerticalLocation.LowStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(49_935, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 3 --pitch-hor 4 --swing-type 1
     * --swing-vert 3 --swing-hor 3
     */
    function test_32061386110044083800252479881904741175752556045021122783415455594732640393917_Fast_LowStrike_OutsideBall_2878_Power_LowStrike_OutsideStrike_Single(
    )
        public
    {
        //  Nonces 32061386110044083800252479881904741175752556045021122783415455594732640393917 and 2878 generate
        // random number 7699 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            32_061_386_110_044_083_800_252_479_881_904_741_175_752_556_045_021_122_783_415_455_594_732_640_393_917,
            PitchSpeed.Fast,
            VerticalLocation.LowStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2878, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 1 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_111226050657822924597491446253991213025840145394201015488938793738637304727056_Slow_Middle_InsideStrike_11505_Power_Middle_OutsideStrike_Double(
    )
        public
    {
        //  Nonces 111226050657822924597491446253991213025840145394201015488938793738637304727056 and 11505 generate
        // random number 9099 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            111_226_050_657_822_924_597_491_446_253_991_213_025_840_145_394_201_015_488_938_793_738_637_304_727_056,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(11_505, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 1 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_111226050657822924597491446253991213025840145394201015488938793738637304727056_Slow_Middle_InsideStrike_5682_Power_Middle_OutsideStrike_Double(
    )
        public
    {
        //  Nonces 111226050657822924597491446253991213025840145394201015488938793738637304727056 and 5682 generate
        // random number 7700 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            111_226_050_657_822_924_597_491_446_253_991_213_025_840_145_394_201_015_488_938_793_738_637_304_727_056,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5682, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 1 --pitch-vert 2 --pitch-hor 1 --swing-type 1
     * --swing-vert 2 --swing-hor 3
     */
    function test_111226050657822924597491446253991213025840145394201015488938793738637304727056_Slow_Middle_InsideStrike_9624_Power_Middle_OutsideStrike_Double(
    )
        public
    {
        //  Nonces 111226050657822924597491446253991213025840145394201015488938793738637304727056 and 9624 generate
        // random number 8399 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            111_226_050_657_822_924_597_491_446_253_991_213_025_840_145_394_201_015_488_938_793_738_637_304_727_056,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(9624, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 0 --pitch-hor 2 --swing-type 1
     * --swing-vert 0 --swing-hor 2
     */
    function test_110272984089120695342144296309024110718048875277997935968562678835896684431432_Fast_HighBall_Middle_14585_Power_HighBall_Middle_Triple(
    )
        public
    {
        //  Nonces 110272984089120695342144296309024110718048875277997935968562678835896684431432 and 14585 generate
        // random number 7500 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            110_272_984_089_120_695_342_144_296_309_024_110_718_048_875_277_997_935_968_562_678_835_896_684_431_432,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(14_585, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 0 --pitch-hor 2 --swing-type 1
     * --swing-vert 0 --swing-hor 2
     */
    function test_110272984089120695342144296309024110718048875277997935968562678835896684431432_Fast_HighBall_Middle_15406_Power_HighBall_Middle_Triple(
    )
        public
    {
        //  Nonces 110272984089120695342144296309024110718048875277997935968562678835896684431432 and 15406 generate
        // random number 7749 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            110_272_984_089_120_695_342_144_296_309_024_110_718_048_875_277_997_935_968_562_678_835_896_684_431_432,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(15_406, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 0 --pitch-hor 2 --swing-type 1
     * --swing-vert 0 --swing-hor 2
     */
    function test_110272984089120695342144296309024110718048875277997935968562678835896684431432_Fast_HighBall_Middle_17179_Power_HighBall_Middle_Triple(
    )
        public
    {
        //  Nonces 110272984089120695342144296309024110718048875277997935968562678835896684431432 and 17179 generate
        // random number 7999 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            110_272_984_089_120_695_342_144_296_309_024_110_718_048_875_277_997_935_968_562_678_835_896_684_431_432,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(17_179, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 0 --pitch-hor 3 --swing-type 1
     * --swing-vert 0 --swing-hor 3
     */
    function test_70742784270056657581884307797108841089344138257779225355304684713507588495343_Fast_HighBall_OutsideStrike_11687_Power_HighBall_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 70742784270056657581884307797108841089344138257779225355304684713507588495343 and 11687 generate
        // random number 8000 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            70_742_784_270_056_657_581_884_307_797_108_841_089_344_138_257_779_225_355_304_684_713_507_588_495_343,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(11_687, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 0 --pitch-hor 3 --swing-type 1
     * --swing-vert 0 --swing-hor 3
     */
    function test_70742784270056657581884307797108841089344138257779225355304684713507588495343_Fast_HighBall_OutsideStrike_6874_Power_HighBall_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 70742784270056657581884307797108841089344138257779225355304684713507588495343 and 6874 generate
        // random number 8999 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            70_742_784_270_056_657_581_884_307_797_108_841_089_344_138_257_779_225_355_304_684_713_507_588_495_343,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(6874, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 0 --pitch-hor 3 --swing-type 1
     * --swing-vert 0 --swing-hor 3
     */
    function test_70742784270056657581884307797108841089344138257779225355304684713507588495343_Fast_HighBall_OutsideStrike_7560_Power_HighBall_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 70742784270056657581884307797108841089344138257779225355304684713507588495343 and 7560 generate
        // random number 9999 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            70_742_784_270_056_657_581_884_307_797_108_841_089_344_138_257_779_225_355_304_684_713_507_588_495_343,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(7560, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 0 --pitch-vert 2 --pitch-hor 0 --swing-type 0
     * --swing-vert 4 --swing-hor 0
     */
    function test_50854314433890071022989996820635348696297975617722869624891647074907967575707_Fast_Middle_InsideBall_475_Contact_LowBall_InsideBall_InPlayOut(
    )
        public
    {
        //  Nonces 50854314433890071022989996820635348696297975617722869624891647074907967575707 and 475 generate random
        // number 9100 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            50_854_314_433_890_071_022_989_996_820_635_348_696_297_975_617_722_869_624_891_647_074_907_967_575_707,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(475, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.InsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 0 --pitch-vert 2 --pitch-hor 0 --swing-type 0
     * --swing-vert 4 --swing-hor 0
     */
    function test_50854314433890071022989996820635348696297975617722869624891647074907967575707_Fast_Middle_InsideBall_19544_Contact_LowBall_InsideBall_InPlayOut(
    )
        public
    {
        //  Nonces 50854314433890071022989996820635348696297975617722869624891647074907967575707 and 19544 generate
        // random number 9549 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            50_854_314_433_890_071_022_989_996_820_635_348_696_297_975_617_722_869_624_891_647_074_907_967_575_707,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(19_544, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.InsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 0 --pitch-vert 2 --pitch-hor 0 --swing-type 0
     * --swing-vert 4 --swing-hor 0
     */
    function test_50854314433890071022989996820635348696297975617722869624891647074907967575707_Fast_Middle_InsideBall_7551_Contact_LowBall_InsideBall_InPlayOut(
    )
        public
    {
        //  Nonces 50854314433890071022989996820635348696297975617722869624891647074907967575707 and 7551 generate
        // random number 9999 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            50_854_314_433_890_071_022_989_996_820_635_348_696_297_975_617_722_869_624_891_647_074_907_967_575_707,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(7551, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.InsideBall);

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

    function test_trusted_exec_example() public {
        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(125, PitchSpeed.Slow, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(126, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

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
}
