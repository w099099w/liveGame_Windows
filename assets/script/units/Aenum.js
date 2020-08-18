console.log("版本时间戳202008141549");
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
   * @description 开始开牌
   * @type {number} 
  */
   START_CARD:2,
   /**
    * @description 押注中
    * @type {number} 
   */
   STATE_BETING:3,
   /**
   * @description 确认开牌
   * @type {number} 
  */
   STATE_OPENCARD:4,
    /**
   * @description 确认开牌但不可点击
   * @type {number} 
  */
   STATE_NOOPENCARD:5
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
 /**
  * @description:音效枚举
  * @readonly
  */
 const EFFECTS = cc.Enum({
   /**
    * @description 下注倒计时
    * @type {number}
    */
   EFF_COUNTDOWN: 0,
     /**
    * @description 开始押注
    * @type {number}
    */
   EFF_STARTBET: 1,
     /**
    * @description 停止押注
    * @type {number}
    */
   EFF_STOPBET: 2,
     /**
    * @description 庄家通杀
    * @type {number}
    */
   EFF_BANKERWIN: 3,
     /**
    * @description 庄家通陪
    * @type {number}
    */
   EFF_BANKERLOSE: 4,
 });
 /**
  * @description:背景音枚举
  * @readonly
  */
 const BGMS = cc.Enum({
   /**
    * @description 未设置背景音
    * @type {number}
    */
   BGM_NONE: -1,
   /**
    * @description 登录场景
    * @type {number}
    */
   BGM_PASSPORT: 0,
   /**
    * @description 大厅及房间场景
    * @type {number}
    */
   BGM_HALL: 1,
 });
 /**
 * @description:DIALOG枚举
 * @readonly
 */
const DIALOG = cc.Enum({
  /**
   * @description 确定按钮
   * @type {number}
   */
  MB_YES: 0,
  /**
   * @description 取消按钮
   * @type {number}
   */
  MB_NO: 1,
  /**
   * @description 确定和取消按钮
   * @type {number}
   */
  MB_YESNO: 2,
});