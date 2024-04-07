-   Create namespace

```shell
curl --location --request POST 'localhost:3000/namespace/' \
--header 'Content-Type: application/json' \
--data '{
    "namespaceId": "mama"
}
'
```

Response:

```JSON
{
    "success": true,
    "code": 201,
    "data": {
        "id": 2,
        "createdAt": 1712512019292,
        "namespaceId": "mama1"
    },
    "message": ""
}

```

-   Register account

```shell
curl --location --request POST 'localhost:3000/account/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "namespaceId": "mama",
    "email": "a@s.com",
    "name": "abc",
    "currency": "INR"
}'
```

Response:

```JSON
{
    "success": true,
    "code": 201,
    "data": {
        "id": 3,
        "createdAt": 1712511894740,
        "namespaceId": "mama",
        "userId": "48677776-1986-48b2-8872-0ac21401faf4",
        "email": "abhisek@mail.com",
        "name": "abc",
        "currency": "INR"
    },
    "message": ""
}
```

-   Request OTP for login

```shell
curl --location --request POST 'localhost:3000/account/login/otp' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "a@s.com",
    "namespaceId": "mama"
}'
```

-   Login with OTP

```shell
curl --location --request POST 'localhost:3000/account/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "otp": "000000",
    "email": "a@s.com",
    "namespaceId": "mama"
}'
```

Response:

```JSON
{
    "success": true,
    "code": 200,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5OTMwYWM3Mi0xMjU3LTRiNjgtYWQwMC1kY2EzMGM5ZTFkM2YiLCJuYW1lc3BhY2VJZCI6Im1hbWEifQ.DFP6Vdvm_k-zzEIHFHkenA3OD6GOl30koCowMUZcvxM",
        "account": {
            "data": {
                "id": 1,
                "createdAt": 1712510000452,
                "namespaceId": "mama",
                "userId": "9930ac72-1257-4b68-ad00-dca30c9e1d3f",
                "email": "a@s.com",
                "name": "abc",
                "currency": "INR"
            }
        }
    },
    "message": ""
}
```

-   Record a transaction

```shell
curl --location --request POST 'localhost:3000/transaction' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5OTMwYWM3Mi0xMjU3LTRiNjgtYWQwMC1kY2EzMGM5ZTFkM2YiLCJuYW1lc3BhY2VJZCI6Im1hbWEifQ.DFP6Vdvm_k-zzEIHFHkenA3OD6GOl30koCowMUZcvxM' \
--data '{
    "type": "income",
    "amount": 100,
    "category": "salary"
}'
```

Response:

```JSON
{
    "success": true,
    "code": 200,
    "data": {
        "data": {
            "id": 1,
            "createdAt": 1712514015061,
            "namespaceId": "mama",
            "txnId": "0e017555-3136-4333-9bdd-e37a5b87ad95",
            "userId": "9930ac72-1257-4b68-ad00-dca30c9e1d3f",
            "amount": 100,
            "type": "income",
            "category": "salary",
            "description": "",
            "openingBalance": 0
        }
    },
    "message": ""
}
```

-   Get analytics

```shell
curl --location --request GET 'localhost:3000/analytics' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5OTMwYWM3Mi0xMjU3LTRiNjgtYWQwMC1kY2EzMGM5ZTFkM2YiLCJuYW1lc3BhY2VJZCI6Im1hbWEifQ.DFP6Vdvm_k-zzEIHFHkenA3OD6GOl30koCowMUZcvxM'

```

Response:

```JSON
{
    "success": true,
    "code": 200,
    "data": {
        "id": 0,
        "createdAt": 1712514307783,
        "namespaceId": "mama",
        "userId": "9930ac72-1257-4b68-ad00-dca30c9e1d3f",
        "totalIncome": 0,
        "totalExpense": 0,
        "netBalanceCurrMonth": 0,
        "netBalanceLastMonth": 0,
        "currentMonthYear": "",
        "lastMonthYear": ""
    },
    "message": ""
}
```
