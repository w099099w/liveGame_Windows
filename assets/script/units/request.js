function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
  }
function isJsonStr(str){
  if (typeof str == 'string') {
      try {
          var obj=JSON.parse(str);
          if(typeof obj == 'object' && obj ){
              return true;
          }else{
              return false;
          }
      } catch(e) {
          console.log('error：'+str+'!!!不是JSON 字符串'+e);
          return false;
      }
  }
  return false;
}
  function ajax(method, url, params,progressFunction,Host) {
    if (url !== '') {
      if(Host){
        url = Host + url;
      }else{
        url = G.NETWORK.HTTP + url
      }   
    }
    const token = cc.sys.localStorage.getItem('token');
    return new Promise((resolve, reject) => {
      // 创建XMLHttpRequest对象
      const xhr = new XMLHttpRequest();
      //设置请求超时
      xhr.timeout = G.NETWORK.httpOutTimer*1000;
      //函数绑定
      xhr.onload = function(){
        console.log(xhr.responseText);
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        }else{
          if(xhr.status == 0){
              reject({"code":'erroe',"message":"连接服务器失败"});
              return;
          }
          if(isJsonStr(xhr.responseText)){
            reject(JSON.parse(xhr.responseText));
          }else{
            reject(JSON.parse(JSON.stringify({"code":'erroe',"message":xhr.responseText})));
          }
          
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
        if(cc.sys.localStorage.getItem('sendType') == 'BIN'){
          console.log('二进制文件发送');
          cc.sys.localStorage.setItem('sendType','JSON');
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          xhr.send(params);
        }else{
          xhr.setRequestHeader('Content-Type', 'application/json')
          xhr.send(JSON.stringify(params))
        }
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
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(params))
      }
    })
  }
  