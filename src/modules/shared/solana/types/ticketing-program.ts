/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ticketing_program.json`.
 */
export type TicketingProgram = {
  address: 'EFuMNTn1zfn6Zhvdq1Vjaxs83sz2gTWvDgjuJcKDYjhw'
  metadata: {
    name: 'ticketingProgram'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'SportsX Ticketing Program'
  }
  instructions: [
    {
      name: 'addCheckinOperator'
      docs: ['Add a check-in operator for an event']
      discriminator: [56, 221, 240, 236, 112, 146, 217, 89]
      accounts: [
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
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
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'checkinAuthority'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 104, 101, 99, 107, 105, 110, 95, 97, 117, 116, 104]
              },
              {
                kind: 'arg'
                path: 'eventId'
              },
              {
                kind: 'arg'
                path: 'operator'
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
          name: 'eventId'
          type: 'string'
        },
        {
          name: 'operator'
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'buyListedTicket'
      docs: ['Buy a listed ticket']
      discriminator: [109, 219, 31, 65, 26, 187, 221, 239]
      accounts: [
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
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
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'account'
                path: 'ticket.event_id'
                account: 'ticketAccount'
              }
            ]
          }
        },
        {
          name: 'listing'
          writable: true
        },
        {
          name: 'ticket'
          writable: true
        },
        {
          name: 'nonceTracker'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  110,
                  111,
                  110,
                  99,
                  101,
                  95,
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          name: 'buyer'
          writable: true
          signer: true
        },
        {
          name: 'originalSeller'
          writable: true
        },
        {
          name: 'buyerUsdcAccount'
          writable: true
        },
        {
          name: 'sellerUsdcAccount'
          writable: true
        },
        {
          name: 'platformUsdcAccount'
          writable: true
        },
        {
          name: 'organizerUsdcAccount'
          writable: true
        },
        {
          name: 'usdcMint'
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram'
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        }
      ]
      args: [
        {
          name: 'authorizationData'
          type: {
            defined: {
              name: 'authorizationData'
            }
          }
        },
        {
          name: 'backendSignature'
          type: {
            array: ['u8', 64]
          }
        }
      ]
    },
    {
      name: 'cancelListing'
      docs: ['Cancel a ticket listing']
      discriminator: [41, 183, 50, 232, 230, 233, 157, 70]
      accounts: [
        {
          name: 'listing'
          writable: true
        },
        {
          name: 'ticket'
          writable: true
        },
        {
          name: 'seller'
          writable: true
          signer: true
        }
      ]
      args: []
    },
    {
      name: 'checkInTicket'
      docs: ['Check-in a ticket at the event']
      discriminator: [174, 66, 18, 131, 231, 120, 103, 246]
      accounts: [
        {
          name: 'event'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'checkinAuthority'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 104, 101, 99, 107, 105, 110, 95, 97, 117, 116, 104]
              },
              {
                kind: 'arg'
                path: 'eventId'
              },
              {
                kind: 'account'
                path: 'operator'
              }
            ]
          }
        },
        {
          name: 'ticket'
          writable: true
        },
        {
          name: 'operator'
          signer: true
        }
      ]
      args: [
        {
          name: 'eventId'
          type: 'string'
        }
      ]
    },
    {
      name: 'createEvent'
      docs: ['Create a new event']
      discriminator: [49, 219, 29, 203, 22, 98, 100, 87]
      accounts: [
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          name: 'event'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'organizer'
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
          name: 'metadataUri'
          type: 'string'
        },
        {
          name: 'startTime'
          type: 'i64'
        },
        {
          name: 'endTime'
          type: 'i64'
        },
        {
          name: 'ticketReleaseTime'
          type: 'i64'
        },
        {
          name: 'stopSaleBefore'
          type: 'i64'
        },
        {
          name: 'resaleFeeRate'
          type: 'u16'
        },
        {
          name: 'maxResaleTimes'
          type: 'u8'
        }
      ]
    },
    {
      name: 'initializePlatform'
      docs: ['Initialize the platform configuration']
      discriminator: [119, 201, 101, 45, 75, 122, 89, 3]
      accounts: [
        {
          name: 'platformConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          name: 'nonceTracker'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  110,
                  111,
                  110,
                  99,
                  101,
                  95,
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          name: 'deployer'
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
          name: 'initialFeeReceiver'
          type: 'pubkey'
        },
        {
          name: 'initialFeeUsdc'
          type: 'u64'
        },
        {
          name: 'backendAuthority'
          type: 'pubkey'
        },
        {
          name: 'eventAdmin'
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'listTicket'
      docs: ['List a ticket for resale']
      discriminator: [11, 213, 240, 45, 246, 35, 44, 162]
      accounts: [
        {
          name: 'event'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'account'
                path: 'ticket.event_id'
                account: 'ticketAccount'
              }
            ]
          }
        },
        {
          name: 'ticket'
          writable: true
        },
        {
          name: 'listing'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [108, 105, 115, 116, 105, 110, 103]
              },
              {
                kind: 'account'
                path: 'ticket'
              }
            ]
          }
        },
        {
          name: 'seller'
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
          name: 'resalePrice'
          type: 'u64'
        }
      ]
    },
    {
      name: 'purchaseTicket'
      docs: ['Purchase a ticket with backend authorization']
      discriminator: [90, 91, 173, 20, 72, 109, 15, 146]
      accounts: [
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
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
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'ticket'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [116, 105, 99, 107, 101, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              },
              {
                kind: 'arg'
                path: 'ticketUuid'
              }
            ]
          }
        },
        {
          name: 'nonceTracker'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  110,
                  111,
                  110,
                  99,
                  101,
                  95,
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          name: 'buyer'
          writable: true
          signer: true
        },
        {
          name: 'buyerUsdcAccount'
          writable: true
        },
        {
          name: 'platformUsdcAccount'
          writable: true
        },
        {
          name: 'organizerUsdcAccount'
          writable: true
        },
        {
          name: 'usdcMint'
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
          name: 'typeId'
          type: 'string'
        },
        {
          name: 'ticketUuid'
          type: 'string'
        },
        {
          name: 'authorizationData'
          type: {
            defined: {
              name: 'authorizationData'
            }
          }
        },
        {
          name: 'backendSignature'
          type: {
            array: ['u8', 64]
          }
        }
      ]
    },
    {
      name: 'removeCheckinOperator'
      docs: ['Remove a check-in operator for an event']
      discriminator: [213, 251, 202, 174, 169, 182, 184, 241]
      accounts: [
        {
          name: 'platformConfig'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
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
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'checkinAuthority'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [99, 104, 101, 99, 107, 105, 110, 95, 97, 117, 116, 104]
              },
              {
                kind: 'arg'
                path: 'eventId'
              },
              {
                kind: 'arg'
                path: 'operator'
              }
            ]
          }
        },
        {
          name: 'admin'
          signer: true
        }
      ]
      args: [
        {
          name: 'eventId'
          type: 'string'
        },
        {
          name: 'operator'
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'togglePause'
      docs: ['Toggle platform pause status']
      discriminator: [238, 237, 206, 27, 255, 95, 123, 229]
      accounts: [
        {
          name: 'platformConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          name: 'authority'
          signer: true
        }
      ]
      args: []
    },
    {
      name: 'transferAuthority'
      docs: ['Transfer platform authority to a new address (e.g., multisig)']
      discriminator: [48, 169, 76, 72, 229, 180, 55, 161]
      accounts: [
        {
          name: 'platformConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          name: 'currentAuthority'
          signer: true
        }
      ]
      args: [
        {
          name: 'newAuthority'
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'updateEventStatus'
      docs: ['Update event status']
      discriminator: [181, 237, 172, 72, 61, 132, 77, 247]
      accounts: [
        {
          name: 'event'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [101, 118, 101, 110, 116]
              },
              {
                kind: 'arg'
                path: 'eventId'
              }
            ]
          }
        },
        {
          name: 'organizer'
          signer: true
        }
      ]
      args: [
        {
          name: 'eventId'
          type: 'string'
        },
        {
          name: 'newStatus'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updatePlatformConfig'
      docs: ['Update platform configuration']
      discriminator: [195, 60, 76, 129, 146, 45, 67, 143]
      accounts: [
        {
          name: 'platformConfig'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          name: 'authority'
          signer: true
        }
      ]
      args: [
        {
          name: 'newFeeReceiver'
          type: {
            option: 'pubkey'
          }
        },
        {
          name: 'newFeeUsdc'
          type: {
            option: 'u64'
          }
        },
        {
          name: 'newBackendAuthority'
          type: {
            option: 'pubkey'
          }
        },
        {
          name: 'newEventAdmin'
          type: {
            option: 'pubkey'
          }
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'checkInAuthority'
      discriminator: [250, 138, 248, 140, 64, 62, 214, 47]
    },
    {
      name: 'eventAccount'
      discriminator: [98, 136, 32, 165, 133, 231, 243, 154]
    },
    {
      name: 'listingAccount'
      discriminator: [59, 89, 136, 25, 21, 196, 183, 13]
    },
    {
      name: 'nonceTracker'
      discriminator: [244, 104, 52, 45, 43, 120, 94, 13]
    },
    {
      name: 'platformConfig'
      discriminator: [160, 78, 128, 0, 248, 83, 230, 160]
    },
    {
      name: 'ticketAccount'
      discriminator: [231, 93, 13, 18, 239, 66, 21, 45]
    }
  ]
  errors: [
    {
      code: 6000
      name: 'platformPaused'
      msg: 'Platform is currently paused'
    },
    {
      code: 6001
      name: 'unauthorized'
      msg: 'Unauthorized access'
    },
    {
      code: 6002
      name: 'invalidEventStatus'
      msg: 'Invalid event status'
    },
    {
      code: 6003
      name: 'eventNotActive'
      msg: 'Event is not active'
    },
    {
      code: 6004
      name: 'salesNotStarted'
      msg: 'Ticket sales not started yet'
    },
    {
      code: 6005
      name: 'salesEnded'
      msg: 'Ticket sales has ended'
    },
    {
      code: 6006
      name: 'invalidSignature'
      msg: 'Invalid signature'
    },
    {
      code: 6007
      name: 'authorizationExpired'
      msg: 'Authorization expired'
    },
    {
      code: 6008
      name: 'nonceAlreadyUsed'
      msg: 'Nonce already used'
    },
    {
      code: 6009
      name: 'priceMismatch'
      msg: 'Price mismatch'
    },
    {
      code: 6010
      name: 'alreadyCheckedIn'
      msg: 'Ticket already checked in'
    },
    {
      code: 6011
      name: 'notTicketOwner'
      msg: 'Not ticket owner'
    },
    {
      code: 6012
      name: 'resaleLimitReached'
      msg: 'Resale limit reached'
    },
    {
      code: 6013
      name: 'cannotResellTicket'
      msg: 'Ticket cannot be resold'
    },
    {
      code: 6014
      name: 'listingNotActive'
      msg: 'Listing not active'
    },
    {
      code: 6015
      name: 'invalidCheckInTime'
      msg: 'Invalid check-in time'
    },
    {
      code: 6016
      name: 'checkInOperatorNotAuthorized'
      msg: 'Check-in operator not authorized'
    },
    {
      code: 6017
      name: 'invalidEventId'
      msg: 'Invalid event ID'
    },
    {
      code: 6018
      name: 'invalidTicketTypeId'
      msg: 'Invalid ticket type ID'
    },
    {
      code: 6019
      name: 'arithmeticOverflow'
      msg: 'Arithmetic overflow'
    },
    {
      code: 6020
      name: 'invalidTicketPda'
      msg: 'Invalid ticket PDA in authorization'
    }
  ]
  types: [
    {
      name: 'authorizationData'
      docs: ['Authorization data for purchasing tickets']
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'buyer'
            type: 'pubkey'
          },
          {
            name: 'ticketTypeId'
            type: 'string'
          },
          {
            name: 'ticketUuid'
            type: 'string'
          },
          {
            name: 'maxPrice'
            type: 'u64'
          },
          {
            name: 'validUntil'
            type: 'i64'
          },
          {
            name: 'nonce'
            type: 'u64'
          },
          {
            name: 'ticketPda'
            type: {
              option: 'pubkey'
            }
          },
          {
            name: 'rowNumber'
            type: 'u16'
          },
          {
            name: 'columnNumber'
            type: 'u16'
          }
        ]
      }
    },
    {
      name: 'checkInAuthority'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'eventId'
            docs: ['Event ID (max 32 chars)']
            type: 'string'
          },
          {
            name: 'operator'
            docs: ['Operator public key']
            type: 'pubkey'
          },
          {
            name: 'isActive'
            docs: ['Active status']
            type: 'bool'
          },
          {
            name: 'bump'
            docs: ['PDA bump']
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'eventAccount'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'eventId'
            docs: ['Event ID (max 32 chars)']
            type: 'string'
          },
          {
            name: 'organizer'
            docs: ['Event organizer']
            type: 'pubkey'
          },
          {
            name: 'metadataUri'
            docs: ['Metadata URI (IPFS, max 200 chars)']
            type: 'string'
          },
          {
            name: 'startTime'
            docs: ['Event start time (Unix timestamp)']
            type: 'i64'
          },
          {
            name: 'endTime'
            docs: ['Event end time (Unix timestamp)']
            type: 'i64'
          },
          {
            name: 'ticketReleaseTime'
            docs: ['Ticket release time (Unix timestamp)']
            type: 'i64'
          },
          {
            name: 'stopSaleBefore'
            docs: ['Stop sale before event start (seconds)']
            type: 'i64'
          },
          {
            name: 'resaleFeeRate'
            docs: ['Resale fee rate in basis points (100 = 1%)']
            type: 'u16'
          },
          {
            name: 'maxResaleTimes'
            docs: ['Maximum resale times allowed']
            type: 'u8'
          },
          {
            name: 'status'
            docs: ['Event status: 0=Draft, 1=Active, 2=Disabled']
            type: 'u8'
          },
          {
            name: 'bump'
            docs: ['PDA bump']
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'listingAccount'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'ticketPda'
            docs: ['Ticket PDA']
            type: 'pubkey'
          },
          {
            name: 'originalSeller'
            docs: ['Original seller address (ticket owner when listed)']
            type: 'pubkey'
          },
          {
            name: 'price'
            docs: ['Listing price in USDC (6 decimals)']
            type: 'u64'
          },
          {
            name: 'listedAt'
            docs: ['Listed timestamp']
            type: 'i64'
          },
          {
            name: 'isActive'
            docs: ['Active status']
            type: 'bool'
          },
          {
            name: 'bump'
            docs: ['PDA bump']
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'nonceTracker'
      docs: ['Circular buffer for nonce tracking with time-based expiration']
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'nonces'
            docs: [
              'Circular buffer of nonces (last 10 entries, good for testing)'
            ]
            type: {
              array: ['u64', 10]
            }
          },
          {
            name: 'buyers'
            docs: ['Buyer address for each nonce (for collision prevention)']
            type: {
              array: ['pubkey', 10]
            }
          },
          {
            name: 'timestamps'
            docs: ['Timestamps for each nonce entry']
            type: {
              array: ['i64', 10]
            }
          },
          {
            name: 'nextIndex'
            docs: ['Next index to write (circular)']
            type: 'u16'
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
            name: 'feeReceiver'
            docs: ['Platform fee receiver address']
            type: 'pubkey'
          },
          {
            name: 'feeAmountUsdc'
            docs: ['Platform fee in USDC (6 decimals), e.g., 0.1 USDC = 100000']
            type: 'u64'
          },
          {
            name: 'updateAuthority'
            docs: ['Update authority (multisig address)']
            type: 'pubkey'
          },
          {
            name: 'backendAuthority'
            docs: ['Backend signing authority']
            type: 'pubkey'
          },
          {
            name: 'eventAdmin'
            docs: ['Event admin (only this address can create events)']
            type: 'pubkey'
          },
          {
            name: 'isPaused'
            docs: ['Platform pause status']
            type: 'bool'
          },
          {
            name: 'bump'
            docs: ['PDA bump']
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'ticketAccount'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'eventId'
            docs: ['Event ID (max 32 chars)']
            type: 'string'
          },
          {
            name: 'ticketTypeId'
            docs: ['Ticket type ID (max 32 chars)']
            type: 'string'
          },
          {
            name: 'ticketUuid'
            docs: ['Ticket UUID (max 32 chars, UUID without hyphens)']
            type: 'string'
          },
          {
            name: 'owner'
            docs: ['Current owner']
            type: 'pubkey'
          },
          {
            name: 'originalOwner'
            docs: ['Original owner']
            type: 'pubkey'
          },
          {
            name: 'resaleCount'
            docs: ['Resale count']
            type: 'u8'
          },
          {
            name: 'isCheckedIn'
            docs: ['Check-in status']
            type: 'bool'
          },
          {
            name: 'rowNumber'
            docs: ['Seat row number']
            type: 'u16'
          },
          {
            name: 'columnNumber'
            docs: ['Seat column number']
            type: 'u16'
          },
          {
            name: 'originalPrice'
            docs: [
              'Original purchase price (for PoF points calculation on resale)'
            ]
            type: 'u64'
          },
          {
            name: 'bump'
            docs: ['PDA bump']
            type: 'u8'
          }
        ]
      }
    }
  ]
}
