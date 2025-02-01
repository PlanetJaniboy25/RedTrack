import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors({
  origin: "*",  // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"] // Allowed headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//all routers from ./routes/*.ts (or js, if you compile them), use fs, allow nested folders
fs.readdirSync(__dirname + '/routes').forEach((file) => {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const route = require(`./routes/${file}`);
    app.use("/api/" + file.split(".")[0].toLowerCase(), route.default);

    console.log(`Route ${file} loaded`);
  }
});


app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

async function requiresAuth(req : Request, res : Response, next : Function) {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  if(req.headers.authorization.split(' ')[0] !== 'Bearer')
    return res.status(401).send({ message: 'Unauthorized' });

  let sessionToken = req.headers.authorization.split(' ')[1];

}