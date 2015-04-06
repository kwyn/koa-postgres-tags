# koa-postgres-tags


## High traffic requirements
Quick look up times.

Write a web API using nodejs (or iojs) which supports storing and looking up email addresses by tags.

POST: /emails
```
{
    email: example@email.com
    tags: [tag1, tag2, tag3]
}
```
GET /emails?email=example@email.com
```
{
    tags: ['tag1', 'tag2', 'tag3']
}
```

GET /emails?tags=tag1,tag3

```
{
    emails: ['example@email.com', 'test@email.com']
}
```

Reads allow looking up email addresses by tags or looking up tags by email address.

## Development

Built with:
 - Koa
 - knex
 - postgres

To start:
Be sure to have postgres installed and create a `.env` like the `example.env`

```
npm install
npm install knex -g
knex migrate:latest
npm start
```

To test:
```
npm install mocha -g
npm test
```
