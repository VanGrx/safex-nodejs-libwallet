const safex = require('safex-nodejs-libwallet');
const path = require('path');

const fs = require('fs');
if(fs.existsSync('index.log')) 
	fs.unlinkSync('index.log')
	
safex.setupLog(3, "index.log");

var wallet;
var sent = false;
const wallet_path = path.join(__dirname, 'test-wallet');

var args = {
    'path': wallet_path,
	'password': '123',
	'network': 'testnet',
	'daemonAddress': 'localhost:29393',
	'restoreHeight': 0,
	'mnemonic' : 'nifty inflamed against focus gasp ethics spying gulp tiger cogs evicted cohesive woken nylon erosion tell saved fatal alkaline acquire lemon maps hull imitate saved'
}


// var args = {
//      'path': wallet_path,
//  	'password': '123',
//  	'network': 'testnet',
//  	'daemonAddress': 'localhost:29393',
//  	'restoreHeight': 0,
//     'addressString':  'SFXtzRzqWR2J3ytgxg1AxBfM8ZFgZmywoXHtqeqwsk3Gi63B2c3mvLNct35m268Pg2eGqHLmJubC7GPdvb1KxhTvHeVd4WKD9RQ',
//     'viewKeyString':  '',
//     'spendKeyString':  ''
// }

if (!safex.walletExists(wallet_path)) {
	console.log("wallet doesn't exist. creating new one: " + wallet_path);
	if(args.mnemonic)
		promise = safex.recoveryWallet(args);
    else if(args.addressString)
        promise = safex.createWalletFromKeys(args);
	else
		promise = safex.createWallet(args);
} else {
	console.log("wallet already exists. opening: " + wallet_path);
	promise = safex.openWallet(args);
}

const nextTick = () => {
    if (wallet) {
		console.log("address: " + wallet.address());
		console.log("balance: " + wallet.balance());
		console.log("unlocked balance: " + wallet.unlockedBalance());
        console.log("token balance: " + wallet.tokenBalance());
        console.log("unlocked token balance: " + wallet.unlockedTokenBalance());
		console.log("seed: " + wallet.seed());
		console.log("secret view key: " + wallet.secretViewKey());
		console.log("secret spend key: " + wallet.secretSpendKey());
		console.log("public view key: " + wallet.publicViewKey());
		console.log("public spend key: " + wallet.publicSpendKey());
    }

    setTimeout(nextTick, 10000);
}
var lastHeight = 0;
promise
	.then((w) => {
		console.log("address: " + w.address());
		console.log("seed: " + w.seed());

		wallet = w;
		wallet.on('newBlock', function (height) {
			if(height-lastHeight>1000) {
				console.log("blockchain updated, height: " + height);
				lastHeight = height;
			}
		});

		wallet.on('refreshed', function () {
			console.log("wallet refreshed");

			wallet.store()
				.then(() => {console.log("wallet stored")})
				.catch((e) => {console.log("unable to store wallet: " + e)})

			if (!sent) {
				sent = true;
                // wallet.createTransaction({
                //     'address': 'SFXtzT37s8jWtjUx8kfWD24PU2mMLqYkt7DQ3KzJKC7B3pp67XFpFJhiEvwTe1DX9gT7nWcYZQRt7UWnEoWDcjmLdegfWoLVZwY',
                //     'amount': '21300000000', //send 2.13 cash
                // })
				wallet.createTransaction({
					'address': 'SFXtzT37s8jWtjUx8kfWD24PU2mMLqYkt7DQ3KzJKC7B3pp67XFpFJhiEvwTe1DX9gT7nWcYZQRt7UWnEoWDcjmLdegfWoLVZwY',
					'amount': '30000000000', //send 3 tokens
					'tx_type': 1 //token transaction
				}).then((tx) => {
					console.log("token transaction created: " + tx.transactionsIds());

					tx.commit().then(() => {
						console.log("transaction commited successfully");
					}).catch((e) => {
						console.log("error on commiting transaction: " + e);
					});
				}).catch((e) => {
					sent = false;
					console.log("couldn't create transaction: " + e);
				});
			}
		});

		wallet.on('updated', function () {
			console.log("updated");
		});

		wallet.on('unconfirmedMoneyReceived', function(tx, amount) {
			console.log("unconfirmed money received. tx: " + tx + ", amount: " + amount);
		});

		wallet.on('moneyReceived', function(tx, amount) {
			console.log("money received. tx: " + tx + ", amount: " + amount);
		});

		wallet.on('moneySpent', function(tx, amount) {
			console.log("money spent. tx: " + tx + ", amount: " + amount);
		});

        wallet.on('unconfirmedTokensReceived', function(tx, token_amount) {
            console.log("unconfirmed tokens received. tx: " + tx + ", token amount: " + token_amount);
        });

        wallet.on('tokensReceived', function(tx, token_amount) {
            console.log("tokens received. tx: " + tx + ", token amount: " + token_amount);
        });

        wallet.on('tokensSpent', function(tx, token_amount) {
            console.log("tokens spent. tx: " + tx + ", token amount: " + token_amount);
        });

		nextTick();
	})
	.catch((e) => {
		console.log("no luck tonight: " + e);
	});
