const routes = require('express').Router();
const database = require('../helpers/database');
const ether = require('../helpers/ether');
const storj = require('../../pos/app');

/*
 * @params title, price, description, royalty, address, image_url, mileStones = {
 amount, profit, timeStamp
}
 */
routes.post('/proposals/create', function(req, res) {
  req.checkBody('title', 'Invalid title').notEmpty();
  req.checkBody('address', 'Invalid address').notEmpty();

  //Trim and escape the name field.
  req.sanitize('title').escape();
  req.sanitize('title').trim();
  req.sanitize('description').escape();
  req.sanitize('address').escape();
  req.sanitize('address').trim();

  var errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    return res.send(errors);
  }
  else {
    var data = {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      royalty: req.body.royalty,
      address: req.body.address,
      image_url: req.body.image_url,
      mileStones: req.body.mileStones
    }

    data.mileStones = [
      { amount: 500,
        profit: 0.1,
        timeStamp: 2302031230
      }];

    ether.getAccounts(accounts => {
      data.address = accounts[0];
      ether.createProposal(data, address => res.send(address));
    });
  }
});

/*
 * @params proposalAddress, investorAddress, day, month, year
 */
routes.post('/proposals/invest', function(req, res) {
  req.checkBody('proposalAddress', 'Invalid Proposal Address').notEmpty();
  req.sanitize('proposalAddress').escape();
  req.sanitize('proposalAddress').trim();
  req.checkBody('investorAddress', 'Invalid Investor Address').notEmpty();
  req.sanitize('investorAddress').escape();
  req.sanitize('investorAddress').trim();

  var errors = req.validationErrors();
  if (errors) {
    return res.send(errors);
  } else {
    ether.getAccounts(accounts => ether.investProposal({
      proposalAddress: req.body.proposalAddress,
      investorAddress: req.body.investorAddress,
      timeStamp: req.body.timeStamp
    }, address => res.send(address)));
  }
});

routes.get('/proposals/address/:address', function(req, res) {
  ether.getProposal(req.params.address, data => {
    res.send(data);
  });
});

routes.get('/proposals', function(req, res) {
  ether.getAllProposals(data => {
    res.send(data);
  });
});

routes.get('/proposals/growth/:address', function(req, res) {
  ether.generateHistory(req.params.address, success => res.send(success));
});

routes.get('/proposals/abi', function(req, res) {
  ether.getAbi(abi => res.send(abi));
});

routes.get('/test', function(req, res) {
  storj.testStorjUpload();
  // storj.storjUploadFile('02b560e4a3ba3cf97189aeb8', '../../pos/img/Statement_of_Account_Excel_Example.png', function(fileid) {
	// 	console.log("got file id:" + fileid);
  //   res.send(fileid);
	// });
});

routes.post('/proposals/image', function(req, res) {
  ether.setImage(req.body.address, req.body.image, success => res.send(success));
})

module.exports = routes;
