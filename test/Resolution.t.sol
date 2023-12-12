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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 0 --pitch-hor 3 --swing-type 1
     * --swing-vert 0 --swing-hor 0
     */
    function test_1049021687222126610802454284509212319382457272717699306926378180865829833280_Fast_HighBall_OutsideStrike_14846_Power_HighBall_InsideBall_Single(
    )
        public
    {
        //  Nonces 1049021687222126610802454284509212319382457272717699306926378180865829833280 and 14846 generate
        // random number 6000 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            1_049_021_687_222_126_610_802_454_284_509_212_319_382_457_272_717_699_306_926_378_180_865_829_833_280,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(14_846, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.InsideBall);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 0 --pitch-hor 3 --swing-type 1
     * --swing-vert 0 --swing-hor 0
     */
    function test_1049021687222126610802454284509212319382457272717699306926378180865829833280_Fast_HighBall_OutsideStrike_5672_Power_HighBall_InsideBall_Single(
    )
        public
    {
        //  Nonces 1049021687222126610802454284509212319382457272717699306926378180865829833280 and 5672 generate random
        // number 6635 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            1_049_021_687_222_126_610_802_454_284_509_212_319_382_457_272_717_699_306_926_378_180_865_829_833_280,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5672, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.InsideBall);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 0 --pitch-hor 3 --swing-type 1
     * --swing-vert 0 --swing-hor 0
     */
    function test_1049021687222126610802454284509212319382457272717699306926378180865829833280_Fast_HighBall_OutsideStrike_3623_Power_HighBall_InsideBall_Single(
    )
        public
    {
        //  Nonces 1049021687222126610802454284509212319382457272717699306926378180865829833280 and 3623 generate random
        // number 6317 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            1_049_021_687_222_126_610_802_454_284_509_212_319_382_457_272_717_699_306_926_378_180_865_829_833_280,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(3623, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.InsideBall);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 3 --swing-hor 3
     */
    function test_13878950540724399130699174649043457636982143338026946178985896842721427747167_Fast_HighStrike_OutsideStrike_27426_Contact_LowStrike_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 13878950540724399130699174649043457636982143338026946178985896842721427747167 and 27426 generate
        // random number 4568 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            13_878_950_540_724_399_130_699_174_649_043_457_636_982_143_338_026_946_178_985_896_842_721_427_747_167,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(27_426, SwingType.Contact, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 3 --swing-hor 3
     */
    function test_13878950540724399130699174649043457636982143338026946178985896842721427747167_Fast_HighStrike_OutsideStrike_24391_Contact_LowStrike_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 13878950540724399130699174649043457636982143338026946178985896842721427747167 and 24391 generate
        // random number 4783 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            13_878_950_540_724_399_130_699_174_649_043_457_636_982_143_338_026_946_178_985_896_842_721_427_747_167,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(24_391, SwingType.Contact, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 3 --swing-hor 3
     */
    function test_13878950540724399130699174649043457636982143338026946178985896842721427747167_Fast_HighStrike_OutsideStrike_2785_Contact_LowStrike_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 13878950540724399130699174649043457636982143338026946178985896842721427747167 and 2785 generate
        // random number 4999 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            13_878_950_540_724_399_130_699_174_649_043_457_636_982_143_338_026_946_178_985_896_842_721_427_747_167,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(2785, SwingType.Contact, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 2 --pitch-hor 0 --swing-type 1
     * --swing-vert 1 --swing-hor 1
     */
    function test_89945021098686570139325674050881369998229748902165957706437741571902570180120_Fast_Middle_InsideBall_11382_Power_HighStrike_InsideStrike_Strikeout(
    )
        public
    {
        //  Nonces 89945021098686570139325674050881369998229748902165957706437741571902570180120 and 11382 generate
        // random number 0 which maps to Outcome.Strikeout.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            89_945_021_098_686_570_139_325_674_050_881_369_998_229_748_902_165_957_706_437_741_571_902_570_180_120,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(11_382, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.InsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Strikeout, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.batter.didReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Strikeout));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 2 --pitch-hor 0 --swing-type 1
     * --swing-vert 1 --swing-hor 1
     */
    function test_89945021098686570139325674050881369998229748902165957706437741571902570180120_Fast_Middle_InsideBall_8307_Power_HighStrike_InsideStrike_Strikeout(
    )
        public
    {
        //  Nonces 89945021098686570139325674050881369998229748902165957706437741571902570180120 and 8307 generate
        // random number 2999 which maps to Outcome.Strikeout.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            89_945_021_098_686_570_139_325_674_050_881_369_998_229_748_902_165_957_706_437_741_571_902_570_180_120,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(8307, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.InsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Strikeout, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.batter.didReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Strikeout));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 0 --pitch-vert 2 --pitch-hor 0 --swing-type 1
     * --swing-vert 1 --swing-hor 1
     */
    function test_89945021098686570139325674050881369998229748902165957706437741571902570180120_Fast_Middle_InsideBall_5872_Power_HighStrike_InsideStrike_Strikeout(
    )
        public
    {
        //  Nonces 89945021098686570139325674050881369998229748902165957706437741571902570180120 and 5872 generate
        // random number 5999 which maps to Outcome.Strikeout.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            89_945_021_098_686_570_139_325_674_050_881_369_998_229_748_902_165_957_706_437_741_571_902_570_180_120,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5872, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.InsideStrike);

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID, Outcome.Strikeout, PitcherNFTAddress, PitcherTokenID, BatterNFTAddress, BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.batter.didReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.Strikeout));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    /**
     * To generate boundary and interior condition tests for this test case:
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 1 --pitch-vert 1 --pitch-hor 4 --swing-type 1
     * --swing-vert 4 --swing-hor 4
     */
    function test_100481080998296392191365173002285024694107022523030749537901599408673377815667_Slow_HighStrike_OutsideBall_13874_Power_LowBall_OutsideBall_Triple(
    )
        public
    {
        //  Nonces 100481080998296392191365173002285024694107022523030749537901599408673377815667 and 13874 generate
        // random number 6837 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            100_481_080_998_296_392_191_365_173_002_285_024_694_107_022_523_030_749_537_901_599_408_673_377_815_667,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(13_874, SwingType.Power, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 1 --pitch-vert 1 --pitch-hor 4 --swing-type 1
     * --swing-vert 4 --swing-hor 4
     */
    function test_100481080998296392191365173002285024694107022523030749537901599408673377815667_Slow_HighStrike_OutsideBall_1859_Power_LowBall_OutsideBall_Triple(
    )
        public
    {
        //  Nonces 100481080998296392191365173002285024694107022523030749537901599408673377815667 and 1859 generate
        // random number 6846 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            100_481_080_998_296_392_191_365_173_002_285_024_694_107_022_523_030_749_537_901_599_408_673_377_815_667,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(1859, SwingType.Power, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 1 --pitch-vert 1 --pitch-hor 4 --swing-type 1
     * --swing-vert 4 --swing-hor 4
     */
    function test_100481080998296392191365173002285024694107022523030749537901599408673377815667_Slow_HighStrike_OutsideBall_14754_Power_LowBall_OutsideBall_Triple(
    )
        public
    {
        //  Nonces 100481080998296392191365173002285024694107022523030749537901599408673377815667 and 14754 generate
        // random number 6855 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            100_481_080_998_296_392_191_365_173_002_285_024_694_107_022_523_030_749_537_901_599_408_673_377_815_667,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(14_754, SwingType.Power, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 2 --pitch-hor 3 --swing-type 1
     * --swing-vert 3 --swing-hor 1
     */
    function test_27396150803863136439008615961271347825519983904573989306967321670860879085882_Fast_Middle_OutsideStrike_5335_Power_LowStrike_InsideStrike_Double(
    )
        public
    {
        //  Nonces 27396150803863136439008615961271347825519983904573989306967321670860879085882 and 5335 generate
        // random number 6736 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            27_396_150_803_863_136_439_008_615_961_271_347_825_519_983_904_573_989_306_967_321_670_860_879_085_882,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5335, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.InsideStrike);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 2 --pitch-hor 3 --swing-type 1
     * --swing-vert 3 --swing-hor 1
     */
    function test_27396150803863136439008615961271347825519983904573989306967321670860879085882_Fast_Middle_OutsideStrike_4531_Power_LowStrike_InsideStrike_Double(
    )
        public
    {
        //  Nonces 27396150803863136439008615961271347825519983904573989306967321670860879085882 and 4531 generate
        // random number 6836 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            27_396_150_803_863_136_439_008_615_961_271_347_825_519_983_904_573_989_306_967_321_670_860_879_085_882,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(4531, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.InsideStrike);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 2 --pitch-hor 3 --swing-type 1
     * --swing-vert 3 --swing-hor 1
     */
    function test_27396150803863136439008615961271347825519983904573989306967321670860879085882_Fast_Middle_OutsideStrike_9787_Power_LowStrike_InsideStrike_Double(
    )
        public
    {
        //  Nonces 27396150803863136439008615961271347825519983904573989306967321670860879085882 and 9787 generate
        // random number 6636 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            27_396_150_803_863_136_439_008_615_961_271_347_825_519_983_904_573_989_306_967_321_670_860_879_085_882,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(9787, SwingType.Power, VerticalLocation.LowStrike, HorizontalLocation.InsideStrike);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 2 --pitch-hor 2 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_111500307696102841260223026743650025952726101597964309549886540063107304466468_Fast_Middle_Middle_2841_Power_Middle_Middle_InPlayOut(
    )
        public
    {
        //  Nonces 111500307696102841260223026743650025952726101597964309549886540063107304466468 and 2841 generate
        // random number 5500 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            111_500_307_696_102_841_260_223_026_743_650_025_952_726_101_597_964_309_549_886_540_063_107_304_466_468,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2841, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 2 --pitch-hor 2 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_111500307696102841260223026743650025952726101597964309549886540063107304466468_Fast_Middle_Middle_26696_Power_Middle_Middle_InPlayOut(
    )
        public
    {
        //  Nonces 111500307696102841260223026743650025952726101597964309549886540063107304466468 and 26696 generate
        // random number 7749 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            111_500_307_696_102_841_260_223_026_743_650_025_952_726_101_597_964_309_549_886_540_063_107_304_466_468,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(26_696, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
        assertTrue(session.batter.didReveal);
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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 0 --pitch-vert 2 --pitch-hor 2 --swing-type 1
     * --swing-vert 2 --swing-hor 2
     */
    function test_111500307696102841260223026743650025952726101597964309549886540063107304466468_Fast_Middle_Middle_1966_Power_Middle_Middle_InPlayOut(
    )
        public
    {
        //  Nonces 111500307696102841260223026743650025952726101597964309549886540063107304466468 and 1966 generate
        // random number 9999 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            111_500_307_696_102_841_260_223_026_743_650_025_952_726_101_597_964_309_549_886_540_063_107_304_466_468,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(1966, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle);

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
        assertTrue(session.batter.didReveal);
        assertEq(uint256(session.outcome), uint256(Outcome.InPlayOut));

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }
}
