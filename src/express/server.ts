import App from './app';

const PORT = process.env.PORT || 8081;

App.server.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log('Express server listening on port ' + PORT);
});
