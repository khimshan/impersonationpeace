GLOBALUSEWIN = true;

var jsInitChecktimer = setInterval(checkForJS_Finish, 2000); //needs to use timer to wait as AJAX operations does not refresh URL and hence unable to rely on change in URL to trigger changes
var timerCountIntervalArray = [];
var numOfTimer = 0;
var numOfTimerElement = 0;

var GLOBALTIMERMAP = new Map();
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

function initializeTimer(elemTimeCount, parsedStartTime)
{
    //var clock = document.getElementsByClassName(className);

    function updateClock()
    {
        var t = getTimePassed(parsedStartTime);
        elemTimeCount.innerHTML = "<br>Mins:&nbsp;" + ('0' + t.minutes).slice(-2) + "&nbsp;Sec:&nbsp;" + ('0' + t.seconds).slice(-2);
    }

    timerCountIntervalArray[numOfTimer] = setInterval(updateClock, 1000);
    numOfTimer++;
}

function checkForJS_Finish()
{
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
        var foundAccountBlock = new XMLSerializer().serializeToString(document).match(regextSearchAccountBlock);

        if (foundAccountBlock != null)
        {
            foundAccountBlock.forEach(extractImpersonationIDandLinkstoMap);
        }
    }

    if (document.querySelectorAll('.chat_panel.active').length > 0)
    {
        var visitorEmailElem = document.getElementsByClassName('meshim_dashboard_components_chatPanel_VisitorInfoTextField visitor_email info');
        if (visitorEmailElem.length > 0 && visitorEmailElem !== null && (typeof visitorEmailElem !== 'undefined'))
        { // check for chat window popup
            var elemImpersonationLinkClass = document.getElementsByClassName('impersonation_link_class');

            if (GLOBALTIMERMAP.get(visitorEmailElem[0].value) == undefined || 0 == elemImpersonationLinkClass.length || elemImpersonationLinkClass[0] == null || elemImpersonationLinkClass[0] == undefined)
            {
                var link = document.createElement('a');
                link.className = 'impersonation_link_class';
                link.setAttribute('href', 'https://internal.bittitan.com/Impersonate/' + visitorEmailElem[0].value);
                link.addEventListener('click', sendClickEventToBackground);
                link.innerHTML = "Impersonate";

                var elemTimeCount = document.createElement('span');
                elemTimeCount.className = 'impersonation_timecount';
                elemTimeCount.innerHTML = "<br>Mins:&nbsp;" + "00" + "&nbsp;Sec:&nbsp;" + "00";
                elemTimeCount.style.fontSize = "0.8em";

                visitorEmailElem[0].parentElement.appendChild(link);
                visitorEmailElem[0].parentElement.appendChild(elemTimeCount);

                GLOBALTIMERMAP.set(visitorEmailElem[0].value, elemTimeCount);

                var parsedStartTime = Date.parse(new Date());
                initializeTimer(elemTimeCount, parsedStartTime);
            } else
            {
                elemImpersonationLinkClass[0].setAttribute('href', 'https://internal.bittitan.com/Impersonate/' + visitorEmailElem[0].value);
            }
        }
    } else
    { //clears old impersonation information
        if (document.querySelectorAll('.impersonation_link_class').length > 0 && document.querySelectorAll('.jx_ui_html_div.wrapper').length == 0)
        {
            for (i = 0; i < timerCountIntervalArray.length; i++)
            {
                clearInterval(timerCountIntervalArray[i]);
            }
            timerCountIntervalArray = [];
            numOfTimer = 0;
            numOfTimerElement = 0;
            GLOBALTIMERMAP - new Map();

            var elements = document.getElementsByClassName('impersonation_timecount');
            while (elements.length > 0)
            {
                elements[0].parentNode.removeChild(elements[0]);
            }

            elements = document.getElementsByClassName('impersonation_link_class');
            while (elements.length > 0)
            {
                elements[0].parentNode.removeChild(elements[0]);
            }
        }
    }

    var checkUpdateAlertOrNot = document.querySelectorAll('.dont_update_alert_message');
    if (checkUpdateAlertOrNot.length == 0)
    { // Alert message has not been updated
        var impersonateNodeList = document.querySelectorAll('.alert_message');
        if (impersonateNodeList.length > 0 && impersonateNodeList !== null && (typeof impersonateNodeList !== 'undefined'))
        {
            var impersonateElem = impersonateNodeList[0];

            var fields = impersonateElem.innerText.split(':');

            var sending = browser.runtime.sendMessage({ action: 'getTabImpersonationId', detectedImpersonationID: fields[1].trim() });
            sending.then(function (tagged_id)
            {
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

            }, function (error) { console.error(error); });

        }
    }
}

function extractImpersonationIDandLinkstoMap(accountBlock)
{
    var regexSearchHREF = /<a href=\"(\S+)\"/gi;

    var foundHREF = regexSearchHREF.exec(accountBlock);
    var count = 1;
    var impersonationIDForBlock = "";

    while (foundHREF != null)
    {
        if (count === 1)
        {
            impersonationIDForBlock = foundHREF[1];
            count++;
        } else
        {
            GLOBALMAP.set(foundHREF[1], impersonationIDForBlock);
        }
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
}

function refreshCurrentTab(e)
{
    browser.runtime.sendMessage({ action: 'refresh_current_tab', impersonationURL: 'https://internal.bittitan.com/Impersonate/' + e.target.innerText, targetURL: window.location.href });
}

function sendClickEventToBackground(e)
{
    // only left mouse click event will hit this fuction
    if (!e.ctrlKey)
    { // if CTRL Key is pressed, do not redirect the link, process normally
        if (e.target.href.indexOf('internal.bittitan.com') >= 0) // if IMPERSONATION link, redirects to MigrationWiz main page
        {
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
            impersonationHREF = GLOBALMAP.get(e.target.href);
            if (impersonationHREF != undefined)
            { // found a corresponding IMPERSONATION ID for HREF
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