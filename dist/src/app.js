import express from 'express';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(express.json());
app.get('/', (req, res) => {
    res.send("Hello Dip!");
});
export default app;
