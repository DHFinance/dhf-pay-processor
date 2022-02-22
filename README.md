## DHF PAY
The crypto currency payment gateway on the CSPR blockchain. Made for pay and be paid easy and chill with blockchain and Casper Network.
System composed of 3 services:

|       Name         |            Link              |        Description                 |
|----------------|-------------------------------|-----------------------------|
|Backend  |<https://github.com/DHFinance/dhf-pay-back>            | Service backend            |
|Frontend          |<https://github.com/DHFinance/dhf-pay-front>            |Service frontend            |
|Processor          |<https://github.com/DHFinance/dhf-pay-processor>| Process a background tasks|

## Installation using docker
See https://github.com/DHFinance/dhf-pay-deploy


## Install

```bash
$ npm install
```

## Create .env
Create .env file like an example file env.sample

```bash
#Database settings
DB_HOST = localhost
DB_PORT = 5432
DB_PASSWORD = Ytrewq654321
DB_USER = postgres
DB_DATABASE = casper
DB_SYNCRONIZE = true
DB_LOGGING = true
TYPEORM_MIGRATIONS_RUN = true
#Password encrypt hash
SECRET_HASH = passwordHashSecret
#Admin e-mail. Does`t need a verification 
ADMIN_EMAIL = caspers.mailer@gmail.com
#Credentals of mail account which will be used for mailing
MAILER_EMAIL = caspers.mailer@gmail.com
MAILER_PASSWORD = BCf!rufxQeYF@KVD87s76
#SMTP client settings
MAILER_HOST = smtppro.zoho.com
MAILER_SSL = 1,
MAILER_QAUTH = 1,
MAILER_PORT = 465,
#RabbitMQ connection string
RABBIT_MQ=amqps://tncqeoap:xg6g86QzZQw0SRnM8Zk6EZwu0_9wb9um@bonobo.rmq.cloudamqp.com/tncqeoap
```

## Run
```bash
$ npm run build
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Run a specific test file
To run a separate file with tests, for example user.service.spec.ts in the user folder
```bash
jest src/user/user.service.spec.ts
```

## Run tests
To run the tests, enter at the root of the project
```bash
npm run test
```