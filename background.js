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
        intervalTimes++;
    }

    function onGot(tab)
    {
        if (tab.url.indexOf("manage.bittitan.com") != -1)
        { //tab which has just logged in through IMPERSONATION
            browser.tabs.update(tab.id, { url: "https://migrationwiz.bittitan.com/app/" });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        }
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
        if (tab.url == "https://manage.bittitan.com" || tab.url.indexOf("manage.bittitan.com/delivery") != -1)
        { //the two URLs are the default redirection for IMPERSONATION, when URL is either one, account is impersonated, proceed to redirect
            if (windowID != null)
            {
                var updating = browser.windows.update(windowID, {
                    focused: true
                });
                updating.then(function (windowID)
                {
                    browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
                    browser.tabs.create({ "windowId": windowID, "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": true });
                }, onError);
            } else
            {
                browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
                browser.tabs.create({ "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": true });
            }
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
        if (tab.url == "https://manage.bittitan.com/" || tab.url.indexOf("manage.bittitan.com/delivery") != -1)
        { //the two URLs are the default redirection for IMPERSONATION, when URL is either one, account is impersonated, proceed to redirect
            browser.tabs.update(tab.id, { url: targetURL });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        }
    }
}

function extractImpersonationID(impersonationURL)
{
    return String(impersonationURL).split('https://internal.bittitan.com/Impersonate/')[1];
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse)
{
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
            onDirectTabCreated(tab, request.targetURL);
            GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
        }, onError);
    } else if (request.action == 'open_new_window') // ACTION 3
    {
        findWindowID = GLOBALWINDOWMAP.get(request.impersonationURL);
        if (findWindowID != undefined)
        { //there is existing WINDOW ID
            var windowGet = browser.windows.get(findWindowID); // need to see if previous instance is still available
            windowGet.then(activateWindow, notFoundWindow);
        } else
        {
            notFoundWindow();
        }

        function activateWindow(windowObj)
        {
            var updating = browser.windows.update(windowObj.id, {
                focused: true
            });
            updating.then(openTabsInWindow, onError);
        }

        function openTabsInWindow(w_window)
        {
            var creating = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
            creating.then(function (tab)
            {
                if (request.openDP)
                {
                    onDirectTabCreated(tab, "https://manage.bittitan.com/customers");
                    GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
                    var creating2ndWindow = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
                    creating2ndWindow.then(function (tab2)
                    {
                        onDirectTabCreated(tab2, "https://manage.bittitan.com/device-management/deploymentpro");
                        GLOBALTABIDMAP.set(tab2.id, extractImpersonationID(request.impersonationURL));
                    }
                    )
                } else
                {
                    onDirectTabCreated(tab, request.targetURL);
                    GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
                }
            }, onError);
        }

        function notFoundWindow()
        {
            var creating = browser.tabs.create({ "url": request.impersonationURL, "active": false });
            creating.then(function (tab)
            {
                var winCreating = browser.windows.create({ "tabId": tab.id, "left": parseInt(window.screen.width / 2), "top": 0, "height": window.screen.height, "width": parseInt(window.screen.width / 2) });
                winCreating.then(function (w_window)
                {
                    if (request.openDP)
                    {
                        onDirectTabCreated(tab, "https://manage.bittitan.com/customers");
                        var creating2ndWindow = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
                        creating2ndWindow.then(function (tab2)
                        {
                            onDirectTabCreated(tab2, "https://manage.bittitan.com/device-management/deploymentpro");
                            GLOBALTABIDMAP.set(tab2.id, extractImpersonationID(request.impersonationURL));
                        }
                        )
                    } else
                    {
                        onDirectTabCreated(tab, request.targetURL);
                    }
                    GLOBALWINDOWMAP.set(request.impersonationURL, w_window.id)
                    GLOBALTABIDMAP.set(tab.id, extractImpersonationID(request.impersonationURL));
                })
            });
        }
    } else if (request.action == 'refresh_current_tab') // ACTION 4
    {
        browser.tabs.query({ currentWindow: true, active: true }).then(function (tabs)
        {
            browser.tabs.update(tabs[0].id, { url: request.impersonationURL });
            onDirectTabCreated(tabs[0], request.targetURL);
        }, onError);
    } else if (request.action == 'getTabImpersonationId') // ACTION 5
    {
        if (GLOBALTABIDMAP.get(sender.tab.id) == undefined)
        {// tab with no tagged ImpersonationID
            GLOBALTABIDMAP.set(sender.tab.id, request.detectedImpersonationID);
            return new Promise(resolve => resolve(request.detectedImpersonationID));
        } else
        {
            return new Promise(resolve => resolve(GLOBALTABIDMAP.get(sender.tab.id)));
        }
    }
})