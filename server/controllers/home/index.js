
exports.init = function(app) {
  app.get('/', homepage);
};

function homepage(req, res) {
  res.render('index');
}

