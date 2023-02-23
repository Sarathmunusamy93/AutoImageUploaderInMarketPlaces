$(document).ready(function () {
  // Triggers when user save the URL.
  $("#saveURL").click(function () {
    var url = $("#targetURL").val();

    // Set it in local storage.
    chrome.storage.local.set({ targetUrl: url }, function () {
      // show the user that URL is saved.
      $(".successMsg").show();
    });
  });

  // Get the saved URL to view in that text box.
  chrome.storage.local.get(["targetUrl"], function (items) {
    // If item present then, show it text box.
    if (items) {
      $("#targetURL").val(items.targetUrl);
    }
  });
});
