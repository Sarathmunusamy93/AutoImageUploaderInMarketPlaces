var targetUrl = "";

$(document).ready(function () {
  chrome.storage.local.get(
    /* String or Array */ ["targetUrl"],
    function (items) {
      if (items) {
        targetUrl = items.targetUrl;

        var URLList = targetUrl;

        var URLArray = URLList.split("|");

        for (let index = 0; index < URLArray.length; index++) {
          const element = URLArray[index];
          loadURLToInputFiled(decodeURI(element));
        }
      }
    }
  );

  function loadURLToInputFiled(url) {
    getImgURL(url, (imgBlob) => {
      // Load img blob to input
      // WIP: UTF8 character error

      var index = targetUrl.lastIndexOf("/") + 1;
      var filename = targetUrl.substr(index);

      let fileName = targetUrl.substr(index);
      let file = new File(
        [imgBlob],
        "",
        { type: "image/jpeg", lastModified: new Date().getTime() },
        "utf-8"
      );
      let container = new DataTransfer();
      container.items.add(file);
      document.querySelector("#uploadFile").files = container.files;
      readURL(container);
    });
  }
  // xmlHTTP return blob respond
  function getImgURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      callback(xhr.response);
    };
    xhr.open("GET", url);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.responseType = "blob";
    xhr.send();
  }

  function readURL(input) {
    if (input.files && input.files[input.files.length - 1]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var img = document.createElement("img");
        img.src = e.target.result;

        $("#imgContainer").append(img);
        //$("#blah").attr("src", e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  $("#uploadFile").change(function () {
    readURL(this);
  });
});
