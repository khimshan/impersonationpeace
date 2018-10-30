//var checkPendingImpersonationTab = setInterval(changePendingImpersonationTab, 5000); //needs to use timer to wait for all AJAX operations to complete
var GLOBALWINDOWMAP = new Map();
var GLOBALTABIDMAP = new Map();

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

function onDPTabCreated(tab, windowID)
{
    const TIMERTIMES = 15; // set timer to monitor tab for 10 seconds
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
        console.log("TAB URL : " + tab.url);
        if (tab.url == "https://manage.bittitan.com" || tab.url.indexOf("manage.bittitan.com/delivery") != -1) 
        { //the two URLs are the default redirection for IMPERSONATION, when URL is either one, account is impersonated, proceed to redirect
            console.log("Impersonated. Before redirect to Customer and DP");
            if (windowID != null)
            {
                browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
                browser.tabs.create({ "windowId": windowID, "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": true });
            } else
            {
                browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
                browser.tabs.create({ "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": true });
            }
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        } else { console.log("Still awaiting impersonation..."); }
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
        console.log("TAB URL : " + tab.url);
        if (tab.url == "https://manage.bittitan.com/" || tab.url.indexOf("manage.bittitan.com/delivery") != -1)
        { //the two URLs are the default redirection for IMPERSONATION, when URL is either one, account is impersonated, proceed to redirect
            console.log("Impersonated. Before redirect : " + targetURL);
            browser.tabs.update(tab.id, { url: targetURL });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        } else { console.log("Still awaiting impersonation..."); }
    }
}

function extractImpersonationID(impersonationURL)
{
    return String(impersonationURL).split('https://internal.bittitan.com/Impersonate/')[1];
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse)
{
    console.log("top of OnMessage : " + request.targetURL);

    function onDPTabCreatedFunc(tab)
    {
        GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
        onDPTabCreated(tab, null);
    }

    if (request.action === 'open_dp_tab') // ACTION 1
    {// this will only be called if GLOBALWIN is False
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": true });
        creating.then(onDPTabCreatedFunc, onError);
    } else if (request.action === 'open_direct_tab') // ACTION 2
    {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": true });
        creating.then(function (tab)
        {
            console.log("top of open direct tab : " + request.targetURL);
            onDirectTabCreated(tab, request.targetURL);
            GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
        }, onError);
    } else if (request.action == 'open_new_window') // ACTION 3
    {
        console.log("inside open new window : " + request.targetURL);
        findWindowID = GLOBALWINDOWMAP.get(request.impersonationURL);
        if (findWindowID != undefined)
        { //there is existing WINDOW ID
            var windowGet = browser.windows.get(findWindowID); // need to see if previous instance is still available
            windowGet.then(foundWindow, notFoundWindow);
        } else
        {
            notFoundWindow();
        }

        function foundWindow(w_window)
        {
            console.log("inside FOUND WINDOW : " + w_window.id);
            var creating = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
            creating.then(function (tab)
            {
                console.log("top of open direct tab in Window. Tab ID :  " + tab.id + ", " + request.targetURL);
                if (request.openDP)
                {
                    onDirectTabCreated(tab, "https://manage.bittitan.com/customers");
                    var creating2ndWindow = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
                    creating2ndWindow.then(function (tab2)  
                    {
                        onDirectTabCreated(tab2, "https://manage.bittitan.com/device-management/deploymentpro");
                    }
                    )
                    //onDPTabCreated(tab, w_window.id)
                } else
                {
                    onDirectTabCreated(tab, request.targetURL);
                }
            }, onError);
            //browser.tabs.highlight({windowId : w_window.id, tabs : tab.id});
        }

        function notFoundWindow()
        {
            console.log("inside NOT FOUND WINDOW : " + request.impersonationURL);
            var creating = browser.tabs.create({ "url": request.impersonationURL, "active": false });
            creating.then(function (tab)
            {
                var winCreating = browser.windows.create({ "tabId": tab.id, "left": window.screen.width / 2, "top": 0, "height": window.screen.height, "width": window.screen.width / 2 });
                winCreating.then(function (w_window)
                {
                    console.log("inside NOT FOUND WINDOW winCREATING : " + tab.id + ", " + request.impersonationURL);
                    if (request.openDP)
                    {
                        onDirectTabCreated(tab, "https://manage.bittitan.com/customers");
                        var creating2ndWindow = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
                        creating2ndWindow.then(function (tab2) 
                        {
                            onDirectTabCreated(tab2, "https://manage.bittitan.com/device-management/deploymentpro");
                        }
                        )
                        //onDPTabCreated(tab, w_window.id)
                    } else
                    {
                        onDirectTabCreated(tab, request.targetURL);
                    }
                    GLOBALWINDOWMAP.set(request.impersonationURL, w_window.id)
                    GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
                })
            });
        }
        /*
                var winCreating = browser.windows.create({ "focused" : false });
                winCreating.then(function (w_window) {
                    console.log("inside create new tabe in new window : " + request.targetURL);
                    creating = browser.tabs.create({ "windowId" : w_window.id, "url": request.impersonationURL, "active": false });
        
                    creating.then(function (tab) {
                        console.log("top of open direct tab in Window. Tab ID :  " + tab.id + ", " + request.targetURL);
                        onDirectTabCreated(tab, request.targetURL);
                    }, onError);
        
                }, onError);
                */
    } else if (request.action == 'refresh_current_tab') // ACTION 4
    {
        browser.tabs.query({ currentWindow: true, active: true }).then(function (tabs)
        {
            browser.tabs.update(tabs[0].id, { url: request.impersonationURL });
            console.log("REDIRECTING TO : " + request.targetURL);
            console.dir(tabs);
            onDirectTabCreated(tabs[0], request.targetURL);
        }, onError);
    } else if (request.action == 'getTabId') // ACTION 5
    {
        sendResponse({ tabId: sender.tab.id });
    }
})