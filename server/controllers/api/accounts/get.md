# Show Accessible accounts

Show all Accounts the active User can access and with what permission level.
Includes their own Account if they have one.

**URL** : `/api/accounts/`

**Method** : `GET`

**Auth required** : YES

**Permissions required** : None

**Data constraints** : `{}`

## Success responses

**Condition** : User can not see any accounts

**Code** : `200 OK`

**Content** : `{[]}`

### OR

**Condition** : User can see one or more Accounts.

**Code** : `200 OK`

**Content** : In this example, the User can see three Accounts as AccountAdmin, `AA`, Viewer, `VV`, and Owner `OO` - in that order:

```json
[
  {
    "account": {
      "id": 123,
      "name": "Lots of Admins Project",
      "enterprise": false,
      "url": "http://localhost/123/"
    },
    "permission": "AA"
  },
  {
    "account": {
      "id": 234,
      "name": "Feel free to view this",
      "enterprise": false,
      "url": "http://localhost/234/"
    },
    "permission": "VV"
  },
  {
    "account": {
      "id": 345,
      "name": "Mr. Owner Project",
      "enterprise": false,
      "url": "http://localhost/345/"
    },
    "permission": "OO"
  }
]
```
