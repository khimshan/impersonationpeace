GLOBALUSEWIN = true;

var jsInitChecktimer = setInterval(checkForJS_Finish, 2000); //needs to use timer to wait as AJAX operations does not refresh URL and hence unable to rely on change in URL to trigger changes
var timeCountInterval;

var GLOBALMAP = new Map(); // to keep track of corresponding IMPERSONATION for URL
var GLOBALTABID = new Map(); // to keep track of correcponding IMPERSONATION ID per tab opened

function getTimePassed(parsedStartTime)
{
    var t = Date.parse(new Date()) - parsedStartTime;
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}

function initializeTimer(className, parsedStartTime)
{
    console.log("++++++++ Initialized Timer Count +++++++++++");
    var clock = document.getElementsByClassName(className);

    function updateClock()
    {
        console.dir(clock);
        var t = getTimePassed(parsedStartTime);
        clock[0].innerHTML = "<br>Mins:&nbsp;" + ('0' + t.minutes).slice(-2) + "&nbsp;Sec:&nbsp;" + ('0' + t.seconds).slice(-2);
        console.log("++++++++ Timer Count Per Second : " + t.minutes + " Sec: " + t.seconds);
    }

    timeCountInterval = setInterval(updateClock, 1000);
}

function checkForJS_Finish()
{
    console.log("Impersonation Peace Extension RUNNING... ... ...");
    var anchorTags, visitorEmailElem;

    if (document.getElementsByClassName("zd-comment").length > 0)
    {
        //clearInterval(jsInitChecktimer); //
        anchorTags = document.getElementsByTagName('a'); // extracts all ANCHOR tag in document 
        for (var k = 0; k < anchorTags.length; k++)
        {
            if (anchorTags[k].href.indexOf('mailto') !== -1)
            {
                var fields = anchorTags[k].href.split(':');
                anchorTags[k].href = "https://internal.bittitan.com/Impersonate/" + fields[1];
                anchorTags[k].addEventListener('click', sendClickEventToBackground);
            } else if ((/(migrationwiz|manage|internal)\.bittitan\.com/i).test(anchorTags[k].href))
            { // test for manage and migrationwiz links; search for REGEX 2 to update if changes; REGEX 1
                anchorTags[k].addEventListener('click', sendClickEventToBackground);
            }
        }
        var regextSearchAccountBlock = /<strong>Account Name[\s\S]+?<p dir="auto">/gi;
        //var regexSearchImpersonationEmail = /<strong>Account Name.*href=\"https:.*\/Impersonate\/(\S+)\"/i;
        var foundAccountBlock = new XMLSerializer().serializeToString(document).match(regextSearchAccountBlock);
        //console.log(new XMLSerializer().serializeToString(document));

        if (foundAccountBlock != null)
        {
            foundAccountBlock.forEach(extractImpersonationIDandLinkstoMap);
        }
        console.log("++++++++GLOBALMAP+++++++++++");
        console.dir(GLOBALMAP);
        //console.log(new XMLSerializer().serializeToString(document));
    }

    if (document.querySelectorAll('.chat_panel.active').length > 0)
    {
        var visitorEmailElem = document.getElementsByClassName('meshim_dashboard_components_chatPanel_VisitorInfoTextField visitor_email info');
        if (visitorEmailElem.length > 0 && visitorEmailElem !== null && (typeof visitorEmailElem !== 'undefined'))
        { // check for chat window popup
            console.log("Found CHAT Window");
            //console.dir(visitorEmailElem);

            var elemImpersonationLinkClass = document.getElementsByClassName('impersonation_link_class');
            console.log("------------- START OF elemImpersonationLinkClass ----------");
            console.dir(elemImpersonationLinkClass)
            console.log("------------- END OF elemImpersonationLinkClass ----------");

            if (0 == elemImpersonationLinkClass.length || elemImpersonationLinkClass[0] == null || elemImpersonationLinkClass[0] == undefined)
            {
                console.log("impersonation_link_class is NULL");

                var link = document.createElement('a');
                link.className = 'impersonation_link_class';
                link.setAttribute('href', 'https://internal.bittitan.com/Impersonate/' + visitorEmailElem[0].value);
                //link.setAttribute('target', '_blank');
                //link.setAttribute('onclick', 'window.open(this.href)');
                link.addEventListener('click', sendClickEventToBackground);
                link.innerHTML = "Impersonate";

                var elemTimeCount = document.createElement('span');
                elemTimeCount.className = 'impersonation_timecount';
                elemTimeCount.innerHTML = "<br>Mins:&nbsp;" + "00" + "&nbsp;Sec:&nbsp;" + "00";
                elemTimeCount.style.fontSize = "0.8em";

                console.log("visitorEmailElem pareentElement");
                console.dir(visitorEmailElem[0].parentElement);

                visitorEmailElem[0].parentElement.appendChild(link);
                visitorEmailElem[0].parentElement.appendChild(elemTimeCount);
                console.log("appendChild to PARENTELEMENT");

                var parsedStartTime = Date.parse(new Date());
                initializeTimer("impersonation_timecount", parsedStartTime);
            } else
            {
                console.log("visitorEmailElem value : " + visitorEmailElem[0].value);
                elemImpersonationLinkClass[0].setAttribute('href', 'https://internal.bittitan.com/Impersonate/' + visitorEmailElem[0].value);
                //document.getElementsByClassName('impersonation_link_class')[0].addEventListener('click', sendClickEventToBackground);
            }
        }
    } else
    { //clears old impersonation information
        if (document.querySelectorAll('.impersonation_link_class').length > 0)
        {
            console.log("<> impersonation_link_class FOUND. <>");

            clearInterval(timeCountInterval);

            var elements = document.getElementsByClassName('impersonation_timecount');
            while (elements.length > 0)
            {
                elements[0].parentNode.removeChild(elements[0]);
            }

            elements = document.getElementsByClassName('impersonation_link_class');
            while (elements.length > 0)
            {
                console.log("elements :");
                console.dir(elements);

                console.log("elements[0].parentNode :");
                console.dir(elements[0].parentNode);
                elements[0].parentNode.removeChild(elements[0]);
            }
        } else { console.log("<> impersonation_link_class not found. <>"); }
    }
    /* 
    else { //clears old impersonation information
        if (document.getElementsByClassName('impersonation_link_class')[0] !== null && (typeof document.getElementsByClassName('impersonation_link_class')[0] !== 'undefined')) {
            document.getElementsByClassName('impersonation_link_class')[0].setAttribute('href', '');
        }
    }
    */

    var checkUpdateAlertOrNot = document.querySelectorAll('.dont_update_alert_message');
    if (checkUpdateAlertOrNot.length == 0)
    { // Alert message has not been updated

        var impersonateNodeList = document.querySelectorAll('.alert_message');
        if (impersonateNodeList.length > 0 && impersonateNodeList !== null && (typeof impersonateNodeList !== 'undefined'))
        {
            console.log("Found Selector");
            console.dir(impersonateNodeList);

            var impersonateElem = impersonateNodeList[0];

            var fields = impersonateElem.innerText.split(':');

            var sending = browser.runtime.sendMessage({ action: 'getTabImpersonationId', detectedImpersonationID: fields[1].trim() });
            sending.then(function (tagged_id)
            {
                console.info("Returned TAGGED value : " + tagged_id);
                var div_element = document.createElement("div");
                div_element.setAttribute('class', 'alert_message dont_update_alert_message');
                var span_element = document.createElement("span");
                span_element.textContent = "Refresh current tab as : ";

                var current_impersonation_element = document.createElement("a");
                current_impersonation_element.appendChild(document.createTextNode(fields[1].trim()));
                current_impersonation_element.addEventListener('click', refreshCurrentTab);

                span_element.appendChild(current_impersonation_element);

                if (fields[1].trim().toUpperCase() != tagged_id.toUpperCase())
                {
                    var textNode1 = document.createTextNode(" (current) - ");
                    span_element.appendChild(textNode1);

                    var tagged_impersonation_element = document.createElement("a");
                    tagged_impersonation_element.appendChild(document.createTextNode(tagged_id));
                    tagged_impersonation_element.addEventListener('click', refreshCurrentTab);

                    span_element.appendChild(tagged_impersonation_element);

                    var textNode2 = document.createTextNode(" (tagged) ");
                    span_element.appendChild(textNode2);
                }

                var anchor_element;
                var arrayLinkNames = ["CUS", "DPP", "LIC", "HLP", "MGW"];
                var arrayLinkHREF = [
                    "https://manage.bittitan.com/customers",
                    "https://manage.bittitan.com/device-management/deploymentpro",
                    "https://manage.bittitan.com/settings/licenses",
                    "https://help.bittitan.com/hc",
                    "https://migrationwiz.bittitan.com/app/"
                ];

                span_element.appendChild(document.createTextNode(" "));

                for (i = 0; i < arrayLinkNames.length; i++)
                {
                    span_element.appendChild(document.createTextNode(" "));
                    anchor_element = document.createElement("a");
                    anchor_element.textContent = arrayLinkNames[i];
                    anchor_element.href = arrayLinkHREF[i];
                    anchor_element.setAttribute('target', '_blank');
                    span_element.appendChild(anchor_element);
                }

                div_element.appendChild(span_element);
                impersonateElem.replaceWith(div_element);
                console.log("impersonateElem REPLACED !");

            }, function (error) { console.error(error); });

            //element.addEventListener('click', refreshCurrentTab);

            console.log("HREF : " + window.location.href);
            console.log("Email : " + fields[1].trim() + "+++");
            console.log("InnerHTML : " + impersonateNodeList[0].innerHTML);
            console.log("InnerText : " + impersonateNodeList[0].innerText);
            //impersonateNodeList[0].addEventListener('click', refreshCurrentTab);
        } else { console.log("Selector not found !!!!"); }
    } else { console.dir(checkUpdateAlertOrNot); console.log("checkUpdateAlertOrNot SELECTOR LENGTH NE 0 !!!!"); }
}

function extractImpersonationIDandLinkstoMap(accountBlock)
{
    var regexSearchHREF = /<a href=\"(\S+)\"/gi;

    var foundHREF = regexSearchHREF.exec(accountBlock);
    var count = 1;
    var impersonationIDForBlock = "";

    console.log("+++++++++++++++++++++++++++++++++++++\n");
    while (foundHREF != null)
    {
        if (count === 1)
        {
            //impersonationIDForBlock = foundHREF[1].split(`https://internal.bittitan.com/Impersonate/`)[1];
            impersonationIDForBlock = foundHREF[1];
            count++;
        } else
        {
            GLOBALMAP.set(foundHREF[1], impersonationIDForBlock);
        }
        console.log(impersonationIDForBlock);
        console.dir(foundHREF);
        foundHREF = regexSearchHREF.exec(accountBlock);
    }
}

document.addEventListener('contextmenu', checkContextMenuTarget);

function checkContextMenuTarget(event)
{
    // handles right mouse click here
    var href = event.target.href || event.target.parentNode.href;
    if (href != undefined)
    { // let context menu pops if not clicked on link
        if ((/internal\.bittitan\.com/i).test(href) && !event.ctrlKey)
        {
            console.log("Right click internal bittitan detected !!!" + href);
            event.preventDefault();
            event.stopPropagation();
            if (GLOBALUSEWIN)
            {
                browser.runtime.sendMessage({ action: 'open_new_window', impersonationURL: event.target.href, openDP: true });
            } else
            {
                browser.runtime.sendMessage({ action: 'open_dp_tab', impersonationURL: event.target.href });
            }
        }
    }
    console.log("ContextMenu's target href : " + href);
}

function refreshCurrentTab(e)
{
    console.dir(e.target);
    //var fields = e.target.innerText.split(':');
    //var fields = e.target.innerText;

    browser.runtime.sendMessage({ action: 'refresh_current_tab', impersonationURL: 'https://internal.bittitan.com/Impersonate/' + e.target.innerText, targetURL: window.location.href });
}

function sendClickEventToBackground(e)
{
    // only left mouse click event will hit this fuction
    if (!e.ctrlKey)
    { // if CTRL Key is pressed, do not redirect the link, process normally
        console.log("---NO CONTROL KEY PRESSED UNDEFINED---");
        if (e.target.href.indexOf('internal.bittitan.com') >= 0) // if IMPERSONATION link, redirects to MigrationWiz main page
        {
            console.log("---Left Click Detected INTERNA BITTITAN COM---" + e.target.href);
            e.stopPropagation();
            e.preventDefault();
            if (GLOBALUSEWIN)
            {
                browser.runtime.sendMessage({ action: 'open_new_window', impersonationURL: e.target.href, targetURL: "https://migrationwiz.bittitan.com/app/", openDP: false });
            } else
            {
                browser.runtime.sendMessage({ action: 'open_direct_tab', impersonationURL: e.target.href, targetURL: "https://migrationwiz.bittitan.com/app/" });
            }
        } else if ((/(migrationwiz|manage)\.bittitan\.com/i).test(e.target.href))
        { // test for manage and migrationwiz links; search for REGEX 1 to update if changes; REGEX 2
            console.log("---Detected MIGRATIONWIZ OR MANAGE BITTITAN COM---");
            impersonationHREF = GLOBALMAP.get(e.target.href);
            if (impersonationHREF != undefined)
            { // found a corresponding IMPERSONATION ID for HREF
                console.log("---IMPERSONATE HREF NOT UNDEFINED---");
                e.stopPropagation();
                e.preventDefault();
                if (GLOBALUSEWIN)
                {
                    browser.runtime.sendMessage({ action: 'open_new_window', impersonationURL: impersonationHREF, targetURL: e.target.href, openDP: false });
                } else
                {
                    browser.runtime.sendMessage({ action: 'open_direct_tab', impersonationURL: impersonationHREF, targetURL: e.target.href });
                }
            }
        }
    }
}

/*
browser.runtime.onMessage.addListener(function (request)
{
    console.log("Message from the background script:");
    console.log(request.ping);
    return Promise.resolve({ pong : "Pong" });
});
*/