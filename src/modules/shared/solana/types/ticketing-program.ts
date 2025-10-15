// IDL JSON（保持原始格式）
export type TicketingProgram = {
  address: 'tDdGYG37gZufntQqs7ZPuiSRyrceNP5ZdygqVQLjUGw'
  metadata: {
    name: 'ticketingProgram'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'createEvent'
      docs: ['Create an event and initialize NFT mint']
      discriminator: [49, 219, 29, 203, 22, 98, 100, 87]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'event'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [69, 86, 69, 78, 84]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  80,
                  76,
                  65,
                  84,
                  70,
                  79,
                  82,
                  77,
                  95,
                  67,
                  79,
                  78,
                  70,
                  73,
                  71
                ]
              }
            ]
          }
        },
        {
          name: 'platformAuthority'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        }
      ]
      args: [
        {
          name: 'eventId'
          type: 'string'
        },
        {
          name: 'uri'
          type: 'string'
        },
        {
          name: 'merchantKey'
          type: 'pubkey'
        },
        {
          name: 'name'
          type: 'string'
        },
        {
          name: 'symbol'
          type: 'string'
        },
        {
          name: 'expiryTimestamp'
          type: 'i64'
        }
      ]
    },
    {
      name: 'initializePlatformConfig'
      docs: ['Initialize platform configuration']
      discriminator: [23, 52, 237, 53, 176, 235, 3, 187]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'platformConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  80,
                  76,
                  65,
                  84,
                  70,
                  79,
                  82,
                  77,
                  95,
                  67,
                  79,
                  78,
                  70,
                  73,
                  71
                ]
              }
            ]
          }
        },
        {
          name: 'admin'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        }
      ]
      args: [
        {
          name: 'platformAuthority'
          type: 'pubkey'
        },
        {
          name: 'usdtMint'
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'purchaseAndMint'
      docs: ['Purchase and mint a ticket NFT']
      discriminator: [230, 6, 46, 112, 161, 71, 90, 248]
      accounts: [
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'platformAuthority'
          writable: true
          signer: true
        },
        {
          name: 'usdtMint'
        },
        {
          name: 'userUsdtAta'
          writable: true
        },
        {
          name: 'platformUsdtVault'
          writable: true
        },
        {
          name: 'merchantUsdtVault'
          writable: true
        },
        {
          name: 'ticketMint'
          writable: true
          signer: true
        },
        {
          name: 'userNftAta'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'account'
                path: 'user'
              },
              {
                kind: 'const'
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: 'account'
                path: 'ticketMint'
              }
            ]
            program: {
              kind: 'const'
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: 'mintAuthority'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [77, 73, 78, 84, 95, 65, 85, 84, 72]
              }
            ]
          }
        },
        {
          name: 'seatAccount'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [84, 73, 67, 75, 69, 84]
              },
              {
                kind: 'arg'
                path: 'ticketId'
              },
              {
                kind: 'account'
                path: 'event'
              }
            ]
          }
        },
        {
          name: 'event'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [69, 86, 69, 78, 84]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  80,
                  76,
                  65,
                  84,
                  70,
                  79,
                  82,
                  77,
                  95,
                  67,
                  79,
                  78,
                  70,
                  73,
                  71
                ]
              }
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram'
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        },
        {
          name: 'rent'
          address: 'SysvarRent111111111111111111111111111111111'
        }
      ]
      args: [
        {
          name: 'ticketPriceUsdt'
          type: 'u64'
        },
        {
          name: 'ticketId'
          type: 'string'
        },
        {
          name: 'eventId'
          type: 'string'
        },
        {
          name: 'seatNumber'
          type: 'string'
        }
      ]
    },
    {
      name: 'queryTicketStatus'
      docs: ['Query ticket status']
      discriminator: [254, 161, 97, 162, 103, 219, 98, 106]
      accounts: [
        {
          name: 'seatAccount'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [84, 73, 67, 75, 69, 84]
              },
              {
                kind: 'arg'
                path: 'ticketId'
              },
              {
                kind: 'account'
                path: 'event'
              }
            ]
          }
        },
        {
          name: 'event'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [69, 86, 69, 78, 84]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        }
      ]
      args: [
        {
          name: 'ticketId'
          type: 'string'
        },
        {
          name: 'eventId'
          type: 'string'
        }
      ]
    },
    {
      name: 'scanTicket'
      docs: ['Scan a ticket']
      discriminator: [34, 65, 77, 69, 164, 95, 218, 165]
      accounts: [
        {
          name: 'merchant'
          writable: true
          signer: true
        },
        {
          name: 'seatAccount'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [84, 73, 67, 75, 69, 84]
              },
              {
                kind: 'arg'
                path: 'ticketId'
              },
              {
                kind: 'account'
                path: 'event'
              }
            ]
          }
        },
        {
          name: 'event'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [69, 86, 69, 78, 84]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        }
      ]
      args: [
        {
          name: 'ticketId'
          type: 'string'
        },
        {
          name: 'eventId'
          type: 'string'
        }
      ]
    },
    {
      name: 'updateSeatNumber'
      docs: ['Update seat number']
      discriminator: [32, 232, 195, 14, 196, 57, 227, 179]
      accounts: [
        {
          name: 'merchant'
          writable: true
          signer: true
        },
        {
          name: 'mint'
          writable: true
        },
        {
          name: 'mintAuthority'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [77, 73, 78, 84, 95, 65, 85, 84, 72]
              }
            ]
          }
        },
        {
          name: 'seatAccount'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [84, 73, 67, 75, 69, 84]
              },
              {
                kind: 'arg'
                path: 'ticketId'
              },
              {
                kind: 'account'
                path: 'event'
              }
            ]
          }
        },
        {
          name: 'event'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [69, 86, 69, 78, 84]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        }
      ]
      args: [
        {
          name: 'ticketId'
          type: 'string'
        },
        {
          name: 'eventId'
          type: 'string'
        },
        {
          name: 'newSeatNumber'
          type: 'string'
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'events'
      discriminator: [65, 3, 213, 60, 248, 78, 29, 92]
    },
    {
      name: 'platformConfig'
      discriminator: [160, 78, 128, 0, 248, 83, 230, 160]
    },
    {
      name: 'seatStatus'
      discriminator: [124, 98, 25, 32, 222, 13, 90, 7]
    }
  ]
  events: [
    {
      name: 'eventCreated'
      discriminator: [59, 186, 199, 175, 242, 25, 238, 94]
    },
    {
      name: 'platformConfigInitialized'
      discriminator: [108, 139, 227, 208, 240, 110, 23, 168]
    },
    {
      name: 'seatNumberUpdated'
      discriminator: [152, 43, 29, 77, 93, 81, 15, 212]
    },
    {
      name: 'ticketMinted'
      discriminator: [22, 17, 212, 38, 91, 144, 104, 109]
    },
    {
      name: 'ticketScanned'
      discriminator: [209, 75, 59, 166, 20, 112, 252, 206]
    },
    {
      name: 'ticketStatusQueried'
      discriminator: [95, 168, 9, 25, 140, 41, 64, 238]
    }
  ]
  errors: [
    {
      code: 6000
      name: 'insufficientFunds'
      msg: 'Insufficient funds for ticket purchase'
    },
    {
      code: 6001
      name: 'ticketIdTooLong'
      msg: 'Ticket ID exceeds maximum length'
    },
    {
      code: 6002
      name: 'eventIdTooLong'
      msg: 'Event ID exceeds maximum length'
    },
    {
      code: 6003
      name: 'seatNumberTooLong'
      msg: 'Seat number exceeds maximum length'
    },
    {
      code: 6004
      name: 'nameTooLong'
      msg: 'Name exceeds maximum length'
    },
    {
      code: 6005
      name: 'symbolTooLong'
      msg: 'Symbol exceeds maximum length'
    },
    {
      code: 6006
      name: 'mintNotInitialized'
      msg: 'Mint account not properly initialized'
    },
    {
      code: 6007
      name: 'invalidUsdtMint'
      msg: 'Invalid USDT mint provided'
    },
    {
      code: 6008
      name: 'invalidUri'
      msg: 'Invalid URI format or length'
    },
    {
      code: 6009
      name: 'extensionInitializationFailed'
      msg: 'Token-2022 extension initialization failed'
    },
    {
      code: 6010
      name: 'ticketAlreadyMinted'
      msg: 'Ticket already minted'
    },
    {
      code: 6011
      name: 'invalidEventId'
      msg: 'Invalid event ID'
    },
    {
      code: 6012
      name: 'invalidPlatformAuthority'
      msg: 'Invalid platform authority'
    },
    {
      code: 6013
      name: 'invalidMerchantAuthority'
      msg: 'Invalid merchant authority'
    },
    {
      code: 6014
      name: 'unauthorizedAdmin'
      msg: 'Unauthorized admin'
    },
    {
      code: 6015
      name: 'eventExpired'
      msg: 'Event has expired'
    },
    {
      code: 6016
      name: 'ticketNotMinted'
      msg: 'Ticket not minted'
    },
    {
      code: 6017
      name: 'ticketAlreadyScanned'
      msg: 'Ticket already scanned'
    },
    {
      code: 6018
      name: 'invalidExpiryTimestamp'
      msg: 'Invalid expiry timestamp'
    },
    {
      code: 6019
      name: 'invalidMint'
      msg: 'Invalid mint account'
    }
  ]
  types: [
    {
      name: 'eventCreated'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'eventId'
            type: 'string'
          },
          {
            name: 'uri'
            type: 'string'
          },
          {
            name: 'merchantKey'
            type: 'pubkey'
          },
          {
            name: 'name'
            type: 'string'
          },
          {
            name: 'symbol'
            type: 'string'
          },
          {
            name: 'expiryTimestamp'
            type: 'i64'
          },
          {
            name: 'timestamp'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'events'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'eventId'
            type: 'string'
          },
          {
            name: 'uri'
            type: 'string'
          },
          {
            name: 'merchantKey'
            type: 'pubkey'
          },
          {
            name: 'name'
            type: 'string'
          },
          {
            name: 'symbol'
            type: 'string'
          },
          {
            name: 'expiryTimestamp'
            type: 'i64'
          },
          {
            name: 'bump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'platformConfig'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'platformAuthority'
            type: 'pubkey'
          },
          {
            name: 'usdtMint'
            type: 'pubkey'
          },
          {
            name: 'bump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'platformConfigInitialized'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'platformAuthority'
            type: 'pubkey'
          },
          {
            name: 'usdtMint'
            type: 'pubkey'
          },
          {
            name: 'timestamp'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'seatNumberUpdated'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'ticketId'
            type: 'string'
          },
          {
            name: 'eventId'
            type: 'string'
          },
          {
            name: 'newSeatNumber'
            type: 'string'
          },
          {
            name: 'merchant'
            type: 'pubkey'
          },
          {
            name: 'timestamp'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'seatStatus'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'isMinted'
            type: 'bool'
          },
          {
            name: 'isScanned'
            type: 'bool'
          },
          {
            name: 'bump'
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'ticketMinted'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'user'
            type: 'pubkey'
          },
          {
            name: 'mint'
            type: 'pubkey'
          },
          {
            name: 'ticketId'
            type: 'string'
          },
          {
            name: 'eventId'
            type: 'string'
          },
          {
            name: 'ticketPrice'
            type: 'u64'
          },
          {
            name: 'merchant'
            type: 'pubkey'
          },
          {
            name: 'seatNumber'
            type: 'string'
          },
          {
            name: 'name'
            type: 'string'
          },
          {
            name: 'symbol'
            type: 'string'
          },
          {
            name: 'uri'
            type: 'string'
          },
          {
            name: 'timestamp'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'ticketScanned'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'ticketId'
            type: 'string'
          },
          {
            name: 'eventId'
            type: 'string'
          },
          {
            name: 'merchant'
            type: 'pubkey'
          },
          {
            name: 'timestamp'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'ticketStatusQueried'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'ticketId'
            type: 'string'
          },
          {
            name: 'eventId'
            type: 'string'
          },
          {
            name: 'uri'
            type: 'string'
          },
          {
            name: 'isMinted'
            type: 'bool'
          },
          {
            name: 'isScanned'
            type: 'bool'
          },
          {
            name: 'timestamp'
            type: 'i64'
          }
        ]
      }
    }
  ]
}
