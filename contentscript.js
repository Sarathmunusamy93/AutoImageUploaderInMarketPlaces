var targetUrl = "",
  container = new DataTransfer(),
  disableDiv = ".styles_disabled__MSlO1",
  uploadContainer = "div#pictures",
  uploadParentContainer = "styles_block__4jEmA",
  uploadInputContainer = "input.styles_input__NGR8Y";

// Listen for new node inserted event.
// it is to check whether the file upload section is disabled or not.
$("html").on("DOMNodeInserted", function (e) {
  // Check uploadParentContainer is appended to DOM.
  if (e.target.className == uploadParentContainer);
  {
    // Get the upload container DOM element.
    var targetElement = $(e.target).find(uploadContainer);

    // Check upload container DOM exists.
    if (targetElement.length > 0) {
      // Fine the disable div which is responsible to disable selectio.
      var disableDivEle = $(targetElement).find(disableDiv);

      // Check disable div exists.
      if (disableDivEle.length > 0) {
        // Attach the node remove DOM event.
        // This will helps to let us know when upload section is turn from disable mode.
        $(uploadContainer).on("DOMNodeRemoved", function (e) {
          // Check the current event is for disable div.
          if (e.target.dataset["testId"] == "disabled-block") {
            // Initiate the image upload proccess.
            initiateAutoUpload();
          }
        });
      } else {
        // If the file upload section is enabled. Then, initiate the image upload proccess.
        initiateAutoUpload();
      }
    }
  }
});

/*
This will helps to initialize the image download proccess.
*/
function initiateAutoUpload() {
  // Send message to background to start download proccess.
  chrome.runtime.sendMessage({ type: "imageDownload", options: {} });
}

/*
Proccess the image blob and convert it as file object and add it into container.
*/
function finalStep(imgBlob) {
  // Set the name as sample.png (name doesn't matter here as upload API call of https://www.leboncoin.fr/ gives new name)
  let fileName = "sample.png";

  // Construct the file object.
  let file = new File(
    [imgBlob],
    fileName,
    { type: "image/jpeg", lastModified: new Date().getTime() },
    "utf-8"
  );

  // Add the file to container.
  container.items.add(file);
}

/*
Trigger upload operation as we got confirmation from background file like, all download operation completed.
*/
function gotAllBlob() {
  // Copy all container files to upload input section.
  $(uploadInputContainer)[0].files = container.files;

  // Get upload input section DOM;
  var targetElement = $(uploadInputContainer)[0];

  // Set the temp ID, for your event trigger operations.
  $(targetElement).attr("id", "testID");

  // Check createEvent is available in document - this will always be true.
  if ("createEvent" in document) {
    // Get upload input section DOM
    const element = document.getElementById("testID");

    // Trigger the change event manually.
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Reset the container and upload input sections.
  container = new DataTransfer();
  $(uploadInputContainer)[0].files = [];
}

// Set the event listener for internal communication.
chrome.runtime.onMessage.addListener(function (ev, sender, sendResponse) {
  // If the current request is for result.
  if (ev.type === "result") {
    // URL to blob conversation.
    var dataURI = ev.result;
    var byteString = atob(dataURI.split(",")[1]);
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Once, URL is converted to blob send it for final conversation.
    finalStep(new Blob([ab], { type: mimeString }));
  } else if (ev.type === "AllRequestProccessed") {
    // if the all requested finished then, start upload proccess.
    gotAllBlob();
  }
});
