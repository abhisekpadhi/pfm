# System design

Microservice that allows user to manage personal finance.

## Functional requirements

-   Users should be able to

    -   Register & login under a tenant
    -   Record transactions, categorise them
    -   See total income, expense & net balance over time period

-   For Compliance

    -   Users should not be able to acces anyone elses data
    -   System should reject invalid inputs

## Non functional requirements

-   HA
    -   Multi-region deployment of kubernetes for API server
    -   DB write & query is decoupled: master serves writes (transactions) read-replica serves read heavy I/O (analytics data)
    -   DB HA by having standby in different region
    -   Redis HA: Master w/ read-replica
-   Consistency:
    -   **Near strong**: User expects total income & expense balance to reflect accurately
    -   **CP system**: cannot loose a txn record due to network partition, backend should 5XX & frontend show error
-   Concurrency:
    -   1M+ RPS on analytics api, all served by redis
-   Storage
    -   100M User accounts, 100M analytics records - 26GB
    -   10 transactions/user/day x 365days = 3650 txns/user/yr x 100M users = 3.6Bn txns = 900GB
    -   For 100M users ~ 1TB/yr
-   Latency
    -   <200ms for fetching balance & recording transactions

## HLD

![high level design](hld.png 'High level design')

**Usage pattern insight:**

-   Users tend to check balance often
-   They tend to record their expenses in batch/bulk in one sitting when they have leisure time

**Decoupling read heavy & write heavy paths**

-   Recording transactions will require high write throughput
-   Analytics API will requrie read heavy throughput
-   We cannot afford to loose recorded transactions, so kafka helps to buffer at scale until we commit to DB
-   Anaytics data (ex: total expense, income, closing balance over specified period) can be near-realtime consistent, which is achieved thorugh a background job that aggregates transaction records to compute analytics data

**Tradeoff**

-   To decouple read & write paths, the analytics data is not instantly synced but near-realtime, <5s delay

## LLD

### Server runtime: Node.js

-   All API calls are network I/O, with nodejs we can do non-blocking network i/o,
-   Each pod can serve high throughput (200 RPS per 1VCPU & 1GB RAM)

### Query patterns

1. Insert new transaction record of a user
2. Get user account by phone
3. Get user total income/expense/net balance over time period

### DB Platform

-   MySQL is chosen
    -   Average: 20K Write ops/s in RDS:r5.8xlarge, 256GB, 32vCPUs
    -   Peak: 100K Write ops/s in RDS:r5.16xlarge

### DB Schema

-   namespace

```json // (4+36) = 40bytes
{
	"id": 1, // autoincr, int
	"namespaceId": "<tenantName>" // varchar 36
}
```

-   user_account // (4+36+36+16+64+3+8) = 167bytes

```json
{
	"id": 1, // autoincr, int
	"namespaceId": "<tenantName>", // varchar 36
	"userId": "5d3ec2b8-6a0c-48f3-bf22-90587a6f45b3", // varchar 128
	"phone": "91-9439831236", // varchar 16
	"name": "abhisek", // varchar 64
	"currency": "INR", // varchar 3
	"createdAt": 1712417729766 // bigint
}
```

-   transaction // (4+36+36+36+8+16+36+64+8+8) = 252bytes

```json
{
	"id": 1, // autoincr, int
	"namespaceId": "<tenantName>", // varchar 36
	"txnId": "09df0978-9708-41a8-bbd2-e039bcd38631", // varchar 128
	"userId": "5d3ec2b8-6a0c-48f3-bf22-90587a6f45b3", // varchar 128
	"amount": 20000, // bigint
	"type": "income", // varchar(16)
	"category": "salary", // varchar(36)
	"description": "Salary for august 2023", // varchar(64)
	"openingBalance": 10000, // in lowest denomination
	"createdAt": 1712417729766 // bigint
}
```

-   balance // (4+36+36+8+8+8) = 100bytes

```json
{
	"id": 1, // autoincr, int
	"namespaceId": "<tenantName>", // varchar 36
	"userId": "5d3ec2b8-6a0c-48f3-bf22-90587a6f45b3", // varchar 128
	"totalExpense": 10000, // bigint
	"totalIncome": 10000, // bigint
	"createdAt": 1712417729766 // bigint
}
```

### DB Optimisations

-   To reduce data size for query: net balance over a specified time period

    -   Shard table based on userId, month &

-   To get net balance over time period:

    -   Get last entry from Transactions table, do opening balance +-(type) amount

-   To reduce cost on DB

    -   Archive old data in cold storage like S3/Glacier

## Security

-   User authentication is done using JWT token
-   Namespace isolation of data per tenant

## Cost

| Resource        | Details                                            |
| --------------- | -------------------------------------------------- |
| S3 Bucket       | Host webapp, <1Gb/month storage                    |
| Cloudfront, ELB | CDN, WAF & Load balancer - 100GB/day               |
| Kubernetes      | Nodejs API, kafka cluster - m7g.16xlarge \* (3-20) |
| Elasticache     | Redis - 10GB - cache.m6g.xlarge                    |
| RDS             | Mysql - RDS:r5.8xlarge                             |
