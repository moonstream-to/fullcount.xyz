export const outputs = [
  {
    components: [
      {
        internalType: "uint256",
        name: "phaseStartTimestamp",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "pitcherAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "pitcherTokenID",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "didPitcherCommit",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "didPitcherReveal",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "pitcherCommit",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "enum PitchSpeed",
            name: "speed",
            type: "uint8",
          },
          {
            internalType: "enum VerticalLocation",
            name: "vertical",
            type: "uint8",
          },
          {
            internalType: "enum HorizontalLocation",
            name: "horizontal",
            type: "uint8",
          },
        ],
        internalType: "struct Pitch",
        name: "pitcherReveal",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "batterAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "batterTokenID",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "didBatterCommit",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "didBatterReveal",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "batterCommit",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "enum SwingType",
            name: "kind",
            type: "uint8",
          },
          {
            internalType: "enum VerticalLocation",
            name: "vertical",
            type: "uint8",
          },
          {
            internalType: "enum HorizontalLocation",
            name: "horizontal",
            type: "uint8",
          },
        ],
        internalType: "struct Swing",
        name: "batterReveal",
        type: "tuple",
      },
      {
        internalType: "enum Outcome",
        name: "outcome",
        type: "uint8",
      },
    ],
    internalType: "struct Session",
    name: "",
    type: "tuple",
  },
];
