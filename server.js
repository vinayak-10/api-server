const express = require('express')

const app = express();
const port = process.env.PORT || 9000;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

const cors = require('cors')

app.use(cors(
        {
          origin:'http://editor.dwall.xyz'
        }
    ));

app.use('/test', express.static('test'));
app.use('/images', express.static('uploads'));

const routes = require('./api/routes');
routes(app);
app.listen(port, function() {
   console.log('Server started on port: ' + port);
});
