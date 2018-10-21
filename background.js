//var checkPendingImpersonationTab = setInterval(changePendingImpersonationTab, 5000); //needs to use timer to wait for all AJAX operations to complete
function onError(error) {
    console.log(`Error: ${error}`);
}

function onTabCreated(tab) {
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function onGot(tab) {
        console.log("Inside is bolIsManageURL !!! URL : " + tab.url);
        if (tab.url.indexOf("manage.bittitan.com") != -1) { //tab which has just logged in through IMPERSONATION
            console.log("Inside is bolIsManageURL : TRUE !");
            browser.tabs.update(tab.id, { url: "https://migrationwiz.bittitan.com/app/" });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        } else {
            console.log("Inside is bolIsManageURL : FFFFF !"  + tab.url);
        };
    }

    function changePendingImpersonationTab() {
        var gettingInfo = browser.tabs.get(tab.id);
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES) {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        console.log("Timer is still running !!!");
        intervalTimes++;
    }
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("BACKGROUNG EVENT LISTENER FUNCTION RECEIVEED !!!!!!!");
    if (request.action === 'open_new_tab') {
        var creating = browser.tabs.create({ "url": request.tabURL, "active" : false });
        creating.then(onTabCreated, onError);

    }
});