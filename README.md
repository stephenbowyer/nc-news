# NC News API

https://nc-news-40gp.onrender.com/api/
  
An implementation of the backend for an article board with the ability for users to add comments to each article.
  
Topics -> Articles <- Comments <-> Users


## Installation and Deployment
git clone https://github.com/stephenbowyer/nc-news  
npm test  
npm node install  
npm run setup-dbs  
npm run seed

## Database Configuration
echo PGDATABASE=nc_news >.env.environment  
echo PGDATABASE=nc_news_test >.env.test

## Compatibility
Tested on Node.js version 21.4.0 and PostgreSQL 14.10.

