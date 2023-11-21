import express, { Application, Request, Response } from 'express';

const app: Application = express();

// Number of hits in Pete Rose's career
const PORT: number = 4256;

app.use('/', (req: Request, res: Response): void => {
    res.send('Hello world!');
});

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});