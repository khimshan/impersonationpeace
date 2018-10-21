var jsInitChecktimer = setInterval(checkForJS_Finish, 2000); //needs to use timer to wait as AJAX operations does not refresh URL and hence unable to rely on change in URL to trigger changes

function checkForJS_Finish() {

    var anchorTags, visitorEmailElem;
    
    if (document.getElementsByClassName("zd-comment").length > 0) {
        //clearInterval(jsInitChecktimer); //

        anchorTags = document.getElementsByTagName('a'); // extracts all ANCHOR tag in document
        for (var k = 0; k < anchorTags.length; k++) {
            if (anchorTags[k].href.indexOf('mailto') !== -1) {
                var fields = anchorTags[k].href.split(':');
                anchorTags[k].href = "https://internal.bittitan.com/Impersonate/" + fields[1];
            }
        }

    } else { // check for chat window popup
        visitorEmailElem = document.getElementsByClassName('meshim_dashboard_components_chatPanel_VisitorInfoTextField visitor_email info')[0];

        if (visitorEmailElem !== null && (typeof visitorEmailElem !== 'undefined')) {
            if (document.getElementsByClassName('impersonation_link_class')[0] == null) {
                var link = document.createElement('a');
                link.className = 'impersonation_link_class';
                link.setAttribute('href', 'https://internal.bittitan.com/Impersonate/'+ visitorEmailElem.value);
                //link.setAttribute('target', '_blank');
                link.setAttribute('onclick', 'window.open(this.href)');
                link.innerHTML = "Impersonate";
                visitorEmailElem.parentElement.appendChild(link);
            } else
            {
                document.getElementsByClassName('impersonation_link_class')[0].setAttribute('href', 'https://internal.bittitan.com/Impersonate/'+ visitorEmailElem.value);
            }
        } else { //clears old impersonation information
            if (document.getElementsByClassName('impersonation_link_class')[0] !== null && (typeof document.getElementsByClassName('impersonation_link_class')[0] !== 'undefined')) {
                document.getElementsByClassName('impersonation_link_class')[0].setAttribute('href', '');
            }
        }
    }
}