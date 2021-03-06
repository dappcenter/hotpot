var defaultAccount = null;
var defaultBalance = 0;
var currentPagePoolID = "";
var currentPage = "";

function formatFomoTime(t) {
    if (t < 0) {
        return 'error';
    }
    // console.log("formatFomoTime : "+t)
    const times = Math.floor(t);
    const h = Math.floor(times / 3600);
    const m = Math.floor((times % 3600) / 60);
    const s = times % 60;
    return h + "h " + m + "m " + ' ' + + s + "s";
}


function showAlert() {
    document.getElementById('light').style.display = 'block';
    // document.getElementById('fade').style.display = 'block';
}

function hideAlert() {
    document.getElementById('light').style.display = 'none';
    document.getElementById('fade').style.display = 'none';
}

function showSellAlert(id) {
    document.getElementById("popTitle").innerHTML = "Sell";
    document.getElementById('stakeInput').value = 0;
    $("#sellToken").text("出售会员卡ID: " + id);
    $(".popTitle").text(getString('selltitle'));
    $(".popTitle").attr('data-lang','selltitle');
    $("#loandiv").hide();
    $("#selldiv").show();
    $("#divsell").show();
    $("#borrowdiv").hide();
    $(".divloan").hide();
    $("#iddiv").text(id);
    $("#priceunit").text('HotPot');
}

function showLoanAlert(id) {
    document.getElementById('stakeInput').value = 0;
    $("#sellToken").text("租赁会员卡ID: " + id);
    $(".popTitle").text(getString('loantitlepop'));
    $(".popTitle").attr('data-lang','loantitlepop');
    $("#loandiv").show();
    $("#selldiv").hide();
    $("#divsell").show();
    $(".divloan").show();
    $("#iddiv").text(id);
    $("#borrowdiv").hide();
    $("#priceinputdiv").show();
    $("#priceunit").text('HotPot/Day');
}

function showBorrowAlert(id) {
    document.getElementById('stakeInput').value = 0;
    $("#sellToken").text("租赁会员卡ID: " + id);
    $(".popTitle").text(getString('loantitlepop'));
    $(".popTitle").attr('data-lang','loantitlepop');
    $("#loandiv").hide();
    $("#selldiv").hide();
    $("#borrowdiv").show();
    $("#divsell").show();
    $(".divloan").show();
    $("#iddiv").text(id);
    $("#priceinputdiv").hide();
    $("#priceunit").text('HotPot/Day');
}


function getSellAlertId() {
    return $("#iddiv").text();
}

function hideSellAlert() {
    $("#divsell").hide();
}


function getString(id) {
    return $.i18n.map[id];
}

function afterSendTx(error, result) {
    if (error) {
        console.log("stake approve error " + error);
        toastAlert("Error:" + error);
    } else {
        showTopMsg("Pending...", 0, getEthersanUrl(result));
        startListenTX(result);
    }
}

function getEthersanUrl(tx) {
    var url = "https://etherscan.io/tx/" + tx;
    if (ETHENV.chainId == '0x1') {
        url = "https://etherscan.io/tx/" + tx;
    } else if (ETHENV.chainId == '0x3') {
        url = "https://ropsten.etherscan.io/tx/" + tx;
    }
    return url;
}

function startListenTX(tx) {
    console.log("startListenTX");
    var internal = setInterval(function () {
        web3.eth.getTransactionReceipt(tx, function (e, result) {
            if (e) {
                console.log("tx error:" + e);
                toastAlert("Error : " + e);
            } else {
                console.log("tx result:" + result);
            }
            if (result) {
                clearInterval(internal);
                console.log("getTransactionReceipt ");
                hideTopMsg();
                if (result.status == '0x0') {
                    showTopMsg(getString('txfail'), 5000, getEthersanUrl(result.transactionHash));
                    // toastAlert(getString('txfail'));
                }
                // autoRefresh();
            }
        });
    }, 3000);

}

function showTopMsg(msg, showTime, url) {
    $("#toprightmsg").text(msg);
    $("#toprightmsg").show();
    $("#toprightmsg").attr("href", url);
    if (showTime > 0) {
        setTimeout(function () {
            hideTopMsg();
        }, showTime);
    }
}

function hideTopMsg() {
    $("#toprightmsg").hide();
}

//importantmsg
function showImportantMsg(msg, url) {
    console.log("importantmsg = " + msg);
    $("#importantmsg").text(msg);
    $("#importantmsg").show();
    $("#importantmsg").attr("href", url);

    setTimeout(function () {
        $("#importantmsg").hide();
    }, 3000);
}

function toastAlert(msg) {
    console.log("toastAlert:" + msg);
    document.getElementById('alertdiv').style.display = 'block';
    document.getElementById('alertdiv').innerHTML = msg;
    setTimeout(function () {
        document.getElementById('alertdiv').style.display = 'none';
    }, 3000);
}
