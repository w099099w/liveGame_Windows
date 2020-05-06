const NETWORKTYPE = cc.Enum({
  /**
  * @description 公网IP
  * @type {number} 
 */
  NETWORK_PUBLIC:0,
 /**
  * @description 内网IP
  * @type {number} 
 */
  NETWORK_INLINE:1,
});

let IPARRAY = [
  {
    SPEICALHTTP:"http://service1.df8189.com",
    HTTP:"http://service2.df8189.com",
    WS: "ws://47.57.114.45:9502"
  },
  {
    SPEICALHTTP:"http://live.go.com",
    HTTP:"http://live.php.com",
    WS: "ws://192.168.8.120:9502"
  }
];
//网络控制
let netWorkSelected = NETWORKTYPE.NETWORK_PUBLIC; 
var G = {
  NETWORK: {
    SPEICALHTTP:IPARRAY[netWorkSelected].SPEICALHTTP,
    HTTP:IPARRAY[netWorkSelected].HTTP,
    WS: IPARRAY[netWorkSelected].WS, //websocket服务器地址
    httpOutTimer:20,
    clientID:null,//客户端本次连接ID
    isHeartBeat: true, //是否开启心跳
    heartbeat_ID: null, //心跳计时器ID
    heart_Time: 10, //心跳时间
    reconnectTime: 3, //设置最小重连时间
    /**
    * @description: ajax网络请求
    * @param {string} method 请求类型get post
    * @param {string} url 路由地址
    * @param {object} params 传输的数据(对象)
    * @param {object} common 公共的全局存在的包含loading,toast
    * @param {function} callback 成功的回调函数
    * @param {function} failed 失败的回调函数
    * @param {function} progressFunction 上传进度回调(原生平台不支持)
    */
    request: function(method, url, params,common,callback = null, failed = null,progressFunction = null,host = false) {
      if( (typeof callback !== 'function' && callback !== null)|| (typeof failed !== 'function' && failed !== null)){
        return;
      }
      console.log(method+'request',url, params);
      if(common && common.loading){
        common.loading.show('',G.NETWORK.httpOutTimer*1000);
      }
      ajax(method, url, params,progressFunction,host)
        .then(res => {
          console.log(method+'request success');
          if(common && common.loading){
            common.loading.hide();
          }
          callback?callback(res?res:null):{};
        })
        .catch(error => {
          console.log(method+'request failed');
          if(common && common.loading){
            common.loading.hide();
          }
          failed ? failed(error) : {};
        });
    } //ajax再次封装
  },
  AUDIO: {
    bgmVol: 1, //背景音乐音量
    effVol: 1, //音效音量
    openBgm: true, //开启背景音乐
    openEff: true, //开启音效
    instance: audioMgr.getInstance() //音频管理实例
  },
   /**
    * @param {object} USER 用户配置
    */
  USER: {
    tempData:null,
    choose_gameID:null,//选择的游戏ID
    curResolutionID:5,//默认选择的分辨率组ID
    keyBind:null,//用户设定的按键绑定
  },
  /**
    * @description 游戏配置
    */
  GAME: [],//游戏配置
  RESOULTION:[
    {width:640,height:360},
    {width:768,height:432},
    {width:848,height:480},
    {width:1024,height:576},
    {width:1280,height:720},
    {width:1920,height:1080},
  ],
  SERVICE: {
    qq: "1225614077",
    wechat: "OFF-LINE"
  },
  TOOL: {
    timer:null,
    /**
    * @description: 验证是否是合格的手机号
    * @param {String} tel 待检测的手机号字符串
    * @return {boolean} 返回值bool值
    */
    isPhoneNumber(tel) {
      let reg =/^0?1[3|4|5|6|7|8][0-9]\d{8}$/;
      return reg.test(tel);
    },
     /**
    * @description: 使用cc.Graphics在指定节点创建二维码
    * @param {cc.Node}  Node 指定生成的Node节点
    * @param {String} string 要进行生成的字符串
    */
    createQrCode: function(Node, string) {
      if (typeof Node !== 'object' || !string || typeof string !== "string") {
        return;
      }
      if (Node.getComponent(cc.Graphics)) {
        Node.removeComponent(cc.Graphics);
      }
      let Graphics = Node.addComponent(cc.Graphics);
      let qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
      qrcode.addData(string);
      qrcode.make();
      Graphics.fillColor = cc.Color.BLACK;
      //块宽高
      let tileW = Node.width / qrcode.getModuleCount();
      let tileH = Node.width / qrcode.getModuleCount();
      for (let row = 0; row < qrcode.getModuleCount(); row++) {
        for (let col = 0; col < qrcode.getModuleCount(); col++) {
          if (qrcode.isDark(row, col)) {
            let w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
            let h = Math.ceil((row + 1) * tileW) - Math.floor(row * tileW);
            Graphics.rect(Math.round(col * tileW),Math.round(row * tileH),w,h);
            Graphics.fill();
          }
        }
      }
    },
    /**
    * @description: 在指定节点生成错误提示
    * @param {cc.Node}  Node 指定生成的Node节点(需要有cc.Label组件);
    * @param {String} string 要显示的字符串
    */
    editError:function(Node,str){
      if (typeof Node !== 'object' || !str || typeof str !== "string") {
        return;
      }
      if(Node.active){
        if(G.TOOL.timer){
            clearTimeout(G.TOOL.timer);
            G.TOOL.timer = null;
        }
        Node.stopAllActions();  
      }
      Node.opacity = 255;
      Node.active = true;
      Node.getComponent(cc.Label).string = '》 '+str;
      G.TOOL.timer = setTimeout(()=>{
          G.TOOL.timer = null;
          Node.runAction(cc.sequence(cc.fadeOut(2),cc.callFunc(()=>{
            Node.active = false;
          })));
      },1000);
    },
    /**
    * @description: 牌值转换成文件名;
    * @param {num} num 牌值
    * @param {num} color 花色值
    * @return {string} 返回文件名称出错返回null;
    */
    cardValueToName(num,color){
      console.log(num,color);
      if(num < 0 || num > 13 || color < 1 || color > 8){
        return null;
      }
      let cardName = null;
      if(color >= 5 && color <= 8){
          let m_color = null;
          switch(color){
              case 8:m_color = 3;break;
              case 7:m_color = 2;break;
              case 6:m_color = 1;break;
              case 5:m_color = 0;break;
          }
          cardName = 'x'+String(((num-1)*4)+m_color);
      }else if((color === 1 || color === 2)&& (num === 0 || num === 0)){
          if(color === 2){
              cardName = 'x52'; 
          }else{
              cardName = 'x53'; 
          }
      }
      if(!cardName || Number(cardName.substr(1,2)) < 0 || Number(cardName.substr(1,2)) > 53){
          console.log('error牌值计算错误',cardName)
          return null;
      }
      return cardName;
    }
  },
  INTERFACE:{
    /**
    * @description:用户接口统一赋值
    * @param {object} userData
    */
    userInterface(userData){
      try{
      }catch(e){
        return false;
      }
      return true;
    }
  },
  /**
  * @description 验证码发送间隔
  */
  VERIFYTIME:120,
};
/**
 * @description:开始下注按钮状态枚举
 * @readonly
 */
const BetState = cc.Enum({
   /**
  * @description 游戏未开
  * @type {number} 
 */
  STATE_NOOPENROOM:0,
  /**
  * @description 开始押注
  * @type {number} 
 */
  STATE_BET:1,
 /**
  * @description 押注中
  * @type {number} 
 */
  STATE_BETING:2,
  /**
  * @description 确认开牌
  * @type {number} 
 */
  STATE_OPENCARD:3,
   /**
  * @description 确认开牌但不可点击
  * @type {number} 
 */
  STATE_NOOPENCARD:4
});
/**
 * @description:房间状态码枚举
 * @readonly
 */
const RoomState = cc.Enum({
  /**
  * @description 未进入房间
  * @type {number} 
 */
 ROOM_NOT_JOIN:0,
 /**
  * @description 房间未开
  * @type {number} 
 */
 ROOM_NOT_OPEN:1,
  /**
  * @description 洗牌中
  * @type {number} 
 */
 ROOM_SHUFFLE:2,
  /**
  * @description 开始押注
  * @type {number} 
 */
 ROOM_START_BET:3,
  /**
  * @description 停止押注
  * @type {number} 
 */
 ROOM_STOP_BET:4,
  /**
  * @description 看牌中
  * @type {number} 
 */
 ROOM_SEE_CARD:5,
  /**
  * @description 确认开牌
  * @type {number} 
 */
 ROOM_CONFIRM_OPEN:6,
  /**
  * @description 结算中
  * @type {number} 
 */
 ROOM_SETTLEMENT:7,
  /**
  * @description 本局结束
  * @type {number} 
 */
 ROOM_END:8,
});