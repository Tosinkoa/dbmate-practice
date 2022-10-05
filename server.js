import bcrypt from "bcrypt"
import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import session from "express-session"
import postgres from "pg"
import connectPgSimple from "connect-pg-simple"
dotenv.config()

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
)

const { Client } = postgres
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,

  }
})
client.connect()

// session store and session config
const store = new (connectPgSimple(session))({
  client,
  createTableIfMissing: true,
})

app.use(
  session({
    store: store,
    secret: "myscecret",
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
)

app.get("/", (req, res) => res.send("API Running..."))

app.post("/register", async (req, res) => {
  const { email, password } = req.body

  if (email == null || password == null) {
    return res.status(400).send("Email or password is missing")
  }

  try {
    const userExist = await client.query("SELECT id, email, password FROM users WHERE email = $1", [email])
    if (userExist.rows.length > 0) {
      return res.status(400).send("User already exists")
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const data = await client.query("INSERT INTO users ( email, password) VALUES ($1, $2) RETURNING *", [
      email,
      hashedPassword,
    ])

    const user = data.rows[0]

    req.session.user = user.id

    console.log(req.id)
    return res.status(200).json({ user: req.session.user })
  } catch (e) {
    console.error(e)
    return res.status(500)
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (email == null || password == null) {
    return res.status(400).send("Email or password is missing")
  }

  try {
    const data = await client.query("SELECT id, email, password FROM users WHERE email = $1", [email])
    console.log("data", data)
    if (data.rows.length === 0) {
      return res.status(404).send("User does not exist")
    }
    const user = data.rows[0]

    console.log("user", user)
    const matches = bcrypt.compareSync(password, user.password)
    if (!matches) {
      return res.status(404).send("Wrong email or password")
    }

    req.session.user = user.id

    return res.status(200).json({ user: req.session.user })
  } catch (e) {
    console.error(e)
    return res.send(500)
  }
})

app.post("/logout", async (req, res) => {
  try {
    req.session.destroy()
    return res.sendStatus(200)
  } catch (e) {
    console.error(e)
    return res.sendStatus(500)
  }
})

app.post("/fetch-user", async (req, res) => {
  // if (req.sessionID && req.session.user) {
  //   return res.status(200).json({ user: req.session.user })
  // }
  return res.status(404).send("Unauthroized!!!")
})

app.post("/post/:email", async (req, res) => {
  // if (req.sessionID && req.session.user) {
  //   return res.status(200).json({ user: req.session.user })
  // }
  const data = await client.query("SELECT * FROM users return *")
  res.json(data.rows)
  // return res.status(404).send("Unauthroized!!!")
})

// now listen on port 3000...
const port = 8080
app.listen(port, () => {
  console.log(`App started on port ${port}`)
})
