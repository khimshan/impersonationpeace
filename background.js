//var checkPendingImpersonationTab = setInterval(changePendingImpersonationTab, 5000); //needs to use timer to wait for all AJAX operations to complete
function onError(error)
{
    console.log(`Error: ${error}`);
}

function onMWTabCreated(tab)
{
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function changePendingImpersonationTab()
    {
        var gettingInfo = browser.tabs.get(tab.id); // needs to re-get tab to refresh the latest tab URL
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES)
        {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        console.log("Timer is still running !!!");
        intervalTimes++;
    }

    function onGot(tab)
    {
        console.log("Inside is bolIsManageURL !!! URL : " + tab.url);
        if (tab.url.indexOf("manage.bittitan.com") != -1)
        { //tab which has just logged in through IMPERSONATION
            console.log("Inside is bolIsManageURL : TRUE !");
            browser.tabs.update(tab.id, { url: "https://migrationwiz.bittitan.com/app/" });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        } else
        {
            console.log("Inside is bolIsManageURL : FFFFF !" + tab.url);
        };
    }
}

function onDPTabCreated(tab)
{
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function changePendingImpersonationTab()
    {
        var gettingInfo = browser.tabs.get(tab.id); // needs to re-get tab to refresh the latest tab URL
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES)
        {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        intervalTimes++;
    }

    function onGot(tab)
    {
        if (tab.url.indexOf("manage.bittitan.com") != -1)
        { //tab which has just logged in through IMPERSONATION
            browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
            browser.tabs.create({ "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": false });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        }
    }
}

function onDirectTabCreated(tab, targetURL)
{
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function changePendingImpersonationTab()
    {
        var gettingInfo = browser.tabs.get(tab.id); // needs to re-get tab to refresh the latest tab URL
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES)
        {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        intervalTimes++;
    }

    function onGot(tab)
    {
        if (tab.url.indexOf("manage.bittitan.com") != -1) //impersonation token granted
        { //tab which has just logged in through IMPERSONATION
            console.log("before redirect : " + targetURL);
            browser.tabs.update(tab.id, { url: targetURL });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        }
    }
}


browser.runtime.onMessage.addListener(function (request, sender, sendResponse)
{
    console.log("top of OnMessage : " + request.targetURL);
    if (request.action === 'open_mw_tab')
    {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": false });
        creating.then(onMWTabCreated, onError);

    } else if (request.action === 'open_dp_tab') 
    {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": false });
        creating.then(onDPTabCreated, onError);
    } else if (request.action === 'open_direct_tab') 
    {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": false });
        creating.then(function (tab)
        {
            console.log("top of open direct tab : " + request.targetURL);
            onDirectTabCreated(tab, request.targetURL);
        }, onError);
    }
});