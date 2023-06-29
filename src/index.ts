import express from 'express';
import {router} from "./routes";
import {api} from "../api";
import * as dotenv from "dotenv";

dotenv.config({path:__dirname+"/.env"});
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', router);
app.use('/api',api);
app.use(express.static('public'));
app.listen(PORT);
