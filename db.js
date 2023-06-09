const jwt = require("jsonwebtoken");
require("dotenv").config();

const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

User.byToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT);

    const user = await User.findByPk(decodedToken.userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err) {
    const error = new Error("bad credentials");
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
    console.log(`username: ${username}, password: ${password}`);
    const user = await User.findOne({
      where: {
        username,
        password,
      },
    });
    if (user) {
      // Create the token payload
      const payload = {
        userId: user.id,
      };
      // Get the secret key from the environment variables
      const secretKey = process.env.JWT;
  
      // Define the options for the token
      const options = {
        expiresIn: "1h", // The token will expire in 1 hour
      };
  
      // Create the token
      const token = jwt.sign(payload, secretKey, options);
      console.log(`Token: ${token}`);
  
      // return the token
      return token;
    }
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  };
  

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
  },
};
