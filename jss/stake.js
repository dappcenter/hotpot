
Stake = {
    count:0,
    cliamTimer: null,
    eventBlocks: new Set(),
    notifyRewardAmount: function (token, amount) {
        var amount = web3.toHex(amount * 10 ** 18);
        stakeInfos[token].instance.notifyRewardAmount(amount, function (e, result) {
            if (e) {
                console.log("stake approve error " + e);
            } else {
                var url = "https://etherscan.io/tx/" + result;
                if (ETHENV.chainId == '0x1') {
                    url = "https://etherscan.io/tx/" + result;
                } else if (ETHENV.chainId == '0x3') {
                    url = "https://ropsten.etherscan.io/tx/" + result;
                }
                showTopMsg("Pending...", 0, url);
                startListenTX(result);
            }
        });
    },
    claimByNFT: function (id) {
        console.log("claimByNFT " + id);
        var token = stakeInfos[currentPagePoolID];
        if (token.userEarn == 0) {
            toastAlert(getString('noearned'));
            return;
        } else {
            token.instance.getRewardByNFT(id, function (e, r) {
                afterSendTx(e, r);
            });
        }
    },
    approve: function () {
        console.log("stake approve:" + currentPagePoolID);
        if (currentPagePoolID != "") {
            var stakeToken = stakeERCContract[currentPagePoolID];
            stakeToken.approve(stakePoolAddress[currentPagePoolID], web3.toHex(Math.pow(10, 30)), function (e, result) {
                if (e) {
                    console.log("stake approve error " + e);
                } else {
                    var url = "https://etherscan.io/tx/" + result;
                    if (ETHENV.chainId == '0x1') {
                        url = "https://etherscan.io/tx/" + result;
                    } else if (ETHENV.chainId == '0x3') {
                        url = "https://ropsten.etherscan.io/tx/" + result;
                    }
                    showTopMsg("Pending...", 0, url);
                    startListenTX(result);
                    $("#approvestake").text(getString('approvestake') + "...");
                }
            });
        }
    },
    //currentPagePoolID
    claimFree: function () {
        var token = stakeInfos[currentPagePoolID];
        if (token.userEarn == 0) {
            toastAlert(getString('noearned'));
            return;
        } else {
            token.instance.getRewardFree(function (e, r) {
                afterSendTx(e, r);
            });
        }
    },
    claimNFT: function () {
        var token = stakeInfos[currentPagePoolID];
        if (token.userEarn == 0) {
            toastAlert(getString('noearned'));
            return;
        }
        if (UserNFT.nftIds.length == 0) {
            //$.i18n.map[i]
            toastAlert($.i18n.map['nocard']);
        } else {
            toastAlert(getString('choosecard'));
            UserNFT.initNFTTable(nftUse[1]);
            showTable(true);
        }
    },
    stake: function () {
        console.log("stake");
        if (stakeInfos[currentPagePoolID].userBalance == 0) {
            toastAlert(getString('noenoughstake'));
            return;
        }
        document.getElementById("popTitle").innerHTML = "Stake";
        var userBalance = (stakeInfos[currentPagePoolID].userBalance / Math.pow(10, stakeInfos[currentPagePoolID].decimals)).toFixed(4);
        $('#maxAvaliable').text(userBalance);
        document.getElementById('stakeInput').value = 0;
        $("#withdrawdiv").hide();
        $("#stakediv").show();
        showAlert();
    },
    withdraw: function () {
        console.log("stake");
        if (stakeInfos[currentPagePoolID].userStake == 0) {
            toastAlert(getString('noenoughwithdraw'));
            return;
        }
        document.getElementById("popTitle").innerHTML = "WithDraw";
        var userStake = (stakeInfos[currentPagePoolID].userStake / Math.pow(10, stakeInfos[currentPagePoolID].decimals)).toFixed(4);
        $('#maxAvaliable').text(userStake);
        document.getElementById('stakeInput').value = 0;
        $("#withdrawdiv").show();
        $("#stakediv").hide();
        showAlert();
    },

    maxStake: function () {
        var max = $('#maxAvaliable').text();
        // console.log("maxStake=" + max);
        document.getElementById('stakeInput').value = max
    },
    withdrawSure: function () {
        hideAlert();
        var token = stakeInfos[currentPagePoolID];
        if (token && token.poolAddress) {
            var stake = parseFloat(document.getElementById('stakeInput').value);
            if (stake <= 0) {
                toastAlert(getString('withdrawcannotbezero'));
                return;
            }

            var hex = web3.toHex(stake * Math.pow(10, token.decimals));
            token.instance.stake(hex, function (e, result) {
                if (e) {
                    return console.error('Error with stake:', e);
                }
                showTopMsg("Pending...", 0, getEthersanUrl(result));
                startListenTX(result);
            });
        }
    },
    stakeSure: function () {
        hideAlert();
        var token = stakeInfos[currentPagePoolID];
        if (token && token.poolAddress) {
            var stake = parseFloat(document.getElementById('stakeInput').value);
            if (stake <= 0) {
                toastAlert(getString('stakecannotbezero'));
                return;
            }

            var hex = web3.toHex(stake * Math.pow(10, token.decimals));
            token.instance.stake(hex, function (e, result) {
                if (e) {
                    return console.error('Error with stake:', e);
                }
                showTopMsg("Pending...", 0, getEthersanUrl(result));
                startListenTX(result);
            });
        }
    },
    getAllPoolBalance: function () {
        for (var i = 0; i < allPoolTokens.length; i++) {
            var token = allPoolTokens[i];
            Stake.getSinglePoolBalance(token);
        }
    },
    getSinglePoolBalance: function (name) {
        console.log("getSinglePoolBalance name=" + name);
        var poolAddress = stakePoolAddress[name];
        contractsInstance.HotPot.balanceOf(poolAddress, function (e, result) {
            console.log("pool balance name=" + name + ",balance=" + result);
            balanceOfHotpot[name] = result;
            Stake.count++;
            if (Stake.count == 5) {
                Stake.calTotalCirculation();
            }
        });
    },
    calTotalCirculation: function () {
        var total = balanceOfHotpot['total'];
        for (var i = 0; i < allPoolTokens.length; i++) {
            var token = allPoolTokens[i];
            total = total.minus(balanceOfHotpot[token]);
        }
        total = total.div(Math.pow(10, 18));
        console.log("calTotalCirculation=" + total);
        $("#totalcir").text(total.toFixed(2));
    },
    initpooldata: function (name) {
        if (Stake.cliamTimer != null) {
            clearInterval(Stake.cliamTimer);
            Stake.cliamTimer = null;
        }
        $('.farmname').text(name + ' FARM');
        currentPagePoolID = name;

        let token = stakeInfos[name];
        var allowance = token.allowance;
        if (allowance > 0) {
            $('body').addClass('approved');
        } else {
            $("#approvestake").text(getString('approvestake'));
        }

        var stakeDecimals = token.decimals;
        let totalStake = token.poolTotalStake;
        // console.log("totalStake=" + totalStake);

        $('.totalstake').text((totalStake.div(Math.pow(10, stakeDecimals))).toFixed(2) + " " + name);
        // pools[name].poolTotalStake = totalStake;

        let userStake = token.userStake;
        // console.log("userStake=" + userStake);
        $('.stakedbalance').text((userStake.div(Math.pow(10, stakeDecimals))).toFixed(2) + " " + name);

        $('#stakeToken').text(name + " ");

        let earned = token.userEarn;
        earned = (earned / Math.pow(10, stakeInfos["hotpot"].decimals));
        $('.rewardbalance').text(earned.toFixed(2));

        var lastRewardTime = parseInt((token.lastRewardTime).valueOf());
        var now = Math.floor(((new Date()).getTime()) / 1000);
        var delay = lastRewardTime + 86400 - now;
        console.log("lastRewardTime=" + lastRewardTime + ",delay=" + delay + ",token=" + name);
        if (delay > 0) {
            $("#claimtimep").show();
            Stake.cliamTimer = setInterval(() => {
                delay -= 1;
                if (delay == 0) {
                    $("#claimtimep").hide();
                    clearInterval(Stake.cliamTimer);
                }
                $("#claimtime").text(formatFomoTime(delay));
            }, 1000);
        } else {
            $("#claimtimep").hide();
        }
    },
    initStakePool: function () {
        console.log("initStakePool");
        for (var i = 0; i < allPoolTokens.length; i++) {
            var poolName = allPoolTokens[i];
            Stake.initSinglePool(poolName);
        }
    },
    checkTotalStaked: function () {
        if (Stake.totalStake) {
            return;
        }
        var totalPrice = new BigNumber(0);
        for (var i = 0; i < allPoolTokens.length; i++) {
            var poolName = allPoolTokens[i];
            var periodFinish = stakeInfos[poolName].periodFinish;
            if (!periodFinish) {
                return;
            }
            if (periodFinish == 0) {
                return;
            }
        }

        for (var i = 0; i < allPoolTokens.length; i++) {
            var poolName = allPoolTokens[i];

            var stake = stakeInfos[poolName].poolTotalStake;
            console.log("checkTotalStaked: pool=" + poolName + ",price=" + stakeInfos[poolName].price + ",stake=" + stake);
            if (stake == 0) {
                continue;
            }
            var stakePrice = stake.div(Math.pow(10, stakeInfos[poolName].decimals)).mul(stakeInfos[poolName].price);
            console.log("checkTotalStaked: pool=" + poolName + ",stake price=" + stakePrice);
            totalPrice = totalPrice.plus(stakePrice);
        }
        Stake.totalStake = totalPrice;
        $("#totalstake").text(totalPrice.toFixed(2));
    },
    initSinglePool: function (poolName) {
        var poolAddress = stakePoolAddress[poolName];
        console.log("initSinglePool poolname=" + poolName);
        stakeInfos[poolName].instance = contractsInstance.StakePool.at(poolAddress);

        stakeInfos[poolName].instance.Staked({ user: App.defaultAccount }, function (err, result) {
            if (err) {
                return console.error('Error with stake:', err);
            }
            if (result) {
                if (Stake.eventBlocks.has(result.blockNumber)) {
                    return;
                }
                Stake.eventBlocks.add(result.blockNumber);
                // console.log('eventResult:', eventResult);
                toastAlert("Stake success!");
                console.log("Staked");
                stakeInfos[poolName].userStake = stakeInfos[poolName].userStake.plus(result.args.amount);
                stakeInfos[poolName].poolTotalStake = stakeInfos[poolName].poolTotalStake.plus(result.args.amount);
                if (currentPagePoolID == poolName)
                    Stake.initpooldata(currentPagePoolID);
            }
        });

        stakeInfos[poolName].instance.Withdrawn({ user: App.defaultAccount }, function (err, result) {
            if (err) {
                return console.error('Error with stake:', err);
            }
            if (result) {
                // console.log('eventResult:', eventResult);
                if (Stake.eventBlocks.has(result.blockNumber)) {
                    return;
                }
                Stake.eventBlocks.add(result.blockNumber);
                toastAlert("Withdraw success!");
                console.log("Withdrawn");
                stakeInfos[poolName].userStake = stakeInfos[poolName].userStake.sub(result.args.amount);
                stakeInfos[poolName].poolTotalStake = stakeInfos[poolName].poolTotalStake.sub(result.args.amount);
                if (currentPagePoolID == poolName)
                    Stake.initpooldata(currentPagePoolID);
            }
        });

        stakeInfos[poolName].instance.RewardPaid({ user: App.defaultAccount }, function (err, result) {
            if (err) {
                return console.error('Error with stake:', err);
            }
            if (result) {
                if (Stake.eventBlocks.has(result.blockNumber)) {
                    return;
                }
                Stake.eventBlocks.add(result.blockNumber);
                // console.log('eventResult:', eventResult);
                // toastAlert("Withdraw success!");
                console.log("RewardPaid");
                stakeInfos[poolName].userEarn = stakeInfos[poolName].userEarn.sub(result.args.reward);
                
                console.log("currentPagePoolID=" + currentPagePoolID + ",poolName=" + poolName);
                if (result.args.percent < 7) {
                    stakeInfos[poolName].lastRewardTime = Math.floor((new Date()).getTime() / 1000);
                }
                if (currentPagePoolID == poolName)
                    Stake.initpooldata(currentPagePoolID);
            }
        });

        stakeInfos[poolName].instance.totalSupply(function (e, result) {
            console.log("initSinglePool pool=" + poolName + ",totalSupply:" + result);
            stakeInfos[poolName].poolTotalStake = result;
            stakeInfos[poolName].instance.balanceOf(App.defaultAccount, function (e, result) {
                console.log("initSinglePool pool=" + poolName + ",balanceOf:" + result);
                stakeInfos[poolName].userStake = result;
                stakeInfos[poolName].instance.earned(App.defaultAccount, function (e, result) {
                    console.log("initSinglePool pool=" + poolName + ",earned:" + result);
                    stakeInfos[poolName].userEarn = result;
                    stakeInfos[poolName].instance.rewardRate(function (e, result) {
                        console.log("initSinglePool pool=" + poolName + ",rewardRate:" + result);
                        stakeInfos[poolName].rewardRate = result;
                        Stake.updateAPY(poolName);

                        console.log("initSinglePool poolName=" + poolName + ",currentPagePoolID=" + currentPagePoolID);
                        if (currentPagePoolID === poolName) {
                            Stake.initpooldata(currentPagePoolID);
                        }
                        stakeInfos[poolName].instance.periodFinish(function (e, r) {
                            console.log("initSinglePool pool=" + poolName + ",periodFinish:" + r);
                            stakeInfos[poolName].periodFinish = r;

                            Stake.checkTotalStaked();
                        });
                        stakeInfos[poolName].instance.lastRewardTime(App.defaultAccount, function (e, r) {
                            console.log("initSinglePool pool=" + poolName + ",lastRewardTime:" + r);
                            stakeInfos[poolName].lastRewardTime = r;
                        });
                    });
                });
            });
        });

        stakeInfos[poolName].instance.starttime(function (e, r) {
            console.log("initSinglePool pool=" + poolName + ",starttime:" + r);
        });
        stakeInfos[poolName].instance.rewardContract(function (e, r) {
            console.log("initSinglePool pool=" + poolName + ",rewardContract:" + r);
        });
    },
    updateAPY: function (name) {
        console.log("updateapy " + name);
        var hotpotDecimals = knownTokens["hotpot"].decimals;
        //池子每s产出wwt数量
        let rewardRate = stakeInfos[name].rewardRate.div(Math.pow(10, hotpotDecimals));
        console.log("rewardRate=" + rewardRate);

        //每s能挖出的wwt总价格
        let rewardPrice = rewardRate * stakeInfos["hotpot"].price;

        //用来质押的代币
        let stakeToken = stakeInfos[name];
        let totalStake = stakeToken.poolTotalStake;

        let totalStakePrice = totalStake.div(Math.pow(10, stakeToken.decimals)).mul(stakeToken.price);

        console.log("updateapy token price=" + stakeToken.price + ",total price=" + totalStakePrice);

        //每s，每u能产出的产率
        let aps = 1;
        if (totalStakePrice != 0)
            aps = rewardPrice / totalStakePrice;

        let apy = aps * 60 * 60 * 24 * 365;

        console.log("totalStakePrice=" + totalStakePrice + ",apy=" + apy);

        stakeToken.apy = apy;

        var apyStr = parseInt(apy) * 100 + ' %';
        if (totalStakePrice < 1) {
            apyStr = "Infinity %";
        }
        // "eth/usdt",
        // "uni/eth",
        // "hotpot",
        // "hotpot/eth",

        if (name == "eth/usdt") name = "ethusdt";
        if (name == "uni/eth") name = "unieth";
        if (name == "hotpot/eth") name = "hotpoteth";

        var apyp = ".poolyield" + name;
        console.log("apy str=" + apyStr);
        $(apyp).animateNumbers(apyStr);

        $("#divloading").hide();
    }
}
