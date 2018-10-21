// URLOBJECT will be 'undefined' during initialization 
// Execute code only after initialization
if (typeof URLOBJECT != 'undefined')
{
  ExtractFormattedTextBasedOnURL();
}

// Function to create temporary element on page to use for copying content to clipboard
function CopyTextToClipboard(text)
{
  const input = document.createElement('textarea');
  input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.focus();
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
}

// Function to extract IMPERSONATION Account ID
function ExtractImpersonationAccountID()
{
  var elmAccountName = document.getElementsByClassName("top-banner is-warning")[0];

  // If user has not impersonate account, there will not be account inforamtion, replace with "*"
  if (elmAccountName == null)
  {
    return "*******";
  } else
  {
    return elmAccountName.innerText.split(':')[1].trim();
  }
}

// Function to extract formatted information for MigrationWiz project and line item(s)
function ExtractFormattedTextFromMW() 
{
  var FormattedTextObject = {};
  var itemCount = 0;
  var txtProblemStatement, txtAccountName, txtStaticAccountName, txtStaticAccountNameLink, nodelistWorkGroup, txtStaticWorkGroupName, txtStaticWorkGroupNameBold, txtProjecName, txtStaticProjectName, txtStaticProjectNameBold, txtStaticItemNames, txtStaticItemNamesBold, txtStaticEndText, txtItemNameForInternal, txtItemNameForCustomer;

  txtAccountName = ExtractImpersonationAccountID();

  txtProblemStatement = "**Problem Statement**\n\n**Customer Data**\n";

  txtStaticAccountNameLink = "Impersonation Account: " + txtAccountName + "\n";
  txtStaticAccountNameLink = txtStaticAccountNameLink + "Impersonation Link: " + "https://internal.bittitan.com/Impersonate/" + txtAccountName + "\n";
  txtStaticAccountName = "**Account Name:** " + txtAccountName + "\n";

  nodelistWorkGroup = document.querySelectorAll('.select-workgroup_current-workgroup');
  if (typeof nodelistWorkGroup[0] != 'undefined')
  {
    txtStaticWorkGroupName = "Workgroup Name: " + nodelistWorkGroup[0].innerHTML.trim() + "\n";
    txtStaticWorkGroupNameBold = "**Workgroup Name:** " + nodelistWorkGroup[0].innerHTML.trim() + "\n";
  }
  txtProjecName = document.getElementById("nav-breadcrumb").innerText.trim();
  txtStaticProjectName = "Project Name: " + txtProjecName + "\n";
  txtStaticProjectName = txtStaticProjectName + "Project Link: " + URLOBJECT.urlText + "\n";
  txtStaticProjectNameBold = "**Project Name:** " + "[" + txtProjecName + "]" + "(" + URLOBJECT.urlText + ")\n";

  // Extract all checked box elements (line item)
  var chkbox = document.querySelectorAll('.td:nth-child(1)'), x;
  txtItemNameForInternal = '';
  txtItemNameForCustomer = '';
  txtStaticItemNames = '';
  txtStaticItemNamesBold = '';
  itemCount = 0;

  // Format text for line items if not empty
  if (typeof chkbox[0] != 'undefined' & chkbox != null) 
  {
    for (x = 0; x < chkbox.length; ++x)
    {

      if (chkbox[x].childNodes[2].checked == true)
      {
        itemCount++;
        var rows = document.querySelectorAll('.select-category+ .truncate .ember-view'), i;
        for (i = 0; i <= x; i++)
        {
          if (i === x)
          {
            // To cater for Public Folder SPLIT project where all item names are "/"
            txtItemNameCheckForSlash = rows[i].innerHTML.trim();
            if (txtItemNameCheckForSlash === "/")
            {
              txtItemNameCheckForSlash = "Line Item " + (i + 1) + " - \"/\"";
            }
            txtItemNameForInternal = txtItemNameForInternal + txtItemNameCheckForSlash + " - Link: " + rows[i].href.trim() + "\n";
            txtItemNameForCustomer = txtItemNameForCustomer + "[" + txtItemNameCheckForSlash + "]" + "(" + rows[i].href.trim() + ")\n";
          }
        }
      }
    }
  }

  // Singular / plural text formatting
  if (itemCount === 1)
  {
    txtStaticItemNames = "Item affected :\n" + txtItemNameForInternal;
    txtStaticItemNamesBold = "**Item affected :** " + txtItemNameForCustomer;
  } else if (itemCount > 1)
  {
    txtStaticItemNames = "Items affected :\n" + txtItemNameForInternal;
    txtStaticItemNamesBold = "**Items affected :**\n" + txtItemNameForCustomer;
  }

  txtStaticEndText = "\n**Previous Actions**\n\n**Current Actions**\n\n**Next Steps**\n"

  FormattedTextObject = {
    txtProblemStatement: txtProblemStatement, txtAccountName: txtAccountName, txtStaticAccountName: txtStaticAccountName, txtStaticAccountNameLink: txtStaticAccountNameLink, nodelistWorkGroup: nodelistWorkGroup, txtStaticWorkGroupName: txtStaticWorkGroupName,
    txtStaticWorkGroupNameBold: txtStaticWorkGroupNameBold, txtProjecName: txtProjecName, txtStaticProjectName: txtStaticProjectName, txtStaticProjectNameBold: txtStaticProjectNameBold, txtStaticItemNames: txtStaticItemNames, txtStaticItemNamesBold: txtStaticItemNamesBold,
    txtStaticEndText: txtStaticEndText, txtItemNameForInternal: txtItemNameForInternal, txtItemNameForCustomer: txtItemNameForCustomer
  }

  return FormattedTextObject;
}

// Function to extract formatted information for KBs, Diagnostic page or MW Project based on URL detected
function ExtractFormattedTextBasedOnURL()
{
  // For KBs
  if (URLOBJECT.urlText.indexOf('help.bittitan.com') != -1)
  {
    if (URLOBJECT.urlText.indexOf('community') !== -1)
    {
      titleText = document.getElementById("DeltaPlaceHolderPageTitleInTitleArea").innerText.trim();
    } else if (URLOBJECT.urlText.indexOf('help.bittitan') !== -1)
    {
      titleText = document.getElementsByClassName("article-title")[0].innerText.trim();
    } else
    {
      titleText = document.getElementsByClassName("single_overview")[0].innerText.split('\n')[0].trim();
    }

    escapedTitleText = titleText.replace(/\[/g, '\\[');
    escapedTitleText = escapedTitleText.replace(/\]/g, '\\]');
    escapedUrlText = URLOBJECT.urlText.replace(/\(/g, '\\(');
    escapedUrlText = escapedUrlText.replace(/\)/g, '\\)');

    if (DOUBLECLICKCOUNT === 1)
    {
      CopyTextToClipboard('---------------\n' + titleText + ' : \n' + URLOBJECT.urlText + '\n---------------');
    } else
    {
      CopyTextToClipboard('[' + escapedTitleText + ']' + '(' + escapedUrlText + ')');
    }

  }

  // For DEPLOYMENTPRO page
  if (URLOBJECT.urlText.indexOf('manage.bittitan.com/device-managemen') != -1) 
  {
    var itemCount = 0;
    var txtUserEmail = '', txtUserDevicesRaw = '', txtUserDevices = '', txtCurrentTabName = '', txtStaticWorkGroupNameBold = '';

    txtAccountName = ExtractImpersonationAccountID();
    txtAccountNameBold = "**Account Name :** " + txtAccountName + "\n";

    //WorkGroup Name
    nodelistWorkGroup = document.querySelectorAll('.select-workgroup_current-workgroup');
    if (typeof nodelistWorkGroup[0] != 'undefined')
    {
      txtStaticWorkGroupNameBold = "**Workgroup Name:** " + nodelistWorkGroup[0].innerHTML.trim() + "\n";
    }

    //Current tab under Customer - USERS or COMPUTERS
    nodelistCurrentCustomerTab = document.querySelectorAll('.breadcrumbs_current');
    if (typeof nodelistCurrentCustomerTab[0] != 'undefined' & nodelistCurrentCustomerTab != null)
    {
      txtCurrentTabName = nodelistCurrentCustomerTab[0].innerHTML.trim();
    }

    //Customer Name
    nodelistCustomerName = document.querySelectorAll('.testing_select-customer-selection');
    if (typeof nodelistCustomerName[0] != 'undefined')
    {
      txtStaticCustomerNameBold = "**Customer Name:** " + "[" + nodelistCustomerName[0].innerHTML.trim() + " \\[" + txtCurrentTabName + "\\]" + "](" + URLOBJECT.urlText + ")" + "\n";
    }
    completeMWInformationText = txtAccountNameBold;
    completeMWInformationText = completeMWInformationText + txtStaticWorkGroupNameBold;
    completeMWInformationText = completeMWInformationText + txtStaticCustomerNameBold;
    console.log(completeMWInformationText);


    //Checkboxes
    nodelistCheckBoxes = document.querySelectorAll('.table_td .checkbox_field');

    // Format text for line items if not empty
    if (typeof nodelistCheckBoxes[0] != 'undefined' & nodelistCheckBoxes != null) 
    {
      for (x = 0; x < nodelistCheckBoxes.length; ++x)
      {
        if (nodelistCheckBoxes[x].checked == true)
        {
          itemCount++;
          var rows = document.querySelectorAll('.h-width-px-35+ .table_td'), i; //Primary Email Address
          var rowsUPN = document.querySelectorAll('.table_td:nth-child(3)');
          //var rowsLicense = document.querySelectorAll('.h-pointer .ember-view');
          var rowsLicense = document.querySelectorAll('.table_td:nth-child(4)');
          var rowsStatus = document.querySelectorAll('.table_td:nth-child(5)');

          for (i = 0; i <= x; i++)
          {
            console.log(i + " : " + rowsLicense[i].innerText);
            console.dir(rowsLicense[i]);
            if (i === x)
            {
              txtUserEmail = txtUserEmail + rows[i].innerText.trim() + " [UPN:" + rowsUPN[i].innerText + ", License:" + rowsLicense[i].innerText + ", Status:" + rowsStatus[i].innerText+ "]" + "\n";
              console.dir(rowsLicense[i]);
            }
          }
        }
      }

      completeMWInformationText = txtAccountNameBold;
      completeMWInformationText = completeMWInformationText + txtStaticWorkGroupNameBold;
      completeMWInformationText = completeMWInformationText + txtStaticCustomerNameBold;

      if (itemCount === 1)
      {
        txtUserEmailBold = "**User:** " + txtUserEmail + "\n";
        completeMWInformationText = completeMWInformationText + txtUserEmailBold;
      } else if (itemCount != 0)
      {
        txtUserEmailBold = "**Users:** " + "\n" + txtUserEmail + "\n";
        completeMWInformationText = completeMWInformationText + txtUserEmailBold;
      }
    }
    CopyTextToClipboard(completeMWInformationText);
  }

  // For MSPC CUSTOMER page
  if (URLOBJECT.urlText.indexOf('manage.bittitan.com/customers') != -1) 
  {
    var itemCount = 0;
    var txtUserEmail = '', txtUserDevicesRaw = '', txtUserDevices = '', txtCurrentTabName = '', txtStaticWorkGroupNameBold = '';

    txtAccountName = ExtractImpersonationAccountID();
    txtAccountNameBold = "**Account Name :** " + txtAccountName + "\n";

    //WorkGroup Name
    nodelistWorkGroup = document.querySelectorAll('.select-workgroup_current-workgroup');
    if (typeof nodelistWorkGroup[0] != 'undefined')
    {
      txtStaticWorkGroupNameBold = "**Workgroup Name:** " + nodelistWorkGroup[0].innerHTML.trim() + "\n";
    }

    //Current tab under Customer - USERS or COMPUTERS
    nodelistCurrentCustomerTab = document.querySelectorAll('.breadcrumbs_current');
    if (typeof nodelistCurrentCustomerTab[0] != 'undefined' & nodelistCurrentCustomerTab != null)
    {
      txtCurrentTabName = nodelistCurrentCustomerTab[0].innerHTML.trim();
    }

    //Customer Name
    nodelistCustomerName = document.querySelectorAll('.breadcrumbs_link.active');
    if (typeof nodelistCustomerName[0] != 'undefined')
    {
      txtStaticCustomerNameBold = "**Customer Name:** " + "[" + nodelistCustomerName[0].innerHTML.trim() + " \\[" + txtCurrentTabName + "\\]" + "](" + URLOBJECT.urlText + ")" + "\n";
    }

    if (txtCurrentTabName.toUpperCase() === "USERS")
    { //USERS

      //Checkboxes
      nodelistCheckBoxes = document.querySelectorAll('.table_td .checkbox_field');

      // Format text for line items if not empty
      if (typeof nodelistCheckBoxes[0] != 'undefined' & nodelistCheckBoxes != null) 
      {
        for (x = 0; x < nodelistCheckBoxes.length; ++x)
        {
          if (nodelistCheckBoxes[x].checked == true)
          {
            itemCount++;
            var rows = document.querySelectorAll('.h-width-px-35+ .table_td'), i;
            var rowsDMA = document.querySelectorAll('.h-pointer:nth-child(5)');
            //var rowsLicense = document.querySelectorAll('.h-pointer .ember-view');
            var rowsLicense = document.querySelectorAll('.table_td:nth-child(6)');

            console.log(rowsDMA[0].innerText);

            for (i = 0; i <= x; i++)
            {
              console.log(i + " : " + rowsLicense[i].innerText);
              console.dir(rowsLicense[i]);
              if (i === x)
              {
                txtUserEmail = txtUserEmail + rows[i].innerText.trim() + " [DMA:" + rowsDMA[i].innerText + ", License:" + rowsLicense[i].innerText + "]" + "\n";
                console.dir(rowsLicense[i]);
              }
            }
          }
        }

        // Not Used; Try to get Device list regardless if there is any user selected
        nodelistUserDevice = document.querySelectorAll('.detail-panel_section:nth-child(4)');
        if (typeof nodelistUserDevice[0] != 'undefined' & nodelistUserDevice != null)
        {
          console.log("Inside txt user device");
          txtUserDevicesRaw = nodelistUserDevice[0].innerText;
          txtUserDevicesRaw = txtUserDevicesRaw.split('\n');
          console.log("outside txt user device : " + txtUserDevicesRaw[0]);
          for (x = 2; x < txtUserDevicesRaw.length; ++x)
          {
            console.log("txt user device : " + txtUserDevicesRaw[x]);
            tmptxtUserDevicesRaw = txtUserDevicesRaw[x].split('\t');
            txtUserDevices = txtUserDevices + tmptxtUserDevicesRaw[0] + ":" + tmptxtUserDevicesRaw[1] + "\n";
          }
        }

        completeMWInformationText = txtAccountNameBold;
        completeMWInformationText = completeMWInformationText + txtStaticWorkGroupNameBold;
        completeMWInformationText = completeMWInformationText + txtStaticCustomerNameBold;

        if (itemCount === 1)
        {
          if (txtUserDevices != '')
          {
            if (txtUserDevices.split('\n').length > 2)
            { //to cater for the additional \n added manually to text
              txtUserEmailBold = "**User:** " + txtUserEmail + "**Devices:** " + "\n" + txtUserDevices;
            } else
            {
              txtUserEmailBold = "**User:** " + txtUserEmail + "**Devices:** " + txtUserDevices;
            }
          } else
          {
            txtUserEmailBold = "**User:** " + txtUserEmail + "\n";
          }
          completeMWInformationText = completeMWInformationText + txtUserEmailBold;
        } else if (itemCount != 0)
        {
          txtUserEmailBold = "**Users:** " + "\n" + txtUserEmail + "\n";
          completeMWInformationText = completeMWInformationText + txtUserEmailBold;
        }
      }
    } else if (txtCurrentTabName.toUpperCase() === "COMPUTERS")
    { //COMPUTERS
      //window.alert("Inside Computer tab :" + txtCurrentTabName);
      txtComputerName = '';
      //Checkboxes
      nodelistCheckBoxes = document.querySelectorAll('.table_td .checkbox_field');

      // Format text for line items if not empty
      if (typeof nodelistCheckBoxes[0] != 'undefined' & nodelistCheckBoxes != null) 
      {
        for (x = 0; x < nodelistCheckBoxes.length; ++x)
        {
          console.dir(nodelistCheckBoxes[x]);
          if (nodelistCheckBoxes[x].checked == true)
          {
            //window.alert(nodelistCheckBoxes);
            //console.dir(nodelistCheckBoxes);

            itemCount++;
            var rows = document.querySelectorAll('.h-width-px-35+ .table_td'), i;
            var rowsHeartBeat = document.querySelectorAll('.table_tr .h-pointer:nth-child(3)');
            var rowsComputerStatus = document.querySelectorAll('.table_td:nth-child(4)');

            console.log(rowsHeartBeat[0].innerText);

            for (i = 0; i <= x; i++)
            {
              //console.log(i + " : " + rowsHeartBeat[i].innerText);
              //console.dir(rowsComputerStatus[i]);
              if (i === x)
              {
                txtComputerName = txtComputerName + rows[i].innerText.trim() + " [Heartbeat:" + rowsHeartBeat[i].innerText + ", Status:" + rowsComputerStatus[i].innerText + "]" + "\n";
                //window.alert(txtComputerName);
                //console.dir(rowsComputerStatus[i]);
              }
            }
          }
        }

        // Not implemented; Try to get User list regardless if there is any COMPUTER selected
        txtUserDetected = '';
        nodelistUserDetected = document.querySelectorAll('.base-table .table_td');
        if (nodelistUserDetected != null & typeof nodelistUserDetected[0] != 'undefined')
        {
          for (var i = 0; i < nodelistUserDetected.length; i++)
          {
            if (nodelistUserDetected[i].innerText.trim() != '')
            {
              txtUserDetected = txtUserDetected + nodelistUserDetected[i].innerText + "\n";
            }
          }
          //window.alert(txtUserDetected);
        }

        completeMWInformationText = txtAccountNameBold;
        completeMWInformationText = completeMWInformationText + txtStaticWorkGroupNameBold;
        completeMWInformationText = completeMWInformationText + txtStaticCustomerNameBold;

        if (itemCount === 1)
        {
          if (txtUserDetected != '')
          {
            txtComputerNameBold = "**Computer:** " + txtComputerName + "**User(s):** " + txtUserDetected;
          } else
          {
            txtComputerNameBold = "**Computer:** " + txtComputerName + "\n";
          }
          completeMWInformationText = completeMWInformationText + txtComputerNameBold;
        } else if (itemCount != 0)
        {
          txtComputerNameBold = "**Computers:** " + "\n" + txtComputerName + "\n";
          completeMWInformationText = completeMWInformationText + txtComputerNameBold;
        }
      }
    }
    //window.alert(completeMWInformationText);
    CopyTextToClipboard(completeMWInformationText);
  }

  // For MigrationWiz page
  if (URLOBJECT.urlText.indexOf('migrationwiz.bittitan.com') != -1)
  {
    // For MW projects
    var FTObject = ExtractFormattedTextFromMW();

    if (URLOBJECT.urlText.split("/").length - 1 === 5)
    {
      // Project Level
      var completeMWInformationText = '';

      if (DOUBLECLICKCOUNT === 1)
      {
        completeMWInformationText = FTObject.txtStaticAccountName;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticWorkGroupNameBold;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticProjectNameBold;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticItemNamesBold;
        completeMWInformationText = completeMWInformationText + "**Issue:**";
      } else
      {
        completeMWInformationText = FTObject.txtProblemStatement;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticAccountNameLink;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticWorkGroupName;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticProjectName;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticItemNames;
        completeMWInformationText = completeMWInformationText + FTObject.txtStaticEndText;
      }
      CopyTextToClipboard(completeMWInformationText);
    }

    if (URLOBJECT.urlText.split("/").length - 1 === 6)
    {
      // Item Level
      var regexToExtractProjectUrl = /(https\:\/\/.*\/.*\/.*\/.*\/).*(\?qp_currentWorkgroupId=.*)/;
      var matchesForProjectOptionPage = regexToExtractProjectUrl.exec(URLOBJECT.urlText);

      var regexToExtractLineItemUrl = /(https\:\/\/.*\/.*\/.*\/.*\/.*)(\?qp_currentWorkgroupId=.*)/;
      var matchesForItemOptionPage = regexToExtractLineItemUrl.exec(URLOBJECT.urlText);

      var regexToExtractMailboxDiagnosticUrl = /\/\/.*\/.*\/.*\/.*\/([^\?]+)\?/;
      var matchesForMailboxDiagnosticPage = regexToExtractMailboxDiagnosticUrl.exec(URLOBJECT.urlText);

      CopyTextToClipboard(matchesForMailboxDiagnosticPage[1]);

      // If double-clicks detected, open Option pages and Diagnostic page
      if (DOUBLECLICKCOUNT === 1)
      {
        var actionUrl;
        var actionUrl = "https://internal.bittitan.com/MailboxDiagnostic/ViewMailboxDiagnostic?mailboxId=" + matchesForMailboxDiagnosticPage[1];
        browser.runtime.sendMessage({ action: 'open_new_tab', tabURL: actionUrl });
        var actionUrl = matchesForProjectOptionPage[1] + 'advancedOptions' + matchesForProjectOptionPage[2] + '&returnRoute=project';
        browser.runtime.sendMessage({ action: 'open_new_tab', tabURL: actionUrl });
        var actionUrl = matchesForItemOptionPage[1] + '/edit' + matchesForItemOptionPage[2];
        browser.runtime.sendMessage({ action: 'open_new_tab', tabURL: actionUrl });
      }
    }

  }
}