var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(Search for Github Repository)</i>',
      text: ''
    }]);
    return;
  }

  var response;
  try {
    response = sync.await(request({
      url: 'http://api.giphy.com/v1/gifs/search',
      headers: {
        'user-agent': 'kevintaehyungkim'
      },
      qs: {
        q: term,
      },
      gzip: true,
      json: true,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.data) {
    res.status(500).send('Error');
    return;
  }

  var results = _.chain(response.body.data)
    .reject(function(image) {
      return !image || !image.images || !image.images.fixed_height_small;
    })
    .map(function(image) {
      return {
        title: '<img style="height:75px" src="' + image.images.fixed_height_small.url + '">',
        text: 'http://giphy.com/' + image.id
      };
    })
    .value();

  if (results.length === 0) {
    res.json([{
      title: '<i>(no results)</i>',
      text: ''
    }]);
  } else {
    res.json(results);
  }
};
