const RedisStore = require("connect-redis").default;
const Redis = require("ioredis");

let redisClient = new Redis(process.env.REDIS_URL);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: "fastmail_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));
