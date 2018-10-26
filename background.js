//var checkPendingImpersonationTab = setInterval(changePendingImpersonationTab, 5000); //needs to use timer to wait for all AJAX operations to complete
var GLOBALWINDOWMAP = new Map();

function onError(error) {
    console.log(`Error: ${error}`);
}

function onMWTabCreated(tab) {
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function changePendingImpersonationTab() {
        var gettingInfo = browser.tabs.get(tab.id); // needs to re-get tab to refresh the latest tab URL
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES) {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        console.log("Timer is still running !!!");
        intervalTimes++;
    }

    function onGot(tab) {
        console.log("Inside is bolIsManageURL !!! URL : " + tab.url);
        if (tab.url.indexOf("manage.bittitan.com") != -1) { //tab which has just logged in through IMPERSONATION
            console.log("Inside is bolIsManageURL : TRUE !");
            browser.tabs.update(tab.id, { url: "https://migrationwiz.bittitan.com/app/" });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        } else {
            console.log("Inside is bolIsManageURL : FFFFF !" + tab.url);
        };
    }
}

function onDPTabCreated(tab, windowID) {
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function changePendingImpersonationTab() {
        var gettingInfo = browser.tabs.get(tab.id); // needs to re-get tab to refresh the latest tab URL
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES) {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        intervalTimes++;
    }

    function onGot(tab) {
        if (tab.url.indexOf("Impersonate") == -1) { //after redirection from IMPERSONATION happens
            if (windowID != null) {
                browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
                browser.tabs.create({ "windowId": windowID, "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": true });
            } else {
                browser.tabs.update(tab.id, { url: "https://manage.bittitan.com/customers" });
                browser.tabs.create({ "url": "https://manage.bittitan.com/device-management/deploymentpro", "active": true });
            }
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        }
    }
}

function onDirectTabCreated(tab, targetURL) {
    const TIMERTIMES = 10; // set timer to monitor tab for 10 seconds
    var intervalTimes = 0;

    var checkPendingImpersonationTabTimer = setInterval(changePendingImpersonationTab, 1000); //start 1s interval check for tab URL

    function changePendingImpersonationTab() {
        var gettingInfo = browser.tabs.get(tab.id); // needs to re-get tab to refresh the latest tab URL
        gettingInfo.then(onGot, onError);

        if (intervalTimes > TIMERTIMES) {
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer after allowed time limit
        }
        intervalTimes++;
    }

    function onGot(tab) {
        if (tab.url.indexOf("Impersonate") == -1) //impersonation token granted
        { //tab which has just logged in through IMPERSONATION
            console.log("before redirect : " + targetURL);
            browser.tabs.update(tab.id, { url: targetURL });
            clearInterval(checkPendingImpersonationTabTimer); // disable polling timer URL changed
        }
    }
}


browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("top of OnMessage : " + request.targetURL);
    if (request.action === 'open_mw_tab') {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": true });
        creating.then(onMWTabCreated, onError);

    } else if (request.action === 'open_dp_tab') {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": true });
        creating.then(onDPTabCreated, onError);
    } else if (request.action === 'open_direct_tab') {
        var creating = browser.tabs.create({ "url": request.impersonationURL, "active": true });
        creating.then(function (tab) {
            console.log("top of open direct tab : " + request.targetURL);
            onDirectTabCreated(tab, request.targetURL);
        }, onError);
    } else if (request.action == 'open_new_window') {
        console.log("inside open new window : " + request.targetURL);
        findWindowID = GLOBALWINDOWMAP.get(request.impersonationURL);
        if (findWindowID != undefined) { //there is existing WINDOW ID
            var windowGet = browser.windows.get(findWindowID); // need to see if previous instance is still available
            windowGet.then(foundWindow, notFoundWindow);
        } else {
            notFoundWindow();
        }

        function foundWindow(w_window) {
            console.log("inside FOUND WINDOW : " + w_window.id);
            var creating = browser.tabs.create({ "windowId": w_window.id, "url": request.impersonationURL, "active": true });
            creating.then(function (tab) {
                console.log("top of open direct tab in Window. Tab ID :  " + tab.id + ", " + request.targetURL);
                if (request.openDP) {
                    onDPTabCreated(tab, w_window.id)
                } else {
                    onDirectTabCreated(tab, request.targetURL);
                }
            }, onError);
        }

        function notFoundWindow() {
            console.log("inside NOT FOUND WINDOW : " + request.impersonationURL);
            var creating = browser.tabs.create({ "url": request.impersonationURL, "active": true });
            creating.then(function (tab) {
                var winCreating = browser.windows.create({ "tabId": tab.id, "left": window.screen.width/2, "top" : 0, "height" : window.screen.height, "width" : window.screen.width/2 });
                winCreating.then(function (w_window) {
                    console.log("inside NOT FOUND WINDOW winCREATING : " + tab.id + ", " + request.impersonationURL);
                    if (request.openDP) {
                        onDPTabCreated(tab, w_window.id)
                    } else {
                        onDirectTabCreated(tab, request.targetURL);
                    }
                    GLOBALWINDOWMAP.set(request.impersonationURL, w_window.id)
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
    } else if (request.action == 'refresh_current_tab') {
        browser.tabs.query({ currentWindow: true, active: true }).then(function (tabs) {
            browser.tabs.update(tabs[0].id, { url: request.impersonationURL });
            console.log("REDIRECTING TO : " + request.targetURL);
            console.dir(tabs);
            onDirectTabCreated(tabs[0], request.targetURL);
        }, onError);
    }
});