var tabID = 0,
  totalRequestsCount = 0,
  currentProccessedRequestCount = 0;

// Add listener for two way connection.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Set the tabID, so that it can used in future.
  tabID = sender.tab.id;

  // Check this request is to download image.
  if (request.type == "imageDownload") {
    // Get the save target URL(S) from local storage.
    chrome.storage.local.get(["targetUrl"], function (items) {
      // Split the URL from storage value.
      var urlList = items.targetUrl.split("|");

      // Loop through all URL in that list.
      for (var i = 0; i < urlList.length; i++) {
        (function (i) {
          // Get the current instance URL.
          const url = urlList[i];
          totalRequestsCount = urlList.length;

          // Fetch the URL.
          fetch(url)
            .then((r) => r.blob()) // Store as blob.
            .then((result) => {
              // If result available.
              if (result) {
                // Initialize file reader.
                var fR = new FileReader();

                // listen event for file reader load.
                fR.onload = function (e) {
                  // Send result to content script.
                  chrome.tabs.sendMessage(tabID, {
                    type: "result",
                    result: e.target.result,
                  });

                  // Increment the current request count by one.
                  currentProccessedRequestCount += 1;

                  // Check is it last request.
                  if (currentProccessedRequestCount == totalRequestsCount) {
                    // If last result send requestion complete information to content page.
                    chrome.tabs.sendMessage(tabID, {
                      type: "AllRequestProccessed",
                    });

                    // Reset the current request count to zero.
                    currentProccessedRequestCount = 0;
                  }
                };
                fR.readAsDataURL(result);
              }
            });
        })(i);
      }
    });
  }
});
