GLOBALUSEWIN = true;

var jsInitChecktimer = setInterval(checkForJS_Finish, 7000); //needs to use timer to wait as AJAX operations does not refresh URL and hence unable to rely on change in URL to trigger changes
var GLOBALMAP = new Map(); // to keep track of corresponding IMPERSONATION for URL

function checkForJS_Finish() {

    var anchorTags, visitorEmailElem;

    if (document.getElementsByClassName("zd-comment").length > 0) {
        //clearInterval(jsInitChecktimer); //

        anchorTags = document.getElementsByTagName('a'); // extracts all ANCHOR tag in document
        for (var k = 0; k < anchorTags.length; k++) {
            if (anchorTags[k].href.indexOf('mailto') !== -1) {
                var fields = anchorTags[k].href.split(':');
                anchorTags[k].href = "https://internal.bittitan.com/Impersonate/" + fields[1];
                anchorTags[k].addEventListener('click', sendClickEventToBackground);
            } else if ((/(migrationwiz|manage)\.bittitan\.com/i).test(anchorTags[k].href)) { // test for manage and migrationwiz links; search for REGEX 2 to update if changes; REGEX 1
                anchorTags[k].addEventListener('click', sendClickEventToBackground);
            }
        }
        var regextSearchAccountBlock = /<strong>Account Name[\s\S]+?<p dir="auto">/gi;
        var regexSearchImpersonationEmail = /<strong>Account Name.*href=\"https:.*\/Impersonate\/(\S+)\"/i;
        var foundAccountBlock = new XMLSerializer().serializeToString(document).match(regextSearchAccountBlock);

        if (foundAccountBlock != null) {
            foundAccountBlock.forEach(extractImpersonationIDandLinkstoMap);
        }
        console.log("++++++++GLOBALMAP+++++++++++");
        console.dir(GLOBALMAP);
        //console.log(new XMLSerializer().serializeToString(document));
    }

    var visitorEmailElem = document.getElementsByClassName('meshim_dashboard_components_chatPanel_VisitorInfoTextField visitor_email info');
    if (visitorEmailElem.lenth > 0 && visitorEmailElem !== null && (typeof visitorEmailElem !== 'undefined')) { // check for chat window popup
        console.log("Found CHAT Window");
        console.dir(visitorEmailElem);

        if (document.getElementsByClassName('impersonation_link_class')[0] == null) {
            var link = document.createElement('a');
            link.className = 'impersonation_link_class';
            link.setAttribute('href', 'https://internal.bittitan.com/Impersonate/' + visitorEmailElem.value);
            //link.setAttribute('target', '_blank');
            //link.setAttribute('onclick', 'window.open(this.href)');
            link.addEventListener('click', sendClickEventToBackground);
            link.innerHTML = "Impersonate";
            visitorEmailElem.parentElement.appendChild(link);
        } else {
            document.getElementsByClassName('impersonation_link_class')[0].setAttribute('href', 'https://internal.bittitan.com/Impersonate/' + visitorEmailElem.value);
            document.getElementsByClassName('impersonation_link_class')[0].addEventListener('click', sendClickEventToBackground);
        }
    }

    /* 
    else { //clears old impersonation information
        if (document.getElementsByClassName('impersonation_link_class')[0] !== null && (typeof document.getElementsByClassName('impersonation_link_class')[0] !== 'undefined')) {
            document.getElementsByClassName('impersonation_link_class')[0].setAttribute('href', '');
        }
    }
    */

    var replacedImpersonationLink = false;
    var impersonateNodeList = document.querySelectorAll('.alert_message');
    if (!replacedImpersonationLink && impersonateNodeList.length > 0 && impersonateNodeList !== null && (typeof impersonateNodeList !== 'undefined')) {
        console.log("Found Selector");
        console.dir(impersonateNodeList);
        var fields = impersonateNodeList[0].innerText.split(':');
        var element = document.createElement("div");
        element.setAttribute('class','alert_message');
var element2 = document.createElement("a");
element2.setAttribute('href','#');
element2.appendChild(document.createTextNode("Click to refresh current tab as : " + fields[1].trim()));
element.appendChild(element2);


        
        var impersonateElem = impersonateNodeList[0];
        element.addEventListener('click', refreshCurrentTab);
        impersonateElem.replaceWith(element);
        replacedImpersonationLink = true;
        console.log("HREF : " + window.location.href);
        console.log("Email : " + fields[1].trim() + "+++");
        console.log("InnerHTML : " + impersonateNodeList[0].innerHTML);
        console.log("InnerText : " + impersonateNodeList[0].innerText);
        impersonateNodeList[0].addEventListener('click', refreshCurrentTab);
    } else { console.log("Selector not found !!!!"); }
}

function extractImpersonationIDandLinkstoMap(accountBlock) {
    var regexSearchHREF = /<a href=\"(\S+)\"/gi;

    var foundHREF = regexSearchHREF.exec(accountBlock);
    var count = 1;
    var impersonationIDForBlock = "";

    console.log("+++++++++++++++++++++++++++++++++++++\n");
    while (foundHREF != null) {
        if (count === 1) {
            //impersonationIDForBlock = foundHREF[1].split(`https://internal.bittitan.com/Impersonate/`)[1];
            impersonationIDForBlock = foundHREF[1];
            count++;
        } else {
            GLOBALMAP.set(foundHREF[1], impersonationIDForBlock);
        }
        console.log(impersonationIDForBlock);
        console.dir(foundHREF);
        foundHREF = regexSearchHREF.exec(accountBlock);
    }
}

document.addEventListener('contextmenu', checkContextMenuTarget);

function checkContextMenuTarget(event) {
    // handles right mouse click here
    var href = event.target.href || event.target.parentNode.href;
    if (href != undefined) { // let context menu pops if not clicked on link
        if ((/internal\.bittitan\.com/i).test(href) && !event.ctrlKey) {
            console.log("internal bittitan detected !!!" + href);
            event.preventDefault();
            event.stopPropagation();
            if (GLOBALUSEWIN) {
                browser.runtime.sendMessage({ action: 'open_new_window', impersonationURL: event.target.href, openDP: true });
            } else {
                browser.runtime.sendMessage({ action: 'open_dp_tab', impersonationURL: event.target.href });
            }
        }
    }
    console.log("ContextMenu's target href : " + href);
}

function refreshCurrentTab(e) {
    console.dir(e.target);
    var fields = e.target.innerText.split(':');
    
    browser.runtime.sendMessage({action: 'refresh_current_tab', impersonationURL: 'https://internal.bittitan.com/Impersonate/'+fields[1].trim(), targetURL: window.location.href});
}

function sendClickEventToBackground(e) {
    // only left mouse click event will hit this fuction
    if (!e.ctrlKey) { // if CTRL Key is pressed, do not redirect the link, process normally
        console.log("---NO CONTROL KEY PRESSED UNDEFINED---");
        if (e.target.href.indexOf('internal.bittitan.com') >= 0) // if IMPERSONATION link, redirects to MigrationWiz main page
        {
            console.log("---Detected INTERNA BITTITAN COM---");
            e.stopPropagation();
            e.preventDefault();
            if (GLOBALUSEWIN) {
                browser.runtime.sendMessage({ action: 'open_new_window', impersonationURL: e.target.href, targetURL: "https://migrationwiz.bittitan.com/app/", openDP: false });
            } else {
                browser.runtime.sendMessage({ action: 'open_direct_tab', impersonationURL: e.target.href, targetURL: "https://migrationwiz.bittitan.com/app/" });
            }
        } else if ((/(migrationwiz|manage)\.bittitan\.com/i).test(e.target.href)) { // test for manage and migrationwiz links; search for REGEX 1 to update if changes; REGEX 2
            console.log("---Detected MIGRATIONWIZ OR MANAGE BITTITAN COM---");
            impersonationHREF = GLOBALMAP.get(e.target.href);
            if (impersonationHREF != undefined) { // found a corresponding IMPERSONATION ID for HREF
                console.log("---IMPERSONATE HREF NOT UNDEFINED---");
                e.stopPropagation();
                e.preventDefault();
                if (GLOBALUSEWIN) {
                    browser.runtime.sendMessage({ action: 'open_new_window', impersonationURL: impersonationHREF, targetURL: e.target.href, openDP: false });
                } else {
                    browser.runtime.sendMessage({ action: 'open_direct_tab', impersonationURL: impersonationHREF, targetURL: e.target.href });
                }
            }
        }
    }
}