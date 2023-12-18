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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 1 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 0 --swing-hor 0
     */
    function test_81893017823874769801906908035192746668162095865890101500053572628606081271057_Slow_HighStrike_OutsideStrike_4070_Contact_HighBall_InsideBall_Strike(
    )
        public
    {
        //  Nonces 81893017823874769801906908035192746668162095865890101500053572628606081271057 and 4070 generate
        // random number 0 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            81_893_017_823_874_769_801_906_908_035_192_746_668_162_095_865_890_101_500_053_572_628_606_081_271_057,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(4070, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.InsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 1 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 0 --swing-hor 0
     */
    function test_81893017823874769801906908035192746668162095865890101500053572628606081271057_Slow_HighStrike_OutsideStrike_4167_Contact_HighBall_InsideBall_Strike(
    )
        public
    {
        //  Nonces 81893017823874769801906908035192746668162095865890101500053572628606081271057 and 4167 generate
        // random number 4999 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            81_893_017_823_874_769_801_906_908_035_192_746_668_162_095_865_890_101_500_053_572_628_606_081_271_057,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(4167, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.InsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 0 --pitch-type 1 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 0 --swing-hor 0
     */
    function test_81893017823874769801906908035192746668162095865890101500053572628606081271057_Slow_HighStrike_OutsideStrike_15216_Contact_HighBall_InsideBall_Strike(
    )
        public
    {
        //  Nonces 81893017823874769801906908035192746668162095865890101500053572628606081271057 and 15216 generate
        // random number 9999 which maps to Outcome.Strike.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            81_893_017_823_874_769_801_906_908_035_192_746_668_162_095_865_890_101_500_053_572_628_606_081_271_057,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(15_216, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.InsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 2 --pitch-hor 3 --swing-type 1
     * --swing-vert 1 --swing-hor 2
     */
    function test_8896391875205613932298229962938938694841002446457628837939997515662919318336_Fast_Middle_OutsideStrike_4043_Power_HighStrike_Middle_Foul(
    )
        public
    {
        //  Nonces 8896391875205613932298229962938938694841002446457628837939997515662919318336 and 4043 generate random
        // number 5249 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            8_896_391_875_205_613_932_298_229_962_938_938_694_841_002_446_457_628_837_939_997_515_662_919_318_336,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(4043, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 2 --pitch-hor 3 --swing-type 1
     * --swing-vert 1 --swing-hor 2
     */
    function test_8896391875205613932298229962938938694841002446457628837939997515662919318336_Fast_Middle_OutsideStrike_19734_Power_HighStrike_Middle_Foul(
    )
        public
    {
        //  Nonces 8896391875205613932298229962938938694841002446457628837939997515662919318336 and 19734 generate
        // random number 4500 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            8_896_391_875_205_613_932_298_229_962_938_938_694_841_002_446_457_628_837_939_997_515_662_919_318_336,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(19_734, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 2 --pitch-type 0 --pitch-vert 2 --pitch-hor 3 --swing-type 1
     * --swing-vert 1 --swing-hor 2
     */
    function test_8896391875205613932298229962938938694841002446457628837939997515662919318336_Fast_Middle_OutsideStrike_5875_Power_HighStrike_Middle_Foul(
    )
        public
    {
        //  Nonces 8896391875205613932298229962938938694841002446457628837939997515662919318336 and 5875 generate random
        // number 5999 which maps to Outcome.Foul.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            8_896_391_875_205_613_932_298_229_962_938_938_694_841_002_446_457_628_837_939_997_515_662_919_318_336,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5875, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 4 --pitch-hor 0 --swing-type 0
     * --swing-vert 4 --swing-hor 2
     */
    function test_73880998331054308679733447677928138855511350019791931962590171442024355864647_Fast_LowBall_InsideBall_11419_Contact_LowBall_Middle_Single(
    )
        public
    {
        //  Nonces 73880998331054308679733447677928138855511350019791931962590171442024355864647 and 11419 generate
        // random number 3000 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            73_880_998_331_054_308_679_733_447_677_928_138_855_511_350_019_791_931_962_590_171_442_024_355_864_647,
            PitchSpeed.Fast,
            VerticalLocation.LowBall,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(11_419, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 4 --pitch-hor 0 --swing-type 0
     * --swing-vert 4 --swing-hor 2
     */
    function test_73880998331054308679733447677928138855511350019791931962590171442024355864647_Fast_LowBall_InsideBall_3389_Contact_LowBall_Middle_Single(
    )
        public
    {
        //  Nonces 73880998331054308679733447677928138855511350019791931962590171442024355864647 and 3389 generate
        // random number 3954 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            73_880_998_331_054_308_679_733_447_677_928_138_855_511_350_019_791_931_962_590_171_442_024_355_864_647,
            PitchSpeed.Fast,
            VerticalLocation.LowBall,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(3389, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 3 --pitch-type 0 --pitch-vert 4 --pitch-hor 0 --swing-type 0
     * --swing-vert 4 --swing-hor 2
     */
    function test_73880998331054308679733447677928138855511350019791931962590171442024355864647_Fast_LowBall_InsideBall_11698_Contact_LowBall_Middle_Single(
    )
        public
    {
        //  Nonces 73880998331054308679733447677928138855511350019791931962590171442024355864647 and 11698 generate
        // random number 4909 which maps to Outcome.Single.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            73_880_998_331_054_308_679_733_447_677_928_138_855_511_350_019_791_931_962_590_171_442_024_355_864_647,
            PitchSpeed.Fast,
            VerticalLocation.LowBall,
            HorizontalLocation.InsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(11_698, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.Middle);

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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 0 --pitch-vert 1 --pitch-hor 4 --swing-type 0
     * --swing-vert 4 --swing-hor 4
     */
    function test_91570361361086801704628331303643350164779775915959877737366882739133169692606_Fast_HighStrike_OutsideBall_5661_Contact_LowBall_OutsideBall_Double(
    )
        public
    {
        //  Nonces 91570361361086801704628331303643350164779775915959877737366882739133169692606 and 5661 generate
        // random number 6736 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            91_570_361_361_086_801_704_628_331_303_643_350_164_779_775_915_959_877_737_366_882_739_133_169_692_606,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(5661, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 0 --pitch-vert 1 --pitch-hor 4 --swing-type 0
     * --swing-vert 4 --swing-hor 4
     */
    function test_91570361361086801704628331303643350164779775915959877737366882739133169692606_Fast_HighStrike_OutsideBall_195_Contact_LowBall_OutsideBall_Double(
    )
        public
    {
        //  Nonces 91570361361086801704628331303643350164779775915959877737366882739133169692606 and 195 generate random
        // number 6976 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            91_570_361_361_086_801_704_628_331_303_643_350_164_779_775_915_959_877_737_366_882_739_133_169_692_606,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(195, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 4 --pitch-type 0 --pitch-vert 1 --pitch-hor 4 --swing-type 0
     * --swing-vert 4 --swing-hor 4
     */
    function test_91570361361086801704628331303643350164779775915959877737366882739133169692606_Fast_HighStrike_OutsideBall_20124_Contact_LowBall_OutsideBall_Double(
    )
        public
    {
        //  Nonces 91570361361086801704628331303643350164779775915959877737366882739133169692606 and 20124 generate
        // random number 6856 which maps to Outcome.Double.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            91_570_361_361_086_801_704_628_331_303_643_350_164_779_775_915_959_877_737_366_882_739_133_169_692_606,
            PitchSpeed.Fast,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(20_124, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 4 --pitch-hor 2 --swing-type 0
     * --swing-vert 3 --swing-hor 3
     */
    function test_12368273458357240996887706903519576562044643416501980488897206542627568072921_Fast_LowBall_Middle_28771_Contact_LowStrike_OutsideStrike_Triple(
    )
        public
    {
        //  Nonces 12368273458357240996887706903519576562044643416501980488897206542627568072921 and 28771 generate
        // random number 5513 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            12_368_273_458_357_240_996_887_706_903_519_576_562_044_643_416_501_980_488_897_206_542_627_568_072_921,
            PitchSpeed.Fast,
            VerticalLocation.LowBall,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(28_771, SwingType.Contact, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 4 --pitch-hor 2 --swing-type 0
     * --swing-vert 3 --swing-hor 3
     */
    function test_12368273458357240996887706903519576562044643416501980488897206542627568072921_Fast_LowBall_Middle_2759_Contact_LowStrike_OutsideStrike_Triple(
    )
        public
    {
        //  Nonces 12368273458357240996887706903519576562044643416501980488897206542627568072921 and 2759 generate
        // random number 5540 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            12_368_273_458_357_240_996_887_706_903_519_576_562_044_643_416_501_980_488_897_206_542_627_568_072_921,
            PitchSpeed.Fast,
            VerticalLocation.LowBall,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(2759, SwingType.Contact, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 5 --pitch-type 0 --pitch-vert 4 --pitch-hor 2 --swing-type 0
     * --swing-vert 3 --swing-hor 3
     */
    function test_12368273458357240996887706903519576562044643416501980488897206542627568072921_Fast_LowBall_Middle_5156_Contact_LowStrike_OutsideStrike_Triple(
    )
        public
    {
        //  Nonces 12368273458357240996887706903519576562044643416501980488897206542627568072921 and 5156 generate
        // random number 5567 which maps to Outcome.Triple.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            12_368_273_458_357_240_996_887_706_903_519_576_562_044_643_416_501_980_488_897_206_542_627_568_072_921,
            PitchSpeed.Fast,
            VerticalLocation.LowBall,
            HorizontalLocation.Middle
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(5156, SwingType.Contact, VerticalLocation.LowStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 1 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 1 --swing-hor 3
     */
    function test_63640271245765366210780587460610203501690580269930603495014854898867107880639_Slow_HighStrike_OutsideStrike_1982_Contact_HighStrike_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 63640271245765366210780587460610203501690580269930603495014854898867107880639 and 1982 generate
        // random number 5280 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            63_640_271_245_765_366_210_780_587_460_610_203_501_690_580_269_930_603_495_014_854_898_867_107_880_639,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(1982, SwingType.Contact, VerticalLocation.HighStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 1 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 1 --swing-hor 3
     */
    function test_63640271245765366210780587460610203501690580269930603495014854898867107880639_Slow_HighStrike_OutsideStrike_2893_Contact_HighStrike_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 63640271245765366210780587460610203501690580269930603495014854898867107880639 and 2893 generate
        // random number 5639 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            63_640_271_245_765_366_210_780_587_460_610_203_501_690_580_269_930_603_495_014_854_898_867_107_880_639,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(2893, SwingType.Contact, VerticalLocation.HighStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 6 --pitch-type 1 --pitch-vert 1 --pitch-hor 3 --swing-type 0
     * --swing-vert 1 --swing-hor 3
     */
    function test_63640271245765366210780587460610203501690580269930603495014854898867107880639_Slow_HighStrike_OutsideStrike_666_Contact_HighStrike_OutsideStrike_HomeRun(
    )
        public
    {
        //  Nonces 63640271245765366210780587460610203501690580269930603495014854898867107880639 and 666 generate random
        // number 5999 which maps to Outcome.HomeRun.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            63_640_271_245_765_366_210_780_587_460_610_203_501_690_580_269_930_603_495_014_854_898_867_107_880_639,
            PitchSpeed.Slow,
            VerticalLocation.HighStrike,
            HorizontalLocation.OutsideStrike
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing =
            Swing(666, SwingType.Contact, VerticalLocation.HighStrike, HorizontalLocation.OutsideStrike);

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
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 0 --pitch-vert 0 --pitch-hor 4 --swing-type 0
     * --swing-vert 4 --swing-hor 4
     */
    function test_49731744772638454924760285687313284121695085924285688079658751756900959447272_Fast_HighBall_OutsideBall_27400_Contact_LowBall_OutsideBall_InPlayOut(
    )
        public
    {
        //  Nonces 49731744772638454924760285687313284121695085924285688079658751756900959447272 and 27400 generate
        // random number 7000 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            49_731_744_772_638_454_924_760_285_687_313_284_121_695_085_924_285_688_079_658_751_756_900_959_447_272,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(27_400, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 0 --pitch-vert 0 --pitch-hor 4 --swing-type 0
     * --swing-vert 4 --swing-hor 4
     */
    function test_49731744772638454924760285687313284121695085924285688079658751756900959447272_Fast_HighBall_OutsideBall_625_Contact_LowBall_OutsideBall_InPlayOut(
    )
        public
    {
        //  Nonces 49731744772638454924760285687313284121695085924285688079658751756900959447272 and 625 generate random
        // number 8499 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            49_731_744_772_638_454_924_760_285_687_313_284_121_695_085_924_285_688_079_658_751_756_900_959_447_272,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(625, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
     * $ fullcount codegen outcome-tests --desired-outcome 7 --pitch-type 0 --pitch-vert 0 --pitch-hor 4 --swing-type 0
     * --swing-vert 4 --swing-hor 4
     */
    function test_49731744772638454924760285687313284121695085924285688079658751756900959447272_Fast_HighBall_OutsideBall_2165_Contact_LowBall_OutsideBall_InPlayOut(
    )
        public
    {
        //  Nonces 49731744772638454924760285687313284121695085924285688079658751756900959447272 and 2165 generate
        // random number 9999 which maps to Outcome.InPlayOut.

        assertEq(game.sessionProgress(SessionID), 3);

        Pitch memory pitch = Pitch(
            49_731_744_772_638_454_924_760_285_687_313_284_121_695_085_924_285_688_079_658_751_756_900_959_447_272,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideBall
        );

        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        Swing memory swing = Swing(2165, SwingType.Contact, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

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
