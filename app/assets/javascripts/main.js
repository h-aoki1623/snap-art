;$(function() {
  var contract;
  var userAccount;
  var balance = 0;
  var image;

  function isSmartPhone() {
    var ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        return true;
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
        return false;
    } else {
        return false;
    }
  }

  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
      } catch (error) {
        // User denied account access...
        console.log('User denied account access...');
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    startApp();
  });

  $(document).ready(function() {
    if(isSmartPhone()) {
      const width = $(window).width();
      const canvasWidth = width * 2;
      $('#imageCanvas').attr({'width':canvasWidth, 'height':canvasWidth});
      $('#imageCanvas').css({'width':width, 'height':width});
    }
  });

  $("#tokenizeBtn").on("click", async function() {
    if(!$("#tokenizeBtn").hasClass("disabled")) {
      try {
        var id = await mintToken(userAccount);
        var formData = new FormData();
        formData.append("id", id);
        formData.append("image", targetImage);
        $.ajax({
          url  : SNAPART_URL + "ctrl/upload_zombie",
          type : "POST",
          data : formData,
          processData : false,
          contentType : false,
          dataType: "text"
        }).done(function(data) {
          console.log('SUCCESS!');
          console.log(data);
        }).fail(function(data) {
          console.log('ERROR!');
        });
      } catch (err) {
        console.log("Tokenization has been canceled");
        console.log(err);
      }
    }
  });

  $("#viewTokens").on("click", async function() {
    updateTokenList();
  });

  $("#dropArea").on("dragover", function(e){
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = 'copy';
    $(this).addClass("dragover");
  });

  $("#dropArea").on("dragleave", function(e){
    $(this).removeClass("dragover");
  });

  $("#dropArea").on("drop", async function(e){
    e.preventDefault();
    const file = e.originalEvent.dataTransfer.files[0];
    //const url = 'http://localhost:5000/filter/comic';
    const url = IMFILTER_URL + 'filter/comic';
    displayImageOnCanvas(file);
    filterImage(url, "image", file);
    $(this).removeClass("dragover");
  });

  $("#dropArea").on("click", function(){
    fileInput.click();
  });

  $("#fileInput").on("change", function(e){
    const file = e.originalEvent.target.files[0];
    const url = IMFILTER_URL + 'filter/comic';
    displayImageOnCanvas(file);
    filterImage(url, "image", file);
  });


/*
  function displayImageOnCropper(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      const url = window.URL || window.webkitURL;
      const imageSrc = url.createObjectURL(blob);
      $("#cropper_image").attr("src", imageSrc);
      isCroppReady = true;
      cropper.enable().replace(imageSrc);
    }
  }*/

  function filterImage(url, name, file) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('image', file);
    console.log('file size: ' + file.size);
    console.log(url);
    xhr.onreadystatechange = function(){
      switch ( xhr.readyState ) {
        case 0:
          // 未初期化状態.
          console.log( 'uninitialized!' );
          break;
        case 1: // データ送信中.
          console.log( 'loading...' );
          break;
        case 2: // 応答待ち.
          console.log( 'loaded.' );
          break;
        case 3: // データ受信中.
          console.log( 'interactive... ');
          break;
        case 4: // データ受信完了.
          if( xhr.status == 200 || xhr.status == 304 ) {
            //const data = this.response;
            console.log('COMPLETE!');
            const response = this.response
            showImageByFileReader(response);
            targetImage = response;
            $("#tokenizeBtn").removeClass("disabled");
          } else {
            console.log('Failed. HttpStatus: ' + xhr.statusText );
            console.log(this.response)
            //alert('Failed. HttpStatus: ' + xhr.statusText);
          }
          break;
      }
    }
    xhr.open('POST', url, true);
    xhr.responseType = 'blob';
    xhr.send(formData);
  }

  function showImageByFileReader(blob) {
    const reader = new FileReader();
    reader.onloadend = function() {
      const url = window.URL || window.webkitURL;
      $("#filteredImg").attr("src", url.createObjectURL(blob));
    }
    reader.readAsDataURL(blob);
  }

  function Base64toBlob(base64) {
    // カンマで分割して以下のようにデータを分ける
    // tmp[0] : データ形式（data:image/png;base64）
    // tmp[1] : base64データ（iVBORw0k～）
    var tmp = base64.split(',');
    // base64データの文字列をデコード
    var data = atob(tmp[1]);
    // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
  	var mime = tmp[0].split(':')[1].split(';')[0];
      //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
  	var buf = new Uint8Array(data.length);
  	for (var i = 0; i < data.length; i++) {
      buf[i] = data.charCodeAt(i);
    }
    // blobデータを作成
  	var blob = new Blob([buf], { type: mime });
    return blob;
  }

  function saveBlob(blob, fileName) {
    var url = (window.URL || window.webkitURL);
    // ダウンロード用のURL作成
    var dataUrl = url.createObjectURL(blob);
    // イベント作成
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    // a要素を作成
    var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    // ダウンロード用のURLセット
    a.href = dataUrl;
    // ファイル名セット
    a.download = fileName;
    // イベントの発火
    a.dispatchEvent(event);
  }


  function startApp() {
    contract = web3.eth.contract(tokenABI).at(TOKEN_CONTRACT);
    var accountInterval = setInterval(async () => {
      // Check if account has changed
      var isAccountUpdated = false;
      if (web3.eth.accounts[0] !== userAccount) {
        userAccount = web3.eth.accounts[0];
        isAccountUpdated = true;
        //displayTokenData(userAccount);
      }
      if (userAccount !== null) {
        var newBalance = parseInt(await balanceOf(userAccount));
        if (isAccountUpdated || balance != newBalance) {
          balance = newBalance;
          updateTokenList();
        }
      }
    }, 100);
  }


  async function updateTokenList() {
    const tokenIds = await ownedTokens(userAccount);
    var data = [];
    //alert("Token IDs num: " + tokenIds.length);
    for (var i in tokenIds) {
      const id = tokenIds[i];
      const tokenUri = await tokenURI(id);
      const imageUri = await imageURI(tokenUri);
      data.push({
        id:id,
        tokenURI:tokenUri,
        imageURI:imageUri,
        authenticity_token:$("#authenticity_token").val()
      });
    }
    const dataSet = {tokens:data};
    const json = JSON.stringify(dataSet);
    //alert("json: " + json);
    //console.log(json);
    const url = SNAPART_URL + "top/update_token_list"

    /*
    $.ajaxPrefilter(function(options, originalOptions, xhr) {
      const token = $("#authenticity_token").val()
      if (token) {
        return xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
      }
    });*/

/*
    $.ajaxSetup({
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
      }
    });*/

    $.ajax({
      url  : url,
      headers: {'X-CSRF-TOKEN':$('meta[name="csrf-token"]').attr('content')},
      type : "POST",
      data : json,
      contentType: 'application/json'
    }).done(function(data) {
      console.log('SUCCESS!');
      $('.token_list').empty().append(data);
      console.log(data);
    }).fail(function(data) {
      console.log('ERROR!');
    });
  }


  async function ownedTokens(owner) {
    var tokenIds = [];
    var numOfOwnedTokens = await balanceOf(owner);
    for (var i = 0; i < numOfOwnedTokens; i++) {
      tokenIds.push(await tokenOfOwnerByIndex(owner, i));
    }
    return tokenIds;
  }

  function imageURI(tokenURI) {
    //alert("Excecute function imageURI");
    const url = tokenURI;
    //alert("tokenURI: " + url);
    return new Promise(function(resolve, reject) {
      $.ajax({
        url  : url,
        type : "GET",
        contentType: 'application/json',
        dataType: "json",
      }).done(function(data) {
        console.log('SUCCESS!');
        console.log(data.image);
        resolve(data.image);
      }).fail(function(error) {
        //alert("imageURI ajax ERROR: " + error);
        console.log('ERROR!');
        reject(error);
      });
    })
  }

  async function mintToken(to) {
    var tokenId = parseInt(await totalSupply(), 10) + 1;
    var tokenURI = await tokenURIPrefix() + tokenId.toString();
    return new Promise(function(resolve, reject) {
      contract.mintWithTokenURI(to, tokenId, tokenURI, function(error, result){
        if(!error) {
          resolve(tokenId);
        } else {
          reject(error);
        }
      });
    })
  }

  function totalSupply() {
    return new Promise(function(resolve, reject) {
      contract.totalSupply(function(error, result){
         if(!error) {
           resolve(result);
         } else {
           reject(error);
         }
      });
    })
  }

  function balanceOf(owner) {
    return new Promise(function(resolve, reject) {
      contract.balanceOf(owner, function(error, result){
         if(!error) {
           resolve(result);
         } else {
           reject(error);
         }
      });
    })
  }

  function tokenOfOwnerByIndex(owner, index) {
    return new Promise(function(resolve, reject) {
      contract.tokenOfOwnerByIndex(owner, index, function(error, result){
         if(!error) {
           resolve(result);
         } else {
           reject(error);
         }
      });
    })
  }

  function tokenURIPrefix() {
    return new Promise(function(resolve, reject) {
      contract.tokenURIPrefix(function(error, result){
         if(!error) {
           resolve(result);
         } else {
           reject(error);
         }
      });
    })
  }

  function tokenURI(tokenId) {
    return new Promise(function(resolve, reject) {
      contract.tokenURI(tokenId, function(error, result){
         if(!error) {
           resolve(result);
         } else {
           reject(error);
         }
      });
    })
  }


  /**
   *
   * Canvas
   *
  **/

  const EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll';

  const canvas = document.getElementById("imageCanvas");
  //if ( ! canvas || ! canvas.getContext ) { return false; }
  const ctx = canvas.getContext("2d");
  const canvasImg = new Image();
  var canvasImgX = 0;
  var canvasImgY = 0;
  var canvasImgStartWidth;
  var canvasImgStartHeight;
  var canvasImgStartX;
  var canvasImgStartY;

  function displayImageOnCanvas(blob) {
    const reader = new FileReader();

    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      const url = window.URL || window.webkitURL;
      canvasImg.src = url.createObjectURL(blob);
      canvasImg.addEventListener('load', function() {

        canvasImgX = 0;
        canvasImgY = 0;
        if (canvasImg.naturalWidth > canvasImg.naturalHeight) {
          canvasImg.height = canvas.height;
          canvasImg.width = canvasImg.naturalWidth * canvas.height / canvasImg.naturalHeight;
          //canvasImgHeight = canvas.height;
          //canvasImgWidth = canvasImg.naturalWidth * canvasImgHeight / canvasImg.naturalHeight;
          canvasImgX = ((canvasImg.width - canvasImg.height) / 2) * -1;
        } else {
          canvasImg.height = canvasImg.naturalHeight * canvas.width / canvasImg.naturalWidth;
          canvasImg.width = canvas.width;
          //canvasImgWidth = canvas.width;
          //canvasImgHeight = canvasImg.naturalHeight * canvasImgWidth / canvasImg.naturalWidth;
          canvasImgY = ((canvasImg.height - canvasImg.width) / 2) * -1;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvasImg, canvasImgX, canvasImgY, canvasImg.width, canvasImg.height);
        //ctx.drawImage(canvasImg, canvasImgX, canvasImgY, canvasImgWidth, canvasImgHeight);
      });
    }
  }

  $('#imageCanvas').on(EVENT_WHEEL, function(e) {
    e.preventDefault();
    var delta = 1;
    var ratio = 0.04;

    var oe = e.originalEvent;

    if (oe.deltaY) {
      delta = oe.deltaY > 0 ? 1: -1;
    } else if (oe.wheelDelta) {
      delta = -oe.wheelDelta  / 120;
    } else if (oe.detail) {
      delta = oe.detail > 0 ? 1 : -1;
    }

    zoom(-delta * ratio, oe);
  });

  var isDragging = false;
  var mousePointer = {};

  $('#imageCanvas').on('mousedown', function(e) {
    isDragging = true;
    mousePointer = getPointer(e);
  });

  $('#imageCanvas').on('mousemove', function(e) {
    if(isDragging) {
      canvasImgX += (e.pageX - mousePointer.endX) * 2;
      canvasImgY += (e.pageY - mousePointer.endY) * 2;
      checkOffset();
      mousePointer.endX = e.pageX;
      mousePointer.endY = e.pageY;
      renderImage();
    }
  });

  $('#imageCanvas').on('mouseup', function(e) {
    isDragging = false;
  });

  $('#imageCanvas').on('mouseleave', function(e) {
    isDragging = false;
  });

  var pointers = {};
  var pointerDiffs = {};

  canvas.addEventListener('touchstart', function(e) {
  //$('#imageCanvas').on('touchstart', function(e) {
    e.preventDefault();
    console.log("touchstart");
    canvasImgStartWidth = canvasImg.width;
    canvasImgStartHeight = canvasImg.height;
    canvasImgStartX = canvasImgX;
    canvasImgStartY = canvasImgY;
    if (e.changedTouches) {
      Object.keys(e.changedTouches).forEach(function (key) {
        const touch = e.changedTouches[key];
        pointers[touch.identifier] = getPointer(touch);
      });
    }
  });

  canvas.addEventListener('touchmove', function(e) {
  //$('#imageCanvas').on('touchmove', function(e) {
    e.preventDefault();
    //const oe = e.originalEvent;
    if (e.changedTouches) {
      Object.keys(e.changedTouches).forEach(function (key) {
        const touch = e.changedTouches[key];
        const id = touch.identifier;
        pointerDiffs[id] = getPointerDiff(touch, pointers[id]);
        Object.assign(pointers[id] || {}, getPointer(touch, true));
      });
    }

    if (Object.keys(pointers).length > 1) {
      const maxRatio = getMaxZoomRatio(pointers);
      const ratio = 1;
      const delta = maxRatio > 0 ? 1 : -1;
      //zoom(delta * ratio, oe, true);
      zoom(maxRatio * ratio, e, true);
    }

    if (Object.keys(pointers).length == 1) {
      var diffs = {};

      Object.keys(e.changedTouches).forEach(function (key) {
        const touch = e.changedTouches[key];
        const id = touch.identifier;
        diffs[id] = pointerDiffs[id];
      });

      const diff = getMinPoinerDiff(diffs);
      canvasImgX += diff.x * 2;
      canvasImgY += diff.y * 2;
      checkOffset();
      renderImage();
    }
  });

  canvas.addEventListener('touchend', function(e) {
  //$('#imageCanvas').on('touchend', function(e) {
    if (e.changedTouches) {
      Object.keys(e.changedTouches).forEach(function (key) {
        const touch = e.changedTouches[key];
        delete pointers[touch.identifier];
      });
    }
    e.preventDefault();
  });

  function getPointer(ref, endOnly, pointer) {
    var pageX = ref.pageX,
        pageY = ref.pageY;
    var end = {
      endX: pageX,
      endY: pageY
    };
    return endOnly ? end : Object.assign({
      startX: pageX,
      startY: pageY
    }, end);
  }

  function getPointerDiff(ref, pointer) {
    var diff = {
      x: ref.pageX - pointer.endX,
      y: ref.pageY - pointer.endY
    }
    return diff;
  }

  function getMinPoinerDiff(diffs) {
    var diffX = 999999;
    var diffY = 999999;
    Object.keys(diffs).forEach(function (key) {
      const diff = diffs[key];
      diffX = diff.x < diffX ? diff.x : diffX;
      diffY = diff.y < diffY ? diff.y : diffY;
    });
    return {
      x: diffX,
      y: diffY
    };
  }

  function getPointersCenter(pointers) {
    var pageX = 0;
    var pageY = 0;
    var count = 0;
    Object.keys(pointers).forEach(function (key) {
      const pointer = pointers[key];
      const startX = pointer.startX,
          startY = pointer.startY;
      pageX += startX;
      pageY += startY;
      count += 1;
    });
    pageX /= count;
    pageY /= count;
    return {
      pageX: pageX,
      pageY: pageY
    };
  }

  function getOffset(element) {
    const box = element.getBoundingClientRect();
    return {
      left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
      top: box.top + (window.pageYOffset - document.documentElement.clientTop)
    };
  }

  function getMaxZoomRatio(pointers) {
    const tmp_pointers = Object.assign({}, pointers);
    var ratios = [];

    Object.keys(pointers).forEach(function(key) {
      const pointer = pointers[key];
      delete tmp_pointers[key];
      Object.keys(tmp_pointers).forEach(function (key2) {
        const tmp_pointer = tmp_pointers[key2];
        const x1 = Math.abs(pointer.startX - tmp_pointer.startX);
        const y1 = Math.abs(pointer.startY - tmp_pointer.startY);
        const x2 = Math.abs(pointer.endX - tmp_pointer.endX);
        const y2 = Math.abs(pointer.endY - tmp_pointer.endY);
        const z1 = Math.sqrt(x1 * x1 + y1 * y1);
        const z2 = Math.sqrt(x2 * x2 + y2 * y2);
        const ratio = (z2 - z1) / z1;
        ratios.push(ratio);
      });
    });
    ratios.sort(function (a, b) {
      return Math.abs(a) < Math.abs(b);
    });
    return ratios[0];
  }

  function zoom(ratio, originalEvent, isTouch = false) {
    if (ratio < 0) {
      ratio = 1 / (1 - ratio);
    } else {
      ratio = 1 + ratio;
    }

    if(isTouch) {
      return zoomTo(canvasImgStartWidth * ratio / canvasImg.naturalWidth, originalEvent, isTouch);
    } else {
      return zoomTo(canvasImg.width * ratio / canvasImg.naturalWidth, originalEvent);
    }
  }

  function zoomTo(ratio, originalEvent, isTouch = false) {
    var preWidth = isTouch ? canvasImgStartWidth : canvasImg.width;
    var preHeight = isTouch ? canvasImgStartHeight : canvasImg.height;
    var preX = isTouch ? canvasImgStartX : canvasImgX;
    var preY = isTouch ? canvasImgStartY : canvasImgY;
    var width = canvasImg.width,
        height = canvasImg.height,
        naturalWidth = canvasImg.naturalWidth,
        naturalHeight = canvasImg.naturalHeight;

    if (ratio >= 0) {
      var newWidth = naturalWidth * ratio;
      var newHeight = naturalHeight * ratio;

      if (newWidth < canvas.width) {
        newWidth = canvas.width;
        newHeight = canvasImg.naturalHeight * canvas.width / canvasImg.naturalWidth;
      }

      if (newHeight < canvas.height) {
        newWidth = canvasImg.naturalWidth * canvas.height / canvasImg.naturalHeight;
        newHeight = canvas.height;
      }

      if (originalEvent) {
        const offset = getOffset(canvas);
        const center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
          pageX: originalEvent.pageX,
          pageY: originalEvent.pageY
        };

        canvasImgX = preX - (newWidth - preWidth) * (((center.pageX - offset.left) * 2 - preX) / preWidth);
        canvasImgY = preY - (newHeight - preHeight) * (((center.pageY - offset.top) * 2 - preY) / preHeight);
      }

      if (newWidth == canvas.width) {
        canvasImgX = 0;
      }

      if (newHeight == canvas.height) {
        canvasImgY = 0;
      }

      checkOffset();

      canvasImg.width = newWidth;
      canvasImg.height = newHeight;
      renderImage();
    }
  }

  function checkOffset() {
    const minOffsetX = canvas.width - canvasImg.width;
    const minOffsetY = canvas.height - canvasImg.height;
    if (canvasImgX > 0) {
      canvasImgX = 0;
    }
    if (canvasImgY > 0) {
      canvasImgY = 0;
    }
    if (canvasImgX < minOffsetX) {
      canvasImgX = minOffsetX;
    }
    if (canvasImgY < minOffsetY) {
      canvasImgY = minOffsetY;
    }
  }

  function renderImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasImg, canvasImgX, canvasImgY, canvasImg.width, canvasImg.height);
  }

});
