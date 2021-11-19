import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';
import { appGameRouter } from './routes/game.routes';

class App {
  public app: express.Application;
  public server: http.Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.config();
  }

  private config(): void {
    this.app.use(bodyParser.json());

    this.app.use(cors());

    this.app.use('/game', appGameRouter);

    this.app.use((err: any, req: any, res: any, next: any) => {
      if (err) {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
      }
    });
  }
}

const app = new App();
export default app;
