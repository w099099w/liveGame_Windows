function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
  }
  function ajax(method, url, params,progressFunction) {
    if (url !== '') {
      url = G.NETWORK.HTTP + url
    }
    const token = cc.sys.localStorage.getItem('token');
    return new Promise((resolve, reject) => {
      // 创建XMLHttpRequest对象
      const xhr = new XMLHttpRequest();
      //设置请求超时
      xhr.timeout = G.NETWORK.httpOutTimer*1000;
      //函数绑定
      xhr.onload = function(){
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        }else{
          if(xhr.status == 0){
              reject({"code":'erroe',"message":"连接服务器失败"});
              return;
          }
          reject(JSON.parse(xhr.responseText));
        }
      }
      console.log('token:'+token);
      //连接出错
      xhr.error = function(){
        reject({"code":'erroe',"message":"连接服务器失败"});
      }
      xhr.onloadend = function(){
        if(xhr.readyState === 4 && xhr.status === 0 || JSON.stringify(xhr) === '{}'){
          reject({"code":'erroe',"message":"连接服务器失败"});
        }
      }
      xhr.ontimeout = function(e){
        reject({"data":e,"code":'erroe',"message":"连接服务器超时,请检查网络连接或联系客服!"});
      }
      if(cc.sys.os !== cc.sys.OS_WINDOWS && cc.sys.os !== cc.sys.OS_ANDROID && cc.sys.os !== cc.sys.OS_IOS){
        xhr.upload.addEventListener("progress", progressFunction);
      }
      // get
      if (method === 'get' || method === 'GET') {
        if (typeof params === 'object') {
          // params拆解成字符串
          params = Object.keys(params)
            .map(key => {
              return (
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
              )
            })
            .join('&')
        }
        url = params ? url + '?' + params : url
        xhr.open(method, url, true)
        if (token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + token)
        }
        xhr.send()
      }else if (method === 'post' || method === 'POST') {
        xhr.open(method, url, true)
        if (token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + token)
        }
        
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(params))
      }else if (method === 'delete' || method === 'DELETE') {
        xhr.open(method, url, true)
        if (token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + token)
        }
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.send(JSON.stringify(params))
      }else if (method === 'put' || method === 'PUT') {
        xhr.open(method, url, true)
        if (token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + token)
        }
        if(cc.sys.localStorage.getItem('sendType') == 'BIN'){
          let sBoundary = '----WebKitFormBoundaryrGKCBY7qhFd3TrwA';
          console.log('发送头像');
          cc.sys.localStorage.setItem('sendType','JSON');//恢复默认发送流
          xhr.setRequestHeader('Content-Type', 'multipart/form-data;boundary='+sBoundary);
          let formData = '------WebKitFormBoundaryrGKCBY7qhFd3TrwA'+'\r\n'+'Content-Disposition: form-data; name="avatar"; filename="user.jpg"'+'\r\n'+'Content-Type: application/octet-stream'+'\r\n\r\n'+Uint8ArrayToString(params)+'\r\n'+'------WebKitFormBoundaryrGKCBY7qhFd3TrwA--';
          console.log("实体",formData);
          xhr.send(formData);
        }else{
          xhr.setRequestHeader('Content-Type', 'application/json')
          xhr.send(JSON.stringify(params))
        }
      }
    })
  }
  